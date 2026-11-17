"""Capture the demo screens into app/screenshots/ with headless Edge (or Chrome).

Start the UI first (python app/serve.py --no-browser), then:
    python app/tools/screenshots.py [--base http://127.0.0.1:8780] [--out app/screenshots]
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    shutil.which("msedge") or "",
    shutil.which("chrome") or "",
    shutil.which("google-chrome") or "",
]

# name, hash route, width, height
SHOTS = [  # all in presentation mode (customer names masked); lead lots first
    ("01_lot_524954.png", "?present=1#/lot/524954", 1920, 1080),
    ("02_lot_525192.png", "?present=1#/lot/525192", 1920, 1080),
    ("03_dashboard.png", "?present=1#/gov", 1920, 1080),
    ("04_lot_524769.png", "?present=1#/lot/524769", 1920, 1080),
    ("05_letter_524954.png", "?present=1#/lot/524954?letter", 1920, 1080),
    ("06_gov_send_524954.png", "?present=1#/gov/lot/524954?send", 1920, 1080),
    ("07_dashboard_full.png", "?present=1#/gov", 1600, 1900),
    ("08_lot_524954_full.png", "?present=1#/lot/524954", 1600, 2300),
    ("09_tenders_for_me.png", "?present=1#/?q=ta'mirlash", 1920, 1080),
    ("crop_524954_score.png", "?present=1#/lot/524954?focus=score", 1600, 1000),
    ("crop_524954_flags.png", "?present=1#/lot/524954?focus=flags", 1600, 1300),
    ("crop_525192_score.png", "?present=1#/lot/525192?focus=score", 1600, 1000),
    ("crop_525192_flags.png", "?present=1#/lot/525192?focus=flags", 1600, 1300),
    ("crop_524769_flags.png", "?present=1#/lot/524769?focus=flags", 1600, 1500),
]
BOT_LOTS = ["524954", "525192"]


def bot_preview_html(lot_id):
    """Render the bot's dry-run replies (presentation mode) as a simple chat page."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "bot"))
    import tenderlens_bot as tb
    tb.PRESENT = True
    msgs = tb.replies_for(lot_id)
    bubbles = "".join(
        f'<div class="b">{body.replace(chr(10), "<br>")}'
        + ('<div class="btn">etender.uzex.uz&#39;da ochish</div>' if url else "") + "</div>"
        for body, url in msgs)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;background:#dfe7ef;font:16px/1.45 "Segoe UI",system-ui,sans-serif;color:#0d1726}}
.wrap{{max-width:720px;margin:0 auto;padding:22px}}
.me{{margin:0 0 14px auto;width:max-content;background:#d9f7c8;border-radius:14px 14px 4px 14px;padding:9px 14px;font-weight:600}}
.b{{background:#fff;border-radius:14px 14px 14px 4px;padding:12px 16px;margin:0 0 12px;box-shadow:0 1px 2px #0002;max-width:640px}}
blockquote{{margin:6px 0;padding:4px 10px;border-left:3px solid #1546b3;background:#eef3fb;font-family:Georgia,serif}}
pre{{white-space:pre-wrap;font:14px/1.5 Consolas,monospace;background:#f4f6f8;padding:10px;border-radius:8px;margin:6px 0 0}}
.btn{{margin-top:10px;text-align:center;background:#eef3fb;color:#1546b3;font-weight:700;border-radius:8px;padding:7px}}
.hd{{text-align:center;font-weight:700;margin-bottom:14px}}.hd small{{display:block;font-weight:400;color:#66748a}}
</style></head><body><div class="wrap"><div class="hd">TenderLens bot<small>Telegram</small></div>
<div class="me">{lot_id}</div>{bubbles}</div></body></html>"""



def trim_bottom(path, pad=28):
    """Cut the empty page background below the content (needs Pillow; skipped if missing)."""
    try:
        from PIL import Image
    except ImportError:
        return
    im = Image.open(path).convert("RGB")
    w, h = im.size
    bg = im.getpixel((5, h - 5))
    px = im.load()
    last = h - 1
    while last > 0 and all(px[x, last] == bg for x in range(0, w, 7)):
        last -= 1
    im.crop((0, 0, w, min(h, last + pad))).save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://127.0.0.1:8780/")
    ap.add_argument("--out", default=str(Path(__file__).resolve().parents[1] / "screenshots"))
    ap.add_argument("--only", default="")
    a = ap.parse_args()
    browser = next((c for c in CANDIDATES if c and os.path.exists(c)), None)
    if not browser:
        sys.exit("Edge/Chrome not found")
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    prof = tempfile.mkdtemp(prefix="tl_shot_")
    base = a.base if a.base.endswith("/") else a.base + "/"
    for name, route, w, h in SHOTS:
        if a.only and a.only not in name:
            continue
        target = out / name
        cmd = [browser, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
               f"--user-data-dir={prof}", f"--window-size={w},{h}", "--force-device-scale-factor=1",
               "--virtual-time-budget=5000", f"--screenshot={target}", base + route]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
        if target.exists() and name.startswith("crop_"):
            trim_bottom(target)
        print(("ok   " if target.exists() else "FAIL ") + str(target))
    for lid in BOT_LOTS:
        name = f"10_bot_{lid}.png"
        if a.only and a.only not in name:
            continue
        page = Path(prof) / f"bot_{lid}.html"
        page.write_text(bot_preview_html(lid), encoding="utf-8")
        target = out / name
        subprocess.run([browser, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={prof}",
                        "--window-size=820,2200", "--force-device-scale-factor=1", f"--screenshot={target}",
                        page.as_uri()], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
        if target.exists():
            trim_bottom(target)
        print(("ok   " if target.exists() else "FAIL ") + str(target))
    shutil.rmtree(prof, ignore_errors=True)


if __name__ == "__main__":
    main()
