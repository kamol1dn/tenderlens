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
const evFilled = ["recall_pct", "false_alarms_per_spec", "specs_labelled"].every((k) => EV[k] !== null && EV[k] !== undefined);
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
const KEEP_WORDS = ["UZEX", "ISO", "PF-259", "ZRU-684", "VMQ", "OCDS", "CAPEX", "TenderLens", "TenderZone", "TenderGPT", "Team Eclipse", "National AI Hackathon", "Quarry", "Telegram", "ProZorro", "DoZorro", "BRIAS", "ALICE", "CGU", "LLM", "API", "OCR", "MAKET", "PLACEHOLDER", "TradeList", "GetTrade", "DownloadFile", "DealsList", "speaker notes", "engine", "recall", "vision", "snapshot", "pitch", "chatbot"];
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
const ANALYSED = STATS.analysed_lots, OPEN = STATS.open_lots;
const INDEX = JSON.parse(fs.readFileSync(path.join(CACHE, "index.json"), "utf8"));
const LIGHTS = INDEX.reduce((a, x) => ((a[x.traffic_light] = (a[x.traffic_light] || 0) + 1), a), {});
const ANALYSED_BN = (INDEX.reduce((a, x) => a + (x.start_cost || 0), 0) / 1e9).toFixed(0);
const TPL = Object.fromEntries((STATS.template_findings || STATS.template_labels || []).map((t) => [t.key, t]));
const VET = TPL.veterinary_control, TRAIN = TPL.staff_training, IPR = TPL.intellectual_property;
if (!VET || !TRAIN || !IPR) throw new Error("stats.json: template findings missing");
const light = (id) => ({ red: COL.red, amber: COL.amber, green: COL.green }[(lot(id) || {}).traffic_light] || HEX.grey);

// ---------- mockups (verified content only: engine-verified quotes, stats.json counts; no customer names) ----------
function supplierMock(slide, x, y, w, h) {
  card(slide, x, y, w, h, COL.white, "Supplier screen mockup", { line: HEX.line, shadow: true, r: 0.1 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.5, fill: { color: COL.teal }, line: { color: COL.teal }, objectName: "mock header" });
  txt(slide, [{ text: "TenderLens", options: { bold: true, color: COL.amber } }, { text: "  ·  Lot 524954", options: { color: COL.white } }], { x: x + 0.25, y, w: w - 2, h: 0.5, fontSize: 14, valign: "middle" });
  txt(slide, "Yetkazib beruvchi", { x: x + w - 3.2, y, w: 1.6, h: 0.5, fontSize: 12, color: COL.tint, align: "right", valign: "middle" });
  const ix = x + 0.3, iw = w - 0.6;
  txt(slide, "Suv omborida suv urilma qudug'i: ishchi loyiha", { x: ix, y: y + 0.66, w: iw, h: 0.38, fontSize: 18, bold: true, color: COL.teal });
  txt(slide, n("Toshkent viloyati · boshlang'ich narx: 330,4 mln so'm"), { x: ix, y: y + 1.04, w: iw, h: 0.3, fontSize: 13, color: COL.muted });
  card(slide, ix, y + 1.46, 3.9, 0.34, COL.red, "flag pill", { r: 0.17 });
  txt(slide, "Lot hajmiga nomutanosib moliyaviy talab", { x: ix, y: y + 1.46, w: 3.9, h: 0.34, fontSize: 12, bold: true, color: COL.white, align: "center", valign: "middle" });
  card(slide, ix, y + 1.92, iw, 1.05, COL.tint, "quote box", { r: 0.08 });
  txt(slide, [
    { text: "4-mezon, moliyaviy barqarorlik (15 ball): ", options: { bold: true, breakLine: true } },
    { text: "«" + K(Q524954) + "»", options: { italic: true } },
  ], { x: ix + 0.2, y: y + 1.97, w: iw - 0.4, h: 0.95, fontSize: 14, valign: "middle" });
  txt(slide, n("8 mlrd so'm ÷ 330,4 mln so'm ≈ 24 baravar. Kichik loyihalash firmasi bu 15 ballni yo'qotadi."), { x: ix, y: y + 3.1, w: iw, h: 0.6, fontSize: 14 });
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
    { id: "524954", t: "524954 · Loyihalash ishlari", s: n("Aylanma 8 mlrd so'm — lot 330,4 mln (≈24×)") },
    { id: "525192", t: "525192 · Ajratgich, 2 dona", s: n("4 ta ISO sertifikati — lot 5,3 mln so'm") },
    { id: "524769", t: "524769 · Shifoxona bemorlari ovqati", s: n("Bank hisobida shartnoma summasining 40% i") },
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

  // ===== 1. Hook =====
  pres.addSection({ title: "Muammo" });
  let s = pres.addSlide({ masterName: "TL_HOOK", sectionTitle: "Muammo" });
  iconCircle(s, I.search, M, 0.45, 0.62, COL.amber, "TenderLens logo");
  txt(s, "TenderLens", { x: M + 0.8, y: 0.45, w: 4, h: 0.62, fontSize: 26, bold: true, color: COL.white, valign: "middle" });
  txt(s, n("Team Eclipse · National AI Hackathon · Toshkent, 17–19.11.2026"), { x: 6.2, y: 0.45, w: W - M - 6.2, h: 0.62, fontSize: 13, color: COL.tint, align: "right", valign: "middle" });
  txt(s, n("8 647"), { x: M, y: 1.35, w: 7.6, h: 2.0, fontSize: 138, bold: true, color: COL.amber, valign: "middle", objectName: "hero number" });
  txt(s, "muayyan ishtirokchilarga imtiyoz yaratish holati — 2025-yilda, davlat xaridlarida", { x: M, y: 3.4, w: 7.4, h: 1.05, fontSize: 26, color: COL.white });
  card(s, 8.55, 1.5, W - M - 8.55, 1.9, COL.white, "stat card 1", { transparency: 90 });
  txt(s, n("28 300"), { x: 8.8, y: 1.62, w: 3.8, h: 0.8, fontSize: 48, bold: true, color: COL.amber, valign: "middle" });
  txt(s, n("raqobatga qarshi harakat 16 100 ta xarid tartib-taomilida (8 647 — shular jumlasidan)"), { x: 8.8, y: 2.42, w: 3.75, h: 0.9, fontSize: 15, color: COL.white });
  card(s, 8.55, 3.6, W - M - 8.55, 1.35, COL.white, "stat card 2", { transparency: 90 });
  txt(s, n("23 000+"), { x: 8.8, y: 3.7, w: 3.8, h: 0.65, fontSize: 40, bold: true, color: COL.amber, valign: "middle" });
  txt(s, "tartib-taomil Raqobat qo'mitasi tomonidan tahlil qilingan", { x: 8.8, y: 4.35, w: 3.75, h: 0.55, fontSize: 15, color: COL.white });
  txt(s, [
    { text: "TenderLens", options: { bold: true, color: COL.amber } },
    { text: " texnik topshiriqni o'qiydi va bitta ishtirokchiga moslab yozilgan shartni so'zma-so'z iqtibos bilan ko'rsatadi.", options: { color: COL.white } },
  ], { x: M, y: 5.45, w: CW, h: 0.95, fontSize: 24, valign: "middle" });
  source(s, n("Manba: Raqobatni rivojlantirish va iste'molchilar huquqlarini himoya qilish qo'mitasi, 2025 yakunlari — kun.uz, 10.03.2026"));
  notes(s, "Hook: 8 647", "0:00–0:30",
    "2025-yilda Raqobat qo'mitasi 23 mingdan ortiq davlat xaridi tartib-taomilini tahlil qildi va 16 100 tasida 28 300 ta raqobatga qarshi harakat topdi. " +
    "Ulardan 8 647 tasi — muayyan ishtirokchilarga imtiyoz yaratish holatlari. Bunday imtiyoz texnik topshiriq yoki baholash mezoniga yozilishi mumkin — va uni hech kim o'qib ulgurmaydi. " +
    "Biz TenderLens'ni qurdik: u texnik topshiriqni o'qiydi va bitta ishtirokchiga moslab yozilgan shartni so'zma-so'z iqtibos bilan ko'rsatadi.\n\n" +
    "Eslatma: 8 647 — 28 300 ning bir qismi, ularni qo'shmang. Faqat \"adolatsiz shartlar\" yoki \"cheklovchi talablar\" deng (CONTRACT.md dagi so'z qoidasi).");

  // ===== 2. Bidder curve =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Muammo" });
  title(s, "Ishtirokchi ko'p bo'lsa — narx tushadi");
  s.addChart(pres.charts.BAR, [{ name: T("Mediana pasayish, %"), labels: ["1", "2", "3", "4", "5", "6+"], values: ["1", "2", "3", "4", "5", "6+"].map((k) => Math.round(curve[k] * 10) / 10) }], {
    x: M, y: 1.4, w: 7.9, h: 5.35, barDir: "col", barGapWidthPct: 45,
    chartColors: [HEX.grey, HEX.red, HEX.tealMid, HEX.tealMid, HEX.tealMid, HEX.green],
    showTitle: true, title: T("Boshlang'ich narxdan pasayish (mediana), ishtirokchilar soni bo'yicha"), titleFontSize: 14, titleColor: COL.ink, titleFontFace: "+mn-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 16, dataLabelFontBold: true, dataLabelColor: COL.ink, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 16, catAxisLabelColor: COL.ink, catAxisLabelFontFace: "+mn-lt",
    showCatAxisTitle: true, catAxisTitle: T("Ishtirokchilar soni"), catAxisTitleFontSize: 13, catAxisTitleColor: COL.muted, catAxisTitleFontFace: "+mn-lt",
    valAxisMinVal: 0, valAxisMaxVal: 40, valAxisMajorUnit: 10, valAxisLabelFormatCode: '0"%"', valAxisLabelFontSize: 12, valAxisLabelColor: COL.muted, valAxisLabelFontFace: "+mn-lt",
    valGridLine: { color: HEX.line, size: 1 }, catGridLine: { style: "none" }, showLegend: false,
  });
  card(s, 8.9, 1.5, W - M - 8.9, 1.35, COL.red, "2 bidders callout", { transparency: 88 });
  txt(s, "2 ishtirokchi", { x: 9.15, y: 1.6, w: 3.4, h: 0.4, fontSize: 16, bold: true, color: COL.red });
  txt(s, n("−" + pct(curve["2"])), { x: 9.15, y: 1.98, w: 3.4, h: 0.8, fontSize: 44, bold: true, color: COL.red, valign: "middle" });
  card(s, 8.9, 3.05, W - M - 8.9, 1.35, COL.green, "6+ bidders callout", { transparency: 88 });
  txt(s, "6 va undan ko'p", { x: 9.15, y: 3.15, w: 3.4, h: 0.4, fontSize: 16, bold: true, color: COL.green });
  txt(s, n("−" + pct(curve["6+"])), { x: 9.15, y: 3.53, w: 3.4, h: 0.8, fontSize: 44, bold: true, color: COL.green, valign: "middle" });
  txt(s, [{ text: pct(STATS.share_exactly_2_bidders * 100), options: { bold: true, color: COL.teal, fontSize: 22 } }, { text: " bitimda aynan 2 ishtirokchi — qonuniy minimum (ZRU-684: kamida 2 taklif)", options: { fontSize: 16 } }], { x: 8.9, y: 4.6, w: W - M - 8.9, h: 1.15 });
  txt(s, "Bu bog'liqlik, sabab emas: lot turlari va hajmlari farq qiladi.", { x: 8.9, y: 5.85, w: W - M - 8.9, h: 0.6, fontSize: 12, italic: true, color: COL.muted });
  source(s, CURVE_SRC);
  notes(s, "Raqobat va narx", "0:30–0:55",
    `Bu o'z hisobimiz — UZEX ochiq API'sidagi ${thou(STATS.deals_analysed)} ta bitim, ${P_FROM}–${P_TO}. Ikki ishtirokchi bo'lsa, narx boshlang'ich narxdan atigi ${pct(curve["2"])} tushadi. To'rt ishtirokchida — ${pct(curve["4"])}, olti va undan ko'pida — ${pct(curve["6+"])}. ` +
    `Bitimlarning ${pct(STATS.share_exactly_2_bidders * 100)} ida aynan ikki ishtirokchi bo'lgan — bu qonun talab qiladigan minimum: ZRU-684 bo'yicha tanlov va tender kamida ikki taklif bo'lsagina o'tgan hisoblanadi. Bu bog'liqlik, sabab emas — lotlar har xil. Lekin yo'nalish aniq: har bir qo'shimcha halol ishtirokchi — byudjet uchun tejash.\n\n` +
    "Manba: raqamlar engine'ning data/cache/stats.json faylidan (deck, ilova va pitch uchun yagona manba). ZRU-684 — lex.uz (eng yaxshi takliflarni tanlash va tender bo'yicha moddalar; sahnada modda raqamini aytmang).");

  // ===== 3. Two users =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Muammo" });
  title(s, "Ikki foydalanuvchi, bitta muammo");
  const users = [
    { x: M, ic: I.user, circ: COL.amber, name: "Bobur — kichik loyihalash firmasi", role: "Loyiha-smeta ishlari va mualliflik nazorati",
      pain: "Texnik topshiriq 2 betdan 88 betgacha, kirill, lotin yoki rus tilida. Qaysi tenderda yutish mumkinligini bilmaydi.",
      gets: "Tavsiya: qatnashing / avval aniqlik so'rang / qatnashmang. Tayyor so'rov xati. Telegramda ogohlantirish." },
    { x: M + CW / 2 + 0.15, ic: I.shield, circ: COL.amber, name: "Agentlik tahlilchisi", role: "Sanoat kooperatsiyasi va davlat xaridlari agentligi",
      pain: n("Yiliga ~2 mln lot. Ekspert bahosi: atigi 2–3% qo'lda tahlil qilinadi."),
      gets: "Xavf navbati: iqtibos, Raqobat qo'mitasi toifasi, neytral tahrir. Shablon topilmalari: bitta mezon — o'nlab lot." },
  ];
  const uw = CW / 2 - 0.15;
  for (const u of users) {
    card(s, u.x, 1.4, uw, 3.75, COL.tint, "user card", { r: 0.12 });
    iconCircle(s, u.ic, u.x + 0.3, 1.6, 0.8, u.circ, "user icon");
    txt(s, u.name, { x: u.x + 1.3, y: 1.6, w: uw - 1.5, h: 0.45, fontSize: 21, bold: true, color: COL.teal, valign: "middle" });
    txt(s, u.role, { x: u.x + 1.3, y: 2.05, w: uw - 1.5, h: 0.38, fontSize: 14, color: COL.muted, valign: "middle" });
    txt(s, [{ text: "Muammo", options: { bold: true, color: COL.red, breakLine: true } }, { text: u.pain }], { x: u.x + 0.3, y: 2.65, w: uw - 0.6, h: 1.1, fontSize: 15 });
    txt(s, [{ text: "TenderLens beradi", options: { bold: true, color: COL.green, breakLine: true } }, { text: u.gets }], { x: u.x + 0.3, y: 3.85, w: uw - 0.6, h: 1.15, fontSize: 15 });
  }
  card(s, M, 5.35, CW, 1.35, COL.teal, "social band", { r: 0.12 });
  iconCircle(s, I.child, M + 0.25, 5.6, 0.85, COL.amber, "kindergarten");
  iconCircle(s, I.hosp, M + 1.25, 5.6, 0.85, COL.amber, "children's hospital");
  txt(s, [
    { text: "Bolalar va bemorlar ham tenderga bog'liq. ", options: { bold: true, color: COL.amber } },
    { text: "Bog'chalarda issiq ovqat lotlaridagi bayroqlar VMQ 810 milliy namunaviy hujjatidan keladi: 3 oylik shartnoma summasiga teng aylanma mablag' va 3 oylik oziq-ovqat zaxirasi. Bitta namunani tuzating — barcha bog'cha lotlari tuzaladi.", options: { color: COL.white } },
  ], { x: M + 2.35, y: 5.42, w: CW - 2.6, h: 1.2, fontSize: 15, valign: "middle" });
  source(s, n("Manba: TT hajmi — 16 lot namunasi, UZEX API, 17.11.2026; ~2 mln lot va 2–3% — TenderZone eksperti bahosi, anhor.uz; bog'cha lotlari 524116, 524120, 524152 — TenderLens engine"));
  notes(s, "Ikki foydalanuvchi", "0:55–1:20",
    "TenderLens ikki kishi uchun. Bobur — kichik loyihalash firmasi egasi. Texnik topshiriq 2 betdan 88 betgacha, kirill, lotin yoki rus tilida bo'ladi — u qaysi tenderda yutishi mumkinligini bilmaydi. " +
    "Ikkinchisi — Sanoat kooperatsiyasi va davlat xaridlari agentligi tahlilchisi: yiliga taxminan 2 million lot, ekspert bahosiga ko'ra atigi 2–3% qo'lda tahlil qilinadi. TenderLens unga nafaqat lotlarni, balki shablon xatolarini ham ko'rsatadi: bitta mezon o'nlab lotda takrorlanadi. " +
    "Va bu bolalar haqida ham: bog'chalarda issiq ovqat lotlaridagi bayroqlar VMQ 810 milliy namunaviy hujjatidan keladi — 3 oylik shartnoma summasiga teng aylanma mablag' va 3 oylik oziq-ovqat zaxirasi. Bitta namunani tuzatsak, barcha bog'cha lotlari tuzaladi.\n\n" +
    "Diqqat: bu shartlarni buyurtmachi — bog'cha — o'ylab topmagan, ular milliy namunadan keladi; hech kimni ayblamang. 2–3% rasmiy raqam emas, ekspert bahosi.");

  // ===== 4. Live demo =====
  pres.addSection({ title: "Yechim" });
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Yechim" });
  title(s, "Jonli demo: 90 soniya");
  const sup = findShot("supplier"), agy = findShot("agency");
  if (sup && agy) { // real presentation-mode screenshots: bigger images, no step row
    const lw = 7.23, rx = M + lw + 0.3, rw = W - M - rx;
    const L = await placeShot(s, sup, M, 1.4, lw, 4.55, "Supplier screen: lot 524954");
    shotCaption(s, "Yetkazib beruvchi: lot 524954 — ball, tavsiya, iqtibos", L.left, L.bottom + 0.1, L.width);
    const R = await placeShot(s, agy, rx, 1.4, rw, 4.55, "Government dashboard: tiles and template findings");
    shotCaption(s, "Davlat nazorati paneli: tizimli muammolar", R.left, R.bottom + 0.1, R.width);
  } else {
    const lw = 6.75, rx = M + lw + 0.3, rw = W - M - rx, fy = 1.4, fh = 4.65;
    supplierMock(s, M, fy, lw, fh); makTag(s, M + lw - 1.4, fy + 0.09);
    agencyMock(s, rx, fy, rw, fh); makTag(s, rx + rw - 1.4, fy + 0.09);
    const steps = ["Lot raqami", "TT o'qiladi", "Bayroq + iqtibos", "Tavsiya va xat", "Agentlik navbati", "Telegram"];
    const sw = (CW - 0.15 * 5) / 6;
    steps.forEach((t, i) => {
      const sx = M + i * (sw + 0.15);
      card(s, sx, 6.2, sw, 0.55, i < 4 ? COL.tint : COL.teal, "demo step", { r: 0.27 });
      txt(s, [{ text: `${i + 1}  `, options: { bold: true, color: i < 4 ? COL.tealMid : COL.amber } }, { text: t, options: { color: i < 4 ? COL.ink : COL.white } }], { x: sx, y: 6.2, w: sw, h: 0.55, fontSize: 14, align: "center", valign: "middle" });
    });
  }
  source(s, n((sup && agy ? "" : "MAKET ekranlar app skrinshotlari bilan almashtiriladi. ") + "Lot ma'lumotlari: UZEX etender, 17.11.2026 snapshot (lotlar 18.11 da yopiladi); 662 ochiq lot — TradeList"));
  notes(s, "Jonli demo", "1:20–2:50",
    "To'liq skript: deck/demo-script.md. Demo oflayn keshdan ishlaydi (lotlar 18-noyabrda yopiladi).\n" +
    "1) Bobur 524954 lot raqamini kiritadi (suv omboridagi inshoot uchun ishchi loyiha, 330,4 mln so'm). 2) TenderLens texnik topshiriq va platforma mezonlarini o'qiydi. 3) Bayroq: 4-mezon o'rtacha yillik aylanma kamida 8 mlrd so'm talab qiladi — lotdan ≈24 baravar ko'p. " +
    `4) Tavsiya: \"Qatnashing, lekin avval aniqlik so'rang\" — bir tugma bilan so'rov xati. 5) Davlat nazorati paneli: ${ANALYSED} ta tahlil qilingan lot (${OPEN} ochiq lotdan) xavf bo'yicha saralangan; tepada shablon topilmalari (veterinariya mezoni ${VET.lots} lotda). 6) Telegram: Quarry kuzatadi, TenderLens baholaydi — birinchi haqiqiy ogohlantirish allaqachon yuborilgan.\n\n` +
    "Hech qachon \"662 lotning hammasi baholandi\" demang — faqat tahlil qilinganlar soni. Buyurtmachi nomlarini ko'rsatmang (ilovaning taqdimot rejimi).\n" +
    "Agar ilova ishlamasa: 12-slayd (Zaxira) — statik skrinshotlar. Hech qachon qo'lda tekshirilmagan bayroqni ko'rsatmang.");

  // ===== 5. How it works =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Yechim" });
  title(s, "Qanday ishlaydi: AI o'qiydi, qoidalar hisoblaydi");
  const pipe = [
    { ic: I.api, t: "UZEX API", d: "lot, TT, mezonlar" }, { ic: I.ocr, t: "OCR / vision", d: "skan, kirill, lotin, rus" },
    { ic: I.llm, t: "LLM", d: "talab + iqtibos" }, { ic: I.check, t: "Tekshiruv", d: "iqtibos hujjatda bormi?" },
    { ic: I.score, t: "Baho", d: "taksonomiya + mijoz tarixi" }, { ic: I.screens, t: "Ikki ekran", d: "Bobur · Agentlik" },
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
    { text: "Quarry", options: { bold: true, color: COL.tealMid } },
    { text: n(" 660+ lotni uzluksiz kuzatadi; TenderLens har birini baholaydi; yetkazib beruvchi Telegramda adolat verdikti bilan ogohlantirish oladi — birinchisi allaqachon yuborildi."), options: { color: COL.ink } },
  ], { x: M, y: 3.02, w: CW, h: 0.42, fontSize: 15, italic: true, valign: "middle" });
  const cy = 3.6, ch = 3.15, cw3 = (CW - 0.5) / 3;
  const cols = [
    { x: M, head: "AI (LLM)", hc: COL.amber, htc: COL.ink, items: ["Skan va aralash yozuvli TTni o'qish", "Talablarni ajratish — so'zma-so'z iqtibos bilan", "Cheklovchi talab turini aniqlash va izohlash", "Neytral tahrir va so'rov xati"] },
    { x: M + cw3 + 0.25, head: "Qoidalar va statistika", hc: COL.tealMid, htc: COL.white, items: ["Muddatlar, takroriy e'lon, 70/30 vazn", "Mijoz tarixi: ishtirokchilar medianasi, takroriy g'olib", "Yakuniy xavf balli — shaffof formula", "Qonun havolalari jadvaldan — LLM o'ylab topmaydi"] },
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
  txt(s, "Iqtibos yo'q — bayroq yo'q", { x: bx + 1.1, y: cy + 0.2, w: cw3 - 1.3, h: 0.8, fontSize: 21, bold: true, color: COL.amber, valign: "middle" });
  txt(s, "LLM faqat hujjatdan so'zma-so'z keltirgan bandni belgilaydi. Iqtibos TT matni yoki platforma mezonlari bilan solishtiriladi; mos kelmasa, bayroq o'chiriladi. Qaror — inson ixtiyorida.", { x: bx + 0.25, y: cy + 1.15, w: cw3 - 0.5, h: ch - 1.3, fontSize: 15, color: COL.white });
  source(s, n("Ma'lumot: UZEX etender ochiq API — TradeList, GetTrade, DownloadFile, DealsList; 662 ochiq lot va 70/30 vazn (16 lotdan 12 tasi) — 17.11.2026"));
  notes(s, "Qanday ishlaydi", "2:50–3:20",
    "TenderLens UZEX ochiq API'sidan lotni, texnik topshiriq faylini va platformadagi baholash mezonlarini oladi. Skan yoki aralash yozuvli fayllarni OCR va vision model o'qiydi. LLM har bir talabni so'zma-so'z iqtibos bilan ajratadi; iqtibos hujjatda topilmasa — bayroq o'chiriladi. " +
    "Keyin 9 turdagi cheklovchi talab taksonomiyasi va buyurtmachining tarixi (ishtirokchilar medianasi, takroriy g'olib) qo'shiladi. Statistika va yakuniy ball — oddiy, tekshiriladigan qoidalar: bu ataylab. " +
    "Quarry 660 dan ortiq lotni uzluksiz kuzatadi, TenderLens har birini baholaydi, yetkazib beruvchi Telegramda adolat verdikti bilan ogohlantirish oladi.\n\n" +
    "\"Bu shunchaki qoidalar + chatbot\" desa: qiyin qismi — 2–88 betlik, uch yozuvdagi TTni minglab lotlar bo'yicha o'qish — aynan AI.");

  // ===== 6. Proof =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Yechim" });
  title(s, "Isbot: haqiqiy lotlar, so'zma-so'z iqtibos");
  const evRows = [
    { v: EV.recall_pct, f: (x) => `${fmt(x)}%`, l: "cheklovchi bandlar topildi (recall)" },
    { v: EV.false_alarms_per_spec, f: (x) => fmt(x), l: "yolg'on signal / bitta TT" },
    { v: EV.specs_labelled, f: (x) => String(x), l: "qo'lda belgilangan TT" },
  ];
  const ex = M, ew = 3.55;
  card(s, ex, 1.4, ew, 5.35, COL.tint, "eval card", { r: 0.12 });
  txt(s, "Baholash natijalari", { x: ex + 0.3, y: 1.55, w: ew - 0.6, h: 0.45, fontSize: 19, bold: true, color: COL.teal, valign: "middle" });
  txt(s, "Qo'lda belgilangan TT to'plamida", { x: ex + 0.3, y: 2.0, w: ew - 0.6, h: 0.35, fontSize: 13, color: COL.muted });
  evRows.forEach((r, i) => {
    const yy = 2.55 + i * 1.3;
    if (r.v === null || r.v === undefined) placeholderBox(s, ex + 0.3, yy, ew - 0.6, 0.72, "[PLACEHOLDER: engine eval]", "eval placeholder");
    else txt(s, r.f(r.v), { x: ex + 0.3, y: yy, w: ew - 0.6, h: 0.72, fontSize: 40, bold: true, color: COL.teal, valign: "middle" });
    txt(s, r.l, { x: ex + 0.3, y: yy + 0.76, w: ew - 0.6, h: 0.35, fontSize: 14, color: COL.ink });
  });
  // hero: lot 524954 (turnover 24x the lot), then 525192, 524769 (hospital meals) and the template finding
  const hx = ex + ew + 0.3, hw = W - M - hx;
  card(s, hx, 1.4, hw, 3.2, COL.white, "lot 524954 case", { line: HEX.line, shadow: true, r: 0.12 });
  card(s, hx + 0.3, 1.58, 1.3, 0.36, COL.red, "lot pill", { r: 0.18 });
  txt(s, "Lot 524954", { x: hx + 0.3, y: 1.58, w: 1.3, h: 0.36, fontSize: 12, bold: true, color: COL.white, align: "center", valign: "middle" });
  txt(s, n("Suv omborida suv urilma qudug'i: ishchi loyiha · 330,4 mln so'm"), { x: hx + 1.8, y: 1.54, w: hw - 2.1, h: 0.44, fontSize: 15, bold: true, color: COL.teal, valign: "middle" });
  card(s, hx + 0.3, 2.1, hw - 0.6, 1.0, COL.tint, "quote box", { r: 0.08 });
  s.addImage({ data: I.quote, x: hx + 0.45, y: 2.2, w: 0.32, h: 0.32, altText: "quote", objectName: "quote mark" });
  txt(s, [
    { text: "«" + K(Q524954) + "»", options: { bold: true, color: COL.ink, fontSize: 20, breakLine: true } },
    { text: "Platforma mezonlari formasi, 4-mezon «Moliyaviy barqarorlik» — 100 dan 15 texnik ball", options: { fontSize: 12, italic: true, color: COL.muted } },
  ], { x: hx + 0.9, y: 2.13, w: hw - 1.35, h: 0.94, valign: "middle" });
  const cmp = [{ t: n("Talab: aylanma ≥ 8 mlrd so'm"), c: COL.red }, { t: n("Lot: 330,4 mln so'm → ≈24 baravar"), c: COL.teal }];
  cmp.forEach((p, i) => {
    const pw2 = (hw - 0.75) / 2, px2 = hx + 0.3 + i * (pw2 + 0.15);
    card(s, px2, 3.22, pw2, 0.46, p.c, "compare pill", { r: 0.23, transparency: 85 });
    txt(s, p.t, { x: px2, y: 3.22, w: pw2, h: 0.46, fontSize: 15, bold: true, color: p.c, align: "center", valign: "middle" });
  });
  txt(s, [
    { text: "O'tish bali 70: bu 15 ballni olmagan kichik loyihalash firmasi qolgan 85 dan 70 ni olishi shart. ", options: {} },
    { text: "Tavsiya: avval aniqlik so'rang.", options: { bold: true } },
  ], { x: hx + 0.3, y: 3.8, w: hw - 0.6, h: 0.65, fontSize: 14, valign: "middle" });
  const mini = [
    { big: "4 ISO", fill: COL.tint, bc: COL.teal, tc: COL.ink, t: n("ISO 9001, 14001, 45001, 50001 — 5,3 mln so'mlik 2 ta ajratgich uchun (525192)") },
    { big: "40%", fill: COL.tint, bc: COL.teal, tc: COL.ink, t: n("Shifoxona bemorlari ovqati, 445,4 mln so'm: bank hisobida shartnoma summasining 40% i (524769)") },
    { big: `${VET.lots} lot`, fill: COL.teal, bc: COL.amber, tc: COL.white, t: `Bitta shablon mezoni veterinariya hujjatini so'raydi; ~${VET.likely_not_applicable} tasi oziq-ovqat emas (dolota, sement). Shablonni tuzating — hammasi tuzaladi.` },
  ];
  const mw = (hw - 0.5) / 3;
  mini.forEach((m, i) => {
    const mx = hx + i * (mw + 0.25);
    card(s, mx, 4.75, mw, 2.0, m.fill, "finding card", { r: 0.12 });
    txt(s, m.big, { x: mx + 0.2, y: 4.82, w: mw - 0.4, h: 0.55, fontSize: 28, bold: true, color: m.bc, valign: "middle" });
    txt(s, m.t, { x: mx + 0.2, y: 5.38, w: mw - 0.4, h: 1.3, fontSize: 13, color: m.tc });
  });
  source(s, n("Manba: UZEX etender, 17.11.2026 — lotlar 524954, 525192, 524769; shablon — GetTrade mezonlari, o'z hisobimiz; baholash — TenderLens engine" + (evFilled ? "" : " (to'ldiriladi)")));
  notes(s, "Isbot", "3:20–3:45",
    "Asosiy misol — lot 524954: suv omboridagi inshoot uchun ishchi loyiha, 330,4 million so'm. Platformadagi 4-mezon — moliyaviy barqarorlik, 15 ball: so'nggi 3 yil uchun o'rtacha yillik aylanma kamida 8 milliard so'm. Bu lot narxidan taxminan 24 baravar ko'p. " +
    "O'tish bali 70: bu 15 ballni ololmagan kichik loyihalash firmasi qolgan 85 balldan 70 tasini olishi shart. Tavsiya: avval aniqlik so'rang. " +
    "525192 — 5,3 million so'mlik ikkita ajratgich uchun to'rtta ISO sertifikati. 524769 — yuqumli kasalliklar shifoxonasi bemorlarining ovqati, 445 million so'm: bank hisobida shartnoma summasining 40 foizi turishi kerak. Bu kichik oshxonalar uchun og'ir shart — va bu bemorlar ovqati. " +
    `Davlat uchun tizimli topilma: bitta platforma shabloni mezoni ${VET.lots} ta ochiq lotda veterinariya hujjatini so'raydi, taxminan ${VET.likely_not_applicable} tasi oziq-ovqat yoki hayvon mahsuloti emas — dolota, sement. Xodimlarni o'qitish mezoni ${TRAIN.lots} ta, intellektual mulkni topshirish ${IPR.lots} ta lotda. Shablonni bir marta tuzatsangiz — barcha lotlar tuzaladi. ` +
    (evFilled
      ? `Chapda — qo'lda belgilangan ${EV.specs_labelled} ta texnik topshiriqdagi natijamiz: cheklovchi bandlarning ${fmt(EV.recall_pct)}% i topildi, bitta TTga ${fmt(EV.false_alarms_per_spec)} ta yolg'on signal.\n\n`
      : "Chapda — qo'lda belgilangan texnik topshiriqlardagi natijamiz: [PLACEHOLDER: recall %], bitta TTga [PLACEHOLDER: yolg'on signal], [PLACEHOLDER: N] ta TT.\n\n") +
    `Buyurtmachi nomlarini aytmang — biz shartni ko'rsatamiz, tashkilotni emas. Hammasi maslahat, ayblov emas; qaror inson ixtiyorida. Bu bayroqlarni hali inson tasdiqlamagan (hero_check.md). Veterinariya mezoni matni to'rt turdagi mahsulotni birlashtiradi; "~${VET.likely_not_applicable}" — kalit so'zlar bo'yicha taxmin.`);

  // ===== 7. Scale: Quarry on three platforms (facts: quarry/TENDERLENS.md "Other platforms", live 17–18.11) =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Yechim" });
  title(s, "Miqyos: bitta Quarry dvigateli, 3 ta sayt jonli o'qiladi");
  // 2 independent tender platforms + the state portal, which republishes UZEX tenders. Never say "3 platforms".
  const plats = [
    { h: "UZEX etender", big: "662/662", l: "ochiq lot, har biri TT havolasi bilan", m: "Mustaqil platforma 1 · to'liq yig'ish: 245 soniya (17.11)" },
    { h: "UZTender", big: "100/100", l: "lotda nom, buyurtmachi va narx bor", m: "Mustaqil platforma 2 · 100 lotlik namuna: 76 soniya (18.11)" },
    { h: "Davlat portali xarid.icppa.uz", big: "20/20", l: "lotda nom, buyurtmachi va narx bor", m: "UZEX tenderlarini qayta e'lon qiladi · 20 lotlik jonli namuna (18.11)" },
  ];
  const pcw = (CW - 0.5) / 3;
  plats.forEach((p, i) => {
    const px = M + i * (pcw + 0.25);
    card(s, px, 1.4, pcw, 2.55, COL.tint, "platform card", { r: 0.12 });
    iconCircle(s, I.api, px + 0.3, 1.58, 0.6, COL.teal, "platform");
    txt(s, p.h, { x: px + 1.05, y: 1.58, w: pcw - 1.25, h: 0.6, fontSize: 18, bold: true, color: COL.teal, valign: "middle" });
    txt(s, p.big, { x: px + 0.3, y: 2.32, w: pcw - 0.6, h: 0.7, fontSize: 40, bold: true, color: COL.teal, valign: "middle" });
    txt(s, p.l, { x: px + 0.3, y: 3.02, w: pcw - 0.6, h: 0.4, fontSize: 14 });
    txt(s, p.m, { x: px + 0.3, y: 3.42, w: pcw - 0.6, h: 0.4, fontSize: 12, color: COL.muted });
  });
  const flow = [
    { ic: I.ocr, h: "Yangi platforma = bitta retsept fayli", d: "Deklarativ JSON: sahifalash, yuklash va maydonlar tavsifi. Dvigatel kodi o'zgarmaydi.", f: COL.teal, tc: COL.white, dc: COL.tint },
    { ic: I.check, h: "Sifat tekshiruvi (health gates)", d: "Yig'ilgan ma'lumot e'lon qilinishidan oldin avtomatik tekshiriladi.", f: COL.teal, tc: COL.white, dc: COL.tint },
    { ic: I.tg, h: "Telegram ogohlantirish", d: "Mos lot tepasida TenderLens verdikti. 2 ta haqiqiy ogohlantirish yuborildi: lot 522893 va 524784.", f: COL.amber, tc: COL.ink, dc: COL.ink },
  ];
  flow.forEach((f, i) => {
    const fx = M + i * (pcw + 0.25);
    card(s, fx, 4.25, pcw, 2.45, f.f, "flow card", { r: 0.12 });
    s.addImage({ data: f.ic, x: fx + 0.3, y: 4.42, w: 0.42, h: 0.42, altText: T(f.h), objectName: "flow icon" });
    txt(s, f.h, { x: fx + 0.9, y: 4.38, w: pcw - 1.1, h: 0.55, fontSize: 16, bold: true, color: f.tc, valign: "middle" });
    txt(s, f.d, { x: fx + 0.3, y: 5.05, w: pcw - 0.6, h: 1.5, fontSize: 14, color: f.dc });
    if (i < 2) s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: fx + pcw + 0.03, y: 5.37, w: 0.19, h: 0.19, rotate: 90, fill: { color: COL.muted }, line: { color: COL.muted }, objectName: "flow arrow" });
  });
  source(s, "Manba: Quarry jonli tekshiruvi, 17–18.11.2026 (quarry/TENDERLENS.md, \"Other platforms\"); UZEX etender, UZTender, xarid.icppa.uz ochiq sahifalari. 2 ta mustaqil tender platformasi + davlat portali");
  notes(s, "Miqyos: Quarry", "3:45–4:05",
    "TenderLens bitta saytga bog'lanib qolmagan. Jamoadoshimizning Quarry dvigateli bugun uchta saytni jonli o'qiydi, ulardan ikkitasi mustaqil tender platformasi: UZEX etender, 662 ta ochiq lotning hammasi, har biri texnik topshiriq havolasi bilan, 245 soniyada; UZTender, 100 lotlik namuna 76 soniyada, har birida nom, buyurtmachi va narx. Uchinchisi davlat xaridlari portali xarid.icppa.uz: u UZEX tenderlarini qayta e'lon qiladi, 20 lotlik jonli namuna olindi. " +
    "Diqqat: \"uchta platforma\" demang. To'g'ri ibora: \"uchta sayt, ikkita mustaqil tender platformasi\". " +
    "Yangi platforma qo'shish — bitta deklarativ retsept fayli (JSON), dvigatel kodi o'zgarmaydi. Har bir yig'ish e'londan oldin sifat tekshiruvidan o'tadi. Mos lotlar Telegram ogohlantirishi sifatida ketadi, tepasida TenderLens verdikti — ikkita haqiqiy ogohlantirish allaqachon yuborilgan: 522893 va 524784.\n\n" +
    "Halol bo'ling: UZTender'da hujjat fayllari faqat Pro akkaunt bilan ochiladi, shuning uchun TenderLens hozir texnik topshiriqni UZEX'da o'qiydi, UZTender va davlat portalidan esa lot ma'lumotini yig'adi. Davlat portali sekin javob beradi (so'rovga ~4 soniya). " +
    "\"AI yangi sayt uchun retseptni o'zi yozadi\" demang — bu hali jonli sinalmagan (kalit yo'q). Agar jonli sinov muvaffaqiyatli bo'lsa, shu qatorni qo'shish mumkin.");

  // ===== 7. Why now =====
  pres.addSection({ title: "Imkoniyat" });
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Imkoniyat" });
  title(s, "Nega aynan hozir");
  const cw = (CW - 0.5) / 3;
  const why = [
    { ic: I.gavel, h: "PF-259 Prezident Farmoni", d: n("26.12.2025"), big: n("35% → 70%"), l: "tadbirkorlar ishtiroki, 2030-yilgacha", x2: n("Raqobatli xaridlar ulushi: 58% → 80%") },
    { ic: I.building, h: "Yangi agentlik", d: "2026-yil fevral", big: "Monitoring", l: "Sanoat kooperatsiyasi va davlat xaridlari agentligi xarid siyosatini oldi", x2: "PF-259: monitoring sahifasi, xavf baholash, buyurtmachi KPI reytingi" },
    { ic: I.robot, h: "Prezidentning AI dasturi", d: "2026-yil", big: "100+", l: "tarmoq AI loyihasi — kamida 100 ta", x2: "Vazirlik va hududlarning AI reytingi" },
  ];
  why.forEach((c, i) => {
    const cx = M + i * (cw + 0.25);
    card(s, cx, 1.4, cw, 3.75, COL.tint, "why card", { r: 0.12 });
    iconCircle(s, c.ic, cx + 0.3, 1.6, 0.75, COL.amber, "why icon");
    txt(s, [{ text: c.h, options: { bold: true, color: COL.teal, breakLine: true } }, { text: c.d, options: { color: COL.muted, fontSize: 13 } }], { x: cx + 1.2, y: 1.6, w: cw - 1.4, h: 0.75, fontSize: 16, valign: "middle" });
    txt(s, c.big, { x: cx + 0.3, y: 2.55, w: cw - 0.6, h: 0.8, fontSize: i === 1 ? 32 : 42, bold: true, color: COL.teal, valign: "middle" });
    txt(s, c.l, { x: cx + 0.3, y: 3.35, w: cw - 0.6, h: 0.75, fontSize: 15 });
    txt(s, c.x2, { x: cx + 0.3, y: 4.15, w: cw - 0.6, h: 0.85, fontSize: 13, color: COL.muted });
  });
  card(s, M, 5.4, CW, 1.3, COL.teal, "gap band", { r: 0.12 });
  txt(s, [
    { text: "Bo'shliq. ", options: { bold: true, color: COL.amber } },
    { text: "Davlat AI narxni tekshiradi (o'rtacha bozor narxi moduli, e-do'kon takliflarining 75%). Texnik topshiriq matnini avtomatik o'qiydigan davlat vositasini topmadik — TenderLens shu qatlam.", options: { color: COL.white } },
  ], { x: M + 0.35, y: 5.45, w: CW - 0.7, h: 1.2, fontSize: 16, valign: "middle" });
  source(s, n("Manba: lex.uz va yuz.uz, 29.12.2025 (PF-259 maqsadlari); anhor.uz (agentlik); spot.uz, 21.10.2025 va UP-189 (AI loyihalar); uza.uz, 30.10.2026 (75%)"));
  notes(s, "Nega hozir", "4:05–4:20",
    "Uchta sabab. Birinchi: Prezidentning PF-259 Farmoni 2030-yilgacha tadbirkorlar ishtirokini 35% dan 70% ga, raqobatli xaridlar ulushini 58% dan 80% ga oshirishni talab qiladi — monitoring sahifasi va buyurtmachilar KPI reytingi bilan. " +
    "Ikkinchi: 2026-yil fevralda yangi Sanoat kooperatsiyasi va davlat xaridlari agentligi tuzildi. Uchinchi: Prezident 2026-yilda kamida 100 ta tarmoq AI loyihasini talab qildi. " +
    "Davlat AI allaqachon narxni tekshiradi — e-do'kon takliflarining 75% i. Ammo texnik topshiriq matnini o'qiydigan avtomatik vositani topmadik. Biz — shu yetishmayotgan qatlam.\n\n" +
    "Agentlik tuzilgan yil (2026) manbada bilvosita; \"fevral\" deb ayting, kun aytmang.");

  // ===== 8. The world =====
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Imkoniyat" });
  title(s, "Dunyo tajribasi: matnni o'qiydigan AI o'zini oqlaydi");
  const bw = 5.0;
  card(s, M, 1.4, bw, 5.35, COL.teal, "Brazil ALICE card", { r: 0.12, shadow: true });
  txt(s, [{ text: "Braziliya · ALICE", options: { bold: true, color: COL.amber, fontSize: 24, breakLine: true } }, { text: "Davlat nazorati (CGU) roboti tender hujjatlari va e'lonlarini avtomatik o'qiydi, auditorlarga signal yuboradi", options: { color: COL.white, fontSize: 15 } }], { x: M + 0.35, y: 1.6, w: bw - 0.7, h: 1.6 });
  txt(s, n("118 069"), { x: M + 0.35, y: 3.3, w: bw - 0.7, h: 0.85, fontSize: 52, bold: true, color: COL.white, valign: "middle" });
  txt(s, "xarid jarayoni tahlil qilindi, 2024", { x: M + 0.35, y: 4.15, w: bw - 0.7, h: 0.4, fontSize: 15, color: COL.tint });
  txt(s, n("R$257 mln"), { x: M + 0.35, y: 4.75, w: bw - 0.7, h: 0.85, fontSize: 52, bold: true, color: COL.amber, valign: "middle" });
  txt(s, n("tejaldi, 2024 (R$257,25 mln)"), { x: M + 0.35, y: 5.6, w: bw - 0.7, h: 0.4, fontSize: 15, color: COL.tint });
  const lx2 = M + bw + 0.3, lw2 = W - M - lx2;
  const lessons = [
    { k: "UA", h: "Ukraina · ProZorro / DoZorro", t: "Tejash shartnoma imzolanishidan oldin tuzatishdan keladi → TenderLens'dagi so'rov xati." },
    { k: "KZ", h: "Qozog'iston", t: n("G'olib ballar bo'yicha avtomatik tanlanadi (9 oy 2025: 781 mlrd tenge tejaldi). Ammo bitta yetkazib beruvchiga yozilgan TT baribir yutadi.") },
    { k: "KR", h: "Koreya · BRIAS", t: "Faqat yirik shartnomalar tekshirilgan → TenderLens har bir lotni tekshiradi." },
  ];
  lessons.forEach((l, i) => {
    const ly = 1.4 + i * 1.32;
    card(s, lx2, ly, lw2, 1.17, COL.tint, "lesson row", { r: 0.12 });
    s.addShape(pres.shapes.OVAL, { x: lx2 + 0.25, y: ly + 0.21, w: 0.75, h: 0.75, fill: { color: COL.amber }, line: { color: COL.amber }, objectName: "country circle" });
    txt(s, l.k, { x: lx2 + 0.25, y: ly + 0.21, w: 0.75, h: 0.75, fontSize: 18, bold: true, color: COL.ink, align: "center", valign: "middle" });
    txt(s, [{ text: l.h, options: { bold: true, color: COL.teal, breakLine: true } }, { text: l.t, options: { fontSize: 14 } }], { x: lx2 + 1.2, y: ly + 0.1, w: lw2 - 1.4, h: 0.97, fontSize: 16, valign: "middle" });
  });
  card(s, lx2, 5.4, lw2, 1.35, COL.amber, "takeaway", { r: 0.12 });
  txt(s, [{ text: "Xulosa: ", options: { bold: true } }, { text: "biz o'rgangan tizimlar narx va ishtirokchilarni asosan keyin tekshiradi. E'lon matnini faqat Braziliya o'qiydi — va bu vositani hech kim yetkazib beruvchiga bermagan. TenderLens beradi." }], { x: lx2 + 0.3, y: 5.4, w: lw2 - 0.6, h: 1.35, fontSize: 15, color: COL.ink, valign: "middle" });
  source(s, n("Manba: agenciagov.ebc.com.br, 30.12.2024 (ALICE); kapital.kz, 14.10.2025 (Qozog'iston); ti-ukraine.org (Ukraina); OECD (Koreya)"));
  notes(s, "Dunyo tajribasi", "4:20–4:35",
    "Braziliyaning ALICE roboti tender hujjatlarini avtomatik o'qiydi: 2024-yilda 118 069 ta xarid jarayoni tahlil qilingan va 257 million real tejalgan. " +
    "Ukrainadan saboq: tejash shartnoma imzolanishidan oldin tuzatishdan keladi — bizning so'rov xatimiz shu. Qozog'iston g'olibni avtomatik tanlaydi va 2025-yilning 9 oyida 781 milliard tenge tejaganini aytadi, lekin bitta yetkazib beruvchiga yozilgan TT baribir yutadi. " +
    "Koreya faqat yirik shartnomalarni tekshirgan — biz har bir lotni tekshiramiz. Hech kim bu vositani yetkazib beruvchilarga bermagan.\n\n" +
    "Ukraina va Koreya bo'yicha raqam aytmang — manbalar tekshirilmagan (R).");

  // ===== 9. Business model + roadmap =====
  pres.addSection({ title: "Biznes" });
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Biznes" });
  title(s, "Biznes model va yo'l xaritasi");
  const biz = [
    { ic: I.store, h: "Yetkazib beruvchilar", t: "Bepul ogohlantirishlar. Pullik chuqur tekshiruv — oylik yoki har bir tekshiruv uchun. Ishtirokchilar assotsiatsiyasi orqali tarqatish." },
    { ic: I.shield, h: "Davlat", t: "Agentlik va Raqobat qo'mitasi uchun litsenziya yoki API: xavf navbati, monitoring sahifasi." },
    { ic: I.users, h: "Konsultantlar", t: "Ko'p lotli tarif: tender konsultantlari va buxgalterlar uchun." },
  ];
  biz.forEach((b, i) => {
    const bx2 = M + i * (cw + 0.25);
    card(s, bx2, 1.4, cw, 2.35, COL.tint, "business card", { r: 0.12 });
    iconCircle(s, b.ic, bx2 + 0.3, 1.6, 0.7, COL.amber, "business icon");
    txt(s, b.h, { x: bx2 + 1.15, y: 1.6, w: cw - 1.35, h: 0.7, fontSize: 19, bold: true, color: COL.teal, valign: "middle" });
    txt(s, b.t, { x: bx2 + 0.3, y: 2.45, w: cw - 0.6, h: 1.2, fontSize: 14 });
  });
  const ry0 = 4.55;
  s.addShape(pres.shapes.LINE, { x: M + 0.5, y: ry0 + 0.3, w: CW - 1.0, h: 0, line: { color: COL.tealMid, width: 3 }, objectName: "roadmap line" });
  const road = [
    { h: "Hozir", t: n(`Demo: ${ANALYSED} lot tahlil qilindi (${OPEN} ochiq lotdan), oflayn kesh`) },
    { h: "Pilot", t: "Agentlik + davlat xaridlari ishtirokchilari assotsiatsiyasi" },
    { h: "Davlat AI infratuzilmasi", t: n("VMQ 581: 6 oygacha bepul LLM API, oyiga 10 mln token") },
    { h: "Rasmiy ma'lumot oqimi", t: "Agentlik bilan rasmiy API yoki OCDS" },
  ];
  const rw4 = CW / 4;
  road.forEach((r, i) => {
    const cx = M + i * rw4 + rw4 / 2;
    s.addShape(pres.shapes.OVAL, { x: cx - 0.3, y: ry0, w: 0.6, h: 0.6, fill: { color: i === 0 ? COL.amber : COL.teal }, line: { color: COL.white, width: 3 }, objectName: "milestone" });
    txt(s, String(i + 1), { x: cx - 0.3, y: ry0, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: i === 0 ? COL.ink : COL.white, align: "center", valign: "middle" });
    txt(s, r.h, { x: cx - rw4 / 2 + 0.1, y: ry0 + 0.75, w: rw4 - 0.2, h: 0.4, fontSize: 16, bold: true, color: COL.teal, align: "center" });
    txt(s, r.t, { x: cx - rw4 / 2 + 0.15, y: ry0 + 1.15, w: rw4 - 0.3, h: 0.9, fontSize: 14, align: "center" });
  });
  source(s, n(`Manba: VMQ 581 (20.10.2026) — anhor.uz; ${OPEN} ochiq lot — UZEX TradeList, 17.11.2026; tahlil qilingan lotlar — TenderLens engine`));
  notes(s, "Biznes model", "4:35–4:50",
    "Yetkazib beruvchilar uchun — bepul ogohlantirishlar va pullik chuqur tekshiruv, Davlat xaridlari ishtirokchilari assotsiatsiyasi orqali. Davlat uchun — Agentlik va Raqobat qo'mitasiga litsenziya yoki API. Konsultantlar uchun — ko'p lotli tarif. " +
    "Yo'l xaritasi: bugun oflayn keshdan ishlaydigan demo — 662 ochiq lotdan tahlil qilinganlari; keyin Agentlik va Assotsiatsiya bilan pilot; Vazirlar Mahkamasining 581-son qarori bo'yicha davlat AI infratuzilmasi — 6 oygacha bepul LLM API; so'ng Agentlik bilan rasmiy ma'lumot oqimi.\n\n" +
    "Narx so'rasa: aniq tarif hali yo'q — pilotda aniqlaymiz. O'ylab topilgan raqam aytmang.");

  // ===== 10. Ask + close =====
  s = pres.addSlide({ masterName: "TL_DARK", sectionTitle: "Biznes" });
  title(s, "Bizning so'rovimiz");
  const asks = [
    { b: "Pilot", t: ": Sanoat kooperatsiyasi va davlat xaridlari agentligi bilan: PF-259 Farmondagi monitoring va xavf baholash uchun" },
    { b: "Tarqatish", t: ": Davlat xaridlari ishtirokchilari assotsiatsiyasi orqali kichik yetkazib beruvchilarga" },
    { b: "Infratuzilma", t: ": VMQ 581 bo'yicha davlat AI resurslari, hakatondan keyin ham ishlash uchun" },
  ];
  asks.forEach((a, i) => {
    const ay = 1.65 + i * 1.08;
    s.addShape(pres.shapes.OVAL, { x: M, y: ay, w: 0.72, h: 0.72, fill: { color: COL.amber }, line: { color: COL.amber }, objectName: "ask number" });
    txt(s, String(i + 1), { x: M, y: ay, w: 0.72, h: 0.72, fontSize: 24, bold: true, color: COL.ink, align: "center", valign: "middle" });
    txt(s, [{ text: a.b, options: { bold: true, color: COL.amber } }, { text: a.t, options: { color: COL.white } }], { x: M + 1.0, y: ay - 0.08, w: CW - 1.0, h: 0.88, fontSize: 21, valign: "middle" });
  });
  card(s, M, 4.95, CW, 1.75, COL.white, "closing line", { transparency: 90, r: 0.12 });
  txt(s, [
    { text: "Davlat AI narxni tekshiradi.", options: { color: COL.white, breakLine: true } },
    { text: "TenderLens esa kim haqiqatan qatnasha olishini tekshiradi.", options: { color: COL.amber, bold: true } },
  ], { x: M + 0.3, y: 5.0, w: CW - 0.6, h: 1.0, fontSize: 26, align: "center", valign: "middle" });
  txt(s, "Bog'cha ovqatidan bolalar shifoxonasigacha — har bir tender hamma uchun ochiq bo'lsin.", { x: M + 0.3, y: 5.95, w: CW - 0.6, h: 0.55, fontSize: 18, italic: true, color: COL.tint, align: "center", valign: "middle" });
  source(s, n("PF-259 (26.12.2025) — lex.uz; VMQ 581 — anhor.uz, 20.10.2026"));
  notes(s, "So'rov va yakun", "4:50–5:00",
    "Bizga uchta narsa kerak: Agentlik bilan pilot — PF-259 Farmoni talab qilgan monitoring uchun; Davlat xaridlari ishtirokchilari assotsiatsiyasi orqali kichik yetkazib beruvchilarga tarqatish; va 581-son qaror bo'yicha davlat AI infratuzilmasi. " +
    "Davlat AI narxni tekshiradi. TenderLens esa kim haqiqatan qatnasha olishini tekshiradi. Bog'cha ovqatidan bolalar shifoxonasigacha — har bir tender hamma uchun ochiq bo'lsin. PF-259 Farmoni tadbirkorlar ishtirokini 35% dan 70% ga oshirmoqchi — mana, qanday qilib. Rahmat.");

  // ===== 11. Backup =====
  pres.addSection({ title: "Zaxira" });
  s = pres.addSlide({ masterName: "TL_CONTENT", sectionTitle: "Zaxira" });
  title(s, "Zaxira: demo skrinshotlari");
  // backup: supplier + dashboard stack on the left, Telegram bot on the right
  const bu = findShot("backup_supplier"), bb = findShot("backup_bot");
  const bl = { x: M, w: 7.55 }, br = { x: M + 7.55 + 0.3, w: W - M - (M + 7.55 + 0.3) };
  if (bu) { const P = await placeShot(s, bu, bl.x, 1.4, bl.w, 4.5, "Backup: supplier flag and dashboard tiles"); shotCaption(s, "1. Yetkazib beruvchi: lot 524954 · Davlat nazorati paneli", P.left, P.bottom + 0.08, P.width); }
  else placeholderBox(s, bl.x, 1.4, bl.w, 4.5, "[PLACEHOLDER: app/screenshots/ — supplier + dashboard]", "screenshot placeholder");
  if (bb) { const P = await placeShot(s, bb, br.x, 1.4, br.w, 4.5, "Backup: Telegram bot verdict"); shotCaption(s, "2. Telegram bot: lot 524954 tavsiyasi", P.left, P.bottom + 0.08, P.width); }
  else placeholderBox(s, br.x, 1.4, br.w, 4.5, "[PLACEHOLDER: app/screenshots/ — bot]", "screenshot placeholder");
  source(s, "Statik skrinshotlar — jonli demo ishlamasa ko'rsatiladi; ma'lumot: UZEX etender, 17.11.2026 snapshot");
  notes(s, "Zaxira", "faqat kerak bo'lsa",
    "Faqat jonli demo ishlamasa ko'rsating. Har bir skrinshot bo'yicha demo skriptidagi so'zlarni ayting: 1) Bobur lot 524954 ni ochadi — aylanma talabi 8 mlrd so'm, lot 330,4 mln so'm (≈24 baravar); tavsiya \"qatnashing, lekin avval aniqlik so'rang\"; " +
    "2) Davlat nazorati paneli — tahlil qilingan lotlar xavf bo'yicha saralangan, tepada shablon topilmalari; 3) Telegram — Quarry kuzatadi, TenderLens baholaydi, yetkazib beruvchi ogohlantirish oladi. Keyin 5-slaydga (Qanday ishlaydi) o'ting.");

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

| Savol | Javob |
|---|---|
| "Buyurtmachilarni nohaq ayblaysiz." | Bu maslahat beruvchi tekshiruv, ayblov emas. Har bir bayroq bandni so'zma-so'z keltiradi va Raqobat qo'mitasining o'z toifasini ko'rsatadi. Qarorni inson qiladi; buyurtmachi bandni e'londan *oldin* tuzatishi mumkin. Yolg'on signal darajasini ko'rsating (6-slayd). |
| "Davlatda xarid AI allaqachon bor." | U **narxni** tekshiradi (o'rtacha bozor narxi moduli) va **e-do'kon takliflarini** (75%), arizalarni avtomatik moderatsiya qiladi. Yetkazib beruvchilar moderatsiya sababsiz rad etishidan shikoyat qiladi — TenderLens'ning har bir bayrog'i izohlangan va iqtibosli. TT matnini o'qiydigan avtomatik vositani topmadik; xavf tahlili markazi hali "rejalashtirilgan". |
| "TTni ekspertlar allaqachon ko'radi." | Ba'zi xaridlar uchun ha (ekspertiza xulosasi). Lekin bu yuz minglab lotga yetmaydi: ekspert bahosiga ko'ra atigi 2–3% qo'lda tahlil qilinadi. TenderLens ekspertlarga to'g'ri 2–3% ni tanlab beradi. |
| "Ma'lumotni olish qonuniymi?" | Login talab qilmaydigan ochiq sahifalar, sayt o'zi qiladigan so'rovlar; keshlaymiz va sekin so'raymiz. Ishlab chiqarishda Agentlikdan rasmiy oqim yoki OCDS so'raymiz. |
| "LLM o'zbek kirill matnida xato qiladi." | Cheklangan ajratish + majburiy so'zma-so'z iqtibos, satr bo'yicha tekshiriladi. Iqtibos mos kelmasa — bayroq yo'q. Baholash raqamlari 6-slaydda. |
| "Bitta veterinariya mezoni — katta gapmi?" | Bu tizimli topilma: bitta platforma shabloni mezoni 53 ochiq lotda turibdi, kalit so'zlar bo'yicha taxminan 48 tasi oziq-ovqat emas (dolota, sement). Mezon matni bir nechta sertifikat turini birlashtiradi, shuning uchun ball yo'qotilishi komissiyaga bog'liq. Shablonni bir marta tuzatish hammasini tuzatadi — Agentlik uchun eng arzon yutuq. |
| "Bu shunchaki qoidalar + chatbot." | Statistika ataylab qoidalar — tekshiriladigan bo'lishi kerak. Qiyin qismi — 2–88 betlik, uch yozuvdagi TTni minglab lotlar bo'yicha o'qish — AI. |
| "Buyurtmachi nega foydalanadi?" | PF-259 Farmoni buyurtmachilar KPI reytingini kiritadi. E'londan oldin tekshirish reytingni himoya qiladi va shikoyatlarni kamaytiradi. |
| "Kim to'laydi?" | Yetkazib beruvchilar: bepul ogohlantirish, pullik chuqur tekshiruv (Assotsiatsiya orqali). Davlat: Agentlik va Raqobat qo'mitasi uchun litsenziya/API. Konsultantlar: ko'p lotli tarif. Aniq narx — pilotdan keyin. |
| "Faqat 2 ishtirokchi — qonuniy minimum emasmi?" | Ha. ZRU-684 bo'yicha eng yaxshi takliflarni tanlash va tender kamida 2 taklif bo'lsagina o'tgan hisoblanadi. Demak, bitimlarning yarmidan ko'pi raqobatning qonuniy minimumida o'tmoqda — aynan shu yerda adolatsiz shart hal qiluvchi bo'ladi. |
| "Skan va arxivlar-chi?" | OCR/vision asosiy yo'lda: namunada skanlar va buzilgan matn qatlami uchraydi. Arxivlar ochiladi; demoda o'tkazib yuboriladi. |
| "TenderGPT / TenderZone shuni qilmaydimi?" | TenderGPT — korporativ savdo platformasi, TenderZone — pullik agregator. Topganimizcha, ikkalasi ham TTni cheklovchi bandlar uchun o'qimaydi. |
| "Quarry nima?" | Jamoadoshimizning tender kuzatuv platformasi: 660+ lotni uzluksiz kuzatadi. TenderLens har bir lotni baholaydi, Quarry esa yetkazib beruvchiga Telegramda verdikt bilan ogohlantirish yuboradi. |
`;

function placeholderStatus() {
  const left = [];
  if (!evFilled) left.push("6-slayd (baholash raqamlari)");
  if (!findShot("supplier") || !findShot("agency")) left.push("4-slayd (skrinshotlar; hozircha MAKET)");
  const miss = ["backup_supplier", "backup_bot"].filter((k) => !findShot(k));
  if (miss.length) left.push("12-slayd (" + miss.join(", ") + " skrinshotlari)");
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
