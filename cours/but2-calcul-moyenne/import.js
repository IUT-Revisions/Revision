// GabouLearn — import d'un relevé de notes ScoDoc (PDF) : lecture locale, moyennes, coefficients, estimation de classement.
(() => {
  'use strict';
  const box = document.getElementById('import');
  if (!box || !window.Releve) return;
  const fr = (x, d = 2) => (x == null ? '—' : x.toFixed(d).replace('.', ','));

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }

  const input = h('input', { type: 'file', accept: 'application/pdf,.pdf', id: 'releve-file', class: 'file-in' });
  const drop = h('label', { class: 'drop', for: 'releve-file' },
    h('b', {}, 'Dépose ton relevé de notes ScoDoc (PDF)'), h('br'),
    h('span', { class: 'muted small' }, 'ou clique pour le choisir · le fichier est lu dans ton navigateur, il n\'est envoyé nulle part'));
  const out = h('div', { class: 'imp-out' });
  box.append(drop, input, out);

  ['dragenter', 'dragover'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (ev) => { const f = ev.dataTransfer.files[0]; if (f) read(f); });
  input.addEventListener('change', () => { if (input.files[0]) read(input.files[0]); });

  async function read(file) {
    out.replaceChildren(h('p', { class: 'muted' }, 'Lecture du relevé…'));
    try {
      if (file.size > 5e6) throw new Error('fichier trop gros pour un relevé');
      const R = Releve.recompute(await Releve.parse(await file.arrayBuffer()));
      if (!R.ues.length) throw new Error('aucune UE trouvée');
      show(R);
    } catch (e) {
      out.replaceChildren(h('p', { class: 'bad' }, `Impossible de lire ce fichier (${e.message}). Il faut le relevé PDF exporté par ScoDoc (bouton « Version PDF » du bulletin).`));
    }
  }

  // code du relevé → clé du calculateur
  const toKey = (code, sem) => {
    if (/^S\d\.[AB]\.\d+$/.test(code)) { const m = code.match(/^S(\d)\.([AB])\.(\d+)$/); return `S${m[1]}.${m[2]}.${m[3].padStart(2, '0')}`; }
    if (/^P\d/.test(code) || /portfolio/i.test(code)) return 'Portfolio';
    if (/^Altern/i.test(code)) return 'Alternance';
    if (/^Stage/i.test(code)) return 'Stage';
    return code;
  };

  function show(R) {
    const sem = R.semestre ? `S${R.semestre}` : '?';
    const est = Releve.estimate(R);
    const fa = R.regime === 'FA';
    const small = est && (est.small || est.n < 15);

    const ueTable = h('table', { class: 'calc-tbl' },
      h('tr', {}, h('th', {}, 'UE'), h('th', {}, 'ECTS (coef)'), h('th', {}, 'Moyenne'), h('th', {}, 'Coef noté'), h('th', {}, 'Rang'), h('th', {}, 'Promo min · moy · max')),
      R.ues.map((u) => h('tr', {},
        h('td', {}, h('b', {}, u.code), ' ', u.name),
        h('td', {}, u.ects ?? '—'),
        h('td', { class: u.note == null ? 'muted' : u.note >= 10 ? 'ok' : 'bad' }, fr(u.note), u.calc != null && Math.abs(u.calc - u.note) > 0.02 ? h('span', { class: 'muted small' }, ` (recalcul ${fr(u.calc)})`) : null),
        h('td', { class: 'small' }, `${u.coefDone} / ${u.coefTot}`),
        h('td', {}, u.rang ? `${u.rang} / ${u.n}` : '—'),
        h('td', { class: 'small' }, [u.min, u.moy, u.max].map((x) => fr(x)).join(' · ')))));

    const details = h('details', { class: 'box' }, h('summary', {}, h('b', {}, 'Détail : chaque note avec son coefficient dans chaque UE')),
      R.ues.map((u) => h('div', {}, h('h4', {}, `${u.code} ${u.name} · ${fr(u.note)}`),
        h('div', { class: 'tbl' }, h('table', { class: 'calc-tbl' },
          h('tr', {}, h('th', {}, 'Élément'), h('th', {}, 'Coef'), h('th', {}, 'Note'), h('th', {}, 'Poids dans l\'UE')),
          u.items.map((it) => h('tr', {}, h('td', {}, h('b', {}, it.code), ' ', it.label), h('td', {}, String(it.coef).replace('.', ',')),
            h('td', { class: it.note == null ? 'muted' : '' }, it.note == null ? 'pas encore noté' : fr(it.note)),
            h('td', { class: 'small' }, `${Math.round((it.coef / u.coefTot) * 100)} %`))))))));

    let rankBox = null;
    if (est) {
      rankBox = h('div', { class: 'box ' + (small ? 'warn' : 'keep') },
        h('h4', {}, 'Classement estimé au semestre'),
        small
          ? h('p', {}, h('b', { class: 'big' }, `≈ ${est.rank}e / ${est.n}`), ' (rang moyen de tes UE, pondéré par les ECTS)')
          : h('p', {}, h('b', { class: 'big' }, `≈ ${est.rank}e / ${est.n}`), ` · fourchette ${est.from}e à ${est.to}e`),
        h('p', { class: 'small' }, `Tes UE vont du ${Math.min(...R.ues.filter((u) => u.rang).map((u) => u.rang))}e au ${Math.max(...R.ues.filter((u) => u.rang).map((u) => u.rang))}e rang. Rang moyen pondéré par les ECTS : ${fr(est.avgRank, 1)}. Moyenne de la promo (pondérée ECTS) : ${fr(est.promoMean)}.`),
        fa || small ? h('p', { class: 'bad small' }, `${fa ? 'En alternance (FA), ' : ''}le classement se fait sur un groupe de ${est.n} étudiant${est.n > 1 ? 's' : ''} : il n'est pas représentatif du niveau de la promo entière. Compare plutôt ta moyenne à la moyenne de la promo.`) : null,
        small ? h('p', { class: 'muted small' }, 'Sur un si petit groupe, aucun modèle statistique n\'a de sens : on affiche seulement ton rang moyen dans les UE, pondéré par les ECTS.') : h('p', { class: 'muted small' }, 'Méthode : chaque UE est supposée suivre une loi normale (moyenne de la promo, écart-type déduit de ton rang et du max), les UE sont corrélées entre elles (elles partagent ressources et SAÉ), la moyenne du semestre est pondérée par les ECTS. La fourchette fait varier cette corrélation. C\'est une estimation : ScoDoc ne publie pas de rang au semestre.'));
    }

    const canFill = window.GabouCalc && R.parcours && GabouCalc.has(R.parcours, R.regime, sem);
    const notes = {};
    R.ues.forEach((u) => u.items.forEach((it) => { if (it.note != null) notes[toKey(it.code, sem)] = it.note; }));

    out.replaceChildren(
      h('p', {}, h('b', {}, R.formation || 'Relevé ScoDoc'), R.annee ? ` · ${R.annee}` : '', R.parcours ? ` · parcours ${R.parcours}` : '', ` · ${fa ? 'alternance (FA)' : 'formation initiale (FI)'}`),
      h('div', { class: 'kpis' },
        h('div', { class: 'kpi' }, h('b', {}, fr(R.moyenne)), h('span', {}, `moyenne du ${sem} (UE pondérées par les ECTS)`)),
        h('div', { class: 'kpi' }, h('b', {}, `${R.ues.filter((u) => u.note != null && u.note >= 10).reduce((a, u) => a + (u.ects || 0), 0)} / ${R.ectsTot}`), h('span', {}, 'ECTS d\'UE à 10 ou plus')),
        est ? h('div', { class: 'kpi' }, h('b', {}, `≈ ${est.rank}e`), h('span', {}, `classement estimé sur ${est.n}${small ? ' (peu représentatif)' : ''}`)) : null),
      h('div', { class: 'tbl' }, ueTable),
      h('p', { class: 'muted small' }, 'Moyenne d\'UE = somme (note × coef) / somme des coef des éléments déjà notés, exactement comme ScoDoc : un élément « ~ » (pas encore noté) ne compte pas encore. « Coef noté » = part du coefficient de l\'UE déjà évaluée.'),
      rankBox,
      details,
      canFill
        ? h('p', { class: 'center' }, h('button', { class: 'btn', type: 'button', onclick: () => GabouCalc.load({ parcours: R.parcours, regime: R.regime, sem, notes }) }, `Envoyer ces notes dans le calculateur ${sem} (pour simuler la suite)`))
        : h('p', { class: 'muted small center' }, `Le calculateur ci-dessous couvre le BUT2 (S3, S4). Pour ce relevé (${sem}), les calculs ci-dessus utilisent directement les coefficients imprimés sur le relevé.`));
  }
})();
