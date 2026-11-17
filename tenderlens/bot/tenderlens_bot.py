"""TenderLens Telegram bot: send a lot number or an etender link -> score, flags with quotes, verdict, letter.

    python bot/tenderlens_bot.py                 # run the bot (needs TENDERLENS_BOT_TOKEN)
    python bot/tenderlens_bot.py --dry-run 524784  # print the replies, no Telegram needed

Token: environment variable TENDERLENS_BOT_TOKEN, or a line TENDERLENS_BOT_TOKEN=... in
tenderlens/.env or bot/.env. The token is never printed or logged.

Data: engine API (127.0.0.1:8765) -> data/cache/. No mock data.
"""
import argparse
import asyncio
import html
import json
import logging
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

BOT_DIR = Path(__file__).resolve().parent
ROOT = BOT_DIR.parent
CACHE = ROOT / "data" / "cache"
ENGINE = os.environ.get("TENDERLENS_ENGINE", "http://127.0.0.1:8765").rstrip("/")
WEB_UI = os.environ.get("TENDERLENS_WEB", "")  # optional public URL of the web UI
TG_LIMIT = 4000

log = logging.getLogger("tenderlens.bot")

# ---------------------------------------------------------------- token
def load_token():
    tok = os.environ.get("TENDERLENS_BOT_TOKEN", "").strip()
    if tok:
        return tok
    for env in (ROOT / ".env", BOT_DIR / ".env"):
        if env.exists():
            for line in env.read_text(encoding="utf-8-sig").splitlines():
                line = line.strip()
                if line.startswith("export "):
                    line = line[7:].strip()
                if line.startswith("TENDERLENS_BOT_TOKEN="):
                    v = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if v:
                        return v
    return ""


# ---------------------------------------------------------------- data
LOT_RE = re.compile(r"\d{6,}")


def lot_id_from(text):
    m = LOT_RE.findall(str(text or ""))
    if not m:
        return None
    s = m[-1]
    if len(s) == 14:  # display_no, e.g. 26120012524784
        s = s[-6:]
    return int(s)


def _offline_dir():
    return CACHE, "cache"


def fetch_lot(lot_id, timeout=150):
    """Return (lot_dict | None, source)."""
    try:
        with urllib.request.urlopen(f"{ENGINE}/api/lots/{lot_id}", timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8")), "engine"
    except (urllib.error.URLError, OSError, TimeoutError, ValueError):
        pass  # engine down, 404 or 5xx: fall back to cache / mock
    base, src = _offline_dir()
    f = base / "lots" / f"{lot_id}.json"
    if f.exists():
        try:
            return json.loads(f.read_text(encoding="utf-8")), src
        except ValueError:
            return None, src
    return None, src


# ---------------------------------------------------------------- formatting
FLAG_TYPE = {
    "brand_no_equivalent": "Brend «yoki ekvivalent»siz",
    "narrow_params": "Haddan tor texnik parametrlar",
    "excessive_experience": "Ortiqcha tajriba talabi",
    "excessive_financial": "Ortiqcha moliyaviy talab",
    "dealer_letter": "Diler / ishlab chiqaruvchi xati talabi",
    "irrelevant_requirement": "Xarid predmetiga aloqasiz talab",
    "bundling": "Aloqasiz tovarlar bitta lotda",
    "unrealistic_deadline": "Real bo'lmagan muddat",
    "short_window": "Taklif uchun juda qisqa muddat",
    "other": "Boshqa cheklovchi shart",
}
SEV = {"high": "🔴 Yuqori", "medium": "🟠 O'rta", "low": "⚪️ Past"}
LIGHT = {"red": ("🔴", "Yuqori xavf"), "amber": ("🟠", "O'rta xavf"), "green": ("🟢", "Past xavf")}
VERDICT = {
    "bid": "✅ Qatnashing",
    "bid_with_clarification": "✍️ Qatnashing, lekin avval aniqlik so'rang",
    "skip": "⛔️ Qatnashmang",
}
MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"]

e = lambda s: html.escape(str(s if s is not None else ""), quote=False)  # noqa: E731
norm = lambda s: re.sub(r"\s+", " ", str(s or "")).strip()  # noqa: E731


def grp(n, dec=0):
    s = f"{n:,.{dec}f}"
    return s.replace(",", " ").replace(".", ",")


def money(n, cur="UZS"):
    if n is None:
        return "—"
    unit = "so'm" if not cur or cur == "UZS" else cur
    a = abs(n)
    if a >= 1e13:
        return f"{grp(n / 1e12, 1)} trln {unit}"
    if a >= 1e9:
        return f"{grp(n / 1e9, 1)} mlrd {unit}"
    if a >= 1e6:
        return f"{grp(n / 1e6, 1)} mln {unit}"
    return f"{grp(n)} {unit}"


def fmt_date(iso):
    try:
        d = datetime.fromisoformat(str(iso).replace("Z", ""))
    except ValueError:
        return str(iso or "—")
    return f"{d.day}-{MONTHS[d.month - 1]}, {d:%H:%M}"


def verified_flags(lot):
    return [f for f in (lot.get("flags") or []) if f.get("quote_verified") is True]


def light_of(lot):
    lt = lot.get("traffic_light")
    if lt in LIGHT:
        return lt
    s = lot.get("fairness_score")
    if s is None:
        return None  # not scored yet: neutral, never a red default
    return "green" if s >= 75 else "amber" if s >= 50 else "red"


def format_verdict(lot, max_flags=3):
    flags = verified_flags(lot)
    lt = light_of(lot)
    icon, lt_name = LIGHT.get(lt, ("⚪️", "baho hali hisoblanmagan"))
    title = lot.get("subject_uz") or lot.get("title_uz") or lot.get("title") or ""
    cust = (lot.get("customer") or {}).get("name", "")
    v = lot.get("verdict") or {}
    out = [
        f"{icon} <b>Lot {e(lot.get('lot_id'))}</b> — {e(title)}",
        f"Buyurtmachi: {e(cust)}",
        f"Boshlang'ich narx: <b>{e(money(lot.get('start_cost'), lot.get('currency')))}</b> · Muddat: <b>{e(fmt_date(lot.get('end_date')))}</b>",
        "",
        (f"<b>Adolatlilik bali: {e(lot['fairness_score'])}/100</b> ({lt_name})" if lot.get("fairness_score") is not None
         else f"<b>Adolatlilik bali:</b> {lt_name}"),
        f"<b>Tavsiya:</b> {e(VERDICT.get(v.get('decision'), 'hali tayyor emas'))}",
    ]
    for r in (v.get("reasons_uz") or [])[:3]:
        out.append(f"• {e(r)}")
    out.append("")
    if flags:
        out.append(f"<b>Topilgan cheklovchi shartlar ({len(flags)}):</b>")
        for i, f in enumerate(flags[:max_flags], 1):
            where = "platform mezonlari formasi" if (f.get("source") == "platform_form" or f.get("page") in (0, "0")) else (f"{f.get('page')}-sahifa" if f.get("page") else "")
            if f.get("criterion_no"):
                where = f"{f['criterion_no']}-mezon, {where}"
            out.append(f"{i}. {SEV.get(f.get('severity'), '')} · <b>{e(f.get('type_label_uz') or FLAG_TYPE.get(f.get('type'), f.get('type')))}</b> ({e(where)})")
            out.append(f"<blockquote>«{e(norm(f.get('quote')))}»</blockquote>")
            if f.get("explanation_uz"):
                out.append(f"<i>Nega:</i> {e(f['explanation_uz'])}")
            if f.get("rewrite_uz"):
                out.append(f"<i>Neytral tahrir:</i> {e(f['rewrite_uz'])}")
            out.append("")
        if len(flags) > max_flags:
            out.append(f"…va yana {len(flags) - max_flags} ta shart.")
            out.append("")
    elif lot.get("fairness_score") is None:
        out.append("⏳ Texnik topshiriq tahlili hali yakunlanmagan.")
    else:
        out.append("✅ Texnik topshiriqda tasdiqlangan cheklovchi shart topilmadi.")
        out.append("")
    cs = lot.get("customer_stats") or {}
    if cs.get("deals"):
        out.append(
            f"<b>Buyurtmachi tarixi:</b> {grp(cs['deals'])} bitim · mediana {cs.get('median_bidders', 0):g} ishtirokchi · "
            f"≤2 ishtirokchi {round((cs.get('share_le2_bidders') or 0) * 100)}% · eng ko'p yutgan ulushi {round((cs.get('top_winner_share') or 0) * 100)}%"
        )
    if lot.get("money_on_table_uzs"):
        out.append(f"<b>Tejash imkoniyati (taxminiy):</b> {e(money(lot['money_on_table_uzs']))}, agar raqobat +2 ishtirokchiga oshsa")
    out.append("")
    out.append("<i>TenderLens maslahat beradi: har bir belgi hujjatdan so'zma-so'z iqtibos bilan; yakuniy qaror sizniki.</i>")
    return "\n".join(out)


def format_letter(lot):
    letter = lot.get("clarification_letter_uz")
    if not letter:
        return None
    head = "✉️ <b>Aniqlik so'rovi xati</b>"
    if lot.get("clarific_date"):
        head += f" — {e(fmt_date(lot['clarific_date']))} gacha yuboring"
    return f"{head}\n<pre>{e(letter)}</pre>"


def split_html(text, limit=TG_LIMIT):
    """Split on blank lines so tags stay balanced (each block is self-contained)."""
    if len(text) <= limit:
        return [text]
    parts, cur = [], ""
    for block in text.split("\n\n"):
        cand = (cur + "\n\n" + block) if cur else block
        if len(cand) <= limit:
            cur = cand
            continue
        if cur:
            parts.append(cur)
        while len(block) > limit:  # very long single block: hard cut on a newline
            cut = block.rfind("\n", 0, limit)
            cut = cut if cut > 0 else limit
            parts.append(block[:cut])
            block = block[cut:].lstrip("\n")
        cur = block
    if cur:
        parts.append(cur)
    return parts


def split_letter(lot):
    """The letter goes in <pre>; split the raw letter first so each chunk keeps its own <pre>."""
    letter = lot.get("clarification_letter_uz")
    if not letter:
        return []
    msg = format_letter(lot)
    if len(msg) <= TG_LIMIT:
        return [msg]
    chunks, cur = [], ""
    for para in letter.split("\n\n"):
        cand = (cur + "\n\n" + para) if cur else para
        if len(e(cand)) > TG_LIMIT - 200 and cur:
            chunks.append(cur)
            cur = para
        else:
            cur = cand
    if cur:
        chunks.append(cur)
    return ["✉️ <b>Aniqlik so'rovi xati</b>"] + [f"<pre>{e(c)}</pre>" for c in chunks]


HELP = (
    "👋 <b>TenderLens</b> — davlat xaridlari tenderini tekshiruvchi yordamchi.\n\n"
    "Lot raqamini yoki etender.uzex.uz havolasini yuboring, masalan:\n"
    "<code>524784</code>\n<code>https://etender.uzex.uz/lot/524784</code>\n\n"
    "Javobda: adolatlilik bali (0–100), cheklovchi shartlar hujjatdan iqtibos bilan, "
    "tavsiya (qatnashish / aniqlik so'rash / qatnashmaslik) va buyurtmachiga aniqlik so'rovi xati."
)


# ---------------------------------------------------------------- presentation mode
# TENDERLENS_PRESENT=1 (or --present) masks customer names as "Buyurtmachi A/B/…", using the same
# order as the web UI (index sorted by risk), so a customer gets the same letter everywhere.
PRESENT = os.environ.get("TENDERLENS_PRESENT", "") not in ("", "0", "false")


def _letters(n):
    s, n = "", n + 1
    while n > 0:
        m = (n - 1) % 26
        s, n = chr(65 + m) + s, (n - 1) // 26
    return s


def _alias_for(tin, name):
    index = None
    try:
        with urllib.request.urlopen(f"{ENGINE}/api/lots", timeout=10) as r:
            index = json.loads(r.read().decode("utf-8"))
    except (urllib.error.URLError, OSError, TimeoutError, ValueError):
        f = CACHE / "index.json"
        if f.exists():
            index = json.loads(f.read_text(encoding="utf-8"))
    keys = []
    if index:
        def risk(l):
            s = l.get("fairness_score")
            cur_val = l.get("start_cost") or 0 if l.get("currency") == "UZS" else 0
            return (999 if s is None else s, -(l.get("money_on_table_uzs") or 0), -cur_val)
        for l in sorted(index, key=risk):
            k = str(l.get("customer_tin") or "") or norm(l.get("customer_name")).lower()
            if k not in keys:
                keys.append(k)
    k = str(tin or "") or norm(name).lower()
    if k not in keys:
        keys.append(k)
    return "Buyurtmachi " + _letters(keys.index(k))


_CYR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюяўқғҳ",
                ["a","b","v","g","d","e","yo","j","z","i","y","k","l","m","n","o","p","r","s","t","u","f","x","ts","ch","sh","sh","","i","","e","yu","ya","o","q","g","h"]))


def _key(s):
    s = "".join(_CYR.get(c, c) for c in str(s or "").lower())
    for a_, b_ in (("ş", "sh"), ("ç", "ch"), ("ğ", "g"), ("ö", "o"), ("ü", "u"), ("ı", "i")):
        s = s.replace(a_, b_)
    s = re.sub(r"['’‘ʻʼ`´\"«»]", "", s).replace("h", "x").replace("q", "k")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


_LEGAL = {_key(t).replace(" ", "") for t in ["MChJ", "MCHJ", "QK", "XK", "AK", "AKB", "OK", "AJ", "ATB", "AT", "DUK", "DM", "UK", "MK", "XF", "OOO", "OAO", "AO", "ZAO", "PAO", "GUP", "LLC", "LTD", "JSC", "ООО", "ОАО", "АО", "ЗАО", "ПАО", "ГУП", "АЖ", "МЧЖ", "АТБ", "ДУК", "ДМ", "ХК", "ҚК", "УК", "МК", "ОК", "АК", "АКБ"]}
_STOP = {_key(w) for w in """xizmat xizmati boshqarma boshqarmasi davlat tuman tumani viloyat viloyati shahar shahri markaz markazi muassasa
 muassasasi filial filiali jamiyat jamiyati aksiyadorlik korxona korxonasi respublika respublikasi ozbekiston uzbekiston toshkent milliy
 agentligi vazirligi hokimligi buyurtmachi uchun boyicha tashkiloti maktab maktabi soni sonli maktabgacha talim tibbiyot birlashma
 birlashmasi bank banki universitet universiteti poliklinika poliklinikasi shifoxona shifoxonasi kasalxona kasalxonasi klinik klinikasi
 teatr teatri bolalar oromgoh oromgohi mamuriy bino kasalliklar yuqumli ichki ishlar salomatlik ruhiy tashkilot ilmiy institut instituti
 akademiya akademiyasi kollej texnikum litsey sport madaniyat tarbiyalanuvchilar hududiy bolim bolimi kompleks kompleksi""".split()}
_HEADS = [_key(x) for x in ["shifoxona", "kasalxona", "poliklinika", "markaz", "boshqarma", "bank", "universitet", "institut", "akademiya", "zavod", "kombinat", "teatr", "muzey", "birlashma", "korxona", "jamiyat", "agentlig", "vazirlig", "hokimlig", "kollej", "litsey", "filial", "klinika", "dispanser", "muassasa", "inspeksiya", "qo'mita", "departament"]]
_OPENQ, _CLOSEQ = re.compile(r"^[“\"«„‘']"), re.compile(r"[”\"»“’']$")
_UP = re.compile(r"^[A-ZА-ЯЁЎҚҒҲ]")


def _strip(t):
    return re.sub(r"^[“\"«„‘'(\[]+|[”\"»“’'),.;:!?\]]+$", "", t)


def _legal(t):
    b_ = _strip(t)
    if not b_ or len(b_) > 7 or not (b_ == b_.upper() or re.fullmatch(r"m\.?ch\.?j\.?", b_, re.I)):
        return False
    return _key(b_).replace(" ", "") in _LEGAL


def _mask_line(line, names):
    w = line.split(" ")
    m = [False] * len(w)
    like = lambda i: 0 <= i < len(w) and w[i] != "" and bool(_UP.match(_strip(w[i])) or _OPENQ.match(w[i]) or _CLOSEQ.search(w[i]))
    for i, t in enumerate(w):
        if not _legal(t):
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
        k = _key(_strip(t))
        if k and (_UP.match(_strip(t)) or _OPENQ.match(t)) and k in names:
            m[i] = True
    for i, t in enumerate(w):
        k = _key(_strip(t))
        if not k or not any(k.startswith(h) for h in _HEADS):
            continue
        for j in range(i - 1, max(-1, i - 5), -1):
            if re.search(r"[,.;:]$", w[j]):
                break
            kj = _key(_strip(w[j]))
            if _UP.match(_strip(w[j])) and kj and kj not in _STOP:
                for x in range(j, i + 1):
                    m[x] = True
                break
    for i, t in enumerate(w):
        b_ = re.sub(r"[-–].*$", "", _strip(t))
        up6 = len(re.findall(r"[A-ZА-ЯЁЎҚҒҲ]", b_[:6]))
        if 3 <= len(b_) <= 14 and up6 >= 3 and re.fullmatch(r"[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]+", b_) and re.search(r"[a-zа-яёўқғҳ]", b_) and not _legal(b_) and b_ not in ("HBsAg", "HBeAg"):
            m[i] = True
            if i > 0 and _UP.match(_strip(w[i - 1])) and _key(_strip(w[i - 1])) not in _STOP:
                m[i - 1] = True
    caps = lambda i: 0 <= i < len(w) and bool(re.fullmatch(r"[A-ZА-ЯЁЎҚҒҲ]{2,}", _strip(w[i])))
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


def mask_text(text, cust_names=()):
    names = set()
    for n in cust_names:
        names |= {x for x in _key(n).split() if len(x) >= 4 and x not in _STOP}
    lines = []
    for line in str(text).split("\n"):
        s_ = _mask_line(line, names)
        s_ = re.sub(r"(^|[\s(«\"“,])[A-ZА-ЯЁЎҚҒҲ]\.\s?(?:[A-ZА-ЯЁЎҚҒҲ]\.\s?)?[A-ZА-ЯЁЎҚҒҲ][a-zа-яёўқғҳ'ʻ’‘-]{2,}", r"\1…", s_)
        s_ = re.sub(r"(STIR|СТИР|ИНН|INN|TIN)\s*[:№]?\s*\d{9}(?!\d)", r"\1: •••", s_, flags=re.I)
        lines.append(re.sub(r"(^|\D)\d{9}(?!\d)", r"\1•••", s_))
    return "\n".join(lines)


def mask_lot(lot):
    c = lot.get("customer") or {}
    name, tin = c.get("name") or "", str(c.get("tin") or "")
    label = _alias_for(tin, name)

    def walk(v):
        if isinstance(v, str):
            if name and len(name) > 3:
                v = v.replace(name, label)
            v = v.replace(tin, "•••") if tin else v
            return mask_text(v, [name]).replace(mask_text(label), label)
        if isinstance(v, list):
            return [walk(x) for x in v]
        if isinstance(v, dict):
            return {k: walk(x) for k, x in v.items()}
        return v

    out = walk(lot)
    out["customer"] = {"name": label, "tin": ""}
    for k in ("title", "title_uz"):
        out.pop(k, None)  # in presentation mode the bot shows only the masked Latin subject
    out["display_no"] = ""
    return out


def replies_for(text):
    """Pure function: user text -> list of (html_message, url_button_or_None)."""
    lot_id = lot_id_from(text)
    if not lot_id:
        return [(HELP, None)]
    lot, _src = fetch_lot(lot_id)
    if lot and PRESENT:
        lot = mask_lot(lot)
    if not lot:
        return [(f"🔎 <b>{lot_id}</b>-son lot hali tahlil qilinmagan yoki topilmadi.\n"
                 "Raqamni tekshiring yoki birozdan so'ng qayta urinib ko'ring.", None)]
    url = lot.get("url") or f"https://etender.uzex.uz/lot/{lot_id}"
    msgs = [(m, None) for m in split_html(format_verdict(lot))]
    msgs[-1] = (msgs[-1][0], url)
    msgs += [(m, None) for m in split_letter(lot)]
    return msgs


# ---------------------------------------------------------------- telegram
async def _on_start(update, context):
    await update.effective_message.reply_html(HELP, disable_web_page_preview=True)


async def _on_text(update, context):
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup
    from telegram.constants import ChatAction

    msg = update.effective_message
    text = msg.text or ""
    if lot_id_from(text):
        await context.bot.send_chat_action(msg.chat_id, ChatAction.TYPING)
        await msg.reply_html("⏳ Texnik topshiriq tahlil qilinmoqda…")
    replies = await asyncio.to_thread(replies_for, text)
    for body, url in replies:
        kb = InlineKeyboardMarkup([[InlineKeyboardButton("etender.uzex.uz'da ochish", url=url)]]) if url else None
        await msg.reply_html(body, reply_markup=kb, disable_web_page_preview=True)
        await asyncio.sleep(0.4)


async def _on_error(update, context):
    log.warning("handler error: %s", type(context.error).__name__)
    try:
        if update and update.effective_message:
            await update.effective_message.reply_text("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
    except Exception:
        pass


def run_bot():
    token = load_token()
    if not token:
        sys.exit("TENDERLENS_BOT_TOKEN topilmadi: muhit o'zgaruvchisiga yoki tenderlens/.env fayliga qo'ying.")
    from telegram.ext import Application, CommandHandler, MessageHandler, filters

    logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO)
    # httpx logs every request URL at INFO, and Telegram URLs contain the token.
    for noisy in ("httpx", "httpcore", "telegram.ext.Updater", "apscheduler"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler(["start", "help"], _on_start))
    app.add_handler(CommandHandler("lot", _on_text))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, _on_text))
    app.add_error_handler(_on_error)
    base, src = _offline_dir()
    log.info("TenderLens bot ishga tushmoqda (engine: %s, oflayn manba: %s). To'xtatish: Ctrl+C", ENGINE, src)
    from telegram.error import InvalidToken, NetworkError
    try:
        app.run_polling(drop_pending_updates=True)
    except InvalidToken:
        # ptb's own message contains the token; never let it reach the console.
        sys.exit("Telegram tokenni rad etdi: TENDERLENS_BOT_TOKEN qiymatini tekshiring (@BotFather).")
    except NetworkError as ex:
        sys.exit(f"Telegram bilan aloqa yo'q (internet?): {type(ex).__name__}")


def main():
    ap = argparse.ArgumentParser(description="TenderLens Telegram bot")
    ap.add_argument("--dry-run", metavar="TEXT", help="print replies for TEXT (lot number or link) and exit")
    ap.add_argument("--check-token", action="store_true", help="say whether a token is configured (never prints it)")
    ap.add_argument("--present", action="store_true", help="mask customer names (presentation mode)")
    a = ap.parse_args()
    global PRESENT
    PRESENT = PRESENT or a.present
    if a.check_token:
        print("token: " + ("topildi" if load_token() else "YO'Q"))
        return
    if a.dry_run is not None:
        for i, (body, url) in enumerate(replies_for(a.dry_run), 1):
            print(f"----- xabar {i}{'  [tugma: ' + url + ']' if url else ''} ({len(body)} belgi)")
            print(body)
        return
    run_bot()


if __name__ == "__main__":
    main()
