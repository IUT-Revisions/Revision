// Banque de questions d'un cours — copier ce fichier et le remplir.
// Navigateur : window.BANK ; Node : require().
(function (root) {
  'use strict';

  // Chapitres du cours : clé courte → libellé affiché
  const THEMES = {
    chap1: 'Premier chapitre',
    chap2: 'Deuxième chapitre',
  };

  // QCM : la PREMIÈRE proposition est la bonne (l'ordre est mélangé à l'affichage).
  const Q = (t, q, choices, ex) => ({ t, q, choices, ex });
  const QUIZ = [
    Q('chap1', 'Question ?', ['Bonne réponse', 'Mauvaise 1', 'Mauvaise 2', 'Mauvaise 3'], 'Explication avec la source.'),
  ];

  // Vrai / faux : v = true ou false
  const VF = (t, s, v, ex) => ({ t, s, v, ex });
  const VRAIFAUX = [
    VF('chap1', 'Affirmation à juger.', true, 'Explication.'),
  ];

  // Cas pratiques à choix multiples : c = faits, q = question, première proposition = bonne
  const CAS = (t, c, q, choices, ex) => ({ t, c, q, choices, ex });
  const CASES = [];

  // Chiffres à retenir : a = valeur exacte
  const N = (t, q, a, unit, ex) => ({ t, q, a, unit, ex });
  const NUMBERS = [];

  // Notions (servent à générer « Que signifie… ? » / « Quelle notion… ? »). Deux définitions ne doivent jamais pouvoir s'échanger.
  const A = (t, art, rule) => ({ t, art, rule });
  const ARTICLES = [];

  const BANK = { THEMES, QUIZ, VRAIFAUX, CASES, NUMBERS, ARTICLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = BANK;
  else root.BANK = BANK;
})(typeof window !== 'undefined' ? window : globalThis);
