# TenderLens: ma'ruzachi eslatmalari (speaker notes)

> Bu fayl `deck/build/build_deck.js` tomonidan slayd eslatmalari bilan **bir xil matndan** yaratiladi. O'zgartirish uchun skriptni tahrirlang va qayta ishga tushiring: `node deck/build/build_deck.js` (tenderlens papkasidan; yangi alifbo uchun `--alphabet yangi` qo'shing).
> Vaqt 5 daqiqalik chiqishga mo'ljallangan (taxmin, haqiqiy slot uzunligini tekshiring); 90 soniyalik demo, `demo-script.md`.
> Placeholder'lar: 6-slayd (baholash raqamlari).
> So'z qoidasi (CONTRACT.md): faqat "adolatsiz shartlar" yoki "cheklovchi talablar" deng.

## 1. Hook: 8 647 (0:00–0:30)

2025-yilda Raqobat qo'mitasi 23 mingdan ortiq davlat xaridi tartib-taomilini tahlil qildi va 16 100 tasida 28 300 ta raqobatga qarshi harakat topdi. Ulardan 8 647 tasi, muayyan ishtirokchilarga imtiyoz yaratish holatlari. Bunday imtiyoz texnik topshiriq yoki baholash mezoniga yozilishi mumkin, va uni hech kim o'qib ulgurmaydi. Biz TenderLens'ni qurdik: u texnik topshiriqni o'qiydi va bitta ishtirokchiga moslab yozilgan shartni so'zma-so'z iqtibos bilan ko'rsatadi.

Eslatma: 8 647, 28 300 ning bir qismi, ularni qo'shmang. Faqat "adolatsiz shartlar" yoki "cheklovchi talablar" deng (CONTRACT.md dagi so'z qoidasi).

## 2. Raqobat va narx (0:30–0:55)

Bu o'z hisobimiz, UZEX ochiq API'sidagi 19 980 ta bitim, 21.08.2025–17.11.2026. Ikki ishtirokchi bo'lsa, narx boshlang'ich narxdan atigi 2,4% tushadi. To'rt ishtirokchida, 16,0%, olti va undan ko'pida, 29,6%. Bitimlarning 52,5% ida aynan ikki ishtirokchi bo'lgan, bu qonun talab qiladigan minimum: ZRU-684 bo'yicha tanlov va tender kamida ikki taklif bo'lsagina o'tgan hisoblanadi. Bu bog'liqlik, sabab emas, lotlar har xil. Lekin yo'nalish aniq: har bir qo'shimcha halol ishtirokchi, byudjet uchun tejash.

Manba: raqamlar engine'ning data/cache/stats.json faylidan (deck, ilova va pitch uchun yagona manba). ZRU-684, lex.uz (eng yaxshi takliflarni tanlash va tender bo'yicha moddalar; sahnada modda raqamini aytmang).

## 3. Ikki foydalanuvchi (0:55–1:20)

TenderLens ikki kishi uchun. Bobur, kichik loyihalash firmasi egasi. Texnik topshiriq 2 betdan 88 betgacha, kirill, lotin yoki rus tilida bo'ladi, u qaysi tenderda yutishi mumkinligini bilmaydi. Ikkinchisi, Sanoat kooperatsiyasi va davlat xaridlari agentligi tahlilchisi: yiliga taxminan 2 million lot, ekspert bahosiga ko'ra atigi 2–3% qo'lda tahlil qilinadi. TenderLens unga nafaqat lotlarni, balki shablon xatolarini ham ko'rsatadi: bitta mezon o'nlab lotda takrorlanadi. Va bu bolalar haqida ham: bog'chalarda issiq ovqat lotlaridagi bayroqlar VMQ 810 milliy namunaviy hujjatidan keladi, 3 oylik shartnoma summasiga teng aylanma mablag' va 3 oylik oziq-ovqat zaxirasi. Bitta namunani tuzatsak, barcha bog'cha lotlari tuzaladi.

Diqqat: bu shartlarni buyurtmachi, bog'cha, o'ylab topmagan, ular milliy namunadan keladi; hech kimni ayblamang. 2–3% rasmiy raqam emas, ekspert bahosi.

## 4. Jonli demo (1:20–2:50)

To'liq skript: deck/demo-script.md. Demo oflayn keshdan ishlaydi (lotlar 18-noyabrda yopiladi).
1) Bobur 524954 lot raqamini kiritadi (suv omboridagi inshoot uchun ishchi loyiha, 330,4 mln so'm). 2) TenderLens texnik topshiriq va platforma mezonlarini o'qiydi. 3) Bayroq: 4-mezon o'rtacha yillik aylanma kamida 8 mlrd so'm talab qiladi, lotdan ≈24 baravar ko'p. 4) Tavsiya: "Qatnashing, lekin avval aniqlik so'rang", bir tugma bilan so'rov xati. 5) Davlat nazorati paneli: 156 ta tahlil qilingan lot (662 ochiq lotdan) xavf bo'yicha saralangan; tepada shablon topilmalari (veterinariya mezoni 53 lotda). 6) Telegram: Quarry kuzatadi, TenderLens baholaydi, birinchi haqiqiy ogohlantirish allaqachon yuborilgan.

Hech qachon "662 lotning hammasi baholandi" demang, faqat tahlil qilinganlar soni. Buyurtmachi nomlarini ko'rsatmang (ilovaning taqdimot rejimi).
Agar ilova ishlamasa: 12-slayd (Zaxira), statik skrinshotlar. Hech qachon qo'lda tekshirilmagan bayroqni ko'rsatmang.

## 5. Qanday ishlaydi (2:50–3:20)

TenderLens UZEX ochiq API'sidan lotni, texnik topshiriq faylini va platformadagi baholash mezonlarini oladi. Skan yoki aralash yozuvli fayllarni OCR va vision model o'qiydi. LLM har bir talabni so'zma-so'z iqtibos bilan ajratadi; iqtibos hujjatda topilmasa, bayroq o'chiriladi. Keyin 9 turdagi cheklovchi talab taksonomiyasi va buyurtmachining tarixi (ishtirokchilar medianasi, takroriy g'olib) qo'shiladi. Statistika va yakuniy ball, oddiy, tekshiriladigan qoidalar: bu ataylab. Quarry 660 dan ortiq lotni uzluksiz kuzatadi, TenderLens har birini baholaydi, yetkazib beruvchi Telegramda adolat verdikti bilan ogohlantirish oladi.

"Bu shunchaki qoidalar + chatbot" desa: qiyin qismi, 2–88 betlik, uch yozuvdagi TTni minglab lotlar bo'yicha o'qish, aynan AI.

## 6. Isbot (3:20–3:45)

Asosiy misol, lot 524954: suv omboridagi inshoot uchun ishchi loyiha, 330,4 million so'm. Platformadagi 4-mezon, moliyaviy barqarorlik, 15 ball: so'nggi 3 yil uchun o'rtacha yillik aylanma kamida 8 milliard so'm. Bu lot narxidan taxminan 24 baravar ko'p. O'tish bali 70: bu 15 ballni ololmagan kichik loyihalash firmasi qolgan 85 balldan 70 tasini olishi shart. Tavsiya: avval aniqlik so'rang. 525192, 5,3 million so'mlik ikkita ajratgich uchun to'rtta ISO sertifikati. 524769, yuqumli kasalliklar shifoxonasi bemorlarining ovqati, 445 million so'm: bank hisobida shartnoma summasining 40 foizi turishi kerak. Bu kichik oshxonalar uchun og'ir shart, va bu bemorlar ovqati. Davlat uchun tizimli topilma: bitta platforma shabloni mezoni 53 ta ochiq lotda veterinariya hujjatini so'raydi, taxminan 48 tasi oziq-ovqat yoki hayvon mahsuloti emas, dolota, sement. Xodimlarni o'qitish mezoni 184 ta, intellektual mulkni topshirish 163 ta lotda. Shablonni bir marta tuzatsangiz, barcha lotlar tuzaladi. Chapda, qo'lda belgilangan texnik topshiriqlardagi natijamiz: [PLACEHOLDER: recall %], bitta TTga [PLACEHOLDER: yolg'on signal], [PLACEHOLDER: N] ta TT.

Buyurtmachi nomlarini aytmang, biz shartni ko'rsatamiz, tashkilotni emas. Hammasi maslahat, ayblov emas; qaror inson ixtiyorida. Bu bayroqlarni hali inson tasdiqlamagan (hero_check.md). Veterinariya mezoni matni to'rt turdagi mahsulotni birlashtiradi; "~48", kalit so'zlar bo'yicha taxmin.

## 7. Miqyos: Quarry (3:45–4:05)

TenderLens bitta saytga bog'lanib qolmagan. Jamoadoshimizning Quarry dvigateli bugun uchta saytni jonli o'qiydi, ulardan ikkitasi mustaqil tender platformasi: UZEX etender, 662 ta ochiq lotning hammasi, har biri texnik topshiriq havolasi bilan, 245 soniyada; UZTender, 100 lotlik namuna 76 soniyada, har birida nom, buyurtmachi va narx. Uchinchisi davlat xaridlari portali xarid.icppa.uz: u UZEX tenderlarini qayta e'lon qiladi, 20 lotlik jonli namuna olindi. Diqqat: "uchta platforma" demang. To'g'ri ibora: "uchta sayt, ikkita mustaqil tender platformasi". Yangi platforma qo'shish, bitta deklarativ retsept fayli (JSON), dvigatel kodi o'zgarmaydi. Har bir yig'ish e'londan oldin sifat tekshiruvidan o'tadi. Mos lotlar Telegram ogohlantirishi sifatida ketadi, tepasida TenderLens verdikti, ikkita haqiqiy ogohlantirish allaqachon yuborilgan: 522893 va 524784.

Halol bo'ling: UZTender'da hujjat fayllari faqat Pro akkaunt bilan ochiladi, shuning uchun TenderLens hozir texnik topshiriqni UZEX'da o'qiydi, UZTender va davlat portalidan esa lot ma'lumotini yig'adi. Davlat portali sekin javob beradi (so'rovga ~4 soniya). "AI yangi sayt uchun retseptni o'zi yozadi" demang, bu hali jonli sinalmagan (kalit yo'q). Agar jonli sinov muvaffaqiyatli bo'lsa, shu qatorni qo'shish mumkin.

## 8. Nega hozir (4:05–4:20)

Uchta sabab. Birinchi: Prezidentning PF-259 Farmoni 2030-yilgacha tadbirkorlar ishtirokini 35% dan 70% ga, raqobatli xaridlar ulushini 58% dan 80% ga oshirishni talab qiladi, monitoring sahifasi va buyurtmachilar KPI reytingi bilan. Ikkinchi: 2026-yil fevralda yangi Sanoat kooperatsiyasi va davlat xaridlari agentligi tuzildi. Uchinchi: Prezident 2026-yilda kamida 100 ta tarmoq AI loyihasini talab qildi. Davlat AI allaqachon narxni tekshiradi, e-do'kon takliflarining 75% i. Ammo texnik topshiriq matnini o'qiydigan avtomatik vositani topmadik. Biz, shu yetishmayotgan qatlam.

Agentlik tuzilgan yil (2026) manbada bilvosita; "fevral" deb ayting, kun aytmang.

## 9. Dunyo tajribasi (4:20–4:35)

Braziliyaning ALICE roboti tender hujjatlarini avtomatik o'qiydi: 2024-yilda 118 069 ta xarid jarayoni tahlil qilingan va 257 million real tejalgan. Ukrainadan saboq: tejash shartnoma imzolanishidan oldin tuzatishdan keladi, bizning so'rov xatimiz shu. Qozog'iston g'olibni avtomatik tanlaydi va 2025-yilning 9 oyida 781 milliard tenge tejaganini aytadi, lekin bitta yetkazib beruvchiga yozilgan TT baribir yutadi. Koreya faqat yirik shartnomalarni tekshirgan, biz har bir lotni tekshiramiz. Hech kim bu vositani yetkazib beruvchilarga bermagan.

Ukraina va Koreya bo'yicha raqam aytmang, manbalar tekshirilmagan (R).

## 10. Biznes model (4:35–4:50)

Yetkazib beruvchilar uchun, bepul ogohlantirishlar va pullik chuqur tekshiruv, Davlat xaridlari ishtirokchilari assotsiatsiyasi orqali. Davlat uchun, Agentlik va Raqobat qo'mitasiga litsenziya yoki API. Konsultantlar uchun, ko'p lotli tarif. Yo'l xaritasi: bugun oflayn keshdan ishlaydigan demo, 662 ochiq lotdan tahlil qilinganlari; keyin Agentlik va Assotsiatsiya bilan pilot; Vazirlar Mahkamasining 581-son qarori bo'yicha davlat AI infratuzilmasi, 6 oygacha bepul LLM API; so'ng Agentlik bilan rasmiy ma'lumot oqimi.

Narx so'rasa: aniq tarif hali yo'q, pilotda aniqlaymiz. O'ylab topilgan raqam aytmang.

## 11. So'rov va yakun (4:50–5:00)

Bizga uchta narsa kerak: Agentlik bilan pilot, PF-259 Farmoni talab qilgan monitoring uchun; Davlat xaridlari ishtirokchilari assotsiatsiyasi orqali kichik yetkazib beruvchilarga tarqatish; va 581-son qaror bo'yicha davlat AI infratuzilmasi. Davlat AI narxni tekshiradi. TenderLens esa kim haqiqatan qatnasha olishini tekshiradi. Bog'cha ovqatidan bolalar shifoxonasigacha, har bir tender hamma uchun ochiq bo'lsin. PF-259 Farmoni tadbirkorlar ishtirokini 35% dan 70% ga oshirmoqchi, mana, qanday qilib. Rahmat.

## 12. Zaxira (faqat kerak bo'lsa)

Faqat jonli demo ishlamasa ko'rsating. Har bir skrinshot bo'yicha demo skriptidagi so'zlarni ayting: 1) Bobur lot 524954 ni ochadi, aylanma talabi 8 mlrd so'm, lot 330,4 mln so'm (≈24 baravar); tavsiya "qatnashing, lekin avval aniqlik so'rang"; 2) Davlat nazorati paneli, tahlil qilingan lotlar xavf bo'yicha saralangan, tepada shablon topilmalari; 3) Telegram, Quarry kuzatadi, TenderLens baholaydi, yetkazib beruvchi ogohlantirish oladi. Keyin 5-slaydga (Qanday ishlaydi) o'ting.

## Hakamlar savollari: tayyor javoblar

| Savol | Javob |
|---|---|
| "Buyurtmachilarni nohaq ayblaysiz." | Bu maslahat beruvchi tekshiruv, ayblov emas. Har bir bayroq bandni so'zma-so'z keltiradi va Raqobat qo'mitasining o'z toifasini ko'rsatadi. Qarorni inson qiladi; buyurtmachi bandni e'londan *oldin* tuzatishi mumkin. Yolg'on signal darajasini ko'rsating (6-slayd). |
| "Davlatda xarid AI allaqachon bor." | U **narxni** tekshiradi (o'rtacha bozor narxi moduli) va **e-do'kon takliflarini** (75%), arizalarni avtomatik moderatsiya qiladi. Yetkazib beruvchilar moderatsiya sababsiz rad etishidan shikoyat qiladi, TenderLens'ning har bir bayrog'i izohlangan va iqtibosli. TT matnini o'qiydigan avtomatik vositani topmadik; xavf tahlili markazi hali "rejalashtirilgan". |
| "TTni ekspertlar allaqachon ko'radi." | Ba'zi xaridlar uchun ha (ekspertiza xulosasi). Lekin bu yuz minglab lotga yetmaydi: ekspert bahosiga ko'ra atigi 2–3% qo'lda tahlil qilinadi. TenderLens ekspertlarga to'g'ri 2–3% ni tanlab beradi. |
| "Ma'lumotni olish qonuniymi?" | Login talab qilmaydigan ochiq sahifalar, sayt o'zi qiladigan so'rovlar; keshlaymiz va sekin so'raymiz. Ishlab chiqarishda Agentlikdan rasmiy oqim yoki OCDS so'raymiz. |
| "LLM o'zbek kirill matnida xato qiladi." | Cheklangan ajratish + majburiy so'zma-so'z iqtibos, satr bo'yicha tekshiriladi. Iqtibos mos kelmasa, bayroq yo'q. Baholash raqamlari 6-slaydda. |
| "Bitta veterinariya mezoni, katta gapmi?" | Bu tizimli topilma: bitta platforma shabloni mezoni 53 ochiq lotda turibdi, kalit so'zlar bo'yicha taxminan 48 tasi oziq-ovqat emas (dolota, sement). Mezon matni bir nechta sertifikat turini birlashtiradi, shuning uchun ball yo'qotilishi komissiyaga bog'liq. Shablonni bir marta tuzatish hammasini tuzatadi, Agentlik uchun eng arzon yutuq. |
| "Bu shunchaki qoidalar + chatbot." | Statistika ataylab qoidalar, tekshiriladigan bo'lishi kerak. Qiyin qismi, 2–88 betlik, uch yozuvdagi TTni minglab lotlar bo'yicha o'qish, AI. |
| "Buyurtmachi nega foydalanadi?" | PF-259 Farmoni buyurtmachilar KPI reytingini kiritadi. E'londan oldin tekshirish reytingni himoya qiladi va shikoyatlarni kamaytiradi. |
| "Kim to'laydi?" | Yetkazib beruvchilar: bepul ogohlantirish, pullik chuqur tekshiruv (Assotsiatsiya orqali). Davlat: Agentlik va Raqobat qo'mitasi uchun litsenziya/API. Konsultantlar: ko'p lotli tarif. Aniq narx, pilotdan keyin. |
| "Faqat 2 ishtirokchi, qonuniy minimum emasmi?" | Ha. ZRU-684 bo'yicha eng yaxshi takliflarni tanlash va tender kamida 2 taklif bo'lsagina o'tgan hisoblanadi. Demak, bitimlarning yarmidan ko'pi raqobatning qonuniy minimumida o'tmoqda, aynan shu yerda adolatsiz shart hal qiluvchi bo'ladi. |
| "Skan va arxivlar-chi?" | OCR/vision asosiy yo'lda: namunada skanlar va buzilgan matn qatlami uchraydi. Arxivlar ochiladi; demoda o'tkazib yuboriladi. |
| "TenderGPT / TenderZone shuni qilmaydimi?" | TenderGPT, korporativ savdo platformasi, TenderZone, pullik agregator. Topganimizcha, ikkalasi ham TTni cheklovchi bandlar uchun o'qimaydi. |
| "Quarry nima?" | Jamoadoshimizning tender kuzatuv platformasi: 660+ lotni uzluksiz kuzatadi. TenderLens har bir lotni baholaydi, Quarry esa yetkazib beruvchiga Telegramda verdikt bilan ogohlantirish yuboradi. |
