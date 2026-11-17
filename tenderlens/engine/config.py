"""Paths and constants shared by every engine module."""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # tenderlens/
DATA = ROOT / "data"
RAW = DATA / "raw"
RAW_TRADELIST = RAW / "tradelist"
RAW_GETTRADE = RAW / "gettrade"
RAW_DEALS = RAW / "deals"
SPECS = DATA / "specs"
UNPACKED = SPECS / "unpacked"
TEXT = DATA / "text"
LINT = DATA / "lint"                                   # raw model output per lot
CACHE = DATA / "cache"
CACHE_LOTS = CACHE / "lots"
CACHE_CUSTOMERS = CACHE / "customers"
EVAL = DATA / "eval"

API_BASE = "https://apietender.uzex.uz/api/common"
LOT_URL = "https://etender.uzex.uz/lot/{lot_id}"
HEADERS = {"User-Agent": "Mozilla/5.0 Chrome/130", "Content-Type": "application/json"}
SLEEP = 0.4                                            # politeness delay between calls

DEMO_LOTS = [524784, 523196, 523837, 524116, 524120, 524152]

# TradeList TypeId -> contract "type"
TYPE_NAMES = {1: "selection", 2: "tender"}

MODEL_BULK = os.environ.get("TENDERLENS_MODEL", "claude-sonnet-5-5")
MODEL_HARD = os.environ.get("TENDERLENS_MODEL_HARD", "claude-opus-5-5")

for _p in (RAW_TRADELIST, RAW_GETTRADE, RAW_DEALS, SPECS, UNPACKED, TEXT, LINT,
           CACHE_LOTS, CACHE_CUSTOMERS, EVAL):
    _p.mkdir(parents=True, exist_ok=True)
