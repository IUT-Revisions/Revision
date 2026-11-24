// R3.09 Cryptographie et sécurité — données du parcours guidé (BUT2 · S3, programme complet).
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 // ============================================================ 1. BASES
 [
  "B1",
  "bases",
  "Que stipule essentiellement le principe de Kerckhoffs ?",
  [
   "La sécurité d'un cryptosystème ne doit reposer que sur le secret de la clé, pas de l'algorithme",
   "L'algorithme doit pouvoir tomber sans inconvénient entre les mains de l'ennemi",
   "L'algorithme de chiffrement doit impérativement rester secret",
   "La clé de chiffrement et la clé de déchiffrement doivent toujours être identiques"
  ],
  "AB",
  "Selon le 2e desideratum de Kerckhoffs (1883), l'algorithme est public (comme AES) et seule la clé secrète assure la sécurité."
 ],
 [
  "B2",
  "bases",
  "Associer correctement le vocabulaire fondamental de la cryptologie",
  [
   "La cryptologie regroupe la cryptographie et la cryptanalyse",
   "La cryptanalyse est l'ensemble des procédés d'attaque d'un cryptosystème",
   "Ève désigne un opposant passif qui écoute le canal, Martin un opposant actif qui falsifie",
   "La stéganographie est synonyme de cryptanalyse"
  ],
  "ABC",
  "Cryptographie = chiffrer ; cryptanalyse = attaquer ; cryptologie = les deux. La stéganographie dissimule l'existence même du message."
 ],
 [
  "B3",
  "bases",
  "Quelles sont les quatre qualités fondamentales attendues d'un cryptosystème ?",
  [
   "Confidentialité, intégrité, authentification, non-répudiation",
   "Confidentialité, correction d'erreur, compression, vitesse",
   "Intégrité, disponibilité, stéganographie, entropie",
   "Authentification, obfuscation, hachage, parallélisation"
  ],
  "A",
  "La correction d'erreur contre le bruit du canal ne relève pas du chiffrement mais des codes correcteurs."
 ],
 [
  "B4",
  "bases",
  "Dans une attaque à texte clair choisi, l'adversaire…",
  [
   "a accès à une machine chiffrante et peut choisir des textes clairs pour observer leurs chiffrés",
   "ne dispose que d'un texte chiffré intercepté",
   "dispose de la clé secrète de déchiffrement",
   "a accès à une machine déchiffrante uniquement"
  ],
  "A",
  "Texte chiffré connu = seulement C ; texte clair connu = couples (M, C) subis ; texte clair choisi = choisit M ; texte chiffré choisi = choisit C."
 ],
 [
  "B5",
  "bases",
  "Qu'appelle-t-on « sécurité prouvée » en cryptographie ?",
  [
   "Réduire la sécurité d'un cryptosystème à un problème mathématique réputé difficile (ex. factorisation)",
   "Garantir la résistance face à une puissance de calcul illimitée",
   "Observer expérimentalement qu'aucune attaque n'a réussi contre AES",
   "Empêcher toute attaque physique par mesure de consommation électrique"
  ],
  "A",
  "Puissance illimitée = sécurité inconditionnelle ; fait d'expérience/complexité = sécurité calculatoire ; réduction à un problème difficile = sécurité prouvée."
 ],
 [
  "B6",
  "bases",
  "Face à un espace de N clés équiprobables, quelle est la complexité moyenne d'une attaque par force brute ?",
  [
   "N / 2 essais en moyenne",
   "N essais en moyenne",
   "log2(N) essais en moyenne",
   "√N essais en moyenne"
  ],
  "A",
  "En moyenne on trouve la bonne clé après avoir parcouru la moitié de l'espace des clés (N/2), et N dans le pire cas."
 ],

 // ============================================================ 2. ARITHMÉTIQUE
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
  "Euclide : 640 = 1×520 + 120 ; 520 = 4×120 + 40 ; 120 = 3×40 + 0. Dernier reste non nul = 40."
 ],
 [
  "C2",
  "arith",
  "Reste de la division euclidienne de 7^2021 par 5 ?",
  [
   "2",
   "1",
   "3",
   "4"
  ],
  "A",
  "7 ≡ 2 (mod 5) et par Fermat 2⁴ ≡ 1 (mod 5). 2021 = 4×505 + 1, donc 7^2021 ≡ 2¹ = 2."
 ],
 [
  "C3",
  "arith",
  "Dans ℤ/18ℤ, quels sont l'opposé et l'inverse multiplicatif de 7 ?",
  [
   "Opposé = 11",
   "Inverse multiplicatif = 13",
   "Inverse multiplicatif = 11",
   "7 n'a pas d'inverse modulo 18"
  ],
  "AB",
  "Opposé : 7 + 11 = 18 ≡ 0. Inverse : PGCD(7, 18) = 1 et 7 × 13 = 91 = 5×18 + 1 ≡ 1 (mod 18)."
 ],
 [
  "C4",
  "arith",
  "Quels éléments ont un inverse multiplicatif dans ℤ/nℤ ?",
  [
   "Les entiers a tels que PGCD(a, n) = 1",
   "Il y en a exactement φ(n)",
   "Tous les entiers non nuls si n est premier",
   "Tous les entiers pairs"
  ],
  "ABC",
  "(ℤ/nℤ)* est le groupe des inversibles, de cardinal φ(n). Si n = p premier, ℤ/pℤ = 𝔽_p est un corps fini."
 ],
 [
  "C5",
  "arith",
  "Que vaut φ(1344) sachant que 1344 = 2^6 × 3 × 7 ?",
  [
   "384",
   "672",
   "448",
   "1343"
  ],
  "A",
  "φ(1344) = 1344 × (1 − 1/2) × (1 − 1/3) × (1 − 1/7) = 1344 × 1/2 × 2/3 × 6/7 = 384 (ou 2^5 × 1 × 2 × 6 = 384)."
 ],
 [
  "C6",
  "arith",
  "Théorème d'Euler et petit théorème de Fermat : quelles égalités sont exactes ?",
  [
   "Si PGCD(a, n) = 1, alors a^φ(n) ≡ 1 (mod n)",
   "Si p est premier et p ne divise pas a, alors a^(p−1) ≡ 1 (mod p)",
   "Si p est premier, a^p ≡ a (mod p) pour tout entier a",
   "Pour tout n composé, a^(n−1) ≡ 1 (mod n)"
  ],
  "ABC",
  "Attention : pour n composé, a^(n−1) ≡ 1 (mod n) est généralement faux (sauf cas particuliers des pseudo-premiers)."
 ],
 [
  "C7",
  "arith",
  "Le système { x ≡ 7 (mod 10) ; x ≡ 4 (mod 15) } possède…",
  [
   "aucune solution",
   "une solution unique modulo 150",
   "une solution unique modulo 30",
   "x = 17 comme solution"
  ],
  "A",
  "PGCD(10, 15) = 5. Or 7 + 10k = 4 + 15t donne 15t − 10k = 3, mais 5 ne divise pas 3 : aucune solution (TD1 Ex. 4)."
 ],
 [
  "C8",
  "arith",
  "Condition d'application du théorème des restes chinois (CRT) pour les modules n1, …, nk",
  [
   "Les modules n1, …, nk doivent être deux à deux premiers entre eux",
   "La solution est alors unique modulo N = n1 × n2 × … × nk",
   "Les modules doivent tous être des nombres premiers",
   "Les restes a1, …, ak doivent être premiers entre eux"
  ],
  "AB",
  "Les modules n'ont pas besoin d'être premiers (ex. 14 et 15), seulement deux à deux premiers entre eux."
 ],
 [
  "C9",
  "arith",
  "Qu'est-ce qu'un générateur g de (ℤ/pℤ)* ?",
  [
   "Un élément dont les puissances g^i mod p parcourent tous les éléments de (ℤ/pℤ)*",
   "Tout entier compris entre 1 et p − 1",
   "L'élément 1",
   "Un diviseur de p"
  ],
  "A",
  "Un générateur engendre tout le groupe cyclique (ℤ/pℤ)* de cardinal p − 1 (ex. g = 2 dans (ℤ/13ℤ)*)."
 ],

 // ============================================================ 3. POLYNÔMES & FACTORISATION
 [
  "P1",
  "poly",
  "Division euclidienne de A(X) = X^3 − X + 5 par B(X) = X + 7 dans ℚ[X] : que valent Q(X) et R(X) ?",
  [
   "Q(X) = X² − 7X + 48 et R(X) = −331",
   "Q(X) = X² + 7X + 48 et R(X) = 331",
   "Q(X) = X² − 7X + 50 et R(X) = −345",
   "Q(X) = X² − 7X − 48 et R(X) = 341"
  ],
  "A",
  "(X + 7)(X² − 7X + 48) = X³ − 7X² + 48X + 7X² − 49X + 336 = X³ − X + 336. Pour obtenir +5, il faut R = 5 − 336 = −331."
 ],
 [
  "P2",
  "poly",
  "Dans une division euclidienne de polynômes A(X) = B(X)Q(X) + R(X) avec B ≠ 0, quelle condition porte sur R ?",
  [
   "R = 0 ou deg(R) < deg(B)",
   "deg(R) ≤ deg(B)",
   "R(X) doit avoir des coefficients positifs",
   "deg(Q) < deg(B)"
  ],
  "A",
  "Le degré du reste est strictement inférieur au degré du diviseur B (ou R = 0)."
 ],
 [
  "P3",
  "poly",
  "À propos du polynôme X² + 1 :",
  [
   "Il est irréductible dans ℚ[X]",
   "Il n'est pas irréductible dans ℤ/2ℤ[X] car (X + 1)² = X² + 1",
   "Il est irréductible dans ℤ/2ℤ[X]",
   "Il est divisible par X dans ℚ[X]"
  ],
  "AB",
  "Dans ℤ/2ℤ[X], 2 = 0, donc (X + 1)² = X² + 2X + 1 = X² + 1 : il est réductible."
 ],
 [
  "P4",
  "poly",
  "Quand l'anneau quotient ℤ/pℤ[X]/(P) (p premier, deg(P) = f) est-il un corps fini 𝔽_{p^f} ?",
  [
   "Si et seulement si P est irréductible dans ℤ/pℤ[X]",
   "Il contient alors exactement p^f éléments",
   "Pour tout polynôme P de degré f",
   "Uniquement si p = 2"
  ],
  "AB",
  "Corollaire du cours : si P est irréductible de degré f sur ℤ/pℤ, le quotient est le corps fini à p^f éléments (ex. 𝔽_4, 𝔽_256 pour AES)."
 ],
 [
  "P5",
  "poly",
  "Dans le test de primalité de Fermat, si a^(n−1) ≡ 1 (mod n) pour un entier a premier à n :",
  [
   "on ne peut pas conclure avec certitude que n est premier (n peut être pseudo-premier en base a)",
   "si a^(n−1) ≢ 1 (mod n), alors n est certainement composé",
   "n est forcément premier",
   "n est forcément pair"
  ],
  "AB",
  "Exemple du cours/TD1 : 341 = 11 × 31 vérifie 2^340 ≡ 1 (mod 341) mais n'est pas premier."
 ],
 [
  "P6",
  "poly",
  "Méthode de factorisation de Fermat pour un entier impair n : sur quelle identité repose-t-elle ?",
  [
   "n = t² − s² = (t − s)(t + s)",
   "On commence à tester t = ⌈√n⌉ et on cherche un carré t² − n = s²",
   "Elle est particulièrement rapide quand les facteurs p et q sont proches",
   "n = t² + s²"
  ],
  "ABC",
  "Ex. 899 = 30² − 1² = 29 × 31. Plus p et q sont proches, plus t est proche de √n."
 ],

 // ============================================================ 4. CLASSIQUES
 [
  "S1",
  "sym",
  "Chiffrer CHAT par décalage (César) de clé 12 (A = 0) ?",
  [
   "OTMF",
   "OTNF",
   "NSLE",
   "PUNG"
  ],
  "A",
  "C(2)+12=14(O), H(7)+12=19(T), A(0)+12=12(M), T(19)+12=31≡5(F)."
 ],
 [
  "S2",
  "sym",
  "Déchiffrer un chiffre de César de clé k :",
  [
   "x = (y − k) mod 26",
   "Connaître l'image d'une seule lettre suffit à casser tout le message",
   "x = (y + k) mod 26",
   "Il faut connaître au moins deux lettres pour retrouver k"
  ],
  "AB",
  "César n'a qu'un seul paramètre k : une seule correspondance (ex. lettre la plus fréquente → E) donne k = (y − x) mod 26."
 ],
 [
  "S3",
  "sym",
  "Chiffrement par permutation (grille + clé, ex. TIRE)",
  [
   "On écrit le message ligne par ligne dans la grille",
   "On lit les colonnes dans l'ordre alphabétique des lettres de la clé",
   "Pour déchiffrer, on découpe le chiffré en blocs de la hauteur de la grille pour remplir les colonnes",
   "La fréquence d'apparition des lettres change complètement"
  ],
  "ABC",
  "La permutation déplace les lettres sans les remplacer : leurs fréquences restent identiques."
 ],
 [
  "S4",
  "sym",
  "RENDEZ VOUS CHEZ MOI, grille 5×4, espaces = 0, clé TIRE. Message chiffré ?",
  [
   "DV0ZIEZUHMN0SEOREOC0",
   "REOC0EZUHMN0SEODV0ZI",
   "RENDEZ0VOUS0CHEZ0MOI",
   "DV0ZIN0SEOEZUHMREOC0"
  ],
  "A",
  "Ordre alphabétique de TIRE : E(col.4) DV0ZI · I(col.2) EZUHM · R(col.3) N0SEO · T(col.1) REOC0."
 ],
 [
  "S5",
  "sym",
  "Chiffrement affine f(x) = (ax + b) mod 26 : quelles affirmations sont exactes ?",
  [
   "a doit être premier avec 26 (12 valeurs possibles)",
   "Il existe 12 × 26 = 312 clés possibles",
   "La fonction de déchiffrement est g(y) = a⁻¹(y − b) mod 26",
   "a peut être n'importe quel entier entre 1 et 25"
  ],
  "ABC",
  "Si PGCD(a, 26) ≠ 1, f n'est pas bijective et on ne peut pas déchiffrer de manière unique."
 ],
 [
  "S6",
  "sym",
  "Avec le code affine f(x) = (7x + 5) mod 26, quelle est la fonction de déchiffrement g(y) ?",
  [
   "g(y) = 15(y − 5) mod 26",
   "g(y) = 7(y − 5) mod 26",
   "g(y) = 21(y − 5) mod 26",
   "g(y) = 15y − 5 mod 26"
  ],
  "A",
  "7 × 15 = 105 = 4×26 + 1 ≡ 1 (mod 26), donc 7⁻¹ = 15, et g(y) = 15(y − 5) mod 26."
 ],
 [
  "S7",
  "sym",
  "Pourquoi la substitution monoalphabétique (26! ≈ 4 × 10^26 clés) reste-t-elle faible ?",
  [
   "Chaque lettre claire est toujours remplacée par la même lettre chiffrée, ce qui préserve les fréquences",
   "Un texte chiffré assez long se casse par analyse de fréquences (E, A, I, S, digrammes)",
   "Parce qu'elle n'a que 25 clés",
   "Parce qu'elle utilise un XOR"
  ],
  "AB",
  "Un grand nombre de clés ne suffit pas : la structure monoalphabétique conserve la signature statistique de la langue."
 ],
 [
  "S8",
  "sym",
  "Chiffrement de Vigenère et attaque de Kasiski :",
  [
   "Vigenère est un chiffrement polyalphabétique par blocs de longueur m",
   "Les distances entre trigrammes répétés sont souvent des multiples de m (on prend leur PGCD)",
   "Une fois m connue, on casse m chiffrements de César indépendants par analyse de fréquences",
   "Une analyse de fréquences globale simple suffit sans connaître m"
  ],
  "ABC",
  "L'analyse globale échoue car une même lettre claire donne jusqu'à m lettres chiffrées différentes."
 ],
 [
  "S9",
  "sym",
  "Une attaque à texte clair choisi sur un code de permutation peut consister à…",
  [
   "envoyer un bloc composé d'un seul 1 entouré de 0 et observer où se retrouve le 1",
   "essayer toutes les k! permutations pour k = 60",
   "calculer l'inverse de la clé modulo 26",
   "appliquer le lemme d'empilement"
  ],
  "A",
  "En déplaçant la position du 1 unique dans un bloc de 0, on lit directement l'image de chaque position par la permutation."
 ],

 // ============================================================ 5. MODES OPÉRATOIRES
 [
  "M1",
  "modes",
  "Propriétés de l'opérateur XOR (⊕) sur des blocs binaires :",
  [
   "10101 ⊕ 10111 = 00010",
   "(A ⊕ B) ⊕ B = A",
   "A ⊕ A = 0",
   "A ⊕ B = A + B avec retenue"
  ],
  "ABC",
  "Le XOR est l'addition bit à bit modulo 2 sans retenue ; il est son propre inverse."
 ],
 [
  "M2",
  "modes",
  "Pourquoi le mode ECB (Electronic Code Book) ne doit-il jamais être utilisé en pratique ?",
  [
   "Deux blocs clairs identiques donnent toujours deux blocs chiffrés identiques",
   "Un attaquant peut permuter ou remplacer des blocs chiffrés sans que le destinataire s'en aperçoive",
   "Il laisse apparaître les motifs visuels d'une image",
   "Il nécessite de transmettre un IV secret"
  ],
  "ABC",
  "ECB chiffre chaque bloc indépendamment (c_i = f_k(m_i)), sans IV ni chaînage."
 ],
 [
  "M3",
  "modes",
  "Quels modes de chiffrement par blocs NE nécessitent PAS la fonction inverse g_k = f_k⁻¹ pour déchiffrer ?",
  [
   "CFB",
   "OFB",
   "CTR",
   "CBC"
  ],
  "ABC",
  "CFB, OFB et CTR utilisent f_k dans le même sens au chiffrement et au déchiffrement (puis XOR). ECB et CBC exigent g_k = f_k⁻¹."
 ],
 [
  "M4",
  "modes",
  "En mode CBC, quelles sont les formules de chiffrement et de déchiffrement ?",
  [
   "c_i = f_k(m_i ⊕ c_{i−1})",
   "m_i = c_{i−1} ⊕ g_k(c_i)",
   "c_i = m_i ⊕ f_k(c_{i−1})",
   "m_i = c_i ⊕ f_k(c_{i−1})"
  ],
  "AB",
  "Attention à ne pas confondre CBC (le XOR est avant f_k) et CFB (le XOR est après f_k)."
 ],
 [
  "M5",
  "modes",
  "À propos du vecteur d'initialisation (IV) :",
  [
   "Il sert à ce que deux messages identiques ne produisent pas le même chiffré",
   "Il n'a pas besoin de rester secret et peut être transmis en clair avec le chiffré",
   "Il ne doit jamais être réutilisé avec la même clé (en particulier en CTR et OFB)",
   "Il doit impérativement rester secret comme la clé"
  ],
  "ABC",
  "L'IV est public mais unique (et imprévisible en CBC). Sa réutilisation en CTR/OFB détruit totalement la confidentialité."
 ],
 [
  "M6",
  "modes",
  "En mode CTR ou OFB, que se passe-t-il si l'on chiffre deux messages M et M' avec la même clé et le même IV ?",
  [
   "Le flot chiffrant z_i est identique pour les deux messages",
   "c_i ⊕ c'_i = m_i ⊕ m'_i",
   "Connaître un couple (M, C) permet de déchiffrer M' directement par XOR",
   "Aucun risque, seul le premier bloc est touché"
  ],
  "ABC",
  "C'est l'attaque à texte clair connu (TD3 Ex. 4) : z_i = m_i ⊕ c_i puis m'_i = c'_i ⊕ z_i."
 ],
 [
  "M7",
  "modes",
  "Quel mode permet de paralléliser à la fois le chiffrement et le déchiffrement tout en chiffrant différemment deux blocs identiques ?",
  [
   "CTR (Counter)",
   "CBC",
   "CFB",
   "ECB"
  ],
  "A",
  "CTR chiffre f_k(T + i) indépendamment pour chaque indice i : parallélisable dans les deux sens et accès aléatoire."
 ],
 [
  "M8",
  "modes",
  "Un message chiffré avec AES-CBC garantit-il l'authentification de l'émetteur ?",
  [
   "Non : un attaquant peut rejouer ou tronquer un chiffré intercepté sans connaître la clé",
   "Oui, car CBC chaîne les blocs entre eux",
   "Oui, dès que l'IV est aléatoire",
   "Oui, uniquement si on utilise AES-256"
  ],
  "A",
  "Le chiffrement seul (même en CBC) assure la confidentialité, pas l'authentification ni l'intégrité (TD3 Ex. 2)."
 ],

 // ============================================================ 6. CODES MODERNES, LFSR, DES, AES
 [
  "D1",
  "mod",
  "Combien de clés faut-il pour que n interlocuteurs communiquent deux à deux ?",
  [
   "n(n − 1) / 2 clés en chiffrement symétrique",
   "n paires de clés en chiffrement asymétrique",
   "n clés en chiffrement symétrique",
   "2^n clés en chiffrement asymétrique"
  ],
  "AB",
  "Pour 1 000 000 d'interlocuteurs : près de 5×10^11 clés symétriques contre 1 000 000 paires asymétriques."
 ],
 [
  "D2",
  "mod",
  "Diffie-Hellman : p = 23, g = 5, secret d'Alice a = 6. Quelle valeur A = g^a mod p envoie Alice ?",
  [
   "8",
   "6",
   "15",
   "2"
  ],
  "A",
  "5² = 25 ≡ 2 (mod 23) ; 5⁶ = (5²)³ ≡ 2³ = 8 (mod 23)."
 ],
 [
  "D3",
  "mod",
  "Sur quoi repose la sécurité de Diffie-Hellman et quelle est sa faiblesse sans authentification ?",
  [
   "Sécurité liée à la difficulté du logarithme discret dans (ℤ/pℤ)*",
   "Vulnérable à l'attaque de l'homme du milieu (MitM) sans authentification",
   "Sécurité liée à la factorisation de p",
   "Il exige de transmettre la clé commune en clair"
  ],
  "AB",
  "p et g sont publics ; Ève voit A et B et devrait résoudre le logarithme discret, mais Martin peut s'interposer si rien n'authentifie A et B."
 ],
 [
  "D4",
  "mod",
  "Quelles conditions assurent la confidentialité parfaite du code de Vernam (masque jetable) ?",
  [
   "Clé générée de manière vraiment aléatoire",
   "Clé au moins aussi longue que le message",
   "Clé utilisée une seule fois",
   "Clé générée par un LFSR de longueur 4"
  ],
  "ABC",
  "Un LFSR est pseudo-aléatoire et linéaire (cassable par Massey-Berlekamp), il n'offre pas la confidentialité parfaite."
 ],
 [
  "D5",
  "mod",
  "À propos d'un LFSR (registre à décalage à rétroaction linéaire) de longueur m sur ℤ/2ℤ :",
  [
   "Sa période maximale vaut 2^m − 1",
   "Il chiffre et déchiffre de manière symétrique par XOR avec le message binaire",
   "Seul, il est cassable par l'algorithme de Massey-Berlekamp (d'où NLCG, NLFG, CCG)",
   "Sa période vaut toujours 2^m"
  ],
  "ABC",
  "L'état tout-zéro (0,…,0) reste nul indéfiniment : il reste au maximum 2^m − 1 états non nuls."
 ],
 [
  "D6",
  "mod",
  "Dans un schéma de Feistel (DES), un tour transforme (L_{i−1}, R_{i−1}) en L_i = R_{i−1} et R_i = L_{i−1} ⊕ f(R_{i−1}, k^i). Quel est son avantage majeur ?",
  [
   "La transformation est toujours bijective même si la fonction f n'est pas inversible",
   "Le déchiffrement utilise la même fonction f avec les sous-clés dans l'ordre inverse",
   "Il ne nécessite aucun XOR",
   "Il s'agit exactement de l'architecture d'AES"
  ],
  "AB",
  "AES n'est pas un schéma de Feistel mais un réseau de substitution-permutation (SPN)."
 ],
 [
  "D7",
  "mod",
  "Comparer DES et AES :",
  [
   "DES travaille sur des blocs de 64 bits avec une clé de 56 bits utiles (16 tours)",
   "AES travaille sur des blocs de 128 bits avec des clés de 128, 192 ou 256 bits (10 à 14 tours)",
   "Dans AES, SubBytes est la seule opération non linéaire et MixColumns est supprimée au dernier tour",
   "DES est plus résistant qu'AES aux attaques par force brute"
  ],
  "ABC",
  "DES (56 bits) a été cassé par force brute dès 1997–1999 ; AES (128+ bits) y résiste."
 ],
 [
  "D8",
  "mod",
  "Associer correctement cryptanalyse linéaire et cryptanalyse différentielle :",
  [
   "La cryptanalyse linéaire est une attaque à texte clair connu (biais, lemme d'empilement)",
   "La cryptanalyse différentielle est une attaque à texte clair choisi (paires Δx, Δy)",
   "La cryptanalyse différentielle est une attaque à texte chiffré seul",
   "La cryptanalyse linéaire ne s'applique qu'à RSA"
  ],
  "AB",
  "Toutes deux attaquent les chiffrements itérés par blocs (SPN, DES, etc.)."
 ],

 // ============================================================ 7. CLÉ PUBLIQUE & PKI
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
  "n = 3×11 = 33 ; φ(n) = 2×10 = 20 ; d = 3⁻¹ mod 20 = 7 car 3×7 = 21 ≡ 1 (mod 20)."
 ],
 [
  "R2",
  "asym",
  "RSA avec n = 33 et e = 3 : quel est le chiffré de m = 4 ?",
  [
   "31",
   "12",
   "64",
   "4"
  ],
  "A",
  "c = 4³ mod 33 = 64 − 33 = 31. Vérification : 31⁷ ≡ (−2)⁷ = −128 ≡ 4 (mod 33)."
 ],
 [
  "R3",
  "asym",
  "En RSA, quels éléments doivent impérativement rester secrets ?",
  [
   "d",
   "p et q",
   "φ(n)",
   "n et e"
  ],
  "ABC",
  "La clé publique est (n, e). Connaître p et q (ou φ(n)) permet de recalculer d par Euclide étendu."
 ],
 [
  "R4",
  "asym",
  "Pourquoi envoyer le même message x en RSA à t > e destinataires avec le même petit exposant e est-il dangereux ?",
  [
   "Le théorème des restes chinois permet de reconstruire y = x^e dans ℕ puis d'extraire la racine e-ième",
   "Cela révèle directement les facteurs p et q de chaque destinataire",
   "Cela rend e non inversible modulo φ(n)",
   "Il n'y a aucun danger tant que les modules n_i sont distincts"
  ],
  "A",
  "Si les n_i sont premiers entre eux et t > e, x^e < ∏ n_i donc y = x^e exactement, et on prend y^(1/e) sans factoriser."
 ],
 [
  "R5",
  "asym",
  "À propos du cryptosystème de Merkle-Hellman :",
  [
   "Il repose sur une suite super-croissante b_i > ∑_{j<i} b_j cachée par multiplication par W mod M",
   "Le déchiffrement commence par calculer s = c · W⁻¹ mod M puis résout le sac-à-dos super-croissant",
   "Il a été cassé par Shamir car son instance particulière n'est pas génériquement NP-complète",
   "Il repose sur le problème du logarithme discret"
  ],
  "ABC",
  "Merkle-Hellman (1978) utilise le problème du sac-à-dos super-croissant, qui a été cassé."
 ],
 [
  "R6",
  "asym",
  "Cryptosystème El Gamal : clé publique (p, g, β = g^α mod p). Comment chiffre-t-on M et comment déchiffre-t-on (y1, y2) ?",
  [
   "Chiffrement : y1 = g^k mod p et y2 = β^k · M mod p (avec k aléatoire)",
   "Déchiffrement : M ≡ y2 · (y1^α)⁻¹ mod p",
   "Alice doit changer l'aléa k à chaque nouveau message",
   "Chiffrement : c = M^α mod p"
  ],
  "ABC",
  "El Gamal est probabiliste : réutiliser k permet de retrouver le rapport de deux messages clairs."
 ],
 [
  "R7",
  "asym",
  "Sur quel problème difficile repose la sécurité d'El Gamal ?",
  [
   "Le calcul du logarithme discret dans un groupe cyclique (ℤ/pℤ)*",
   "La factorisation d'un grand entier n = pq",
   "Le problème du sac-à-dos",
   "La division euclidienne de polynômes"
  ],
  "A",
  "Trouver la clé secrète α à partir de β = g^α mod p est exactement le problème du logarithme discret."
 ],
 [
  "R8",
  "asym",
  "Quel est le rôle d'un certificat numérique dans une PKI (Public Key Infrastructure) ?",
  [
   "Lier de manière authentique une clé publique à l'identité de son propriétaire",
   "Être signé par la clé privée d'une Autorité de Certification (CA / TTP)",
   "Empêcher l'attaque de l'homme du milieu lors de la distribution des clés publiques",
   "Chiffrer la clé publique pour qu'elle reste confidentielle"
  ],
  "ABC",
  "Une clé publique n'est pas confidentielle, mais son authenticité est vitale pour bloquer l'usurpation par Martin."
 ]
];

const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));

const STEPS = [
 {
  "id": "bases",
  "icon": "",
  "title": "Fondamentaux, Kerckhoffs & attaques",
  "min": 8,
  "anchor": "bases",
  "recap": [
   "<b>Cryptologie</b> = cryptographie (chiffrer) + cryptanalyse (attaquer). Acteurs : Alice, Bob, Ève (passive), Martin (actif).",
   "<b>Principe de Kerckhoffs</b> : l'algorithme est public, toute la sécurité repose sur le secret de la <b>clé</b>.",
   "<b>4 qualités</b> : confidentialité, intégrité, authentification, non-répudiation (la correction d'erreur est à part).",
   "<b>4 attaques</b> : chiffré connu, clair connu, clair choisi, chiffré choisi (+ physiques). Force brute = <b>N/2</b> essais en moyenne.",
   "<b>4 sécurités</b> : inconditionnelle, calculatoire, prouvée (réduction à un problème difficile), confidentialité parfaite."
  ],
  "cards": [
   ["Que dit le 2e principe de Kerckhoffs ?", "La sécurité repose uniquement sur la clé secrète, jamais sur le secret de l'algorithme."],
   ["Différence entre Ève et Martin ?", "Ève écoute passivement (confidentialité) ; Martin modifie ou usurpe (intégrité, authentification)."],
   ["Complexité moyenne d'une force brute sur N clés ?", "N/2 essais en moyenne."],
   ["Entropie recommandée pour un mot de passe ?", "Au moins 128 bits (ex. 22 caractères aléatoires sur 64 symboles)."]
  ],
  "qs": ["B1", "B2", "B3", "B4", "B5", "B6"]
 },
 {
  "id": "arith",
  "icon": "",
  "title": "Arithmétique modulaire, Euler & CRT",
  "min": 12,
  "star": true,
  "anchor": "arith",
  "recap": [
   "Division euclidienne <code>b = aq + r</code> avec <code>0 ≤ r &lt; |a|</code>. <b>Euclide</b> : PGCD = dernier reste non nul. <b>PGCD × PPCM = |ab|</b>.",
   "<b>Bézout</b> : <code>au + bv = PGCD(a, b)</code> par remontée d'Euclide étendu.",
   "<b>Euler</b> : <code>φ(p) = p − 1</code>, <code>φ(p^α) = p^(α−1)(p − 1)</code>, <code>φ(n) = n ∏(1 − 1/p_i)</code>.",
   "Dans <code>ℤ/nℤ</code> : opposé = <code>n − a</code> ; inverse multiplicatif existe <b>ssi PGCD(a, n) = 1</b> (il y en a <code>φ(n)</code>).",
   "<b>Fermat/Euler</b> : <code>a^φ(n) ≡ 1 (mod n)</code> si PGCD(a, n) = 1. <b>CRT</b> : modules 2 à 2 premiers entre eux ; sinon vérifier si <code>PGCD(n1, n2) | (a1 − a2)</code>."
  ],
  "cards": [
   ["Condition d'existence d'un inverse modulo n ?", "PGCD(a, n) = 1."],
   ["Cardinal de (ℤ/nℤ)* ?", "φ(n)."],
   ["Formule du théorème d'Euler ?", "a^φ(n) ≡ 1 (mod n) si PGCD(a, n) = 1."],
   ["Quand le système x ≡ a1 [n1], x ≡ a2 [n2] n'a-t-il aucune solution ?", "Quand PGCD(n1, n2) ne divise pas (a1 − a2)."]
  ],
  "qs": ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"]
 },
 {
  "id": "poly",
  "icon": "",
  "title": "Polynômes, corps finis & factorisation",
  "min": 9,
  "anchor": "poly",
  "recap": [
   "Division euclidienne dans <code>K[X]</code> : <code>A = BQ + R</code> avec <code>deg(R) &lt; deg(B)</code>. Même Euclide et Bézout que dans <code>ℤ</code>.",
   "Un polynôme irréductible dépend du corps : <code>X² + 1</code> est irréductible sur <code>ℚ</code> mais vaut <code>(X + 1)²</code> sur <code>ℤ/2ℤ</code>.",
   "<code>ℤ/pℤ[X]/(P)</code> est un <b>corps fini 𝔽_{p^f}</b> ssi <code>P</code> est irréductible de degré <code>f</code> (ex. <code>𝔽_4</code>, et <code>𝔽_256</code> dans AES).",
   "<b>Test de Fermat</b> : <code>a^(n−1) ≢ 1 (mod n)</code> prouve que <code>n</code> est composé ; <code>≡ 1</code> ne prouve pas qu'il est premier (pseudo-premiers, ex. 341).",
   "<b>Factorisation de Fermat</b> : <code>n = t² − s² = (t − s)(t + s)</code> en partant de <code>t = ⌈√n⌉</code>."
  ],
  "cards": [
   ["X² + 1 est-il irréductible dans ℤ/2ℤ[X] ?", "Non : (X + 1)² = X² + 1 modulo 2."],
   ["Inverse de X + 1 dans 𝔽_4 = 𝔽_2[X]/(X² + X + 1) ?", "X (car X(X + 1) = X² + X ≡ 1)."],
   ["Polynôme irréductible d'AES pour 𝔽_256 ?", "X^8 + X^4 + X^3 + X + 1."],
   ["Principe de la factorisation de Fermat ?", "Chercher t ≥ √n tel que t² − n = s², puis n = (t − s)(t + s)."]
  ],
  "qs": ["P1", "P2", "P3", "P4", "P5", "P6"]
 },
 {
  "id": "sym",
  "icon": "",
  "title": "César, affine, permutation, Vigenère",
  "min": 12,
  "star": true,
  "anchor": "classiques",
  "recap": [
   "<b>César</b> : <code>y = (x + k) mod 26</code>, <code>x = (y − k) mod 26</code> (A = 0). 25 clés utiles ; une seule lettre trouvée casse tout.",
   "<b>Permutation (grille + clé)</b> : écrire ligne par ligne, lire les colonnes dans l'ordre alphabétique de la clé. Déchiffrer = blocs de la hauteur de la grille.",
   "<b>Code affine</b> : <code>f(x) = (ax + b) mod 26</code> avec <code>PGCD(a, 26) = 1</code> (12 valeurs → 312 clés). Déchiffrement : <code>g(y) = a⁻¹(y − b) mod 26</code>.",
   "<b>Substitution monoalphabétique</b> : 26! clés mais cassée par <b>analyse de fréquences</b> (E ≈ 15,9 %, A ≈ 9,4 %).",
   "<b>Vigenère</b> : polyalphabétique de longueur <code>m</code> ; attaque de <b>Kasiski</b> (PGCD des distances entre trigrammes répétés → m César)."
  ],
  "cards": [
   ["Inverses mod 26 de 3, 5, 7, 11 ?", "3↔9, 5↔21, 7↔15, 11↔19."],
   ["Nombre de clés du code affine sur 26 lettres ?", "12 × 26 = 312."],
   ["Ordre de lecture des colonnes pour la clé TIRE ?", "E (4), I (2), R (3), T (1)."],
   ["Les deux étapes de la cryptanalyse de Vigenère ?", "1) Longueur m par Kasiski (PGCD des distances) ; 2) m analyses de fréquences (César)."]
  ],
  "qs": ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"]
 },
 {
  "id": "modes",
  "icon": "",
  "title": "Modes opératoires : ECB, CBC, CFB, OFB, CTR",
  "min": 11,
  "star": true,
  "anchor": "modes",
  "recap": [
   "<b>ECB</b> : <code>c_i = f_k(m_i)</code>. Jamais sûr (blocs identiques → chiffrés identiques, permutation indétectable).",
   "<b>CBC</b> : <code>c_i = f_k(m_i ⊕ c_{i−1})</code>, <code>m_i = c_{i−1} ⊕ g_k(c_i)</code>. Nécessite <code>g_k</code> ; erreur sur <code>c_i</code> touche <code>m_i</code> et <code>m_{i+1}</code>.",
   "<b>CFB / OFB / CTR</b> : <b>pas besoin de f_k⁻¹</b> au déchiffrement. <b>CTR</b> parallélise chiffrement et déchiffrement (<code>c_i = m_i ⊕ f_k(T + i)</code>).",
   "<b>IV</b> : public mais <b>unique</b>. Réutiliser un IV en CTR/OFB expose à une attaque à texte clair connu (<code>c_i ⊕ c'_i = m_i ⊕ m'_i</code>).",
   "Aucun mode de chiffrement seul ne garantit l'<b>authentification</b>."
  ],
  "cards": [
   ["Modes qui n'ont pas besoin de f_k⁻¹ pour déchiffrer ?", "CFB, OFB et CTR."],
   ["Formule de déchiffrement en CBC vs CFB ?", "CBC : m_i = c_{i−1} ⊕ g_k(c_i) · CFB : m_i = c_i ⊕ f_k(c_{i−1})."],
   ["L'IV doit-il être secret ?", "Non, mais il doit être unique (jamais réutilisé avec la même clé)."],
   ["Que donne c_i ⊕ c'_i si l'IV est réutilisé en CTR/OFB ?", "m_i ⊕ m'_i (le masque s'annule)."]
  ],
  "qs": ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]
 },
 {
  "id": "mod",
  "icon": "",
  "title": "Diffie-Hellman, Vernam, LFSR, DES & AES",
  "min": 11,
  "anchor": "modernes",
  "recap": [
   "Symétrique = <code>n(n−1)/2</code> clés, rapide, 128–256 bits. Asymétrique = <code>n</code> paires, 1000–1500× plus lent, 1024–2048 bits.",
   "<b>Diffie-Hellman</b> : <code>A = g^a</code>, <code>B = g^b</code>, clé commune <code>g^(ab) mod p</code> (logarithme discret ; faille MitM sans authentification).",
   "<b>Vernam</b> : confidentialité parfaite (clé aléatoire, même longueur, usage unique). <b>LFSR</b> : période max <code>2^m − 1</code>, cassable par Massey-Berlekamp.",
   "<b>Feistel (DES)</b> : toujours bijectif même si <code>f</code> ne l'est pas ; 64 bits, clé 56 bits utiles, 16 tours.",
   "<b>AES</b> : SPN, blocs 128 bits, clés 128/192/256, 10–14 tours : <code>SubBytes</code> (non linéaire), <code>ShiftRows</code>, <code>MixColumns</code> (omis au dernier tour), <code>AddRoundKey</code>."
  ],
  "cards": [
   ["Période maximale d'un LFSR de longueur m ?", "2^m − 1."],
   ["Seule opération non linéaire d'AES ?", "SubBytes."],
   ["Opération absente au dernier tour d'AES ?", "MixColumns."],
   ["Type d'attaque : cryptanalyse linéaire vs différentielle ?", "Linéaire = texte clair connu ; différentielle = texte clair choisi."]
  ],
  "qs": ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]
 },
 {
  "id": "asym",
  "icon": "",
  "title": "Merkle-Hellman, RSA, El Gamal & PKI",
  "min": 11,
  "star": true,
  "anchor": "publique",
  "recap": [
   "<b>Merkle-Hellman</b> : sac-à-dos super-croissant (<code>b_i &gt; ∑ b_j</code>), clé publique <code>a_i = W b_{π(i)} mod M</code>, décodage <code>cW⁻¹ mod M</code> + glouton (cassé par Shamir).",
   "<b>RSA</b> : <code>n = pq</code>, <code>φ = (p−1)(q−1)</code>, <code>d = e⁻¹ mod φ</code>. Public <code>(n, e)</code>, secret <code>(p, q, d)</code>. <code>c = m^e mod n</code>, <code>m = c^d mod n</code>.",
   "<b>RSA petits exposants</b> : même message envoyé à <code>t &gt; e</code> destinataires → CRT retrouve <code>x^e</code> exact → racine <code>e</code>-ième.",
   "<b>El Gamal</b> : public <code>(p, g, β = g^α)</code>, chiffré <code>(g^k, β^k M)</code>, déchiffrement <code>M = y2 (y1^α)⁻¹ mod p</code>. Toujours changer <code>k</code>.",
   "<b>PKI</b> : un <b>certificat</b> lie clé publique + identité, signé par une <b>CA / TTP</b> pour bloquer l'homme du milieu."
  ],
  "cards": [
   ["Comment calcule-t-on d en RSA ?", "d = e⁻¹ mod φ(n) par Euclide étendu."],
   ["Formule de déchiffrement d'El Gamal ?", "M ≡ y2 · (y1^α)⁻¹ mod p."],
   ["Pourquoi changer k à chaque message en El Gamal ?", "Sinon y2/z2 ≡ M/M' (mod p) et on perd la confidentialité."],
   ["À quoi sert une Autorité de Certification (CA) ?", "Signer les certificats pour authentifier les clés publiques et bloquer le MitM."]
  ],
  "qs": ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]
 },
 {
  "id": "exam",
  "icon": "",
  "title": "Examen blanc",
  "min": 15,
  "exam": 20,
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

const data = {
  key: "r309",
  title: "R3.09 Cryptographie et sécurité",
  QUESTIONS,
  STEPS,
  tips: {
    semaine: [
      "Fais sur feuille les 12 exercices d'application ci-dessus sans regarder les corrigés, en chronométrant 10 min par exercice.",
      "Refais les feuilles TD1, TD2 et TD3 sans la solution, en insistant sur Euclide étendu, le CRT (y compris le cas sans solution), la division de polynômes et les modes CBC/CFB/CTR.",
      "Entraîne-toi à l'exponentiation rapide binaire pour RSA et El Gamal afin de ne faire aucune erreur de calcul modulo n."
    ],
    qcm: [
      "Réduis toujours modulo n avant de calculer, et vérifie ton résultat dans l'autre sens (ex. a × a⁻¹ ≡ 1, A = BQ + R en X = 1, décryptage d'un mot).",
      "Pour les modes opératoires, vérifie bien si le XOR est avant f_k (CBC) ou après f_k (CFB, OFB, CTR).",
      "Respecte strictement la convention de l'énoncé (A = 0, symbole d'espace 0 ou Y, majuscules)."
    ]
  }
};
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
