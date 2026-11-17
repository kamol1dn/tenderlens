"""TenderLens web UI server. Standard library only; works offline.

    python app/serve.py              # http://127.0.0.1:8780, opens the browser
    python app/serve.py --port 9000 --no-browser
    python app/serve.py --data D:/copy/of/data/cache   # use another cache folder

Data for /api/* (same routes as the engine, CONTRACT.md), first that answers:
  1. engine - the FastAPI engine on 127.0.0.1:8765, if it is running and returns 200
  2. cache  - data/cache/*.json written by the engine (offline demo)
A lot that is in neither returns HTTP 503 {"detail": "analysis_unavailable"}; the UI shows
"hali tahlil qilinmagan". There is no mock data: every number on screen comes from the engine.
"""
import argparse
import json
import mimetypes
import re
import socket
import sys
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

APP_DIR = Path(__file__).resolve().parent
ROOT = APP_DIR.parent
CACHE = ROOT / "data" / "cache"

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")

ENGINE = "http://127.0.0.1:8765"
_engine_state = {"ok": False, "checked": 0.0}
_lock = threading.Lock()


def engine_up():
    """Fast check (cached 5 s) whether the engine port accepts connections."""
    with _lock:
        if time.time() - _engine_state["checked"] < 5:
            return _engine_state["ok"]
    host, port = ENGINE.split("//")[1].split(":")
    try:
        with socket.create_connection((host, int(port)), timeout=0.4):
            ok = True
    except OSError:
        ok = False
    with _lock:
        _engine_state.update(ok=ok, checked=time.time())
    return ok


def has_cache():
    return (CACHE / "index.json").exists() or (CACHE / "stats.json").exists()


LOT_ID_RE = re.compile(r"(\d{6,})")


def lot_id_from(value):
    """Accept 524784, 26120012524784 (display_no) or an etender URL."""
    m = LOT_ID_RE.findall(str(value or ""))
    if not m:
        return None
    s = m[-1]
    if len(s) == 14:  # display_no: 8-digit prefix + 6-digit id
        s = s[-6:]
    return int(s)


_subject_cache = {}


def subject_for(lot_id):
    """subject_uz (Latin title) from the cached lot file; index.json doesn't carry it."""
    f = CACHE / "lots" / f"{lot_id}.json"
    try:
        mt = f.stat().st_mtime
    except OSError:
        return None
    hit = _subject_cache.get(lot_id)
    if hit and hit[0] == mt:
        return hit[1]
    try:
        val = json.loads(f.read_text(encoding="utf-8")).get("subject_uz")
    except Exception:
        val = None
    _subject_cache[lot_id] = (mt, val)
    return val


def enrich_index(rows):
    if isinstance(rows, list):
        for r in rows:
            if isinstance(r, dict) and not r.get("subject_uz") and r.get("lot_id"):
                s = subject_for(r["lot_id"])
                if s:
                    r["subject_uz"] = s
    return rows


class Handler(SimpleHTTPRequestHandler):
    server_version = "TenderLens/1.1"

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(APP_DIR), **kw)

    def log_message(self, fmt, *args):
        sys.stderr.write("[app] " + (fmt % args) + "\n")

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # ---------- helpers ----------
    def send_json(self, obj, status=200, source="cache"):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-TenderLens-Source", source)
        self.end_headers()
        self.wfile.write(body)

    def from_engine(self, method, path, body=None, timeout=180):
        """(status, parsed_json) from the engine, or None if it is down / errored."""
        req = urllib.request.Request(ENGINE + path, data=body, method=method,
                                     headers={"Content-Type": "application/json"} if body else {})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError:
            return None  # 404 / 503 analysis_unavailable / 5xx: let the cache answer
        except (urllib.error.URLError, OSError, TimeoutError, ValueError):
            return None

    def offline(self, rel, kind="file"):
        if not has_cache():
            return self.send_json({"detail": "analysis_unavailable"}, 503, "none")
        f = CACHE / rel
        if f.exists():
            try:
                obj = json.loads(f.read_text(encoding="utf-8"))
            except Exception:  # half-written file while the engine is saving
                return self.send_json({"detail": "analysis_unavailable"}, 503, "cache")
            if kind == "index":
                obj = enrich_index(obj)
            return self.send_json(obj, 200, "cache")
        return self.send_json({"detail": "analysis_unavailable"}, 503, "cache")

    def api(self, method, path, body=None):
        if engine_up():
            got = self.from_engine(method, path, body)
            if got:
                status, obj = got
                if path == "/api/lots":
                    obj = enrich_index(obj)
                return self.send_json(obj, status, "engine")
        if method == "POST" and path.startswith("/api/analyze"):
            try:
                payload = json.loads(body or b"{}")
            except ValueError:
                payload = {}
            lid = lot_id_from(payload.get("lot_id") or payload.get("url"))
            if not lid:
                return self.send_json({"detail": "lot_id or url required"}, 400)
            return self.offline(f"lots/{lid}.json")
        if path == "/api/stats":
            return self.offline("stats.json")
        if path == "/api/lots":
            return self.offline("index.json", "index")
        m = re.fullmatch(r"/api/lots/(\d+)", path)
        if m:
            return self.offline(f"lots/{lot_id_from(m.group(1))}.json")
        m = re.fullmatch(r"/api/customers/(\d+)", path)
        if m:
            return self.offline(f"customers/{m.group(1)}.json")
        return self.send_json({"detail": "unknown endpoint"}, 404)

    # ---------- verbs ----------
    def do_GET(self):
        path = self.path.split("?")[0]
        if path.startswith("/api/"):
            return self.api("GET", path)
        if path.startswith("/tools/") or path.endswith(".py"):
            self.send_error(404)
            return
        return super().do_GET()

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(n) if n else b"{}"
        path = self.path.split("?")[0]
        if path.startswith("/api/"):
            return self.api("POST", path, body)
        self.send_error(404)


def main():
    global ENGINE, CACHE
    ap = argparse.ArgumentParser(description="TenderLens UI server")
    ap.add_argument("--port", type=int, default=8780)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--engine", default=ENGINE)
    ap.add_argument("--data", default=str(CACHE), help="engine cache folder (default: data/cache)")
    ap.add_argument("--no-browser", action="store_true")
    a = ap.parse_args()
    ENGINE = a.engine.rstrip("/")
    CACHE = Path(a.data)
    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    url = f"http://{a.host}:{a.port}/"
    src = "engine" if engine_up() else ("kesh: " + str(CACHE)) if has_cache() else "YO'Q (data/cache topilmadi)"
    print(f"TenderLens UI: {url}  (ma'lumot: {src})  - to'xtatish: Ctrl+C", flush=True)
    if not a.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
