// R3.08 Probabilités — données du parcours guidé (BUT2 · S3). Généré à partir de la banque GabouLearn.
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 [
  "B1",
  "r308",
  "P(A | B) = ?",
  [
   "P(A ∩ B) / P(B)",
   "P(A) × P(B)",
   "P(B | A)",
   "P(A) + P(B)"
  ],
  "A",
  "Bayes : P(A | B) = P(B | A) P(A) / P(B)."
 ],
 [
  "B2",
  "r308",
  "A et B sont indépendants si…",
  [
   "P(A ∩ B) = P(A) × P(B)",
   "P(A | B) = P(A)",
   "A ∩ B = ∅",
   "P(A) = P(B)"
  ],
  "AB",
  "Piège : des événements incompatibles (A ∩ B = ∅) de probabilités non nulles ne sont jamais indépendants."
 ],
 [
  "B3",
  "r308",
  "X suit une loi binomiale B(n, p)",
  [
   "E(X) = np",
   "V(X) = np(1 − p)",
   "E(X) = p",
   "V(X) = np"
  ],
  "AB",
  "n épreuves de Bernoulli indépendantes de même paramètre p."
 ],
 [
  "B4",
  "r308",
  "Loi de Poisson de paramètre λ",
  [
   "E(X) = λ",
   "V(X) = λ",
   "V(X) = λ²",
   "E(X) = 1/λ"
  ],
  "AB",
  "1/λ = espérance de la loi exponentielle (continue)."
 ],
 [
  "B5",
  "r308",
  "Loi normale : proportion des valeurs dans [μ − 2σ ; μ + 2σ] ?",
  [
   "≈ 95 %",
   "≈ 68 %",
   "≈ 99,7 %",
   "50 %"
  ],
  "A",
  "Règle 68 – 95 – 99,7 pour 1, 2 et 3 écarts-types."
 ],
 [
  "B6",
  "r308",
  "Le théorème central limite dit que…",
  [
   "la somme (ou la moyenne) de nombreuses variables indépendantes de même loi suit à peu près une loi normale",
   "toute variable aléatoire est normale",
   "la moyenne converge vers 0",
   "la variance est toujours 1"
  ],
  "A",
  "D'où l'usage de la loi normale pour les intervalles de confiance."
 ],
 [
  "B7",
  "r308",
  "Loi uniforme continue sur [a ; b]",
  [
   "E(X) = (a + b)/2",
   "V(X) = (b − a)²/12",
   "densité 1/(b − a) sur l'intervalle",
   "V(X) = (b − a)/2"
  ],
  "ABC",
  ""
 ],
 [
  "B8",
  "r308",
  "Loi exponentielle de paramètre λ",
  [
   "E(X) = 1/λ",
   "P(X > t) = e^(−λt)",
   "elle est sans mémoire",
   "E(X) = λ"
  ],
  "ABC",
  "Sans mémoire : P(X > s + t | X > s) = P(X > t). Durées de vie, temps d'attente."
 ],
 [
  "B9",
  "r308",
  "Chaîne de Markov : matrice de transition",
  [
   "la somme de chaque ligne vaut 1",
   "le coefficient (i, j) = P(passer de i à j)",
   "la somme de chaque colonne vaut 1",
   "l'état suivant dépend de tout le passé"
  ],
  "AB",
  "Propriété de Markov : le futur ne dépend que de l'état présent."
 ],
 [
  "B10",
  "r308",
  "Loi des grands nombres",
  [
   "la moyenne empirique converge vers l'espérance",
   "plus n est grand, plus la fréquence approche la probabilité",
   "les résultats « se compensent » à court terme",
   "la variance de la moyenne augmente avec n"
  ],
  "AB",
  "Ce n'est pas « la chance tourne » : chaque tirage reste indépendant."
 ]
];
const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const STEPS = [
 {
  "id": "cond",
  "icon": "",
  "title": "Conditionnelles et indépendance",
  "min": 4,
  "anchor": "conditionnelles",
  "recap": [
   "P(A | B) = P(A ∩ B) / P(B). Bayes : P(A | B) = P(B | A) P(A) / P(B).",
   "Indépendance : P(A ∩ B) = P(A) P(B). Incompatibles ≠ indépendants."
  ],
  "cards": [
   [
    "Formule de Bayes ?",
    "P(A|B) = P(B|A) P(A) / P(B)"
   ]
  ],
  "qs": [
   "B1",
   "B2"
  ]
 },
 {
  "id": "lois",
  "icon": "",
  "title": "Lois usuelles",
  "min": 7,
  "star": true,
  "anchor": "lois",
  "recap": [
   "Binomiale B(n, p) : E = np, V = np(1 − p). Poisson P(λ) : E = V = λ.",
   "Uniforme [a ; b] : E = (a + b)/2, V = (b − a)²/12. Exponentielle E(λ) : E = 1/λ, P(X > t) = e^(−λt), sans mémoire."
  ],
  "cards": [
   [
    "V(X) binomiale ?",
    "np(1 − p)"
   ],
   [
    "E(X) exponentielle ?",
    "1/λ"
   ]
  ],
  "qs": [
   "B3",
   "B4",
   "B7",
   "B8"
  ]
 },
 {
  "id": "limites",
  "icon": "",
  "title": "Loi normale, théorèmes limites, Markov",
  "min": 6,
  "anchor": "normale",
  "recap": [
   "Normale : 68 % à ±1σ, 95 % à ±2σ, 99,7 % à ±3σ. Centrer-réduire : Z = (X − μ)/σ.",
   "Grands nombres : la moyenne empirique tend vers l'espérance. TCL : une somme de variables indépendantes de même loi est à peu près normale.",
   "Markov : matrice de transition, chaque ligne somme à 1, le futur ne dépend que du présent."
  ],
  "cards": [
   [
    "Proportion dans μ ± 2σ ?",
    "≈ 95 %"
   ]
  ],
  "qs": [
   "B5",
   "B6",
   "B9",
   "B10"
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
const data = { key: "r308", title: "R3.08 Probabilités", QUESTIONS, STEPS, tips: {"semaine":["Apprends le tableau des lois (espérance, variance) par cœur."],"qcm":["Vérifie si l'énoncé parle d'une loi discrète (comptage) ou continue (durée, mesure)."]} };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
