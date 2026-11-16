// Vérifie tous les cours avant un commit : npm run check
// - structure des banques de questions (chapitres connus, QCM valides…)
// - chaque modèle de cas pratique : le corrigé doit obtenir 100 % et ne déclencher aucun piège
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COURS = path.join(ROOT, 'cours');
let errors = 0, warnings = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };
const warn = (m) => { warnings++; console.log('  ⚠ ' + m); };

for (const dir of fs.readdirSync(COURS)) {
  if (dir.startsWith('_') || dir.startsWith('.')) continue;
  const base = path.join(COURS, dir);
  if (!fs.statSync(base).isDirectory()) continue;
  console.log(`\n📘 ${dir}`);

  const dataFile = path.join(base, 'donnees.js');
  if (fs.existsSync(dataFile)) {
    const B = require(dataFile);
    const themes = B.THEMES || {};
    if (!Object.keys(themes).length) err('THEMES vide');
    const check = (name, list, fn) => (list || []).forEach((x, i) => {
      if (!(x.t in themes)) err(`${name}[${i}] : chapitre inconnu « ${x.t} »`);
      const m = fn(x); if (m) err(`${name}[${i}] : ${m}`);
    });
    check('QUIZ', B.QUIZ, (x) => (!Array.isArray(x.choices) || x.choices.length < 2 ? 'moins de 2 choix' : new Set(x.choices).size !== x.choices.length ? 'choix en double' : !x.ex ? 'explication manquante' : null));
    check('VRAIFAUX', B.VRAIFAUX, (x) => (typeof x.v !== 'boolean' ? 'v doit être true/false' : !x.ex ? 'explication manquante' : null));
    check('CASES', B.CASES, (x) => (!x.c || x.choices.length < 2 ? 'faits ou choix manquants' : null));
    check('NUMBERS', B.NUMBERS, (x) => (typeof x.a !== 'number' ? 'a doit être un nombre' : null));
    const rules = new Set();
    check('ARTICLES', B.ARTICLES, (x) => { if (rules.has(x.rule)) return 'règle en double'; rules.add(x.rule); return null; });
    console.log(`  ${(B.QUIZ || []).length} QCM · ${(B.VRAIFAUX || []).length} V/F · ${(B.CASES || []).length} cas QCM · ${(B.NUMBERS || []).length} chiffres · ${(B.ARTICLES || []).length} notions`);
  }

  const casFile = path.join(base, 'cas.js');
  if (fs.existsSync(casFile)) {
    const enginePath = require.resolve(path.join(ROOT, 'assets/js/casegen.js'));
    delete require.cache[enginePath]; delete require.cache[require.resolve(casFile)];
    const G = require(casFile);
    for (const tpl of G.TEMPLATES) {
      let worst = 100;
      for (let i = 0; i < 60; i++) {
        const c = tpl.gen();
        c.keys = c.keys.filter(Boolean);
        if (!c.facts || !c.question || !c.model || !c.keys.length) { err(`cas « ${tpl.title} » : champ manquant`); break; }
        const s = G.score(c.model, c);
        worst = Math.min(worst, s.pct);
        if (s.warnings.length) { warn(`cas « ${tpl.title} » : le corrigé déclenche un piège (${s.warnings[0]})`); break; }
      }
      if (worst < 100) warn(`cas « ${tpl.title} » : le corrigé n'obtient que ${worst} %`);
    }
    console.log(`  ${G.TEMPLATES.length} modèles de cas rédigés`);
  }
}
console.log(`\n${errors} erreur(s), ${warnings} avertissement(s)`);
process.exit(errors ? 1 : 0);
