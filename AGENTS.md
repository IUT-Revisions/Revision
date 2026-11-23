# GabouLearn — contexte pour un agent de code

Site de révision pour le **BUT informatique (IUT d'Aix-Marseille, 2e année, semestre 3)**, en français, en ligne sur **https://gaboulearn.fr** (GitHub Pages, dépôt public `IUT-Revisions/Revision`, branche `main` = production, déploiement automatique ~30 s après un push).

Lis ce fichier en entier avant de modifier quoi que ce soit.

## Règles non négociables

1. **Aucune donnée personnelle dans le dépôt** (il est public) : pas d'adresse e-mail réelle, pas de notes d'étudiant, pas de nom. L'adresse de l'admin est dans `supabase/admin.local.sql`, **exclu de git** (`*.local.sql`) : ne jamais le committer ni recopier son contenu.
2. **Jamais de secret côté site.** La seule clé présente est la clé Supabase *publishable* (`assets/js/config.js`), publique par conception. La clé `service_role` / secrète ne doit **jamais** apparaître dans le code du site.
3. **Le site reste statique et public.** Pas de framework, pas de bundler, pas de dépendance npm côté site, pas de CDN : la CSP de chaque page n'autorise que `'self'` (+ `https://*.supabase.co` en `connect-src`). Tout est en HTML/CSS/JS vanilla.
4. **Français partout** dans l'interface et les commits. Tutoiement de l'étudiant.
5. **Style « unslop »** (voir plus bas) : pas d'emoji dans l'interface, pas de dégradé, pas d'ombres décoratives, pas de MAJUSCULES espacées, pas de point d'exclamation.
6. **Responsive obligatoire** : vérifier à 375 px de large (aucun défilement horizontal).
7. Avant chaque commit : `node scripts/check.js` (doit afficher `0 erreur(s)`) et `node --check` sur les JS modifiés.
8. **Incrémenter la version anti-cache** (`?v=AAAAMMJJx`, actuellement `20261123d`) dans **toutes** les pages HTML dès qu'un fichier CSS/JS partagé change, sinon les visiteurs gardent l'ancienne version ~10 min.

## Arborescence

```
index.html                    accueil : cartes des cours (générées par assets/js/home.js depuis assets/js/cours.js)
assets/css/style.css          styles de base (+ menu compte, annotations)
assets/css/fiche.css          styles des fiches de cours et du parcours guidé
assets/css/sobre.css          couche « unslop », chargée EN DERNIER sur chaque page (tokens couleur, rayons, bandeaux)
assets/css/compte.css         pages compte / admin
assets/js/cours.js            liste des cours de l'accueil (code, titre, url, description, outils)
assets/js/parcours.js         moteur commun des parcours guidés (lit window.PARCOURS)
assets/js/config.js           URL + clé publishable Supabase
assets/js/auth.js             client Supabase SANS bibliothèque (fetch vers /auth/v1, /rest/v1, /functions/v1) → window.GabouAuth
assets/js/etat.js             barre du haut (menu compte, thème), cours fermés, bandeaux d'évaluation filtrés par groupe
assets/js/trainer.js, casegen.js, redac.js   moteurs propres à R3.11
cours/<slug>/index.html       une page par ressource : fiche + section parcours (#parcours-section)
cours/<slug>/data.js          banque de QCM + étapes du parcours (window.PARCOURS)
cours/r3-02-r3-03-dev-efficace-analyse/   page historique avec son propre parcours.js + uml-java.js (widgets)
cours/r3-11-droit-du-numerique/            page historique (trainer/cas pratiques)
cours/but2-calcul-moyenne/    calculateur : coef.js (coefficients officiels FI/FA, parcours A/B, S3/S4), calc.js,
                              releve.js (lecteur PDF ScoDoc maison), import.js, plan.js (« Mon plan »), pdfgen.js (PDF maison)
compte/                       inscription / connexion / groupe / mot de passe / suppression
admin/                        administration (réservée au rôle admin) : cours, agenda ADE, comptes, journal
confidentialite/              politique de confidentialité (RGPD)
supabase/                     schéma SQL, migrations, Edge Function sync-ade, README d'installation
scripts/check.js              vérification des banques de questions
```

## Format d'un cours (`cours/<slug>/data.js`)

```js
const RAW = [ [id, chapitre, énoncé, [propositions A,B,C,D], 'AC' /* bonnes réponses */, explication], … ];
const STEPS = [ { id, icon: '', title, min, star?, anchor, recap: [html…], cards: [[question, réponse]…], qs: [ids…] },
                …, { id: 'exam', title: 'Examen blanc', exam: N }, { id: 'fin', final: true } ];
root.PARCOURS = { key, title, QUESTIONS, STEPS, tips: { semaine: [...], qcm: [...] } };
```
Plusieurs bonnes réponses possibles. Chaque réponse doit être exacte et vérifiable (cours, programme national BUT 2022). Ajouter un cours = créer `cours/<slug>/` sur le modèle d'une page existante (ex. `r3-06-reseaux`), l'ajouter dans `assets/js/cours.js`, `sitemap.xml`, le JSON-LD de `index.html`, et la table `courses` de Supabase.

## Supabase (comptes, admin, évaluations)

Projet `gaboulearn`, région Paris, ref `ehjwsccriasuqhpkowxo`. Toute la sécurité est dans la base (RLS) — le site ne donne aucun droit.

- `profiles` : email, role (`etudiant` | `admin`, **un seul admin** possible), blocked, groupe (`GA1`,`GA2`,`GB`,`FA`), sous_groupe (1|2), dates.
- Inscription **refusée par la base** hors `@etu.univ-amu.fr` (trigger sur `auth.users`). Le groupe choisi à l'inscription passe par les métadonnées.
- `events` : journal (inscription, confirmation, connexion, actions admin…), lisible par l'admin seul.
- `courses` : slug, titre, open, message, tags (`incomplet`, `en-redaction`, `a-jour`, `verifie`, `controle-bientot`, `controle-passe`), note, exam_date — lecture publique.
- `course_exams` : évaluations importées d'ADE — **lisible uniquement par les comptes connectés**.
- `gl_config` : config privée (adresse admin, lien ADE) — aucune lecture depuis le site.
- Fonctions RPC : `is_admin`, `admin_set_course`, `admin_annotate_course`, `admin_set_blocked`, `admin_set_ade_url`, `admin_get_ade_url`, `set_my_group`, `delete_my_account`, `purge_old_events`.
- Edge Function `sync-ade` (`supabase/functions/sync-ade/index.ts`, analyseur testé dans `parse.js`) : lit l'iCal ADE, garde les événements Examen / Soutenance / Partiel / Contrôle / DS / CC / QCM, les rattache aux cours par code R3.xx, remplace les lignes `source = 'ade'`. Vérifie elle-même `is_admin()` (« Verify JWT with legacy secret » désactivé).
- Les migrations sont dans `supabase/*.sql` et s'exécutent **à la main** dans le SQL Editor de Supabase (idempotentes). Garder `schema.sql` à jour.

## Direction de design (unslop, méthode de Damir Sokolovsky, CC BY 4.0)

Révisions de BUT info · studieux, direct, un peu chaleureux · univers du cahier (papier et encre). Fond « papier » gris chaud (`--bg`, `--card`, `--soft`), une seule couleur d'accent encre bleue (`--accent: #2f5fb3`, liens `--link`), thèmes clair et sombre via `data-theme` / `prefers-color-scheme`. Signature : codes de ressources (R3.06…) en chasse fixe (`--mono`). Le seul élément « riche » : les bandeaux d'évaluation `.gl-flag` en haut des cartes (couleur selon l'urgence). Poids de police 400–600, rayons 4/8/12 px, filets plutôt qu'ombres, focus visible, `prefers-reduced-motion` respecté.

## Pièges connus

- PowerShell 5.1 : `Set-Content`/`Add-Content` sans `-Encoding utf8` casse les accents ; écrire les fichiers en UTF-8 sans BOM.
- PowerShell : un tableau à un seul élément `@(@('a','b'))` est aplati — a déjà corrompu des fichiers lors d'un remplacement en masse.
- Les classes CSS `.warn` / `.keep` sont déjà prises (encadrés) : ne pas les réutiliser pour autre chose.
- `assets/js/etat.js` calcule le chemin de base depuis `document.currentScript.src` : ne pas le charger en module.
- Les clés Supabase `sb_publishable_…` s'envoient en en-tête `apikey` seul (pas en `Authorization: Bearer`).
- Tester une page dans un navigateur qui a l'ancienne version en cache : recharger les fichiers (`fetch(url, {cache:'reload'})`).

## État et pistes

- Fait : 10 cours du S3 (fiches + parcours), calculateur de moyenne (FI/FA, import du relevé ScoDoc, classement estimé, plan + PDF), comptes Supabase, admin (cours, annotations, agenda ADE, comptes, journal), bandeaux d'évaluation par groupe.
- Pistes possibles : synchronisation ADE automatique la nuit (pg_cron + pg_net vers `sync-ade`), SMTP personnalisé pour les e-mails Supabase (le quota par défaut est très bas), cours du S4, coefficients BUT1/BUT3 dans le calculateur.
- Ne pas ajouter de suivi d'audience ni de publicité (engagement de la page Confidentialité).
