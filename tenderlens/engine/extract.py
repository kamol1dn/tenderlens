"""Turn a saved spec file into per-page text.

    python -m engine.extract 524784           # one lot
    python -m engine.extract --all            # every spec on disk (resumable)
    python -m engine.extract --render 523837  # write page PNGs for OCR / vision

Output: data/text/{lot_id}.json
    {"lot_id", "file", "n_pages", "text_source": "text|ocr|vision|none",
     "language": "uz-cyrl|uz-latn|ru|mixed|unknown", "status": "ok|needs_ocr|unsupported|missing",
     "pages": [{"page": 1, "text": "...", "source": "text|ocr|vision", "quality": 0.93}], ...}

text_source meanings
    text    born-digital text layer
    ocr     text layer produced by a scanner's OCR (page is a full-page image), or tesseract
    vision  page images transcribed by a vision model (data/text/vision/{lot_id}.json)
    none    nothing readable yet (scan without text layer and no OCR available)
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

from . import config as C
from . import uzex

VISION = C.TEXT / "vision"
PAGES = C.TEXT / "pages"
UNRAR = [r"C:\Program Files\WinRAR\UnRAR.exe", "unrar", "UnRAR.exe"]
DOC_EXT = {".pdf", ".docx"}
MAX_PAGES = 120          # hard cap per lot

CYR = "абвгдеёжзийклмнопрстуфхцчшщъыьэюяўқғҳ"
CYR_VOW = set("аеёиоуыэюяў")
LAT_VOW = set("aeiouy")
STOP = set("""ва билан учун буйича бўйича хам ҳам ёки керак лозим талаб талаблар хизмат товар шартнома
томонидан бўлган булган бўлиши булиши тўғрисида хужжат ҳужжат иштирокчи буюртмачи муддати балл техник
для или при на по не что как это должен должны требования поставщик товара заказчик договора участник
срок работ услуг качества документ наличие
va bilan uchun bo'yicha ham yoki kerak lozim talab talablar xizmat tovar shartnoma tomonidan bo'lgan
bo'lishi to'g'risida hujjat ishtirokchi buyurtmachi muddati ball texnik haqida kamida tashkilot""".split())
_TOKEN = re.compile(r"[^\W\d_]{3,}", re.UNICODE)


# ---- text quality ---------------------------------------------------------------
def quality(text: str) -> float:
    """0..1: share of word tokens that look like real Uzbek/Russian words.

    A token is good when it is written in one script and contains a vowel of that
    script. Empty or near-empty text scores 0. Text with almost no common function
    words is capped at 0.3, which catches fonts whose text layer maps to arbitrary
    letters.
    """
    t = text.strip()
    if len(t) < 40:
        return 0.0
    toks = _TOKEN.findall(t.lower())
    if len(toks) < 8:
        return 0.0
    good = stop = 0
    for w in toks:
        cyr = sum(1 for ch in w if "\u0400" <= ch <= "\u04ff")
        lat = sum(1 for ch in w if "a" <= ch <= "z")
        if cyr == len(w) and CYR_VOW & set(w):
            good += 1
        elif lat == len(w) and LAT_VOW & set(w):
            good += 1
        if w in STOP:
            stop += 1
    q = good / len(toks)
    junk = sum(1 for ch in t if "\u0080" <= ch <= "\u00ff" or "\u2500" <= ch <= "\u25ff") / len(t)
    if junk > 0.08:
        q = min(q, 0.3)
    if len(toks) >= 150 and stop / len(toks) < 0.008:
        q = min(q, 0.3)
    return round(q, 3)


def repair_mojibake(text: str) -> str | None:
    """Cyrillic stored as cp1251 but decoded as Latin-1 ('Íàâáàõîð') -> real Cyrillic."""
    hi = sum(1 for ch in text if "\u00c0" <= ch <= "\u00ff")
    if hi < 30 or hi < 0.2 * len(text.strip() or " "):
        return None
    try:
        fixed = text.encode("cp1252", errors="replace").decode("cp1251", errors="replace")
    except Exception:
        return None
    return fixed if quality(fixed) > max(0.6, quality(text) + 0.2) else None


def detect_language(text: str) -> str:
    t = text.lower()
    cyr = sum(1 for ch in t if "\u0400" <= ch <= "\u04ff")
    lat = sum(1 for ch in t if "a" <= ch <= "z")
    if cyr + lat < 100:
        return "unknown"
    toks = _TOKEN.findall(t)
    n = max(len(toks), 1)
    uz_c = sum(1 for w in toks if w in UZ_CYR) / n
    ru = sum(1 for w in toks if w in RU) / n
    uz_l = sum(1 for w in toks if w in UZ_LAT) / n
    if lat > 2 * cyr:
        return "uz-latn" if uz_l >= 0.01 or ru + uz_c < 0.005 else "mixed"
    scores = {"uz-cyrl": uz_c, "ru": ru, "uz-latn": uz_l * (lat / (cyr + lat + 1)) * 2}
    top = max(scores, key=scores.get)
    rest = sorted(scores.values(), reverse=True)
    if rest[0] == 0:
        return "unknown"
    return "mixed" if rest[1] >= 0.4 * rest[0] else top


UZ_CYR = set("ва билан учун буйича бўйича хам ҳам ёки керак лозим булган бўлган булиши бўлиши томонидан "
             "тўғрисида тугрисида хизмат хизматлар талаб талаблар куйидаги қуйидаги берилади бериш хужжат "
             "ҳужжат шартнома муддати мавжуд мавжудлиги камида буюртмачи иштирокчи кўрсатиш курсатиш "
             "учун ушбу хар ҳар йил сони хисоб асосида".split())
RU = set("для или при что как это должен должны должна требования поставщик товара товаров заказчик "
         "договора участник срок работ услуг качества наличие также если может быть более менее "
         "согласно соответствии является случае после только поставки оплата".split())
UZ_LAT = set("va bilan uchun ham yoki kerak lozim bo'lgan bo'lishi tomonidan xizmat talab talablar "
             "hujjat shartnoma muddati mavjud kamida buyurtmachi ishtirokchi ushbu har yil soni "
             "asosida haqida boʻyicha bo‘yicha bo'yicha berish beriladi ko'rsatish tashkilot".split())


# ---- readers ----------------------------------------------------------------------
def _pdf_pages(path: Path) -> list[dict]:
    """Per-page text with a quality score; fitz first (fast), pypdf as a second opinion."""
    import fitz  # PyMuPDF

    out: list[dict] = []
    try:
        doc = fitz.open(path)
    except Exception as e:
        return [{"page": 1, "text": "", "source": "none", "quality": 0.0, "error": str(e)[:120]}]
    pypdf_reader = None
    for i, page in enumerate(doc, 1):
        if i > MAX_PAGES:
            break
        try:
            text = page.get_text() or ""
        except Exception:
            text = ""
        q = quality(text)
        if q < 0.55:
            fixed = repair_mojibake(text)
            if fixed:
                text, q = fixed, quality(fixed)
        if q < 0.55:  # second opinion from pypdf
            try:
                if pypdf_reader is None:
                    import pypdf
                    pypdf_reader = pypdf.PdfReader(str(path))
                alt = pypdf_reader.pages[i - 1].extract_text() or ""
                if quality(alt) > q + 0.1:
                    text, q = alt, quality(alt)
            except Exception:
                pass
        scanned = False
        try:
            area = abs(page.rect)
            for img in page.get_image_info():
                x0, y0, x1, y1 = img["bbox"]
                if area and (x1 - x0) * (y1 - y0) / area > 0.6:
                    scanned = True
                    break
        except Exception:
            pass
        src = ("ocr" if scanned else "text") if q >= 0.55 else "none"
        out.append({"page": i, "text": text if q >= 0.55 else "", "source": src, "quality": q,
                    "scanned": scanned, "raw_chars": len(text.strip())})
    doc.close()
    return out


def _docx_pages(path: Path) -> list[dict]:
    import docx

    try:
        d = docx.Document(str(path))
    except Exception as e:
        return [{"page": 1, "text": "", "source": "none", "quality": 0.0, "error": str(e)[:120]}]
    parts: list[str] = [p.text for p in d.paragraphs if p.text.strip()]
    for table in d.tables:
        for row in table.rows:
            cells: list[str] = []
            for cell in row.cells:
                t = cell.text.strip()
                if t and (not cells or cells[-1] != t):   # merged cells repeat
                    cells.append(t)
            if cells:
                parts.append(" | ".join(cells))
    # DOCX has no fixed pages: cut pseudo-pages of ~3,500 characters at paragraph ends.
    pages, buf, size = [], [], 0
    for part in parts:
        buf.append(part)
        size += len(part)
        if size >= 3500:
            pages.append("\n".join(buf)); buf, size = [], 0
    if buf:
        pages.append("\n".join(buf))
    return [{"page": i, "text": t, "source": "text", "quality": quality(t)} for i, t in enumerate(pages or [""], 1)]


def _safe_name(name: str, n: int) -> str:
    ext = Path(name).suffix.lower()
    return f"{n:03d}{ext if re.fullmatch(r'\.[a-z0-9]{1,5}', ext) else '.bin'}"


def unpack(lot_id: int, path: Path) -> list[Path]:
    """Unpack a zip/rar into data/specs/unpacked/{lot_id}/ with neutral file names."""
    dest = C.UNPACKED / str(lot_id)
    if dest.exists() and any(dest.iterdir()):
        return sorted(p for p in dest.iterdir() if p.is_file())
    dest.mkdir(parents=True, exist_ok=True)
    ext = path.suffix.lower()
    if ext == ".zip":
        try:
            with zipfile.ZipFile(path) as z:
                infos = [i for i in z.infolist() if not i.is_dir()][:40]
                names = {}
                for n, info in enumerate(infos, 1):
                    if info.file_size > 80 * 1024 * 1024:
                        continue
                    target = dest / _safe_name(info.filename, n)   # never trust archive paths
                    with z.open(info) as src, open(target, "wb") as out:
                        shutil.copyfileobj(src, out)
                    names[target.name] = info.filename
                uzex.write_json(dest / "_names.json", names)
        except Exception as e:
            uzex.write_json(dest / "_error.json", {"error": str(e)[:200]})
    elif ext == ".rar":
        exe = next((x for x in UNRAR if shutil.which(x) or Path(x).exists()), None)
        if exe is None:
            return []
        tmp = dest / "_x"
        tmp.mkdir(exist_ok=True)
        try:   # 'e' flattens paths; -o+ overwrite; -p- never prompt for a password
            subprocess.run([exe, "e", "-o+", "-p-", "-y", str(path), str(tmp) + "\\"],
                           capture_output=True, timeout=180)
        except Exception as e:
            uzex.write_json(dest / "_error.json", {"error": str(e)[:200]})
        names = {}
        for n, f in enumerate(sorted(p for p in tmp.rglob("*") if p.is_file())[:40], 1):
            target = dest / _safe_name(f.name, n)
            shutil.move(str(f), target)
            names[target.name] = f.name
        shutil.rmtree(tmp, ignore_errors=True)
        uzex.write_json(dest / "_names.json", names)
    return sorted(p for p in dest.iterdir() if p.is_file() and not p.name.startswith("_"))


def render_pages(lot_id: int, dpi: int = 110, max_pages: int = 30) -> list[Path]:
    """Write PNGs of the pages that have no usable text (for tesseract or a vision model)."""
    import fitz

    files = _doc_files(lot_id)
    out_dir = PAGES / str(lot_id)
    out_dir.mkdir(parents=True, exist_ok=True)
    info = uzex.read_json(C.TEXT / f"{lot_id}.json") if (C.TEXT / f"{lot_id}.json").exists() else extract(lot_id)
    need = {p["page"] for p in info["pages"] if p["source"] == "none"}
    out, n = [], 0
    for f in files:
        if f.suffix.lower() != ".pdf":
            n += 1
            continue
        doc = fitz.open(f)
        for page in doc:
            n += 1
            if n in need and len(out) < max_pages:
                target = out_dir / f"p{n:03d}.png"
                if not target.exists():
                    page.get_pixmap(dpi=dpi).save(target)
                out.append(target)
        doc.close()
    return out


def _doc_files(lot_id: int) -> list[Path]:
    path = uzex.spec_path(lot_id)
    if path is None:
        return []
    ext = path.suffix.lower()
    if ext in (".zip", ".rar"):
        files = [p for p in unpack(lot_id, path) if p.suffix.lower() in DOC_EXT]
        return files
    return [path] if ext in DOC_EXT else []


def _tesseract(lot_id: int, pages: list[dict]) -> None:
    """Optional: fill empty pages with tesseract (uzb+rus) when it is installed."""
    exe = shutil.which("tesseract")
    if not exe:
        return
    for png in render_pages(lot_id, dpi=200):
        n = int(png.stem[1:])
        try:
            r = subprocess.run([exe, str(png), "stdout", "-l", "uzb_cyrl+uzb+rus"],
                               capture_output=True, timeout=120)
            text = r.stdout.decode("utf-8", errors="replace")
        except Exception:
            continue
        q = quality(text)
        if q >= 0.55:
            pages[n - 1].update(text=text, source="ocr", quality=q)


# ---- main entry -------------------------------------------------------------------
def extract(lot_id: int, *, force: bool = False) -> dict:
    lot_id = int(lot_id)
    out_path = C.TEXT / f"{lot_id}.json"
    vision_path = VISION / f"{lot_id}.json"
    if out_path.exists() and not force:
        cached = uzex.read_json(out_path)
        if not (vision_path.exists() and cached.get("text_source") != "vision"
                and cached.get("status") != "ok"):
            return cached
    spec = uzex.spec_path(lot_id)
    res: dict = {"lot_id": lot_id, "file": None, "n_pages": 0, "text_source": "none",
                 "language": "unknown", "status": "missing", "pages": []}
    if spec is None:
        uzex.write_json(out_path, res)
        return res
    res["file"] = f"data/specs/{spec.name}"
    files = _doc_files(lot_id)
    if not files:
        res["status"] = "unsupported"
        res["note"] = ("archive without a readable PDF/DOCX inside"
                       if spec.suffix.lower() in (".zip", ".rar") else f"unsupported type {spec.suffix}")
        uzex.write_json(out_path, res)
        return res
    pages: list[dict] = []
    for f in files:
        part = _pdf_pages(f) if f.suffix.lower() == ".pdf" else _docx_pages(f)
        for p in part:
            p["page"] = len(pages) + 1
            if len(files) > 1:
                p["file"] = f.name
            pages.append(p)
        if len(pages) >= MAX_PAGES:
            pages = pages[:MAX_PAGES]
            break
    if any(p["source"] == "none" for p in pages):
        _tesseract(lot_id, pages)
    if vision_path.exists():               # transcription made by a vision model
        v = uzex.read_json(vision_path)
        for p in pages:
            t = (v.get("pages") or {}).get(str(p["page"]))
            if t and p["source"] == "none":
                p.update(text=t, source="vision", quality=quality(t))
        res["vision_model"] = v.get("model")
    ok = [p for p in pages if p["source"] != "none" and p["text"].strip()]
    chars = sum(len(p["text"]) for p in ok)
    res["n_pages"] = len(pages)
    res["pages"] = pages
    res["chars"] = chars
    res["unreadable_pages"] = [p["page"] for p in pages if p["source"] == "none"]
    if ok:
        counts: dict[str, int] = {}
        for p in ok:
            counts[p["source"]] = counts.get(p["source"], 0) + len(p["text"])
        res["text_source"] = max(counts, key=counts.get)
        res["language"] = detect_language("\n".join(p["text"] for p in ok)[:60000])
    readable = len(ok) / max(len(pages), 1)
    mean_q = sum(p["quality"] * len(p["text"]) for p in ok) / max(chars, 1)
    res["quality"] = round(mean_q, 3)
    # Readable enough to lint: real words, and either most pages or a solid amount of text.
    res["status"] = ("ok" if ok and chars >= 300 and mean_q >= 0.7
                     and (readable >= 0.5 or chars >= 2500) else "needs_ocr")
    uzex.write_json(out_path, res)
    return res


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("lot", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--render", action="store_true", help="write PNGs of unreadable pages")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    ids = [uzex.lot_id_from(x) for x in a.lot]
    if a.all:
        ids = sorted({int(p.stem) for p in C.SPECS.iterdir() if p.is_file() and p.stem.isdigit()})
    for lid in ids:
        try:
            r = extract(lid, force=a.force)
        except Exception as e:
            print(lid, "ERROR", type(e).__name__, str(e)[:100]); continue
        print(lid, r["status"], r["text_source"], r["language"], f"{r['n_pages']}p",
              f"{r.get('chars', 0)}ch", "unreadable:", len(r.get("unreadable_pages", [])), r.get("note", ""))
        if a.render and r.get("unreadable_pages"):
            print("   rendered", len(render_pages(lid)), "page images to", PAGES / str(lid))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
