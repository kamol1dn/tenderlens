# TenderLens build contract (owned by the orchestrator session)

**What we're building.** TenderLens is an AI that reads Uzbek public-tender specifications on UZEX etender and does three things:
- tells a small supplier whether the lot is worth bidding on;
- flags clauses written for one supplier, quoting them verbatim;
- writes a neutral fix and a clarification letter in Uzbek.

It also gives the state a dashboard of lots ranked by risk.

**Event.** National AI Hackathon, Tashkent, 17–19 Nov 2026, entrepreneurship track. The research and the numbers are in `D:\projects\hackathon\national-research\report.md`; §5 is the product spec.

**Changing this file.** Only the orchestrator edits it. If you need a change, say so in your report and keep working against the current version.

## Folder ownership. Never write outside your own folders.

| Folder | Owner session | Contents |
|---|---|---|
| `engine/` | engine | Python: ingestion, extraction/OCR, LLM lint, scoring, customer stats, letters, FastAPI, eval |
| `data/` | engine | Snapshots and cache. Everyone else reads it only. |
| `app/` | app | Web UI: supplier lot page plus government dashboard |
| `bot/` | app | Telegram bot ("send lot number → verdict") |
| `deck/` | deck | Presentation (.pptx), speaker notes, demo script |
| `D:\projects\hackathon\quarry\` (separate git checkout, local branch, no pushes) | quarry | Quarry: full UZEX coverage, spec downloads, TenderLens verdicts in alerts |
| `CONTRACT.md`, `STATUS.md` | orchestrator | Contract and status board |

**Telegram.** No session posts to the team's Telegram group or runs the Telegram watcher. The orchestrator is the only Telegram voice. Report to the orchestrator instead.

## Data written by `engine` under `data/cache/`. `app` reads exactly this.

### `data/cache/index.json`
A list of lot summaries for the dashboard:
```json
[{"lot_id": 524784, "title": "...", "customer_name": "...", "customer_tin": "...", "start_cost": 69243672.0,
  "currency": "UZS", "end_date": "2026-11-18T10:01:27", "type": "selection|tender",
  "fairness_score": 42, "traffic_light": "red|amber|green", "flag_count": 2,
  "money_on_table_uzs": 1234567.0, "sector": "health|education|construction|it|food|other"}]
```

### `data/cache/lots/{lot_id}.json`
One fully analysed lot:
```json
{
  "lot_id": 524784, "display_no": "...", "title": "...", "url": "https://etender.uzex.uz/lot/524784",
  "customer": {"name": "...", "tin": "..."}, "region": "...", "start_cost": 0, "currency": "UZS",
  "start_date": "iso", "end_date": "iso", "clarific_date": "iso", "type": "selection|tender", "old_id": null,
  "evaluation": {"tech_coef": 70, "cost_coef": 30, "criteria": [{"label": "...", "max_score": 5, "rate": "Экспертная"}]},
  "spec": {"file": "data/specs/524784.pdf", "pages": 7, "text_source": "text|ocr|vision", "language": "uz-cyrl|uz-latn|ru|mixed"},
  "requirements": [{"id": "r1", "kind": "qualification|technical|evaluation|delivery|payment|other",
                    "summary_uz": "...", "summary_en": "...", "quote": "verbatim text", "page": 1}],
  "flags": [{"id": "f1",
             "type": "brand_no_equivalent|narrow_params|excessive_experience|excessive_financial|dealer_letter|irrelevant_requirement|bundling|unrealistic_deadline|short_window|other",
             "severity": "high|medium|low", "quote": "verbatim text", "page": 2, "quote_verified": true,
             "explanation_uz": "...", "explanation_en": "...", "rewrite_uz": "...", "rewrite_en": "..."}],
  "fairness_score": 42, "traffic_light": "red",
  "verdict": {"decision": "bid|bid_with_clarification|skip", "reasons_uz": ["..."], "reasons_en": ["..."]},
  "documents_needed_uz": ["..."],
  "clarification_letter_uz": "...",
  "customer_stats": {"deals": 0, "median_bidders": 0, "share_le2_bidders": 0.0, "top_winner_share": 0.0,
                     "share_price_drop_lt1pct": 0.0, "reannounced_lots": 0},
  "money_on_table_uzs": 0.0,
  "analyzed_at": "iso", "model": "..."
}
```

### `data/cache/customers/{tin}.json`
The same fields as `customer_stats`, plus `tin`, `name` and `recent_deals` (up to 20: date, title, deal_cost, participants_count, winner_name).

### `data/cache/stats.json`
```json
{"bidder_curve": [{"bidders": "1", "n": 447, "median_drop": 0.023}, {"bidders": "6+", "n": 594, "median_drop": 0.325}],
 "deals_analysed": 9998, "deals_period": "2026-04-22..2026-11-17",
 "open_lots": 662, "open_value_uzs": 1441600000000, "flagged_lots": 0, "money_on_table_total_uzs": 0, "generated_at": "iso"}
```

**Contract decisions, 17 Nov ~23:50:**
- **Quote sources.** A quote may come from the extracted spec text **or** from the customer's GetTrade criteria fields. Criteria quotes carry `page: 0` and `source: "platform_form"`; the app shows them as "platform mezonlari formasi" (platform criteria form).
- **Additive fields.** The engine's extra fields (`subject_uz`, `sector`, `source`, `type_label_uz`, `score_breakdown`, etc.) are allowed. The app uses `subject_uz` as the Latin title.
- **Uncached lots.** An uncached lot returns HTTP 503 with `analysis_unavailable`. App, bot and Quarry show "hali tahlil qilinmagan" (not analysed yet), never an error.
- **One source of numbers.** Deck, app and pitch all use the engine's `data/cache/stats.json`: 19,980 deals; median drop 2.4% with 2 bidders, 16.0% with 4, 29.6% with 6+; 52.5% of deals had exactly 2 bidders. The older 9,998-deal figures are retired.
- **Analysed vs open.** The index holds analysed lots only. Never say "all 662 lots were scored". Say "N tahlil qilindi" (N analysed) out of 662 open.
- **Presentation mode.** The app must offer a presentation mode that masks customer names (e.g. "Buyurtmachi A") on every screen. Deck screenshots use it. We point at conditions, not at named organisations.
- **Demo lots (human check pending), revised 18 Nov 00:20 after the engine's second read:**
  1. 524954: turnover ≈ 24× the lot (high).
  2. 525192: 4 ISO certificates for UZS 5.3M (high).
  3. 524769: hospital meals, 40% of the contract sum on the account (health angle).

  524401 (school) is **dropped as a lead**: only 4 of its 85 points depend on the flag. Also avoid 523959 (a private JV, not a state customer). 523414 counts as **one** brand-lock finding, not three. 524784 becomes a systemic finding: "one platform template criterion scores state-veterinary documents in 53 open lots, including drill bits and cement". Kindergarten lots: the flags sit in the national Resolution 810 template, so say so.

**Rules for the numbers above:**
- `money_on_table_uzs` is an **estimate**: start_cost × (bidder-curve median drop at bidders+2 − median drop at the customer's median bidders), floored at 0. The UI must label it "estimate".
- `quote_verified` is true only if the quote string matches the extracted spec text after normalising whitespace and letter case. **Unverified flags are never shown.**

## HTTP API (engine; FastAPI on `http://127.0.0.1:8765`)
- `GET /api/stats` → stats.json
- `GET /api/lots` → index.json
- `GET /api/lots/{lot_id}` → lots/{id}.json. If the lot isn't cached, it runs live analysis, saves the result and returns it.
- `GET /api/customers/{tin}` → customers/{tin}.json
- `POST /api/analyze` with `{"lot_id": 524784}` or `{"url": "https://etender.uzex.uz/lot/524784"}` → same as `GET /api/lots/{id}`

**Offline rule.** The demo must work offline from the cache. Live calls are optional extras.

## Demo lots (snapshot tonight; they close 18 Nov)
| Lot | What it is | Why it matters |
|---|---|---|
| **524784** | Three-cone drill bits, Samarkand branch of the O'zyo'lko'prik cluster | Criterion 5 scores a "state veterinary control" document, an irrelevant requirement. This is the hero example. |
| **523196** | Hot meals, Namangan regional Interior Affairs Department | Working capital equal to 3 months of contract value |
| **523837** | Compressor repair, National Children's Medical Center | Scanned PDF; health angle |
| **524116 / 524120 / 524152** | Kindergarten hot-meal outsourcing (Cabinet Resolution 810) | Social angle |

Their snapshots and spec PDFs are partly in `D:\projects\hackathon\national-research\data\`:
- `etender_open_lots_17nov.json`
- `etender_deals_10k_17nov.json`
- `example-specs/`
- `etender_GetTrade_523837_example.json`

## Verified public endpoints (no login)
| Purpose | Call |
|---|---|
| Open lots | `POST https://apietender.uzex.uz/api/common/TradeList` with body `{"From":1,"To":50,"TypeId":1|2,"System_Id":0}` (max 50 per page). On 17 Nov: TypeId 1 had 626 lots, TypeId 2 had 36. |
| Lot detail | `GET https://apietender.uzex.uz/api/common/GetTrade/{id}/0` returns `tech_file_path`, `js_qualification_fields`, `js_fields` (criteria), `tech_coef`, `old_id`, `clarific_date`. |
| Spec file | `POST https://apietender.uzex.uz/api/common/DownloadFile?path={tech_file_path}` with an empty body |
| Deal history | `POST https://apietender.uzex.uz/api/common/DealsList` with body `{"From":1,"To":1000,"System_Id":0}` |

Be polite to the API: sleep 0.3–0.5 s between calls and cache everything.

## Language and wording
- **Team decision (17 Nov 17:44): the deck and UI are in Uzbek (Latin).** A Russian/English toggle in the UI is optional, only if time allows.
- **Quarry** (https://github.com/S0ME2/Quarry, real snapshot pushed 17 Nov 17:51 UTC) is the monitoring backbone. Its creator (@S0me2) gave permission to fork and modify it. The demo face is the TenderLens app. Quarry adds continuous monitoring and Telegram alerts that carry the TenderLens verdict, which it fetches from the engine API.
- **Never use the word "corruption".** Use "unfair conditions" (adolatsiz shartlar) or "restrictive requirements" (cheklovchi talablar). The tool is advisory and every flag is quoted.
