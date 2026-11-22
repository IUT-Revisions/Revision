// Change l'adresse publique du site dans toutes les balises SEO (canonical, Open Graph, JSON-LD, sitemap, robots).
// Usage : node scripts/set-domain.js https://gaboulearn.fr/
// Les liens internes sont relatifs : seules les URL absolues sont réécrites.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OLD = [
  'https://iut-revisions.github.io/Revision/',
  'https://www.gaboulearn.fr/',
  'https://gaboulearn.fr/',
];
const NEW = process.argv[2];
if (!NEW || !/^https:\/\/[^/]+\/$/.test(NEW)) {
  console.error('Usage : node scripts/set-domain.js https://domaine.fr/   (avec le / final)');
  process.exit(1);
}

const SKIP = new Set(['.git', 'node_modules', 'jeu', 'scripts']);
const EXT = /\.(html|xml|txt|md)$/;
let changed = 0;
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!EXT.test(name)) continue;
    const before = fs.readFileSync(p, 'utf8');
    let after = before;
    for (const o of OLD) if (o !== NEW) after = after.split(o).join(NEW);
    if (after !== before) { fs.writeFileSync(p, after); changed++; console.log('  ✓ ' + path.relative(ROOT, p)); }
  }
})(ROOT);

const host = new URL(NEW).host;
fs.writeFileSync(path.join(ROOT, 'CNAME'), host + '\n');
console.log(`\n${changed} fichier(s) mis à jour · CNAME = ${host}`);
