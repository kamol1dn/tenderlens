"""Fairness score, traffic light, verdict, document list and clarification letter.

Plain rules, no model: every number here can be recomputed by hand from the flags
and the customer's deal history. See engine/README.md, "Fairness score".
"""
from __future__ import annotations

import re

from . import stats as S

WEIGHTS = {"high": 40, "medium": 22, "low": 6}   # points taken per verified flag
CLAUSE_CAP = 85                                    # clauses alone never take more than this
HISTORY_MAX = 15                                   # the customer's history takes at most this
GREEN, AMBER = 80, 50                              # >=80 green, 50..79 amber, <50 red

TYPE_UZ = {
    "brand_no_equivalent": "Brend yoki model ko'rsatilgan, ekvivalentga ruxsat berilmagan",
    "narrow_params": "Haddan tashqari tor texnik parametrlar",
    "excessive_experience": "Lot hajmiga nomutanosib tajriba yoki resurs talabi",
    "excessive_financial": "Lot hajmiga nomutanosib moliyaviy talab",
    "dealer_letter": "Ishlab chiqaruvchi yoki diler xati talabi",
    "irrelevant_requirement": "Xarid predmetiga aloqasi bo'lmagan talab",
    "bundling": "Turli tovar yoki xizmatlar bitta lotga birlashtirilgan",
    "unrealistic_deadline": "Bajarish qiyin bo'lgan muddat",
    "short_window": "Taklif tayyorlash uchun qisqa muddat",
    "other": "Raqobatni cheklashi mumkin bo'lgan boshqa shart",
}
TYPE_EN = {
    "brand_no_equivalent": "Brand or model named with no equivalent allowed",
    "narrow_params": "Over-narrow technical parameters",
    "excessive_experience": "Experience or resource demand out of proportion to the lot",
    "excessive_financial": "Financial demand out of proportion to the lot",
    "dealer_letter": "Manufacturer or dealer letter required",
    "irrelevant_requirement": "Requirement unrelated to the subject of the purchase",
    "bundling": "Unrelated goods or services bundled in one lot",
    "unrealistic_deadline": "Deadline that is hard to meet",
    "short_window": "Short time to prepare a bid",
    "other": "Other clause that may limit competition",
}
# The only reference attached to a flag: the Competition Committee's own 2025 category.
# No law articles are cited until a lawyer has mapped them (report §5.11).
CATEGORY_UZ = "Muayyan ishtirokchilar uchun ustunlik yaratish (Raqobat qo'mitasi tasnifi, 2025)"
CATEGORY_EN = "Creation of advantages for specific bidders (Competition Committee category, 2025)"


def history_penalty(cs: dict) -> float:
    """0..HISTORY_MAX from the customer's past deals; 0 when fewer than 5 deals are known."""
    if not cs or cs.get("deals", 0) < S.MIN_DEALS:
        return 0.0
    mean = (cs["share_le2_bidders"] + cs["top_winner_share"] + cs["share_price_drop_lt1pct"]) / 3
    return round(HISTORY_MAX * mean, 1)


def findings(flags: list[dict]) -> list[int]:
    """Penalty per finding. Flags sharing a group_id restate one finding and count once, at the highest severity."""
    groups: dict[str, int] = {}
    for i, f in enumerate(flags):
        key = f.get("group_id") or f"_single_{i}"
        groups[key] = max(groups.get(key, 0), WEIGHTS[f["severity"]])
    return list(groups.values())


def fairness(flags: list[dict], cs: dict) -> dict:
    per_finding = findings(flags)
    clause = min(CLAUSE_CAP, sum(per_finding))
    hist = history_penalty(cs)
    score = int(round(max(0.0, 100 - clause - hist)))
    light = "green" if score >= GREEN else "amber" if score >= AMBER else "red"
    return {"fairness_score": score, "traffic_light": light, "finding_count": len(per_finding),
            "score_breakdown": {"start": 100, "clause_penalty": clause, "history_penalty": hist,
                                "weights": WEIGHTS, "thresholds": {"green": GREEN, "amber": AMBER}}}


def _d(iso: str | None) -> str:
    """2026-11-18T10:01:27 -> 18.11.2026 10:01"""
    m = re.match(r"(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)", iso or "")
    return f"{m[3]}.{m[2]}.{m[1]} {m[4]}:{m[5]}" if m else (iso or "")


def verdict(score: int, flags: list[dict], cs: dict, lot: dict, text: dict) -> dict:
    serious = [f for f in flags if f["severity"] in ("high", "medium")]
    if score < AMBER:
        decision = "skip"
    elif serious:
        decision = "bid_with_clarification"
    else:
        decision = "bid"
    uz, en = [], []
    if decision == "skip":
        uz.append("Hujjatda raqobatni jiddiy cheklashi mumkin bo'lgan bir nechta shart bor; "
                  "ularga aniqlik kiritilmaguncha qatnashish tavsiya etilmaydi.")
        en.append("The document holds several conditions that may seriously limit competition; "
                  "bidding is not advised until they are clarified.")
    elif decision == "bid_with_clarification":
        uz.append("Qatnashish mumkin, lekin avval quyidagi shartlar bo'yicha buyurtmachidan tushuntirish so'rang.")
        en.append("Worth bidding, but first ask the customer to clarify the conditions below.")
    else:
        uz.append("Hujjatda raqobatni cheklovchi jiddiy shart topilmadi.")
        en.append("No seriously restrictive condition was found in the document.")
    for f in flags:
        where_uz = "platformadagi mezonlar" if f["page"] == 0 else f"{f['page']}-bet"
        where_en = "platform criteria form" if f["page"] == 0 else f"page {f['page']}"
        uz.append(f"{TYPE_UZ[f['type']]} ({where_uz}): {f['explanation_uz']}")
        en.append(f"{TYPE_EN[f['type']]} ({where_en}): {f['explanation_en']}")
    if cs and cs.get("deals", 0) >= S.MIN_DEALS:
        uz.append(f"Buyurtmachining so'nggi {cs['deals']} ta savdosida ishtirokchilar medianasi "
                  f"{cs['median_bidders']:g} ta; savdolarning {cs['share_le2_bidders']:.0%} qismida ikki yoki undan kam "
                  f"ishtirokchi; eng ko'p g'olib bo'lgan yetkazib beruvchi ulushi {cs['top_winner_share']:.0%}.")
        en.append(f"In the customer's last {cs['deals']} deals the median number of bidders was "
                  f"{cs['median_bidders']:g}; {cs['share_le2_bidders']:.0%} of deals had two or fewer bidders; "
                  f"the most frequent winner took {cs['top_winner_share']:.0%}.")
    if lot.get("old_id"):
        uz.append(f"Lot qayta e'lon qilingan (avvalgi lot: {lot['old_id']}).")
        en.append(f"This lot was re-announced (previous lot: {lot['old_id']}).")
    if serious and lot.get("clarific_date"):
        uz.append(f"Tushuntirish so'rash muddati: {_d(lot['clarific_date'])}.")
        en.append(f"Clarification requests are accepted until {_d(lot['clarific_date'])}.")
    unread = text.get("unreadable_pages") or []
    if unread:
        uz.append(f"Diqqat: hujjatning {len(unread)} ta sahifasi mashina o'qiy olmaydigan skan, ular tahlil qilinmadi.")
        en.append(f"Note: {len(unread)} page(s) of the document are scans without readable text and were not analysed.")
    return {"decision": decision, "reasons_uz": uz, "reasons_en": en}


def documents_needed(g: dict, from_model: list[str]) -> list[str]:
    """Documents the platform form marks as required files, then the model's list, de-duplicated."""
    out: list[str] = []
    seen: set[str] = set()

    def add(s: str) -> None:
        s = re.sub(r"\s+", " ", s or "").strip(" .;")
        k = s.casefold()
        if len(s) >= 4 and k not in seen:
            seen.add(k)
            out.append(s)

    for d in from_model:
        add(d)
    generic = {"маълумот", "malumot", "ma'lumot", "файл", "fayl", "file", "маълумотлар"}
    for f in g.get("js_fields") or []:
        name = re.sub(r"\s+", " ", f.get("file_name") or "").strip()
        if f.get("is_file_required") and name and name.casefold() not in generic:
            add(name)
    return out[:25]


def clarification_letter(lot: dict, flags: list[dict]) -> str:
    """Formal request for clarification, Uzbek (Latin). Built only from verified flags."""
    if not flags:
        return ""
    items = []
    for i, f in enumerate(flags, 1):
        where = ("Elektron tizimdagi baholash mezonlari" if f["page"] == 0
                 else f"Texnik topshiriq, {f['page']}-bet")
        items.append(
            f"{i}. {where}.\n"
            f"   Hujjatdagi matn: «{f['quote']}»\n"
            f"   Savolimiz: {f['explanation_uz']}\n"
            f"   Taklif etilayotgan tahrir: {f['rewrite_uz']}")
    return (
        f"Kimga: {lot['customer']['name']}, xarid komissiyasiga\n"
        f"Lot raqami: {lot.get('display_no') or lot['lot_id']}\n"
        f"Xarid predmeti: {lot['title']}\n"
        f"Mavzu: xarid hujjatlari bo'yicha tushuntirish berish to'g'risida so'rov\n\n"
        "Hurmatli xarid komissiyasi a'zolari!\n\n"
        "Tashkilotimiz mazkur lot bo'yicha xarid hujjatlari bilan tanishib chiqdi va taklif berish niyatida. "
        "Hujjatlardagi quyidagi shartlar bo'yicha tushuntirish berishingizni, zarur deb topilgan taqdirda esa "
        "ularga tegishli o'zgartirish kiritishingizni so'raymiz.\n\n"
        + "\n\n".join(items) + "\n\n"
        "Mazkur shartlarga aniqlik kiritilishi xarid predmetini yetkazib bera oladigan barcha ishtirokchilarning "
        "teng sharoitda qatnashishiga va raqobatning kengayishiga xizmat qiladi, deb hisoblaymiz.\n\n"
        f"Javobingizni tushuntirishlar berish muddati tugagunga qadar ({_d(lot.get('clarific_date'))}) "
        "elektron tizim orqali taqdim etishingizni so'raymiz.\n\n"
        "Hurmat bilan,\n"
        "[Tashkilot nomi, STIR]\n"
        "[Rahbarning F.I.Sh. va imzosi]\n"
        "[Aloqa uchun telefon va elektron pochta]\n"
        "[Sana]"
    )
