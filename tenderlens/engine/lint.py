"""LLM lint: requirements and restrictive-clause flags, each with a verified verbatim quote.

    python -m engine.lint input 524784      # write data/lint/in/524784.txt (model input)
    python -m engine.lint run 524784        # call the Claude API (needs ANTHROPIC_API_KEY)
    python -m engine.lint verify 524784     # check quotes of data/lint/524784.json

The model step is file-in / file-out:
    data/lint/in/{lot}.txt  ->  [model]  ->  data/lint/{lot}.json  ->  verify()  ->  cache
so the same verification code runs whichever backend produced the JSON.

Backends
    api         Claude API through the official SDK. Uses ONLY the ANTHROPIC_API_KEY
                environment variable; it never falls back to other credentials.
    in-session  a Claude Code session reads the input file and writes the JSON by hand
                (used on 17 Nov 2026 because no API key was configured).
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime
from functools import lru_cache
from pathlib import Path

from . import config as C
from . import extract as X
from . import uzex

LINT_IN = C.LINT / "in"
PROMPT = (Path(__file__).parent / "prompts" / "lint.md")
MAX_DOC_CHARS = 200_000
API_URL = "https://api.anthropic.com"     # fixed on purpose: ignore ANTHROPIC_BASE_URL from the shell

FLAG_TYPES = ["brand_no_equivalent", "narrow_params", "excessive_experience", "excessive_financial",
              "dealer_letter", "irrelevant_requirement", "bundling", "unrealistic_deadline",
              "short_window", "other"]
KINDS = ["qualification", "technical", "evaluation", "delivery", "payment", "other"]
SEVERITIES = ["high", "medium", "low"]
SECTORS = ["health", "education", "construction", "it", "food", "other"]
BANNED = re.compile(r"corrupt|korrup|корруп|коррупц|fraud|firibgar|collusion|til biriktir", re.I)

_S = {"type": "string"}
SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["sector", "subject_uz", "requirements", "flags", "documents_needed_uz"],
    "properties": {
        "sector": {"type": "string", "enum": SECTORS},
        "subject_uz": _S,
        "requirements": {"type": "array", "items": {
            "type": "object", "additionalProperties": False,
            "required": ["kind", "summary_uz", "summary_en", "quote"],
            "properties": {"kind": {"type": "string", "enum": KINDS},
                           "summary_uz": _S, "summary_en": _S, "quote": _S}}},
        "flags": {"type": "array", "items": {
            "type": "object", "additionalProperties": False,
            "required": ["type", "severity", "quote", "explanation_uz", "explanation_en",
                         "rewrite_uz", "rewrite_en"],
            "properties": {"type": {"type": "string", "enum": FLAG_TYPES},
                           "severity": {"type": "string", "enum": SEVERITIES},
                           "quote": _S, "explanation_uz": _S, "explanation_en": _S,
                           "rewrite_uz": _S, "rewrite_en": _S}}},
        "documents_needed_uz": {"type": "array", "items": _S},
    },
}


class LLMUnavailable(RuntimeError):
    """No API key (or no SDK): the model step is paused, nothing is invented."""


# ---- model input ----------------------------------------------------------------------
@lru_cache(maxsize=1)
def label_frequency() -> tuple[Counter, int]:
    """How many open lots carry each criterion label (to tell template wording apart)."""
    freq: Counter = Counter()
    n = 0
    for p in C.RAW_GETTRADE.glob("*.json"):
        g = uzex.read_json(p)
        n += 1
        for lab in {_clean(f.get("label")) for f in (g.get("js_fields") or [])}:
            if lab:
                freq[lab] += 1
    return freq, n


def _clean(s) -> str:
    return re.sub(r"\s+", " ", str(s or "")).strip()


def criteria_lines(g: dict, *, notes: bool = True) -> list[str]:
    """PAGE 0: the platform form, one line per criterion / qualification requirement."""
    freq, n = label_frequency() if notes else (Counter(), 0)
    lines: list[str] = []
    fields = g.get("js_fields") or []
    if fields:
        lines.append(f"Baholash mezonlari (texnik qism {g.get('tech_coef')}%, narx {g.get('cost_coef')}%, "
                     f"o'tish bali {g.get('min_point')}):")
    for i, f in enumerate(fields, 1):
        label = _clean(f.get("label"))
        bits = [f"Mezon {i}: {label}", f"maks. ball {f.get('max_score')}"]
        if f.get("rate_name"):
            bits.append(f"baholash: {_clean(f['rate_name'])}")
        if f.get("description") and _clean(f["description"]) != label:
            bits.append(f"izoh: {_clean(f['description'])}")
        if f.get("file_name"):
            bits.append(f"fayl: {_clean(f['file_name'])}" + (" (majburiy)" if f.get("is_file_required") else ""))
        steps = [f"{_clean(u.get('description'))} = {u.get('value')}" for u in (f.get("user_criteria") or [])
                 if _clean(u.get("description"))]
        if steps:
            bits.append("ballar: " + "; ".join(steps))
        line = " | ".join(bits)
        if notes and n and freq[label] >= max(5, 0.02 * n):
            line += f" [platform template wording, used in {freq[label]} of {n} open lots]"
        lines.append(line)
    quals = g.get("js_qualification_fields") or []
    if quals:
        lines.append("Malaka talablari:")
    for i, q in enumerate(quals, 1):
        t = f"Malaka {i}: {_clean(q.get('name'))}"
        if q.get("description"):
            t += f" | izoh: {_clean(q['description'])}"
        if q.get("is_disq"):
            t += " | bajarilmasa chetlatiladi"
        lines.append(t)
    for key, name in (("addon_description", "Qo'shimcha tavsif"), ("technical_description", "Texnik tavsif")):
        if _clean(g.get(key)):
            lines.append(f"{name}: {_clean(g[key])}")
    return lines


def form_values(g: dict) -> list[str]:
    """Only what the customer typed into the platform form, with none of our own labels.

    This is the page-0 text that quotes are checked against, so a quote can never
    match wording that TenderLens itself added while formatting the form.
    """
    out: list[str] = []
    for f in g.get("js_fields") or []:
        out += [str(f.get(k) or "") for k in ("label", "description", "file_name")]
        out += [str(u.get("description") or "") for u in (f.get("user_criteria") or [])]
    for q in g.get("js_qualification_fields") or []:
        out += [str(q.get("name") or ""), str(q.get("description") or "")]
    out += [str(g.get("addon_description") or ""), str(g.get("technical_description") or "")]
    return [o for o in out if o.strip()]


def lot_header(lot_id: int, g: dict, row: dict | None) -> str:
    row = row or {}
    products = []
    try:
        for p in json.loads(g.get("budget_products") or "[]")[:15]:
            products.append(f"- {_clean(p.get('Description') or p.get('Product_Name'))}; "
                            f"miqdor {p.get('Quantity')}; summa {p.get('Cost')}; "
                            f"yetkazish muddati {p.get('Delivery_Term')} ({_clean(p.get('Term_Period_Name'))})")
    except Exception:
        pass
    head = [
        f"LOT {lot_id}",
        f"Title: {_clean(row.get('name') or g.get('addon_description'))}",
        f"Customer: {_clean(g.get('customer_name'))}",
        f"Start price: {g.get('start_cost')} {g.get('currency_codeabc') or ''}",
        f"Procedure: {_clean(g.get('type_name'))}; published {g.get('start_date')}; "
        f"bids close {g.get('end_date')}; clarifications until {g.get('clarific_date')}",
        f"Advance payment {g.get('advance_payment_perc')}%; payment within {g.get('term_payment_days')} days; "
        f"bid security {g.get('pledge_value')}%",
        f"Re-announced lot: {'yes (previous lot ' + str(g.get('old_id')) + ')' if g.get('old_id') else 'no'}",
    ]
    if products:
        head.append("Items:\n" + "\n".join(products))
    return "\n".join(head)


def build_input(lot_id: int) -> dict:
    """Assemble the text the model reads; also saved to data/lint/in/{lot}.txt."""
    lot_id = int(lot_id)
    g = uzex.get_trade(lot_id, offline=True) or {}
    row = uzex.saved_trade_rows().get(lot_id)
    text = X.extract(lot_id)
    parts = [lot_header(lot_id, g, row), "", "=== PAGE 0 === (platform form: criteria and qualification)"]
    parts += criteria_lines(g)
    used, cut = 0, []
    for p in text.get("pages", []):
        t = (p.get("text") or "").strip()
        if not t:
            continue
        if used + len(t) > MAX_DOC_CHARS:
            cut.append(p["page"])
            continue
        used += len(t)
        parts += ["", f"=== PAGE {p['page']} ===", t]
    if text.get("unreadable_pages"):
        parts += ["", f"(Pages without readable text, not shown: {text['unreadable_pages']})"]
    if cut:
        parts += ["", f"(Pages left out because the document is too long: {cut})"]
    doc = "\n".join(parts)
    LINT_IN.mkdir(parents=True, exist_ok=True)
    (LINT_IN / f"{lot_id}.txt").write_text(doc, encoding="utf-8")
    return {"lot_id": lot_id, "document": doc, "chars": used, "pages_cut": cut,
            "text_status": text.get("status")}


# ---- Claude API backend ----------------------------------------------------------------
def _client():
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not key:
        raise LLMUnavailable("ANTHROPIC_API_KEY is not set; the LLM lint is paused")
    try:
        import anthropic
    except ImportError as e:
        raise LLMUnavailable("the 'anthropic' package is not installed") from e
    # Explicit key and URL: never pick up ANTHROPIC_AUTH_TOKEN / ANTHROPIC_BASE_URL or a stored profile.
    return anthropic.Anthropic(api_key=key, auth_token=None, timeout=600.0,
                               base_url=os.environ.get("TENDERLENS_ANTHROPIC_URL", API_URL))


def llm_available() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())


def _call(client, model: str, content, schema: dict, system: str, effort: str = "medium") -> dict:
    import anthropic

    kwargs = dict(
        model=model, max_tokens=32000,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": content}],
        output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema}},
    )
    try:   # server-side refusal fallback (beta); plain call if the account rejects the parameter
        with client.beta.messages.stream(betas=["server-side-fallback-2026-07-01"],
                                         fallbacks="default", **kwargs) as stream:
            msg = stream.get_final_message()
    except anthropic.BadRequestError:
        with client.messages.stream(**kwargs) as stream:
            msg = stream.get_final_message()
    if msg.stop_reason == "refusal":
        raise RuntimeError("the model declined this document")
    if msg.stop_reason == "max_tokens":
        raise RuntimeError("model output was cut off (max_tokens)")
    text = next(b.text for b in msg.content if b.type == "text")
    data = json.loads(text)
    data["_usage"] = {"input": msg.usage.input_tokens, "output": msg.usage.output_tokens}
    data["_model"] = msg.model
    return data


def run_api(lot_id: int, model: str | None = None) -> dict:
    """Lint one lot through the Claude API and save data/lint/{lot}.json."""
    client = _client()
    inp = build_input(lot_id)
    model = model or C.MODEL_BULK
    raw = _call(client, model, inp["document"], SCHEMA, PROMPT.read_text(encoding="utf-8"))
    raw.update(lot_id=int(lot_id), backend="api", model=raw.pop("_model", model),
               usage=raw.pop("_usage", None), pages_cut=inp["pages_cut"],
               created_at=datetime.now().astimezone().isoformat(timespec="seconds"))
    uzex.write_json(C.LINT / f"{int(lot_id)}.json", raw)
    return raw


TRANSCRIBE_SYSTEM = (
    "You transcribe scanned pages of an Uzbek public-procurement specification. The text is Uzbek "
    "(Cyrillic or Latin) and/or Russian. Return JSON {\"pages\": [{\"page\": n, \"text\": \"...\"}]}. "
    "Transcribe exactly what is printed, line by line, tables row by row with ' | ' between cells. "
    "Do not translate, summarise, correct or add anything. Write [o'qib bo'lmadi] where a word is illegible. "
    "Skip stamps, signatures and handwriting.")
TRANSCRIBE_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["pages"],
    "properties": {"pages": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["page", "text"],
        "properties": {"page": {"type": "integer"}, "text": _S}}}}}


def transcribe_api(lot_id: int, model: str | None = None, batch: int = 8) -> dict:
    """Vision transcription of pages that have no usable text layer -> data/text/vision/{lot}.json."""
    client = _client()
    model = model or C.MODEL_BULK
    pngs = X.render_pages(lot_id, dpi=130)
    pages: dict[str, str] = {}
    for i in range(0, len(pngs), batch):
        content: list[dict] = []
        for png in pngs[i:i + batch]:
            content.append({"type": "text", "text": f"Page {int(png.stem[1:])}:"})
            content.append({"type": "image", "source": {
                "type": "base64", "media_type": "image/png",
                "data": base64.standard_b64encode(png.read_bytes()).decode("ascii")}})
        content.append({"type": "text", "text": "Transcribe these pages."})
        out = _call(client, model, content, TRANSCRIBE_SCHEMA, TRANSCRIBE_SYSTEM, effort="low")
        for p in out.get("pages", []):
            pages[str(p["page"])] = p["text"]
    res = {"lot_id": int(lot_id), "model": model, "backend": "api", "pages": pages}
    X.VISION.mkdir(parents=True, exist_ok=True)
    uzex.write_json(X.VISION / f"{int(lot_id)}.json", res)
    return X.extract(lot_id, force=True)


# ---- verification ----------------------------------------------------------------------
_WS = re.compile(r"[\s\u00a0\u200b\u200c\u200d\ufeff]+")


def norm(s: str) -> str:
    """The only normalisation the contract allows: whitespace and letter case."""
    return _WS.sub(" ", s or "").strip().casefold()


def corpus(lot_id: int) -> list[tuple[int, str]]:
    """(page, normalised text). Page 0 is the platform form from GetTrade."""
    g = uzex.get_trade(int(lot_id), offline=True) or {}
    pages = [(0, norm("\n".join(form_values(g))))]
    for p in X.extract(int(lot_id)).get("pages", []):
        if (p.get("text") or "").strip():
            pages.append((p["page"], norm(p["text"])))
    return pages


def find_quote(quote: str, pages: list[tuple[int, str]]) -> int | None:
    """Page on which the quote appears verbatim (after norm), preferring the spec over page 0."""
    q = norm(quote).strip(" \"'«»“”.,;:")
    if len(q) < 12:
        return None
    for page, text in sorted(pages, key=lambda x: (x[0] == 0, x[0])):
        if q in text:
            return page
    return None


def verify(lot_id: int, raw: dict) -> dict:
    """Keep only items whose quote is found in the extracted text. Returns contract-shaped lists."""
    pages = corpus(lot_id)
    reqs, flags, dropped = [], [], []
    for r in raw.get("requirements") or []:
        page = find_quote(r.get("quote", ""), pages)
        if page is None or r.get("kind") not in KINDS:
            dropped.append({"what": "requirement", "quote": r.get("quote"), "reason": "quote not found"})
            continue
        reqs.append({"id": f"r{len(reqs) + 1}", "kind": r["kind"], "summary_uz": _clean(r.get("summary_uz")),
                     "summary_en": _clean(r.get("summary_en")), "quote": _clean(r["quote"]), "page": page,
                     "source": "platform_form" if page == 0 else "spec"})
    seen: list[str] = []
    for f in raw.get("flags") or []:
        page = find_quote(f.get("quote", ""), pages)
        text_blob = " ".join(str(f.get(k, "")) for k in ("explanation_uz", "explanation_en", "rewrite_uz", "rewrite_en"))
        reason = None
        if page is None:
            reason = "quote not found in the extracted text"
        elif f.get("type") not in FLAG_TYPES or f.get("severity") not in SEVERITIES:
            reason = "unknown type or severity"
        elif BANNED.search(text_blob):
            reason = "banned wording"
        elif any(norm(f["quote"]) in s or s in norm(f["quote"]) for s in seen):
            reason = "duplicate of another flag"
        if reason:
            dropped.append({"what": "flag", "type": f.get("type"), "quote": f.get("quote"), "reason": reason})
            continue
        seen.append(norm(f["quote"]))
        flags.append({"id": f"f{len(flags) + 1}", "type": f["type"], "severity": f["severity"],
                      "quote": _clean(f["quote"]), "page": page, "quote_verified": True,
                      "source": "platform_form" if page == 0 else "spec",
                      "explanation_uz": _clean(f.get("explanation_uz")), "explanation_en": _clean(f.get("explanation_en")),
                      "rewrite_uz": _clean(f.get("rewrite_uz")), "rewrite_en": _clean(f.get("rewrite_en"))})
        if re.fullmatch(r"[a-z0-9_]{1,40}", str(f.get("group_id") or "")):
            flags[-1]["group_id"] = f["group_id"]      # flags that restate one finding share a group_id
    docs = [_clean(d) for d in raw.get("documents_needed_uz") or [] if _clean(d) and not BANNED.search(d)]
    return {"requirements": reqs, "flags": flags, "dropped": dropped, "documents_needed_uz": docs,
            "sector": raw.get("sector") if raw.get("sector") in SECTORS else None,
            "subject_uz": _clean(raw.get("subject_uz")), "model": raw.get("model"), "backend": raw.get("backend")}


def load_raw(lot_id: int) -> dict | None:
    p = C.LINT / f"{int(lot_id)}.json"
    return uzex.read_json(p) if p.exists() else None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["input", "run", "verify", "transcribe"])
    ap.add_argument("lot", nargs="+")
    ap.add_argument("--model")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    for lot in a.lot:
        lid = uzex.lot_id_from(lot)
        if a.cmd == "input":
            r = build_input(lid)
            print(lid, r["text_status"], r["chars"], "chars ->", LINT_IN / f"{lid}.txt")
        elif a.cmd in ("run", "transcribe"):
            try:
                if a.cmd == "run":
                    r = run_api(lid, a.model)
                    print(lid, "flags:", len(r.get("flags", [])), "requirements:", len(r.get("requirements", [])))
                else:
                    r = transcribe_api(lid, a.model)
                    print(lid, r["status"], r["text_source"], r.get("chars"))
            except LLMUnavailable as e:
                print("PAUSED:", e)
                return 2
        else:
            raw = load_raw(lid)
            if raw is None:
                print(lid, "no lint output on disk"); continue
            v = verify(lid, raw)
            print(lid, f"{len(v['flags'])} flags kept, {len(v['requirements'])} requirements kept,",
                  f"{len(v['dropped'])} dropped")
            for f in v["flags"]:
                print(f"   [{f['severity']}] {f['type']} p{f['page']}: {f['quote'][:110]}")
            for d in v["dropped"]:
                print(f"   DROPPED {d['what']}: {d['reason']}: {str(d['quote'])[:90]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
