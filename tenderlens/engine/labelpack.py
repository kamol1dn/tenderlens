"""Offline label pack: one self-contained HTML file for reviewers on their own laptops.

    python -m engine.labelpack            # write data/eval/label_pack.html + label_pack_manifest.json
    python -m engine.labelpack --check    # only run the name-leak check on the existing file

About 100 clauses, in one fixed order for everybody (so two reviewers who stop early still overlap):
    lead      every flag on the lead demo lots
    high      every other high flag
    medium / low   a seeded sample, spread over flag types in proportion to how common each type is
    control   clauses the lint read and did NOT flag (qualification / evaluation requirements),
              spread through the pack; they show whether restrictive clauses are being missed

The page hides whether a clause was flagged until the reviewer opens "AI izohi", and the export says
whether they opened it before answering. Customer names, TINs, raw titles and contact details are
not embedded at all; names inside quotes and context are masked at build time (engine/mask.py) and
the finished file is checked for leaks. Answers come back through `python -m engine.evalset import`.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

from . import config as C
from . import evalset as E
from . import lint as L
from . import mask as M
from . import score as SC
from . import uzex

OUT = C.EVAL / "label_pack.html"
MANIFEST = C.EVAL / "label_pack_manifest.json"
TEMPLATE = Path(__file__).with_name("labelpack_template.html")
LEADS = [524954, 525192, 524769]
SEED = 20261118
TARGET = 100
N_CONTROL = 15
LOW_SHARE = 0.3                      # of the sampled medium + low flags
CONTEXT_CHARS = 380
# Subjects that describe the customer in another language than its registered name, which the
# automatic masking cannot see. Found by reading all subjects of the pack; the prefix is dropped.
SUBJECT_STRIP = {518733: "Milliy metrologiya instituti uchun "}
SECTOR_UZ = {"health": "Sog‘liqni saqlash", "education": "Ta’lim", "construction": "Qurilish", "it": "IT",
             "food": "Oziq-ovqat", "other": "Boshqa"}


def _record(lot_id) -> dict:
    p = C.CACHE_LOTS / f"{lot_id}.json"
    return uzex.read_json(p) if p.exists() else {}


def _value(rec: dict) -> str:
    n, cur = rec.get("start_cost") or 0, rec.get("currency") or "UZS"
    if not n:
        return ""
    if cur != "UZS":
        return f"{n:,.0f} {cur}".replace(",", " ")
    for size, word in ((1e9, "mlrd"), (1e6, "mln")):
        if n >= size:
            return f"{n / size:.2f}".rstrip("0").rstrip(".").replace(".", ",") + f" {word} so‘m"
    return f"{n:,.0f} so‘m".replace(",", " ")


def _proportional(groups: dict[str, list], n: int) -> dict[str, int]:
    """Seats per group in proportion to group size (largest remainder), at least one each if n allows."""
    total = sum(len(v) for v in groups.values())
    n = min(n, total)
    names = sorted(groups)
    if not n:
        return {g: 0 for g in names}
    seats = {g: (1 if n >= len(names) else 0) for g in names}
    left = n - sum(seats.values())
    quota = {g: left * len(groups[g]) / total for g in names}
    for g in names:
        seats[g] = min(len(groups[g]), seats[g] + int(quota[g]))
    order = sorted(names, key=lambda g: (-(quota[g] - int(quota[g])), g))
    i = 0
    while sum(seats.values()) < n and i < 10 * len(names):
        g = order[i % len(names)]
        if seats[g] < len(groups[g]):
            seats[g] += 1
        i += 1
    return seats


def _sample(rows: list[dict], n: int, rng: random.Random, used_lots: Counter) -> list[dict]:
    """n rows spread over flag types in proportion, preferring lots not yet in the pack."""
    groups: dict[str, list] = defaultdict(list)
    for r in rows:
        groups[r["proposed_type"]].append(r)
    picked: list[dict] = []
    for g, k in _proportional(groups, n).items():
        pool = sorted(groups[g], key=E.key_of)
        rng.shuffle(pool)
        pool.sort(key=lambda r: used_lots[r["lot_id"]])          # stable: fresh lots first
        for r in pool[:k]:
            picked.append(r)
            used_lots[r["lot_id"]] += 1
    return picked


def select() -> list[dict]:
    """The clauses of the pack, in display order. Each is a labels.csv row plus 'role'."""
    rng = random.Random(SEED)
    rows = E.read()
    by_lot_flags: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        if r["system_flagged"] == "yes":
            by_lot_flags[r["lot_id"]].append(L.norm(r["clause_quote"]))
    sev_rank = {"high": 0, "medium": 1, "low": 2, "": 3}
    lead_rank = {str(l): i for i, l in enumerate(LEADS)}
    rows.sort(key=lambda r: (lead_rank.get(r["lot_id"], 9), sev_rank[r["proposed_severity"]], int(r["lot_id"]), E.key_of(r)))
    seen: set[str] = set()                       # the same wording in several template lots is asked once
    flags, plain = [], []
    for r in rows:
        q = L.norm(r["clause_quote"])
        if q in seen:
            continue
        seen.add(q)
        (flags if r["system_flagged"] == "yes" else plain).append(r)

    lead = [dict(r, role="lead") for r in flags if r["lot_id"] in lead_rank]
    high = [dict(r, role="high") for r in flags if r["lot_id"] not in lead_rank and r["proposed_severity"] == "high"]
    used = Counter(r["lot_id"] for r in lead + high)
    rest = [r for r in flags if r["lot_id"] not in lead_rank and r["proposed_severity"] in ("medium", "low")]
    budget = max(0, TARGET - N_CONTROL - len(lead) - len(high))
    n_low = round(budget * LOW_SHARE)
    medium = [dict(r, role="medium") for r in
              _sample([r for r in rest if r["proposed_severity"] == "medium"], budget - n_low, rng, used)]
    low = [dict(r, role="low") for r in
           _sample([r for r in rest if r["proposed_severity"] == "low"], n_low, rng, used)]

    kinds = {}                                    # (lot, normalised quote) -> requirement kind
    for lot_id in {r["lot_id"] for r in plain}:
        for req in _record(lot_id).get("requirements") or []:
            kinds[(lot_id, L.norm(req.get("quote") or ""))] = req.get("kind")

    def usable(r: dict) -> bool:
        q = L.norm(r["clause_quote"])
        if len(q) < 30 or kinds.get((r["lot_id"], q)) not in ("qualification", "evaluation"):
            return False
        return not any(q in f or f in q for f in by_lot_flags[r["lot_id"]])

    pool = sorted((r for r in plain if usable(r)), key=E.key_of)
    rng.shuffle(pool)
    controls, lots_done = [], set()
    for lot in map(str, LEADS):                   # one control from each lead lot, shown early
        c = next((r for r in pool if r["lot_id"] == lot), None)
        if c:
            controls.append(c)
            lots_done.add(lot)
    for r in pool:
        if len(controls) >= N_CONTROL:
            break
        if r["lot_id"] not in lots_done:
            controls.append(r)
            lots_done.add(r["lot_id"])
    controls = [dict(r, role="control") for r in controls]

    tail = medium + low
    rng.shuffle(tail)
    flagged = lead + high + tail
    out, ci = [], 0
    step = len(flagged) / max(1, len(controls))
    slots = {min(len(flagged) - 1, int(step * k + rng.uniform(0.25, 0.75) * step)) for k in range(len(controls))}
    for i, r in enumerate(flagged):
        out.append(r)
        if i in slots and ci < len(controls):
            out.append(controls[ci])
            ci += 1
    out += controls[ci:]
    return out


def _trim(text: str, side: str) -> str:
    """Cut the context at a word boundary and mark the cut."""
    if side == "before":
        text = text[-CONTEXT_CHARS:]
        cut = text.find(" ")
        return ("… " + text[cut + 1:]) if len(text) == CONTEXT_CHARS and cut >= 0 else text
    text = text[:CONTEXT_CHARS]
    cut = text.rfind(" ")
    return (text[:cut] + " …") if len(text) == CONTEXT_CHARS and cut >= 0 else text


def _neutral(text: str) -> str:
    """Context only: a neighbouring line that carries a word TenderLens never prints is blanked.
    (Customers' forms often list an anti-bribery compliance criterion next to the clause shown.)"""
    return "\n".join("…" if L.BANNED.search(line) else line for line in text.split("\n"))


def _subject(lot_id: int, rec: dict, hide) -> str:
    s = rec.get("subject_uz") or ""
    cut = SUBJECT_STRIP.get(lot_id)
    if cut and s.startswith(cut):
        s = s[len(cut):]
        s = s[:1].upper() + s[1:]
    s = hide(s)
    real = [w for w in s.split() if len(w.strip("…,.;:()«»\"'")) > 1]
    return s if len(real) >= 3 else ""             # too little left to be useful: show sector and value only


def card(r: dict) -> tuple[dict, dict]:
    """(what the page embeds, what the leak check needs) for one clause."""
    lot_id, page = int(r["lot_id"]), int(r["page"] or 0)
    rec = _record(lot_id)
    cust = rec.get("customer") or {}
    name, tin = cust.get("name") or "", str(cust.get("tin") or "")
    hide = lambda s, orgs=True: M.mask_text(s, [name] if name else [], [tin] if tin else [], orgs=orgs)
    before, quote, after = E.context(lot_id, page, r["clause_quote"], width=CONTEXT_CHARS + 40)
    q = L.norm(r["clause_quote"])
    if r["system_flagged"] == "yes":
        f = next((f for f in rec.get("flags") or [] if L.norm(f.get("quote") or "") == q), {})
        ai_type = "AI belgilagan tur: " + (f.get("type_label_uz") or SC.TYPE_UZ.get(r["proposed_type"], r["proposed_type"]))
        ai_text = "AI izohi: " + (f.get("explanation_uz") or "izoh saqlanmagan.")
    else:
        req = next((x for x in rec.get("requirements") or [] if L.norm(x.get("quote") or "") == q), {})
        ai_type = "AI bu shartni cheklovchi deb belgilamagan."
        ai_text = "AI qisqa bayoni: " + (req.get("summary_uz") or "bayon saqlanmagan.")
    item = {
        "id": E.key_of(r), "lot_id": lot_id,
        "subject": _subject(lot_id, rec, hide),
        "sector": SECTOR_UZ.get(rec.get("sector") or "", ""),
        "value": _value(rec),
        "source": "platformadagi baholash mezonlari shakli" if page == 0 else f"texnik topshiriq, {page}-bet",
        "before": _neutral(hide(_trim(before, "before"))), "quote": hide(quote, orgs=False),
        "after": _neutral(hide(_trim(after, "after"))),
        "ai_type": hide(ai_type), "ai_text": hide(ai_text),
    }
    return item, {"name": name, "tin": tin, "quote_changed": item["quote"] != quote}


def leak_report(items: list[dict], private: list[dict], html: str) -> list[str]:
    problems = []
    for it, pv in zip(items, private):
        text = "\n".join(str(it[k]) for k in ("subject", "before", "quote", "after", "ai_type", "ai_text"))
        for leak in M.leaks(text, pv["name"], pv["tin"]):
            problems.append(f"{it['id']} lot {it['lot_id']}: {leak}")
        if pv["tin"] and pv["tin"] in html:
            problems.append(f"{it['id']} lot {it['lot_id']}: TIN present somewhere in the file")
        if pv["name"] and len(pv["name"]) > 3 and pv["name"].lower() in html.lower():
            problems.append(f"{it['id']} lot {it['lot_id']}: exact customer name present somewhere in the file")
    return sorted(set(problems))


def build() -> dict:
    chosen = select()
    built = [card(r) for r in chosen]
    items, private = [b[0] for b in built], [b[1] for b in built]
    if len({it["id"] for it in items}) != len(items):
        raise RuntimeError("duplicate clause ids in the pack")
    pack_id = hashlib.sha1("|".join(it["id"] for it in items).encode()).hexdigest()[:10]
    blob = json.dumps({"pack_id": pack_id, "items": items}, ensure_ascii=False, separators=(",", ":"))
    blob = blob.replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    tpl = TEMPLATE.read_text(encoding="utf-8")
    if tpl.count("/*__PACK__*/") != 1:
        raise RuntimeError("template placeholder missing")
    html = tpl.replace("/*__PACK__*/", blob)
    if L.BANNED.search(html):
        raise RuntimeError("a banned word is present in the pack")
    problems = leak_report(items, private, html)
    OUT.write_text(html, encoding="utf-8", newline="\n")
    roles = Counter(r["role"] for r in chosen)
    manifest = {
        "pack_id": pack_id, "built_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "seed": SEED, "file": OUT.name, "clauses": len(items), "lots": len({it["lot_id"] for it in items}),
        "roles": dict(roles),
        "flag_types": dict(Counter(r["proposed_type"] for r in chosen if r["system_flagged"] == "yes")),
        "quotes_changed_by_masking": [it["id"] for it, pv in zip(items, private) if pv["quote_changed"]],
        "leak_check": problems,
        "items": [{"order": i + 1, "id": it["id"], "lot_id": it["lot_id"], "role": r["role"],
                   "system_flagged": r["system_flagged"], "severity": r["proposed_severity"],
                   "type": r["proposed_type"], "page": int(r["page"] or 0)}
                  for i, (it, r) in enumerate(zip(items, chosen))],
    }
    uzex.write_json(MANIFEST, manifest)
    return manifest


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="re-run the leak check on the existing file")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    if a.check:
        html = OUT.read_text(encoding="utf-8")
        blob = html.split('<script id="pack" type="application/json">', 1)[1].split("</script>", 1)[0]
        items = json.loads(blob)["items"]
        private = []
        for it in items:
            c = _record(it["lot_id"]).get("customer") or {}
            private.append({"name": c.get("name") or "", "tin": str(c.get("tin") or "")})
        problems = leak_report(items, private, html)
        print(f"{len(items)} clauses checked, {len(problems)} possible leaks")
        for p in problems:
            print("  " + p)
        return 1 if problems else 0
    m = build()
    print(f"{m['clauses']} clauses from {m['lots']} lots -> {OUT}  ({OUT.stat().st_size // 1024} KB, pack {m['pack_id']})")
    print("roles:", m["roles"])
    print(f"quotes changed by masking: {len(m['quotes_changed_by_masking'])}")
    print(f"leak check: {len(m['leak_check'])} possible leaks")
    for p in m["leak_check"]:
        print("  " + p)
    return 1 if m["leak_check"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
