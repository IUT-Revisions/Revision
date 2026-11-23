// GabouLearn — configuration des comptes (Supabase).
// url et anonKey viennent de Supabase : Project Settings → API (« Project URL » et clé « anon public »).
// La clé anon est PUBLIQUE par conception : la sécurité repose sur les règles de la base (supabase/schema.sql).
// Laisser vide = comptes désactivés (le site fonctionne comme avant).
window.GABOU_SUPABASE = {
  url: '',
  anonKey: '',
};
