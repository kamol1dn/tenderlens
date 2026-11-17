import json, sys, time, urllib.request
out_dir = sys.argv[1]
dates = sys.argv[2:]
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130", "Referer": "https://mpa.uz/"}
for d in dates:
    rows, page = [], 0
    while True:
        url = f"https://api.mpa.uz/drug-catalog-api/v1/referent-price/all?date={d}&page={page}&size=1000"
        r = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=60))["result"]
        rows += r["content"]
        if r["last"] or not r["content"]:
            break
        page += 1
        time.sleep(0.5)
    json.dump(rows, open(f"{out_dir}/ref_{d}.json", "w", encoding="utf-8"), ensure_ascii=False)
    print(d, len(rows), "rows; totalElements", r["totalElements"])
