"""Mask organisation and person names in text that leaves this machine (label pack).

Same rules as the app's and the bot's presentation mode (ported from bot/tenderlens_bot.py so the
engine does not import across folders): a legal form (MChJ, AJ, DUK, ООО ...) hides the capitalised or
quoted words around it, institution head words (shifoxona, markaz, boshqarma ...) hide the proper
noun before them, mixed-case acronyms (NGQChB) are hidden, and so is every capitalised word that
belongs to the lot's own customer name. Hidden runs print as "…".

Two differences from the bot, because here the text is a clause a reviewer must judge:
bare 9-digit numbers are kept (they are usually amounts), only the customer's own TIN and
numbers written after STIR / INN are hidden; phone numbers are hidden.
"""
from __future__ import annotations

import re

_CYR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюяўқғҳ",
                ["a", "b", "v", "g", "d", "e", "yo", "j", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s",
                 "t", "u", "f", "x", "ts", "ch", "sh", "sh", "", "i", "", "e", "yu", "ya", "o", "q", "g", "h"]))


def key(s) -> str:
    """Script- and spelling-insensitive form of a name: lower-case Latin letters and digits."""
    s = "".join(_CYR.get(c, c) for c in str(s or "").lower())
    for a, b in (("ş", "sh"), ("ç", "ch"), ("ğ", "g"), ("ö", "o"), ("ü", "u"), ("ı", "i")):
        s = s.replace(a, b)
    s = re.sub(r"['’‘ʻʼ`´\"«»]", "", s).replace("h", "x").replace("q", "k")
    s = s.replace("o", "u")                          # ў is often typed as у (Янгиқўрғон / Янгикургон)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


_LEGAL = {key(t).replace(" ", "") for t in [
    "MChJ", "MCHJ", "QK", "XK", "AK", "AKB", "OK", "AJ", "ATB", "AT", "DUK", "DM", "UK", "MK", "XF", "OOO", "OAO",
    "AO", "ZAO", "PAO", "GUP", "LLC", "LTD", "JSC", "ООО", "ОАО", "АО", "ЗАО", "ПАО", "ГУП", "АЖ", "МЧЖ", "АТБ",
    "ДУК", "ДМ", "ХК", "ҚК", "УК", "МК", "ОК", "АК", "АКБ"]}
STOP = {key(w) for w in """xizmat xizmati boshqarma boshqarmasi davlat tuman tumani viloyat viloyati shahar shahri
 markaz markazi muassasa muassasasi filial filiali jamiyat jamiyati aksiyadorlik korxona korxonasi respublika
 respublikasi ozbekiston uzbekiston toshkent milliy agentligi vazirligi hokimligi buyurtmachi uchun boyicha tashkiloti
 maktab maktabi soni sonli maktabgacha talim tibbiyot birlashma birlashmasi bank banki universitet universiteti
 poliklinika poliklinikasi shifoxona shifoxonasi kasalxona kasalxonasi klinik klinikasi teatr teatri bolalar oromgoh
 oromgohi mamuriy bino kasalliklar yuqumli ichki ishlar salomatlik ruhiy tashkilot ilmiy institut instituti akademiya
 akademiyasi kollej texnikum litsey sport madaniyat tarbiyalanuvchilar hududiy bolim bolimi kompleks kompleksi
 xarid xaridlar xaridlari texnik korsatish tizimi foydalanish kapital umumiy""".split()}
_HEADS = [key(x) for x in [
    "shifoxona", "kasalxona", "poliklinika", "markaz", "boshqarma", "bank", "universitet", "institut", "akademiya",
    "zavod", "kombinat", "teatr", "muzey", "birlashma", "korxona", "jamiyat", "agentlig", "vazirlig", "hokimlig",
    "kollej", "litsey", "filial", "klinika", "dispanser", "muassasa", "inspeksiya", "qo'mita", "departament"]]
_OPENQ, _CLOSEQ = re.compile(r"^[“\"«„‘']"), re.compile(r"[”\"»“’']$")
_UP = re.compile(r"^[A-ZА-ЯЁЎҚҒҲ]")
_UPS = "A-ZА-ЯЁЎҚҒҲ"
_LOWS = "a-zа-яёўқғҳ"


def _strip(t: str) -> str:
    return re.sub(r"^[“\"«„‘'(\[]+|[”\"»“’'),.;:!?\]]+$", "", t)


_SUFFIX = re.compile(r"^([A-ZА-ЯЁЎҚҒҲ]{2,5})['’‘ʻ-]?(?:da|dan|ga|ni|ning|dagi|да|дан|га|ни|нинг|даги)$")


def _legal(t: str) -> bool:
    b = _strip(t)
    sfx = _SUFFIX.match(b)
    if sfx:
        b = sfx.group(1)
    if not b or len(b) > 7 or not (b == b.upper() or re.fullmatch(r"m\.?ch\.?j\.?", b, re.I)):
        return False
    return key(b).replace(" ", "") in _LEGAL


def name_tokens(*names: str) -> set[str]:
    """The distinctive words of customer names: at least 4 letters and not a generic word."""
    out: set[str] = set()
    for n in names:
        out |= {x for x in key(n).split() if len(x) >= 4 and x not in STOP}
        for short in re.findall(rf"(?<![{_UPS}{_LOWS}])[{_UPS}]{{2,3}}(?![{_UPS}{_LOWS}])", str(n or "")):
            if not _legal(short) and key(short) not in STOP and short not in ("VA", "ВА"):
                out.add(key(short))                 # brand-like acronyms in the name: BYD, GTL, FVV
    return out


def _in(k: str, words: set[str]) -> bool:
    """k is one of the words, allowing for a case ending on either side (maktabi / maktabining)."""
    return k in words or any(len(n) >= 5 and len(k) >= 5 and (k.startswith(n) or n.startswith(k)) for n in words)


def _mask_runs(text: str, customer_names) -> str:
    """Hide every run of two or more neighbouring words that all belong to a customer's name.

    Works across line breaks (scanned tables split names over lines) and ignores capitalisation,
    so "38-sonli oilaviy poliklinika" goes even though each word alone is generic. A run needs
    at least one distinctive word of the name.
    """
    every: set[str] = set()
    for n in customer_names:
        every |= {x for x in key(n).split() if len(x) >= 2}
    distinct = name_tokens(*customer_names)
    if not distinct:
        return text
    parts = re.split(r"(\s+)", text)                       # words at even positions, gaps at odd ones
    keys = [key(_strip(parts[i])).split() if i % 2 == 0 else None for i in range(len(parts))]
    i = 0
    while i < len(parts):
        if not (keys[i] and all(_in(k, every) for k in keys[i])):
            i += 2
            continue
        j, n_words, strong = i, 0, False
        while j < len(parts) and keys[j] and all(_in(k, every) for k in keys[j]):
            n_words += len(keys[j])
            strong = strong or any(_in(k, distinct) for k in keys[j])
            j += 2
        if n_words >= 2 and strong:
            tail = re.search(r"[),.;:!?»”]+$", parts[j - 2])
            parts[i] = "…" + (tail.group(0) if tail else "")
            for x in range(i + 1, j - 1):
                parts[x] = ""
        i = j
    return "".join(parts)


def _mask_line(line: str, names: set[str], orgs: bool = True) -> str:
    w = line.split(" ")
    m = [False] * len(w)

    def like(i: int) -> bool:
        return 0 <= i < len(w) and w[i] != "" and bool(
            _UP.match(_strip(w[i])) or _OPENQ.match(w[i]) or _CLOSEQ.search(w[i]))

    for i, t in enumerate(w):                       # legal form: hide the name around it
        if not orgs or not _legal(t):
            continue
        m[i] = True
        j, n = i - 1, 0
        while like(j) and n < 6:
            start = j
            if _CLOSEQ.search(w[j]) and not _OPENQ.match(w[j]):
                start = next((k for k in range(j, max(-1, j - 9), -1) if _OPENQ.match(w[k])), j)
            for k in range(start, j + 1):
                m[k] = True
            n += j - start + 1
            j = start - 1
        j, n = i + 1, 0
        while like(j) and n < 4:
            end = j
            if _OPENQ.match(w[j]) and not _CLOSEQ.search(w[j]):
                end = next((k for k in range(j, min(len(w), j + 8)) if _CLOSEQ.search(w[k])), j)
            for k in range(j, end + 1):
                m[k] = True
            n += end - j + 1
            j = end + 1
    for i, t in enumerate(w):                       # a capitalised word of the customer's own name
        ks = key(_strip(t)).split()
        if ks and (_UP.match(_strip(t)) or _OPENQ.match(t)) and any(_in(k, names) for k in ks):
            m[i] = True
    for i, t in enumerate(w):                       # "<Proper noun> ... shifoxonasi"
        k = key(_strip(t))
        if not orgs or not k or not any(k.startswith(h) for h in _HEADS):
            continue
        for j in range(i - 1, max(-1, i - 5), -1):
            if re.search(r"[,.;:]$", w[j]):
                break
            kj = key(_strip(w[j]))
            if _UP.match(_strip(w[j])) and kj and kj not in STOP:
                for x in range(j, i + 1):
                    m[x] = True
                break
    for i, t in enumerate(w):                       # mixed-case acronyms such as NGQChB
        b = re.sub(r"[-–].*$", "", _strip(t))
        up6 = len(re.findall(f"[{_UPS}]", b[:6]))
        if (orgs and 3 <= len(b) <= 14 and up6 >= 3 and re.fullmatch(f"[A-Za-z{_UPS}{_LOWS}]+", b)
                and re.search(f"[{_LOWS}]", b) and not _legal(b) and b not in ("HBsAg", "HBeAg")):
            m[i] = True
            if i > 0 and _UP.match(_strip(w[i - 1])) and key(_strip(w[i - 1])) not in STOP:
                m[i - 1] = True

    def caps(i: int) -> bool:
        return 0 <= i < len(w) and bool(re.fullmatch(f"[{_UPS}]{{2,}}", _strip(w[i])))

    for _ in range(2 if orgs else 0):               # an ALL-CAPS token touching a hidden run
        for i in range(len(w)):
            if not m[i] and caps(i) and ((i > 0 and m[i - 1]) or (i + 1 < len(w) and m[i + 1])):
                m[i] = True
    out: list[str] = []
    for i, t in enumerate(w):
        if not m[i]:
            out.append(t)
        elif i > 0 and m[i - 1] and out:
            out[-1] = "…"
        else:
            out.append("…")
    return " ".join(out)


_PERSON = re.compile(rf"(^|[\s(«\"“,])[{_UPS}]\.\s?(?:[{_UPS}]\.\s?)?[{_UPS}][{_LOWS}'ʻ’‘-]{{2,}}")
_PERSON2 = re.compile(rf"(^|[\s(«\"“,])[{_UPS}][{_LOWS}'ʻ’‘-]{{3,}}\s[{_UPS}]\.\s?[{_UPS}]\.")
# a written-out name: up to two capitalised words and a patronymic (Axrorovich, Каримовна, Ali o'g'li)
_PATRONYMIC = re.compile(
    rf"(?:[{_UPS}][{_LOWS}'ʻ’‘-]+\s+){{0,2}}[{_UPS}][{_LOWS}'ʻ’‘-]*(?:ovich|evich|ovna|evna|ович|евич|овна|евна)(?![{_LOWS}])"
    rf"|(?:[{_UPS}][{_LOWS}'ʻ’‘-]+\s+){{1,2}}[{_UPS}][{_LOWS}'ʻ’‘-]+\s+(?:o['ʻ’‘`]?g['ʻ’‘`]?li|qizi|ўғли|угли|ўгли|қизи|кизи)(?![{_LOWS}])")
# a capitalised surname by its ending (Umurzaqov, Каримова), also glued to OCR'd initials ("ltl.Umurzaqov")
_SURNAME = re.compile(
    rf"(?:[\w.]*\.)?(?<![{_UPS}{_LOWS}])[{_UPS}][{_LOWS}'ʻ’‘]{{3,}}(?:ov|ev|yev|ova|eva|yeva|ов|ев|ова|ева)(?:ning|ga|dan|ni|нинг|га|дан|ни|у|а|ым|ой)?(?![{_LOWS}])")
_NOT_SURNAME = ("tanlov", "sinov", "tolov", "saylov", "olchov", "tergov", "танлов", "синов", "тўлов", "тулов",
                "сайлов", "ўлчов", "улчов", "тергов", "товаров", "участников", "заказчиков", "документов",
                "договоров", "поставщиков", "материалов", "приборов", "сертификатов", "специалистов", "объектов",
                "проектов", "расходов", "тендеров", "этапов", "образцов", "сроков", "заводов", "органов",
                "стандартов", "отборов", "конкурсов", "платежей")


def _surname(m: re.Match) -> str:
    word = re.sub(r"['ʻ’‘`]", "", m.group(0).lower())
    return m.group(0) if any(stem in word for stem in _NOT_SURNAME) else "…"
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
_SITE = re.compile(r"(?:https?://|www\.)\S+|(?<![\w@.-])[\w-]+(?:\.[\w-]+)*\.uz(?![\w-])", re.I)
_TIN = re.compile(r"(STIR|СТИР|ИНН|INN|TIN)\s*[:№]?\s*\d{9}(?!\d)", re.I)
_PHONE = re.compile(r"(?<!\d)(?:\+?\d{0,3}998[\s\-()]*)?\(?\d{2}\)?[\s\-]\d{3}[\s\-]\d{2}[\s\-]\d{2}(?!\d)")


def mask_text(text: str, customer_names=(), tins=(), orgs: bool = True) -> str:
    """`text` with names hidden as "…".

    Always hidden: the customer's own name (whole, in runs of its words, or as single capitalised
    words), persons written as initials + surname, phone numbers, e-mail addresses, the customer's TIN.
    With orgs=True (titles, context) every organisation name and web address is hidden too, as in
    presentation mode.
    With orgs=False (the clause being judged) third-party names stay, because a brand or a
    certifying body named in a clause is part of what the reviewer has to judge.
    """
    text = str(text or "")
    for n in customer_names:                        # the exact name first, whatever its capitalisation
        if n and len(n) > 3:
            text = re.sub(re.escape(n), "…", text, flags=re.I)
    for t in tins:
        if t:
            text = text.replace(str(t), "•••")
    text = _mask_runs(text, customer_names)
    names = name_tokens(*customer_names)
    lines = []
    for line in text.split("\n"):
        s = _mask_line(line, names, orgs)
        s = _PERSON2.sub(r"\1…", _PERSON.sub(r"\1…", s))
        s = _PATRONYMIC.sub("…", s)
        s = _EMAIL.sub("…", s)
        if orgs:
            s = _SITE.sub("…", s)
            s = _SURNAME.sub(_surname, s)
        s = _TIN.sub(r"\1: •••", s)
        s = re.sub(r"\+\s?\d[\d\s\-()]{8,16}\d", "•••", s)      # anything written as +998 ..., however spaced
        lines.append(_PHONE.sub("•••", s))
    return re.sub(r"…(\s*…)+", "…", "\n".join(lines))


def leaks(text: str, customer_name: str, tin: str = "") -> list[str]:
    """What of a customer's identity is still readable in `text` (empty list = nothing found).

    Checked: the TIN, the whole name, any two neighbouring words of the name of which at least one
    is distinctive, and any capitalised distinctive word of the name.
    """
    found: list[str] = []
    if tin and str(tin) in text:
        found.append(f"tin {tin}")
    k = " " + key(text) + " "
    words = key(customer_name).split()
    full = " ".join(words)
    if len(words) >= 2 and f" {full} " in k:
        found.append(f"full name: {full}")
    names = name_tokens(customer_name)
    for a, b in zip(words, words[1:]):
        if (a in names or b in names) and f" {a} {b} " in k:
            found.append(f"name pair: {a} {b}")
    for t in re.split(r"\s+", text):
        b = _strip(t)
        if b and _UP.match(b) and any(_in(k, names) for k in key(b).split()):
            found.append(f"capitalised name word: {b}")
    return sorted(set(found))
