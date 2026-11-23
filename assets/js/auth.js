// GabouLearn — client des comptes (API Supabase Auth + REST), sans bibliothèque.
// Session dans localStorage ; jeton d'accès renouvelé automatiquement.
(function (root) {
  'use strict';
  const C = root.GABOU_SUPABASE || {};
  const ON = !!(C.url && C.anonKey);
  const KEY = 'gaboulearn-session-v1';
  const AMU = /^[a-z0-9._%+-]+@etu\.univ-amu\.fr$/i;
  const SITE = location.origin;
  let ses = null;
  try { ses = JSON.parse(localStorage.getItem(KEY)); } catch { ses = null; }
  const store = (s) => { ses = s; try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch { /* navigation privée */ } };

  const FR = {
    'Invalid login credentials': 'Adresse ou mot de passe incorrect.',
    'Email not confirmed': 'Confirme d\'abord ton adresse : clique sur le lien reçu par e-mail.',
    'User already registered': 'Un compte existe déjà avec cette adresse.',
    'Password should be at least 6 characters.': 'Mot de passe trop court.',
    'Email rate limit exceeded': 'Trop d\'e-mails envoyés : réessaie dans une heure.',
    'For security purposes, you can only request this after': 'Patiente quelques secondes avant de redemander.',
    'New password should be different from the old password.': 'Le nouveau mot de passe doit être différent de l\'ancien.',
  };
  const tr = (m) => { for (const [k, v] of Object.entries(FR)) if (String(m).includes(k)) return v; if (/amu|univ-amu|étudiantes/i.test(m)) return 'Inscription réservée aux adresses étudiantes @etu.univ-amu.fr.'; return m; };

  async function call(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
    if (!ON) throw new Error('Les comptes ne sont pas encore activés sur ce site.');
    const h = { apikey: C.anonKey, 'Content-Type': 'application/json', ...headers };
    if (auth) { const t = await token(); if (!t) throw new Error('Tu n\'es pas connecté.'); h.Authorization = 'Bearer ' + t; }
    else if (!String(C.anonKey).startsWith('sb_')) h.Authorization = 'Bearer ' + C.anonKey; // clé publishable : en-tête apikey seul
    const r = await fetch(C.url.replace(/\/$/, '') + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    const txt = await r.text();
    let j = null; try { j = txt ? JSON.parse(txt) : null; } catch { j = txt; }
    if (!r.ok) throw new Error(tr((j && (j.msg || j.error_description || j.message || j.error)) || `Erreur ${r.status}`));
    return j;
  }
  const fromToken = (j) => ({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (+j.expires_in || 3600), user: j.user || null });

  let refreshing = null;
  async function token() {
    if (!ses) return null;
    if (ses.expires_at - 60 > Date.now() / 1000) return ses.access_token;
    refreshing = refreshing || (async () => {
      try {
        const r = await fetch(C.url.replace(/\/$/, '') + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: C.anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: ses.refresh_token }) });
        if (!r.ok) throw new Error('refresh');
        const j = await r.json(); store({ ...fromToken(j), user: j.user || ses.user });
      } catch { store(null); }
      refreshing = null;
    })();
    await refreshing;
    return ses ? ses.access_token : null;
  }

  const api = {
    enabled: ON,
    AMU,
    get session() { return ses; },
    get user() { return ses && ses.user; },
    async signUp(email, password, data = {}) {
      email = String(email).trim().toLowerCase();
      if (!AMU.test(email)) throw new Error('Inscription réservée aux adresses étudiantes @etu.univ-amu.fr.');
      return call('/auth/v1/signup?redirect_to=' + encodeURIComponent(SITE + '/compte/'), { method: 'POST', body: { email, password, data } });
    },
    GROUPES: [['GA1', 'GA1 · parcours A'], ['GA2', 'GA2 · parcours A'], ['GB', 'GB · parcours B'], ['FA', 'FA · alternance']],
    groupLabel: (g, s) => (g ? (g === 'FA' ? 'FA · alternance' : `${g}-${s || '?'}`) : null),
    async signIn(email, password) {
      const j = await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: String(email).trim().toLowerCase(), password } });
      store(fromToken(j));
      return j.user;
    },
    async signOut() { try { await call('/auth/v1/logout', { method: 'POST', auth: true }); } catch { /* déjà expiré */ } store(null); },
    async recover(email) { return call('/auth/v1/recover?redirect_to=' + encodeURIComponent(SITE + '/compte/'), { method: 'POST', body: { email: String(email).trim().toLowerCase() } }); },
    async setPassword(password) { const u = await call('/auth/v1/user', { method: 'PUT', body: { password }, auth: true }); if (ses) store({ ...ses, user: u }); return u; },
    // Liens reçus par e-mail (confirmation, invitation, réinitialisation) : #access_token=…&type=…
    async handleRedirect() {
      const hp = new URLSearchParams(location.hash.slice(1));
      const qp = new URLSearchParams(location.search);
      const err = hp.get('error_description') || qp.get('error_description');
      if (err) { history.replaceState(null, '', location.pathname); throw new Error(tr(err.replace(/\+/g, ' '))); }
      if (!hp.get('access_token')) return null;
      store({ access_token: hp.get('access_token'), refresh_token: hp.get('refresh_token'), expires_at: Math.floor(Date.now() / 1000) + (+hp.get('expires_in') || 3600), user: null });
      history.replaceState(null, '', location.pathname);
      try { const u = await call('/auth/v1/user', { auth: true }); store({ ...ses, user: u }); } catch { /* ignore */ }
      return hp.get('type') || 'signup';
    },
    async me() { if (!ses) return null; const rows = await call(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(ses.user && ses.user.id)}`, { auth: true }); return rows && rows[0]; },
    rest: (path, opts = {}) => call('/rest/v1/' + path, { ...opts, auth: true }),
    rpc: (name, args = {}) => call('/rest/v1/rpc/' + name, { method: 'POST', body: args, auth: true }),
    publicRest: (path) => call('/rest/v1/' + path),
    fn: (name, body = {}) => call('/functions/v1/' + name, { method: 'POST', body, auth: true }),
  };
  root.GabouAuth = api;
})(window);
