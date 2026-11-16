// GabouLearn — entraînement aléatoire (commun à tous les cours)
// Le cours fournit window.BANK (THEMES, QUIZ, VRAIFAUX, CASES, NUMBERS, ARTICLES).
(() => {
  const B = window.BANK;
  const root = document.getElementById('trainer');
  const form = document.getElementById('train-form');
  if (!B || !root || !form) return;
  const TH = B.THEMES;

  // ---------------------------------------------------------- outils
  const rnd = (n) => Math.floor(Math.random() * n);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = (n) => Number(n).toLocaleString('fr-FR');
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

  // ---------------------------------------------------------- statistiques (navigateur uniquement)
  const KEY = 'rev-stats-' + (document.body.dataset.course || 'cours');
  let stats = {};
  try { stats = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { stats = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch {} };
  function record(q, good) {
    const s = stats[q.id] || (stats[q.id] = { ok: 0, ko: 0, t: q.t });
    good ? s.ok++ : s.ko++;
    save();
  }

  // ---------------------------------------------------------- fabrique de questions
  function mcq(id, t, label, q, choicesFirstGood, ex, context) {
    const order = shuffle(choicesFirstGood.map((_, i) => i));
    return { id, t, label, type: 'mcq', context, q, choices: order.map((i) => choicesFirstGood[i]), correct: order.indexOf(0), ex };
  }

  // distracteurs : on préfère le même chapitre, puis on complète avec les autres
  function others(a, n) {
    const same = shuffle((B.ARTICLES || []).filter((o) => o !== a && o.t === a.t));
    const rest = shuffle((B.ARTICLES || []).filter((o) => o !== a && o.t !== a.t));
    return same.concat(rest).slice(0, n);
  }

  function numDistractors(a) {
    const set = new Set();
    const year = a >= 1900 && a <= 2100;
    const cands = year ? [a - 2, a - 1, a + 1, a + 2] : [Math.round(a / 2), Math.round(a * 1.5), a * 2, a + 1, a - 1, a * 3, Math.round(a * 0.75)];
    for (const c of shuffle(cands)) if (c > 0 && c !== a) set.add(c);
    return [...set].slice(0, 3);
  }
  const withUnit = (n, u) => `${fmt(n)}${u ? ' ' + u : ''}`;

  // Chaque candidat : { id, t, group, type, make() }. « group » évite deux questions sur le même article dans une série.
  function candidates(themes, types) {
    const list = [];
    const inT = (x) => themes.includes(x.t);
    if (types.includes('qcm')) (B.QUIZ || []).forEach((x, i) => inT(x) && list.push({ id: 'quiz:' + i, t: x.t, group: 'quiz:' + i, make: () => mcq('quiz:' + i, x.t, 'QCM', x.q, x.choices, x.ex) }));
    if (types.includes('vf')) (B.VRAIFAUX || []).forEach((x, i) => inT(x) && list.push({ id: 'vf:' + i, t: x.t, group: 'vf:' + i, make: () => ({ id: 'vf:' + i, t: x.t, label: 'Vrai ou faux', type: 'mcq', q: x.s, choices: ['Vrai', 'Faux'], correct: x.v ? 0 : 1, ex: x.ex, two: true }) }));
    if (types.includes('cas')) (B.CASES || []).forEach((x, i) => inT(x) && list.push({ id: 'cas:' + i, t: x.t, group: 'cas:' + i, make: () => mcq('cas:' + i, x.t, 'Cas pratique', x.q, x.choices, x.ex, x.c) }));
    if (types.includes('chiffres')) (B.NUMBERS || []).forEach((x, i) => {
      if (!inT(x)) return;
      list.push({ id: 'num:' + i, t: x.t, group: 'num:' + i, make: () => Math.random() < 0.5
        ? { id: 'num:' + i, t: x.t, label: 'Chiffre à saisir', type: 'num', q: x.q, a: x.a, unit: x.unit, ex: x.ex }
        : mcq('num:' + i, x.t, 'Chiffre', x.q, [withUnit(x.a, x.unit), ...numDistractors(x.a).map((d) => withUnit(d, x.unit))], x.ex) });
    });
    if (types.includes('articles')) (B.ARTICLES || []).forEach((a) => {
      if (!inT(a)) return;
      list.push({ id: 'what:' + a.art, t: a.t, group: a.art, make: () => mcq('what:' + a.art, a.t, 'Article', `Que prévoit l'${a.art} ?`, [a.rule, ...others(a, 3).map((o) => o.rule)], `${a.art} : ${a.rule}.`) });
      list.push({ id: 'which:' + a.art, t: a.t, group: a.art, make: () => mcq('which:' + a.art, a.t, 'Article', `Quel texte prévoit : « ${a.rule} » ?`, [a.art, ...others(a, 3).map((o) => o.art)], `${a.art} : ${a.rule}.`) });
      list.push({ id: 'vfa:' + a.art, t: a.t, group: a.art, make: () => {
        const truth = Math.random() < 0.5;
        const o = truth ? a : others(a, 1)[0];
        const ex = truth ? `${a.art} : ${a.rule}.` : `Faux : ${a.art} porte sur « ${a.rule} ». La règle citée relève de l'${o.art}.`;
        return { id: 'vfa:' + a.art, t: a.t, label: 'Vrai ou faux', type: 'mcq', q: `L'${a.art} porte sur : « ${o.rule} ».`, choices: ['Vrai', 'Faux'], correct: truth ? 0 : 1, ex, two: true };
      } });
    });
    return list;
  }

  // tirage pondéré : les questions ratées reviennent plus souvent si « points faibles » est coché
  function weight(c, weak) {
    if (!weak) return 1;
    const s = stats[c.id];
    if (!s) return 1.5;
    return Math.max(0.25, 1 + 3 * s.ko - s.ok);
  }
  function draw(cands, n, weak) {
    const out = [], groups = new Set();
    let pool = cands.slice();
    while (out.length < n && pool.length) {
      const total = pool.reduce((s, c) => s + weight(c, weak), 0);
      let r = Math.random() * total, k = 0;
      for (; k < pool.length - 1; k++) { r -= weight(pool[k], weak); if (r <= 0) break; }
      const c = pool.splice(k, 1)[0];
      if (groups.has(c.group)) continue;
      groups.add(c.group);
      out.push(c.make());
    }
    return out;
  }

  // ---------------------------------------------------------- session
  let S = null;

  function readForm() {
    const fd = new FormData(form);
    return { themes: fd.getAll('theme'), types: fd.getAll('type'), n: Number(fd.get('n')), mode: fd.get('mode'), weak: fd.get('weak') === 'on' };
  }

  function start(opts, preset) {
    const qs = preset || draw(candidates(opts.themes, opts.types), opts.n, opts.weak);
    if (!qs.length) { root.replaceChildren(h('p', { class: 'err' }, 'Aucune question ne correspond : cochez au moins un chapitre et un type.')); return; }
    S = { opts, qs, i: 0, answers: [], answered: false, t0: Date.now() };
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderQ();
  }

  function isGood(q, ans) { return q.type === 'num' ? ans === q.a : ans === q.correct; }
  const answerText = (q, ans) => ans == null ? '—' : q.type === 'num' ? withUnit(ans, q.unit) : q.choices[ans];
  const goodText = (q) => q.type === 'num' ? withUnit(q.a, q.unit) : q.choices[q.correct];

  function answer(ans) {
    if (!S || S.answered) return;
    const q = S.qs[S.i];
    const good = isGood(q, ans);
    S.answers[S.i] = ans;
    record(q, good);
    if (S.opts.mode === 'exam') return next();
    S.answered = true;
    renderQ();
  }

  function next() {
    S.i++; S.answered = false;
    if (S.i >= S.qs.length) renderEnd(); else renderQ();
  }

  function renderQ() {
    const q = S.qs[S.i];
    const ans = S.answers[S.i];
    const show = S.answered;
    const head = h('div', { class: 'tr-head' },
      h('span', { class: 'theme-tag' }, TH[q.t]), ' ',
      h('span', { class: 'muted' }, `${q.label} · ${S.i + 1}/${S.qs.length}`),
      h('div', { class: 'bar' }, h('div', { style: `width:${100 * S.i / S.qs.length}%` })));
    let body;
    if (q.type === 'num') {
      if (show) body = h('div', { class: 'center' }, h('div', { class: 'title', style: 'font-size:2.2rem' }, goodText(q)));
      else {
        const inp = h('input', { type: 'number', inputmode: 'decimal', placeholder: q.unit ? `en ${q.unit}` : '?', 'aria-label': 'Votre réponse' });
        const go = () => { const v = Number(String(inp.value).replace(/\s/g, '').replace(',', '.')); if (inp.value !== '' && Number.isFinite(v)) answer(v); };
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
        setTimeout(() => inp.focus({ preventScroll: true }), 30);
        body = h('div', {}, inp, h('button', { class: 'btn block', style: 'margin-top:10px', onclick: go }, 'Valider'));
      }
    } else {
      body = h('div', { class: `choices${q.two ? ' two' : ''}` }, q.choices.map((c, i) => h('button', {
        class: `choice${show ? (i === q.correct ? ' right' : ' dim') + (i === ans ? ' picked' : '') : ''}`,
        disabled: show, onclick: () => answer(i),
      }, h('span', { class: 'kbd' }, i + 1), ' ', c)));
    }
    const feedback = show ? h('div', {},
      h('h3', { class: 'center', style: 'margin:14px 0 0' }, isGood(q, ans) ? '✅ Juste' : `❌ Raté${q.type === 'num' ? ` (vous : ${answerText(q, ans)})` : ''}`),
      h('div', { class: 'explain' }, '📌 ', q.ex),
      h('button', { class: 'btn block', style: 'margin-top:12px', id: 'tr-next', onclick: next }, S.i + 1 < S.qs.length ? 'Question suivante ↵' : 'Voir mon résultat ↵')) : null;
    root.replaceChildren(h('div', { class: 'tr-card' }, head,
      q.context ? h('div', { class: 'context' }, q.context) : null,
      h('h3', {}, q.q), body, feedback,
      h('p', { class: 'center', style: 'margin:12px 0 0' }, h('button', { class: 'linkish', onclick: stop }, 'Arrêter l\'entraînement'))));
    if (show) setTimeout(() => document.getElementById('tr-next')?.focus({ preventScroll: true }), 30);
  }

  function stop() { S = null; renderHome(); }

  function renderEnd() {
    const n = S.qs.length;
    const good = S.qs.filter((q, i) => isGood(q, S.answers[i])).length;
    const note = Math.round((20 * good / n) * 10) / 10;
    const mention = note >= 18 ? '🏆 Irréprochable' : note >= 14 ? '🔥 Très bien' : note >= 10 ? '👍 Validé' : '📖 À retravailler';
    const byTheme = {};
    S.qs.forEach((q, i) => { const b = byTheme[q.t] || (byTheme[q.t] = [0, 0]); b[1]++; if (isGood(q, S.answers[i])) b[0]++; });
    const wrong = S.qs.map((q, i) => ({ q, a: S.answers[i] })).filter((x) => !isGood(x.q, x.a));
    const secs = Math.round((Date.now() - S.t0) / 1000);
    const opts = S.opts;
    root.replaceChildren(h('div', { class: 'tr-card' },
      h('div', { class: 'center' },
        h('div', { class: 'title', style: 'font-size:3rem' }, `${fmt(note)}/20`),
        h('p', {}, h('b', {}, mention), ` · ${good}/${n} bonnes réponses · ${Math.floor(secs / 60)} min ${secs % 60} s`)),
      h('table', {}, Object.entries(byTheme).map(([t, [g, tot]]) => h('tr', {}, h('td', {}, TH[t]), h('td', { style: 'width:45%' }, h('div', { class: 'bar' }, h('div', { style: `width:${100 * g / tot}%` }))), h('td', { class: 'muted' }, `${g}/${tot}`)))),
      wrong.length ? h('div', {},
        h('h3', {}, `À revoir (${wrong.length})`),
        wrong.map(({ q, a }) => h('div', { class: 'miss' },
          q.context ? h('div', { class: 'muted' }, q.context) : null,
          h('div', {}, h('b', {}, q.q)),
          h('div', { class: 'bad' }, '✗ Votre réponse : ', answerText(q, a)),
          h('div', { class: 'ok' }, '✓ ', goodText(q)),
          h('div', { class: 'muted' }, q.ex)))) : h('p', { class: 'ok center' }, 'Sans faute !'),
      h('div', { class: 'row', style: 'margin-top:14px' },
        wrong.length ? h('button', { class: 'btn', onclick: () => start(opts, shuffle(wrong.map(({ q }) => reshuffle(q)))) }, `Refaire mes ${wrong.length} erreur${wrong.length > 1 ? 's' : ''}`) : null,
        h('button', { class: 'btn alt', onclick: () => start(opts) }, 'Nouvelle série'),
        h('button', { class: 'btn alt', onclick: stop }, 'Réglages'))));
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function reshuffle(q) {
    if (q.type !== 'mcq' || q.two) return { ...q };
    const order = shuffle(q.choices.map((_, i) => i));
    return { ...q, choices: order.map((i) => q.choices[i]), correct: order.indexOf(q.correct) };
  }

  // ---------------------------------------------------------- accueil : stats par chapitre
  function renderHome() {
    const per = {};
    for (const s of Object.values(stats)) { const b = per[s.t] || (per[s.t] = [0, 0]); b[0] += s.ok; b[1] += s.ok + s.ko; }
    const seen = Object.keys(per).length;
    root.replaceChildren(seen ? h('div', { class: 'tr-card' },
      h('h3', { style: 'margin-top:0' }, '📊 Mes résultats par chapitre'),
      h('table', {}, Object.entries(TH).map(([t, label]) => {
        const [g, tot] = per[t] || [0, 0];
        const pct = tot ? Math.round(100 * g / tot) : 0;
        return h('tr', {}, h('td', {}, label), h('td', { style: 'width:45%' }, h('div', { class: 'bar' }, h('div', { style: `width:${pct}%` }))), h('td', { class: 'muted' }, tot ? `${pct} % (${tot} rép.)` : 'pas encore'));
      })),
      h('p', { class: 'muted', style: 'font-size:.85rem' }, 'Enregistré uniquement dans ce navigateur. ',
        h('button', { class: 'linkish', onclick: () => { if (confirm('Effacer toutes vos statistiques ?')) { stats = {}; save(); renderHome(); } } }, 'Réinitialiser'))) : '');
  }

  // ---------------------------------------------------------- branchements
  form.addEventListener('submit', (e) => { e.preventDefault(); start(readForm()); });
  document.querySelectorAll('[data-train]').forEach((b) => b.addEventListener('click', () => {
    start({ themes: [b.dataset.train], types: ['qcm', 'vf', 'cas', 'chiffres', 'articles'], n: 5, mode: 'revision', weak: true });
  }));
  document.addEventListener('keydown', (e) => {
    if (!S || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const q = S.qs[S.i];
    if (!S.answered && q && q.type === 'mcq' && /^[1-4]$/.test(e.key) && Number(e.key) <= q.choices.length) answer(Number(e.key) - 1);
  });
  const count = candidates(Object.keys(TH), ['qcm', 'vf', 'cas', 'chiffres', 'articles']).length;
  const c = document.getElementById('train-count');
  if (c) c.textContent = count;
  renderHome();
})();
