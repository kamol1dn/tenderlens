"""Customer statistics and the bidder curve, computed from DealsList snapshots.

    python -m engine.stats            # writes data/cache/stats.json and customers/*.json
    python -m engine.stats --check    # reproduce the research baseline on the seed file

Everything here is plain arithmetic on public deal records: no model is involved.
"""
from __future__ import annotations

import argparse
import statistics
import sys
from collections import Counter, defaultdict
from datetime import datetime
from functools import lru_cache
from pathlib import Path

from . import config as C
from . import uzex

SEED = C.ROOT.parent / "national-research" / "data" / "etender_deals_10k_17nov.json"
BUCKETS = ["1", "2", "3", "4", "5", "6+"]
MIN_DEALS = 5            # below this a customer's history is too thin to use


def load_deals(source: Path | None = None) -> list[dict]:
    """All saved deals, de-duplicated by deal_id (pages shift as new deals land)."""
    rows: list[dict] = []
    if source is not None:
        rows = uzex.read_json(source)
    else:
        for p in sorted(C.RAW_DEALS.glob("deals_*.json")):
            rows.extend(uzex.read_json(p))
        if not rows and SEED.exists():
            rows = uzex.read_json(SEED)
    seen, out = set(), []
    for r in rows:
        k = r.get("deal_id")
        if k in seen:
            continue
        seen.add(k)
        out.append(r)
    return out


def price_drop(r: dict) -> float | None:
    """(start - deal) / start; None when the start price is missing or not positive."""
    s, d = r.get("start_cost") or 0, r.get("deal_cost")
    if s <= 0 or d is None:
        return None
    return (s - d) / s


def bucket(n) -> str | None:
    if not n or n < 1:
        return None
    return "6+" if n >= 6 else str(int(n))


def bidder_curve(deals: list[dict]) -> list[dict]:
    groups: dict[str, list[float]] = defaultdict(list)
    for r in deals:
        b, drop = bucket(r.get("participants_count")), price_drop(r)
        if b is None or drop is None:
            continue
        groups[b].append(drop)
    return [{"bidders": b, "n": len(groups[b]), "median_drop": round(statistics.median(groups[b]), 4)}
            for b in BUCKETS if groups[b]]


def curve_value(curve: list[dict], bidders: float) -> float:
    """Median price drop at a (possibly fractional) bidder count.

    Linear interpolation between whole-number buckets; anything at or above 6
    uses the "6+" bucket, anything below 1 uses the "1" bucket.
    """
    pts = {(6 if c["bidders"] == "6+" else int(c["bidders"])): c["median_drop"] for c in curve}
    if not pts:
        return 0.0
    b = min(max(float(bidders), min(pts)), 6.0)
    lo, hi = int(b), min(int(b) + 1, 6)
    if lo not in pts or hi not in pts:
        return pts.get(lo, pts.get(hi, 0.0))
    return pts[lo] + (pts[hi] - pts[lo]) * (b - lo)


def money_on_table(start_cost: float, median_bidders: float, curve: list[dict]) -> float:
    """Contract formula. ESTIMATE ONLY: a correlation across lots, not a forecast for this lot.

    start_cost x (curve(median_bidders + 2) - curve(median_bidders)), floored at 0.
    """
    gain = curve_value(curve, median_bidders + 2) - curve_value(curve, median_bidders)
    return round(max(0.0, (start_cost or 0) * gain), 2)


def customer_stats(deals: list[dict]) -> dict[str, dict]:
    by: dict[str, list[dict]] = defaultdict(list)
    for r in deals:
        tin = str(r.get("customer_inn") or "").strip()
        if tin:
            by[tin].append(r)
    reann = reannounced_by_customer()
    out: dict[str, dict] = {}
    for tin, rows in by.items():
        counts = [r["participants_count"] for r in rows if r.get("participants_count")]
        drops = [d for d in (price_drop(r) for r in rows) if d is not None]
        winners = Counter(str(r.get("provider_inn") or r.get("provider_name") or "?") for r in rows)
        rows.sort(key=lambda r: r.get("deal_date") or "", reverse=True)
        out[tin] = {
            "tin": tin,
            "name": Counter(r.get("customer_name") or "" for r in rows).most_common(1)[0][0],
            "deals": len(rows),
            "median_bidders": statistics.median(counts) if counts else 0,
            "share_le2_bidders": round(sum(1 for c in counts if c <= 2) / len(counts), 4) if counts else 0.0,
            "top_winner_share": round(winners.most_common(1)[0][1] / len(rows), 4),
            "share_price_drop_lt1pct": round(sum(1 for d in drops if d < 0.01) / len(drops), 4) if drops else 0.0,
            "reannounced_lots": reann.get(tin, 0),
            "customer_kind": _kind(Counter(r.get("customer_type_name") or "" for r in rows).most_common(1)[0][0]),
            "recent_deals": [{"date": r.get("deal_date"), "title": (r.get("category_name") or "").strip(),
                              "deal_cost": r.get("deal_cost"), "currency": r.get("currency_name"),
                              "participants_count": r.get("participants_count"),
                              "winner_name": r.get("provider_name")} for r in rows[:20]],
        }
    for tin, n in reann.items():         # customers with open lots but no deal history
        out.setdefault(tin, {"tin": tin, "name": "", "deals": 0, "median_bidders": 0,
                             "share_le2_bidders": 0.0, "top_winner_share": 0.0,
                             "share_price_drop_lt1pct": 0.0, "reannounced_lots": n, "recent_deals": []})
    return out


def _kind(type_name: str) -> str:
    """DealsList customer_type_name -> budget | corporate | unknown."""
    t = (type_name or "").lower()
    return "budget" if "budget" in t or "бюджет" in t else "corporate" if "korporativ" in t or "корпоратив" in t else "unknown"


def kind_of(tin: str) -> str:
    c = _bundle()[2].get(str(tin or "").strip())
    return (c or {}).get("customer_kind", "unknown")


def reannounced_by_customer() -> dict[str, int]:
    """Open lots per customer whose GetTrade record has old_id (a re-announcement)."""
    out: Counter = Counter()
    for p in C.RAW_GETTRADE.glob("*.json"):
        g = uzex.read_json(p)
        if g.get("old_id"):
            out[str(g.get("customer_tin") or "")] += 1
    return dict(out)


STAT_KEYS = ["deals", "median_bidders", "share_le2_bidders", "top_winner_share",
             "share_price_drop_lt1pct", "reannounced_lots"]


@lru_cache(maxsize=1)
def _bundle() -> tuple:
    deals = load_deals()
    return deals, bidder_curve(deals), customer_stats(deals)


def curve() -> list[dict]:
    return _bundle()[1]


def market_median_bidders() -> float:
    counts = [r["participants_count"] for r in _bundle()[0] if r.get("participants_count")]
    return statistics.median(counts) if counts else 2


def for_customer(tin: str) -> dict:
    """Contract `customer_stats` block for one customer (zeros when unknown)."""
    c = _bundle()[2].get(str(tin or "").strip())
    if not c:
        return {k: 0 for k in STAT_KEYS} | {"share_le2_bidders": 0.0, "top_winner_share": 0.0,
                                             "share_price_drop_lt1pct": 0.0}
    return {k: c[k] for k in STAT_KEYS}


def estimate_for_lot(start_cost: float, currency: str, tin: str) -> tuple[float, str]:
    """(money_on_table_uzs, basis). Non-UZS lots are not estimated."""
    if (currency or "UZS").upper() != "UZS":
        return 0.0, "not_estimated_non_uzs"
    c = _bundle()[2].get(str(tin or "").strip())
    if c and c["deals"] >= MIN_DEALS and c["median_bidders"]:
        return money_on_table(start_cost, c["median_bidders"], curve()), "customer_history"
    return money_on_table(start_cost, market_median_bidders(), curve()), "market_median"


def _template_findings() -> list[dict]:
    from . import templates          # imported here: templates is optional for the rest of stats
    try:
        return templates.findings()
    except Exception:
        return []


def _template_labels() -> list[dict]:
    from . import templates
    try:
        return templates.template_labels()
    except Exception:
        return []


def write_cache(lot_summaries: list[dict] | None = None) -> dict:
    deals, crv, customers = _bundle()
    for tin, c in customers.items():
        if tin.isalnum():
            uzex.write_json(C.CACHE_CUSTOMERS / f"{tin}.json", c)
    dates = sorted(r["deal_date"][:10] for r in deals if r.get("deal_date"))
    meta = uzex.read_json(C.RAW / "snapshot_meta.json") if (C.RAW / "snapshot_meta.json").exists() else {}
    lots = lot_summaries if lot_summaries is not None else (
        uzex.read_json(C.CACHE / "index.json") if (C.CACHE / "index.json").exists() else [])
    drops = [d for d in (price_drop(r) for r in deals) if d is not None]
    counts = [r["participants_count"] for r in deals if r.get("participants_count")]
    stats = {
        "bidder_curve": crv,
        "deals_analysed": len(deals),
        "deals_period": f"{dates[0]}..{dates[-1]}" if dates else "",
        "open_lots": meta.get("open_lots", 0),
        "open_value_uzs": meta.get("open_value_uzs", 0),
        "analysed_lots": len(lots),
        "flagged_lots": sum(1 for l in lots if l.get("flag_count")),
        "money_on_table_total_uzs": round(sum(l.get("money_on_table_uzs") or 0 for l in lots), 2),
        "money_on_table_note": "estimate; total over analysed lots only",
        "median_bidders": statistics.median(counts) if counts else 0,
        "share_exactly_2_bidders": round(sum(1 for c in counts if c == 2) / len(counts), 4) if counts else 0,
        "share_price_drop_lt1pct": round(sum(1 for d in drops if d < 0.01) / len(drops), 4) if drops else 0,
        "customers": len(customers),
        "template_findings": _template_findings(),
        "template_labels": _template_labels(),
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
    }
    uzex.write_json(C.CACHE / "stats.json", stats)
    return stats


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="reproduce the baseline on the seed file")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    if a.check:
        deals = load_deals(SEED)
        print("seed deals:", len(deals))
        for c in bidder_curve(deals):
            print(f"  {c['bidders']:>2} bidders  n={c['n']:<5} median drop {c['median_drop']:.1%}")
        return 0
    s = write_cache()
    print({k: v for k, v in s.items() if k != "bidder_curve"})
    for c in s["bidder_curve"]:
        print(f"  {c['bidders']:>2} bidders  n={c['n']:<5} median drop {c['median_drop']:.1%}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
