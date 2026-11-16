// GabouLearn — serveur local : sert tout le site + le jeu multijoueur « Gabou Droit ».
// Sans dépendance (Node >= 18). Lancer depuis la racine du dépôt : npm start  → http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const COURSE_DIR = path.join(__dirname, '..', 'cours', 'r3-11-droit-du-numerique');
const C = require(path.join(COURSE_DIR, 'donnees.js'));
const CG = require(path.join(COURSE_DIR, 'cas.js'));

const PORT = Number(process.env.PORT) || 3000;

// ---------------------------------------------------------------- réglages

const ROUNDS = ['quiz', 'vf', 'cas', 'num', 'plaid'];
const ROUND_INFO = {
  quiz: { title: 'Le Quiz du Code', emoji: '📖', desc: 'Questions à choix multiples. Bonne réponse = 500 points + un bonus de rapidité.' },
  vf: { title: 'Vrai ou Faux éclair', emoji: '⚡', desc: '10 secondes par affirmation. Juste et rapide = jusqu\'à 600 points.' },
  cas: { title: 'Qualifiez l\'affaire', emoji: '🔎', desc: 'Un cas pratique, une qualification juridique. Prenez le temps de lire : 30 secondes.' },
  num: { title: 'Le Juste Chiffre', emoji: '🔢', desc: 'Délais, montants, années… Réponse exacte = 600 points, la plus proche = 250.' },
  plaid: { title: 'La Plaidoirie', emoji: '⚖️', desc: 'Un cas pratique généré au hasard. Rédigez votre réponse : elle est notée automatiquement par notions clés (jusqu\'à 500 points), puis l\'assemblée vote (+200 par voix). Corrigé à la fin.' },
};
const COUNTS = { quiz: 6, vf: 6, cas: 4, num: 4 };
const MS = { quiz: 20000, vf: 10000, cas: 30000, num: 25000, write: 300000, vote: 60000 };
const BASE = { quiz: 500, vf: 300, cas: 500 };

// ---------------------------------------------------------------- utilitaires

const rooms = new Map();
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

function newCode() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c;
  do { c = Array.from({ length: 4 }, () => L[crypto.randomInt(L.length)]).join(''); } while (rooms.has(c));
  return c;
}

const connected = (room) => [...room.players.values()].filter((p) => room.streams.get(p.id)?.size);

function pool(room, list, n) {
  const themed = list.filter((x) => room.themes.includes(x.t));
  const src = themed.length ? themed : list;
  return shuffle(src).slice(0, n);
}

function setPhase(room, phase, data = {}, ms = 0, onTimeout = null) {
  clearTimeout(room.timer);
  room.phase = phase;
  room.data = data;
  room.deadline = ms ? Date.now() + ms : 0;
  room.step = (room.step || 0) + 1;
  if (ms && onTimeout) room.timer = setTimeout(() => { onTimeout(); broadcast(room); }, ms);
  broadcast(room);
}

function addScore(room, pid, pts) { const p = room.players.get(pid); if (p) p.score = Math.max(0, p.score + pts); }
function addMiss(room, pid, entry) { const p = room.players.get(pid); if (p) p.misses.push(entry); }

// ---------------------------------------------------------------- vue par joueur

function viewFor(room, pid) {
  const d = room.data || {};
  const done = doneSet(room);
  const me = room.players.get(pid);
  const v = {
    code: room.code, me: pid, hostId: room.hostId, phase: room.phase, step: room.step,
    deadline: room.deadline, serverNow: Date.now(),
    roundIndex: room.ri, roundCount: ROUNDS.length,
    themes: room.themes, allThemes: C.THEMES,
    players: [...room.players.values()].map((p) => ({
      id: p.id, name: p.name, avatar: p.avatar, score: p.score,
      online: !!room.streams.get(p.id)?.size, done: done.has(p.id),
    })),
    d: {},
  };
  switch (room.phase) {
    case 'intro': v.d = { ...ROUND_INFO[ROUNDS[room.ri]], key: ROUNDS[room.ri] }; break;
    case 'mcq_q': v.d = { kind: d.kind, n: d.i + 1, total: d.items.length, context: d.cur.context, q: d.cur.q, choices: d.cur.choices, mine: d.answers[pid]?.c ?? null, theme: C.THEMES[d.cur.t] }; break;
    case 'mcq_r': v.d = { kind: d.kind, n: d.i + 1, total: d.items.length, context: d.cur.context, q: d.cur.q, choices: d.cur.choices, correct: d.cur.correct, ex: d.cur.ex, mine: d.answers[pid]?.c ?? null, gains: d.gains, counts: d.counts, theme: C.THEMES[d.cur.t] }; break;
    case 'num_q': v.d = { n: d.i + 1, total: d.items.length, q: d.cur.q, unit: d.cur.unit, mine: d.answers[pid] ?? null, theme: C.THEMES[d.cur.t] }; break;
    case 'num_r': v.d = { n: d.i + 1, total: d.items.length, q: d.cur.q, unit: d.cur.unit, a: d.cur.a, ex: d.cur.ex, rows: d.rows }; break;
    case 'write': v.d = { prompt: d.plaid.prompt, mine: d.texts[pid] ?? null }; break;
    case 'vote': v.d = { prompt: d.plaid.prompt, entries: d.entries.map((e) => ({ id: e.id, text: e.text, own: e.author === pid })), mine: d.votes[pid] ?? null }; break;
    case 'vote_r': v.d = { prompt: d.plaid.prompt, model: d.plaid.model, results: d.results, note: d.note || null }; break;
    case 'final': v.d = {
      ranking: [...room.players.values()].sort((a, b) => b.score - a.score).map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score, good: p.good, asked: p.asked })),
      misses: me ? me.misses : [],
    }; break;
  }
  return v;
}

function doneSet(room) {
  const d = room.data || {};
  const s = new Set();
  const add = (obj) => obj && Object.keys(obj).forEach((k) => s.add(k));
  if (room.phase === 'mcq_q' || room.phase === 'num_q') add(d.answers);
  else if (room.phase === 'write') add(d.texts);
  else if (room.phase === 'vote') add(d.votes);
  return s;
}

function broadcast(room) {
  for (const [pid, set] of room.streams) {
    const msg = `data: ${JSON.stringify(viewFor(room, pid))}\n\n`;
    for (const res of set) res.write(msg);
  }
}

function fx(room, payload) {
  const msg = `event: fx\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const set of room.streams.values()) for (const res of set) res.write(msg);
}

function everyoneDone(room) {
  const done = doneSet(room);
  const on = connected(room);
  return on.length > 0 && on.every((p) => done.has(p.id));
}

// ---------------------------------------------------------------- déroulement

function startGame(room) {
  for (const p of room.players.values()) { p.score = 0; p.misses = []; p.good = 0; p.asked = 0; }
  room.ri = -1;
  nextRound(room);
}

function nextRound(room) {
  room.ri++;
  if (room.ri >= ROUNDS.length) return setPhase(room, 'final');
  setPhase(room, 'intro');
}

function beginRound(room) {
  const r = ROUNDS[room.ri];
  if (r === 'quiz') askMcq(room, 'quiz', pool(room, C.QUIZ, COUNTS.quiz), 0);
  else if (r === 'vf') askMcq(room, 'vf', pool(room, C.VRAIFAUX, COUNTS.vf), 0);
  else if (r === 'cas') askMcq(room, 'cas', pool(room, C.CASES, COUNTS.cas), 0);
  else if (r === 'num') askNum(room, pool(room, C.NUMBERS, COUNTS.num), 0);
  else if (r === 'plaid') {
    const kase = CG.generate(room.themes);
    setPhase(room, 'write', { plaid: { prompt: kase.facts + '\n\n' + kase.question, model: kase.model, title: kase.title, kase }, texts: {} }, MS.write, () => startVote(room));
  }
}

// --- QCM générique (quiz, vrai/faux, cas pratiques)
function buildMcq(kind, raw) {
  if (kind === 'vf') return { t: raw.t, q: raw.s, choices: ['Vrai', 'Faux'], correct: raw.v ? 0 : 1, ex: raw.ex };
  const order = shuffle(raw.choices.map((_, i) => i));
  return { t: raw.t, context: raw.c || null, q: raw.q, choices: order.map((i) => raw.choices[i]), correct: order.indexOf(0), ex: raw.ex };
}

function askMcq(room, kind, items, i) {
  const cur = buildMcq(kind, items[i]);
  setPhase(room, 'mcq_q', { kind, items, i, cur, answers: {}, start: Date.now() }, MS[kind], () => revealMcq(room));
}

function revealMcq(room) {
  const d = room.data;
  const limit = MS[d.kind];
  const gains = {}, counts = d.cur.choices.map(() => 0);
  for (const p of room.players.values()) {
    const a = d.answers[p.id];
    p.asked++;
    if (a) counts[a.c]++;
    if (a && a.c === d.cur.correct) {
      const pts = BASE[d.kind] + Math.round(BASE[d.kind] * Math.max(0, limit - a.t) / limit);
      gains[p.id] = pts; addScore(room, p.id, pts); p.good++;
    } else {
      addMiss(room, p.id, { q: (d.cur.context ? d.cur.context + ' — ' : '') + d.cur.q, answer: d.cur.choices[d.cur.correct], ex: d.cur.ex });
    }
  }
  setPhase(room, 'mcq_r', { ...d, gains, counts });
}

// --- Juste chiffre
function askNum(room, items, i) {
  setPhase(room, 'num_q', { items, i, cur: items[i], answers: {} }, MS.num, () => revealNum(room));
}

function revealNum(room) {
  const d = room.data;
  const a = d.cur.a;
  const entries = Object.entries(d.answers);
  const bestGap = entries.filter(([, g]) => g !== a).reduce((m, [, g]) => Math.min(m, Math.abs(g - a)), Infinity);
  const rows = [];
  for (const p of room.players.values()) {
    const g = d.answers[p.id];
    p.asked++;
    let pts = 0;
    if (g === a) { pts = 600; p.good++; }
    else if (g != null && Math.abs(g - a) === bestGap) pts = 250;
    if (g !== a) addMiss(room, p.id, { q: d.cur.q, answer: `${a.toLocaleString('fr-FR')} ${d.cur.unit}`.trim(), ex: d.cur.ex });
    if (pts) addScore(room, p.id, pts);
    rows.push({ id: p.id, guess: g ?? null, pts });
  }
  rows.sort((x, y) => (x.guess == null) - (y.guess == null) || Math.abs((x.guess ?? 0) - a) - Math.abs((y.guess ?? 0) - a));
  setPhase(room, 'num_r', { ...d, rows });
}

// --- Plaidoirie
function startVote(room) {
  const d = room.data;
  const entries = shuffle(Object.entries(d.texts).filter(([, t]) => t).map(([author, text]) => ({ id: crypto.randomBytes(4).toString('hex'), author, text })));
  if (entries.length < 2) return voteResult(room, entries, {}, 'Pas assez de plaidoiries pour voter. Voici le corrigé.');
  setPhase(room, 'vote', { plaid: d.plaid, entries, votes: {} }, MS.vote, () => voteResult(room));
}

function voteResult(room, entries, votes, note) {
  const d = room.data;
  entries = entries || d.entries; votes = votes || d.votes;
  const tally = {};
  for (const eid of Object.values(votes)) tally[eid] = (tally[eid] || 0) + 1;
  const results = entries.map((e) => {
    const n = tally[e.id] || 0;
    const sc = CG.score(e.text, d.plaid.kase);
    const pts = n * 200 + Math.round(sc.pct * 5);
    addScore(room, e.author, pts);
    return { text: e.text, author: e.author, votes: n, pct: sc.pct, missing: sc.missing, pts };
  }).sort((a, b) => b.pts - a.pts);
  setPhase(room, 'vote_r', { plaid: d.plaid, results, note });
}

// ---------------------------------------------------------------- actions

function act(room, pid, type, p = {}) {
  const isHost = pid === room.hostId;
  const d = room.data || {};
  switch (type) {
    case 'themes': {
      if (!isHost || room.phase !== 'lobby' || !Array.isArray(p.themes)) return;
      const t = p.themes.filter((x) => x in C.THEMES);
      if (t.length) room.themes = t;
      break;
    }
    case 'start':
      if (isHost && room.phase === 'lobby' && room.players.size >= 2) startGame(room);
      return;
    case 'continue':
      if (!isHost) return;
      if (room.phase === 'intro') beginRound(room);
      else if (room.phase === 'mcq_r') d.i + 1 < d.items.length ? askMcq(room, d.kind, d.items, d.i + 1) : nextRound(room);
      else if (room.phase === 'num_r') d.i + 1 < d.items.length ? askNum(room, d.items, d.i + 1) : nextRound(room);
      else if (room.phase === 'vote_r') nextRound(room);
      else if (room.phase === 'mcq_q') revealMcq(room);
      else if (room.phase === 'num_q') revealNum(room);
      else if (room.phase === 'write') startVote(room);
      else if (room.phase === 'vote') voteResult(room);
      return;
    case 'restart':
      if (isHost && room.phase === 'final') { room.ri = -1; setPhase(room, 'lobby'); }
      return;
    case 'answer': {
      const c = Number(p.c);
      if (room.phase !== 'mcq_q' || d.answers[pid] || !(Number.isInteger(c) && c >= 0 && c < d.cur.choices.length)) return;
      d.answers[pid] = { c, t: Date.now() - d.start };
      if (everyoneDone(room)) return revealMcq(room);
      break;
    }
    case 'number': {
      const n = Number(String(p.n).replace(/\s/g, '').replace(',', '.'));
      if (room.phase !== 'num_q' || d.answers[pid] != null || !Number.isFinite(n) || Math.abs(n) > 1e9) return;
      d.answers[pid] = n;
      if (everyoneDone(room)) return revealNum(room);
      break;
    }
    case 'submit': {
      const t = clean(p.text, 2000);
      if (room.phase !== 'write' || !t || d.texts[pid]) return;
      d.texts[pid] = t;
      if (everyoneDone(room)) return startVote(room);
      break;
    }
    case 'vote': {
      if (room.phase !== 'vote' || d.votes[pid]) return;
      const e = d.entries.find((x) => x.id === p.id);
      if (!e || e.author === pid) return;
      d.votes[pid] = e.id;
      const on = connected(room).filter((pl) => d.entries.some((x) => x.author !== pl.id));
      if (on.every((pl) => d.votes[pl.id])) return voteResult(room);
      break;
    }
    case 'react': {
      const allowed = ['⚖️', '📖', '🔥', '🤯', '😬', '👏', '☕'];
      const pl = room.players.get(pid);
      if (!pl || Date.now() - (pl.lastReact || 0) < 600) return;
      pl.lastReact = Date.now();
      if (allowed.includes(p.e)) fx(room, { kind: 'react', id: pid, e: p.e });
      return;
    }
    default: return;
  }
  broadcast(room);
}

// ---------------------------------------------------------------- HTTP + protections anti-abus

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2',
};

// En-têtes de sécurité envoyés sur toutes les réponses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

// Limiteur à jetons : `rate` requêtes par seconde en moyenne, avec une rafale de `burst`.
const buckets = [];
function limiter(rate, burst) {
  const m = new Map();
  buckets.push(m);
  return (key) => {
    const now = Date.now();
    let b = m.get(key);
    if (!b) { b = { t: burst, ts: now }; m.set(key, b); }
    b.t = Math.min(burst, b.t + ((now - b.ts) / 1000) * rate);
    b.ts = now;
    if (b.t < 1) return false;
    b.t -= 1;
    return true;
  };
}
const LIMIT = {
  any: limiter(30, 80),         // toutes requêtes, par IP
  api: limiter(8, 25),          // actions de jeu, par IP
  create: limiter(1 / 10, 5),   // création de salles : ~6 par minute, par IP
  join: limiter(0.5, 10),       // tentatives pour rejoindre (devinette de codes), par IP
};
const MAX_ROOMS = 300;
const MAX_STREAMS_PER_IP = 12;
const MAX_STREAMS = 2000;
const MAX_BODY = 20000;
const streamsByIp = new Map();
let totalStreams = 0;

const ipOf = (req) => (req.socket.remoteAddress || '?').replace(/^::ffff:/, '');

function send(res, code, headers, body) {
  res.writeHead(code, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}
function json(res, code, obj, extra = {}) { send(res, code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }, JSON.stringify(obj)); }
function tooMany(res) { json(res, 429, { error: 'Trop de requêtes. Patientez quelques secondes.' }, { 'Retry-After': '5' }); }

function readBody(req) {
  return new Promise((resolve) => {
    let b = '', done = false;
    req.on('data', (c) => {
      if (done) return;
      b += c;
      if (b.length > MAX_BODY) { done = true; b = ''; req.pause(); resolve(null); }
    });
    req.on('end', () => { if (done) return; done = true; try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
    req.on('error', () => { if (!done) { done = true; resolve(null); } });
  });
}

function joinRoom(room, pid, name, avatar) {
  let p = room.players.get(pid);
  if (!p) {
    if (room.players.size >= 16) return 'Salle pleine (16 joueurs maximum).';
    p = { id: pid, name, avatar, score: 0, misses: [], good: 0, asked: 0 };
    room.players.set(pid, p);
  } else { p.name = name; p.avatar = avatar; }
  if (!room.hostId || !room.players.has(room.hostId)) room.hostId = pid;
  return null;
}

async function handleApi(req, res, url, ip) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Méthode non autorisée.' }, { Allow: 'POST' });
  if (!LIMIT.api(ip)) return tooMany(res);
  const body = await readBody(req);
  if (body === null) {
    res.on('finish', () => req.destroy());
    return json(res, 413, { error: 'Requête trop volumineuse.' }, { Connection: 'close' });
  }
  if (typeof body !== 'object' || Array.isArray(body)) return json(res, 400, { error: 'Requête invalide.' });
  const pid = clean(body.pid, 40);
  if (!/^[a-zA-Z0-9-]{8,40}$/.test(pid)) return json(res, 400, { error: 'Identifiant invalide.' });

  if (url.pathname === '/api/create' || url.pathname === '/api/join') {
    const name = clean(body.name, 18) || 'Joueur';
    const avatar = clean(body.avatar, 8) || '⚖️';
    let room;
    if (url.pathname === '/api/create') {
      if (!LIMIT.create(ip)) return json(res, 429, { error: 'Trop de salles créées. Réessayez dans une minute.' }, { 'Retry-After': '60' });
      if (rooms.size >= MAX_ROOMS) return json(res, 503, { error: 'Le serveur est plein. Réessayez plus tard.' });
      room = { code: newCode(), players: new Map(), streams: new Map(), hostId: null, phase: 'lobby', data: {}, ri: -1, step: 0, lastSeen: Date.now(), themes: Object.keys(C.THEMES) };
      rooms.set(room.code, room);
    } else {
      if (!LIMIT.join(ip)) return json(res, 429, { error: 'Trop de tentatives. Réessayez dans quelques secondes.' }, { 'Retry-After': '10' });
      room = rooms.get(clean(body.code, 4).toUpperCase());
      if (!room) return json(res, 404, { error: 'Aucune salle avec ce code.' });
      if (room.phase !== 'lobby' && !room.players.has(pid)) return json(res, 409, { error: 'La partie a déjà commencé. Attendez la prochaine !' });
    }
    const err = joinRoom(room, pid, name, avatar);
    if (err) return json(res, 409, { error: err });
    broadcast(room);
    return json(res, 200, { code: room.code });
  }

  if (url.pathname === '/api/action') {
    const room = rooms.get(clean(body.code, 4).toUpperCase());
    if (!room || !room.players.has(pid)) return json(res, 404, { error: 'Salle introuvable.' });
    const payload = body.payload && typeof body.payload === 'object' ? body.payload : {};
    act(room, pid, clean(body.type, 20), payload);
    return json(res, 200, { ok: true });
  }

  if (url.pathname === '/api/leave') {
    const room = rooms.get(clean(body.code, 4).toUpperCase());
    if (room && room.players.has(pid)) {
      room.players.delete(pid);
      if (room.hostId === pid) room.hostId = connected(room)[0]?.id || [...room.players.keys()][0] || null;
      broadcast(room);
    }
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: 'Inconnu.' });
}

function handleEvents(req, res, url, ip) {
  const room = rooms.get((url.searchParams.get('code') || '').toUpperCase());
  const pid = url.searchParams.get('pid') || '';
  if (!room || !room.players.has(pid)) return send(res, 404, {}, '');
  const mine = streamsByIp.get(ip) || 0;
  if (mine >= MAX_STREAMS_PER_IP || totalStreams >= MAX_STREAMS || (room.streams.get(pid)?.size || 0) >= 3) return tooMany(res);
  streamsByIp.set(ip, mine + 1); totalStreams++;
  res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.write('retry: 2000\n\n');
  if (!room.streams.has(pid)) room.streams.set(pid, new Set());
  room.streams.get(pid).add(res);
  room.lastSeen = Date.now();
  broadcast(room);
  req.on('close', () => {
    totalStreams--;
    const n = (streamsByIp.get(ip) || 1) - 1;
    if (n <= 0) streamsByIp.delete(ip); else streamsByIp.set(ip, n);
    const set = room.streams.get(pid);
    set?.delete(res);
    if (set && !set.size) {
      room.streams.delete(pid);
      if (room.hostId === pid && connected(room).length) room.hostId = connected(room)[0].id;
      setTimeout(() => {
        if (room.phase === 'lobby' && !room.streams.get(pid)?.size && room.players.has(pid)) {
          room.players.delete(pid);
          if (room.hostId === pid) room.hostId = connected(room)[0]?.id || null;
          broadcast(room);
        }
      }, 20000);
      broadcast(room);
    }
  });
}

// Fichiers statiques : tout le site (racine du dépôt), sauf fichiers cachés et dépendances
const ROOT = path.join(__dirname, '..');
function handleStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { Allow: 'GET, HEAD' }, '');
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, {}, ''); }
  if (rel.includes('\0') || rel.split('/').some((seg) => seg.startsWith('.') || seg === 'node_modules')) return send(res, 404, {}, 'Introuvable.');
  let full = path.normalize(path.join(ROOT, rel));
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return send(res, 403, {}, '');
  fs.stat(full, (err, st) => {
    if (!err && st.isDirectory()) {
      if (!url.pathname.endsWith('/')) return send(res, 301, { Location: url.pathname + '/' + url.search }, '');
      full = path.join(full, 'index.html');
    }
    fs.readFile(full, (e2, buf) => {
      if (e2) return fs.readFile(path.join(ROOT, '404.html'), (e3, b404) => send(res, 404, { 'Content-Type': 'text/html; charset=utf-8' }, e3 ? 'Introuvable.' : b404));
      send(res, 200, { 'Content-Type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' }, req.method === 'HEAD' ? undefined : buf);
    });
  });
}

const server = http.createServer((req, res) => {
  const ip = ipOf(req);
  if (!LIMIT.any(ip)) return tooMany(res);
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { return send(res, 400, {}, ''); }
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url, ip).catch(() => json(res, 500, { error: 'Erreur serveur.' }));
  if (url.pathname === '/events') return handleEvents(req, res, url, ip);
  return handleStatic(req, res, url);
});

// Protection contre les connexions lentes (slowloris) et le trop-plein de connexions
server.headersTimeout = 10000;
server.requestTimeout = 15000;
server.keepAliveTimeout = 5000;
server.maxHeadersCount = 60;
server.maxConnections = 3000;
server.on('clientError', (err, socket) => { if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'); });

setInterval(() => {
  for (const [code, room] of rooms) {
    for (const set of room.streams.values()) for (const res of set) res.write(': ping\n\n');
    if (room.streams.size) room.lastSeen = Date.now();
    else if (Date.now() - room.lastSeen > 30 * 60 * 1000) { clearTimeout(room.timer); rooms.delete(code); }
  }
  // ménage des compteurs de limitation inactifs depuis 10 minutes
  const old = Date.now() - 10 * 60 * 1000;
  for (const m of buckets) for (const [k, b] of m) if (b.ts < old) m.delete(k);
}, 15000);

server.listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
  console.log('\n  📚 GabouLearn est lancé (site + jeu multijoueur) !\n');
  console.log(`  Sur cet ordinateur :   http://localhost:${PORT}`);
  for (const ip of ips) console.log(`  Sur le réseau local :  http://${ip}:${PORT}/jeu/`);
  console.log('\n  Ctrl+C pour arrêter.\n');
});
