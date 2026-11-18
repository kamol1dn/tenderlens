"""Evaluation set: candidate labels for human review, and scoring against confirmed labels only.

    python -m engine.evalset build                 # write / extend data/eval/labels.csv (keeps human columns)
    python -m engine.evalset import a.json b.json  # merge answers exported from data/eval/label_pack.html
    python -m engine.evalset score [--json]        # precision etc., ONLY from human-confirmed rows

labels.csv columns
    lot_id, page, clause_quote     the clause, verbatim from the extracted text
    system_flagged                 yes / no: did the lint flag this clause
    proposed_type, proposed_severity
    proposed_restrictive           yes / no: the assistant's own guess. NOT ground truth.
    label_status                   assistant-proposed  ->  confirmed | unsure | disputed
    human_restrictive              yes / no / unsure, from the human reviewers
    human_type, reviewer, notes    filled by the human reviewers

Two ways for humans to answer: the local /label page (engine/label.py, one reviewer per clause) and
the offline label pack (engine/labelpack.py), which several people fill in on their own laptops.
Pack answers are kept per reviewer in data/eval/reviews/{reviewer}.json; labels.csv then holds the
consensus: all yes/no answers equal (or a strict majority of three or more) -> confirmed; a tie ->
disputed (left out of precision, counted in agreement); only "unsure" answers -> unsure.

TENDERLENS_LABELS=<path to a copy of labels.csv> points every command at a copy (its reviews/ folder
sits next to it), so imports can be tried without touching the real file.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import re
import sys
from datetime import datetime
from itertools import combinations
from pathlib import Path

from . import config as C
from . import extract as X
from . import lint as L
from . import uzex

PATH = Path(os.environ.get("TENDERLENS_LABELS") or C.EVAL / "labels.csv")
REVIEWS = PATH.parent / "reviews"
EXPORT_FORMAT = "tenderlens-labels-v1"
ANSWERS = ("yes", "no", "unsure")
MIN_MEDIUM_FOR_HEADLINE = 20      # medium flags with a confirmed label before a weighted figure is printed
COLS = ["lot_id", "page", "clause_quote", "system_flagged", "proposed_type", "proposed_severity",
        "proposed_restrictive", "label_status", "human_restrictive", "human_type", "reviewer", "notes"]


def read() -> list[dict]:
    if not PATH.exists():
        return []
    with open(PATH, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def write(rows: list[dict]) -> None:
    with open(PATH, "w", encoding="utf-8-sig", newline="") as f:   # BOM so Excel opens Cyrillic correctly
        w = csv.DictWriter(f, fieldnames=COLS)
        w.writeheader()
        w.writerows(rows)


def key_of(row: dict) -> str:
    """Stable id of a clause: the lot and the normalised quote. Used by /label and the label pack."""
    return hashlib.sha1(f"{row['lot_id']}|{L.norm(row['clause_quote'])}".encode("utf-8")).hexdigest()[:12]


def context(lot_id: int, page: int, quote: str, width: int = 700) -> tuple[str, str, str]:
    """Text before the quote, the quote as printed, text after it."""
    if page == 0:
        g = uzex.get_trade(lot_id, offline=True) or {}
        text = "\n".join(L.form_values(g))
    else:
        pages = {p["page"]: p.get("text") or "" for p in X.extract(lot_id).get("pages", [])}
        text = pages.get(page, "")
    tokens = [re.escape(t) for t in quote.split()]
    m = re.search(r"\s+".join(tokens), text, flags=re.I) if tokens else None
    if not m:
        return "", quote, ""
    return text[max(0, m.start() - width):m.start()], text[m.start():m.end()], text[m.end():m.end() + width]


def build(per_lot_negatives: int = 3) -> list[dict]:
    old = {(r["lot_id"], L.norm(r["clause_quote"])): r for r in read()}
    rows: list[dict] = []
    for p in sorted(C.LINT.glob("*.json")):
        lid = int(p.stem)
        v = L.verify(lid, uzex.read_json(p))
        flagged = {L.norm(f["quote"]) for f in v["flags"]}
        items = [(f["page"], f["quote"], "yes", f["type"], f["severity"], "yes") for f in v["flags"]]
        neg = [r for r in v["requirements"] if L.norm(r["quote"]) not in flagged
               and r["kind"] in ("qualification", "evaluation", "technical")]
        items += [(r["page"], r["quote"], "no", "", "", "no") for r in neg[:per_lot_negatives]]
        for page, quote, sysf, typ, sev, prop in items:
            key = (str(lid), L.norm(quote))
            if key in old:
                keep = old.pop(key)
                keep.update(system_flagged=sysf, proposed_type=typ, proposed_severity=sev)
                rows.append(keep)
            else:
                rows.append({"lot_id": lid, "page": page, "clause_quote": quote, "system_flagged": sysf,
                             "proposed_type": typ, "proposed_severity": sev, "proposed_restrictive": prop,
                             "label_status": "assistant-proposed", "human_restrictive": "",
                             "human_type": "", "reviewer": "", "notes": ""})
    rows += [r for r in old.values() if r.get("label_status") == "confirmed"]   # human-added rows survive
    write(rows)
    return rows


# ------------------------------------------------------------------ answers from the offline label pack
def _slug(name: str) -> str:
    return re.sub(r"[^\w]+", "_", name.lower()).strip("_")[:40] or "reviewer"


def load_reviews() -> dict[str, dict]:
    """{reviewer name: {clause id: {"answer", "comment", "opened_ai", "answered_at"}}}"""
    out: dict[str, dict] = {}
    if REVIEWS.exists():
        for p in sorted(REVIEWS.glob("*.json")):
            d = uzex.read_json(p)
            out[d.get("reviewer") or p.stem] = d.get("answers") or {}
    return out


def import_file(path) -> dict:
    """Merge one exported labels_{name}.json into reviews/ and re-derive labels.csv. Returns a summary."""
    path = Path(path)
    if path.stat().st_size > 5_000_000:
        raise ValueError(f"{path.name}: larger than 5 MB, not a label pack export")
    try:
        d = json.loads(path.read_text(encoding="utf-8-sig"))
    except (ValueError, UnicodeDecodeError) as e:
        raise ValueError(f"{path.name}: not valid JSON ({e})") from None
    if not isinstance(d, dict) or d.get("format") != EXPORT_FORMAT or not isinstance(d.get("answers"), list):
        raise ValueError(f"{path.name}: not a TenderLens label export (format {EXPORT_FORMAT!r} expected)")
    reviewer = re.sub(r"\s+", " ", str(d.get("reviewer") or "")).strip()[:40]
    if not reviewer:
        raise ValueError(f"{path.name}: the reviewer name is empty")
    known = {key_of(r) for r in read()}
    good: dict[str, dict] = {}
    unknown: list[str] = []
    bad = 0
    for a in d["answers"]:
        if not isinstance(a, dict) or a.get("answer") not in ANSWERS or not isinstance(a.get("id"), str):
            bad += 1
            continue
        if a["id"] not in known:
            unknown.append(a["id"][:20])
            continue
        good[a["id"]] = {"answer": a["answer"], "comment": str(a.get("comment") or "").strip()[:500],
                         "opened_ai": bool(a.get("opened_ai")),
                         "answered_at": str(a.get("answered_at") or "")[:40]}
    REVIEWS.mkdir(parents=True, exist_ok=True)
    target = REVIEWS / f"{_slug(reviewer)}.json"
    old = uzex.read_json(target) if target.exists() else {}
    answers = dict(old.get("answers") or {})
    changed = sum(1 for k, v in good.items() if k in answers and answers[k]["answer"] != v["answer"])
    new = sum(1 for k in good if k not in answers)
    answers.update(good)                              # a later export wins, clause by clause
    files = list(dict.fromkeys((old.get("source_files") or []) + [path.name]))
    uzex.write_json(target, {"reviewer": reviewer, "pack_id": str(d.get("pack_id") or "")[:40],
                             "imported_at": datetime.now().astimezone().isoformat(timespec="seconds"),
                             "source_files": files, "answers": answers})
    touched = derive()
    return {"file": path.name, "reviewer": reviewer, "pack_id": d.get("pack_id"), "answers_in_file": len(d["answers"]),
            "imported": len(good), "new": new, "changed": changed, "malformed_skipped": bad,
            "unknown_clause_ids": unknown, "reviewer_total": len(answers), "labels_rows_updated": touched,
            "stored_in": str(target)}


def derive() -> int:
    """Write the reviewers' consensus into labels.csv. Only rows that have pack answers are touched."""
    reviews = load_reviews()
    rows = read()
    touched = 0
    for r in rows:
        k = key_of(r)
        votes = [(name, ans[k]) for name, ans in sorted(reviews.items()) if k in ans]
        if not votes:
            continue
        yes = sum(1 for _, v in votes if v["answer"] == "yes")
        no = sum(1 for _, v in votes if v["answer"] == "no")
        if yes + no == 0:
            human, status = "unsure", "unsure"
        elif yes != no and (min(yes, no) == 0 or yes + no >= 3):
            human, status = ("yes" if yes > no else "no"), "confirmed"
        else:
            human, status = "", "disputed"
        r["human_restrictive"], r["label_status"] = human, status
        r["reviewer"] = "; ".join(f"{name}={v['answer']}" for name, v in votes)
        r["notes"] = " | ".join(f"{name}: {v['comment']}" for name, v in votes if v["comment"])[:500]
        touched += 1
    if touched:
        write(rows)
    return touched


# ------------------------------------------------------------------ scoring
def _rate(k: int, n: int) -> dict:
    """k of n with a 95% Wilson interval, so a rate from a small sample is not read as exact."""
    if not n:
        return {"n": 0, "k": 0, "rate": None, "ci95": None}
    p, z = k / n, 1.96
    centre, half = p + z * z / (2 * n), z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    lo, hi = (centre - half) / (1 + z * z / n), (centre + half) / (1 + z * z / n)
    return {"n": n, "k": k, "rate": round(p, 3), "ci95": [round(max(0.0, lo), 3), round(min(1.0, hi), 3)]}


def _agreement(a: dict, b: dict) -> dict:
    both = sorted(set(a) & set(b))
    dec = [(a[k]["answer"], b[k]["answer"]) for k in both if a[k]["answer"] != "unsure" and b[k]["answer"] != "unsure"]
    n = len(dec)
    out = {"clauses_both_saw": len(both), "both_decided": n, "either_unsure": len(both) - n,
           "agree": sum(1 for x, y in dec if x == y), "agreement": None, "cohen_kappa": None}
    if n:
        po = out["agree"] / n
        pa, pb = sum(1 for x, _ in dec if x == "yes") / n, sum(1 for _, y in dec if y == "yes") / n
        pe = pa * pb + (1 - pa) * (1 - pb)
        out["agreement"] = round(po, 3)
        out["cohen_kappa"] = round((po - pe) / (1 - pe), 3) if pe < 1 else None
    return out


def score() -> dict:
    all_rows = read()
    status = lambda r: (r.get("label_status") or "").strip().lower()
    yes = lambda r, k: (r.get(k) or "").strip().lower() == "yes"
    sev = lambda r: (r.get("proposed_severity") or "").strip().lower()
    rows = [r for r in all_rows if status(r) == "confirmed"
            and (r.get("human_restrictive") or "").strip().lower() in ("yes", "no")]
    out: dict = {"confirmed_rows": len(rows),
                 "disputed_rows": sum(1 for r in all_rows if status(r) == "disputed"),
                 "unsure_rows": sum(1 for r in all_rows if status(r) == "unsure")}
    if not rows:
        out["message"] = "No human-confirmed labels yet: no precision or false-negative rate can be reported."
        return out
    specs = len({r["lot_id"] for r in rows})
    flagged = [r for r in rows if yes(r, "system_flagged")]
    controls = [r for r in rows if not yes(r, "system_flagged")]
    tp = sum(1 for r in flagged if yes(r, "human_restrictive"))
    fn = sum(1 for r in controls if yes(r, "human_restrictive"))
    out.update(specs=specs, true_positives=tp, false_positives=len(flagged) - tp, false_negatives=fn,
               precision=round(tp / len(flagged), 3) if flagged else None,
               false_alarms_per_spec=round((len(flagged) - tp) / specs, 2))

    population = {s: sum(1 for r in all_rows if yes(r, "system_flagged") and sev(r) == s)
                  for s in ("high", "medium", "low")}
    by_sev = {}
    for s in ("high", "medium", "low"):
        sub = [r for r in flagged if sev(r) == s]
        rate = _rate(sum(1 for r in sub if yes(r, "human_restrictive")), len(sub))
        by_sev[s] = {"flags_checked": rate["n"], "confirmed_restrictive": rate["k"], "precision": rate["rate"],
                     "ci95": rate["ci95"], "flags_in_cache": population[s]}
    out["by_severity"] = by_sev
    hm = [r for r in flagged if sev(r) in ("high", "medium")]
    rate = _rate(sum(1 for r in hm if yes(r, "human_restrictive")), len(hm))
    out["precision_high_medium"] = rate["rate"]
    out["precision_high_medium_detail"] = {
        "flags_checked": rate["n"], "confirmed_restrictive": rate["k"], "ci95": rate["ci95"],
        "note": "pooled over the labelled sample; high flags are over-represented in it"}
    n_high, n_med = by_sev["high"]["flags_checked"], by_sev["medium"]["flags_checked"]
    w = population["high"] + population["medium"]
    if n_high and n_med >= MIN_MEDIUM_FOR_HEADLINE:
        out["precision_high_medium_weighted"] = round(
            (population["high"] * by_sev["high"]["precision"] + population["medium"] * by_sev["medium"]["precision"]) / w, 3)
        out["precision_high_medium_weighted_note"] = (
            f"each severity weighted by its share of all {w} high and medium flags in the cache; rests on "
            f"{n_high} high and {n_med} medium flags with a confirmed label (medium interval {by_sev['medium']['ci95']})")
    else:
        out["precision_high_medium_weighted"] = None
        out["precision_high_medium_weighted_note"] = (
            f"not reported yet: only {n_med} medium flags have a confirmed label, {MIN_MEDIUM_FOR_HEADLINE} are needed "
            "(the pack starts with the lead and high flags, so early results say little about medium ones)")
    if out["disputed_rows"] or out["unsure_rows"]:
        out["excluded_note"] = (
            f"{out['disputed_rows']} disputed and {out['unsure_rows']} unsure clauses are left out of every precision "
            "figure above. Reviewers disagree on the disputed ones, so quote their count next to the precision.")

    rate = _rate(fn, len(controls))
    out["control_clauses"] = {
        "checked": rate["n"], "judged_restrictive": rate["k"], "false_negative_rate": rate["rate"], "ci95": rate["ci95"],
        "note": "clauses the system read and did not flag; the rate is the share of them a human called "
                "restrictive. Clauses the system never extracted are not covered."}
    out["recall"] = None
    out["recall_note"] = ("not reported: flagged clauses are over-sampled in the labelled set, so tp / (tp + fn) "
                          "would overstate recall. Use control_clauses.false_negative_rate.")

    reviews = load_reviews()
    if reviews:
        by_key = {key_of(r): r for r in all_rows}
        per = {}
        for name, ans in sorted(reviews.items()):
            dec = [(by_key[k], v) for k, v in ans.items() if k in by_key and v["answer"] != "unsure"]
            hm_r = [(r, v) for r, v in dec if yes(r, "system_flagged") and sev(r) in ("high", "medium")]
            ct_r = [(r, v) for r, v in dec if not yes(r, "system_flagged")]
            p, c = _rate(sum(1 for _, v in hm_r if v["answer"] == "yes"), len(hm_r)), \
                _rate(sum(1 for _, v in ct_r if v["answer"] == "yes"), len(ct_r))
            per[name] = {"answered": len(ans), "yes": sum(1 for v in ans.values() if v["answer"] == "yes"),
                         "no": sum(1 for v in ans.values() if v["answer"] == "no"),
                         "unsure": sum(1 for v in ans.values() if v["answer"] == "unsure"),
                         "opened_ai_note_before_answering": sum(1 for v in ans.values() if v.get("opened_ai")),
                         "precision_high_medium": p["rate"], "high_medium_flags_decided": p["n"],
                         "control_false_negative_rate": c["rate"], "controls_decided": c["n"]}
        out["reviewers"] = per
        out["agreement"] = [{"reviewers": [a, b], **_agreement(reviews[a], reviews[b])}
                            for a, b in combinations(sorted(reviews), 2) if set(reviews[a]) & set(reviews[b])]
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["build", "import", "score"])
    ap.add_argument("files", nargs="*", help="for import: labels_{name}.json files exported from the label pack")
    ap.add_argument("--json", action="store_true", help="score: print one JSON object")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    if a.cmd == "build":
        rows = build()
        print(f"{len(rows)} candidate labels for {len({str(r['lot_id']) for r in rows})} specs -> {PATH}")
        print("All new rows are 'assistant-proposed'. A human must confirm them before any accuracy is claimed.")
    elif a.cmd == "import":
        if not a.files:
            ap.error("import needs at least one exported .json file")
        failed = 0
        for f in a.files:
            try:
                res = import_file(f)
            except (ValueError, OSError) as e:
                print(f"SKIPPED {e}")
                failed += 1
                continue
            print(f"{res['file']}: reviewer {res['reviewer']!r}, {res['imported']} answers imported "
                  f"({res['new']} new, {res['changed']} changed), {res['reviewer_total']} in total for this reviewer")
            if res["malformed_skipped"]:
                print(f"  {res['malformed_skipped']} malformed answers skipped")
            if res["unknown_clause_ids"]:
                print(f"  {len(res['unknown_clause_ids'])} clause ids not in {PATH.name}, skipped: "
                      f"{', '.join(res['unknown_clause_ids'][:5])}")
        print(f"labels: {PATH}\nreviews: {REVIEWS}\nNext: python -m engine.evalset score")
        return 1 if failed else 0
    else:
        res = score()
        if a.json:
            print(json.dumps(res, ensure_ascii=False, indent=2))
        else:
            for k, v in res.items():
                if isinstance(v, dict) and v and all(isinstance(x, dict) for x in v.values()):
                    print(f"{k}:")
                    for kk, vv in v.items():
                        print(f"  {kk}: {vv}")
                elif isinstance(v, list):
                    print(f"{k}:")
                    for x in v:
                        print(f"  {x}")
                else:
                    print(f"{k}: {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
