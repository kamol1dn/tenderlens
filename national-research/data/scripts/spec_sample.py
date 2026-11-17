import json, sys, time, urllib.request, io, os
import pypdf
sys.stdout.reconfigure(encoding="utf-8")
out = sys.argv[1]; n = int(sys.argv[2])
H = {"User-Agent": "Mozilla/5.0 Chrome/130", "Content-Type": "application/json"}
def post(url, body=None):
    data = json.dumps(body).encode() if body is not None else b""
    return urllib.request.urlopen(urllib.request.Request(url, data=data, headers=H, method="POST"), timeout=60).read()
lots = json.loads(post("https://apietender.uzex.uz/api/common/TradeList", {"From": 1, "To": n, "System_Id": 0}))
stats = []
for lot in lots:
    lid = lot["id"]
    g = json.loads(urllib.request.urlopen(urllib.request.Request(f"https://apietender.uzex.uz/api/common/GetTrade/{lid}/0", headers=H), timeout=60).read())
    path = g.get("tech_file_path"); ext = (g.get("tech_file_ext") or "").lower()
    rec = {"id": lid, "customer": g.get("customer_name"), "name": lot["name"][:80], "ext": ext, "old_id": g.get("old_id"),
           "quals": len(g.get("js_qualification_fields") or []), "criteria": len(g.get("js_fields") or []), "tech_coef": g.get("tech_coef")}
    if path:
        blob = post("https://apietender.uzex.uz/api/common/DownloadFile?path=" + path)
        fn = os.path.join(out, f"{lid}.{ext or 'bin'}"); open(fn, "wb").write(blob)
        rec["bytes"] = len(blob)
        if ext == "pdf":
            try:
                r = pypdf.PdfReader(io.BytesIO(blob)); txt = "".join((p.extract_text() or "") for p in r.pages)
                rec["pages"] = len(r.pages); rec["text_chars"] = len(txt.strip())
            except Exception as e:
                rec["err"] = str(e)[:60]
    stats.append(rec); print(json.dumps(rec, ensure_ascii=False)); time.sleep(0.5)
json.dump(stats, open(os.path.join(out, "_sample.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
