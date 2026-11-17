# Public procurement and SME finance: research notes (theme for Team Eclipse)

Researched 17 Nov 2026, about 25 minutes, using WebSearch, WebFetch and one live public API probe. No browser tools were used.
"opened = yes" means I opened the page (or its PDF text, or the API) and saw the number myself. "opened = no" means the number comes only from a search snippet or summary and must be re-checked before it goes on a slide.
Quotes are short strings returned verbatim by the fetch tool. Where no verbatim string was available, the entry says "paraphrase".

## 0. Context that changed in 2025-2026 (read first; the brief's names are partly stale)

- **Who owns procurement policy now:** in Feb 2026 a new **Agency for Industrial Cooperation and Public Procurement** was created. The source gives only the Russian name, "Агентство по промышленной кооперации и государственным закупкам"; any Uzbek name would be my own translation. It took over the procurement "задачи, функции и полномочия министерства экономики и финансов". Source: https://anhor.uz/news/uzbekistan-creates-industrial-cooperation-and-procurement-agency/ (dated "7 февр."; year 2026 inferred from the page; opened = yes). **Pitch to this Agency, not to "MEF procurement department".**
- **Decree No. 259 of 26.12.2025** ("On further measures to ensure competition and transparency in public procurement"):
  - abolishes the list of goods allowed for direct contracts from 1 Jan 2026;
  - adds an AI average-market-price module;
  - flags as high-risk any price that deviates >10% up / 20% down;
  - adds a monitoring page with risk assessment and a "KPI in procurement" rating;
  - requires fully electronic bid evaluation from 1 Jul 2026.
  - Sources: https://kun.uz/en/news/2025/12/30/uzbekistan-to-scrap-direct-contracts-in-public-procurement-from-2026 (opened = yes); lex.uz entry https://lex.uz/docs/-7952218 (not opened). The decree is reported both as PF-259 and as PP-259; I did not verify the prefix on lex.uz.
- **Price module status:** a Government regulation adopted 8 Sep 2026 says every customer must study the average market price via the "narxlar moduli". The regulation is valid until 31 Dec 2028. https://www.uza.uz/oz/posts/davlat-xaridi-predmetining-ortacha-bozor-hamda-boshlangich-narxini-aniqlash-tartibi-belgilandi_907098 (opened = yes; the page does not mention AI).
  - Norma.uz snippet: all customers price through the module from 1 Oct 2026, and AI auto-pricing starts 1 Jan 2027 for 60 goods types (opened = no; the original 1 Mar 2026 AI date apparently slipped).
- **Procurement law ZRU-684 (2021):** not re-read in this session. Do not quote its articles from memory; check https://lex.uz before citing.
- **Other state AI moves (all opened = no, from search snippets):**
  - Competition Committee said in May 2026 it will detect bid collusion with AI.
  - A presidential decree of 6 Jul 2026 expands AI and risk analysis in state audit (Accounts Chamber). https://anhor.uz/news/uzbekistan-ii-i-risk-analiz-v-gosudarstvennom-audite/
- **State Fund for Support of Entrepreneurship:** search snippets say it was reorganised into the **Entrepreneurship Development Company** (Tadbirkorlikni rivojlantirish kompaniyasi) in 2023 (opened = no; unverified).

## 1. Headline numbers (cross-candidate)

| Claim | Number | Date | URL | Verbatim quote (original language) | Opened |
|---|---|---|---|---|---|
| Procurement volume, H1 2026 | 188.4 trn UZS; 1,099,305 deals; 7.2 trn saved | pub. 4 Aug 2026 | https://yuz.uz/uz/news/2026-yilning-1-yarim-yilligida-davlat-xaridlari-hajmi-1884-trln-somni-tashkil-etdi | "188,4 trln so‘mlik xarid" / "1 099 305 ta bitim" | yes |
| Procurement volume, 9 months 2026 | ~282 trn UZS; 12.1 trn saved | pub. 30 Oct 2026 | https://uza.uz/ar/posts/davlat-xaridlaridagi-shaffoflik-byudjet-mablaglarini-tejashga-xizmat-qilmoqda_930637 | "qariyb 282 trillion so‘mga yaqinni tashkil qilgan" | yes |
| Direct purchases fell (9m 2026) | -11.7% | 30 Oct 2026 | same uza.uz | "To‘g‘ridan-to‘g‘ri xaridlar hajmi esa 11,7 foizga kamaygan" | yes |
| AI already checks e-shop offers | 75% of "Elektron do‘kon" offers | 30 Oct 2026 | same uza.uz | "takliflarning 75 foizi sun’iy intellekt orqali tekshiruvdan o‘tkazilmoqda" | yes |
| Annual volume (stated Dec 2025) | 248.6 trn total; 115.2 trn non-competitive (35 trn monopoly) | 29 Dec 2025 | https://yuz.uz/ru/news/uzbekistan-usilivaet-prozrachnost-goszakupok-rasshiryaet-konkurentsiyu-i-prioritet-otechestvennogo-proizvoditelya | "Сегодня объем государственных закупок в стране составляет 248,6 трлн сум" | yes |
| Competitive share 2025 → 2030 target | 58% → 80% | 29 Dec 2025 | same yuz.uz | "доля конкурентных процедур увеличится с 58% (2025 год) до 80%" | yes |
| Business participation target | 35% → 70% (SME share not defined) | 29 Dec 2025 | same yuz.uz | "участие предпринимателей с 35% до 70%" | yes |
| "Openness & ease for business" target | 60% → 98% | 29 Dec 2025 | same yuz.uz | "уровень открытости и удобства участия для бизнеса с 60% до 98%" | yes |
| Price inflation found | 369.9 bn (2023); 370.6 bn (2024) | 29 Dec 2025 | same yuz.uz | paraphrase | yes |
| Direct contracts at state companies 2024-25 | 37 trn UZS (Uzbekneftegaz alone 9.7 trn in 2025) | 2026 | https://anhor.uz/vzglyad-iznutri/tendery-uzbekistan-pryamye-kontrakty/ | — | no |
| Direct share, 2019 → 2022 | 70% → >41% | OCP study, Oct 2023 | https://www.open-contracting.org/wp-content/uploads/2023/10/Uzbekistan-Countrysnapshot-Исследование-Проблемы-и-перспективы-развития-сферы-госзакупок-в-Узбекистане.pdf | "доля прямых закупок, которая в 2022 году составила более 41%" | yes (PDF text extracted) |
| xarid.uzex.uz share of trades | 83.1% (2022) | 2023 | same OCP PDF | "приходиться на платформу xarid.uzex.uz (83,1%)" | yes |
| No OCDS open data | not implemented (as of 2023) | 2023 | same OCP PDF | "не внедрен стандарт данных открытого контрактирования Open Contracting Data Standard (OCDS)" | yes |

The 248.6 trn and 58% figures do not reconcile: 133.4 / 248.6 = 53.7%, not 58%. Both are reported as stated, and the gap is unexplained.

There is **no official number for the SME share of procurement awards**: none found. The closest is the "entrepreneur participation 35%" baseline above.

**Average bidders:**
- No official national number found.
- Own calculation (below): median 2 on etender.uzex.uz.

## 2. Own calculation from the live public API (good demo material)

- **Endpoint:** `POST https://apietender.uzex.uz/api/common/DealsList`, body `{"From":1,"To":2000,"System_Id":0}`.
  - No login is needed. It is undocumented; I found it via an Apify scraper listing https://apify.com/a-g-d/uz-uzex and verified it myself on 17 Nov 2026.
  - Returns 21+ fields per deal: `start_cost`, `deal_cost`, `participants_count`, customer name/INN/type, provider name/INN, `category_name`, contract status, `deal_contract_kazna_status_name` (treasury registration status), `is_local_manufacturs`.
  - `total_count` = **164,649** deals on etender (tenders + selections). This is not the whole system: H1 2026 alone had about 1.1M deals in total, most of them e-shop/auction.
- **Open lots:** `POST https://apietender.uzex.uz/api/common/TradeList` (same body) gives currently open tenders and selections: **662** open on 17 Nov 2026, with name, customer, INN, region, district and estimated cost. Lot page: `https://etender.uzex.uz/lot/{id}`.
  - I did **not** find a public endpoint for specification documents or attachments: two guesses returned 404.
  - Tonight, open a lot page with browser DevTools to see where the TZ/spec PDF comes from.
- **Stats on the latest 2,002 deals (8 Oct – 17 Nov 2026), etender only, my own calculation, not a national figure:**
  - median 2 participants, mean 2.86;
  - exactly 2 participants in 50.0% of deals, ≤2 in 55.0%, single participant in 5.0%;
  - median price reduction from the start price is 4.8%, and 26% of deals had a reduction under 1% (a classic weak-competition flag);
  - 1,345 deals with budget customers and 657 with corporate (SOE) customers.
  - **Health-sector customers** (names containing tibbiyot / shifoxona / poliklinika / медицин, etc.): 76 deals, about 60.4 bn UZS, median 2 participants, 68% with ≤2 participants.
  - **Education customers** (maktab / мактаб / таълим / ta'lim / o'quv / litsey / kollej / universitet / bog'cha, etc.): 193 deals, about 134.6 bn UZS, median 2 participants, 50% with ≤2 participants.
  - Keyword matching on customer names is approximate and can miss or misclassify customers.

## 3. Candidate problems

### Candidate P1. "Tailored tender" spec checker: an AI that reads a tender's technical specification and qualification requirements, flags clauses that restrict competition, and explains them in plain Uzbek/Russian (two-sided)

**Problem.** SMB suppliers can't tell quickly whether a tender is realistically winnable or written for a pre-chosen supplier, so they skip tenders or get disqualified. Meanwhile the state's own analysts manually review only a sliver of about 2M lots per year.
- **SMB users:** small suppliers of goods and services (IT equipment, furniture, school supplies, medical consumables, construction subcontractors) and tender consultants.
- **Gov users and gain:**
  - (a) **Agency for Industrial Cooperation and Public Procurement**, procurement methodology / expertise staff, plus the project and procurement efficiency centre that reviews documentation (its affiliation with the Agency is not verified): pre-publication screening of specs, a lower complaint load, and progress on the 58%→80% competitive and 35%→70% participation targets.
  - (b) **Competition Committee**, which already counts "creating advantages for specific bidders": a prioritised list of suspicious specs.
  - (c) **State customers** (procurement commissions): a lint check before they publish.

**Evidence**

| Claim | Number | Date | URL | Quote | Opened |
|---|---|---|---|---|---|
| Competition Committee: anti-competitive actions found | >28,000 actions in ~16,100 of >23,000 procedures analysed (≈70% of the *analysed* sample, not of all procurement); 18.8 trn UZS initial value | pub. 10 Mar 2026 (that it covers 2025 is snippet-only) | https://kun.uz/en/17330939 | "more than 23,000 public procurement procedures" | yes (rounded figures; exact 23,001 / 16,135 / 28,304 are snippet-only) |
| …of which "creation of advantages for specific bidders" | 8,647 | 10 Mar 2026 | same | paraphrase | yes |
| …"unjustified disqualification of participants" | 801; collusion 1,145; affiliation of bidders 685 | 10 Mar 2026 | same | paraphrase | yes |
| Business association collected supplier appeals | ~370 appeals, 62 systemic, incl. tailored specs | "1 июл." (year 2026 inferred from page) | https://anhor.uz/news/goszakupki-uzbekistan-problemy-postavshchikov/ | "Именно подобные технические задания бизнес чаще всего называет «заточенными» под конкретного поставщика." | yes |
| Notifications to suppliers are noisy | 4-digit TN VED code matching sends irrelevant tenders | same | same | paraphrase | yes |
| Complaints rising (speaker not identified) | qualitative | 1 Jul 2026 | https://podrobno.uz/cat/economic/reytingi-ii-i-chernye-spiski-kak-v-uzbekistane-khotyat-zachistit-goszakupki-ot-nedobrosovestnykh-uch/ | "Мы видим увеличение количества таких обращений" | yes |
| Business itself proposes AI pre-qualification checks | proposal | 1 Jul 2026 | same | "Алгоритмы могли бы автоматически анализировать соответствие участников установленным требованиям" | yes |
| Experience requirements kill SME bids | "9 of 10" (expert estimate); one tender for all-in-one PCs had 41 criteria | 24 Oct 2022 | https://podrobno.uz/cat/economic/kak-v-uzbekistane-ogranichivayut-biznes-v-tenderakh-i-chto-s-etim-delat-mnenie-eksperta-/ | "в 9 из 10 случаев ее дисквалифицируют с тендера" | yes (old) |
| Tender notices lack contact person | 30% of notices | 2023 | OCP PDF above | "в 30% объявлениях о тендерах нет контактной информации ответственного лица" | yes |
| Only a tiny share is analysed manually | 2-3% of procedures; ~2M lots/yr | article dated "6-yan" (year not visible) | https://anhor.uz/uzl/ichkaridan-nazar/davlat-xaridlarida-suniy-intellektsiz-korrupsiyaga-qarshi-kurashish-imkonsiz/ | "barcha tartib-qoidalarning atigi 2-3% i qo‘lda tahlil qilinadi." | yes |
| Education example: "Presidential gift" school supplies | ~20 bn UZS, 3 lots, 4-6 bidders each, only 2 admitted to the price stage, same winner in all 3 | 2026 | https://anhor.uz/news/tender-prezidentskiy-podarok-20-mlrd-sum-goszakupki-uzbekistan/ | — | no |
| Thin competition on etender | median 2 bidders; 50% exactly 2 | 8 Oct–17 Nov 2026 | own calc, API above | — | yes (own calc) |

**What already exists** (a judge will ask "doesn't X do this?"):
- **AI average-price module** (price only, not spec text; AI auto-pricing reportedly from 1 Jan 2027).
- **AI check of 75% of e-shop offers** (e-shop offers, not tender specs).
- **Expertise centre review** of documentation (human, for large or complex purchases).
- **Tenderzone.uz:** a paid private aggregator by the procurement participants' association (OCP PDF).
- **BidsFactory / Apify scrapers:** aggregation only.
- **Proposed only:**
  - the "Xavf-tahlil markazi" risk centre: "rejalashtirilmoqda" (planned) as of that article, whose year is not visible; status in Nov 2026 not verified. The 1 Jul 2026 podrobno piece reports officials saying risk-analysis tools are in progress.
  - the supplier/customer integrity ratings and blacklists proposed on 1 Jul 2026.
- **Private tools (one search only, opened = no):**
  - tendergpt.uz: a corporate-procurement platform/aggregator; its listing says AI document analysis is "in development".
  - A Kyrgyz AI tender-search platform: https://kaktus.media/doc/547114_ychenye_kny_pomogli_sozdat_pervyu_ii_platformy_poiska_tenderov_v_kyrgyzstane.html
  - An Azerbaijani Telegram tender bot.

In one search I found no Uzbek tool that reads specification text for restrictive clauses. Check tendergpt.uz before pitching. **Positioning:** "complements the price module: price AI checks *how much*, we check *who can actually bid*".

**Data tonight:**
- `TradeList` (open lots) + `DealsList` (results, with `participants_count`) via POST JSON, no login. Text is Uzbek Cyrillic, Uzbek Latin and Russian mixed.
- Spec PDFs/DOCX: find the attachment URL pattern on `https://etender.uzex.uz/lot/{id}` with DevTools. **Fallback:** download 20-30 spec files by hand from lot pages and hand-label them.
- **Legal basis for the rule list:**
  - competition law art. 29 (restricting participants), cited by the Competition Committee per an anhor snippet (snippet-only, opened = no);
  - Decree 259 text on lex.uz.

**Foreign comparators**
- **Brazil ALICE (CGU):** reviews tender notices automatically.
  - 2024: 118,069 purchase processes analysed and about R$257m savings from changes to tender notices it prompted. https://agenciagov.ebc.com.br/noticias/202412/orgaos-federais-economizaram-em-2024-257-milhoes-de-reais-com-apoio-do-robo-alice-da-controladoria-geral-da-uniao (opened = no)
  - OECD case: 190,923 acquisitions analysed in 2023. https://oecd-opsi.org/innovations/robot-alice-bid-contract-and-notice-analyser (opened = no)
- **Ukraine DoZorro (TI Ukraine):** in the 2018 beta, AI vs indicator rules found 26% more unfounded winner selections, 37% more groundless disqualifications, and 298% more collusion. https://ti-ukraine.org/en/news/dozorro-artificial-intelligence-to-find-violations-in-prozorro-how-it-works/ (opened = no)

**AI vs rules**
- **Rules:** deadlines, missing contact info, price vs module, single or 2 bidders, re-announced lots.
- **AI (LLM):**
  - read free-text spec and qualification sections in 3 scripts/languages;
  - detect brand names without "or equivalent", over-narrow parameters, experience or authorisation-letter demands, and criteria counts;
  - explain each flag and suggest a neutral rewrite;
  - classify the lot into a proper category (fixing the TN VED 4-digit noise) and match it to an SMB profile.
- **Embeddings:** "find similar past lots and who won them".

**Scores (1-5):** pain evidence 4 · benefit to both sides 5 · track fit 3 (entrepreneurship; can be framed around health/education lots) · 48h feasibility 4.
- **Strongest objection:** "Who labels 'tailored'? You'll produce false accusations; the Agency's price module and the planned risk centre will cover this."
- **Answer:** an advisory lint with explanations, not an accusation, and the demo is validated against the Competition Committee categories.

### Candidate P2. Red-flag risk scoring of awarded deals for oversight bodies (Gov-heavy; SMB benefit indirect)

**Problem.** Oversight bodies find violations after the fact and by manual sampling, while honest SMBs lose rigged tenders.
- **Gov users:**
  - **Accounts Chamber** (audit planning);
  - **Anti-Corruption Agency** (procurement monitoring unit);
  - **Competition Committee** (bid-rigging);
  - **the Agency** (KPI rating of customers);
  - **Treasury** (it registers contracts; `deal_contract_kazna_status_name` is in the API).
- **Gain:** a ranked list of the riskiest customers and deals.
- **SMB side:** a public "customer integrity" view (does this customer always end with 2 bidders and the same winner?) before deciding to bid, which matches the association's 1 Jul 2026 rating proposal.

| Claim | Number | Date | URL | Quote | Opened |
|---|---|---|---|---|---|
| Accounts Chamber violations, Jan-Sep 2026 | 18,788 cases; 10.2 trn UZS | pub. 5 Nov 2026 | https://www.spot.uz/oz/2026/11/05/procurement-violations/ | "davlat xaridlarida qonunchilik talablarini buzish bilan bog‘liq 18 788 ta holat aniqlandi" | yes |
| …health / education shares | health 191 bn (1.9%); education & science 384.3 bn | same | same | "ta’lim va ilm-fanda 384,3 mlrd so‘m" | yes |
| …SOEs 38.5%, transport & roads 29.1% | 3,913.6 bn; 2,958.2 bn | same | same | paraphrase | yes |
| 2025 violations (full year) | 12.6 trn UZS | 2025 | anhor (ru), via snippet | — | no |
| Anti-Corruption Agency cases | many small cases (e.g. Samarkand: 18 cases ≈50 bn; 9 tenders ≈42 bn where construction began before winners were named) | not verified (likely 2023-24) | https://kun.uz/72698409 | — | no |
| Manual coverage only | 2-3% | see P1 | see P1 | see P1 | yes |
| Risk centre | planned as of article (year not visible); Nov 2026 status not verified | "6-yan" | see P1 | "Xavf-tahlil markazini tashkil etish rejalashtirilmoqda." | yes |

**What already exists:**
- Decree 259 monitoring page with risk assessment, digital rating and violation classification (announced).
- Competition Committee AI collusion detection (announced May 2026; opened = no).
- Accounts Chamber AI and risk-analysis decree of 6 Jul 2026 (opened = no).
- Price module ±10%/20% high-risk rule.
- **Strong overlap risk:** the state is building exactly this, so a student version must be narrower, e.g. affiliation via INN networks plus "same pair customer→winner" plus 2-bidder rotation.

**Data tonight:** `DealsList` (164,649 etender deals with INNs, costs and participant counts). Join on INN with the open company registry where available (orginfo-type public pages; check terms).

**Comparators:**
- **DoZorro/ProZorro** (above).
- **Brazil ALICE** (above).

**AI vs rules:** mostly rules and statistics (single or 2 bidders, <1% price drop, repeat winner share, splitting just under thresholds). AI is genuinely needed only for:
- (a) entity resolution across Cyrillic/Latin company names;
- (b) clustering lots by subject from free text to compare prices like-for-like;
- (c) an LLM-written case summary for the auditor.

**Scores:** pain 5 · both-sides 3 · track fit 2 · 48h feasibility 4.
- **Strongest objection:** "The Accounts Chamber, Competition Committee and Agency already announced AI risk systems; this is a rules engine with a chatbot on top."

### Candidate P3 (track-fit variant of P1/P2). Health-sector procurement: spec lint + bidder/price red flags for clinics', hospitals' and pharma purchases

**Problem.** Health-sector customers buy medical consumables, equipment and medicines with very thin competition. Small pharma distributors and medical-equipment SMBs face narrow specs.
- **Gov users:**
  - Ministry of Health procurement units;
  - Uzmedimpex (the state pharma importer; it publishes tenders on gov.uz/uzmedimpex);
  - Accounts Chamber (health line);
  - Competition Committee (pharma wholesale).

| Claim | Number | Date | URL | Quote | Opened |
|---|---|---|---|---|---|
| Health violations (Accounts Chamber) | 191 bn UZS (1.9% of 10.2 trn), Jan-Sep 2026 | 5 Nov 2026 | https://www.spot.uz/oz/2026/11/05/procurement-violations/ | paraphrase | yes |
| Thin competition at health customers on etender | 76 deals, ≈60.4 bn UZS, median 2 bidders, 68% ≤2 | 8 Oct–17 Nov 2026 | own calc, API | — | yes (own calc; keyword matching may miss or misclassify) |
| Competition Committee: anti-competitive conditions in drug wholesale | qualitative | Oct 2026 | https://www.spot.uz/oz/2026/10/23/pharma/ | — | no |
| Unjustified drug price increases (retail, not procurement) | ~149k cases, Q2 2026 | 2026 | https://anhor.uz/uzl/news/dori-vositalari-narxini-asossiz-oshirish/ | — | no |

**Exists:** the price module (AI from 2027 for 60 goods types, reportedly), drug price referencing (not checked), Uzmedimpex's own tender pages.

**Data:**
- the same API filtered by health customers;
- Uzmedimpex tender notices: https://gov.uz/uz/uzmedimpex/news/tenderlar_

**Comparator:** none fetched in this session.

**Education variant (same mechanics):** education customers on etender had 193 deals (≈134.6 bn UZS), median 2 bidders (own calc). The Accounts Chamber found 384.3 bn UZS of violations in education & science (Jan-Sep 2026). There is also the "Presidential gift" school-supplies case (P1).

**AI vs rules:** the LLM normalises drug names to INN/ATC codes and device specs to comparable attributes, which unlocks a like-for-like price comparison. The flags themselves are rules.

**Scores:** pain 3 (health is only 1.9% of violations by value) · both-sides 4 · track fit 5 (pharma & healthcare) · 48h feasibility 3 (small sample; drug-name normalisation is fiddly).
- **Strongest objection:** "Health is a tiny slice of violations; why not the big SOE purchases?"

### Candidate P4. SME loan-readiness copilot (SME finance)

**Problem.** Small firms can't get credit (only 10% of small and 16% of medium enterprises have loan access), and banks lack data on them.
- **SMB users:** micro and small firms, family-business applicants.
- **Gov users:**
  - **CBU** (SME support concept 2026-2030);
  - **Entrepreneurship Development Company** (guarantees and interest compensation);
  - **commercial banks.**
- **Gain:** better-prepared applications and fewer rejections.

| Claim | Number | Date | URL | Quote | Opened |
|---|---|---|---|---|---|
| MSME credit demand vs shortfall | $13bn demand, $6bn shortfall | 15 Dec 2025 | https://www.worldbank.org/en/news/press-release/2025/12/15/improved-access-to-finance-to-help-7000-businesses-in-uzbekistan-grow-and-create-jobs | "The MSME credit demand is estimated at $13 billion, leaving a $6 billion shortfall." | yes |
| Loan access | 10% small, 16% medium | same | same | "only 10 percent of small and 16 percent of medium enterprises reporting access to loans." | yes |
| Women | ~14% of MSME loans; women-led firms are ~1/3 of MSMEs | same | same | "they receive only about 14 percent of MSME loans." | yes |
| SME loan portfolio | 218 trn UZS ≈ 12% of GDP; target 20% by 2030; state banks 73% → 65% | "14 окт." (2026 inferred) | https://anhor.uz/ru/news/kredit-maliy-biznes-uzbekistan-2030 | "увеличение кредитного портфеля этого сектора с нынешних 218 трлн сумов" | yes |
| Share of bank portfolio | SMEs = 36% of the portfolio, 34% of issuance (1 Jul 2026) | 2026 | search snippet (anhor/uzdaily) | — | no |
| Current processing time | up to 7 days | 26 May 2026 | https://kun.uz/en/news/2026/05/26/uzbekistan-to-digitize-small-business-lending-with-new-ai-based-platform-1d338a | "processing such loans takes an average of up to seven days." | yes |
| State AI scoring launch | 1 Dec 2026 | 26 May 2026 | same | "an alternative scoring model built on artificial intelligence" | yes |
| Unsecured microloan ceiling | 100m → 200m UZS | 2026 | same | paraphrase | yes |
| Collateral | 25% collateral enough for loans ≤10 bn UZS (Aug 2026 dialogue); ADB older figure 130%+ | 2026 / older | search snippets | — | no |
| Credit bureau coverage | 68% of SMEs in the bureau, but only 24% have active credit accounts; target 80% | 2026 | search snippet (CBU concept) | — | no |
| IFC credit gap | ~$11.8bn | 2024 | https://www.ifc.org/en/pressroom/2024/ifc-supports-smaller-businesses-and-women-entrepreneurs-in-uzbekistan | — | no |
| Guarantees and compensation | >77.3 trn UZS of loans supported (to 1 Jul 2025) | 2025 | https://gov.uz/oz/imv/news/view/70217 | — | no |
| Rejection reasons | **no number found** | — | — | — | — |

**What exists:**
- **State digital lending platform** with AI alternative scoring from 1 Dec 2026, i.e. two weeks after the hackathon; the AI consultant is planned "eventually".
- **Banks' online microloans** (NBU and others).
- **Entrepreneurship Development Company** guarantee programmes.
- **World Bank FINGROW** ($100m loan plus $5m grant).

**Data:**
- no public loan-level or rejection data;
- only programme rules (lex.uz decrees) and bank product passports (e.g. Hamkorbank PDF). A demo would rely on synthetic applicant data.

**Comparators:** none fetched with numbers in this session.

**AI vs rules:**
- **Eligibility for programmes:** rules.
- **AI:** LLM business-plan drafting and document-checklist Q&A in Uzbek, plus alternative-data scoring (needs data we don't have).

**Scores:** pain 4 · both-sides 3 · track fit 3 (entrepreneurship) · 48h feasibility 2.
- **Strongest objection:** "The state platform with AI scoring goes live 1 Dec 2026; you have no real data."

## 4. Recommendation for this theme

**Best: P1 (spec checker) fused with a light P2 layer.**
- **One screen for the SMB:** "Here are open lots matching your products; this one has 3 restrictive clauses and its customer usually ends with 2 bidders."
- **One screen for the Agency or Competition Committee:** "Lots ranked by restrictive-clause score × customer history."
- **Pick a sector for track fit:** health customers (P3) for the pharma & healthcare track, or school-supply lots (the "Presidential gift" case) for education.
- **Data is live and login-free** (POST JSON API). The only unknown is how to fetch spec attachments automatically; fallback is manual download of 20-30 files.

## 5. Gaps / things not verified
- ZRU-684 text and 2025-26 amendments: not read.
- Decree prefix (PF or PP) for No. 259: not verified on lex.uz.
- **SME share of awards, number of bidder complaints, average bidders nationally:** no number found.
- e-shop (xarid.uzex.uz "Elektron do‘kon") public API: not probed. The bulk of 1.1M deals sits there.
- **Comparator numbers (ALICE, DoZorro):** snippet-only, so open them before putting them on a slide.
- Anti-Corruption Agency 2025 procurement totals: no consolidated number found.
- **Not researched:**
  - family entrepreneurship programmes;
  - tender.mc.uz and the industrial cooperation portal (the Uztelmash complaint shows the cooperation-portal step is part of the pain);
  - Treasury findings.
- What exactly the "75% of e-shop offers checked by AI" check does: not found.
