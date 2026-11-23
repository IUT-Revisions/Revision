// GabouLearn — configuration des comptes (Supabase).
// url et anonKey viennent de Supabase : Project Settings → API (« Project URL » et clé « anon public »).
// La clé anon est PUBLIQUE par conception : la sécurité repose sur les règles de la base (supabase/schema.sql).
// Laisser vide = comptes désactivés (le site fonctionne comme avant).
window.GABOU_SUPABASE = {
  url: 'https://ehjwsccriasuqhpkowxo.supabase.co',
  anonKey: 'sb_publishable_fRDM0D4Zqpp4W8A57usW4A_Ave5O-kv',
};
