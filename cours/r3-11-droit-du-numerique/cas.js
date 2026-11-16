// R3.11 Droit du numérique — modèles de cas pratiques rédigés.
// Chaque modèle tire des faits au hasard et renvoie { facts, question, keys, bad, model }.
// keys = notions attendues : K(libellé, poids, ...formulations acceptées) ; bad = pièges : BAD(message, ...expressions).
(function (root) {
  'use strict';
  const G = (typeof module !== 'undefined' && module.exports) ? require('../../assets/js/casegen.js') : root.CASEGEN;
  const { pick, chance, shuffle, eur, ans, two, K, BAD, norm, add } = G;

  const SOC = ['WebNova', 'Datalis', 'PixelForge', 'Cloudéo', 'Codex Studio', 'Netriva', 'Byteline', 'Logimax', 'Smartiz', 'Orbitek'];
  const PERS = ['Léa', 'Karim', 'Sofia', 'Hugo', 'Inès', 'Yanis', 'Chloé', 'Malik', 'Nora', 'Théo', 'Camille', 'Adam'];

  // Notions récurrentes
  const kNullRel = K('Sanction : nullité relative', 2, 'nullite relative', '1181', '1131');
  const k5ans = K('Délai de prescription de 5 ans', 2, '5 ans', 'cinq ans', '2224');
  const kRetro = K('Effet : anéantissement rétroactif et restitutions', 1, 'retroacti*', 'restitu*', '1178', 'jamais existe');
  const badAbs = BAD('Vous évoquez la nullité absolue : ici l\'intérêt protégé est privé, c\'est une nullité relative.', 'nullite absolue');



  // ===================== DROIT DES CONTRATS =====================

  add('contrats', 'Le vendeur qui cache un défaut', () => {
    const [A, B] = two(SOC);
    const [bien, defaut] = pick([
      ['un local commercial', 'la mairie lui avait adressé une mise en demeure interdisant son exploitation'],
      ['un parc de 40 serveurs', 'les serveurs avaient été endommagés par une inondation'],
      ['un logiciel de gestion', 'l\'éditeur avait annoncé l\'arrêt définitif de toute mise à jour de sécurité'],
      ['un fonds de commerce en ligne', 'le site principal faisait l\'objet d\'une action en contrefaçon'],
    ]);
    const n = pick([1, 2, 3, 4, 6, 7]);
    const ok = n < 5;
    return {
      facts: `${A} vend à ${B} ${bien} pour ${eur(pick([45000, 80000, 120000, 250000]))}. ${A} savait que ${defaut}, mais n'en a rien dit. ${B} l'a découvert il y a ${ans(n)}.`,
      question: `${B} peut-elle obtenir l'annulation du contrat ?`,
      keys: [
        K('Vice du consentement : le dol', 3, 'dol', 'dolosi*', '1137'),
        K('Dissimulation intentionnelle (réticence dolosive)', 2, 'dissimul*', 'reticence', 'cache*', 'tu volontairement', 'silence'),
        K('Information déterminante du consentement', 1, 'determinant*'),
        kNullRel, k5ans,
        K('Point de départ : jour de la découverte du dol', 2, 'decouvert*', '1144'),
        ok ? kRetro : K('Conclusion : l\'action est prescrite', 3, 'prescri*', 'trop tard', 'irrecevable', 'forclo*', 'expire'),
        ok ? K('Conclusion : l\'annulation peut être obtenue', 2, 'peut obtenir', 'peut demander', 'obtenir annulation', 'recevable', 'peut agir') : null,
      ],
      bad: [badAbs],
      model: `Problème : un contrat peut-il être annulé lorsque le vendeur a volontairement caché une information déterminante ?

Règle : le dol est le fait d'obtenir le consentement de l'autre par des manœuvres, des mensonges ou la dissimulation intentionnelle d'une information dont il sait le caractère déterminant (art. 1137 C. civ.). Les vices du consentement entraînent la nullité relative (art. 1131), que seule la victime peut invoquer (art. 1181), dans un délai de 5 ans (art. 2224) qui court à compter de la découverte du dol (art. 1144).

Application : ${A} savait que ${defaut} et l'a volontairement tu ; cette information était déterminante pour ${B}. Le dol est caractérisé. ${B} l'a découvert il y a ${ans(n)} : le délai de 5 ans ${ok ? 'n\'est pas expiré' : 'est expiré'}.

Conclusion : ${ok ? `${B} peut demander la nullité relative du contrat. Le contrat sera anéanti rétroactivement et les prestations restituées (art. 1178).` : `l'action en nullité est prescrite : ${B} ne peut plus obtenir l'annulation.`}`,
    };
  });

  add('contrats', 'La signature sous la menace', () => {
    const [A, B] = two(SOC);
    const menace = pick(['publier des documents confidentiels sur ses dirigeants', 'divulguer publiquement des failles de sécurité de son site', 's\'en prendre physiquement à son gérant']);
    const late = chance(0.3);
    const c = late ? pick([6, 7]) : pick([1, 2, 3, 4]);
    const s = late ? c + 1 : pick([6, 7, 8]);
    const ok = !late;
    return {
      facts: `${A} a obtenu la signature d'un contrat de maintenance très coûteux par ${B} en menaçant de ${menace}. Le contrat a été signé il y a ${ans(s)} ; les menaces ont cessé il y a ${ans(c)}.`,
      question: `${B} peut-elle encore demander l'annulation du contrat ?`,
      keys: [
        K('Vice du consentement : la violence', 3, 'violence', '1140'),
        K('Contrainte inspirant la crainte d\'un mal considérable', 2, 'contrainte', 'crainte', 'menace*', 'mal considerable', 'pression'),
        kNullRel, k5ans,
        K('Point de départ : jour où la violence a cessé', 3, 'cesse*', 'cessation', '1144'),
        ok ? K('Le délai ne court pas depuis la signature', 1, 'pas signature', 'non signature', 'et non', 'pas a compter', 'peu importe') : null,
        ok ? K('Conclusion : action encore possible', 2, 'peut encore', 'peut demander', 'recevable', 'pas prescrit*', 'non prescrit*', 'pas expire') : K('Conclusion : action prescrite', 3, 'prescri*', 'trop tard', 'irrecevable', 'expire'),
      ],
      bad: [badAbs],
      model: `Problème : quel est le point de départ du délai pour agir en nullité d'un contrat signé sous la menace ?

Règle : il y a violence lorsqu'une partie s'engage sous la pression d'une contrainte qui lui inspire la crainte d'exposer sa personne, sa fortune ou celles de ses proches à un mal considérable (art. 1140 C. civ.). C'est un vice du consentement sanctionné par la nullité relative (art. 1131). Le délai de 5 ans (art. 2224) ne court, en cas de violence, que du jour où elle a cessé (art. 1144).

Application : ${B} a signé sous la menace de ${A}, qui voulait ${menace}. La violence est caractérisée. Le contrat date de ${ans(s)}, mais le délai part de la fin des menaces, il y a ${ans(c)}.

Conclusion : ${ok ? `le délai de 5 ans n'est pas expiré : ${B} peut encore demander la nullité du contrat, même si la signature remonte à plus de 5 ans.` : `les menaces ont cessé depuis plus de 5 ans : l'action est prescrite.`}`,
    };
  });

  add('contrats', 'L\'erreur partagée', () => {
    const [A, B] = two(SOC);
    const [objet, realite] = pick([
      ['un lot de serveurs présentés comme neufs', 'ils sont reconditionnés (erreur d\'étiquetage du fabricant, que le vendeur ignorait aussi)'],
      ['des cartes graphiques que les deux parties croyaient de dernière génération', 'elles sont d\'une génération antérieure, bien moins performante'],
      ['une œuvre graphique attribuée à un illustrateur célèbre', 'c\'est une copie, ce que le vendeur ignorait'],
    ]);
    const n = pick([1, 2, 3]);
    return {
      facts: `${B} achète à ${A} ${objet}. Il y a ${ans(n)}, ${B} découvre qu'en réalité ${realite}. Aucune des parties n'a cherché à tromper l'autre.`,
      question: `Quel fondement ${B} peut-elle invoquer pour obtenir l'annulation ? Est-elle encore dans les délais ?`,
      keys: [
        K('Vice du consentement : l\'erreur', 3, 'erreur', '1132'),
        K('Erreur sur une qualité essentielle de la prestation', 2, 'qualite* essentielle*', '1133'),
        K('Erreur excusable', 1, 'excusable'),
        K('Pas de dol : aucune tromperie intentionnelle', 2, 'pas dol', 'pas de dol', 'non dol', 'n est pas un dol', 'absence intention*', 'pas intention*', 'pas volontaire', 'spontane*', 'aucune manoeuvre'),
        kNullRel, k5ans,
        K('Point de départ : la découverte de l\'erreur', 1, 'decouvert*', '1144'),
        K('Conclusion : encore dans les délais', 1, 'dans les delais', 'pas prescrit*', 'non prescrit*', 'pas expire', 'recevable', 'peut demander'),
      ],
      bad: [BAD('Vous évoquez le dol : il suppose une tromperie intentionnelle, absente ici.', 'dol est caracterise', 'il y a dol', 'c est un dol', 'il s agit d un dol'), badAbs],
      model: `Problème : peut-on annuler un contrat conclu sur la base d'une fausse représentation partagée par les deux parties ?

Règle : l'erreur est une cause de nullité lorsqu'elle porte sur les qualités essentielles de la prestation (art. 1132 et 1133 C. civ.) et qu'elle est excusable. Contrairement au dol (art. 1137), elle n'exige aucune intention de tromper. Sanction : nullité relative (art. 1131), dans les 5 ans (art. 2224) à compter de la découverte de l'erreur (art. 1144).

Application : ${B} a acheté ${objet}, or ${realite}. La caractéristique en cause était une qualité essentielle convenue. Personne n'a menti : il ne s'agit pas d'un dol mais d'une erreur spontanée. Découverte il y a ${ans(n)}, le délai de 5 ans n'est pas expiré.

Conclusion : ${B} peut demander la nullité relative pour erreur sur une qualité essentielle ; son action est recevable.`,
    };
  });

  add('contrats', 'La rupture des négociations', () => {
    const [A, B] = two(SOC);
    const fautive = chance(0.6);
    const frais = pick([8000, 15000, 22000, 40000]);
    const facts = fautive
      ? `Après ${pick([6, 8, 10])} mois de négociations, alors que le contrat de développement d'une application était prêt à être signé, ${A} rompt du jour au lendemain les discussions sans donner aucun motif. ${B} avait engagé ${eur(frais)} de frais d'étude. Elle réclame ces frais et le bénéfice de ${eur(frais * 5)} qu'elle aurait tiré du contrat.`
      : `Après trois semaines de discussions pour la location d'un entrepôt, ${A} met fin aux négociations avec ${B} en expliquant que l'entrepôt est trop petit pour son activité, et la prévient un mois à l'avance. ${B} réclame une indemnité.`;
    return {
      facts,
      question: fautive ? `Que peut obtenir ${B} ?` : `La demande de ${B} est-elle fondée ?`,
      keys: [
        K('Art. 1112 : négociations précontractuelles', 2, '1112', 'precontractuel*', 'pourparler*'),
        K('Principe de liberté de rompre les négociations', 2, 'liberte', 'libre*'),
        K('Exigence de bonne foi', 2, 'bonne foi', 'loyaute', 'deloyal*'),
        fautive ? K('Rupture fautive : brutale, sans motif, à un stade avancé', 2, 'fauti*', 'brutal*', 'abusi*', 'sans motif') : K('Rupture légitime : motif sérieux et préavis', 2, 'motif* legitime*', 'motif serieux', 'pas fauti*', 'aucune faute', 'legitime', 'preavis'),
        fautive ? K('Réparation des frais engagés', 2, 'frais', 'depenses', 'prejudice') : null,
        fautive ? K('Pas d\'indemnisation du gain manqué', 2, 'pas gain', 'pas benefice', 'avantages attendus', 'gain manque', 'manque a gagner') : null,
        fautive ? K('Ni de la perte de chance', 1, 'perte chance') : null,
        fautive ? K('Responsabilité extracontractuelle', 1, 'extracontractuel*', 'delictuel*', '1240') : null,
        fautive ? null : K('Conclusion : demande non fondée', 2, 'non fonde*', 'pas fonde*', 'infonde*', 'aucune indemnit*', 'pas indemnis*', 'rejete*'),
      ],
      bad: fautive ? [BAD('Le bénéfice que le contrat aurait apporté n\'est jamais indemnisable (art. 1112 al. 2).', 'obtenir le benefice', 'obtenir son benefice', 'obtenir le gain', 'obtenir le manque a gagner', 'indemnise du benefice')] : [],
      model: fautive
        ? `Problème : la rupture des négociations peut-elle engager la responsabilité de son auteur, et quelle réparation peut-on obtenir ?

Règle : l'initiative, le déroulement et la rupture des négociations précontractuelles sont libres, mais doivent satisfaire aux exigences de la bonne foi (art. 1112 al. 1 C. civ.). Une rupture brutale, sans motif, à un stade avancé, est fautive et engage la responsabilité extracontractuelle de son auteur (art. 1240). Mais la réparation ne peut compenser ni la perte des avantages attendus du contrat non conclu, ni la perte de chance de les obtenir (art. 1112 al. 2).

Application : ${A} a rompu sans motif après plusieurs mois, alors que le contrat était prêt : la rupture est déloyale et fautive. ${B} peut obtenir le remboursement des ${eur(frais)} de frais engagés, mais pas le bénéfice espéré de ${eur(frais * 5)}.

Conclusion : ${B} obtiendra réparation de ses frais (${eur(frais)}), mais pas du gain manqué ni de la perte de chance.`
        : `Problème : la rupture des négociations ouvre-t-elle droit à indemnité ?

Règle : la rupture des négociations est libre (art. 1112 C. civ.) ; seule une rupture contraire à la bonne foi (brutale, sans motif, abusive) est fautive.

Application : ${A} a rompu tôt, pour un motif sérieux (entrepôt inadapté) et avec un préavis d'un mois. Aucune faute n'est caractérisée.

Conclusion : la demande d'indemnité de ${B} n'est pas fondée.`,
    };
  });

  add('contrats', 'Le pacte de préférence ignoré', () => {
    const [A, C] = two(SOC);
    const B = pick(PERS);
    const knew = chance(0.5);
    return {
      facts: `${A} a signé avec ${B} un pacte de préférence : si elle vendait son nom de domaine premium, elle devait le lui proposer en priorité. ${A} le vend finalement à ${C} sans rien proposer à ${B}. ${knew ? `${C} connaissait l'existence du pacte et savait que ${B} voulait s'en prévaloir.` : `Rien n'indique que ${C} connaissait l'existence du pacte.`}`,
      question: `Quels sont les droits de ${B} ?`,
      keys: [
        K('Pacte de préférence (art. 1123)', 3, 'pacte preference', '1123'),
        K('Seul le promettant était engagé à proposer en priorité', 1, 'priorit*', 'prioritairement'),
        K('Réparation du préjudice (dommages-intérêts)', 2, 'dommage* interet*', 'reparation', 'indemnis*', 'prejudice'),
        knew ? K('Tiers de mauvaise foi : connaissait le pacte et l\'intention du bénéficiaire', 2, 'connaissait', 'mauvaise foi', 'connaissance') : K('Tiers de bonne foi : pas de remise en cause de la vente', 2, 'bonne foi', 'ignorait', 'pas connaissance', 'ne connaissait pas'),
        knew ? K('Nullité de la vente ou substitution au tiers', 3, 'nullit*', 'substitu*') : K('Seulement des dommages-intérêts contre le vendeur', 2, 'seulement', 'uniquement', 'que des'),
      ],
      bad: knew ? [] : [BAD('Sans connaissance du pacte par le tiers, la nullité ou la substitution ne sont pas possibles.', 'peut demander la substitution', 'peut etre substitue', 'obtenir la nullite de la vente', 'peut demander la nullite')],
      model: `Problème : quelle sanction lorsque le promettant d'un pacte de préférence contracte avec un tiers ?

Règle : le pacte de préférence oblige une partie à proposer prioritairement au bénéficiaire de traiter avec lui si elle décide de contracter (art. 1123 al. 1 C. civ.). En cas de violation, le bénéficiaire peut obtenir réparation de son préjudice. Si le tiers connaissait l'existence du pacte et l'intention du bénéficiaire de s'en prévaloir, le bénéficiaire peut aussi agir en nullité ou demander au juge de le substituer au tiers (art. 1123 al. 2).

Application : ${A} a violé le pacte en vendant à ${C}. ${knew ? `${C} connaissait le pacte et l'intention de ${B}.` : `${C} ignorait le pacte.`}

Conclusion : ${knew ? `${B} peut demander des dommages-intérêts, mais aussi la nullité de la vente ou sa substitution à ${C} dans le contrat.` : `${B} ne peut obtenir que des dommages-intérêts contre ${A} ; la vente à ${C} reste valable.`}`,
    };
  });

  add('contrats', 'La promesse unilatérale rétractée', () => {
    const [A, C] = two(SOC);
    const B = pick(PERS);
    const v = pick(['revoke', 'third', 'late']);
    const facts = {
      revoke: `${A} a consenti à ${B} une promesse unilatérale de vente de son logiciel de réservation, avec une option de deux mois. Au bout d'un mois, ${A} écrit à ${B} qu'elle retire sa promesse. Une semaine plus tard, ${B} lève l'option.`,
      third: `${A} a consenti à ${B} une promesse unilatérale de vente de son logiciel de réservation, avec une option de deux mois. Pendant ce délai, ${A} vend le logiciel à ${C}, qui connaissait l'existence de la promesse. ${B} lève ensuite l'option dans le délai.`,
      late: `${A} a consenti à ${B} une promesse unilatérale de vente de son logiciel de réservation, avec une option de deux mois. ${B} lève l'option trois mois après la signature.`,
    }[v];
    return {
      facts,
      question: `Le contrat de vente est-il formé entre ${A} et ${B} ?`,
      keys: [
        K('Promesse unilatérale (art. 1124)', 3, 'promesse unilaterale', '1124'),
        K('Le bénéficiaire dispose d\'une option', 2, 'option', 'opter'),
        v === 'revoke' ? K('La révocation pendant le délai d\'option est sans effet', 3, 'revocation', 'retract*', 'sans effet', 'n empeche pas') : null,
        v === 'third' ? K('Contrat conclu avec un tiers qui connaissait la promesse : nul', 3, 'nul*', 'connaissait', 'mauvaise foi') : null,
        v === 'late' ? K('Option levée hors délai : promesse caduque', 3, 'hors delai', 'apres delai', 'caduc*', 'expire', 'trop tard') : null,
        v === 'late' ? K('Conclusion : pas de contrat formé', 2, 'pas forme', 'non forme', 'aucun contrat', 'pas de contrat', 'pas de vente') : K('Conclusion : le contrat est formé', 2, 'contrat forme', 'est forme', 'vente formee', 'vente conclue', 'contrat conclu'),
      ],
      bad: [],
      model: {
        revoke: `Problème : le promettant peut-il se rétracter pendant le délai d'option ?

Règle : dans la promesse unilatérale, le promettant accorde au bénéficiaire le droit d'opter pour la conclusion d'un contrat (art. 1124 al. 1 C. civ.). La révocation de la promesse pendant le temps laissé pour opter n'empêche pas la formation du contrat promis (al. 2).

Application : ${A} s'est rétractée pendant le délai ; ${B} a levé l'option dans les deux mois.

Conclusion : la rétractation est sans effet ; la vente est formée entre ${A} et ${B}.`,
        third: `Problème : quel est le sort d'un contrat conclu avec un tiers en violation d'une promesse unilatérale ?

Règle : la révocation pendant le délai d'option n'empêche pas la formation du contrat promis (art. 1124 al. 2 C. civ.), et le contrat conclu en violation de la promesse avec un tiers qui en connaissait l'existence est nul (al. 3).

Application : ${B} a levé l'option dans le délai ; ${C} connaissait la promesse.

Conclusion : la vente entre ${A} et ${B} est formée, et la vente à ${C} est nulle.`,
        late: `Problème : le bénéficiaire peut-il lever l'option après l'expiration du délai ?

Règle : la promesse unilatérale accorde une option pendant un délai déterminé (art. 1124 C. civ.). Passé ce délai, la promesse devient caduque et le promettant est libéré.

Application : l'option était de deux mois ; ${B} l'a levée au bout de trois mois.

Conclusion : la levée est tardive ; aucun contrat de vente n'est formé.`,
      }[v],
    };
  });

  add('contrats', 'L\'achat d\'un mineur', () => {
    const P = pick(PERS);
    const age = pick([15, 16, 17]);
    const [objet, prix] = pick([['un ordinateur de jeu haut de gamme', 2800], ['une moto électrique', 4500], ['un abonnement annuel à un logiciel professionnel', 1900]]);
    return {
      facts: `${P}, ${age} ans, non émancipé(e), achète seul(e) en magasin ${objet} pour ${eur(prix)}, sans l'accord de ses parents.`,
      question: `Le contrat peut-il être remis en cause ? Par qui et jusqu'à quand ?`,
      keys: [
        K('Condition de validité : la capacité', 2, 'capacite', 'incapa*', '1128'),
        K('Mineur non émancipé : incapable de contracter', 2, 'mineur', '1146'),
        K('Pas un acte courant (montant important)', 2, 'acte courant', 'actes courants', '1148', 'vie courante'),
        K('Sanction : nullité relative', 2, 'nullite relative', '1147', '1181'),
        K('Action exercée par le représentant légal (parents)', 1, 'parent*', 'representant* legal*'),
        K('Délai de 5 ans courant de la majorité', 2, 'majorite', 'emancipation', '1152', '23 ans'),
      ],
      bad: [badAbs],
      model: `Problème : un mineur peut-il conclure seul un contrat d'un montant important ?

Règle : la capacité est une condition de validité du contrat (art. 1128 C. civ.). Le mineur non émancipé est incapable de contracter (art. 1146), sauf pour les actes courants autorisés par la loi ou l'usage, conclus à des conditions normales (art. 1148). L'incapacité est sanctionnée par la nullité relative (art. 1147), demandée par le représentant légal ou par l'intéressé ; le délai de 5 ans ne court qu'à compter de la majorité ou de l'émancipation (art. 1152).

Application : ${P}, ${age} ans, a acheté seul(e) ${objet} pour ${eur(prix)} : ce n'est pas un acte courant de la vie d'un mineur.

Conclusion : le contrat est annulable. Ses parents peuvent agir dès maintenant ; ${P} pourra aussi agir jusqu'à 5 ans après sa majorité, soit jusqu'à 23 ans. Le vendeur ne pourrait l'éviter qu'en prouvant que l'achat était utile au mineur et exempt de lésion (art. 1151).`,
    };
  });

  add('contrats', 'Le contrat au contenu illicite', () => {
    const [A, B] = two(SOC);
    const [obj, illicite] = pick([
      [`payer un pirate informatique pour s'introduire dans le système d'information de ${B}`, 'l\'accès frauduleux à un système informatique est un délit'],
      ['acheter 5 000 faux avis clients à publier sur son site', 'la publication de faux avis est une pratique commerciale trompeuse interdite'],
    ]);
    return {
      facts: `${A} signe un contrat avec un prestataire pour ${obj}. Le prestataire n'est finalement pas payé et réclame son dû en justice.`,
      question: 'Le contrat est-il valable ? Quelle est la sanction et qui peut l\'invoquer ?',
      keys: [
        K('Condition de validité : un contenu licite', 2, 'licite', 'illicite', '1128'),
        K('Le contrat ne peut déroger à l\'ordre public', 2, 'ordre public', '1162'),
        K('Sanction : nullité absolue', 3, 'nullite absolue', '1179', '1180'),
        K('Toute personne justifiant d\'un intérêt et le ministère public', 2, 'toute personne', 'ministere public', 'interet'),
        K('Pas de confirmation possible', 1, 'confirm*'),
        K('Conclusion : le prestataire ne peut pas obtenir paiement', 1, 'pas paye*', 'aucun paiement', 'ne peut pas obtenir', 'ne peut obtenir', 'pas obtenir', 'pas exiger', 'ni le paiement'),
      ],
      bad: [BAD('Contenu illicite = intérêt général : nullité absolue, pas relative.', 'nullite relative')],
      model: `Problème : un contrat dont l'objet est contraire à la loi produit-il des effets ?

Règle : un contrat valable suppose un contenu licite (art. 1128 C. civ.) ; il ne peut déroger à l'ordre public ni par ses stipulations, ni par son but (art. 1162). La nullité est absolue lorsqu'elle sanctionne une règle d'intérêt général (art. 1179) : elle peut être demandée par toute personne justifiant d'un intérêt et par le ministère public, et le contrat ne peut pas être confirmé (art. 1180).

Application : le contrat vise à ${obj} ; or ${illicite}. Son contenu est illicite.

Conclusion : le contrat est frappé de nullité absolue ; le prestataire ne peut pas en exiger l'exécution ni le paiement.`,
    };
  });

  add('contrats', 'La clause pénale démesurée', () => {
    const [A, B] = two(SOC);
    const prix = pick([5000, 8000, 12000]);
    const excessive = chance(0.65);
    const pen = excessive ? prix * pick([8, 10, 15]) : pick([20, 30]);
    return {
      facts: `${A} commande à ${B} un site vitrine pour ${eur(prix)}. Le contrat prévoit qu'en cas de retard de livraison, ${B} devra payer ${excessive ? `une pénalité forfaitaire de ${eur(pen)}` : `une pénalité forfaitaire de ${eur(pen)}`}. Le site est livré avec ${pick([3, 5, 7])} jours de retard, sans réel préjudice pour ${A}.`,
      question: `${B} doit-elle payer la pénalité prévue ? Le juge peut-il intervenir ?`,
      keys: [
        K('Clause pénale (art. 1231-5)', 3, 'clause penale', '1231 5'),
        K('Somme forfaitaire fixée à l\'avance en cas d\'inexécution', 1, 'forfait*', 'a l avance', 'inexecution'),
        K('Pouvoir de modération du juge, même d\'office', 2, 'moder*', 'reduire', 'diminuer', 'reviser', 'office'),
        excessive ? K('Pénalité manifestement excessive', 3, 'manifestement excessive', 'excessive', 'disproportionn*') : K('Pénalité ni excessive ni dérisoire : elle s\'applique', 3, 'pas excessive', 'raisonnable', 'proportionn*', 's applique', 'doit payer'),
        K('Force obligatoire du contrat', 1, 'force obligatoire', '1103'),
        K('Mise en demeure préalable (sauf inexécution définitive)', 1, 'mise en demeure', 'mettre en demeure', 'mis en demeure'),
      ],
      bad: [],
      model: `Problème : le juge peut-il réviser le montant d'une pénalité contractuelle ?

Règle : la clause pénale fixe à l'avance la somme due en cas d'inexécution (art. 1231-5 C. civ.). Le contrat a force obligatoire (art. 1103), mais le juge peut, même d'office, modérer ou augmenter la pénalité si elle est manifestement excessive ou dérisoire ; il peut la réduire mais pas la supprimer. Sauf inexécution définitive, la pénalité n'est encourue que si le débiteur a été mis en demeure (art. 1231-5 al. 5).

Application : le site coûtait ${eur(prix)} et la pénalité ${excessive ? `atteint ${eur(pen)}, pour un retard de quelques jours sans réel préjudice : elle est manifestement excessive` : `est de ${eur(pen)} : elle n'est ni excessive ni dérisoire`}.

Conclusion : ${excessive ? `le juge peut réduire la pénalité (sans la supprimer) ; après mise en demeure, ${B} ne paiera qu'un montant ramené à une juste mesure.` : `après mise en demeure, ${B} doit payer la pénalité prévue (${eur(pen)}).`}`,
    };
  });

  add('contrats', 'L\'imprévision', () => {
    const [A, B] = two(SOC);
    const excl = chance(0.3);
    const comp = pick(['les puces électroniques', 'les cartes graphiques', 'l\'électricité des centres de données']);
    return {
      facts: `${B} s'est engagée en 2025 à fournir pendant trois ans à ${A} des serveurs à prix fixe. Une crise mondiale imprévisible multiplie par quatre le prix de ${comp} : chaque livraison fait désormais perdre beaucoup d'argent à ${B}. ${excl ? `Le contrat stipule que ${B} accepte d'assumer seule tout risque de hausse des coûts, quelle qu'en soit la cause.` : 'Le contrat ne dit rien sur ce risque.'}`,
      question: `${B} peut-elle obtenir une révision du prix ?`,
      keys: [
        K('Imprévision (art. 1195)', 3, 'imprevision', '1195'),
        K('Changement de circonstances imprévisible lors de la conclusion', 2, 'imprevisible', 'changement* circonstance*'),
        K('Exécution excessivement onéreuse', 2, 'onereu*', 'excessivement'),
        excl ? K('Risque accepté par contrat : l\'art. 1195 est écarté', 3, 'accepte* risque', 'assum*', 'ecart*', 'exclu*', 'renonc*') : K('Demande de renégociation au cocontractant', 2, 'renegoci*'),
        excl ? null : K('Continuer d\'exécuter pendant la renégociation', 1, 'continu*'),
        excl ? null : K('Refus ou échec : résolution amiable ou juge (révision / fin du contrat)', 2, 'juge', 'reviser', 'revision', 'mettre fin', 'resolution'),
        excl ? K('Conclusion : pas de révision, force obligatoire', 2, 'force obligatoire', '1103', 'pas de revision', 'ne peut pas', 'doit executer') : null,
      ],
      bad: [],
      model: excl
        ? `Problème : une partie qui a accepté le risque d'une hausse des coûts peut-elle invoquer l'imprévision ?

Règle : l'art. 1195 C. civ. permet de demander une renégociation si un changement de circonstances imprévisible lors de la conclusion rend l'exécution excessivement onéreuse pour une partie qui n'avait pas accepté d'en assumer le risque. Ce texte n'est pas d'ordre public : les parties peuvent l'écarter.

Application : ${B} a expressément accepté d'assumer seule le risque de hausse des coûts.

Conclusion : ${B} ne peut pas invoquer l'imprévision ; le contrat garde sa force obligatoire (art. 1103) et elle doit livrer au prix convenu.`
        : `Problème : un changement brutal des circonstances économiques permet-il de revoir le prix d'un contrat ?

Règle : si un changement de circonstances imprévisible lors de la conclusion rend l'exécution excessivement onéreuse pour une partie qui n'en avait pas accepté le risque, celle-ci peut demander une renégociation à son cocontractant ; elle continue d'exécuter ses obligations pendant la renégociation. En cas de refus ou d'échec, les parties peuvent convenir de la résolution ou demander au juge d'adapter le contrat ; à défaut d'accord dans un délai raisonnable, le juge peut, à la demande d'une partie, réviser le contrat ou y mettre fin (art. 1195 C. civ.).

Application : la crise, imprévisible en 2025, quadruple le prix de ${comp} et rend chaque livraison ruineuse ; le contrat n'attribue pas ce risque à ${B}.

Conclusion : ${B} peut demander une renégociation à ${A} tout en continuant à livrer ; à défaut d'accord, le juge pourra réviser le prix ou mettre fin au contrat.`,
    };
  });

  add('contrats', 'Le client et le sous-traitant', () => {
    const [E, S, Cl] = shuffle(SOC);
    return {
      facts: `${Cl} confie à l'ESN ${E} le développement de son application. ${E} sous-traite une partie du code à ${S}. Le module livré par ${S} est en retard ; ${Cl} veut exiger directement de ${S} qu'elle respecte le planning prévu dans le contrat ${E}–${S}.`,
      question: `${Cl} peut-elle exiger de ${S} l'exécution du contrat de sous-traitance ? Vers qui doit-elle se tourner ?`,
      keys: [
        K('Effet relatif du contrat (art. 1199)', 3, 'effet relatif', '1199'),
        K('Le client est un tiers au contrat de sous-traitance', 2, 'tiers', 'pas partie', 'n est pas partie'),
        K('Un tiers ne peut pas demander l\'exécution du contrat', 2, 'ne peut pas demander', 'ne peut demander', 'ne peut pas exiger', 'ne peut exiger', 'pas exiger'),
        K('Se tourner vers son cocontractant, l\'ESN', 2, 'cocontractant', 'son prestataire', `${norm(E)}`),
        K('Force obligatoire du contrat client–ESN', 1, 'force obligatoire', '1103'),
      ],
      bad: [],
      model: `Problème : un client peut-il exiger l'exécution d'un contrat de sous-traitance auquel il n'est pas partie ?

Règle : le contrat ne crée d'obligations qu'entre les parties ; les tiers ne peuvent ni demander son exécution ni être contraints de l'exécuter (art. 1199 C. civ.). Chaque contrat a force obligatoire entre ceux qui l'ont conclu (art. 1103).

Application : ${Cl} n'est pas partie au contrat ${E}–${S} : c'est un tiers. En revanche, ${E} est tenue envers ${Cl} par leur propre contrat et répond du retard, même s'il vient de son sous-traitant.

Conclusion : ${Cl} ne peut pas exiger de ${S} l'exécution du contrat de sous-traitance ; elle doit agir contre ${E}, son cocontractant. (Si le manquement de ${S} lui causait directement un dommage, elle pourrait seulement engager sa responsabilité extracontractuelle : art. 1200 C. civ., Cass. ass. plén., 6 oct. 2006.)`,
    };
  });

  add('contrats', 'Le matériel impayé', () => {
    const [V, A] = two(SOC);
    const clause = chance(0.6);
    const n = pick([20, 35, 60]);
    return {
      facts: `${V} a vendu et livré ${n} ordinateurs à ${A}, payables en six mois. ${A} cesse de payer après deux échéances et est placée en procédure collective. ${clause ? 'Le contrat, signé avant la livraison, contient une clause écrite de réserve de propriété, et les ordinateurs sont toujours dans les locaux de l\'acheteur.' : 'Le contrat ne contient aucune clause particulière sur la propriété.'}`,
      question: `${V} peut-elle récupérer les ordinateurs ?`,
      keys: clause ? [
        K('Clause de réserve de propriété (art. 2367)', 3, 'reserve propriete', '2367'),
        K('Le vendeur reste propriétaire jusqu\'au paiement intégral', 3, 'reste proprietaire', 'paiement integral', 'paiement complet', 'jusqu au paiement'),
        K('Revendication des biens, y compris en cas de procédure collective', 2, 'revendi*', 'recuper*', 'reprendre'),
        K('Délai de 3 mois après le jugement d\'ouverture', 1, '3 mois', 'trois mois', '624'),
        K('Conclusion : récupération possible', 1, 'peut recuperer', 'peut les recuperer', 'peut reprendre', 'peut revendiquer'),
      ] : [
        K('Transfert de propriété dès l\'échange des consentements', 3, 'transfert propriete', 'echange consentements', '1196', 'des la vente', 'proprietaire'),
        K('Absence de clause de réserve de propriété', 3, 'pas de clause', 'aucune clause', 'absence clause', 'sans clause', 'reserve propriete'),
        K('Le vendeur n\'est qu\'un créancier', 2, 'creancier'),
        K('Conclusion : il ne peut pas reprendre le matériel', 2, 'ne peut pas recuperer', 'ne peut pas reprendre', 'ne peut recuperer', 'pas recuperer', 'pas reprendre'),
      ],
      bad: [],
      model: clause
        ? `Problème : le vendeur impayé peut-il reprendre le matériel livré ?

Règle : la clause de réserve de propriété suspend le transfert de propriété jusqu'au paiement intégral du prix (art. 2367 C. civ.). Le vendeur reste propriétaire et peut revendiquer les biens, y compris lorsque l'acheteur fait l'objet d'une procédure collective, à condition que la clause ait été convenue par écrit au plus tard à la livraison, que les biens existent en nature et qu'il agisse dans les 3 mois de la publication du jugement d'ouverture (art. L624-9 et L624-16 C. com.).

Application : le contrat contient une telle clause et ${A} n'a pas tout payé.

Conclusion : ${V} est toujours propriétaire des ordinateurs et peut les revendiquer, en agissant dans les 3 mois de la publication du jugement d'ouverture.`
        : `Problème : le vendeur impayé peut-il reprendre le matériel livré sans clause particulière ?

Règle : dans la vente, la propriété est transférée dès l'échange des consentements (art. 1196 C. civ.). Seule une clause de réserve de propriété (art. 2367) permet au vendeur de rester propriétaire jusqu'au paiement complet.

Application : le contrat ne contient pas de réserve de propriété : ${A} est devenue propriétaire des ordinateurs dès la vente.

Conclusion : ${V} ne peut pas les reprendre ; elle n'est qu'un créancier du prix, à déclarer dans la procédure collective.`,
    };
  });

  add('contrats', 'La modification imposée', () => {
    const [A, B] = two(SOC);
    const what = pick([
      ['baisser unilatéralement le prix de 20 %', 'la baisse de prix'],
      ['ajouter trois modules non prévus, sans supplément de prix', 'l\'ajout de modules'],
      ['avancer la date de livraison de deux mois', 'le nouveau délai'],
    ]);
    return {
      facts: `${A} a conclu avec ${B} un contrat de développement à prix et périmètre fixés. En cours d'exécution, ${A} annonce par e-mail qu'elle décide de ${what[0]}. ${B} refuse.`,
      question: `${B} est-elle tenue d'accepter ${what[1]} ?`,
      keys: [
        K('Force obligatoire du contrat (art. 1103)', 3, 'force obligatoire', '1103', 'tiennent lieu de loi'),
        K('Modification seulement par consentement mutuel (art. 1193)', 3, 'consentement mutuel', 'accord des deux', '1193', 'commun accord', 'accord des parties'),
        K('Pas de modification unilatérale', 2, 'unilateral*', 'modifier seul*', 'imposer seul*'),
        K('Conclusion : elle peut refuser et exiger l\'exécution du contrat initial', 2, 'peut refuser', 'pas tenue', 'n est pas tenue', 'contrat initial', 'conditions initiales'),
      ],
      bad: [],
      model: `Problème : une partie peut-elle modifier seule un contrat en cours ?

Règle : les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits (art. 1103 C. civ.). Ils ne peuvent être modifiés ou révoqués que du consentement mutuel des parties, ou pour les causes que la loi autorise (art. 1193).

Application : ${A} veut imposer unilatéralement ${what[1]} sans l'accord de ${B} ; aucune cause légale ne l'autorise.

Conclusion : ${B} n'est pas tenue d'accepter ; elle peut exiger l'exécution du contrat aux conditions initiales.`,
    };
  });

  // ===================== CONTRATS DU NUMÉRIQUE =====================

  add('numerique', 'Le retour d\'un achat en ligne', () => {
    const P = pick(PERS);
    const S = pick(SOC);
    const objet = pick(['une trottinette électrique', 'un casque audio', 'une console de jeux', 'un fauteuil de bureau', 'une imprimante 3D', 'une montre connectée']);
    const pro = chance(0.2);
    const n = pick([3, 6, 9, 12, 14, 16, 19, 25]);
    const ok = !pro && n <= 14;
    return {
      facts: `${pro ? `L'entreprise ${S} achète pour son activité professionnelle` : `${P} achète sur un site marchand`} ${objet}. ${pro ? 'Elle' : 'Il/elle'} reçoit le colis, et ${n} jours après la réception, ${pro ? 'elle' : 'il/elle'} change d'avis et veut renvoyer le produit, qui fonctionne parfaitement.`,
      question: 'Peut-on exercer un droit de rétractation ? À quelles conditions ?',
      keys: pro ? [
        K('Le droit de rétractation protège le consommateur', 3, 'consommateur*'),
        K('Achat professionnel : pas de droit légal de rétractation', 3, 'professionnel', 'b2b', 'pas de droit', 'aucun droit', 'pas applicable', 'ne s applique pas'),
        K('Sauf si les conditions générales du vendeur le prévoient', 1, 'cgv', 'conditions generales', 'geste commercial', 'sauf si'),
      ] : [
        K('Droit de rétractation (art. L221-18 C. consom.)', 3, 'retractation', '221 18'),
        K('Délai de 14 jours', 2, '14 jours', 'quatorze jours'),
        K('À compter de la réception du bien', 2, 'reception', 'recu'),
        K('Sans motif ni pénalité', 1, 'sans motif', 'sans justifi*', 'sans penalit*'),
        ok ? K('Frais de retour à la charge du consommateur (sauf exceptions)', 1, 'frais de retour', 'frais retour', '221 23') : null,
        ok ? K('Remboursement par le vendeur', 1, 'rembours*') : null,
        ok ? K('Conclusion : rétractation possible', 2, 'peut se retracter', 'peut exercer', 'dans le delai', 'dans les delais', 'peut renvoyer', 'peut retourner') : K('Conclusion : délai dépassé', 3, 'hors delai', 'depasse*', 'expire', 'trop tard', 'ne peut plus'),
      ],
      bad: [BAD('Le délai de rétractation n\'exige ni défaut ni motif.', 'si defectueux', 'doit etre defectueux')],
      model: pro
        ? `Problème : une entreprise qui achète en ligne pour son activité bénéficie-t-elle du droit de rétractation ?

Règle : le droit de rétractation de 14 jours (art. L221-18 C. consom.) protège le consommateur, c'est-à-dire une personne qui agit à des fins non professionnelles.

Application : ${S} achète ${objet} pour son activité professionnelle : ce n'est pas un consommateur.

Conclusion : pas de droit légal de rétractation ; le retour n'est possible que si les conditions générales du vendeur le prévoient.`
        : `Problème : un consommateur peut-il renvoyer un produit acheté en ligne sans motif ?

Règle : le consommateur dispose de 14 jours à compter de la réception du bien pour se rétracter, sans motif ni pénalité (art. L221-18 C. consom.). Les frais de retour sont à sa charge, sauf si le vendeur accepte de les supporter ou ne l'en a pas informé (art. L221-23) ; le vendeur rembourse dans les 14 jours.

Application : ${P} veut renvoyer ${objet} ${n} jours après la réception ; ${ok ? 'le délai de 14 jours est respecté' : 'le délai de 14 jours est dépassé'}.

Conclusion : ${ok ? `${P} peut se rétracter sans motif ; il/elle paiera en principe les frais de retour et sera remboursé(e).` : `${P} ne peut plus exercer le droit de rétractation.`}`,
    };
  });

  add('numerique', 'Le contenu numérique téléchargé', () => {
    const P = pick(PERS);
    const objet = pick(['un livre numérique', 'un jeu vidéo à télécharger', 'un pack de modèles 3D', 'un logiciel de montage']);
    const renonce = chance(0.5);
    return {
      facts: `${P} achète en ligne ${objet}, téléchargé immédiatement après le paiement. ${renonce ? 'Avant de payer, il/elle a coché une case par laquelle il/elle accepte expressément que le téléchargement commence tout de suite et reconnaît perdre son droit de rétractation ; le site lui a ensuite confirmé cet accord par e-mail.' : 'Le site ne lui a demandé aucun accord ni aucune renonciation particulière.'} Le lendemain, ${P} veut se rétracter.`,
      question: `${P} peut-il/elle se rétracter ?`,
      keys: [
        K('Droit de rétractation de 14 jours (art. L221-18)', 2, 'retractation', '221 18', '14 jours'),
        K('Exception pour le contenu numérique (art. L221-28)', 3, '221 28', 'exception*'),
        K('Conditions : accord préalable exprès + renonciation expresse', 3, 'accord prealable', 'accord expres', 'renonc*', 'perte du droit', 'perdre son droit'),
        K('Confirmation par le professionnel sur un support durable', 1, 'confirm*', 'support durable', '221 13'),
        renonce ? K('Conclusion : plus de droit de rétractation', 2, 'ne peut pas', 'ne peut plus', 'pas de retractation', 'perdu', 'exclu*') : K('Conclusion : rétractation possible', 2, 'peut se retracter', 'peut exercer', 'conserve', 'garde son droit'),
      ],
      bad: [],
      model: `Problème : le droit de rétractation s'applique-t-il à un contenu numérique téléchargé immédiatement ?

Règle : le consommateur dispose en principe de 14 jours pour se rétracter (art. L221-18 C. consom.). Il en est privé pour un contenu numérique non fourni sur un support matériel dont l'exécution a commencé après son accord préalable exprès et sa reconnaissance expresse qu'il perd ce droit, le professionnel devant lui confirmer cet accord sur un support durable (art. L221-28 13° et L221-13).

Application : ${renonce ? `${P} a donné son accord exprès, reconnu perdre son droit de rétractation avant le téléchargement, et le site l'a confirmé par e-mail.` : `aucun accord exprès ni aucune renonciation n'a été recueilli par le site.`}

Conclusion : ${renonce ? `${P} ne peut plus se rétracter.` : `l'exception ne joue pas : ${P} conserve son droit de rétractation.`}`,
    };
  });

  add('numerique', 'La preuve par messages', () => {
    const P = pick(PERS);
    const S = pick(SOC);
    const secure = chance(0.6);
    return {
      facts: `${P} a réservé auprès de ${S} une prestation de 3 000 €. ${secure ? `L'accord a été conclu via la messagerie de la plateforme de ${S}, où chaque compte est vérifié et les messages horodatés et conservés sans possibilité de modification.` : `Le seul élément dont il/elle dispose est une capture d'écran d'un message reçu d'un numéro inconnu, sans moyen de vérifier l'expéditeur ni que le texte n'a pas été modifié.`} ${S} nie s'être engagée.`,
    question: `Ces éléments peuvent-ils prouver l'engagement de ${S} ?`,
      keys: [
        K('Écrit électronique (art. 1366 C. civ.)', 3, 'ecrit electronique', '1366'),
        K('Condition : identification de l\'auteur', 2, 'identifi*'),
        K('Condition : garantie de l\'intégrité', 2, 'integrite', 'non modifie*', 'inalter*', 'altere*'),
        secure ? K('Même force probante que l\'écrit papier', 2, 'force probante', 'meme valeur', 'papier') : K('Preuve libre contre un commerçant ; valeur appréciée par le juge', 3, 'preuve libre', 'liberte de la preuve', '110 3', 'juge apprecie', 'appreciation', 'souverain*'),
        secure ? K('Conclusion : preuve valable', 1, 'preuve valable', 'peut prouver', 'vaut preuve', 'valeur probante') : K('Conclusion : preuve fragile, à compléter', 1, 'fragile', 'insuffisant*', 'completer', 'pas suffisant*'),
      ],
      bad: [BAD('Un écrit électronique n\'a pas besoin d\'être imprimé ni d\'avoir une signature manuscrite.', 'doit etre imprime*')],
      model: `Problème : des échanges électroniques peuvent-ils prouver un engagement contractuel ?

Règle : l'écrit électronique a la même force probante que l'écrit sur papier, à condition que la personne dont il émane puisse être dûment identifiée et qu'il soit établi et conservé dans des conditions qui garantissent son intégrité (art. 1366 C. civ.). À défaut, il ne vaut que comme élément de preuve laissé à l'appréciation souveraine du juge. Contre un commerçant, en matière commerciale, la preuve est libre (art. L110-3 C. com.).

Application : ${secure ? `la messagerie de la plateforme identifie les comptes et conserve des messages horodatés et non modifiables : les deux conditions sont remplies.` : `l'expéditeur n'est pas identifiable et rien ne garantit l'intégrité du message.`}

Conclusion : ${secure ? `ces messages ont la même valeur qu'un écrit papier et prouvent l'engagement de ${S}.` : `la preuve est libre contre ${S}, société commerciale, mais cette capture d'écran a une faible valeur probante, appréciée souverainement par le juge ; ${P} devra la compléter par d'autres éléments.`}`,
    };
  });

  add('numerique', 'L\'archivage de la commande', () => {
    const P = pick(PERS);
    const montant = pick([45, 89, 119, 120, 150, 380, 1290]);
    const ok = montant >= 120;
    return {
      facts: `${P} passe commande en ligne pour ${eur(montant)} TTC. Six ans plus tard, il/elle demande au site une copie du contrat conclu ; le site répond qu'il n'a rien conservé.`,
      question: 'Le site avait-il une obligation d\'archivage ? Sur quel fondement et pour combien de temps ?',
      keys: [
        K('Obligation d\'archivage du contrat électronique (art. L213-1 C. consom.)', 3, 'archiv*', '213 1'),
        K('Seuil de 120 € (art. D213-1)', 2, '120'),
        ok ? K('Durée de 10 ans (art. D213-2)', 2, '10 ans', 'dix ans', '213 2') : null,
        ok ? K('Accès du consommateur à tout moment sur demande', 1, 'tout moment', 'acces', 'sur demande') : null,
        ok ? K('Conclusion : le site a manqué à son obligation', 2, 'manque*', 'aurait du', 'obligation non respectee', 'en tort', 'fautif') : K('Conclusion : commande sous le seuil, pas d\'obligation', 3, 'pas d obligation', 'aucune obligation', 'inferieur*', 'en dessous', 'sous le seuil', 'moins de 120'),
      ],
      bad: [],
      model: `Problème : un site marchand doit-il conserver le contrat conclu en ligne ?

Règle : lorsque le contrat conclu par voie électronique porte sur une somme égale ou supérieure à 120 € (art. D213-1 C. consom.), le professionnel doit l'archiver pendant 10 ans (art. D213-2) et en garantir l'accès au consommateur à tout moment, sur demande (art. L213-1).

Application : la commande s'élève à ${eur(montant)}, ${ok ? 'soit au moins 120 €' : 'soit moins de 120 €'}.

Conclusion : ${ok ? `le site devait archiver le contrat pendant 10 ans et le communiquer à ${P} : il a manqué à son obligation.` : `le site n'était pas soumis à l'obligation légale d'archivage.`}`,
    };
  });

  add('numerique', 'Le bouton de commande', () => {
    const S = pick(SOC);
    const P = pick(PERS);
    const bouton = pick(['« OK »', '« Continuer »', '« Valider »']);
    return {
      facts: `Sur le site de ${S}, un seul clic sur un bouton ${bouton} valide immédiatement la commande et débite la carte de ${P}, sans récapitulatif ni possibilité de corriger. Aucune confirmation n'est envoyée ensuite.`,
      question: 'Quelles règles le site méconnaît-il ? Quelle conséquence pour le contrat ?',
      keys: [
        K('Double clic : vérifier et corriger avant de confirmer (art. 1127-2 C. civ.)', 3, '1127 2', 'double clic', 'recapitulatif', 'corriger', 'verifier'),
        K('Accusé de réception électronique de la commande', 2, 'accuse* reception', 'confirmation'),
        K('Bouton indiquant clairement l\'obligation de payer (art. L221-14 C. consom.)', 3, '221 14', 'obligation de paiement', 'obligation de payer', 'commande avec obligation'),
        K('Conséquence : nullité du contrat', 2, 'nullite', 'nul', 'annul*', 'pas valablement', 'non valable', '242 2'),
      ],
      bad: [],
      model: `Problème : quelles sont les formalités de conclusion d'un contrat en ligne ?

Règle : le contrat n'est valablement conclu que si le destinataire de l'offre a pu vérifier le détail de sa commande et son prix total, et corriger d'éventuelles erreurs, avant de confirmer ; l'auteur de l'offre accuse réception de la commande sans délai injustifié et par voie électronique (art. 1127-2 C. civ.). Pour un consommateur, le bouton de validation doit indiquer clairement que la commande implique une obligation de paiement (type « commande avec obligation de paiement »), à peine de nullité du contrat (art. L221-14 et L242-2 C. consom.).

Application : le bouton ${bouton} valide en un clic, sans récapitulatif, sans correction possible ni mention de paiement, et sans accusé de réception.

Conclusion : le site méconnaît les art. 1127-2 C. civ. et L221-14 C. consom. ; le contrat encourt la nullité : ${P} peut en obtenir l'annulation et le remboursement.`,
    };
  });

  add('numerique', 'L\'hébergeur et le contenu illicite', () => {
    const H = pick(SOC);
    const notif = chance(0.6);
    const contenu = pick(['des vidéos piratées de films récents', 'des copies piratées de logiciels payants', 'des copies intégrales de manuels scolaires protégés']);
    return {
      facts: `${H} héberge le site d'un client, qui y publie ${contenu}. ${notif ? `Le titulaire des droits signale précisément ces contenus à ${H}, qui ne fait rien pendant deux mois.` : `Personne n'a signalé ces contenus à ${H}, qui n'en a pas connaissance.`}`,
      question: `La responsabilité de ${H} peut-elle être engagée ?`,
      keys: [
        K('Régime de l\'hébergeur (LCEN, DSA)', 3, 'hebergeur', 'lcen', 'dsa', 'confiance dans l economie numerique'),
        K('Pas d\'obligation générale de surveillance', 1, 'surveillance', 'surveiller'),
        K('Responsabilité seulement en cas de connaissance du caractère illicite', 2, 'connaissance', 'connait', 'informe', 'signale*', 'notifi*'),
        K('Obligation d\'agir promptement pour retirer', 2, 'prompt*', 'retir*', 'rapidement', 'bloquer'),
        notif ? K('Conclusion : responsabilité engagée', 2, 'responsabilite engagee', 'est responsable', 'engage sa responsabilite', 'peut etre engagee') : K('Conclusion : pas de responsabilité', 2, 'pas responsable', 'n est pas responsable', 'pas engagee', 'aucune responsabilite'),
      ],
      bad: [],
      model: `Problème : un hébergeur est-il responsable des contenus publiés par ses clients ?

Règle : l'hébergeur bénéficie d'un régime de responsabilité limitée (LCEN de 2004 ; règlement européen DSA 2022/2065) : il n'a pas d'obligation générale de surveillance et n'est responsable que si, ayant effectivement connaissance du caractère manifestement illicite d'un contenu, il n'agit pas promptement pour le retirer ou en bloquer l'accès.

Application : ${notif ? `${H} a été précisément informé et n'a rien fait pendant deux mois.` : `${H} n'avait pas connaissance des contenus.`}

Conclusion : ${notif ? `la responsabilité de ${H} peut être engagée.` : `${H} n'est pas responsable ; il devra agir promptement dès qu'il en aura connaissance.`}`,
    };
  });

  add('numerique', 'Changer de prestataire cloud', () => {
    const [Cl, F] = two(SOC);
    return {
      facts: `${Cl} utilise depuis quatre ans la solution SaaS de ${F}. Elle veut migrer chez un concurrent. ${F} refuse de lui remettre ses bases de données et ses paramétrages dans un format exploitable, et annonce des frais de sortie très élevés. Le contrat ${pick(['ne contient aucune clause de réversibilité', 'contient une clause de réversibilité très vague'])}.`,
      question: `Sur quels fondements ${Cl} peut-elle s'appuyer ?`,
      keys: [
        K('Clause de réversibilité', 2, 'reversibilite'),
        K('Data Act (règlement UE 2023/2854)', 3, 'data act', '2023 2854'),
        K('Obligation de faciliter le changement de fournisseur', 2, 'changement de fournisseur', 'changer de fournisseur', 'migration', 'faciliter', 'migrer'),
        K('Suppression progressive des frais de changement (totale au 12 janvier 2027)', 2, 'frais', '2027'),
        K('Données personnelles : restitution par le sous-traitant (art. 28 RGPD)', 1, 'article 28', 'art 28', 'sous traitant', 'restitu*', 'renvoyer'),
      ],
      bad: [],
      model: `Problème : un client peut-il récupérer ses données et changer de fournisseur cloud ?

Règle : la clause de réversibilité organise la restitution des données et configurations en fin de contrat. Indépendamment du contrat, le Data Act (règlement (UE) 2023/2854) oblige les fournisseurs de services de traitement de données (cloud, SaaS) à faciliter le changement de fournisseur et à supprimer progressivement les frais de changement : seuls des frais limités aux coûts réels sont admis jusqu'au 11 janvier 2027, puis aucun frais à partir du 12 janvier 2027. Pour les données personnelles, le fournisseur est le sous-traitant de ${Cl} au sens du RGPD : en fin de prestation, il doit renvoyer ou supprimer toutes les données, au choix du client (art. 28.3 g RGPD). La portabilité de l'art. 20 appartient, elle, aux personnes physiques concernées, pas à l'entreprise cliente.

Application : ${F} refuse la restitution et impose des frais élevés ; la clause contractuelle est absente ou insuffisante.

Conclusion : ${Cl} peut invoquer le Data Act pour obtenir l'aide à la migration et contester les frais, et l'art. 28 RGPD pour la restitution des données personnelles ; à l'avenir, elle devra négocier une clause de réversibilité précise.`,
    };
  });

  add('numerique', 'La clause d\'indexation', () => {
    const [A, B] = two(SOC);
    const licite = chance(0.5);
    const indice = licite ? 'l\'indice Syntec' : pick(['le SMIC', 'l\'indice général des prix à la consommation', 'l\'évolution générale des salaires en France']);
    return {
      facts: `Le contrat de maintenance informatique conclu entre ${A} et ${B} pour cinq ans prévoit que le prix sera révisé chaque année selon ${indice}.`,
      question: 'Cette clause est-elle valable ?',
      keys: [
        K('Clause d\'indexation', 2, 'index*'),
        K('Art. L112-2 du Code monétaire et financier', 3, '112 2', 'monetaire'),
        licite
          ? K('Indice en relation directe avec l\'objet du contrat ou l\'activité', 3, 'relation directe', 'lien avec', 'en rapport', 'sectoriel', 'activite')
          : K('Interdiction du SMIC et du niveau général des prix ou des salaires', 3, 'smic', 'niveau general', 'general des prix', 'general des salaires'),
        licite ? K('Conclusion : clause valable', 2, 'valable', 'licite', 'valide') : K('Conclusion : clause illicite / réputée non écrite', 2, 'illicite', 'nulle', 'nullite', 'non valable', 'interdit*'),
      ],
      bad: [],
      model: `Problème : un prix peut-il être indexé sur n'importe quel indice ?

Règle : l'art. L112-2 du Code monétaire et financier interdit les indexations fondées sur le SMIC, sur le niveau général des prix ou des salaires, ou sur des prix sans relation directe avec l'objet du contrat ou l'activité de l'une des parties. Dans les services informatiques, on utilise couramment l'indice Syntec.

Application : la clause renvoie à ${indice}, ${licite ? 'indice sectoriel en relation directe avec l\'activité de services informatiques' : 'indice général prohibé par le texte'}.

Conclusion : ${licite ? 'la clause est valable.' : 'la clause est nulle car illicite ; il faut lui substituer un indice en relation avec l\'activité (ex. Syntec).'}`,
    };
  });

  add('numerique', 'La lettre recommandée électronique', () => {
    const S = pick(SOC);
    const P = pick(PERS);
    const consent = chance(0.5);
    return {
      facts: `${S} veut résilier un contrat avec ${P}, un particulier, par lettre recommandée électronique envoyée via un prestataire qualifié. ${consent ? `${P} avait accepté par écrit, lors de la souscription, de recevoir des LRE.` : `${P} n'a jamais accepté de recevoir de courriers recommandés électroniques.`}`,
      question: 'Cette lettre recommandée électronique a-t-elle la même valeur qu\'une LRAR papier ?',
      keys: [
        K('Lettre recommandée électronique (art. L100 CPCE)', 3, 'l 100', 'l100', 'recommande* electronique', 'lre', 'postes et communications'),
        K('Équivalence avec la LRAR papier', 2, 'equivalen*', 'meme valeur', 'meme effet'),
        K('Prestataire qualifié garantissant identités et dates', 2, 'prestataire qualifie', 'qualifie', 'eidas', 'horodat*', 'identite'),
        K('Destinataire non professionnel : accord préalable obligatoire', 3, 'accord prealable', 'consentement', 'non professionnel', 'particulier'),
        consent ? K('Conclusion : valeur équivalente', 1, 'valable', 'meme valeur', 'equivalent*') : K('Conclusion : pas d\'équivalence sans accord', 1, 'pas valable', 'pas la meme valeur', 'pas equivalent*', 'non valable', 'pas d equivalence'),
      ],
      bad: [],
      model: `Problème : une LRE peut-elle remplacer une lettre recommandée papier envoyée à un particulier ?

Règle : la lettre recommandée électronique est équivalente à la lettre recommandée papier si elle passe par un prestataire qualifié, qui garantit l'identité de l'expéditeur et du destinataire et les dates d'envoi et de réception (art. L100 CPCE, règlement eIDAS). Lorsque le destinataire n'est pas un professionnel, son accord préalable est obligatoire.

Application : le prestataire est qualifié ; ${consent ? `${P} a donné son accord.` : `${P} n'a jamais donné son accord.`}

Conclusion : ${consent ? 'la LRE a la même valeur qu\'une LRAR papier.' : 'faute d\'accord préalable, la LRE ne vaut pas LRAR : il faut envoyer un recommandé papier.'}`,
    };
  });

  // ===================== RGPD =====================

  add('rgpd', 'Le formulaire d\'inscription', () => {
    const S = pick(SOC);
    const box = pick(['« J\'accepte que mes données soient transmises à des partenaires commerciaux »', '« Je souhaite recevoir la newsletter et les offres des partenaires »']);
    const pwd = pick(['en clair', 'hachés avec MD5, sans sel']);
    return {
      facts: `Le formulaire d'inscription de l'application de ${S} contient une case déjà cochée : ${box}. Côté serveur, les mots de passe sont stockés ${pwd}.`,
      question: 'Identifiez les manquements au RGPD et proposez les corrections techniques.',
      keys: [
        K('Consentement : libre, spécifique, éclairé et univoque (art. 4.11 et 7)', 3, 'consentement', 'article 7', 'art 7', '4 11'),
        K('Case pré-cochée interdite : opt-in, case décochée par défaut', 3, 'pre coche*', 'precoche*', 'decoche*', 'opt in', 'acte positif'),
        K('Sécurité des traitements (art. 32)', 3, 'securite', 'article 32', 'art 32'),
        K('Hachage robuste et salé (bcrypt, Argon2…)', 2, 'bcrypt', 'argon*', 'scrypt', 'pbkdf2', 'hachage robuste', 'sel', 'sale'),
        K('Protection dès la conception / par défaut (art. 25)', 1, 'by design', 'by default', 'des la conception', 'par defaut', 'article 25'),
        K('Sanction possible (CNIL, art. 83)', 1, 'cnil', 'amende', 'sanction', '83'),
      ],
      bad: [BAD('MD5 n\'est pas un hachage acceptable pour des mots de passe.', 'md5 suffit', 'md5 est suffisant')],
      model: `Problème : ce formulaire respecte-t-il les exigences du RGPD en matière de consentement et de sécurité ?

Règle : le consentement doit être libre, spécifique, éclairé et univoque, exprimé par un acte positif clair (art. 4.11 et 7 RGPD) : une case pré-cochée ne vaut pas consentement (CJUE, Planet49, 2019). Le responsable doit assurer la sécurité des données par des mesures techniques appropriées (art. 32) et intégrer la protection dès la conception et par défaut (art. 25). Manquements sanctionnables par la CNIL (art. 83).

Application : la case ${box} est cochée par défaut : pas de consentement valable. Les mots de passe stockés ${pwd} ne sont pas protégés.

Conclusion : décocher la case par défaut (opt-in) et tracer les consentements en base ; hacher les mots de passe avec un algorithme robuste et salé (bcrypt, Argon2) ; appliquer le privacy by design.`,
    };
  });

  add('rgpd', 'La fuite de données', () => {
    const S = pick(SOC);
    const n = pick([3000, 20000, 85000, 400000]);
    const [data, high] = pick([
      ['les noms, adresses e-mail et mots de passe en clair', true],
      ['les noms, adresses et coordonnées bancaires', true],
      ['les noms et adresses e-mail professionnelles', false],
    ]);
    return {
      facts: `Suite à une injection SQL, ${n.toLocaleString('fr-FR')} comptes clients de ${S} ont fuité sur Internet : ${data}. La direction décide de ne prévenir ni la CNIL ni les utilisateurs « pour éviter un scandale ».`,
      question: 'Quelles sont les obligations de l\'entreprise et quels risques encourt-elle ?',
      keys: [
        K('Violation de données à caractère personnel', 1, 'violation', 'fuite'),
        K('Notification à la CNIL (art. 33)', 3, 'cnil', 'article 33', 'art 33', 'notifi*'),
        K('Dans les 72 heures', 3, '72'),
        high ? K('Information des personnes : risque élevé (art. 34)', 3, 'article 34', 'art 34', 'informer les utilisateurs', 'informer les personnes', 'prevenir les utilisateurs', 'risque eleve') : K('Information des personnes seulement si risque élevé (art. 34)', 2, 'article 34', 'art 34', 'risque eleve'),
        K('Corriger la faille / sécurité (art. 32)', 2, 'article 32', 'art 32', 'corrig*', 'requete* prepar*', 'faille'),
        K('Documenter la violation (registre)', 1, 'document*', 'registre'),
        K('Sanction : jusqu\'à 10 M€ ou 2 % du CA mondial (art. 83)', 2, '10 m', '10 millions', '2 %', '2 pour', 'amende', '83'),
      ],
      bad: [BAD('Ne rien dire n\'est pas une option : la notification à la CNIL est obligatoire dès qu\'il existe un risque pour les personnes.', 'ne pas prevenir la cnil', 'inutile de prevenir la cnil', 'peut garder le silence', 'peut ne rien dire')],
      model: `Problème : quelles sont les obligations d'une entreprise victime d'une violation de données ?

Règle : en cas de violation de données personnelles, le responsable notifie la CNIL dans les meilleurs délais et si possible dans les 72 heures, sauf si la violation n'engendre pas de risque pour les personnes (art. 33 RGPD) ; il la documente dans un registre interne. Si le risque est élevé, il informe aussi les personnes concernées (art. 34). Il doit corriger la faille (art. 32). Le manquement à ces obligations est passible d'une amende jusqu'à 10 M€ ou 2 % du CA annuel mondial (art. 83.4).

Application : la fuite touche ${n.toLocaleString('fr-FR')} personnes et ${data} : ${high ? 'le risque est élevé (usurpation, fraude)' : 'il existe un risque (hameçonnage)'}. Se taire est illégal.

Conclusion : notifier la CNIL sous 72 h${high ? ', informer les utilisateurs' : ', évaluer le risque pour décider d\'informer les utilisateurs'}, corriger l'injection SQL (requêtes préparées) et documenter l'incident ; à défaut, ${S} s'expose à une sanction de la CNIL.`,
    };
  });

  add('rgpd', 'La demande d\'effacement', () => {
    const S = pick(SOC);
    const P = pick(PERS);
    return {
      facts: `${P}, ancien client de ${S}, demande par e-mail la suppression de toutes ses données. ${S} détient son profil, son historique de navigation et les factures de ses achats des trois dernières années. Le service client répond qu'il « verra plus tard ».`,
      question: `Comment ${S} doit-elle traiter cette demande ?`,
      keys: [
        K('Droit à l\'effacement (art. 17)', 3, 'effacement', 'oubli', 'article 17', 'art 17'),
        K('Exception : obligation légale de conservation (factures)', 3, 'obligation legale', 'conserv*', 'comptab*', 'factur*'),
        K('Anonymisation irréversible du reste', 2, 'anonymis*'),
        K('Supprimer le profil et l\'historique', 1, 'supprim*'),
        K('Réponse dans un délai d\'un mois', 2, 'un mois', '1 mois', 'article 12', 'art 12'),
      ],
      bad: [],
      model: `Problème : une entreprise doit-elle effacer toutes les données d'un client qui le demande ?

Règle : toute personne peut obtenir l'effacement de ses données (art. 17 RGPD), sauf lorsque leur conservation est nécessaire au respect d'une obligation légale (art. 17.3), comme la conservation des pièces comptables. Le responsable doit répondre dans un délai d'un mois, prolongeable de deux mois si nécessaire (art. 12.3).

Application : le profil et l'historique de navigation de ${P} doivent être supprimés ; les factures doivent être conservées au titre des obligations comptables, en ne gardant que les données nécessaires. « Plus tard » n'est pas acceptable.

Conclusion : ${S} doit répondre dans le mois, supprimer le profil et l'historique, conserver les factures pour la durée légale puis les supprimer, et anonymiser de façon irréversible ce qui n'a pas à être conservé.`,
    };
  });

  add('rgpd', 'La demande d\'accès et de portabilité', () => {
    const S = pick(SOC);
    const P = pick(PERS);
    return {
      facts: `${P} veut quitter le réseau social de ${S} pour un concurrent. Il/elle demande une copie de toutes ses données et un export de ses publications pour les importer ailleurs. ${S} propose un PDF de 400 pages facturé 50 €.`,
      question: 'Quels droits peut invoquer cette personne et la réponse de l\'entreprise est-elle conforme ?',
      keys: [
        K('Droit d\'accès (art. 15)', 3, 'acces', 'article 15', 'art 15'),
        K('Droit à la portabilité (art. 20)', 3, 'portabilite', 'article 20', 'art 20'),
        K('Format structuré, couramment utilisé et lisible par machine', 2, 'lisible par machine', 'format structure', 'json', 'csv', 'reutilisable', 'format ouvert'),
        K('Gratuité (première copie)', 2, 'gratuit*', 'sans frais'),
        K('Délai d\'un mois', 1, 'un mois', '1 mois'),
        K('Conclusion : réponse non conforme', 1, 'non conforme', 'pas conforme', 'illegal*', 'contraire'),
      ],
      bad: [],
      model: `Problème : quels droits permettent de récupérer ses données et de les transférer à un concurrent ?

Règle : le droit d'accès (art. 15 RGPD) permet d'obtenir une copie de ses données ; la première copie est gratuite. Le droit à la portabilité (art. 20) permet de recevoir les données fournies dans un format structuré, couramment utilisé et lisible par machine, et de les transmettre à un autre responsable. Réponse dans un délai d'un mois (art. 12).

Application : un PDF n'est pas un format lisible par machine réutilisable, et la facturation de 50 € n'est pas justifiée pour une première demande.

Conclusion : la réponse n'est pas conforme ; ${S} doit fournir gratuitement une copie et un export exploitable (JSON, CSV…) dans le mois.`,
    };
  });

  add('rgpd', 'Le bandeau cookies', () => {
    const S = pick(SOC);
    return {
      facts: `Le site de ${S} dépose des cookies publicitaires et de mesure d'audience dès l'arrivée du visiteur. Le bandeau affiche seulement « En poursuivant votre navigation, vous acceptez les cookies » et un bouton « OK ». Pour refuser, il faut chercher dans une page de paramètres à quatre clics.`,
      question: 'Ce dispositif est-il conforme ? Que faut-il corriger ?',
      keys: [
        K('Consentement préalable avant tout dépôt de traceurs non essentiels', 3, 'prealable', 'avant tout depot', 'avant le depot', 'avant de deposer'),
        K('Consentement libre, éclairé, par un acte positif (RGPD)', 2, 'acte positif', 'libre', 'eclaire', 'consentement'),
        K('Poursuite de la navigation ≠ consentement', 2, 'poursuite', 'navigation ne vaut pas', 'pas un consentement', 'silence'),
        K('Refuser aussi simple qu\'accepter (bouton « Tout refuser »)', 3, 'refuser', 'refus', 'aussi simple', 'aussi facile'),
        K('Retrait du consentement possible à tout moment', 1, 'retir*', 'tout moment'),
        K('Sanction par la CNIL', 1, 'cnil', 'amende', 'sanction'),
      ],
      bad: [],
      model: `Problème : comment recueillir valablement le consentement aux cookies ?

Règle : les traceurs non strictement nécessaires (publicité, la plupart des mesures d'audience) ne peuvent être déposés qu'après le consentement préalable de l'utilisateur (art. 82 de la loi Informatique et Libertés, directive ePrivacy), consentement qui doit répondre aux exigences du RGPD : libre, éclairé, spécifique, exprimé par un acte positif. Selon la CNIL, refuser doit être aussi simple qu'accepter, et le consentement peut être retiré à tout moment.

Application : les cookies sont déposés avant tout choix, la poursuite de la navigation est assimilée à un accord et le refus est caché.

Conclusion : non conforme ; ne rien déposer avant le choix, proposer « Tout accepter » et « Tout refuser » au même niveau, permettre de retirer son choix. À défaut, sanction possible de la CNIL.`,
    };
  });

  add('rgpd', 'La surveillance des salariés', () => {
    const S = pick(SOC);
    const outil = pick([
      'un logiciel enregistrant chaque frappe au clavier (keylogger) des développeurs',
      'une capture d\'écran automatique de chaque poste toutes les 3 minutes',
      'l\'activation permanente de la webcam des télétravailleurs pendant les heures de travail',
    ]);
    return {
      facts: `Pour contrôler le télétravail, ${S} installe sans prévenir ${outil}.`,
      question: 'Ce dispositif est-il licite ? Justifiez.',
      keys: [
        K('Proportionnalité des restrictions aux libertés (art. L1121-1 C. trav.)', 3, '1121 1', 'proportionn*', 'disproportionn*', 'justifi*'),
        K('Minimisation des données (art. 5 RGPD)', 2, 'minimis*', 'article 5', 'art 5', 'strictement necessaire'),
        K('Information préalable des salariés (art. L1222-4 C. trav.)', 2, '1222 4', 'information prealable', 'informer', 'prevenir', 'a l insu'),
        K('Consultation du CSE', 1, 'cse', 'comite social'),
        K('Respect de la vie privée des salariés', 1, 'vie privee'),
        K('Conclusion : dispositif illicite', 2, 'illicite', 'illegal*', 'interdit*', 'non conforme', 'pas licite'),
      ],
      bad: [BAD('Même avec une information des salariés, ce dispositif resterait disproportionné.', 'licite si informe*', 'suffit d informer')],
      model: `Problème : un employeur peut-il surveiller en continu l'activité de ses salariés ?

Règle : nul ne peut apporter aux droits des personnes et aux libertés des restrictions qui ne seraient pas justifiées par la nature de la tâche à accomplir ni proportionnées au but recherché (art. L1121-1 C. trav.). Aucune information concernant personnellement un salarié ne peut être collectée par un dispositif dont il n'a pas été préalablement informé (art. L1222-4), et le CSE doit être consulté. Le RGPD impose la minimisation des données (art. 5.1.c). La CNIL juge ce type de surveillance permanente disproportionné.

Application : ${outil} est une surveillance permanente et intrusive, qui porte atteinte à la vie privée des salariés et a été mise en place sans information.

Conclusion : le dispositif est illicite ; il faut le retirer et contrôler l'activité par des moyens proportionnés (objectifs, livrables), après information des salariés et consultation du CSE.`,
    };
  });

  add('rgpd', 'Le fichier « personnel »', () => {
    const S = pick(SOC);
    const P = pick(PERS);
    const perso = chance(0.5);
    return {
      facts: `Soupçonnant ${P} de travailler pour un concurrent, le dirigeant de ${S} ouvre, en son absence, un dossier de son ordinateur professionnel ${perso ? 'intitulé « PERSONNEL – privé »' : 'intitulé « Projets 2026 »'}. Il n'existe ni risque ni événement particulier justifiant l'urgence.`,
      question: 'L\'employeur pouvait-il ouvrir ce dossier ?',
      keys: perso ? [
        K('Respect de la vie privée et du secret des correspondances', 3, 'vie privee', 'secret', 'correspondance*'),
        K('Fichier identifié comme personnel', 2, 'personnel', 'prive'),
        K('Ouverture seulement en présence du salarié ou celui-ci dûment appelé', 3, 'presence', 'appele'),
        K('Sauf risque ou événement particulier', 1, 'risque', 'evenement particulier'),
        K('Conclusion : ouverture irrégulière', 2, 'ne pouvait pas', 'pas le droit', 'irregulier*', 'illicite', 'interdit*'),
      ] : [
        K('Présomption de caractère professionnel des fichiers', 3, 'presum*', 'presomption', 'professionnel'),
        K('Fichier non identifié comme personnel', 2, 'pas identifie', 'non identifie', 'pas marque', 'pas personnel'),
        K('L\'employeur peut l\'ouvrir hors présence du salarié', 3, 'peut l ouvrir', 'pouvait l ouvrir', 'peut ouvrir', 'hors presence', 'en son absence'),
        K('Conclusion : ouverture régulière', 2, 'regulier*', 'licite', 'pouvait'),
      ],
      bad: [],
      model: perso
        ? `Problème : l'employeur peut-il ouvrir un fichier que le salarié a identifié comme personnel ?

Règle : le salarié a droit, même au temps et au lieu de travail, au respect de sa vie privée et du secret de ses correspondances. Les fichiers créés avec l'outil professionnel sont présumés professionnels, sauf s'ils sont identifiés comme personnels ; dans ce cas, l'employeur ne peut les ouvrir qu'en présence du salarié ou celui-ci dûment appelé, sauf risque ou événement particulier (jurisprudence de la chambre sociale de la Cour de cassation).

Application : le dossier est intitulé « PERSONNEL – privé », ${P} était absent(e) et aucun risque particulier n'est invoqué.

Conclusion : l'ouverture est irrégulière ; les éléments découverts sont en principe écartés, sauf si leur production est indispensable à l'exercice du droit à la preuve et l'atteinte à la vie privée strictement proportionnée (Cass. ass. plén., 22 déc. 2023).`
        : `Problème : l'employeur peut-il ouvrir un fichier du poste professionnel hors de la présence du salarié ?

Règle : les fichiers créés par le salarié avec l'outil informatique mis à sa disposition sont présumés avoir un caractère professionnel, sauf s'ils sont identifiés comme personnels ; l'employeur peut alors les ouvrir hors de sa présence (jurisprudence de la chambre sociale de la Cour de cassation).

Application : le dossier « Projets 2026 » n'est pas identifié comme personnel.

Conclusion : l'ouverture est régulière.`,
    };
  });

  add('rgpd', 'L\'usurpation d\'identité', () => {
    const [P, V] = two(PERS);
    const conj = chance(0.3);
    return {
      facts: `${P} crée un faux compte au nom de ${V}${conj ? `, son ex-conjoint(e) avec qui il/elle était pacsé(e)` : ', une collègue'}, avec ses photos, et publie en son nom des messages insultants pour nuire à sa réputation.`,
      question: `Quelles sanctions ${P} encourt-il/elle et que peut obtenir ${V} ?`,
      keys: [
        K('Usurpation d\'identité numérique (art. 226-4-1 C. pén.)', 3, 'usurpation', '226 4 1'),
        K('But : troubler la tranquillité ou porter atteinte à l\'honneur', 1, 'honneur', 'consideration', 'reputation', 'tranquillite', 'nuire'),
        conj ? K('Circonstance aggravante (ex-partenaire) : 2 ans et 30 000 €', 3, '30 000', '30000', '2 ans', 'aggrav*') : K('Peine : 1 an d\'emprisonnement et 15 000 € d\'amende', 3, '15 000', '15000', '1 an', 'un an'),
        K('Sanction pénale : c\'est un délit', 1, 'delit', 'penal*'),
        K('Action civile : dommages-intérêts', 2, 'dommage* interet*', 'reparation', 'civil*'),
        K('Signalement / suppression du compte', 1, 'signal*', 'supprim*', 'plainte'),
      ],
      bad: [],
      model: `Problème : quelles sont les conséquences d'une usurpation d'identité en ligne ?

Règle : le fait d'usurper l'identité d'un tiers ou de faire usage de données permettant de l'identifier, en vue de troubler sa tranquillité ou de porter atteinte à son honneur ou à sa considération, est un délit puni d'un an d'emprisonnement et de 15 000 € d'amende, y compris lorsqu'il est commis sur un réseau de communication en ligne (art. 226-4-1 C. pén.). Les peines sont portées à 2 ans et 30 000 € lorsque l'auteur est le conjoint, le concubin ou le partenaire de PACS de la victime (art. 226-4-1 al. 3), y compris un ancien partenaire (art. 132-80 C. pén.). La victime peut aussi obtenir des dommages-intérêts.

Application : ${P} utilise le nom et les photos de ${V} pour publier des messages insultants, dans le but de lui nuire.${conj ? ` ${P} est son ancien partenaire de PACS : la circonstance aggravante s'applique.` : ''}

Conclusion : ${P} encourt ${conj ? '2 ans d\'emprisonnement et 30 000 €' : '1 an d\'emprisonnement et 15 000 €'} d'amende ; ${V} peut porter plainte, faire supprimer le compte et réclamer des dommages-intérêts.`,
    };
  });

  add('rgpd', 'L\'entreprise hors UE', () => {
    const S = pick(['ShopLand Inc. (États-Unis)', 'FitTrack Ltd (Canada)', 'GameVerse Pte (Singapour)']);
    return {
      facts: `${S}, sans aucun établissement en Europe, vend en ligne à des clients situés en France et en Allemagne, avec un site traduit et des prix en euros. Elle affirme que « le RGPD ne la concerne pas ».`,
      question: 'Le RGPD s\'applique-t-il à cette entreprise ?',
      keys: [
        K('Champ d\'application territorial (art. 3 RGPD)', 3, 'article 3', 'art 3', 'territorial', 'extraterritorial*'),
        K('Offre de biens ou services à des personnes situées dans l\'UE', 3, 'offre', 'cible*', 'situees dans l union', 'dans l ue', 'residents'),
        K('Indices : langue, euros, livraison dans l\'UE', 1, 'langue', 'euro*', 'traduit'),
        K('Désigner un représentant dans l\'UE (art. 27)', 1, 'representant', 'article 27', 'art 27'),
        K('Conclusion : le RGPD s\'applique', 2, 'rgpd s applique', 's applique', 'est soumise', 'concernee'),
      ],
      bad: [],
      model: `Problème : le RGPD s'applique-t-il à une entreprise établie hors de l'Union européenne ?

Règle : le RGPD s'applique au traitement des données de personnes qui se trouvent dans l'Union par un responsable non établi dans l'Union, lorsque le traitement est lié à l'offre de biens ou de services à ces personnes, ou au suivi de leur comportement dans l'Union (art. 3.2). Le responsable doit alors en principe désigner un représentant dans l'Union (art. 27).

Application : ${S} cible clairement des clients en France et en Allemagne (site traduit, prix en euros).

Conclusion : le RGPD s'applique ; l'entreprise doit s'y conformer et désigner un représentant dans l'UE.`,
    };
  });

  // ===================== IA ACT =====================

  const IA_CASES = [
    { s: 'une mairie qui attribue à chaque habitant une note de « fiabilité » selon son comportement, utilisée pour l\'accès à certains services publics', lvl: 'inacceptable', why: 'notation sociale' },
    { s: 'un logiciel qui analyse par webcam les émotions des salariés pendant les réunions', lvl: 'inacceptable', why: 'reconnaissance des émotions sur le lieu de travail' },
    { s: 'une application qui exploite la vulnérabilité liée à l\'âge d\'enfants pour les pousser à des achats intégrés coûteux', lvl: 'inacceptable', why: 'exploitation des vulnérabilités d\'un groupe de personnes' },
    { s: 'un outil qui trie automatiquement les CV des candidats d\'une entreprise', lvl: 'eleve', why: 'emploi et recrutement (annexe III)' },
    { s: 'une IA qui évalue la solvabilité des particuliers pour accorder des crédits', lvl: 'eleve', why: 'évaluation de la solvabilité (annexe III)' },
    { s: 'une IA qui note les copies d\'un examen national', lvl: 'eleve', why: 'éducation : évaluation des résultats d\'apprentissage (annexe III)' },
    { s: 'un chatbot de service client sur un site de vente', lvl: 'transparence', why: 'système interagissant directement avec des personnes' },
    { s: 'un générateur d\'images utilisé pour créer des publicités réalistes', lvl: 'transparence', why: 'contenus générés ou manipulés par IA' },
    { s: 'un filtre anti-spam de messagerie', lvl: 'minimal', why: 'aucun risque particulier pour les droits' },
    { s: 'une IA qui pilote les adversaires dans un jeu vidéo', lvl: 'minimal', why: 'aucun risque particulier pour les droits' },
  ];
  const IA_KEYS = {
    inacceptable: [
      K('Risque inacceptable', 3, 'inacceptable'),
      K('Pratique interdite (art. 5)', 3, 'interdit*', 'article 5', 'art 5', 'prohib*'),
      K('Interdiction applicable depuis le 2 février 2025', 2, 'fevrier 2025', '2025'),
    ],
    eleve: [
      K('Risque élevé (annexe III)', 3, 'risque eleve', 'haut risque', 'annexe iii', 'annexe 3'),
      K('Autorisé sous conditions strictes / évaluation de conformité', 1, 'autorise*', 'conformite', 'audit*'),
      K('Données de qualité, atténuation des biais (art. 10)', 2, 'biais', 'article 10', 'art 10', 'qualite des donnees'),
      K('Journalisation / traçabilité (art. 12)', 2, 'journalis*', 'tracabilite', 'logs', 'article 12', 'art 12'),
      K('Contrôle humain (art. 14)', 2, 'controle humain', 'supervision humaine', 'humain', 'article 14', 'art 14'),
      K('Obligations applicables au 2 décembre 2027 (Digital Omnibus)', 1, '2027', 'omnibus'),
    ],
    transparence: [
      K('Risque de transparence (spécifique)', 3, 'transparence', 'risque specifique', 'risque limite'),
      K('Informer l\'utilisateur / marquer les contenus générés (art. 50)', 3, 'informer', 'article 50', 'art 50', 'marqu*', 'watermark*', 'filigrane', 'signaler'),
      K('Obligations applicables depuis le 2 août 2026', 1, 'aout 2026', '2026'),
    ],
    minimal: [
      K('Risque minimal', 3, 'minimal'),
      K('Libre utilisation, pas d\'obligation spécifique liée au risque', 3, 'libre', 'pas d obligation specifique', 'aucune obligation specifique', 'pas d obligation particuliere'),
    ],
  };
  const IA_MODEL = {
    inacceptable: 'Cette pratique relève du risque inacceptable : elle est interdite dans l\'UE par l\'art. 5 du règlement (UE) 2024/1689, depuis le 2 février 2025.',
    eleve: 'Il s\'agit d\'un système à risque élevé (annexe III) : il est autorisé, mais soumis à une évaluation de conformité et à des exigences strictes : données de qualité examinées pour détecter et atténuer les biais (art. 10), journalisation automatique (art. 12), contrôle humain effectif (art. 14). Depuis le Digital Omnibus (règlement (UE) 2026/1744), ces obligations s\'appliquent à partir du 2 décembre 2027.',
    transparence: 'Il relève des obligations de transparence (art. 50) : informer les personnes qu\'elles interagissent avec une IA et marquer les contenus générés de façon détectable. Ces obligations s\'appliquent depuis le 2 août 2026 (pour les systèmes génératifs déjà sur le marché avant cette date, le marquage est exigé au 2 décembre 2026).',
    minimal: 'Il relève du risque minimal : utilisation libre, sans obligation spécifique liée à son niveau de risque (seule s\'applique l\'obligation générale de maîtrise de l\'IA, art. 4).',
  };
  const LVL_LABEL = { inacceptable: 'inacceptable', eleve: 'élevé', transparence: 'de transparence', minimal: 'minimal' };

  add('ia', 'Classer un système d\'IA', () => {
    const c = pick(IA_CASES);
    const S = pick(SOC);
    return {
      facts: `${S} veut déployer dans l'Union européenne ${c.s}.`,
      question: 'Quel est le niveau de risque de ce système au sens du règlement européen sur l\'IA, et quelles en sont les conséquences ?',
      keys: [K('Règlement européen sur l\'IA (2024/1689), approche par les risques', 1, 'ia act', 'ai act', '2024 1689', 'reglement', 'niveau de risque'), ...IA_KEYS[c.lvl]],
      bad: c.lvl === 'inacceptable' ? [] : [BAD('Ce système n\'est pas interdit : vérifiez le niveau de risque.', 'est interdit', 'sont interdits')],
      model: `Problème : quel régime le règlement européen sur l'IA applique-t-il à ce système ?

Règle : le règlement (UE) 2024/1689 classe les systèmes d'IA selon leur niveau de risque pour la santé, la sécurité et les droits fondamentaux : inacceptable (interdit), élevé (encadré), transparence, minimal (libre). Il complète le RGPD, qui reste applicable aux données personnelles.

Application : le système (${c.s}) relève de : ${c.why}.

Conclusion : risque ${LVL_LABEL[c.lvl]}. ${IA_MODEL[c.lvl]}`,
    };
  });

  add('ia', 'Le recrutement automatisé', () => {
    const S = pick(SOC);
    return {
      facts: `${S} utilise une IA qui analyse les candidatures et envoie automatiquement un refus aux candidats jugés « non pertinents », sans qu'aucun recruteur ne regarde les dossiers. Le système ne conserve aucune trace de ses décisions, et il a été entraîné sur les embauches passées de l'entreprise, très majoritairement masculines.`,
      question: 'Analysez la conformité de ce système au regard de l\'IA Act et du RGPD.',
      keys: [
        K('Système à risque élevé (emploi, annexe III)', 3, 'risque eleve', 'haut risque', 'annexe iii', 'annexe 3'),
        K('Contrôle humain obligatoire (art. 14)', 2, 'controle humain', 'supervision humaine', 'article 14', 'art 14', 'intervention humaine'),
        K('Journalisation / traçabilité (art. 12)', 2, 'journalis*', 'tracabilite', 'logs', 'article 12', 'art 12'),
        K('Biais discriminatoires dans les données (art. 10)', 2, 'biais', 'discrimin*', 'article 10', 'art 10'),
        K('RGPD : pas de décision fondée exclusivement sur un traitement automatisé (art. 22)', 3, 'article 22', 'art 22', 'decision automatis*', 'exclusivement automatis*', 'entierement automatis*'),
        K('Information des candidats', 1, 'inform*'),
      ],
      bad: [BAD('Le tri de CV n\'est pas interdit : il est à risque élevé.', 'est interdit', 'pratique interdite')],
      model: `Problème : une IA peut-elle trier et rejeter seule des candidatures ?

Règle : les systèmes d'IA utilisés pour le recrutement sont à risque élevé (annexe III du règlement (UE) 2024/1689) : données d'entraînement examinées pour détecter et atténuer les biais (art. 10), journalisation automatique (art. 12), contrôle humain effectif (art. 14) ; obligations applicables au 2 décembre 2027 depuis le Digital Omnibus. Dès aujourd'hui, le RGPD interdit en principe de soumettre une personne à une décision fondée exclusivement sur un traitement automatisé produisant des effets juridiques ou l'affectant de manière significative (art. 22), et impose d'informer les personnes (art. 13-14).

Application : les refus sont entièrement automatiques, sans trace, et le modèle reproduit un biais sexiste issu des données passées.

Conclusion : le système n'est pas conforme : il faut une intervention humaine sur chaque décision, une journalisation, une correction des biais et une information des candidats.`,
    };
  });

  add('ia', 'La vidéo truquée', () => {
    const S = pick(SOC);
    const qui = pick(['un ministre', 'une chanteuse célèbre', 'le dirigeant d\'une entreprise concurrente']);
    return {
      facts: `L'agence ${S} diffuse en septembre 2026 une vidéo publicitaire générée par IA dans laquelle ${qui} semble vanter un produit, sans aucune mention indiquant qu'il s'agit d'un contenu artificiel.`,
      question: 'Quelles obligations de l\'IA Act sont méconnues ?',
      keys: [
        K('Hypertrucage (deepfake)', 2, 'deepfake', 'deep fake', 'hypertrucage', 'truque*'),
        K('Obligation de transparence (art. 50)', 3, 'transparence', 'article 50', 'art 50'),
        K('Indiquer que le contenu est généré ou manipulé par IA', 3, 'indiquer', 'mention', 'signaler', 'etiquet*', 'informer', 'marqu*', 'watermark*'),
        K('Applicable depuis le 2 août 2026', 1, 'aout 2026', '2026'),
        K('Délit de diffusion d\'un hypertrucage sans consentement ni mention (art. 226-8 C. pén.)', 1, '226 8', 'delit', 'consentement'),
        K('Autres risques : droit à l\'image, pratique trompeuse', 1, 'droit a l image', 'image', 'trompeu*'),
      ],
      bad: [],
      model: `Problème : peut-on diffuser un deepfake sans le signaler ?

Règle : l'art. 50 du règlement (UE) 2024/1689 impose aux déployeurs d'un système générant des hypertrucages (deepfakes) d'indiquer que le contenu a été généré ou manipulé artificiellement, et aux fournisseurs de marquer les contenus de façon détectable. Ces obligations s'appliquent depuis le 2 août 2026.

Application : la vidéo, diffusée en septembre 2026, montre ${qui} sans mention d'un contenu artificiel.

En droit pénal français, diffuser sans le consentement d'une personne un contenu généré par IA reproduisant son image ou ses paroles, sans qu'il soit évident ou expressément mentionné qu'il est artificiel, est puni d'1 an et 15 000 €, et de 2 ans et 45 000 € en ligne (art. 226-8 C. pén., loi SREN 2024).

Conclusion : l'obligation de transparence est violée ; faute de consentement de la personne représentée, la diffusion constitue aussi un délit, sans compter les risques au titre du droit à l'image et des pratiques commerciales trompeuses.`,
    };
  });

  // ===================== CONTRAT DE TRAVAIL =====================

  const SUB = ['ses horaires et ses zones de travail sont imposés par la plateforme', 'ses tarifs sont fixés unilatéralement par la plateforme', 'la plateforme peut le sanctionner en désactivant son compte', 'il reçoit des directives précises sur la manière d\'effectuer chaque mission', 'sa géolocalisation est suivie en temps réel pour contrôler son activité'];
  const IND = ['il choisit librement ses clients et ses horaires', 'il fixe lui-même ses prix', 'il travaille avec son propre matériel pour plusieurs clients', 'il peut refuser une mission sans aucune conséquence'];
  add('travail', 'Indépendant ou salarié ?', () => {
    const P = pick(['Karim', 'Hugo', 'Yanis', 'Malik', 'Théo', 'Adam']);
    const S = pick(SOC);
    const sub = chance(0.65);
    const ind = shuffle(sub ? SUB : IND).slice(0, 3);
    return {
      facts: `${P} est inscrit comme micro-entrepreneur et a signé avec la plateforme ${S} un « contrat de prestation de services ». En pratique : ${ind.join(' ; ')}.`,
      question: `${P} peut-il obtenir la reconnaissance d'un contrat de travail ?`,
      keys: [
        K('Trois éléments : prestation de travail, rémunération, lien de subordination', 2, 'prestation', 'remuneration', 'trois elements', '3 elements'),
        K('Lien de subordination : ordres, contrôle, sanction', 3, 'subordination', 'ordres', 'directives', 'sanction*'),
        K('La qualification donnée par les parties ne lie pas le juge', 2, 'qualification', 'nom du contrat', 'denomination', 'ne lie pas', 'peu importe', 'conditions reelles', 'conditions de fait'),
        K('Jurisprudence : Société générale 1996, Take Eat Easy 2018, Uber 2020', 1, 'societe generale', 'take eat easy', 'uber', '1996', '2018', '2020'),
        sub ? K('Requalification en contrat de travail', 3, 'requalif*') : K('Pas de subordination : statut d\'indépendant maintenu', 3, 'independant', 'pas de subordination', 'absence de subordination', 'pas de lien'),
        sub ? K('Droits du salarié (congés payés, salaire minimum…)', 1, 'conges', 'smic', 'salaire minimum', 'droits du salarie', 'protection sociale') : null,
      ],
      bad: sub ? [BAD('Le nom du contrat (« prestation ») ne suffit pas : le juge regarde les conditions réelles.', 'puisqu il a signe un contrat de prestation')] : [],
      model: `Problème : un travailleur inscrit comme indépendant peut-il être reconnu salarié ?

Règle : le contrat de travail suppose une prestation de travail, une rémunération et un lien de subordination, caractérisé par le pouvoir de l'employeur de donner des ordres et des directives, d'en contrôler l'exécution et de sanctionner les manquements (Cass. soc., 13 nov. 1996, Société générale). La qualification donnée par les parties ne lie pas le juge, qui s'attache aux conditions réelles d'exercice (Cass. soc., 28 nov. 2018, Take Eat Easy ; 4 mars 2020, Uber). L'immatriculation comme micro-entrepreneur ne crée qu'une présomption simple de non-salariat.

Application : ${ind.join(' ; ')}. ${sub ? 'Ces éléments révèlent un pouvoir de direction, de contrôle et de sanction.' : 'Ces éléments traduisent une réelle autonomie, sans pouvoir de direction ni de sanction.'}

Conclusion : ${sub ? `${P} peut obtenir la requalification en contrat de travail et les droits attachés au statut de salarié (salaire minimum, congés payés…).` : `aucun lien de subordination : ${P} reste travailleur indépendant.`}`,
    };
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = G;
})(typeof window !== 'undefined' ? window : globalThis);
