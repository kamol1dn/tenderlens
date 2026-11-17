"""HTTP API for the app, the bot and Quarry.  Run:  python -m engine.api

    GET  /api/stats              -> data/cache/stats.json
    GET  /api/lots               -> data/cache/index.json
    GET  /api/lots/{lot_id}      -> data/cache/lots/{id}.json (live analysis if not cached)
    GET  /api/customers/{tin}    -> data/cache/customers/{tin}.json
    POST /api/analyze            -> {"lot_id": 524784} or {"url": "https://etender.uzex.uz/lot/524784"}
    GET  /api/health             -> what is cached, whether live analysis is possible
    GET  /label                  -> labelling page for human reviewers (Uzbek); see engine/label.py

Cached answers never touch the network, so the demo works offline.
"""
from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import analyze as A
from . import config as C
from . import label as LB
from . import lint as L
from . import uzex

app = FastAPI(title="TenderLens engine", version="0.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(LB.router)
OFFLINE = os.environ.get("TENDERLENS_OFFLINE", "") == "1"


def _file(path):
    if not path.exists():
        raise HTTPException(404, detail={"status": "not_found", "message": f"{path.name} is not in the cache"})
    return JSONResponse(uzex.read_json(path))


@app.get("/api/health")
def health():
    return {"status": "ok", "cached_lots": len(list(C.CACHE_LOTS.glob("*.json"))),
            "live_analysis": L.llm_available() and not OFFLINE, "offline_mode": OFFLINE,
            "llm_key_present": L.llm_available()}


@app.get("/api/stats")
def stats():
    return _file(C.CACHE / "stats.json")


@app.get("/api/lots")
def lots():
    return _file(C.CACHE / "index.json")


@app.get("/api/customers/{tin}")
def customer(tin: str):
    if not tin.isalnum():
        raise HTTPException(400, detail={"status": "bad_request", "message": "tin must be alphanumeric"})
    return _file(C.CACHE_CUSTOMERS / f"{tin}.json")


def _lot(lot_id: int):
    rec = A.cached(lot_id)
    if rec is not None:
        return JSONResponse(rec)
    try:
        rec = A.analyze(lot_id, offline=OFFLINE)
        A.rebuild_index()
        return JSONResponse(rec)
    except A.LotNotFound as e:
        raise HTTPException(404, detail={"status": "not_found", "lot_id": lot_id, "message": str(e)})
    except L.LLMUnavailable as e:
        # Honest answer: this lot has not been analysed and cannot be right now.
        raise HTTPException(503, detail={"status": "analysis_unavailable", "lot_id": lot_id, "message": str(e)})
    except Exception as e:
        raise HTTPException(502, detail={"status": "analysis_failed", "lot_id": lot_id,
                                         "message": f"{type(e).__name__}: {str(e)[:200]}"})


@app.get("/api/lots/{lot_id}")
def lot(lot_id: int):
    return _lot(lot_id)


class AnalyzeBody(BaseModel):
    lot_id: int | str | None = None
    url: str | None = None


@app.post("/api/analyze")
def analyze(body: AnalyzeBody):
    value = body.lot_id if body.lot_id is not None else body.url
    if value is None:
        raise HTTPException(400, detail={"status": "bad_request", "message": "send lot_id or url"})
    try:
        lot_id = uzex.lot_id_from(value)
    except ValueError as e:
        raise HTTPException(400, detail={"status": "bad_request", "message": str(e)})
    return _lot(lot_id)


def main() -> None:
    import uvicorn

    # Default: this machine only. TENDERLENS_HOST=0.0.0.0 lets other laptops on the same network open
    # the labelling page; there is no login, so anyone on that network can then read the API and write labels.
    uvicorn.run(app, host=os.environ.get("TENDERLENS_HOST", "127.0.0.1"), port=8765, log_level="info")


if __name__ == "__main__":
    main()
