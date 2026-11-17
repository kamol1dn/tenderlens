# National AI Hackathon (Tashkent, 17–19 Nov 2026): problem research for Team Eclipse

Prepared 17 Nov 2026 (evening). Seven research streams ran in parallel:
- six themes: tax; inspections and complaints; procurement and finance; customs and trade; labour, land and services; pharma, health and education;
- my own checks in the browser and against public APIs.

Raw notes with every quote are in `notes/`. API dumps and scripts are in `data/`.

**How to read the source marks**

| Mark | Meaning |
|---|---|
| **V** | Verified: the page was opened (by me or a research agent) and the number was seen on it. The agent notes hold the verbatim quote. |
| **V\*** | Verified and **re-opened by me personally** today for this report. |
| **R** | Reported: from a search-result summary only. Re-check before it goes on a slide. |
| **C** | Our own calculation from an official public API or file on 17 Nov 2026, reproducible with `data/scripts/`. |

---

## 0. TL;DR

**Top pick: TenderLens.** An AI that reads public-procurement tender specs (Uzbek Cyrillic, Uzbek Latin, Russian) and does two jobs:
- For small suppliers, it says "can I realistically win this?", flags clauses tailored to one supplier, and drafts a clarification request.
- For the new Agency for Industrial Cooperation and Public Procurement and the Competition Committee, it ranks live lots by restrictive-clause risk combined with the customer's bidding history.

Why it wins:
- Strongest two-sided evidence: the competition regulator found 8,647 cases of "creation of advantages for specific bidders" in 2025, across the more than 23,000 procedures it analysed.
- Live, login-free official data that we tested tonight, including the spec files themselves.
- The AI is genuinely needed: reading 2–100-page specs in three scripts is exactly what humans can't scale. An expert estimates only 2–3% of procedures get manual analysis.
- We found no automated state tool that reads spec text. Spec review today is human expertise for some purchases.
- A real flag found tonight: a live drill-bit tender scores bidders on a *state veterinary control* document (§5.3).
- **Go/no-go tonight:** run the extractor on 30 specs. If it finds fewer than about 5 defensible flags, switch to Plan B (pharmacy).

**The 5 candidates, ranked:**
1. **TenderLens: procurement spec checker plus red flags** (entrepreneurship). Live API and spec PDFs. Regulator found 28,300 anti-competitive actions in 16,100 procedures in 2025. Score 18/20.
2. **Pharmacy price-compliance copilot** (pharma plus entrepreneurship). Live reference-price API. About 686,000 overpricing cases at about 2,500 pharmacies. But the state already monitors 12,500+ pharmacies automatically. 17/20.
3. **Inspection Shield plus Business Ombudsman triage** (entrepreneurship). Decree PF-175 adds new Ombudsman duties from 1 Jan 2027. 6,350 businesses were inspected repeatedly in H1 2026. 16/20.
4. **Kindergarten-subsidy integrity plus owner payment assistant** (education plus entrepreneurship). UZS 4.7 trn allocated in 2026. Court-proven ghost-children fraud. Synthetic data only. 16/20.
5. **Customs TN VED classifier plus pre-ruling drafter** (entrepreneurship, with a pharma-goods angle). Official nomenclature is downloadable. Customs already demoed its own AI photo-to-code tool in Oct 2026. 16/20.

The earlier licence/permit refusal checker ("Ruxsat") scores 14/20 on the same grid. It reads as a legal-services product and would fit LexHackathon (20–22 Nov) better.

---

## 1. Context the judges will assume you know

### 1.1 SMBs in numbers

| Fact | Number | Source | Mark |
|---|---|---|---|
| Operating small businesses, 1 Oct 2026 | 1,264,501. Of these: 551,093 small enterprises and micro-firms, including farms; 357,883 individual entrepreneurs; 330,830 dehqon (household) farms | stat.uz press release 28.10.2026, https://stat.uz/img/press-relizlar/kb_uz_p93194.pdf | V\* |
| SMB share of GDP, Jan–Sep 2026 | 53.8% (UZS 904,834.2 bn) | same | V\* |
| SMB share of exports / imports, Jan–Sep 2026 | 47.0% ($12,135.7M) / 52.3% ($20,698.3M) | same | V\* |
| New small firms, H1 2026 | 44,000 | https://stat.uz/en/press-center/news-of-committee/69533-zbekistonda-1-2-mlndan-orti-kichik-tadbirkorlik-subektlari-faoliyat-yuritmo-da-5 | V\* |

### 1.2 The state's AI agenda (useful framing)
- **Oct 2025 presidential AI agenda:**
  - at least 100 sectoral AI projects in 2026: health, energy, banking, customs and tax, transport, mining, agriculture;
  - an AI-adoption rating of ministries and regions from 2026;
  - AI hackathons in every region to find youth projects.
  - Sources: https://www.spot.uz/oz/2025/10/21/ai-projects/ (V\*); decree UP-189 text https://lex.uz/docs/7790236 (V).
- **Government Resolution No. 581 of 20 Oct 2026:** free LLM API access for up to 6 months (10M tokens a month) for startups and universities. Selection runs twice a year, in July and November. https://anhor.uz/uzl/news/ai-infratuzilma-ijtimoiy-loyihalar (V\*). **Pitch hook:** "We will run on state AI infrastructure after the hackathon."

### 1.3 "Doesn't X already do this?" State AI tools live or announced in 2026

| Tool | Covers | Implication | Source / mark |
|---|---|---|---|
| **AI SOLIQ** (ai.soliq.uz, Tax Committee's own LLM). Since Jul 2026: Ekspress audit, AI Avtokameral, AI EHF (risky e-invoices), ratings, tax benefits, reports, cashback, assistant, voice robot. About 25k users, 3–4k a day. | Almost all SMB tax questions | Avoid tax-explainer ideas | https://gov.uz/ru/soliq/news/view/241337 (V); https://www.spot.uz/ru/2026/09/12/soliq-ai/ (V) |
| **State SME lending platform**: one application, offers from many banks, AI alternative scoring from 1 Dec 2026 | SME finance | Avoid credit-scoring ideas | https://kun.uz/en/news/2026/05/26/uzbekistan-to-digitize-small-business-lending-with-new-ai-based-platform-1d338a (V\*) |
| **LexAI** (ai.lex.uz, Ministry of Justice). Generic legal Q&A, limited to specialists. MoJ–KOICA AI legal-services project 2026–2030 ($14.5M) | Legal Q&A | A generic "legal chatbot" isn't novel | https://the-tech.kz/ministerstvo-yusticzii-uzbekistana-zapustil-sobstvennogo-chat-bota-na-osnove-ii/ (V\*); https://uza.uz/ar/posts/uzbekistan-launches-ai-based-legal-services_854281 (V) |
| **Muxlisa AI** on my.gov.uz (test mode); **Mehribon** social-benefits assistant (automates up to 65% of voice requests) | Citizen services | — | https://uzinfocom.uz/news/332 (R); https://www.spot.uz/ru/2026/08/27/u-bss/ (R) |
| **Procurement:** AI average-market-price module (Decree 259); **75% of e-shop offers are AI-checked**; AI auto-moderation of applications (suppliers complain it rejects without reasons); risk-analysis centre *planned*. **Human** review only: "expertise conclusion" files attached to some lots, and decree PF-259 requires a competition-impact assessment and anti-corruption expertise for **direct contracts** from 1 Jan 2026 (R). | Price, e-shop offers, moderation; human spec review for some purchases | **No automated reader of tender spec text found** (absence not proven), which is TenderLens's gap | https://uza.uz/ar/posts/davlat-xaridlaridagi-shaffoflik-byudjet-mablaglarini-tejashga-xizmat-qilmoqda_930637 (V\*); https://kun.uz/en/news/2025/12/30/uzbekistan-to-scrap-direct-contracts-in-public-procurement-from-2026 (V\*); https://anhor.uz/uzl/ichkaridan-nazar/davlat-xaridlarida-suniy-intellektsiz-korrupsiyaga-qarshi-kurashish-imkonsiz/ (V\*); https://anhor.uz/uzl/news/qabul-qilib-olishni-rad-etishdan-moslab-yozilgan-tenderlargacha/ (V\*); PF-259 expertise: https://anhor.uz/uzl/ichkaridan-nazar/tenderlarsiz-37-trln-som-o-zbekiston-davlat-kompaniyalarining-togridan-togri-xaridlari/ (R) |
| **Customs:** auto-clearance with 3 ML models (manual processes −75%, clearance time −42%); Integrated Tariff with AI photo-to-code (presented 9 Oct 2026); IBM classification pilot | HS classification | Overlap for idea #5 | https://mag.wcoomd.org/?p=20107 (V); https://uza.uz/ar/posts/bojxona-faoliyatida-suniy-intellekt-imkoniyatlari-kengaymoqda_919847 (V) |
| **Pharma price monitoring** covering 12,500+ pharmacies; e-invoices above the wholesale limit auto-blocked since Mar 2026 | Pharmacy price compliance | Overlap for idea #2 | https://anhor.uz/news/bolee-2-5-tysjach/ (V\*) |
| **ShaffofAI**: design permits and planning assignments automated | Construction permits | Avoid construction-permit ideas | https://daryo.uz/en/2026/05/07/uzbekistan-introduces-shaffofai-platform-to-merge-design-permits-and-planning-assignments/ (R) |
| **PF-175 (27 Aug 2026)**: state "AI assistants" for construction, labour, foreign trade and public services, **pilot only in June 2027** | — | A window for prototypes | https://lex.uz/docs/-8442717 (V) |

---

## 2. All candidates on one grid

**Criteria**
- Pain = strength of evidence.
- Both sides = clear benefit to both SMBs and the state.
- Track fit = fit with pharma & healthcare, education, or entrepreneurship.
- 48h demo = can 3–5 students demo it by 19 Nov.

**Two extra gates**
- Can we get real data tonight?
- Is the state already building it?

| # | Candidate | Track | Pain | Both sides | Track fit | 48h demo | /20 | Data tonight | Already built? |
|---|---|---|---|---|---|---|---|---|---|
| **1** | **TenderLens: procurement spec checker plus red flags** | Entrepreneurship | 5 | 5 | 3 | 5 | **18** | **Live public API plus spec files (tested)** | Low: price module and e-shop AI only |
| 2 | Pharmacy price-compliance copilot | Pharma plus entrepreneurship | 5 | 3 | 5 | 4 | 17 | Live public API (tested) | **High**: state monitors 12,500+ pharmacies; invoices auto-blocked |
| 3 | Inspection Shield plus Ombudsman triage | Entrepreneurship (+health) | 4 | 5 | 3 | 4 | 16 | Law texts only; synthetic orders | Medium: govcontrol.uz app; PF-175 AI pilot in 2027 |
| 4 | Kindergarten-subsidy integrity plus owner appeals | Education plus entrepreneurship | 4 | 4 | 5 | 3 | 16 | Synthetic only | Medium: Ministry attendance system |
| 5 | Customs TN VED classifier plus pre-ruling drafter | Entrepreneurship (+pharma goods) | 3 | 5 | 3 | 5 | 16 | Official nomenclature PDF | **High**: Customs AI photo search, IBM pilot |
| 6 | MXIK product-code and marking copilot | Entrepreneurship (+pharmacy) | 3 | 4 | 3 | 5 | 15 | Live tasnif API (444,820 codes) | Medium: catalogue search, open-source wrapper |
| 7 | Regulatory-change radar | Entrepreneurship | 3 | 4 | 3 | 5 | 15 | lex.uz, regulation.gov.uz | Medium: LexAI |
| 8 | Business-appeals triage (Ombudsman, People's Reception) | Entrepreneurship | 4 | 3 | 3 | 5 | 15 | meningfikrim.uz | Medium: PF-51 auto-sorting |
| 9 | Licence/permit refusal checker (Ruxsat, earlier session) | Entrepreneurship (legal-services flavour) | 3 | 4 | 3 | 4 | 14 | ZRU-701 text, license.gov.uz | Medium: LexAI, MoJ–KOICA |
| 10 | Hiring and formalisation copilot plus labour-inspection triage | Entrepreneurship | 4 | 4 | 3 | 3 | 14 | stat.uz SIAT API; synthetic employers | Low |
| 11 | Cadastre / public-services document pre-check | Entrepreneurship | 4 | 4 | 3 | 3 | 14 | Service registers; synthetic packages | Medium: Muxlisa |
| 12 | Desk-audit / e-invoice red-flag explainer | Entrepreneurship | 4 | 4 | 3 | 2 | 13 | None public | **Very high**: AI SOLIQ |
| 13 | SME loan-readiness copilot | Entrepreneurship | 4 | 3 | 3 | 2 | 12 | None | **Very high**: state AI scoring from 1 Dec |

Why #1 beats #2 although #2 fits two tracks:
- The pharmacy idea's government side is already automated (§4.2).
- Its pharmacy-side check is mostly arithmetic on structured e-invoice data, so the AI part is thin.
- TenderLens's core task, reading long, messy, multi-script specs, is unsolved and hard for humans.

---

## 3. The five candidates in detail

### 3.1 Candidate 1: TenderLens (full product write-up in §5)
Evidence summary is in §5.1. Notes: `notes/procurement-finance.md`.

### 3.2 Candidate 2: Pharmacy price-compliance copilot

**Problem.** About 12–15k private pharmacies must keep every prescription (Rx) drug within two limits, and both move:
- a **retail markup of at most 20% over their own purchase price**;
- a **retail price at or below the reference ceiling**.

Ceilings are revised in waves, and fines and licence revocations are real.

| Evidence | Number | Source | Mark |
|---|---|---|---|
| Overpricing cases found by the Competition Committee, **cumulative from 2025 to May 2026** | ~686,000 cases at ~2,500 pharmacies; Q1 2026 alone 110,500 | https://kun.uz/en/news/2026/05/21/over-2500-pharmacies-in-uzbekistan-penalized-for-inflating-medicine-prices | V\* |
| **Calendar 2025 only** (do not add to the line above) | 267,456 markup violations in 765 pharmacies (119 wholesale, 646 retail); UZS 7.95 bn unjustified income | https://kun.uz/en/news/2026/02/06/pharmacies-in-uzbekistan-earned-billions-through-inflated-drug-prices-in-2025 | V\* |
| Licences annulled, H1 2026 | 33 pharmacies (6 for selling above state prices); 64 more in court | https://uza.uz/ar/posts/novyy-poryadok-i-strogiy-kontrol-cen-na-lekarstva_933184 (5 Nov 2026) | V\* |
| The rules | Rx only: markup ≤15% wholesale and ≤20% retail **over purchase price**; retail ≤ reference retail price. OTC prices are free since 1 Apr 2025 (decree UP-13 of 28.01.2025) | https://buxgalter.uz/ru/publish/doc/text207435_kak_prodavat_lekarstva_i_medizdeliya_posle_otmeny_predelnoy_nacenki ; uza.uz above | V\* |
| Reference ceilings published today | 12,612 entries (12,607 Rx); 5,516 local | Public API `api.mpa.uz/drug-catalog-api/v1/referent-price/all?date=DD.MM.YYYY&page=N&size=1000` | C |
| Ceiling churn, 2 Mar → 17 Nov 2026 | 2,152 retail ceilings changed (1,920 lowered). Roughly 1,600 drug IDs dropped out and 1,450 appeared; **approximate**, because drugId has duplicates | same API, `data/mpa-reference-prices/` | C |
| Revision lists on the portal in 2026 | 1 Mar, 1 Apr, 11 Apr, 1 May, 1 Sep, 16 Sep, 24 Sep, 1 Oct 2026 | https://mpa.uz/uz/reference-prices | V\* |
| Name chaos | 82 imported versions of levofloxacin (Agency director). Our count: 322 ceiling entries, 241 distinct trademarks for levofloxacin | https://kun.uz/en/news/2025/12/17/pharmaceutical-agency-moves-to-cut-inflated-prices-of-thousands-of-medicines (V\*); API (C) |
| Pharmacies in the state registry | 15,391 | https://mpa.uz/uz (homepage counter) | V\* |
| Marking fines from 1 Jan 2026 | 0.2% → 0.4% → 1% → 2% of quarterly revenue for repeat violations | https://kun.uz/en/news/2025/05/26/govt-to-enforce-fines-for-labeling-violations-starting-2026 | V\* |
| Fines for breaking retail-sale rules for Rx drugs **with potent substances** | 100–200 BCU = UZS 41.2–82.4M (was 50–100 BCU) | https://kun.uz/en/news/2026/03/11/uzbekistan-tightens-penalties-for-illegal-sale-of-prescription-drugs | V\* |
| e-prescriptions | >400,000 issued vs 54,770 medications dispensed (Jan 2026); nationwide by end-2026 | https://www.uzdaily.uz/en/only-one-in-eight-e-prescriptions-is-being-fulfilled-in-uzbekistan/ | V\* |

**Already exists (the killer objection):**
- "The monitoring covers more than 12,500 pharmacies".
- Since March 2026, tax authorities automatically block e-invoices whose wholesale price exceeds the limit.
- Source: https://anhor.uz/news/bolee-2-5-tysjach/ (V\*).
- A 2022–23 resolution also provided for automatic comparison of receipt prices with reference prices via Soliq: https://www.spot.uz/ru/2023/04/26/uzpharminfo/ (V\*, implementation status unknown).
- Consumers check ceilings via PharmUz / pharm.gov.uz.

**Comparators:**
- **Kazakhstan** (inspection-based) found only 15 cases above the ceiling in all of 2025 (3.1M tenge in fines). https://www.inform.kz/ru/za-kakie-narusheniya-chashe-vsego-nakazivayutapteki-kazahstana-73a12865 (26 Sep 2026, V\*)
- **India NPPA** (after-the-fact demands) has still not recovered Rs 8,447.4 of 10,029.8 crore demanded for overcharging. https://medicaldialogues.in/news/industry/pharma/nppa-yet-to-recover-rs-84474-crore-from-pharma-companies-for-overcharging-182111 (27 Oct 2026, V\*)
- Lesson: detection after the sale recovers little, so prevention at pricing time wins. That is the pitch if you choose this idea.

**AI vs rules:** the check itself is arithmetic (min(purchase × 1.2, ceiling)). AI is only needed to read paper or photo invoices and to match messy names, but B2B purchases already arrive as structured e-invoices.

**Scores:** Pain 5 · Both sides 3 · Track 5 · Demo 4.

**Judge objection:** "The Tax Committee already catches this automatically, so why do pharmacies need you?"

**When to choose it anyway:** only if the team strongly wants the pharma track. Reposition it as the pharmacy's pre-pricing tool: a ceiling-change alert plus markup check per batch.

### 3.3 Candidate 3: Inspection Shield plus Business Ombudsman triage

**Problem.**
- **SMB side:** owners can't tell whether an inspector (or a "10-day ultimatum" letter) is lawful under the new rules.
- **State side:** from 2027 the Business Ombudsman must approve every repeat inspection and audit three years of inspection files.

| Evidence | Number | Source | Mark |
|---|---|---|---|
| **PF-175, 27 Aug 2026** | 3-year moratorium on inspecting small businesses. Exceptions: criminal cases, human-health impact, labour, citizens' appeals, VAT refund, liquidation. From 1 Jan 2027, a repeat inspection within one year needs the Ombudsman's permission. "Samarali nazorat" review of 3 years of files. First violation = warning plus 10 days to fix. | https://lex.uz/docs/-8442717 | V |
| Repeat inspections, H1 2026 | 6,350 businesses by 23 bodies; Tax Committee 4,573 | https://www.uzdaily.uz/ru/biznes-ombudsmen-vyiavil-6350-povtornykh-proverok-biznesa/ | V |
| Inspection violations found by the Ombudsman | 2025: 9,994 (567 unlawful inspections). Jan–Sep 2026: 7,498 | https://uza.uz/en/posts/bir-yilda-95-mingta-murozhaat-kelib-tushdi-biznes-ombudsman-devoni_811988 (27 Jan 2026); https://www.uzdaily.uz/en/uzbekistan-removes-inspection-targets-from-regulators-kpis/ (10 Oct 2026) | V |
| Inspections, Jan–Apr 2026 | 65,737 (+26.5% y/y). **Single outlet, unnamed source** | https://zamin.uz/en/economy/201427-entrepreneurs-express-serious-concern-over-rising-inspections.html (16 May 2026) | V (weak) |
| Ombudsman appeals | 9,555 in 2025; 10,743 in Jan–Sep 2026; about 49% resolved positively | uza.uz and uzdaily.uz links above | V |

- **Gap:** govcontrol.uz records visits, but nothing checks legal grounds. Post-moratorium inspection counts: no number found.
- **Comparator:** Kazakhstan's 2020–23 moratorium plus a risk system automated from 2024; H1 2026 violations by individual entrepreneurs −34%. A new 3-year moratorium was proposed from 1 Jan 2027. https://www.trend.az/casia/kazakhstan/4240132.html (V)
- **Scores:** Pain 4 · Both 5 · Track 3 · Demo 4.
- **Objection:** "The moratorium already fixed this."

### 3.4 Candidate 4: Kindergarten-subsidy integrity plus owner payment assistant

| Evidence | Number | Source | Mark |
|---|---|---|---|
| Subsidies | >25,000 non-state kindergartens got UZS 3.9 trn (year not stated); **UZS 4.7 trn allocated in 2026** | https://talimxabarlari.uz/?p=70753 | V |
| Family kindergartens, 1 Jan 2026 | 29,196 (39,283 preschools in total) | https://talimxabarlari.uz/?p=81988 | V |
| Fraud | Khorezm: ghost and even deceased children, UZS 161M (appeal upheld 20 Jan 2026). Namangan: fictitious kindergartens with officials involved, UZS 1.3 bn | https://kun.uz/kr/98091116 ; https://podrobno.uz/cat/proisshestviya/chinovniki-v-namangane-raskhitili-iz-byudzheta-1-3-milliarda-sumov-na-fiktivnykh-detsadakh/ (6 Oct 2026) | V |
| Honest owner unpaid | UZS 131M withheld for 2 months over a geolocation clause; paid after Ombudsman intervention | https://talimxabarlari.uz/?p=62048 | V |

- **Comparator:** Kazakhstan's Supreme Audit Chamber found 1,333 pupils moved between private schools 5–12 times (per-capita fraud). https://bes.media/amp/milliardi-na-myortvie-dushi-pochemu-chastnie-shkoli-bolshe-pro-biznes-d31edf/ (12 Jun 2026, V)
- **Scores:** Pain 4 · Both 4 · Track 5 · Demo 3.
- **Objection:** "All your data is synthetic, and the Namangan fraud involved officials."

### 3.5 Candidate 5: Customs TN VED classification plus pre-ruling drafter

| Evidence | Number | Source | Mark |
|---|---|---|---|
| Customs' own target | "95% accuracy in goods classification" (a goal, not achieved) | https://mag.wcoomd.org/?p=20107 (2 Mar 2026) | V |
| Wrong codes found (**stale**) | 1,056 cases, UZS 31.9 bn extra duty, Jan–Apr 2022 | https://yuz.uz/uz/news/davlat-byudjetiga-319-milliard-som-qoshimcha-bojxona-tolovlari-undirildi (18 May 2022) | V |
| Declarations (period not stated) | 266k export and 491k import simplified declarations; 185k+ with no human involvement | https://uza.uz/ar/posts/bojxona-faoliyatida-suniy-intellekt-imkoniyatlari-kengaymoqda_919847 (9 Oct 2026) | V |
| Data | Official nomenclature PP-181 Annex 1: 874-page PDF, about 13,196 ten-digit codes, Uzbek Cyrillic | https://lex.uz/ru/files/7541055 | V |

- **Comparator:** Korea Customs Service's explainable HS model reaches 93.9% top-3 accuracy on 5,000 cases (research result). https://arxiv.org/abs/2311.10922 (V)
- **Scores:** Pain 3 · Both 5 · Track 3 · Demo 5.
- **Objection:** "Customs presented AI photo-to-code in October."

---

## 4. Why we moved away from the pharmacy idea

### 4.1 What made the pharmacy idea attractive
- Its numbers are the biggest.
- It hits two tracks.
- We found its live data ourselves: an undocumented but public API on the Pharma Agency's portal. It returns 12,612 ceilings, has history by date, and needs no key.

### 4.2 What sank it as the top pick
- The violations are mostly **markup over purchase price**, which needs the pharmacy's purchase invoices.
- The state already has those invoices (e-faktura) and the sales receipts (online cash registers). It runs monitoring over 12,500+ pharmacies and auto-blocks over-limit wholesale e-invoices since March 2026.
- So the state side is done, and the pharmacy side is arithmetic on structured data.
- A pharma-track judge who knows the market would see this within a minute.

**Keep it as Plan B for the pharma track** (§3.2): an alert when ceilings change, plus a markup check per incoming batch.

---

## 5. The pick: TenderLens

### 5.1 The problem in numbers

| Fact | Number | Source | Mark |
|---|---|---|---|
| Public procurement, Jan–Sep 2026 | ≈ UZS 282 trn; UZS 12.1 trn saved via competitive procedures; direct purchases −11.7% | https://uza.uz/ar/posts/davlat-xaridlaridagi-shaffoflik-byudjet-mablaglarini-tejashga-xizmat-qilmoqda_930637 (30 Oct 2026) | V\* |
| Annual volume stated Dec 2025 | UZS 248.6 trn, of which **115.2 trn non-competitive** | https://yuz.uz/ru/news/uzbekistan-usilivaet-prozrachnost-goszakupok-rasshiryaet-konkurentsiyu-i-prioritet-otechestvennogo-proizvoditelya (29 Dec 2025) | V\* |
| Deals, H1 2026 (most are e-shop/auction purchases with no long spec) | 1,099,305 deals, UZS 188.4 trn | https://yuz.uz/uz/news/2026-yilning-1-yarim-yilligida-davlat-xaridlari-hajmi-1884-trln-somni-tashkil-etdi | V |
| **Competition Committee, 2025** | Analysed >23,000 procedures and found **28,300 anti-competitive actions in 16,100 of them** (UZS 18.8 trn initial value): **8,647 "creation of advantages for specific bidders"**, 801 unjustified disqualifications, 1,145 collusion, 685 bidder affiliation, 61 customer–bidder affiliation | https://kun.uz/en/17330939 (10 Mar 2026) | V\* |
| **Accounts Chamber, Jan–Sep 2026** | **18,788 violations, UZS 10.2 trn**; SOEs 38.5%, transport/roads 29.1%, education & science UZS 384.3 bn, health UZS 191 bn | https://www.spot.uz/oz/2026/11/05/procurement-violations/ (5 Nov 2026) | V\* |
| Price inflation found | UZS 369.9 bn (2023), UZS 370.6 bn (2024) | yuz.uz (29 Dec 2025) | V\* |
| Capacity gap | About 2 million lots a year; **only 2–3% analysed manually** (estimate by a TenderZone expert, not an official figure); a risk-analysis centre is "planned" | https://anhor.uz/uzl/ichkaridan-nazar/davlat-xaridlarida-suniy-intellektsiz-korrupsiyaga-qarshi-kurashish-imkonsiz/ (date not visible) | V\* |
| State targets, Decree No. 259 of 26.12.2025, by 2030 | Competitive share 58% → 80%; **entrepreneur participation 35% → 70%**; openness and ease for business 60% → 98% | yuz.uz (29 Dec 2025) | V\* |
| Thin competition, live | Latest 2,002 etender deals (8 Oct–17 Nov 2026): **median 2 participants**, exactly 2 in 50%, price drop under 1% in 26%. Caveat: if ZRU-684 sets a 2-bidder minimum for a valid tender, present "exactly 2" as "competition at the legal floor" | `POST apietender.uzex.uz/api/common/DealsList` | C (agent) |
| Today's open lots on etender | 662 lots, UZS 1,441.6 bn | `POST .../api/common/TradeList` | C |
| **Competition vs price, 9,998 etender deals (22 Apr–17 Nov 2026)** | Median drop from start price: 1 bidder 2.3%; **2 bidders 2.7%** (49.8% of all deals); 3 bidders 8.4%; 4 bidders 17.2%; 5 bidders 23.0%; 6+ bidders 32.5%. This is a correlation, not proof of cause: lot types and sizes differ. | `DealsList`, `data/etender_deals_10k_17nov.json` | C |
| Winner concentration | Of 329 customers with ≥5 deals, 88 had a single supplier winning ≥50% of their deals (median top-winner share 33.3%) | same | C |
| Supplier voice | The procurement participants' association collected ~370 appeals (62 systemic). Business calls such specs "заточенные" / "moslab yozilgan" (tailored) to one supplier. 4-digit TN VED alerts flood suppliers with irrelevant tenders. The system doesn't mark re-announced tenders. AI auto-moderation rejects applications without clear reasons, so business asks for algorithm audits and fast appeals. | https://anhor.uz/news/goszakupki-uzbekistan-problemy-postavshchikov/ ; https://anhor.uz/uzl/news/qabul-qilib-olishni-rad-etishdan-moslab-yozilgan-tenderlargacha/ ("1 июл." / "1-iyl", 2026 inferred) | V\* |
| Older baseline | Direct purchases >41% of procurement (2022); 30% of tender notices lacked a contact person; OCDS open-data standard not implemented | https://www.open-contracting.org/wp-content/uploads/2023/10/Uzbekistan-Countrysnapshot-Исследование-Проблемы-и-перспективы-развития-сферы-госзакупок-в-Узбекистане.pdf (Oct 2023) | V |

**One sentence for the deck.** In 2025 the competition regulator analysed more than 23,000 tender procedures and found 28,300 anti-competitive actions, including 8,647 cases of advantages created for specific bidders. Half of recent tenders ended with exactly two bidders (our calculation on 2,002 deals, 8 Oct–17 Nov 2026).

### 5.2 Users on both sides

**SMB side**
- Small suppliers: equipment repair, catering (for example the kindergarten hot-meal outsourcing lots under Cabinet Resolution 810 of 22.12.2025; 12 such lots are open today), construction subcontractors, IT, medical consumables.
- Tender consultants and accountants who bid for them.
- The **Association of public procurement participants**, a natural partner and distribution channel.

**State side**
- **Agency for Industrial Cooperation and Public Procurement** (created in February; the year 2026 is inferred from the anhor.uz page; took over procurement policy from the Ministry of Economy and Finance). Gain: a monitoring page, a risk assessment and a customer "KPI in procurement" rating, all required by Decree 259, plus progress on the 35→70% participation target. Source: https://anhor.uz/news/uzbekistan-creates-industrial-cooperation-and-procurement-agency/ (V).
- **Competition Promotion and Consumer Protection Committee**, procurement-analysis unit. Gain: a ranked queue instead of 2–3% manual sampling.
- **State customers' procurement commissions.** Gain: a pre-publication "lint" so they don't get flagged later.
- **Accounts Chamber** and the **Anti-Corruption Agency**: audit planning (secondary users).

### 5.3 The product: core flows

**F1. "Is this tender winnable?"** (SMB, the demo centrepiece)
1. The user pastes a lot link or number, or picks it from F2.
2. TenderLens pulls the lot (`GetTrade`), the spec file (`DownloadFile`), the qualification fields and the evaluation criteria with their weights.
3. The LLM extracts every requirement as structured JSON. Each item carries a **verbatim quote and page number**.
4. Each requirement is classified against a taxonomy of restrictive clauses (table below).
5. Output: a verdict (*Bid / Bid but ask for clarification / Skip*) with plain-Uzbek or Russian explanations.
6. The app drafts a **clarification request** to the customer before the lot's `clarific_date`, and, if needed, a complaint.

| Restrictive-clause type | How it is detected |
|---|---|
| Brand or model named without "or equivalent" | LLM |
| Over-narrow technical parameters that only one product matches | LLM |
| Experience or turnover demands out of proportion to the lot value | LLM plus rule |
| Manufacturer or dealer authorisation letters required | LLM |
| Unrelated licences or certificates required | LLM |
| Unrealistic delivery deadline | LLM plus rule |
| Bundling of unrelated items in one lot | LLM |
| Irrelevant criteria copied from a template (real example below) | LLM |
| Short bidding window relative to spec complexity | rule plus LLM |

**Context shown, not flagged:**
- **Re-announced lot** (`old_id` not empty; 5 of 16 sampled). Suppliers asked for this to be marked, so it is shown as information.
- **Evaluation weights.** The 70% technical / 30% price split is the platform norm (12 of 16 sampled lots), so it is shown but never flagged.

**Real examples found tonight in live specs.** Both lots close 18 Nov 2026, so demo them from the saved snapshot.

| Lot | What the spec says | Why it matters | Flag type |
|---|---|---|---|
| **524784**: three-cone drill bits, Samarkand branch of the "O'zyo'lko'prik" cluster, UZS 69.2M | Evaluation criterion 5 scores bidders 1–5 on conformity documents for "давлат ветеринария хизмати назорати остидаги маҳсулотлар" (products under **state veterinary** control). It gives 5 points if the document is attached and 1 point if not. | A veterinary document can't exist for drill bits. A bidder who doesn't attach one loses 4 points, while one who knows to attach *something* doesn't. It looks like a copied template, which is not an accusation, and it should be asked about before the clarification deadline. | Irrelevant criterion |
| **523196**: hot-meal outsourcing, Q4, Namangan regional Interior Affairs Department, UZS 23.4M | Qualification: working capital equal to at least 3 months of the contract sum, proven by a bank statement ("камида 3 (уч) ойлик шартнома суммасига тенг айланма маблағлари") | For a one-quarter contract, this means holding the whole contract value in cash. That is heavy for small caterers. It needs judgement, not an automatic accusation. | Financial requirement, possibly disproportionate (human review) |

These came from a quick scan of 6 specs with simple patterns. The real pipeline (LLM plus taxonomy) should find more. **First go/no-go for the team tonight:** run the extractor on 30 specs. If it finds fewer than about 5 defensible flags, switch to Plan B (pharmacy, §3.2).

**F2. "Tenders for me"** (SMB)
- The user describes what they sell in their own words, by text or voice.
- Semantic matching against open lots replaces the 4-digit TN VED alerts that suppliers complain about.
- Every match comes with a winnability badge from F1.

**F3. "Risk queue"** (state, second demo screen)
- Every open lot is batch-scored overnight. Score = restrictive-clause score × the customer's history from `DealsList`:
  - median bidders;
  - share of deals with ≤2 bidders;
  - repeat-winner share;
  - share of deals with a price drop under 1%;
  - re-announcements.
- Each lot gets an LLM case summary quoting the clause and naming the Competition Committee category.
- The user can export it, or send the customer a pre-filled correction request.

**F4 (stretch). Customer integrity card:** a public view of a customer's history before an SMB decides to bid. The business association asked for exactly this kind of rating on 1 Jul 2026 (podrobno.uz, V).

### 5.4 What is AI and what is plain rules

| Part | AI or rules | Why |
|---|---|---|
| Reading specs: text PDF, scanned PDF, DOCX, in Uzbek Cyrillic/Latin and Russian | **AI**: vision LLM / OCR is on the main path. Of 16 sampled lots, 7 share one kindergarten-meal template, leaving about 8 distinct specs. Of those, 2 are scans, 1 has a garbled text layer (Cyrillic encoded as Latin junk), 1 has OCR noise, and 2 are zip/rar archives | Messy real-world documents; humans can't keep up |
| Extracting requirements with verbatim quotes | **AI** (LLM, constrained JSON) | Free-text legal-technical prose |
| Classifying clauses into the taxonomy, explaining them, suggesting a neutral rewrite | **AI** | Judgement over context and lot size |
| Matching an SMB's self-description to lots | **AI** (embeddings) | Replaces 4-digit code noise |
| Entity resolution across Cyrillic and Latin company names | **AI** / fuzzy matching | Same company, different spellings |
| Deadlines, bidding window, re-announced flag, 70/30 weights | Rules | Structured fields in the API |
| Customer statistics: median bidders, repeat winners, under-1% price drops | Rules / statistics | `DealsList` |
| Final risk score and ranking | Rules (transparent formula) | Auditable |
| Legal references for each flag | Rules (lookup table) | Never let the LLM invent a law |

**Hard rule for the build:** the LLM may only flag a clause it quotes verbatim from the document. The quote is checked against the extracted text by string match. If the quote doesn't match, the flag is dropped.

### 5.5 Data needed and where to get it (all tested 17 Nov 2026 unless noted)

| Data | Endpoint / source | Status |
|---|---|---|
| Open lots | `POST https://apietender.uzex.uz/api/common/TradeList` with body `{"From":1,"To":50,"System_Id":0}`. Page in chunks of 50; a 700-row request returned an Oracle "page bounds" error. 662 open lots today. | Tested (C) |
| Lot detail | `GET https://apietender.uzex.uz/api/common/GetTrade/{id}/0` returns: spec file path (`tech_file_path`), technical docs and draft-contract paths, `js_qualification_fields`, evaluation criteria with weights and "expert" rating (`js_fields`), `tech_coef`/`cost_coef`, `old_id` (re-announced), `clarific_date`, customer TIN. Example in `data/etender_GetTrade_523837_example.json` | Tested (C) |
| Spec files | `POST https://apietender.uzex.uz/api/common/DownloadFile?path={tech_file_path}`. Sample of 16 lots: 14 PDF and 2 archives (1 RAR, 1 ZIP). Of the 14 PDFs, 2 are scanned, and at least 1 more has a garbled text layer. 7 lots share one kindergarten-meal template. Sizes from 0.2 to 18 MB, 2 to 88 pages. Summary in `data/etender_spec_sample_17nov.json` | Tested (C) |
| Deal history | `POST https://apietender.uzex.uz/api/common/DealsList`, body `{"From":1,"To":2000,"System_Id":0}`: 164,649 deals with `participants_count`, start and deal cost, customer and provider TIN | Tested by agent (C) |
| E-shop / auction (the bulk of the ~1.1M deals) | xarid.uzex.uz | Not probed |
| Legal basis for flags | Public procurement law **ZRU-684** and Competition law on lex.uz; Decree 259 (lex.uz/docs/-7952218) | **Not yet read: verify article numbers tonight before citing any** |
| Restrictive-clause categories | Competition Committee's 2025 breakdown (kun.uz, above) | V\* |
| Evaluation set | Hand-label 40–50 specs tonight: each clause gets a type, or "not restrictive" | To do |

**Etiquette:**
- The endpoints are undocumented but public: no login, the same calls the website makes.
- Cache everything, keep 0.3–0.5 s between calls, and don't hammer the API.
- Don't display contact persons' names.
- For production, propose an official data feed or OCDS to the Agency.

### 5.6 48-hour build plan for 3–5 people

| Who | Tonight (17 Nov) | 18 Nov | 19 Nov morning |
|---|---|---|---|
| Data | Scraper: all open lots → GetTrade → specs to disk; DealsList for the last ~20k deals; SQLite | Text extraction pipeline; vision-LLM OCR for scans; skip archives | Freeze the demo dataset |
| AI | Extraction prompt (JSON plus quotes); taxonomy prompt | Classifier, explanations, clarification-letter drafter; embeddings for F2 | Tune on the eval set |
| Rules and scoring | Customer statistics from DealsList | Risk formula, F3 queue, case summaries | — |
| Front-end | Telegram bot skeleton (SMB) plus a simple web dashboard (state) | F1 and F3 screens, Uzbek/Russian toggle | Polish |
| Eval and pitch | Label 40–50 specs | Measure precision and recall of flags; draft the deck | Rehearse the 90 s demo 5 times |

Use the strongest available LLM with vision, for example `claude-sonnet-5-5` for bulk work and `claude-opus-5-5` for the hard specs. After the hackathon, apply for Resolution 581 state infrastructure.

### 5.7 90-second demo script

Run the demo from tonight's snapshot, because the example lots close on 18 Nov. Every flag shown must be one the team checked by hand.

| Time | What happens |
|---|---|
| 0–10 s | **Hook** (slide): "Last year the competition regulator analysed 23,000 tender procedures and found 28,300 anti-competitive actions, 8,647 of them advantages created for one bidder. Half of recent tenders ended with exactly two bidders." |
| 10–40 s | **SMB flow, live.** "Bobur runs a small firm that supplies drilling tools." He types *"burg'ulash dolotalari"* (drill bits) and TenderLens lists matching lots. He opens **lot 524784** (three-cone drill bits, UZS 69.2M). In about 10 s the spec is read and requirements appear in Uzbek with page quotes. **Flag:** "Criterion 5 scores you on a *state veterinary control* document, which drill bits can't have: you'd lose 4 of 5 points." Verdict: "Bid, but ask the customer to remove criterion 5 before the clarification deadline." One click drafts the clarification letter. |
| 40–65 s | **State flow.** Switch to the Agency screen: "All 662 open lots were scored overnight." Top of the queue: [lot] from a customer whose last N deals had a median of 1.5 bidders and the same winner, re-announced twice, with a brand-locked spec. Open the case summary: clause quote, Competition Committee category, suggested neutral wording, "send to customer for correction". |
| 65–80 s | **Proof.** "On 50 hand-labelled specs: X% of restrictive clauses caught, Y false alarms per spec. Every flag quotes the document; no quote, no flag. Data is the public UZEX API, live." |
| 80–90 s | **Close.** "The state's AI checks the price. TenderLens checks who can actually bid. Decree 259 wants business participation to go from 35% to 70% by 2030; this is how." |

### 5.8 How judges will attack it, and the answers

| Attack | Answer |
|---|---|
| "You'll falsely accuse customers of corruption." | It's an advisory lint, not an accusation. Every flag quotes the clause and cites the Competition Committee's own category. A human decides. The customer can fix it *before* publication. Show the measured false-alarm rate. |
| "The state already has procurement AI." | It checks **price** (average-market-price module) and **e-shop offers** (75%), and auto-moderates applications. Suppliers complain that this moderation gives no reasons, while every TenderLens flag is explained and quoted. We found no automated reader of spec text, and the risk centre is only "planned". We're the missing layer and a plug-in for the Agency's Decree-259 monitoring page. |
| "Specs are already reviewed by experts." | Human expertise exists for some purchases ("expertise conclusion" files; PF-259 competition and anti-corruption review for direct contracts). It doesn't scale to hundreds of thousands of lots, and the expert estimate is that only 2–3% get manual analysis. TenderLens pre-screens so the experts read the right 2–3%. |
| "Is scraping allowed?" | Same public pages anyone opens without login, cached and rate-limited. In production we ask the Agency for an official feed or OCDS (not implemented per the OCP 2023 study). |
| "LLMs hallucinate on Uzbek Cyrillic legal text." | Constrained extraction plus mandatory verbatim quotes checked by string match. Show the eval numbers. Uzbek and Russian are both handled. |
| "It's just rules plus a chatbot." | The statistics are rules on purpose (they must be auditable). The hard part, reading a 45-page spec in three scripts across thousands of lots, is AI, and it's why only 2–3% get read today. |
| "Why would customers use it?" | Decree 259 introduces a customer KPI rating. Linting before publication protects their score and cuts complaints. |
| "Who pays?" | SMBs: free alerts, paid deep checks (per month or per check), sold via the participants' association. State: licence or API for the Agency and the Competition Committee. Consultants: bulk plan. |
| "Fits only the entrepreneurship track." | Yes, and that's our track. We show social impact on hospital-repair and kindergarten-meal lots (children's food, medical equipment). |
| "What about scanned files and archives?" | Vision-LLM OCR is on the main path: scans and garbled text layers are common in our sample. Archives are unpacked; skipped in the demo. |
| "Isn't TenderGPT / TenderZone doing this?" | TenderGPT is a corporate e-trading platform (https://awards.gov.uz/en/ecosystem/startups-directory/3788, R). TenderZone is a paid aggregator. Neither reads specs for restrictive clauses as far as we found. Verify on their sites tonight. |

### 5.9 International precedent

| Country | Mechanism | Result | Source / mark |
|---|---|---|---|
| **Brazil, ALICE robot (CGU)** | Automatically reads procurement planning documents and tender notices (editais); sends alerts to auditors | 2024: **118,069 procurement processes analysed; R$257.25M saved** in concluded audits; 126 public bodies registered for alerts | https://agenciagov.ebc.com.br/noticias/202412/orgaos-federais-economizaram-em-2024-257-milhoes-de-reais-com-apoio-do-robo-alice-da-controladoria-geral-da-uniao (30 Dec 2024), V\* |
| **Brazil, ALICE (OECD case)** | Same tool | 190,923 acquisitions analysed in 2023 | https://oecd-opsi.org/innovations/robot-alice-bid-contract-and-notice-analyser — R |
| **Ukraine, ProZorro + DoZorro AI** (Transparency International Ukraine) | ML risk model trained on expert-labelled tenders, compared with rule indicators | 2018 beta: 26% more unfounded winner selections, 37% more groundless disqualifications, 298% more collusion than indicators | https://ti-ukraine.org/en/news/dozorro-artificial-intelligence-to-find-violations-in-prozorro-how-it-works/ — R (page blocked automated access) |
| **Ukraine, DoZorro 2026** | Monitoring before the contract is signed, mostly through price adjustments; the State Audit Service runs 35 automated risk indicators | UAH 383M "saved" in H1 2026 (self-reported) | https://ti-ukraine.org/en/news/in-six-months-dozorro-helped-the-state-save-over-uah-383-million/ — R |
| **Korea, BRIAS** (Fair Trade Commission, since 2006) | Statistical bid-rigging indicators on KONEPS data | Only 3 cases found from 2006 to 2015, partly because it covered only contracts ≥ KRW 0.5 bn (4% of contracts); 10 cases in about 8 years per a 2026 OECD paper | https://one.oecd.org/document/DAF/COMP/WP3/WD(2022)31/en/pdf ; https://one.oecd.org/document/DAF/COMP/WD(2026)77/en/pdf — R |
| **Kazakhstan** | Points-based automatic choice of the winner (no commission); suppliers checked against 28 state databases | 781 bn tenge "saved", Jan–Sep 2025 (Minister of Finance) | https://kapital.kz/economic/141461/ii-sekonomil-781-milliard-tenge-pri-provedenii-goszakupok.html (14 Oct 2025) V\*; https://digitalbusiness.kz/2026-01-30/v-goszakupkah-bolshe-ne-prinimayut-resheniy-bez-ii-analiza/ (30 Jan 2026) V\* |
| **EU** | Single Market Scoreboard | Typical (mid-ranking) EU country: 28% single-bidder procedures in 2024 | https://single-market-scoreboard.ec.europa.eu/node/452_en V\* |

**Lessons for TenderLens:**
- Most systems check prices and bidders after the fact. Only Brazil reads notice text, and nobody hands that tool to suppliers.
- Kazakhstan automates choosing the winner, but a spec written for one supplier still wins automatically.
- Ukraine's savings come from fixing things before the contract is signed, which is what the "fix-it" button does.
- Korea's screen covered only big contracts, so TenderLens checks every lot.

### 5.10 Pitch outline (6 slides plus live demo)
1. **Hook:** 28,300 anti-competitive actions, 8,647 of them advantages for specific bidders (2025); an expert estimates 2–3% of procedures get manual analysis; median 2 bidders.
2. **Two people, one problem:** Bobur (supplier) can't tell if a tender is winnable. The Agency analyst can't read 2M lots. Both lose: SMBs drop out, the state overpays (UZS 370 bn of price inflation found in 2024, 10.2 trn of violations in 9 months of 2026).
3. **Live demo** (§5.7).
4. **How it works:** pipeline diagram (API → spec → LLM with quotes → taxonomy → rules and stats → two screens), the AI-vs-rules table, eval numbers.
5. **Why now:**
   - Decree 259 (Dec 2025): no more direct-contract list, monitoring page, KPI rating, 2030 targets;
   - the new Agency (Feb 2026);
   - fully electronic bid evaluation required from 1 Jul 2026 (rollout not verified);
   - the presidential call for 100 AI projects in 2026.
6. **Proof elsewhere plus business model plus ask:** Brazil ALICE (118k processes, R$257M); freemium for SMBs, B2G licence; ask for a pilot with the Agency and the Association, plus Resolution 581 infrastructure.

### 5.11 Risks and what to verify tonight
1. **Legal citations.** Read ZRU-684 and the Competition law on lex.uz and map each taxonomy type to an article. Until then, cite only the Competition Committee categories.
2. **API stability.** Snapshot everything tonight. The demo must work offline from the snapshot if the API changes or blocks you.
3. **Choosing the demo lot.** Pick a lot whose flag you'd defend in front of the customer. Avoid naming and shaming. Consider blurring the customer name on the state screen.
4. **TenderGPT and TenderZone.** Open both sites and confirm they don't do spec analysis.
5. **SME share of awards.** No official number was found. Don't claim one.
6. **Minimum bidders.** Check whether ZRU-684 requires at least 2 bids for a valid tender, and phrase the "exactly 2 in 50%" statistic accordingly.
7. **Go/no-go at about 23:00 tonight:** run the extractor on 30 specs. Fewer than about 5 defensible flags means switching to Plan B (pharmacy).

---

## 5.12 Team asset: Quarry (github.com/S0ME2/Quarry), reviewed 17 Nov 2026, 21:00
"-" (@S0me2) has an existing tender-monitoring platform: FastAPI, React and PostgreSQL. It covers the plumbing of TenderLens's 48-hour plan.

**Already there**
- Collection from UZEX etender (the same TradeList and GetTrade endpoints, Tender category `TypeId=2`), uztender, xt-xarid and ICPPA.
- Attachments: PDF, DOC/DOCX, XLS and image extraction, with Tesseract OCR fallback.
- Rules plus semantic AI matching with cited evidence and abstention, which is F2 already.
- Campaigns, accounts, and email and Telegram notifications.

**Gaps found in the code review (17:00)**
- **Coverage:** Quarry's UZEX source collects only TypeId=2 tenders. On 17 Nov that category had 36 open lots, against 626 for TypeId=1 "best offer selections" (C, TradeList with a TypeId filter).
- **Specs not downloaded:** the UZEX recipe doesn't fetch spec files.
- **No award history:** DealsList isn't used.
- **Small benchmarks:** the matcher's benchmark sets are small, so judges will ask for precision on real Uzbek specs.

**Still to build during the hackathon (the TenderLens part)**
1. Spec lint: extraction with verbatim quotes plus the restrictive-clause taxonomy (§5.3, F1).
2. Fetching spec files via `DownloadFile`.
3. Customer history from `DealsList`: median bidders, repeat winners, deals with a price drop under 1%, `old_id`.
4. The government risk-queue screen (F3).
5. The evaluation set.

**Open questions**
- **Rules:** check whether the hackathon allows an existing codebase. If it does, declare Quarry as the base and show the new commits. If not, keep the new modules separate.
- **Framing:** pitch the spec-risk check and the government side, not "a tender aggregator". TenderZone already exists as an aggregator.

## 6. Research gaps (no number found; don't invent)
- SME share of procurement awards; national average number of bidders; number of bidder complaints.
- Post-moratorium (Sep–Nov 2026) inspection counts.
- 2025–26 customs classification-error counts (latest is 2022).
- State Health Insurance Fund claim rejections and fraud; drug-registration backlog.
- Tax call-centre (1198) volume; share of SMBs working in Russian vs Uzbek.

## 7. Files
- `notes/_lead.md`: my baseline checks and the existing-AI map.
- `notes/procurement-finance.md`, `notes/health-pharma-edu.md`, `notes/inspections-complaints.md`, `notes/customs-trade.md`, `notes/tax.md`, `notes/labour-land-services.md`: full evidence tables with verbatim quotes.
- `data/etender_open_lots_17nov.json` (662 open lots), `data/etender_GetTrade_523837_example.json`, `data/etender_spec_sample_17nov.json`.
- `data/mpa-reference-prices/ref_{02.03,01.10,17.11}.2026.json`: full reference-price lists for Plan B.
- `data/scripts/mpa_dump.py`, `data/scripts/spec_sample.py`: reproducible downloads (run with `python -I`).
- Earlier session's licence work: `../permits/` (ZRU-701 notes, international comparison, Ruxsat spec).
