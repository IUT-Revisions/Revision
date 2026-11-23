// GabouLearn — barre du haut : menu « mon compte » (à gauche) + cours fermés temporairement par l'admin.
(() => {
  'use strict';
  const A = window.GabouAuth;
  const base = (document.currentScript && document.currentScript.src.replace(/assets\/js\/etat\.js.*$/, '')) || '/';
  const m = location.pathname.match(/\/cours\/([^/]+)\//);
  const slug = m && m[1];
  const THEME = 'gaboulearn-theme';

  // ------------------------------------------------------------------ thème (avant tout le reste)
  const getTheme = () => { try { return localStorage.getItem(THEME) || 'auto'; } catch { return 'auto'; } };
  const applyTheme = (t) => { if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); };
  applyTheme(getTheme());

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }

  // ------------------------------------------------------------------ barre + menu
  const on = !!(A && A.enabled);
  const btn = h('button', { class: 'gl-me', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-controls': 'gl-menu' });
  const menu = h('div', { class: 'gl-menu', id: 'gl-menu', role: 'menu', hidden: true });
  const bar = h('div', { class: 'gl-topbar no-print' }, h('div', { class: 'gl-wrap' }, h('div', { class: 'gl-acc' }, btn, menu)));
  document.body.prepend(bar);

  const initials = (mail) => { const p = String(mail || '').split('@')[0].split(/[._-]+/).filter(Boolean); return ((p[0] || '?')[0] + ((p[1] || '')[0] || '')).toUpperCase(); };
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const open = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); const f = menu.querySelector('a,button'); if (f) f.focus(); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (menu.hidden) open(); else close(); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });

  function progressKeys() {
    const ks = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('gaboulearn-') && k !== 'gaboulearn-session-v1' && k !== THEME) ks.push(k); } } catch { /* ignore */ }
    return ks;
  }
  function themeRow() {
    const cur = getTheme();
    return h('div', { class: 'gl-row', role: 'group', 'aria-label': 'Thème' }, h('span', { class: 'gl-lab' }, 'Thème'),
      h('div', { class: 'gl-seg' }, [['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, l]) => h('button', { type: 'button', class: v === cur ? 'on' : '', 'aria-pressed': String(v === cur), onclick: (e) => { e.stopPropagation(); try { localStorage.setItem(THEME, v); } catch { /* ignore */ } applyTheme(v); render(state); } }, l))));
  }
  function wipeRow() {
    const n = progressKeys().length;
    return h('button', { class: 'gl-item', type: 'button', role: 'menuitem', disabled: !n, onclick: () => {
      if (!confirm('Effacer ta progression sur cet appareil (parcours, carnet d\'erreurs, notes du calculateur, plan) ? Ton compte n\'est pas touché.')) return;
      progressKeys().forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
      location.reload();
    } }, 'Effacer ma progression sur cet appareil', n ? h('span', { class: 'gl-muted' }, ` · ${n} élément${n > 1 ? 's' : ''}`) : null);
  }

  let state = { user: on && A.user ? A.user : null, profile: null };
  function render(s) {
    state = s;
    const u = s.user;
    btn.replaceChildren(
      h('span', { class: 'gl-av', 'aria-hidden': 'true' }, u ? initials(u.email) : '→'),
      h('span', { class: 'gl-txt' }, u ? 'Mon compte' : on ? 'Se connecter' : 'Réglages'));
    const admin = s.profile && s.profile.role === 'admin' && !s.profile.blocked;
    const items = [];
    if (u) {
      items.push(h('div', { class: 'gl-head' }, h('b', {}, u.email), h('span', { class: 'gl-badge' + (admin ? ' adm' : '') }, admin ? 'Administrateur' : 'Étudiant AMU')));
      items.push(h('a', { class: 'gl-item', role: 'menuitem', href: base + 'compte/' }, 'Mon compte'));
      items.push(h('a', { class: 'gl-item', role: 'menuitem', href: base + 'compte/#mdp' }, 'Changer mon mot de passe'));
      if (admin) items.push(h('a', { class: 'gl-item', role: 'menuitem', href: base + 'admin/' }, 'Administration'));
      items.push(h('a', { class: 'gl-item', role: 'menuitem', href: base + 'cours/but2-calcul-moyenne/#mon-plan' }, 'Mon plan et mes moyennes'));
    } else if (on) {
      items.push(h('a', { class: 'gl-item', role: 'menuitem', href: base + 'compte/' }, 'Se connecter'));
      items.push(h('a', { class: 'gl-item', role: 'menuitem', href: base + 'compte/#inscription' }, 'Créer un compte (étudiants AMU)'));
    }
    items.push(h('hr'), themeRow(), wipeRow());
    if (u) items.push(h('hr'), h('button', { class: 'gl-item danger', type: 'button', role: 'menuitem', onclick: async () => { await A.signOut(); location.reload(); } }, 'Se déconnecter'));
    items.push(h('a', { class: 'gl-item gl-small', href: base + 'confidentialite/' }, 'Confidentialité'));
    menu.replaceChildren(...items);
  }
  render(state);
  if (!on) return;

  // ------------------------------------------------------------------ annotations de cours (posées par l'admin)
  const TAG = {
    'incomplet': ['Incomplet', 'warn'], 'en-redaction': ['En cours de rédaction', 'warn'],
    'a-jour': ['À jour', 'ok'], 'verifie': ['Vérifié avec le cours', 'ok'],
    'controle-bientot': ['Contrôle bientôt', 'exam'], 'controle-passe': ['Contrôle passé', 'past'],
  };
  function annItems(c) {
    const out = [];
    const tags = (c.tags || []).filter((t) => TAG[t]);
    let examTxt = null, examKind = null;
    if (c.exam_date) {
      const d = new Date(c.exam_date + 'T12:00:00');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const f = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      if (d < today || tags.includes('controle-passe')) { examTxt = `Contrôle passé le ${f}`; examKind = 'past'; } else { examTxt = `Contrôle le ${f}`; examKind = 'exam'; }
    }
    tags.forEach((t) => { if (examTxt && (t === 'controle-bientot' || t === 'controle-passe')) return; out.push([TAG[t][0], TAG[t][1]]); });
    if (examTxt) out.push([examTxt, examKind]);
    return out;
  }
  // évaluations importées d'ADE → « Examen le 4 déc. », « Soutenances le 11 déc. »
  let EXAMS = {};
  function examItems(slug) {
    const list = EXAMS[slug] || [];
    if (!list.length) return [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const day = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' });
    const key = (x) => x.kind + '|' + day(x.starts_at);
    const groups = [];
    list.forEach((x) => { const g = groups.find((y) => y.key === key(x)); if (g) g.n++; else groups.push({ key: key(x), x, n: 1 }); });
    const label = (g) => {
      const k = g.x.kind === 'soutenance' ? (g.n > 1 ? 'Soutenances' : 'Soutenance') : g.x.kind === 'examen' ? 'Examen' : 'Contrôle';
      const pb = /groupe b/i.test(g.x.groupe || '') ? ' (parcours B)' : /groupe a/i.test(g.x.groupe || '') ? ' (parcours A)' : '';
      const d = day(g.x.starts_at);
      return `${k} ${d === day(Date.now()) ? 'aujourd\'hui' : 'le ' + d}${pb}`;
    };
    const next = groups.filter((g) => new Date(g.x.starts_at) >= today).slice(0, 2);
    if (next.length) return next.map((g) => [label(g), 'exam']);
    const last = groups[groups.length - 1];
    return [[label(last).replace(/^(Examen|Soutenances?|Contrôle) le/, (m, k) => `${k} passé${k === 'Soutenances' ? 'es' : k === 'Soutenance' ? 'e' : ''} le`), 'past']];
  }
  function annLine(c, withNote) {
    const items = [...annItems(c), ...examItems(c.slug)];
    if (!items.length && !(withNote && c.note)) return null;
    return h('div', { class: 'gl-ann' },
      items.map(([t, k]) => h('span', { class: 'gl-ann-i gl-k-' + k }, h('span', { class: 'gl-dot', 'aria-hidden': 'true' }), t)),
      withNote && c.note ? h('span', { class: 'gl-ann-note' }, c.note) : null);
  }
  function annotate(courses) {
    const by = Object.fromEntries(courses.map((c) => [c.slug, c]));
    if (slug && by[slug]) {
      const line = annLine(by[slug], true);
      const anchor = document.querySelector('main .sub') || document.querySelector('main h1');
      if (line && anchor) anchor.after(line);
    }
    document.querySelectorAll('a.course').forEach((a) => {
      const s = (a.getAttribute('href') || '').match(/cours\/([^/]+)\//);
      const c = s && by[s[1]];
      const line = c && annLine(c, false);
      if (line) { const tags = a.querySelector('.tags'); if (tags) tags.before(line); else a.append(line); }
    });
  }

  // ------------------------------------------------------------------ profil + cours fermés
  (async () => {
    if (A.session) {
      try {
        const p = await A.me();
        if (!A.session) render({ user: null, profile: null }); else render({ user: A.user || (p && { email: p.email }), profile: p });
      } catch { /* hors ligne */ }
    }
    let courses = [];
    try { courses = await A.publicRest('courses?select=slug,open,message,tags,note,exam_date'); } catch {
      try { courses = await A.publicRest('courses?select=slug,open,message'); } catch { return; }
    }
    try {
      const ex = await A.publicRest('course_exams?select=slug,kind,title,groupe,starts_at&order=starts_at');
      EXAMS = {}; ex.forEach((x) => (EXAMS[x.slug] = EXAMS[x.slug] || []).push(x));
    } catch { /* pas d'agenda importé */ }
    annotate(courses);
    const closed = Object.fromEntries(courses.filter((c) => !c.open).map((c) => [c.slug, c.message || '']));
    const admin = state.profile && state.profile.role === 'admin' && !state.profile.blocked;
    if (slug && slug in closed) {
      const main = document.querySelector('main');
      const note = h('div', { class: 'box warn gl-closed' },
        h('h2', {}, 'Cours fermé temporairement'),
        h('p', {}, closed[slug] || 'Ce cours est en maintenance. Reviens un peu plus tard.'),
        h('p', {}, h('a', { href: base }, '← Retour aux autres ressources')));
      if (admin) { note.append(h('p', { class: 'muted' }, 'Tu es admin : le contenu reste visible pour toi ci-dessous.')); main.prepend(note); }
      else { main.replaceChildren(note); document.querySelectorAll('.fab').forEach((e) => e.remove()); }
    }
    document.querySelectorAll('a.course').forEach((a) => {
      const s = (a.getAttribute('href') || '').match(/cours\/([^/]+)\//);
      if (s && s[1] in closed) { a.classList.add('gl-off'); a.append(h('div', { class: 'theme-tag gl-off-tag' }, 'fermé temporairement')); }
    });
  })();
})();
