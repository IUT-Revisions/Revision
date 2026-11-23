// GabouLearn — « Mon plan » : objectif de moyenne du semestre, cible par ressource qui se rééquilibre,
// points forts / points faibles, priorités, temps de travail, export PDF signé GabouLearn.
(() => {
  'use strict';
  const box = document.getElementById('plan');
  if (!box || !window.GabouCalc) return;
  const KEY = 'gaboulearn-plan-v1';
  let P = {};
  try { P = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { P = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* navigation privée */ } };
  const fr = (x, d = 2) => (x == null || !Number.isFinite(x) ? '—' : x.toFixed(d).replace('.', ','));
  const parse = (v) => { const x = parseFloat(String(v).replace(',', '.')); return Number.isFinite(x) && x >= 0 && x <= 20 ? x : null; };
  const BIAS = { fort: 1.5, normal: 0, faible: -1.5 };
  const PAGES = { 'R3.01': 'r3-01-developpement-web', 'R3.02': 'r3-02-r3-03-dev-efficace-analyse', 'R3.03': 'r3-02-r3-03-dev-efficace-analyse', 'R3.04': 'r3-04-qualite-dev', 'R3.05': 'r3-05-programmation-systeme', 'R3.06': 'r3-06-reseaux', 'R3.07': 'r3-07-sql', 'R3.08': 'r3-08-probabilites', 'R3.09': 'r3-09-cryptographie', 'R3.11': 'r3-11-droit-du-numerique' };

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }

  // ------------------------------------------------------------------ modèle
  function plan() {
    const S = GabouCalc.state();
    const p = (P[S.key] = P[S.key] || { goal: 12, lock: {}, prof: {}, forts: '', faibles: '', hours: 6, name: '' });
    // poids de chaque élément dans la moyenne du semestre (moyenne des UE pondérée par les ECTS, une fois tout noté)
    const ectsTot = S.ues.reduce((a, u) => a + u[1], 0);
    const w = {};
    S.ues.forEach(([, ects, co]) => {
      const tot = Object.values(co).reduce((a, b) => a + b, 0);
      for (const [k, c] of Object.entries(co)) w[k] = (w[k] || 0) + (ects / ectsTot) * (c / tot);
    });
    const els = S.items.map((k) => ({ k, label: S.lib[k] || k, w: w[k] || 0, real: S.notes[k] ?? null, lock: S.notes[k] == null ? (p.lock[k] ?? null) : null, prof: p.prof[k] || 'normal' }));
    // cibles des éléments libres : t = clamp(base + biais) avec base choisie pour que la moyenne du semestre = objectif
    const fixedSum = els.reduce((a, e) => a + e.w * (e.real ?? e.lock ?? 0) * (e.real != null || e.lock != null ? 1 : 0), 0);
    const free = els.filter((e) => e.real == null && e.lock == null);
    const need = p.goal - fixedSum;
    const clamp = (x) => Math.min(20, Math.max(0, x));
    const sumFree = (b) => free.reduce((a, e) => a + e.w * clamp(b + BIAS[e.prof]), 0);
    let status = 'ok';
    if (!free.length) status = Math.abs(need) < 0.005 || need < 0 ? 'done' : 'missed';
    else if (sumFree(40) < need - 1e-6) status = 'impossible';
    else if (sumFree(-40) > need) status = 'assured';
    let lo = -40, hi = 40;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (sumFree(m) < need) lo = m; else hi = m; }
    const base = status === 'assured' ? -40 : hi;
    els.forEach((e) => { e.target = e.real ?? e.lock ?? Math.min(20, Math.ceil(clamp(base + BIAS[e.prof]) * 4 - 1e-9) / 4); e.state = e.real != null ? 'noté' : e.lock != null ? 'fixé' : 'auto'; });
    const val = Object.fromEntries(els.map((e) => [e.k, e.target]));
    const ues = S.ues.map(([name, ects, co]) => {
      const tot = Object.values(co).reduce((a, b) => a + b, 0);
      return { name, ects, avg: Object.entries(co).reduce((a, [k, c]) => a + c * val[k], 0) / tot };
    });
    const proj = ues.reduce((a, u) => a + u.avg * u.ects, 0) / ectsTot;
    // priorités : poids × difficulté, sur ce qui reste à évaluer
    const diff = { faible: 1.6, normal: 1, fort: 0.6 };
    const todo = els.filter((e) => e.real == null).map((e) => ({ ...e, score: e.w * diff[e.prof] })).sort((a, b) => b.score - a.score);
    const tot = todo.reduce((a, e) => a + e.score, 0) || 1;
    todo.forEach((e) => { e.hours = (p.hours * e.score) / tot; });
    return { S, p, els, ues, proj, status, todo };
  }

  // ------------------------------------------------------------------ rendu
  function render() {
    const M = plan();
    const { S, p, els, ues, proj, status, todo } = M;
    const goalIn = h('input', { type: 'text', inputmode: 'decimal', class: 'note-in', value: String(p.goal).replace('.', ','), 'aria-label': 'Objectif de moyenne du semestre' });
    goalIn.addEventListener('change', () => { const x = parse(goalIn.value); if (x != null) { p.goal = x; save(); render(); } });
    const hoursIn = h('input', { type: 'number', min: '1', max: '40', class: 'note-in', value: String(p.hours), 'aria-label': 'Heures de travail par semaine' });
    hoursIn.addEventListener('change', () => { const x = parseFloat(hoursIn.value); if (x > 0 && x <= 40) { p.hours = x; save(); render(); } });

    const msg = { ok: null, assured: ['ok', '✓ Objectif déjà assuré avec tes notes actuelles, même avec des 0 sur le reste.'], impossible: ['bad', '✗ Objectif hors d\'atteinte même avec 20 partout sur le reste : baisse l\'objectif ou débloque des cibles fixées.'], done: ['ok', 'Tout est noté ou fixé.'], missed: ['bad', 'Avec tes notes et cibles fixées, la moyenne n\'atteint pas l\'objectif.'] }[status];

    const rows = els.map((e) => {
      const prof = h('div', { class: 'seg mini' }, ['faible', 'normal', 'fort'].map((v) => h('button', { type: 'button', class: e.prof === v ? 'on ' + v : '', 'aria-pressed': String(e.prof === v), onclick: () => { p.prof[e.k] = v; save(); render(); } }, v === 'faible' ? '− faible' : v === 'fort' ? '+ fort' : '=')));
      let cell;
      if (e.state === 'noté') cell = h('span', { class: 'ok' }, fr(e.target), h('span', { class: 'muted small' }, ' (note réelle)'));
      else {
        const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'note-in' + (e.state === 'fixé' ? ' locked' : ''), value: fr(e.target), 'aria-label': `Cible ${e.k}` });
        inp.addEventListener('change', () => { const x = parse(inp.value); if (x != null) { p.lock[e.k] = x; save(); render(); } });
        cell = h('span', {}, inp, e.state === 'fixé' ? h('button', { type: 'button', class: 'linkish small', title: 'Laisser GabouLearn ajuster cette cible', onclick: () => { delete p.lock[e.k]; save(); render(); } }, ' 🔓 auto') : h('span', { class: 'muted small' }, ' auto'));
      }
      const page = PAGES[e.k];
      return h('tr', {},
        h('td', {}, e.k.startsWith('R') ? h('b', {}, e.k + ' ') : null, page ? h('a', { href: `../${page}/` }, e.label) : e.label),
        h('td', { class: 'small' }, `${fr(e.w * 100, 1)} %`),
        h('td', {}, prof),
        h('td', {}, cell));
    });

    box.replaceChildren(...[
      h('div', { class: 'box keep goal' },
        h('h4', {}, '🎯 Mon objectif pour le semestre'),
        h('p', {}, `Moyenne du ${S.sem} visée : `, goalIn, ' / 20 ', h('span', { class: 'muted small' }, `(BUT2 · parcours ${S.parcours} · ${S.regime === 'FA' ? 'alternance' : 'formation initiale'} · ${S.sem}, réglé dans le calculateur)`)),
        h('p', { class: 'small' }, 'La moyenne du semestre = moyenne des UE pondérée par les ECTS. Chaque ressource y pèse le « poids » indiqué ci-dessous (calculé depuis les coefficients officiels). Tes notes réelles sont reprises du calculateur ; tout le reste reçoit une ', h('b', {}, 'cible'), '. Modifie une cible : elle est fixée, et les cibles « auto » se rééquilibrent pour que l\'objectif reste atteint. Les points forts reçoivent une cible plus haute, les points faibles une cible plus basse.')),
      msg ? h('p', { class: msg[0] }, msg[1]) : null,
      h('div', { class: 'tbl' }, h('table', { class: 'calc-tbl' },
        h('tr', {}, h('th', {}, 'Ressource / élément'), h('th', {}, 'Poids dans le semestre'), h('th', {}, 'Pour toi'), h('th', {}, 'Note ou cible')),
        rows)),
      h('p', { class: 'center' }, Object.keys(p.lock).length ? h('button', { type: 'button', class: 'linkish', onclick: () => { p.lock = {}; save(); render(); } }, 'Tout repasser en auto') : null),
      h('div', { class: 'kpis' },
        h('div', { class: 'kpi' }, h('b', {}, fr(proj)), h('span', {}, `moyenne du ${S.sem} avec ces cibles`)),
        h('div', { class: 'kpi' }, h('b', {}, `${ues.filter((u) => u.avg >= 10).length} / ${ues.length}`), h('span', {}, 'UE à 10 ou plus avec ces cibles'))),
      h('div', { class: 'tbl' }, h('table', { class: 'calc-tbl' }, h('tr', {}, h('th', {}, 'UE'), h('th', {}, 'ECTS'), h('th', {}, 'Moyenne prévue')),
        ues.map((u) => h('tr', {}, h('td', {}, u.name), h('td', {}, u.ects), h('td', { class: u.avg >= 10 ? 'ok' : 'bad' }, fr(u.avg)))))),

      h('h3', {}, '💪 Mes points forts et points faibles'),
      h('p', { class: 'small muted' }, 'Coche « + fort » ou « − faible » dans le tableau, et note ce que tu veux garder en tête : ça apparaît dans ton PDF.'),
      h('div', { class: 'cols' },
        area('Mes points forts', 'forts', p, 'Ex. : algo, SQL, à l\'aise à l\'oral…'),
        area('Mes points faibles', 'faibles', p, 'Ex. : IPv6, signaux, je rends tard…')),

      h('h3', {}, '🗓️ Mon plan de travail'),
      h('p', {}, 'Temps de travail perso par semaine : ', hoursIn, ' h'),
      todo.length ? h('ol', { class: 'prio' }, todo.slice(0, 8).map((e) => h('li', {},
        h('b', {}, `${e.k.startsWith('R') ? e.k + ' ' : ''}${e.label}`), ` · vise ${fr(e.target)} · ≈ ${fr(e.hours, 1)} h / semaine`,
        e.prof === 'faible' ? h('span', { class: 'bad small' }, ' · point faible') : e.prof === 'fort' ? h('span', { class: 'ok small' }, ' · point fort') : null,
        PAGES[e.k] ? h('span', {}, ' · ', h('a', { href: `../${PAGES[e.k]}/` }, 'réviser sur GabouLearn')) : null))) : h('p', { class: 'ok' }, 'Plus rien à évaluer ce semestre. 🎯'),
      h('p', { class: 'small muted' }, 'Ordre = poids dans le semestre × difficulté (point faible ×1,6, point fort ×0,6). Le temps est réparti dans la même proportion.'),

      h('div', { class: 'box launch' },
        h('p', {}, 'Prénom à afficher sur le PDF (facultatif) : ', nameIn(p)),
        h('button', { class: 'btn', type: 'button', onclick: () => pdf(M) }, '📄 Télécharger mon plan en PDF (signé GabouLearn)'),
        h('p', { class: 'muted small' }, 'Le PDF est fabriqué dans ton navigateur : rien n\'est envoyé.')),
    ].filter(Boolean));
  }
  function area(label, key, p, ph) {
    const t = h('textarea', { rows: '4', class: 'txt', placeholder: ph, 'aria-label': label });
    t.value = p[key] || '';
    t.addEventListener('input', () => { p[key] = t.value.slice(0, 1500); save(); });
    return h('label', { class: 'box' }, h('b', {}, label), t);
  }
  function nameIn(p) {
    const i = h('input', { type: 'text', class: 'note-in wide', maxlength: '40', value: p.name || '', 'aria-label': 'Prénom' });
    i.addEventListener('input', () => { p.name = i.value.slice(0, 40); save(); });
    return i;
  }

  // ------------------------------------------------------------------ PDF signé GabouLearn
  async function pdf(M) {
    const { S, p, els, ues, proj, todo } = M;
    const G = window.GabouPDF;
    const doc = G.create({ title: `Plan GabouLearn ${S.sem}`, author: 'GabouLearn' });
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const payload = JSON.stringify({ k: S.key, g: p.goal, e: els.map((e) => [e.k, e.target, e.state, e.prof]), d: now.toISOString().slice(0, 10) });
    const seal = await G.seal(payload);
    const W = 595, M0 = 40;
    let y;
    const header = (pg) => {
      doc.rect(0, 842 - 96, W, 96, [0.06, 0.11, 0.2]);
      doc.rect(0, 842 - 99, W, 3, [0.91, 0.4, 0.16]);
      doc.text(M0, 842 - 38, 'GabouLearn', { size: 22, bold: true, color: [1, 1, 1] });
      doc.text(M0 + 150, 842 - 38, 'gaboulearn.fr', { size: 9, color: [0.65, 0.72, 0.85] });
      doc.text(M0, 842 - 62, `Mon plan · BUT2 ${S.sem} · parcours ${S.parcours} · ${S.regime === 'FA' ? 'alternance' : 'formation initiale'}`, { size: 13, color: [0.9, 0.93, 1] });
      doc.text(M0, 842 - 80, `${p.name ? p.name + ' · ' : ''}généré le ${date}`, { size: 9, color: [0.65, 0.72, 0.85] });
      doc.text(W - M0, 842 - 38, `page ${pg}`, { size: 8, color: [0.65, 0.72, 0.85], align: 'right' });
      y = 842 - 125;
    };
    const footer = () => {
      doc.line(M0, 46, W - M0, 46, [0.85, 0.87, 0.92]);
      doc.text(M0, 34, `Signé GabouLearn · sceau ${seal} · ${date}`, { size: 8, bold: true, color: [0.91, 0.4, 0.16] });
      doc.text(M0, 23, 'Plan indicatif calculé avec les coefficients officiels du BUT2 informatique (IUT d\'Aix). Les cibles ne sont pas des notes officielles.', { size: 7, color: [0.45, 0.48, 0.55] });
    };
    let pg = 1;
    const need = (hgt) => { if (y - hgt < 60) { footer(); doc.page(); pg++; header(pg); } };
    header(pg);

    // chiffres clés
    const kp = [[fr(p.goal), 'objectif du semestre'], [fr(proj), 'moyenne avec ces cibles'], [`${els.filter((e) => e.state === 'noté').length} / ${els.length}`, 'éléments déjà notés'], [`${p.hours} h`, 'de travail par semaine']];
    const cw = (W - 2 * M0 - 30) / 4;
    kp.forEach(([v, l], i) => {
      const x = M0 + i * (cw + 10);
      doc.rect(x, y - 52, cw, 52, [0.96, 0.97, 0.99]);
      doc.text(x + 10, y - 26, v, { size: 18, bold: true, color: i === 0 ? [0.91, 0.4, 0.16] : [0.06, 0.11, 0.2] });
      doc.text(x + 10, y - 42, l, { size: 8, color: [0.4, 0.43, 0.5] });
    });
    y -= 78;

    // tableau des ressources
    doc.text(M0, y, 'Ressource par ressource', { size: 13, bold: true }); y -= 18;
    const cols = [M0, M0 + 250, M0 + 330, M0 + 410];
    const head = () => { ['Élément', 'Poids', 'Pour moi', 'Note / cible'].forEach((t, i) => doc.text(cols[i], y, t, { size: 8, bold: true, color: [0.4, 0.43, 0.5] })); y -= 6; doc.line(M0, y, W - M0, y, [0.85, 0.87, 0.92]); y -= 12; };
    head();
    els.forEach((e, i) => {
      need(16); if (y > 842 - 135) head();
      if (i % 2) doc.rect(M0, y - 4, W - 2 * M0, 15, [0.97, 0.98, 1]);
      doc.text(cols[0], y, `${e.k.startsWith('R') ? e.k + ' ' : ''}${e.label}`.slice(0, 48), { size: 9 });
      doc.text(cols[1], y, `${fr(e.w * 100, 1)} %`, { size: 9 });
      doc.text(cols[2], y, e.prof === 'fort' ? '+ point fort' : e.prof === 'faible' ? '- point faible' : '', { size: 9, color: e.prof === 'faible' ? [0.84, 0.27, 0.27] : [0.18, 0.62, 0.42] });
      doc.text(cols[3], y, `${fr(e.target)}  ${e.state === 'noté' ? '(note réelle)' : e.state === 'fixé' ? '(cible fixée)' : '(cible)'}`, { size: 9, bold: e.state !== 'noté', color: e.state === 'noté' ? [0.18, 0.62, 0.42] : [0.91, 0.4, 0.16] });
      y -= 15;
    });
    y -= 10;
    need(30 + ues.length * 15);
    doc.text(M0, y, 'Moyennes d\'UE prévues', { size: 13, bold: true }); y -= 18;
    ues.forEach((u) => { doc.text(M0, y, u.name, { size: 9 }); doc.text(M0 + 250, y, `${u.ects} ECTS`, { size: 9, color: [0.4, 0.43, 0.5] }); doc.text(M0 + 330, y, fr(u.avg), { size: 10, bold: true, color: u.avg >= 10 ? [0.18, 0.62, 0.42] : [0.84, 0.27, 0.27] }); y -= 15; });

    y -= 10;
    need(40);
    doc.text(M0, y, 'Mes priorités', { size: 13, bold: true }); y -= 18;
    todo.slice(0, 8).forEach((e, i) => {
      need(16);
      doc.text(M0, y, `${i + 1}. ${e.k.startsWith('R') ? e.k + ' ' : ''}${e.label}`, { size: 9.5, bold: true });
      doc.text(M0 + 250, y, `viser ${fr(e.target)} · ${fr(e.hours, 1)} h / semaine${e.prof === 'faible' ? ' · point faible' : ''}`, { size: 9 });
      y -= 15;
    });
    for (const [t, key] of [['Mes points forts', 'forts'], ['Mes points faibles', 'faibles']]) {
      if (!p[key] || !p[key].trim()) continue;
      const lines = doc.wrap(p[key].trim(), W - 2 * M0, 9.5);
      y -= 8; need(24 + lines.length * 13);
      doc.text(M0, y, t, { size: 13, bold: true }); y -= 17;
      lines.forEach((l) => { need(13); doc.text(M0, y, l, { size: 9.5 }); y -= 13; });
    }
    footer();
    doc.download(`plan-gaboulearn-${S.sem.toLowerCase()}.pdf`);
  }

  document.addEventListener('gabou:calc', render);
  render();
})();
