// GabouLearn — Edge Function « sync-ade » : lit l'agenda iCal ADE (lien rangé dans gl_config) et remplace
// les évaluations importées (course_exams, source 'ade'). Réservée à l'admin (vérifié via is_admin()).
// Déploiement : Supabase → Edge Functions → sync-ade (Verify JWT activé). Généré à partir de parse.js.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ORIGINS = ['https://gaboulearn.fr', 'http://localhost:8770'];
const cors = (req: Request) => {
  const o = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
};
const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json' } });
// GabouLearn — lecture d'un agenda iCal ADE et extraction des évaluations (examens, soutenances, contrôles).
// Fichier commun à la fonction Supabase (index.ts) et aux tests Node.

// code ressource ADE → page GabouLearn
const SLUGS = {
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

function parseAde(ics) {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== 'POST') return json(req, { error: 'POST attendu' }, 405);
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';

  // 1. l'appelant doit être l'admin
  const asUser = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: who } = await asUser.auth.getUser();
  const { data: isAdmin, error: e1 } = await asUser.rpc('is_admin');
  if (e1 || !isAdmin || !who?.user) return json(req, { error: 'Réservé aux administrateurs' }, 403);

  // 2. lien ADE privé
  const db = createClient(url, service);
  const { data: cfg } = await db.from('gl_config').select('value').eq('key', 'ade_url').maybeSingle();
  const ade = cfg?.value as string | undefined;
  if (!ade) return json(req, { error: 'Aucun lien ADE enregistré' }, 400);
  if (!/^https:\/\/agenda-web-consult\.univ-amu\.fr\/jsp\/custom\/modules\/plannings\/anonymous_cal\.jsp\?/.test(ade)) {
    return json(req, { error: 'Lien ADE invalide' }, 400);
  }

  // 3. lecture + analyse
  const r = await fetch(ade, { headers: { 'User-Agent': 'GabouLearn-sync' } });
  if (!r.ok) return json(req, { error: `ADE a répondu ${r.status}` }, 502);
  const ics = await r.text();
  if (!ics.includes('BEGIN:VCALENDAR')) return json(req, { error: 'Réponse ADE inattendue (pas un agenda iCal)' }, 502);
  const rows = parseAde(ics);

  // 4. remplacement des évaluations importées
  const { error: e2 } = await db.from('course_exams').delete().eq('source', 'ade');
  if (e2) return json(req, { error: e2.message }, 500);
  if (rows.length) {
    const { error: e3 } = await db.from('course_exams').insert(rows);
    if (e3) return json(req, { error: e3.message }, 500);
  }
  const bySlug: Record<string, number> = {};
  rows.forEach((x) => { bySlug[x.slug] = (bySlug[x.slug] || 0) + 1; });
  await db.from('events').insert({ user_id: who.user.id, email: who.user.email, kind: 'admin : agenda ADE synchronisé', detail: { evaluations: rows.length, par_cours: bySlug } });
  return json(req, { ok: true, count: rows.length, bySlug });
});