// GabouLearn — lecture d'un agenda iCal ADE et extraction des évaluations (examens, soutenances, contrôles).
// Fichier commun à la fonction Supabase (index.ts) et aux tests Node.

// code ressource ADE → page GabouLearn
export const SLUGS = {
  'R3.01': 'r3-01-developpement-web',
  'R3.02': 'r3-02-r3-03-dev-efficace-analyse',
  'R3.03': 'r3-02-r3-03-dev-efficace-analyse',
  'R3.04': 'r3-04-qualite-dev',
  'R3.05': 'r3-05-programmation-systeme',
  'R3.06': 'r3-06-reseaux',
  'R3.07': 'r3-07-sql',
  'R3.08': 'r3-08-probabilites',
  'R3.09': 'r3-09-cryptographie',
  'R3.11': 'r3-11-droit-du-numerique',
  'R3.B.L.1': 'r3-09-cryptographie', // compléments cryptographie (parcours B)
};

const KIND = /\b(examen|soutenance|partiel|contr[ôo]le|ds|cc\d*|qcm)\b/i;

function unfold(ics) { return ics.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, ''); }
const unescape = (s) => s.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
function field(block, name) {
  const m = block.match(new RegExp('^' + name + '(?:;[^:\\r\\n]*)?:(.*)$', 'm'));
  return m ? unescape(m[1].trim()) : '';
}
function date(v) {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00', z] = m;
  return z ? `${y}-${mo}-${d}T${h}:${mi}:${s}Z` : `${y}-${mo}-${d}T${h}:${mi}:${s}+01:00`;
}
function groupOf(desc, summary) {
  const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean);
  const g = lines.filter((l) => /ann[ée]e|^groupe |^G[AB]\d?(-\d)?$|^FA\b/i.test(l));
  if (g.length) return g.join(', ');
  const m = summary.match(/\b(G[AB]\d?(?:-\d)?)\s*$/);
  return m ? m[1] : null;
}

export function parseAde(ics) {
  const out = [];
  const blocks = unfold(ics).split('BEGIN:VEVENT').slice(1).map((b) => b.split('END:VEVENT')[0]);
  for (const b of blocks) {
    const summary = field(b, 'SUMMARY');
    const k = summary.match(KIND);
    if (!k) continue;
    const kw = k[1].toLowerCase();
    const kind = kw === 'soutenance' ? 'soutenance' : kw === 'examen' || kw === 'partiel' ? 'examen' : 'controle';
    const codes = new Set();
    for (const m of summary.matchAll(/\bR3\.(?:B\.L\.1|\d{2})\b/g)) codes.add(m[0]);
    const slugs = [...new Set([...codes].map((c) => SLUGS[c]).filter(Boolean))];
    if (!slugs.length) continue;
    const starts = date(field(b, 'DTSTART'));
    if (!starts) continue;
    for (const slug of slugs) {
      out.push({
        slug, kind, title: summary.slice(0, 160),
        groupe: groupOf(field(b, 'DESCRIPTION'), summary),
        starts_at: starts, ends_at: date(field(b, 'DTEND')),
        uid: field(b, 'UID').slice(0, 200) || null, source: 'ade',
      });
    }
  }
  return out.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}
