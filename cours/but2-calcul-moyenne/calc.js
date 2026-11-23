// GabouLearn — calculateur de moyennes d'UE du BUT2 informatique (IUT d'Aix) : parcours A/B, FI/FA, S3/S4.
// Les notes restent dans le navigateur (localStorage). Rien n'est envoyé.
(() => {
  'use strict';
  const C = window.COEF_BUT2, LIB = window.LIBELLES_BUT2;
  const app = document.getElementById('calc');
  if (!C || !app) return;
  const KEY = 'gaboulearn-calc-but2-v1';
  let st = { parcours: 'B', regime: 'FA', sem: 'S3', but: 10, notes: {} };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { /* ignore */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* navigation privée */ } };
  const fr = (x, d = 2) => x.toFixed(d).replace('.', ',');
  const parse = (v) => { const x = parseFloat(String(v).replace(',', '.')); return Number.isFinite(x) && x >= 0 && x <= 20 ? x : null; };
  const cfg = () => `${st.parcours}-${st.regime}`;
  const notesOf = (sem) => { const k = `${cfg()}-${sem}`; return (st.notes[k] = st.notes[k] || {}); };

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const seg = (name, opts, cur, set) => h('div', { class: 'seg', role: 'group', 'aria-label': name },
    h('span', { class: 'seg-l' }, name),
    opts.map(([v, lab]) => h('button', { type: 'button', class: v === cur ? 'on' : '', 'aria-pressed': String(v === cur), onclick: () => { set(v); save(); render(); } }, lab)));

  // éléments évalués du semestre, ordonnés : SAÉ, stage/alternance, portfolio, ressources
  function items(sem) {
    const ues = C[cfg()][sem];
    const all = new Set(ues.flatMap(([, , co]) => Object.keys(co)));
    const rank = (k) => (/^S\d/.test(k) ? 0 : k === 'Alternance' || k === 'Stage' ? 1 : k === 'Portfolio' ? 2 : 3);
    return [...all].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'fr', { numeric: true }));
  }
  function ue(co, notes) {
    let s = 0, w = 0, rest = 0;
    for (const [k, c] of Object.entries(co)) { if (notes[k] != null) { s += notes[k] * c; w += c; } else rest += c; }
    return { avg: w ? s / w : null, done: w, rest, sum: s, tot: w + rest };
  }
  // moyenne qu'il faut sur les éléments restants pour atteindre `but` dans l'UE
  const need = (u, but) => (u.rest ? (but * u.tot - u.sum) / u.rest : null);

  function render() {
    const sem = st.sem;
    const notes = notesOf(sem);
    const ues = C[cfg()][sem];
    const list = items(sem);

    const inputs = h('div', { class: 'tbl' }, h('table', { class: 'calc-tbl' },
      h('tr', {}, h('th', {}, 'Élément'), h('th', {}, 'Coefficient dans chaque UE'), h('th', {}, 'Ta note /20')),
      list.map((k) => {
        const where = ues.filter(([, , co]) => co[k]).map(([n, , co]) => `${n.split(' ')[0]} (${co[k]})`).join(' · ');
        const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'note-in', placeholder: '—', 'aria-label': `Note ${k}`, value: notes[k] != null ? String(notes[k]).replace('.', ',') : '' });
        inp.addEventListener('input', () => { const x = parse(inp.value); if (x == null) delete notes[k]; else notes[k] = x; inp.classList.toggle('bad-in', inp.value.trim() !== '' && x == null); save(); results(); });
        return h('tr', {}, h('td', {}, k.startsWith('R') ? h('b', {}, k + ' ') : null, LIB[k] || k), h('td', { class: 'muted small' }, where), h('td', {}, inp));
      })));

    const out = h('div', { class: 'calc-out' });
    const butIn = h('input', { type: 'text', inputmode: 'decimal', class: 'note-in', value: String(st.but).replace('.', ','), 'aria-label': 'Moyenne visée par UE' });
    butIn.addEventListener('input', () => { const x = parse(butIn.value); if (x != null) { st.but = x; save(); results(); } });

    function results() {
      const rows = ues.map(([name, ects, co]) => ({ name, ects, u: ue(co, notes) }));
      let s = 0, w = 0, valid = 0, ps = 0, pw = 0;
      rows.forEach(({ ects, u }) => {
        if (u.avg != null) { ps += u.avg * ects; pw += ects; }
        if (u.avg != null && !u.rest) { s += u.avg * ects; w += ects; if (u.avg >= 10) valid += ects; }
      });
      const t = h('table', { class: 'calc-tbl' },
        h('tr', {}, h('th', {}, 'UE'), h('th', {}, 'ECTS'), h('th', {}, 'Moyenne actuelle'), h('th', {}, `Il te faut, sur le reste, pour ${fr(st.but, 1)}`)),
        rows.map(({ name, ects, u }) => {
          const n = need(u, st.but);
          const needTxt = n == null ? (u.avg >= st.but ? '✓ atteint' : '✗ manqué') : n <= 0 ? '✓ déjà assuré' : n > 20 ? '✗ hors d\'atteinte' : fr(n);
          return h('tr', {}, h('td', {}, h('b', {}, name)), h('td', {}, ects),
            h('td', { class: u.avg == null ? 'muted' : u.avg >= 10 ? 'ok' : 'bad' }, u.avg == null ? '—' : fr(u.avg), u.avg != null && u.rest ? h('span', { class: 'muted small' }, ` (${Math.round((u.done / u.tot) * 100)} % des coef)`) : null),
            h('td', { class: n == null ? (u.avg >= st.but ? 'ok' : 'bad') : n <= 0 ? 'ok' : n > 20 ? 'bad' : '' }, needTxt));
        }));
      // regroupement de compétences sur l'année (si S3 et S4 complets)
      const n3 = notesOf('S3'), n4 = notesOf('S4');
      const r3 = C[cfg()].S3.map(([, , co]) => ue(co, n3)), r4 = C[cfg()].S4.map(([, , co]) => ue(co, n4));
      const rcue = r3.map((a, i) => (a.avg != null && !a.rest && r4[i].avg != null && !r4[i].rest ? (a.avg + r4[i].avg) / 2 : null));
      const comp = ['Réaliser', 'Optimiser', 'Administrer', 'Gérer', 'Conduire', 'Collaborer'];
      out.replaceChildren(...[
        h('div', { class: 'tbl' }, t),
        h('div', { class: 'kpis' },
          w === 30
            ? h('div', { class: 'kpi' }, h('b', {}, fr(s / w)), h('span', {}, 'moyenne du semestre (pondérée ECTS)'))
            : h('div', { class: 'kpi' }, h('b', {}, pw ? fr(ps / pw) : '—'), h('span', {}, 'moyenne provisoire, sur les notes saisies')),
          h('div', { class: 'kpi' }, h('b', {}, `${valid} / 30`), h('span', {}, 'ECTS d\'UE complètes à 10 ou plus'))),
        rcue.some((x) => x != null) ? h('div', { class: 'box keep' }, h('h4', {}, 'Regroupements de compétences (RCUE) de l\'année'),
          h('p', {}, rcue.map((x, i) => (x == null ? null : h('span', { class: 'rc ' + (x >= 10 ? 'ok' : 'bad') }, `${comp[i]} ${fr(x)}`)))),
          h('p', { class: 'muted small' }, 'RCUE = moyenne de l\'UE du S3 et de l\'UE du S4 de la même compétence. Une UE sous 10 peut être compensée si son RCUE atteint 10.')) : null,
      ].filter(Boolean));
    }

    app.replaceChildren(
      h('div', { class: 'segs' },
        seg('Parcours', [['A', 'A · Réalisation d\'applications'], ['B', 'B · Déploiement d\'applications']], st.parcours, (v) => { st.parcours = v; }),
        seg('Régime', [['FI', 'FI · formation initiale'], ['FA', 'FA · alternance']], st.regime, (v) => { st.regime = v; }),
        seg('Semestre', [['S3', 'S3'], ['S4', 'S4']], st.sem, (v) => { st.sem = v; })),
      h('p', { class: 'muted small' }, `BUT2 · parcours ${st.parcours} · ${st.regime === 'FA' ? 'alternance' : 'formation initiale'} · ${sem}. Tes notes sont gardées séparément pour chaque combinaison.`),
      inputs,
      h('p', {}, 'Moyenne visée par UE : ', butIn, h('span', { class: 'muted small' }, ' (10 pour valider, ou ton propre objectif)')),
      out,
      h('p', { class: 'center' }, h('button', { type: 'button', class: 'linkish', onclick: () => { if (confirm(`Effacer les notes du ${sem} (parcours ${st.parcours}, ${st.regime}) ?`)) { st.notes[`${cfg()}-${sem}`] = {}; save(); render(); } } }, `Effacer mes notes du ${sem}`)));
    results();
  }
  render();

  // utilisé par l'import du relevé : charge une configuration et des notes, puis redessine
  window.GabouCalc = {
    has: (parcours, regime, sem) => !!(C[`${parcours}-${regime}`] && C[`${parcours}-${regime}`][sem]),
    load({ parcours, regime, sem, notes }) {
      st.parcours = parcours; st.regime = regime; st.sem = sem;
      const known = new Set(items(sem));
      const target = notesOf(sem);
      for (const [k, v] of Object.entries(notes)) if (known.has(k) && v != null) target[k] = v;
      save(); render();
      app.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  };
})();
