# TenderLens engine

Reads Uzbek public-tender specifications from the public UZEX etender API, extracts requirements, flags clauses that may restrict competition (each with a verbatim quote checked by code), scores each lot, and serves the result over HTTP. Everything the app, the bot and Quarry need is in `data/cache/`, so the demo runs offline.

The engine owns `engine/` and `data/`. The data contract is `../CONTRACT.md`.

## Run it

All commands run from `D:\projects\hackathon\tenderlens`.

```bash
pip install -r engine/requirements.txt
```

```bash
python -m engine.api
```

That serves `http://127.0.0.1:8765` (`/api/stats`, `/api/lots`, `/api/lots/{id}`, `/api/customers/{tin}`, `POST /api/analyze`, `/api/health`). Set `TENDERLENS_OFFLINE=1` to forbid every network call.

| Task | Command |
|---|---|
| Analyse one lot (CLI) | `python -m engine.analyze 524784` (add `--offline` or `--json`) |
| Rebuild the cache from saved lint output | `python -m engine.analyze --rebuild` |
| Snapshot open lots, lot details, deals, spec files | `python -m engine.snapshot` (resumable; `--demo-only`, `--deals 20000`, `--no-specs`) |
| Extract text from specs | `python -m engine.extract --all` (one lot: `python -m engine.extract 524784 --force`) |
| Render unreadable pages to PNG | `python -m engine.extract 523837 --render` |
| Lint one lot through the Claude API | `python -m engine.lint run 524784` |
| Vision-transcribe a scanned spec through the API | `python -m engine.lint transcribe 523837` |
| Re-check the quotes of a saved lint | `python -m engine.lint verify 524784` |
| Customer stats and bidder curve | `python -m engine.stats` (`--check` reproduces the research baseline) |
| Evaluation labels | `python -m engine.evalset build`, then `python -m engine.evalset score` |
| Template clusters / random sample | `python -m engine.select sample 30` |
| Queue order for the next lint batch | `python -m engine.prefilter 22` (keyword risk) or `python -m engine.queue 95 --batch 5` (health and education first, then by value; `--scanned` lists priority scans) |
| Template-criterion findings | `python -m engine.templates` |
| Human labelling page | open `http://127.0.0.1:8765/label` while the API runs |
| Offline label pack for teammates' laptops | `python -m engine.labelpack` writes `data/eval/label_pack.html` (`--check` re-runs the name-leak check) |
| Merge the answers that come back | `python -m engine.evalset import labels_aziza.json labels_bek.json`, then `python -m engine.evalset score` |

## The LLM step and the API key

`ANTHROPIC_API_KEY` was **not set** on the build machine on 17 Nov 2026, so the API lint is paused. The engine never uses any other credential: `engine/lint.py` passes the key explicitly and ignores `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN` and stored profiles.

- **What is cached now** was produced "in-session": Claude Code subagents (`claude-sonnet-5-5`) read the same input files and the same prompt the API call would get, and wrote `data/lint/{lot}.json`. The demo lots were re-read by `claude-fable-5-2`: it added the flags on lots 524784 and 523196, and made the flags on the three kindergarten lots (524116, 524120, 524152) consistent, since they share one template and two reviewers had judged the same clauses differently. Every record's `model` and `lint_backend` fields say which.
- **With a key**, `python -m engine.lint run <lot>` and the live path of `GET /api/lots/{id}` work as written, but that code path has never been executed against the real API (only checked against the installed SDK's signatures, `anthropic` 2.9.0). Test one lot before relying on it. It uses `claude-sonnet-5-5` (`TENDERLENS_MODEL` overrides), structured JSON output, and the server-side refusal fallback (beta), falling back to a plain call if the account rejects that parameter.
- **Without a key**, an uncached lot returns HTTP 503 `{"detail": {"status": "analysis_unavailable", ...}}` at once, before any network call. It never returns a made-up analysis.

The model step is file-in, file-out, so both backends share all checking code:

```
data/lint/in/{lot}.txt  ->  model  ->  data/lint/{lot}.json  ->  verify quotes  ->  score  ->  data/cache/lots/{lot}.json
```

## Pipeline

1. **Snapshot** (`snapshot.py`, `uzex.py`). `TradeList` (TypeId 1 and 2, pages of 50), `GetTrade` per lot, `DealsList` (20 pages of 1,000), `DownloadFile` per spec. 0.4 s between calls, retries with back-off, everything cached on disk.
2. **Text** (`extract.py`). PyMuPDF first, pypdf as a second opinion on weak pages (PyMuPDF is used first because it is much faster on 15 MB scans). DOCX through python-docx. ZIP and RAR archives are unpacked to `data/specs/unpacked/{lot}/` under neutral file names (RAR needs WinRAR's `UnRAR.exe`). Each page gets a quality score: the share of word tokens written in one script with a vowel. Pages under 0.55 are treated as unreadable, which catches empty scans and garbled text layers such as lot 524034. Cyrillic mis-decoded as Latin-1 is repaired when re-decoding as cp1251 gives real words. `text_source` is `text` (born-digital), `ocr` (the scanner's own OCR layer, or tesseract if installed), `vision` (pages transcribed by a model) or `none`.
3. **Lint** (`lint.py`, `prompts/lint.md`). The model sees the lot header, PAGE 0 (the criteria and qualification fields from `GetTrade`: `js_fields`, `js_qualification_fields`, `tech_coef`) and the spec pages. Criterion wording that many open lots share is marked as platform template wording. It returns requirements, flags, a neutral rewrite per flag and the document list.
4. **Quote check** (`lint.verify`). A requirement or flag survives only if its quote is found on a single page after normalising whitespace and letter case, nothing else. No fuzzy matching. The page number comes from where the match lands, not from the model. Page 0 is matched against the customer's raw field values only, so a quote can't match labels TenderLens added. Unverified items are dropped and counted in `dropped_unverified`. Flags that contain banned wording are dropped too.
5. **Score, verdict, letter** (`score.py`). Rules only.
6. **Cache** (`analyze.py`). Writes `lots/{id}.json`, `index.json`, `stats.json`, `customers/{tin}.json`.

## Fairness score

```
fairness_score = 100 − clause_penalty − history_penalty        (floored at 0)

clause_penalty  = min(85, 40 × high flags + 22 × medium flags + 6 × low flags)
history_penalty = 15 × mean(share_le2_bidders, top_winner_share, share_price_drop_lt1pct)
                  for the lot's customer; 0 when fewer than 5 past deals are known

traffic light:  green ≥ 80,  amber 50–79,  red < 50
```

Each record carries `score_breakdown` with the two penalties, so the UI can show the arithmetic.

**One finding, several flags.** Flags that restate a single finding share a `group_id` (set on a second read; lot 523414 is the example: three flags, one brand lock). A group is penalised once, at its highest severity. `finding_count` is the number of findings after grouping; `flag_count` stays the number of flags. The app should show a group as one item.

**Verdict.** `skip` when the score is under 50. `bid_with_clarification` when there is at least one high or medium flag. Otherwise `bid`. The reasons list names each flag, the customer's history, whether the lot is a re-announcement, the clarification deadline and any pages that could not be read.

**Shown, never flagged:** the 70/30 technical/price split, re-announced lots (`old_id`), the bidding window (`context.window_days`).

**Clarification letter.** A fixed formal template in Uzbek (Latin). It quotes each verified flag, states the question and offers the neutral rewrite. No model writes the frame, and no law article is cited: the only reference attached to a flag is the Competition Committee's 2025 category ("advantages created for specific bidders"). Article numbers wait for a lawyer.

## Customer statistics and the bidder curve

Source: 19,980 deals from `DealsList` (21 Aug 2025 to 17 Nov 2026), de-duplicated by `deal_id`. Price drop = (start_cost − deal_cost) / start_cost; deals with a start price of zero or less are skipped.

| Bidders | Deals | Median price drop |
|---|---|---|
| 1 | 550 | 2.6% |
| 2 | 10,497 | 2.4% |
| 3 | 4,667 | 7.5% |
| 4 | 2,110 | 16.0% |
| 5 | 1,013 | 21.6% |
| 6+ | 1,143 | 29.6% |

The research baseline (9,998 deals: 2.7% / 17.2% / 32.5%) reproduces on the seed file as 2.8% / 17.2% / 32.5% over 9,990 deals; the seed held 8 duplicate `deal_id`s. `python -m engine.stats --check` prints it.

Per customer: `deals`, `median_bidders`, `share_le2_bidders`, `top_winner_share`, `share_price_drop_lt1pct`, and `reannounced_lots` (the customer's open lots whose `GetTrade` record has `old_id`; `DealsList` has no such field).

**`money_on_table_uzs` is an estimate.** Contract formula: start_cost × (curve at median bidders + 2 − curve at median bidders), floored at 0.
- A fractional median (for example 2.5) is interpolated linearly between buckets. Six or more uses the "6+" bucket.
- A customer with fewer than 5 known deals uses the market median (2 bidders). `money_on_table_basis` says which: `customer_history` or `market_median`.
- Lots priced in another currency get 0 and `not_estimated_non_uzs`.
- The curve is a correlation across different lots, not a forecast for one lot. `stats.json` totals it over analysed lots only.

## What the snapshot holds (17 Nov 2026, about 23:00 Tashkent)

| Item | Count |
|---|---|
| Open lots (TypeId 1: 626, TypeId 2: 36) | 662, UZS 1,441.6 bn |
| `GetTrade` records | 662 |
| Spec files (517 PDF + 2 more PDFs mislabelled by the API, 81 RAR, 62 ZIP) | 662, 3.1 GB |
| Readable specs | 515 (343 text layer, 171 scanner OCR layer, 1 vision) |
| Specs that need OCR or vision | 147 |
| Distinct templates among readable specs | 356 among the 515; the largest template is shared by 97 lots |
| Deals | 19,980 |

## What the cache holds

The numbers move as more lots are analysed; `data/cache/stats.json` (`analysed_lots`, `flagged_lots`) is the live count. On 18 Nov at about 00:10: 156 analysed lots, 113 with at least one verified flag (14 high, 147 medium, 73 low); 30 red, 67 amber, 59 green. They cover UZS 525 bn of the UZS 1,441.6 bn open; 20 lots are from health customers and 31 from education customers. Text came from a text layer in 74 lots, a scanner OCR layer in 75 and a model transcription in 7. 14 lots carry a second-pass change. The rest of the 662 open lots are not analysed, so `index.json` does not list them.

How lots were chosen: the six demo lots; 27 randomly sampled specs (the go/no-go); 22 picked by the keyword prefilter; then 100 lots in `engine/queue.py` order (health and education first, then highest start price, one lot per template, at most three per customer), including six scanned health and education specs transcribed from page images.

Go/no-go sample (frozen in `data/eval/gonogo_lots.json`): 27 specs drawn at random at about 23:19 on 17 Nov, when 336 specs (the earliest-closing half) had been extracted; one spec per template and per customer; seed 17 with `PYTHONHASHSEED=0`. Result on the first pass (the bulk model alone): 14 of 27 specs had a high or medium flag (3 high, 17 medium, 6 low; 1 flag dropped because its quote did not verify). After the stronger model's second read of four of those lots: 13 of 27 (4 high, 15 medium, 7 low). **This random sample is the only unbiased rate.** The other cached lots were picked by risk keywords, value and sector, so "113 of 156 flagged" is not a rate for the platform. Re-running `select sample` overwrites that file, so don't, unless you want a new sample.

Second reads: `data/eval/hero_check.md` documents the lead demo lots (quote, page, reasoning, counter-argument). A lint file changed on a second read carries `second_pass` and its `model` says so.

**Who is buying.** Each lot and index row has `customer_kind`: `budget` or `corporate` (the platform's own customer type, taken from DealsList), `joint_venture` (a corporate customer whose name carries the joint-venture form, QK / СП), or `unknown` (no deal history). Corporate includes state-owned companies. Now: 66 budget, 78 corporate, 2 joint venture, 10 unknown. `financing_source` is the customer's own entry on the lot. `customer_sector` (`health`, `education`, `other`) is a keyword rule on the customer's name and the lot title.

## Template findings (government view)

`stats.json` carries `template_findings` and `template_labels`, computed by `engine/templates.py` from the criteria of all 662 open lots.
- `template_labels`: every criterion label used by 10 or more open lots (24 labels), with exact counts.
- `template_findings`: three standard criteria that plainly cannot apply to many of the lots that carry them: state veterinary control (53 lots, about 48 not food or animal products), technical training of the customer's staff (184 lots, about 35 catering, cleaning, transport and similar), transfer of intellectual-property rights (163 lots, about 28).
- The lot counts are exact. "Likely not applicable" is a keyword rule on titles and product categories, written out in each finding's `rule`; it is an estimate for a person to check. `median_points_under_label` is the score attached to the label, but customers often reuse a template label and score something else in their own note.

## Evaluation

`data/eval/labels.csv` holds candidate labels: every verified flag, plus up to three unflagged requirements per spec. All rows start as `assistant-proposed`. **They are not ground truth and no accuracy figure may be quoted from them.**

**Labelling page.** With the API running, reviewers open `http://127.0.0.1:8765/label` (Uzbek). It shows one clause per screen with the quote highlighted in its surrounding text and three buttons: restrictive, not restrictive, don't know (keys 1, 2, 3). It does not show whether TenderLens flagged the clause, so the answer is independent. Two people can work at once; each gets different clauses. Answers go straight into `labels.csv` (`human_restrictive`, `label_status`, `reviewer`, `human_type`, `notes`) and into `data/eval/label_log.jsonl`. Flagged and unflagged clauses are interleaved two to one.

`python -m engine.evalset score` (or `GET /api/label/progress`) then reports precision and false alarms per spec from confirmed rows only; "don't know" answers are left out. `python -m engine.evalset build` adds rows for newly analysed lots and keeps every human answer, but it rewrites the file outside the server's lock: **don't run it while people are labelling**, or an answer saved in that moment is lost (`label_log.jsonl` has every answer and is the recovery path).

The score also breaks precision down by severity (`by_severity`, `precision_high_medium`). Low flags mean "worth one clarifying question", so quote the high and medium figure as the headline.

**Second laptop.** The API listens on this machine only. To let teammates' laptops open the page, start it with `TENDERLENS_HOST=0.0.0.0` and give them `http://<this machine's IP>:8765/label`. There is no login: anyone on that network can then read the API and write labels, so do it on a phone hotspot or a trusted network, not the venue Wi-Fi.

### Offline label pack (reviewers on their own laptops)

`python -m engine.labelpack` writes **`data/eval/label_pack.html`**: one file, no server, no network, Uzbek. Send the file; a reviewer opens it in a browser, types a name, answers, presses **Eksport** and sends back `labels_{name}.json`.

- **What is in it.** 100 clauses from 86 lots, in one fixed order for everyone (seed in `labelpack.py`), so reviewers who stop early still overlap on the same clauses.

  | Group | Clauses | How chosen |
  |---|---|---|
  | Lead lots 524954, 525192, 524769 | 5 | every flag |
  | Other high flags | 12 | every one (all 14 high flags are in the pack) |
  | Medium flags | 48 of 147 | seeded sample, each flag type in proportion to how common it is |
  | Low flags | 20 of 73 | same |
  | Controls | 15 | qualification or evaluation requirements the lint read and did **not** flag, one per lot, spread through the pack |

  The same wording used in several template lots is asked once. `data/eval/label_pack_manifest.json` lists every clause with its role and order.
- **Bias control.** Every card has the same closed "AI izohi" section: for a flag it holds the flag type and the explanation, for a control it says the AI did not flag the clause. Nothing on the card shows which is which until the section is opened, and the export records whether it was opened before the answer (`opened_ai`).
- **Answers.** Buttons and keys 1 / 2 / 3, optional comment, arrows to move. Answers are saved in the browser's localStorage after every click; if the browser blocks it, a warning tells the reviewer to export before closing. If the download fails, the page shows the same JSON as text to copy.
- **No customer names.** The file does not contain customer names, TINs, raw titles or contact details. Names inside the subject, the quote and the context are masked at build time by `engine/mask.py` (ported from the bot's presentation mode). In the clause itself only the customer's own name is hidden; brands and certifying bodies stay, because the reviewer has to judge them. In the context every organisation name is hidden, and so are persons (initials with a surname, patronymics, surnames by their ending), phone numbers, e-mail and web addresses. The build then checks every card against the lot's registered customer name and TIN and fails loudly if anything is found (currently 0). The check cannot see a customer described in another language than its registered name: I read all 86 subjects and fixed the one case found (`SUBJECT_STRIP`), but did not read all 100 contexts for that.
- **Rebuilding changes nothing** unless the cache changed: the pack id (`26845af7d3`) is a hash of the clause ids. Do not rebuild between sending the pack and importing the answers.

`python -m engine.evalset import <file.json> ...` keeps each reviewer's answers in `data/eval/reviews/{reviewer}.json` (a later export from the same person wins clause by clause) and writes the consensus into `labels.csv`:

| Reviewers' yes / no answers | `label_status` | `human_restrictive` |
|---|---|---|
| all the same (or one reviewer) | `confirmed` | that answer |
| three or more with a strict majority | `confirmed` | the majority |
| a tie | `disputed` | empty; left out of precision, counted in agreement |
| only "bilmayman" | `unsure` | `unsure` |

Two people who type the same name are merged into one reviewer, so ask for distinct names. Unknown clause ids and malformed answers are reported and skipped. To try an import without touching the real file, set `TENDERLENS_LABELS` to a copy of `labels.csv`.

`python -m engine.evalset score` (add `--json` for the deck) then reports:

- `by_severity`: precision for high, medium and low flags separately, each with the number checked and a 95% interval;
- `precision_high_medium`: pooled over the labelled sample, and `precision_high_medium_weighted`, which weights each severity by its share of all 161 high and medium flags. Use the weighted one as the headline, because every high flag is in the pack but only a third of the medium ones. It stays empty until 20 medium flags have a confirmed label, since the pack opens with the lead and high flags;
- `disputed_rows` and `excluded_note`: clauses on which reviewers disagree are left out of precision, which flatters it, so quote their count beside the precision;
- `control_clauses.false_negative_rate`: the share of control clauses a human called restrictive, as k of n. It covers clauses the lint read and passed, not clauses it never extracted;
- `agreement`: for each pair of reviewers, the clauses both saw, raw agreement and Cohen's kappa on the ones both decided;
- `reviewers`: each person's own counts, precision and how often they opened the AI note first;
- `recall` is never printed: flagged clauses are over-sampled, so tp / (tp + fn) would overstate it.

`data/eval/gonogo_result.json` holds the go/no-go run.

## Known limits

- **Flags are model judgements.** The quote is checked; the judgement is not. A human should read every flag before it is shown to a customer or a judge.
- **The veterinary criterion is platform template wording.** The label behind the lot 524784 flag appears in 53 of 662 open lots (cement, generators, whiteboards). On 524784 the customer's own document scores it as a separate row, which is why it is flagged, at medium. The bulk model did not flag it on the first pass; the stronger model added it.
- **OCR noise.** Quotes are copied from the extracted text, so they carry the scanner's misspellings. For `vision` pages the quote is checked against a model's transcription, which is a weaker guarantee than a text layer.
- **Unreadable pages are not analysed.** They are listed in `spec.unreadable_pages` and mentioned in the verdict.
- **About 141 specs still need OCR or vision.** Tesseract is not installed; with an API key, `python -m engine.lint transcribe <lot>` handles them.
- **The same template clause can get different calls.** Reviewers judged lots independently. Among the Resolution 810 meal lots, the reference-letter clause is flagged on 524156 and 524207 but not on the three demo kindergarten lots; the demo lots and 524207 were aligned by hand on the clauses they share. Other template families have not been aligned.
- **Very long specs** are cut at 200,000 characters; the pages left out are recorded in `pages_cut`.
- **Old `.doc`, `.xls` and image files inside archives** are skipped.
- **Contact persons' names** from `GetTrade` are never written to the cache.
