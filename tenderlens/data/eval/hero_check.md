# Lead demo lots: second-read check (17 Nov 2026, night)

For the team to verify by hand in the morning. Each flag below was first proposed by `claude-sonnet-5-5` (in-session) and then re-read against the source text by `claude-fable-5-2`. The quotes are verbatim and pass the code check. **No human has confirmed any of them yet.**

Page 0 means the criteria the customer typed into the platform form (visible on the lot page under evaluation criteria). Other page numbers are pages of the specification file in `data/specs/`.

Summary of the second read:

| Lot | Flag | After second read | Use as a lead example? |
|---|---|---|---|
| 524954 | Turnover of 8 bn UZS on a 330 m UZS lot | Raised to **high** | Yes, the strongest |
| 525192 | Four ISO certificates for a 5.3 m UZS purchase | Raised to **high** | Yes |
| 524401 | Experience with 5,000 m² objects for a 1,274 m² kindergarten | Lowered to **low** | **No.** Only 4 of 85 points depend on it |
| 524769 | Bank balance dated January 2026; cooks must have worked in the health system | Stays **medium** (two flags) | Suggested replacement for 524401; health angle |

---

## 524954: design works for the Ohangaron reservoir stilling basin

- **Customer:** "Gidroqurilish buyurtmachi xizmati" MChJ. **Start price:** UZS 330,400,000. **Closes:** 18 Nov 2026, 17:50. Re-announced lot (previous lot 521781).
- **Cached result:** amber, score 55, "bid with clarification".
- **Spec file:** `data/specs/524954.pdf` (6 pages, scanner OCR).

**Quote (page 0, criterion 4 "Ishtirokchining moliyaviy barqarorligi", 15 points):**

> So‘nggi 3 yil uchun o‘rtacha yillik aylanma — kamida 8 mlrd so‘m.

**Why it is restrictive.**
- The required average annual turnover is about 24 times the lot's start price (8,000 m ÷ 330.4 m).
- The criterion is worth 15 of 100 technical points, and the pass mark is 70. A design firm that scores zero here must earn 70 of the remaining 85.
- Nothing in the technical task ties the turnover figure to the work: the task is a 60-day working design for a repair, with an estimated construction value of UZS 4,800 m (page 1).

**Counter-argument the customer could make.**
- The structure is a working hydro-technical installation (design flow 480 m³/s, page 2), so they want an established institute, not a small bureau.
- Turnover is scored, not a pass/fail gate; an expert commission may give partial points.
- The same criterion also asks for a liquidity ratio of at least 1.0, which is ordinary.

**Check by hand.**
- Open the lot page and confirm criterion 4's text and its 15 points.
- The same field ends with "O‘z kapitali (Net Worth) — 5 mlrd so‘mdan kam", which reads as truncated. Don't quote that part.
- Criterion 5 (15 points) asks for at least 10 workstations and 3 kinds of design software. The first pass did not flag it; decide whether it belongs in the story.
- A benchmark worth verifying before anyone cites it: EU procurement rules cap a minimum-turnover requirement at twice the contract value (Directive 2014/24/EU, Article 58(3)). I am giving this from memory.

---

## 525192: two 6 kV disconnectors for an emergency reserve

- **Customer:** "O'zbekneftgaz" AJ (Vodiy oil and gas production department). **Start price:** UZS 5,324,000. **Closes:** 20 Nov 2026, 08:37. Re-announced lot (previous lot 505523).
- **Cached result:** amber, score 56, "bid with clarification".
- **Spec file:** `data/specs/525192.pdf` (4 pages, scanner OCR; the quote carries the scan's spelling).

**Quote (page 3, section 6 "Transport talablari"):**

> ИСО-9001, 14001, 45001, 50001 сертификатлари, халкаро тан олинган лабораториялар ва синов марказларининг сифат сертификатини такдим этиш зарур.

**Why it is restrictive.**
- Four management-system certificates (quality, environment, occupational safety, energy management) plus international laboratory certificates are required for a purchase of UZS 5.3 m.
- Evaluation is by price only (technical weight 0%), and the technical pass mark is 80 while the three criteria add up to exactly 80. A bidder who loses any point for a missing document does not reach the price stage, so the certificates are in effect mandatory.
- The sentence sits under "transport requirements", which suggests it was carried over from another document.

**Counter-argument the customer could make.**
- The certificates may be the manufacturer's, and a distributor can obtain copies.
- A large state company applies one supplier standard to all purchases, whatever their size.
- The equipment is safety-relevant (it isolates live parts during repairs).

**Check by hand.**
- Open page 3 of the PDF and confirm the sentence and the section it is in.
- The sentence just before it requires delivery "from the manufacturer or its official representative (distributor)". The first pass left that unflagged; it is a second restriction in the same paragraph.
- Confirm on the lot page that the pass mark is 80 and the criteria are 50 + 20 + 10.

---

## 524401: building a 120-place kindergarten, Bektemir district, Tashkent

- **Customer:** National Agency for Energy Efficiency under the Cabinet of Ministers. **Start price:** UZS 9,684,137,125. **Closes:** 18 Nov 2026, 19:46.
- **Cached result:** green, score 89, "bid".
- **Spec file:** `data/specs/524401.zip` (9 pages of text).

**Quote (page 0, criterion 3, "3-shakl", 20 points):**

> Oxirgi 15 yilda 5 tadan ko‘p, maydoni 5000 m2 bo‘lgan, kapital xarajatlari (CAPEX) 1,0 mln. AQSh dollari ekvivalentida bo‘lgan

**Why it was flagged.**
- The buildings to be built total about 1,274 m² (block 1: 1,115.96 m²; block 2: 157.98 m²; page 2). The experience asked for is more than five objects of 5,000 m² each.
- The experience is described as "repair and modernisation", while the lot is a new build.

**Why I lowered it to low.**
- Only one part of criterion 3 depends on it: 5 points for objects of 5,000 m² and USD 1 m or more, 1 point for smaller ones. That is a 4-point gap out of 85, with a pass mark of 42.
- The lot is large (UZS 9.68 bn), so asking for experience with million-dollar objects is not out of proportion to its value.
- My earlier note ("5 objects of 5,000 m² for a 1,116 m² building") was accurate but left out how few points are at stake. **I do not recommend leading with this lot.**

**Counter-argument the customer could make.** A sizeable contract deserves a contractor with a record on larger objects; the threshold costs a smaller firm only 4 points.

---

## 524769 (suggested replacement): hospital meal outsourcing, City Clinical Infectious Diseases Hospital No. 2

- **Start price:** UZS 445,375,000. **Closes:** 20 Nov 2026, 11:32. Pass mark 70 of 100.
- **Cached result:** amber, score 50, "bid with clarification". Three flags (two medium, one low).

**Quote 1 (page 0, 10 points):**

> Tanlov ishtirokchisi shartnoma summasining 40 foizidan kam bo‘lmagan xisob raqamida mablag‘i borligi to‘g‘risida bank ko‘chirmasi yoki bank ma’lumotnomasi. 2026 yil yanvar oyi xolatiga

- **Why:** the bidder must show at least 40% of the contract sum (about UZS 178 m) on its account as of January 2026, ten months before this tender. A firm cannot change a past balance, so the date decides who gets the points (10 if met, 5 if the balance is lower).
- **Counter-argument:** the form itself gives a reason: patients depend on the service, so the supplier must be financially sound. The date may be a leftover from an earlier announcement.

**Quote 2 (page 0, 15 points, marked "Обязательное"):**

> oshpazlari kamida 2 yillik ish stajiga ega bo‘lganligi to‘g‘risidagi ma’lumotnoma mexnat uz saytidan tasdiklangan va sogligni saklash tizimida ishlagan

- **Why:** the cooks' two years of experience must have been in the health system. Caterers with experience in schools, canteens or restaurants lose 15 points.
- **Counter-argument:** hospital diets differ from ordinary catering, so prior hospital experience has a link to the subject.

**Check by hand.** Confirm both texts and their points on the lot page. This lot was second-read only from the platform form and the spec text; the spec is an OCR scan of 21 pages, one of them unreadable.

---

## Wording reminder for the demo

Say "this condition may limit who can bid" and show the quote. Don't say why the customer wrote it. Two of these four lots are re-announcements, which the app shows as context, not as a flag.
