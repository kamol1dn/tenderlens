/* TenderLens UI — vanilla JS, no build step, no external assets. */
(function () {
  "use strict";

  // ---------------------------------------------------------------- utils
  const $ = (sel, el) => (el || document).querySelector(sel);
  const view = $("#view");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

  const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  function fmtDate(iso, withTime) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    let s = `${d.getDate()}-${MONTHS[d.getMonth()]}`;
    if (withTime !== false) s += `, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return s;
  }
  function timeLeft(iso) {
    const ms = new Date(iso) - new Date();
    if (!(ms > 0)) return "";
    const h = Math.floor(ms / 3.6e6);
    if (h >= 48) return `${Math.floor(h / 24)} kun qoldi`;
    if (h >= 1) return `${h} soat qoldi`;
    return `${Math.max(1, Math.floor(ms / 6e4))} daqiqa qoldi`;
  }
  function grp(n, dec) {
    const parts = Number(n).toFixed(dec || 0).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(",");
  }
  // 69243672 -> "69,2 mln so'm"; 1441609049020 -> "1 441,6 mlrd so'm"
  function moneyParts(n, cur) {
    const unit = !cur || cur === "UZS" ? "so'm" : cur;
    const a = Math.abs(n);
    if (a >= 1e13) return { num: grp(n / 1e12, 1), unit: `trln ${unit}` };
    if (a >= 1e9) return { num: grp(n / 1e9, 1), unit: `mlrd ${unit}` };
    if (a >= 1e6) return { num: grp(n / 1e6, 1), unit: `mln ${unit}` };
    return { num: grp(n), unit };
  }
  function money(n, cur) {
    if (n == null || isNaN(n)) return "—";
    const p = moneyParts(n, cur);
    return `${p.num} ${p.unit}`;
  }
  const pct = (x, d) => (x == null ? "—" : `${grp(x * 100, d == null ? 0 : d)}%`);

  // Uzbek/Russian Cyrillic -> Uzbek Latin
  const CYR = { "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "j", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "x", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sh", "ъ": "'", "ы": "i", "ь": "", "э": "e", "ю": "yu", "я": "ya", "ў": "o'", "қ": "q", "ғ": "g'", "ҳ": "h" };
  function translit(s) {
    let out = "";
    const str = String(s || "");
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const lo = ch.toLowerCase();
      let t = CYR[lo];
      if (t === undefined) { out += ch; continue; }
      if (lo === "е") {
        const prev = str[i - 1] || " ";
        if (/[\s"«(\-]/.test(prev) || /[аеёиоуэюяўaeiou]/i.test(prev)) t = "ye";
      }
      if (ch !== lo && t) t = t[0].toUpperCase() + t.slice(1);
      out += t;
    }
    return out;
  }
  const hasCyr = (s) => /[Ѐ-ӿ]/.test(s || "");

  // matching key: latin, lowercase, no apostrophes, OCR/dialect-insensitive (h~x, q~k, g'~g)
  function key(s) {
    return translit(String(s || "").toLowerCase())
      .toLowerCase()
      .replace(/[şș]/g, "sh").replace(/[çč]/g, "ch").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ı/g, "i")
      .replace(/['’‘ʻʼ`´"«»]/g, "")
      .replace(/h/g, "x").replace(/q/g, "k")
      .replace(/[^a-z0-9]+/g, " ").trim();
  }
  // a few Uzbek-Latin words a supplier types -> stems that appear in Cyrillic/Russian titles
  const SYN = {
    "burg": ["долот", "бурен", "бурил", "бурғула", "burgul"],
    "dolot": ["долот"],
    "ovkat": ["овқат", "питан", "taom", "ovqat"],
    "taom": ["овқат", "питан", "taom"],
    "tamir": ["таъмир", "ремонт", "tamir"],
    "remont": ["таъмир", "ремонт"],
    "kompyut": ["компьют", "kompyuter", "оргтех"],
    "kurilish": ["қурилиш", "курилиш", "строит", "qurilish"],
    "dori": ["дори", "лекарств", "медикамент", "dori"],
    "tibbiy": ["тиббий", "медицин", "tibbiy"],
    "mebel": ["мебел", "mebel"],
    "kompressor": ["компрессор"],
    "kislorod": ["кислород"],
    "avtomobil": ["автомоб", "avtomobil", "транспорт"],
    "bogcha": ["мтт", "мактабгача", "боғча", "ммтт"],
    "maktab": ["мактаб", "maktab", "школ"],
  };
  function queryStems(q) {
    const toks = key(q).split(" ").filter((t) => t.length >= 3);
    return toks.map((t) => {
      const stems = new Set([t.slice(0, Math.min(t.length, 5))]);
      for (const k in SYN) if (t.startsWith(k) || k.startsWith(t.slice(0, 5))) SYN[k].forEach((s) => stems.add(key(s).slice(0, 6)));
      return [...stems].filter(Boolean);
    });
  }
  function matchScore(titleKey, stemsPerToken) {
    const words = titleKey.split(" ");
    let hit = 0;
    for (const stems of stemsPerToken) if (stems.some((s) => words.some((w) => w.startsWith(s)))) hit++;
    return hit;
  }

  // ---------------------------------------------------------------- data
  const cache = {};
  let lastSource = null;
  async function api(path, opts) {
    const k = path + (opts && opts.body ? opts.body : "");
    if (!opts && cache[k]) return cache[k];
    // a hung engine must not mean an endless spinner: give up after 9 s
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), 9000) : null;
    let r;
    try {
      r = await fetch("api/" + path, Object.assign({}, opts || {}, ctl ? { signal: ctl.signal } : {}));
    } catch (err) {
      const e = new Error("network");
      e.status = 0;
      throw e;
    } finally {
      if (timer) clearTimeout(timer);
    }
    setSource(r.headers.get("X-TenderLens-Source"));
    if (!r.ok) {
      const e = new Error("HTTP " + r.status);
      e.status = r.status;
      try { e.detail = (await r.json()).detail; } catch (_) { /* not json */ }
      throw e;
    }
    const j = await r.json();
    if (!opts) cache[k] = j;
    return j;
  }
  function setSource(src) {
    if (!src || src === lastSource) return;
    lastSource = src;
    const b = $("#sourceBadge");
    const label = { engine: "Manba: UZEX etender, 18-noyabr holati", cache: "Manba: UZEX etender, oflayn nusxa", none: "Ma'lumot yo'q" }[src] || src;
    b.textContent = label;
    b.className = "source " + src;
  }
  const notAnalysed = (e) => e && (e.status === 404 || e.status === 503);
  const FRIENDLY_ERR = "Server javob bermadi. Birozdan so'ng qayta urinib ko'ring.";
  const retryBtn = () => `<button class="btn secondary" onclick="location.reload()">Qayta yuklash</button>`;

  // ---------------------------------------------------------------- presentation mode
  // Masks customer names as "Buyurtmachi A/B/C…" on every screen. Letters follow the risk order of
  // the index, so the same customer gets the same letter on the dashboard, lot page and bot.
  // ON by default: only an explicit "0" (footer/top-bar switch or ?present=0) shows real names
  let PRESENT = true;
  try { PRESENT = localStorage.getItem("tl_present") !== "0"; } catch (_) { /* storage blocked */ }
  (function () {
    const sp = new URLSearchParams(location.search);
    const hp = new URLSearchParams((location.hash.split("?")[1]) || "");
    const v = sp.has("present") ? sp.get("present") : hp.has("present") ? hp.get("present") : null;
    if (v != null) setPresent(v !== "0" && v !== "false", true);
  })();
  function setPresent(on, quiet) {
    PRESENT = !!on;
    try { localStorage.setItem("tl_present", PRESENT ? "1" : "0"); } catch (_) { /* ignore */ }
    document.body.classList.toggle("present", PRESENT);
    const sw = $("#presentSwitch");
    if (sw) { sw.setAttribute("aria-pressed", String(PRESENT)); sw.querySelector("b").textContent = PRESENT ? "yoqilgan" : "o'chiq"; }
    if (!quiet) { cacheKeysReset(); route(); }
  }
  const aliasMap = new Map();
  let aliasNext = 0;
  // A…Z, then 27, 28… (two-letter aliases like "AJ", "AK" would read as legal forms)
  function letter(n) { return n < 26 ? String.fromCharCode(65 + n) : String(n + 1); }
  function cacheKeysReset() { Object.keys(cache).forEach((k) => { const v = cache[k]; if (Array.isArray(v)) v.forEach((l) => { delete l._k; }); }); }
  function custKey(tin, name) { return String(tin || "") || norm(name).toLowerCase(); }
  function alias(tin, name) {
    const k = custKey(tin, name);
    if (!aliasMap.has(k)) aliasMap.set(k, letter(aliasNext++));
    return "Buyurtmachi " + aliasMap.get(k);
  }
  function buildAliases(index) {
    if (aliasMap.size) return;
    index.slice().sort(riskSort).forEach((l) => alias(l.customer_tin, l.customer_name));
  }
  async function ensureAliases() {
    if (aliasMap.size) return;
    try { buildAliases(await api("lots")); } catch (_) { /* index not ready: letters assigned on demand */ }
  }
  const custName = (name, tin) => (PRESENT ? alias(tin, name) : name || "");
  const ORG_WORDS = /(mchj|m\.?ch\.?j|atb|\baj\b|\bdm\b|\bxk\b|\bok\b|bank|markaz|boshqarma|agentlig|vazirlig|qo'mita|kombinat|korxona|muassasa|kompaniya|ООО|\bАО\b|\bАЖ\b|МЧЖ|банк|марказ|бошқарма|бошкарма|муассаса|агентлиг|вазирлиг|комбинат|корхона|филиал|filial)/i;
  // ---- strict masking for presentation mode -------------------------------------------------
  // 1) a legal form (MChJ, AJ, DUK, ООО, ГУП…) blanks the whole run of capitalised/quoted words
  //    next to it; 2) words of the customer's own name are blanked; 3) quoted org names, person
  //    initials (A.A. Familiya) and 9-digit tax numbers are blanked.
  const LEGAL = new Set(["MChJ", "MCHJ", "QK", "XK", "AK", "AKB", "АК", "АКБ", "OK", "AJ", "ATB", "AT", "DUK", "DM", "UK", "MK", "XF", "OOO", "OAO", "AO", "ZAO", "PAO", "GUP", "LLC", "LTD", "JSC", "ООО", "ОАО", "АО", "ЗАО", "ПАО", "ГУП", "АЖ", "МЧЖ", "АТБ", "ДУК", "ДМ", "ХК", "ҚК", "УК", "МК", "ОК"].map((t) => key(t).replace(/ /g, "")));
  const NAME_STOP = new Set(["xizmat", "xizmati", "boshkarma", "boshkarmasi", "davlat", "tuman", "tumani", "viloyat", "viloyati", "shaxar", "shaxri", "markaz", "markazi", "muassasa", "muassasasi", "filial", "filiali", "jamiyat", "jamiyati", "aksiyadorlik", "korxona", "korxonasi", "respublika", "respublikasi", "ozbekiston", "uzbekiston", "toshkent", "milliy", "agentligi", "vazirligi", "xokimligi", "buyurtmachi", "uchun", "boyicha", "tashkiloti", "maktab", "maktabi", "soni", "sonli",
    "maktabgacha", "talim", "tibbiyot", "birlashma", "birlashmasi", "bank", "banki", "universitet", "universiteti", "poliklinika", "poliklinikasi",
    "shifoxona", "shifoxonasi", "kasalxona", "kasalxonasi", "klinik", "klinikasi", "teatr", "teatri", "bolalar", "oromgox", "oromgoxi", "mamuriy", "bino",
    "kasalliklar", "yukumli", "ichki", "ishlar", "salomatlik", "ruxiy", "tashkilot", "ilmiy", "institut", "instituti", "akademiya", "akademiyasi",
    "kollej", "texnikum", "litsey", "sport", "madaniyat", "tarbiyalanuvchilar", "xududiy", "bolim", "bolimi", "kompleks", "kompleksi"].map((x) => key(x)));
  const ORG_HEADS = ["shifoxona", "kasalxona", "poliklinika", "markaz", "boshqarma", "bank", "universitet", "institut", "akademiya", "zavod", "kombinat", "teatr", "muzey", "birlashma", "korxona", "jamiyat", "agentlig", "vazirlig", "hokimlig", "kollej", "litsey", "filial", "klinika", "dispanser", "muassasa", "inspeksiya", "qo'mita", "departament"].map((x) => key(x));
  const OPENQ = /^[“"«„‘']/, CLOSEQ = /[”"»“’']$/;
  const ACR_OK = /^(HBsAg|HBeAg|pH|ISO|IAAS|GOST|LED|CCTV|SCADA|USB|HDMI|LCD|MTT|DMTT|MMTT|EKG|POS|IT|PDV|PDO|IP|SPO|IPO|UZI|MRT|KT|PCR|IXLA|HCV|OIV|QQS|NDS|PC|SSD|HDD|UPS|GPS|SMS|API|CRM|ERP|MFY|AQSh|GTS|NGQ|KV|PVX|LDPE|PVC|ID|QR|DVR|NVR|ATS|IPTV|WIFI|LTE|SIM)$/i;
  function isOrgAcronym(t) {
    const b = stripTok(t).replace(/[-–].*$/, "");
    if (b.length < 3 || b.length > 14 || ACR_OK.test(b) || isLegalTok(b) || !/^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]+$/.test(b)) return false;
    const up6 = (b.slice(0, 6).match(/[A-ZА-ЯЁЎҚҒҲ]/g) || []).length;
    return up6 >= 3 && /[a-zа-яёўқғҳ]/.test(b);  // mixed case like NGQChB, NGQChBsida (acronym + suffix)
  }
  const stripTok = (t) => t.replace(/^[“"«„‘'(\[]+|[”"»“’'),.;:!?\]]+$/g, "");
  const isUpperStart = (t) => /^[A-ZА-ЯЁЎҚҒҲ]/.test(stripTok(t));
  function isLegalTok(t) {
    const b = stripTok(t);
    if (!b || b.length > 10) return false;
    const cands = [b];
    const sm = b.match(/^(.{2,6}?)(dagi|ning|dan|da|ga|ni|si|ka|qa)$/);  // "AJda", "MChJga"
    if (sm) cands.push(sm[1]);
    return cands.some((c) => c.length <= 7 && (c === c.toUpperCase() || /^m\.?ch\.?j\.?$/i.test(c)) && LEGAL.has(key(c).replace(/ /g, "")));
  }
  function nameWords(names) {
    const set = new Set();
    (names || []).forEach((n) => key(n).split(" ").forEach((w) => { if (w.length >= 4 && !NAME_STOP.has(w)) set.add(w); }));
    return set;
  }
  function maskLine(line, nameSet) {
    const w = line.split(" ");
    const m = new Array(w.length).fill(false);
    const nameLike = (i) => i >= 0 && i < w.length && w[i] !== "" && (isUpperStart(w[i]) || OPENQ.test(w[i]) || CLOSEQ.test(w[i]));
    const backToOpen = (j) => { for (let k = j; k >= Math.max(0, j - 8); k--) if (OPENQ.test(w[k])) return k; return j; };
    const fwdToClose = (j) => { for (let k = j; k < Math.min(w.length, j + 8); k++) if (CLOSEQ.test(w[k])) return k; return j; };
    w.forEach((t, i) => {
      if (!isLegalTok(t)) return;
      m[i] = true;
      let j = i - 1, n = 0;
      while (nameLike(j) && n < 6) {
        const start = CLOSEQ.test(w[j]) && !OPENQ.test(w[j]) ? backToOpen(j) : j;
        for (let k = start; k <= j; k++) m[k] = true;
        n += j - start + 1; j = start - 1;
      }
      j = i + 1; n = 0;
      while (nameLike(j) && n < 4) {
        const end = OPENQ.test(w[j]) && !CLOSEQ.test(w[j]) ? fwdToClose(j) : j;
        for (let k = j; k <= end; k++) m[k] = true;
        n += end - j + 1; j = end + 1;
      }
    });
    if (nameSet && nameSet.size) w.forEach((t, i) => {
      const k = key(stripTok(t));
      if (!k || !(isUpperStart(t) || OPENQ.test(t))) return;
      for (const n of nameSet) {
        if (k === n || (n.length >= 5 && k.startsWith(n)) || (k.length >= 5 && n.length >= 8 && n.startsWith(k))) { m[i] = true; break; }
      }
    });
    // "<Proper noun> … shifoxonasi / markazi / banki": a named institution -> blank the whole phrase
    w.forEach((t, i) => {
      const k = key(stripTok(t));
      if (!k || !ORG_HEADS.some((h) => k.startsWith(h))) return;
      for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
        if (/[,.;:]$/.test(w[j])) break;
        const kj = key(stripTok(w[j]));
        if (isUpperStart(w[j]) && kj && !NAME_STOP.has(kj)) { for (let x = j; x <= i; x++) m[x] = true; break; }
      }
    });
    // org acronyms such as "NGQChB", "UZTM": mask with the proper noun right before them ("Vodiy NGQChB")
    w.forEach((t, i) => {
      if (!isOrgAcronym(t)) return;
      m[i] = true;
      if (i > 0 && isUpperStart(w[i - 1]) && !NAME_STOP.has(key(stripTok(w[i - 1])))) m[i - 1] = true;
    });
    // an ALL-CAPS token (acronym brand like "BYD") touching a masked run belongs to it
    const caps = (i) => i >= 0 && i < w.length && /^[A-ZА-ЯЁЎҚҒҲ]{2,}$/.test(stripTok(w[i]));
    for (let pass = 0; pass < 2; pass++) w.forEach((t, i) => { if (!m[i] && caps(i) && (m[i - 1] || m[i + 1])) m[i] = true; });
    const out = [];
    w.forEach((t, i) => {
      if (!m[i]) { out.push(t); return; }
      const tail = /[,.;:)]$/.test(t) && !CLOSEQ.test(t) ? t.slice(-1) : "";
      if (out.length && /…[,.;:)]?$/.test(out[out.length - 1]) && m[i - 1]) { out[out.length - 1] = "…" + tail; return; }
      out.push("…" + tail);
    });
    return out.join(" ");
  }
  function maskOrgs(text, names) {
    const nameSet = nameWords(names);
    return String(text || "").split("\n").map((line) => {
      let s = maskLine(line, nameSet);
      s = s.replace(/([“«"])([^”»"]{2,80})([”»"])/g, (mm, a, inner, b) => (ORG_WORDS.test(inner) ? `${a}…${b}` : mm));
      s = s.replace(/(^|[\s(«"“,])[A-ZА-ЯЁЎҚҒҲ]\.\s?(?:[A-ZА-ЯЁЎҚҒҲ]\.\s?)?[A-ZА-ЯЁЎҚҒҲ][a-zа-яёўқғҳ'ʻ’‘-]{2,}/g, "$1…");
      s = s.replace(/(^|[\s(«"“,])[A-ZА-ЯЁЎҚҒҲ][a-zа-яёўқғҳ'ʻ’‘-]{2,}\s[A-ZА-ЯЁЎҚҒҲ]\.\s?[A-ZА-ЯЁЎҚҒҲ]\.?/g, "$1…");
      s = s.replace(/(STIR|СТИР|ИНН|INN|TIN)\s*[:№]?\s*\d{9}(?!\d)/gi, "$1: •••");
      s = s.replace(/(^|\D)\d{9}(?!\d)/g, "$1•••");
      s = s.replace(/(^|[^\w.])\d{1,4}\s?-\s?(sonli|son|сонли|сон|OP|ОП|DMTT|MTT|ММТТ|МТТ)(?![\wа-яёўқғҳ])/g, "$1…");  // numbered institutions
      return s.replace(/…(\s*…)+/g, "…");
    }).join("\n");
  }
  const maskQuotedOrgs = (s) => maskOrgs(s, []);
  // region / city / district names in free text (title + place can name the customer)
  const PLACES = new Set(("toshkent samarqand buxoro andijon namangan farg'ona fargona navoiy jizzax sirdaryo surxondaryo qashqadaryo " +
    "xorazm qoraqalpog'iston nukus termiz qarshi guliston urganch chirchiq bekobod olmaliq angren ohangaron kogon marg'ilon qo'qon " +
    "shahrisabz denov zarafshon yangiyer gazli muborak xiva").split(" ").map((x) => key(x)));
  function maskPlaces(text) {
    return String(text || "").split("\n").map((line) => {
      line = line.replace(/(^|[^\w'‘’ʻ])[A-ZА-ЯЁЎҚҒҲ][\w'‘’ʻ-]+\s+(viloyat|shahar|shahr|tuman)\w*/g, "$1…");
      line = line.split(/(\s+)/).map((w) => {
        const b = stripTok(w);
        const k = key(b);
        const base = k.replace(/(dagi|ning|dan|da|ga)$/, "");
        if (b && /^[A-ZА-ЯЁЎҚҒҲ]/.test(b) && (PLACES.has(k) || PLACES.has(base))) return w.replace(b, "…");
        // hyphen-joined: "DAP-Toshkent"
        b.split(/[-–]/).forEach((p) => {
          const kp = key(p);
          if (p.length > 3 && /^[A-ZА-ЯЁЎҚҒҲ]/.test(p) && (PLACES.has(kp) || PLACES.has(kp.replace(/(dagi|ning|dan|da|ga)$/, "")))) w = w.replace(p, "…");
        });
        return w;
      }).join("");
      return line.replace(/…(\s*…)+/g, "…");
    }).join("\n");
  }
  // remove the customer's own name/TIN from free text (letters, reasons, explanations)
  function scrub(text, lot) {
    if (!PRESENT || !text) return text || "";
    let out = String(text);
    const c = (lot && lot.customer) || {};
    if (c.name && c.name.length > 3) out = out.split(c.name).join(alias(c.tin, c.name));
    if (c.tin) out = out.split(String(c.tin)).join("•••");
    return maskPlaces(maskOrgs(out, c.name ? [c.name] : []));
  }
  // a title that still looks like it names an organisation falls back to "Lot № … · sector"
  function riskyTitle(t) {
    const words = t.split(/\s+/).map(stripTok).filter(Boolean);
    const real = words.filter((x) => x !== "…" && x.replace(/…/g, "").length > 1);
    if (real.length < 3) return true;
    if (words.some((x) => isLegalTok(x))) return true;
    if (/(^|\s)[A-ZА-ЯЎҚҒҲ][^\s]*\s+(bank|banki|банк|банки)(\s|$)/.test(t)) return true; // "Markaziy bank", "Xalq banki"
    return words.some((x) => /^[A-ZА-ЯЁЎҚҒҲ'‘’ʻ-]{4,}$/.test(x) && !/^(ISO|IAAS|GOST|LED|CCTV|SCADA|USB|HDMI|LCD)$/.test(x));
  }
  // presentation titles are decided on the server (app/masking.py -> title_present), shared with the bot
  const SECTOR_TITLE = { health: "Sog'liqni saqlash sohasidagi xarid", education: "Ta'lim sohasidagi xarid", construction: "Qurilish ishlari xaridi", it: "Axborot texnologiyalari xaridi", food: "Ovqatlanish xizmati xaridi", other: "Davlat xaridi" };
  function lotTitle(l) {
    const t = l.subject_uz || l.title_uz || l.title || "";
    if (!PRESENT) return t;
    if (l.title_present) return l.title_present;
    const names = [l.customer_name, l.customer && l.customer.name].filter(Boolean);
    let out = t;
    names.forEach((n) => { if (n.length > 3) out = out.split(n).join("…"); });
    out = maskOrgs(out, names);
    return riskyTitle(out) || /…/.test(out) ? SECTOR_TITLE[l.sector] || SECTOR_TITLE.other : out;
  }
  // region: hidden in presentation mode (title + region can name the customer), Latin otherwise
  const regionText = (r) => (PRESENT || !r ? "" : translit(r));

  const verifiedFlags = (lot) => (lot.flags || []).filter((f) => f.quote_verified === true);
  const isPlatform = (x) => x && (x.source === "platform_form" || x.page === 0 || x.page === "0");
  const whereText = (x) => (isPlatform(x) ? "Platforma mezonlari formasi" : x && x.page ? `${x.page}-sahifa` : "");
  const isClosed = (l) => !!(l && l.end_date && new Date(l.end_date) < new Date());
  const closedPill = '<span class="pill closed">yopilgan</span>';

  const FLAG_TYPE = {
    brand_no_equivalent: "Brend «yoki ekvivalent»siz",
    narrow_params: "Haddan tor texnik parametrlar",
    excessive_experience: "Ortiqcha tajriba talabi",
    excessive_financial: "Ortiqcha moliyaviy talab",
    dealer_letter: "Diler / ishlab chiqaruvchi xati talabi",
    irrelevant_requirement: "Xarid predmetiga aloqasiz talab",
    bundling: "Aloqasiz tovarlar bitta lotda",
    unrealistic_deadline: "Real bo'lmagan muddat",
    short_window: "Taklif uchun juda qisqa muddat",
    other: "Boshqa cheklovchi shart",
  };
  const flagLabel = (f) => f.type_label_uz || FLAG_TYPE[f.type] || f.type;
  const SEV = { high: "Yuqori", medium: "O'rta", low: "Past" };
  const LIGHT = { red: "Yuqori xavf", amber: "O'rta xavf", green: "Past xavf" };
  const LIGHT_LONG = { red: "Jiddiy cheklovchi shartlar bor", amber: "E'tibor talab qiladigan shartlar bor", green: "Jiddiy cheklovchi shart yo'q", none: "Baho hali hisoblanmagan" };
  const SECTOR = { health: "Sog'liqni saqlash", education: "Ta'lim", construction: "Qurilish", it: "IT", food: "Oziq-ovqat", other: "Boshqa" };
  const VERDICT = {
    bid: { t: "Qatnashing", cls: "bid", icon: "check" },
    bid_with_clarification: { t: "Qatnashing, lekin avval aniqlik so'rang", cls: "clar", icon: "ask" },
    skip: { t: "Qatnashmang", cls: "skip", icon: "stop" },
  };
  const ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    ask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 13h.01M10 8.6a2.1 2.1 0 1 1 3 1.9c-.6.3-1 .8-1 1.5"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M6 18L18 6"/></svg>',
    letter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/></svg>',
    ext: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  };

  function lightPill(light, score) {
    if (!LIGHT[light]) return '<span class="pill none">tahlil kutilmoqda</span>';
    return `<span class="pill ${light}"><span class="dot"></span>${score != null ? score + " · " : ""}${LIGHT[light]}</span>`;
  }
  function clip(s, n) {
    s = norm(s);
    if (s.length <= n) return s;
    const cut = s.lastIndexOf(" ", n);
    return s.slice(0, cut > n * 0.6 ? cut : n) + "…";
  }
  // whole sentences up to `max` characters; never cut a sentence mid-way unless the first one alone is huge
  function sentences(s, max) {
    s = norm(s);
    if (s.length <= max) return s;
    const parts = s.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [s];
    let out = "";
    for (const p of parts) {
      if ((out + p).trim().length > max) break;
      out += p;
    }
    out = out.trim();
    if (out) return out;
    const first = (parts[0] || "").trim();
    if (first && first.length <= max * 1.9) return first;  // one whole sentence beats a cut one
    const semi = s.lastIndexOf(";", max);
    if (semi > max * 0.5) return s.slice(0, semi) + ".";
    return clip(s, max);
  }
  // one vocabulary in the verdict card: "sahifa" (not "bet"), "Platforma mezonlari formasi"
  function tidyReason(r) {
    return String(r).replace(/(\d+)-bet\)/g, "$1-sahifa)").replace(/\(platformadagi mezonlar\)/g, "(Platforma mezonlari formasi)");
  }
  function cleanDocs(list) {
    const seen = new Set();
    return (list || []).map((d) => norm(d).replace(/^[-–•*]\s*/, "")).filter((d) => {
      if (!d || /^[\d\s.-]*(-?shakl|shakli|форма)?\s*:?\s*$/i.test(d) || /:\s*$/.test(d) && d.length < 14) return false;
      if (/[Ѐ-ӿ]/.test(d)) return false;  // raw Russian/Cyrillic source lines
      const k = key(d).replace(/\s+/g, "").slice(0, 40);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  // ---------------------------------------------------------------- UI helpers
  function setTab(tab) {
    document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
  }
  function loading(msg) {
    view.innerHTML = `<div class="loading"><div class="spinner"></div>${esc(msg || "Yuklanmoqda…")}</div>`;
  }
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.hidden = true), 3200);
  }
  function openModal(title, bodyHtml, footHtml) {
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = bodyHtml;
    $("#modalFoot").innerHTML = footHtml || "";
    $("#modal").hidden = false;
  }
  function closeModal() { $("#modal").hidden = true; }
  $("#modalClose").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  $("#presentSwitch").addEventListener("click", () => setPresent(!PRESENT));

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  function parseLotInput(v) {
    const m = String(v || "").match(/\d{6,}/g);
    if (!m) return null;
    let s = m[m.length - 1];
    if (s.length === 14) s = s.slice(-6);
    return s;
  }
  $("#quickForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = parseLotInput($("#quickInput").value);
    if (!id) return toast("Lot raqamini yoki etender.uzex.uz havolasini kiriting");
    $("#quickInput").value = "";
    const gov = location.hash.startsWith("#/gov");
    location.hash = (gov ? "#/gov/lot/" : "#/lot/") + id;
  });

  // ---------------------------------------------------------------- supplier home
  let lastQuery = "";
  // demo order: lots still open on 19 Nov first (524954 closes 18 Nov 17:50)
  const DEMO_CHIPS = [
    ["525192", "ajratgich, 2 dona"],
    ["524769", "shifoxona ovqati"],
    ["524954", "suv ombori loyihasi"],
  ];
  let homeLimit = 12;
  async function renderHome(q) {
    if (q != null) lastQuery = q;
    setTab("supplier");
    view.innerHTML = `
      <section class="card hero-search">
        <div>
          <div class="eyebrow">Kichik va o'rta biznes uchun</div>
          <h1>Bu tenderda qatnashishga arziydimi?</h1>
          <p>TenderLens texnik topshiriqni o'qiydi, bitta ishtirokchiga moslab yozilgan shartlarni so'zma-so'z iqtibos bilan ko'rsatadi va buyurtmachiga aniqlik so'rovi xatini tayyorlaydi.</p>
        </div>
        <form id="bigForm" autocomplete="off">
          <div class="search-big">
            <input id="bigInput" placeholder="etender.uzex.uz/lot/… havolasi yoki lot raqami" aria-label="Lot havolasi yoki raqami">
            <button class="btn" type="submit">Ochish</button>
          </div>
          <div class="examples">Namuna: ${DEMO_CHIPS.map(([id, t]) => `<a class="chip" href="#/lot/${id}">${id} · ${esc(t)}</a>`).join(" ")}</div>
        </form>
      </section>

      <h2 class="section-title">Men uchun tenderlar <span class="count" id="matchCount"></span></h2>
      <div class="filter">
        <input id="kw" value="${esc(lastQuery)}" placeholder="Nima sotasiz? Masalan: qurilish, burg'ulash dolotalari, issiq ovqat, kompyuter" aria-label="Kalit so'zlar">
      </div>
      <div class="lot-list" id="lotList"><div class="loading"><div class="spinner"></div>Lotlar yuklanmoqda…</div></div>`;

    $("#bigForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const id = parseLotInput($("#bigInput").value);
      if (!id) return toast("Lot raqamini yoki etender.uzex.uz havolasini kiriting");
      location.hash = "#/lot/" + id;
    });

    let index;
    try {
      index = await api("lots");
    } catch (e) {
      $("#lotList").innerHTML = `<div class="card empty">${notAnalysed(e) ? "Tahlil qilingan lotlar hali yo'q." : `${FRIENDLY_ERR}<div style="margin-top:12px">${retryBtn()}</div>`}</div>`;
      return;
    }
    buildAliases(index);
    // in presentation mode the search sees only the masked title, never the hidden customer name
    index.forEach((l) => { l._k = key(PRESENT ? lotTitle(l) : [l.title, l.subject_uz, l.customer_name].join(" ")); });
    const draw = () => {
      const q = $("#kw").value;
      lastQuery = q;
      const stems = queryStems(q);
      let rows;
      let total;
      if (!stems.length) {
        rows = index.slice().sort(listSort).map((l) => ({ l, s: 0 }));
        $("#matchCount").textContent = `${index.length} ta tahlil qilingan lot`;
      } else {
        rows = index.map((l) => ({ l, s: matchScore(l._k, stems) })).filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s || listSort(a.l, b.l));
        $("#matchCount").textContent = `${rows.length} ta mos lot`;
      }
      total = rows.length;
      rows = rows.slice(0, homeLimit);
      $("#lotList").innerHTML = (rows.length
        ? rows.map(({ l }) => lotRow(l, stems)).join("")
        : `<div class="card empty">Mos lot topilmadi. Boshqa so'z bilan urinib ko'ring.</div>`) +
        (total > homeLimit ? `<div class="more"><button class="btn ghost" id="homeMore">Yana ko'rsatish (${grp(total - homeLimit)} ta qoldi)</button></div>` : "");
      const hm = $("#homeMore");
      if (hm) hm.addEventListener("click", () => { homeLimit += 24; draw(); });
    };
    $("#kw").addEventListener("input", () => { homeLimit = 12; draw(); });
    draw();
  }

  function highlightTitle(title, stems) {
    if (!stems || !stems.length) return esc(title);
    const flat = stems.flat();
    return String(title).split(/(\s+)/).map((w) => {
      const k = key(w);
      return k && flat.some((s) => k.split(" ").some((p) => p.startsWith(s))) ? `<mark>${esc(w)}</mark>` : esc(w);
    }).join("");
  }
  function lotRow(l, stems) {
    const left = timeLeft(l.end_date);
    const closed = isClosed(l);
    const reg = regionText(l.region);
    return `<a class="card lot-row${closed ? " is-closed" : ""}" href="#/lot/${l.lot_id}">
      <div><div class="t">${highlightTitle(lotTitle(l), stems)}</div><div class="c">№ ${l.lot_id} · ${esc(custName(l.customer_name, l.customer_tin))}${reg ? " · " + esc(reg) : ""}</div></div>
      <div>${lightPill(l.traffic_light, l.fairness_score)}</div>
      <div><div class="num">${esc(money(l.start_cost, l.currency))}</div><div class="sub">boshlang'ich narx</div></div>
      <div><div class="num">${esc(fmtDate(l.end_date))}</div><div class="sub">${closed ? closedPill : esc(left || "takliflar muddati")}</div></div>
    </a>`;
  }
  // lists: open lots first, then the risk order (aliases keep using riskSort so letters never move)
  function listSort(a, b) {
    const ca = isClosed(a) ? 1 : 0, cb = isClosed(b) ? 1 : 0;
    return ca - cb || riskSort(a, b);
  }

  // risk order: scored first, lowest fairness first, then larger savings estimate, then larger value
  function riskSort(a, b) {
    const sa = a.fairness_score == null ? 999 : a.fairness_score;
    const sb = b.fairness_score == null ? 999 : b.fairness_score;
    if (sa !== sb) return sa - sb;
    const ma = a.money_on_table_uzs || 0, mb = b.money_on_table_uzs || 0;
    if (ma !== mb) return mb - ma;
    return (b.currency === "UZS" ? b.start_cost : 0) - (a.currency === "UZS" ? a.start_cost : 0);
  }

  // ---------------------------------------------------------------- lot page
  async function renderLot(id, gov, opts) {
    setTab(gov ? "gov" : "supplier");
    loading(`${id}-son lot yuklanmoqda…`);
    let lot;
    try {
      [lot] = await Promise.all([api("lots/" + encodeURIComponent(id)), PRESENT ? ensureAliases() : null]);
    } catch (e) {
      view.innerHTML = `<div class="card error-box">
        <h2>${notAnalysed(e) ? `${esc(id)}-son lot hali tahlil qilinmagan` : "Lotni yuklab bo'lmadi"}</h2>
        <p class="muted">${notAnalysed(e) ? "Bu lot hali tahlil qilinmagan. Hozircha oldindan tahlil qilingan lotlar ko'rsatiladi — ularni ro'yxatdan tanlang." : FRIENDLY_ERR}</p>
        <p><a class="btn secondary" href="${gov ? "#/gov" : "#/"}">← Orqaga</a> ${notAnalysed(e) ? "" : retryBtn()}</p></div>`;
      return;
    }
    const flags = verifiedFlags(lot);
    const groups = groupFlags(flags);
    const closed = isClosed(lot);
    const v = closed ? { t: "Lot yopilgan: takliflar qabul qilinmaydi", cls: "pending", icon: "stop" }
      : VERDICT[(lot.verdict || {}).decision] || { t: "Tavsiya hali tayyor emas", cls: "pending", icon: "ask" };
    const light = LIGHT[lot.traffic_light] ? lot.traffic_light
      : lot.fairness_score == null ? "none"
      : lot.fairness_score >= 80 ? "green" : lot.fairness_score >= 50 ? "amber" : "red";
    const cs = lot.customer_stats || {};
    const c = lot.customer || {};
    const title = lotTitle(lot);
    const left = timeLeft(lot.end_date);
    const ringColor = { red: "#c3261d", amber: "#f29d0b", green: "#1f7a3a", none: "#c9d1dc" }[light];
    const C = 2 * Math.PI * 86;
    const frac = Math.max(0, Math.min(100, lot.fairness_score || 0)) / 100;
    const sb = lot.score_breakdown;
    // reasons: drop the generic opener, the deadline line (shown under the button) and the re-announce
    // note (in the eyebrow); the customer-history line lives in its own card; whole sentences only
    const reasons = closed ? [] : ((lot.verdict || {}).reasons_uz || [])
      .map(norm)
      .filter((r) => !/^(qatnashish mumkin|qatnashing|tushuntirish so'rash muddati|lot qayta e'lon|buyurtmachining so'nggi)/i.test(r))
      .slice(0, 2).map((r) => sentences(tidyReason(scrub(r, lot)).replace(/^[^:]{5,110}\)\s*:\s*/, ""), PRESENT ? 230 : 300));
    const top = groups[0];
    const allDocs = cleanDocs(lot.documents_needed_uz);
    const docs = allDocs.slice(0, 10);
    const showOrig = !PRESENT && lot.title && title !== lot.title;
    const region = regionText(lot.region);
    const savingsShown = lot.money_on_table_uzs != null && lot.money_on_table_uzs >= 1e6;

    view.innerHTML = `
      ${gov ? govBar(lot, groups, closed) : ""}
      ${closed ? `<div class="closed-banner">Lot yopilgan (${esc(fmtDate(lot.end_date))}) — tahlil arxiv sifatida ko'rsatilmoqda.</div>` : ""}
      <div class="crumbs"><a href="${gov ? "#/gov" : "#/"}">← ${gov ? "Xavf navbati" : "Men uchun tenderlar"}</a></div>
      <div class="lot-head">
        <div>
          <div class="eyebrow">Lot № ${esc(lot.lot_id)} · ${lot.type === "tender" ? "Tender" : "Tanlov"}${lot.sector && SECTOR[lot.sector] ? " · " + SECTOR[lot.sector] : ""}${lot.old_id ? ` · qayta e'lon qilingan` : ""}</div>
          <h1>${esc(title)}</h1>
          ${showOrig ? `<div class="orig">${esc(lot.title)}</div>` : ""}
          <div class="meta">
            <span>Buyurtmachi: <b>${esc(custName(c.name, c.tin))}</b></span>
            ${region ? `<span>${esc(region)}</span>` : ""}
            <span>Boshlang'ich narx: <b>${esc(money(lot.start_cost, lot.currency))}</b></span>
            <span>Takliflar muddati: <b class="${left ? "deadline" : ""}">${esc(fmtDate(lot.end_date))}</b>${left ? ` <span class="deadline">(${esc(left)})</span>` : closed ? " " + closedPill : ""}</span>
          </div>
        </div>
        ${PRESENT ? "" : `<a class="btn ghost" href="${esc(lot.url || `https://etender.uzex.uz/lot/${lot.lot_id}`)}" target="_blank" rel="noopener">etender.uzex.uz ${ICON.ext}</a>`}
      </div>

      <section class="summary${cs.deals ? "" : " no-cust"}">
        <div class="card score-card">
          <div class="eyebrow">Adolatlilik bali</div>
          <div class="ring">
            <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" fill="none" stroke="#e9edf3" stroke-width="18"/>
              ${lot.fairness_score != null ? `<circle cx="100" cy="100" r="86" fill="none" stroke="${ringColor}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}"/>` : ""}</svg>
            <div class="val"><div class="num">${lot.fairness_score != null ? esc(lot.fairness_score) : "—"}</div><div class="of">100 dan</div></div>
          </div>
          <div class="lights" aria-hidden="true"><i class="red ${light === "red" ? "on" : ""}"></i><i class="amber ${light === "amber" ? "on" : ""}"></i><i class="green ${light === "green" ? "on" : ""}"></i></div>
          <div class="score-label ${light}">${esc(LIGHT_LONG[light])}</div>
          ${sb && sb.start != null ? `<div class="breakdown">${grp(sb.start)} − ${grp(sb.clause_penalty || 0, (sb.clause_penalty || 0) % 1 ? 1 : 0)} <span>shartlar</span> − ${grp(sb.history_penalty || 0, (sb.history_penalty || 0) % 1 ? 1 : 0)} <span>buyurtmachi tarixi</span></div>` : ""}
        </div>

        <div class="card verdict ${v.cls}">
          <div class="eyebrow">${closed ? "Holat" : "Tavsiya"}</div>
          <div class="verdict-head"><div class="verdict-icon">${ICON[v.icon]}</div><h2>${esc(v.t)}</h2></div>
          ${top ? `<div class="key-quote"><div class="kq-label">Asosiy dalil · ${esc(flagLabel(top))} · ${esc(whereText(top))}</div><mark>«${esc(sentences(scrub(norm(top.quote), lot), 260))}»</mark></div>` : ""}
          ${reasons.length ? `<ul>${reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
          <div class="actions">
            ${lot.clarification_letter_uz ? `<button class="btn${closed ? " ghost" : ""}" id="letterBtn">${ICON.letter} ${closed ? "Xat namunasini ko'rish" : "Aniqlik so'rovi xatini yaratish"}</button>` : ""}
            ${!closed && lot.clarific_date && timeLeft(lot.clarific_date) ? `<span class="clar-date">Aniqlik so'rash muddati:<br><b>${esc(fmtDate(lot.clarific_date))}</b> · ${esc(timeLeft(lot.clarific_date))}</span>` : ""}
          </div>
        </div>

        <div class="card cust">
          <div><div class="eyebrow">Buyurtmachi tarixi</div></div>
          <div class="name">${esc(custName(c.name, c.tin))}${c.tin && !PRESENT ? ` · STIR ${esc(c.tin)}` : ""}</div>
          ${cs.deals ? `<div class="kv">
            <div><div class="k">Ishtirokchilar soni (mediana)</div><div class="v ${cs.median_bidders <= 2 ? "bad" : ""}">${grp(cs.median_bidders, cs.median_bidders % 1 ? 1 : 0)}</div></div>
            <div><div class="k">Eng ko'p yutgan yetkazib beruvchi ulushi</div><div class="v ${cs.top_winner_share >= 0.5 ? "bad" : ""}">${pct(cs.top_winner_share)}</div></div>
            <div><div class="k">≤2 ishtirokchili bitimlar</div><div class="v ${cs.share_le2_bidders >= 0.5 ? "bad" : ""}">${pct(cs.share_le2_bidders)}</div></div>
            <div><div class="k">Narx 1% dan kam tushgan</div><div class="v">${pct(cs.share_price_drop_lt1pct)}</div></div>
            ${savingsShown ? `<div class="money"><div class="k">Tejash imkoniyati <span class="est">taxminiy</span></div><div class="v">${esc(money(lot.money_on_table_uzs))}</div><div class="k" style="margin-top:2px">agar raqobat +2 ishtirokchiga oshsa</div></div>` : ""}
          </div>
          <div class="muted" style="font-size:.8rem">Oxirgi ${grp(cs.deals)} ta bitim asosida${cs.reannounced_lots ? ` · ${cs.reannounced_lots} ta qayta e'lon` : ""}.</div>`
          : `<div class="muted">Bu buyurtmachi bo'yicha bitimlar tarixi topilmadi.</div>`}
        </div>
      </section>

      <section class="flags-section">
      <h2 class="section-title">Topilgan cheklovchi shartlar <span class="count">${groups.length}</span></h2>
      ${flags.length ? groups.map((g) => flagCard(g, lot)).join("") : lot.fairness_score == null ? `<div class="card no-flags" style="color:var(--muted)">Texnik topshiriq tahlili hali yakunlanmagan.</div>` : `<div class="card no-flags">${ICON.check.replace("<svg", '<svg width="26" height="26"')} Texnik topshiriqda tasdiqlangan cheklovchi shart topilmadi.</div>`}
      </section>

      <div class="two" style="margin-top:8px">
        <section class="card card-pad">
          <h3 style="margin-bottom:8px">Kerakli hujjatlar</h3>
          <ul class="docs-list">${docs.map((d) => `<li><span class="box"></span><span>${esc(scrub(d, lot))}</span></li>`).join("") || '<li class="muted">Ro\'yxat mavjud emas</li>'}</ul>
          ${allDocs.length > docs.length ? `<div class="muted" style="font-size:.85rem;margin-top:6px">va yana ${allDocs.length - docs.length} ta hujjat (texnik topshiriqda)</div>` : ""}
        </section>
        <section class="card card-pad">
          <h3 style="margin-bottom:8px">Asosiy talablar</h3>
          ${(lot.requirements || []).slice(0, 6).map((r) => `<div class="req"><div>${esc(scrub(r.summary_uz, lot))}</div>${whereText(r) ? `<div class="q">${esc(whereText(r))}</div>` : ""}</div>`).join("") || '<div class="muted">—</div>'}
          ${lot.evaluation && lot.evaluation.tech_coef != null ? `<div class="req"><div>Baholash: texnik qism <b>${esc(grp(lot.evaluation.tech_coef))}%</b>, narx <b>${esc(grp(lot.evaluation.cost_coef))}%</b>.</div></div>` : ""}
          ${lot.spec ? `<div class="muted" style="font-size:.8rem;margin-top:8px">Texnik topshiriq: ${esc(lot.spec.pages || "?")} sahifa · ${esc({ text: "matn qatlami", ocr: "OCR", vision: "AI ko'rish (skan)" }[lot.spec.text_source] || lot.spec.text_source || "")}${lot.spec.unreadable_pages && lot.spec.unreadable_pages.length ? ` · ${lot.spec.unreadable_pages.length} ta sahifa o'qilmadi (skan)` : ""} · tahlil: ${esc(fmtDate(lot.analyzed_at))}</div>` : ""}
        </section>
      </div>`;

    const lb = $("#letterBtn");
    if (lb) lb.addEventListener("click", () => showLetter(lot));
    const gb = $("#govSend");
    if (gb) gb.addEventListener("click", () => showCorrection(lot, groups));
    window.scrollTo(0, 0);
    // deep links for screenshots / demo: #/lot/524401?letter , #/gov/lot/524401?send
    if (opts && opts.letter && lot.clarification_letter_uz) showLetter(lot, true);
    if (opts && opts.send && gov && groups.length) showCorrection(lot, groups);
    // projector crops for the deck: #/lot/524401?focus=score | ?focus=flags
    if (opts && opts.focus) document.documentElement.classList.add("focus", "focus-" + opts.focus);
  }

  // flags that share a group_id are one finding with several quotes (e.g. a brand lock repeated 3x)
  function groupFlags(flags) {
    const out = [], byId = {};
    flags.forEach((f) => {
      if (f.group_id && byId[f.group_id]) { byId[f.group_id]._more.push(f); return; }
      const g = Object.assign({}, f, { _more: [] });
      if (f.group_id) byId[f.group_id] = g;
      out.push(g);
    });
    return out;
  }
  function flagCard(f, lot) {
    const q = scrub(norm(f.quote), lot);
    const tl = hasCyr(q) ? translit(q) : "";
    const more = (f._more || []).map((m) => `<div class="doc"><span class="page-tag">${esc(isPlatform(m) ? "Platforma mezonlari formasi" : `Texnik topshiriq · ${m.page}-sahifa`)}</span><span class="ctx">… </span><mark>${esc(scrub(norm(m.quote), lot))}</mark><span class="ctx"> …</span></div>`).join("");
    const where = (f._more && f._more.length ? `${f._more.length + 1} ta iqtibos · ` : "") + whereText(f);
    const docTag = isPlatform(f) ? "Platforma mezonlari formasi" : `Texnik topshiriq · ${f.page}-sahifa`;
    return `<article class="card flag">
      <div class="flag-head">
        <span class="sev ${esc(f.severity)}">${esc(SEV[f.severity] || f.severity)}</span>
        <h3>${esc(flagLabel(f))}</h3>
        <span class="where">${f.criterion_no ? `<span class="tag">${esc(f.criterion_no)}-mezon</span>` : ""}${where ? `<span class="tag">${esc(where)}</span>` : ""}</span>
      </div>
      <div class="category">AI belgilagan cheklovchi shart · inson tasdiqlamagan</div>
      <div class="doc"><span class="page-tag">${esc(docTag)}</span><span class="ctx">… </span><mark>${esc(q)}</mark><span class="ctx"> …</span></div>
      ${tl ? `<div class="translit"><b>Lotin yozuvida:</b> ${esc(tl)}</div>` : ""}
      ${more}
      <div class="flag-body">
        <div><h4>Nega bu muammo</h4><p>${esc(scrub(f.explanation_uz, lot))}</p></div>
        <div class="rewrite"><h4>Neytral tahrir taklifi</h4><p>${esc(scrub(f.rewrite_uz, lot))}</p></div>
      </div>
    </article>`;
  }

  const CO_PLACEHOLDERS = [/\[Kompaniya nomi\]/g, /\[Tashkilot nomi(, STIR)?\]/g];
  // the letter's subject line comes from the clean Latin title (never a raw/classifier title)
  function letterText(lot) {
    const subject = PRESENT ? lotTitle(lot) : (lot.subject_uz || lot.title || "");
    const d = new Date();
    const today = `${d.getDate()}-${MONTHS[d.getMonth()]} ${d.getFullYear()}-yil`;
    const txt = String(lot.clarification_letter_uz || "")
      .replace(/^(Xarid predmeti:).*$/m, (m, h) => `${h} ${subject}`)
      .replace(/\[Sana\]/g, today)
      .replace(/(\d+)-bet\b/g, "$1-sahifa");
    return scrub(txt, lot);
  }
  function showLetter(lot, instant) {
    const full = letterText(lot);
    const closed = isClosed(lot);
    const deadline = !closed && lot.clarific_date && timeLeft(lot.clarific_date);
    openModal(closed ? "Aniqlik so'rovi xati (namuna)" : "Aniqlik so'rovi xati", `
      <div class="field"><label for="coName">Kompaniya nomi</label><input id="coName" placeholder="Kompaniyangiz nomi (ixtiyoriy)"></div>
      <pre class="letter typing" id="letterText"></pre>`,
      `<span class="note">${closed ? "Lot yopilgan: xat faqat namuna sifatida ko'rsatilmoqda." : deadline ? `Xat ${esc(fmtDate(lot.clarific_date))} gacha yuborilishi kerak (aniqlik so'rash muddati).` : "Xatni elektron tizim orqali yuboring."}</span>
       <button class="btn" id="copyBtn">${ICON.copy} Nusxa olish</button>`);
    const pre = $("#letterText");
    let i = instant ? full.length : 0;
    const step = Math.max(8, Math.ceil(full.length / 90));
    const timer = setInterval(() => {
      i = Math.min(full.length, i + step);
      pre.textContent = full.slice(0, i);
      if (i >= full.length) { clearInterval(timer); pre.classList.remove("typing"); }
    }, 16);
    const current = () => {
      const co = $("#coName").value.trim();
      if (!co) return full;
      return CO_PLACEHOLDERS.reduce((t, re) => t.replace(re, (m, stir) => (stir ? `${co}, STIR: ________` : co)), full);
    };
    $("#coName").addEventListener("input", () => { clearInterval(timer); pre.classList.remove("typing"); pre.textContent = current(); });
    $("#copyBtn").addEventListener("click", async () => {
      const ok = await copyText(current());
      $("#copyBtn").innerHTML = ok ? `${ICON.check} Nusxa olindi` : "Nusxa olinmadi";
      toast(ok ? "Xat buferga nusxalandi" : "Nusxa olib bo'lmadi — matnni qo'lda belgilang");
    });
  }

  // ---------------------------------------------------------------- government
  function govBar(lot, groups, closed) {
    return `<div class="govbar">
      <div class="grow"><div class="eyebrow">Nazorat harakati</div>
        <div>${groups.length ? `${groups.length} ta cheklovchi shart topildi. ${closed ? "Lot yopilgan: tuzatishni keyingi e'lon uchun tavsiya qiling." : "Buyurtmachidan tuzatish kiritishni so'rang."}` : "Cheklovchi shart topilmadi."}</div></div>
      ${groups.length ? `<button class="btn" id="govSend">${ICON.letter} Tuzatish so'rovi loyihasini tayyorlash</button>` : ""}
    </div>`;
  }
  function correctionText(lot, groups) {
    const c = lot.customer || {};
    const lines = [
      `${custName(c.name, c.tin)}`,
      "Xarid komissiyasiga",
      "",
      `Mavzu: ${lot.lot_id}-son lot xarid hujjatlariga tuzatish kiritish to'g'risida`,
      "",
      `TenderLens monitoringi ${lot.lot_id}-son lot («${norm(lotTitle(lot))}») xarid hujjatlarida raqobatni cheklashi mumkin bo'lgan quyidagi shartlarni aniqladi:`,
      "",
    ];
    groups.forEach((f, i) => {
      lines.push(`${i + 1}. ${flagLabel(f)} (${whereText(f)}): «${scrub(norm(f.quote), lot)}»`);
      lines.push(`   Taklif etilayotgan neytral tahrir: ${scrub(f.rewrite_uz, lot)}`);
      lines.push("");
    });
    lines.push("Iltimos, ushbu shartlarni ko'rib chiqing va zarur bo'lsa, xarid hujjatlariga tuzatish kiriting. Bu maslahat xarakteridagi xabar; yakuniy qaror buyurtmachi tomonidan qabul qilinadi.");
    lines.push("", "Hurmat bilan,", "[Nazorat organi nomi]", "Monitoring bo'limi");
    return lines.join("\n");
  }
  function showCorrection(lot, groups) {
    const text = correctionText(lot, groups);
    openModal("Tuzatish so'rovi loyihasi", `<pre class="letter">${esc(text)}</pre>`,
      `<span class="note">Loyiha: nusxa olib, rasmiy kanal orqali yuboring.</span>
       <button class="btn" id="corrCopy">${ICON.copy} Nusxa olish</button>`);
    $("#corrCopy").addEventListener("click", async () => toast((await copyText(text)) ? "Nusxa olindi" : "Nusxa olib bo'lmadi"));
  }

  // template_findings: shape is defined by the engine; read the likely field names defensively
  function findingText(t) {
    return t.summary_uz || t.text_uz || t.title_uz || t.finding_uz || t.description_uz || t.label_uz || t.summary || t.text || "";
  }
  function findingCount(t) {
    const n = typeof t.lots === "number" ? t.lots : t.lot_count != null ? t.lot_count : t.n_lots != null ? t.n_lots : t.count;
    if (n != null) return n;
    const ids = t.lot_ids || t.lots || t.examples;
    return Array.isArray(ids) ? ids.length : null;
  }
  function findingLots(t, known) {
    const ids = [].concat(t.likely_not_applicable_lot_ids || [], t.lot_ids || []);
    const out = [];
    ids.map((x) => (typeof x === "object" && x ? x.lot_id || x.id : x)).forEach((x) => {
      if (/^\d{6,}$/.test(String(x)) && (!known || known.has(String(x))) && !out.includes(String(x))) out.push(String(x));
    });
    return out.slice(0, 4);
  }
  function systemicCard(stats, index) {
    const known = new Set((index || []).map((l) => String(l.lot_id)));
    const list = Array.isArray(stats.template_findings) ? stats.template_findings : [];
    if (!list.length) return "";
    const item = (t, hidden) => {
      const n = findingCount(t), lots = findingLots(t, known), na = t.likely_not_applicable;
      return `<div class="sys-item${hidden ? " sys-more" : ""}"${hidden ? " hidden" : ""}>
        ${n != null ? `<div class="sys-n">${grp(n)}<small>lot</small></div>` : ""}
        <div class="sys-body">
          <div class="sys-t">${esc(scrub(findingText(t), null))}</div>
          ${n != null ? `<div class="sys-den">${grp(stats.open_lots || 662)} ta ochiq lotdan ${grp(n)} tasida uchraydi</div>` : ""}
          ${na ? `<div class="sys-na">Taxminan <b>${grp(na)} tasida</b> xarid predmetiga mos kelmasligi mumkin — inson tekshiruvi kerak</div>` : ""}
          ${lots.length ? `<div class="sys-lots">${lots.map((id) => `<a href="#/gov/lot/${id}">№ ${id}</a>`).join(" ")}</div>` : ""}
        </div>
      </div>`;
    };
    return `<div class="card sys-card">
      <div class="sys-head">${ICON.grid}<h3>Tizimli muammolar</h3></div>
      <div class="sub">Platforma shablonidagi bir xil mezon ko'plab ochiq lotlarda takrorlanadi — uni bitta joyda tuzatish mumkin.</div>
      ${item(list[0], false)}
      ${list.slice(1, 4).map((t) => item(t, true)).join("")}
      ${list.length > 1 ? `<button class="btn ghost sys-toggle" type="button" onclick="this.parentNode.querySelectorAll('.sys-more').forEach(function(e){e.hidden=!e.hidden});this.textContent=this.textContent.indexOf('Yana')===0?'Yopish':'Yana ${Math.min(3, list.length - 1)} ta'">Yana ${Math.min(3, list.length - 1)} ta</button>` : ""}
    </div>`;
  }

  let govState = { sector: "all", onlyFlagged: false, limit: 12 };
  async function renderGov() {
    setTab("gov");
    loading("Lotlar xavf bo'yicha saralanmoqda…");
    let stats, index;
    try {
      [stats, index] = await Promise.all([api("stats"), api("lots")]);
      index = index.slice();
    } catch (e) {
      view.innerHTML = `<div class="card error-box"><h2>${notAnalysed(e) ? "Tahlil natijalari topilmadi" : "Ma'lumotlarni yuklab bo'lmadi"}</h2><p class="muted">${notAnalysed(e) ? "Oldindan tahlil qilingan lotlar hozircha mavjud emas." : FRIENDLY_ERR}</p><p>${retryBtn()}</p></div>`;
      return;
    }
    buildAliases(index);
    const NON_STATE = /^(joint_venture|private|foreign|non_state)$/;
    const hiddenN = index.filter((l) => NON_STATE.test(l.customer_kind || "")).length;
    index = index.filter((l) => !NON_STATE.test(l.customer_kind || ""));
    // every number on this screen is computed from the same list the table shows
    const findings = (l) => (l.finding_count != null ? l.finding_count : l.flag_count);
    const analysedN = index.filter((l) => l.fairness_score != null).length;
    const flaggedN = index.filter((l) => (findings(l) || 0) > 0).length;
    const openN = index.filter((l) => !isClosed(l)).length;
    const mt = moneyParts(index.reduce((sum, l) => sum + (l.money_on_table_uzs || 0), 0));
    const ov = moneyParts(stats.open_value_uzs || 0);
    const today = fmtDate(stats.generated_at, false);

    view.innerHTML = `
      <div class="dash-head">
        <div><div class="eyebrow">Davlat xaridlari nazorati uchun · xarid agentligi va Raqobat qo'mitasi</div>
        <h1>Tahlil qilingan lotlar — xavf navbati</h1></div>
        <div class="muted">Ma'lumot: ${esc(today)} holatiga · ${grp(analysedN)} ta lot, shundan ${grp(openN)} tasi hali ochiq</div>
      </div>
      <section class="tiles">
        <div class="card tile"><div class="k">Tahlil qilingan lotlar</div><div class="v">${grp(analysedN)}</div><div class="s">${grp(stats.open_lots || 0)} ta ochiq lotdan (${esc(today)})${hiddenN ? `; davlat ulushisiz ${grp(hiddenN)} ta lot ko'rsatilmaydi` : ""}</div></div>
        <div class="card tile"><div class="k">Umumiy qiymat</div><div class="v">${esc(ov.num)} <small>${esc(ov.unit)}</small></div><div class="s">barcha ochiq lotlarning boshlang'ich narxlari</div></div>
        <div class="card tile warn"><div class="k">Cheklovchi shartli lotlar</div><div class="v">${grp(flaggedN)}</div><div class="s">AI belgilagan shartlar (inson tasdiqlamagan), ${grp(analysedN)} ta lotdan; har biri iqtibos bilan</div></div>
        <div class="card tile money"><div class="k">Tejash imkoniyati <span class="est">taxminiy</span></div><div class="v">${esc(mt.num)} <small>${esc(mt.unit)}</small></div><div class="s">shu ${grp(analysedN)} lotda raqobat +2 ishtirokchiga oshsa</div></div>
      </section>
      <section class="dash-grid">
        <div class="card table-card">
          <div class="table-tools">
            <button class="chip ${govState.sector === "all" ? "on" : ""}" data-sector="all">Barchasi</button>
            ${Object.keys(SECTOR).map((s) => `<button class="chip ${govState.sector === s ? "on" : ""}" data-sector="${s}">${SECTOR[s]}</button>`).join("")}
            <span class="grow"></span>
            <label class="muted only-flagged"><input type="checkbox" id="onlyFlagged" ${govState.onlyFlagged ? "checked" : ""}> Faqat cheklovchi shartlilar</label>
          </div>
          <div class="table-scroll"><table class="risk">
            <thead><tr><th>#</th><th>Lot va buyurtmachi</th><th>Adolatlilik</th><th class="n c-flags">Shartlar</th><th class="n c-val">Qiymat</th><th class="n c-sav">Tejash <span class="est">taxminiy</span></th><th class="c-go"></th></tr></thead>
            <tbody id="riskBody"></tbody>
          </table></div>
          <div class="more" id="moreWrap"></div>
        </div>
        <div class="side-col">
          <div class="card chart-card">
            <h3>Ishtirokchilar soni va narx pasayishi</h3>
            <div class="sub">Boshlang'ich narxdan pasayish, mediana · ${grp(stats.deals_analysed || 0)} ta bitim (${esc(periodText(stats.deals_period))})</div>
            <div class="chart" id="curve"></div>
            <div class="insight" id="curveInsight"></div>
            <div class="footnote">Bu korrelyatsiya, sabab-oqibat isboti emas: lot turlari va hajmlari farq qiladi. Manba: UZEX etender ochiq API.</div>
          </div>
          ${systemicCard(stats, index)}
        </div>
      </section>`;

    drawCurve($("#curve"), stats.bidder_curve || [], $("#curveInsight"), stats);
    const drawTable = () => {
      let rows = index.slice();
      if (govState.sector !== "all") rows = rows.filter((l) => l.sector === govState.sector);
      if (govState.onlyFlagged) rows = rows.filter((l) => (findings(l) || 0) > 0);
      rows.sort(listSort);
      const shown = rows.slice(0, govState.limit);
      $("#riskBody").innerHTML = shown.map((l, i) => `
        <tr class="row" data-id="${l.lot_id}">
          <td class="rank">${i + 1}</td>
          <td><div class="lt">${esc(lotTitle(l))}</div><div class="lc">№ ${l.lot_id} · ${esc(custName(l.customer_name, l.customer_tin))} · ${esc(SECTOR[l.sector] || "")}${isClosed(l) ? " · " + closedPill : ""}</div></td>
          <td>${lightPill(l.traffic_light, l.fairness_score)}</td>
          <td class="n c-flags">${findings(l) == null ? "—" : `<b>${findings(l)}</b>`}</td>
          <td class="n c-val">${esc(money(l.start_cost, l.currency))}</td>
          <td class="n c-sav">${l.money_on_table_uzs ? esc(money(l.money_on_table_uzs)) : "—"}</td>
          <td class="go c-go" title="Ochish">›</td>
        </tr>`).join("") || `<tr><td colspan="7" class="empty">Bu filtr bo'yicha lot yo'q</td></tr>`;
      $("#moreWrap").innerHTML = rows.length > govState.limit
        ? `<button class="btn ghost" id="moreBtn">Yana ko'rsatish (${grp(rows.length - govState.limit)} ta qoldi)</button>` : "";
      const mb = $("#moreBtn");
      if (mb) mb.addEventListener("click", () => { govState.limit += 25; drawTable(); });
    };
    view.querySelectorAll("[data-sector]").forEach((b) => b.addEventListener("click", () => {
      govState.sector = b.dataset.sector;
      govState.limit = 12;
      view.querySelectorAll("[data-sector]").forEach((x) => x.classList.toggle("on", x === b));
      drawTable();
    }));
    $("#onlyFlagged").addEventListener("change", (e) => { govState.onlyFlagged = e.target.checked; drawTable(); });
    $("#riskBody").addEventListener("click", (e) => {
      const tr = e.target.closest("tr.row");
      if (tr) location.hash = "#/gov/lot/" + tr.dataset.id;
    });
    drawTable();
  }
  function periodText(p) {
    if (!p || p.indexOf("..") < 0) return p || "";
    const [a, b] = p.split("..");
    const ya = String(a).slice(0, 4), yb = String(b).slice(0, 4);
    return ya === yb ? `${fmtDate(a, false)} – ${fmtDate(b, false)} ${yb}` : `${fmtDate(a, false)} ${ya} – ${fmtDate(b, false)} ${yb}`;
  }

  // single-series bar chart, inline SVG, hover tooltip per bar; every number comes from stats.json
  function drawCurve(el, data, insightEl, stats) {
    if (!data.length) { el.innerHTML = '<div class="muted">Ma\'lumot yo\'q</div>'; return; }
    const W = 380, H = 260, P = { l: 40, r: 8, t: 26, b: 40 };
    const iw = W - P.l - P.r, ih = H - P.t - P.b;
    const top = Math.max(...data.map((d) => d.median_drop));
    const max = Math.max(0.1, Math.ceil(top * 1.12 * 20) / 20);
    const step = max > 0.25 ? 0.1 : 0.05;
    const ticks = [];
    for (let t = 0; t <= max + 1e-9; t += step) ticks.push(+t.toFixed(2));
    const bw = iw / data.length;
    const barW = Math.min(44, bw - 12);
    const y = (v) => P.t + ih - (v / max) * ih;
    const hi = new Set(["2", "4", "6+"]);
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ishtirokchilar soni bo'yicha narx pasayishi medianasi">`;
    ticks.forEach((t) => {
      svg += `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/>`;
      svg += `<text class="axis" x="${P.l - 8}" y="${y(t) + 4}" text-anchor="end">${Math.round(t * 100)}%</text>`;
    });
    data.forEach((d, i) => {
      const cx = P.l + bw * i + bw / 2;
      const x = cx - barW / 2, yy = y(d.median_drop), h = Math.max(2, P.t + ih - yy);
      const r = Math.min(4, h / 2);
      const path = `M${x},${P.t + ih} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + barW - r} Q${x + barW},${yy} ${x + barW},${yy + r} V${P.t + ih} Z`;
      svg += `<rect class="hit" data-i="${i}" x="${cx - bw / 2}" y="${P.t}" width="${bw}" height="${ih}" fill="transparent"/>`;
      svg += `<path class="bar ${hi.has(d.bidders) ? "hi" : ""}" data-i="${i}" d="${path}"/>`;
      svg += `<text class="axis" x="${cx}" y="${P.t + ih + 18}" text-anchor="middle">${esc(d.bidders)}</text>`;
      if (hi.has(d.bidders)) svg += `<text class="lbl" x="${cx}" y="${yy - 8}" text-anchor="middle">${grp(d.median_drop * 100, 1)}%</text>`;
    });
    svg += `<text class="axis" x="${P.l + iw / 2}" y="${H - 4}" text-anchor="middle">ishtirokchilar soni</text>`;
    svg += `</svg><div class="tip" hidden></div>`;
    el.innerHTML = svg;
    const tip = el.querySelector(".tip");
    const bars = el.querySelectorAll(".bar");
    el.querySelectorAll(".hit").forEach((h) => {
      h.addEventListener("mouseenter", () => {
        const i = +h.dataset.i, d = data[i];
        bars.forEach((b) => b.classList.toggle("focus", +b.dataset.i === i));
        const box = el.getBoundingClientRect(), bb = bars[i].getBoundingClientRect();
        tip.innerHTML = `<b>${esc(d.bidders)} ishtirokchi</b>: narx ${grp(d.median_drop * 100, 1)}% ga tushadi<br><span style="opacity:.75">${grp(d.n)} ta bitim</span>`;
        tip.style.left = bb.left - box.left + bb.width / 2 + "px";
        tip.style.top = bb.top - box.top + "px";
        tip.hidden = false;
      });
      h.addEventListener("mouseleave", () => { tip.hidden = true; bars.forEach((b) => b.classList.remove("focus")); });
    });
    const get = (k) => data.find((d) => d.bidders === k);
    const two = get("2"), four = get("4"), six = get("6+");
    if (two && six && insightEl) {
      const total = data.reduce((s, d) => s + d.n, 0);
      const share2 = stats && stats.share_exactly_2_bidders != null ? stats.share_exactly_2_bidders : two.n / total;
      insightEl.innerHTML = `Bitimlarning <b>${grp(share2 * 100, 1)} foizida</b> atigi 2 ishtirokchi bo'lgan: narx mediana <b>${grp(two.median_drop * 100, 1)}%</b> tushadi.` +
        (four ? ` 4 ishtirokchida — <b>${grp(four.median_drop * 100, 1)}%</b>,` : "") +
        ` 6 va undan ortiqda — <b>${grp(six.median_drop * 100, 1)}%</b>.`;
    }
  }

  // ---------------------------------------------------------------- router
  function route() {
    closeModal();
    document.documentElement.classList.remove("focus", "focus-score", "focus-flags");
    const h = location.hash || "#/";
    const qs = new URLSearchParams(h.split("?")[1] || "");
    const opts = { letter: qs.has("letter"), send: qs.has("send"), focus: qs.get("focus") };
    let m;
    if ((m = h.match(/^#\/gov\/lot\/(\d+)/))) return renderLot(m[1], true, opts);
    if ((m = h.match(/^#\/lot\/(\d+)/))) return renderLot(m[1], false, opts);
    if (h.startsWith("#/gov")) return renderGov();
    return renderHome(qs.has("q") ? qs.get("q") : null);
  }
  window.addEventListener("hashchange", route);
  setPresent(PRESENT, true);
  route();
})();
