// GabouLearn — moteur de cas pratiques rédigés : génération aléatoire + notation par notions clés.
// Commun à tous les cours. Chaque cours enregistre ses modèles avec CASEGEN.add(chapitre, titre, generateur).
// Fonctionne dans le navigateur (window.CASEGEN) et dans Node (require).
(function (root) {
  'use strict';

  // ------------------------------------------------------------ hasard
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const chance = (p) => Math.random() < p;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const eur = (n) => n.toLocaleString('fr-FR') + ' €';
  const ans = (n) => `${n} an${n > 1 ? 's' : ''}`;

  const two = (a) => { const s = shuffle(a); return [s[0], s[1]]; };

  // K(libellé, poids, ...formulations acceptées). Dans une formulation : tous les mots doivent figurer
  // dans la copie (ordre libre) ; « mot* » = n'importe quel mot qui commence ainsi.
  const K = (label, w, ...alts) => ({ label, w, alts });
  const BAD = (msg, ...alts) => ({ msg, alts });

  const T = [];
  const add = (t, title, gen) => T.push({ id: 'c' + T.length, t, title, gen });

  // ------------------------------------------------------------ notation par notions clés
  function norm(s) {
    return String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2').replace(/[^a-z0-9%]+/g, ' ').replace(/%/g, ' % ').replace(/\s+/g, ' ').trim();
  }
  function lev1(a, b) { // distance d'édition ≤ 1 ?
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++e > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  }
  function tokMatch(words, p) {
    if (p.endsWith('*')) { const st = p.slice(0, -1); return words.some((w) => w.startsWith(st)); }
    return words.some((w) => w === p || w === p + 's' || w === p + 'x' || w + 's' === p || (p.length >= 6 && /^[a-z]+$/.test(p) && lev1(w, p)));
  }
  function altMatch(text, words, alt) {
    // chaque mot de la formulation : « mot* » = préfixe ; les mots normalisés peuvent se scinder (ex. « l'ouvrir »)
    const toks = [];
    for (const raw of alt.split(/\s+/)) {
      const star = raw.endsWith('*');
      const parts = norm(star ? raw.slice(0, -1) : raw).split(' ').filter(Boolean);
      parts.forEach((p, i) => toks.push(star && i === parts.length - 1 ? p + '*' : p));
    }
    if (!toks.length) return false;
    // expression exacte (ex. « pas de dol ») : la suite de mots exacte suffit
    if (toks.length > 1 && !alt.includes('*') && (' ' + text + ' ').includes(' ' + toks.join(' ') + ' ')) return true;
    return toks.every((t) => tokMatch(words, t));
  }

  // piège : suite de mots exacte, ignorée si une négation la précède de près (« ce n'est pas une nullité absolue »)
  const NEG = new Set(['pas', 'ne', 'n', 'non', 'ni', 'jamais', 'aucun', 'aucune', 'sans']);
  function badMatch(words, phrase) {
    const p = norm(phrase).split(' ').filter(Boolean);
    for (let i = 0; i + p.length <= words.length; i++) {
      if (!p.every((t, k) => words[i + k] === t)) continue;
      if (words.slice(Math.max(0, i - 4), i).some((w) => NEG.has(w))) continue;
      return true;
    }
    return false;
  }

  function score(answer, kase) {
    const text = norm(answer);
    const words = text.split(' ').filter(Boolean);
    const keys = kase.keys.filter(Boolean);
    let got = 0, tot = 0;
    const found = [], missing = [];
    for (const k of keys) {
      tot += k.w;
      if (k.alts.some((a) => altMatch(text, words, a))) { got += k.w; found.push(k.label); } else missing.push(k.label);
    }
    const warnings = (kase.bad || []).filter((b) => b.alts.some((a) => badMatch(words, a))).map((b) => b.msg);
    const method = {
      article: /\b(art|article|articles)\b/.test(text) || /\b\d{3,4}\b/.test(text),
      conclusion: /\b(donc|consequent|consequence|conclusion|ainsi|en definitive)\b/.test(text),
      developpe: words.length >= 50,
      probleme: /\b(probleme|question de droit|probleme juridique|il s agit de savoir|se pose la question)\b/.test(text),
    };
    return { pct: tot ? Math.round((100 * got) / tot) : 0, found, missing, warnings, method, words: words.length };
  }

  function generate(themes) {
    const pool = T.filter((x) => !themes || !themes.length || themes.includes(x.t));
    const tpl = pick(pool.length ? pool : T);
    const c = tpl.gen();
    return { tid: tpl.id, t: tpl.t, title: tpl.title, ...c, keys: c.keys.filter(Boolean) };
  }

  const API = { TEMPLATES: T, add, generate, score, norm, K, BAD, rnd, pick, chance, shuffle, eur, ans, two, get count() { return T.length; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.CASEGEN = API;
})(typeof window !== 'undefined' ? window : globalThis);
