"""Labelling page for human reviewers:  http://127.0.0.1:8765/label

One clause per screen, the quote highlighted in its surrounding text, three buttons.
Answers are written straight into data/eval/labels.csv (human_restrictive, label_status,
reviewer, human_type, notes) and appended to data/eval/label_log.jsonl.

The page does not show whether TenderLens flagged the clause, so the reviewer's answer
is independent of the system's. `python -m engine.evalset score` then gives precision.
"""
from __future__ import annotations

import hashlib
import json
import re
import threading
import time
from datetime import datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from . import config as C
from . import evalset as E
from . import extract as X
from . import lint as L
from . import score as SC
from . import uzex

router = APIRouter()
_lock = threading.Lock()
_leases: dict[str, tuple[str, float]] = {}      # key -> (reviewer, time): avoids two people getting one clause
LEASE_SECONDS = 300
LOG = C.EVAL / "label_log.jsonl"
ANSWERS = {"yes", "no", "unsure"}


key_of = E.key_of


def _done(row: dict) -> bool:
    return (row.get("label_status") or "").strip().lower() in ("confirmed", "unsure")


def _order(rows: list[dict]) -> list[dict]:
    """Flagged and unflagged clauses interleaved 2:1, in a fixed pseudo-random order."""
    h = lambda r: hashlib.sha1(key_of(r).encode()).hexdigest()
    yes = sorted((r for r in rows if r["system_flagged"] == "yes"), key=h)
    no = sorted((r for r in rows if r["system_flagged"] != "yes"), key=h)
    out: list[dict] = []
    while yes or no:
        out += yes[:2]; yes = yes[2:]
        out += no[:1]; no = no[1:]
    return out


_context = E.context


def _progress(rows: list[dict], reviewer: str = "") -> dict:
    done = [r for r in rows if _done(r)]
    return {"total": len(rows), "done": len(done),
            "confirmed": sum(1 for r in done if r["label_status"].strip().lower() == "confirmed"),
            "mine": sum(1 for r in done if (r.get("reviewer") or "") == reviewer) if reviewer else 0}


@router.get("/api/label/next")
def next_item(reviewer: str = ""):
    reviewer = reviewer.strip()[:40]
    with _lock:
        rows = E.read()
        now = time.time()
        for k in [k for k, (_, t) in _leases.items() if now - t > LEASE_SECONDS]:
            _leases.pop(k, None)
        pick = None
        for r in _order(rows):
            k = key_of(r)
            held = _leases.get(k)
            if _done(r) or (held and held[0] != reviewer):
                continue
            pick = r
            _leases[k] = (reviewer, now)
            break
        prog = _progress(rows, reviewer)
    if pick is None:
        return {"finished": True, "progress": prog}
    lot_id, page = int(pick["lot_id"]), int(pick["page"] or 0)
    before, quote, after = _context(lot_id, page, pick["clause_quote"])
    rec = uzex.read_json(C.CACHE_LOTS / f"{lot_id}.json") if (C.CACHE_LOTS / f"{lot_id}.json").exists() else {}
    return {"finished": False, "key": key_of(pick), "lot_id": lot_id,
            "title": rec.get("title", ""), "subject_uz": rec.get("subject_uz", ""),
            "customer": (rec.get("customer") or {}).get("name", ""),
            "start_cost": rec.get("start_cost"), "currency": rec.get("currency", "UZS"),
            "url": C.LOT_URL.format(lot_id=lot_id), "page": page,
            "before": before, "quote": quote, "after": after, "progress": prog}


class Answer(BaseModel):
    key: str
    reviewer: str
    answer: str
    human_type: str = ""
    notes: str = ""


@router.post("/api/label")
def save(a: Answer):
    if a.answer not in ANSWERS:
        raise HTTPException(400, detail={"status": "bad_request", "message": "answer must be yes, no or unsure"})
    reviewer = a.reviewer.strip()[:40]
    if not reviewer:
        raise HTTPException(400, detail={"status": "bad_request", "message": "reviewer name is required"})
    if a.human_type and a.human_type not in L.FLAG_TYPES:
        raise HTTPException(400, detail={"status": "bad_request", "message": "unknown human_type"})
    with _lock:
        rows = E.read()
        row = next((r for r in rows if key_of(r) == a.key), None)
        if row is None:
            raise HTTPException(404, detail={"status": "not_found", "message": "clause not found"})
        row["human_restrictive"] = a.answer
        row["label_status"] = "confirmed" if a.answer in ("yes", "no") else "unsure"
        row["human_type"] = a.human_type if a.answer == "yes" else ""
        row["reviewer"] = reviewer
        row["notes"] = a.notes.strip()[:500]
        E.write(rows)
        _leases.pop(a.key, None)
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps({"at": datetime.now().astimezone().isoformat(timespec="seconds"), "key": a.key,
                                "lot_id": row["lot_id"], "reviewer": reviewer, "answer": a.answer,
                                "human_type": row["human_type"], "notes": row["notes"]}, ensure_ascii=False) + "\n")
        prog = _progress(rows, reviewer)
    return {"ok": True, "progress": prog}


@router.get("/api/label/progress")
def progress():
    with _lock:
        rows = E.read()
    return {"progress": _progress(rows), "score": E.score()}


@router.get("/label", response_class=HTMLResponse)
def page():
    types = json.dumps([{"v": t, "t": SC.TYPE_UZ[t]} for t in L.FLAG_TYPES], ensure_ascii=False)
    return HTMLResponse(PAGE.replace("__TYPES__", types))


PAGE = r"""<!doctype html>
<html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TenderLens: belgilash</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#1c2430;--muted:#5d6b7c;--line:#d9dee5;--mark:#ffe58a;--yes:#b3261e;--no:#1f7a3a;--un:#5d6b7c;--accent:#1f4fd8}
@media (prefers-color-scheme: dark){:root{--bg:#12161c;--card:#1b222b;--ink:#e8edf3;--muted:#9aa8b8;--line:#2f3a47;--mark:#7a6200;--yes:#e0564d;--no:#3fae63;--un:#8794a4;--accent:#7ea2ff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,Segoe UI,Arial,sans-serif}
main{max-width:860px;margin:0 auto;padding:16px}
header{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
h1{font-size:20px;margin:0}.muted{color:var(--muted);font-size:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;margin-top:12px}
.meta{font-size:14px;color:var(--muted);margin-bottom:8px}.meta b{color:var(--ink)}
.ctx{white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;max-height:46vh;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:12px}
.ctx .dim{color:var(--muted)}mark{background:var(--mark);color:inherit;padding:1px 2px;border-radius:3px;font-weight:600}
.q{font-size:15px;margin:12px 0 4px}
.btns{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
button{font:inherit;padding:12px 8px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
button.yes{border-color:var(--yes);color:var(--yes)}button.no{border-color:var(--no);color:var(--no)}button.un{color:var(--un)}
button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
button:disabled{opacity:.5;cursor:default}
.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.row>*{flex:1 1 220px}
select,input{font:inherit;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);width:100%}
.bar{height:6px;background:var(--line);border-radius:3px;margin-top:8px}.bar i{display:block;height:6px;background:var(--accent);border-radius:3px;width:0}
a{color:var(--accent)}kbd{border:1px solid var(--line);border-radius:4px;padding:0 5px;font-size:13px}
@media (max-width:560px){.btns{grid-template-columns:1fr}}
</style></head><body><main>
<header><h1>TenderLens: shartlarni belgilash</h1><span class="muted" id="who"></span></header>
<div class="muted" id="prog">Yuklanmoqda…</div><div class="bar"><i id="bar"></i></div>
<div class="card" id="card" hidden>
  <div class="meta" id="meta"></div>
  <div class="ctx" id="ctx"></div>
  <p class="q"><b>Savol:</b> sariq rang bilan belgilangan shart tanlovda qatnasha oladigan yetkazib beruvchilar doirasini asossiz cheklaydimi?</p>
  <div class="row">
    <label>Shart turi (ixtiyoriy)<select id="type"><option value="">— tanlanmagan —</option></select></label>
    <label>Izoh (ixtiyoriy)<input id="notes" maxlength="500" placeholder="Masalan: lot hajmiga nisbatan juda katta"></label>
  </div>
  <div class="btns">
    <button class="yes" data-a="yes">Cheklovchi <kbd>1</kbd></button>
    <button class="no" data-a="no">Cheklovchi emas <kbd>2</kbd></button>
    <button class="un" data-a="unsure">Bilmayman <kbd>3</kbd></button>
  </div>
  <p class="muted" id="msg"></p>
</div>
<div class="card" id="end" hidden><b>Barcha shartlar belgilandi. Rahmat!</b><p class="muted">Natijani ko‘rish: <code>python -m engine.evalset score</code></p></div>
<p class="muted">Tizim bu shartni belgilagan yoki belgilamagani ataylab ko‘rsatilmaydi: javobingiz mustaqil bo‘lishi kerak. Shubha bo‘lsa «Bilmayman»ni tanlang. Javoblar <code>data/eval/labels.csv</code> fayliga yoziladi.</p>
</main><script>
const TYPES=__TYPES__;let cur=null,busy=false;
let who=null;try{who=localStorage.getItem('tl_reviewer')}catch(e){}
while(!who||!who.trim()){who=prompt('Ismingizni kiriting (javoblar shu nom bilan saqlanadi):')||''}
who=who.trim().slice(0,40);try{localStorage.setItem('tl_reviewer',who)}catch(e){}
document.getElementById('who').textContent='Tekshiruvchi: '+who;
const sel=document.getElementById('type');for(const t of TYPES){const o=document.createElement('option');o.value=t.v;o.textContent=t.t;sel.appendChild(o)}
function prog(p){document.getElementById('prog').textContent=`Belgilandi: ${p.done} / ${p.total} (siz: ${p.mine})`;document.getElementById('bar').style.width=(p.total?100*p.done/p.total:0)+'%'}
function fmt(n,c){return n?new Intl.NumberFormat('ru-RU').format(Math.round(n))+' '+(c||''):''}
async function load(){
  const r=await fetch('/api/label/next?reviewer='+encodeURIComponent(who));const d=await r.json();prog(d.progress);
  if(d.finished){document.getElementById('card').hidden=true;document.getElementById('end').hidden=false;return}
  cur=d;const meta=document.getElementById('meta');meta.textContent='';
  const add=(label,value)=>{if(!value)return;const s=document.createElement('div');const b=document.createElement('b');b.textContent=label+': ';s.appendChild(b);s.appendChild(document.createTextNode(value));meta.appendChild(s)};
  add('Lot',d.lot_id+(d.subject_uz?' — '+d.subject_uz:''));add('Nomi',d.title);add('Buyurtmachi',d.customer);add('Boshlang‘ich narx',fmt(d.start_cost,d.currency));
  add('Manba',d.page===0?'platformadagi baholash mezonlari shakli':'texnik topshiriq, '+d.page+'-bet');
  const l=document.createElement('a');l.href=d.url;l.target='_blank';l.rel='noopener';l.textContent='Lotni etender.uzex.uz saytida ochish';meta.appendChild(l);
  const ctx=document.getElementById('ctx');ctx.textContent='';
  const b=document.createElement('span');b.className='dim';b.textContent=d.before;const m=document.createElement('mark');m.textContent=d.quote;const a=document.createElement('span');a.className='dim';a.textContent=d.after;
  ctx.append(b,m,a);m.scrollIntoView({block:'center'});
  sel.value='';document.getElementById('notes').value='';document.getElementById('msg').textContent='';document.getElementById('card').hidden=false}
async function answer(v){
  if(!cur||busy)return;busy=true;for(const x of document.querySelectorAll('.btns button'))x.disabled=true;
  try{const r=await fetch('/api/label',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:cur.key,reviewer:who,answer:v,human_type:sel.value,notes:document.getElementById('notes').value})});
    if(!r.ok)throw new Error('HTTP '+r.status);await load()}
  catch(e){document.getElementById('msg').textContent='Saqlab bo‘lmadi ('+e.message+'). Qayta urinib ko‘ring.'}
  finally{busy=false;for(const x of document.querySelectorAll('.btns button'))x.disabled=false}}
for(const x of document.querySelectorAll('.btns button'))x.addEventListener('click',()=>answer(x.dataset.a));
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='1')answer('yes');if(e.key==='2')answer('no');if(e.key==='3')answer('unsure')});
load().catch(e=>{document.getElementById('prog').textContent='Yuklab bo‘lmadi: '+e.message});
</script></body></html>"""
