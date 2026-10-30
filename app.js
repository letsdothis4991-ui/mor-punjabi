/* Mor: a Punjabi course you climb like a snakes-and-ladders board.
   Courses are plain JSON files (see courses/ and tools/build_course.py). Progress lives in this browser. */
"use strict";

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const app = $("#app");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const clean = s => String(s).toLowerCase().replace(/[?.!,¿¡;:"“”()]/g, "").replace(/\s+/g, " ").trim();
const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const dayOff = n => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); };
const UNIT_COLORS = ["#B3123A", "#1F6E8C", "#B5650D", "#2E7D4F", "#6A2C91", "#C2185B", "#3B3F94"];
const LESSONS = 3, PASS = 0.8, COLS = 5;
const APP_URL = location.href.split("#")[0];

const ICON = {
  fire:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.5 5 10.5A5 5 0 0 1 7 13c0-2 1-3.5 2-4.5.2 2 1.3 3 2.3 3C10.5 8 12 5 12 2z"/></svg>',
  bolt:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  spk:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  slow:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17h15a3 3 0 0 0 3-3v-1h-2a7 7 0 0 0-14 0v1a3 3 0 0 0-2 3zm16-6a2 2 0 1 1 2-2"/></svg>',
  x:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  board:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
  book:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
  user:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
  globe:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
  lock:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V8a5 5 0 0 1 10 0v2h1v11H6V10zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>',
  star:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l2.6 6.3L21 5l-2.3 6.4L23 12l-4.3 0.6L21 19l-6.4-2.3L12 23l-2.6-6.3L3 19l2.3-6.4L1 12l4.3-0.6L3 5l6.4 2.3z"/></svg>',
  chat:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>'
};

function peacock(cls = "") {
  let f = "";
  for (let k = -3; k <= 3; k++) f += `<g transform="rotate(${k * 21} 60 92)"><ellipse class="m-f" cx="60" cy="42" rx="11" ry="30"/><circle class="m-e" cx="60" cy="22" r="7"/><circle class="m-p" cx="60" cy="22" r="3.4"/></g>`;
  return `<svg class="mascot ${cls}" viewBox="0 0 120 120" aria-hidden="true">${f}
    <ellipse class="m-b" cx="60" cy="94" rx="18" ry="22"/><circle class="m-b" cx="60" cy="62" r="13"/>
    <path class="m-c" d="M60 49l-6-11M60 49v-13M60 49l6-11"/><circle class="m-e" cx="54" cy="37" r="3"/><circle class="m-e" cx="60" cy="35" r="3"/><circle class="m-e" cx="66" cy="37" r="3"/>
    <circle class="m-w" cx="55" cy="60" r="4.2"/><circle class="m-w" cx="65" cy="60" r="4.2"/><circle class="m-k" cx="55.6" cy="60.5" r="2"/><circle class="m-k" cx="65.6" cy="60.5" r="2"/>
    <path class="m-beak" d="M56 66h8l-4 6z"/></svg>`;
}

/* ---------- saved state ---------- */
const KEY = "mor-v2";
const DEF = { xp:0, streak:0, best:0, lastDay:null, hist:{}, goal:20, tr:true, sfx:true, course:"punjabi", prog:{}, tests:{}, remind:"19:00" };
let S = (() => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return { ...DEF }; } })();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
const liveStreak = () => (S.lastDay === dayKey() || S.lastDay === dayOff(-1)) ? S.streak : 0;
const todayXP = () => S.hist[dayKey()] || 0;

/* ---------- courses ---------- */
const CUSTOM_KEY = "mor-custom-courses";
let builtin = {}, custom = {};
try { custom = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}"); } catch (e) {}
const saveCustom = () => { try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom)); } catch (e) {} };
const allCourses = () => ({ ...builtin, ...custom });
let C = null, SKILLS = [], ALL = [], SQUARES = [];

function useCourse(id) {
  const all = allCourses();
  C = all[id] || all.punjabi || Object.values(all)[0];
  S.course = C.id;
  if (!C.sections || !C.sections.length) C.sections = [{ title:C.name, desc:"", start:0 }];
  SKILLS = []; ALL = []; SQUARES = [];
  C.units.forEach((u, ui) => {
    u.ui = ui; u.key = C.id + ":u" + ui; u.sk = [];
    u.skills.forEach((s, si) => {
      const kind = s.letters ? "letter" : "word";
      const sk = { ...s, sid:s.id || ("s" + ui + "_" + si), unit:ui };
      sk.key = C.id + ":" + sk.sid;
      sk.items = (s.words || []).map(w => ({ pa:w[0], tr:w[1] || "", en:w[2], kind, sk }));
      sk.sents = (s.sentences || []).map(w => ({ pa:w[0], tr:w[1] || "", en:w[2], kind:"sent", sk }));
      SKILLS.push(sk); u.sk.push(sk); ALL.push(...sk.items, ...sk.sents);
      SQUARES.push({ type:"skill", sk, unit:ui });
    });
    u.lines = (u.dialogues || []).flatMap(d => d.lines.map((l, i) => ({ who:l[0] === "A" ? d.people[0] : d.people[1], pa:l[1], tr:l[2], en:l[3], d, i })));
    SQUARES.push({ type:"test", unit:ui });
  });
  SQUARES.forEach((q, i) => q.n = i + 1);
  document.documentElement.classList.toggle("no-tr", !S.tr || !C.translit);
  pickVoice();
}
const prog = sk => S.prog[sk.key] || 0;
const passed = ui => !!S.tests[C.units[ui].key];
const unitOpen = ui => ui === 0 || passed(ui - 1);
function skillOpen(sk) {
  if (!unitOpen(sk.unit)) return false;
  const u = C.units[sk.unit], i = u.sk.indexOf(sk);
  return i === 0 || prog(u.sk[i - 1]) >= LESSONS || passed(sk.unit);
}
const squareDone = q => q.type === "test" ? passed(q.unit) : prog(q.sk) >= LESSONS;
const squareOpen = q => q.type === "test" ? unitOpen(q.unit) : skillOpen(q.sk);
const currentSquare = () => SQUARES.find(q => squareOpen(q) && !squareDone(q)) || SQUARES[SQUARES.length - 1];

/* ---------- audio ---------- */
let voice = null, vmode = "none";
function pickVoice() {
  if (!("speechSynthesis" in window) || !C) { vmode = "none"; return; }
  const vs = speechSynthesis.getVoices(), code = (C.speech || "").toLowerCase(), base = code.split("-")[0];
  voice = base ? (vs.find(v => v.lang.toLowerCase().replace("_", "-") === code) || vs.find(v => v.lang.toLowerCase().startsWith(base))) : null;
  if (voice) { vmode = "native"; return; }
  if (C.id === "punjabi") { voice = vs.find(v => v.lang.toLowerCase().startsWith("hi")); if (voice) { vmode = "hindi"; return; } }
  vmode = vs.length ? "none" : "pending";
}
if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = () => { pickVoice(); if (view === "profile") render(); };
// Gurmukhi and Devanagari share a code-point layout, so a Hindi voice can read Punjabi converted letter by letter.
function toDeva(s) {
  let o = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0x0A71) { const n = s.charCodeAt(i + 1); if (n >= 0x0A15 && n <= 0x0A39) o += String.fromCharCode(n - 0x100) + "्"; continue; }
    if (c === 0x0A70 || c === 0x0A02) { o += "ं"; continue; }
    if (c === 0x0A64) { o += "।"; continue; }
    o += (c >= 0x0A01 && c <= 0x0A6F) ? String.fromCharCode(c - 0x100) : s[i];
  }
  return o;
}
const canSpeak = () => vmode === "native" || vmode === "hindi";
function say(text, slow) {
  if (!canSpeak() || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(vmode === "hindi" ? toDeva(text) : text);
    u.voice = voice; u.lang = voice.lang; u.rate = slow ? 0.55 : 0.85;
    speechSynthesis.speak(u);
  } catch (e) {}
}
let ac;
function tone(freqs, dur = 0.12, type = "sine") {
  if (!S.sfx) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    let t = ac.currentTime;
    freqs.forEach(f => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.03); t += dur * 0.8;
    });
  } catch (e) {}
}
const sfx = { good:() => tone([660, 880]), bad:() => tone([220, 175], 0.2, "triangle"), done:() => tone([523, 659, 784, 1046], 0.15), tap:() => tone([520], 0.05) };

/* ---------- exercises ---------- */
function distract(item, n, key) {
  const same = item.sk.items.concat(item.sk.sents).filter(x => x.kind === item.kind && x[key] !== item[key]);
  let d = sample(same, n);
  if (d.length < n) d = d.concat(sample(ALL.filter(x => x.kind === item.kind && x[key] !== item[key] && !d.includes(x)), n - d.length));
  const seen = new Set([item[key]]);
  return d.filter(x => !seen.has(x[key]) && seen.add(x[key]));
}
const mkMC = it => ({ type:"mc", item:it, opts:shuffle([it, ...distract(it, 3, "en")]) });
const mkRev = it => ({ type:"rev", item:it, opts:shuffle([it, ...distract(it, 3, "pa")]) });
const mkListen = it => ({ type:"listen", item:it, opts:shuffle([it, ...distract(it, 3, "pa")]) });
const mkMatch = items => ({ type:"match", items, left:shuffle(items), right:shuffle(items), done:[] });
function mkBuild(it, dir) {
  const others = ALL.filter(x => x.kind === "sent" && x !== it);
  if (dir === "pa") {
    const p = it.pa.split(" "), r = it.tr.split(" ");
    const pool = [];
    others.forEach(x => { const xp = x.pa.split(" "), xr = x.tr.split(" "); xp.forEach((t, i) => { if (!p.includes(t) && !pool.some(o => o.t === t)) pool.push({ t, sub:xr[i] || "" }); }); });
    return { type:"build", dir, item:it, bank:shuffle([...p.map((t, i) => ({ t, sub:r[i] || "" })), ...sample(pool, 3)]) };
  }
  const e = clean(it.en).split(" ");
  const pool = [...new Set(others.flatMap(x => clean(x.en).split(" ")))].filter(t => !e.includes(t));
  return { type:"build", dir, item:it, bank:shuffle([...e.map(t => ({ t })), ...sample(pool, 3).map(t => ({ t }))]) };
}
// Dialogue: show one line, pick the reply that comes next.
function mkReply(u) {
  const pairs = u.lines.filter((l, i, a) => a[i + 1] && a[i + 1].d === l.d);
  if (!pairs.length) return null;
  const line = sample(pairs, 1)[0], next = u.lines[u.lines.indexOf(line) + 1];
  const all = C.units.flatMap(x => x.lines).filter(l => l !== next && l !== line && l.pa !== next.pa);
  const near = u.lines.filter(l => l !== next && l !== line);
  const wrong = sample(near, 2);
  while (wrong.length < 2 && all.length) { const w = sample(all, 1)[0]; if (!wrong.includes(w)) wrong.push(w); }
  return { type:"reply", line, item:{ ...next, kind:"line" }, opts:shuffle([next, ...wrong]), answer:next };
}
function wordEx(w, i) {
  const t = ["mc", "rev", canSpeak() ? "listen" : "mc"][i % 3];
  return t === "mc" ? mkMC(w) : t === "rev" ? mkRev(w) : mkListen(w);
}
function makeLesson(sk, lvl) {
  let list = shuffle(sk.items).map((w, i) => wordEx(w, i + lvl));
  const hasS = sk.sents.length > 0 && lvl > 0;
  list = list.slice(0, lvl === 0 ? 6 : hasS ? 4 : 7);
  if (hasS) shuffle(sk.sents).slice(0, lvl === 1 ? 2 : 3).forEach((s, i) => list.push(mkBuild(s, (i + lvl) % 2 ? "pa" : "en")));
  if (hasS && lvl === 1) list.push(mkMC(sample(sk.sents, 1)[0]));
  if (lvl > 0) { const r = mkReply(C.units[sk.unit]); if (r) list.push(r); }
  list = shuffle(list);
  if (sk.items.length >= 4) list.splice(2, 0, mkMatch(sample(sk.items, Math.min(5, sk.items.length))));
  return list;
}
function makeTest(ui) {
  const u = C.units[ui];
  const words = shuffle(u.sk.flatMap(s => s.items)), sents = shuffle(u.sk.flatMap(s => s.sents));
  let list = words.slice(0, sents.length ? 7 : 12).map((w, i) => wordEx(w, i));
  sents.slice(0, 4).forEach((s, i) => list.push(i % 2 ? mkBuild(s, "pa") : mkBuild(s, "en")));
  for (let k = 0; k < 2; k++) { const r = mkReply(u); if (r) list.push(r); }
  return shuffle(list);
}
function makeLetterPractice() {
  const letters = shuffle(SKILLS.filter(s => s.letters).flatMap(s => s.items));
  let list = letters.slice(0, 8).map((w, i) => wordEx(w, i));
  if (letters.length >= 5) list.splice(2, 0, mkMatch(letters.slice(8, 13).length === 5 ? letters.slice(8, 13) : letters.slice(0, 5)));
  return list;
}
function makePractice() {
  const done = SKILLS.filter(s => prog(s) > 0 || passed(s.unit));
  const words = shuffle(done.flatMap(s => s.items)), sents = shuffle(done.flatMap(s => s.sents));
  let list = words.slice(0, 6).map((w, i) => wordEx(w, i));
  sents.slice(0, 2).forEach((s, i) => list.push(mkBuild(s, i ? "pa" : "en")));
  list = shuffle(list);
  const byKind = words.filter(w => w.kind === words[0]?.kind);
  if (byKind.length >= 4) list.splice(1, 0, mkMatch(byKind.slice(0, 5)));
  return list;
}

/* ---------- views ---------- */
let view = "home", sheet = null, sheetAnim = false, letterOpen = null, L = null, toastMsg = "", confirmReset = false, ed = null, installEvt = null, guideUnit = null;
function toast(m) { toastMsg = m; render(); setTimeout(() => { if (toastMsg === m) { toastMsg = ""; render(); } }, 2600); }

function topBar() {
  const st = liveStreak();
  return `<div class="top"><div class="col">
    <button class="brand" data-act="tab" data-v="home" aria-label="Mor home">${peacock()}<span>Mor</span></button>
    <button class="coursechip" data-act="tab" data-v="courses" aria-label="Change language"><span class="badge">${esc(C.badge || C.name[0])}</span><span>${esc(C.name)}</span></button>
    <div class="stats">
      <span class="stat ${st ? "" : "off"}" title="Day streak">${ICON.fire}${st}</span>
      <span class="stat" title="XP today">${ICON.bolt}${todayXP()}</span>
    </div></div></div><div class="stitch"></div>`;
}
function tabsBar() {
  const t = (v, ic, label) => `<button class="tab" data-act="tab" data-v="${v}" aria-current="${view === v}">${ICON[ic]}${label}</button>`;
  const alpha = C.alphabet?.length ? `<button class="tab" data-act="tab" data-v="alphabet" aria-current="${view === "alphabet"}"><span class="tabglyph">${esc(C.alphabet[0].letters.slice(0, 3).map(l => l[0]).join(""))}</span>Alphabet</button>` : "";
  return `<nav class="tabs"><div class="stitch"></div><div class="col">${t("home", "board", "Board")}${alpha}${t("words", "book", "Words")}${t("courses", "globe", "Languages")}${t("profile", "user", "Profile")}</div></nav>`;
}

/* The board: one snakes-and-ladders board per section, stacked so you climb from the bottom of the page. */
function boardHTML(si) {
  const sec = C.sections[si], next = C.sections[si + 1];
  const uFrom = sec.start, uTo = next ? next.start : C.units.length;
  const qs = SQUARES.filter(q => q.unit >= uFrom && q.unit < uTo);
  const rows = Math.ceil(qs.length / COLS), cur = currentSquare();
  const pos = k => { const r = Math.floor(k / COLS), c = r % 2 ? COLS - 1 - (k % COLS) : k % COLS; return { r, c }; };
  const ctr = k => { const { r, c } = pos(k); return { x:c * 100 + 50, y:(rows - 1 - r) * 100 + 50 }; };
  const cells = [];
  for (let k = 0; k < rows * COLS; k++) {
    const { r, c } = pos(k), q = qs[k];
    const style = `grid-row:${rows - r};grid-column:${c + 1}`;
    if (!q) { cells.push(`<div class="sq blank" style="${style}" aria-hidden="true"><span class="flower"></span></div>`); continue; }
    const open = squareOpen(q), done = squareDone(q), here = q === cur;
    const uc = UNIT_COLORS[q.unit % UNIT_COLORS.length];
    const label = q.type === "test" ? "Unit test" : q.sk.name;
    const face = q.type === "test" ? ICON.star : `<span class="g">${esc(q.sk.glyph || q.sk.name[0])}</span>`;
    const pips = q.type === "skill" ? `<span class="pips">${[0, 1, 2].map(i => `<i class="${prog(q.sk) > i ? "on" : ""}"></i>`).join("")}</span>` : "";
    cells.push(`<button class="sq ${q.type} ${open ? "" : "locked"} ${done ? "done" : ""} ${here ? "here" : ""}" style="${style};--uc:${uc}" data-act="sq" data-v="${q.n - 1}" id="sq${q.n}" aria-label="Square ${q.n}: ${esc(label)}${open ? "" : ", locked"}">
      <span class="num">${q.n}</span>${open ? face : ICON.lock}<span class="lbl">${esc(label)}</span>${pips}${here ? `<span class="token">${peacock()}</span>` : ""}</button>`);
  }
  // Ladders: in the unit you're on, the first square climbs straight to the unit test.
  let svg = "";
  const units = [...new Set(qs.map(q => q.unit))];
  units.forEach(ui => {
    if (!unitOpen(ui) || passed(ui)) return;
    const a = qs.findIndex(q => q.unit === ui), b = qs.findIndex(q => q.unit === ui && q.type === "test");
    if (b - a < 2) return;
    const p = ctr(a), q = ctr(b), dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy), nx = -dy / len * 13, ny = dx / len * 13;
    let rungs = "";
    for (let t = 0.12; t < 0.95; t += 0.11) rungs += `<line x1="${p.x + dx * t + nx}" y1="${p.y + dy * t + ny}" x2="${p.x + dx * t - nx}" y2="${p.y + dy * t - ny}"/>`;
    svg += `<g class="ladder"><line x1="${p.x + nx}" y1="${p.y + ny}" x2="${q.x + nx}" y2="${q.y + ny}"/><line x1="${p.x - nx}" y1="${p.y - ny}" x2="${q.x - nx}" y2="${q.y - ny}"/>${rungs}</g>`;
  });
  // One snake per board, from the top row back to the start: practice slides you back to review.
  if (qs.length > COLS * 2 && unitOpen(uFrom)) {
    const h = ctr(Math.min(qs.length - 2, COLS * (rows - 1) + 1)), t = ctr(1);
    const d = `M${h.x} ${h.y} C ${h.x + 160} ${h.y + (t.y - h.y) * 0.3}, ${t.x - 140} ${h.y + (t.y - h.y) * 0.6}, ${t.x + 40} ${t.y - 10}`;
    svg += `<g class="snake"><path d="${d}" class="s1"/><path d="${d}" class="s2"/><circle cx="${h.x}" cy="${h.y}" r="13" class="head"/><circle cx="${h.x - 5}" cy="${h.y - 3}" r="2.6" class="eye"/><circle cx="${h.x + 5}" cy="${h.y - 3}" r="2.6" class="eye"/></g>`;
  }
  return `<section class="boardwrap" id="board${si}">
    <div class="section"><small>Level ${si + 1}</small><h2>${esc(sec.title)}</h2>${sec.desc ? `<p>${esc(sec.desc)}</p>` : ""}</div>
    <div class="boardframe"><div class="board" style="grid-template-rows:repeat(${rows},1fr)">${cells.join("")}
      <svg class="overlay" viewBox="0 0 ${COLS * 100} ${rows * 100}" preserveAspectRatio="none" aria-hidden="true">${svg}</svg></div></div>
    <div class="legend">${units.map(ui => `<button class="unitkey" data-act="guide" data-v="${ui}" style="--uc:${UNIT_COLORS[ui % UNIT_COLORS.length]}"><i></i><span>Unit ${ui + 1} · ${esc(C.units[ui].title)}</span>${passed(ui) ? ICON.star : ""}</button>`).join("")}</div>
  </section>`;
}
function homeView() {
  const g = Math.min(1, todayXP() / S.goal), greet = C.greeting || [C.native || C.name, ""];
  let h = `<main class="home"><div class="col">`;
  // Highest level first so the page reads as a tower you climb up.
  for (let si = C.sections.length - 1; si >= 0; si--) h += boardHTML(si);
  h += `<div class="cloth hello">${peacock()}<div class="say"><div class="pa">${esc(greet[0])}</div>${greet[1] ? `<div class="tr">${esc(greet[1])}</div>` : ""}
      <div class="goal" aria-label="Daily goal"><span style="width:${g * 100}%"></span></div>
      <div class="goaltxt">${todayXP()} / ${S.goal} XP daily goal${g >= 1 ? " · done for today" : ""}</div></div></div>`;
  if (liveStreak() > 0 && S.lastDay !== dayKey()) h += `<div class="cloth notice warn">${ICON.fire}<div><b>Keep your ${liveStreak()}-day streak</b><span>It ends at midnight. One lesson keeps it going.</span></div></div>`;
  h += `<div class="cloth notice"><div><b>Ladders and snakes</b><span>Climb a ladder by passing a unit test early. Slide down the snake to practise words you've already learned.</span></div><button class="btn small" data-act="practice">Practice</button></div>`;
  h += `</div></main>`;
  if (sheet !== null) h += sheetHTML(SQUARES[sheet]);
  return h;
}
function sheetHTML(q) {
  const u = C.units[q.unit];
  let body;
  if (q.type === "test") {
    body = !unitOpen(q.unit) ? `<p>Pass the Unit ${q.unit} test to reach this unit.</p>`
      : passed(q.unit) ? `<p>Passed. You can retake it any time for practice.</p><div class="row"><button class="btn" data-act="test" data-v="${q.unit}">Retake test</button></div>`
      : `<p>${u.sk.every(s => prog(s) >= LESSONS) ? "You've finished every skill. Score 80% to unlock the next unit." : "Confident already? Take the test now and score 80% to climb the ladder and skip the rest of this unit."}</p><div class="row"><button class="btn gold" data-act="test" data-v="${q.unit}">Start unit test</button></div>`;
  } else {
    const p = prog(q.sk);
    body = !squareOpen(q) ? `<p>${unitOpen(q.unit) ? `Finish <b>${esc(u.sk[u.sk.indexOf(q.sk) - 1].name)}</b> first, or take the unit test to skip ahead.` : `Pass the Unit ${q.unit} test to reach this square.`}</p>`
      : `<p>${p >= LESSONS ? "Skill complete. Replay a lesson for extra XP." : `Lesson ${p + 1} of ${LESSONS}`}</p><div class="row"><button class="btn" data-act="start" data-v="${SKILLS.indexOf(q.sk)}">${p >= LESSONS ? "Replay" : "Start lesson"}</button></div>`;
  }
  return `<div class="sheetback ${sheetAnim ? "in" : ""}" data-act="closesheet"></div><div class="sheet cloth ${sheetAnim ? "in" : ""}" role="dialog" aria-label="${esc(q.type === "test" ? "Unit test" : q.sk.name)}">
    <div class="sheethead"><div><small>Square ${q.n} · Unit ${q.unit + 1}: ${esc(u.title)}</small><h3>${q.type === "test" ? "Unit test" : esc(q.sk.name)} ${q.type === "skill" && q.sk.native ? `<span class="pa" style="color:var(--muted);font-size:1rem">${esc(q.sk.native)}</span>` : ""}</h3></div>
    <button class="iconbtn" data-act="closesheet" aria-label="Close">${ICON.x}</button></div>${body}
    <div class="row"><button class="btn ghost small" data-act="guide" data-v="${q.unit}">Unit guide</button>${q.type === "skill" ? `<button class="btn ghost small" data-act="vocab" data-v="${SKILLS.indexOf(q.sk)}">See words</button>` : ""}</div></div>`;
}
function guideView() {
  const u = C.units[guideUnit];
  let h = `<main class="home"><div class="col page"><div class="cloth"><small class="note">Unit ${guideUnit + 1} guide</small><h2>${esc(u.title)}</h2><p class="note" style="margin-top:0">${esc(u.desc || "")}</p>`;
  if (u.tips?.length) h += `<ul class="tips">${u.tips.map(t => `<li>${esc(t).replace(/([਀-੿][਀-੿\s,।?!]*[਀-੿])/g, '<span class="pa">$1</span>')}</li>`).join("")}</ul>`;
  h += `</div>`;
  (u.dialogues || []).forEach(d => {
    h += `<div class="cloth"><h3 style="margin-bottom:6px">Conversation: ${esc(d.people[0])} and ${esc(d.people[1])}</h3><div class="dlg">${d.lines.map(l => `<div class="line ${l[0] === "B" ? "b" : ""}"><div class="who">${esc(l[0] === "A" ? d.people[0] : d.people[1])}</div>
      ${canSpeak() ? `<button class="iconbtn" data-act="sayt" data-v="${esc(l[1])}" aria-label="Play" style="float:right;color:var(--madder)">${ICON.spk}</button>` : ""}<div class="pa">${esc(l[1])}</div><div class="tr">${esc(l[2])}</div><div class="en">${esc(l[3])}</div></div>`).join("")}</div></div>`;
  });
  return h + `<button class="btn" data-act="tab" data-v="home">Back to the board</button></div></main>`;
}
function alphabetView() {
  let h = `<main class="home"><div class="col page"><div class="cloth"><h2>Alphabet</h2><p class="note" style="margin:0">Tap any letter to see its name, its sound and a word that uses it.${canSpeak() ? " You'll hear it too." : ""}</p>
    <button class="btn wide" style="margin-top:12px" data-act="letterpractice">Practise the letters</button></div>`;
  C.alphabet.forEach((g, gi) => {
    h += `<div class="cloth"><h3>${esc(g.title)}</h3>${g.note ? `<p class="note" style="margin:4px 0 10px">${esc(g.note)}</p>` : ""}<div class="abc ${gi === 0 ? "five" : ""}">`;
    g.letters.forEach((l, li) => {
      const id = gi + "-" + li, open = letterOpen === id;
      h += `<button class="abcl ${open ? "open" : ""}" data-act="letter" data-v="${id}" aria-label="${esc(l[0])}, ${esc(l[1])}"><span class="pa">${esc(l[0])}</span><span class="nm">${esc(l[1])}</span></button>`;
    });
    h += `</div>`;
    if (letterOpen?.startsWith(gi + "-")) {
      const l = g.letters[+letterOpen.split("-")[1]];
      h += `<div class="lettercard"><div class="big pa">${esc(l[0])}</div><div style="min-width:0;flex:1"><b>${esc(l[1])}</b><p class="note" style="margin:2px 0 8px">Sound: ${esc(l[2])}</p>
        <div class="pa" style="font-size:1.35rem">${esc(l[3])}</div><div class="tr">${esc(l[4])}</div><div>${esc(l[5])}</div></div>
        ${canSpeak() ? `<button class="spk" data-act="sayt" data-v="${esc(l[3])}" aria-label="Hear the example">${ICON.spk}</button>` : ""}</div>`;
    }
    h += `</div>`;
  });
  return h + `</div></main>`;
}
function wordsView() {
  let h = `<main class="home"><div class="col page"><div class="cloth"><h2>Phrasebook</h2><p class="note" style="margin:0">Every word and sentence in ${esc(C.name)}, unit by unit. ${canSpeak() ? "Tap the speaker to hear it." : ""}</p></div>`;
  C.units.forEach((u, ui) => {
    h += `<h3 class="unithead">Unit ${ui + 1} · ${esc(u.title)}</h3><div class="cloth">`;
    u.sk.forEach(s => {
      h += `<div class="skillhead" id="sk-${esc(s.sid)}"><h3>${esc(s.name)}</h3>${s.native ? `<span class="pa">${esc(s.native)}</span>` : ""}</div>`;
      s.items.concat(s.sents).forEach(w => {
        h += `<div class="wordrow">${canSpeak() ? `<button class="iconbtn" data-act="sayt" data-v="${esc(w.pa)}" aria-label="Play">${ICON.spk}</button>` : ""}
          <div class="w"><div class="pa">${esc(w.pa)}</div>${w.tr ? `<div class="tr">${esc(w.tr)}</div>` : ""}</div><div class="en">${esc(w.kind === "letter" ? "“" + w.en + "”" : w.en)}</div></div>`;
      });
    });
    h += `</div>`;
  });
  return h + `</div></main>`;
}
function profileView() {
  const days = []; for (let k = -6; k <= 0; k++) days.push(dayOff(k));
  const mx = Math.max(S.goal, ...days.map(d => S.hist[d] || 0));
  const learned = SKILLS.filter(s => prog(s) > 0 || passed(s.unit)).reduce((n, s) => n + s.items.length + s.sents.length, 0);
  const tests = C.units.filter((u, i) => passed(i)).length;
  const sw = (k, label, sub) => `<div class="setrow"><div><b>${label}</b>${sub ? `<p>${sub}</p>` : ""}</div><button class="switch" role="switch" aria-checked="${!!S[k]}" data-act="toggle" data-v="${k}" aria-label="${label}"></button></div>`;
  const vtxt = { native:`Using a ${esc(C.name)} voice from this device.`, hindi:"No Punjabi voice on this device, so a Hindi voice reads the Gurmukhi. It sounds close but not perfect.", none:`This device has no ${esc(C.name)} voice, so listening exercises are skipped. Adding one in your phone's text-to-speech settings turns them on.`, pending:"Looking for voices…" }[vmode];
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  return `<main class="home"><div class="col page">
    <div class="cloth"><h2>Your progress</h2><div class="tiles">
      <div class="tile"><b style="color:var(--gold-deep)">${liveStreak()}</b><span>day streak</span></div>
      <div class="tile"><b style="color:var(--madder)">${S.xp}</b><span>total XP</span></div>
      <div class="tile"><b>${tests} / ${C.units.length}</b><span>unit tests passed</span></div>
      <div class="tile"><b>${learned}</b><span>words and phrases met</span></div></div></div>
    <div class="cloth"><h2>This week</h2><div class="week">${days.map(d => `<div class="${d === dayKey() ? "today" : ""}"><span>${S.hist[d] || 0}</span><i style="height:${((S.hist[d] || 0) / mx) * 70}%"></i>${"SMTWTFS"[new Date(d + "T12:00").getDay()]}</div>`).join("")}</div></div>
    ${standalone ? "" : `<div class="cloth"><h2>Install Mor on your phone</h2>
      ${installEvt ? `<p class="note" style="margin-top:0">Add Mor to your home screen. It works offline once installed.</p><button class="btn wide gold" data-act="install">Install app</button>` :
      `<p class="note" style="margin-top:0">Mor installs straight from the browser and works offline once added.</p>
      <b>iPhone (Safari)</b><ol class="steps"><li>Tap the Share button.</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol>
      <b style="display:block;margin-top:10px">Android (Chrome)</b><ol class="steps"><li>Tap the ⋮ menu.</li><li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li></ol>`}
      <div class="setrow" style="margin-top:10px"><div><b>Share with friends</b><p style="word-break:break-all">${esc(APP_URL)}</p></div><button class="btn small ghost" data-act="share">Share</button></div></div>`}
    <div class="cloth"><h2>Streak reminder</h2>
      <p class="note" style="margin-top:0">Add a daily reminder to your calendar. It pops up at the time you pick, with a link back to Mor.</p>
      <div class="setrow"><div><b>Remind me at</b></div><input type="time" id="rem-time" class="timein" data-act2="remind" value="${esc(S.remind || "19:00")}"></div>
      <button class="btn wide" data-act="calendar">Add reminder to my calendar</button></div>
    <div class="cloth"><h2>Settings</h2>
      <div class="setrow"><div><b>Daily goal</b><p>XP to earn each day</p></div><div class="seg">${[10, 20, 30, 50].map(g => `<button data-act="goal" data-v="${g}" aria-pressed="${S.goal === g}">${g}</button>`).join("")}</div></div>
      ${C.translit ? `<div class="setrow stackrow"><div><b>Script</b><p>Romanised text appears under each word, like “sat srī akāl”</p></div><div class="seg"><button data-act="script" data-v="both" aria-pressed="${!!S.tr}">${C.id === "punjabi" ? "Gurmukhi" : esc(C.native || C.name)} + romanised</button><button data-act="script" data-v="only" aria-pressed="${!S.tr}">${C.id === "punjabi" ? "Gurmukhi" : esc(C.native || C.name)} only</button></div></div>` : ""}
      ${sw("sfx", "Sound effects", "Chimes for right and wrong answers")}
      <div class="setrow"><div><b>Voice</b><p>${vtxt}</p></div>${canSpeak() ? `<button class="btn small ghost" data-act="sayt" data-v="${esc(C.units[0]?.skills[0]?.words[0]?.[0] || "")}">Test</button>` : ""}</div>
      <div class="setrow"><div><b>Reset progress</b><p>Clears XP, streak, skills and tests. This can't be undone.</p></div>
        ${confirmReset ? `<div class="seg"><button data-act="reset" data-v="yes" style="color:var(--madder)">Yes, reset</button><button data-act="reset" data-v="no">Cancel</button></div>` : `<button class="btn small ghost" data-act="reset">Reset</button>`}</div>
      <p class="note" style="margin-bottom:0">Progress is saved on this device.</p></div>
  </div></main>`;
}
function coursesView() {
  const list = Object.values(allCourses()).sort((a, b) => (a.id === "punjabi" ? -1 : b.id === "punjabi" ? 1 : a.name.localeCompare(b.name)));
  return `<main class="home"><div class="col page"><div class="cloth"><h2>Languages</h2><p class="note" style="margin:0">Pick a course. You can add your own language, then send it to friends as a file they import.</p></div>
    <div class="stack">${list.map(c => `<div class="stack" style="gap:6px">
      <button class="courseitem" data-act="pickcourse" data-v="${esc(c.id)}" aria-pressed="${c.id === C.id}"><span class="badge">${esc(c.badge || c.name[0])}</span><div><b>${esc(c.name)}</b> <span class="pa">${esc(c.native || "")}</span><small>${c.units.length} units · ${c.units.reduce((n, u) => n + u.skills.length, 0)} skills${builtin[c.id] && !custom[c.id] ? " · built in" : " · added by you"}</small></div></button>
      ${custom[c.id] ? `<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn small ghost" data-act="exportcourse" data-v="${esc(c.id)}">Send to a friend</button><button class="btn small ghost" data-act="editcourse" data-v="${esc(c.id)}">Edit</button></div>` : ""}</div>`).join("")}</div>
    <div class="cloth stack"><button class="btn wide" data-act="newcourse">Add a language</button>
      <label class="btn ghost wide" style="text-align:center">Import a language file<input type="file" id="importfile" accept=".json,application/json" hidden></label>
      <p class="note" style="margin:0">Want a language built in for everyone? Open an issue or pull request on the project's GitHub with the course file.</p></div>
  </div></main>`;
}

/* ---------- course editor ---------- */
const SPEECH = [["pa-IN","Punjabi"],["hi-IN","Hindi"],["ur-PK","Urdu"],["es-ES","Spanish"],["fr-FR","French"],["de-DE","German"],["it-IT","Italian"],["pt-BR","Portuguese"],["ja-JP","Japanese"],["ko-KR","Korean"],["zh-CN","Chinese (Mandarin)"],["ar-SA","Arabic"],["ta-IN","Tamil"],["bn-IN","Bengali"],["gu-IN","Gujarati"],["tl-PH","Filipino"],["en-GB","English"]];
const linesOf = arr => (arr || []).map(r => r[1] ? r.join(" | ") : [r[0], r[2]].join(" | ")).join("\n");
const parseLines = txt => txt.split("\n").map(l => l.trim()).filter(Boolean).map(l => { const p = l.split("|").map(x => x.trim()); return p.length >= 3 ? [p[0], p[1], p.slice(2).join(" ")] : [p[0], "", p[1] || ""]; });
const blankSkill = () => ({ name:"", native:"", glyph:"", letters:false, _w:"", _s:"" });
const blankCourse = () => ({ id:"", name:"", native:"", badge:"", speech:"es-ES", translit:false, units:[{ title:"Basics", desc:"", _t:"", skills:[{ ...blankSkill(), name:"Greetings" }] }] });
function toEd(c) { const x = JSON.parse(JSON.stringify(c)); x.units.forEach(u => { u._t = (u.tips || []).join("\n"); u.skills.forEach(s => { s._w = linesOf(s.words); s._s = linesOf(s.sentences); }); }); return x; }
function edView() {
  const c = ed.c, sel = SPEECH.some(s => s[0] === c.speech) ? c.speech : "other";
  let h = `<main class="home ed"><div class="col page"><div class="cloth"><h2>${ed.id ? "Edit " + esc(c.name || "language") : "Add a language"}</h2>
    <p class="note" style="margin:0">Write one item per line as <b>word | transliteration | English</b>. For languages in the Latin alphabet leave out the middle: <b>hola | hello</b>. Each skill needs at least 4 words. Separate sentence words with spaces so they become word tiles.</p></div>
    <div class="cloth stack">
      <div class="two"><label>Language name<input id="ed-name" data-f="name" value="${esc(c.name)}" placeholder="Spanish"></label><label>In its own words<input id="ed-native" data-f="native" value="${esc(c.native)}" placeholder="Español"></label></div>
      <div class="two"><label>Badge (1–2 characters)<input id="ed-badge" data-f="badge" maxlength="3" value="${esc(c.badge)}" placeholder="Es"></label>
        <label>Voice<select id="ed-speech" data-f="speechsel">${SPEECH.map(s => `<option value="${s[0]}" ${sel === s[0] ? "selected" : ""}>${s[1]} (${s[0]})</option>`).join("")}<option value="other" ${sel === "other" ? "selected" : ""}>Other code…</option></select></label></div>
      ${sel === "other" ? `<label>Voice language code<input id="ed-speechcode" data-f="speech" value="${esc(c.speech)}" placeholder="sw-KE"></label>` : ""}
      <label class="chk"><input type="checkbox" id="ed-translit" data-f="translit" ${c.translit ? "checked" : ""}> Uses its own script, so show transliteration</label>
      <div class="two"><label>Home screen greeting<input id="ed-g0" data-f="g0" value="${esc(c.greeting?.[0] || "")}" placeholder="¡Hola!"></label><label>Greeting transliteration<input id="ed-g1" data-f="g1" value="${esc(c.greeting?.[1] || "")}"></label></div></div>`;
  c.units.forEach((u, ui) => {
    h += `<div class="cloth unitbox"><div class="bar2"><b>Unit ${ui + 1}</b><span style="flex:1"></span><button class="btn small ghost" data-act="edrm" data-v="u${ui}">Remove unit</button></div>
      <div class="two"><label>Unit title<input id="ed-u${ui}-t" data-f="u.title" data-u="${ui}" value="${esc(u.title)}"></label><label>Short description<input id="ed-u${ui}-d" data-f="u.desc" data-u="${ui}" value="${esc(u.desc || "")}"></label></div>
      <label>Guide notes (one per line, optional)<textarea id="ed-u${ui}-tips" data-f="u._t" data-u="${ui}" style="min-height:70px" placeholder="Nouns are masculine or feminine.">${esc(u._t || "")}</textarea></label>`;
    u.skills.forEach((s, si) => {
      const p = `ed-u${ui}s${si}`;
      h += `<div class="skillbox"><div class="bar2"><b>Skill ${si + 1}</b><span style="flex:1"></span><button class="btn small ghost" data-act="edrm" data-v="s${ui}_${si}">Remove</button></div>
        <div class="two"><label>Skill name<input id="${p}-n" data-f="s.name" data-u="${ui}" data-s="${si}" value="${esc(s.name)}"></label><label>Icon text (1–3 characters)<input id="${p}-g" data-f="s.glyph" data-u="${ui}" data-s="${si}" maxlength="3" value="${esc(s.glyph || "")}"></label></div>
        <label>Name in the language<input id="${p}-nat" data-f="s.native" data-u="${ui}" data-s="${si}" value="${esc(s.native || "")}"></label>
        <label class="chk"><input type="checkbox" id="${p}-l" data-f="s.letters" data-u="${ui}" data-s="${si}" ${s.letters ? "checked" : ""}> Alphabet skill (the English column is the letter's sound)</label>
        <label>Words<textarea id="${p}-w" data-f="s._w" data-u="${ui}" data-s="${si}" placeholder="agua | water">${esc(s._w || "")}</textarea></label>
        <label>Sentences (optional)<textarea id="${p}-se" data-f="s._s" data-u="${ui}" data-s="${si}" placeholder="yo bebo agua | I drink water">${esc(s._s || "")}</textarea></label></div>`;
    });
    h += `<button class="btn small ghost" data-act="edadd" data-v="s${ui}">Add a skill</button></div>`;
  });
  h += `<div class="cloth stack"><button class="btn ghost" data-act="edadd" data-v="u">Add a unit</button>${ed.err ? `<p class="err">${esc(ed.err)}</p>` : ""}
    <div class="bar2"><button class="btn" data-act="edsave">Save language</button><button class="btn ghost" data-act="edcancel">Cancel</button><span style="flex:1"></span>
    ${ed.id ? (ed.del ? `<button class="btn small" data-act="eddel" data-v="yes">Delete it</button><button class="btn small ghost" data-act="eddel" data-v="no">Keep</button>` : `<button class="btn small ghost" data-act="eddel">Delete</button>`) : ""}</div></div></div></main>`;
  return h;
}
function edInput(el) {
  const c = ed.c, f = el.dataset.f, u = +el.dataset.u, s = +el.dataset.s, v = el.type === "checkbox" ? el.checked : el.value;
  if (f === "speechsel") { c.speech = v === "other" ? "" : v; render(); return; }
  if (f === "g0" || f === "g1") { c.greeting = c.greeting || ["", ""]; c.greeting[f === "g0" ? 0 : 1] = v; return; }
  if (f.startsWith("u.")) { c.units[u][f.slice(2)] = v; return; }
  if (f.startsWith("s.")) { c.units[u].skills[s][f.slice(2)] = v; return; }
  c[f] = v;
}
function validateCourse(c) {
  if (!c.name || !String(c.name).trim()) return "Give the language a name.";
  if (!c.speech) return "Pick a voice language, or type a code like sw-KE.";
  if (!Array.isArray(c.units) || !c.units.length) return "Add at least one unit.";
  for (const [ui, u] of c.units.entries()) {
    if (!u.title || !u.title.trim()) return `Unit ${ui + 1} needs a title.`;
    if (!u.skills?.length) return `Unit ${ui + 1} needs at least one skill.`;
    for (const [si, s] of u.skills.entries()) {
      if (!s.name || !s.name.trim()) return `Unit ${ui + 1}, skill ${si + 1} needs a name.`;
      if ((s.words || []).length < 4) return `“${s.name}” needs at least 4 words (it has ${(s.words || []).length}).`;
      const bad = (s.words || []).concat(s.sentences || []).find(r => !r[0] || !r[2]);
      if (bad) return `In “${s.name}”, the line starting “${bad[0] || bad[2]}” is missing the word or the English.`;
    }
  }
  return "";
}
function edSave() {
  const c = JSON.parse(JSON.stringify(ed.c));
  c.name = (c.name || "").trim(); c.badge = (c.badge || c.native || c.name).trim().slice(0, 2);
  c.units.forEach((u, ui) => { u.tips = parseLines(u._t || "").map(r => r[0]); delete u._t;
    u.skills.forEach((s, si) => { s.words = parseLines(s._w || ""); s.sentences = parseLines(s._s || ""); delete s._w; delete s._s; s.id = s.id || ("u" + ui + "s" + si + "_" + Math.random().toString(36).slice(2, 6)); }); });
  const err = validateCourse(c);
  if (err) { ed.err = err; render(); return; }
  c.id = ed.id || (c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lang") + "-" + Math.random().toString(36).slice(2, 6);
  delete c.sections;
  custom[c.id] = c; saveCustom(); ed = null; useCourse(c.id); save(); view = "home"; toast(`${c.name} saved`);
}
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
async function shareFile(name, text, type) {
  try {
    const file = new File([text], name, { type });
    if (navigator.canShare?.({ files:[file] })) { await navigator.share({ files:[file], title:name }); return; }
  } catch (e) { if (e?.name === "AbortError") return; }
  download(name, text, type);
}
function importCourse(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const c = JSON.parse(r.result);
      const err = validateCourse(c);
      if (err) { toast("That file isn't a valid course: " + err); return; }
      c.id = c.id && !builtin[c.id] ? c.id : (c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6));
      custom[c.id] = c; saveCustom(); useCourse(c.id); save(); view = "home"; toast(`${c.name} added`);
    } catch (e) { toast("That file couldn't be read as a course."); }
  };
  r.readAsText(file);
}

/* ---------- streak reminder: a calendar event with a daily alarm ---------- */
function reminderICS() {
  const [hh, mm] = (S.remind || "19:00").split(":");
  const d = new Date(), ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mor//Streak reminder//EN", "BEGIN:VEVENT",
    "UID:mor-streak-" + Date.now() + "@mor", "DTSTAMP:" + stamp, `DTSTART:${ymd}T${hh}${mm}00`, "DURATION:PT10M", "RRULE:FREQ=DAILY",
    `SUMMARY:Mor: keep your ${C.name} streak going`, `DESCRIPTION:One quick lesson keeps your streak alive. ${APP_URL}`, "URL:" + APP_URL,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:Time for your ${C.name} lesson`, "TRIGGER:PT0M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
}

/* ---------- lessons and tests ---------- */
function startRun(mode, opts) {
  const q = mode === "test" ? makeTest(opts.unit) : mode === "practice" ? makePractice() : mode === "letters" ? makeLetterPractice() : makeLesson(opts.sk, Math.min(prog(opts.sk), LESSONS - 1));
  if (!q.length) { toast("Finish a lesson first, then practise."); return; }
  L = { mode, sk:opts.sk, unit:opts.unit ?? opts.sk?.unit, queue:q, i:0, total:q.length, solved:0, mistakes:0, state:"idle", sel:null, spoken:-1 };
  nav(() => { sheet = null; view = "lesson"; }, () => scrollTo(0, 0));
}
const cur = () => L.queue[L.i];
const itemHTML = it => `<div class="pa">${esc(it.pa)}</div>${it.tr ? `<div class="tr">${esc(it.tr)}</div>` : ""}`;
function exHTML(ex) {
  const done = L.state !== "idle", it = ex.item;
  const optCls = (o, i) => !done ? (L.sel === i ? "sel" : "") : (o === it || o === ex.answer) ? "good" : L.sel === i ? "bad" : "";
  const isL = it?.kind === "letter";
  const speakBtn = canSpeak() ? `<button class="iconbtn" data-act="say" aria-label="Play" style="float:right;color:var(--madder)">${ICON.spk}</button>` : "";
  if (ex.type === "mc") return `<p class="kicker">${isL ? "What sound does this make?" : it.kind === "sent" ? "What does this sentence mean?" : "What does this mean?"}</p>
      <div class="prompt">${peacock()}<div class="bubble">${speakBtn}${itemHTML(it)}</div></div>
      <div class="opts">${ex.opts.map((o, i) => `<button class="opt ${optCls(o, i)}" data-act="pick" data-v="${i}" ${done ? "disabled" : ""}><kbd>${i + 1}</kbd><span>${esc(isL ? "“" + o.en + "”" : o.en)}</span></button>`).join("")}</div>`;
  if (ex.type === "rev" || ex.type === "listen") {
    const head = ex.type === "rev" ? `<p class="kicker">${isL ? `Which one makes the “${esc(it.en)}” sound?` : `Which one means “${esc(it.en)}”?`}</p>`
      : `<p class="kicker">What do you hear?</p><div class="listenrow"><button class="spk big" data-act="say" aria-label="Play again">${ICON.spk}</button><button class="spk slow" data-act="slow" aria-label="Play slowly">${ICON.slow}</button></div>`;
    return head + `<div class="opts grid">${ex.opts.map((o, i) => `<button class="opt ${optCls(o, i)}" data-act="pick" data-v="${i}" ${done ? "disabled" : ""}><kbd>${i + 1}</kbd><div>${itemHTML(o)}</div></button>`).join("")}</div>`;
  }
  if (ex.type === "reply") {
    const l = ex.line;
    return `<p class="kicker">Pick the best reply</p><div class="prompt">${peacock()}<div class="bubble"><div class="dlg"><div class="who">${esc(l.who)}</div></div>
      ${canSpeak() ? `<button class="iconbtn" data-act="sayt" data-v="${esc(l.pa)}" aria-label="Play" style="float:right;color:var(--madder)">${ICON.spk}</button>` : ""}${itemHTML(l)}<div class="note">${esc(l.en)}</div></div></div>
      <div class="opts reply">${ex.opts.map((o, i) => `<button class="opt ${optCls(o, i)}" data-act="pick" data-v="${i}" ${done ? "disabled" : ""}><kbd>${i + 1}</kbd><div>${itemHTML(o)}</div></button>`).join("")}</div>`;
  }
  if (ex.type === "match") {
    const cell = (side, x, i) => {
      const gone = ex.done.includes(x), sel = (side === "l" ? L.ml : L.mr) === i, bad = ex.bad && ex.bad[side] === i;
      return `<button class="opt ${gone ? "gone" : bad ? "bad" : sel ? "sel" : ""}" data-act="m" data-side="${side}" data-v="${i}" ${gone || done ? "disabled" : ""}>${side === "l" ? itemHTML(x) : `<span>${esc(x.kind === "letter" ? "“" + x.en + "”" : x.en)}</span>`}</button>`;
    };
    return `<p class="kicker">Tap the matching pairs</p><div class="match"><div class="colm">${ex.left.map((x, i) => cell("l", x, i)).join("")}</div><div class="colm">${ex.right.map((x, i) => cell("r", x, i)).join("")}</div></div>`;
  }
  if (ex.type === "build") {
    const sel = L.sel || [];
    const tok = (b, i, act) => `<button class="tok ${act === "tok" && sel.includes(i) ? "used" : ""} ${act === "untok" && i === L.justTok ? "just" : ""}" data-act="${act}" data-v="${i}" ${done ? "disabled" : ""}>${ex.dir === "pa" ? `<span class="pa">${esc(b.t)}</span>${b.sub ? `<span class="tr">${esc(b.sub)}</span>` : ""}` : `<span>${esc(b.t)}</span>`}</button>`;
    const prompt = ex.dir === "pa" ? `<p class="kicker">Write this in ${esc(C.name)}</p><div class="prompt">${peacock()}<div class="bubble"><b>${esc(it.en)}</b></div></div>`
      : `<p class="kicker">Translate this sentence</p><div class="prompt">${peacock()}<div class="bubble">${speakBtn}${itemHTML(it)}</div></div>`;
    return prompt + `<div class="answer">${sel.map(i => tok(ex.bank[i], i, "untok")).join("")}</div><div class="bank">${ex.bank.map((b, i) => tok(b, i, "tok")).join("")}</div>`;
  }
  return "";
}
const ready = () => cur().type === "build" ? (L.sel || []).length > 0 : L.sel !== null && L.sel !== undefined;
function footHTML() {
  const ex = cur();
  if (L.state === "idle") return `<footer class="lfoot"><div class="col">${ex.type === "match" ? `<p class="note" style="margin:0;text-align:center">Tap a word on the left, then its meaning on the right.</p>` : `<button class="btn wide" data-act="check" ${ready() ? "" : "disabled"}>Check</button>`}</div></footer>`;
  const it = ex.item;
  let ans = "";
  if (L.state === "wrong") ans = (ex.type === "mc" || (ex.type === "build" && ex.dir === "en")) ? `<p>Correct answer: <b>${esc(it.en)}</b></p>` : `<p>Correct answer:</p>${itemHTML(it)}${ex.type === "reply" ? `<p>${esc(it.en)}</p>` : ""}`;
  else if (it) ans = `<p class="pa">${esc(it.pa)}</p>${it.tr ? `<p class="tr" style="margin:0">${esc(it.tr)}</p>` : ""}<p style="margin:0">${esc(it.kind === "letter" ? "“" + it.en + "” sound" : it.en)}</p>`;
  const praise = C.id === "punjabi" ? ["ਸ਼ਾਬਾਸ਼! Well done!", "ਵਧੀਆ! Great!", "Correct!", "ਬੱਲੇ ਬੱਲੇ!", "Spot on!"] : ["Well done!", "Great!", "Correct!", "Spot on!"];
  const pop = L.fbAt !== L.i; L.fbAt = L.i;
  return `<footer class="lfoot ${L.state} ${pop ? "pop" : ""}"><div class="col"><div class="fb"><h3>${L.state === "right" ? praise[L.i % praise.length] : "Not quite"}</h3>${ans}</div>
    <button class="btn wide" data-act="next">Continue</button></div></footer>`;
}
function lessonView() {
  const ex = cur();
  if (L.spoken !== L.i) {
    L.spoken = L.i;
    if (ex.type === "mc" || ex.type === "listen" || (ex.type === "build" && ex.dir === "en")) setTimeout(() => say(ex.item.pa), 250);
    if (ex.type === "reply") setTimeout(() => say(ex.line.pa), 250);
  }
  const tag = L.mode === "letters" ? `<span class="ptag">Letters</span>` : L.mode === "test" ? `<span class="ptag">Unit ${L.unit + 1} test</span>` : L.mode === "practice" ? `<span class="ptag">Practice</span>` : "";
  return `<div class="lesson"><div class="col lhead"><button class="iconbtn" data-act="quit" aria-label="Quit">${ICON.x}</button>
    <div class="bar" role="progressbar" aria-valuenow="${L.solved}" aria-valuemax="${L.total}"><span style="width:${L.pct0 ?? 0}%" data-to="${L.pct = (L.mode === "test" ? L.i / L.total : L.solved / L.total) * 100}"></span></div>${tag}</div>
    <div class="col lbody ${L.enterAt !== L.i ? "enter" : ""}">${exHTML(ex)}</div>${footHTML()}</div>`;
}
function check() {
  const ex = cur();
  if (L.state !== "idle" || !ready()) return;
  let ok;
  if (ex.type === "build") { const got = L.sel.map(i => ex.bank[i].t).join(" "); ok = ex.dir === "pa" ? got === ex.item.pa : clean(got) === clean(ex.item.en); }
  else if (ex.type === "reply") ok = ex.opts[L.sel] === ex.answer;
  else ok = ex.opts[L.sel] === ex.item;
  if (ok) { L.state = "right"; L.solved++; sfx.good(); }
  else {
    L.state = "wrong"; L.mistakes++; sfx.bad();
    // In lessons a missed question comes back at the end; tests count each question once.
    if (L.mode !== "test") L.queue.push(ex.type === "build" ? { ...ex, bank:shuffle(ex.bank) } : { ...ex, opts:shuffle(ex.opts) });
  }
  if (ex.type === "build" && ex.dir === "pa") say(ex.item.pa);
  render();
}
function next() {
  L.i++; L.sel = null; L.ml = L.mr = null; L.state = "idle";
  if (L.i >= L.queue.length) finish(); else render();
}
function finish() {
  const t = dayKey();
  let xp, result = {};
  if (L.mode === "test") {
    const score = L.solved / L.total, ok = score >= PASS;
    result = { score:Math.round(score * 100), ok };
    xp = ok ? 25 : 5;
    if (ok) { const u = C.units[L.unit], first = !passed(L.unit); S.tests[u.key] = true; u.sk.forEach(s => S.prog[s.key] = Math.max(prog(s), LESSONS)); result.first = first; }
  } else if (L.mode === "lesson") {
    xp = 10 + (L.mistakes === 0 ? 5 : 0);
    S.prog[L.sk.key] = Math.min(LESSONS, prog(L.sk) + 1);
  } else xp = 8;
  S.xp += xp; S.hist[t] = (S.hist[t] || 0) + xp;
  if (S.lastDay !== t) { S.streak = S.lastDay === dayOff(-1) ? S.streak + 1 : 1; S.lastDay = t; result.streakUp = true; }
  S.best = Math.max(S.best, S.streak);
  Object.keys(S.hist).sort().slice(0, -60).forEach(k => delete S.hist[k]);
  save(); if (L.mode !== "test" || result.ok) sfx.done(); else sfx.bad();
  L.result = { xp, acc:Math.round(100 * L.total / (L.total + L.mistakes)), ...result };
  nav(() => { view = "result"; }, () => scrollTo(0, 0));
}
function resultView() {
  const r = L.result;
  if (L.mode === "test") {
    const nextUnit = C.units[L.unit + 1];
    return `<main class="col center result"><div class="cloth" style="display:grid;gap:14px;justify-items:center;width:100%">${peacock()}
      <h1>${r.ok ? "Unit passed!" : "Not this time"}</h1>
      <p class="note" style="margin:0">${r.ok ? (nextUnit ? `You climbed to Unit ${L.unit + 2}: ${esc(nextUnit.title)}.` : "You've passed the final unit. ਬਹੁਤ ਵਧੀਆ!") : `You scored ${r.score}%. You need 80% to move on. Review the unit's skills and try again.`}</p>
      <div class="tiles"><div class="tile"><b style="color:${r.ok ? "var(--green)" : "var(--madder)"}">${r.score}%</b><span>score</span></div><div class="tile"><b style="color:var(--gold-deep)">+${r.xp}</b><span>XP</span></div><div class="tile"><b>${liveStreak()}</b><span>day streak</span></div></div>
      <button class="btn wide" data-act="home">Back to the board</button></div></main>`;
  }
  return `<main class="col center result"><div class="cloth" style="display:grid;gap:14px;justify-items:center;width:100%">${peacock()}<h1>${L.mode === "lesson" ? "Lesson complete!" : "Practice done!"}</h1>
    <p class="note" style="margin:0">${r.streakUp ? `Your streak is now ${S.streak} day${S.streak > 1 ? "s" : ""}.` : L.mode !== "lesson" ? "Nice review session." : `${esc(L.sk.name)}: ${prog(L.sk)} of ${LESSONS} lessons done.`}</p>
    <div class="tiles"><div class="tile"><b style="color:var(--gold-deep)">+${r.xp}</b><span>XP</span></div><div class="tile"><b style="color:var(--green)">${r.acc}%</b><span>accuracy</span></div><div class="tile"><b>${liveStreak()}</b><span>day streak</span></div></div>
    <button class="btn wide" data-act="home">Continue</button></div></main>`;
}

/* ---------- motion ---------- */
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// Screen changes cross-fade where the browser supports view transitions; elsewhere the new screen fades up in CSS.
function nav(change, after) {
  const run = () => { change(); render(); after?.(); };
  if (document.startViewTransition && !calm()) document.startViewTransition(run); else { app.classList.remove("fresh"); void app.offsetWidth; app.classList.add("fresh"); run(); }
}

/* ---------- render and events ---------- */
function render() {
  if (!C) return;
  const focusId = document.activeElement?.id;
  let h;
  if (view === "lesson") h = lessonView();
  else if (view === "result") h = resultView();
  else {
    const body = view === "words" ? wordsView() : view === "alphabet" ? alphabetView() : view === "profile" ? profileView() : view === "courses" ? coursesView() : view === "editor" ? edView() : view === "guide" ? guideView() : homeView();
    h = topBar() + body + tabsBar();
  }
  if (toastMsg) h += `<div class="toast" role="status">${esc(toastMsg)}</div>`;
  app.innerHTML = h;
  if (L && view === "lesson") {
    L.enterAt = L.i;
    const bar = app.querySelector(".bar span[data-to]");
    if (bar) requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = bar.dataset.to + "%"; L.pct0 = +bar.dataset.to; }));
  }
  sheetAnim = false;
  if (focusId && document.getElementById(focusId)) document.getElementById(focusId).focus();
}
function scrollToCurrent() {
  const q = currentSquare(); const el = q && document.getElementById("sq" + q.n);
  if (el) el.scrollIntoView({ block:"center" });
}
const acts = {
  tab: b => { if (view === b.dataset.v) return; nav(() => { view = b.dataset.v; sheet = null; confirmReset = false; letterOpen = null; }, () => view === "home" ? scrollToCurrent() : scrollTo(0, 0)); },
  home: () => nav(() => { view = "home"; }, scrollToCurrent),
  sq: b => { sheet = +b.dataset.v; sheetAnim = true; sfx.tap(); render(); },
  closesheet: () => { sheet = null; render(); },
  start: b => startRun("lesson", { sk:SKILLS[+b.dataset.v] }),
  test: b => startRun("test", { unit:+b.dataset.v }),
  practice: () => startRun("practice", {}),
  letterpractice: () => startRun("letters", {}),
  letter: b => {
    const id = b.dataset.v, [g, i] = id.split("-").map(Number), l = C.alphabet[g].letters[i];
    letterOpen = letterOpen === id ? null : id; render();
    if (letterOpen) { say(/[\u0A3E-\u0A4D\u0A70\u0A71\u0A02]/.test(l[0][0]) ? l[3] : l[0]); document.querySelector(".lettercard")?.scrollIntoView({ block:"nearest", behavior:calm() ? "auto" : "smooth" }); }
  },
  guide: b => nav(() => { guideUnit = +b.dataset.v; view = "guide"; sheet = null; }, () => scrollTo(0, 0)),
  vocab: b => { const s = SKILLS[+b.dataset.v]; view = "words"; sheet = null; render(); document.getElementById("sk-" + s.sid)?.scrollIntoView(); },
  say: () => say(cur().item.pa), slow: () => say(cur().item.pa, true), sayt: b => say(b.dataset.v),
  pick: b => { const ex = cur(); L.sel = +b.dataset.v; if (ex.type === "rev") say(ex.opts[L.sel].pa); render(); },
  tok: b => { const ex = cur(); L.justTok = +b.dataset.v; L.sel = (L.sel || []).concat(+b.dataset.v); if (ex.dir === "pa") say(ex.bank[+b.dataset.v].t); render(); },
  untok: b => { L.justTok = null; L.sel = L.sel.filter(i => i !== +b.dataset.v); render(); },
  m: b => {
    const ex = cur(), i = +b.dataset.v;
    if (b.dataset.side === "l") { L.ml = i; say(ex.left[i].pa); } else L.mr = i;
    if (L.ml != null && L.mr != null) {
      if (ex.left[L.ml] === ex.right[L.mr]) { ex.done.push(ex.left[L.ml]); sfx.tap(); }
      else { ex.bad = { l:L.ml, r:L.mr }; if (L.mode !== "test") L.mistakes++; sfx.bad(); setTimeout(() => { ex.bad = null; if (view === "lesson") render(); }, 450); }
      L.ml = L.mr = null;
      if (ex.done.length === ex.items.length) { L.state = "right"; L.solved++; sfx.good(); }
    }
    render();
  },
  check, next,
  quit: () => nav(() => { L = null; view = "home"; }, scrollToCurrent),
  toggle: b => { const k = b.dataset.v; S[k] = !S[k]; save(); document.documentElement.classList.toggle("no-tr", !S.tr || !C.translit); render(); },
  script: b => { S.tr = b.dataset.v === "both"; save(); document.documentElement.classList.toggle("no-tr", !S.tr || !C.translit); render(); },
  goal: b => { S.goal = +b.dataset.v; save(); render(); },
  reset: b => {
    if (!b.dataset.v) confirmReset = true;
    else { if (b.dataset.v === "yes") { const keep = { goal:S.goal, tr:S.tr, sfx:S.sfx, course:S.course, remind:S.remind }; S = { ...DEF, hist:{}, prog:{}, tests:{}, ...keep }; save(); toast("Progress reset"); } confirmReset = false; }
    render();
  },
  install: async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; render(); },
  share: async () => {
    try { if (navigator.share) { await navigator.share({ title:"Mor: Learn Punjabi", text:"Learn Punjabi with me on Mor", url:APP_URL }); return; } } catch (e) { if (e?.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(APP_URL); toast("Link copied"); } catch (e) { toast("Press and hold the link to copy it."); }
  },
  calendar: () => { download("mor-streak-reminder.ics", reminderICS(), "text/calendar"); toast("Open the file to add it to your calendar"); },
  pickcourse: b => nav(() => { useCourse(b.dataset.v); save(); view = "home"; sheet = null; }, scrollToCurrent),
  newcourse: () => { ed = { id:null, c:toEd(blankCourse()) }; view = "editor"; render(); scrollTo(0, 0); },
  editcourse: b => { ed = { id:b.dataset.v, c:toEd(custom[b.dataset.v]) }; view = "editor"; render(); scrollTo(0, 0); },
  exportcourse: b => { const c = custom[b.dataset.v]; shareFile(`${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-mor-course.json`, JSON.stringify(c, null, 1), "application/json"); },
  edadd: b => { const v = b.dataset.v; if (v === "u") ed.c.units.push({ title:"", desc:"", _t:"", skills:[blankSkill()] }); else ed.c.units[+v.slice(1)].skills.push(blankSkill()); render(); },
  edrm: b => { const v = b.dataset.v; if (v[0] === "u") ed.c.units.splice(+v.slice(1), 1); else { const [u, s] = v.slice(1).split("_").map(Number); ed.c.units[u].skills.splice(s, 1); } render(); },
  edsave: edSave,
  edcancel: () => { ed = null; view = "courses"; render(); },
  eddel: b => {
    if (!b.dataset.v) { ed.del = true; render(); return; }
    if (b.dataset.v === "no") { ed.del = false; render(); return; }
    delete custom[ed.id]; saveCustom(); if (C.id === ed.id) useCourse("punjabi"); ed = null; view = "courses"; toast("Language deleted");
  }
};
app.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b || b.disabled) return; acts[b.dataset.act]?.(b); });
app.addEventListener("input", e => { if (ed && e.target.dataset.f) edInput(e.target); });
app.addEventListener("change", e => {
  if (e.target.id === "importfile" && e.target.files[0]) { importCourse(e.target.files[0]); return; }
  if (e.target.dataset.act2 === "remind" && e.target.value) { S.remind = e.target.value; save(); }
  if (ed && e.target.dataset.f && (e.target.tagName === "SELECT" || e.target.type === "checkbox")) edInput(e.target);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && sheet !== null) { sheet = null; render(); return; }
  if (view !== "lesson" || e.target.tagName === "INPUT") return;
  const ex = cur();
  if (e.key === "Enter") { e.preventDefault(); L.state === "idle" ? check() : next(); }
  else if (/^[1-4]$/.test(e.key) && L.state === "idle" && ex.opts && +e.key <= ex.opts.length) { L.sel = +e.key - 1; if (ex.type === "rev") say(ex.opts[L.sel].pa); render(); }
});
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; if (view === "profile") render(); });

/* ---------- boot ---------- */
(async () => {
  try {
    const list = await (await fetch("courses/index.json")).json();
    await Promise.all(list.map(async x => { const c = await (await fetch(x.file)).json(); builtin[c.id] = c; }));
  } catch (e) {
    app.innerHTML = `<p class="loading">Couldn't load the course. Check your connection and reload.</p>`; return;
  }
  useCourse(S.course);
  render(); scrollToCurrent();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
