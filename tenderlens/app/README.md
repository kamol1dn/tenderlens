# TenderLens web UI (`app/`)

## Start it (one command, works offline)

```bash
python app/serve.py
```

The app opens at **http://127.0.0.1:8780/** in the default browser. It needs only Python 3.10+ (standard library). There is no npm, no build step and no CDN: every asset is in `app/assets/`. On Windows you can also double-click `app/start.cmd`.

Options: `--port 9000`, `--no-browser`, `--engine http://127.0.0.1:8765`.

## Screens (Uzbek Latin)

| Route | Screen |
|---|---|
| `#/` | **Supplier home.** Paste a lot link or number, plus the **"Men uchun tenderlar"** keyword filter over all open lots. The filter transliterates Cyrillic and Latin and matches word stems, so `burg'ulash dolotalari` finds lot 524784 "Долота трехшарошечные". |
| `#/lot/524784` | **Supplier lot page.** It shows: the fairness score (0–100) with a traffic light; the verdict (*Qatnashing / Aniqlik so'rang / Qatnashmang*); each flag with its verbatim quote highlighted, the page number, a Latin transliteration, the explanation and a neutral rewrite; the documents needed; the customer card (median bidders, top winner's share, ≤2-bidder share, *tejash imkoniyati — taxminiy*); and the **clarification-letter** button, which opens the letter with a company-name field and a copy button. |
| `#/gov` | **Government dashboard.** It shows: tiles for open lots, total value, flagged lots and *Tejash imkoniyati* (labelled **taxminiy**); open lots ranked by risk with sector filters; and the bidder-count vs price-drop chart from `stats.json → bidder_curve`. |
| `#/gov/lot/524784` | The lot page plus a government action bar with **"Buyurtmachiga tuzatish so'rovini yuborish"**. This is a mock send: it shows a pre-filled request and a confirmation, and nothing is actually sent. |

Deep links for demos and screenshots (add `?present=1` before the `#`):
- `#/lot/524954?focus=score` / `?focus=flags` render projector crops (no header, larger type).
- `#/lot/524784?letter` opens the letter.
- `#/gov/lot/524784?send` opens the correction request.
- `#/?q=burg'ulash%20dolotalari` pre-fills the keyword filter.

## Where the data comes from

`serve.py` answers the engine's `/api/*` routes (CONTRACT.md). It uses the engine on `127.0.0.1:8765` when that answers, otherwise the engine's offline cache in `data/cache/` (`--data DIR` points it at a copied cache on another laptop). A lot found in neither returns HTTP 503 `analysis_unavailable`, and the UI shows "hali tahlil qilinmagan". There is **no mock data**: every score on screen comes from the engine. The footer badge shows the source. Requests time out after 9 s and show a short Uzbek message with a "Qayta yuklash" button.

Rules the UI enforces: unverified flags never appear; flags sharing a `group_id` show as one card; `page: 0` / `source: "platform_form"` reads "Platforma mezonlari formasi"; every savings figure says **taxminiy**; customers with `customer_kind` joint_venture/private are left out of the government queue; the banned word from CONTRACT.md never appears.

## Presentation mode (for the stage and the deck)

**On by default.** The top bar shows "● Taqdimot rejimi: yoqilgan"; click it to switch off (or open `/?present=0`). In presentation mode:
- customer names become "Buyurtmachi A … Z", then "Buyurtmachi 27, 28…" (no two-letter aliases that read like "AJ"); TINs are hidden; the order follows the dashboard's risk order, so a customer keeps its alias on every screen and in the bot;
- titles come from `app/masking.py` (`title_present`, computed by `serve.py` and shared with the bot): place names, legal forms, numbered institutions ("9-sonli MTT"), addresses, unique institutions (hospital, prosecutor's office, journal, airport…) are removed; a title that still identifies the customer is cut to the part after "uchun" or replaced by a neutral sector title. The three demo lots have hand-checked titles;
- the region, the etender.uzex.uz link and the customer search terms are hidden; the letters' "Xarid predmeti" line uses the neutral title;
- free text (letters, reasons, explanations, quotes) is masked by the same rules in `app/assets/app.js`.

A lot past its `end_date` shows a "Lot yopilgan" banner, no bid advice and no letter deadline; lists show a "yopilgan" pill and put open lots first.

## Screenshots for the deck

With the server running:

```bash
python app/tools/screenshots.py
```

This uses headless Edge or Chrome and writes `app/screenshots/*.png` at 1920×1080, plus full-page versions. Retake them once the engine cache exists: the footer badge then reads "oflayn kesh" instead of "NAMUNA".

## Files

```
app/
  serve.py            one-command server: static files + /api with engine → cache → mock fallback
  index.html          single page
  assets/app.js       router, lot page, dashboard, chart, letter (vanilla JS)
  assets/app.css      styles (projector-friendly, light)
  assets/logo.svg
  mock/               contract-shaped mock data (index, stats, lots/, customers/)
  tools/build_mock.py rebuild mock data from snapshots
  tools/screenshots.py
  screenshots/        PNGs for the deck
  start.cmd           Windows double-click launcher
```
