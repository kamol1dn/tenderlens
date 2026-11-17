"""One lot, end to end: snapshot -> text -> lint -> verified flags -> score -> cache.

    python -m engine.analyze 524784            # analyse (uses cache and saved files when present)
    python -m engine.analyze 524784 --offline  # never touch the network
    python -m engine.analyze --rebuild         # rebuild cache for every lot that has lint output
    python -m engine.analyze --index           # rewrite index.json, stats.json, customers/*.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime

from . import config as C
from . import extract as X
from . import lint as L
from . import score as SC
from . import stats as S
from . import uzex


class LotNotFound(LookupError):
    pass


SECTOR_RULES = [
    ("food", r"овқат|овкат|ovqat|питани|озиқ|oziq|нон |non |гўшт|go'sht|мясо|сут |sut |аутсорсинг хизмат|autsorsing|ошхона|oshxona|продукт"),
    ("health", r"тиббий|tibbiy|медицин|дори|dori|лекарств|шифохона|shifoxona|клиник|klinik|соғлиқ|sog'liq|больниц|реагент|стоматолог"),
    ("education", r"мактаб|maktab|школ|таълим|ta'lim|ta’lim|боғча|bog'cha|университет|universitet|дарслик|darslik|учебн"),
    ("construction", r"қурилиш|qurilish|строит|таъмир|ta'mir|ta’mir|ремонт|реконструк|rekonstruk|йўл |yo'l |асфальт|бетон|beton|цемент|sement|ободонлаштир|obodonlashtir"),
    ("it", r"компьютер|kompyuter|дастурий|dasturiy|программн|сервер|server|ахборот тизим|axborot tizim|рақамли|raqamli|ноутбук|noutbuk|принтер|printer|лиценз.*дастур|software|IT "),
]


def sector_of(title: str, extra: str = "") -> str:
    t = f"{title} {extra}".lower()
    for name, pat in SECTOR_RULES:
        if re.search(pat, t):
            return name
    return "other"


CUSTOMER_HEALTH = re.compile(r"тиббий|tibbi|медицин|шифохона|shifoxona|клиник|klinik|соғлиқ|соглик|sog.liq|касаллик|kasallik|больниц|поликлиник|poliklinik|санатор|sanator", re.I)
CUSTOMER_EDU = re.compile(r"мактаб|maktab|таълим|ta.lim|университет|universitet|институт|institut|боғча|bog.cha|коллеж|kollej|лицей|litsey|ммтм|мтт\b|mtt\b|дмтт|академия|akademiya", re.I)


def customer_sector(name: str, title: str = "") -> str:
    """Who is buying: health, education or other. A keyword rule on the customer's name and the lot title."""
    t = f"{name} {title}"
    if CUSTOMER_HEALTH.search(t):
        return "health"
    if CUSTOMER_EDU.search(t):
        return "education"
    return "other"


JOINT_VENTURE = re.compile(r"\bQK\b|\bҚК\b|\bСП\b|qo.shma korxona|қўшма корхона|совместное предприятие", re.I)


def customer_kind(name: str, tin: str) -> str:
    """budget | corporate | joint_venture | unknown.

    budget / corporate come from the platform's own customer type in DealsList. A corporate
    customer whose name carries the joint-venture form (QK, qo'shma korxona, СП) is marked
    joint_venture, so a state-side screen can leave it out. Corporate includes state-owned companies.
    """
    kind = S.kind_of(tin)
    if kind != "budget" and JOINT_VENTURE.search(name or ""):
        return "joint_venture"
    return kind


def lot_type(g: dict, row: dict | None) -> str:
    if row and row.get("type_id") in C.TYPE_NAMES:
        return C.TYPE_NAMES[row["type_id"]]
    return "tender" if "tender" in (g.get("type_name") or "").lower() else "selection"


def lot_title(g: dict, row: dict | None) -> str:
    t = (row or {}).get("name") or ""
    if not t.strip():
        try:
            p = json.loads(g.get("budget_products") or "[]")[0]
            t = p.get("Description") or p.get("Product_Name") or ""
        except Exception:
            t = g.get("addon_description") or ""
    return re.sub(r"\s+", " ", t).strip()


def base_record(lot_id: int, g: dict, row: dict | None) -> dict:
    row = row or {}
    return {
        "lot_id": lot_id,
        "display_no": g.get("display_no") or row.get("display_no"),
        "title": lot_title(g, row),
        "url": C.LOT_URL.format(lot_id=lot_id),
        "customer": {"name": re.sub(r"\s+", " ", g.get("customer_name") or row.get("seller_name") or "").strip(),
                     "tin": str(g.get("customer_tin") or row.get("seller_tin") or "")},
        "region": (row.get("region_name") or g.get("customer_region_name") or "").strip(),
        "start_cost": g.get("start_cost") or row.get("cost") or 0,
        "currency": g.get("currency_codeabc") or row.get("currency_codeabc") or "UZS",
        "start_date": g.get("start_date"), "end_date": g.get("end_date"),
        "clarific_date": g.get("clarific_date"),
        "type": lot_type(g, row),
        "old_id": g.get("old_id"),
        "evaluation": {
            "tech_coef": g.get("tech_coef"), "cost_coef": g.get("cost_coef"), "min_point": g.get("min_point"),
            "criteria": [{"label": re.sub(r"\s+", " ", f.get("label") or "").strip(),
                          "max_score": f.get("max_score"), "rate": f.get("rate_name")}
                         for f in (g.get("js_fields") or [])],
        },
    }


def analyze(lot_id: int, *, offline: bool = False, use_llm: bool = True, save: bool = True) -> dict:
    """Build the contract record for one lot. Raises LotNotFound or lint.LLMUnavailable."""
    lot_id = int(lot_id)
    raw = L.load_raw(lot_id)
    if raw is None and not (use_llm and L.llm_available()):
        # Fail fast, before any network call: without lint output and without a key
        # there is nothing to analyse.
        raise L.LLMUnavailable("this lot has not been analysed yet and ANTHROPIC_API_KEY is not set; "
                               "the LLM lint is paused")
    g = uzex.get_trade(lot_id, offline=offline)
    if not g:
        raise LotNotFound(f"lot {lot_id} is not in the snapshot" + ("" if offline else " and the API has no such lot"))
    row = uzex.saved_trade_rows().get(lot_id)
    if not offline:
        try:
            uzex.download_spec(lot_id, g)
        except Exception:
            pass                                    # analysed from whatever is on disk
    text = X.extract(lot_id)
    if raw is None:
        if text.get("status") != "ok" and text.get("unreadable_pages") and L.llm_available():
            text = L.transcribe_api(lot_id)         # scans: vision transcription first
        raw = L.run_api(lot_id)                     # raises LLMUnavailable without a key
    v = L.verify(lot_id, raw)

    rec = base_record(lot_id, g, row)
    spec = uzex.spec_path(lot_id)
    rec["spec"] = {"file": f"data/specs/{spec.name}" if spec else None, "pages": text.get("n_pages", 0),
                   "text_source": text.get("text_source", "none"), "language": text.get("language", "unknown"),
                   "unreadable_pages": text.get("unreadable_pages", [])}
    rec["subject_uz"] = v["subject_uz"]
    rec["sector"] = v["sector"] or sector_of(rec["title"])
    rec["customer_sector"] = customer_sector(rec["customer"]["name"], rec["title"])
    rec["customer_kind"] = customer_kind(rec["customer"]["name"], rec["customer"]["tin"])
    rec["financing_source"] = re.sub(r"\s+", " ", g.get("financing_source") or "").strip() or None
    rec["requirements"] = v["requirements"]
    for f in v["flags"]:
        f["type_label_uz"], f["type_label_en"] = SC.TYPE_UZ[f["type"]], SC.TYPE_EN[f["type"]]
        f["category_uz"], f["category_en"] = SC.CATEGORY_UZ, SC.CATEGORY_EN
    rec["flags"] = v["flags"]
    rec["dropped_unverified"] = len([d for d in v["dropped"] if d["what"] == "flag"])
    cs = S.for_customer(rec["customer"]["tin"])
    rec.update(SC.fairness(rec["flags"], cs))
    rec["verdict"] = SC.verdict(rec["fairness_score"], rec["flags"], cs, rec, text)
    rec["documents_needed_uz"] = SC.documents_needed(g, v["documents_needed_uz"])
    rec["clarification_letter_uz"] = SC.clarification_letter(rec, rec["flags"])
    rec["customer_stats"] = cs
    mot, basis = S.estimate_for_lot(rec["start_cost"], rec["currency"], rec["customer"]["tin"])
    rec["money_on_table_uzs"] = mot
    rec["money_on_table_basis"] = basis             # always an estimate; see README
    rec["context"] = {"reannounced": bool(rec["old_id"]),
                      "window_days": _days(rec["start_date"], rec["end_date"])}
    rec["analyzed_at"] = datetime.now().astimezone().isoformat(timespec="seconds")
    rec["model"] = v.get("model") or "unknown"
    rec["lint_backend"] = v.get("backend") or "unknown"
    _scrub(rec)
    if save:
        uzex.write_json(C.CACHE_LOTS / f"{lot_id}.json", rec)
    return rec


NEUTRAL_DOC = "Halollik va manfaatlar to'qnashuvi yo'qligi to'g'risidagi kafolat xati (platformadagi shakl bo'yicha)"


def _scrub(rec: dict) -> None:
    """Wording rule for text TenderLens generates. Never raises, never touches verbatim source text.

    Checked: requirement summaries, the document list, the subject line. (Flag explanations and
    rewrites were already checked in lint.verify.) Titles, criteria labels and quotes are the
    customer's own published words and stay as they are.
    """
    rec["requirements"] = [r for r in rec["requirements"]
                           if not L.BANNED.search(f"{r['summary_uz']} {r['summary_en']}")]
    for i, r in enumerate(rec["requirements"], 1):
        r["id"] = f"r{i}"
    docs: list[str] = []
    for d in rec["documents_needed_uz"]:
        d = NEUTRAL_DOC if L.BANNED.search(d) else d
        if d not in docs:
            docs.append(d)
    rec["documents_needed_uz"] = docs
    if L.BANNED.search(rec.get("subject_uz") or ""):
        rec["subject_uz"] = ""


def _days(a: str | None, b: str | None) -> float | None:
    try:
        return round((datetime.fromisoformat(b) - datetime.fromisoformat(a)).total_seconds() / 86400, 1)
    except Exception:
        return None


def summary_of(rec: dict) -> dict:
    return {"lot_id": rec["lot_id"], "title": rec["title"], "customer_name": rec["customer"]["name"],
            "customer_tin": rec["customer"]["tin"], "start_cost": rec["start_cost"], "currency": rec["currency"],
            "end_date": rec["end_date"], "type": rec["type"], "fairness_score": rec["fairness_score"],
            "traffic_light": rec["traffic_light"], "flag_count": len(rec["flags"]),
            "money_on_table_uzs": rec["money_on_table_uzs"], "sector": rec["sector"],
            "region": rec.get("region"), "customer_sector": rec.get("customer_sector", "other"),
            "customer_kind": rec.get("customer_kind", "unknown"), "finding_count": rec.get("finding_count", len(rec["flags"])),
            "verdict": rec["verdict"]["decision"],
            "top_flag_type": rec["flags"][0]["type"] if rec["flags"] else None}


def rebuild_index() -> list[dict]:
    rows = [summary_of(uzex.read_json(p)) for p in sorted(C.CACHE_LOTS.glob("*.json"))]
    rows.sort(key=lambda r: (r["fairness_score"], -(r["start_cost"] or 0)))
    uzex.write_json(C.CACHE / "index.json", rows)
    S.write_cache(rows)
    return rows


def cached(lot_id: int) -> dict | None:
    p = C.CACHE_LOTS / f"{int(lot_id)}.json"
    return uzex.read_json(p) if p.exists() else None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("lot", nargs="*")
    ap.add_argument("--offline", action="store_true")
    ap.add_argument("--rebuild", action="store_true")
    ap.add_argument("--index", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    ids = [uzex.lot_id_from(x) for x in a.lot]
    if a.rebuild:
        ids = sorted(int(p.stem) for p in C.LINT.glob("*.json"))
        a.offline = True
    for lid in ids:
        try:
            rec = analyze(lid, offline=a.offline)
        except L.LLMUnavailable as e:
            print(f"{lid}: PAUSED, {e}")
            continue
        except LotNotFound as e:
            print(f"{lid}: {e}")
            continue
        except Exception as e:                       # one bad lot must not stop a rebuild
            print(f"{lid}: FAILED {type(e).__name__}: {str(e)[:120]}")
            continue
        if a.json:
            print(json.dumps(rec, ensure_ascii=False, indent=1))
            continue
        print(f"{lid}  {rec['traffic_light'].upper():5} {rec['fairness_score']:3}  {rec['verdict']['decision']:22} "
              f"flags={len(rec['flags'])} dropped={rec['dropped_unverified']}  {rec['title'][:60]}")
        for f in rec["flags"]:
            print(f"      [{f['severity']}] {f['type']} p{f['page']}: «{f['quote'][:100]}»")
    if ids or a.index or a.rebuild:
        rows = rebuild_index()
        print(f"index: {len(rows)} lots, {sum(1 for r in rows if r['flag_count'])} with flags")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
