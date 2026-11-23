# Comptes GabouLearn (Supabase)

Le site reste statique : les comptes passent par l'API de Supabase, appelée directement depuis le navigateur (`assets/js/auth.js`).
Toutes les règles de sécurité sont **dans la base** (`schema.sql`) :

- inscription refusée par la base pour toute adresse qui n'est pas `@etu.univ-amu.fr` ;
- un seul compte admin possible (index unique), désigné par `admin.local.sql` (fichier local, exclu de git) ;
- journal automatique : inscription, confirmation d'adresse, connexion, actions admin, suppression ;
- lecture du journal et des comptes réservée à l'admin (Row Level Security) ;
- état des cours (ouvert / fermé) lisible par tous, modifiable par l'admin uniquement.

## Installation (une seule fois, ≈ 15 min)

1. Crée un projet sur https://supabase.com (région **EU West, Paris** ou Francfort, pour le RGPD).
2. **SQL Editor** → colle et exécute `schema.sql`, puis `admin.local.sql`.
3. **Authentication → URL Configuration** :
   - Site URL : `https://gaboulearn.fr/compte/`
   - Redirect URLs : `https://gaboulearn.fr/compte/` et `http://localhost:8770/compte/`
4. **Authentication → Providers → Email** : laisse « Confirm email » activé. Mot de passe minimum : 10.
5. **Project Settings → API** : copie « Project URL » et la clé « anon public » dans `assets/js/config.js`, puis commit et push.
6. **Authentication → Users → Invite user** : invite l'adresse admin. Le lien reçu ouvre `/compte/` et oblige à choisir le mot de passe.
7. (Recommandé) **Authentication → SMTP** : le serveur d'e-mails par défaut de Supabase n'envoie que quelques e-mails par heure. Branche un SMTP (Brevo, Resend…) avant d'ouvrir les inscriptions à beaucoup d'étudiants.
8. (Facultatif) **Database → Extensions → pg_cron**, puis la ligne `cron.schedule` en commentaire dans `schema.sql` pour purger le journal après 12 mois.

## Pages

- `/compte/` : connexion, inscription, mot de passe oublié, changement de mot de passe, suppression du compte.
- `/admin/` : cours (fermer / rouvrir avec un message), comptes (bloquer, export CSV), journal (filtre, export CSV).
- `/confidentialite/` : politique de confidentialité (RGPD).

## Limites connues

- Fermer un cours le masque sur le site, mais ses fichiers restent publics sur GitHub.
- « Bloquer » retire l'accès aux fonctions du compte sur le site ; pour empêcher toute connexion, bannir aussi le compte dans Supabase.

## Agenda ADE (dates des évaluations)

- `migration-annotations.sql` puis `migration-ade.sql` : étiquettes de cours, table `course_exams` (lecture publique), lien ADE privé (`gl_config.ade_url`).
- `functions/sync-ade/index.ts` : Edge Function (déployée depuis le tableau de bord, « Verify JWT with legacy secret » désactivé : la fonction vérifie elle-même `is_admin()`). Elle lit le lien iCal ADE, repère les évaluations (Examen, Soutenance, Partiel, Contrôle, DS, CC, QCM) et les rattache aux cours par leur code R3.xx. `parse.js` est l'analyseur testé en Node, recopié dans `index.ts`.
- Admin → onglet Cours → « Agenda ADE » : coller le lien « Générer URL » d'ADE (Info › 2ème année), puis « Synchroniser maintenant ».
- `migration-groupes.sql` : groupe (GA1, GA2, GB, FA) et sous-groupe (1, 2) de chaque compte, choisi à l'inscription ou dans Mon compte ; `course_exams` n'est plus lisible que par les comptes connectés, et chaque étudiant ne voit que les évaluations de son groupe.
