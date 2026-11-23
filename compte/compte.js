// GabouLearn — page « Mon compte » : connexion, inscription (adresses @etu.univ-amu.fr), mot de passe, suppression.
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
  const field = (label, attrs) => h('label', { class: 'fld' }, h('span', {}, label), h('input', attrs));
  const msg = h('p', { class: 'gl-msg', role: 'status', 'aria-live': 'polite' });
  const say = (t, ok) => { msg.textContent = t || ''; msg.className = 'gl-msg ' + (ok ? 'ok' : t ? 'bad' : ''); };
  const pwOk = (p) => p.length >= 10 && /[a-z]/i.test(p) && /\d/.test(p);
  const PWRULE = 'Au moins 10 caractères, avec au moins une lettre et un chiffre.';
  const busy = async (btn, fn) => { btn.disabled = true; say(''); try { await fn(); } catch (e) { say(e.message); } finally { btn.disabled = false; } };
  const date = (d) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : '—');

  if (!A || !A.enabled) {
    app.replaceChildren(h('div', { class: 'box warn' }, h('p', {}, 'Les comptes ne sont pas encore activés sur GabouLearn. Toutes les révisions restent accessibles sans compte.')));
    return;
  }

  // ------------------------------------------------------------------ choisir un mot de passe (invitation, réinitialisation)
  function forcePassword(title, intro) {
    const p1 = field('Nouveau mot de passe', { type: 'password', autocomplete: 'new-password', required: true });
    const p2 = field('Confirme le mot de passe', { type: 'password', autocomplete: 'new-password', required: true });
    const btn = h('button', { class: 'btn block', type: 'submit' }, 'Enregistrer mon mot de passe');
    const form = h('form', { class: 'box' }, h('h2', {}, title), h('p', {}, intro), p1, p2, h('p', { class: 'muted small' }, PWRULE), btn, msg);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = p1.querySelector('input').value, b = p2.querySelector('input').value;
      if (a !== b) return say('Les deux mots de passe ne sont pas identiques.');
      if (!pwOk(a)) return say(PWRULE);
      busy(btn, async () => { await A.setPassword(a); try { sessionStorage.removeItem('gl-force-pw'); } catch { /* ignore */ } say('Mot de passe enregistré.', true); setTimeout(account, 700); });
    });
    app.replaceChildren(form);
  }

  // ------------------------------------------------------------------ non connecté
  function guest(tab = 'login') {
    const tabs = h('div', { class: 'seg' }, [['login', 'Connexion'], ['signup', 'Créer un compte'], ['forgot', 'Mot de passe oublié']].map(([k, l]) => h('button', { type: 'button', class: k === tab ? 'on' : '', onclick: () => guest(k) }, l)));
    let form;
    if (tab === 'login') {
      const em = field('Adresse e-mail étudiante', { type: 'email', autocomplete: 'username', required: true, placeholder: 'prenom.nom@etu.univ-amu.fr' });
      const pw = field('Mot de passe', { type: 'password', autocomplete: 'current-password', required: true });
      const btn = h('button', { class: 'btn block', type: 'submit' }, 'Se connecter');
      form = h('form', { class: 'box' }, em, pw, btn);
      form.addEventListener('submit', (e) => { e.preventDefault(); busy(btn, async () => { await A.signIn(em.querySelector('input').value, pw.querySelector('input').value); await account(); }); });
    } else if (tab === 'signup') {
      const em = field('Adresse e-mail étudiante', { type: 'email', autocomplete: 'username', required: true, placeholder: 'prenom.nom@etu.univ-amu.fr' });
      const p1 = field('Mot de passe', { type: 'password', autocomplete: 'new-password', required: true });
      const p2 = field('Confirme le mot de passe', { type: 'password', autocomplete: 'new-password', required: true });
      const ok = h('label', { class: 'chk' }, h('input', { type: 'checkbox', required: true }), ' J\'ai lu la ', h('a', { href: '../confidentialite/' }, 'politique de confidentialité'), '.');
      const btn = h('button', { class: 'btn block', type: 'submit' }, 'Créer mon compte');
      form = h('form', { class: 'box' }, h('p', { class: 'small' }, 'Réservé aux étudiants d\'Aix-Marseille Université : seules les adresses ', h('b', {}, '@etu.univ-amu.fr'), ' sont acceptées. Un lien de confirmation t\'est envoyé.'), em, p1, p2, h('p', { class: 'muted small' }, PWRULE), ok, btn);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const mail = em.querySelector('input').value.trim();
        const a = p1.querySelector('input').value, b = p2.querySelector('input').value;
        if (!A.AMU.test(mail)) return say('Inscription réservée aux adresses étudiantes @etu.univ-amu.fr.');
        if (a !== b) return say('Les deux mots de passe ne sont pas identiques.');
        if (!pwOk(a)) return say(PWRULE);
        busy(btn, async () => { await A.signUp(mail, a); form.replaceChildren(h('h3', {}, 'Vérifie ta boîte mail'), h('p', {}, `Un lien de confirmation a été envoyé à ${mail}. Clique dessus pour activer ton compte (pense aux courriers indésirables).`)); });
      });
    } else {
      const em = field('Adresse e-mail étudiante', { type: 'email', autocomplete: 'username', required: true });
      const btn = h('button', { class: 'btn block', type: 'submit' }, 'Recevoir un lien de réinitialisation');
      form = h('form', { class: 'box' }, em, btn);
      form.addEventListener('submit', (e) => { e.preventDefault(); busy(btn, async () => { await A.recover(em.querySelector('input').value); say('Si un compte existe pour cette adresse, un lien vient d\'être envoyé.', true); }); });
    }
    app.replaceChildren(tabs, form, msg);
  }

  // ------------------------------------------------------------------ connecté
  async function account() {
    if (!A.session) return guest();
    let p = null;
    try { p = await A.me(); } catch (e) { say(e.message); }
    if (!A.session) return guest();
    if (p && p.blocked) { await A.signOut(); app.replaceChildren(h('div', { class: 'box warn' }, h('p', {}, 'Ce compte est bloqué. Contacte l\'administrateur de GabouLearn.'))); return; }
    const out = h('button', { class: 'btn alt', type: 'button', onclick: async () => { await A.signOut(); guest(); } }, 'Se déconnecter');
    const chg = h('button', { class: 'btn alt', type: 'button', onclick: () => forcePassword('Changer mon mot de passe', 'Choisis un nouveau mot de passe.') }, 'Changer mon mot de passe');
    const del = h('button', { class: 'linkish bad', type: 'button', onclick: () => {
      const t = prompt('Supprimer définitivement ton compte ? Tape SUPPRIMER pour confirmer.');
      if (t !== 'SUPPRIMER') return;
      busy(del, async () => { await A.rpc('delete_my_account'); await A.signOut(); app.replaceChildren(h('div', { class: 'box keep' }, h('p', {}, 'Ton compte a été supprimé.'))); });
    } }, 'Supprimer mon compte');
    app.replaceChildren(
      h('div', { class: 'box keep' },
        h('h2', {}, 'Mon compte'),
        h('p', {}, h('b', {}, (p && p.email) || (A.user && A.user.email) || '')),
        h('ul', { class: 'small' },
          h('li', {}, 'Rôle : ', p && p.role === 'admin' ? h('b', {}, 'administrateur') : 'étudiant'),
          h('li', {}, 'Compte créé le ', date(p && p.created_at)),
          h('li', {}, 'Adresse confirmée le ', date(p && p.confirmed_at)),
          h('li', {}, 'Dernière connexion : ', date(p && p.last_login_at))),
        p && p.role === 'admin' ? h('p', {}, h('a', { class: 'btn', href: '../admin/' }, 'Ouvrir l\'administration')) : null,
        h('div', { class: 'row' }, chg, out)),
      h('p', { class: 'center' }, del),
      msg);
  }

  (async () => {
    try {
      const type = await A.handleRedirect();
      if (type === 'invite' || type === 'recovery') {
        try { sessionStorage.setItem('gl-force-pw', '1'); } catch { /* ignore */ }
        return forcePassword(type === 'invite' ? 'Bienvenue sur GabouLearn' : 'Nouveau mot de passe', type === 'invite' ? 'Ton compte a été créé. Avant de continuer, choisis ton mot de passe : personne d\'autre que toi ne le connaîtra.' : 'Choisis ton nouveau mot de passe.');
      }
      let force = false; try { force = sessionStorage.getItem('gl-force-pw') === '1'; } catch { /* ignore */ }
      if (force && A.session) return forcePassword('Choisis ton mot de passe', 'Termine la création de ton compte en choisissant ton mot de passe.');
      if (type === 'signup' || type === 'email_change') say('Adresse confirmée : ton compte est actif. ', true);
    } catch (e) { say(e.message); }
    const anchor = location.hash;
    if (anchor === '#mdp' && A.session) return forcePassword('Changer mon mot de passe', 'Choisis un nouveau mot de passe.');
    if (anchor === '#inscription' && !A.session) return guest('signup');
    await account();
  })();
})();
