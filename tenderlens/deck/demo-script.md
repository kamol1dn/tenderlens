# TenderLens: 90 soniyalik demo skripti

Asos: `national-research/report.md` §5.7, CONTRACT.md "Contract decisions" va `data/eval/hero_check.md`. Til: o'zbek (lotin). Ekran va tugma nomlari ilovadagi nomlar bilan bir xil. Raqamlar, `data/cache/stats.json` (yagona manba).

## Tayyorgarlik
- **Oflayn ishga tushiring.** Lotlar 18–20-noyabrda yopiladi, shuning uchun ilova engine keshidan (`data/cache/`) ishlaydi.
- **Taqdimot rejimini yoqing.** Buyurtmachi nomlari yashirilgan bo'lsin ("Buyurtmachi A"). Biz shartni ko'rsatamiz, tashkilotni emas.
- **Oldindan oching:**
  - 1-tab: **Yetkazib beruvchi**, lot 524954;
  - 2-tab: **Davlat nazorati paneli**;
  - Telegram, Quarry guruhidagi ogohlantirish.
- **Faqat inson tasdiqlagan bayroqlar.** 524954, 525192 va 524769 ni jamoa ertalab qo'lda tekshiradi (hero_check.md). Tasdiqlanmaganini ko'rsatmang.
- **Zaxira.** Ilova ishlamasa, 12-slayd (Zaxira).
- **So'z qoidasi (CONTRACT.md).** Faqat "adolatsiz shartlar" yoki "cheklovchi talablar" deng. "662 lotning hammasi baholandi" demang; faqat tahlil qilinganlar sonini ayting.

## Skript (90 s)

| Vaqt | Ekranda | Gapiriladi | Harakat |
|---|---|---|---|
| 0–10 s | 1-slayd (8 647) | "O'tgan yili Raqobat qo'mitasi 28 300 ta raqobatga qarshi harakat topdi. Ulardan 8 647 tasi, muayyan ishtirokchiga imtiyoz yaratish. Bitimlarning 52,5% i aynan ikki ishtirokchi bilan, ya'ni qonuniy minimumda o'tadi." |, |
| 10–40 s | Yetkazib beruvchi → lot 524954 | "Bobur kichik loyihalash firmasi egasi. Mana lot: suv omboridagi inshoot uchun ishchi loyiha, 330,4 million so'm. TenderLens texnik topshiriq va platforma mezonlarini o'qidi. Bayroq, 4-mezon, 15 ball: *so'nggi 3 yil uchun o'rtacha yillik aylanma — kamida 8 mlrd so'm*. Bu lotdan taxminan 24 baravar ko'p. Bu hujjatdan so'zma-so'z iqtibos. O'tish bali 70, demak Bobur bu 15 ballni yo'qotsa, qolgan 85 dan 70 ni olishi shart. Tavsiya: qatnashing, lekin avval aniqlik so'rang. Bir tugma bilan so'rov xati tayyor." | Lot raqamini kiriting → bayroqqa ko'rsating → **Aniqlik so'rovi xatini yaratish** |
| 40–65 s | Davlat nazorati paneli | "Endi Agentlik ekrani: 662 ochiq lotdan **156** tasi tahlil qilindi, xavf bo'yicha saralangan. Eng tepada, shablon topilmalari: bitta platforma mezoni **53** ta lotda veterinariya hujjatini so'raydi, taxminan **48** tasi oziq-ovqat emas, masalan dolota va sement. Shablonni bir marta tuzatsangiz, hammasi tuzaladi. Navbatda yana: 5,3 million so'mlik ikkita ajratgich uchun to'rtta ISO sertifikati, shifoxona bemorlari ovqati uchun esa bank hisobida shartnoma summasining 40 foizi." | Panel → shablon kartasi → 525192 → 524769 |
| 65–80 s | Telegram, so'ng 6-slayd | "Quarry 660 dan ortiq lotni uzluksiz kuzatadi, TenderLens har birini baholaydi. Birinchi haqiqiy ogohlantirish adolat verdikti bilan allaqachon Telegramga yuborildi. Qo'lda belgilangan **[PLACEHOLDER: N]** ta TTda TenderLens cheklovchi bandlarning **[PLACEHOLDER: X]%** ini topdi, bitta TTga **[PLACEHOLDER: Y]** ta yolg'on signal. Iqtibos yo'q, bayroq yo'q." | Telefon → 6-slayd |
| 80–90 s | 11-slayd | "Davlat AI narxni tekshiradi. TenderLens esa kim haqiqatan qatnasha olishini tekshiradi. PF-259 Farmoni tadbirkorlar ishtirokini 2030-yilgacha 35% dan 70% ga oshirmoqchi, mana, qanday qilib." |, |

Qalin raqamlar (156, 53, 48) chiqish oldidan `stats.json` dagi so'nggi qiymat bilan tekshiriladi; ular deck qayta yig'ilganda slaydlarda avtomatik yangilanadi.

## To'liq 5 daqiqalik taqdimot ichida
- **Qaysi qismlar.** Hook 1-slaydda, isbot va yakun 6- va 11-slaydlarda bor; Quarry miqyosi 7-slaydda. 4-slayd (Jonli demo) vaqtida faqat **10–65 s** qismini va Telegram'ni ko'rsating, bu taxminan 60–70 s.
- **O'tish gapi:** "Keling, ko'rsataman."
- **Demodan keyin** 5-slaydga qayting.

## Placeholder'lar
65–80 s qismidagi N, X% va Y engine baholash natijalaridan olinadi va 6-slayddagi raqamlar bilan bir xil bo'lishi kerak.
