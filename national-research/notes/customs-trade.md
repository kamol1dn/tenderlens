# Customs, trade, e-commerce and technical regulation: research notes

Researched 17 Nov 2026 (about 25 min) for team Eclipse, National AI Hackathon, Tashkent.
"opened = yes" means I fetched the page myself (WebFetch, or curl plus a text dump) and saw the number. "opened = no" means the number came from a search snippet only and must be re-checked before it goes on a slide.
SMB baseline (verified by the coordinator, not redone here): 1,264,501 small businesses as of 1 Oct 2026. SMB exports were $12,135.7M (47.0% of all exports) and SMB imports $20,698.3M (52.3%), Jan-Sep 2026. Source: stat.uz/img/press-relizlar/kb_uz_p93194.pdf

---

## 0. Context the judges will assume you know

| Claim | Number | Date | URL | Verbatim quote (original language) | Opened |
|---|---|---|---|---|---|
| WTO: Uzbekistan is NOT yet a member. It now aims to finish negotiations by end-2026 and join in 2027 | 400+ questions answered and 30+ documents submitted in 2026 | 4 Nov 2026 | https://daryo.uz/en/2026/11/04/negotiations-will-not-be-easy-uzbekistan-aims-to-join-wto-in-2027-as-talks-continue/ | "aims to complete negotiations on joining the World Trade Organization (WTO) by the end of 2026 and become a member in 2027" | yes (curl) |
| WTO: bilateral market-access agreements deposited | 31 (latest: India) | 27 Jul 2026 | https://www.wto.org/english/news_e/news26_e/acc_27jul26_470_e.htm | "determination to complete its WTO accession process within 2026" | yes |
| The earlier "March 2026 membership" target slipped | MC14, 26-29 Mar 2026 | Sep 2025 | https://kun.uz/en/news/2025/09/29/wto-hopes-to-welcome-uzbekistan-as-member-in-early-2026 | "by March 2026 we should be able to celebrate Uzbekistan's membership" | no |
| New TN VED (Uzbek tariff nomenclature) approved to align with WCO/WTO | PP-181; in force 20.05.2025; Annex 1 applies from 1 Jun 2025 | 14 May 2025 | https://lex.uz/ru/docs/7533469 | "В целях ускорения процесса вступления Республики Узбекистан во Всемирную торговую организацию" | yes (curl) |
| Codes changed under PP-181 | 351 codes in groups 21 (vitamin-mineral mixes) and 87 (vehicles); 34 new 10-digit fruit/veg codes | May 2025 | https://buxgalter.uz/ru/publish/doc/text208462_chto_menyaetsya_v_kodah_tn_ved | "утвержден новый перечень кодов ТН ВЭД и обновлены ставки импортных таможенных пошлин" | yes |
| New customs strategy "Yangi O'zbekiston bojxonasi - 2030" (decree of 27 Aug 2026) | Targets: 60% of clearance with no human involvement; clearance time halved; customs revenue 4.4% of GDP | 9 Oct 2026 | https://uza.uz/ar/posts/bojxona-faoliyatida-suniy-intellekt-imkoniyatlari-kengaymoqda_919847 | no verbatim quote captured for the targets (the same article says post-clearance audit moves to a "“maslahatchi-auditor” tamoyili") | yes |
| Same decree, reported as UP-174: by 2030 average import clearance 2 h, export 30 min | 2 h / 30 min | Aug-Sep 2026 | source URL not confirmed (search snippet; candidate https://anhor.uz/news/v-uzbekistane-46/) | "сократить среднее время на таможенное оформление импорта до 2 часов, экспорта — до 30 минут" | no |
| AI decree UP-189: at least 100 government AI projects by end-2026. The Customs Committee is listed as a participant in an AI system for detecting the shadow economy (2026-2028) | 100 projects | 22 Oct 2025 | https://lex.uz/docs/7790236 | "не менее 100 проектов" | yes |

---

## Candidate 1 (RANK 1): Explainable AI assistant for HS/TN VED classification and drafting pre-ruling requests

**Problem in one sentence.** SMB importers and exporters (and the small customs brokers who file for them) choose a 10-digit TN VED code out of roughly 13,000 from an 874-page Uzbek-Cyrillic PDF. A wrong code means extra duty assessed later, customs expertise (which can take up to 2 months, although conditional codes have allowed release within 5 working days since Oct 2024) or disputes. Meanwhile the Customs Committee (Tariff Regulation / classification department, Central Customs Laboratory, Risk Management Department) spends officer time on expertise, re-classification and pre-rulings, and has publicly set itself a 95% classification-accuracy goal.

- **SMB users:** small importers (consumer goods, auto parts, food supplements, medical consumables), exporters filling "Export in 3 steps", customs brokers, and SMB accountants.
- **Government user and gain:** Customs Committee, classification / tariff department and Central Customs Laboratory. They get fewer wrong codes on arrival, pre-ruling applications that are pre-filled and better argued (GRI rules cited), and a second-opinion tool for officers. This directly serves their "95% accuracy in goods classification" objective. Ministry of Investment, Industry and Trade (MIIT) also gains: transparent tariff application is a WTO accession talking point.

### Evidence

| Claim | Number | Date | URL | Verbatim quote | Opened |
|---|---|---|---|---|---|
| Customs' own goal for classification accuracy (target, not achieved) | 95% | 2 Mar 2026 (WCO News 109) | https://mag.wcoomd.org/?p=20107 | "The objective is to ensure 95% accuracy in goods classification and improve the capacity to detect commercial fraud cases." | yes |
| Court disputes over customs clearance (all causes, not only classification) | 233 (2020) to 130 (2025) | 2 Mar 2026 | https://mag.wcoomd.org/?p=20107 | "While 233 disputed cases related to Customs clearance were examined by economic and civil courts in 2020," | yes |
| TN VED code errors found by customs, and extra duty assessed | 1,056 cases; 31.9 bn soum (up 12% from 28.5 bn) | Jan-Apr 2022 (article dated 18 May 2022), STALE | https://yuz.uz/uz/news/davlat-byudjetiga-319-milliard-som-qoshimcha-bojxona-tolovlari-undirildi | "1056 ta holatda tovarlarning TIF TN kodini qoʻllashdagi xatoliklar aniqlandi" | yes |
| Pre-rulings on classification issued | 1,204 in Jan-Apr 2022 | 18 May 2022, STALE | same as above | "1204 ta tovarlarning TIF TN boʻyicha tasniflanishi" | yes |
| Pre-rulings on classification issued (period as stated in the article) | 1,302 | article 27 Dec 2021, STALE | https://yuz.uz/uz/news/bojxona-organilarida-dastlabki-qarorni-qabul-qilish-tartibi-qulayliklari-ahamiyati-va-afzalliklari | "jami 1 302 ta dastlabki qarorlar qabul qilingan" | yes |
| Pre-ruling review time / fee / validity | 20 days / 75% of BHM / 1 year | 27 Dec 2021, STALE (rules may have changed) | same as above | "yigirma kun ichida koʻrib chiqiladi" | yes |
| 2025-2026 counts of classification errors, pre-rulings, penalties | no number found | | | | |
| Customs expertise can take up to 2 months. Since Oct 2024, conditional codes let goods be released in 5 working days | 5 working days vs up to 2 months | 1 Jul 2025 | https://www.spot.uz/ru/2025/07/01/customs/ | "экспертиза может занять до двух месяцев" | yes |
| Customs expertises carried out | 2,681 in Jan-Apr 2022 | 18 May 2022, STALE | https://yuz.uz/uz/news/davlat-byudjetiga-319-milliard-som-qoshimcha-bojxona-tolovlari-undirildi | "2681 ta bojxona ekspertizalari oʻtkazildi" | yes |
| Example: laundry products declared under a lower-duty code | 82.6 mn and 161.8 mn soum extra duty | 13 Jul 2024 | https://anhor.uz/uzl/news/kodi-stavkasi-past-bo-lgan-kodga-o-zgartirilgan-kir-yuvish-moshinalariga-qo-shimcha-bojxona-to-lovlari-hisoblandi/ | "161,8 mln. so‘mlik qo‘shimcha bojxona to‘lovlari hisoblangan" | yes |
| Example: 40 tricycles misclassified | about 198 mn soum | date not checked | https://zamin.uz/uz/jamiyat/83628-tovarlarni-notri-tasniflash-olatiga-chek-jildi.html | "TIF TN kodini noto‘g‘ri tasniflanganligi aniqlandi" | no |
| Declaration volume: simplified export and import declarations | 266k export (94%), 491k import (90%). PERIOD NOT STATED in the article (it could be 2025 or Jan-Sep 2026) | 9 Oct 2026 | https://uza.uz/ar/posts/bojxona-faoliyatida-suniy-intellekt-imkoniyatlari-kengaymoqda_919847 | "eksport deklaratsiyalarining 94 foizi yoki 266 mingtasi, import deklaratsiyalarining 90 foizi yoki 491 mingtasi" | yes |
| DERIVED total cargo declarations | about 283k export + about 546k import, roughly 830k total, period not stated (my back-calculation from 266k/0.94 and 491k/0.90; not an official figure) | derived | same | | derived |
| Declarations cleared with no human involvement | 185k+ (43% of exports, 11% of imports) | 9 Oct 2026 | same | "rasmiylashtiruvi inson omilisiz amalga oshirildi" | yes |
| Users of simplified procedures (NOT the total number of exporters/importers) | 8,000 exporters, 51,000 importers | 9 Oct 2026 | same | (time and cost saved for these users) | yes |
| Customs payments collected thanks to AI/digital tools | 150 bn soum in 2025 | 9 Oct 2026 | same | "150 mlrd so‘m bojxona to‘lovlari davlat byudjetiga undirilgan" | yes |
| Clearance time is a small part of total release time: Time Release Study 2022-23 | Import: average 3 days 1 h 17 min, of which customs clearance 2 h 5 min. Export: 17 h 5 min, of which clearance 52 min | study 2022-23; deck 2025 CAREC CCC | https://carecprogram.org/uploads/2025-CCC-S5_UZB_RU.pdf | "Для импорта: среднее время - 3 дня 1 час 17 минут" | yes (curl+pypdf) |

**Reading of the evidence.** For SMBs the pain is money risk and delay from wrong codes (extra duty, expertise holds), not raw clearance speed. Customs clearance itself is already about 2 h of a 3-day import. The freshest official classification-error statistics I found are from 2022, so for 2025-26 it is "no number found". Say this honestly on the pitch, or ask the Customs Committee for current numbers.

### What already exists (judges will ask "doesn't X already do this?")

| Tool | Status | Source | Opened |
|---|---|---|---|
| "Integratsiyalashgan tarif" (Integrated Tariff, tarif.customs.uz, which now redirects to notarif.customs.uz/notarif/). A NEW version with "AI elements" lets you upload a product photo and get the code, duty, permits and other countries' requirements | PRESENTED at a press conference (9 Oct 2026). Public availability of the image search was NOT verified: the site is a JS app shell and curl shows only menus ("Qidiruv", "Kalkulyator") | https://uza.uz/ar/posts/bojxona-faoliyatida-suniy-intellekt-imkoniyatlari-kengaymoqda_919847 ; https://notarif.customs.uz/notarif/ | yes / yes (shell only) |
| Customs plus IBM pilot "Identification of Specific Classifications Using Product Information and AI" (LLMs, big data) | First phase COMPLETE (Aug 2024); next steps under discussion | https://www.uzdaily.uz/en/customs-committee-implements-ai-for-goods-identification | yes |
| Auto-clearance: 3 machine-learning models route declarations to red/yellow/green | Fully operational since April 2025 (test mode Sep 2022). Results: manual processes -75%, clearance time -42% | https://mag.wcoomd.org/?p=20107 | yes |
| "AI-tahlil" (AI analysis) module for the "Bojxona auditi" (post-clearance audit) system | PLANNED | UZA 9 Oct 2026 (above) | yes |
| Talks with Webb Fontaine (UAE) on AI for risk, HS classification and valuation | DISCUSSED, 2 Sep 2026; no AI classification tool named | https://www.uzdaily.uz/en/uzbekistan-customs-webb-fontaine-discuss-ai-implementation/ | yes |
| tasnif.soliq.uz: the Tax Committee's IKPU (product code) search. This is a different classifier, not TN VED | live | https://buxgalter.uz/oz/publish/doc/text191001_kak_nayti_pravilnyy_ikpu_na_tasnif_soliq_uz | no |
| Academic: ML model that predicts TN VED from description text (Customs Institute author) | research paper, Nov 2025 | https://marketingjournal.uz/index.php/mj/ru/article/download/617/616/615 | no |

**Conflict to show, not reconcile.** The CAREC deck says "automatic release of goods without a customs officer" started 1 Jan 2021. WCO News says auto-clearance was in test mode from Sep 2022 and fully operational from Apr 2025. Green-channel share also differs: 32.4% green / 62.3% yellow / 5.3% red for cargo (CAREC 2025 deck, period unstated) versus 90/9/1 for parcels (CAREC e-commerce deck). These are different flows and periods.

**How to differentiate from Customs' own photo search (this answers the strongest objection).**
1. Text, invoice and spec-sheet input, not only a photo. Most SMB pain sits in invoices and contracts in Chinese, Russian or English.
2. Explainable output: the top 3 codes, each with the GRI rule, heading notes and the duty rate cited from the official PP-181 text, and a confidence score.
3. A one-click draft of the pre-ruling ("dastlabki qaror") application for uncertain cases.
4. An officer-side mode: flag mismatches between the declared code and the invoice description, as input to risk management.
5. Uzbek Latin, Uzbek Cyrillic and Russian.

### Public data the team can collect TONIGHT

- **Full official TN VED nomenclature (PP-181 Annex 1), downloadable.** https://lex.uz/ru/files/7541055 is a 7.6 MB zip containing "1-илова.pdf" (874 pages, Uzbek Cyrillic, text-extractable with pypdf). It includes the GRI interpretation rules, headings and 10-digit codes with names. My regex count found about 13,196 distinct 10-digit code strings (approximate, my own count). Text extraction of all 874 pages takes over 3 minutes, so pre-extract tonight. Opened yes (curl+pypdf).
  - Language: lex.uz says "Приложения № 1-2 приводятся на узбекском языке". There is NO official Russian annex. For Russian descriptions, use the EAEU TN VED (CIS-based, the same at the HS 6-digit level), for example https://www.tks.ru/db/tnved/ (third-party, check the license). Uzbek Latin can be produced by transliteration.
- **Import duty rates (Annex 2 / PP-3818 as amended), as HTML.** https://lex.uz/ru/docs/7533457 is about 258k characters of text, a table of code, name and rate, scrapeable. Opened yes (curl).
- **PP-181 decree text:** https://lex.uz/ru/docs/7533469 (Russian and Uzbek).
- **Labelled examples:** published pre-ruling registers. A search snippet (source not identified) claimed rulings are published on bojxona.uz; I could not locate a current public register in one search. If there is no register, build a test set from news cases (anhor/zamin examples above) plus synthetic invoices.
- **Integrated Tariff:** https://notarif.customs.uz/notarif/ (JS app; can be used manually for spot-checking the team's answers).
- **Comparator dataset idea:** Korean customs research used about 129k past rulings. A student team can use the HS explanatory structure plus about 200 hand-labelled SMB product descriptions as an evaluation set.

### Foreign comparators

| Country | What | Result number | URL | Opened |
|---|---|---|---|---|
| Korea (Lee et al. 2023; the link to the Korea Customs Service comes from a search snippet, not checked) | Explainable HS classification model that suggests the 6-digit subheading and explains its reasoning for officers | Top-3 accuracy 93.9% on 5,000 recent classification requests over 925 difficult subheadings; a user study with 32 customs experts confirmed reduced review time | https://arxiv.org/abs/2311.10922 | yes |
| Korea (2021 paper) | Sentence-retrieval HS classifier | Top-3 95.5% on 265 subheadings, 129,084 cases | https://arxiv.org/abs/2111.01663 | no |
| Kazakhstan (Keden / ASTANA-1) | Pre-classification rulings filed in Keden from 28 Jul 2025; "elements of AI" claimed, but no classification-AI figure | none | https://mybuh.kz/news/reshenie-o-klassifikatsii-tovarov-v-is-keden-s-28-iyulya-2025/ | no |

### AI vs rules

- **Needs AI:** mapping free-text, multilingual invoice lines ("silicone phone case, 2pcs") to candidate headings (embeddings/LLM retrieval over the 874-page nomenclature); OCR of invoice PDFs and photos; generating explanations that cite the GRI rules; drafting pre-ruling text.
- **Plain rules / lookup:** once the code is chosen, looking up the duty rate, VAT, excise and permit requirements (deterministic from lex.uz tables); validating 10-digit code format; the HS-2022 to TN VED mapping; the auto-clearance channel logic (Customs already has it).

### Scores (1-5)

- Pain evidence: **3**. The pain is real and Customs' own 95% goal shows the gap, but the hard numbers are 2022 and there is no current error count.
- Benefit to both sides: **5**. SMBs avoid extra duty and holds; Customs gets cleaner declarations and better pre-ruling requests.
- Track fit: **3** (entrepreneurship). Pharma fit improves if the demo focuses on group 30 medicines, group 21 supplements (changed by PP-181) and 9018-9022 medical devices.
- 48h demo feasibility: **4**. The official nomenclature is downloadable as text tonight, and retrieval plus LLM over about 13k codes is buildable. Caveats: the annex is Uzbek Cyrillic only; leaf rows such as "– бошқа" need their parent heading chain to make sense; and there is no labelled test set.
- **Strongest judge objection:** "The Customs Committee already presented an AI photo-to-code feature in the Integrated Tariff (Oct 2026) and ran an IBM classification pilot. Why you?" Answer: explainable top-3 with citations, invoice/text input, pre-ruling drafter, and an officer-side mismatch flag. The tool feeds Customs' pipeline instead of competing with it. Pitch it as a plug-in for notarif.customs.uz.

---

## Candidate 2 (RANK 2): "Which permits and certificates do I need for this code?" navigator (technical regulation, Single Window, pharma import)

**Problem in one sentence.** After choosing a code, an SMB importer must work out which of about 60 permit types from 12 agencies apply. Examples: a conformity certificate or declaration from the Uzbek Agency for Technical Regulation (O'zstandart), sanitary (SES), veterinary or phytosanitary permits, and Ministry of Health / Pharma Agency registration for medicines and devices. The mandatory-certification lists are being cut and rewritten in 2025-26, so the rules move faster than SMBs can track them.

- **Government users:** Uzbek Agency for Technical Regulation (conformity assessment department), which gets fewer wrong applications and a clearer picture for market surveillance. Customs Committee Single Window operator. Pharma Agency / Center for Pharmaceutical Product Safety. MIIT (WTO TBT commitments).

### Evidence

| Claim | Number | Date | URL | Verbatim quote | Opened |
|---|---|---|---|---|---|
| Single Window: permit types, agencies, users, permits issued | 60 types of permit documents from 12 agencies; 55k+ registered traders; 3.1M+ permits | CAREC CCC deck 2025 (period not stated) | https://carecprogram.org/uploads/2025-CCC-S5_UZB_RU.pdf | "зарегистрировано более 55 тыс. участников ВЭД, которым уполномоченными органами выдано более 3,1 млн. разрешений" | yes (curl+pypdf) |
| Single Window portal links MoH, Uzstandart, the state register of medicines, the dietary supplement (BAD) register and accredited certification bodies | (portal structure) | live 17 Nov 2026 | https://singlewindow.uz/ | "Государственный реестр лекарственных средств" | yes (curl) |
| Mandatory certification to be dropped for some product groups in favour of a declaration of conformity; the list is shortened | 32 groups; 459 + 288 = 747 items removed | article date not shown | https://anhor.uz/news/uzbekistan-plans/ | "Мы переходим к системе рыночного контроля качества продукции" | yes |
| Business complaint: months-long clearance delays for display fridges even after their certification was abolished by the 18 April decree | months | year not shown | https://anhor.uz/news/uzbekistan-plans/ | (paraphrase, no number) | yes |
| Conformity-assessment market | 207 private test labs, 73 certification bodies; UzTest to be abolished; accreditation moved under the Cabinet | 13 Feb (year not shown; it mentions a Sep 2025 event, so likely 2026) | https://anhor.uz/world/regulatory-reform/ | "Центр научных испытаний и контроля качества UzTest планируется упразднить" | yes |
| Number of conformity certificates issued per year; cost and time per certificate | no number found | | gov.uz/ru/standart/activity_page/sertifikatlashtirish_ (registries by year) | | |
| Medicines import | about $2bn in 2025 | Feb 2026 | https://kun.uz/en/news/2026/02/27/uzbekistan-seeks-to-cut-2bn-medicine-imports-and-boost-domestic-production | "imported medicines, which reached $2bn in 2025" | no |
| Medicine registration: recognition of WHO-Listed Authorities from 1 Oct 2025; 5-year certificate | 5 years | Aug 2025 | https://www.spot.uz/ru/2025/08/28/drugs-registration/ | "Регистрационное удостоверение выдается на 5 лет" | no |
| Fast-track import of scarce medicines and devices (draft); safety center opinion within 3 working days | 3 working days (draft) | 22 Dec 2025 | https://kun.uz/en/news/2025/12/22/uzbekistan-plans-fast-track-imports-for-scarce-medicines-and-medical-equipment | | no |

### What already exists

- singlewindow.uz: application filing, a list of non-tariff measures, and certificate authenticity checks.
- notarif.customs.uz: the Integrated Tariff shows required permits per code (presented as AI-assisted in Oct 2026).
- UzTradeInfo national trade portal (launched 23 Nov 2022, per the CAREC deck).
- dalil.standart.uz / info.standart.uz (linked from the Single Window).
- So a lookup from code to permits partly exists. The gap is explaining reform changes (what changed after the 747-item cut) and a document checklist plus application pre-fill.

### Public data tonight

- singlewindow.uz pages: lists of non-tariff measures and accredited bodies.
- lex.uz texts of the certification lists. Search "Перечень продукции, подлежащей обязательной сертификации" on lex.uz; I did not open it.
- gov.uz/ru/standart registries.
- The pharma state register of medicines (link on singlewindow.uz).

### Foreign comparator

- No number found in the time cap. Candidates: Singapore TradeNet / Networked Trade Platform, and the EU Access2Markets "My Trade Assistant".

### AI vs rules

This is mostly rules: code to permits is a lookup table. AI is only needed for (a) a Q&A layer over changing legal texts on lex.uz (RAG with citations) and (b) reading a product spec to decide whether it falls inside a listed group. A judge can fairly say "this is a database, not AI".

### Scores (1-5)

- Pain: **3**
- Both sides: **4**
- Track fit: **4** (pharma import angle plus entrepreneurship)
- 48h feasibility: **3** (the legal lists are scattered; the scraping is messy)
- **Strongest objection:** "singlewindow.uz plus Integrated Tariff already list permits per code; your AI is a thin RAG wrapper." Best used as a module of Candidate 1, not as a standalone project.

---

## Candidate 3 (RANK 3): E-commerce / small-parcel compliance (marketplace sellers and couriers; undervaluation)

**Problem in one sentence.** Cross-border parcel volume grew 12x in 5 years. Customs screens about 9.9M shipments with risk management, and the main detections are "exceeding duty-free limits" and undervaluation. Foreign and local marketplace sellers face new VAT and bonded-warehouse rules in 2026.

- **Government users:** Customs Committee (e-commerce / postal clearance, risk management) and the Tax Committee (VAT on nonresident sellers).

### Evidence

| Claim | Number | Date | URL | Verbatim quote | Opened |
|---|---|---|---|---|---|
| Parcels screened by risk management since its 2025 launch | 9.9M; 101 courier organizations (2025) | CAREC 25th CCC deck (2026) | https://carecprogram.org/uploads/25th-CCC-S4-UZB.pdf | "9.9M shipments processed through RMS since launch" | yes (curl+pypdf) |
| Growth and channels | 12x volume in 5 years; green 90% / yellow 9% / red 1%; 73 violations detected in 2026 | same | same | "12× volume growth in 5 years" | yes |
| Thresholds | $100 per postal shipment; $200 monthly cumulative for courier; 30% unified payment, min $3/kg | same | same | "Monthly cumulative threshold: $200" | yes |
| Undervaluation statistical module | deployed Mar 2026 | same | same | "Statistical module deployed March 2026 – flags anomalous declared values" | yes |
| Unified payment for individuals to drop from 30% to 20% | 30% to 20% | Sep 2026 | https://anhor.uz/ru/news/v-uzbekistane-snizyat-edinyy-tamojennyy-platej-dlya-fizlits-s-30-do-20 | | no |
| VAT regime for nonresident sellers extended to B2C sales via platforms | effective 12 Dec 2026 | Sep 2026 | https://kpmg.com/us/en/taxnewsflash/news/2026/09/uzbekistan-vat-nonresident-e-commerce-sellers.html | | no |
| Bonded-warehouse experiment for e-commerce | decree of 13 Apr 2026 | Apr 2026 | https://kun.uz/en/news/2026/04/14/uzbekistan-to-establish-bonded-warehouses-to-boost-e-commerce-sector | | no |
| Number of SMB sellers on Uzum/Wildberries with compliance problems | no number found | | | | |

### What already exists

The Customs "E-commerce" system (recipient Face ID confirmation, threshold monitoring), parcel risk management with a statistical undervaluation module, and planned green-channel auto-clearance.

### Data tonight

Little public microdata. Marketplace listing texts on Uzum are public, but scraping terms are unclear.

### Foreign comparator

No number found in the time cap. Candidates to check: the EU IOSS (low-value consignments, since July 2021) and Kazakhstan Keden e-commerce. Neither was opened.

### AI vs rules

Parcel description to HS code (same engine as Candidate 1) and anomaly detection on declared value need AI or statistics. Thresholds are rules.

### Scores (1-5)

- Pain: **2** (for SMBs; the pain mostly falls on individuals and Customs)
- Both sides: **3**
- Track fit: **2**
- 48h feasibility: **2** (no data)
- **Strongest objection:** "Customs already deployed parcel risk management and an undervaluation module in 2025-26, and you have no data."

---

## Other numbers found (for reference)

| Claim | Number | Date | URL | Opened |
|---|---|---|---|---|
| World Bank LPI rank (self-reported by Customs) | 99th (2018) to 88th (2023); customs efficiency 140th to 74th | 2 Mar 2026 | https://mag.wcoomd.org/?p=20107 | yes |
| Customs payments | UZS 24.7 tn (2020) to 63.1 tn (2024) | 2 Mar 2026 | same | yes |
| Clearance time cut | from 3 days to 1 working day (1 May 2022) | CAREC 2025 deck | https://carecprogram.org/uploads/2025-CCC-S5_UZB_RU.pdf | yes |
| Draft rule: preferences apply only to the confirmed (exporter-country) value; checked after release | comments until 27 Oct 2026 | 14 Oct 2026 | https://www.spot.uz/ru/2026/10/14/customs-preference-revision/ | yes |
| Exports in 2025 | $33.4bn (MIIT) vs $33.8bn (Statistics Agency, preliminary). The sources differ | 2026 | https://gov.uz/en/miit/news/view/116854 | no |
| Number of exporting SMBs | no number found | | | |
| Kazakhstan comparison: 830 customs audits Jan-Oct 2025, 81% found violations, 31bn tenge extra; TN VED errors common | | Nov 2025 | https://bizmedia.kz/2025-11-23-kgd-soobshhil-o-rezkom-roste-vyyavlennyh-narushenij/ | no |

## Recommendation for the team

Build Candidate 1 and add the permit lookup from Candidate 2 as a feature: after the code, show the required permits and certificates and the duty from the official tables. Use pharma or medical goods as the demo vertical (groups 21, 30, 90) to hit the pharma track. Frame it as a plug-in for the Customs Committee's Integrated Tariff and a pre-ruling drafter, not a competitor.
