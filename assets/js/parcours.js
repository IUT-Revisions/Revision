// GabouLearn — moteur commun des parcours guidés (récap → cartes à réciter → quiz corrigé → examen blanc → carnet d'erreurs).
// La page définit window.PARCOURS = { key, title, QUESTIONS, STEPS, tips: { semaine: [...], qcm: [...] } }.
// Progression et carnet d'erreurs gardés dans le navigateur (localStorage).
(() => {
  'use strict';
  const D = window.PARCOURS;
  if (!D) return;
  const QS = Object.fromEntries(D.QUESTIONS.map((q) => [q.id, q]));
  const STEPS = D.STEPS;
  const KEY = 'gaboulearn-' + (D.key || 'parcours') + '-v1';
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
        h('h2', {}, 'Parcours guidé ' + (D.title || '')),
        h('p', { class: 'muted' }, `${STEPS.length} étapes · ${fmt(totalMin)} en moyenne · `, doneCount() ? `il te reste ≈ ${fmt(left)}` : 'aucun prérequis'),
        progressBar()),
      h('p', {}, 'Chaque étape : ', h('b', {}, 'l\'essentiel à retenir'), ' → ', h('b', {}, 'cartes à réciter'), ' → ', h('b', {}, 'le quiz corrigé'), '. Une question ratée revient en fin d\'étape et part dans ton carnet d\'erreurs. Raccourcis : touches 1-4 pour cocher, Entrée pour valider.'),
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
    const go = () => quiz(i);
    kids.push(h('button', { class: 'btn block', type: 'button', onclick: go }, `Quiz de l'étape (${s.qs.length} questions) →`));
    put(root, ...kids);
    setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    root.scrollIntoView({ block: 'start' });
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
            h('p', {}, note >= 16 ? 'Tu es au niveau des cibles.' : 'Relis le corrigé ci-dessous puis refais tes erreurs.')),
          wrongIds.length ? h('div', { class: 'box' }, h('h3', {}, 'Corrigé de tes erreurs'), wrongIds.map((id) => { const q = QS[id]; return h('div', { class: 'miss' }, h('b', {}, q.q), h('div', { class: 'ok' }, '✓ ', q.ok.map((o) => q.opts[o]).join(' + ')), h('div', { class: 'muted' }, q.ex)); })) : null,
          h('div', { class: 'row' },
            h('button', { class: 'btn', type: 'button', onclick: () => runStep(i + 1) }, 'Carnet d\'erreurs & plan de la semaine →'),
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
      h('div', { class: 'box' }, h('h3', {}, 'Ton carnet d\'erreurs'), h('p', { class: 'muted' }, 'C\'est ÇA que tu relis avant chaque contrôle, pas tout le cours.'),
        errs.length ? h('ul', { class: 'pc-err' }, errs.map(([id, c]) => { const q = QS[id]; return h('li', {}, h('b', {}, q.q), ' → ', q.ok.map((o) => q.opts[o]).join(' + '), c > 1 ? h('span', { class: 'bad' }, ` (×${c})`) : null); })) : h('p', { class: 'ok' }, 'Aucune erreur en attente. '),
        errs.length ? h('button', { class: 'btn', type: 'button', onclick: errorDrill }, `Refaire mes ${errs.length} erreurs`) : null),
      weak.length ? h('div', { class: 'box warn' }, h('h3', {}, 'Chapitres sous 70 %'), h('div', { class: 'row' }, weak.map((s) => h('button', { class: 'btn alt', type: 'button', onclick: () => runStep(STEPS.indexOf(s)) }, `${s.title} (${S.done[s.id]} %)`)))) : null,
      h('div', { class: 'box pc-recap' }, h('h3', {}, 'Avant le contrôle'), h('ul', {},
        h('li', {}, 'Relis ton carnet d\'erreurs (ou clique « Refaire mes erreurs »).'),
        ...((D.tips && D.tips.semaine) || []).map((t) => h('li', { html: t })))),
      h('div', { class: 'box' }, h('h3', {}, 'Pendant l\'épreuve'), h('ul', {},
        h('li', {}, 'Lis chaque proposition : plusieurs peuvent être justes, et une case en trop coûte des points.'),
        ...((D.tips && D.tips.qcm) || []).map((t) => h('li', { html: t })),
        h('li', {}, 'Garde du temps à la fin pour les questions où tu as hésité.'))),
      h('div', { class: 'row' }, h('button', { class: 'btn alt', type: 'button', onclick: () => exam(STEPS.findIndex((s) => s.exam)) }, 'Un autre examen blanc'), h('button', { class: 'btn alt', type: 'button', onclick: overview }, '← Plan du parcours')));
    root.scrollIntoView({ block: 'start' });
  }
})();
