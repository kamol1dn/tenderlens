# TenderLens: chiqish va demo skripti

Asos: CONTRACT.md "Contract decisions", `review/grader.md`, `review/redteam-judges.md`, `review/research.md`, `data/eval/hero_check.md`. Til: o'zbek (lotin). Raqamlar `data/cache/stats.json` dan olinadi, ular yagona manba.

**Slaydlar.** 1–8 asosiy, 9–13 zaxira. Tartib:
1. Bobur hikoyasi
2. Raqobat va narx
3. Demo (17.11 snapshot)
4. Qanday ishlaydi
5. Misollar
6. Nega hozir
7. Kim to'laydi
8. So'rov

Zaxira: 9 ikki foydalanuvchi, 10 shablon savollari, 11 dunyo tajribasi, 12 yo'l xaritasi, 13 skrinshotlar.

## Tayyorgarlik
- **Oflayn ishga tushiring.** Ilova 17-noyabr snapshotidan, engine keshidan (`data/cache/`) ishlaydi; buni birinchi bo'lib ayting.
- **Bosh lot: 525192.** 20.11 soat 08:37 gacha ochiq. 524769 20.11 soat 11:32 gacha ochiq. 524954 18.11 soat 17:50 da yopilgan; uni faqat "yopilgan lot" misoli sifatida ko'rsating.
- **Taqdimot rejimi.** Yangi brauzerda o'chiq bo'ladi; yoqilganini tekshiring ("Taqdimot rejimi: yoqilgan").
- **Oldindan oching:**
  - 1-tab: Yetkazib beruvchi, lot 525192;
  - 2-tab: Davlat nazorati paneli;
  - Telegram: TenderLens boti, taqdimot rejimida (`bot/tenderlens_bot.py`).
- **Bayroqlar.** Har bir bayroqni ko'rsatishdan oldin jamoa a'zosi uni hujjat bilan solishtirsin va `hero_check.md` ga kim va qachon tekshirganini yozsin. Hozircha hech biri inson tomonidan tasdiqlanmagan.
- **Zaxira.** Ilova ishlamasa, 13-slayd; bot ishlamasa, `app/screenshots/10_bot_525192.png` (bu bot javobining render qilingan rasmi).
- **Sahnada qilmang:**
  - "Buyurtmachiga yuborish" tugmasini bosmang;
  - "hamma lot baholandi", "72%" yoki "tejaladi" demang;
  - so'z qoidasi (CONTRACT.md): faqat "cheklovchi shartlar" yoki "adolatsiz shartlar" deng.

## 30 soniyalik checkpoint pitch (bugun, finalistlar saralanishi 19:00 gacha)

| Taymer | Ekranda | Gapiriladi |
|---|---|---|
| 0:00–0:10 | Yetkazib beruvchi → lot 525192 | "TenderLens tender texnik topshiriqni o'qiydi va qatnashishni cheklashi mumkin bo'lgan shartni iqtibos bilan ko'rsatadi. Mana jonli lot: 5,3 million so'mlik ikkita ajratgich uchun to'rtta ISO sertifikati, 3-betda." |
| 0:10–0:20 | Aniqlik so'rovi xati | "Kim to'laydi: tender konsultantlari va kichik yetkazib beruvchilar, har bir tekshiruv yoki oylik obuna uchun. Bitta tugma bilan tayyor xat." |
| 0:20–0:30 | GitHub commit tarixi | "Engine, ilova va bot shu yerda, 17-noyabr kechqurundan beri yozildi: commit tarixida ko'rinadi." |

GitHub tarixi bilan ishlashdan oldin repo push qilinganini tekshiring.

## 5 daqiqalik versiya

| Taymer | Slayd | Gapiriladi (qisqa) | Harakat |
|---|---|---|---|
| 0:00–0:35 | 1 Bobur | Bobur hikoyasi: 5,3 mln so'mlik lot, 3-betdagi to'rtta ISO, narx bosqichiga o'tolmaydi. Keyin: 16 135 tenderda 28 304 harakat, 8 647 imtiyoz. "Bizning bayroqlar signal, qo'mita xulosasi emas." | |
| 0:35–1:00 | 2 Raqobat | "Ko'proq ishtirokchi bo'lgan savdolarda narx ko'proq tushgan: 2 da 2,4%, 6+ da 29,6%. 52,5% bitimda aynan 2 ishtirokchi, ya'ni qonuniy minimum." | |
| 1:00–2:30 | 3 Demo | Quyidagi demo qismi (90 s). | Sayt → xat → panel → bot |
| 2:30–3:00 | 4 Qanday ishlaydi | "AI o'qiydi, qoidalar hisoblaydi. Iqtibos yo'q, bayroq yo'q. Xakatonda noldan qurilgan." | |
| 3:00–3:30 | 5 Misollar | 525192, 524954 (yopilgan), 524769. "Inson tekshiruvi davom etmoqda; aniqlik raqamini o'ylab topmaymiz." | |
| 3:30–3:50 | 6 Nega hozir | PF-259 (35→70%), parlament 13.10, VMQ 425/865 rejalari. | |
| 3:50–4:30 | 7 Kim to'laydi | Konsultantlar va kichik yetkazib beruvchilar; taklif qilingan narxlar; bozor: 12 oyda 15 712 savdo, 1 857 buyurtmachi, 4 782 g'olib; jamoa. | |
| 4:30–5:00 | 8 So'rov | Mentorlik, pilot uchun tanishtiruv, milliy final. Yakuniy gap. | |

### Demo qismi (1:00–2:30, 90 s)

| Taymer | Ekranda | Gapiriladi | Harakat |
|---|---|---|---|
| 1:00–1:10 | 3-slayd | "Demo 17-noyabr snapshotidan: 662 ochiq lotdan 156 tasi tahlil qilingan." | |
| 1:10–1:40 | Yetkazib beruvchi → lot 525192 | "Bobur lotni ochadi. TenderLens texnik topshiriqni o'qidi: 3-betda to'rtta ISO sertifikati va laboratoriya sertifikati, so'zma-so'z iqtibos. Baholash faqat narx bo'yicha, lekin texnik o'tish bali maksimal ballga teng. Tavsiya: avval aniqlik so'rang. Bir tugma bilan xat tayyor." | Lot raqami → iqtibos → **Aniqlik so'rovi xatini yaratish** |
| 1:40–2:05 | Davlat nazorati paneli | "Agentlik ekrani: tahlil qilingan lotlar xavf bo'yicha saralangan. Bu bayroqlarni AI belgilagan, inson hali tasdiqlamagan. Navbatda shifoxona bemorlari ovqati: 10 ballik mezon, hisobda shartnoma summasining 40% i bo'lmasa 5 ball." | Panel → 524769 |
| 2:05–2:30 | Telegram bot | "Bobur saytga kirmasdan ham ishlaydi: botga lot raqamini yuboradi, tavsiya, iqtibos va xat keladi." | Botga `525192` yuboring |

## 3 daqiqalik versiya

| Taymer | Slayd | Gapiriladi |
|---|---|---|
| 0:00–0:25 | 1 Bobur | Bobur hikoyasi va bitta raqam: 16 135 tenderda raqobatga qarshi harakat. |
| 0:25–0:40 | 2 Raqobat | "2 ishtirokchida narx 2,4% tushadi, 6+ da 29,6%; bitimlarning yarmidan ko'pi qonuniy minimumda." |
| 0:40–1:40 | 3 Demo | Demo qismining 1:10–2:05 bo'lagi: lot 525192, xat, panel (60 s). |
| 1:40–2:00 | 4 Qanday ishlaydi | "AI o'qiydi, qoidalar hisoblaydi; iqtibos yo'q, bayroq yo'q; xakatonda noldan qurilgan." |
| 2:00–2:15 | 5 Misollar | "Inson tekshiruvi davom etmoqda." |
| 2:15–2:45 | 7 Kim to'laydi | Birinchi to'lovchi, taklif qilingan narx, bozor raqami, jamoa. |
| 2:45–3:00 | 8 So'rov | Uchta so'rov va yakuniy gap. |

3 daqiqada 6-slaydni bir soniyada o'tkazib yuboring. Bot va 524769 ni faqat savol bo'lsa ko'rsating.

## Hakamlik mezonlari (Nizom 7.2, 1–5 ball, vaznsiz): qayerda javob topadi

| Mezon | Qayerda |
|---|---|
| Yo'nalishga mosligi (tadbirkorlik) | 1-slayd (Bobur, kichik yetkazib beruvchi), 7-slayd (kim to'laydi, bozor) |
| AI innovatsiyasi | 4-slayd (LLM o'qiydi va iqtibos keltiradi; kod iqtibosni hujjat bilan solishtiradi), 5-slayd |
| Texnik sifat | 3- va 4-slayd: ishlaydigan sayt, panel va bot; 234/234 iqtibos tekshirilgan |
| UI/UX | 3-slayd va demo: sayt, davlat paneli, Telegram bot |
| Miqyoslilik | 4-slayddagi "Miqyos" qatori; 7-slayddagi bozor raqamlari |
| Taqdimot | 5 daqiqalik va 3 daqiqalik versiyalar (yuqorida) |
| Vaqt va qoidalar | 4-slayd: "Xakatonda noldan qurilgan (17–19.11)"; 7-slayd: jamoa; savol-javob: GitHub tarixi |

## Placeholder'lar
- **5-slayd.** Inson tekshirgan raqamlar kelguncha (b) variant ko'rsatiladi: faqat iqtibos tekshiruvi va "inson tekshiruvi davom etmoqda" yozuvi. Raqamlar kelsa, `deck-data.json` dagi `eval.precision_k` va `eval.precision_n` to'ldiriladi va (a) variant chiqadi: k / n va yolg'on signal soni. Recall hisoblanmaydi.
- **7-slayd.** Jamoa a'zolari va rollari `deck-data.json` dagi `team` ga yoziladi.
