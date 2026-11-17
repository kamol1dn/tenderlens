"""Order the not-yet-analysed lots for the next model batch.

    python -m engine.queue 95 --batch 5      # write data/eval/queue.json and print batches

Priority: health and education first (title or customer name), then by start price.
One lot per template (near-identical specs are skipped) and at most 3 per customer.
"""
from __future__ import annotations

import argparse
import os
import re
import sys

from . import analyze as A
from . import config as C
from . import lint as L
from . import select as SEL
from . import uzex

HEALTH_EDU = re.compile(
    r"тиббий|tibbi|медицин|шифохона|shifoxona|клиник|klinik|соғлиқ|соглик|sog.liq|касаллик|kasallik|больниц|"
    r"мактаб|maktab|таълим|ta.lim|университет|universitet|институт|institut|боғча|bog.cha|коллеж|kollej|лицей|litsey", re.I)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("n", type=int, nargs="?", default=95)
    ap.add_argument("--batch", type=int, default=5)
    ap.add_argument("--max-chars", type=int, default=110000)
    ap.add_argument("--scanned", action="store_true", help="list priority lots that need a vision pass instead")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    rows = uzex.saved_trade_rows()
    done = {int(p.stem) for p in C.LINT.glob("*.json")}
    if a.scanned:
        out = []
        for p in C.TEXT.glob("*.json"):
            t = uzex.read_json(p)
            lid = int(t["lot_id"])
            if t.get("status") == "ok" or lid in done or not t.get("unreadable_pages") or t.get("n_pages", 0) > 12:
                continue
            g = uzex.get_trade(lid, offline=True) or {}
            title = (rows.get(lid, {}).get("name") or "")
            if (g.get("currency_codeabc") or "UZS") != "UZS":
                continue
            pri = bool(HEALTH_EDU.search(f"{title} {g.get('customer_name')}"))
            out.append((not pri, -(g.get("start_cost") or 0), lid, t.get("n_pages"), title[:60].replace("\n", " ")))
        out.sort()
        for o in out[:a.n]:
            print(o[2], "health/edu" if not o[0] else "value", f"{-o[1]:.0f}", f"{o[3]}p", o[4])
        uzex.write_json(C.EVAL / "queue_scanned.json", [o[2] for o in out[:a.n]])
        return 0
    groups = SEL.clusters()
    rep = {l: g[0] for g in groups for l in g}
    used = {rep.get(l) for l in done}
    lots = SEL.readable_lots()
    cand = []
    for lid, t in lots.items():
        if lid in done or not (1500 <= t.get("chars", 0) <= a.max_chars):
            continue
        g = uzex.get_trade(lid, offline=True) or {}
        title = rows.get(lid, {}).get("name") or ""
        pri = bool(HEALTH_EDU.search(f"{title} {g.get('customer_name')}"))
        uzs = (g.get("currency_codeabc") or "UZS") == "UZS"
        cand.append((not pri, not uzs, -(g.get("start_cost") or 0), lid, str(g.get("customer_tin")), title))
    cand.sort()
    picked, per_c = [], {}
    n_pri = 0
    for notpri, _, cost, lid, tin, title in cand:
        if rep.get(lid) in used or per_c.get(tin, 0) >= 3:
            continue
        if not notpri and n_pri >= int(a.n * 0.6):        # leave room for the highest-value lots
            continue
        used.add(rep.get(lid))
        per_c[tin] = per_c.get(tin, 0) + 1
        n_pri += (not notpri)
        picked.append({"lot_id": lid, "priority": "health/edu" if not notpri else "value",
                       "start_cost": -cost, "title": title[:70].replace("\n", " ")})
        if len(picked) >= a.n:
            break
    for p in picked:
        L.build_input(p["lot_id"])
    size = {p["lot_id"]: os.path.getsize(L.LINT_IN / f"{p['lot_id']}.txt") for p in picked}
    k = max(1, round(len(picked) / a.batch))
    bins, tot = [[] for _ in range(k)], [0] * k
    for lid in sorted(size, key=lambda i: -size[i]):
        j = min(range(k), key=lambda j: (len(bins[j]) >= a.batch + 1, tot[j]))
        bins[j].append(lid)
        tot[j] += size[lid]
    uzex.write_json(C.EVAL / "queue.json", {"picked": picked, "batches": bins})
    print(len(picked), "lots;", sum(1 for p in picked if p["priority"] == "health/edu"), "health/edu")
    for b, t in zip(bins, tot):
        print(t // 1000, "KB", b)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
