// GabouLearn — administration : cours (ouvrir / fermer), comptes (bloquer), journal (inscriptions, connexions, actions).
// Toutes les lectures et actions sont autorisées par la base (RLS + fonctions is_admin) : la page seule ne donne aucun droit.
(() => {
  'use strict';
  const A = window.GabouAuth;
  const app = document.getElementById('app');
  if (!app) return;
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const date = (d) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
  const msg = h('p', { class: 'gl-msg', role: 'status', 'aria-live': 'polite' });
  const say = (t, ok) => { msg.textContent = t || ''; msg.className = 'gl-msg ' + (ok ? 'ok' : t ? 'bad' : ''); };
  let tab = 'cours';
  let me = null;

  async function boot() {
    if (!A || !A.enabled) { app.replaceChildren(h('p', { class: 'box warn' }, 'Les comptes ne sont pas encore activés (assets/js/config.js).')); return; }
    if (!A.session) { location.href = '../compte/'; return; }
    try { me = await A.me(); } catch (e) { say(e.message); }
    if (!me || me.role !== 'admin' || me.blocked) { app.replaceChildren(h('div', { class: 'box warn' }, h('p', {}, 'Accès réservé à l\'administrateur.'), h('p', {}, h('a', { href: '../compte/' }, 'Mon compte')))); return; }
    render();
  }

  function shell(body) {
    const tabs = h('div', { class: 'seg' }, [['cours', 'Cours'], ['comptes', 'Comptes'], ['journal', 'Journal']].map(([k, l]) => h('button', { type: 'button', class: k === tab ? 'on' : '', onclick: () => { tab = k; say(''); render(); } }, l)));
    app.replaceChildren(h('p', { class: 'muted small' }, `Connecté : ${me.email} (admin)`), tabs, msg, body);
  }
  async function render() {
    const body = h('div', {}, h('p', { class: 'muted' }, 'Chargement…'));
    shell(body);
    try { body.replaceChildren(await ({ cours, comptes, journal })[tab]()); } catch (e) { body.replaceChildren(h('p', { class: 'bad' }, e.message)); }
  }

  // ------------------------------------------------------------------ cours
  const TAGS = [['incomplet', 'Incomplet'], ['en-redaction', 'En cours de rédaction'], ['a-jour', 'À jour'], ['verifie', 'Vérifié avec le cours'], ['controle-bientot', 'Contrôle bientôt'], ['controle-passe', 'Contrôle passé']];
  async function agenda() {
    let url = '';
    try { url = (await A.rpc('admin_get_ade_url')) || ''; } catch { /* pas encore configuré */ }
    let exams = [];
    try { exams = await A.rest('course_exams?select=slug,kind,title,groupe,starts_at&order=starts_at'); } catch { /* table absente */ }
    const inp = h('input', { type: 'url', class: 'note-in', style: 'width:100%', value: url, placeholder: 'https://agenda-web-consult.univ-amu.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?…', 'aria-label': 'Lien iCal ADE' });
    const saveB = h('button', { class: 'btn alt', type: 'button', onclick: async () => {
      saveB.disabled = true;
      try { await A.rpc('admin_set_ade_url', { p_url: inp.value.trim() }); say('Lien ADE enregistré.', true); } catch (e) { say(e.message); }
      saveB.disabled = false;
    } }, 'Enregistrer le lien');
    const syncB = h('button', { class: 'btn', type: 'button', onclick: async () => {
      syncB.disabled = true; syncB.textContent = 'Synchronisation…';
      try {
        if (inp.value.trim() && inp.value.trim() !== url) await A.rpc('admin_set_ade_url', { p_url: inp.value.trim() });
        const r = await A.fn('sync-ade');
        say(`Agenda synchronisé : ${r.count} évaluation${r.count > 1 ? 's' : ''} importée${r.count > 1 ? 's' : ''}.`, true);
        render();
      } catch (e) { say(e.message); syncB.disabled = false; syncB.textContent = 'Synchroniser maintenant'; }
    } }, 'Synchroniser maintenant');
    const fmt = (d) => new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
    const now = Date.now();
    const next = exams.filter((x) => new Date(x.starts_at).getTime() >= now - 864e5);
    return h('div', { class: 'box adm-course' },
      h('div', { class: 'adm-head' }, h('b', {}, 'Agenda ADE'), h('span', { class: 'small muted' }, `${exams.length} évaluation${exams.length > 1 ? 's' : ''} importée${exams.length > 1 ? 's' : ''}`)),
      h('p', { class: 'small muted' }, 'Dans ADE (ENT → Planning étudiant), sélectionne « Info › 2ème année », puis Export (deuxième icône en bas à gauche) → iCalendar → « Générer URL ». Colle le lien ici : les examens et soutenances sont rattachés aux cours par leur code (R3.05, R3.02-R3.03…).'),
      inp,
      h('div', { class: 'adm-row' }, syncB, saveB),
      next.length ? h('details', {}, h('summary', { class: 'small' }, `Prochaines évaluations (${next.length})`),
        h('div', { class: 'tbl' }, h('table', { class: 'calc-tbl adm-tbl' },
          h('tr', {}, h('th', {}, 'Date'), h('th', {}, 'Évaluation'), h('th', {}, 'Groupe')),
          next.map((x) => h('tr', {}, h('td', { class: 'small' }, fmt(x.starts_at)), h('td', {}, x.title), h('td', { class: 'small' }, x.groupe || '—')))))) : null);
  }

  async function cours() {
    const rows = await A.rest('courses?select=*&order=slug');
    const ag = await agenda();
    return h('div', {}, ag,
      h('p', { class: 'small muted' }, 'Les étiquettes, la date de contrôle et la note s\'affichent sur l\'accueil et en haut de la page du cours, pour tout le monde. Fermer un cours masque sa page pour les visiteurs (toi, tu le vois encore) ; ses fichiers restent publics sur GitHub.'),
      rows.map((c) => {
        const tags = new Set(c.tags || []);
        const boxes = TAGS.map(([k, l]) => { const i = h('input', { type: 'checkbox', value: k }); i.checked = tags.has(k); return h('label', { class: 'chk-tag' }, i, ' ', l); });
        const exam = h('input', { type: 'date', class: 'note-in', value: c.exam_date || '', 'aria-label': `Date du contrôle ${c.titre}` });
        const note = h('input', { type: 'text', maxlength: '160', value: c.note || '', placeholder: 'Note visible par tous, ex. TP 3 pas encore intégré', class: 'note-in', style: 'width:100%' });
        const saveB = h('button', { class: 'btn', type: 'button', onclick: async () => {
          saveB.disabled = true;
          const t = boxes.map((b) => b.querySelector('input')).filter((x) => x.checked).map((x) => x.value);
          try { await A.rpc('admin_annotate_course', { p_slug: c.slug, p_tags: t, p_note: note.value, p_exam: exam.value || null }); say(`Annotations de « ${c.titre} » enregistrées.`, true); render(); } catch (e) { say(e.message); saveB.disabled = false; }
        } }, 'Enregistrer');
        const msgIn = h('input', { type: 'text', maxlength: '300', value: c.message || '', placeholder: 'Message si fermé, ex. en maintenance jusqu\'au 2 décembre', class: 'note-in', style: 'width:100%' });
        const openB = h('button', { class: 'btn alt', type: 'button', onclick: async () => {
          openB.disabled = true;
          try { await A.rpc('admin_set_course', { p_slug: c.slug, p_open: !c.open, p_message: msgIn.value }); say(c.open ? `« ${c.titre} » fermé.` : `« ${c.titre} » rouvert.`, true); render(); } catch (e) { say(e.message); openB.disabled = false; }
        } }, c.open ? 'Fermer le cours' : 'Rouvrir le cours');
        return h('div', { class: 'box adm-course' },
          h('div', { class: 'adm-head' }, h('a', { href: `../cours/${c.slug}/` }, h('b', {}, c.titre)), h('span', { class: 'pill ' + (c.open ? 'on' : 'off') }, c.open ? 'ouvert' : 'fermé'), h('span', { class: 'small muted' }, `modifié le ${date(c.updated_at)}`)),
          h('div', { class: 'adm-tags' }, boxes),
          h('div', { class: 'adm-row' }, h('label', { class: 'small' }, 'Date du contrôle ', exam), note),
          h('div', { class: 'adm-row' }, saveB),
          h('details', {}, h('summary', { class: 'small' }, 'Fermeture temporaire'), h('div', { class: 'adm-row' }, msgIn, openB)));
      }));
  }

  // ------------------------------------------------------------------ comptes
  async function comptes() {
    const rows = await A.rest('profiles?select=*&order=created_at.desc');
    const q = h('input', { type: 'search', placeholder: 'Filtrer par adresse…' });
    const tbody = h('tbody');
    const draw = () => {
      const f = q.value.trim().toLowerCase();
      tbody.replaceChildren(...rows.filter((p) => !f || p.email.includes(f)).map((p) => {
        const b = p.id === me.id ? h('span', { class: 'muted small' }, 'toi') : h('button', { class: 'linkish', type: 'button', onclick: async () => {
          if (!confirm(`${p.blocked ? 'Débloquer' : 'Bloquer'} ${p.email} ?`)) return;
          try { await A.rpc('admin_set_blocked', { p_user: p.id, p_blocked: !p.blocked }); say('Fait.', true); render(); } catch (e) { say(e.message); }
        } }, p.blocked ? 'Débloquer' : 'Bloquer');
        return h('tr', {}, h('td', {}, p.email), h('td', {}, p.role === 'admin' ? h('b', {}, 'admin') : 'étudiant'),
          h('td', {}, h('span', { class: 'pill ' + (/@etu\.univ-amu\.fr$/.test(p.email) ? 'on' : 'off') }, /@etu\.univ-amu\.fr$/.test(p.email) ? 'IUT / AMU ✓' : 'hors AMU')),
          h('td', {}, p.confirmed_at ? h('span', { class: 'pill on' }, 'confirmé') : h('span', { class: 'pill off' }, 'en attente')),
          h('td', { class: 'small' }, date(p.created_at)), h('td', { class: 'small' }, date(p.last_login_at)),
          h('td', {}, p.blocked ? h('span', { class: 'pill off' }, 'bloqué') : ''), h('td', {}, b));
      }));
    };
    q.addEventListener('input', draw); draw();
    const conf = rows.filter((p) => p.confirmed_at).length;
    return h('div', {},
      h('div', { class: 'kpis' }, h('div', { class: 'kpi' }, h('b', {}, rows.length), h('span', {}, 'comptes')), h('div', { class: 'kpi' }, h('b', {}, conf), h('span', {}, 'adresses confirmées')), h('div', { class: 'kpi' }, h('b', {}, rows.filter((p) => p.blocked).length), h('span', {}, 'bloqués'))),
      h('div', { class: 'toolbar' }, q, h('button', { class: 'btn alt', type: 'button', onclick: () => csv('comptes', rows.map((p) => ({ email: p.email, role: p.role, confirme: p.confirmed_at || '', cree: p.created_at, derniere_connexion: p.last_login_at || '', bloque: p.blocked }))) }, 'Export CSV')),
      h('p', { class: 'small muted' }, 'Bloquer retire l\'accès aux fonctions du compte sur le site. Pour empêcher toute connexion, bannis aussi le compte dans Supabase (Authentication → Users).'),
      h('div', { class: 'tbl' }, h('table', { class: 'calc-tbl adm-tbl' }, h('thead', {}, h('tr', {}, ['Adresse', 'Rôle', 'IUT', 'E-mail', 'Créé', 'Dernière connexion', '', ''].map((t) => h('th', {}, t)))), tbody)));
  }

  // ------------------------------------------------------------------ journal
  async function journal() {
    const kind = h('select', {}, ['', 'inscription', 'confirmation e-mail', 'connexion', 'suppression de compte', 'admin : cours fermé', 'admin : cours rouvert', 'admin : compte bloqué', 'admin : compte débloqué'].map((k) => h('option', { value: k }, k || 'Tous les événements')));
    const tbody = h('tbody');
    let rows = [];
    const load = async () => {
      const f = kind.value ? `&kind=eq.${encodeURIComponent(kind.value)}` : '';
      rows = await A.rest(`events?select=*&order=at.desc&limit=500${f}`);
      tbody.replaceChildren(...rows.map((e) => h('tr', {}, h('td', { class: 'small' }, date(e.at)), h('td', {}, h('b', {}, e.kind)), h('td', {}, e.email || h('span', { class: 'muted' }, '—')), h('td', { class: 'small muted' }, Object.keys(e.detail || {}).length ? JSON.stringify(e.detail) : ''))));
    };
    kind.addEventListener('change', () => load().catch((e) => say(e.message)));
    await load();
    return h('div', {},
      h('div', { class: 'toolbar' }, kind, h('button', { class: 'btn alt', type: 'button', onclick: () => csv('journal', rows.map((e) => ({ date: e.at, evenement: e.kind, email: e.email || '', detail: JSON.stringify(e.detail || {}) }))) }, 'Export CSV')),
      h('p', { class: 'small muted' }, 'Inscriptions, confirmations d\'adresse et connexions sont enregistrées par la base elle-même. Seules les adresses @etu.univ-amu.fr peuvent s\'inscrire. Le journal est conservé 12 mois.'),
      h('div', { class: 'tbl' }, h('table', { class: 'calc-tbl adm-tbl' }, h('thead', {}, h('tr', {}, ['Date', 'Événement', 'Compte', 'Détail'].map((t) => h('th', {}, t)))), tbody)));
  }

  function csv(name, rows) {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const txt = '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => cell(r[c])).join(';'))].join('\r\n');
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    const a = h('a', { href: url, download: `gaboulearn-${name}-${new Date().toISOString().slice(0, 10)}.csv` }); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  boot();
})();
