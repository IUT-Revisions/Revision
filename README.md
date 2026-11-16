# GabouLearn — Révisions

Site de révision pour **tous les cours** du BUT. Chaque matière est une rubrique qui peut proposer :

- 📖 une **fiche de cours corrigée** ;
- 🎯 un **entraînement aléatoire** : QCM, vrai/faux, cas à choix, chiffres à retenir, questions générées à partir des notions ; corrigé immédiat ou examen blanc, et suivi des points faibles ;
- ✍️ des **cas pratiques rédigés** dont les faits changent à chaque tirage, notés en **% par notions clés**, avec un corrigé type ;
- 🎮 un **jeu multijoueur** à héberger soi-même sur un réseau local (R3.11 pour l'instant).

Matières disponibles : **R3.11 Droit du numérique**.

## Utiliser le site

Le site est **100 % statique** (HTML, CSS, JavaScript, sans dépendance) : il fonctionne sur GitHub Pages, et les statistiques de chaque élève restent dans son navigateur.

Pour le lancer en local avec le jeu multijoueur (Node.js 18 ou plus, rien à installer) :

```bash
npm start
```

Puis ouvrez `http://localhost:3000`. Les autres joueurs, connectés au même Wi-Fi, ouvrent l'adresse « réseau local » affichée dans la console, suivie de `/jeu/`. Sous Windows, vous pouvez aussi double-cliquer sur `jeu/LANCER.bat`.

> Le jeu multijoueur a besoin du serveur Node : il ne fonctionne pas sur la version GitHub Pages. La page `jeu/` l'explique alors aux visiteurs.

## Structure

```
index.html                   accueil : liste des matières
assets/css/style.css         styles communs
assets/js/cours.js           ← liste des matières affichées sur l'accueil
assets/js/trainer.js         moteur de l'entraînement aléatoire (commun)
assets/js/casegen.js         moteur des cas pratiques rédigés + notation (commun)
assets/js/redac.js           interface des cas pratiques rédigés (commun)
assets/js/course.js          prépare une page de cours (cases « chapitres »)
cours/<matière>/index.html   fiche + entraînements de la matière
cours/<matière>/donnees.js   banque de questions de la matière
cours/<matière>/cas.js       modèles de cas pratiques rédigés de la matière
cours/_modele/               modèle à copier pour ajouter une matière
jeu/                         jeu multijoueur (serveur Node + client)
scripts/check.js             vérification des banques de questions et des cas
```

## Ajouter une matière

1. Copiez `cours/_modele/` dans `cours/<code-titre>/` (exemple : `cours/r3-04-qualite-dev/`).
2. Rédigez la fiche dans `index.html`, puis changez `data-course` et le titre.
3. Remplissez `donnees.js` (chapitres, QCM, vrai/faux…) et, si besoin, `cas.js` (cas rédigés).
4. Ajoutez la matière dans `assets/js/cours.js`.
5. Lancez `npm run check` : les banques sont validées, et chaque corrigé de cas doit obtenir 100 %.

Règles de contenu : chaque réponse doit citer sa source (article, cours…), et dans les QCM la **première** proposition est la bonne (l'ordre est mélangé à l'affichage).

## Sécurité

- **Site en ligne (GitHub Pages)** : il n'y a ni compte, ni formulaire envoyé à un serveur, ni base de données, donc rien à saturer de ce côté. Les pages appliquent une politique de sécurité du contenu (CSP) : scripts du site uniquement, pas de script injecté.
- **Serveur du jeu (`jeu/server.js`)** :
  - limitation du débit par adresse IP (toutes requêtes, actions de jeu, création de salles, tentatives pour rejoindre une salle), avec une réponse 429 en cas d'abus ;
  - plafonds : 300 salles, 16 joueurs par salle, 12 flux temps réel par IP et 2 000 au total ;
  - taille des requêtes limitée à 20 Ko, champs nettoyés et tronqués ;
  - délais d'expiration contre les connexions lentes (slowloris) ;
  - en-têtes de sécurité : CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` ;
  - aucun fichier caché ni `node_modules` servi, protection contre la remontée de dossiers (`../`) ;
  - réactions limitées à une toutes les 600 ms par joueur.
- **Aucun secret** dans le dépôt : le projet n'utilise ni clé d'API ni mot de passe. `.gitignore` exclut `.env`, les clés et les certificats.

## Publication sur GitHub Pages

Dans les paramètres du dépôt : *Settings → Pages → Deploy from a branch → `main` / `/ (root)`*.
