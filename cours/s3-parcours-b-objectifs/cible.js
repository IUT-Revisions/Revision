// GabouLearn — S3 parcours B : calculateur de moyennes d'UE (coefficients ScoDoc de l'IUT d'Aix, parcours B en alternance).
// Les notes saisies restent dans le navigateur (localStorage), rien n'est envoyé.
(() => {
  'use strict';
  const KEY = 'gaboulearn-s3b-notes-v1';
  // [code, nom, cible, niveau]
  const RES = [
    ['R3.01', 'Développement web', 15, 'solide'],
    ['R3.02', 'Développement efficace', 16, 'fort'],
    ['R3.03', 'Analyse', 16, 'fort'],
    ['R3.04', 'Qualité de développement', 16, 'cœur'],
    ['R3.05', 'Programmation système', 16, 'cœur'],
    ['R3.06', 'Architecture des réseaux', 16, 'cœur'],
    ['R3.07', 'SQL dans un langage', 15, 'solide'],
    ['R3.08', 'Probabilités', 15, 'solide'],
    ['R3.09', 'Cryptographie et sécurité', 17, 'cœur'],
    ['R3.10', 'Management des SI', 15, 'solide'],
    ['R3.11', 'Droit des contrats et du numérique', 15, 'solide'],
    ['R3.12', 'Anglais', 16, 'fort'],
    ['R3.13', 'Communication', 15, 'solide'],
    ['R3.14', 'PPP', 14, 'solide'],
    ['SAE', 'SAÉ 3.B.01 Services applicatifs', 16, 'cœur'],
    ['ALT', 'Alternance S3', 16, 'cœur'],
  ];
  // coefficients par UE (bulletin ScoDoc S3, IUT d'Aix, BUT info FA parcours B)
  const UE = [
    ['UE3.1B Réaliser', 6, { 'R3.01': 10, 'R3.02': 12, 'R3.03': 12, 'R3.04': 16, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, SAE: 20, ALT: 20 }],
    ['UE3.2B Optimiser', 6, { 'R3.01': 9, 'R3.02': 9, 'R3.03': 9, 'R3.08': 10, 'R3.09': 10, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, SAE: 20, ALT: 26 }],
    ['UE3.3B Administrer', 6, { 'R3.01': 10, 'R3.05': 10, 'R3.06': 10, 'R3.09': 14, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, SAE: 20, ALT: 26 }],
    ['UE3.4B Gérer', 6, { 'R3.01': 9, 'R3.07': 14, 'R3.08': 9, 'R3.09': 9, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, SAE: 20, ALT: 23 }],
    ['UE3.5B Conduire', 3, { 'R3.01': 6, 'R3.03': 4, 'R3.04': 4, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, SAE: 10, ALT: 10 }],
    ['UE3.6B Collaborer', 3, { 'R3.04': 8, 'R3.10': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, SAE: 10, ALT: 10 }],
  ];
  const LV = { 'cœur': 'lv-core', fort: 'lv-fort', solide: 'lv-solide' };

  const box = document.getElementById('calc');
  if (!box) return;
  let notes = {};
  try { notes = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { notes = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch { /* navigation privée */ } };
  const fr = (x) => x.toFixed(2).replace('.', ',');
  const parse = (v) => { const x = parseFloat(String(v).replace(',', '.')); return Number.isFinite(x) && x >= 0 && x <= 20 ? x : null; };

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  // tableau de saisie
  const tbl = el('table', 'calc-tbl');
  const head = el('tr'); ['Ressource', 'Niveau', 'Cible', 'Ta note'].forEach((t) => head.append(el('th', null, t)));
  tbl.append(head);
  RES.forEach(([code, name, tgt, lv]) => {
    const tr = el('tr');
    const td1 = el('td'); td1.append(el('b', null, code + ' '), document.createTextNode(name));
    const td2 = el('td'); td2.append(el('span', 'lv ' + LV[lv], lv));
    const td3 = el('td', 'tgt', String(tgt));
    const td4 = el('td');
    const inp = document.createElement('input');
    Object.assign(inp, { type: 'text', inputMode: 'decimal', placeholder: '—', value: notes[code] != null ? String(notes[code]).replace('.', ',') : '' });
    inp.setAttribute('aria-label', `Ta note en ${code}`);
    inp.className = 'note-in';
    inp.addEventListener('input', () => { const x = parse(inp.value); if (x == null) delete notes[code]; else notes[code] = x; inp.classList.toggle('bad-in', inp.value.trim() !== '' && x == null); save(); render(); });
    td4.append(inp);
    tr.append(td1, td2, td3, td4);
    tbl.append(tr);
  });
  const wrap = el('div', 'tbl'); wrap.append(tbl);
  const out = el('div', 'calc-out');
  const reset = el('button', 'linkish', 'Effacer mes notes');
  reset.type = 'button';
  reset.addEventListener('click', () => { if (confirm('Effacer les notes saisies ?')) { notes = {}; save(); box.querySelectorAll('.note-in').forEach((i) => { i.value = ''; }); render(); } });
  box.append(wrap, out, el('p', 'center'));
  box.lastChild.append(reset);

  const tgtOf = Object.fromEntries(RES.map(([c, , t]) => [c, t]));
  function ueAvg(coefs, mode) {
    let s = 0, w = 0;
    for (const [c, k] of Object.entries(coefs)) {
      const v = notes[c] != null ? notes[c] : mode === 'proj' ? tgtOf[c] : null;
      if (v == null) continue;
      s += v * k; w += k;
    }
    return w ? s / w : null;
  }
  function render() {
    const n = Object.keys(notes).length;
    const t = el('table', 'calc-tbl');
    const h = el('tr'); ['UE', 'ECTS', 'Avec tes notes', 'Projection (cibles pour le reste)'].forEach((x) => h.append(el('th', null, x)));
    t.append(h);
    let sp = 0, sc = 0, wc = 0;
    UE.forEach(([name, ects, coefs]) => {
      const cur = ueAvg(coefs, 'cur'), proj = ueAvg(coefs, 'proj');
      sp += proj * ects; if (cur != null) { sc += cur * ects; wc += ects; }
      const tr = el('tr');
      tr.append(el('td', null, name), el('td', null, String(ects)), el('td', cur == null ? 'muted' : cur >= 10 ? '' : 'bad', cur == null ? '—' : fr(cur)), el('td', proj >= 15.5 ? 'ok' : proj >= 10 ? '' : 'bad', fr(proj)));
      t.append(tr);
    });
    const tr = el('tr', 'sum');
    tr.append(el('td', null, 'Moyenne S3'), el('td', null, '30'), el('td', null, wc ? fr(sc / wc) : '—'), el('td', 'ok', fr(sp / 30)));
    t.append(tr);
    const below = RES.filter(([c, , tg]) => notes[c] != null && notes[c] < tg).map(([c, , tg]) => `${c} (${String(notes[c]).replace('.', ',')} < ${tg})`);
    out.replaceChildren(
      el('p', 'muted', n ? `${n} note(s) saisie(s). La projection remplace chaque note manquante par sa cible.` : 'Saisis tes notes au fil du semestre : la projection remplace chaque note manquante par sa cible.'),
      Object.assign(el('div', 'tbl'), {}).appendChild(t).parentNode,
      below.length ? el('p', 'bad', 'Sous la cible : ' + below.join(' · ')) : el('p', 'ok', n ? 'Toutes tes notes saisies sont au niveau des cibles. 🎯' : ''),
    );
  }
  render();
})();
