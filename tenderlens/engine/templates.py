"""Platform-template criteria: standard criterion wording that many open lots share.

    python -m engine.templates          # print the findings (they are also written into stats.json)

A government-side view: one template criterion that does not fit the subject shows up in
many tenders at once, so fixing the template fixes all of them.

Counting which lots share a label is exact. Deciding that a criterion "does not apply"
to a lot is a keyword rule on the lot's title and product category, stated in each
finding as `rule`. It is a screening estimate for a person to check, not a verdict.
"""
from __future__ import annotations

import json
import re
import statistics
import sys
from collections import Counter, defaultdict

from . import config as C
from . import uzex

FOOD = (r"озиқ-овқат|озик-овкат|oziq-ovqat|овқатлан|овкатлан|ovqatlan|иссиқ овқат|иссик овкат|issiq ovqat|"
        r"продукт\w* питани|питани|гўшт|гушт|go.sht|мясо|мясн|молок|молоч|\bсут\b|\bsut\b|\bнон\b|\bnon\b|"
        r"парранда|parranda|чорва|chorva|балиқ|baliq|\bрыб|тухум|tuxum|\bяйц|ем-хашак|\byem\b|\bкорм|"
        r"сабзавот|sabzavot|\bмева|\bmeva|\bун\b|\bun\b|шакар|shakar|гуруч|guruch|ветеринар|veterinar|"
        r"ҳайвон|hayvon|животн")
PLAIN_SERVICES = (r"овқат|овкат|ovqat|питани|аутсорсинг|autsorsing|тозалаш|tozalash|уборк|клининг|"
                  r"ташиш|tashish|перевоз|транспорт хизмат|transport xizmat|қўриқлаш|qo.riqlash|охран|"
                  r"суғурта|sug.urta|страхован|баҳолаш|baholash|оценк|ижара|ijara|аренд|"
                  r"чиқинди|chiqindi|отход|кир ювиш|стирк")

# (key, pattern that identifies the template label, what it means, rule: the criterion is taken
#  as not applicable when the lot subject does / does not match `subject`)
FINDINGS = [
    {"key": "veterinary_control",
     "match": r"ветеринария хизмати назорати",
     "title_uz": "«Davlat veterinariya xizmati nazorati ostidagi mahsulotlar» mezoni",
     "title_en": "Criterion on products under state veterinary control",
     "applies_when": FOOD, "mode": "applies_only_if",
     "rule": "taken as not applicable when the lot's title and product category contain no food, "
             "feed or animal-product word",
     "caveat_uz": "Bu mezon matni to'rt turdagi mahsulotni birlashtiradi (veterinariya nazorati, majburiy muvofiqlik "
                  "baholash, ekologik sertifikatlash, sanitariya xulosasi). Shuning uchun dastgoh yoki sement kabi "
                  "tovarlarda u muvofiqlik sertifikati uchun qo'llanayotgan bo'lishi mumkin. Ishtirokchi ball "
                  "yo'qotadimi, komissiya mezonni qanday qo'llashiga bog'liq.",
     "caveat_en": "The label bundles four kinds of products (veterinary control, mandatory conformity assessment, "
                  "eco-certification, sanitary conclusion). For goods such as machine tools or cement it may be "
                  "used for the conformity certificate. Whether a bidder loses points depends on how the "
                  "commission applies it."},
    {"key": "staff_training",
     "match": r"ходимларини бажарилган ишлар ва кўрсатилган хизматлар юзасидан ижрочи томонидан техник ўқитиш",
     "title_uz": "«Buyurtmachi xodimlarini ijrochi tomonidan texnik o'qitish» mezoni",
     "title_en": "Criterion on technical training of the customer's staff by the contractor",
     "applies_when": PLAIN_SERVICES, "mode": "not_applicable_if",
     "rule": "taken as not applicable when the lot is catering, cleaning, transport, guarding, "
             "insurance, valuation, rent or waste removal",
     "caveat_uz": "Kalit so'zlar bo'yicha qo'pol saralash: ro'yxatga faqat mezon aniq mos kelmaydigan xizmat turlari "
                  "kiritilgan, boshqa lotlarda ham mos kelmasligi mumkin.",
     "caveat_en": "A rough keyword screen: only service types where the criterion plainly does not fit are counted; "
                  "it may not fit other lots either."},
    {"key": "intellectual_property",
     "match": r"интеллектуал мулк объектларига нисбатан мутлақ ҳуқуқларни",
     "title_uz": "«Intellektual mulk obyektlariga mutlaq huquqlarni topshirish» mezoni",
     "title_en": "Criterion on transferring exclusive intellectual-property rights to the customer",
     "applies_when": PLAIN_SERVICES, "mode": "not_applicable_if",
     "rule": "taken as not applicable when the lot is catering, cleaning, transport, guarding, "
             "insurance, valuation, rent or waste removal",
     "caveat_uz": "Kalit so'zlar bo'yicha qo'pol saralash: ro'yxatga faqat mezon aniq mos kelmaydigan xizmat turlari "
                  "kiritilgan, boshqa lotlarda ham mos kelmasligi mumkin.",
     "caveat_en": "A rough keyword screen: only service types where the criterion plainly does not fit are counted; "
                  "it may not fit other lots either."},
]


def _clean(s) -> str:
    return re.sub(r"\s+", " ", str(s or "")).strip()


def _lots() -> list[dict]:
    rows = uzex.saved_trade_rows()
    out = []
    for p in C.RAW_GETTRADE.glob("*.json"):
        g = uzex.read_json(p)
        try:
            bp = json.loads(g.get("budget_products") or "[]")
        except Exception:
            bp = []
        first = bp[0] if bp else {}
        title = _clean(rows.get(int(g["id"]), {}).get("name") or first.get("Description"))
        out.append({"lot_id": int(g["id"]), "title": title,
                    "category": _clean(first.get("Category_Name")),
                    "subject": f"{title} {_clean(first.get('Product_Name'))} {_clean(first.get('Category_Name'))} "
                               f"{_clean(first.get('Description'))}".lower(),
                    "start_cost": g.get("start_cost") or 0, "currency": g.get("currency_codeabc") or "UZS",
                    "fields": g.get("js_fields") or []})
    return out


def template_labels(min_lots: int = 10) -> list[dict]:
    """Every criterion label used by at least `min_lots` open lots (plain counts)."""
    by: dict[str, set] = defaultdict(set)
    for lot in _lots():
        for f in lot["fields"]:
            if _clean(f.get("label")):
                by[_clean(f["label"])].add(lot["lot_id"])
    return [{"label": k, "lots": len(v)} for k, v in sorted(by.items(), key=lambda kv: -len(kv[1]))
            if len(v) >= min_lots]


def findings() -> list[dict]:
    lots = _lots()
    out = []
    for spec in FINDINGS:
        rx, subj = re.compile(spec["match"], re.I), re.compile(spec["applies_when"], re.I)
        hit, label = [], ""
        for lot in lots:
            fs = [f for f in lot["fields"] if rx.search(_clean(f.get("label")))]
            if not fs:
                continue
            label = label or _clean(fs[0].get("label"))
            match = bool(subj.search(lot["subject"]))
            not_applicable = (not match) if spec["mode"] == "applies_only_if" else match
            hit.append({"lot_id": lot["lot_id"], "title": lot["title"][:120], "category": lot["category"],
                        "max_score": sum(f.get("max_score") or 0 for f in fs),
                        "start_cost": lot["start_cost"], "currency": lot["currency"],
                        "likely_not_applicable": not_applicable})
        if not hit:
            continue
        na = [h for h in hit if h["likely_not_applicable"]]
        cats = Counter(h["category"] or "(toifa ko'rsatilmagan)" for h in hit)
        out.append({
            "key": spec["key"], "title_uz": spec["title_uz"], "title_en": spec["title_en"],
            "label": label,
            "lots": len(hit), "lot_ids": sorted(h["lot_id"] for h in hit),
            "likely_not_applicable": len(na),
            "likely_not_applicable_lot_ids": sorted(h["lot_id"] for h in na),
            "likely_not_applicable_value_uzs": round(sum(h["start_cost"] for h in na if h["currency"] == "UZS"), 2),
            "median_points_under_label": statistics.median(h["max_score"] for h in hit),
            "categories": [{"category": c, "lots": n} for c, n in cats.most_common(8)],
            "examples": [{"lot_id": h["lot_id"], "title": h["title"], "max_score": h["max_score"]}
                         for h in sorted(na, key=lambda h: -h["max_score"])[:6]],
            "named_in_customer_note": sum(1 for lot in lots for f in lot["fields"]
                                           if rx.search(_clean(f.get("label"))) and rx.search(_clean(f.get("description")))),
            "rule": spec["rule"], "caveat_uz": spec["caveat_uz"], "caveat_en": spec["caveat_en"],
            "note_uz": "Mezon nechta lotda uchrashi aniq hisoblangan. «Mos kelmasligi mumkin» soni lot nomi va "
                       "toifasidagi kalit so'zlar bo'yicha taxminiy hisob, inson tekshiruvi talab etiladi.",
            "points_note_en": "Points are those scored under this label. Customers often reuse a template label "
                              "and score something else in their own note, so read the note before quoting points.",
            "note_en": "The lot count is exact. The 'likely not applicable' count is a keyword estimate on "
                       "lot titles and categories and needs a human check.",
        })
    return out


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    for f in findings():
        print(f"{f['key']}: {f['lots']} lots, likely not applicable in {f['likely_not_applicable']} "
              f"(UZS {f['likely_not_applicable_value_uzs']:,.0f}); median points under the label {f['median_points_under_label']}")
        for c in f["categories"][:5]:
            print("     ", c["lots"], c["category"][:90])
        for e in f["examples"]:
            print("   e.g.", e["lot_id"], e["max_score"], e["title"][:80])
    print(len(template_labels()), "labels are used by 10 or more open lots")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
