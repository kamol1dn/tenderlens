# TenderLens: maʼruzaçi eslatmalari (speaker notes)

> Bu fayl `deck/build/build_deck.js` tomonidan slayd eslatmalari bilan **bir xil matndan** yaratiladi. Özgartiriş uçun skriptni tahrirlang va qayta işga tuşiring: `node deck/build/build_deck.js` (tenderlens papkasidan; yangi alifbo uçun `--alphabet yangi` qöşing).
> Vaqt 5 daqiqalik çiqişga möljallangan (taxmin, haqiqiy slot uzunligini tekşiring); 90 soniyalik demo, `demo-script.md`.
> Placeholderʼlar: 5-slayd (inson tekşiruvi raqamlari; hozir (b) varianti: faqat iqtibos tekşiruvi); 7-slayd (jamoa aʼzolari va rollari).
> Söz qoidasi (CONTRACT.md): faqat "adolatsiz şartlar" yoki "çeklovçi talablar" deng.

## 1. Bobur hikoyasi (0:00–0:35)

Bobur kiçik yetkazib beruvçi, elektr jihozlari sotadi. U 5,3 million sömlik tender topdi: ikkita ajratgiç. Texnik topşiriqning 3-betida, transport talablari bölimida, törtta ISO sertifikati va xalqaro laboratoriya sertifikati söraladi. Baholaş faqat narx böyiça, lekin texnik ötiş bali maksimal ballga teng: bitta hujjat yetişmasa, Bobur narx bosqiçiga ham ötolmaydi. Bu yakka hol emas: 2025-yilda Raqobat qömitasi 16 135 ta tenderda 28 304 ta raqobatga qarşi harakat topdi, 8 647 tasi muayyan iştirokçilarga imtiyoz yaratiş. TenderLens texnik topşiriq va baholaş mezonlarini öqiydi va iştirokçilar doirasini toraytirişi mumkin bölgan şartni sözma-söz iqtibos bilan körsatadi.

Bir marta ayting: bizning bayroqlar signal, qömita xulosasi emas. 8 647 ni 28 304 ga qöşmang. Buyurtmaçi nomini aytmang. Faqat "çeklovçi şartlar" yoki "adolatsiz şartlar" deng (CONTRACT.md).

## 2. Raqobat va narx (0:35–1:00)

Bu öz hisobimiz: UZEX oçiq API'sidagi 19 980 ta bitim, 21.08.2025–17.11.2026. Ikki iştirokçili savdolarda narx boşlanğiç narxdan atigi 2,4% tuşgan, törttada 16,0%, olti va undan köpida 29,6%. Bitimlarning 52,5% ida aynan ikki iştirokçi bölgan: ZRU-684 böyiça tanlov va tender kamida ikki taklif bölsagina ötgan hisoblanadi, yaʼni bu qonuniy minimum. Bu boğliqlik, sabab emas.

Himoya (narx toifalari böyiça, 2 / 3 / 4 / 5 / 6+ iştirokçi): 50 mln sömgaça 2,4 / 10,0 / 37,3 / 50,5 / 58,4%; 50–200 mln 2,1 / 6,4 / 14,1 / 23,9 / 36,5%; 200 mln–1 mlrd 2,5 / 6,9 / 11,5 / 16,2 / 24,9%; 1 mlrd dan yuqori 2,6 / 5,3 / 8,7 / 12,0 / 21,9%. Byudjet buyurtmaçilari: 2,0 / 15,9 / 28,8% (2 / 4 / 6+); korporativ: 3,9 / 16,1 / 30,0%. Agar söraşsa "bitta iştirokçili 550 bitim-çi?": 550 ta (2,8%), 438 tasi korporativ; maydon baholaşdan ötganlarni sanaşi mumkin, aniq bilmaymiz va tekşiramiz. Asosiy raqam bunga boğliq emas. Maʼlumotda rad etilgan va bekor qilingan bitimlar ham bor (12%). Modda raqamlari (61 va 68) faqat söraşsa.

## 3. Demo (1:00–2:30)

Töliq skript: deck/demo-script.md. Demo 17-noyabr snapşotidan, oflayn keşdan işlaydi; buni hakam söramasdan oldin ayting.
1) Bobur 525192 ni oçadi: ball, tavsiya va 3-betdagi iqtibos. 2) "Aniqlik sörovi xatini yaratiş": tayyor xat. 3) Davlat paneli: tahlil qilingan lotlar xavf böyiça saralangan; çeklovçi şartli lotlar AI belgilagan, inson tasdiqlamagan. 4) Telegram bot: lot raqamini yuboring, tavsiya va xat keladi.

Halol böling, agar söraşsa: 662 lotdan 156 tasi tahlil qilingan; keşdagi tahlillar xakaton davomida Claude kodlaş sessiyasida olingan, mahsulotning öz API yöli hali işlatilmagan (API kaliti yöq), şuning uçun yangi lot "hali tahlil qilinmagan" deb çiqadi. 662 TTdan 141 tasi skan va hali öqilmagan. Panel 154 ni körsatadi: davlat uluşisiz 2 ta lot navbatdan çiqarilgan. Heç qaçon "hamma lot baholandi" yoki "72%" demang. Buyurtmaçi nomini körsatmang (taqdimot rejimi). "Buyurtmaçiga yuboriş" tugmasini sahnada bosmang. Ilova işlamasa: 13-slayd (Zaxira).

## 4. Qanday işlaydi (2:30–3:00)

TenderLens UZEX oçiq API'sidan lotni, texnik topşiriq faylini va platformadagi baholaş mezonlarini oladi. Matn qatlami bölsa uni, skan bölsa vision modelni işlatadi. LLM har bir talabni sözma-söz iqtibos bilan ajratadi; iqtibos hujjatda topilmasa, bayroq öçiriladi. Statistika va yakuniy ball oddiy, tekşiriladigan qoidalar: bu ataylab. Telegram bot: yetkazib beruvçi lot raqamini yuboradi va tavsiya, iqtibosli bayroqlar va tayyor sörov xatini oladi. Hammasi xakaton davomida, 17-noyabr keçqurundan boşlab noldan qurildi.

Halol javoblar: 234 bayroqning 144 tasi TT faylidan (skan, kirill, lotin, rus), 90 tasi platforma mezonlari formasidan. 662 TTdan 141 tasi skan va hali öqilmagan. Keşdagi tahlillar Claude kodlaş sessiyasida olingan; mahsulotning öz API yöli hali işga tuşmagan (kalit yöq). Bayroqlarning uçdan biri "boşqa" turida. Qonun moddalari huquqşunos körib çiqmagunça keltirilmaydi. "Bu şunçaki qoidalar + chatbot" desa: aylanma misoli uçun qoida yetadi, lekin 525192 dagi törtta ISO sertifikati skanerlangan TTning 3-betida, transport talablari bölimida turibdi; uni qoida topmaydi.

## 5. Misollar (3:00–3:30)

Asosiy misol, lot 525192: ikkita 6/10 kV ajratgiç, 5,3 million söm, 20-noyabrgaça oçiq. Texnik topşiriqning 3-betida törtta ISO sertifikati va xalqaro laboratoriya sertifikati söraladi; baholaş faqat narx böyiça, texnik ötiş bali 80, uçta mezon yiğindisi ham 80. Tavsiya: avval aniqlik sörang. 524954: 330 million sömlik loyihalaş işiga örtaça yillik aylanma kamida 8 milliard söm, taxminan 24 baravar; mezon 15 ball, ötiş bali 70; lot 18-noyabrda yopilgan. 524769: şifoxona bemorlari ovqati, 445 million söm; 10 ballik mezon: 2026-yil yanvar holatiga hisobda şartnoma summasining 40% i, kam bölsa 5 ball. Boğça ovqati: kamida 10 ta oçiq lotning TT si özini 810-son qaror asosida tuzilgan deb yozadi va matni bir xil; 2 oylik şartnomaga 3 oylik oziq-ovqat zaxirasi söraladi. Bu aniqlik söraş darajasidagi bayroq, sarlavha emas. Qarorning özini öqimaganmiz.

Çapda aniqlik raqami yöq, va uni öylab topmaymiz: inson tekşiruvi davom etmoqda. Kafolatimiz: har bir iqtibos hujjatda sözma-söz bor.  524954 ga qarşi argument: inşoot qurilişi 4,8 mlrd sömlik; şuning uçun tavsiya "qatnaşmang" emas, "aniqlik sörang".

## 6. Nega hozir (3:30–3:50)

Birinçi: PF-259 Farmoni 2030-yilgaça tadbirkorlarning davlat xaridlaridagi faolligini 35% dan 70% ga, raqobatli xaridlar uluşini 58% dan 80% ga oşirişni talab qiladi. Ikkinçi: 13-oktabrda parlament xaridlar qonuni loyihasini qaytardi; deputatlarning özi çeklovçi mezonlarni misol keltirdi: qoğozni 15 kunda yetkaziş, 1 milliard söm ustav kapitali. Uçinçi: davlat rejalari bor: VMQ 425 xarid buzilişlarini aniqlovçi AI mahsulotini 2026-yil noyabrga, VMQ 865 tender eʼlonlarini elektron monitoringni 2026–27 yillarga rejalaştirgan. Bular reja, TT matnini öqişi aytilmagan; TenderLens şu qatlamning işlaydigan prototipi.

PF-259 ning 16-bandi avtomatik xavf aniqlaşni ham vaʼda qiladi; hakam aytsa: "aynan şu sahifaga tayyor qatlam taklif qilamiz: narx moduli narxni köradi, biz matnni". PQ-332 (TT ekspertizasi) ni öqimaganmiz. Agentlik sanasi: faqat "2026-yil fevral". UZEX 7–8 noyabrda öz AI xakatonini ötkazgan; bu loyiha u yerda körsatilmagan.

## 7. Kim tölaydi (3:50–4:30)

Birinçi tölovçi: tender konsultantlari va kiçik yetkazib beruvçilar. Ular har bir lot uçun TTni öqişga vaqt sarflaydi; biz tekşiruv va tayyor xat sotamiz: bitta tekşiruv yoki oylik obuna. Narxlar bizning taklifimiz va pilotda sinaladi. Davlat uçun litsenziya yoki API keyingi bosqiç. Bozor, öz hisobimiz, etenderʼning sönggi 12 oyi: 15 712 ta savdo, 1 857 ta buyurtmaçi, 4 782 ta ğolib yetkazib beruvçi; iştirokçilar soni ğoliblardan köp, çunki DealsList faqat ğolibni beradi. Misol: ğoliblarning 10% i oylik tarifni olsa, taxminan 1,7 milliard söm yiliga. Bu misol, prognoz emas. Jamoa: [PLACEHOLDER: ismlar va rollar]. Engine, ilova va bot şu uç kunda yozildi.

Hali heç kim bilan kelişuv yöq; mijoz iqtibosini öylab topmang. Agar söraşsa: Assotsiatsiya "moslab yozilgan" TT lardan şikoyat qilgan (anhor.uz); şuning uçun sörovimiz pilot uçun taniştiruv. Butun tizimda yiliga ~2 mln lot bor, lekin ularning köpi e-dökon; biz etenderʼni öqiymiz.

## 8. Sörov va yakun (4:30–5:00)

Sizdan uçta narsa söraymiz: biznes model va huquqiy masalalar böyiça mentorlik; pilot uçun tender konsultantlari va iştirokçilar assotsiatsiyasi bilan taniştiruv; va milliy finalga yöllanma, u yerda jonli tahlil va inson tekşiruvi raqamlari bilan çiqamiz. Keyingi qadam: Agentlik bilan pilot. Davlat AI narxni tekşiradi. TenderLens esa kim haqiqatan qatnaşa olişini tekşiradi. Boğça ovqatidan şifoxona bemorlari ovqatigaça, har bir tender hamma uçun oçiq bölsin. Rahmat.

## 9. Zaxira: ikki foydalanuvçi (faqat savol bölsa)

2–3% bir ekspertning bahosi (TenderZone), rasmiy raqam emas va tartib-taomillar haqida. ~2 mln lot butun tizim, asosan e-dökon; biz öqiydigan etenderʼda yiliga taxminan 16 ming savdo. 810-son qarorning özini öqimaganmiz: kamida 10 ta TT özini şu qaror asosida tuzilgan deb yozadi va matni bir xil.

## 10. Zaxira: şablon savollari (faqat savol bölsa)

Faqat söraşsa körsating. Veterinariya sarlavhasi 53 lotda turibdi; ~48 tasi oziq-ovqat emas, bu kalit söz taxmini. 16 tasida veterinariya matni buyurtmaçi izohida takrorlangan, hammasi bitta buyurtmaçi. 53 lotdan 31 tasi ikki buyurtmaçidan, şuning uçun "tizimli" deb aytmang. Köp lotda buyurtmaçi bu sarlavha ostida boşqa narsani baholaydi. Hakam "bu bizning standart mezonimiz" desa: "Töğri, sarlavha tört turdagi mahsulotni birlaştiradi; iştirokçi nimani ilova qilişni bilmaydi. Sarlavhani kim belgilaşini sizdan söramoqçi edik."

## 11. Zaxira: dunyo tajribasi (faqat savol bölsa)

ALICE tejovi yakunlangan auditlardan. Ukraina va Koreya qatorlarini olib taşladik: manbalarini oçolmadik. Qozoğiston böyiça raqam aytmang (781 mlrd tenge vazir bayonoti, tekşirilmagan). "Faqat" va "heç kim" demang: faqat "biz örgangan davlatlar içida".

## 12. Zaxira: yöl xaritasi (faqat savol bölsa)

VMQ 581 ijtimoiy ahamiyatli loyihalar uçun, tanlov iyul va noyabrda, tijorat maqsadida foydalaniş taqiqlangan: bepul qism (yetkazib beruvçiga ogohlantiriş) uçun ariza beramiz, vaʼda qilmaymiz. Engine Claude modellariga yozilgan; davlat modellarida hali sinalmagan.

## 13. Zaxira: skrinşotlar (faqat kerak bölsa)

Faqat demo işlamasa körsating. 1) Bobur lot 525192 ni oçadi: 5,3 mln sömlik 2 ta ajratgiç uçun törtta ISO sertifikati; tavsiya "qatnaşing, lekin avval aniqlik sörang". 2) Davlat paneli: tahlil qilingan lotlar xavf böyiça saralangan. 3) Bot javobi: bu botning javobidan olingan render, Telegram çatining skrinşoti emas. Keyin 4-slaydga öting.

## Hakamlar savollari: tayyor javoblar

### Eng xavfli savollar

| Savol | Halol javob |
|---|---|
| "Hozir mana bu lotni tahlil qiling." (bizniki bölmagan lot) | "Demo 17-noyabr snapşotidan işlaydi: 662 lotdan 156 tasi tahlil qilingan. Sizning lotingiz ular içida bölsa, hozir oçamiz. Yangi lotni jonli tahlil qiliş uçun API kaliti kerak, bu yöl hali sinalmagan." |
| "Uç kunda nima qurdingiz?" | "TenderLens engine, ilova va bot şu uç kunda, 17-noyabr keçqurundan boşlab yozildi; GitHub tarixida körinadi. Tahlillar xakaton davomida Claude modellari bilan olindi." |
| "Aniqligingiz qança? Qança bayroq notöğri?" | "Hozirça inson tasdiqlagan aniqlik raqamimiz yöq va uni öylab topmaymiz. Kafolatimiz: har bir iqtibos hujjatda sözma-söz bor (kod tekşiradi). Tasodifiy 27 TT namunasida 13–14 tasida yuqori yoki örta bayroq çiqdi. Inson tekşiruvi davom etmoqda." |
| "Nomi bor davlat taşkilotlarini ayblayapsiz." | "Heç kimni ayblamaymiz. Ekranda hujjatdan iqtibos va savol turadi; qarorni inson qiladi. Nomlarni yaşiramiz, misollar oçiq eʼlon qilingan lotlardan. Buyurtmaçi eʼlondan oldin özi tekşirib tuzatişi mumkin." |
| "Bu veterinariya mezoni bizning standart röyxatimiz, sementdan veterinariya hujjati söramaydi." | "Töğri: sarlavha tört turdagi mahsulotni birlaştiradi va buyurtmaçilar uning ostida köpinça boşqa narsani baholaydi. Topilmamiz torroq: sarlavha 53 lotda, ~48 tasi oziq-ovqat emas, 16 tasida (bitta buyurtmaçi) veterinariya matni izohda ham bor. Sarlavhani kim belgilaşini sizdan söramoqçi edik." |
| "8 mlrd aylanma 4,8 mlrd lik inşoot uçun örinli-ku." | "Balki, şuning uçun tavsiya 'qatnaşmanğ emas, 'aniqlik söranğ. Faktlar: lot 330,4 mln sömlik loyihalaş işi; talab 24 baravar; mezon 15 ball, ötiş bali 70. Buyurtmaçi asosini yozsa, savol yopiladi." |
| "AI nimaga kerak? Bu qoida bilan topiladi." | "Aylanma misoli uçun qoida yetadi, rozi. Lekin 234 bayroqning 144 tasi TT faylidan: skan, kirill, lotin, rus. 525192 dagi törtta ISO sertifikati skanerlangan TTning 3-betida, transport talablari bölimida; uni qoida topmaydi." |
| "Köp iştirokçi, past narx: bu boğliqlik xolos." | "Ha, boğliqlik. Narx toifalari içida ham tekşirdik: 1 mlrd sömdan yuqori lotlarda 2 iştirokçida 2,6%, 6+ da 21,9%; byudjet va korporativ buyurtmaçilarda ham şunday." |
| "Qonun 2 taklif talab qiladi, sizda 550 ta bitta iştirokçili bitim bor." | "550 ta (2,8%), 438 tasi korporativ. Maydon baholaşdan ötganlarni sanaşi mumkin; aniq bilmaymiz va tekşiramiz. Asosiy raqam bunga boğliq emas: 52,5% bitimda aynan ikki iştirokçi." |
| "Vositangiz yetkazib beruvçiga 'qatnaşmanğ deydi. Bu raqobatni kamaytiradi-ku." | "Yaxşi savol. Asosiy çiqiş 'aniqlik söranğ va tayyor xat (67 lot). 'Qatnaşmanğ 30 lotda çiqadi; uni 'avval sörang, javobga qarab qaror qilinğ ga almaştiriş töğriroq, şuni qilamiz." |
| "Kim foydalanişga yoki tölaşga rozi bölgan?" | "Hali heç kim bilan kelişuv yöq. Şuning uçun sörovimiz: pilot uçun tender konsultantlari va Assotsiatsiya bilan taniştiruv. Narxlar bizning taklifimiz, pilotda sinaladi." |

### Boşqa savollar

| Savol | Javob |
|---|---|
| "Vazirlik va Agentlik buni noyabrda işga tuşiradi (VMQ 425)." | VMQ 425 xarid buzilişlarini aniqlovçi AI mahsulotini rejalaştirgan; işga tuşgani haqida xabar topmadik va u TT matnini öqişi aytilmagan. TenderLens TTni eʼlondan oldin öqiydi va yetkazib beruvçiga tayyor sörov xatini beradi: töldiruvçi, ulanişga tayyor. |
| "PF-259 özi avtomatik xavf aniqlaşni talab qiladi." | Ha, 16-band. Biz aynan şu sahifaga tayyor qatlam taklif qilamiz: narx moduli narxni köradi, biz matnni. |
| "Davlatda xarid AI allaqaçon bor." | Ha: örtaça bozor narxi moduli narxni tekşiradi; e-dökon takliflarining 75% i sunʼiy intellekt orqali tekşiriladi (Agentlik, 30.10.2026). Özbekistonda TTdagi çeklovçi şartni iqtibos bilan belgilaydigan işlayotgan vositani topmadik. |
| "TenderAI (tenderai.uz) dan farqi nima?" | TenderAI hujjatni tarjima qiladi, tasniflaydi va xulosa beradi. TenderLens çeklovçi şartni sözma-söz iqtibos bilan belgilaydi, ball beradi va sörov xatini yozadi. |
| "Rossiyada SentinelTender bor-ku." | Ha, u rus tilidagi TT uçun. Biz özbek (kirill va lotin) va rus tilidagi TTni, UZEX mezonlar formasini va buyurtmaçi tarixini birga öqiymiz; davlat paneli ham bor. |
| "UZEX 7–8 noyabrda AI xakaton ötkazdi. Bu loyiha öşa yerda bölganmi?" | Yöq. TenderLens şu xakatonda, 17-noyabrdan boşlab qurildi. |
| "TTni ekspertlar allaqaçon köradi." | Baʼzi xaridlar uçun ha. Lekin etenderʼda yiliga ~16 ming savdo bor; ekspert bahosiga köra atigi 2–3% qölda tahlil qilinadi. TenderLens ekspertlarga qaysi TTni öqişni tanlab beradi. |
| "Maʼlumotni oliş qonuniymi? Maʼlumot qayerda qayta işlanadi?" | Login talab qilmaydigan oçiq sahifalar, sekin sörovlar, hammasi keşda; aloqa şaxslarining ismlarini saqlamaymiz. Ballar ommaga çiqarilmaydi, demo yopiq. Huquqiy xulosa pilotdan oldin olinadi; işlab çiqarişda rasmiy oqim söraymiz. |
| "LLM özbek kirill matnida xato qiladi." | Çeklangan ajratiş va majburiy sözma-söz iqtibos, kod tekşiradi. Bu iqtibos borligini kafolatlaydi; xulosani inson tekşiradi. Inson tekşiruvi davom etmoqda. |
| "Skan va arxivlar-çi?" | 662 TTdan 141 tasi skan va hali öqilmagan; OCR keyingi qadam. RAR arxivlar uçun alohida dastur kerak. |
| "Bayroqlarning uçdan biri 'boşqa' turida. Taksonomiyangiz nimaga arziydi?" | Töqqiz nomli tur bor; qolganini majburan tiqmaymiz. Inson tekşiruvidan keyin turlarni kengaytiramiz. |
| "Buyurtmaçi nega foydalanadi?" | PF-259 buyurtmaçilar KPI reytingini kiritadi. Eʼlondan oldin tekşiriş reytingni himoya qiladi va şikoyatlarni kamaytiradi. |
| "Skan va mezonlar formasi farqi?" | 234 bayroqning 144 tasi TT faylidan, 90 tasi platforma mezonlari formasidan. |
