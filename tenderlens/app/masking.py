"""Presentation-mode masking shared by the web server (app/serve.py) and the Telegram bot.

The web UI masks free text in JavaScript (app/assets/app.js, same rules); lot titles are decided
here once and sent to the browser as `title_present`, so the page, the letters and the bot all show
the same neutral title.

Rules (deliberately strict: on stage we point at conditions, never at a named organisation):
  * customer name / TIN -> alias "Buyurtmachi A/B/…" (numbers after Z, so no alias looks like "AJ");
  * legal forms (MChJ, AJ, AJda, DUK, ООО, ГУП…) blank the run of capitalised/quoted words around them;
  * capitalised words of the customer's own name, "<Proper noun> … shifoxonasi/markazi/banki",
    mixed-case acronyms (NGQChB), person initials, 9-digit tax numbers and "N-son" numbers are blanked;
  * a title that still names or locates an institution is trimmed to the part after "uchun",
    or replaced by a neutral sector title.
"""
import re

_CYR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюяўқғҳ",
                ["a", "b", "v", "g", "d", "e", "yo", "j", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u",
                 "f", "x", "ts", "ch", "sh", "sh", "", "i", "", "e", "yu", "ya", "o", "q", "g", "h"]))


def norm(s):
    return re.sub(r"\s+", " ", str(s or "")).strip()


def key(s):
    s = "".join(_CYR.get(c, c) for c in str(s or "").lower())
    for a_, b_ in (("ş", "sh"), ("ç", "ch"), ("ğ", "g"), ("ö", "o"), ("ü", "u"), ("ı", "i")):
        s = s.replace(a_, b_)
    s = re.sub(r"['’‘ʻʼ`´\"«»“”]", "", s).replace("h", "x").replace("q", "k")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


_LEGAL = {key(t).replace(" ", "") for t in [
    "MChJ", "MCHJ", "QK", "XK", "AK", "AKB", "OK", "AJ", "ATB", "AT", "DUK", "DM", "UK", "MK", "XF", "OOO", "OAO", "AO",
    "ZAO", "PAO", "GUP", "LLC", "LTD", "JSC", "ООО", "ОАО", "АО", "ЗАО", "ПАО", "ГУП", "АЖ", "МЧЖ", "АТБ", "ДУК", "ДМ",
    "ХК", "ҚК", "УК", "МК", "ОК", "АК", "АКБ"]}
STOP = {key(w) for w in """xizmat xizmati boshqarma boshqarmasi davlat tuman tumani viloyat viloyati shahar shahri markaz markazi
 muassasa muassasasi filial filiali jamiyat jamiyati aksiyadorlik korxona korxonasi respublika respublikasi ozbekiston uzbekiston
 toshkent milliy agentligi vazirligi hokimligi buyurtmachi uchun boyicha tashkiloti maktab maktabi soni sonli maktabgacha talim
 tibbiyot birlashma birlashmasi bank banki universitet universiteti poliklinika poliklinikasi shifoxona shifoxonasi kasalxona
 kasalxonasi klinik klinikasi teatr teatri bolalar oromgoh oromgohi mamuriy bino kasalliklar yuqumli ichki ishlar salomatlik ruhiy
 tashkilot ilmiy institut instituti akademiya akademiyasi kollej texnikum litsey sport madaniyat tarbiyalanuvchilar hududiy bolim
 bolimi kompleks kompleksi""".split()}
_HEADS = [key(x) for x in ["shifoxona", "kasalxona", "poliklinika", "markaz", "boshqarma", "bank", "universitet", "institut",
                           "akademiya", "zavod", "kombinat", "teatr", "muzey", "birlashma", "korxona", "jamiyat", "agentlig",
                           "vazirlig", "hokimlig", "kollej", "litsey", "filial", "klinika", "dispanser", "muassasa",
                           "inspeksiya", "qo'mita", "departament", "prokuratura"]]
_OPENQ, _CLOSEQ = re.compile(r"^[“\"«„‘']"), re.compile(r"[”\"»“’']$")
_UP = re.compile(r"^[A-ZА-ЯЁЎҚҒҲ]")
_SUFFIX = re.compile(r"^(.{2,6}?)(dagi|ning|dan|da|ga|ni|si|ka|qa)$")


def _strip(t):
    return re.sub(r"^[“\"«„‘'(\[]+|[”\"»“’'),.;:!?\]]+$", "", t)


def legal_token(t):
    b_ = _strip(t)
    if not b_ or len(b_) > 10:
        return False
    cands = [b_]
    m = _SUFFIX.match(b_)
    if m:
        cands.append(m.group(1))  # "AJda", "MChJga" -> legal form with a case suffix
    for c in cands:
        if len(c) <= 7 and (c == c.upper() or re.fullmatch(r"m\.?ch\.?j\.?", c, re.I)) and key(c).replace(" ", "") in _LEGAL:
            return True
    return False


def _mask_line(line, names):
    w = line.split(" ")
    m = [False] * len(w)
    like = lambda i: 0 <= i < len(w) and w[i] != "" and bool(_UP.match(_strip(w[i])) or _OPENQ.match(w[i]) or _CLOSEQ.search(w[i]))  # noqa: E731
    for i, t in enumerate(w):
        if not legal_token(t):
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
    for i, t in enumerate(w):
        k = key(_strip(t))
        if k and (_UP.match(_strip(t)) or _OPENQ.match(t)) and (
                k in names or any(k.startswith(n_) and len(n_) >= 5 for n_ in names)
                or (len(k) >= 5 and any(len(n_) >= 8 and n_.startswith(k) for n_ in names))):  # "Muborak" in MUBORAKNEFTGAZ
            m[i] = True
    for i, t in enumerate(w):
        k = key(_strip(t))
        if not k or not any(k.startswith(h) for h in _HEADS):
            continue
        for j in range(i - 1, max(-1, i - 5), -1):
            if re.search(r"[,.;:]$", w[j]):
                break
            kj = key(_strip(w[j]))
            if _UP.match(_strip(w[j])) and kj and kj not in STOP:
                for x in range(j, i + 1):
                    m[x] = True
                break
    for i, t in enumerate(w):
        b_ = re.sub(r"[-–].*$", "", _strip(t))
        up6 = len(re.findall(r"[A-ZА-ЯЁЎҚҒҲ]", b_[:6]))
        if (3 <= len(b_) <= 14 and up6 >= 3 and re.fullmatch(r"[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]+", b_)
                and re.search(r"[a-zа-яёўқғҳ]", b_) and not legal_token(b_) and b_ not in ("HBsAg", "HBeAg")):
            m[i] = True
            if i > 0 and _UP.match(_strip(w[i - 1])) and key(_strip(w[i - 1])) not in STOP:
                m[i - 1] = True
    caps = lambda i: 0 <= i < len(w) and bool(re.fullmatch(r"[A-ZА-ЯЁЎҚҒҲ]{2,}", _strip(w[i])))  # noqa: E731
    for _ in range(2):
        for i in range(len(w)):
            if not m[i] and caps(i) and ((i > 0 and m[i - 1]) or (i + 1 < len(w) and m[i + 1])):
                m[i] = True
    out = []
    for i, t in enumerate(w):
        if not m[i]:
            out.append(t)
        elif i > 0 and m[i - 1] and out:
            out[-1] = "…"
        else:
            out.append("…")
    return " ".join(out)


def name_words(names):
    out = set()
    for n in names or ():
        out |= {x for x in key(n).split() if len(x) >= 4 and x not in STOP}
    return out


def mask_text(text, cust_names=()):
    names = name_words(cust_names)
    lines = []
    for line in str(text or "").split("\n"):
        s_ = _mask_line(line, names)
        s_ = re.sub(r"(^|[\s(«\"“,])[A-ZА-ЯЁЎҚҒҲ]\.\s?(?:[A-ZА-ЯЁЎҚҒҲ]\.\s?)?[A-ZА-ЯЁЎҚҒҲ][a-zа-яёўқғҳ'ʻ’‘-]{2,}", r"\1…", s_)
        s_ = re.sub(r"(STIR|СТИР|ИНН|INN|TIN)\s*[:№]?\s*\d{9}(?!\d)", r"\1: •••", s_, flags=re.I)
        s_ = re.sub(r"(^|\D)\d{9}(?!\d)", r"\1•••", s_)
        s_ = re.sub(r"(?<![\w.])\d{1,4}\s?-\s?(sonli|son|сонли|сон|OP|ОП|DMTT|MTT|ММТТ|МТТ)\b", "…", s_)  # numbered institutions
        s_ = re.sub(r"…(\s*…)+", "…", s_)
        lines.append(s_)
    return "\n".join(lines)


# ---------------------------------------------------------------- aliases
def alias_label(n):
    """0 -> A … 25 -> Z, then 27, 28 … (two-letter aliases could read as legal forms: AJ, AK, AO)."""
    return "Buyurtmachi " + (chr(65 + n) if n < 26 else str(n + 1))


def risk_key(l):
    s = l.get("fairness_score")
    val = (l.get("start_cost") or 0) if l.get("currency") == "UZS" else 0
    return (999 if s is None else s, -(l.get("money_on_table_uzs") or 0), -val)


def alias_table(index):
    keys = []
    for l in sorted(index or [], key=risk_key):
        k = str(l.get("customer_tin") or "") or norm(l.get("customer_name")).lower()
        if k not in keys:
            keys.append(k)
    return keys


def alias_for(keys, tin, name):
    k = str(tin or "") or norm(name).lower()
    if k not in keys:
        keys.append(k)
    return alias_label(keys.index(k))


# ---------------------------------------------------------------- titles
# Hand-checked neutral titles for the demo lots (presentation mode only).
PRESENT_TITLES = {
    524769: "Shifoxona bemorlarini kuniga 3 mahal issiq ovqat bilan ta'minlash (autsorsing)",
    525192: "6/10 kV razedinitel (ajratgich), 2 dona, avariya zaxirasi uchun",
    524954: "Suv ombori qudug'ini ta'mirlash va tiklash bo'yicha ishchi loyiha, mualliflik nazorati",
}
# Titles the review found identifying even after masking: always trimmed or replaced.
DENY = {519731, 524620, 524170, 523196, 518733, 524890, 524839, 524120, 524152, 524428, 525029, 524663, 524853, 524431,
        522162, 525689, 522766, 525364, 524992, 524047, 525127, 524876,
        524626, 524524}  # scan 18 Nov: descriptive titles that echo the customer's own name
SECTOR_TITLE = {
    "health": "Sog'liqni saqlash sohasidagi xarid",
    "education": "Ta'lim sohasidagi xarid",
    "construction": "Qurilish ishlari xaridi",
    "it": "Axborot texnologiyalari xaridi",
    "food": "Ovqatlanish xizmati xaridi",
    "other": "Davlat xaridi",
}
_INSTITUTION = [key(x) for x in [
    "shifoxona", "kasalxona", "poliklinika", "klinika", "dispanser", "sanatoriy", "litsey", "kollej", "texnikum", "institut",
    "akademiya", "universitet", "teatr", "muzey", "prokuratura", "prokuror", "jurnal", "gazeta", "aeroport", "internat",
    "oromgoh", "markaz", "boshqarma", "bank", "vazirlik", "agentlik", "qo'mita", "hokimlik", "inspeksiya", "birlashma",
    "kombinat", "zavod", "korxona", "filial", "departament", "bojxona", "militsiya", "politsiya", "harbiy", "sud",
    "ichki ishlar", "favqulodda", "fakultet", "kafedra", "bolalar uyi", "laboratoriya", "xospis", "hospis"]]
_RISK_RE = [
    re.compile(r"(?<![\w.])\d{1,4}\s?-?\s?(sonli|son|сонли|сон)\b", re.I),
    re.compile(r"(ko['‘’ʻ`]?chasi|кўчаси|mahallasi|\bMFY\b|\bМФЙ\b|manzil|mavzesi|massivi|\buy\b|-uy\b)", re.I),
    re.compile(r"\b[\w-]+\.(uz|com|ru|org|net)\b", re.I),
    re.compile(r"\bBYD\b|UzAuto|Uzbekistan GTL", re.I),
    re.compile(r"(?<![\w.])\d{1,3}\s?-\s?\w+.{0,40}?\b(maktab\w*|MTT|DMTT|bog['‘’ʻ]?cha\w*|litsey\w*|poliklinika\w*|shifoxona\w*)", re.I),
]
_PLACES = {key(x) for x in """toshkent samarqand buxoro andijon namangan farg'ona fargona navoiy jizzax sirdaryo surxondaryo
 qashqadaryo xorazm qoraqalpog'iston nukus termiz qarshi guliston urganch chirchiq bekobod olmaliq angren ohangaron kogon
 marg'ilon qo'qon shahrisabz denov zarafshon yangiyer gazli muborak xiva""".split()}
_PLACE_SUFFIX = re.compile(r"(dagi|ning|dan|da|ga)$")


def mask_places(text):
    """Free text: replace region/city/district names with "…" (keeps sentence shape)."""
    out_lines = []
    for line in str(text or "").split("\n"):
        line = re.sub(r"(^|[^\w'‘’ʻ])[A-ZА-ЯЁЎҚҒҲ][\w'‘’ʻ-]+\s+(viloyat|shahar|shahr|tuman)\w*", r"\1…", line)
        words = []
        for w in re.split(r"(\s+)", line):
            b_ = _strip(w)
            k = key(b_)
            base = _PLACE_SUFFIX.sub("", k) if k else k
            if b_ and _UP.match(b_) and (k in _PLACES or base in _PLACES):
                w = w.replace(b_, "…")
            else:
                for part in re.split(r"[-–]", b_):  # hyphen-joined: "DAP-Toshkent"
                    kp = key(part)
                    if len(part) > 3 and _UP.match(part) and (kp in _PLACES or _PLACE_SUFFIX.sub("", kp) in _PLACES):
                        w = w.replace(part, "…")
            words.append(w)
        out_lines.append(re.sub(r"…(\s*…)+", "…", "".join(words)))
    return "\n".join(out_lines)


def drop_places(t):
    """Remove region/city/district names from a title ("Surxondaryo viloyati", "Bektemir tumanida", "Toshkentdagi")."""
    t = re.sub(r"(?<![\w'‘’ʻ])[A-ZА-ЯЁЎҚҒҲ][\w'‘’ʻ-]+\s+(viloyat|shahar|shahr|tuman|respublika)\w*", " ", t)
    out = []
    for w in t.split():
        k = key(_strip(w))
        base = _PLACE_SUFFIX.sub("", k) if k else k
        if k and _UP.match(_strip(w)) and (k in _PLACES or base in _PLACES):
            continue
        out.append(w)
    t = " ".join(out)
    t = re.sub(r"^\s*(va|hamda|,|;)\s+", "", t)
    return re.sub(r"\s{2,}", " ", t).strip()
_ACR_OK = re.compile(r"^(ISO|IAAS|GOST|LED|CCTV|SCADA|USB|HDMI|LCD|MTT|DMTT|MMTT|EKG|POS|IT|PDV|PDO|IP|SPO|IPO|UZI|MRT|KT|PCR|"
                     r"IXLA|HCV|OIV|QQS|NDS|PC|SSD|HDD|UPS|GPS|SMS|API|CRM|ERP|GTS|KV|PVX|PVC|ID|QR|DVR|NVR|ATS|IPTV|WIFI|"
                     r"LTE|SIM|VRF|HVAC|TV|AV|D-NOTAM|NOTAM|EKG|HBSAG|OIT)$", re.I)


def _risky(t, lot_id=None):
    if lot_id in DENY or "…" in t:
        return True
    words = [_strip(x) for x in t.split()]
    if any(legal_token(x) for x in words):
        return True
    if any(rx.search(t) for rx in _RISK_RE):
        return True
    kt = " " + key(t) + " "
    if any((" " + inst) in kt for inst in _INSTITUTION):
        return True
    for x in words:
        if re.fullmatch(r"[A-ZА-ЯЁЎҚҒҲ'‘’ʻ-]{4,}", x) and not _ACR_OK.match(x):
            return True
    return False


def _cap(s):
    s = s.strip(" ,;:-")
    return s[:1].upper() + s[1:] if s else s


def present_title(row):
    """Neutral Latin title for presentation mode. `row` is an index row or a full lot."""
    lid = int(row.get("lot_id") or 0)
    if lid in PRESENT_TITLES:
        return PRESENT_TITLES[lid]
    names = [n for n in (row.get("customer_name"), (row.get("customer") or {}).get("name")) if n]
    t = norm(row.get("subject_uz") or row.get("title_uz") or row.get("title") or "")
    for n in names:
        if len(n) > 3:
            t = t.replace(n, "…")
    t = drop_places(mask_text(t, names))
    if not _risky(t, lid):
        return _cap(t)
    m = re.search(r"\buchun\s+(.+)$", t)  # "<who> uchun <what>" -> keep <what>
    if m:
        rest = m.group(1).strip()
        if len(rest.split()) >= 3 and not _risky(rest):
            return _cap(rest)
    return SECTOR_TITLE.get(row.get("sector"), SECTOR_TITLE["other"])


def neutral_letter(text, title, today=None):
    """Replace the letter's raw subject line with the neutral title; fill [Sana]."""
    out = re.sub(r"(?m)^(Xarid predmeti:).*$", lambda m: f"{m.group(1)} {title}", str(text or ""))
    if today:
        out = out.replace("[Sana]", today)
    return re.sub(r"(\d+)-bet\b", r"\1-sahifa", out)
