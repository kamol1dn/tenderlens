# Tax administration: SMBs and the Tax Committee (Soliq qo'mitasi)

Research date: 17 Nov 2026. About 25 minutes of research, so coverage is partial.

**opened = yes** means I loaded the page myself (WebFetch, or curl + grep) and saw the number. **opened = no** means the number came only from a search snippet.

Quote spelling: kun.uz and uza.uz now publish Uzbek with ö/ş/ç letters, e.g. "qömitasi". Quotes marked *(curl)* are copied byte-for-byte from the page HTML. Quotes marked *(relayed)* came through the fetch tool's summary and may be paraphrased.

---

## 0. Read this first: what AI SOLIQ already covers (judges WILL ask)

The Tax Committee launched **ai.soliq.uz ("AI SOLIQ")** in late July 2026 (launch date from snippets: spot.uz 29 Jul 2026, gov.uz/oz/soliq/news/view/199015). It runs on the Committee's own LLM ("Soliq LLM"): "asosiy til modeli Soliq qömitasining öz serverlarida joylaşgan" *(relayed; kun.uz 12 Aug 2026)*.

Services listed on the Committee's own pages:

| Service | What it does | Source (opened) |
|---|---|---|
| AI Korxona / ИИ Предприятие → upgraded to **Ekspress audit** (Oct 2026) | Analyses a company's tax status "from a tax inspector's point of view" and recommends fixes | gov.uz/ru/soliq/news/view/241337 (yes); gov.uz/ru/soliq/news/view/199439 (yes) |
| **AI Avtokameral** | Explains discrepancies found by automated desk control and how to fix them | gov.uz/ru/soliq/news/view/241337 (yes) |
| **AI EHF / AI ЭСФ** | Recommendations on high-risk e-invoices | kun.uz 2026/08/12 (yes); 241337 (yes) |
| AI Reyting | Explains the business "stability rating" and why points were lost | same |
| AI Imtiyoz / Льгота | Finds available tax benefits and explains refusals | same |
| AI Hisobot / Отчетность | Which returns are due, deadlines, likely errors | same |
| AI Keshbek | Shows *problem* cashback receipts | same |
| **AI Muloqot** (dialogue/e-appeals) + **AI Assistent** (general Q&A) | Added at a 27 Oct 2026 press conference | 241337 (yes) |
| **AI Call-markaz** (voice robot) | Robot calls debtors. In the pilot, 52% paid in full; now rolled out nationwide | gov.uz/oz/soliq/news/view/221191 (yes) |

Claimed accuracy: "tavsiyalar 95–99 foiz aniqlikda şakllantiriladi" *(curl; kun.uz 2026/08/12)*.

Limits stated in the same interview: advisory only; the accountant stays responsible; browser only, no mobile app yet.

**Implication:** Any project on desk audits, e-invoice risk, ratings, benefits, report deadlines or generic tax Q&A directly overlaps a live government product built on the Committee's private data.

**Gaps I could NOT find an AI SOLIQ equivalent for (not verified that none exists):**
- assigning MXIK/IKPU product codes to an SMB's own item list
- the marking-at-the-till workflow (code ↔ MXIK mismatch)
- a pharmacy-specific compliance helper

---

## Who in the Tax Committee is overloaded, and with what

| Unit (my mapping) | Load | Number | Date | URL | opened |
|---|---|---|---|---|---|
| Desk-audit (kameral) staff | Taxpayers under desk audit | 45.3k taxpayers, +42% y/y | 2025 | https://www.spot.uz/ru/2026/01/21/tax-audits/ | yes |
| Desk-audit staff | Discrepancies to chase | 36.8 trn UZS (×2.39); VAT alone 18.6 trn | 2025 | same | yes |
| E-invoice risk analysts | ESF volume | >3.5 m ESF per month; first stage samples only 350k (10%) | Sep 2025 | https://www.spot.uz/ru/2025/09/10/risk-analysis/ | yes |
| Appeals handlers | Written appeals | 35,042 in 9M 2026, down from 41,821 | 5 Nov 2026 | https://uza.uz/ar/posts/murojaatlar-soni-otgan-yilga-nisbatan-67-mingtaga-kamaydi_933157 | yes |
| Appeals handlers | Appeals forwarded by the Presidential Virtual/People's receptions | 22,496 in 9M 2026 | 5 Nov 2026 | same | yes |
| 1198 call-centre | Call volume | **no number found.** The hotline stats page only links quarterly files, which I did not open | — | https://gov.uz/oz/soliq/sections/view/16393 | yes (page), figures not visible |
| 1198 call-centre | Cashback queries | Consumers whose receipts earned no cashback are told to call 1198 | 10 Jun 2026 | https://www.spot.uz/oz/2026/06/10/cashback/ | yes |

The honest reading is that the formal appeals load is **falling**. The clear growth in work is desk audits and e-invoice risk review.

I found no numbers for: Tax Code amendment count since 2020, online-cash-register / virtual-cash-register counts, VAT refund processing days, or Tax Committee headcount.

---

## Context numbers (shared by all candidates)

| Claim | Number | Date | URL | Verbatim quote (≤25 words) | opened |
|---|---|---|---|---|---|
| Non-observed economy (informal + shadow) | 26.9% of GDP, UZS 498 trn | FY2025 (published Aug 2026) | https://kun.uz/en/news/2026/08/05/uzbekistans-non-observed-economy-shrinks-to-229-of-gdp-in-first-half-of-2026 | "the non-observed economy was estimated at UZS 498 trillion, equivalent to 26.9% of GDP" | yes |
| Shadow economy alone | 7.9% of GDP, UZS 147 trn | FY2025 | same | "the shadow economy was estimated at UZS 147 trillion, representing 7.9% of GDP" | yes |
| Non-observed economy | 22.9% of GDP | H1 2026 | same | "declined to 22.9% of gross domestic product in the first half of 2026" | yes |
| VAT threshold raised | 1 bn → ~5 bn UZS; optional 6% simplified VAT for catering/trade/services | from 1 Jun 2026 | https://www.spot.uz/ru/2026/06/11/vat-increase/ | "порог перехода на НДС вырос с 1 млрд до примерно 5 млрд сумов" *(curl)* | yes |
| Implementing rules missing | — | Jun 2026 | same | "Но конкретного порядка, как будет применяться указ, пока нет" *(curl)* | yes |
| Turnover tax for individual entrepreneurs (YaTT) and self-employed | 1% (was 4%) | 2026 | https://buxgalter.uz/ru/publish/doc/text212084_chto_izmenitsya_v_nalogovo-tamojennoy_politike_uzbekistana_v_2026_godu | (snippet) | no |
| Tax Code change frequency | **no number found** | — | — | Rule churn is visible in 2026 alone: VAT threshold, the 6% regime, the 1% turnover tax, and marking deadlines moved (see Candidate A) | — |
| Cashback paid | UZS 1.51 trn; 1.6 bn receipts; 7.47 m users | 2025 | https://www.kun.uz/en/news/2026/02/04/uzbekistan-pays-out-over-uzs-15-trillion-in-tax-cashback-in-2025 | "7.47 million people used the cashback service through the Soliq mobile application during the year" | yes |
| Cashback may be scrapped and replaced by a lottery | — | Jul 2026 | https://kun.uz/en/news/2026/07/08/uzbekistan-considers-scrapping-1-tax-cashback-on-purchase-receipts-d5cda5 | (snippet) | no |

---

## Candidate A (recommended): "MXIK + Marking copilot". Messy product names → correct 17-digit MXIK/IKPU code, marking requirement and VAT benefit, with an explanation

### 1. Problem

Every receipt line and every e-invoice line must carry a valid MXIK/IKPU code from a national catalogue of **444,820 codes**. Small shops, cafes and pharmacies, and their outsourced accountants, map hundreds to thousands of free-text item names ("Coca-Cola 1.5 l", "Парацетамол 500мг №10") to these codes by hand.

When a code is wrong, things break:
- **Marked goods:** the till rejects the item with "Markirovka kodi MXIKga muvofiq emas" (marking code does not match the MXIK).
- **Cashback:** the receipt line earns no cashback.
- **VAT benefits:** a wrong code can lose them.
- **Fines:** older rules impose a fine (status in 2026 not verified).

**SMB users:** retail and catering owners, pharmacies, cashiers, outsourced accountants.

**Government users:**
- Tax Committee **e-invoice / receipt risk-analysis staff**: cleaner item-level data improves the 48-criteria ESF risk scoring and VAT-chain matching.
- The **tasnif catalogue operator**, whose 1198 / chat support is the fallback for "which code is mine".
- **CRPT Turon / "Asl belgisi"** marking operator: fewer code ↔ MXIK mismatches at the till.

### 2. Evidence

| Claim | Number | Date | URL | Verbatim quote (≤25 words) | opened |
|---|---|---|---|---|---|
| Size of the MXIK catalogue | 444,820 MXIK codes; 117 groups; 58,008 brands | live API, 17 Nov 2026 | https://tasnif.soliq.uz/api/cls-api/info/mxik/dashboard-short-info | `"groupCount":117 ... "mxikCount":444820` | yes (curl) |
| Cashiers hit a code-mismatch error on marked goods | qualitative | 2026 article | https://buxgalter.uz/oz/publish/doc/text217805_onlayn-nkt_chekida_belgilangan_tovar_2026_yilda_sotuvchilar_uchun_nimalar_uzgardi | "Amaliyotda kassirlar «Markirovka kodi MXIKga muvofiq emas» xatosiga duch kelishadi" *(curl)* | yes |
| Till blocks receipts for no code, a repeated code or an expired product | rule from 1 Sep 2025 / 1 Mar 2026 | 2026 | same | "kodsiz, takroriy kodli va muddati oʻtgan tovar uchun chekni avtomatik ravishda bloklaydi" *(relayed)* | yes |
| Product groups under mandatory marking | alcohol, tobacco, beer, some appliances, **medicines**, water and soft drinks; car batteries (Jan 2026); fertilisers and plant protection (May 2026); pilots for vegetable oil, vaccines and medical devices (Jul 2026); dietary supplements (2028) | Jul 2026 | https://www.spot.uz/ru/2026/07/08/crpt-turon/ | (list relayed) | yes. Note: the page is an **advertorial** ("на правах рекламы") |
| Water/drinks traceability deadline moved | 1 Apr 2026 → 1 Apr 2027 | Jul 2026 | same | "не все производители напитков были к этому готовы" (business ombudsman, relayed) | yes (advertorial) |
| Turnover-based fines for repeat marking violations | up to 20% of net quarterly revenue | Jul 2026 | same | "оборотных штрафов, достигающих 20% от чистой квартальной выручки за повторное нарушение" *(relayed)* | yes (advertorial, so treat with caution) |
| Progressive marking fines; after the 4th fine the taxpayer loses VAT refunds for a year | PP-190 of 23 May 2025 | 2025 | https://buxgalter.uz/ru/publish/doc/text208507_9_glavnyh_izmeneniy_v_sfere_obyazatelnoy_markirovki_po_pp-190 | (snippet) | no |
| 1% fine for a wrong MXIK on an invoice or receipt | 1% of the value sold | 2022-era rule; **status in 2026 not verified** | https://buxgalter.uz/oz/publish/doc/text177498_qanday_qilib_notugri_mhik_uchun_jarimadan_qochish_mumkin | (snippet) | no |
| Receipt line with a wrong or missing MXIK earns no cashback (red/blue receipt) | — | older buxgalter rule; **2026 status not verified** | https://buxgalter.uz/oz/publish/doc/text178657_haridorlaringiz_soliq_uz_ilovasi_orqali_keshbek_ololmasa_nima_buladi | (snippet) | no |
| Cashback not paid on 35 m receipts (38 bn UZS); "errors in receipt data" is one listed reason | 38 bn UZS / 35 m receipts | Aug 2025 (article 6 Oct 2025) | https://anhor.uz/news/why-6/ | "в чеке допущены ошибки в данных" *(relayed)* | yes. The article gives no breakdown by cause, and MXIK is not named |
| Expired medicines automatically blocked at sale | — | Oct 2025 | https://kun.uz/news/2025/10/14/yaroqlilik-muddati-otgan-dorilar-sotuvi-avtomatik-cheklanadi | (snippet) | no |

**Weakness:** I found **no number** for how many receipts or invoices carry a wrong MXIK, and no 2026 count of MXIK-related notices. Pain score is capped at 3 for that reason.

### 3. What already exists

- **tasnif.soliq.uz:** the official catalogue, with full-text (Elasticsearch) search and a questionnaire-style search (since Dec 2021, per buxgalter snippet). Fallback support is chat and 1198.
- **Soliq mobile app:** flags an MXIK that is not in the current catalogue, but cannot tell whether the chosen code is the *right* one (buxgalter snippet).
- **Community open-source client `mxik` (npm) + `mxik-mcp` server** (github.com/azabroflovski/mxik-js). It already wraps the catalogue search for LLM agents, so "a chatbot that searches MXIK" is NOT novel. The novelty has to come from batch mapping of a whole messy item list, a confidence score, an explanation, and marking/benefit flags.
- **POS / accounting vendors** (1C, cash-register and virtual-cash-register makers): they store codes, but I did not verify whether any auto-suggest them.
- **AI SOLIQ:** none of the 11 listed services is about product-code assignment (as of the 27 Oct 2026 list). Not verified that none exists.

### 4. Data a team can collect TONIGHT

- **Endpoints tested by me, 17 Nov 2026, public, no key needed:**
  - `GET https://tasnif.soliq.uz/api/cls-api/info/mxik/dashboard-short-info` (catalogue stats)
  - `GET https://tasnif.soliq.uz/api/cls-api/elasticsearch/search?search=кофе&size=3&page=0&lang=ru`
    - Returns JSON with mxikCode, the name in RU/UZ-Cyrillic/UZ-Latin, and the group/class/position/subposition hierarchy.
- **Endpoints listed in mxik-js source, NOT tested:**
  - `/mxik/search/by-params`
  - `/mxik/get/by-mxik`
  - `/integration-mxik/get/history/{code}`
  - `/integration-mxik/references/lgota` (VAT benefits per code)
  - `/integration-mxik/references/get/units/all`
  - hierarchy: `/group`, `/class/short-info`, `/position/short-info`, `/subposition/short-info`, `/brand/short-info`
- **Action:** the API is **undocumented and may change**. Dump the group → subposition tree and a few thousand codes to local JSON tonight, and build embeddings over the RU/UZ names.
- **Test item names:** product titles from any public online shop or pharmacy listing (scrapability not verified), or hand-typed receipts.
- **Rules corpus for explanations:** buxgalter.uz MXIK articles (RU/UZ, scrapable HTML) and lex.uz.
- **Languages:** catalogue names come in Russian, Uzbek Cyrillic and Uzbek Latin.

### 5. Foreign comparators

- **Korea Customs Service (with academic co-authors):** explainable HS-code classifier. Top-3 accuracy 93.9% on 925 hard subheadings, evaluated on 5,000 recent cases. This is a **research evaluation, not a deployed KPI**. https://arxiv.org/abs/2311.10922 (opened yes)
- **Brazil Receita Federal CLASSIF (part of SISAM):** in a WCO 10-item test, whenever it proposed an 8-digit NCM code the code was correct; "That happened in six out of ten trials". Small test. https://mag.wcoomd.org/?p=16059 (opened yes)

### 6. AI vs rules

- **AI:** mapping a free-text, multilingual item name (UZ/RU, typos, brands) onto 444,820 codes needs semantic retrieval plus LLM re-ranking. Optional: vision/OCR of a supplier invoice or a product label/DataMatrix photo to read the name.
- **Rules:** the code format (17 digits), checking a code against the catalogue, whether the product group is under mandatory marking (a lookup table), VAT benefit flags (`lgota` reference), and units of measure.

### 7. Scores (1–5)

| Pain evidence | Benefit to both sides | Track fit | 48h feasibility |
|---|---|---|---|
| 3 | 4 | 4 | 5 |

**Track fit:** entrepreneurship. A **pharmacy variant** (medicines are marked, expired drugs are blocked, vaccines and medical devices are in pilots) also fits pharma & healthcare.

**Strongest judge objection:** "tasnif.soliq.uz already has search, and POS vendors pick codes. Where is your number showing that wrong MXIK codes are a big problem today?" Have a live side-by-side ready (messy name → our top-3 vs plain catalogue search), and frame the value as batch onboarding of a whole SKU list.

---

## Candidate B: Desk-audit and e-invoice "red flag" explainer for SMBs + triage queue for inspectors

### 1. Problem

Desk audits (kameral) grew 42% in 2025 and the discrepancies to resolve grew 2.39×. Every e-invoice is now scored red or green against **48 criteria that the Committee does not disclose**, and a red flag blocks the VAT offset.

**SMB users:** accountants of SMEs that receive discrepancy demands or red-flagged invoices, and exporters waiting for VAT refunds.

**Government users:** Tax Committee **desk-audit (kameral nazorat) inspectors** and **e-invoice risk-analysis units**. They would get pre-sorted cases with the SMB's explanation attached.

### 2. Evidence

| Claim | Number | Date | URL | Verbatim quote (≤25 words) | opened |
|---|---|---|---|---|---|
| Desk audits | 45.3k taxpayers, +42% | 2025 | https://www.spot.uz/ru/2026/01/21/tax-audits/ | "налоговые органы провели камеральные проверки в отношении 45,3 тыс" *(curl)* | yes |
| Discrepancies found | 36.8 trn UZS (×2.39) | 2025 | same | "выявлены расхождения на сумму 36,8 трлн сумов (рост в 2,39 раза)" *(curl)* | yes |
| VAT share of the discrepancies | 18.6 trn UZS | 2025 | same | "Свыше половины расхождений пришлись на НДС — 18,6 трлн сумов" *(curl)* | yes |
| Most discrepancies are in catering, trade and services | 17.7 trn UZS | 2025 | same | (relayed) | yes |
| E-invoice volume | >3.5 m per month | Sep 2025 | https://www.spot.uz/ru/2025/09/10/risk-analysis/ | "Ежемесячно в Узбекистане формируется более 3,5 млн ЭСФ" *(curl)* | yes |
| Risk criteria not public | 48 criteria | Feb 2026 | https://www.spot.uz/ru/2026/02/03/risk-analysis/ | "Оценка уровня риска проводится на основе 48 критериев, список которых Налоговый комитет не р[аскрывает]" *(curl, truncated)* | yes |
| VAT refunded to exporters | 6.9 trn UZS, +27% | 2025 | same | "рост ... НДС, возвращенного предприятиям-экспортерам, на 27% — до 6,9 трлн сумов" *(relayed)* | yes |
| VAT refunds "don't fully work in practice" (Chamber of Commerce head D. Vahobov) | proposes making 40–50% of VAT easily refundable, or a 6% rate | 23 Apr 2026 | https://kun.uz/news/2026/04/23/qqsni-oson-qaytarib-olish-taminlanmasa-stavkani-6-foizga-tushirishni-taklif-qilamiz-davron-vahobov | "amaliyotda hali to'liq ishlamayapti" *(relayed)* | yes |
| Decree PF-175: partial VAT refunds regardless of stability rating | — | 27 Aug 2026 | https://lex.uz/docs/-8442717 | (snippet) | no |
| VAT refund processing time (days) | **no number found** | — | — | — | — |

### 3. What already exists

This is a **direct overlap** with AI SOLIQ's **AI Avtokameral**, **AI EHF**, **Ekspress audit** ("company tax status from a tax inspector's point of view") and **AI Reyting**. All run on the Committee's own data, which a student team cannot access.

Also existing: the my.soliq.uz / my3.soliq.uz personal cabinet notices, and private EDI operators (Didox, Faktura.uz, not researched in depth).

### 4. Public data for tonight

- No real ESF or discrepancy data is public. The team would have to **synthesize** invoices.
- Rules: buxgalter.uz articles on red/green ESF and kameral (RU/UZ), lex.uz Tax Code.
- Kazakhstan KGD notice texts are useful as templates.

### 5. Foreign comparators

- **Kazakhstan KGD:** automated desk-control notices built from ESF + bank POS data; taxpayers get 30 working days to respond (mybuh.kz snippets). Result number: **no number found**.
- **HMRC digital assistant:** 3.5 m interactions; "Approximately two-thirds of customers who use the assistant don't contact us for further support". From the HMRC Oct–Dec 2023 performance update, https://gov.uk/government/publications/hmrc-quarterly-performance-update-october-to-december-2023/hmrc-performance-update-october-to-december-2023 (opened yes).

### 6. AI vs rules

- **AI:** an LLM explains a discrepancy in plain UZ/RU and drafts the taxpayer's reply letter. Classification sorts inspector cases by likely cause (timing vs. a fictitious supplier).
- **Rules:** the reconciliation itself (ESF vs return vs cash-register totals) is arithmetic matching.

### 7. Scores (1–5)

| Pain evidence | Benefit to both sides | Track fit | 48h feasibility |
|---|---|---|---|
| 4 | 4 | 4 | 3 |

**Strongest judge objection:** "AI SOLIQ already does exactly this (Avtokameral, EHF, Ekspress audit) on real data. Yours runs on fake data."

---

## Candidate C: "What changed for MY business?" Tax-rule change navigator + cashback/receipt help, in Telegram/voice, UZ/RU

### 1. Problem

Rules changed repeatedly in 2026:
- VAT threshold 1 bn → ~5 bn from 1 June, with the implementing order missing at launch
- optional 6% VAT
- 1% turnover tax for YaTT
- marking deadlines moved

Micro-entrepreneurs cannot tell what applies to them. Consumers whose cashback did not arrive are sent to 1198.

**SMB users:** YaTT, self-employed, small shops.

**Government users:** the Tax Committee **1198 call-centre and appeals staff** (fewer repetitive questions) and the **press/explanatory department**.

### 2. Evidence

- VAT threshold and rule rows: see Context.
- Appeals: 35,042 in 9M 2026, **falling** (−6,779) — uza.uz, opened yes.
- Cashback queries: referred to 1198 — spot.uz 10 Jun 2026, opened yes.
- Jan–Apr 2026: 571.3 bn UZS cashback paid on 848.4 m receipts (same page, relayed).
- Call volume: **no number found**.

### 3. What already exists

AI SOLIQ **AI Assistent** + **AI Muloqot** (27 Oct 2026), **AI Keshbek**, the AI voice robot, buxgalter.uz / norma.uz paid Q&A, and the Tax Committee's Telegram channels (not checked).

### 4. Data for tonight

lex.uz (UZ/RU, HTML scrapable), gov.uz/soliq news (UZ/RU/EN), buxgalter.uz Q&A.

### 5. Comparators

- HMRC digital assistant: two-thirds containment (see B).
- IRAS Bot (Singapore) exists, but **no number found**.

### 6. AI vs rules

- **AI:** LLM RAG over changing legal text, speech-to-text for voice notes in Uzbek.
- **Rules:** the eligibility logic itself (turnover vs threshold, activity type).

### 7. Scores (1–5)

| Pain evidence | Benefit to both sides | Track fit | 48h feasibility |
|---|---|---|---|
| 2 | 3 | 4 | 5 |

**Strongest judge objection:** "AI Assistent launched three weeks ago, and appeals are already falling 16%. Why another chatbot?"

---

## Candidate D (brief, mostly government-side): cashback and fake-e-invoice fraud detection

**Evidence:**
- Fergana: a cashback scheme involving 211,500 people and 28.5 bn UZS (relayed).
- Andijan: 35 bn UZS misappropriated via fake ESF covering 1.1 trn UZS (relayed).
- Source for both: https://www.spot.uz/oz/2026/06/10/cashback/ (opened yes).
- "Tax Committee suspends over UZS 100 billion in social cashback amid fraud investigation" — https://kun.uz/en/news/2026/06/04/tax-committee-suspends-over-uzs-100-billion-in-social-cashback-amid-fraud-investigation-84f275 (snippet, opened no).

**Scores:**

| Pain evidence | Benefit to both sides | Track fit | 48h feasibility |
|---|---|---|---|
| 3 | 1 (SMBs gain little) | 3 | 2 (no data) |

**Objection:** no data, the benefit is government-only, and the cashback scheme itself may be scrapped (Jul 2026 snippet).

---

## Bottom line

**Candidate A (MXIK + marking copilot)** is the only option where:
- the live public data source works tonight (a 444,820-code API, tested), and
- I found no AI SOLIQ equivalent.

Its pharmacy variant also fits the pharma track. Its weak spot is the lack of a hard number on how often codes are wrong.

**Candidate B** has the strongest pain numbers, but it duplicates AI SOLIQ.
