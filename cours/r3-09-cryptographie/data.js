// R3.09 Cryptographie et sécurité — données du parcours guidé (BUT2 · S3). Généré à partir de la banque GabouLearn.
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 [
  "C1",
  "arith",
  "PGCD(640, 520) ?",
  [
   "40",
   "20",
   "80",
   "120"
  ],
  "A",
  "Euclide : 640 = 1×520 + 120 ; 520 = 4×120 + 40 ; 120 = 3×40 + 0."
 ],
 [
  "C2",
  "arith",
  "Reste de 7^2021 dans la division par 5 ?",
  [
   "2",
   "1",
   "3",
   "4"
  ],
  "A",
  "7 ≡ 2 (mod 5) et 2⁴ ≡ 1. 2021 = 4×505 + 1, donc 7^2021 ≡ 2¹ = 2."
 ],
 [
  "C3",
  "arith",
  "Si a ≡ 5 (mod 7), alors 2a ≡ … (mod 7)",
  [
   "3",
   "10",
   "5",
   "2"
  ],
  "A",
  "2a ≡ 10 ≡ 3 (mod 7). On réduit toujours entre 0 et n − 1."
 ],
 [
  "C4",
  "arith",
  "Inverse de 3 modulo 7 ?",
  [
   "5",
   "3",
   "2",
   "il n'existe pas"
  ],
  "A",
  "3 × 5 = 15 = 2×7 + 1. Un inverse modulo n existe si et seulement si PGCD(a, n) = 1."
 ],
 [
  "C5",
  "arith",
  "Petit théorème de Fermat : p premier, a non multiple de p…",
  [
   "a^(p−1) ≡ 1 (mod p)",
   "a^p ≡ a (mod p)",
   "a^p ≡ 0 (mod p)",
   "a^(p+1) ≡ 1 (mod p)"
  ],
  "AB",
  "C'est l'outil pour réduire les grandes puissances (et la base de RSA avec φ(n))."
 ],
 [
  "C6",
  "arith",
  "37 et 154 sont-ils premiers entre eux ?",
  [
   "oui",
   "non, ils sont divisibles par 7",
   "non, ils sont divisibles par 2",
   "on ne peut pas savoir sans calculatrice"
  ],
  "A",
  "154 = 2 × 7 × 11 et 37 est premier : PGCD = 1."
 ],
 [
  "S1",
  "sym",
  "Chiffrer CHAT par substitution (décalage) de clé 12 ?",
  [
   "OTMF",
   "OTNF",
   "NSLE",
   "PUNG"
  ],
  "A",
  "C(2)+12 = 14 → O ; H(7)+12 = 19 → T ; A(0)+12 = 12 → M ; T(19)+12 = 31 ≡ 5 → F."
 ],
 [
  "S2",
  "sym",
  "Déchiffrer un décalage de clé k",
  [
   "x = (y − k) mod 26",
   "x = (y + k) mod 26",
   "x = (y × k) mod 26",
   "x = y − k sans modulo"
  ],
  "A",
  "Le modulo évite les valeurs négatives : (2 − 10) mod 26 = 18."
 ],
 [
  "S3",
  "sym",
  "Pourquoi César est-il faible ?",
  [
   "seulement 25 clés utiles : on les essaie toutes",
   "l'analyse de fréquences le casse aussi",
   "il utilise une clé publique",
   "il est trop lent"
  ],
  "AB",
  "Une substitution quelconque a 26! clés, mais reste cassée par l'analyse de fréquences (E le plus fréquent en français)."
 ],
 [
  "S4",
  "sym",
  "Chiffrement par permutation avec une grille et une clé (ex. TIRE)",
  [
   "on écrit le message ligne par ligne dans la grille",
   "on lit les colonnes dans l'ordre alphabétique des lettres de la clé",
   "on lit les lignes dans l'ordre de la clé",
   "on décale chaque lettre de la valeur de la clé"
  ],
  "AB",
  "TIRE → ordre E, I, R, T = colonnes 4, 2, 3, 1. Pour déchiffrer : découper le message en colonnes de la hauteur de la grille et les remettre à leur place."
 ],
 [
  "S5",
  "sym",
  "RENDEZ VOUS CHEZ MOI, grille 5×4, espaces = 0, clé TIRE. Message chiffré ?",
  [
   "DV0ZIEZUHMN0SEOREOC0",
   "REOC0EZUHMN0SEODV0ZI",
   "RENDEZ0VOUS0CHEZ0MOI",
   "DV0ZIN0SEOEZUHMREOC0"
  ],
  "A",
  "Colonne E (4e) : DV0ZI ; I (2e) : EZUHM ; R (3e) : N0SEO ; T (1re) : REOC0."
 ],
 [
  "S6",
  "sym",
  "Vigenère",
  [
   "est polyalphabétique : une même lettre claire peut donner plusieurs lettres chiffrées",
   "répète la clé sur toute la longueur du message",
   "se casse en trouvant la longueur de la clé (Kasiski, indice de coïncidence)",
   "est un chiffrement asymétrique"
  ],
  "ABC",
  "Une fois la longueur L trouvée, ce sont L chiffrements de César à casser par analyse de fréquences."
 ],
 [
  "R1",
  "asym",
  "RSA : p = 3, q = 11, e = 3. Que valent n, φ(n) et d ?",
  [
   "n = 33, φ(n) = 20, d = 7",
   "n = 33, φ(n) = 32, d = 11",
   "n = 14, φ(n) = 20, d = 7",
   "n = 33, φ(n) = 20, d = 3"
  ],
  "A",
  "φ = (p−1)(q−1) = 20 ; d = e⁻¹ mod 20 : 3 × 7 = 21 ≡ 1."
 ],
 [
  "R2",
  "asym",
  "Toujours avec n = 33 et e = 3 : chiffrement de m = 4 ?",
  [
   "31",
   "12",
   "64",
   "4"
  ],
  "A",
  "c = 4³ mod 33 = 64 − 33 = 31. Vérification : 31⁷ mod 33 = 4."
 ],
 [
  "R3",
  "asym",
  "Dans RSA, qu'est-ce qui est public ?",
  [
   "n",
   "e",
   "d",
   "p et q"
  ],
  "AB",
  "Clé publique (n, e), clé privée d. Connaître p et q permet de calculer φ(n), donc d."
 ],
 [
  "R4",
  "asym",
  "Diffie-Hellman : p = 23, g = 5, secret a = 6. Valeur envoyée A = g^a mod p ?",
  [
   "8",
   "6",
   "30",
   "15"
  ],
  "A",
  "5² = 25 ≡ 2 ; 5⁶ = (5²)³ ≡ 2³ = 8 (mod 23)."
 ],
 [
  "R5",
  "asym",
  "Faiblesse de Diffie-Hellman « nu » ?",
  [
   "l'attaque de l'homme du milieu (pas d'authentification)",
   "il faut s'échanger la clé secrète en clair",
   "il ne marche qu'avec RSA",
   "p doit rester secret"
  ],
  "A",
  "p et g sont publics. On authentifie les échanges (signatures, certificats) pour bloquer le MitM."
 ],
 [
  "R6",
  "asym",
  "Code de Hamming (7,4)",
  [
   "4 bits de données, 3 bits de contrôle",
   "corrige 1 erreur",
   "détecte 2 erreurs",
   "corrige 2 erreurs"
  ],
  "ABC",
  "Distance minimale 3. Un simple bit de parité détecte un nombre impair d'erreurs mais ne corrige rien."
 ]
];
const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const STEPS = [
 {
  "id": "arith",
  "icon": "🧮",
  "title": "Arithmétique modulaire",
  "min": 8,
  "anchor": "r309",
  "recap": [
   "Division euclidienne a = bq + r avec 0 ≤ r < b. <b>PGCD par Euclide</b> : on remplace (a, b) par (b, r) jusqu'à r = 0.",
   "Congruences : on <b>réduit avant de calculer</b> (7 ≡ 2 mod 5) et on cherche une <b>période</b> des puissances (2⁴ ≡ 1 mod 5).",
   "a a un <b>inverse modulo n ⇔ PGCD(a, n) = 1</b> (Bézout). On le trouve avec Euclide étendu ou en essayant.",
   "<b>Fermat</b> : p premier, a non multiple de p ⇒ a^(p−1) ≡ 1 (mod p)."
  ],
  "cards": [
   [
    "PGCD(640, 520) ?",
    "40"
   ],
   [
    "Condition d'existence d'un inverse modulo n ?",
    "PGCD(a, n) = 1."
   ]
  ],
  "qs": [
   "C1",
   "C2",
   "C3",
   "C4",
   "C5",
   "C6"
  ]
 },
 {
  "id": "sym",
  "icon": "🔐",
  "title": "César, substitution, permutation, Vigenère",
  "min": 9,
  "star": true,
  "anchor": "r309",
  "recap": [
   "Décalage de clé k : <b>y = (x + k) mod 26</b>, déchiffrement <b>x = (y − k) mod 26</b>, avec A = 0.",
   "<b>Permutation (grille + clé)</b> : écrire le message <b>ligne par ligne</b>, lire les <b>colonnes dans l'ordre alphabétique des lettres de la clé</b>. Déchiffrer = découper en colonnes de la hauteur de la grille, les replacer, lire les lignes.",
   "Faiblesses : César = 25 clés (force brute) ; substitution = analyse de fréquences.",
   "<b>Vigenère</b> : polyalphabétique, clé répétée ; on trouve la longueur de clé (Kasiski, indice de coïncidence) puis on casse chaque César."
  ],
  "cards": [
   [
    "Ordre de lecture avec la clé TIRE ?",
    "E, I, R, T → colonnes 4, 2, 3, 1."
   ],
   [
    "CHAT, décalage 12 ?",
    "OTMF"
   ]
  ],
  "qs": [
   "S1",
   "S2",
   "S3",
   "S4",
   "S5",
   "S6"
  ]
 },
 {
  "id": "asym",
  "icon": "🗝️",
  "title": "RSA, Diffie-Hellman, Hamming",
  "min": 9,
  "anchor": "r309",
  "recap": [
   "<b>RSA</b> : n = pq, φ = (p−1)(q−1), e premier avec φ, <b>d = e⁻¹ mod φ</b>. Chiffrer c = m^e mod n, déchiffrer m = c^d mod n. Public (n, e), privé d.",
   "<b>Diffie-Hellman</b> : p, g publics ; A = g^a, B = g^b ; secret commun g^(ab) mod p. Sans authentification : <b>homme du milieu</b>.",
   "<b>Hamming (7,4)</b> : 4 bits utiles + 3 de contrôle, distance 3 : <b>corrige 1 erreur</b>, en détecte 2. Parité simple : détecte un nombre impair d'erreurs."
  ],
  "cards": [
   [
    "d en RSA ?",
    "L'inverse de e modulo φ(n)."
   ],
   [
    "Faille de Diffie-Hellman seul ?",
    "Homme du milieu."
   ]
  ],
  "qs": [
   "R1",
   "R2",
   "R3",
   "R4",
   "R5",
   "R6"
  ]
 },
 {
  "id": "exam",
  "icon": "⏱️",
  "title": "Examen blanc",
  "min": 11,
  "exam": 15,
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
const data = { key: "r309", title: "R3.09 Cryptographie et sécurité", QUESTIONS, STEPS, tips: {"semaine":["Un exercice chronométré par type : permutation (chiffrer et déchiffrer), puissance modulo n, RSA.","Refais les TD avec la solution cachée."],"qcm":["Réduis modulo n avant de calculer, et vérifie ton résultat dans l'autre sens.","Respecte le format demandé (majuscules, 0 pour les espaces)."]} };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
