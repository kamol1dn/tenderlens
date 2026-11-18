// TenderLens pitch deck generator (Uzbek Latin).
// Run from anywhere:  node D:\projects\hackathon\tenderlens\deck\build\build_deck.js
// Inputs:  deck/deck-data.json (eval numbers, screenshot paths), app/screenshots/ (auto-detected)
// Outputs: deck/TenderLens.pptx, deck/speaker-notes.md (notes come from the same strings)
// Every number on a slide must trace to a V, V* or C row in national-research/report.md.

const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("./apply_theme.js");

const DECK = path.resolve(__dirname, "..");
const ROOT = path.resolve(DECK, "..");
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
// Test builds: node build_deck.js --data other.json --out C:/tmp/x.pptx (speaker notes go next to --out)
const DATA = JSON.parse(fs.readFileSync(arg("--data") || path.join(DECK, "deck-data.json"), "utf8"));
const SHOTS_DIR = path.join(ROOT, "app", "screenshots");
// --alphabet yangi: new Uzbek Latin alphabet (law of 21.10.2026): o'→ö, g'→ğ, sh→ş, ch→ç; tutuq stays (ʼ).
const NEW_ABC = /^(yangi|new)$/i.test(arg("--alphabet") || "");
const SUFFIX = NEW_ABC ? "_yangi_alifbo" : "";
const OUT = arg("--out") ? path.resolve(arg("--out")) : path.join(DECK, `TenderLens${SUFFIX}.pptx`);
const NOTES_MD = arg("--out") ? OUT.replace(/\.pptx$/i, "-speaker-notes.md") : path.join(DECK, `speaker-notes${SUFFIX}.md`);
const EV = DATA.eval || {};
const evFilled = EV.precision_k != null && EV.precision_n != null; // variant (a) only with real human labels
const fmt = (x) => String(x).replace(".", ",");

// ---------- theme ----------
const HEX = {
  ink: "1B2624", white: "FFFFFF", teal: "0B3D3A", tint: "EEF3F2",
  amber: "F5A524", red: "D7263D", green: "17824F", tealMid: "13716A",
  muted: "5B6B68", magenta: "C2185B", grey: "9AA8A5", line: "D5DFDD",
};
const THEME = {
  name: "TenderLens",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: HEX.ink, lt1: HEX.white, dk2: HEX.teal, lt2: HEX.tint,
    accent1: HEX.amber, accent2: HEX.red, accent3: HEX.green, accent4: HEX.tealMid,
    accent5: HEX.muted, accent6: HEX.magenta, hlink: HEX.tealMid, folHlink: HEX.muted,
  },
};

const NB = "\u00A0"; // keep numbers and units together
const n = (s) => s // bind only digit groups and number+unit pairs, never whole sentences
  .replace(/(\d) (?=\d{3}(?!\d))/g, "$1" + NB)
  .replace(/(\d%?|\+) (mln|mlrd|trln|so'm|ball|bitim|lot|tenge|token|ta)(?=[\s.,;:)]|$)/g, "$1" + NB + "$2")
  .replace(/(mln|mlrd|trln) (so'm|tenge)/g, "$1" + NB + "$2");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.title = "TenderLens";
pres.author = "Team Eclipse";
pres.company = "Team Eclipse";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const COL = {
  ink: C.text1, white: C.background1, teal: C.text2, tint: C.background2,
  amber: C.accent1, red: C.accent2, green: C.accent3, tealMid: C.accent4, muted: C.accent5, magenta: C.accent6,
};

const W = 13.333, M = 0.6, CW = W - 2 * M;
const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 90, opacity: 0.14 });

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "TL_CONTENT",
  background: { color: COL.white },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.35, w: CW, h: 0.85, fontSize: 34, bold: true, color: COL.teal, valign: "middle", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "source", type: "body", x: M, y: 6.95, w: 10.6, h: 0.38, fontSize: 10, color: COL.muted, valign: "middle", margin: 0 }, text: "" } },
    { text: { text: "TenderLens", options: { x: 11.3, y: 6.95, w: 1.0, h: 0.38, fontSize: 10, bold: true, color: COL.tealMid, align: "right", valign: "middle", margin: 0 } } },
  ],
  slideNumber: { x: 12.35, y: 6.95, w: 0.38, h: 0.38, fontSize: 10, color: COL.muted, align: "right", valign: "middle", margin: 0 },
});
pres.defineSlideMaster({
  title: "TL_DARK",
  background: { color: COL.teal },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.45, w: CW, h: 0.9, fontSize: 40, bold: true, color: COL.white, valign: "middle", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "source", type: "body", x: M, y: 6.95, w: 10.6, h: 0.38, fontSize: 10, color: COL.tint, valign: "middle", margin: 0 }, text: "" } },
    { text: { text: "Team Eclipse", options: { x: 10.9, y: 6.95, w: 1.4, h: 0.38, fontSize: 10, bold: true, color: COL.amber, align: "right", valign: "middle", margin: 0 } } },
  ],
  slideNumber: { x: 12.35, y: 6.95, w: 0.38, h: 0.38, fontSize: 10, color: COL.tint, align: "right", valign: "middle", margin: 0 },
});
pres.defineSlideMaster({
  title: "TL_HOOK",
  background: { color: COL.teal },
  objects: [
    { placeholder: { options: { name: "source", type: "body", x: M, y: 6.95, w: 10.6, h: 0.38, fontSize: 10, color: COL.tint, valign: "middle", margin: 0 }, text: "" } },
  ],
});

// ---------- helpers ----------
async function icon(Comp, hex, px = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: px }));
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
function iconCircle(slide, data, x, y, d, fill, name) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name + " circle" });
  const s = d * 0.54;
  slide.addImage({ data, x: x + (d - s) / 2, y: y + (d - s) / 2, w: s, h: s, altText: name, objectName: name + " icon" });
}
function card(slide, x, y, w, h, fill, name, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: opts.r ?? 0.12, fill: { color: fill, transparency: opts.transparency ?? 0 },
    line: opts.line ? { color: opts.line, width: opts.lineW ?? 1, dashType: opts.dash ?? "solid" } : { color: fill, transparency: opts.transparency ?? 0 },
    shadow: opts.shadow ? shadow() : undefined, objectName: name,
  });
}
// ---------- alphabet ----------
// K() marks text that must never be converted (verbatim document quotes). T() converts (new alphabet) or just strips marks (old).
const KO = "\uE000", KC = "\uE001";
const MARKS = /[\uE000\uE001]/g;
const K = (s) => KO + s + KC;
const KEEP_WORDS = ["UZEX", "ISO", "PF-259", "ZRU-684", "VMQ", "OCDS", "CAPEX", "TenderLens", "TenderZone", "TenderGPT", "Team Eclipse", "National AI Hackathon", "SentinelTender", "TenderAI", "Telegram", "ProZorro", "DoZorro", "BRIAS", "ALICE", "CGU", "LLM", "API", "OCR", "MAKET", "PLACEHOLDER", "TradeList", "GetTrade", "DownloadFile", "DealsList", "speaker notes", "engine", "recall", "vision", "snapshot", "pitch", "chatbot"];
const keepRe = new RegExp("\\b(" + KEEP_WORDS.map((w) => w.replace(/[-.]/g, "\\$&")).join("|") + ")(?![A-Za-z])", "g");
const autoKeep = (s) => s
  .replace(/`[^`]*`/g, K)                                              // code spans
  .replace(/[\w.\-]*[\/_][\w.\-\/]*/g, K)                              // paths and file names with _ or /
  .replace(/\b[\w\-]+\.(?:md|js|json|pptx|uz|com|org|kz|br|ru)\b/g, K) // domains and files
  .replace(keepRe, K);
function toNew(seg) {
  return seg.replace(/[A-Za-zʻ'‘’ʼ]+/g, (w) => {
    if (/^[A-Z]{2,}$/.test(w.replace(/['ʻ‘’ʼ]/g, ""))) return w;      // acronyms stay
    const o = w
      .replace(/O['ʻ‘’]/g, "Ö").replace(/o['ʻ‘’]/g, "ö")
      .replace(/G['ʻ‘’]/g, "Ğ").replace(/g['ʻ‘’]/g, "ğ")
      .replace(/S[hH]/g, "Ş").replace(/sh/g, "ş")
      .replace(/C[hH]/g, "Ç").replace(/ch/g, "ç");
    return o.replace(/(?<=[A-Za-zÖöĞğŞşÇç])['‘’](?=[A-Za-zÖöĞğŞşÇç])/g, "ʼ"); // tutuq belgisi
  });
}
const CHANGED = new Map(); // word -> converted, for review
function T(x) {
  if (Array.isArray(x)) return x.map((r) => ({ ...r, text: T(r.text) }));
  if (typeof x !== "string") return x;
  // House style: no em dashes in our own text (verbatim document quotes inside K() keep theirs).
  const noDash = (p) => p.replace(/\s*—\s*/g, ", ");
  return (NEW_ABC ? autoKeep(x) : x).split(/([^]*)/).map((p) => {
    if (p.startsWith(KO)) return p.replace(MARKS, "");
    const d = noDash(p);
    if (!NEW_ABC) return d;
    d.replace(/[A-Za-zʻ'‘’ʼ]+/g, (w) => { const c = toNew(w); if (c !== w) CHANGED.set(w, c); return w; });
    return toNew(d);
  }).join("").replace(MARKS, "");
}

function txt(slide, text, o) {
  slide.addText(T(text), Object.assign({ isTextBox: true, margin: 0, valign: "top", fontSize: 15, color: COL.ink, paraSpaceAfter: 0 }, o));
}
function placeholderBox(slide, x, y, w, h, label, name) {
  card(slide, x, y, w, h, COL.white, name, { line: COL.magenta, lineW: 2, dash: "dash", r: 0.08 });
  txt(slide, label, { x: x + 0.2, y, w: w - 0.4, h, fontSize: 14, bold: true, color: COL.magenta, align: "center", valign: "middle", objectName: name + " label" });
}
function source(slide, text) { slide.addText(T(text), { placeholder: "source" }); }
function title(slide, text) { slide.addText(T(text), { placeholder: "title" }); }

function findShot(kind) { // returns { rows: [[{ file, crop }]] } or null
  let v = DATA.screenshots && DATA.screenshots[kind];
  if (!v) return null; // null = keep the marked mock-up / placeholder
  const part = (x) => {
    if (typeof x === "string") x = { path: x };
    if (x.path === "auto") {
      if (!fs.existsSync(SHOTS_DIR)) return null;
      const re = { supplier: /supplier|lot|taminotchi|bobur/i, agency: /agency|dashboard|panel|queue|gov/i, bot: /bot|telegram/i }[kind.replace("backup_", "")];
      const f = fs.readdirSync(SHOTS_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f) && re.test(f)).sort()[0];
      return f ? { file: path.join(SHOTS_DIR, f), crop: x.crop || null } : null;
    }
    const f = path.resolve(ROOT, x.path);
    return fs.existsSync(f) ? { file: f, crop: x.crop || null } : null;
  };
  // forms: "path" | "auto" | { path, crop } | [[part, part], [part]] (rows of parts, composited)
  const rows = Array.isArray(v) ? v.map((r) => (Array.isArray(r) ? r : [r]).map(part)) : [[part(v)]];
  return rows.every((r) => r.every(Boolean)) ? { rows } : null;
}
async function shotBuffer(shot) {
  const G = 16, rows = [];
  for (const r of shot.rows) {
    const imgs = [];
    for (const p of r) {
      let im = sharp(p.file);
      if (p.crop) { const [left, top, width, height] = p.crop; im = im.extract({ left, top, width, height }); }
      const buf = await im.png().toBuffer(); const m = await sharp(buf).metadata();
      imgs.push({ buf, w: m.width, h: m.height });
    }
    rows.push(imgs);
  }
  if (rows.length === 1 && rows[0].length === 1) return { buf: rows[0][0].buf, w: rows[0][0].w, h: rows[0][0].h };
  const rw = (r) => r.reduce((a, x) => a + x.w, 0) + G * (r.length - 1), rh = (r) => Math.max(...r.map((x) => x.h));
  const Wc = Math.max(...rows.map(rw)), Hc = rows.reduce((a, r) => a + rh(r), 0) + G * (rows.length - 1);
  const comps = []; let y = 0;
  for (const r of rows) { let x = Math.round((Wc - rw(r)) / 2); for (const im of r) { comps.push({ input: im.buf, left: x, top: y }); x += im.w + G; } y += rh(r) + G; }
  const buf = await sharp({ create: { width: Wc, height: Hc, channels: 3, background: "#F3F4F6" } }).composite(comps).png().toBuffer();
  return { buf, w: Wc, h: Hc };
}
// Fit inside the box, top-aligned and centred horizontally, with a thin border. Returns the image bottom edge.
async function placeShot(slide, shot, x, y, w, h, alt) {
  const im = await shotBuffer(shot);
  const r = Math.min(w / im.w, h / im.h), iw = im.w * r, ih = im.h * r, ix = x + (w - iw) / 2;
  slide.addImage({ data: "image/png;base64," + im.buf.toString("base64"), x: ix, y, w: iw, h: ih, altText: alt, objectName: alt });
  slide.addShape(pres.shapes.RECTANGLE, { x: ix, y, w: iw, h: ih, fill: { color: COL.white, transparency: 100 }, line: { color: HEX.line, width: 1 }, objectName: alt + " border" });
  return { bottom: y + ih, left: ix, width: iw };
}
const PRESENTATION_CAPTION = "Taqdimot rejimi: buyurtmachi nomlari yashirilgan";
function shotCaption(slide, text, x, y, w) {
  txt(slide, [{ text, options: { bold: true, color: COL.teal, breakLine: true } }, { text: PRESENTATION_CAPTION, options: { italic: true, color: COL.muted, fontSize: 11 } }], { x, y, w, h: 0.5, fontSize: 13 });
}
function makTag(slide, x, y) { // small pill that sits inside a mock-up header bar
  card(slide, x, y, 1.15, 0.32, COL.magenta, "MAKET tag", { r: 0.16 });
  txt(slide, "MAKET", { x, y, w: 1.15, h: 0.32, fontSize: 12, bold: true, color: COL.white, align: "center", valign: "middle" });
}

// ---------- speaker notes (single source for pptx notes and speaker-notes.md) ----------
const NOTES = [];
function notes(slide, t, time, text) { slide.addNotes(T(text)); NOTES.push({ t: T(t), time, text: T(text) }); }

// ---------- engine data (single source of numbers: tenderlens/data/cache, see CONTRACT.md "Contract decisions") ----------
const CACHE = path.join(ROOT, "data", "cache");
const STATS = JSON.parse(fs.readFileSync(path.join(CACHE, "stats.json"), "utf8"));
const curve = Object.fromEntries(STATS.bidder_curve.map((b) => [b.bidders, b.median_drop * 100]));
const pct = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace(".", ",") + "%";
const dmy = (iso) => iso.split("-").reverse().join(".");
const [P_FROM, P_TO] = STATS.deals_period.split("..").map(dmy);
const thou = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
const CURVE_SRC = n(`Manba: UZEX etender ochiq API (DealsList), ${P_FROM}–${P_TO}, ${thou(STATS.deals_analysed)} bitim — o'z hisobimiz`);
function lot(id) { const f = path.join(CACHE, "lots", id + ".json"); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null; }
// Quotes shown on slides must equal the engine's verified quote; fail the build if the cache disagrees.
function verifiedQuote(id, needle) {
  const L = lot(id);
  const f = L && L.flags.find((x) => x.quote_verified && x.quote.includes(needle));
  if (!f) throw new Error(`lot ${id}: no verified flag quoting "${needle}" in data/cache/lots — re-check before showing it`);
  return f.quote;
}
const Q524954 = verifiedQuote("524954", "8 mlrd");
const Q525192 = verifiedQuote("525192", "ИСО-9001");
const Q524784 = verifiedQuote("524784", "ветеринария");
const Q524769 = verifiedQuote("524769", "40 foiz");
const END = (id) => (lot(id) || {}).end_date || "";
const ANALYSED = STATS.analysed_lots, OPEN = STATS.open_lots;
const INDEX = JSON.parse(fs.readFileSync(path.join(CACHE, "index.json"), "utf8"));
const LIGHTS = INDEX.reduce((a, x) => ((a[x.traffic_light] = (a[x.traffic_light] || 0) + 1), a), {});
const ANALYSED_BN = (INDEX.reduce((a, x) => a + (x.start_cost || 0), 0) / 1e9).toFixed(0);
const TPL = Object.fromEntries((STATS.template_findings || STATS.template_labels || []).map((t) => [t.key, t]));
const VET = TPL.veterinary_control, TRAIN = TPL.staff_training, IPR = TPL.intellectual_property;
if (!VET || !TRAIN || !IPR) throw new Error("stats.json: template findings missing");
// Flags in the cache: all must carry a verified quote; split by where the quote comes from.
const FLAGS = (() => {
  const dir = path.join(CACHE, "lots"); let total = 0, verified = 0, spec = 0, form = 0;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    for (const fl of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).flags || []) {
      total++; if (fl.quote_verified) verified++;
      if (fl.source === "platform_form") form++; else spec++;
    }
  }
  return { total, verified, spec, form };
})();
// Market size from our own deal history: last 12 months up to the newest deal.
const PRICING = DATA.pricing_proposal || { per_check: 49000, monthly: 290000, consultant_monthly: 990000, illustration_share: 0.1 };
const MARKET = (() => {
  const dir = path.join(ROOT, "data", "raw", "deals"); const seen = new Map();
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) for (const r of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) seen.set(r.deal_id, r);
  const rows = [...seen.values()];
  const to = rows.reduce((m, r) => (r.deal_date > m ? r.deal_date : m), "").slice(0, 10);
  const fd = new Date(to + "T00:00:00Z"); fd.setUTCFullYear(fd.getUTCFullYear() - 1); fd.setUTCDate(fd.getUTCDate() + 1);
  const from = fd.toISOString().slice(0, 10);
  const last = rows.filter((r) => r.deal_date.slice(0, 10) >= from);
  const uzs = last.filter((r) => r.currency_name === "Сум");
  const winners = new Set(last.map((r) => r.provider_inn).filter((x) => x && x !== "None")).size;
  const open = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "raw", "open_lots.json"), "utf8"));
  const illus = winners * PRICING.illustration_share * PRICING.monthly * 12 / 1e9;
  return {
    deals: last.length, dealsK: Math.round(last.length / 1000), buyers: new Set(last.map((r) => r.customer_inn)).size, winners,
    uzsTrn: (uzs.reduce((m, r) => m + parseFloat(r.start_cost), 0) / 1e12).toFixed(1).replace(".", ","),
    from: dmy(from), to: dmy(to), openBuyers: new Set(open.map((x) => x.seller_tin)).size, illustrationBn: illus.toFixed(1).replace(".", ","),
  };
})();
const PRICES = [
  `Bitta chuqur tekshiruv va xat: ${thou(PRICING.per_check)} so'm`,
  `Oylik obuna (ogohlantirish + 20 tekshiruv): ${thou(PRICING.monthly)} so'm`,
  `Konsultant tarifi (ko'p mijoz): ${thou(PRICING.consultant_monthly)} so'm/oy`,
];
const TEAM = Array.isArray(DATA.team) ? DATA.team : []; // "Ism: rol" lines; empty = marked placeholder
const light = (id) => ({ red: COL.red, amber: COL.amber, green: COL.green }[(lot(id) || {}).traffic_light] || HEX.grey);

// ---------- mockups (verified content only: engine-verified quotes, stats.json counts; no customer names) ----------
function supplierMock(slide, x, y, w, h) {
  card(slide, x, y, w, h, COL.white, "Supplier screen mockup", { line: HEX.line, shadow: true, r: 0.1 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.5, fill: { color: COL.teal }, line: { color: COL.teal }, objectName: "mock header" });
  txt(slide, [{ text: "TenderLens", options: { bold: true, color: COL.amber } }, { text: "  ·  Lot 525192", options: { color: COL.white } }], { x: x + 0.25, y, w: w - 2, h: 0.5, fontSize: 14, valign: "middle" });
  txt(slide, "Yetkazib beruvchi", { x: x + w - 3.2, y, w: 1.6, h: 0.5, fontSize: 12, color: COL.tint, align: "right", valign: "middle" });
  const ix = x + 0.3, iw = w - 0.6;
  txt(slide, "6/10 kV ajratgich, 2 dona: avariya zaxirasi", { x: ix, y: y + 0.66, w: iw, h: 0.38, fontSize: 18, bold: true, color: COL.teal });
  txt(slide, n("Andijon viloyati · boshlang'ich narx: 5,3 mln so'm · 20.11 gacha ochiq"), { x: ix, y: y + 1.04, w: iw, h: 0.3, fontSize: 13, color: COL.muted });
  card(slide, ix, y + 1.46, 3.9, 0.34, COL.red, "flag pill", { r: 0.17 });
  txt(slide, "Xarid predmetiga aloqasi bo'lmagan talab", { x: ix, y: y + 1.46, w: 3.9, h: 0.34, fontSize: 12, bold: true, color: COL.white, align: "center", valign: "middle" });
  card(slide, ix, y + 1.92, iw, 1.05, COL.tint, "quote box", { r: 0.08 });
  txt(slide, [
    { text: "Texnik topshiriq, 3-bet: ", options: { bold: true, breakLine: true } },
    { text: "«" + K(Q525192) + "»", options: { italic: true } },
  ], { x: ix + 0.2, y: y + 1.97, w: iw - 0.4, h: 0.95, fontSize: 13, valign: "middle" });
  txt(slide, n("To'rtta ISO sertifikati 5,3 mln so'mlik 2 ta ajratgich uchun. Texnik o'tish bali 80 = maksimal ball."), { x: ix, y: y + 3.1, w: iw, h: 0.6, fontSize: 14 });
  card(slide, ix, y + h - 0.82, 3.55, 0.52, COL.amber, "verdict pill", { r: 0.1 });
  txt(slide, "Qatnashing, lekin avval aniqlik so'rang", { x: ix, y: y + h - 0.82, w: 3.55, h: 0.52, fontSize: 14, bold: true, color: COL.ink, align: "center", valign: "middle" });
  card(slide, ix + 3.7, y + h - 0.82, iw - 3.7, 0.52, COL.teal, "letter button", { r: 0.1 });
  txt(slide, "Aniqlik so'rovi xatini yaratish", { x: ix + 3.7, y: y + h - 0.82, w: iw - 3.7, h: 0.52, fontSize: 13, bold: true, color: COL.white, align: "center", valign: "middle" });
}
function agencyMock(slide, x, y, w, h) {
  card(slide, x, y, w, h, COL.white, "Agency screen mockup", { line: HEX.line, shadow: true, r: 0.1 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.5, fill: { color: COL.teal }, line: { color: COL.teal }, objectName: "mock header" });
  txt(slide, [{ text: "Davlat nazorati paneli", options: { bold: true, color: COL.white } }], { x: x + 0.25, y, w: w - 1.8, h: 0.5, fontSize: 14, valign: "middle" });
  txt(slide, n(`${ANALYSED} tahlil qilindi (${OPEN} ochiq lotdan) · ${LIGHTS.red || 0} qizil · ${LIGHTS.amber || 0} sariq · ${LIGHTS.green || 0} yashil`), { x: x + 0.3, y: y + 0.6, w: w - 0.6, h: 0.3, fontSize: 12, color: COL.muted });
  card(slide, x + 0.25, y + 0.98, w - 0.5, 0.95, COL.teal, "template finding row", { r: 0.08 });
  txt(slide, [{ text: `Shablon topilmalari: ${VET.lots} · ${TRAIN.lots} · ${IPR.lots} lot`, options: { bold: true, color: COL.amber, breakLine: true } }, { text: "Veterinariya mezoni · xodimlarni o'qitish · intellektual mulkni topshirish", options: { color: COL.white, fontSize: 12 } }], { x: x + 0.45, y: y + 1.02, w: w - 0.9, h: 0.88, fontSize: 14, valign: "middle" });
  const rows = [
    { id: "525192", t: "525192 · Ajratgich, 2 dona", s: n("4 ta ISO sertifikati, lot 5,3 mln so'm") },
    { id: "524769", t: "524769 · Shifoxona bemorlari ovqati", s: n("Bank hisobida shartnoma summasining 40% i") },
    { id: "524954", t: "524954 · Loyihalash ishlari (yopilgan)", s: n("Aylanma 8 mlrd so'm, lot 330,4 mln (≈24×)") },
  ];
  let ry = y + 2.05;
  for (const r of rows) {
    card(slide, x + 0.25, ry, w - 0.5, 0.78, COL.tint, "queue row", { r: 0.08 });
    slide.addShape(pres.shapes.OVAL, { x: x + 0.42, y: ry + 0.14, w: 0.24, h: 0.24, fill: { color: light(r.id) }, line: { color: light(r.id) }, objectName: "traffic light" });
    txt(slide, r.t, { x: x + 0.82, y: ry + 0.06, w: w - 1.2, h: 0.34, fontSize: 14, bold: true });
    txt(slide, r.s, { x: x + 0.82, y: ry + 0.4, w: w - 1.2, h: 0.32, fontSize: 12, color: COL.muted });
    ry += 0.86;
  }
}

// ---------- build ----------
async function build() {
  const I = {
    search: await icon(fa.FaSearch, HEX.teal), user: await icon(fa.FaUserTie, HEX.teal), gov: await icon(fa.FaLandmark, HEX.white),
    child: await icon(fa.FaChild, HEX.white), hosp: await icon(fa.FaHospital, HEX.white), utens: await icon(fa.FaUtensils, HEX.white),
    api: await icon(fa.FaDatabase, HEX.white), ocr: await icon(fa.FaFileAlt, HEX.white), llm: await icon(fa.FaRobot, HEX.white),
    check: await icon(fa.FaCheckDouble, HEX.white), score: await icon(fa.FaBalanceScale, HEX.white), screens: await icon(fa.FaDesktop, HEX.white),
    quote: await icon(fa.FaQuoteLeft, HEX.teal), gavel: await icon(fa.FaGavel, HEX.teal), building: await icon(fa.FaBuilding, HEX.teal),
    robot: await icon(fa.FaRobot, HEX.teal), store: await icon(fa.FaStore, HEX.teal), shield: await icon(fa.FaUniversity, HEX.teal),
    users: await icon(fa.FaUsers, HEX.teal), flag: await icon(fa.FaFlag, HEX.white), tg: await icon(fa.FaTelegramPlane, HEX.white),
  };

  // ================= MAIN DECK (8 slides) =================
  // ===== 1. Bobur's story (hook) =====
  pres.addSection({ title: "Asosiy" });
  let s = pres.addSlide({ masterName: "TL_HOOK", sectionTitle: "Asosiy" });
  iconCircle(s, I.search, M, 0.45, 0.62, COL.amber, "TenderLens logo");
  txt(s, "TenderLens", { x: M + 0.8, y: 0.45, w: 4, h: 0.62, fontSize: 26, bold: true, color: COL.white, valign: "middle" });
  txt(s, n("Team Eclipse · National AI Hackathon, Toshkent · Tadbirkorlik yo'nalishi"), { x: 6.2, y: 0.45, w: W - M - 6.2, h: 0.62, fontSize: 13, color: COL.tint, align: "right", valign: "middle" });
  txt(s, n("Bobur 5,3 mln so'mlik tenderda narx bosqichiga ham o'tolmaydi"), { x: M, y: 1.3, w: 7.6, h: 1.25, fontSize: 32, bold: true, color: COL.white, valign: "middle" });
  txt(s, "Bobur kichik yetkazib beruvchi, elektr jihozlari sotadi. Lot 525192: ikkita 6/10 kV ajratgich, avariya zaxirasi. Texnik topshiriqning 3-betida, «Transport talablari» bo'limida:", { x: M, y: 2.65, w: 7.6, h: 0.9, fontSize: 17, color: COL.tint });
  card(s, M, 3.6, 7.6, 1.45, COL.white, "quote card", { transparency: 90 });
  txt(s, [
    { text: "«" + K(Q525192) + "»", options: { bold: true, color: COL.amber, fontSize: 16, breakLine: true } },
    { text: "ISO 9001, 14001, 45001, 50001 va xalqaro laboratoriya sertifikati", options: { italic: true, color: COL.tint, fontSize: 13 } },
  ], { x: M + 0.25, y: 3.65, w: 7.1, h: 1.35, valign: "middle" });
  txt(s, "Baholash faqat narx bo'yicha, lekin texnik o'tish bali maksimal ballga teng: bitta hujjat yetishmasa, Bobur chetda qoladi.", { x: M, y: 5.12, w: 7.6, h: 0.65, fontSize: 16, color: COL.white });
  card(s, 8.55, 1.4, W - M - 8.55, 1.9, COL.white, "stat card 1", { transparency: 90 });
  txt(s, n("8 647"), { x: 8.8, y: 1.5, w: 3.8, h: 0.8, fontSize: 48, bold: true, color: COL.amber, valign: "middle" });
  txt(s, "muayyan ishtirokchilarga imtiyoz yaratish holati, 2025 (Raqobat qo'mitasi)", { x: 8.8, y: 2.3, w: 3.75, h: 0.9, fontSize: 14, color: COL.white });
  card(s, 8.55, 3.5, W - M - 8.55, 1.55, COL.white, "stat card 2", { transparency: 90 });
  txt(s, n("16 135"), { x: 8.8, y: 3.6, w: 3.8, h: 0.7, fontSize: 40, bold: true, color: COL.amber, valign: "middle" });
  txt(s, n("tenderda raqobatga qarshi harakat topildi (jami 28 304 ta)"), { x: 8.8, y: 4.3, w: 3.75, h: 0.7, fontSize: 14, color: COL.white });
  txt(s, [
    { text: "TenderLens", options: { bold: true, color: COL.amber } },
    { text: " texnik topshiriq va baholash mezonlarini o'qiydi va ishtirokchilar doirasini toraytirishi mumkin bo'lgan shartni so'zma-so'z iqtibos bilan ko'rsatadi.", options: { color: COL.white } },
  ], { x: M, y: 5.9, w: CW, h: 0.9, fontSize: 20, valign: "middle" });
  source(s, n("Manba: lot 525192, UZEX etender, 17.11.2026; Raqobat qo'mitasi 2025 yakunlari, gazeta.uz, 10.03.2026"));
  notes(s, "Bobur hikoyasi", "0:00–0:35",
    "Bobur kichik yetkazib beruvchi, elektr jihozlari sotadi. U 5,3 million so'mlik tender topdi: ikkita ajratgich. Texnik topshiriqning 3-betida, transport talablari bo'limida, to'rtta ISO sertifikati va xalqaro laboratoriya sertifikati so'raladi. Baholash faqat narx bo'yicha, lekin texnik o'tish bali maksimal ballga teng: bitta hujjat yetishmasa, Bobur narx bosqichiga ham o'tolmaydi. " +
    "Bu yakka hol emas: 2025-yilda Raqobat qo'mitasi 16 135 ta tenderda 28 304 ta raqobatga qarshi harakat topdi, 8 647 tasi muayyan ishtirokchilarga imtiyoz yaratish. TenderLens texnik topshiriq va baholash mezonlarini o'qiydi va ishtirokchilar doirasini toraytirishi mumkin bo'lgan shartni so'zma-so'z iqtibos bilan ko'rsatadi.\n\n" +
    "Bir marta ayting: bizning bayroqlar signal, qo'mita xulosasi emas. 8 647 ni 28 304 ga qo'shmang. Buyurtmachi nomini aytmang. Faqat \"cheklovchi shartlar\" yoki \"adolatsiz shartlar\" deng (CONTRACT.md).");

  // ===== 2. Problem in numbers: bidder curve =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Asosiy" });
  title(s, "Ko'proq ishtirokchi bo'lgan savdolarda narx ko'proq tushgan");
  const cats = ["1", "2", "3", "4", "5", "6+"];
  s.addChart(pres.charts.BAR, [{ name: T("Mediana pasayish, %"), labels: cats.map((k) => `${k}\n${pct(curve[k])}`), values: cats.map((k) => Math.round(curve[k] * 10) / 10) }], {
    x: M, y: 1.4, w: 7.7, h: 5.35, barDir: "col", barGapWidthPct: 45,
    chartColors: [HEX.grey, HEX.red, HEX.tealMid, HEX.tealMid, HEX.tealMid, HEX.green],
    showTitle: true, title: T("Boshlang'ich narxdan pasayish (mediana), ishtirokchilar soni bo'yicha"), titleFontSize: 14, titleColor: COL.ink, titleFontFace: "+mn-lt",
    showValue: false,
    catAxisLabelFontSize: 15, catAxisLabelColor: COL.ink, catAxisLabelFontFace: "+mn-lt",
    showCatAxisTitle: true, catAxisTitle: T("Ishtirokchilar soni va narx pasayishi"), catAxisTitleFontSize: 13, catAxisTitleColor: COL.muted, catAxisTitleFontFace: "+mn-lt",
    valAxisMinVal: 0, valAxisMaxVal: 35, valAxisMajorUnit: 10, valAxisLabelFormatCode: '0"%"', valAxisLabelFontSize: 12, valAxisLabelColor: COL.muted, valAxisLabelFontFace: "+mn-lt",
    valGridLine: { color: HEX.line, size: 1 }, catGridLine: { style: "none" }, showLegend: false,
  });
  card(s, 8.6, 1.5, W - M - 8.6, 1.95, COL.teal, "52.5 callout", { r: 0.12 });
  txt(s, pct(STATS.share_exactly_2_bidders * 100), { x: 8.85, y: 1.6, w: 3.6, h: 0.8, fontSize: 44, bold: true, color: COL.amber, valign: "middle" });
  txt(s, "bitimda aynan 2 ishtirokchi: qonuniy minimum (ZRU-684: kamida 2 taklif)", { x: 8.85, y: 2.4, w: 3.65, h: 0.95, fontSize: 15, color: COL.white });
  card(s, 8.6, 3.65, W - M - 8.6, 1.75, COL.tint, "drop callout", { r: 0.12 });
  txt(s, [
    { text: "2 ishtirokchi: ", options: { bold: true, color: COL.red } }, { text: "−" + pct(curve["2"]), options: { bold: true, color: COL.red, fontSize: 26, breakLine: true } },
    { text: "6 va undan ko'p: ", options: { bold: true, color: COL.green } }, { text: "−" + pct(curve["6+"]), options: { bold: true, color: COL.green, fontSize: 26 } },
  ], { x: 8.85, y: 3.75, w: 3.65, h: 1.55, fontSize: 16, valign: "middle" });
  txt(s, "Bog'liqlik, sabab emas. Har bir narx toifasida ham shunday: 1 mlrd so'mdan yuqori lotlarda 2,6% va 21,9%.", { x: 8.6, y: 5.55, w: W - M - 8.6, h: 1.1, fontSize: 12, italic: true, color: COL.muted });
  source(s, CURVE_SRC);
  notes(s, "Raqobat va narx", "0:35–1:00",
    `Bu o'z hisobimiz: UZEX ochiq API'sidagi ${thou(STATS.deals_analysed)} ta bitim, ${P_FROM}–${P_TO}. Ikki ishtirokchili savdolarda narx boshlang'ich narxdan atigi ${pct(curve["2"])} tushgan, to'rttada ${pct(curve["4"])}, olti va undan ko'pida ${pct(curve["6+"])}. ` +
    `Bitimlarning ${pct(STATS.share_exactly_2_bidders * 100)} ida aynan ikki ishtirokchi bo'lgan: ZRU-684 bo'yicha tanlov va tender kamida ikki taklif bo'lsagina o'tgan hisoblanadi, ya'ni bu qonuniy minimum. Bu bog'liqlik, sabab emas.\n\n` +
    "Himoya (narx toifalari bo'yicha, 2 / 3 / 4 / 5 / 6+ ishtirokchi): 50 mln so'mgacha 2,4 / 10,0 / 37,3 / 50,5 / 58,4%; 50–200 mln 2,1 / 6,4 / 14,1 / 23,9 / 36,5%; 200 mln–1 mlrd 2,5 / 6,9 / 11,5 / 16,2 / 24,9%; 1 mlrd dan yuqori 2,6 / 5,3 / 8,7 / 12,0 / 21,9%. Byudjet buyurtmachilari: 2,0 / 15,9 / 28,8% (2 / 4 / 6+); korporativ: 3,9 / 16,1 / 30,0%. " +
    "Agar so'rashsa \"bitta ishtirokchili 550 bitim-chi?\": 550 ta (2,8%), 438 tasi korporativ; maydon baholashdan o'tganlarni sanashi mumkin, aniq bilmaymiz va tekshiramiz. Asosiy raqam bunga bog'liq emas. Ma'lumotda rad etilgan va bekor qilingan bitimlar ham bor (12%). Modda raqamlari (61 va 68) faqat so'rashsa.");

  // ===== 3. Demo (17.11 snapshot) =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Asosiy" });
  title(s, "Demo (17.11 snapshot)");
  const sup = findShot("supplier"), agy = findShot("agency");
  if (sup && agy) {
    const lw = 8.3, rx = M + lw + 0.3, rw = W - M - rx;
    const L = await placeShot(s, sup, M, 1.4, lw, 4.55, "Supplier screen: lot 525192");
    shotCaption(s, "Yetkazib beruvchi: lot 525192, ball, tavsiya, iqtibos", L.left, L.bottom + 0.1, L.width);
    const R = await placeShot(s, agy, rx, 1.4, rw, 4.55, "Government dashboard: tiles and template findings");
    shotCaption(s, "Davlat paneli: AI belgilagan, inson tasdiqlamagan", R.left, R.bottom + 0.1, R.width);
  } else {
    const lw = 6.75, rx = M + lw + 0.3, rw = W - M - rx, fy = 1.4, fh = 4.65;
    supplierMock(s, M, fy, lw, fh); makTag(s, M + lw - 1.4, fy + 0.09);
    agencyMock(s, rx, fy, rw, fh); makTag(s, rx + rw - 1.4, fy + 0.09);
  }
  source(s, n((sup && agy ? "" : "MAKET ekranlar app skrinshotlari bilan almashtiriladi. ") + `UZEX etender, 17.11.2026 snapshot: ${OPEN} ochiq lotdan ${ANALYSED} tasi tahlil qilingan; lotlar 18–20.11 da yopiladi`));
  notes(s, "Demo", "1:00–2:30",
    "To'liq skript: deck/demo-script.md. Demo 17-noyabr snapshotidan, oflayn keshdan ishlaydi; buni hakam so'ramasdan oldin ayting.\n" +
    "1) Bobur 525192 ni ochadi: ball, tavsiya va 3-betdagi iqtibos. 2) \"Aniqlik so'rovi xatini yaratish\": tayyor xat. 3) Davlat paneli: tahlil qilingan lotlar xavf bo'yicha saralangan; cheklovchi shartli lotlar AI belgilagan, inson tasdiqlamagan. 4) Telegram bot: lot raqamini yuboring, tavsiya va xat keladi.\n\n" +
    `Halol bo'ling, agar so'rashsa: ${OPEN} lotdan ${ANALYSED} tasi tahlil qilingan; keshdagi tahlillar xakaton davomida Claude kodlash sessiyasida olingan, mahsulotning o'z API yo'li hali ishlatilmagan (API kaliti yo'q), shuning uchun yangi lot "hali tahlil qilinmagan" deb chiqadi. 662 TTdan 141 tasi skan va hali o'qilmagan. Panel 154 ni ko'rsatadi: davlat ulushisiz 2 ta lot navbatdan chiqarilgan. ` +
    "Hech qachon \"hamma lot baholandi\" yoki \"72%\" demang. Buyurtmachi nomini ko'rsatmang (taqdimot rejimi). \"Buyurtmachiga yuborish\" tugmasini sahnada bosmang. Ilova ishlamasa: 13-slayd (Zaxira).");

  // ===== 4. How it works =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Asosiy" });
  title(s, "Qanday ishlaydi: AI o'qiydi, qoidalar hisoblaydi");
  const pipe = [
    { ic: I.api, t: "UZEX API", d: "lot, TT, mezonlar" }, { ic: I.ocr, t: "Matn / vision", d: "matn qatlami yoki skan" },
    { ic: I.llm, t: "LLM", d: "talab + iqtibos" }, { ic: I.check, t: "Tekshiruv", d: "iqtibos hujjatda bormi?" },
    { ic: I.score, t: "Baho", d: "tur + buyurtmachi tarixi" }, { ic: I.screens, t: "Uch yuz", d: "sayt · panel · bot" },
  ];
  const pw = 1.72, pg = (CW - pw * 6) / 5;
  pipe.forEach((p, i) => {
    const px = M + i * (pw + pg);
    card(s, px, 1.4, pw, 1.5, i === 2 || i === 1 ? COL.amber : COL.teal, "pipeline node", { r: 0.12 });
    s.addImage({ data: p.ic, x: px + pw / 2 - 0.22, y: 1.52, w: 0.44, h: 0.44, altText: T(p.t), objectName: "pipeline icon" });
    txt(s, p.t, { x: px + 0.05, y: 2.0, w: pw - 0.1, h: 0.36, fontSize: 15, bold: true, color: i === 2 || i === 1 ? COL.ink : COL.white, align: "center", valign: "middle" });
    txt(s, p.d, { x: px + 0.08, y: 2.36, w: pw - 0.16, h: 0.48, fontSize: 12, color: i === 2 || i === 1 ? COL.ink : COL.tint, align: "center", valign: "top" });
    if (i < 5) s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: px + pw + pg / 2 - 0.1, y: 2.05, w: 0.2, h: 0.2, rotate: 90, fill: { color: COL.muted }, line: { color: COL.muted }, objectName: "pipeline arrow" });
  });
  txt(s, [
    { text: "Telegram bot: ", options: { bold: true, color: COL.tealMid } },
    { text: "lot raqamini yuboring → tavsiya, iqtibosli bayroqlar va tayyor so'rov xati keladi.", options: { color: COL.ink } },
  ], { x: M, y: 3.0, w: CW, h: 0.32, fontSize: 13, valign: "middle" });
  txt(s, [
    { text: "Miqyos: ", options: { bold: true, color: COL.tealMid } },
    { text: n(`${OPEN} ochiq lot va ${thou(STATS.deals_analysed)} bitim UZEX ochiq API'sidan; har qanday hajmdagi lotni tekshira oladi. `), options: { color: COL.ink } },
    { text: "Xakatonda noldan qurilgan (17–19.11).", options: { bold: true, color: COL.teal } },
  ], { x: M, y: 3.33, w: CW, h: 0.32, fontSize: 13, valign: "middle" });
  const cy = 3.8, ch = 2.95, cw3 = (CW - 0.5) / 3;
  const cols = [
    { x: M, head: "AI (LLM)", hc: COL.amber, htc: COL.ink, items: ["Skan va aralash yozuvli TTni o'qish", "Talablarni ajratish, so'zma-so'z iqtibos bilan", "Cheklovchi shart turini aniqlash va izohlash", "Neytral tahrir va so'rov xati"] },
    { x: M + cw3 + 0.25, head: "Qoidalar va statistika", hc: COL.tealMid, htc: COL.white, items: ["Muddatlar, takroriy e'lon, mezon vaznlari", "Buyurtmachi tarixi: ishtirokchilar medianasi, takroriy g'olib", "Yakuniy ball: ochiq formula, boshlang'ich vaznlar", "Qonun moddalari hozircha keltirilmaydi"] },
  ];
  for (const c of cols) {
    card(s, c.x, cy, cw3, ch, COL.tint, "column card", { r: 0.12 });
    card(s, c.x, cy, cw3, 0.5, c.hc, "column head", { r: 0.12 });
    txt(s, c.head, { x: c.x + 0.25, y: cy, w: cw3 - 0.5, h: 0.5, fontSize: 16, bold: true, color: c.htc, valign: "middle" });
    txt(s, c.items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < c.items.length - 1 } })), { x: c.x + 0.2, y: cy + 0.65, w: cw3 - 0.4, h: ch - 0.8, fontSize: 14, paraSpaceAfter: 6 });
  }
  const bx = M + 2 * (cw3 + 0.25);
  card(s, bx, cy, cw3, ch, COL.teal, "no quote no flag", { r: 0.12, shadow: true });
  iconCircle(s, I.quote, bx + 0.25, cy + 0.25, 0.7, COL.amber, "quote");
  txt(s, "Iqtibos yo'q, bayroq yo'q", { x: bx + 1.1, y: cy + 0.2, w: cw3 - 1.3, h: 0.8, fontSize: 21, bold: true, color: COL.amber, valign: "middle" });
  txt(s, `Iqtibos TT matni yoki platforma mezonlari bilan kod orqali solishtiriladi; mos kelmasa, bayroq o'chiriladi. Bu iqtibos borligini kafolatlaydi, xulosani emas: qaror inson ixtiyorida.`, { x: bx + 0.25, y: cy + 1.1, w: cw3 - 0.5, h: ch - 1.2, fontSize: 14, color: COL.white });
  source(s, n(`Ma'lumot: UZEX etender ochiq API (TradeList, GetTrade, DownloadFile, DealsList), 17.11.2026; ${FLAGS.total} bayroqning ${FLAGS.spec} tasi TT faylidan, ${FLAGS.form} tasi mezonlar formasidan`));
  notes(s, "Qanday ishlaydi", "2:30–3:00",
    "TenderLens UZEX ochiq API'sidan lotni, texnik topshiriq faylini va platformadagi baholash mezonlarini oladi. Matn qatlami bo'lsa uni, skan bo'lsa vision modelni ishlatadi. LLM har bir talabni so'zma-so'z iqtibos bilan ajratadi; iqtibos hujjatda topilmasa, bayroq o'chiriladi. Statistika va yakuniy ball oddiy, tekshiriladigan qoidalar: bu ataylab. " +
    `Telegram bot: yetkazib beruvchi lot raqamini yuboradi va tavsiya, iqtibosli bayroqlar va tayyor so'rov xatini oladi. Hammasi xakaton davomida, 17-noyabr kechqurundan boshlab noldan qurildi.\n\n` +
    `Halol javoblar: ${FLAGS.total} bayroqning ${FLAGS.spec} tasi TT faylidan (skan, kirill, lotin, rus), ${FLAGS.form} tasi platforma mezonlari formasidan. 662 TTdan 141 tasi skan va hali o'qilmagan. Keshdagi tahlillar Claude kodlash sessiyasida olingan; mahsulotning o'z API yo'li hali ishga tushmagan (kalit yo'q). Bayroqlarning uchdan biri "boshqa" turida. Qonun moddalari huquqshunos ko'rib chiqmaguncha keltirilmaydi. ` +
    "\"Bu shunchaki qoidalar + chatbot\" desa: aylanma misoli uchun qoida yetadi, lekin 525192 dagi to'rtta ISO sertifikati skanerlangan TTning 3-betida, transport talablari bo'limida turibdi; uni qoida topmaydi.");

  // ===== 5. Examples (variant a: human precision panel; variant b: quote mechanism only) =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Asosiy" });
  title(s, evFilled ? "Isbot: inson tekshirgan bayroqlar" : "Misollar: haqiqiy lotlar, so'zma-so'z iqtibos");
  const ex = M, ew = 3.55;
  card(s, ex, 1.4, ew, 5.35, evFilled ? COL.tint : COL.teal, "eval card", { r: 0.12 });
  if (evFilled) { // (a) only when real human labels exist
    txt(s, "Inson tekshiruvi", { x: ex + 0.3, y: 1.55, w: ew - 0.6, h: 0.45, fontSize: 19, bold: true, color: COL.teal, valign: "middle" });
    txt(s, `${EV.precision_k} / ${EV.precision_n}`, { x: ex + 0.3, y: 2.1, w: ew - 0.6, h: 0.9, fontSize: 48, bold: true, color: COL.teal, valign: "middle" });
    txt(s, "yuqori va o'rta bayroq inson tomonidan tasdiqlandi (precision)", { x: ex + 0.3, y: 3.0, w: ew - 0.6, h: 0.7, fontSize: 14 });
    txt(s, `${EV.precision_n - EV.precision_k}`, { x: ex + 0.3, y: 3.85, w: ew - 0.6, h: 0.7, fontSize: 40, bold: true, color: COL.red, valign: "middle" });
    txt(s, "yolg'on signal", { x: ex + 0.3, y: 4.55, w: ew - 0.6, h: 0.35, fontSize: 14 });
    txt(s, `${EV.clauses_reviewed ?? EV.precision_n} band, ${EV.lots_reviewed ?? "?"} lot, ${EV.reviewers ?? "?"} tekshiruvchi. Recall hisoblanmaydi.`, { x: ex + 0.3, y: 5.1, w: ew - 0.6, h: 1.4, fontSize: 13, color: COL.muted });
  } else { // (b) no accuracy number until real labels arrive
    txt(s, "Iqtibos tekshiruvi", { x: ex + 0.3, y: 1.55, w: ew - 0.6, h: 0.45, fontSize: 19, bold: true, color: COL.amber, valign: "middle" });
    txt(s, `${FLAGS.verified} / ${FLAGS.total}`, { x: ex + 0.3, y: 2.1, w: ew - 0.6, h: 0.9, fontSize: 44, bold: true, color: COL.white, valign: "middle" });
    txt(s, "bayroq iqtibosi hujjatda so'zma-so'z topildi (kod tekshiradi)", { x: ex + 0.3, y: 3.0, w: ew - 0.6, h: 0.75, fontSize: 14, color: COL.white });
    txt(s, `${FLAGS.spec} tasi TT faylidan, ${FLAGS.form} tasi platforma mezonlari formasidan`, { x: ex + 0.3, y: 3.85, w: ew - 0.6, h: 0.75, fontSize: 14, color: COL.tint });
    card(s, ex + 0.3, 4.8, ew - 0.6, 1.7, COL.amber, "human review pill", { r: 0.1 });
    txt(s, [{ text: "Inson tekshiruvi davom etmoqda.", options: { bold: true, breakLine: true } }, { text: "Aniqlik raqamini o'ylab topmaymiz: u faqat inson belgilagan bandlardan hisoblanadi.", options: { fontSize: 13 } }], { x: ex + 0.45, y: 4.85, w: ew - 0.9, h: 1.6, fontSize: 15, color: COL.ink, valign: "middle" });
  }
  const hx = ex + ew + 0.3, hw = W - M - hx;
  card(s, hx, 1.4, hw, 3.2, COL.white, "lot 525192 case", { line: HEX.line, shadow: true, r: 0.12 });
  card(s, hx + 0.3, 1.58, 1.3, 0.36, COL.red, "lot pill", { r: 0.18 });
  txt(s, "Lot 525192", { x: hx + 0.3, y: 1.58, w: 1.3, h: 0.36, fontSize: 12, bold: true, color: COL.white, align: "center", valign: "middle" });
  txt(s, n("6/10 kV ajratgich, 2 dona · 5,3 mln so'm · 20.11 gacha ochiq"), { x: hx + 1.8, y: 1.54, w: hw - 2.1, h: 0.44, fontSize: 15, bold: true, color: COL.teal, valign: "middle" });
  card(s, hx + 0.3, 2.1, hw - 0.6, 1.0, COL.tint, "quote box", { r: 0.08 });
  s.addImage({ data: I.quote, x: hx + 0.45, y: 2.2, w: 0.32, h: 0.32, altText: "quote", objectName: "quote mark" });
  txt(s, [
    { text: "«" + K(Q525192) + "»", options: { bold: true, color: COL.ink, fontSize: 15, breakLine: true } },
    { text: "Texnik topshiriq, 3-bet («Transport talablari» bo'limida)", options: { fontSize: 12, italic: true, color: COL.muted } },
  ], { x: hx + 0.9, y: 2.13, w: hw - 1.35, h: 0.94, valign: "middle" });
  const cmp = [{ t: "Talab: 4 ta ISO + laboratoriya sertifikati", c: COL.red }, { t: n("Lot: 2 ta ajratgich, 5,3 mln so'm"), c: COL.teal }];
  cmp.forEach((p, i) => {
    const pw2 = (hw - 0.75) / 2, px2 = hx + 0.3 + i * (pw2 + 0.15);
    card(s, px2, 3.22, pw2, 0.46, p.c, "compare pill", { r: 0.23, transparency: 85 });
    txt(s, p.t, { x: px2, y: 3.22, w: pw2, h: 0.46, fontSize: 14, bold: true, color: p.c, align: "center", valign: "middle" });
  });
  txt(s, [
    { text: "Baholash faqat narx bo'yicha, lekin texnik o'tish bali 80 = maksimal ball: bitta hujjat yetishmasa, narx bosqichiga o'tolmaydi. ", options: {} },
    { text: "Tavsiya: avval aniqlik so'rang.", options: { bold: true } },
  ], { x: hx + 0.3, y: 3.8, w: hw - 0.6, h: 0.65, fontSize: 14, valign: "middle" });
  const mini = [
    { big: "≈24×", t: n("O'rtacha yillik aylanma kamida 8 mlrd so'm, 330,4 mln so'mlik loyihalash lotiga (524954, 18.11 da yopilgan)") },
    { big: "40%", t: n("Shifoxona bemorlari ovqati (524769): 10 ballik mezon, hisobda shartnoma summasining 40% i bo'lmasa 5 ball") },
    { big: "3 oy", t: n("Bog'cha ovqati: 810-son qarorga tayangan bir xil shablon, kamida 10 ta ochiq lotda. Aniqlik so'rash darajasida") },
  ];
  const mw = (hw - 0.5) / 3;
  mini.forEach((m, i) => {
    const mx = hx + i * (mw + 0.25);
    card(s, mx, 4.75, mw, 2.0, COL.tint, "finding card", { r: 0.12 });
    txt(s, m.big, { x: mx + 0.2, y: 4.82, w: mw - 0.4, h: 0.55, fontSize: 28, bold: true, color: COL.teal, valign: "middle" });
    txt(s, m.t, { x: mx + 0.2, y: 5.38, w: mw - 0.4, h: 1.3, fontSize: 13, color: COL.ink });
  });
  source(s, n("Manba: UZEX etender, 17.11.2026; lotlar 525192, 524954, 524769, 524116; baholash: TenderLens engine" + (evFilled ? `, ${EV.reviewers ?? "?"} tekshiruvchi` : "; inson tekshiruvi davom etmoqda")));
  notes(s, evFilled ? "Isbot" : "Misollar", "3:00–3:30",
    "Asosiy misol, lot 525192: ikkita 6/10 kV ajratgich, 5,3 million so'm, 20-noyabrgacha ochiq. Texnik topshiriqning 3-betida to'rtta ISO sertifikati va xalqaro laboratoriya sertifikati so'raladi; baholash faqat narx bo'yicha, texnik o'tish bali 80, uchta mezon yig'indisi ham 80. Tavsiya: avval aniqlik so'rang. " +
    "524954: 330 million so'mlik loyihalash ishiga o'rtacha yillik aylanma kamida 8 milliard so'm, taxminan 24 baravar; mezon 15 ball, o'tish bali 70; lot 18-noyabrda yopilgan. 524769: shifoxona bemorlari ovqati, 445 million so'm; 10 ballik mezon: 2026-yil yanvar holatiga hisobda shartnoma summasining 40% i, kam bo'lsa 5 ball. " +
    "Bog'cha ovqati: kamida 10 ta ochiq lotning TT si o'zini 810-son qaror asosida tuzilgan deb yozadi va matni bir xil; 2 oylik shartnomaga 3 oylik oziq-ovqat zaxirasi so'raladi. Bu aniqlik so'rash darajasidagi bayroq, sarlavha emas. Qarorning o'zini o'qimaganmiz.\n\n" +
    (evFilled
      ? `Chapda: ${EV.precision_n} ta yuqori va o'rta bayroqdan ${EV.precision_k} tasini inson tasdiqladi. Recall hisoblanmaydi.`
      : "Chapda aniqlik raqami yo'q, va uni o'ylab topmaymiz: inson tekshiruvi davom etmoqda. Kafolatimiz: har bir iqtibos hujjatda so'zma-so'z bor. ") +
    " 524954 ga qarshi argument: inshoot qurilishi 4,8 mlrd so'mlik; shuning uchun tavsiya \"qatnashmang\" emas, \"aniqlik so'rang\".");

  // ===== 6. Why now =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Asosiy" });
  title(s, "Nega aynan hozir");
  const cw = (CW - 0.5) / 3;
  const why = [
    { ic: I.gavel, h: "PF-259 Prezident Farmoni", d: n("26.12.2025, 6-ilova"), big: n("35% → 70%"), bs: 42, l: "tadbirkorlarning davlat xaridlaridagi faolligi, 2030-yilgacha", x2: n("Raqobatli xaridlar: 58% → 80%. Yangi Agentlik: 2026-yil fevral") },
    { ic: I.building, h: "Parlament", d: n("13.10.2026"), big: "Qaytarildi", bs: 34, l: "Xaridlar qonuni loyihasi ikkinchi o'qishda qaytarildi", x2: n("Deputatlar cheklovchi mezonlarni keltirdi: qog'ozni 15 kunda yetkazish, 1 mlrd so'm ustav kapitali") },
    { ic: I.robot, h: "Davlat AI rejalari", d: "VMQ 425, VMQ 865", big: "2026–27", bs: 42, l: "Xarid buzilishlarini aniqlovchi AI mahsuloti va tender e'lonlarini elektron monitoring", x2: "Bular reja; TT matnini o'qishi aytilmagan. TenderLens shu qatlamning ishlaydigan prototipi" },
  ];
  why.forEach((c, i) => {
    const cx = M + i * (cw + 0.25);
    card(s, cx, 1.4, cw, 3.8, COL.tint, "why card", { r: 0.12 });
    iconCircle(s, c.ic, cx + 0.3, 1.6, 0.75, COL.amber, "why icon");
    txt(s, [{ text: c.h, options: { bold: true, color: COL.teal, breakLine: true } }, { text: c.d, options: { color: COL.muted, fontSize: 13 } }], { x: cx + 1.2, y: 1.6, w: cw - 1.4, h: 0.75, fontSize: 16, valign: "middle" });
    txt(s, c.big, { x: cx + 0.3, y: 2.5, w: cw - 0.6, h: 0.75, fontSize: c.bs, bold: true, color: COL.teal, valign: "middle" });
    txt(s, c.l, { x: cx + 0.3, y: 3.27, w: cw - 0.6, h: 0.95, fontSize: 14 });
    txt(s, c.x2, { x: cx + 0.3, y: 4.25, w: cw - 0.6, h: 0.85, fontSize: 12, color: COL.muted });
  });
  card(s, M, 5.4, CW, 1.3, COL.teal, "gap band", { r: 0.12 });
  txt(s, [
    { text: "Bo'shliq. ", options: { bold: true, color: COL.amber } },
    { text: "Davlat AI narxni (o'rtacha bozor narxi moduli) va e-do'kon takliflarini (75%) tekshiradi. Ammo O'zbekistonda cheklovchi shartni so'zma-so'z iqtibos bilan belgilab, tuzatishni yozadigan ishlayotgan vositani topmadik: na yetkazib beruvchi, na davlat uchun.", options: { color: COL.white } },
  ], { x: M + 0.35, y: 5.45, w: CW - 0.7, h: 1.2, fontSize: 15, valign: "middle" });
  source(s, n("Manba: PF-259, 6-ilova (lex.uz); gazeta.uz, 21.10.2026 (parlament); VMQ 425 va 865 (lex.uz); uza.uz, 30.10.2026 (75%)"));
  notes(s, "Nega hozir", "3:30–3:50",
    "Birinchi: PF-259 Farmoni 2030-yilgacha tadbirkorlarning davlat xaridlaridagi faolligini 35% dan 70% ga, raqobatli xaridlar ulushini 58% dan 80% ga oshirishni talab qiladi. Ikkinchi: 13-oktabrda parlament xaridlar qonuni loyihasini qaytardi; deputatlarning o'zi cheklovchi mezonlarni misol keltirdi: qog'ozni 15 kunda yetkazish, 1 milliard so'm ustav kapitali. " +
    "Uchinchi: davlat rejalari bor: VMQ 425 xarid buzilishlarini aniqlovchi AI mahsulotini 2026-yil noyabrga, VMQ 865 tender e'lonlarini elektron monitoringni 2026–27 yillarga rejalashtirgan. Bular reja, TT matnini o'qishi aytilmagan; TenderLens shu qatlamning ishlaydigan prototipi.\n\n" +
    "PF-259 ning 16-bandi avtomatik xavf aniqlashni ham va'da qiladi; hakam aytsa: \"aynan shu sahifaga tayyor qatlam taklif qilamiz: narx moduli narxni ko'radi, biz matnni\". PQ-332 (TT ekspertizasi) ni o'qimaganmiz. Agentlik sanasi: faqat \"2026-yil fevral\". UZEX 7–8 noyabrda o'z AI xakatonini o'tkazgan; bu loyiha u yerda ko'rsatilmagan.");

  // ===== 7. Business: who pays, market, team =====
  pres.addSection({ title: "Biznes" });
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Biznes" });
  title(s, "Kim to'laydi va bozor qancha");
  const b3 = (CW - 0.5) / 3;
  // who pays
  card(s, M, 1.4, b3, 5.35, COL.tint, "who pays", { r: 0.12 });
  iconCircle(s, I.store, M + 0.3, 1.58, 0.65, COL.amber, "who pays icon");
  txt(s, "Birinchi to'lovchi", { x: M + 1.1, y: 1.58, w: b3 - 1.3, h: 0.65, fontSize: 18, bold: true, color: COL.teal, valign: "middle" });
  txt(s, "Tender konsultantlari va kichik yetkazib beruvchilar", { x: M + 0.3, y: 2.35, w: b3 - 0.6, h: 0.65, fontSize: 15, bold: true });
  txt(s, PRICES.map((p, i) => ({ text: n(p), options: { bullet: true, breakLine: i < PRICES.length - 1 } })), { x: M + 0.25, y: 3.05, w: b3 - 0.5, h: 1.75, fontSize: 14, paraSpaceAfter: 6 });
  txt(s, "Narxlar: bizning taklifimiz, pilotda sinaladi. Keyin: davlat uchun litsenziya yoki API.", { x: M + 0.3, y: 4.95, w: b3 - 0.6, h: 1.6, fontSize: 12, italic: true, color: COL.muted });
  // market
  const mx3 = M + b3 + 0.25;
  card(s, mx3, 1.4, b3, 5.35, COL.teal, "market", { r: 0.12 });
  txt(s, "Bozor: etender, 12 oy", { x: mx3 + 0.3, y: 1.55, w: b3 - 0.6, h: 0.5, fontSize: 18, bold: true, color: COL.amber, valign: "middle" });
  const mk = [
    { v: thou(MARKET.winners), l: "g'olib yetkazib beruvchi (ishtirokchilar bundan ko'p)" },
    { v: thou(MARKET.buyers), l: "buyurtmachi" },
    { v: thou(MARKET.deals), l: n(`savdo; so'mdagilar boshlang'ich qiymati ${MARKET.uzsTrn} trln so'm`) },
  ];
  mk.forEach((m, i) => {
    const yy = 2.15 + i * 1.12;
    txt(s, m.v, { x: mx3 + 0.3, y: yy, w: b3 - 0.6, h: 0.6, fontSize: 34, bold: true, color: COL.white, valign: "middle" });
    txt(s, m.l, { x: mx3 + 0.3, y: yy + 0.58, w: b3 - 0.6, h: 0.5, fontSize: 13, color: COL.tint });
  });
  txt(s, n(`Misol: g'oliblarning 10% i oylik tarifni olsa, ~${MARKET.illustrationBn} mlrd so'm/yil`), { x: mx3 + 0.3, y: 5.55, w: b3 - 0.6, h: 1.0, fontSize: 13, italic: true, color: COL.amber });
  // team
  const tx3 = M + 2 * (b3 + 0.25);
  card(s, tx3, 1.4, b3, 5.35, COL.tint, "team", { r: 0.12 });
  iconCircle(s, I.users, tx3 + 0.3, 1.58, 0.65, COL.amber, "team icon");
  txt(s, "Jamoa: Team Eclipse", { x: tx3 + 1.1, y: 1.58, w: b3 - 1.3, h: 0.65, fontSize: 18, bold: true, color: COL.teal, valign: "middle" });
  if (TEAM.length) txt(s, TEAM.map((m, i) => ({ text: m, options: { bullet: true, breakLine: i < TEAM.length - 1 } })), { x: tx3 + 0.25, y: 2.4, w: b3 - 0.5, h: 3.0, fontSize: 14, paraSpaceAfter: 6 });
  else placeholderBox(s, tx3 + 0.3, 2.45, b3 - 0.6, 2.4, "[PLACEHOLDER: jamoa a'zolari va rollari]", "team placeholder");
  txt(s, "Engine, ilova va bot xakaton davomida, 17-noyabr kechqurundan boshlab yozildi.", { x: tx3 + 0.3, y: 5.15, w: b3 - 0.6, h: 1.4, fontSize: 13, color: COL.ink });
  source(s, n(`O'z hisobimiz: UZEX etender DealsList, ${MARKET.from}–${MARKET.to}; ochiq lotlar: ${OPEN} ta, ${MARKET.openBuyers} buyurtmachi (17.11.2026); narxlar: jamoa taklifi`));
  notes(s, "Kim to'laydi", "3:50–4:30",
    "Birinchi to'lovchi: tender konsultantlari va kichik yetkazib beruvchilar. Ular har bir lot uchun TTni o'qishga vaqt sarflaydi; biz tekshiruv va tayyor xat sotamiz: bitta tekshiruv yoki oylik obuna. Narxlar bizning taklifimiz va pilotda sinaladi. Davlat uchun litsenziya yoki API keyingi bosqich. " +
    `Bozor, o'z hisobimiz, etender'ning so'nggi 12 oyi: ${thou(MARKET.deals)} ta savdo, ${thou(MARKET.buyers)} ta buyurtmachi, ${thou(MARKET.winners)} ta g'olib yetkazib beruvchi; ishtirokchilar soni g'oliblardan ko'p, chunki DealsList faqat g'olibni beradi. Misol: g'oliblarning 10% i oylik tarifni olsa, taxminan ${MARKET.illustrationBn} milliard so'm yiliga. Bu misol, prognoz emas. ` +
    "Jamoa: [PLACEHOLDER: ismlar va rollar]. Engine, ilova va bot shu uch kunda yozildi.\n\n" +
    "Hali hech kim bilan kelishuv yo'q; mijoz iqtibosini o'ylab topmang. Agar so'rashsa: Assotsiatsiya \"moslab yozilgan\" TT lardan shikoyat qilgan (anhor.uz); shuning uchun so'rovimiz pilot uchun tanishtiruv. Butun tizimda yiliga ~2 mln lot bor, lekin ularning ko'pi e-do'kon; biz etender'ni o'qiymiz.");

  // ===== 8. Ask + close =====
  s = pres.addSlide({ masterName: "TL_DARK", sectionTitle: "Biznes" });
  title(s, "Sizdan so'rovimiz");
  const asks = [
    { b: "Mentorlik", t: ": biznes model va huquqiy masalalar bo'yicha (narx, ma'lumotdan foydalanish)" },
    { b: "Tanishtiruv", t: ": pilot uchun tender konsultantlari va Davlat xaridlari ishtirokchilari assotsiatsiyasi bilan" },
    { b: "Milliy final", t: ": TenderLens'ni jonli tahlil va inson tekshiruvi bilan ko'rsatish uchun" },
  ];
  asks.forEach((a, i) => {
    const ay = 1.6 + i * 0.98;
    s.addShape(pres.shapes.OVAL, { x: M, y: ay, w: 0.68, h: 0.68, fill: { color: COL.amber }, line: { color: COL.amber }, objectName: "ask number" });
    txt(s, String(i + 1), { x: M, y: ay, w: 0.68, h: 0.68, fontSize: 22, bold: true, color: COL.ink, align: "center", valign: "middle" });
    txt(s, [{ text: a.b, options: { bold: true, color: COL.amber } }, { text: a.t, options: { color: COL.white } }], { x: M + 0.95, y: ay - 0.06, w: CW - 0.95, h: 0.8, fontSize: 20, valign: "middle" });
  });
  txt(s, "Keyingi qadam: Sanoat kooperatsiyasi va davlat xaridlari agentligi bilan pilot (PF-259 monitoring sahifasi uchun).", { x: M, y: 4.55, w: CW, h: 0.45, fontSize: 15, italic: true, color: COL.tint });
  card(s, M, 5.1, CW, 1.6, COL.white, "closing line", { transparency: 90, r: 0.12 });
  txt(s, [
    { text: "Davlat AI narxni tekshiradi.", options: { color: COL.white, breakLine: true } },
    { text: "TenderLens esa kim haqiqatan qatnasha olishini tekshiradi.", options: { color: COL.amber, bold: true } },
  ], { x: M + 0.3, y: 5.12, w: CW - 0.6, h: 0.95, fontSize: 26, align: "center", valign: "middle" });
  txt(s, "Bog'cha ovqatidan shifoxona bemorlari ovqatigacha, har bir tender hamma uchun ochiq bo'lsin.", { x: M + 0.3, y: 6.05, w: CW - 0.6, h: 0.5, fontSize: 17, italic: true, color: COL.tint, align: "center", valign: "middle" });
  source(s, n("PF-259 (26.12.2025), lex.uz"));
  notes(s, "So'rov va yakun", "4:30–5:00",
    "Sizdan uchta narsa so'raymiz: biznes model va huquqiy masalalar bo'yicha mentorlik; pilot uchun tender konsultantlari va ishtirokchilar assotsiatsiyasi bilan tanishtiruv; va milliy finalga yo'llanma, u yerda jonli tahlil va inson tekshiruvi raqamlari bilan chiqamiz. Keyingi qadam: Agentlik bilan pilot. " +
    "Davlat AI narxni tekshiradi. TenderLens esa kim haqiqatan qatnasha olishini tekshiradi. Bog'cha ovqatidan shifoxona bemorlari ovqatigacha, har bir tender hamma uchun ochiq bo'lsin. Rahmat.");

  // ================= BACKUP (Zaxira) =================
  pres.addSection({ title: "Zaxira" });
  // ===== 9. Two users =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Zaxira" });
  title(s, "Zaxira: ikki foydalanuvchi");
  const users = [
    { x: M, ic: I.user, name: "Bobur, kichik yetkazib beruvchi", role: "Elektr jihozlari yetkazib beradi",
      pain: "Texnik topshiriq 1 betdan 120 betdan ortiqqacha (662 lot), kirill, lotin yoki rus tilida. Qaysi tenderda yutish mumkinligini bilmaydi.",
      gets: "Tavsiya: qatnashing / avval aniqlik so'rang. Tayyor so'rov xati. Telegram bot." },
    { x: M + CW / 2 + 0.15, ic: I.shield, name: "Agentlik tahlilchisi", role: "Sanoat kooperatsiyasi va davlat xaridlari agentligi",
      pain: n(`etender'da yiliga ~${MARKET.dealsK} ming savdo; butun tizimda ~2 mln lot (asosan e-do'kon). Ekspert bahosi: atigi 2–3% qo'lda tahlil qilinadi.`),
      gets: "Xavf navbati: iqtibos, cheklovchi shart turi, neytral tahrir; shablon savollari." },
  ];
  const uw = CW / 2 - 0.15;
  for (const u of users) {
    card(s, u.x, 1.4, uw, 3.75, COL.tint, "user card", { r: 0.12 });
    iconCircle(s, u.ic, u.x + 0.3, 1.6, 0.8, COL.amber, "user icon");
    txt(s, u.name, { x: u.x + 1.3, y: 1.6, w: uw - 1.5, h: 0.45, fontSize: 21, bold: true, color: COL.teal, valign: "middle" });
    txt(s, u.role, { x: u.x + 1.3, y: 2.05, w: uw - 1.5, h: 0.38, fontSize: 14, color: COL.muted, valign: "middle" });
    txt(s, [{ text: "Muammo", options: { bold: true, color: COL.red, breakLine: true } }, { text: u.pain }], { x: u.x + 0.3, y: 2.65, w: uw - 0.6, h: 1.15, fontSize: 15 });
    txt(s, [{ text: "TenderLens beradi", options: { bold: true, color: COL.green, breakLine: true } }, { text: u.gets }], { x: u.x + 0.3, y: 3.9, w: uw - 0.6, h: 1.15, fontSize: 15 });
  }
  card(s, M, 5.35, CW, 1.35, COL.teal, "social band", { r: 0.12 });
  iconCircle(s, I.child, M + 0.25, 5.6, 0.85, COL.amber, "kindergarten");
  iconCircle(s, I.hosp, M + 1.25, 5.6, 0.85, COL.amber, "hospital");
  txt(s, [
    { text: "Bolalar va bemorlar ham tenderga bog'liq. ", options: { bold: true, color: COL.amber } },
    { text: "Bog'cha ovqati lotlarida 810-son qarorga tayangan bir xil shablon kamida 10 ta ochiq lotda turibdi; undagi bayroqlar aniqlik so'rash darajasida. Shifoxona bemorlari ovqati lotida (524769) bank qoldig'i mezoni bor.", options: { color: COL.white } },
  ], { x: M + 2.35, y: 5.42, w: CW - 2.6, h: 1.2, fontSize: 15, valign: "middle" });
  source(s, n(`Manba: 662 lot TT hajmi va etender savdolari (o'z hisobimiz, ${MARKET.from}–${MARKET.to}); ~2 mln lot va 2–3%: TenderZone eksperti, anhor.uz`));
  notes(s, "Zaxira: ikki foydalanuvchi", "faqat savol bo'lsa",
    "2–3% bir ekspertning bahosi (TenderZone), rasmiy raqam emas va tartib-taomillar haqida. ~2 mln lot butun tizim, asosan e-do'kon; biz o'qiydigan etender'da yiliga taxminan 16 ming savdo. 810-son qarorning o'zini o'qimaganmiz: kamida 10 ta TT o'zini shu qaror asosida tuzilgan deb yozadi va matni bir xil.");

  // ===== 10. Template findings (caveated) =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Zaxira" });
  title(s, "Zaxira: shablon savollari (inson tekshiruvi kerak)");
  const tpl = [
    { big: `${VET.lots} lot`, h: "«Davlat veterinariya xizmati nazorati ostidagi mahsulotlar» so'zlari bor mezon sarlavhasi", d: `Sarlavha 4 turdagi mahsulotni birlashtiradi (veterinariya, majburiy muvofiqlik, ekologik sertifikat, sanitariya xulosasi). ~${VET.likely_not_applicable} lot oziq-ovqat emas (kalit so'z taxmini). ${VET.named_in_customer_note} tasida veterinariya matni buyurtmachi izohida ham bor. Ball komissiyaga bog'liq.` },
    { big: `${TRAIN.lots} lot`, h: "«Buyurtmachi xodimlarini ijrochi o'qitishi» mezoni", d: `~${TRAIN.likely_not_applicable} tasida mos kelmasligi mumkin (ovqat, tozalash, transport, qo'riqlash). Ko'pi loyihalash ishlarida, u yerda mos kelishi mumkin.` },
    { big: `${IPR.lots} lot`, h: "«Intellektual mulk huquqlarini topshirish» mezoni", d: `~${IPR.likely_not_applicable} tasida mos kelmasligi mumkin. Ko'pi loyihalash ishlarida, u yerda mos kelishi mumkin.` },
  ];
  tpl.forEach((t, i) => {
    const tx = M + i * (cw + 0.25);
    card(s, tx, 1.4, cw, 3.85, COL.tint, "template card", { r: 0.12 });
    txt(s, t.big, { x: tx + 0.3, y: 1.55, w: cw - 0.6, h: 0.7, fontSize: 36, bold: true, color: COL.teal, valign: "middle" });
    txt(s, t.h, { x: tx + 0.3, y: 2.3, w: cw - 0.6, h: 0.85, fontSize: 14, bold: true });
    txt(s, t.d, { x: tx + 0.3, y: 3.2, w: cw - 0.6, h: 1.95, fontSize: 13, color: COL.muted });
  });
  card(s, M, 5.45, CW, 1.25, COL.teal, "question band", { r: 0.12 });
  txt(s, [{ text: "Savol, xulosa emas: ", options: { bold: true, color: COL.amber } }, { text: "bu sarlavhalarni kim belgilaydi, UZEX shabloni yoki me'yoriy hujjat? Agar shablon bo'lsa, bitta tuzatish ko'p lotga ta'sir qiladi.", options: { color: COL.white } }], { x: M + 0.35, y: 5.5, w: CW - 0.7, h: 1.15, fontSize: 16, valign: "middle" });
  source(s, n(`O'z hisobimiz: ${OPEN} ta GetTrade yozuvi, 17.11.2026; "mos kelmasligi mumkin" soni lot nomi va toifasi bo'yicha kalit so'z taxmini`));
  notes(s, "Zaxira: shablon savollari", "faqat savol bo'lsa",
    `Faqat so'rashsa ko'rsating. Veterinariya sarlavhasi ${VET.lots} lotda turibdi; ~${VET.likely_not_applicable} tasi oziq-ovqat emas, bu kalit so'z taxmini. ${VET.named_in_customer_note} tasida veterinariya matni buyurtmachi izohida takrorlangan, hammasi bitta buyurtmachi. 53 lotdan 31 tasi ikki buyurtmachidan, shuning uchun \"tizimli\" deb aytmang. Ko'p lotda buyurtmachi bu sarlavha ostida boshqa narsani baholaydi. ` +
    "Hakam \"bu bizning standart mezonimiz\" desa: \"To'g'ri, sarlavha to'rt turdagi mahsulotni birlashtiradi; ishtirokchi nimani ilova qilishni bilmaydi. Sarlavhani kim belgilashini sizdan so'ramoqchi edik.\"");

  // ===== 11. The world =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Zaxira" });
  title(s, "Zaxira: biz o'rgangan davlatlar tajribasi");
  const bw = 5.0;
  card(s, M, 1.4, bw, 5.35, COL.teal, "Brazil ALICE card", { r: 0.12, shadow: true });
  txt(s, [{ text: "Braziliya · ALICE", options: { bold: true, color: COL.amber, fontSize: 24, breakLine: true } }, { text: "Bosh nazorat boshqarmasi (CGU) roboti tender e'lonlarini avtomatik o'qiydi va auditorlarga signal yuboradi", options: { color: COL.white, fontSize: 15 } }], { x: M + 0.35, y: 1.6, w: bw - 0.7, h: 1.6 });
  txt(s, n("118 069"), { x: M + 0.35, y: 3.3, w: bw - 0.7, h: 0.85, fontSize: 52, bold: true, color: COL.white, valign: "middle" });
  txt(s, "xarid jarayoni tahlil qilindi, 2024", { x: M + 0.35, y: 4.15, w: bw - 0.7, h: 0.4, fontSize: 15, color: COL.tint });
  txt(s, n("R$257 mln"), { x: M + 0.35, y: 4.75, w: bw - 0.7, h: 0.85, fontSize: 52, bold: true, color: COL.amber, valign: "middle" });
  txt(s, n("tejaldi, 2024 (R$257,25 mln, yakunlangan auditlar)"), { x: M + 0.35, y: 5.6, w: bw - 0.7, h: 0.4, fontSize: 15, color: COL.tint });
  const lx2 = M + bw + 0.3, lw2 = W - M - lx2;
  const lessons = [
    { k: "KZ", h: "Qozog'iston", t: "G'olib ballar bo'yicha avtomatik tanlanadi; yetkazib beruvchilar davlat bazalari bilan tekshiriladi." },
    { k: "RU", h: "Rossiya · SentinelTender", t: "Telegram bot: yetkazib beruvchi TTni yuklaydi, bot raqobatni cheklashi mumkin bo'lgan talablarni va so'rov matnini beradi." },
    { k: "UZ", h: "O'zbekiston · tenderai.uz", t: "Pullik xizmat: hujjatlarni tarjima qiladi, tasniflaydi va qisqa xulosa beradi." },
  ];
  lessons.forEach((l, i) => {
    const ly = 1.4 + i * 1.32;
    card(s, lx2, ly, lw2, 1.17, COL.tint, "lesson row", { r: 0.12 });
    s.addShape(pres.shapes.OVAL, { x: lx2 + 0.25, y: ly + 0.21, w: 0.75, h: 0.75, fill: { color: COL.amber }, line: { color: COL.amber }, objectName: "country circle" });
    txt(s, l.k, { x: lx2 + 0.25, y: ly + 0.21, w: 0.75, h: 0.75, fontSize: 18, bold: true, color: COL.ink, align: "center", valign: "middle" });
    txt(s, [{ text: l.h, options: { bold: true, color: COL.teal, breakLine: true } }, { text: l.t, options: { fontSize: 14 } }], { x: lx2 + 1.2, y: ly + 0.1, w: lw2 - 1.4, h: 0.97, fontSize: 16, valign: "middle" });
  });
  card(s, lx2, 5.4, lw2, 1.35, COL.amber, "takeaway", { r: 0.12 });
  txt(s, [{ text: "Xulosa: ", options: { bold: true } }, { text: "biz o'rgangan davlatlar ichida ALICE e'lonni auditor uchun o'qiydi, SentinelTender rus tilidagi TT uchun ishlaydi. O'zbek tilidagi TT uchun shartni iqtibos bilan belgilab, tuzatish xatini yozadigan ishlayotgan vositani topmadik." }], { x: lx2 + 0.3, y: 5.4, w: lw2 - 0.6, h: 1.35, fontSize: 14, color: COL.ink, valign: "middle" });
  source(s, n("Manba: agenciagov.ebc.com.br, 30.12.2024 (ALICE); kapital.kz va digitalbusiness.kz (Qozog'iston); SentinelTender va tenderai.uz saytlari (2026)"));
  notes(s, "Zaxira: dunyo tajribasi", "faqat savol bo'lsa",
    "ALICE tejovi yakunlangan auditlardan. Ukraina va Koreya qatorlarini olib tashladik: manbalarini ocholmadik. Qozog'iston bo'yicha raqam aytmang (781 mlrd tenge vazir bayonoti, tekshirilmagan). \"Faqat\" va \"hech kim\" demang: faqat \"biz o'rgangan davlatlar ichida\".");

  // ===== 12. Roadmap =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Zaxira" });
  title(s, "Zaxira: yo'l xaritasi");
  const ry0 = 2.4;
  s.addShape(pres.shapes.LINE, { x: M + 0.5, y: ry0 + 0.3, w: CW - 1.0, h: 0, line: { color: COL.tealMid, width: 3 }, objectName: "roadmap line" });
  const road = [
    { h: "Hozir", t: n(`17.11 snapshot: ${OPEN} lotdan ${ANALYSED} tasi tahlil qilingan; sayt, panel, bot`) },
    { h: "Jonli tahlil", t: "API kaliti bilan har qanday yangi lot; 141 skanerlangan TT uchun OCR" },
    { h: "Pilot", t: "Tender konsultantlari va Assotsiatsiya; inson tekshiruvi raqamlari; keyin Agentlik" },
    { h: "Infratuzilma", t: "VMQ 581 tanloviga ariza (ijtimoiy ahamiyatli loyihalar); rasmiy ma'lumot oqimi yoki OCDS" },
  ];
  const rw4 = CW / 4;
  road.forEach((r, i) => {
    const cx = M + i * rw4 + rw4 / 2;
    s.addShape(pres.shapes.OVAL, { x: cx - 0.3, y: ry0, w: 0.6, h: 0.6, fill: { color: i === 0 ? COL.amber : COL.teal }, line: { color: COL.white, width: 3 }, objectName: "milestone" });
    txt(s, String(i + 1), { x: cx - 0.3, y: ry0, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: i === 0 ? COL.ink : COL.white, align: "center", valign: "middle" });
    txt(s, r.h, { x: cx - rw4 / 2 + 0.1, y: ry0 + 0.8, w: rw4 - 0.2, h: 0.45, fontSize: 18, bold: true, color: COL.teal, align: "center" });
    txt(s, r.t, { x: cx - rw4 / 2 + 0.15, y: ry0 + 1.3, w: rw4 - 0.3, h: 1.6, fontSize: 14, align: "center" });
  });
  source(s, n("VMQ 581 (20.10.2026): spot.uz, 21.10.2026; tanlov yiliga ikki marta, tijorat maqsadida foydalanish cheklangan"));
  notes(s, "Zaxira: yo'l xaritasi", "faqat savol bo'lsa",
    "VMQ 581 ijtimoiy ahamiyatli loyihalar uchun, tanlov iyul va noyabrda, tijorat maqsadida foydalanish taqiqlangan: bepul qism (yetkazib beruvchiga ogohlantirish) uchun ariza beramiz, va'da qilmaymiz. Engine Claude modellariga yozilgan; davlat modellarida hali sinalmagan.");

  // ===== 13. Backup screenshots =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Zaxira" });
  title(s, "Zaxira: demo skrinshotlari");
  const bu = findShot("backup_supplier"), bb = findShot("backup_bot");
  const bl = { x: M, w: 7.55 }, br = { x: M + 7.55 + 0.3, w: W - M - (M + 7.55 + 0.3) };
  if (bu) { const P = await placeShot(s, bu, bl.x, 1.4, bl.w, 4.5, "Backup: supplier flag and dashboard tiles"); shotCaption(s, "1. Lot 525192 · Davlat paneli (AI belgilagan, inson tasdiqlamagan)", P.left, P.bottom + 0.08, P.width); }
  else placeholderBox(s, bl.x, 1.4, bl.w, 4.5, "[PLACEHOLDER: app/screenshots/ supplier + dashboard]", "screenshot placeholder");
  if (bb) { const P = await placeShot(s, bb, br.x, 1.4, br.w, 4.5, "Backup: rendered bot reply"); shotCaption(s, "2. Bot javobi (render): lot 525192", P.left, P.bottom + 0.08, P.width); }
  else placeholderBox(s, br.x, 1.4, br.w, 4.5, "[PLACEHOLDER: app/screenshots/ bot]", "screenshot placeholder");
  source(s, "Statik skrinshotlar, jonli demo ishlamasa ko'rsatiladi; ma'lumot: UZEX etender, 17.11.2026 snapshot");
  notes(s, "Zaxira: skrinshotlar", "faqat kerak bo'lsa",
    "Faqat demo ishlamasa ko'rsating. 1) Bobur lot 525192 ni ochadi: 5,3 mln so'mlik 2 ta ajratgich uchun to'rtta ISO sertifikati; tavsiya \"qatnashing, lekin avval aniqlik so'rang\". 2) Davlat paneli: tahlil qilingan lotlar xavf bo'yicha saralangan. 3) Bot javobi: bu botning javobidan olingan render, Telegram chatining skrinshoti emas. Keyin 4-slaydga o'ting.");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  writeNotesMd();
  console.log("Wrote", OUT, "and", NOTES_MD);
  if (NEW_ABC) { // every converted word, for a human check of non-digraph sh/ch
    const list = [...CHANGED].sort((a, b) => a[0].localeCompare(b[0])).map(([a, b]) => `${a} -> ${b}`);
    fs.writeFileSync(path.join(__dirname, "alphabet-review.txt"), list.join("\n") + "\n", "utf8");
    console.log("Converted words:", list.length, "-> build/alphabet-review.txt");
  }
  console.log("Screenshots:", { supplier: findShot("supplier"), agency: findShot("agency"), bot: findShot("bot") });
  console.log("Eval:", DATA.eval);
}

const QA = `## Hakamlar savollari: tayyor javoblar

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
`;


function placeholderStatus() {
  const left = [];
  if (!evFilled) left.push("5-slayd (inson tekshiruvi raqamlari; hozir (b) varianti: faqat iqtibos tekshiruvi)");
  if (!TEAM.length) left.push("7-slayd (jamoa a'zolari va rollari)");
  if (!findShot("supplier") || !findShot("agency")) left.push("3-slayd (skrinshotlar; hozircha MAKET)");
  const miss = ["backup_supplier", "backup_bot"].filter((k) => !findShot(k));
  if (miss.length) left.push("13-slayd (" + miss.join(", ") + " skrinshotlari)");
  return left.length ? "Placeholder'lar: " + left.join("; ") + "." : "Barcha placeholder'lar to'ldirilgan.";
}
function writeNotesMd() {
  const parts = [
    "# TenderLens: ma'ruzachi eslatmalari (speaker notes)",
    "",
    "> Bu fayl `deck/build/build_deck.js` tomonidan slayd eslatmalari bilan **bir xil matndan** yaratiladi. O'zgartirish uchun skriptni tahrirlang va qayta ishga tushiring: `node deck/build/build_deck.js` (tenderlens papkasidan; yangi alifbo uchun `--alphabet yangi` qo'shing).",
    "> Vaqt 5 daqiqalik chiqishga mo'ljallangan (taxmin — haqiqiy slot uzunligini tekshiring); 90 soniyalik demo — `demo-script.md`.",
    "> " + placeholderStatus(),
    "> So'z qoidasi (CONTRACT.md): faqat \"adolatsiz shartlar\" yoki \"cheklovchi talablar\" deng.",
    "",
  ];
  NOTES.forEach((x, i) => {
    parts.push(`## ${i + 1}. ${x.t} (${x.time})`, "", x.text.replace(/\n\n/g, "\n\n"), "");
  });
  parts.push(QA);
  fs.writeFileSync(NOTES_MD, T(parts.join("\n")), "utf8");
}

build().catch((e) => { console.error(e); process.exit(1); });
