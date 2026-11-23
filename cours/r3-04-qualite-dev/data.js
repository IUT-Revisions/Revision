// R3.04 Qualité de développement — données du parcours guidé (BUT2 · S3). Généré à partir de la banque GabouLearn.
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 [
  "Q1",
  "r304",
  "Le « D » de SOLID",
  [
   "Dependency inversion : dépendre d'abstractions, pas d'implémentations",
   "Don't repeat yourself",
   "Documentation",
   "Decorator"
  ],
  "A",
  "S responsabilité unique, O ouvert/fermé, L substitution de Liskov, I ségrégation des interfaces, D inversion des dépendances."
 ],
 [
  "Q5",
  "r304",
  "Le refactoring (restructuration de code)…",
  [
   "change la structure du code sans changer son comportement",
   "se fait sous la protection de tests",
   "ajoute des fonctionnalités",
   "est réservé à la fin du projet"
  ],
  "AB",
  "Petites étapes, tests verts entre chaque étape."
 ],
 [
  "Q6",
  "r304",
  "Objectifs d'une bonne architecture",
  [
   "couplage faible",
   "cohésion forte",
   "couplage fort",
   "classes « Dieu » qui font tout"
  ],
  "AB",
  "Modules indépendants et centrés sur une seule responsabilité."
 ],
 [
  "Q2",
  "r304",
  "Les 3 familles de patrons de conception du GoF",
  [
   "création",
   "structure",
   "comportement",
   "persistance"
  ],
  "ABC",
  "Création : Singleton, Fabrique, Builder… Structure : Adaptateur, Décorateur, Composite, Façade, Proxy… Comportement : Observateur, Stratégie, Commande, État, Itérateur…"
 ],
 [
  "Q3",
  "r304",
  "Quel patron notifie automatiquement des abonnés quand un objet change ?",
  [
   "Observateur",
   "Singleton",
   "Adaptateur",
   "Fabrique"
  ],
  "A",
  "Sujet + liste d'observateurs, méthode notifier(). Base des écouteurs d'événements."
 ],
 [
  "Q4",
  "r304",
  "Quel patron rend des algorithmes interchangeables à l'exécution ?",
  [
   "Stratégie",
   "Décorateur",
   "Composite",
   "Builder"
  ],
  "A",
  "Une interface Stratégie, plusieurs implémentations, injectées dans le contexte."
 ],
 [
  "Q7",
  "r304",
  "Le Singleton…",
  [
   "garantit une seule instance et un point d'accès global",
   "est un patron de création",
   "est un patron de comportement",
   "oblige à rendre toutes les méthodes statiques"
  ],
  "AB",
  "Constructeur privé + méthode getInstance(). À utiliser avec modération : c'est un état global."
 ],
 [
  "Q8",
  "r304",
  "Ajouter dynamiquement des responsabilités à un objet en l'enveloppant",
  [
   "Décorateur",
   "Façade",
   "Singleton",
   "Itérateur"
  ],
  "A",
  "Le décorateur implémente la même interface et délègue à l'objet enveloppé (ex. new BufferedReader(new FileReader(f)) en Java)."
 ],
 [
  "Q9",
  "r304",
  "Rendre utilisable une classe dont l'interface ne convient pas",
  [
   "Adaptateur",
   "Proxy",
   "Observateur",
   "Builder"
  ],
  "A",
  "Adaptateur = traducteur d'interface. Façade = interface simplifiée devant un sous-système entier."
 ],
 [
  "Q10",
  "r304",
  "Traiter de la même façon un objet simple et un groupe d'objets (structure en arbre)",
  [
   "Composite",
   "Stratégie",
   "Commande",
   "Fabrique"
  ],
  "A",
  "Ex. : fichiers et dossiers, formes et groupes de formes."
 ],
 [
  "Q11",
  "r304",
  "Le « O » de SOLID",
  [
   "ouvert à l'extension, fermé à la modification",
   "orienté objet",
   "observateur",
   "optimisation"
  ],
  "A",
  "On ajoute un comportement par une nouvelle classe, sans toucher au code qui marche."
 ],
 [
  "Q12",
  "r304",
  "Git : développer une fonctionnalité sans casser main",
  [
   "créer une branche (git switch -c ma-branche)",
   "la fusionner ensuite (merge ou pull request)",
   "committer directement sur main",
   "supprimer l'historique"
  ],
  "AB",
  "rebase réécrit l'historique : à éviter sur une branche partagée."
 ],
 [
  "Q13",
  "r304",
  "Javadoc",
  [
   "commentaire /** … */ au-dessus de la classe ou de la méthode",
   "balises @param, @return, @throws",
   "commentaire // de fin de ligne",
   "génère une documentation HTML"
  ],
  "ABD",
  "La commande javadoc produit le site de documentation."
 ]
];
const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const STEPS = [
 {
  "id": "solid",
  "icon": "🧱",
  "title": "SOLID, couplage et refactoring",
  "min": 6,
  "anchor": "solid",
  "recap": [
   "<b>S</b> responsabilité unique · <b>O</b> ouvert à l'extension, fermé à la modification · <b>L</b> substitution de Liskov · <b>I</b> ségrégation des interfaces · <b>D</b> inversion des dépendances.",
   "Viser un <b>couplage faible</b> et une <b>cohésion forte</b>.",
   "<b>Refactoring</b> = changer la structure sans changer le comportement, par petites étapes, tests verts entre chaque."
  ],
  "cards": [
   [
    "Le « D » de SOLID ?",
    "Dépendre d'abstractions, pas d'implémentations."
   ],
   [
    "Refactoring ?",
    "Même comportement, meilleure structure, sous tests."
   ]
  ],
  "qs": [
   "Q1",
   "Q11",
   "Q5",
   "Q6"
  ]
 },
 {
  "id": "patrons",
  "icon": "🧩",
  "title": "Patrons de conception",
  "min": 8,
  "star": true,
  "anchor": "patrons",
  "recap": [
   "3 familles : <b>création</b> (Singleton, Fabrique, Builder), <b>structure</b> (Adaptateur, Décorateur, Composite, Façade, Proxy), <b>comportement</b> (Observateur, Stratégie, Commande, État, Itérateur).",
   "<b>Observateur</b> : notifier des abonnés. <b>Stratégie</b> : algorithmes interchangeables. <b>Décorateur</b> : envelopper pour ajouter un comportement.",
   "<b>Adaptateur</b> : traduire une interface. <b>Composite</b> : traiter pareil un élément et un groupe."
  ],
  "cards": [
   [
    "Observateur ?",
    "Un sujet notifie ses abonnés."
   ],
   [
    "Décorateur ?",
    "Même interface, ajoute un comportement en enveloppant."
   ],
   [
    "Composite ?",
    "Élément simple et groupe traités pareil (arbre)."
   ]
  ],
  "qs": [
   "Q2",
   "Q3",
   "Q4",
   "Q7",
   "Q8",
   "Q9",
   "Q10"
  ]
 },
 {
  "id": "outils",
  "icon": "🛠️",
  "title": "Documentation et Git",
  "min": 4,
  "anchor": "outils",
  "recap": [
   "Javadoc : <code>/** … */</code>, <code>@param</code>, <code>@return</code>, <code>@throws</code>, génère un site HTML.",
   "Git : une <b>branche</b> par fonctionnalité, fusion par merge ou pull request ; pas de rebase sur une branche partagée."
  ],
  "cards": [
   [
    "Créer une branche et y aller ?",
    "git switch -c ma-branche"
   ]
  ],
  "qs": [
   "Q12",
   "Q13"
  ]
 },
 {
  "id": "exam",
  "icon": "⏱️",
  "title": "Examen blanc",
  "min": 8,
  "exam": 13,
  "recap": [],
  "cards": []
 },
 {
  "id": "fin",
  "icon": "🏁",
  "title": "Carnet d'erreurs & avant le contrôle",
  "min": 3,
  "final": true,
  "recap": [],
  "cards": []
 }
];
const data = { key: "r304", title: "R3.04 Qualité de développement", QUESTIONS, STEPS, tips: {"semaine":["Pour chaque patron, retiens un exemple concret (Observateur = écouteur d'événements, Décorateur = flux Java)."],"qcm":["Création / structure / comportement : classe le patron avant de répondre."]} };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
