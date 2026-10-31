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
const VERSION = 23;
const APP_URL = location.origin + location.pathname.replace(/index\.html$/, "");

const ICON = {
  fire:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.5 5 10.5A5 5 0 0 1 7 13c0-2 1-3.5 2-4.5.2 2 1.3 3 2.3 3C10.5 8 12 5 12 2z"/></svg>',
  bolt:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  spk:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  slow:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17h15a3 3 0 0 0 3-3v-1h-2a7 7 0 0 0-14 0v1a3 3 0 0 0-2 3zm16-6a2 2 0 1 1 2-2"/></svg>',
  x:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  board:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
  quote:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 11h5v7H4zM4 11c0-3 1.5-5 4-6M14 11h5v7h-5zM14 11c0-3 1.5-5 4-6"/></svg>',
  book:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
  user:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
  globe:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
  lock:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V8a5 5 0 0 1 10 0v2h1v11H6V10zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>',
  star:'<svg class="i" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l2.6 6.3L21 5l-2.3 6.4L23 12l-4.3 0.6L21 19l-6.4-2.3L12 23l-2.6-6.3L3 19l2.3-6.4L1 12l4.3-0.6L3 5l6.4 2.3z"/></svg>',
  mic:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  story:'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5zM12 6v14.5"/></svg>',
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
const DEF = { xp:0, streak:0, best:0, lastDay:null, hist:{}, goal:20, tr:true, sfx:true, course:"punjabi", prog:{}, tests:{}, remind:"19:00", srs:{}, stories:{}, speak:true, speakOff:0, fest:"auto", vsex:"female" };
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
let C = null, SKILLS = [], ALL = [], SQUARES = [], FESTS = [], VOCAB = new Map();

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
  FESTS = (C.festivals || []).map(f => {
    const sk = { ...f.skill, sid:f.skill.id, unit:-1, key:C.id + ":" + f.skill.id };
    sk.items = f.skill.words.map(w => ({ pa:w[0], tr:w[1] || "", en:w[2], kind:"word", sk }));
    sk.sents = f.skill.sentences.map(w => ({ pa:w[0], tr:w[1] || "", en:w[2], kind:"sent", sk }));
    return { ...f, sk };
  });
  // Word lookup for tapping words in stories.
  VOCAB = new Map();
  ALL.concat(FESTS.flatMap(f => f.sk.items)).forEach(it => { if (it.kind === "word" && !VOCAB.has(it.pa)) VOCAB.set(it.pa, it); });
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
// Phones often have several voices per language; the "enhanced", "natural" and online ones sound far less robotic.
function voiceScore(v) {
  const n = v.name + " " + v.voiceURI;
  return (/natural|neural|premium|enhanced|wavenet|siri/i.test(n) ? 4 : 0) + (/google|online/i.test(n) ? 2 : 0) + (v.localService === false ? 1 : 0) - (/compact|eloquence|espeak/i.test(n) ? 4 : 0);
}
function pickVoice() {
  if (!("speechSynthesis" in window) || !C) { vmode = "none"; return; }
  const vs = speechSynthesis.getVoices(), code = (C.speech || "").toLowerCase(), base = code.split("-")[0];
  const lang = v => v.lang.toLowerCase().replace("_", "-");
  const best = list => list.sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
  voice = base ? best(vs.filter(v => lang(v) === code)) || best(vs.filter(v => lang(v).startsWith(base))) : null;
  if (voice) { vmode = "native"; return; }
  if (C.id === "punjabi") { voice = best(vs.filter(v => lang(v) === "hi-in")) || best(vs.filter(v => lang(v).startsWith("hi"))); if (voice) { vmode = "hindi"; return; } }
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
// Recorded audio, when a course has it (see tools/make_audio.py), sounds far better than device voices.
const AUDIO = {}; // course id -> { female:{ base, clips }, male:{ base, clips } }, or just one of them
let player = null;
const clipSet = () => { const v = AUDIO[C?.id]; return v && (v[S.vsex] || Object.values(v)[0]); };
const bothVoices = () => !!(AUDIO[C?.id]?.female && AUDIO[C?.id]?.male);
function sayClip(text, slow) {
  const a = clipSet(), f = a && (a.clips[text] || a.clips[text.replace(/[।.!?,:]+$/, "")] || a.clips[letterSpeech(text)]);
  if (!f) return false;
  try {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    player = player || new Audio();
    player.pause();
    player.onerror = () => sayVoice(text, slow);
    player.src = a.base + f; player.playbackRate = slow ? 0.7 : 1; player.preservesPitch = true;
    player.play().catch(() => {});
    return true;
  } catch (e) { return false; }
}
// A letter on its own is said by its name (ਚ is ਚੱਚਾ); a vowel sign by its example word.
const letterSay = l => l[6] || (/[\u0A3E-\u0A4D\u0A70\u0A71\u0A02]/.test(l[0][0]) ? l[3] : l[0]);
const letterSpeech = t => { const l = (C.alphabet || []).flatMap(g => g.letters).find(l => l[0] === t); return l ? letterSay(l) : ""; };
const sampleWord = () => (C.units.flatMap(u => u.skills).find(s => !s.letters) || C.units[0]?.skills[0])?.words[0]?.[0] || "";
const hasClips = () => !!AUDIO[C?.id];
const canSpeak = () => hasClips() || vmode === "native" || vmode === "hindi";
function say(text, slow) {
  if (!text) return;
  if (!sayClip(text, slow)) sayVoice(text, slow);
}
function sayVoice(text, slow) {
  if (!(vmode === "native" || vmode === "hindi")) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(vmode === "hindi" ? toDeva(text) : text);
    u.voice = voice; u.lang = voice.lang; u.rate = slow ? 0.6 : 0.95;
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

/* ---------- spaced review: Leitner boxes, wrong answers come back tomorrow ---------- */
const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32];
const srsKey = it => it.sk.key + "|" + it.pa;
function record(it, ok) {
  if (!it?.sk || it.kind === "line") return;
  const k = srsKey(it), r = S.srs[k] || { b:0 };
  r.b = ok ? Math.min(BOX_DAYS.length - 1, r.b + 1) : 1;
  r.d = dayOff(ok ? BOX_DAYS[r.b] : 1);
  if (!ok) r.miss = (r.miss || 0) + 1;
  S.srs[k] = r;
}
const learnedItems = () => ALL.filter(it => S.srs[srsKey(it)]);
const dueItems = () => learnedItems().filter(it => S.srs[srsKey(it)].d <= dayKey()).sort((a, b) => S.srs[srsKey(a)].b - S.srs[srsKey(b)].b);

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
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const canListenToYou = () => !!SR && S.speak && Date.now() > (S.speakOff || 0);
const mkSpeak = it => it && canListenToYou() ? { type:"speak", item:it, tries:0 } : null;
// Compare what was heard with the target, ignoring marks that speech engines often drop.
function normSpoken(s) {
  const map = { "\u0A36":"\u0A38", "\u0A59":"\u0A16", "\u0A5A":"\u0A17", "\u0A5B":"\u0A1C", "\u0A5E":"\u0A2B", "\u0A33":"\u0A32" };
  return String(s).toLowerCase().replace(/[\u0A3C\u0A71\u0A02\u0A70\u0A01]/g, "").replace(/[\u0A36\u0A59-\u0A5E\u0A33]/g, c => map[c] || c)
    .replace(/[\s.,?!।:;"'“”-]/g, "");
}
function similarity(a, b) {
  a = normSpoken(a); b = normSpoken(b);
  if (!a || !b) return 0;
  const m = a.length, n = b.length, d = Array.from({ length:m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}
let rec = null;
function listenToYou() {
  const ex = cur();
  if (!SR || ex.type !== "speak" || L.state !== "idle") return;
  if (rec) { try { rec.abort(); } catch (e) {} rec = null; }
  try { speechSynthesis.cancel(); } catch (e) {}
  rec = new SR();
  rec.lang = C.speech || "pa-IN"; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
  ex.listening = true; ex.heard = ""; render();
  rec.onresult = e => {
    const res = e.results[e.results.length - 1];
    let best = { text:res[0].transcript, score:0 };
    for (let i = 0; i < res.length; i++) { const sc = similarity(res[i].transcript, ex.item.pa); if (sc > best.score) best = { text:res[i].transcript, score:sc }; }
    ex.heard = best.text;
    if (res.isFinal) {
      ex.listening = false; ex.tries++;
      if (best.score >= 0.65) { L.state = "right"; L.solved++; record(ex.item, true); sfx.good(); }
      else { ex.miss = true; sfx.bad(); }
    }
    render();
  };
  rec.onerror = e => {
    ex.listening = false;
    if (e.error === "not-allowed" || e.error === "service-not-allowed") { ex.blocked = true; }
    else if (e.error === "no-speech") ex.miss = true;
    render();
  };
  rec.onend = () => { if (ex.listening) { ex.listening = false; render(); } };
  try { rec.start(); } catch (e) { ex.listening = false; render(); }
}
function skipSpeak(forAWhile) {
  if (rec) { try { rec.abort(); } catch (e) {} rec = null; }
  if (forAWhile) { S.speakOff = Date.now() + 15 * 60 * 1000; save(); }
  L.solved++; L.state = "skip"; next();
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
  if (lvl > 0 && !sk.letters) { const sp = mkSpeak(sample(sk.sents.length ? sk.sents : sk.items, 1)[0]); if (sp) list.push(sp); }
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
  // Review: words that are due come first, then the shakiest ones, then anything you've met.
  const done = SKILLS.filter(s => prog(s) > 0 || passed(s.unit));
  const due = dueItems(), weak = learnedItems().sort((a, b) => S.srs[srsKey(a)].b - S.srs[srsKey(b)].b);
  const pool = [...new Set([...due, ...weak.slice(0, 12), ...shuffle(done.flatMap(s => s.items.concat(s.sents)))])];
  const words = pool.filter(x => x.kind !== "sent").slice(0, 10), sents = pool.filter(x => x.kind === "sent").slice(0, 3);
  let list = words.slice(0, 6).map((w, i) => wordEx(w, i));
  sents.slice(0, 2).forEach((s, i) => list.push(mkBuild(s, i ? "pa" : "en")));
  const sp = mkSpeak(sents[2] || words[6]); if (sp) list.push(sp);
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
  return `<nav class="tabs"><div class="stitch"></div><div class="col">${t("home", "board", "Board")}${alpha}${C.stories?.length ? t("stories", "story", "Stories") : ""}${C.sayings?.length ? t("sayings", "quote", "Sayings") : ""}${t("words", "book", "Words")}${t("profile", "user", "Profile")}</div></nav>`;
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
  const fest = festivalNow();
  if (fest) h += festivalBanner(fest);
  for (let si = C.sections.length - 1; si >= 0; si--) h += boardHTML(si);
  h += `<div class="cloth hello">${peacock()}<div class="say"><div class="pa">${esc(greet[0])}</div>${greet[1] ? `<div class="tr">${esc(greet[1])}</div>` : ""}
      <div class="goal" aria-label="Daily goal"><span style="width:${g * 100}%"></span></div>
      <div class="goaltxt">${todayXP()} / ${S.goal} XP daily goal${g >= 1 ? " · done for today" : ""}</div></div></div>`;
  if (liveStreak() > 0 && S.lastDay !== dayKey()) h += `<div class="cloth notice warn">${ICON.fire}<div><b>Keep your ${liveStreak()}-day streak</b><span>It ends at midnight. One lesson keeps it going.</span></div></div>`;
  const due = dueItems().length;
  h += `<div class="cloth notice"><div><b>${due ? `${due} word${due > 1 ? "s" : ""} to review` : "Ladders and snakes"}</b><span>${due ? "Words you found hard come back until they stick. Slide down the snake to review them." : "Climb a ladder by passing a unit test early. Slide down the snake to review words you've learned."}</span></div><button class="btn small" data-act="practice">Review</button></div>`;
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
      h += `<div class="lettercard"><div class="big pa">${esc(l[0])}</div><div style="min-width:0;flex:1"><b>${l[6] ? `<span class="pa">${esc(l[6])}</span> ` : ""}${esc(l[1])}</b>${l[6] && canSpeak() ? ` <button class="linkbtn" data-act="sayt" data-v="${esc(l[6])}">Hear the name</button>` : ""}<p class="note" style="margin:2px 0 8px">Sound: ${esc(l[2])}</p>
        <div class="pa" style="font-size:1.35rem">${esc(l[3])}</div><div class="tr">${esc(l[4])}</div><div>${esc(l[5])}</div></div>
        ${canSpeak() ? `<button class="spk" data-act="sayt" data-v="${esc(l[3])}" aria-label="Hear the example">${ICON.spk}</button>` : ""}</div>`;
    }
    h += `</div>`;
    if (C.numbers && g.letters[0]?.[0] === "੦") h += numFinder();
  });
  return h + `</div></main>`;
}
/* ---------- number finder ---------- */
let numIn = "";
const guruDigits = n => String(n).replace(/\d/g, d => String.fromCharCode(0x0A66 + +d));
// Punjabi number words: 0 to 100 come from the course (most are irregular), 101 to 1000 are built from them.
function numberWords(n) {
  const N = C.numbers, w = k => N.words[k];
  if (n === 1000) return { pa:`${w(1)[0]} ${N.thousand[0]}`, tr:`${w(1)[1]} ${N.thousand[1]}` };
  if (n <= 100) return { pa:w(n)[0], tr:w(n)[1], alt: n === 100 ? { pa:`${w(1)[0]} ${N.hundred[0]}`, tr:`${w(1)[1]} ${N.hundred[1]}` } : null };
  const h = Math.floor(n / 100), r = n % 100;
  const pa = [w(h)[0], N.hundred[0], r ? w(r)[0] : ""].join(" ").trim(), tr = [w(h)[1], N.hundred[1], r ? w(r)[1] : ""].join(" ").trim();
  // Fractions people use for round fifties: 150 ਡੇਢ ਸੌ, 250 ਢਾਈ ਸੌ, 350 ਸਾਢੇ ਤਿੰਨ ਸੌ ...
  let alt = null;
  if (C.id === "punjabi" && r === 50) alt = h === 1 ? { pa:"ਡੇਢ ਸੌ", tr:"ḍeḍh sau" } : h === 2 ? { pa:"ਢਾਈ ਸੌ", tr:"ḍhāī sau" } : { pa:`ਸਾਢੇ ${w(h)[0]} ਸੌ`, tr:`sāḍhe ${w(h)[1]} sau` };
  return { pa, tr, alt };
}
function numResult() {
  const v = numIn.trim();
  if (v === "") return `<p class="note" style="margin:0">Type a number from 0 to 1000.</p>`;
  const n = Number(v);
  if (!/^\d+$/.test(v) || n > 1000) return `<p class="note" style="margin:0">Pick a whole number from 0 to 1000.</p>`;
  const r = numberWords(n);
  return `<div class="numres"><div class="numdig pa">${guruDigits(n)}</div><div style="min-width:0;flex:1"><div class="pa numword">${esc(r.pa)}</div><div class="tr">${esc(r.tr)}</div>
    ${r.alt ? `<p class="note" style="margin:6px 0 0">Also said: <span class="pa">${esc(r.alt.pa)}</span> <span class="tr">${esc(r.alt.tr)}</span></p>` : ""}</div>
    ${canSpeak() ? `<button class="spk" data-act="sayt" data-v="${esc(r.pa)}" aria-label="Hear it">${ICON.spk}</button>` : ""}</div>`;
}
function numFinder() {
  return `<div class="cloth"><h3>Number finder</h3><p class="note" style="margin:4px 0 10px">Type any number up to 1000 to see how it's written and said in ${esc(C.name)}.</p>
    <input id="numin" class="numin" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="e.g. 47" value="${esc(numIn)}" aria-label="Number">
    <div id="numout" aria-live="polite">${numResult()}</div></div>`;
}

/* ---------- dictionary ---------- */
let dictIn = "", DICT = null;
const fold = t => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{M}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim();
function dictEntries() {
  if (DICT && DICT.c === C) return DICT.list;
  const list = [], seen = new Set();
  const add = (pa, tr, en, note, rank) => { const k = pa + "|" + en; if (!pa || !en || seen.has(k)) return; seen.add(k); list.push({ pa, tr:tr || "", en, note:note || "", rank, senses:en.split(/[,;/]|\bor\b/).map(x => fold(x.replace(/\(.*?\)/g, ""))).filter(Boolean), f:fold(en), fp:fold(pa), ft:fold(tr || "") }); };
  ALL.filter(it => it.kind === "word").forEach(it => add(it.pa, it.tr, it.en, "", 0));
  (C.dictionary || []).forEach(d => add(d[0], d[1], d[2], d[3], 0));
  FESTS.forEach(f => f.sk.items.forEach(it => add(it.pa, it.tr, it.en, f.name.split(" ")[0], 1)));
  ALL.filter(it => it.kind === "sent").forEach(it => add(it.pa, it.tr, it.en, "", 2));
  (C.sayings || []).forEach(g => g.items.forEach(x => add(x[0], x[1], x[3], g.name.replace(/s$/, ""), 3)));
  DICT = { c:C, list };
  return list;
}
function dictSearch(q) {
  const f = fold(q);
  if (!f) return [];
  const esc_ = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), re = new RegExp("(^|\\s)" + esc_ + "(\\s|$)"), pre = new RegExp("(^|\\s)" + esc_);
  return dictEntries().map(e => {
    let sc = 0;
    if (e.senses.some(x => x === f || x === "to " + f)) sc = 100;
    else if (e.fp === f || e.ft === f) sc = 95;
    else if (re.test(e.f)) sc = 60;
    else if (pre.test(e.f) && f.length > 2) sc = 30;
    else if (f.length > 1 && (e.fp.includes(f) || e.ft.includes(f))) sc = 25;
    return sc ? { e, sc:sc - e.rank * 12 } : null;
  }).filter(Boolean).sort((a, b) => b.sc - a.sc || a.e.pa.length - b.e.pa.length).slice(0, 25).map(x => x.e);
}
function dictResult() {
  const q = dictIn.trim();
  if (!q) return `<p class="note" style="margin:0">Type an English word, like “water” or “to eat”. You can also type Punjabi or romanised Punjabi.</p>`;
  let rows = dictSearch(q);
  const n = /^\d{1,4}$/.test(q) && C.numbers && +q <= 1000 ? numberWords(+q) : null;
  if (n) rows = [{ pa:n.pa, tr:n.tr, en:q, note:"number" }, ...rows];
  const gt = `https://translate.google.com/?sl=en&tl=${encodeURIComponent((C.speech || "pa").split("-")[0])}&text=${encodeURIComponent(q)}&op=translate`;
  const more = `<p class="note" style="margin:10px 0 0">${rows.length ? "Not what you need?" : `“${esc(q)}” isn't in Mor's dictionary yet.`} <a href="${gt}" target="_blank" rel="noopener">Try Google Translate</a>. Machine translation can be wrong, so check with a native speaker.</p>`;
  return rows.map(e => `<div class="wordrow">${canSpeak() ? `<button class="iconbtn" data-act="sayt" data-v="${esc(e.pa)}" aria-label="Play">${ICON.spk}</button>` : ""}
    <div class="w"><div class="pa">${esc(e.pa)}</div>${e.tr ? `<div class="tr">${esc(e.tr)}</div>` : ""}</div><div class="en">${esc(e.en)}${e.note ? `<small class="dnote">${esc(e.note)}</small>` : ""}</div></div>`).join("") + more;
}

function wordsView() {
  let h = `<main class="home"><div class="col page"><div class="cloth"><h2>Dictionary</h2><p class="note" style="margin:0 0 10px">English to ${esc(C.name)}, from ${dictEntries().length} words, phrases and sayings.</p>
    <input id="dictin" class="numin dictin" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search a word" value="${esc(dictIn)}" aria-label="Search the dictionary">
    <div id="dictout" aria-live="polite">${dictResult()}</div></div>
    <div class="cloth"><h2>Phrasebook</h2><p class="note" style="margin:0">Every word and sentence in ${esc(C.name)}, unit by unit. ${canSpeak() ? "Tap the speaker to hear it." : ""}</p></div>`;
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
  const vtxt = hasClips() ? `Playing recorded ${esc(C.name)} audio, so every phone sounds the same. Anything without a recording uses this device's voice.` : { native:`Using “${esc(voice?.name || "")}”. If it sounds robotic, download a better ${esc(C.name)} voice in your phone\'s text-to-speech settings.`, hindi:`No Punjabi voice on this device, so the Hindi voice “${esc(voice?.name || "")}” reads the Gurmukhi. If it sounds robotic, download an enhanced Hindi voice, or on Android a Punjabi one, in your phone\'s text-to-speech settings.`, none:`This device has no ${esc(C.name)} voice, so listening exercises are skipped. Adding one in your phone's text-to-speech settings turns them on.`, pending:"Looking for voices…" }[vmode];
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  return `<main class="home"><div class="col page">
    <div class="cloth"><h2>Your progress</h2><div class="tiles">
      <div class="tile"><b style="color:var(--gold-deep)">${liveStreak()}</b><span>day streak</span></div>
      <div class="tile"><b style="color:var(--madder)">${S.xp}</b><span>total XP</span></div>
      <div class="tile"><b>${tests} / ${C.units.length}</b><span>unit tests passed</span></div>
      <div class="tile"><b>${learned}</b><span>words and phrases met</span></div>
      <div class="tile"><b>${dueItems().length}</b><span>words due for review</span></div>
      <div class="tile"><b>${Object.keys(S.stories || {}).filter(k => k.startsWith(C.id + ":")).length} / ${C.stories?.length || 0}</b><span>stories read</span></div></div></div>
    <div class="cloth"><h2>This week</h2><div class="week">${days.map(d => `<div class="${d === dayKey() ? "today" : ""}"><span>${S.hist[d] || 0}</span><i style="height:${((S.hist[d] || 0) / mx) * 70}%"></i>${"SMTWTFS"[new Date(d + "T12:00").getDay()]}</div>`).join("")}</div></div>
    ${standalone ? "" : `<div class="cloth"><h2>Install Mor on your phone</h2>
      ${installEvt ? `<p class="note" style="margin-top:0">Add Mor to your home screen. It works offline once installed.</p><button class="btn wide gold" data-act="install">Install app</button>` :
      `<p class="note" style="margin-top:0">Mor installs straight from the browser and works offline once added.</p>
      <b>iPhone (Safari)</b><ol class="steps"><li>Tap the Share button.</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol>
      <b style="display:block;margin-top:10px">Android (Chrome)</b><ol class="steps"><li>Tap the ⋮ menu.</li><li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li></ol>`}</div>`}
    <div class="cloth"><h2>Share Mor with friends</h2><p class="note" style="margin:0 0 12px;word-break:break-all;user-select:all;-webkit-user-select:all">${esc(APP_URL)}</p><button class="btn wide" data-act="share">Share or copy the link</button></div>
    <div class="cloth"><h2>Streak reminder</h2>
      <p class="note" style="margin-top:0">Add a daily reminder to your calendar. It pops up at the time you pick, with a link back to Mor.</p>
      <div class="setrow"><div><b>Remind me at</b></div><input type="time" id="rem-time" class="timein" data-act2="remind" value="${esc(S.remind || "19:00")}"></div>
      <button class="btn wide" data-act="calendar">Add reminder to my calendar</button></div>
    <div class="cloth"><h2>Languages</h2><p class="note" style="margin-top:0">You're learning ${esc(C.name)}. Add your own language or import one a friend sent you.</p><button class="btn wide ghost" data-act="tab" data-v="courses">Manage languages</button></div>
    <div class="cloth"><h2>Settings</h2>
      <div class="setrow"><div><b>Daily goal</b><p>XP to earn each day</p></div><div class="seg">${[10, 20, 30, 50].map(g => `<button data-act="goal" data-v="${g}" aria-pressed="${S.goal === g}">${g}</button>`).join("")}</div></div>
      ${C.translit ? `<div class="setrow stackrow"><div><b>Script</b><p>Romanised text appears under each word, like “sat srī akāl”</p></div><div class="seg"><button data-act="script" data-v="both" aria-pressed="${!!S.tr}">${C.id === "punjabi" ? "Gurmukhi" : esc(C.native || C.name)} + romanised</button><button data-act="script" data-v="only" aria-pressed="${!S.tr}">${C.id === "punjabi" ? "Gurmukhi" : esc(C.native || C.name)} only</button></div></div>` : ""}
      ${sw("sfx", "Sound effects", "Chimes for right and wrong answers")}
      ${SR ? sw("speak", "Speaking exercises", "Say words out loud and Mor checks your pronunciation") : `<div class="setrow"><div><b>Speaking exercises</b><p>This browser can't listen to speech. Chrome on Android or a computer can.</p></div></div>`}
      ${C.festivals?.length ? `<div class="setrow stackrow"><div><b>Festival themes</b><p>The board dresses up around Lohri, Vaisakhi and Diwali. Preview one now if you like.</p></div><div class="seg">${[["auto", "Automatic"], ...C.festivals.map(f => [f.id, f.name.split(" ")[0]]), ["off", "Off"]].map(([v, l]) => `<button data-act="festpick" data-v="${v}" aria-pressed="${S.fest === v}">${esc(l)}</button>`).join("")}</div></div>` : ""}
      ${bothVoices() ? `<div class="setrow"><div><b>Speaker</b><p>Whose recorded voice reads the ${esc(C.name)}</p></div><div class="seg">${[["female", "Woman"], ["male", "Man"]].map(([v, l]) => `<button data-act="vsex" data-v="${v}" aria-pressed="${S.vsex === v}">${l}</button>`).join("")}</div></div>` : ""}
      <div class="setrow"><div><b>Voice</b><p>${vtxt}</p></div>${canSpeak() ? `<button class="btn small ghost" data-act="sayt" data-v="${esc(sampleWord())}">Test</button>` : ""}</div>
      <div class="setrow"><div><b>Reset progress</b><p>Clears XP, streak, skills and tests. This can't be undone.</p></div>
        ${confirmReset ? `<div class="seg"><button data-act="reset" data-v="yes" style="color:var(--madder)">Yes, reset</button><button data-act="reset" data-v="no">Cancel</button></div>` : `<button class="btn small ghost" data-act="reset">Reset</button>`}</div>
      <p class="note" style="margin-bottom:0">Progress is saved on this device. Mor version ${VERSION}.</p><button class="btn small ghost" style="margin-top:10px" data-act="refreshapp">Get the latest version</button></div>
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
  const q = mode === "test" ? makeTest(opts.unit) : mode === "practice" ? makePractice() : mode === "letters" ? makeLetterPractice() : mode === "fest" ? makeFestLesson(opts.fest) : makeLesson(opts.sk, Math.min(prog(opts.sk), LESSONS - 1));
  if (!q.length) { toast("Finish a lesson first, then practise."); return; }
  L = { mode, fest:opts.fest, sk:opts.sk, unit:opts.unit ?? opts.sk?.unit, queue:q, i:0, total:q.length, solved:0, mistakes:0, state:"idle", sel:null, spoken:-1 };
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
  if (ex.type === "speak") {
    const status = ex.blocked ? `<p class="note">Microphone access is blocked. Allow it in your browser settings, or skip speaking for now.</p>`
      : ex.listening ? `<p class="hearing">Listening… say it now</p>`
      : ex.miss && L.state === "idle" ? `<p class="note">${ex.heard ? `We heard “${esc(ex.heard)}”. ` : "We didn't catch that. "}Try again, a little slower.</p>` : "";
    return `<p class="kicker">Say this out loud</p><div class="prompt">${peacock()}<div class="bubble">${speakBtn}${itemHTML(it)}<div class="note">${esc(it.en)}</div></div></div>
      <div class="listenrow"><button class="mic ${ex.listening ? "on" : ""}" data-act="mic" aria-label="${ex.listening ? "Listening" : "Tap and speak"}" ${done || ex.blocked ? "disabled" : ""}>${ICON.mic}</button></div>
      <div style="text-align:center">${status}${ex.heard && L.state !== "idle" ? `<p class="note">We heard “${esc(ex.heard)}”</p>` : ""}</div>`;
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
  if (L.state === "idle" && ex.type === "speak") return `<footer class="lfoot"><div class="col">${ex.tries >= 2 ? `<button class="btn wide ghost" data-act="speakskip">Continue anyway</button>` : ""}<button class="btn wide ghost" data-act="speakoff">Can't speak now</button></div></footer>`;
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
  const tag = L.mode === "fest" ? `<span class="ptag">${esc(L.fest.name.split(" ")[0])}</span>` : L.mode === "letters" ? `<span class="ptag">Letters</span>` : L.mode === "test" ? `<span class="ptag">Unit ${L.unit + 1} test</span>` : L.mode === "practice" ? `<span class="ptag">Review</span>` : "";
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
  if (ex.type !== "reply") record(ex.item, ok);
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
  if (rec) { try { rec.abort(); } catch (e) {} rec = null; }
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

/* ---------- festivals ---------- */
function festivalNow() {
  if (!FESTS.length || S.fest === "off") return null;
  if (S.fest !== "auto") return FESTS.find(f => f.id === S.fest) || null;
  const now = new Date(); now.setHours(12, 0, 0, 0);
  return FESTS.find(f => f.dates.some(d => {
    const day = d.length === 5 ? new Date(now.getFullYear() + "-" + d + "T12:00") : new Date(d + "T12:00");
    const diff = (now - day) / 864e5;
    return diff >= -5 && diff <= 2;
  })) || null;
}
function applyFestival() { const f = festivalNow(); document.documentElement.dataset.fest = f ? f.id : ""; }
function festArt(id) {
  const r = n => Math.round(n * 10) / 10;
  let g = "";
  if (id === "lohri") {
    // a night sky over a bonfire, with sparks drifting up
    [[30,18],[70,40],[110,14],[250,22],[300,44],[338,16],[205,10],[150,34]].forEach(([x, y], i) => g += `<circle class="tw" cx="${x}" cy="${y}" r="${i % 3 ? 1.2 : 1.8}" fill="#FFE9B0" style="animation-delay:${-i * .3}s"/>`);
    g += `<defs><radialGradient id="glow"><stop offset="0" stop-color="#FFB347" stop-opacity=".75"/><stop offset="1" stop-color="#FF7A1A" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="180" cy="112" rx="150" ry="60" fill="url(#glow)"/>
      <path d="M0 132 Q90 112 180 118 T360 112 V132Z" fill="#2A0C14"/>
      <rect x="138" y="110" width="84" height="10" rx="5" fill="#5B2A12" transform="rotate(-12 180 115)"/>
      <rect x="138" y="110" width="84" height="10" rx="5" fill="#6E3416" transform="rotate(12 180 115)"/>
      <path class="fl" d="M180 114c-30 0-42-18-34-40 5-13 14-20 12-36 14 9 20 22 20 32 4-14 12-24 13-40 15 16 27 38 22 58-4 16-15 26-33 26z" fill="#E8541E"/>
      <path class="fl b" d="M180 114c-20 0-28-12-23-28 4-10 10-14 9-26 10 8 14 16 14 24 3-9 8-15 9-25 10 12 17 26 13 39-3 10-10 16-22 16z" fill="#F9A21B"/>
      <path class="fl c" d="M180 114c-11 0-15-7-12-16 2-6 6-8 6-15 6 5 8 10 8 14 2-5 4-9 5-14 6 7 9 14 7 21-2 6-6 10-14 10z" fill="#FFE59A"/>`;
    for (let i = 0; i < 9; i++) g += `<circle class="spark" cx="${170 + (i * 7) % 24}" cy="${70 + (i * 5) % 14}" r="${i % 2 ? 1.4 : 2}" fill="#FFD27A" style="--dx:${(i % 2 ? -1 : 1) * (6 + i * 2)}px;animation-delay:${-i * .29}s"/>`;
  } else if (id === "diwali") {
    // a string of lights above, a row of diyas below
    g += `<path d="M-5 6 Q90 40 180 14 T365 8" fill="none" stroke="#7A5A2E" stroke-width="1.5"/>`;
    for (let i = 0; i <= 18; i++) {
      const t = i / 18, x = -5 + 370 * t;
      const y = t < .5 ? (1 - t * 2) ** 2 * 6 + 2 * (1 - t * 2) * (t * 2) * 40 + (t * 2) ** 2 * 14 : (1 - (t * 2 - 1)) ** 2 * 14 + 2 * (1 - (t * 2 - 1)) * (t * 2 - 1) * -12 + (t * 2 - 1) ** 2 * 8;
      g += `<circle class="tw" cx="${r(x)}" cy="${r(y + 4)}" r="3" fill="${["#FFD45C", "#FF8A5B", "#F3E6FF"][i % 3]}" style="animation-delay:${-i * .37}s"/>`;
    }
    g += `<defs><radialGradient id="dg"><stop offset="0" stop-color="#FFD978" stop-opacity=".7"/><stop offset="1" stop-color="#FFB020" stop-opacity="0"/></radialGradient></defs>`;
    [40, 110, 180, 250, 320].forEach((x, i) => {
      const y = i === 2 ? 112 : i % 2 ? 116 : 120;
      g += `<circle cx="${x}" cy="${y - 20}" r="26" fill="url(#dg)"/>
        <path class="fl ${i % 2 ? "b" : ""}" d="M${x} ${y - 4}c-6 0-8-5-6-10 2-5 5-8 6-16 2 8 5 11 7 16 1 5-1 10-7 10z" fill="#FFC93C"/>
        <path class="fl c" d="M${x} ${y - 5}c-3 0-4-3-3-6 1-2 2-4 3-8 1 4 3 6 3 8 1 3-0 6-3 6z" fill="#FFF6D8"/>
        <path d="M${x - 24} ${y - 3}h48c-3 12-13 18-24 18s-21-6-24-18z" fill="#B4441A"/>
        <path d="M${x - 24} ${y - 3}h48" stroke="#F7C35F" stroke-width="3" stroke-linecap="round"/>
        <path d="M${x - 14} ${y + 6}h28" stroke="#F7C35F" stroke-width="1.5" stroke-dasharray="2 3"/>`;
    });
  } else if (id === "vaisakhi") {
    // harvest sun over a field of ripe wheat
    g += `<circle cx="290" cy="40" r="22" fill="#FFF7DF" opacity=".9"/><circle cx="290" cy="40" r="34" fill="#FFF7DF" opacity=".3"/>
      <path d="M0 100 Q100 80 200 92 T360 86 V132H0Z" fill="#E9A23B"/><path d="M0 114 Q120 100 240 110 T360 106 V132H0Z" fill="#D4862A"/>`;
    for (let i = 0; i < 17; i++) {
      const x = 8 + i * 21.5 + (i % 3) * 3, h = 44 + (i * 13) % 22, y = 132;
      let head = "";
      for (let k = 0; k < 5; k++) head += `<ellipse cx="${r(x - 3)}" cy="${y - h + k * 5}" rx="2.6" ry="4" fill="#C98A1B" transform="rotate(-25 ${r(x - 3)} ${y - h + k * 5})"/><ellipse cx="${r(x + 3)}" cy="${y - h + k * 5 + 2}" rx="2.6" ry="4" fill="#E0A630" transform="rotate(25 ${r(x + 3)} ${y - h + k * 5 + 2})"/>`;
      g += `<g class="stalk" style="animation-delay:${-i * .23}s"><path d="M${x} ${y}V${y - h + 22}" stroke="#8A6A1E" stroke-width="1.6"/><path d="M${x} ${y - 20}q-10-6-14-16" stroke="#6E8B3D" stroke-width="1.6" fill="none"/>${head}<path d="M${x} ${y - h - 4}v-10" stroke="#C98A1B" stroke-width=".8"/></g>`;
    }
  }
  return `<svg viewBox="0 0 360 132" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${g}</svg>`;
}
function festivalBanner(f) {
  return `<div class="cloth festband" data-f="${f.id}"><div class="festart">${festArt(f.id)}</div><div class="festbody">
    <p class="kicker">${esc(f.name.split(" ")[0])} special</p><div class="pa">${esc(f.greeting[0])}</div><div class="tr">${esc(f.greeting[1])}</div>
    <p class="note">It's ${esc(f.name)} season. Learn the words that go with it in a bonus lesson.</p><button class="btn gold wide" data-act="festlesson" data-v="${f.id}">Bonus ${esc(f.name.split(" ")[0])} lesson</button></div></div>`;
}
function makeFestLesson(f) {
  const sk = f.sk;
  let list = shuffle(sk.items).slice(0, 6).map((w, i) => i % 3 === 2 && canSpeak() ? mkListen(w) : i % 2 ? mkRev(w) : mkMC(w));
  sk.sents.forEach((x, i) => list.push(mkBuild(x, i % 2 ? "pa" : "en")));
  const sp = mkSpeak(sk.sents[0]); if (sp) list.push(sp);
  list = shuffle(list); list.splice(1, 0, mkMatch(sample(sk.items, 5)));
  return list;
}

/* ---------- sayings ---------- */
let sayGroup = 0;
function sayingCard(x, big) {
  const [pa, tr, lit, mean, src] = x;
  return `<div class="cloth saying ${big ? "today" : ""}">
    <div class="sayrow"><div class="pa">${esc(pa)}</div>${canSpeak() ? `<button class="iconbtn" data-act="sayt" data-v="${esc(pa)}" aria-label="Play">${ICON.spk}</button>` : ""}</div>
    <div class="tr">${esc(tr)}</div>
    <p class="mean">${esc(mean[0].toUpperCase() + mean.slice(1))}</p>
    <p class="lit">Word for word: “${esc(lit)}”</p>${src ? `<p class="src">${esc(src)}</p>` : ""}</div>`;
}
function sayingsView() {
  const all = C.sayings.flatMap(g => g.items), today = all[Math.floor(Date.now() / 864e5) % all.length];
  const g = C.sayings[sayGroup] || C.sayings[0];
  return `<main class="home"><div class="col page">
    <div><p class="eyebrow">Saying of the day</p>${sayingCard(today, true)}</div>
    <div class="seg saytabs">${C.sayings.map((x, i) => `<button data-act="saygroup" data-v="${i}" aria-pressed="${x === g}">${esc(x.name)} <span class="pa">${esc(x.native)}</span></button>`).join("")}</div>
    <p class="note" style="margin:-6px 0 0">${esc(g.blurb)}</p>
    ${g.items.map(x => sayingCard(x)).join("")}
  </div></main>`;
}

/* ---------- stories ---------- */
const storyKey = st => C.id + ":" + st.id;
const storyOpen = () => true;
let R = null; // the story being read
function storiesView() {
  return `<main class="home"><div class="col page"><div class="cloth"><h2>Stories</h2><p class="note" style="margin:0">Short retellings of Punjabi folk tales. A new one opens as you climb the board. Tap any word for help.</p></div>
    ${C.stories.map((st, i) => { const open = storyOpen(st), done = S.stories?.[storyKey(st)];
      return `<button class="cloth storycard ${open ? "" : "locked"}" data-act="story" data-v="${i}" ${open ? "" : "disabled"}>
        <span class="storyart" style="--uc:${UNIT_COLORS[(i + 2) % UNIT_COLORS.length]}">${open ? `<span class="pa">${esc(st.native.split(" ")[0])}</span>` : ICON.lock}</span>
        <span class="storytxt"><b>${esc(st.title)}</b> <span class="pa">${esc(st.native)}</span><small>${open ? esc(st.blurb) : `Opens when you pass the Unit ${st.after} test`}</small></span>${done ? `<span class="storydone">${ICON.star}</span>` : ""}</button>`; }).join("")}
  </div></main>`;
}
const bare = w => w.replace(/[.,?!।:;"“”]/g, "");
function wordChip(w, i, tr) {
  return `<button class="sw" data-act="sw" data-v="${esc(bare(w))}" data-tr="${esc(bare(tr[i] || ""))}">${esc(w)}</button>`;
}
function readerView() {
  const st = R.st, shown = st.lines.slice(0, R.n);
  let body = shown.map((l, i) => `<div class="sline ${i === R.n - 1 ? "new" : ""}">
      <div class="pa">${l[0].split(" ").map((w, j) => wordChip(w, j, l[1].split(" "))).join(" ")}</div><div class="tr">${esc(l[1])}</div>
      ${R.en[i] ? `<div class="en">${esc(l[2])}</div>` : `<button class="linkbtn" data-act="sen" data-v="${i}">Show English</button>`}
      ${canSpeak() ? `<button class="iconbtn sline-spk" data-act="sayt" data-v="${esc(l[0])}" aria-label="Play line">${ICON.spk}</button>` : ""}</div>`).join("");
  let foot;
  if (R.n < st.lines.length) foot = `<button class="btn wide" data-act="snext">Continue</button>`;
  else if (R.q < st.quiz.length) {
    const q = st.quiz[R.q];
    R.opts = R.opts || shuffle([1, 2, 3]);
    body += `<div class="squiz"><p class="kicker" style="margin:0 0 12px">${esc(q[0])}</p><div class="opts">${R.opts.map(k => `<button class="opt ${R.pick == null ? "" : k === 1 ? "good" : R.pick === k ? "bad" : ""}" data-act="spick" data-v="${k}" ${R.pick == null ? "" : "disabled"}><span>${esc(q[k])}</span></button>`).join("")}</div></div>`;
    foot = R.pick == null ? `<p class="note" style="text-align:center;margin:0">Question ${R.q + 1} of ${st.quiz.length}</p>` : `<button class="btn wide ${R.pick === 1 ? "gold" : ""}" data-act="snextq">${R.q + 1 < st.quiz.length ? "Next question" : "Finish story"}</button>`;
  } else foot = "";
  const w = R.word && VOCAB.get(R.word), en = w ? w.en : C.glossary?.[R.word];
  const pop = R.word ? `<div class="wordpop" role="status"><span class="pa">${esc(R.word)}</span>${R.wtr && C.translit ? `<span class="tr">${esc(R.wtr)}</span>` : ""}${en ? `<span>${esc(en)}</span>` : `<span class="note">Tap “Show English” for the whole line.</span>`}
    <button class="iconbtn" data-act="swclose" aria-label="Close">${ICON.x}</button></div>` : "";
  return `<div class="lesson reader"><div class="col lhead"><button class="iconbtn" data-act="squit" aria-label="Close story">${ICON.x}</button>
    <div class="bar"><span style="width:${(R.n + R.q) / (st.lines.length + st.quiz.length) * 100}%"></span></div><span class="ptag">Story</span></div>
    <div class="col lbody"><h1 class="storytitle">${esc(st.native)}</h1><p class="note" style="margin:0 0 14px">${esc(st.title)}</p><div class="slines">${body}</div></div>
    ${pop}<footer class="lfoot"><div class="col">${foot}</div></footer></div>`;
}
function finishStory() {
  const st = R.st, t = dayKey(), first = !S.stories[storyKey(st)];
  S.stories[storyKey(st)] = true;
  const xp = first ? 20 : 5;
  S.xp += xp; S.hist[t] = (S.hist[t] || 0) + xp;
  if (S.lastDay !== t) { S.streak = S.lastDay === dayOff(-1) ? S.streak + 1 : 1; S.lastDay = t; }
  S.best = Math.max(S.best, S.streak); save(); sfx.done();
  toast(`Story finished: +${xp} XP`);
  nav(() => { R = null; view = "stories"; }, () => scrollTo(0, 0));
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
  if (view === "reader") h = readerView();
  else if (view === "lesson") h = lessonView();
  else if (view === "result") h = resultView();
  else {
    const body = view === "words" ? wordsView() : view === "stories" ? storiesView() : view === "sayings" ? sayingsView() : view === "alphabet" ? alphabetView() : view === "profile" ? profileView() : view === "courses" ? coursesView() : view === "editor" ? edView() : view === "guide" ? guideView() : homeView();
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
  festlesson: b => startRun("fest", { fest:FESTS.find(f => f.id === b.dataset.v) }),
  story: b => nav(() => { R = { st:C.stories[+b.dataset.v], n:1, q:0, en:{}, word:null, pick:null }; view = "reader"; }, () => { scrollTo(0, 0); say(R.st.lines[0][0]); }),
  snext: () => { R.n++; R.word = null; render(); say(R.st.lines[R.n - 1][0]); document.querySelector(".sline.new")?.scrollIntoView({ block:"center", behavior:calm() ? "auto" : "smooth" }); },
  sen: b => { R.en[+b.dataset.v] = true; render(); },
  sw: b => { R.word = b.dataset.v; R.wtr = b.dataset.tr; say(R.word); render(); },
  swclose: () => { R.word = null; render(); },
  spick: b => { R.pick = +b.dataset.v; R.pick === 1 ? sfx.good() : sfx.bad(); render(); },
  snextq: () => { R.q++; R.pick = null; R.opts = null; if (R.q >= R.st.quiz.length) finishStory(); else render(); },
  squit: () => nav(() => { R = null; view = "stories"; }, () => scrollTo(0, 0)),
  letter: b => {
    const id = b.dataset.v, [g, i] = id.split("-").map(Number), l = C.alphabet[g].letters[i];
    letterOpen = letterOpen === id ? null : id; render();
    if (letterOpen) { say(letterSay(l)); document.querySelector(".lettercard")?.scrollIntoView({ block:"nearest", behavior:calm() ? "auto" : "smooth" }); }
  },
  guide: b => nav(() => { guideUnit = +b.dataset.v; view = "guide"; sheet = null; }, () => scrollTo(0, 0)),
  vocab: b => { const s = SKILLS[+b.dataset.v]; view = "words"; sheet = null; render(); document.getElementById("sk-" + s.sid)?.scrollIntoView(); },
  say: () => say(cur().item.pa), slow: () => say(cur().item.pa, true), sayt: b => say(b.dataset.v), refreshapp: async () => {
    // Clear the offline copy and reload, for when an installed app is stuck on an old version. Progress is kept.
    try { for (const r of await navigator.serviceWorker?.getRegistrations?.() || []) await r.unregister(); for (const k of await caches.keys()) await caches.delete(k); } catch (e) {}
    location.replace(APP_URL + "?v=" + Date.now());
  },
  saygroup: b => { sayGroup = +b.dataset.v; render(); },
  pick: b => { const ex = cur(); L.sel = +b.dataset.v; if (ex.type === "rev") say(ex.opts[L.sel].pa); render(); },
  tok: b => { const ex = cur(); L.justTok = +b.dataset.v; L.sel = (L.sel || []).concat(+b.dataset.v); if (ex.dir === "pa") say(ex.bank[+b.dataset.v].t); render(); },
  untok: b => { L.justTok = null; L.sel = L.sel.filter(i => i !== +b.dataset.v); render(); },
  m: b => {
    const ex = cur(), i = +b.dataset.v;
    if (b.dataset.side === "l") { L.ml = i; say(ex.left[i].pa); } else L.mr = i;
    if (L.ml != null && L.mr != null) {
      if (ex.left[L.ml] === ex.right[L.mr]) { ex.done.push(ex.left[L.ml]); sfx.tap(); }
      else { ex.missed = (ex.missed || []).concat(ex.left[L.ml]); ex.bad = { l:L.ml, r:L.mr }; if (L.mode !== "test") L.mistakes++; sfx.bad(); setTimeout(() => { ex.bad = null; if (view === "lesson") render(); }, 450); }
      L.ml = L.mr = null;
      if (ex.done.length === ex.items.length) { L.state = "right"; L.solved++; sfx.good(); ex.items.forEach(x => record(x, !ex.missed?.includes(x))); }
    }
    render();
  },
  check, next,
  mic: () => listenToYou(),
  speakskip: () => skipSpeak(false),
  speakoff: () => skipSpeak(true),
  quit: () => nav(() => { L = null; view = "home"; }, scrollToCurrent),
  toggle: b => { const k = b.dataset.v; S[k] = !S[k]; save(); document.documentElement.classList.toggle("no-tr", !S.tr || !C.translit); render(); },
  festpick: b => { S.fest = b.dataset.v; save(); applyFestival(); render(); },
  script: b => { S.tr = b.dataset.v === "both"; save(); document.documentElement.classList.toggle("no-tr", !S.tr || !C.translit); render(); },
  goal: b => { S.goal = +b.dataset.v; save(); render(); },
  vsex: b => { S.vsex = b.dataset.v; save(); render(); say(sampleWord()); },
  reset: b => {
    if (!b.dataset.v) confirmReset = true;
    else { if (b.dataset.v === "yes") { const keep = { goal:S.goal, tr:S.tr, sfx:S.sfx, course:S.course, remind:S.remind }; S = { ...DEF, hist:{}, prog:{}, tests:{}, srs:{}, stories:{}, ...keep }; save(); toast("Progress reset"); } confirmReset = false; }
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
app.addEventListener("input", e => {
  if (ed && e.target.dataset.f) edInput(e.target);
  if (e.target.id === "dictin") { dictIn = e.target.value; document.getElementById("dictout").innerHTML = dictResult(); }
  if (e.target.id === "numin") { numIn = e.target.value.replace(/\D/g, "").slice(0, 4); if (e.target.value !== numIn) e.target.value = numIn; document.getElementById("numout").innerHTML = numResult(); }
});
app.addEventListener("change", e => {
  if (e.target.id === "importfile" && e.target.files[0]) { importCourse(e.target.files[0]); return; }
  if (e.target.dataset.act2 === "remind" && e.target.value) { S.remind = e.target.value; save(); }
  if (ed && e.target.dataset.f && (e.target.tagName === "SELECT" || e.target.type === "checkbox")) edInput(e.target);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && sheet !== null) { sheet = null; render(); return; }
  if (view === "reader" && e.key === "Enter") { e.preventDefault(); const b = document.querySelector('.reader .lfoot .btn'); b?.click(); return; }
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
    await Promise.all(list.map(async x => {
      const c = await (await fetch(x.file)).json(); builtin[c.id] = c;
      // "audio" is one folder, or { female, male } folders when the course is recorded in two voices.
      const sets = typeof x.audio === "string" ? { female:x.audio } : x.audio || {};
      for (const [sex, base] of Object.entries(sets)) fetch(base + "index.json").then(r => r.ok ? r.json() : null).then(a => { if (a) { AUDIO[c.id] = { ...AUDIO[c.id], [sex]:{ base, clips:a.clips } }; if (view === "profile") render(); } }).catch(() => {});
    }));
  } catch (e) {
    app.innerHTML = `<p class="loading">Couldn't load the course. Check your connection and reload.</p>`; return;
  }
  useCourse(S.course); applyFestival();
  render(); scrollToCurrent();
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    // When a new version takes over, reload once so the update shows without a second restart.
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (had && !window.__reloaded) { window.__reloaded = true; location.reload(); } });
    navigator.serviceWorker.register("sw.js", { updateViaCache:"none" }).then(r => r.update()).catch(() => {});
  }
})();
