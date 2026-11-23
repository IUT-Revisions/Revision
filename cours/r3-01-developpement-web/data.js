// R3.01 Développement web — données du parcours guidé (BUT2 · S3). Généré à partir de la banque GabouLearn.
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 [
  "H1",
  "r301",
  "Meilleure protection contre l'injection SQL",
  [
   "les requêtes préparées (paramètres liés)",
   "concaténer les saisies après un trim()",
   "cacher les messages d'erreur",
   "passer en POST"
  ],
  "A",
  "La requête et les données voyagent séparément : la saisie ne peut pas devenir du SQL."
 ],
 [
  "H2",
  "r301",
  "Contre le XSS, il faut…",
  [
   "échapper les données à l'affichage (htmlspecialchars en PHP)",
   "filtrer et valider les saisies",
   "stocker les mots de passe en MD5",
   "désactiver les cookies"
  ],
  "AB",
  "XSS = injection de script dans la page. On échappe en sortie, on valide en entrée."
 ],
 [
  "H3",
  "r301",
  "Stocker un mot de passe",
  [
   "password_hash() (bcrypt/argon2, sel inclus)",
   "vérifier avec password_verify()",
   "MD5 ou SHA-1 simples",
   "en clair dans une colonne protégée"
  ],
  "AB",
  "Un hachage rapide sans sel se casse avec des tables précalculées."
 ],
 [
  "H4",
  "r301",
  "Une session PHP",
  [
   "stocke les données côté serveur",
   "identifie le client par un cookie (PHPSESSID)",
   "stocke tout dans le cookie du client",
   "rend HTTP « avec état » par nature"
  ],
  "AB",
  "HTTP reste sans état : la session est une mémoire côté serveur, retrouvée grâce à l'identifiant du cookie."
 ],
 [
  "H5",
  "r301",
  "Dans MVC, le contrôleur…",
  [
   "reçoit la requête et orchestre modèle et vue",
   "contient l'accès aux données",
   "génère le HTML",
   "est le fichier CSS"
  ],
  "A",
  "Modèle = données et règles métier ; Vue = affichage ; Contrôleur = chef d'orchestre."
 ],
 [
  "H6",
  "r301",
  "HTTP est…",
  [
   "sans état : chaque requête est indépendante",
   "un protocole à état",
   "chiffré par défaut",
   "réservé aux navigateurs"
  ],
  "A",
  "HTTPS = HTTP dans TLS. L'état (être connecté) se fait avec cookies et sessions."
 ],
 [
  "H7",
  "r301",
  "GET ou POST ?",
  [
   "GET : paramètres dans l'URL, pour lire",
   "POST : données dans le corps, pour créer ou modifier",
   "GET pour envoyer un mot de passe",
   "POST est chiffré, GET non"
  ],
  "AB",
  "Aucun des deux n'est chiffré sans HTTPS."
 ],
 [
  "H8",
  "r301",
  "Protéger un formulaire contre le CSRF",
  [
   "un jeton aléatoire lié à la session, vérifié à la soumission",
   "l'attribut SameSite sur le cookie de session",
   "un CAPTCHA sur toutes les pages",
   "passer le formulaire en GET"
  ],
  "AB",
  "CSRF = un autre site fait envoyer une requête par le navigateur déjà connecté de la victime."
 ],
 [
  "H9",
  "r301",
  "Attributs recommandés pour un cookie de session",
  [
   "HttpOnly (illisible en JavaScript)",
   "Secure (envoyé seulement en HTTPS)",
   "SameSite",
   "Public"
  ],
  "ABC",
  "HttpOnly limite le vol de session par XSS."
 ],
 [
  "H10",
  "r301",
  "Codes de statut HTTP",
  [
   "200 = OK",
   "404 = ressource introuvable",
   "500 = erreur du serveur",
   "302 = erreur du client"
  ],
  "ABC",
  "3xx = redirection (301, 302) ; 4xx = erreur du client (400, 401, 403, 404) ; 5xx = erreur du serveur."
 ]
];
const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const STEPS = [
 {
  "id": "secu",
  "icon": "",
  "title": "Sécurité web",
  "min": 7,
  "star": true,
  "anchor": "securite",
  "recap": [
   "Injection SQL → <b>requêtes préparées</b>. XSS → <b>échapper à l'affichage</b> (htmlspecialchars) et valider les saisies.",
   "CSRF → <b>jeton</b> aléatoire lié à la session + cookie <b>SameSite</b>.",
   "Mots de passe : <code>password_hash</code> / <code>password_verify</code>, jamais MD5 ou SHA-1 brut. Cookie de session : <b>HttpOnly, Secure, SameSite</b>."
  ],
  "cards": [
   [
    "Contre l'injection SQL ?",
    "Requêtes préparées."
   ],
   [
    "Contre le XSS ?",
    "Échapper en sortie (htmlspecialchars)."
   ]
  ],
  "qs": [
   "H1",
   "H2",
   "H3",
   "H8",
   "H9"
  ]
 },
 {
  "id": "http",
  "icon": "",
  "title": "HTTP, sessions, MVC",
  "min": 6,
  "anchor": "http",
  "recap": [
   "HTTP est <b>sans état</b>. GET : paramètres dans l'URL, pour lire ; POST : données dans le corps, pour modifier.",
   "Codes : 2xx succès, 3xx redirection, 4xx erreur du client, 5xx erreur du serveur.",
   "Session : données <b>côté serveur</b>, identifiant dans un cookie. MVC : Modèle (données), Vue (affichage), <b>Contrôleur</b> (orchestre)."
  ],
  "cards": [
   [
    "404 ?",
    "Ressource introuvable (erreur du client)."
   ],
   [
    "Où sont les données de session ?",
    "Côté serveur."
   ]
  ],
  "qs": [
   "H4",
   "H5",
   "H6",
   "H7",
   "H10"
  ]
 },
 {
  "id": "exam",
  "icon": "",
  "title": "Examen blanc",
  "min": 6,
  "exam": 10,
  "recap": [],
  "cards": []
 },
 {
  "id": "fin",
  "icon": "",
  "title": "Carnet d'erreurs & avant le contrôle",
  "min": 3,
  "final": true,
  "recap": [],
  "cards": []
 }
];
const data = { key: "r301", title: "R3.01 Développement web", QUESTIONS, STEPS, tips: {"semaine":["Relis le recueil du cours sur le site de l'enseignant et refais les QCU."],"qcm":["Sécurité : demande-toi toujours « où entre la donnée, où ressort-elle ? »"]} };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
