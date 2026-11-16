// GabouLearn — jeu multijoueur (client). Nécessite le serveur Node : npm start
const $app = document.getElementById('app');
const $top = document.getElementById('top');
const $reacts = document.getElementById('reacts');

const AVATARS = ['⚖️', '📜', '🧑‍⚖️', '🔏', '🛡️', '📚', '🦉', '🍪', '🤖', '💼', '🏛️', '☕'];
const REACTS = ['⚖️', '📖', '🔥', '🤯', '😬', '👏', '☕'];

const store = {
  get(k) { try { return sessionStorage.getItem(k) || localStorage.getItem(k); } catch { return null; } },
  set(k, v, perTab) { try { (perTab ? sessionStorage : localStorage).setItem(k, v); } catch {} },
  del(k) { try { sessionStorage.removeItem(k); } catch {} },
};

// un identifiant par onglet : permet de jouer à plusieurs dans le même navigateur
let pid = null;
try { pid = sessionStorage.getItem('gd-pid'); } catch {}
if (!pid) { pid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()); store.set('gd-pid', pid, true); }

let code = null;
try { code = sessionStorage.getItem('gd-code'); } catch {}
let S = null, es = null, lastKey = '', offset = 0, joinError = '';

// ------------------------------------------------------------ helpers

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const player = (id) => S?.players.find((p) => p.id === id) || { name: '???', avatar: '❔' };
const who = (id) => { const p = player(id); return `${p.avatar} ${p.name}`; };
const isHost = () => S && S.hostId === pid;
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('fr-FR'));

async function api(path, body) {
  const r = await fetch('/api/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid, ...body }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Erreur');
  return j;
}
let lastSend = 0;
const send = (type, payload) => {
  const now = Date.now();
  if (type === 'react' && now - lastSend < 600) return Promise.resolve();
  lastSend = now;
  return api('action', { code, type, payload }).catch((e) => toast(e.message));
};

function toast(msg, ms = 2600) {
  const t = h('div', { class: 'toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}

// ------------------------------------------------------------ connexion

function connect() {
  if (es) es.close();
  es = new EventSource(`/events?code=${encodeURIComponent(code)}&pid=${encodeURIComponent(pid)}`);
  es.onmessage = (e) => { S = JSON.parse(e.data); offset = S.serverNow - Date.now(); render(); };
  es.addEventListener('fx', (e) => onFx(JSON.parse(e.data)));
  es.onerror = () => {
    if (es.readyState === EventSource.CLOSED) {
      es = null; S = null; code = null; store.del('gd-code');
      joinError = 'La salle n\'existe plus (serveur redémarré ?). Créez-en une nouvelle.';
      render();
    }
  };
}

function onFx(f) {
  if (f.kind === 'react') {
    const el = h('div', { class: 'float', style: `left:${8 + Math.random() * 80}%` }, f.e, h('small', {}, player(f.id).name));
    document.body.append(el);
    setTimeout(() => el.remove(), 2700);
  }
}

// ------------------------------------------------------------ rendu

function render() {
  if (!S) { $top.replaceChildren(); $reacts.replaceChildren(); lastKey = ''; return renderJoin(); }
  renderTop();
  const me = S.players.find((p) => p.id === pid);
  const lobbyish = S.phase === 'lobby' || S.phase === 'final';
  const key = [S.phase, S.step, S.hostId, me?.done, lobbyish ? JSON.stringify([S.players.map((p) => [p.id, p.name, p.online, p.score]), S.themes]) : ''].join('|');
  if (key === lastKey) return;
  lastKey = key;
  const fn = SCREENS[S.phase] || (() => h('div', {}, 'Phase inconnue'));
  $app.replaceChildren(fn(S.d || {}));
  if (!$reacts.childElementCount) {
    $reacts.append(h('div', { class: 'reacts' }, REACTS.map((e) => h('button', { onclick: () => send('react', { e }), title: 'Réagir' }, e))));
  }
}

function renderTop() {
  const round = S.roundIndex >= 0 && S.phase !== 'lobby' && S.phase !== 'final' ? `Épreuve ${S.roundIndex + 1}/${S.roundCount}` : 'Gabou Droit';
  $top.replaceChildren(h('div', { class: 'top' }, h('div', { class: 'top-inner' },
    h('div', { class: 'top-line' },
      h('span', {}, '⚖️ ', round),
      h('span', { class: 'code', title: 'Code de la salle' }, S.code),
      h('span', { class: 'timer', id: 'timer' })),
    h('div', { class: 'bar' }, h('div', { id: 'tbar', style: 'width:0' })),
    h('div', { class: 'strip' }, [...S.players].sort((a, b) => b.score - a.score).map((p) =>
      h('div', { class: `chip${p.online ? '' : ' off'}${p.done ? ' done' : ''}${p.id === pid ? ' me' : ''}`, title: p.name },
        h('span', { class: 'av' }, p.avatar), h('span', {}, p.name, p.id === S.hostId ? ' 👑' : ''), h('b', {}, ' ', fmt(p.score))))))));
  tick();
}

let total = {};
function tick() {
  const t = document.getElementById('timer'), bar = document.getElementById('tbar');
  if (!t || !S) return;
  if (!S.deadline) { t.textContent = ''; bar.style.width = '0'; return; }
  const left = Math.max(0, S.deadline - (Date.now() + offset));
  const k = S.step;
  if (!total[k]) total = { [k]: left || 1 };
  t.textContent = Math.ceil(left / 1000) + 's';
  t.classList.toggle('low', left < 5000);
  bar.style.width = (100 * left / total[k]) + '%';
}
setInterval(tick, 200);

function hostNext(label = 'Continuer') {
  if (isHost()) return h('button', { class: 'btn block', style: 'margin-top:12px', onclick: () => send('continue') }, label);
  return h('p', { class: 'muted center' }, `${who(S.hostId)} va continuer…`);
}
function hostSkip() {
  return isHost() ? h('p', { class: 'center' }, h('button', { class: 'btn alt', onclick: () => send('continue') }, 'Passer ⏭ (hôte)')) : null;
}
function waiting(text = 'Réponse envoyée. On attend les autres…') {
  const n = S.players.filter((p) => p.online && !p.done).length;
  return h('p', { class: 'muted center' }, text, n ? ` (${n} en réflexion)` : '');
}
const explain = (txt) => h('div', { class: 'explain' }, '📌 ', txt);

// ------------------------------------------------------------ accueil

const STATIC_HOST = /github\.io$/i.test(location.hostname) || location.protocol === 'file:';
function renderJoin() {
  if (STATIC_HOST) {
    $app.replaceChildren(h('div', { class: 'card center', style: 'margin-top:24px' },
      h('div', { class: 'big-emoji' }, '🎮'),
      h('h1', { class: 'title' }, 'Jeu multijoueur'),
      h('p', {}, 'Le jeu a besoin d\'un petit serveur : il ne fonctionne pas sur la version en ligne du site.'),
      h('p', {}, 'Pour jouer entre amis sur le même Wi-Fi : téléchargez le dépôt, installez Node.js (18 ou plus), puis lancez ', h('code', {}, 'npm start'), ' et ouvrez l\'adresse affichée.'),
      h('p', {}, h('a', { href: '../' }, '← Retour aux matières'))));
    return;
  }
  const params = new URLSearchParams(location.search);
  let avatar = store.get('gd-avatar') || AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const name = h('input', { type: 'text', maxlength: 18, placeholder: 'Ex. Maître Gabou', value: store.get('gd-name') || '' });
  const codeIn = h('input', { type: 'text', maxlength: 4, placeholder: 'ABCD', value: params.get('code') || '', style: 'text-transform:uppercase;letter-spacing:.2em' });
  const err = h('p', { class: 'err' }, joinError);
  const avs = h('div', { class: 'avatars' }, AVATARS.map((a) => h('button', { class: a === avatar ? 'on' : '', onclick: (e) => {
    avatar = a; avs.querySelectorAll('button').forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on');
  } }, a)));

  async function go(kind) {
    const n = name.value.trim();
    if (!n) { err.textContent = 'Indiquez votre nom.'; name.focus(); return; }
    store.set('gd-name', n); store.set('gd-avatar', avatar);
    try {
      const r = await api(kind, { name: n, avatar, code: codeIn.value.trim().toUpperCase() });
      code = r.code; store.set('gd-code', code, true); joinError = '';
      history.replaceState(null, '', '/jeu/?code=' + code);
      connect();
    } catch (e) { err.textContent = e.message; }
  }

  $app.replaceChildren(
    h('div', { class: 'center', style: 'padding-top:24px' },
      h('div', { class: 'big-emoji' }, '⚖️'),
      h('h1', { class: 'title' }, 'Gabou Droit'),
      h('p', { class: 'muted' }, 'Révisez le R3.11 Droit du numérique à plusieurs : contrats, numérique, RGPD, IA Act, contrat de travail.')),
    h('div', { class: 'card' },
      h('label', {}, 'Votre nom'), name,
      h('label', {}, 'Votre avatar'), avs,
      h('label', {}, 'Code de salle (pour rejoindre)'), codeIn,
      err,
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => go('join') }, 'Rejoindre'),
        h('button', { class: 'btn alt', onclick: () => go('create') }, 'Créer une salle'))),
    h('p', { class: 'center' }, h('a', { href: '/cours/r3-11-droit-du-numerique/' }, '📖 Fiche de révision du cours')),
  );
  name.focus();
}

// ------------------------------------------------------------ écrans de jeu

const SCREENS = {
  lobby() {
    const link = `${location.origin}/?code=${S.code}`;
    const themeBox = h('div', { class: 'themes' }, Object.entries(S.allThemes).map(([k, label]) => {
      const box = h('input', { type: 'checkbox', checked: S.themes.includes(k), disabled: !isHost() });
      box.addEventListener('change', () => {
        const sel = [...themeBox.querySelectorAll('input')].map((b, i) => b.checked && Object.keys(S.allThemes)[i]).filter(Boolean);
        if (!sel.length) { box.checked = true; toast('Gardez au moins un chapitre.'); return; }
        send('themes', { themes: sel });
      });
      return h('label', {}, box, label);
    }));
    return h('div', {},
      h('div', { class: 'card center' },
        h('p', { class: 'muted' }, 'Code de la salle'),
        h('div', { class: 'title', style: 'letter-spacing:.3em;font-size:3rem' }, S.code),
        h('p', { class: 'muted' }, 'Les autres joueurs ouvrent : ', h('b', {}, link)),
        h('button', { class: 'btn alt', onclick: () => navigator.clipboard?.writeText(link).then(() => toast('Lien copié')) }, 'Copier le lien')),
      h('div', { class: 'card' },
        h('h3', {}, 'Chapitres révisés'),
        isHost() ? null : h('p', { class: 'muted' }, 'Choisis par l\'hôte.'),
        themeBox),
      h('div', { class: 'card' },
        h('h3', {}, `Joueurs (${S.players.length})`),
        S.players.map((p) => h('div', { class: 'res' }, h('span', { class: 'rank' }, p.avatar, ' ', p.name, p.id === S.hostId ? ' 👑' : '', p.id === pid ? ' (vous)' : ''), h('span', { class: 'muted' }, p.online ? 'présent' : 'hors ligne')))),
      isHost()
        ? h('button', { class: 'btn block', disabled: S.players.length < 2, onclick: () => send('start') }, S.players.length < 2 ? 'Il faut au moins 2 joueurs' : 'Commencer la partie ⚖️')
        : h('p', { class: 'muted center' }, `En attente de ${who(S.hostId)} pour commencer.`),
      h('p', { class: 'center' }, h('a', { href: '/cours/r3-11-droit-du-numerique/', target: '_blank' }, '📖 Fiche de révision'), ' · ',
        h('a', { href: '#', onclick: (e) => { e.preventDefault(); api('leave', { code }).finally(() => { es?.close(); es = null; S = null; code = null; store.del('gd-code'); history.replaceState(null, '', '/jeu/'); render(); }); } }, 'Quitter la salle')),
    );
  },

  intro(d) {
    return h('div', { class: 'card center' },
      h('p', { class: 'muted' }, `Épreuve ${S.roundIndex + 1} sur ${S.roundCount}`),
      h('div', { class: 'big-emoji' }, d.emoji),
      h('h2', { class: 'title' }, d.title),
      h('p', {}, d.desc),
      hostNext('C\'est parti !'));
  },

  mcq_q(d) {
    const answered = d.mine != null;
    return h('div', {},
      h('div', { class: 'card' },
        h('p', { class: 'muted' }, h('span', { class: 'theme-tag' }, d.theme), ` · ${d.n}/${d.total}`),
        d.context ? h('div', { class: 'context' }, d.context) : null,
        h('h2', {}, d.q)),
      h('div', { class: `choices${d.kind === 'vf' ? ' two' : ''}` }, d.choices.map((c, i) => h('button', {
        class: `choice${answered ? (i === d.mine ? ' picked' : ' dim') : ''}`, disabled: answered,
        onclick: () => send('answer', { c: i }),
      }, c))),
      answered ? waiting() : null, hostSkip());
  },

  mcq_r(d) {
    const g = d.gains[pid];
    const winners = Object.keys(d.gains);
    return h('div', {},
      h('div', { class: 'card' },
        h('p', { class: 'muted' }, h('span', { class: 'theme-tag' }, d.theme), ` · ${d.n}/${d.total}`),
        d.context ? h('div', { class: 'context' }, d.context) : null,
        h('h2', {}, d.q)),
      h('div', { class: `choices${d.kind === 'vf' ? ' two' : ''}` }, d.choices.map((c, i) => h('div', { class: `choice${i === d.correct ? ' right' : ' dim'}${i === d.mine ? ' picked' : ''}` }, i === d.correct ? '✓ ' : '', c, h('div', { style: 'font-size:.85rem;opacity:.9' }, `${d.counts[i]} réponse${d.counts[i] > 1 ? 's' : ''}`)))),
      h('div', { class: 'card', style: 'margin-top:16px' },
        h('h2', { class: 'center' }, g ? `✅ +${g} points` : d.mine == null ? '⏱️ Pas de réponse' : '❌ Raté'),
        h('p', { class: 'muted center' }, winners.length ? 'Bonne réponse : ' + winners.map(who).join(', ') : 'Personne n\'a trouvé.'),
        explain(d.ex)),
      hostNext(d.n < d.total ? 'Question suivante' : 'Épreuve suivante'));
  },

  num_q(d) {
    if (d.mine != null) return h('div', { class: 'card center' }, h('p', { class: 'muted' }, `${d.n}/${d.total}`), h('h2', {}, d.q), h('p', {}, 'Votre réponse : ', h('b', {}, `${fmt(d.mine)} ${d.unit}`)), waiting(), hostSkip());
    const inp = h('input', { type: 'number', inputmode: 'decimal', placeholder: '?' });
    const submit = () => { if (inp.value !== '') send('number', { n: inp.value }); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    setTimeout(() => inp.focus(), 50);
    return h('div', { class: 'card center' },
      h('p', { class: 'muted' }, h('span', { class: 'theme-tag' }, d.theme), ` · ${d.n}/${d.total}`),
      h('div', { class: 'big-emoji' }, '🔢'),
      h('h2', {}, d.q),
      d.unit ? h('p', { class: 'muted' }, `Unité : ${d.unit}`) : null,
      inp,
      h('button', { class: 'btn block', style: 'margin-top:12px', onclick: submit }, 'Valider'),
      hostSkip());
  },

  num_r(d) {
    return h('div', {},
      h('div', { class: 'card center' },
        h('p', { class: 'muted' }, `${d.n}/${d.total}`),
        h('h2', {}, d.q),
        h('div', { class: 'title', style: 'font-size:2.6rem' }, `${fmt(d.a)} ${d.unit}`),
        explain(d.ex)),
      h('div', { class: 'card' }, d.rows.map((r) => h('div', { class: 'res' },
        h('span', { class: 'rank' }, who(r.id)),
        h('span', {}, `${fmt(r.guess)} `, h('span', { class: r.pts ? 'pts' : 'muted' }, r.pts ? `+${r.pts}` : '+0'))))),
      hostNext(d.n < d.total ? 'Chiffre suivant' : 'Épreuve suivante'));
  },

  write(d) {
    if (d.mine) return h('div', { class: 'card' }, h('div', { class: 'context', style: 'white-space:pre-line' }, d.prompt), h('p', { class: 'muted' }, 'Votre plaidoirie :'), h('p', {}, h('i', {}, '« ', d.mine, ' »')), waiting('Envoyé. Les autres rédigent…'), hostSkip());
    const ta = h('textarea', { maxlength: 2000, style: 'min-height:200px', placeholder: 'Problème juridique → règle (articles) → application aux faits → conclusion.' });
    const count = h('span', { class: 'muted' }, '0/2000');
    ta.addEventListener('input', () => { count.textContent = `${ta.value.length}/2000`; });
    const submit = () => { if (ta.value.trim()) send('submit', { text: ta.value }); };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); });
    setTimeout(() => ta.focus(), 50);
    return h('div', { class: 'card' },
      h('div', { class: 'big-emoji center' }, '⚖️'),
      h('div', { class: 'context', style: 'white-space:pre-line' }, d.prompt),
      h('p', { class: 'muted' }, 'Votre copie sera notée par notions clés (jusqu\'à 500 points), puis soumise au vote.'),
      ta, h('div', { class: 'row', style: 'margin-top:10px;align-items:center' }, count, h('button', { class: 'btn', onclick: submit }, 'Envoyer')),
      hostSkip());
  },

  vote(d) {
    const can = d.entries.some((e) => !e.own);
    return h('div', {},
      h('div', { class: 'card' }, h('h2', { class: 'center' }, 'Quelle copie est la plus juste ?'), h('div', { class: 'context', style: 'white-space:pre-line' }, d.prompt)),
      d.entries.map((e) => h('button', {
        class: `entry${e.own ? ' own' : ''}${d.mine === e.id ? ' on' : ''}`, disabled: e.own || d.mine != null,
        onclick: () => send('vote', { id: e.id }),
      }, e.text, e.own ? h('span', { class: 'muted' }, ' (la vôtre)') : null)),
      d.mine ? waiting('Vote enregistré.') : !can ? waiting('Vous ne pouvez pas voter pour vous-même.') : null,
      hostSkip());
  },

  vote_r(d) {
    return h('div', {},
      h('div', { class: 'card' },
        h('h2', { class: 'center' }, 'Verdict de l\'assemblée'),
        h('div', { class: 'context', style: 'white-space:pre-line' }, d.prompt),
        d.note ? h('p', { class: 'muted center' }, d.note) : null,
        d.results.map((r, i) => h('div', { class: 'res' },
          h('div', {}, h('div', { style: 'white-space:pre-line' }, i === 0 ? '🏆 ' : '', '« ', r.text, ' »'), h('div', { class: 'muted' }, '— ', who(r.author)),
            r.missing && r.missing.length ? h('div', { class: 'muted', style: 'font-size:.85rem' }, 'Manquait : ', r.missing.join(' · ')) : null),
          h('span', { class: 'pts', style: 'text-align:right' }, `${r.pct} % notions`, h('br'), `${r.votes} 🗳️ · +${r.pts}`)))),
      h('div', { class: 'card' }, h('h3', {}, '✅ Corrigé'), h('div', { class: 'explain', style: 'white-space:pre-line' }, d.model)),
      hostNext('Voir le classement'));
  },

  final(d) {
    const [a, b, c] = d.ranking;
    const me = d.ranking.find((p) => p.id === pid);
    return h('div', {},
      h('div', { class: 'card center' },
        h('div', { class: 'big-emoji' }, '🏛️'),
        h('h1', { class: 'title' }, 'Le Verdict'),
        a ? h('p', {}, h('b', {}, `${a.avatar} ${a.name}`), ' est sacré·e ', h('b', {}, 'Gabou-juriste du jour'), '.') : null,
        h('div', { class: 'podium' },
          b ? h('div', { class: 'p2' }, h('div', { style: 'font-size:2rem' }, b.avatar), b.name, h('div', { class: 'pts' }, fmt(b.score))) : h('div', {}),
          a ? h('div', { class: 'p1' }, h('div', { style: 'font-size:2.6rem' }, a.avatar), h('b', {}, a.name), h('div', { class: 'pts' }, fmt(a.score))) : null,
          c ? h('div', { class: 'p3' }, h('div', { style: 'font-size:2rem' }, c.avatar), c.name, h('div', { class: 'pts' }, fmt(c.score))) : h('div', {}))),
      h('div', { class: 'card' }, d.ranking.map((p, i) => h('div', { class: 'res' },
        h('span', { class: 'rank' }, `${i + 1}. ${p.avatar} ${p.name}`),
        h('span', {}, h('span', { class: 'muted' }, `${p.good}/${p.asked} justes · `), h('span', { class: 'pts' }, fmt(p.score)))))),
      h('div', { class: 'card' },
        h('h3', {}, '📝 Votre bilan de révision', me ? ` : ${me.good}/${me.asked}` : ''),
        d.misses.length
          ? [h('p', { class: 'muted' }, 'Les points à revoir, avec la bonne réponse :'), d.misses.map((m) => h('div', { class: 'miss' },
              h('div', {}, m.q), h('div', { class: 'ok' }, '→ ', m.answer), h('div', { class: 'muted' }, m.ex)))]
          : h('p', { class: 'ok' }, 'Sans faute. Irréprochable ! 🏆'),
        h('p', {}, h('a', { href: '/cours/r3-11-droit-du-numerique/', target: '_blank' }, '📖 Ouvrir la fiche de révision complète'))),
      isHost() ? h('button', { class: 'btn block', onclick: () => send('restart') }, 'Retour au salon') : null);
  },
};

// ------------------------------------------------------------ démarrage
if (code) connect(); else render();
