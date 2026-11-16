// Modèles de cas pratiques rédigés d'un cours — copier ce fichier et le remplir.
// Chaque modèle tire des faits au hasard et renvoie { facts, question, keys, bad, model } :
//   keys  = notions attendues : K(libellé, poids, ...formulations acceptées) ; « mot* » = préfixe
//   bad   = pièges : BAD(message, ...expressions exactes) — ignorés si la copie les nie (« ce n'est pas… »)
//   model = corrigé rédigé (problème, règle, application, conclusion)
(function (root) {
  'use strict';
  const G = (typeof module !== 'undefined' && module.exports) ? require('../../assets/js/casegen.js') : root.CASEGEN;
  const { pick, chance, K, BAD, add } = G;

  add('chap1', 'Titre du cas', () => {
    const qui = pick(['Léa', 'Karim', 'Sofia']);
    const variante = chance(0.5);
    return {
      facts: `${qui} … (faits, éventuellement différents selon la variante).`,
      question: 'Question posée ?',
      keys: [
        K('Notion principale', 3, 'mot cle', 'synonyme*'),
        variante ? K('Conclusion A', 2, 'conclusion a') : K('Conclusion B', 2, 'conclusion b'),
      ],
      bad: [BAD('Message si la copie tombe dans le piège.', 'expression fautive')],
      model: `Problème : …

Règle : …

Application : …

Conclusion : ${variante ? '…A' : '…B'}`,
    };
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = G;
})(typeof window !== 'undefined' ? window : globalThis);
