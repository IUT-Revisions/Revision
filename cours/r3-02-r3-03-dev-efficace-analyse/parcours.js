// GabouLearn — R3.02/R3.03 : parcours guidé interactif (récap → cartes à réciter → exercice → quiz corrigé).
// Progression et carnet d'erreurs gardés dans le navigateur (localStorage).
(() => {
  'use strict';
  const D = window.R323;
  if (!D) return;
  const QS = Object.fromEntries(D.QUESTIONS.map((q) => [q.id, q]));
  const STEPS = D.STEPS;
  const KEY = 'gaboulearn-r323-v1';
  const L = 'ABCD';

  // ------------------------------------------------------------ état
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  let S = Object.assign({ done: {}, errors: {}, exam: null }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* navigation privée */ } };

  // ------------------------------------------------------------ outils DOM
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = (min) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ' ' + String(min % 60).padStart(2, '0') : ''}` : `${min} min`);
  const totalMin = STEPS.reduce((s, x) => s + x.min, 0);

  const root = document.getElementById('parcours');
  const section = document.getElementById('parcours-section');
  if (!root || !section) return;
  document.querySelectorAll('[data-total-time]').forEach((el) => { el.textContent = fmt(totalMin); });

  let keyHandler = null;
  const setKeys = (fn) => { keyHandler = fn; };
  document.addEventListener('keydown', (e) => {
    if (!keyHandler || section.hidden) return;
    if (e.target.matches('input[type=text], textarea')) return;
    keyHandler(e);
  });

  function open(stepId) {
    section.hidden = false;
    if (stepId) runStep(STEPS.findIndex((s) => s.id === stepId));
    else overview();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.querySelectorAll('[data-parcours]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); open(b.dataset.parcours || null); }));
  if (location.hash === '#parcours') open(null);

  const doneCount = () => STEPS.filter((s) => S.done[s.id] != null).length;
  const progressBar = () => h('div', { class: 'bar' }, h('div', { style: `width:${Math.round((doneCount() / STEPS.length) * 100)}%` }));

  // ------------------------------------------------------------ vue d'ensemble
  function overview() {
    setKeys(null);
    const next = STEPS.findIndex((s) => S.done[s.id] == null);
    const left = STEPS.filter((s) => S.done[s.id] == null).reduce((t, s) => t + s.min, 0);
    put(root, 
      h('div', { class: 'pc-head' },
        h('h2', {}, 'Parcours guidé R3.02 · R3.03'),
        h('p', { class: 'muted' }, `${STEPS.length} étapes · ${fmt(totalMin)} en moyenne · `, doneCount() ? `il te reste ≈ ${fmt(left)}` : 'aucun prérequis'),
        progressBar()),
      h('p', {}, 'Chaque étape : ', h('b', {}, 'l\'essentiel à retenir'), ' → ', h('b', {}, 'cartes à réciter'), ' → ', h('b', {}, 'un exercice'), ' → ', h('b', {}, 'le quiz corrigé'), '. Une question ratée revient en fin d\'étape et part dans ton carnet d\'erreurs. Raccourcis : touches 1-4 pour cocher, Entrée pour valider.'),
      h('ol', { class: 'pc-steps' }, STEPS.map((s, i) => {
        const sc = S.done[s.id];
        return h('li', { class: sc != null ? 'done' : i === next ? 'next' : '' },
          h('button', { class: 'pc-step', type: 'button', onclick: () => runStep(i) },
            h('span', { class: 'pc-ic' }, sc != null ? '✓' : String(i + 1)),
            h('span', { class: 'pc-t' }, s.title, s.star ? h('span', { class: 'theme-tag' }, 'prioritaire') : null),
            h('span', { class: 'pc-m' }, sc != null && sc >= 0 ? `${sc} %` : fmt(s.min))));
      })),
      h('div', { class: 'row' },
        next >= 0 ? h('button', { class: 'btn', type: 'button', onclick: () => runStep(next) }, doneCount() ? `▶ Reprendre : ${STEPS[next].title}` : '▶ Commencer le parcours') : h('button', { class: 'btn', type: 'button', onclick: () => runStep(STEPS.length - 1) }, 'Voir mon bilan'),
        Object.keys(S.errors).length ? h('button', { class: 'btn alt', type: 'button', onclick: () => errorDrill() }, `Refaire mes ${Object.keys(S.errors).length} erreurs`) : null),
      h('p', { class: 'center' }, h('button', { class: 'linkish', type: 'button', onclick: () => { if (confirm('Effacer la progression et le carnet d\'erreurs ?')) { S = { done: {}, errors: {}, exam: null }; save(); overview(); } } }, 'Recommencer à zéro')));
  }

  // ------------------------------------------------------------ une étape
  let timerId = null;
  function stepHeader(i, phase) {
    const s = STEPS[i];
    clearInterval(timerId);
    const t0 = Date.now();
    const clock = h('span', { class: 'timer' }, '0:00');
    timerId = setInterval(() => { const sec = Math.floor((Date.now() - t0) / 1000); clock.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; if (!document.body.contains(clock)) clearInterval(timerId); }, 1000);
    return h('div', { class: 'pc-head' },
      h('div', { class: 'top-line' },
        h('button', { class: 'linkish', type: 'button', onclick: overview }, '← Plan'),
        h('span', { class: 'muted' }, `Étape ${i + 1}/${STEPS.length} · ${fmt(s.min)} · `, clock)),
      h('h2', {}, s.title, phase ? h('span', { class: 'muted pc-phase' }, ' · ', phase) : null),
      progressBar());
  }

  function runStep(i) {
    const s = STEPS[i];
    if (!s) return overview();
    if (s.exam) return examIntro(i);
    if (s.final) return finalView(i);
    learn(i);
  }

  function learn(i) {
    const s = STEPS[i];
    const kids = [stepHeader(i, 'à retenir'),
      h('div', { class: 'box pc-recap' }, h('h3', {}, 'L\'essentiel'), h('ul', {}, s.recap.map((r) => h('li', { html: r })))),
    ];
    if (s.anchor) kids.push(h('p', { class: 'muted' }, 'Besoin du détail ? ', h('a', { href: `#${s.anchor}` }, 'Relire cette partie du cours ↑')));
    if (s.cards.length) {
      kids.push(h('h3', {}, 'Récite avant de retourner la carte'),
        h('div', { class: 'pc-cards' }, s.cards.map(([q, a]) => {
          const card = h('button', { class: 'pc-card', type: 'button', onclick: () => card.classList.toggle('flip') },
            h('span', { class: 'front' }, q), h('span', { class: 'back' }, a));
          return card;
        })));
    }
    const go = () => (s.widget ? widget(i) : quiz(i));
    kids.push(h('button', { class: 'btn block', type: 'button', onclick: go }, s.widget ? 'Exercice interactif →' : `Quiz de l'étape (${s.qs.length} questions) →`));
    put(root, ...kids);
    setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    root.scrollIntoView({ block: 'start' });
  }

  // ------------------------------------------------------------ exercices interactifs
  function widget(i) {
    const s = STEPS[i];
    const box = h('div', { class: 'box pc-widget' });
    const next = h('button', { class: 'btn block', type: 'button', onclick: () => quiz(i) }, `Quiz de l'étape (${s.qs.length} questions) →`);
    put(root, stepHeader(i, 'exercice'), box, next);
    setKeys(null);
    ({ symbols: wSymbols, bigo: wBigO, tree: wTree, quick: wQuick, npi: wNpi })[s.widget](box);
    root.scrollIntoView({ block: 'start' });
  }

  // 7 relations UML dessinées en SVG
  const REL = {
    association: { name: 'Association', dash: false, end: 'none', start: 'none' },
    navigable: { name: 'Association navigable', dash: false, end: 'arrow', start: 'none' },
    dependance: { name: 'Dépendance', dash: true, end: 'arrow', start: 'none' },
    agregation: { name: 'Agrégation', dash: false, end: 'none', start: 'diamond' },
    composition: { name: 'Composition', dash: false, end: 'none', start: 'diamondFull' },
    generalisation: { name: 'Généralisation (héritage)', dash: false, end: 'triangle', start: 'none' },
    realisation: { name: 'Réalisation (interface)', dash: true, end: 'triangle', start: 'none' },
  };
  function relSvg(key, a = 'A', b = 'B', w = 300) {
    const r = REL[key];
    const ns = 'http://www.w3.org/2000/svg';
    const el = (t, at) => { const e = document.createElementNS(ns, t); for (const [k, v] of Object.entries(at)) e.setAttribute(k, v); return e; };
    const svg = el('svg', { viewBox: `0 0 ${w} 60`, width: '100%', role: 'img', 'aria-label': `Relation entre ${a} et ${b}`, class: 'rel' });
    const box = (x, label) => { svg.append(el('rect', { x, y: 15, width: 60, height: 30, rx: 4, class: 'rel-box' })); const t = el('text', { x: x + 30, y: 35, 'text-anchor': 'middle', class: 'rel-txt' }); t.textContent = label; svg.append(t); };
    box(4, a); box(w - 64, b);
    const x1 = 64, x2 = w - 64, y = 30;
    const sx = r.start === 'none' ? x1 : x1 + 24;
    const ex = r.end === 'triangle' ? x2 - 16 : x2;
    svg.append(el('line', { x1: sx, y1: y, x2: ex, y2: y, class: 'rel-line', 'stroke-dasharray': r.dash ? '6 5' : 'none' }));
    if (r.start.startsWith('diamond')) svg.append(el('polygon', { points: `${x1},${y} ${x1 + 12},${y - 8} ${x1 + 24},${y} ${x1 + 12},${y + 8}`, class: r.start === 'diamondFull' ? 'rel-full' : 'rel-hollow' }));
    if (r.end === 'arrow') svg.append(el('polyline', { points: `${x2 - 12},${y - 8} ${x2},${y} ${x2 - 12},${y + 8}`, class: 'rel-line', fill: 'none' }));
    if (r.end === 'triangle') svg.append(el('polygon', { points: `${x2 - 16},${y - 10} ${x2},${y} ${x2 - 16},${y + 10}`, class: 'rel-hollow' }));
    return svg;
  }
  document.querySelectorAll('[data-rel]').forEach((el) => el.append(relSvg(el.dataset.rel, el.dataset.a || 'A', el.dataset.b || 'B', 220)));

  function wSymbols(box) {
    const keys = shuffle(Object.keys(REL));
    let k = 0, ok = 0;
    const round = () => {
      if (k >= keys.length) {
        put(box, h('h3', {}, `Symboles UML : ${ok}/${keys.length}`), h('p', {}, ok === keys.length ? 'Parfait, tu les reconnais tous. ' : 'Relis le tableau « force des relations » du cours, puis refais l\'exercice.'), h('button', { class: 'btn alt', type: 'button', onclick: () => { k = 0; ok = 0; keys.splice(0, keys.length, ...shuffle(Object.keys(REL))); round(); } }, '↻ Recommencer'));
        return;
      }
      const key = keys[k];
      const opts = shuffle([key, ...shuffle(Object.keys(REL).filter((x) => x !== key)).slice(0, 3)]);
      const fb = h('div', {});
      const btns = opts.map((o) => h('button', { class: 'pc-opt', type: 'button', onclick: () => {
        btns.forEach((b) => { b.disabled = true; });
        const good = o === key;
        if (good) ok++;
        btns[opts.indexOf(key)].classList.add('right');
        if (!good) btns[opts.indexOf(o)].classList.add('wrong');
        put(fb, h('p', { class: good ? 'ok' : 'bad' }, good ? '✓ Exact' : `✗ C'était : ${REL[key].name}`), h('button', { class: 'btn', type: 'button', onclick: () => { k++; round(); } }, 'Suivant →'));
      } }, REL[o].name));
      put(box, h('h3', {}, `Quelle relation ? (${k + 1}/${keys.length})`), relSvg(key), h('div', { class: 'pc-grid' }, btns), fb);
    };
    round();
  }

  function wBigO(box) {
    const ORDER = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(n!)'];
    let picked = [], errors = 0;
    const draw = () => {
      const left = shuffle(ORDER.filter((x) => !picked.includes(x)));
      const msg = h('p', { class: 'muted' }, 'Clique les complexités de la plus efficace à la moins efficace.');
      put(box, h('h3', {}, 'Range les complexités'), msg,
        h('div', { class: 'pc-seq' }, picked.map((p) => h('span', { class: 'pc-chip ok' }, p))),
        picked.length < ORDER.length
          ? h('div', { class: 'pc-grid' }, left.map((x) => h('button', { class: 'pc-opt', type: 'button', onclick: (e) => {
            if (x === ORDER[picked.length]) { picked.push(x); draw(); } else { errors++; e.currentTarget.classList.add('wrong', 'shake'); }
          } }, x)))
          : h('div', {}, h('p', { class: errors ? 'bad' : 'ok' }, errors ? `Classé, avec ${errors} erreur(s). Refais-le jusqu'à 0 erreur.` : '✓ Sans faute'),
            h('p', {}, 'Bonus à savoir : quand n double, n ⇒ ×2, n² ⇒ ×4, n³ ⇒ ×8, log n ⇒ +1 étape.'),
            h('button', { class: 'btn alt', type: 'button', onclick: () => { picked = []; errors = 0; draw(); } }, '↻ Recommencer')));
    };
    draw();
  }

  function wTree(box) {
    // F(B(A, D(C, E)), G(-, I(H, -)))
    const N = { F: [200, 30], B: [110, 85], G: [290, 85], A: [60, 140], D: [160, 140], I: [340, 140], C: [125, 195], E: [195, 195], H: [305, 195] };
    const EDGES = [['F', 'B'], ['F', 'G'], ['B', 'A'], ['B', 'D'], ['G', 'I'], ['D', 'C'], ['D', 'E'], ['I', 'H']];
    const MODES = [
      ['Préfixe', 'racine, gauche, droite (R-G-D)', 'FBADCEGIH'],
      ['Infixe', 'gauche, racine, droite (G-R-D)', 'ABCDEFGHI'],
      ['Postfixe', 'gauche, droite, racine (G-D-R)', 'ACEDBHIGF'],
    ];
    let m = 0, pos = 0, errors = 0;
    const ns = 'http://www.w3.org/2000/svg';
    const el = (t, at) => { const e = document.createElementNS(ns, t); for (const [k, v] of Object.entries(at)) e.setAttribute(k, v); return e; };
    const draw = () => {
      const [name, rule, seq] = MODES[m];
      const svg = el('svg', { viewBox: '0 0 400 225', width: '100%', class: 'tree' });
      for (const [a, b] of EDGES) svg.append(el('line', { x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], class: 'rel-line' }));
      for (const [k, [x, y]] of Object.entries(N)) {
        const g = el('g', { class: 'node' + (seq.slice(0, pos).includes(k) ? ' on' : ''), tabindex: 0, role: 'button', 'aria-label': `Nœud ${k}` });
        g.append(el('circle', { cx: x, cy: y, r: 19 }));
        const t = el('text', { x, y: y + 6, 'text-anchor': 'middle' }); t.textContent = k; g.append(t);
        g.addEventListener('click', () => {
          if (pos >= seq.length || seq.slice(0, pos).includes(k)) return;
          if (k === seq[pos]) { pos++; draw(); } else { errors++; g.classList.add('wrong'); setTimeout(() => g.classList.remove('wrong'), 450); status.textContent = `✗ Pas ${k}. Règle : ${rule}.`; }
        });
        svg.append(g);
      }
      const status = h('p', { class: 'bad' }, '');
      const done = pos >= seq.length;
      put(box, h('h3', {}, `Parcours ${name} (${m + 1}/3)`), h('p', { class: 'muted' }, `Clique les nœuds dans l'ordre ${name.toLowerCase()} : ${rule}.`), svg,
        h('p', { class: 'pc-seq' }, seq.slice(0, pos).split('').map((c) => h('span', { class: 'pc-chip ok' }, c))), status,
        done ? h('div', {}, h('p', { class: 'ok' }, `✓ ${name} : ${seq.split('').join(' ')}`),
          m < 2 ? h('button', { class: 'btn', type: 'button', onclick: () => { m++; pos = 0; draw(); } }, 'Parcours suivant →')
            : h('p', {}, errors ? `Terminé avec ${errors} erreur(s). ` : 'Les 3 parcours sans faute. ', 'Retiens : infixe d\'un ABR = ordre croissant.')) : null);
    };
    draw();
  }

  function wQuick(box) {
    const STEPS_Q = [
      [[7, 2, 9, 4, 1, 8, 5], [6], [], 'Départ. Pivot = dernier élément : 5. On cherche le 1er élément supérieur au pivot : 7 (indice a).'],
      [[2, 7, 9, 4, 1, 8, 5], [6], [0, 1], '2 < 5 : on l\'échange avec le 1er élément supérieur (7). a avance.'],
      [[2, 4, 9, 7, 1, 8, 5], [6], [1, 3], '4 < 5 : échange 7 ↔ 4.'],
      [[2, 4, 1, 7, 9, 8, 5], [6], [2, 4], '1 < 5 : échange 9 ↔ 1. 8 > 5 : on ne fait rien.'],
      [[2, 4, 1, 5, 9, 8, 7], [3], [3, 6], 'Fin : on échange le 1er élément supérieur (7) avec le pivot. 5 est à sa place définitive : à gauche tout est < 5 (L), à droite tout est > 5 (G).'],
      [[1, 2, 4, 5, 7, 8, 9], [], [], 'Conquer : on trie récursivement L = [2 4 1] et G = [9 8 7]. Trié en place, sans structure auxiliaire.'],
    ];
    let k = 0;
    const draw = () => {
      const [arr, piv, sw, txt] = STEPS_Q[k];
      put(box, h('h3', {}, `Partition de Lomuto (${k + 1}/${STEPS_Q.length})`),
        h('div', { class: 'qs-row' }, arr.map((v, j) => h('span', { class: 'qs-cell' + (piv.includes(j) ? ' piv' : '') + (sw.includes(j) ? ' sw' : '') }, v))),
        h('p', {}, txt),
        h('div', { class: 'row' },
          h('button', { class: 'btn alt', type: 'button', disabled: k === 0, onclick: () => { k--; draw(); } }, '← Étape précédente'),
          h('button', { class: 'btn', type: 'button', disabled: k === STEPS_Q.length - 1, onclick: () => { k++; draw(); } }, 'Étape suivante →')),
        k === STEPS_Q.length - 1 ? h('p', { class: 'muted' }, 'Pire cas : sur une liste déjà triée, le pivot (dernier) est toujours le max ⇒ une partition vide à chaque appel ⇒ O(n²) et récursion de profondeur n (StackOverflowError à 50 000 dans ton TP).') : null);
    };
    draw();
  }

  // Évaluation d'une NPI avec une pile (TP4) : à chaque opérateur, on demande ce qu'on empile.
  function wNpi(box) {
    const EXPRS = ['7 2 3 * - 4 +', '5 2 + 8 3 - *', '2 3 + 5 * 9 1 3 4 + + 3 * - -'];
    const OPS = { '+': (x, y) => x + y, '-': (x, y) => x - y, '*': (x, y) => x * y };
    let e = 0, ok = 0, asked = 0;
    const run = () => {
      const toks = EXPRS[e].split(' ');
      const stack = [];
      let t = 0;
      const step = (msg) => {
        while (t < toks.length && !OPS[toks[t]]) { stack.push(Number(toks[t])); t++; }
        const done = t >= toks.length;
        const head = [
          h('h3', {}, `Évalue la NPI (${e + 1}/${EXPRS.length})`),
          h('div', { class: 'qs-row' }, toks.map((x, j) => h('span', { class: 'qs-cell' + (j === t ? ' piv' : j < t ? ' sw' : '') }, x.replace('-', '−')))),
          h('p', { class: 'muted center' }, 'Pile (bas → sommet) :'),
          h('div', { class: 'qs-row' }, stack.length ? stack.map((v) => h('span', { class: 'qs-cell' }, v)) : h('span', { class: 'muted' }, 'vide')),
          msg || null,
        ];
        if (done) {
          return put(box, ...head,
            h('p', { class: 'ok' }, `Résultat : ${stack[0]} (dernière valeur de la pile).`),
            h('div', { class: 'row' }, e + 1 < EXPRS.length
              ? h('button', { class: 'btn', type: 'button', onclick: () => { e++; run(); } }, 'Expression suivante →')
              : h('p', {}, `Bilan : ${ok}/${asked} opérations justes. Retiens : y = dépiler(), x = dépiler(), empiler x op y.`)));
        }
        const op = toks[t];
        const y = stack[stack.length - 1], x = stack[stack.length - 2];
        const good = OPS[op](x, y);
        const cands = [good, OPS[op](y, x), op === '+' ? x * y : x + y, y, good + 1, good - 1];
        const opts = shuffle([...new Set(cands)].slice(0, 4));
        const sym = op.replace('-', '−').replace('*', '×');
        const btns = opts.map((v) => h('button', { class: 'pc-opt', type: 'button', onclick: () => {
          asked++;
          const right = v === good;
          if (right) ok++;
          stack.pop(); stack.pop(); stack.push(good); t++;
          step(h('p', { class: right ? 'ok' : 'bad' }, right ? `✓ ${x} ${sym} ${y} = ${good}` : `✗ On dépile y = ${y} puis x = ${x} : x ${sym} y = ${x} ${sym} ${y} = ${good}`));
        } }, String(v)));
        put(box, ...head, h('p', {}, h('b', {}, `Opérateur ${sym}`), ' : que va-t-on empiler ?'), h('div', { class: 'pc-grid' }, btns));
      };
      step();
    };
    run();
  }

  // ------------------------------------------------------------ le quiz
  // opts : { ids, title, exam (pas de corrigé avant la fin), onEnd(score, total, wrongIds) }
  function runQuiz(head, ids, opts) {
    const queue = shuffle(ids).map((id) => ({ id, retry: false }));
    const total = queue.length;
    let n = 0, firstTry = 0;
    const wrong = new Set();
    const answers = [];
    const draw = () => {
      if (!queue.length) return opts.onEnd(firstTry, total, [...wrong], answers);
      const item = queue[0];
      const q = QS[item.id];
      const order = shuffle([0, 1, 2, 3].slice(0, q.opts.length));
      const boxes = order.map((o, j) => h('label', { class: 'pc-check' }, h('input', { type: 'checkbox', value: o }), h('span', { class: 'kbd' }, j + 1), h('span', {}, q.opts[o])));
      const fb = h('div', {});
      let validated = false;
      const validate = () => {
        if (validated) return next();
        const picked = boxes.map((b) => b.querySelector('input')).filter((x) => x.checked).map((x) => +x.value).sort().join();
        if (!picked) { put(fb, h('p', { class: 'muted' }, 'Coche au moins une proposition.')); return; }
        validated = true;
        const good = picked === q.ok.slice().sort().join();
        if (!item.retry) { if (good) firstTry++; else { wrong.add(q.id); S.errors[q.id] = (S.errors[q.id] || 0) + 1; save(); } }
        else if (good && S.errors[q.id]) { /* gardé dans le carnet jusqu'au bilan */ }
        answers.push({ id: q.id, good });
        if (opts.exam) return next();
        vbtn.hidden = true;
        boxes.forEach((b) => { const inp = b.querySelector('input'); inp.disabled = true; const o = +inp.value; if (q.ok.includes(o)) b.classList.add('right'); else if (inp.checked) b.classList.add('wrong'); });
        if (!good && !item.retry) queue.push({ id: q.id, retry: true });
        put(fb, h('div', { class: 'explain' }, h('b', { class: good ? 'ok' : 'bad' }, good ? '✓ Exact. ' : `✗ Réponse : ${q.ok.map((o) => q.opts[o]).join(' + ')}. `), q.ex, !good && !item.retry ? h('div', { class: 'muted' }, '↻ Cette question reviendra en fin d\'étape.') : null),
          h('button', { class: 'btn block', type: 'button', onclick: next }, 'Suivant →'));
        fb.querySelector('.btn').focus({ preventScroll: true });
      };
      const next = () => { queue.shift(); n++; draw(); };
      const done = total - queue.filter((x) => !x.retry).length;
      const vbtn = h('button', { class: 'btn block', type: 'button', onclick: validate }, opts.exam ? 'Valider et continuer' : 'Valider');
      put(root, head(),
        h('div', { class: 'tr-card' },
          h('div', { class: 'muted pc-qn' }, item.retry ? '↻ Deuxième chance' : `Question ${done + 1}/${total}`, ' · plusieurs réponses possibles'),
          h('div', { class: 'bar' }, h('div', { style: `width:${Math.round((done / total) * 100)}%` })),
          h('h3', {}, q.q),
          h('div', { class: 'pc-checks' }, boxes),
          vbtn,
          fb));
      setKeys((e) => {
        const d = parseInt(e.key, 10);
        if (d >= 1 && d <= boxes.length && !validated) { const inp = boxes[d - 1].querySelector('input'); inp.checked = !inp.checked; }
        else if (e.key === 'Enter') { e.preventDefault(); validate(); }
      });
    };
    draw();
  }

  function quiz(i) {
    const s = STEPS[i];
    runQuiz(() => stepHeader(i, 'quiz'), s.qs, {
      onEnd(score, total, wrongIds) {
        const pct = Math.round((score / total) * 100);
        S.done[s.id] = pct; save();
        const verdict = pct >= 85 ? ['', 'Chapitre maîtrisé.'] : pct >= 65 ? ['', 'Solide. Relis les explications de tes erreurs.'] : ['', 'Chapitre à revoir : relis l\'essentiel puis refais le quiz.'];
        put(root, stepHeader(i, 'bilan'),
          h('div', { class: 'box center' }, h('h3', {}, `${score}/${total} du premier coup · ${pct} %`), h('p', {}, verdict[1])),
          wrongIds.length ? h('div', { class: 'box' }, h('h3', {}, 'Ajouté au carnet d\'erreurs'), h('ul', {}, wrongIds.map((id) => h('li', {}, QS[id].q, ' → ', h('b', {}, QS[id].ok.map((o) => QS[id].opts[o]).join(' + ')))))) : null,
          h('div', { class: 'row' },
            h('button', { class: 'btn', type: 'button', onclick: () => runStep(i + 1) }, `Étape suivante : ${STEPS[i + 1].title} →`),
            pct < 65 ? h('button', { class: 'btn alt', type: 'button', onclick: () => learn(i) }, '↻ Revoir l\'étape') : null));
        setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); runStep(i + 1); } });
        root.scrollIntoView({ block: 'start' });
      },
    });
  }

  // ------------------------------------------------------------ examen blanc
  function examIntro(i) {
    const s = STEPS[i];
    put(root, stepHeader(i, 'conditions réelles'),
      h('div', { class: 'box' }, h('p', {}, `${s.exam} questions tirées au hasard dans tout le programme, `, h('b', {}, 'sans corrigé avant la fin'), '. Plusieurs réponses possibles. Vise ~35 s par question, sans regarder le cours.'),
        S.exam ? h('p', { class: 'muted' }, `Ton dernier examen blanc : ${S.exam.score}/${S.exam.total}.`) : null),
      h('button', { class: 'btn block', type: 'button', onclick: () => exam(i) }, 'Lancer l\'examen blanc'));
    setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); exam(i); } });
  }
  function exam(i) {
    const s = STEPS[i];
    const ids = shuffle(D.QUESTIONS.map((q) => q.id)).slice(0, s.exam);
    runQuiz(() => stepHeader(i, 'examen'), ids, {
      exam: true,
      onEnd(score, total, wrongIds) {
        S.exam = { score, total }; S.done[s.id] = Math.round((score / total) * 100); save();
        const note = Math.round((score / total) * 200) / 10;
        put(root, stepHeader(i, 'résultat'),
          h('div', { class: 'box center' }, h('h3', {}, `${score}/${total} · ≈ ${String(note).replace('.', ',')}/20`),
            h('p', {}, note >= 16 ? 'Tu es prêt pour demain.' : 'Relis le corrigé ci-dessous puis refais tes erreurs.')),
          wrongIds.length ? h('div', { class: 'box' }, h('h3', {}, 'Corrigé de tes erreurs'), wrongIds.map((id) => { const q = QS[id]; return h('div', { class: 'miss' }, h('b', {}, q.q), h('div', { class: 'ok' }, '✓ ', q.ok.map((o) => q.opts[o]).join(' + ')), h('div', { class: 'muted' }, q.ex)); })) : null,
          h('div', { class: 'row' },
            h('button', { class: 'btn', type: 'button', onclick: () => runStep(i + 1) }, 'Carnet d\'erreurs & demain matin →'),
            h('button', { class: 'btn alt', type: 'button', onclick: () => exam(i) }, '↻ Un autre examen blanc')));
        root.scrollIntoView({ block: 'start' });
      },
    });
  }

  // ------------------------------------------------------------ bilan final
  function errorDrill() {
    const ids = Object.keys(S.errors).filter((id) => QS[id]);
    if (!ids.length) return overview();
    runQuiz(() => h('div', { class: 'pc-head' }, h('div', { class: 'top-line' }, h('button', { class: 'linkish', type: 'button', onclick: overview }, '← Plan'), h('span', { class: 'muted' }, 'Carnet d\'erreurs')), h('h2', {}, 'Refaire mes erreurs')), ids, {
      onEnd(score, total, wrongIds, answers) {
        // une erreur réussie du premier coup sort du carnet
        answers.forEach((a) => { if (a.good && !wrongIds.includes(a.id)) delete S.errors[a.id]; });
        save();
        put(root, h('div', { class: 'box center' }, h('h3', {}, `${score}/${total} erreurs corrigées`), h('p', {}, Object.keys(S.errors).length ? `Il en reste ${Object.keys(S.errors).length} dans ton carnet.` : 'Carnet vide : tout est acquis. ')),
          h('div', { class: 'row' }, Object.keys(S.errors).length ? h('button', { class: 'btn', type: 'button', onclick: errorDrill }, '↻ Encore une fois') : null, h('button', { class: 'btn alt', type: 'button', onclick: overview }, '← Plan du parcours')));
      },
    });
  }

  function finalView(i) {
    S.done.fin = -1; save();
    const errs = Object.entries(S.errors).filter(([id]) => QS[id]).sort((a, b) => b[1] - a[1]);
    const weak = STEPS.filter((s) => S.done[s.id] != null && S.done[s.id] >= 0 && S.done[s.id] < 70 && !s.exam);
    put(root, stepHeader(i, 'bilan'),
      h('div', { class: 'box' }, h('h3', {}, 'Ton carnet d\'erreurs'), h('p', { class: 'muted' }, 'C\'est ÇA que tu relis demain matin, pas tout le cours.'),
        errs.length ? h('ul', { class: 'pc-err' }, errs.map(([id, c]) => { const q = QS[id]; return h('li', {}, h('b', {}, q.q), ' → ', q.ok.map((o) => q.opts[o]).join(' + '), c > 1 ? h('span', { class: 'bad' }, ` (×${c})`) : null); })) : h('p', { class: 'ok' }, 'Aucune erreur en attente. '),
        errs.length ? h('button', { class: 'btn', type: 'button', onclick: errorDrill }, `Refaire mes ${errs.length} erreurs`) : null),
      weak.length ? h('div', { class: 'box warn' }, h('h3', {}, 'Chapitres sous 70 %'), h('div', { class: 'row' }, weak.map((s) => h('button', { class: 'btn alt', type: 'button', onclick: () => runStep(STEPS.indexOf(s)) }, `${s.title} (${S.done[s.id]} %)`)))) : null,
      h('div', { class: 'box pc-recap' }, h('h3', {}, 'Demain matin (15 min)'), h('ul', {},
        h('li', {}, 'Relis ton carnet d\'erreurs (ou clique « Refaire mes erreurs »).'),
        h('li', {}, 'Relis la ', h('a', { href: '#flash' }, 'fiche flash'), '.'),
        h('li', {}, 'Redessine de tête les 7 symboles UML et l\'échelle O(1) < log n < n < n log n < n² < n³ < 2ⁿ < n!.'),
        h('li', {}, 'La veille, on révise : rien de nouveau.'))),
      h('div', { class: 'box' }, h('h3', {}, 'Pendant le QCM'), h('ul', {},
        h('li', {}, 'Lis chaque proposition : plusieurs peuvent être justes.'),
        h('li', {}, 'Méfie-toi des mots absolus (« toujours », « jamais », « obligatoirement »).'),
        h('li', {}, 'UML : mini-croquis au brouillon. Losange côté tout, triangle vers le général, pointillés = implements / dépendance.'),
        h('li', {}, 'Complexité : compte les boucles imbriquées, regarde si l\'entrée est divisée par 2.'),
        h('li', {}, 'Garde du temps à la fin pour les questions où tu as hésité.'))),
      h('div', { class: 'row' }, h('button', { class: 'btn alt', type: 'button', onclick: () => exam(STEPS.findIndex((s) => s.exam)) }, 'Un autre examen blanc'), h('button', { class: 'btn alt', type: 'button', onclick: overview }, '← Plan du parcours')));
    root.scrollIntoView({ block: 'start' });
  }
})();
