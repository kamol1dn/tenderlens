"""Thin, polite, disk-caching client for the public UZEX etender API (no login)."""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

import requests

from . import config as C

_session = requests.Session()
_session.headers.update(C.HEADERS)
_last_call = 0.0


def _wait() -> None:
    global _last_call
    gap = time.time() - _last_call
    if gap < C.SLEEP:
        time.sleep(C.SLEEP - gap)
    _last_call = time.time()


def _request(method: str, url: str, *, retries: int = 4, timeout: int = 120, **kw) -> requests.Response:
    err: Exception | None = None
    for attempt in range(retries):
        _wait()
        try:
            r = _session.request(method, url, timeout=timeout, **kw)
            if r.status_code == 200:
                return r
            err = RuntimeError(f"HTTP {r.status_code} for {url}")
        except requests.RequestException as e:  # network hiccup: back off and retry
            err = e
        time.sleep(1.5 * (attempt + 1))
    raise err  # type: ignore[misc]


def read_json(path: Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: Path, obj) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(path)


# ---- open lots ---------------------------------------------------------------
def trade_list_page(type_id: int, start: int, end: int) -> list[dict]:
    r = _request("POST", f"{C.API_BASE}/TradeList",
                 json={"From": start, "To": end, "TypeId": type_id, "System_Id": 0})
    rows = r.json()
    for row in rows:
        row["type_id"] = type_id
    return rows


def trade_list_all(type_id: int, page: int = 50) -> list[dict]:
    out: list[dict] = []
    start = 1
    total = None
    while total is None or start <= total:
        rows = trade_list_page(type_id, start, start + page - 1)
        if not rows:
            break
        total = rows[0].get("total_count") or len(rows)
        write_json(C.RAW_TRADELIST / f"type{type_id}_{start:05d}.json", rows)
        out.extend(rows)
        start += page
    return out


def saved_trade_rows() -> dict[int, dict]:
    """All TradeList rows saved on disk, keyed by lot id."""
    rows: dict[int, dict] = {}
    for p in sorted(C.RAW_TRADELIST.glob("type*_*.json")):
        for row in read_json(p):
            rows[int(row["id"])] = row
    return rows


# ---- lot detail --------------------------------------------------------------
def get_trade(lot_id: int, *, refresh: bool = False, offline: bool = False) -> dict | None:
    path = C.RAW_GETTRADE / f"{int(lot_id)}.json"
    if path.exists() and not refresh:
        return read_json(path)
    if offline:
        return None
    r = _request("GET", f"{C.API_BASE}/GetTrade/{int(lot_id)}/0")
    try:
        g = r.json()
    except ValueError:
        return None
    if not isinstance(g, dict) or not g.get("id"):
        return None
    write_json(path, g)
    return g


# ---- spec file ---------------------------------------------------------------
_EXT_OK = re.compile(r"^[a-z0-9]{1,5}$")


def spec_path(lot_id: int) -> Path | None:
    """Return the saved spec file for a lot, if any."""
    for p in sorted(C.SPECS.glob(f"{int(lot_id)}.*")):
        if p.is_file() and not p.name.endswith(".tmp"):
            return p
    return None


def download_spec(lot_id: int, g: dict, *, offline: bool = False, max_mb: float = 60) -> Path | None:
    have = spec_path(lot_id)
    if have:
        return have
    if offline:
        return None
    path = g.get("tech_file_path")
    if not path:
        return None
    ext = (g.get("tech_file_ext") or Path(path).suffix or "bin").lower().strip(". ")
    if not _EXT_OK.match(ext):
        ext = "bin"
    size = g.get("tech_file_sizes") or 0
    if size and size > max_mb * 1024 * 1024:
        return None
    r = _request("POST", f"{C.API_BASE}/DownloadFile", params={"path": path}, data=b"", timeout=300)
    blob = r.content
    if not blob:
        return None
    dest = C.SPECS / f"{int(lot_id)}.{ext}"
    tmp = dest.with_suffix(dest.suffix + ".tmp")
    tmp.write_bytes(blob)
    tmp.replace(dest)
    return dest


# ---- deal history ------------------------------------------------------------
def deals_page(start: int, end: int) -> list[dict]:
    r = _request("POST", f"{C.API_BASE}/DealsList",
                 json={"From": start, "To": end, "System_Id": 0}, timeout=300)
    return r.json()


_URL_ID = re.compile(r"(\d{5,7})(?!.*\d)")


def lot_id_from(value) -> int:
    """Accept 524784, '524784', a lot URL, or a 14-digit display number."""
    s = str(value).strip()
    if s.isdigit():
        return int(s[-6:]) if len(s) > 7 else int(s)
    m = _URL_ID.search(s)
    if not m:
        raise ValueError(f"cannot read a lot id from {value!r}")
    return int(m.group(1))
