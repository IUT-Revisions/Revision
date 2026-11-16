// GabouLearn — accueil : affiche les matières de window.COURS, groupées par semestre, avec une recherche.
(() => {
  const list = document.getElementById('cours');
  const search = document.getElementById('recherche');
  const cours = window.COURS || [];
  if (!list) return;

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null) continue;
      if (k === 'class') el.className = v; else el.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function render(q) {
    const nq = norm(q || '');
    const shown = cours.filter((c) => !nq || norm([c.code, c.titre, c.description, c.semestre].join(' ')).includes(nq));
    const groups = {};
    for (const c of shown) (groups[c.semestre] = groups[c.semestre] || []).push(c);
    list.replaceChildren(...Object.entries(groups).map(([sem, items]) => h('section', {},
      h('h2', { class: 'sem' }, sem),
      h('div', { class: 'grid' }, items.map((c) => h('a', { class: 'course', href: c.url },
        h('div', { class: 'code' }, c.code),
        h('div', { class: 'name' }, c.titre),
        h('p', { class: 'muted' }, c.description),
        h('div', { class: 'tags' }, (c.outils || []).map((o) => h('span', { class: 'theme-tag' }, o)))))))));
    if (!shown.length) list.replaceChildren(h('p', { class: 'muted center' }, 'Aucune matière ne correspond à « ', q, ' ».'));
  }
  search?.addEventListener('input', () => render(search.value));
  render('');
})();
