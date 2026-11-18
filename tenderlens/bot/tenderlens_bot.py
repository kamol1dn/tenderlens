"""TenderLens Telegram bot: send a lot number or an etender link -> score, flags with quotes, verdict, letter.

    python bot/tenderlens_bot.py                 # run the bot (needs TENDERLENS_BOT_TOKEN)
    python bot/tenderlens_bot.py --dry-run 524784  # print the replies, no Telegram needed

Token: environment variable TENDERLENS_BOT_TOKEN, or a line TENDERLENS_BOT_TOKEN=... in
tenderlens/.env or bot/.env. The token is never printed or logged.

Data: engine API (127.0.0.1:8765) -> data/cache/. No mock data.
Customer names are masked by default (presentation mode); TENDERLENS_PRESENT=0 shows them.
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


_SKIP_REASON = re.compile(r"^(qatnashish mumkin|qatnashing|tushuntirish so'rash muddati|lot qayta e'lon|buyurtmachining so'nggi)", re.I)


def _sentences(s, n=300):
    s = norm(s)
    if len(s) <= n:
        return s
    out = ""
    for p in re.findall(r"[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$", s):
        if len((out + p).strip()) > n:
            break
        out += p
    if out.strip():
        return out.strip()
    first = (re.findall(r"[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$", s) or [s])[0].strip()
    return first if len(first) <= n * 2 else (s[:n].rsplit(" ", 1)[0] + "…")


def group_flags(flags):
    out, by = [], {}
    for f in flags:
        g = f.get("group_id")
        if g and g in by:
            by[g]["_n"] += 1
            continue
        f = dict(f, _n=1)
        if g:
            by[g] = f
        out.append(f)
    return out


def format_verdict(lot, max_flags=3, closed=False):
    flags = group_flags(verified_flags(lot))
    lt = light_of(lot)
    icon, lt_name = LIGHT.get(lt, ("⚪️", "baho hali hisoblanmagan"))
    title = lot.get("subject_uz") or lot.get("title_uz") or lot.get("title") or ""
    cust = (lot.get("customer") or {}).get("name", "")
    v = lot.get("verdict") or {}
    out = [
        f"{icon} <b>Lot {e(lot.get('lot_id'))}</b> — {e(title)}",
        f"Buyurtmachi: {e(cust)}",
        f"Boshlang'ich narx: <b>{e(money(lot.get('start_cost'), lot.get('currency')))}</b> · Muddat: <b>{e(fmt_date(lot.get('end_date')))}</b>"
        + (" · <b>yopilgan</b>" if closed else ""),
        "",
        (f"<b>Adolatlilik bali: {e(lot['fairness_score'])}/100</b> ({lt_name})" if lot.get("fairness_score") is not None
         else f"<b>Adolatlilik bali:</b> {lt_name}"),
        ("<b>Holat:</b> 🔒 Lot yopilgan — takliflar qabul qilinmaydi" if closed
         else f"<b>Tavsiya:</b> {e(VERDICT.get(v.get('decision'), 'hali tayyor emas'))}"),
    ]
    if not closed:
        reasons = [norm(r) for r in (v.get("reasons_uz") or []) if not _SKIP_REASON.match(norm(r))]
        for r in reasons[:2]:
            r = re.sub(r"(\d+)-bet\)", r"\1-sahifa)", r).replace("(platformadagi mezonlar)", "(Platforma mezonlari formasi)")
            out.append(f"• {e(_sentences(r))}")
        if lot.get("clarific_date"):
            out.append(f"• Aniqlik so'rash muddati: {e(fmt_date(lot['clarific_date']))}")
    out.append("")
    if flags:
        out.append(f"<b>Topilgan cheklovchi shartlar ({len(flags)}):</b>")
        for i, f in enumerate(flags[:max_flags], 1):
            where = "Platforma mezonlari formasi" if (f.get("source") == "platform_form" or f.get("page") in (0, "0")) else (f"{f.get('page')}-sahifa" if f.get("page") else "")
            if f.get("criterion_no"):
                where = f"{f['criterion_no']}-mezon, {where}"
            out.append(f"{i}. {SEV.get(f.get('severity'), '')} · <b>{e(f.get('type_label_uz') or FLAG_TYPE.get(f.get('type'), f.get('type')))}</b> ({e(where)})")
            out.append(f"<blockquote>«{e(norm(f.get('quote')))}»</blockquote>"
                       + (f"\n<i>(hujjatda yana {f['_n'] - 1} marta takrorlanadi)</i>" if f.get("_n", 1) > 1 else ""))
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
    if (lot.get("money_on_table_uzs") or 0) >= 1e6:
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
# On by default (TENDERLENS_PRESENT=0 or --no-present shows real names). Customer names become
# "Buyurtmachi A/B/…" in the same order as the web UI; titles come from app/masking.py, shared
# with the web server, so the bot and the page show the same neutral title.
sys.path.insert(0, str(ROOT / "app"))
import masking  # noqa: E402

PRESENT = os.environ.get("TENDERLENS_PRESENT", "1") not in ("0", "false", "no")


def _index():
    try:
        with urllib.request.urlopen(f"{ENGINE}/api/lots", timeout=10) as r:
            return json.loads(r.read().decode("utf-8"))
    except (urllib.error.URLError, OSError, TimeoutError, ValueError):
        f = CACHE / "index.json"
        if f.exists():
            try:
                return json.loads(f.read_text(encoding="utf-8"))
            except ValueError:
                return []
    return []


def mask_lot(lot):
    c = lot.get("customer") or {}
    name, tin = c.get("name") or "", str(c.get("tin") or "")
    label = masking.alias_for(masking.alias_table(_index()), tin, name)
    title = masking.present_title(lot)

    def walk(v):
        if isinstance(v, str):
            if name and len(name) > 3:
                v = v.replace(name, label)
            v = v.replace(tin, "•••") if tin else v
            return masking.mask_places(masking.mask_text(v, [name])).replace(masking.mask_text(label), label)
        if isinstance(v, list):
            return [walk(x) for x in v]
        if isinstance(v, dict):
            return {k: walk(x) for k, x in v.items()}
        return v

    letter = lot.get("clarification_letter_uz")
    out = walk({k: v for k, v in lot.items() if k != "clarification_letter_uz"})
    if letter:
        out["clarification_letter_uz"] = walk(masking.neutral_letter(letter, title, _today()))
        out["clarification_letter_uz"] = masking.neutral_letter(out["clarification_letter_uz"], title)
    out["customer"] = {"name": label, "tin": ""}
    for k in ("title", "title_uz", "region"):
        out.pop(k, None)
    out["subject_uz"] = title
    out["display_no"] = ""
    return out


def _today():
    d = datetime.now()
    return f"{d.day}-{MONTHS[d.month - 1]} {d.year}-yil"


def is_closed(lot):
    try:
        return datetime.fromisoformat(str(lot.get("end_date")).replace("Z", "")[:19]) < datetime.now()
    except ValueError:
        return False


def replies_for(text):
    """Pure function: user text -> list of (html_message, url_button_or_None)."""
    lot_id = lot_id_from(text)
    if not lot_id:
        return [(HELP, None)]
    lot, _src = fetch_lot(lot_id)
    if not lot:
        return [(f"🔎 <b>{lot_id}</b>-son lot hali tahlil qilinmagan.\n"
                 "Hozircha faqat oldindan tahlil qilingan lotlar bo'yicha javob beraman.", None)]
    if PRESENT:
        lot = mask_lot(lot)
    closed = is_closed(lot)
    url = None if PRESENT else (lot.get("url") or f"https://etender.uzex.uz/lot/{lot_id}")
    msgs = [(m, None) for m in split_html(format_verdict(lot, closed=closed))]
    msgs[-1] = (msgs[-1][0], url)
    if closed:
        msgs.append(("🔒 Lot yopilgan, aniqlik so'rash muddati o'tgan — xat yuborilmaydi. "
                     "Tahlil arxiv sifatida ko'rsatildi.", None))
    else:
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
        await msg.reply_html("⏳ Qidirilmoqda…")
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
    ap.add_argument("--present", action="store_true", help="mask customer names (default)")
    ap.add_argument("--no-present", action="store_true", help="show real customer names")
    a = ap.parse_args()
    global PRESENT
    PRESENT = (PRESENT or a.present) and not a.no_present
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
