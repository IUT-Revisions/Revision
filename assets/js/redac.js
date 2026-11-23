// GabouLearn — cas pratiques rédigés (mode contrôle), commun à tous les cours
// Le cours enregistre ses modèles de cas via CASEGEN.add() (voir cas.js du cours).
(() => {
  const G = window.CASEGEN;
  const root = document.getElementById('redac');
  const form = document.getElementById('redac-form');
  if (!G || !root || !form) return;
  const TH = (window.BANK && window.BANK.THEMES) || {};

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
  const color = (p) => (p >= 75 ? 'var(--good)' : p >= 50 ? 'var(--sun)' : 'var(--bad)');
  const label = (p) => (p >= 85 ? 'Excellent' : p >= 70 ? 'Bien' : p >= 50 ? 'Correct, mais incomplet' : p >= 30 ? 'Partiel' : 'Insuffisant');

  // historique local (navigateur)
  const KEY = 'rev-redac-' + (document.body.dataset.course || 'cours');
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch { hist = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(hist.slice(-300))); } catch {} };

  let S = null, timer = null;

  function readForm() {
    const fd = new FormData(form);
    return { themes: fd.getAll('rtheme'), n: Number(fd.get('rn')), minutes: Number(fd.get('rtime')) };
  }

  function start(opts) {
    if (!opts.themes.length) { root.replaceChildren(h('p', { class: 'err' }, 'Cochez au moins un chapitre.')); return; }
    // on évite de tirer deux fois le même modèle dans une série
    const used = new Set(), cases = [];
    for (let tries = 0; cases.length < opts.n && tries < 200; tries++) {
      const c = G.generate(opts.themes);
      if (used.has(c.tid) && used.size < G.TEMPLATES.filter((t) => opts.themes.includes(t.t)).length) continue;
      used.add(c.tid); cases.push(c);
    }
    S = { opts, cases, i: 0, results: [] };
    showCase();
  }

  function stopTimer() { clearInterval(timer); timer = null; }

  function showCase() {
    stopTimer();
    const c = S.cases[S.i];
    const ta = h('textarea', { class: 'redac-ta', placeholder: 'Problème juridique → Règle (articles) → Application aux faits → Conclusion', spellcheck: 'true' });
    const draftKey = 'gd-draft';
    const wc = h('span', { class: 'muted' }, '0 mot');
    const clock = h('span', { class: 'muted' });
    ta.addEventListener('input', () => {
      const n = (ta.value.trim().match(/\S+/g) || []).length;
      wc.textContent = `${n} mot${n > 1 ? 's' : ''}`;
      try { sessionStorage.setItem(draftKey, ta.value); } catch {}
    });
    const correct = () => {
      if (!ta.value.trim()) { ta.focus(); return; }
      stopTimer();
      const r = G.score(ta.value, c);
      S.results[S.i] = { c, text: ta.value, r };
      hist.push({ t: c.t, title: c.title, pct: r.pct, d: Date.now() });
      save();
      try { sessionStorage.removeItem(draftKey); } catch {}
      showResult();
    };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) correct(); });

    let hintShown = 0;
    const hintBox = h('div', {});
    const hint = () => {
      const notions = c.keys.slice().sort((a, b) => b.w - a.w);
      if (hintShown >= notions.length) return;
      hintBox.append(h('div', { class: 'explain' }, 'Pensez à : ', notions[hintShown].label));
      hintShown++;
    };

    root.replaceChildren(h('div', { class: 'tr-card' },
      h('div', { class: 'tr-head' }, h('span', { class: 'theme-tag' }, TH[c.t] || c.t), ' ', h('span', { class: 'muted' }, `Cas ${S.i + 1}/${S.cases.length} · ${c.title}`), ' ', clock),
      h('div', { class: 'context', style: 'margin-top:10px' }, c.facts),
      h('h3', {}, '', c.question),
      ta,
      h('div', { class: 'row', style: 'align-items:center;margin-top:8px' }, wc,
        h('button', { class: 'btn alt', type: 'button', onclick: hint }, 'Indice'),
        h('button', { class: 'btn', type: 'button', onclick: correct }, 'Corriger (Ctrl+Entrée)')),
      hintBox,
      h('p', { class: 'center', style: 'margin:12px 0 0' }, h('button', { class: 'linkish', onclick: () => { stopTimer(); S = null; renderHome(); } }, 'Arrêter'))));
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => ta.focus({ preventScroll: true }), 300);

    if (S.opts.minutes) {
      const end = Date.now() + S.opts.minutes * 60000;
      const tick = () => {
        const left = Math.max(0, end - Date.now());
        clock.textContent = `· ${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
        clock.style.color = left < 60000 ? 'var(--bad)' : '';
        if (!left) { stopTimer(); if (ta.value.trim()) correct(); else { ta.value = '(pas de réponse)'; correct(); } }
      };
      tick(); timer = setInterval(tick, 500);
    }
  }

  function showResult() {
    const { c, text, r } = S.results[S.i];
    const last = S.i + 1 >= S.cases.length;
    const m = r.method;
    const tips = [
      [m.probleme, 'Problème juridique posé'],
      [m.article, 'Règle de droit citée (article)'],
      [m.developpe, 'Réponse développée (50 mots ou plus)'],
      [m.conclusion, 'Conclusion explicite (« donc », « en conclusion »…)'],
    ];
    root.replaceChildren(h('div', { class: 'tr-card' },
      h('div', { class: 'tr-head' }, h('span', { class: 'theme-tag' }, TH[c.t] || c.t), ' ', h('span', { class: 'muted' }, `Cas ${S.i + 1}/${S.cases.length} · ${c.title}`)),
      h('div', { class: 'center', style: 'margin:10px 0' },
        h('div', { class: 'title', style: `font-size:3rem;color:${color(r.pct)}` }, `${r.pct} %`),
        h('div', {}, h('b', {}, label(r.pct)), h('span', { class: 'muted' }, ` · similarité par notions clés · ${r.found.length}/${r.found.length + r.missing.length} notions`)),
        h('div', { class: 'bar', style: 'margin-top:8px;height:10px' }, h('div', { style: `width:${r.pct}%;background:${color(r.pct)}` }))),
      r.warnings.map((w) => h('div', { class: 'explain', style: 'border-left-color:var(--bad)' }, '', w)),
      h('div', { class: 'cols' },
        h('div', {}, h('h4', {}, 'Notions présentes'), r.found.length ? h('ul', { class: 'kl ok' }, r.found.map((x) => h('li', {}, x))) : h('p', { class: 'muted' }, 'Aucune.')),
        h('div', {}, h('h4', {}, 'Notions manquantes'), r.missing.length ? h('ul', { class: 'kl bad' }, r.missing.map((x) => h('li', {}, x))) : h('p', { class: 'ok' }, 'Rien ne manque'))),
      h('h4', {}, 'Méthode'),
      h('ul', { class: 'kl' }, tips.map(([ok, t]) => h('li', { class: ok ? 'ok' : 'muted' }, ok ? '✓ ' : '○ ', t))),
      h('details', {}, h('summary', {}, 'Votre copie'), h('div', { class: 'copy' }, text)),
      h('h4', {}, 'Corrigé type'),
      h('div', { class: 'model' }, c.model),
      h('p', { class: 'muted', style: 'font-size:.85rem' }, 'Le pourcentage mesure la présence des notions attendues, pas la qualité du raisonnement : relisez le corrigé pour vérifier votre argumentation.'),
      h('div', { class: 'row', style: 'margin-top:12px' },
        h('button', { class: 'btn alt', onclick: () => { S.cases[S.i] = c; showCase(); } }, 'Réessayer ce cas'),
        h('button', { class: 'btn', onclick: () => { S.i++; last ? showEnd() : showCase(); } }, last ? 'Voir le bilan' : 'Cas suivant'))));
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showEnd() {
    const res = S.results.filter(Boolean);
    const avg = Math.round(res.reduce((s, x) => s + x.r.pct, 0) / res.length);
    root.replaceChildren(h('div', { class: 'tr-card' },
      h('div', { class: 'center' },
        h('div', { class: 'title', style: `font-size:3rem;color:${color(avg)}` }, `${avg} %`),
        h('p', {}, h('b', {}, label(avg)), ` · moyenne sur ${res.length} cas · environ ${Math.round(avg / 5)}/20`)),
      h('table', {}, res.map((x) => h('tr', {}, h('td', {}, x.c.title), h('td', { class: 'muted' }, TH[x.c.t] || ''), h('td', { style: `font-weight:800;color:${color(x.r.pct)}` }, `${x.r.pct} %`)))),
      h('div', { class: 'row', style: 'margin-top:12px' },
        h('button', { class: 'btn', onclick: () => start(S.opts) }, 'Nouvelle série'),
        h('button', { class: 'btn alt', onclick: () => { S = null; renderHome(); } }, 'Réglages'))));
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderHome() {
    if (!hist.length) { root.replaceChildren(); return; }
    const per = {};
    for (const x of hist) { const b = per[x.t] || (per[x.t] = []); b.push(x.pct); }
    root.replaceChildren(h('div', { class: 'tr-card' },
      h('h3', { style: 'margin-top:0' }, `Mes cas rédigés (${hist.length})`),
      h('table', {}, Object.entries(TH).map(([t, lab]) => {
        const a = per[t];
        const m = a ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : 0;
        return h('tr', {}, h('td', {}, lab), h('td', { style: 'width:45%' }, h('div', { class: 'bar' }, h('div', { style: `width:${m}%;background:${color(m)}` }))), h('td', { class: 'muted' }, a ? `${m} % (${a.length} cas)` : 'pas encore'));
      })),
      h('p', { class: 'muted', style: 'font-size:.85rem' }, 'Enregistré uniquement dans ce navigateur. ',
        h('button', { class: 'linkish', onclick: () => { if (confirm('Effacer l\'historique des cas rédigés ?')) { hist = []; save(); renderHome(); } } }, 'Réinitialiser'))));
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); start(readForm()); });
  document.querySelectorAll('[data-redac]').forEach((b) => b.addEventListener('click', () => start({ themes: [b.dataset.redac], n: 1, minutes: 0 })));
  const cnt = document.getElementById('redac-count');
  if (cnt) cnt.textContent = G.count;
  renderHome();
})();
