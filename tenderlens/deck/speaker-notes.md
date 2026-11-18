# TenderLens: ma'ruzachi eslatmalari (speaker notes)

> Bu fayl `deck/build/build_deck.js` tomonidan slayd eslatmalari bilan **bir xil matndan** yaratiladi. O'zgartirish uchun skriptni tahrirlang va qayta ishga tushiring: `node deck/build/build_deck.js` (tenderlens papkasidan; yangi alifbo uchun `--alphabet yangi` qo'shing).
> Vaqt 5 daqiqalik chiqishga mo'ljallangan (taxmin, haqiqiy slot uzunligini tekshiring); 90 soniyalik demo, `demo-script.md`.
> Placeholder'lar: 5-slayd (inson tekshiruvi raqamlari; hozir (b) varianti: faqat iqtibos tekshiruvi); 7-slayd (jamoa a'zolari va rollari).
> So'z qoidasi (CONTRACT.md): faqat "adolatsiz shartlar" yoki "cheklovchi talablar" deng.

## 1. Bobur hikoyasi (0:00–0:35)

Bobur kichik yetkazib beruvchi, elektr jihozlari sotadi. U 5,3 million so'mlik tender topdi: ikkita ajratgich. Texnik topshiriqning 3-betida, transport talablari bo'limida, to'rtta ISO sertifikati va xalqaro laboratoriya sertifikati so'raladi. Baholash faqat narx bo'yicha, lekin texnik o'tish bali maksimal ballga teng: bitta hujjat yetishmasa, Bobur narx bosqichiga ham o'tolmaydi. Bu yakka hol emas: 2025-yilda Raqobat qo'mitasi 16 135 ta tenderda 28 304 ta raqobatga qarshi harakat topdi, 8 647 tasi muayyan ishtirokchilarga imtiyoz yaratish. TenderLens texnik topshiriq va baholash mezonlarini o'qiydi va ishtirokchilar doirasini toraytirishi mumkin bo'lgan shartni so'zma-so'z iqtibos bilan ko'rsatadi.

Bir marta ayting: bizning bayroqlar signal, qo'mita xulosasi emas. 8 647 ni 28 304 ga qo'shmang. Buyurtmachi nomini aytmang. Faqat "cheklovchi shartlar" yoki "adolatsiz shartlar" deng (CONTRACT.md).

## 2. Raqobat va narx (0:35–1:00)

Bu o'z hisobimiz: UZEX ochiq API'sidagi 19 980 ta bitim, 21.08.2025–17.11.2026. Ikki ishtirokchili savdolarda narx boshlang'ich narxdan atigi 2,4% tushgan, to'rttada 16,0%, olti va undan ko'pida 29,6%. Bitimlarning 52,5% ida aynan ikki ishtirokchi bo'lgan: ZRU-684 bo'yicha tanlov va tender kamida ikki taklif bo'lsagina o'tgan hisoblanadi, ya'ni bu qonuniy minimum. Bu bog'liqlik, sabab emas.

Himoya (narx toifalari bo'yicha, 2 / 3 / 4 / 5 / 6+ ishtirokchi): 50 mln so'mgacha 2,4 / 10,0 / 37,3 / 50,5 / 58,4%; 50–200 mln 2,1 / 6,4 / 14,1 / 23,9 / 36,5%; 200 mln–1 mlrd 2,5 / 6,9 / 11,5 / 16,2 / 24,9%; 1 mlrd dan yuqori 2,6 / 5,3 / 8,7 / 12,0 / 21,9%. Byudjet buyurtmachilari: 2,0 / 15,9 / 28,8% (2 / 4 / 6+); korporativ: 3,9 / 16,1 / 30,0%. Agar so'rashsa "bitta ishtirokchili 550 bitim-chi?": 550 ta (2,8%), 438 tasi korporativ; maydon baholashdan o'tganlarni sanashi mumkin, aniq bilmaymiz va tekshiramiz. Asosiy raqam bunga bog'liq emas. Ma'lumotda rad etilgan va bekor qilingan bitimlar ham bor (12%). Modda raqamlari (61 va 68) faqat so'rashsa.

## 3. Demo (1:00–2:30)

To'liq skript: deck/demo-script.md. Demo 17-noyabr snapshotidan, oflayn keshdan ishlaydi; buni hakam so'ramasdan oldin ayting.
1) Bobur 525192 ni ochadi: ball, tavsiya va 3-betdagi iqtibos. 2) "Aniqlik so'rovi xatini yaratish": tayyor xat. 3) Davlat paneli: tahlil qilingan lotlar xavf bo'yicha saralangan; cheklovchi shartli lotlar AI belgilagan, inson tasdiqlamagan. 4) Telegram bot: lot raqamini yuboring, tavsiya va xat keladi.

Halol bo'ling, agar so'rashsa: 662 lotdan 156 tasi tahlil qilingan; keshdagi tahlillar xakaton davomida Claude kodlash sessiyasida olingan, mahsulotning o'z API yo'li hali ishlatilmagan (API kaliti yo'q), shuning uchun yangi lot "hali tahlil qilinmagan" deb chiqadi. 662 TTdan 141 tasi skan va hali o'qilmagan. Panel 154 ni ko'rsatadi: davlat ulushisiz 2 ta lot navbatdan chiqarilgan. Hech qachon "hamma lot baholandi" yoki "72%" demang. Buyurtmachi nomini ko'rsatmang (taqdimot rejimi). "Buyurtmachiga yuborish" tugmasini sahnada bosmang. Ilova ishlamasa: 13-slayd (Zaxira).

## 4. Qanday ishlaydi (2:30–3:00)

TenderLens UZEX ochiq API'sidan lotni, texnik topshiriq faylini va platformadagi baholash mezonlarini oladi. Matn qatlami bo'lsa uni, skan bo'lsa vision modelni ishlatadi. LLM har bir talabni so'zma-so'z iqtibos bilan ajratadi; iqtibos hujjatda topilmasa, bayroq o'chiriladi. Statistika va yakuniy ball oddiy, tekshiriladigan qoidalar: bu ataylab. Telegram bot: yetkazib beruvchi lot raqamini yuboradi va tavsiya, iqtibosli bayroqlar va tayyor so'rov xatini oladi. Hammasi xakaton davomida, 17-noyabr kechqurundan boshlab noldan qurildi.

Halol javoblar: 234 bayroqning 144 tasi TT faylidan (skan, kirill, lotin, rus), 90 tasi platforma mezonlari formasidan. 662 TTdan 141 tasi skan va hali o'qilmagan. Keshdagi tahlillar Claude kodlash sessiyasida olingan; mahsulotning o'z API yo'li hali ishga tushmagan (kalit yo'q). Bayroqlarning uchdan biri "boshqa" turida. Qonun moddalari huquqshunos ko'rib chiqmaguncha keltirilmaydi. "Bu shunchaki qoidalar + chatbot" desa: aylanma misoli uchun qoida yetadi, lekin 525192 dagi to'rtta ISO sertifikati skanerlangan TTning 3-betida, transport talablari bo'limida turibdi; uni qoida topmaydi.

## 5. Misollar (3:00–3:30)

Asosiy misol, lot 525192: ikkita 6/10 kV ajratgich, 5,3 million so'm, 20-noyabrgacha ochiq. Texnik topshiriqning 3-betida to'rtta ISO sertifikati va xalqaro laboratoriya sertifikati so'raladi; baholash faqat narx bo'yicha, texnik o'tish bali 80, uchta mezon yig'indisi ham 80. Tavsiya: avval aniqlik so'rang. 524954: 330 million so'mlik loyihalash ishiga o'rtacha yillik aylanma kamida 8 milliard so'm, taxminan 24 baravar; mezon 15 ball, o'tish bali 70; lot 18-noyabrda yopilgan. 524769: shifoxona bemorlari ovqati, 445 million so'm; 10 ballik mezon: 2026-yil yanvar holatiga hisobda shartnoma summasining 40% i, kam bo'lsa 5 ball. Bog'cha ovqati: kamida 10 ta ochiq lotning TT si o'zini 810-son qaror asosida tuzilgan deb yozadi va matni bir xil; 2 oylik shartnomaga 3 oylik oziq-ovqat zaxirasi so'raladi. Bu aniqlik so'rash darajasidagi bayroq, sarlavha emas. Qarorning o'zini o'qimaganmiz.

Chapda aniqlik raqami yo'q, va uni o'ylab topmaymiz: inson tekshiruvi davom etmoqda. Kafolatimiz: har bir iqtibos hujjatda so'zma-so'z bor.  524954 ga qarshi argument: inshoot qurilishi 4,8 mlrd so'mlik; shuning uchun tavsiya "qatnashmang" emas, "aniqlik so'rang".

## 6. Nega hozir (3:30–3:50)

Birinchi: PF-259 Farmoni 2030-yilgacha tadbirkorlarning davlat xaridlaridagi faolligini 35% dan 70% ga, raqobatli xaridlar ulushini 58% dan 80% ga oshirishni talab qiladi. Ikkinchi: 13-oktabrda parlament xaridlar qonuni loyihasini qaytardi; deputatlarning o'zi cheklovchi mezonlarni misol keltirdi: qog'ozni 15 kunda yetkazish, 1 milliard so'm ustav kapitali. Uchinchi: davlat rejalari bor: VMQ 425 xarid buzilishlarini aniqlovchi AI mahsulotini 2026-yil noyabrga, VMQ 865 tender e'lonlarini elektron monitoringni 2026–27 yillarga rejalashtirgan. Bular reja, TT matnini o'qishi aytilmagan; TenderLens shu qatlamning ishlaydigan prototipi.

PF-259 ning 16-bandi avtomatik xavf aniqlashni ham va'da qiladi; hakam aytsa: "aynan shu sahifaga tayyor qatlam taklif qilamiz: narx moduli narxni ko'radi, biz matnni". PQ-332 (TT ekspertizasi) ni o'qimaganmiz. Agentlik sanasi: faqat "2026-yil fevral". UZEX 7–8 noyabrda o'z AI xakatonini o'tkazgan; bu loyiha u yerda ko'rsatilmagan.

## 7. Kim to'laydi (3:50–4:30)

Birinchi to'lovchi: tender konsultantlari va kichik yetkazib beruvchilar. Ular har bir lot uchun TTni o'qishga vaqt sarflaydi; biz tekshiruv va tayyor xat sotamiz: bitta tekshiruv yoki oylik obuna. Narxlar bizning taklifimiz va pilotda sinaladi. Davlat uchun litsenziya yoki API keyingi bosqich. Bozor, o'z hisobimiz, etender'ning so'nggi 12 oyi: 15 712 ta savdo, 1 857 ta buyurtmachi, 4 782 ta g'olib yetkazib beruvchi; ishtirokchilar soni g'oliblardan ko'p, chunki DealsList faqat g'olibni beradi. Misol: g'oliblarning 10% i oylik tarifni olsa, taxminan 1,7 milliard so'm yiliga. Bu misol, prognoz emas. Jamoa: [PLACEHOLDER: ismlar va rollar]. Engine, ilova va bot shu uch kunda yozildi.

Hali hech kim bilan kelishuv yo'q; mijoz iqtibosini o'ylab topmang. Agar so'rashsa: Assotsiatsiya "moslab yozilgan" TT lardan shikoyat qilgan (anhor.uz); shuning uchun so'rovimiz pilot uchun tanishtiruv. Butun tizimda yiliga ~2 mln lot bor, lekin ularning ko'pi e-do'kon; biz etender'ni o'qiymiz.

## 8. So'rov va yakun (4:30–5:00)

Sizdan uchta narsa so'raymiz: biznes model va huquqiy masalalar bo'yicha mentorlik; pilot uchun tender konsultantlari va ishtirokchilar assotsiatsiyasi bilan tanishtiruv; va milliy finalga yo'llanma, u yerda jonli tahlil va inson tekshiruvi raqamlari bilan chiqamiz. Keyingi qadam: Agentlik bilan pilot. Davlat AI narxni tekshiradi. TenderLens esa kim haqiqatan qatnasha olishini tekshiradi. Bog'cha ovqatidan shifoxona bemorlari ovqatigacha, har bir tender hamma uchun ochiq bo'lsin. Rahmat.

## 9. Zaxira: ikki foydalanuvchi (faqat savol bo'lsa)

2–3% bir ekspertning bahosi (TenderZone), rasmiy raqam emas va tartib-taomillar haqida. ~2 mln lot butun tizim, asosan e-do'kon; biz o'qiydigan etender'da yiliga taxminan 16 ming savdo. 810-son qarorning o'zini o'qimaganmiz: kamida 10 ta TT o'zini shu qaror asosida tuzilgan deb yozadi va matni bir xil.

## 10. Zaxira: shablon savollari (faqat savol bo'lsa)

Faqat so'rashsa ko'rsating. Veterinariya sarlavhasi 53 lotda turibdi; ~48 tasi oziq-ovqat emas, bu kalit so'z taxmini. 16 tasida veterinariya matni buyurtmachi izohida takrorlangan, hammasi bitta buyurtmachi. 53 lotdan 31 tasi ikki buyurtmachidan, shuning uchun "tizimli" deb aytmang. Ko'p lotda buyurtmachi bu sarlavha ostida boshqa narsani baholaydi. Hakam "bu bizning standart mezonimiz" desa: "To'g'ri, sarlavha to'rt turdagi mahsulotni birlashtiradi; ishtirokchi nimani ilova qilishni bilmaydi. Sarlavhani kim belgilashini sizdan so'ramoqchi edik."

## 11. Zaxira: dunyo tajribasi (faqat savol bo'lsa)

ALICE tejovi yakunlangan auditlardan. Ukraina va Koreya qatorlarini olib tashladik: manbalarini ocholmadik. Qozog'iston bo'yicha raqam aytmang (781 mlrd tenge vazir bayonoti, tekshirilmagan). "Faqat" va "hech kim" demang: faqat "biz o'rgangan davlatlar ichida".

## 12. Zaxira: yo'l xaritasi (faqat savol bo'lsa)

VMQ 581 ijtimoiy ahamiyatli loyihalar uchun, tanlov iyul va noyabrda, tijorat maqsadida foydalanish taqiqlangan: bepul qism (yetkazib beruvchiga ogohlantirish) uchun ariza beramiz, va'da qilmaymiz. Engine Claude modellariga yozilgan; davlat modellarida hali sinalmagan.

## 13. Zaxira: skrinshotlar (faqat kerak bo'lsa)

Faqat demo ishlamasa ko'rsating. 1) Bobur lot 525192 ni ochadi: 5,3 mln so'mlik 2 ta ajratgich uchun to'rtta ISO sertifikati; tavsiya "qatnashing, lekin avval aniqlik so'rang". 2) Davlat paneli: tahlil qilingan lotlar xavf bo'yicha saralangan. 3) Bot javobi: bu botning javobidan olingan render, Telegram chatining skrinshoti emas. Keyin 4-slaydga o'ting.

## Hakamlar savollari: tayyor javoblar

### Eng xavfli savollar

| Savol | Halol javob |
|---|---|
| "Hozir mana bu lotni tahlil qiling." (bizniki bo'lmagan lot) | "Demo 17-noyabr snapshotidan ishlaydi: 662 lotdan 156 tasi tahlil qilingan. Sizning lotingiz ular ichida bo'lsa, hozir ochamiz. Yangi lotni jonli tahlil qilish uchun API kaliti kerak, bu yo'l hali sinalmagan." |
| "Uch kunda nima qurdingiz?" | "TenderLens engine, ilova va bot shu uch kunda, 17-noyabr kechqurundan boshlab yozildi; GitHub tarixida ko'rinadi. Tahlillar xakaton davomida Claude modellari bilan olindi." |
| "Aniqligingiz qancha? Qancha bayroq noto'g'ri?" | "Hozircha inson tasdiqlagan aniqlik raqamimiz yo'q va uni o'ylab topmaymiz. Kafolatimiz: har bir iqtibos hujjatda so'zma-so'z bor (kod tekshiradi). Tasodifiy 27 TT namunasida 13–14 tasida yuqori yoki o'rta bayroq chiqdi. Inson tekshiruvi davom etmoqda." |
| "Nomi bor davlat tashkilotlarini ayblayapsiz." | "Hech kimni ayblamaymiz. Ekranda hujjatdan iqtibos va savol turadi; qarorni inson qiladi. Nomlarni yashiramiz, misollar ochiq e'lon qilingan lotlardan. Buyurtmachi e'londan oldin o'zi tekshirib tuzatishi mumkin." |
| "Bu veterinariya mezoni bizning standart ro'yxatimiz, sementdan veterinariya hujjati so'ramaydi." | "To'g'ri: sarlavha to'rt turdagi mahsulotni birlashtiradi va buyurtmachilar uning ostida ko'pincha boshqa narsani baholaydi. Topilmamiz torroq: sarlavha 53 lotda, ~48 tasi oziq-ovqat emas, 16 tasida (bitta buyurtmachi) veterinariya matni izohda ham bor. Sarlavhani kim belgilashini sizdan so'ramoqchi edik." |
| "8 mlrd aylanma 4,8 mlrd lik inshoot uchun o'rinli-ku." | "Balki, shuning uchun tavsiya 'qatnashmang' emas, 'aniqlik so'rang'. Faktlar: lot 330,4 mln so'mlik loyihalash ishi; talab 24 baravar; mezon 15 ball, o'tish bali 70. Buyurtmachi asosini yozsa, savol yopiladi." |
| "AI nimaga kerak? Bu qoida bilan topiladi." | "Aylanma misoli uchun qoida yetadi, rozi. Lekin 234 bayroqning 144 tasi TT faylidan: skan, kirill, lotin, rus. 525192 dagi to'rtta ISO sertifikati skanerlangan TTning 3-betida, transport talablari bo'limida; uni qoida topmaydi." |
| "Ko'p ishtirokchi, past narx: bu bog'liqlik xolos." | "Ha, bog'liqlik. Narx toifalari ichida ham tekshirdik: 1 mlrd so'mdan yuqori lotlarda 2 ishtirokchida 2,6%, 6+ da 21,9%; byudjet va korporativ buyurtmachilarda ham shunday." |
| "Qonun 2 taklif talab qiladi, sizda 550 ta bitta ishtirokchili bitim bor." | "550 ta (2,8%), 438 tasi korporativ. Maydon baholashdan o'tganlarni sanashi mumkin; aniq bilmaymiz va tekshiramiz. Asosiy raqam bunga bog'liq emas: 52,5% bitimda aynan ikki ishtirokchi." |
| "Vositangiz yetkazib beruvchiga 'qatnashmang' deydi. Bu raqobatni kamaytiradi-ku." | "Yaxshi savol. Asosiy chiqish 'aniqlik so'rang' va tayyor xat (67 lot). 'Qatnashmang' 30 lotda chiqadi; uni 'avval so'rang, javobga qarab qaror qiling' ga almashtirish to'g'riroq, shuni qilamiz." |
| "Kim foydalanishga yoki to'lashga rozi bo'lgan?" | "Hali hech kim bilan kelishuv yo'q. Shuning uchun so'rovimiz: pilot uchun tender konsultantlari va Assotsiatsiya bilan tanishtiruv. Narxlar bizning taklifimiz, pilotda sinaladi." |

### Boshqa savollar

| Savol | Javob |
|---|---|
| "Vazirlik va Agentlik buni noyabrda ishga tushiradi (VMQ 425)." | VMQ 425 xarid buzilishlarini aniqlovchi AI mahsulotini rejalashtirgan; ishga tushgani haqida xabar topmadik va u TT matnini o'qishi aytilmagan. TenderLens TTni e'londan oldin o'qiydi va yetkazib beruvchiga tayyor so'rov xatini beradi: to'ldiruvchi, ulanishga tayyor. |
| "PF-259 o'zi avtomatik xavf aniqlashni talab qiladi." | Ha, 16-band. Biz aynan shu sahifaga tayyor qatlam taklif qilamiz: narx moduli narxni ko'radi, biz matnni. |
| "Davlatda xarid AI allaqachon bor." | Ha: o'rtacha bozor narxi moduli narxni tekshiradi; e-do'kon takliflarining 75% i sun'iy intellekt orqali tekshiriladi (Agentlik, 30.10.2026). O'zbekistonda TTdagi cheklovchi shartni iqtibos bilan belgilaydigan ishlayotgan vositani topmadik. |
| "TenderAI (tenderai.uz) dan farqi nima?" | TenderAI hujjatni tarjima qiladi, tasniflaydi va xulosa beradi. TenderLens cheklovchi shartni so'zma-so'z iqtibos bilan belgilaydi, ball beradi va so'rov xatini yozadi. |
| "Rossiyada SentinelTender bor-ku." | Ha, u rus tilidagi TT uchun. Biz o'zbek (kirill va lotin) va rus tilidagi TTni, UZEX mezonlar formasini va buyurtmachi tarixini birga o'qiymiz; davlat paneli ham bor. |
| "UZEX 7–8 noyabrda AI xakaton o'tkazdi. Bu loyiha o'sha yerda bo'lganmi?" | Yo'q. TenderLens shu xakatonda, 17-noyabrdan boshlab qurildi. |
| "TTni ekspertlar allaqachon ko'radi." | Ba'zi xaridlar uchun ha. Lekin etender'da yiliga ~16 ming savdo bor; ekspert bahosiga ko'ra atigi 2–3% qo'lda tahlil qilinadi. TenderLens ekspertlarga qaysi TTni o'qishni tanlab beradi. |
| "Ma'lumotni olish qonuniymi? Ma'lumot qayerda qayta ishlanadi?" | Login talab qilmaydigan ochiq sahifalar, sekin so'rovlar, hammasi keshda; aloqa shaxslarining ismlarini saqlamaymiz. Ballar ommaga chiqarilmaydi, demo yopiq. Huquqiy xulosa pilotdan oldin olinadi; ishlab chiqarishda rasmiy oqim so'raymiz. |
| "LLM o'zbek kirill matnida xato qiladi." | Cheklangan ajratish va majburiy so'zma-so'z iqtibos, kod tekshiradi. Bu iqtibos borligini kafolatlaydi; xulosani inson tekshiradi. Inson tekshiruvi davom etmoqda. |
| "Skan va arxivlar-chi?" | 662 TTdan 141 tasi skan va hali o'qilmagan; OCR keyingi qadam. RAR arxivlar uchun alohida dastur kerak. |
| "Bayroqlarning uchdan biri 'boshqa' turida. Taksonomiyangiz nimaga arziydi?" | To'qqiz nomli tur bor; qolganini majburan tiqmaymiz. Inson tekshiruvidan keyin turlarni kengaytiramiz. |
| "Buyurtmachi nega foydalanadi?" | PF-259 buyurtmachilar KPI reytingini kiritadi. E'londan oldin tekshirish reytingni himoya qiladi va shikoyatlarni kamaytiradi. |
| "Skan va mezonlar formasi farqi?" | 234 bayroqning 144 tasi TT faylidan, 90 tasi platforma mezonlari formasidan. |
