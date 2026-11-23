// GabouLearn — lien « Mon compte » en haut de page + cours fermés temporairement par l'admin.
(() => {
  'use strict';
  const A = window.GabouAuth;
  if (!A || !A.enabled) return;
  const base = (document.currentScript && document.currentScript.src.replace(/assets\/js\/etat\.js.*$/, '')) || '/';
  const m = location.pathname.match(/\/cours\/([^/]+)\//);
  const slug = m && m[1];

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) { if (v == null) continue; if (k === 'class') el.className = v; else el.setAttribute(k, v); }
    for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }

  // pastille compte
  const pill = h('a', { class: 'gl-account', href: base + 'compte/' }, A.user ? '👤 Mon compte' : '🔑 Se connecter');
  document.body.append(pill);

  (async () => {
    let admin = false;
    if (A.session) { try { const p = await A.me(); admin = !!(p && p.role === 'admin' && !p.blocked); if (admin) { pill.textContent = '🛠️ Admin'; pill.href = base + 'admin/'; } } catch { /* hors ligne */ } }
    let courses = [];
    try { courses = await A.publicRest('courses?select=slug,open,message'); } catch { return; }
    const closed = Object.fromEntries(courses.filter((c) => !c.open).map((c) => [c.slug, c.message || '']));
    // page d'un cours fermé
    if (slug && slug in closed) {
      const main = document.querySelector('main');
      const note = h('div', { class: 'box warn gl-closed' },
        h('h2', {}, '🚧 Cours fermé temporairement'),
        h('p', {}, closed[slug] || 'Ce cours est en maintenance. Reviens un peu plus tard.'),
        h('p', {}, h('a', { href: base }, '← Retour aux autres ressources')));
      if (admin) { note.append(h('p', { class: 'muted' }, 'Tu es admin : le contenu reste visible pour toi ci-dessous.')); main.prepend(note); }
      else { main.replaceChildren(note); document.querySelectorAll('.fab').forEach((e) => e.remove()); }
    }
    // accueil : cartes des cours fermés
    document.querySelectorAll('a.course').forEach((a) => {
      const s = (a.getAttribute('href') || '').match(/cours\/([^/]+)\//);
      if (s && s[1] in closed) { a.classList.add('gl-off'); a.append(h('div', { class: 'theme-tag gl-off-tag' }, '🚧 fermé temporairement')); }
    });
  })();
})();
