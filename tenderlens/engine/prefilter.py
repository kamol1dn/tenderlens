"""Cheap keyword prefilter: which readable specs are worth a model pass first.

    python -m engine.prefilter 22     # print and save the top N not yet linted

Not a flagger. It only orders the queue; every flag still comes from the lint with a verified quote.
"""
from __future__ import annotations

import re
import sys

from . import config as C
from . import select as SEL
from . import stats as S
from . import uzex

PATTERNS = {
    "dealer": r"дилер|diler|авторизац|avtorizats|ваколат хати|vakolat xati|официальн\w* (дилер|представител)|ишлаб чиқарувчи\w* (хат|ваколат)|MAF\b",
    "experience": r"камида\s+\d+\s*(йил|та шартнома)|kamida\s+\d+\s*(yil|ta shartnoma)|не менее\s+\d+\s*(лет|года|договор)|опыт работы не менее|тажриба\w* камида",
    "financial": r"айланма маблағ|айланма маблаг|aylanma mablag|оборот\w* не менее|йиллик айланма|yillik aylanma|банк кафолати|bank kafolati",
    "brand": r"(фақат|faqat|только|исключительно)\s+\S+\s+(маркали|markali|марки|производства|ишлаб чиқарилган)|эквивалент\w* (қабул қилинмайди|не допуска)|ekvivalent\w* qabul qilinmaydi|аналог\w* не допуска",
    "licence": r"лицензия|litsenziya|сертификат ISO|ISO\s?\d{4,5}",
}
_RX = {k: re.compile(v, re.I) for k, v in PATTERNS.items()}


def rank() -> list[dict]:
    lots = SEL.readable_lots()
    rows = uzex.saved_trade_rows()
    out = []
    for lid, t in lots.items():
        text = "\n".join(p.get("text") or "" for p in t["pages"])
        hits = {k: len(rx.findall(text)) for k, rx in _RX.items()}
        g = uzex.get_trade(lid, offline=True) or {}
        cs = S.for_customer(str(g.get("customer_tin")))
        score = sum(2 for k in ("dealer", "experience", "financial", "brand") if hits[k]) + (1 if hits["licence"] else 0)
        if cs["deals"] >= S.MIN_DEALS:
            score += 2 * cs["top_winner_share"] + cs["share_le2_bidders"]
        out.append({"lot_id": lid, "score": round(score, 2), "hits": {k: v for k, v in hits.items() if v},
                    "chars": t.get("chars", 0), "start_cost": g.get("start_cost") or 0,
                    "currency": g.get("currency_codeabc"), "customer_tin": str(g.get("customer_tin")),
                    "title": (rows.get(lid, {}).get("name") or "")[:70]})
    out.sort(key=lambda r: (-r["score"], -r["start_cost"]))
    return out


def main(argv=None) -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    n = int((argv or sys.argv[1:] or ["22"])[0])
    groups = SEL.clusters()
    rep = {l: g[0] for g in groups for l in g}
    done_templates = {rep.get(int(p.stem)) for p in C.LINT.glob("*.json")}
    done_templates |= {rep.get(int(p.stem)) for p in (C.LINT / "in").glob("*.txt")}
    picked, seen_c = [], {}
    for r in rank():
        tpl = rep.get(r["lot_id"])
        if tpl in done_templates or r["chars"] > 90000 or r["chars"] < 1500:
            continue
        if seen_c.get(r["customer_tin"], 0) >= 2:
            continue
        seen_c[r["customer_tin"]] = seen_c.get(r["customer_tin"], 0) + 1
        done_templates.add(tpl)
        picked.append(r)
        if len(picked) >= n:
            break
    uzex.write_json(C.EVAL / "prefilter_top.json", picked)
    for r in picked:
        print(r["lot_id"], r["score"], r["hits"], r["chars"], f"{r['start_cost']:.0f}", r["title"].replace("\n", " "))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
