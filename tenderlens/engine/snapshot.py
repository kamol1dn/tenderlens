"""Snapshot the public UZEX etender data to data/raw and data/specs.

    python -m engine.snapshot                 # everything (resumable)
    python -m engine.snapshot --demo-only     # just the six demo lots
    python -m engine.snapshot --deals 20000   # how many recent deals to keep
    python -m engine.snapshot --no-specs      # skip spec downloads

Order: demo lots first (they close first), then TradeList, DealsList, GetTrade
for every open lot, then spec files sorted by closing time. Everything already
on disk is skipped, so the command can be re-run after an interruption.
"""
from __future__ import annotations

import argparse
import sys
import time
from datetime import datetime

from . import config as C
from . import uzex


def log(*a) -> None:
    print(datetime.now().strftime("%H:%M:%S"), *a, flush=True)


def snap_lot(lot_id: int, specs: bool = True) -> str:
    g = uzex.get_trade(lot_id)
    if not g:
        return "no-detail"
    if not specs:
        return "detail"
    try:
        p = uzex.download_spec(lot_id, g)
    except Exception as e:  # keep going: one bad file must not stop the snapshot
        return f"spec-error {type(e).__name__}: {str(e)[:80]}"
    return f"spec {p.name} {p.stat().st_size // 1024} KB" if p else "no-spec"


def snap_deals(n: int, page: int = 1000) -> int:
    got = 0
    for start in range(1, n + 1, page):
        path = C.RAW_DEALS / f"deals_{start:06d}.json"
        if path.exists():
            got += len(uzex.read_json(path))
            continue
        rows = uzex.deals_page(start, start + page - 1)
        if not rows:
            break
        uzex.write_json(path, rows)
        got += len(rows)
        log(f"deals {start}..{start + len(rows) - 1} saved (latest {rows[0].get('deal_date')})")
    return got


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--demo-only", action="store_true")
    ap.add_argument("--deals", type=int, default=20000)
    ap.add_argument("--no-specs", action="store_true")
    ap.add_argument("--max-specs", type=int, default=0, help="0 = all")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")

    log("demo lots first")
    for lid in C.DEMO_LOTS:
        log(lid, snap_lot(lid))
    if a.demo_only:
        return 0

    rows: list[dict] = []
    for type_id in (1, 2):
        part = uzex.trade_list_all(type_id)
        log(f"TradeList TypeId {type_id}: {len(part)} lots")
        rows.extend(part)
    uzex.write_json(C.RAW / "open_lots.json", rows)
    uzex.write_json(C.RAW / "snapshot_meta.json",
                    {"taken_at": datetime.now().astimezone().isoformat(timespec="seconds"),
                     "open_lots": len(rows),
                     "open_value_uzs": sum(r.get("cost") or 0 for r in rows
                                           if (r.get("currency_codeabc") or "UZS") == "UZS")})

    log("deal history:", snap_deals(a.deals), "deals on disk")

    rows.sort(key=lambda r: r.get("end_date") or "")
    for i, r in enumerate(rows, 1):
        if not (C.RAW_GETTRADE / f"{r['id']}.json").exists():
            try:
                uzex.get_trade(r["id"])
            except Exception as e:
                log(r["id"], "detail-error", str(e)[:80])
        if i % 50 == 0:
            log(f"GetTrade {i}/{len(rows)}")

    if a.no_specs:
        return 0
    done = 0
    for i, r in enumerate(rows, 1):
        if uzex.spec_path(r["id"]):
            continue
        res = snap_lot(r["id"])
        done += 1
        log(f"[{i}/{len(rows)}] {r['id']} {res}")
        if a.max_specs and done >= a.max_specs:
            break
    log("snapshot finished")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
