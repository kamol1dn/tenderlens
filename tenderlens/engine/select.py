"""Group specs that share a template and pick samples.

    python -m engine.select clusters          # write data/eval/clusters.json
    python -m engine.select sample 30         # random sample of distinct specs -> data/eval/gonogo_lots.json
"""
from __future__ import annotations

import argparse
import random
import re
import sys

from . import config as C
from . import uzex

_W = re.compile(r"[^\W\d_]{3,}")


def shingles(text: str, k: int = 4, limit: int = 30000) -> set[int]:
    words = _W.findall(text[:limit].lower())
    return {hash(" ".join(words[i:i + k])) for i in range(0, max(len(words) - k, 0), 2)}


def readable_lots() -> dict[int, dict]:
    out = {}
    for p in C.TEXT.glob("*.json"):
        t = uzex.read_json(p)
        if t.get("status") == "ok":
            out[int(t["lot_id"])] = t
    return out


def clusters(threshold: float = 0.5) -> list[list[int]]:
    """Greedy clustering by Jaccard similarity of 4-word shingles: one cluster = one template."""
    lots = readable_lots()
    sig = {lid: shingles("\n".join(p.get("text") or "" for p in t["pages"])) for lid, t in lots.items()}
    groups: list[list[int]] = []
    for lid in sorted(sig):
        s = sig[lid]
        for g in groups:
            r = sig[g[0]]
            if s and r and len(s & r) / len(s | r) >= threshold:
                g.append(lid)
                break
        else:
            groups.append([lid])
    return groups


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["clusters", "sample"])
    ap.add_argument("n", nargs="?", type=int, default=30)
    ap.add_argument("--seed", type=int, default=17)
    ap.add_argument("--max-chars", type=int, default=90000)
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    groups = clusters()
    uzex.write_json(C.EVAL / "clusters.json", groups)
    big = sorted((g for g in groups if len(g) > 1), key=len, reverse=True)
    print(f"{sum(len(g) for g in groups)} readable specs in {len(groups)} distinct templates; "
          f"largest shared templates: {[len(g) for g in big[:8]]}")
    if a.cmd == "clusters":
        return 0
    lots = readable_lots()
    rng = random.Random(a.seed)
    must = [l for l in (524784, 523196, 524116) if l in lots]          # known demo lots, reported separately
    taken = {tuple(g) for g in groups if any(l in g for l in must)}
    pool = [g for g in groups if tuple(g) not in taken
            and 1500 <= lots[g[0]].get("chars", 0) <= a.max_chars]
    rng.shuffle(pool)
    seen_customers: set[str] = set()
    picked: list[int] = []
    for g in pool:
        lid = g[0]
        tin = str((uzex.get_trade(lid, offline=True) or {}).get("customer_tin"))
        if tin in seen_customers:
            continue
        seen_customers.add(tin)
        picked.append(lid)
        if len(picked) >= a.n - len(must):
            break
    out = {"seed": a.seed, "preselected_demo_lots": must, "random_sample": picked,
           "note": "random_sample: one spec per template and per customer, drawn at random from readable specs"}
    uzex.write_json(C.EVAL / "gonogo_lots.json", out)
    print("sample:", must, "+", picked)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
