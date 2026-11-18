# TenderLens: maʼruzaçi eslatmalari (speaker notes)

> Bu fayl `deck/build/build_deck.js` tomonidan slayd eslatmalari bilan **bir xil matndan** yaratiladi. Özgartiriş uçun skriptni tahrirlang va qayta işga tuşiring: `node deck/build/build_deck.js` (tenderlens papkasidan; yangi alifbo uçun `--alphabet yangi` qöşing).
> Vaqt 5 daqiqalik çiqişga möljallangan (taxmin, haqiqiy slot uzunligini tekşiring); 90 soniyalik demo, `demo-script.md`.
> Placeholderʼlar: 6-slayd (baholaş raqamlari).
> Söz qoidasi (CONTRACT.md): faqat "adolatsiz şartlar" yoki "çeklovçi talablar" deng.

## 1. Hook: 8 647 (0:00–0:30)

2025-yilda Raqobat qömitasi 23 mingdan ortiq davlat xaridi tartib-taomilini tahlil qildi va 16 100 tasida 28 300 ta raqobatga qarşi harakat topdi. Ulardan 8 647 tasi, muayyan iştirokçilarga imtiyoz yaratiş holatlari. Bunday imtiyoz texnik topşiriq yoki baholaş mezoniga yozilişi mumkin, va uni heç kim öqib ulgurmaydi. Biz TenderLens'ni qurdik: u texnik topşiriqni öqiydi va bitta iştirokçiga moslab yozilgan şartni sözma-söz iqtibos bilan körsatadi.

Eslatma: 8 647, 28 300 ning bir qismi, ularni qöşmang. Faqat "adolatsiz şartlar" yoki "çeklovçi talablar" deng (CONTRACT.md dagi söz qoidasi).

## 2. Raqobat va narx (0:30–0:55)

Bu öz hisobimiz, UZEX oçiq API'sidagi 19 980 ta bitim, 21.08.2025–17.11.2026. Ikki iştirokçi bölsa, narx boşlanğiç narxdan atigi 2,4% tuşadi. Tört iştirokçida, 16,0%, olti va undan köpida, 29,6%. Bitimlarning 52,5% ida aynan ikki iştirokçi bölgan, bu qonun talab qiladigan minimum: ZRU-684 böyiça tanlov va tender kamida ikki taklif bölsagina ötgan hisoblanadi. Bu boğliqlik, sabab emas, lotlar har xil. Lekin yönaliş aniq: har bir qöşimça halol iştirokçi, byudjet uçun tejaş.

Manba: raqamlar engine'ning data/cache/stats.json faylidan (deck, ilova va pitch uçun yagona manba). ZRU-684, lex.uz (eng yaxşi takliflarni tanlaş va tender böyiça moddalar; sahnada modda raqamini aytmang).

## 3. Ikki foydalanuvçi (0:55–1:20)

TenderLens ikki kişi uçun. Bobur, kiçik loyihalaş firmasi egasi. Texnik topşiriq 2 betdan 88 betgaça, kirill, lotin yoki rus tilida böladi, u qaysi tenderda yutişi mumkinligini bilmaydi. Ikkinçisi, Sanoat kooperatsiyasi va davlat xaridlari agentligi tahlilçisi: yiliga taxminan 2 million lot, ekspert bahosiga köra atigi 2–3% qölda tahlil qilinadi. TenderLens unga nafaqat lotlarni, balki şablon xatolarini ham körsatadi: bitta mezon önlab lotda takrorlanadi. Va bu bolalar haqida ham: boğçalarda issiq ovqat lotlaridagi bayroqlar VMQ 810 milliy namunaviy hujjatidan keladi, 3 oylik şartnoma summasiga teng aylanma mablağ va 3 oylik oziq-ovqat zaxirasi. Bitta namunani tuzatsak, barça boğça lotlari tuzaladi.

Diqqat: bu şartlarni buyurtmaçi, boğça, öylab topmagan, ular milliy namunadan keladi; heç kimni ayblamang. 2–3% rasmiy raqam emas, ekspert bahosi.

## 4. Jonli demo (1:20–2:50)

Töliq skript: deck/demo-script.md. Demo oflayn keşdan işlaydi (lotlar 18-noyabrda yopiladi).
1) Bobur 524954 lot raqamini kiritadi (suv omboridagi inşoot uçun işçi loyiha, 330,4 mln söm). 2) TenderLens texnik topşiriq va platforma mezonlarini öqiydi. 3) Bayroq: 4-mezon örtaça yillik aylanma kamida 8 mlrd söm talab qiladi, lotdan ≈24 baravar köp. 4) Tavsiya: "Qatnaşing, lekin avval aniqlik sörang", bir tugma bilan sörov xati. 5) Davlat nazorati paneli: 156 ta tahlil qilingan lot (662 oçiq lotdan) xavf böyiça saralangan; tepada şablon topilmalari (veterinariya mezoni 53 lotda). 6) Telegram: Quarry kuzatadi, TenderLens baholaydi, birinçi haqiqiy ogohlantiriş allaqaçon yuborilgan.

Heç qaçon "662 lotning hammasi baholandi" demang, faqat tahlil qilinganlar soni. Buyurtmaçi nomlarini körsatmang (ilovaning taqdimot rejimi).
Agar ilova işlamasa: 12-slayd (Zaxira), statik skrinşotlar. Heç qaçon qölda tekşirilmagan bayroqni körsatmang.

## 5. Qanday işlaydi (2:50–3:20)

TenderLens UZEX oçiq API'sidan lotni, texnik topşiriq faylini va platformadagi baholaş mezonlarini oladi. Skan yoki aralaş yozuvli fayllarni OCR va vision model öqiydi. LLM har bir talabni sözma-söz iqtibos bilan ajratadi; iqtibos hujjatda topilmasa, bayroq öçiriladi. Keyin 9 turdagi çeklovçi talab taksonomiyasi va buyurtmaçining tarixi (iştirokçilar medianasi, takroriy ğolib) qöşiladi. Statistika va yakuniy ball, oddiy, tekşiriladigan qoidalar: bu ataylab. Quarry 660 dan ortiq lotni uzluksiz kuzatadi, TenderLens har birini baholaydi, yetkazib beruvçi Telegramda adolat verdikti bilan ogohlantiriş oladi.

"Bu şunçaki qoidalar + chatbot" desa: qiyin qismi, 2–88 betlik, uç yozuvdagi TTni minglab lotlar böyiça öqiş, aynan AI.

## 6. Isbot (3:20–3:45)

Asosiy misol, lot 524954: suv omboridagi inşoot uçun işçi loyiha, 330,4 million söm. Platformadagi 4-mezon, moliyaviy barqarorlik, 15 ball: sönggi 3 yil uçun örtaça yillik aylanma kamida 8 milliard söm. Bu lot narxidan taxminan 24 baravar köp. Ötiş bali 70: bu 15 ballni ololmagan kiçik loyihalaş firmasi qolgan 85 balldan 70 tasini olişi şart. Tavsiya: avval aniqlik sörang. 525192, 5,3 million sömlik ikkita ajratgiç uçun törtta ISO sertifikati. 524769, yuqumli kasalliklar şifoxonasi bemorlarining ovqati, 445 million söm: bank hisobida şartnoma summasining 40 foizi turişi kerak. Bu kiçik oşxonalar uçun oğir şart, va bu bemorlar ovqati. Davlat uçun tizimli topilma: bitta platforma şabloni mezoni 53 ta oçiq lotda veterinariya hujjatini söraydi, taxminan 48 tasi oziq-ovqat yoki hayvon mahsuloti emas, dolota, sement. Xodimlarni öqitiş mezoni 184 ta, intellektual mulkni topşiriş 163 ta lotda. Şablonni bir marta tuzatsangiz, barça lotlar tuzaladi. Çapda, qölda belgilangan texnik topşiriqlardagi natijamiz: [PLACEHOLDER: recall %], bitta TTga [PLACEHOLDER: yolğon signal], [PLACEHOLDER: N] ta TT.

Buyurtmaçi nomlarini aytmang, biz şartni körsatamiz, taşkilotni emas. Hammasi maslahat, ayblov emas; qaror inson ixtiyorida. Bu bayroqlarni hali inson tasdiqlamagan (hero_check.md). Veterinariya mezoni matni tört turdagi mahsulotni birlaştiradi; "~48", kalit sözlar böyiça taxmin.

## 7. Miqyos: Quarry (3:45–4:05)

TenderLens bitta saytga boğlanib qolmagan. Jamoadoşimizning Quarry dvigateli bugun uçta saytni jonli öqiydi, ulardan ikkitasi mustaqil tender platformasi: UZEX etender, 662 ta oçiq lotning hammasi, har biri texnik topşiriq havolasi bilan, 245 soniyada; UZTender, 100 lotlik namuna 76 soniyada, har birida nom, buyurtmaçi va narx. Uçinçisi davlat xaridlari portali xarid.icppa.uz: u UZEX tenderlarini qayta eʼlon qiladi, 20 lotlik jonli namuna olindi. Diqqat: "uçta platforma" demang. Töğri ibora: "uçta sayt, ikkita mustaqil tender platformasi". Yangi platforma qöşiş, bitta deklarativ retsept fayli (JSON), dvigatel kodi özgarmaydi. Har bir yiğiş eʼlondan oldin sifat tekşiruvidan ötadi. Mos lotlar Telegram ogohlantirişi sifatida ketadi, tepasida TenderLens verdikti, ikkita haqiqiy ogohlantiriş allaqaçon yuborilgan: 522893 va 524784.

Halol böling: UZTenderʼda hujjat fayllari faqat Pro akkaunt bilan oçiladi, şuning uçun TenderLens hozir texnik topşiriqni UZEX'da öqiydi, UZTender va davlat portalidan esa lot maʼlumotini yiğadi. Davlat portali sekin javob beradi (sörovga ~4 soniya). "AI yangi sayt uçun retseptni özi yozadi" demang, bu hali jonli sinalmagan (kalit yöq). Agar jonli sinov muvaffaqiyatli bölsa, şu qatorni qöşiş mumkin.

## 8. Nega hozir (4:05–4:20)

Uçta sabab. Birinçi: Prezidentning PF-259 Farmoni 2030-yilgaça tadbirkorlar iştirokini 35% dan 70% ga, raqobatli xaridlar uluşini 58% dan 80% ga oşirişni talab qiladi, monitoring sahifasi va buyurtmaçilar KPI reytingi bilan. Ikkinçi: 2026-yil fevralda yangi Sanoat kooperatsiyasi va davlat xaridlari agentligi tuzildi. Uçinçi: Prezident 2026-yilda kamida 100 ta tarmoq AI loyihasini talab qildi. Davlat AI allaqaçon narxni tekşiradi, e-dökon takliflarining 75% i. Ammo texnik topşiriq matnini öqiydigan avtomatik vositani topmadik. Biz, şu yetişmayotgan qatlam.

Agentlik tuzilgan yil (2026) manbada bilvosita; "fevral" deb ayting, kun aytmang.

## 9. Dunyo tajribasi (4:20–4:35)

Braziliyaning ALICE roboti tender hujjatlarini avtomatik öqiydi: 2024-yilda 118 069 ta xarid jarayoni tahlil qilingan va 257 million real tejalgan. Ukrainadan saboq: tejaş şartnoma imzolanişidan oldin tuzatişdan keladi, bizning sörov xatimiz şu. Qozoğiston ğolibni avtomatik tanlaydi va 2025-yilning 9 oyida 781 milliard tenge tejaganini aytadi, lekin bitta yetkazib beruvçiga yozilgan TT baribir yutadi. Koreya faqat yirik şartnomalarni tekşirgan, biz har bir lotni tekşiramiz. Heç kim bu vositani yetkazib beruvçilarga bermagan.

Ukraina va Koreya böyiça raqam aytmang, manbalar tekşirilmagan (R).

## 10. Biznes model (4:35–4:50)

Yetkazib beruvçilar uçun, bepul ogohlantirişlar va pullik çuqur tekşiruv, Davlat xaridlari iştirokçilari assotsiatsiyasi orqali. Davlat uçun, Agentlik va Raqobat qömitasiga litsenziya yoki API. Konsultantlar uçun, köp lotli tarif. Yöl xaritasi: bugun oflayn keşdan işlaydigan demo, 662 oçiq lotdan tahlil qilinganlari; keyin Agentlik va Assotsiatsiya bilan pilot; Vazirlar Mahkamasining 581-son qarori böyiça davlat AI infratuzilmasi, 6 oygaça bepul LLM API; söng Agentlik bilan rasmiy maʼlumot oqimi.

Narx sörasa: aniq tarif hali yöq, pilotda aniqlaymiz. Öylab topilgan raqam aytmang.

## 11. Sörov va yakun (4:50–5:00)

Bizga uçta narsa kerak: Agentlik bilan pilot, PF-259 Farmoni talab qilgan monitoring uçun; Davlat xaridlari iştirokçilari assotsiatsiyasi orqali kiçik yetkazib beruvçilarga tarqatiş; va 581-son qaror böyiça davlat AI infratuzilmasi. Davlat AI narxni tekşiradi. TenderLens esa kim haqiqatan qatnaşa olişini tekşiradi. Boğça ovqatidan bolalar şifoxonasigaça, har bir tender hamma uçun oçiq bölsin. PF-259 Farmoni tadbirkorlar iştirokini 35% dan 70% ga oşirmoqçi, mana, qanday qilib. Rahmat.

## 12. Zaxira (faqat kerak bölsa)

Faqat jonli demo işlamasa körsating. Har bir skrinşot böyiça demo skriptidagi sözlarni ayting: 1) Bobur lot 524954 ni oçadi, aylanma talabi 8 mlrd söm, lot 330,4 mln söm (≈24 baravar); tavsiya "qatnaşing, lekin avval aniqlik sörang"; 2) Davlat nazorati paneli, tahlil qilingan lotlar xavf böyiça saralangan, tepada şablon topilmalari; 3) Telegram, Quarry kuzatadi, TenderLens baholaydi, yetkazib beruvçi ogohlantiriş oladi. Keyin 5-slaydga (Qanday işlaydi) öting.

## Hakamlar savollari: tayyor javoblar

| Savol | Javob |
|---|---|
| "Buyurtmaçilarni nohaq ayblaysiz." | Bu maslahat beruvçi tekşiruv, ayblov emas. Har bir bayroq bandni sözma-söz keltiradi va Raqobat qömitasining öz toifasini körsatadi. Qarorni inson qiladi; buyurtmaçi bandni eʼlondan *oldin* tuzatişi mumkin. Yolğon signal darajasini körsating (6-slayd). |
| "Davlatda xarid AI allaqaçon bor." | U **narxni** tekşiradi (örtaça bozor narxi moduli) va **e-dökon takliflarini** (75%), arizalarni avtomatik moderatsiya qiladi. Yetkazib beruvçilar moderatsiya sababsiz rad etişidan şikoyat qiladi, TenderLens'ning har bir bayroği izohlangan va iqtibosli. TT matnini öqiydigan avtomatik vositani topmadik; xavf tahlili markazi hali "rejalaştirilgan". |
| "TTni ekspertlar allaqaçon köradi." | Baʼzi xaridlar uçun ha (ekspertiza xulosasi). Lekin bu yuz minglab lotga yetmaydi: ekspert bahosiga köra atigi 2–3% qölda tahlil qilinadi. TenderLens ekspertlarga töğri 2–3% ni tanlab beradi. |
| "Maʼlumotni oliş qonuniymi?" | Login talab qilmaydigan oçiq sahifalar, sayt özi qiladigan sörovlar; keşlaymiz va sekin söraymiz. Işlab çiqarişda Agentlikdan rasmiy oqim yoki OCDS söraymiz. |
| "LLM özbek kirill matnida xato qiladi." | Çeklangan ajratiş + majburiy sözma-söz iqtibos, satr böyiça tekşiriladi. Iqtibos mos kelmasa, bayroq yöq. Baholaş raqamlari 6-slaydda. |
| "Bitta veterinariya mezoni, katta gapmi?" | Bu tizimli topilma: bitta platforma şabloni mezoni 53 oçiq lotda turibdi, kalit sözlar böyiça taxminan 48 tasi oziq-ovqat emas (dolota, sement). Mezon matni bir neçta sertifikat turini birlaştiradi, şuning uçun ball yöqotilişi komissiyaga boğliq. Şablonni bir marta tuzatiş hammasini tuzatadi, Agentlik uçun eng arzon yutuq. |
| "Bu şunçaki qoidalar + chatbot." | Statistika ataylab qoidalar, tekşiriladigan bölişi kerak. Qiyin qismi, 2–88 betlik, uç yozuvdagi TTni minglab lotlar böyiça öqiş, AI. |
| "Buyurtmaçi nega foydalanadi?" | PF-259 Farmoni buyurtmaçilar KPI reytingini kiritadi. Eʼlondan oldin tekşiriş reytingni himoya qiladi va şikoyatlarni kamaytiradi. |
| "Kim tölaydi?" | Yetkazib beruvçilar: bepul ogohlantiriş, pullik çuqur tekşiruv (Assotsiatsiya orqali). Davlat: Agentlik va Raqobat qömitasi uçun litsenziya/API. Konsultantlar: köp lotli tarif. Aniq narx, pilotdan keyin. |
| "Faqat 2 iştirokçi, qonuniy minimum emasmi?" | Ha. ZRU-684 böyiça eng yaxşi takliflarni tanlaş va tender kamida 2 taklif bölsagina ötgan hisoblanadi. Demak, bitimlarning yarmidan köpi raqobatning qonuniy minimumida ötmoqda, aynan şu yerda adolatsiz şart hal qiluvçi böladi. |
| "Skan va arxivlar-çi?" | OCR/vision asosiy yölda: namunada skanlar va buzilgan matn qatlami uçraydi. Arxivlar oçiladi; demoda ötkazib yuboriladi. |
| "TenderGPT / TenderZone şuni qilmaydimi?" | TenderGPT, korporativ savdo platformasi, TenderZone, pullik agregator. Topganimizça, ikkalasi ham TTni çeklovçi bandlar uçun öqimaydi. |
| "Quarry nima?" | Jamoadoşimizning tender kuzatuv platformasi: 660+ lotni uzluksiz kuzatadi. TenderLens har bir lotni baholaydi, Quarry esa yetkazib beruvçiga Telegramda verdikt bilan ogohlantiriş yuboradi. |
