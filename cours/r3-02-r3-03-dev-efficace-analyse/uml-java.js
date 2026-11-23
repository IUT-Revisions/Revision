// GabouLearn — R3.02/R3.03 : entraînement UML ↔ Java.
// Chaque exercice est UNE spécification (classes + relations) ; le diagramme SVG et le code Java en sont générés,
// donc ils sont toujours cohérents. Les mauvaises réponses = la même spec avec une erreur classique (mutation).
(() => {
  'use strict';

  // ------------------------------------------------------------ données
  // classe : { n, k: 'class'|'abstract'|'interface'|'enum', attrs: [{v,n,t,s,i}], ops: [{v,n,p:[[nom,type]],r,s,ab,b}], lit: [] }
  // relation : { t: 'nav'|'bi'|'agreg'|'compo'|'dep'|'gen'|'real', a, b, m, role, ma, rolea, q }
  //   nav/agreg/compo : attribut `role` dans a (multiplicité m côté b) ; bi : en plus `rolea` dans b ; gen/real : a extends/implements b
  const A = (v, n, t, x = {}) => ({ v, n, t, ...x });
  const O = (v, n, p = [], r = 'void', x = {}) => ({ v, n, p, r, ...x });

  const EX = [
    {
      title: 'Maison et pièces',
      pos: { Maison: [0, 0], Piece: [1, 0] },
      classes: [{ n: 'Maison' }, { n: 'Piece', attrs: [A('-', 'surface', 'double')] }],
      rels: [{ t: 'compo', a: 'Maison', b: 'Piece', m: '1..*', role: 'pieces' }],
      why: 'Losange <b>plein</b> côté Maison = <b>composition</b> : le tout crée ses parties (<code>new Piece()</code> dans Maison), elles meurent avec lui. <code>1..*</code> ⇒ une <code>List</code>.',
      muts: [
        { msg: 'Agrégation ◇ : les pièces seraient reçues de l\'extérieur (<code>ajouter(Piece p)</code>) et survivraient à la maison.', ch: [['rel', 0, { t: 'agreg' }]] },
        { msg: 'Losange côté Piece : ce serait la pièce qui contient des maisons. Le losange est toujours côté <b>tout</b>.', ch: [['flip', 0]] },
        { msg: 'Multiplicité 1 : une seule pièce ⇒ une simple référence, pas de <code>List</code>.', ch: [['rel', 0, { m: '1', role: 'piece' }]] },
      ],
    },
    {
      title: 'Équipe et joueurs',
      pos: { Equipe: [0, 0], Joueur: [1, 0] },
      classes: [{ n: 'Equipe', attrs: [A('-', 'nom', 'String')] }, { n: 'Joueur', attrs: [A('-', 'numero', 'int')] }],
      rels: [{ t: 'agreg', a: 'Equipe', b: 'Joueur', m: '*', role: 'joueurs' }],
      why: 'Losange <b>vide</b> = <b>agrégation</b> : les joueurs existent sans l\'équipe, ils viennent de l\'extérieur (<code>ajouter(Joueur j)</code>). <code>*</code> ⇒ <code>List</code>.',
      muts: [
        { msg: 'Composition ◆ : l\'équipe créerait ses joueurs (<code>new Joueur()</code>) et ils mourraient avec elle.', ch: [['rel', 0, { t: 'compo' }]] },
        { msg: 'Multiplicité 1 : un seul joueur ⇒ une simple référence.', ch: [['rel', 0, { m: '1', role: 'joueur' }]] },
        { msg: 'Losange côté Joueur : le joueur regrouperait des équipes.', ch: [['flip', 0]] },
      ],
    },
    {
      title: 'Commande et client',
      pos: { Commande: [0, 0], Client: [1, 0] },
      classes: [{ n: 'Commande', attrs: [A('-', 'numero', 'int')] }, { n: 'Client', attrs: [A('-', 'nom', 'String')] }],
      rels: [{ t: 'nav', a: 'Commande', b: 'Client', m: '1', role: 'client' }],
      why: 'Flèche ouverte de Commande vers Client = <b>navigable dans un seul sens</b> : seule Commande a un attribut <code>client</code>. <code>1</code> côté Client ⇒ une référence.',
      muts: [
        { msg: 'Flèche vers Commande : c\'est Client qui aurait l\'attribut.', ch: [['flip', 0]] },
        { msg: 'Trait sans flèche = navigable dans les deux sens : Client aurait aussi sa <code>List&lt;Commande&gt;</code>.', ch: [['rel', 0, { t: 'bi', ma: '*', rolea: 'commandes' }]] },
        { msg: '<code>*</code> côté Client ⇒ <code>List&lt;Client&gt;</code> : plusieurs clients par commande.', ch: [['rel', 0, { m: '*', role: 'clients' }]] },
      ],
    },
    {
      title: 'Professeur et cours',
      pos: { Professeur: [0, 0], Cours: [1, 0] },
      classes: [{ n: 'Professeur', attrs: [A('-', 'nom', 'String')] }, { n: 'Cours', attrs: [A('-', 'intitule', 'String')] }],
      rels: [{ t: 'bi', a: 'Professeur', b: 'Cours', m: '*', role: 'cours', ma: '1', rolea: 'professeur' }],
      why: 'Trait plein <b>sans flèche</b> = association parcourue dans les deux sens : chaque classe a un attribut vers l\'autre. <code>*</code> côté Cours ⇒ <code>List&lt;Cours&gt;</code> dans Professeur ; <code>1</code> côté Professeur ⇒ référence dans Cours.',
      muts: [
        { msg: 'Flèche vers Cours : navigable dans un seul sens, Cours n\'aurait pas d\'attribut <code>professeur</code>.', ch: [['rel', 0, { t: 'nav' }]] },
        { msg: 'Multiplicités inversées : un prof n\'aurait qu\'un cours. La multiplicité se lit <b>à l\'autre bout</b>.', ch: [['rel', 0, { m: '1', role: 'cours', ma: '*', rolea: 'professeurs' }]] },
        { msg: 'Pointillés = dépendance : Cours serait seulement un paramètre (<code>preparer(Cours c)</code>), jamais stocké.', ch: [['rel', 0, { t: 'dep' }], ['opadd', 'Professeur', O('+', 'preparer', [['c', 'Cours']])]] },
      ],
    },
    {
      title: 'TP3 · Document et imprimante',
      pos: { Document: [0, 0], Imprimante: [1, 0] },
      classes: [{ n: 'Document', ops: [O('+', 'imprimer', [['out', 'Imprimante']])] }, { n: 'Imprimante', attrs: [A('-', 'nom', 'String')], ops: [O('+', 'getNom', [], 'String', { b: 'return nom;' })] }],
      rels: [{ t: 'dep', a: 'Document', b: 'Imprimante' }],
      why: 'L\'exemple C++ du TP3 : <code>imprimer(Imprimante &amp;out)</code>. Imprimante n\'est qu\'un <b>paramètre</b> ⇒ flèche <b>pointillée</b> = <b>dépendance</b>, sans attribut.',
      muts: [
        { msg: 'Trait plein = association : Document garderait un attribut <code>imprimante</code>.', ch: [['rel', 0, { t: 'nav', m: '1', role: 'imprimante' }]] },
        { msg: 'Pointillés + triangle = réalisation : Document implémenterait une interface Imprimante.', ch: [['rel', 0, { t: 'real' }], ['cls', 'Imprimante', { k: 'interface', attrs: [] }]] },
        { msg: 'Dépendance inversée : c\'est Imprimante qui utiliserait Document.', ch: [['opdel', 'Document', 'imprimer'], ['opadd', 'Imprimante', O('+', 'imprimer', [['d', 'Document']])], ['flip', 0]] },
      ],
    },
    {
      title: 'TP3 · Répertoire et fichiers',
      pos: { Repertoire: [0, 0], Fichier: [1, 0] },
      classes: [{ n: 'Repertoire', attrs: [A('-', 'nom', 'String')] }, { n: 'Fichier', attrs: [A('-', 'nom', 'String'), A('-', 'taille', 'int')] }],
      rels: [{ t: 'compo', a: 'Repertoire', b: 'Fichier', m: '*', role: 'fichiers' }],
      why: '« La suppression du répertoire implique la suppression de ses fichiers » ⇒ <b>composition</b> ◆ : le répertoire gère le cycle de vie de ses fichiers (créés par lui, <code>final</code>).',
      muts: [
        { msg: 'Agrégation ◇ : les fichiers survivraient à la suppression du répertoire.', ch: [['rel', 0, { t: 'agreg' }]] },
        { msg: 'Losange côté Fichier : un fichier contiendrait des répertoires.', ch: [['flip', 0]] },
        { msg: 'Multiplicité 1 : un répertoire ne contiendrait qu\'un seul fichier.', ch: [['rel', 0, { m: '1', role: 'fichier' }]] },
      ],
    },
    {
      title: 'TP3 · Pièces et murs',
      pos: { Piece: [0, 0], Mur: [1, 0] }, gap: 170,
      classes: [{ n: 'Piece', attrs: [A('-', 'surface', 'double')] }, { n: 'Mur', attrs: [A('-', 'longueur', 'double')] }],
      rels: [{ t: 'agreg', a: 'Piece', b: 'Mur', m: '*', role: 'murs', ma: '1..2' }],
      why: '« Un mur peut appartenir à deux pièces contiguës » ⇒ partie <b>partagée</b> ⇒ <b>agrégation</b> ◇ (une composition n\'a qu\'un seul composite), avec <code>1..2</code> côté Piece.',
      muts: [
        { msg: 'Composition ◆ : impossible, un mur partagé par deux pièces aurait deux composites.', ch: [['rel', 0, { t: 'compo' }]] },
        { msg: 'Losange côté Mur : le mur regrouperait des pièces.', ch: [['flip', 0]] },
        { msg: 'Multiplicité 1 côté Mur : une pièce n\'aurait qu\'un seul mur.', ch: [['rel', 0, { m: '1', role: 'mur' }]] },
      ],
    },
    {
      title: 'TP3 · Adhérents et emprunts',
      pos: { Adherent: [0, 0], Volume: [1, 0], Etudiant: [0, 1] },
      classes: [
        { n: 'Adherent', k: 'abstract', attrs: [A('#', 'nom', 'String')] },
        { n: 'Volume', attrs: [A('-', 'auteur', 'String')] },
        { n: 'Etudiant', attrs: [A('-', 'numEtudiant', 'String')] },
      ],
      rels: [{ t: 'nav', a: 'Adherent', b: 'Volume', m: '0..4', role: 'emprunts' }, { t: 'gen', a: 'Etudiant', b: 'Adherent' }],
      why: 'Un adhérent emprunte <b>au plus 4 volumes</b> ⇒ <code>0..4</code> ⇒ une collection. Adherent en <i>italique</i> = abstraite, Etudiant (et Professeur) en héritent.',
      muts: [
        { msg: 'Multiplicité 1 : un seul emprunt possible, simple référence.', ch: [['rel', 0, { m: '1', role: 'emprunt' }]] },
        { msg: 'Composition : les volumes seraient détruits avec l\'adhérent !', ch: [['rel', 0, { t: 'compo' }]] },
        { msg: 'Adherent concrète (nom en droit) : on pourrait créer un adhérent ni étudiant ni professeur.', ch: [['cls', 'Adherent', { k: 'class' }]] },
      ],
    },
    {
      title: 'TP3 · Formes composées (Composite)',
      pos: { Forme: [0.5, 0], Cercle: [0, 1], FormeComplexe: [1, 1] }, gap: 60,
      classes: [
        { n: 'Forme', k: 'abstract', attrs: [A('#', 'couleur', 'int')], ops: [O('+', 'deplacer', [], 'void', { ab: true })] },
        { n: 'Cercle', attrs: [A('-', 'rayon', 'double')], ops: [O('+', 'deplacer')] },
        { n: 'FormeComplexe', ops: [O('+', 'deplacer')] },
      ],
      rels: [{ t: 'gen', a: 'Cercle', b: 'Forme' }, { t: 'gen', a: 'FormeComplexe', b: 'Forme', off: -14 }, { t: 'agreg', a: 'FormeComplexe', b: 'Forme', m: '2..*', role: 'formes', off: 14 }],
      why: 'Pattern <b>Composite</b> : FormeComplexe <b>est une</b> Forme ET <b>agrège</b> des Forme (2..*). <code>deplacer()</code> d\'une forme complexe déplace récursivement chacune de ses formes.',
      muts: [
        { msg: 'FormeComplexe n\'hérite plus de Forme : impossible d\'imbriquer une forme complexe dans une autre.', ch: [['delrel', 1]] },
        { msg: 'Elle n\'agrège que des Cercle : pas de rectangles ni de formes complexes imbriquées.', ch: [['rel', 2, { b: 'Cercle', off: 0, role: 'cercles' }]] },
        { msg: 'Forme concrète : son nom et deplacer() ne seraient plus en italique.', ch: [['cls', 'Forme', { k: 'class' }], ['op', 'Forme', 'deplacer', { ab: false }]] },
      ],
    },
    {
      title: 'TP8 · Compétiteurs classés',
      pos: { 'Comparable<Competiteur>': [1, 0], Competition: [0, 1], Competiteur: [1, 1] }, gap: 120,
      classes: [
        { n: 'Comparable<Competiteur>', k: 'interface', ext: true, ops: [O('+', 'compareTo', [['c', 'Competiteur']], 'int')] },
        { n: 'Competition' },
        { n: 'Competiteur', attrs: [A('-', 'score', 'int')], ops: [O('+', 'compareTo', [['c', 'Competiteur']], 'int', { b: 'return Integer.compare(score, c.score);' })] },
      ],
      rels: [{ t: 'nav', a: 'Competition', b: 'Competiteur', m: '*', role: 'competiteurs', coll: 'TreeSet', c: '{trié}' }, { t: 'real', a: 'Competiteur', b: 'Comparable<Competiteur>' }],
      why: 'Compétiteurs <b>toujours triés</b> ⇒ <code>TreeSet</code> (contrainte <code>{trié}</code>), et Competiteur <code>implements Comparable</code> pour que le TreeSet sache les comparer. Attention : même score ⇒ compareTo = 0 ⇒ le second n\'est pas ajouté.',
      muts: [
        { msg: 'Sans {trié} : une simple List, qu\'il faudrait retrier après chaque ajout.', ch: [['rel', 0, { coll: null, c: null }]] },
        { msg: 'Sans Comparable : le TreeSet ne sait pas comparer, ClassCastException au premier ajout.', ch: [['delrel', 1], ['opdel', 'Competiteur', 'compareTo']] },
        { msg: 'HashSet {unique} : pas de doublon, mais aucun ordre. C\'est le bon choix pour les amateurs, pas pour les compétiteurs.', ch: [['rel', 0, { coll: 'HashSet', c: '{unique}' }]] },
      ],
    },
    {
      title: 'Animal abstrait',
      pos: { Animal: [0, 0], Chien: [0, 1] },
      classes: [
        { n: 'Animal', k: 'abstract', attrs: [A('#', 'nom', 'String')], ops: [O('+', 'crier', [], 'void', { ab: true })] },
        { n: 'Chien', ops: [O('+', 'crier')] },
      ],
      rels: [{ t: 'gen', a: 'Chien', b: 'Animal' }],
      why: 'Trait plein + triangle vide vers Animal = <b>généralisation</b> : <code>Chien extends Animal</code>. Nom en <i>italique</i> = classe abstraite, <i>crier()</i> en italique = méthode abstraite. <code>#</code> = protected.',
      muts: [
        { msg: 'Triangle côté Chien : Animal hériterait de Chien. Le triangle pointe vers le <b>plus général</b>.', ch: [['flip', 0]] },
        { msg: 'Animal concrète : en UML son nom serait en droit, pas en italique, et crier() aurait un corps.', ch: [['cls', 'Animal', { k: 'class' }], ['op', 'Animal', 'crier', { ab: false }]] },
        { msg: 'Animal en «interface» + pointillés : ce serait <code>implements</code>, et une interface n\'a pas d\'attribut <code>nom</code>.', ch: [['cls', 'Animal', { k: 'interface', attrs: [] }], ['op', 'Animal', 'crier', { ab: false }], ['rel', 0, { t: 'real' }]] },
      ],
    },
    {
      title: 'Lutin du TP',
      pos: { Humanoide: [0, 0], Travailleur: [1, 0], Lutin: [0.5, 1] }, gap: 40,
      classes: [
        { n: 'Humanoide', k: 'abstract', attrs: [A('#', 'nom', 'String')] },
        { n: 'Travailleur', k: 'interface', ops: [O('+', 'travailler')] },
        { n: 'Lutin', ops: [O('+', 'travailler')] },
      ],
      rels: [{ t: 'gen', a: 'Lutin', b: 'Humanoide' }, { t: 'real', a: 'Lutin', b: 'Travailleur' }],
      why: 'Trait plein ▷ vers Humanoide (<code>extends</code>, une seule classe mère) + pointillés ▷ vers «interface» Travailleur (<code>implements</code>).',
      muts: [
        { msg: 'Deux généralisations = héritage multiple de classes : <b>interdit en Java</b>.', ch: [['cls', 'Travailleur', { k: 'class' }], ['rel', 1, { t: 'gen' }]] },
        { msg: 'Rôles inversés : Lutin extends Travailleur implements Humanoide.', ch: [['cls', 'Humanoide', { k: 'interface', attrs: [] }], ['cls', 'Travailleur', { k: 'abstract' }], ['rel', 0, { t: 'real' }], ['rel', 1, { t: 'gen' }]] },
        { msg: 'Sans le trait pointillé, Lutin n\'implémenterait pas Travailleur.', ch: [['delrel', 1]] },
      ],
    },
    {
      title: 'Formes géométriques',
      pos: { Forme: [0.5, 0], Cercle: [0, 1], Carre: [1, 1] }, gap: 40,
      classes: [
        { n: 'Forme', k: 'interface', ops: [O('+', 'aire', [], 'double')] },
        { n: 'Cercle', attrs: [A('-', 'rayon', 'double')], ops: [O('+', 'aire', [], 'double')] },
        { n: 'Carre', attrs: [A('-', 'cote', 'double')], ops: [O('+', 'aire', [], 'double')] },
      ],
      rels: [{ t: 'real', a: 'Cercle', b: 'Forme' }, { t: 'real', a: 'Carre', b: 'Forme' }],
      why: 'Deux <b>réalisations</b> (pointillés ▷) vers «interface» Forme : Cercle et Carre <code>implements Forme</code> et doivent définir <code>aire()</code>.',
      muts: [
        { msg: 'Forme en classe abstraite (italique) + traits pleins : <code>extends</code>.', ch: [['cls', 'Forme', { k: 'abstract' }], ['op', 'Forme', 'aire', { ab: true }], ['rel', 0, { t: 'gen' }], ['rel', 1, { t: 'gen' }]] },
        { msg: 'Trait plein vers une interface : <code>Carre extends Forme</code> ne compile pas, une classe <b>implémente</b> une interface.', ch: [['rel', 1, { t: 'gen' }]] },
        { msg: 'Carre sans <code>aire()</code> : erreur de compilation (sauf si Carre était abstraite).', ch: [['opdel', 'Carre', 'aire']] },
      ],
    },
    {
      title: 'Singleton PereNoel',
      pos: { PereNoel: [0, 0] },
      classes: [{
        n: 'PereNoel',
        attrs: [A('-', 'instance', 'PereNoel', { s: true, i: 'new PereNoel()' })],
        ops: [O('-', 'PereNoel', [], null), O('+', 'getInstance', [], 'PereNoel', { s: true, b: 'return instance;' })],
      }],
      rels: [],
      why: '<b>Singleton</b> : attribut <code>instance</code> <u>souligné</u> (static) et privé, constructeur <b>-</b> privé, <u>getInstance()</u> = fabrique statique (Effective Java F1).',
      muts: [
        { msg: 'Constructeur <b>+</b> public : n\'importe qui ferait <code>new PereNoel()</code>, plus de singleton.', ch: [['op', 'PereNoel', 'PereNoel', { v: '+' }]] },
        { msg: '<code>instance</code> non soulignée = attribut d\'instance, pas <code>static</code>.', ch: [['attr', 'PereNoel', 'instance', { s: false }]] },
        { msg: 'getInstance() non soulignée : il faudrait déjà un objet pour l\'appeler.', ch: [['op', 'PereNoel', 'getInstance', { s: false }]] },
      ],
    },
    {
      title: 'Banque et comptes',
      pos: { Banque: [0, 0], Compte: [1, 0] }, gap: 260,
      classes: [{ n: 'Banque', attrs: [A('-', 'nom', 'String')] }, { n: 'Compte', attrs: [A('-', 'solde', 'double')] }],
      rels: [{ t: 'nav', a: 'Banque', b: 'Compte', m: '0..1', role: 'comptes', q: 'numero : String' }],
      why: 'Association <b>qualifiée</b> : le qualificatif <code>numero</code> côté Banque sélectionne au plus un Compte (<code>0..1</code>) ⇒ <code>Map&lt;String, Compte&gt;</code>.',
      muts: [
        { msg: 'Sans qualificatif : une simple <code>List&lt;Compte&gt;</code> qu\'il faut parcourir pour trouver un compte.', ch: [['rel', 0, { q: null, m: '*' }]] },
        { msg: 'Qualificatif et flèche inversés : Compte indexerait des banques.', ch: [['flip', 0]] },
        { msg: 'Trait sans flèche : Compte connaîtrait aussi sa banque.', ch: [['rel', 0, { t: 'bi', ma: '1', rolea: 'banque' }]] },
      ],
    },
    {
      title: 'Nœud de liste doublement chaînée',
      pos: { DNode: [0, 0] },
      classes: [{ n: 'DNode', attrs: [A('-', 'valeur', 'int')] }],
      rels: [{ t: 'bi', a: 'DNode', b: 'DNode', m: '0..1', role: 'next', ma: '0..1', rolea: 'prev' }],
      why: 'Association <b>réflexive</b> : DNode est lié à lui-même, les rôles <code>next</code> et <code>prev</code> (0..1) deviennent deux références. C\'est la DLinkedList du cours.',
      muts: [
        { msg: 'Navigable dans un seul sens : liste <b>simplement</b> chaînée (seulement <code>next</code>).', ch: [['rel', 0, { t: 'nav' }]] },
        { msg: '<code>*</code> ⇒ <code>List&lt;DNode&gt; enfants</code> : ce serait un arbre, pas une liste.', ch: [['rel', 0, { m: '*', role: 'enfants', rolea: 'parent' }]] },
        { msg: '<code>valeur</code> en <b>+</b> : attribut public, encapsulation cassée.', ch: [['attr', 'DNode', 'valeur', { v: '+' }]] },
      ],
    },
    {
      title: 'Personne et employeur',
      pos: { Personne: [0, 0], Entreprise: [1, 0] },
      classes: [
        { n: 'Personne', attrs: [A('-', 'nom', 'String')], ops: [O('+', 'getNom', [], 'String', { b: 'return nom;' })] },
        { n: 'Entreprise', attrs: [A('-', 'raison', 'String')] },
      ],
      rels: [{ t: 'nav', a: 'Personne', b: 'Entreprise', m: '0..1', role: 'employeur' }],
      why: '<b>-</b> = private, <b>+</b> = public. <code>0..1</code> côté Entreprise ⇒ une référence <code>employeur</code> qui peut valoir <code>null</code>.',
      muts: [
        { msg: '<code>nom</code> en <b>+</b> : attribut public.', ch: [['attr', 'Personne', 'nom', { v: '+' }]] },
        { msg: '<code>getNom()</code> en <b>-</b> : accesseur privé, inutilisable de l\'extérieur.', ch: [['op', 'Personne', 'getNom', { v: '-' }]] },
        { msg: '<code>*</code> ⇒ <code>List&lt;Entreprise&gt;</code> : plusieurs employeurs.', ch: [['rel', 0, { m: '*', role: 'employeurs' }]] },
      ],
    },
    {
      title: 'Village du Père Noël',
      pos: { Village: [0, 0], Batiment: [1, 0], Personnage: [2, 0] },
      classes: [{ n: 'Village' }, { n: 'Batiment' }, { n: 'Personnage', attrs: [A('-', 'nom', 'String')] }],
      rels: [
        { t: 'compo', a: 'Village', b: 'Batiment', m: '*', role: 'batiments' },
        { t: 'agreg', a: 'Batiment', b: 'Personnage', m: '*', role: 'occupants' },
      ],
      why: 'Village ◆ Bâtiment : le village crée ses bâtiments (composition, <code>new</code>). Bâtiment ◇ Personnage : le personnage change de bâtiment et lui survit (agrégation, reçu en paramètre).',
      muts: [
        { msg: 'Types inversés : les personnages seraient créés et détruits par le bâtiment.', ch: [['rel', 0, { t: 'agreg' }], ['rel', 1, { t: 'compo' }]] },
        { msg: 'Personnage en composition : il ne pourrait pas changer de bâtiment.', ch: [['rel', 1, { t: 'compo' }]] },
        { msg: 'Bâtiments en agrégation : ils seraient construits hors du village.', ch: [['rel', 0, { t: 'agreg' }]] },
      ],
    },
    {
      title: 'Voiture, moteur, conducteur',
      pos: { Voiture: [0, 0], Moteur: [1, 0], Conducteur: [0, 1] },
      classes: [{ n: 'Voiture', attrs: [A('-', 'immat', 'String')] }, { n: 'Moteur', attrs: [A('-', 'puissance', 'int')] }, { n: 'Conducteur', attrs: [A('-', 'nom', 'String')] }],
      rels: [
        { t: 'compo', a: 'Voiture', b: 'Moteur', m: '1', role: 'moteur' },
        { t: 'nav', a: 'Voiture', b: 'Conducteur', m: '0..1', role: 'conducteur' },
      ],
      why: '◆ Moteur (1) : créé par la voiture ⇒ <code>final</code> + <code>new Moteur()</code>. → Conducteur (0..1) : simple référence, peut être <code>null</code>.',
      muts: [
        { msg: 'Simple association vers Moteur : la voiture ne créerait pas son moteur (pas de <code>new</code>).', ch: [['rel', 0, { t: 'nav' }]] },
        { msg: 'Conducteur en composition : créé par la voiture, il mourrait avec elle !', ch: [['rel', 1, { t: 'compo' }]] },
        { msg: 'Flèche vers Voiture : c\'est Conducteur qui aurait l\'attribut <code>voiture</code>.', ch: [['flip', 1]] },
      ],
    },
    {
      title: 'Commande et lignes',
      pos: { Commande: [0, 0], LigneCommande: [1, 0], Produit: [2, 0] },
      classes: [{ n: 'Commande', attrs: [A('-', 'date', 'LocalDate')] }, { n: 'LigneCommande', attrs: [A('-', 'qte', 'int')] }, { n: 'Produit', attrs: [A('-', 'prix', 'double')] }],
      rels: [
        { t: 'compo', a: 'Commande', b: 'LigneCommande', m: '1..*', role: 'lignes' },
        { t: 'nav', a: 'LigneCommande', b: 'Produit', m: '1', role: 'produit' },
      ],
      why: 'Commande ◆ LigneCommande : les lignes naissent et meurent avec la commande. LigneCommande → Produit (1) : la ligne <b>référence</b> un produit qui existe indépendamment.',
      muts: [
        { msg: 'Lignes en agrégation : elles seraient créées ailleurs et survivraient à la commande.', ch: [['rel', 0, { t: 'agreg' }]] },
        { msg: 'Produit en composition : chaque ligne créerait son propre produit.', ch: [['rel', 1, { t: 'compo' }]] },
        { msg: 'Flèche vers LigneCommande : Produit connaîtrait sa ligne, pas l\'inverse.', ch: [['flip', 1]] },
      ],
    },
    {
      title: 'Thread du TP2',
      pos: { Runnable: [0, 0], MyJob: [0, 1] },
      classes: [{ n: 'Runnable', k: 'interface', ops: [O('+', 'run')] }, { n: 'MyJob', attrs: [A('-', 'lettre', 'char')], ops: [O('+', 'run')] }],
      rels: [{ t: 'real', a: 'MyJob', b: 'Runnable' }],
      why: 'Pointillés + triangle vers «interface» Runnable = <b>réalisation</b> : <code>MyJob implements Runnable</code>, puis <code>new Thread(job).start()</code>.',
      muts: [
        { msg: 'Trait plein vers une interface : <code>extends Runnable</code> ne compile pas.', ch: [['rel', 0, { t: 'gen' }]] },
        { msg: 'Runnable en classe abstraite : en Java c\'est une <b>interface</b>.', ch: [['cls', 'Runnable', { k: 'abstract' }], ['op', 'Runnable', 'run', { ab: true }], ['rel', 0, { t: 'gen' }]] },
        { msg: 'Triangle côté MyJob : le triangle pointe toujours vers le <b>contrat</b>.', ch: [['flip', 0]] },
      ],
    },
    {
      title: 'TD1-2 · Impôts de la mairie',
      pos: { Home: [0.5, 0], PersonalHome: [0, 1], ProHome: [1, 1] }, gap: 40,
      classes: [
        { n: 'Home', attrs: [A('-', 'owner', 'String'), A('-', 'surface', 'double')], ops: [O('+', 'tax', [], 'double')] },
        { n: 'PersonalHome', attrs: [A('-', 'roomNb', 'int')], ops: [O('+', 'tax', [], 'double')] },
        { n: 'ProHome', attrs: [A('-', 'employeeNb', 'int')], ops: [O('+', 'tax', [], 'double')] },
      ],
      rels: [{ t: 'gen', a: 'PersonalHome', b: 'Home' }, { t: 'gen', a: 'ProHome', b: 'Home' }],
      why: 'Deux <b>généralisations</b> vers Home : <code>PersonalHome extends Home</code>, <code>ProHome extends Home</code>, chacune <b>redéfinit</b> <code>tax()</code>. Home est concrète (nom en droit) : elle calcule l\'impôt de base, 2 €/m².',
      muts: [
        { msg: 'Home en italique = abstraite : on ne pourrait plus créer une simple Home.', ch: [['cls', 'Home', { k: 'abstract' }]] },
        { msg: 'Pointillés vers une classe : <code>implements Home</code> ne compile pas, on implémente une interface.', ch: [['rel', 1, { t: 'real' }]] },
        { msg: 'Triangle côté PersonalHome : Home hériterait de PersonalHome.', ch: [['flip', 0]] },
      ],
    },
    {
      title: 'TD1-1 · Bibliothèque',
      pos: { Library: [0, 0], Book: [1, 0] },
      classes: [
        { n: 'Library', attrs: [A('-', 'MAX_BOOKS', 'int', { s: true, f: true, i: '100' }), A('-', 'name', 'String')] },
        { n: 'Book', attrs: [A('-', 'title', 'String'), A('-', 'author', 'String')] },
      ],
      rels: [{ t: 'agreg', a: 'Library', b: 'Book', m: '*', role: 'books' }],
      why: '<b>Constante de classe</b> = <code>static final</code>, <u>soulignée</u> en UML. Library ◇ Book : les livres sont <b>ajoutés de l\'extérieur</b> (<code>ajouter(Book b)</code>) et existent sans la bibliothèque.',
      muts: [
        { msg: 'MAX_BOOKS non soulignée : ce serait une constante <b>par objet</b>, pas une constante de classe.', ch: [['attr', 'Library', 'MAX_BOOKS', { s: false }]] },
        { msg: 'Composition : la bibliothèque fabriquerait elle-même ses livres (<code>new Book()</code>).', ch: [['rel', 0, { t: 'compo' }]] },
        { msg: 'Losange côté Book : le livre regrouperait des bibliothèques.', ch: [['flip', 0]] },
      ],
    },
    {
      title: 'TD2 · Juliette, Roméo et le compte',
      pos: { Runnable: [0, 0], JulietteAndRomeoJob: [0, 1], Account: [1, 1] },
      classes: [
        { n: 'Runnable', k: 'interface', ops: [O('+', 'run')] },
        { n: 'JulietteAndRomeoJob', attrs: [A('-', 'name', 'String')], ops: [O('+', 'run'), O('+', 'doWithdraw', [['amount', 'int']])] },
        { n: 'Account', attrs: [A('-', 'balance', 'int')], ops: [O('+', 'withdraw', [['amount', 'int']])] },
      ],
      rels: [{ t: 'real', a: 'JulietteAndRomeoJob', b: 'Runnable' }, { t: 'nav', a: 'JulietteAndRomeoJob', b: 'Account', m: '1', role: 'account' }],
      why: 'Le job <code>implements Runnable</code> et <b>référence</b> un Account (association navigable, 1). Les deux jobs reçoivent le <b>même</b> compte : c\'est ce partage qui crée la concurrence.',
      muts: [
        { msg: 'Composition : chaque job créerait son propre compte (<code>new Account()</code>), Juliette et Roméo ne partageraient plus rien.', ch: [['rel', 1, { t: 'compo' }]] },
        { msg: 'Trait plein vers l\'interface : <code>extends Runnable</code> ne compile pas.', ch: [['rel', 0, { t: 'gen' }]] },
        { msg: '<code>*</code> côté Account ⇒ <code>List&lt;Account&gt;</code> : plusieurs comptes par personne.', ch: [['rel', 1, { m: '*', role: 'accounts' }]] },
      ],
    },
    {
      title: 'TD4 · Meute de lycanthropes',
      pos: { Meute: [0, 0], Lycanthrope: [1, 0] }, gap: 190,
      classes: [{ n: 'Meute' }, { n: 'Lycanthrope', attrs: [A('-', 'force', 'int')], ops: [O('+', 'niveau', [], 'int')] }],
      rels: [{ t: 'bi', a: 'Meute', b: 'Lycanthrope', m: '*', role: 'membres', ma: '0..1', rolea: 'meute' }],
      why: 'Association dans les deux sens : la meute a ses <code>membres</code> (*), le lycanthrope connaît sa <code>meute</code> (0..1 : <code>null</code> = solitaire). Le niveau est <b>calculé</b> par une méthode.',
      muts: [
        { msg: 'Composition : la meute créerait ses lycanthropes, qui ne pourraient jamais devenir solitaires.', ch: [['rel', 0, { t: 'compo' }]] },
        { msg: 'Flèche vers Lycanthrope : le lycanthrope ne connaîtrait pas sa meute.', ch: [['rel', 0, { t: 'nav' }]] },
        { msg: 'Multiplicités inversées : un lycanthrope aurait plusieurs meutes, une meute un seul membre.', ch: [['rel', 0, { m: '0..1', role: 'membre', ma: '*', rolea: 'meutes' }]] },
      ],
    },
  ];

  // ------------------------------------------------------------ outils
  const many = (m) => !!m && (m.includes('*') || (/..(d+)$/.test(m) && Number(m.split('..')[1]) > 1) || (/^d+$/.test(m) && Number(m) > 1));
  const lc = (s) => s[0].toLowerCase() + s.slice(1);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const cls = (sp, n) => sp.classes.find((c) => c.n === n);

  function mutate(base, ch) {
    const sp = clone(base);
    for (const [kind, x, y, z] of ch) {
      if (kind === 'rel') Object.assign(sp.rels[x], y);
      else if (kind === 'delrel') sp.rels.splice(x, 1);
      else if (kind === 'flip') {
        const r = sp.rels[x];
        [r.a, r.b] = [r.b, r.a];
        if (r.role) r.role = lc(r.b) + (many(r.m) || r.q ? 's' : '');
      } else if (kind === 'cls') Object.assign(cls(sp, x), y);
      else if (kind === 'attr') Object.assign(cls(sp, x).attrs.find((a) => a.n === y), z);
      else if (kind === 'op') Object.assign(cls(sp, x).ops.find((o) => o.n === y), z);
      else if (kind === 'opadd') (cls(sp, x).ops = cls(sp, x).ops || []).push(y);
      else if (kind === 'opdel') cls(sp, x).ops = cls(sp, x).ops.filter((o) => o.n !== y);
    }
    return sp;
  }

  // ------------------------------------------------------------ génération Java
  const VIS = { '-': 'private ', '+': 'public ', '#': 'protected ', '~': '' };
  const boxed = (t) => ({ int: 'Integer', double: 'Double', char: 'Character' }[t] || t);
  function fieldsOf(sp, c) {
    const out = [];
    for (const r of sp.rels) {
      const ends = [];
      if (['nav', 'bi', 'agreg', 'compo'].includes(r.t) && r.a === c.n) ends.push([r.b, r.m, r.role, r.t, r.q, r.coll]);
      if (r.t === 'bi' && r.b === c.n) ends.push([r.a, r.ma, r.rolea, 'bi', null]);
      for (const [T, m, role, t, q, coll] of ends) {
        if (q) {
          const k = boxed(q.split(':')[1].trim());
          out.push(`private ${t === 'compo' ? 'final ' : ''}Map<${k}, ${T}> ${role} = new HashMap<>();`);
        } else if (many(m)) {
          const [I, C] = coll ? [/Set$/.test(coll) ? 'Set' : 'List', coll] : ['List', 'ArrayList'];
          out.push(`private ${t === 'compo' ? 'final ' : ''}${I}<${T}> ${role} = new ${C}<>();`);
        } else {
          out.push(t === 'compo' ? `private final ${T} ${role} = new ${T}();` : `private ${T} ${role};`);
        }
      }
    }
    return out;
  }
  function helpersOf(sp, c) {
    const out = [];
    for (const r of sp.rels) {
      if (r.a !== c.n || r.q || !many(r.m)) continue;
      if (r.t === 'compo') out.push(`public void ajouter${r.b}() { ${r.role}.add(new ${r.b}()); }`);
      if (r.t === 'agreg') { const v = lc(r.b)[0]; out.push(`public void ajouter(${r.b} ${v}) { ${r.role}.add(${v}); }`); }
    }
    return out;
  }
  function java(sp) {
    const blocks = [];
    for (const c of sp.classes) {
      if (c.ext) continue;
      const k = c.k || 'class';
      const sup = sp.rels.filter((r) => r.t === 'gen' && r.a === c.n).map((r) => r.b);
      const imp = sp.rels.filter((r) => r.t === 'real' && r.a === c.n).map((r) => r.b);
      let head = { interface: 'interface', enum: 'enum', abstract: 'abstract class', class: 'class' }[k] + ' ' + c.n;
      if (sup.length) head += ' extends ' + sup.join(', ');
      if (imp.length) head += (k === 'interface' ? ' extends ' : ' implements ') + imp.join(', ');
      const body = [];
      if (c.lit) body.push(c.lit.join(', ') + ';');
      for (const a of c.attrs || []) body.push(`${VIS[a.v]}${a.s ? 'static ' : ''}${a.f ? 'final ' : ''}${a.t} ${a.n}${a.i ? ' = ' + a.i : ''};`);
      body.push(...fieldsOf(sp, c));
      for (const o of c.ops || []) {
        const ps = o.p.map(([n, t]) => `${t} ${n}`).join(', ');
        if (k === 'interface') body.push(`${o.r} ${o.n}(${ps});`);
        else if (o.ab) body.push(`${VIS[o.v]}abstract ${o.r} ${o.n}(${ps});`);
        else body.push(`${VIS[o.v]}${o.s ? 'static ' : ''}${o.r == null ? '' : o.r + ' '}${o.n}(${ps}) { ${o.b ? o.b + ' ' : o.r && o.r !== 'void' ? '/* … */ ' : ''}}`);
      }
      body.push(...helpersOf(sp, c));
      blocks.push(body.length ? `${head} {\n${body.map((l) => '    ' + l).join('\n')}\n}` : `${head} { }`);
    }
    return blocks.join('\n');
  }

  // ------------------------------------------------------------ signature UML (pour vérifier que les 4 diagrammes diffèrent)
  function umlSig(sp) {
    return JSON.stringify([
      sp.classes.map((c) => [c.n, c.k || 'class', (c.attrs || []).map((a) => [a.v, a.n, a.t, !!a.s, !!a.f]), (c.ops || []).map((o) => [o.v, o.n, o.p, o.r, !!o.s, !!o.ab]), c.lit || []]),
      sp.rels.map((r) => [r.t, r.a, r.b, r.m || '', r.role || '', r.ma || '', r.rolea || '', r.q || '', r.c || '']),
    ]);
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = { EX, mutate, java, umlSig }; return; }
  if (typeof document === 'undefined') return;

  // Tableaux du cours : chaque cellule reçoit l'intitulé de sa colonne (affiché en mode « fiche » sur mobile).
  document.querySelectorAll('.book table').forEach((t) => {
    const head = [...(t.querySelector('tr')?.children || [])];
    if (!head.length || head[0].tagName !== 'TH') return;
    t.classList.add('stack');
    t.querySelectorAll('tr').forEach((tr) => [...tr.children].forEach((td, i) => {
      if (td.tagName === 'TD' && head[i] && head[i].textContent.trim()) td.dataset.label = head[i].textContent.trim();
    }));
  });

  // ------------------------------------------------------------ dessin UML (SVG)
  const NS = 'http://www.w3.org/2000/svg';
  const S = (t, at = {}, txt) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(at)) if (v != null) e.setAttribute(k, v); if (txt != null) e.textContent = txt; return e; };
  const CW = 7.3; // largeur d'un caractère (monospace 12 px)
  const attrTxt = (a) => `${a.v} ${a.n} : ${a.t}${a.f && a.i ? ' = ' + a.i : ''}`;
  const opTxt = (o) => `${o.v} ${o.n}(${o.p.map(([n, t]) => `${n} : ${t}`).join(', ')})${o.r && o.r !== 'void' ? ' : ' + o.r : ''}`;

  function measure(c) {
    const stereo = c.k === 'interface' ? '«interface»' : c.k === 'enum' ? '«enumeration»' : null;
    const l1 = c.lit ? c.lit : (c.attrs || []).map(attrTxt);
    const l2 = (c.ops || []).map(opTxt);
    const w = Math.max(84, c.n.length * 8.6 + 24, (stereo || '').length * 6.6 + 20, ...l1.concat(l2).map((s) => s.length * CW + 18));
    const hh = stereo ? 38 : 28;
    const h1 = l1.length ? l1.length * 16 + 8 : 10;
    const h2 = l2.length ? l2.length * 16 + 8 : 10;
    return { stereo, l1, l2, w: Math.round(w), hh, h1, h2, h: hh + h1 + h2 };
  }

  function drawClass(g, c, m, x, y) {
    g.append(S('rect', { x, y, width: m.w, height: m.h, rx: 3, class: 'u-box' }));
    let ty = y;
    if (m.stereo) g.append(S('text', { x: x + m.w / 2, y: y + 14, 'text-anchor': 'middle', class: 'u-st' }, m.stereo));
    g.append(S('text', { x: x + m.w / 2, y: y + m.hh - 9, 'text-anchor': 'middle', class: 'u-name' + (c.k === 'abstract' ? ' u-it' : '') }, c.n));
    ty = y + m.hh;
    g.append(S('line', { x1: x, y1: ty, x2: x + m.w, y2: ty, class: 'u-sep' }));
    const lines = (arr, objs, y0) => arr.forEach((s, i) => {
      const yy = y0 + 18 + i * 16;
      const o = objs[i] || {};
      g.append(S('text', { x: x + 8, y: yy, class: 'u-txt' + (o.ab || (c.k === 'interface' && false) ? ' u-it' : '') }, s));
      if (o.s) g.append(S('line', { x1: x + 8, y1: yy + 2.5, x2: x + 8 + s.length * CW, y2: yy + 2.5, class: 'u-ul' }));
    });
    lines(m.l1, c.lit ? [] : c.attrs || [], ty - 4);
    ty += m.h1;
    g.append(S('line', { x1: x, y1: ty, x2: x + m.w, y2: ty, class: 'u-sep' }));
    lines(m.l2, c.ops || [], ty - 4);
  }

  function border(b, d) {
    const t = Math.min(d.x ? b.w / 2 / Math.abs(d.x) : Infinity, d.y ? b.h / 2 / Math.abs(d.y) : Infinity);
    return { x: b.cx + d.x * t, y: b.cy + d.y * t };
  }

  function label(g, p, d, txt, back) {
    if (!txt) return;
    // p = extrémité sur le bord de la boîte, d = direction qui ENTRE dans la boîte
    const horiz = Math.abs(d.x) >= Math.abs(d.y);
    let x, y, anchor;
    if (horiz) { x = p.x - d.x * (back + 6); y = p.y - 9; anchor = d.x > 0 ? 'end' : 'start'; }
    else { x = p.x + 8; y = p.y - d.y * (back + 8) + (d.y < 0 ? 10 : 0); anchor = 'start'; }
    g.append(S('text', { x, y, 'text-anchor': anchor, class: 'u-lab' }, txt));
  }

  function umlSvg(sp, big) {
    const M = Object.fromEntries(sp.classes.map((c) => [c.n, measure(c)]));
    const maxW = Math.max(...Object.values(M).map((m) => m.w));
    const maxH = Math.max(...Object.values(M).map((m) => m.h));
    const colW = maxW + (sp.gap ?? 150), rowH = maxH + 80;
    const self = sp.rels.some((r) => r.a === r.b);
    const L = 40, T = self ? 52 : 18;
    const B = {};
    for (const c of sp.classes) {
      const [col, row] = sp.pos[c.n];
      const m = M[c.n];
      const cx = L + maxW / 2 + col * colW, cy = T + maxH / 2 + row * rowH;
      B[c.n] = { cx, cy, w: m.w, h: m.h, x: cx - m.w / 2, y: cy - m.h / 2 };
    }
    const xs = Object.values(B);
    const W = Math.max(...xs.map((b) => b.x + b.w)) + (self ? 120 : 40);
    const H = Math.max(...xs.map((b) => b.y + b.h)) + 18;
    const svg = S('svg', { viewBox: `0 0 ${Math.ceil(W)} ${Math.ceil(H)}`, class: 'uml', role: 'img', 'aria-label': 'Diagramme de classes UML' });
    svg.style.minWidth = `${Math.round(Math.min(W, 640) * (big ? 0.8 : 0.62))}px`;
    svg.style.maxWidth = `${Math.ceil(W * 1.05)}px`;
    const gl = S('g'), gb = S('g');
    svg.append(gl, gb);

    for (const r of sp.rels) {
      const A0 = B[r.a], B0 = B[r.b];
      const dashed = r.t === 'dep' || r.t === 'real';
      if (r.a === r.b) { // réflexive
        const px = A0.x + A0.w, py = A0.y + A0.h * 0.35, tx = A0.x + A0.w * 0.72, top = A0.y - 34;
        gl.append(S('polyline', { points: `${px},${py} ${px + 36},${py} ${px + 36},${top} ${tx},${top} ${tx},${A0.y}`, class: 'u-line', fill: 'none' }));
        if (r.t === 'nav') gl.append(S('polyline', { points: `${tx - 7},${A0.y - 11} ${tx},${A0.y} ${tx + 7},${A0.y - 11}`, class: 'u-line', fill: 'none' }));
        gl.append(S('text', { x: tx - 6, y: A0.y - 8, 'text-anchor': 'end', class: 'u-lab' }, `${r.m || ''} ${r.role || ''}`.trim()));
        if (r.t === 'bi') gl.append(S('text', { x: px + 6, y: py + 15, class: 'u-lab' }, `${r.ma || ''} ${r.rolea || ''}`.trim()));
        continue;
      }
      let dx = B0.cx - A0.cx, dy = B0.cy - A0.cy;
      const len = Math.hypot(dx, dy); dx /= len; dy /= len;
      const d = { x: dx, y: dy }, n = { x: -dy, y: dx };
      let pa = border(A0, d);
      let pb = border(B0, { x: -dx, y: -dy });
      if (r.off) { pa = { x: pa.x + n.x * r.off, y: pa.y + n.y * r.off }; pb = { x: pb.x + n.x * r.off, y: pb.y + n.y * r.off }; }
      if (r.q) { // qualificatif collé au bord de a
        const qw = r.q.length * CW + 12;
        const horiz = Math.abs(dx) >= Math.abs(dy);
        const rx = horiz ? (dx > 0 ? pa.x : pa.x - qw) : pa.x - qw / 2;
        const ry = horiz ? pa.y - 11 : (dy > 0 ? pa.y : pa.y - 22);
        gl.append(S('rect', { x: rx, y: ry, width: qw, height: 22, class: 'u-box' }));
        gl.append(S('text', { x: rx + qw / 2, y: ry + 15, 'text-anchor': 'middle', class: 'u-txt' }, r.q));
        pa = horiz ? { x: pa.x + (dx > 0 ? qw : -qw), y: pa.y } : { x: pa.x, y: pa.y + (dy > 0 ? 22 : -22) };
      }
      const diamond = r.t === 'agreg' || r.t === 'compo';
      const tri = r.t === 'gen' || r.t === 'real';
      const sa = diamond ? { x: pa.x + dx * 22, y: pa.y + dy * 22 } : pa;
      const eb = tri ? { x: pb.x - dx * 15, y: pb.y - dy * 15 } : pb;
      gl.append(S('line', { x1: sa.x, y1: sa.y, x2: eb.x, y2: eb.y, class: 'u-line', 'stroke-dasharray': dashed ? '6 5' : null }));
      if (diamond) gl.append(S('polygon', { points: `${pa.x},${pa.y} ${pa.x + dx * 11 + n.x * 7},${pa.y + dy * 11 + n.y * 7} ${pa.x + dx * 22},${pa.y + dy * 22} ${pa.x + dx * 11 - n.x * 7},${pa.y + dy * 11 - n.y * 7}`, class: r.t === 'compo' ? 'u-full' : 'u-hollow' }));
      if (tri) gl.append(S('polygon', { points: `${pb.x},${pb.y} ${pb.x - dx * 15 + n.x * 9},${pb.y - dy * 15 + n.y * 9} ${pb.x - dx * 15 - n.x * 9},${pb.y - dy * 15 - n.y * 9}`, class: 'u-hollow' }));
      if (r.t === 'nav' || r.t === 'dep') gl.append(S('polyline', { points: `${pb.x - dx * 12 + n.x * 7},${pb.y - dy * 12 + n.y * 7} ${pb.x},${pb.y} ${pb.x - dx * 12 - n.x * 7},${pb.y - dy * 12 - n.y * 7}`, class: 'u-line', fill: 'none' }));
      if (!tri && r.t !== 'dep') {
        label(gl, pb, d, `${r.role || ''} ${r.m || ''}${r.c ? ' ' + r.c : ''}`.trim(), 4);
        if (r.t === 'bi' || r.ma) label(gl, pa, { x: -dx, y: -dy }, `${r.ma || ''} ${r.rolea || ''}`.trim(), 4);
      }
    }
    for (const c of sp.classes) drawClass(gb, c, M[c.n], B[c.n].x, B[c.n].y);
    svg.dataset.w = Math.ceil(W);
    return svg;
  }

  // ------------------------------------------------------------ coloration Java
  const KW = /\b(class|interface|enum|extends|implements|private|public|protected|static|final|abstract|new|void|return|int|double|char|boolean|null)\b|\b(List|ArrayList|Map|HashMap|Set|TreeSet|HashSet|Comparable|String|Integer|Double|Character|LocalDate)\b/g;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const hl = (code) => esc(code).replace(KW, (m, kw, ty) => (kw ? `<span class="kw">${m}</span>` : `<span class="ty">${m}</span>`));

  // ------------------------------------------------------------ interface
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const root = document.getElementById('uml-java');
  if (!root) return;
  const KEY = 'gaboulearn-r323-umljava-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  let ST = Object.assign({ best: {}, miss: [] }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch { /* navigation privée */ } };

  const MODES = { u2j: 'UML → Java', j2u: 'Java → UML', mix: 'Mélange' };
  const SERIES = 10;
  const L = 'ABCD';
  let run = null, keyFn = null;

  const inView = () => { const r = root.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  document.addEventListener('keydown', (e) => {
    if (!keyFn || !inView() || e.target.matches('input, textarea, select')) return;
    const p = document.getElementById('parcours-section');
    if (p && !p.hidden) { const r = p.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) return; }
    keyFn(e);
  });

  const codeEl = (sp) => h('pre', { class: 'uj-code' }, h('code', { html: hl(java(sp)) }));
  const umlEl = (sp, big) => h('div', { class: 'uj-uml' }, umlSvg(sp, big));

  function home() {
    keyFn = null;
    const best = (m) => (ST.best[m] != null ? h('span', { class: 'muted' }, ` · record ${ST.best[m]}/${SERIES}`) : null);
    put(root,
      h('p', {}, `${EX.length} situations tirées du cours et des TPs, dans les deux sens. Les mauvaises réponses reprennent les pièges du QCM : agrégation/composition, sens de la flèche, multiplicité, extends/implements, static, visibilité.`),
      h('div', { class: 'uj-modes' },
        Object.entries(MODES).map(([k, v]) => h('button', { class: 'btn' + (k === 'mix' ? '' : ' alt'), type: 'button', onclick: () => start(k) },
          k === 'u2j' ? '→ ' : k === 'j2u' ? '→ ' : '', v, best(k)))),
      h('p', { class: 'muted center' }, `Séries de ${SERIES} questions · ≈ 8 min · touches 1-4 pour répondre, Entrée pour continuer`),
      ST.miss.length ? h('p', { class: 'center' }, h('button', { class: 'btn alt', type: 'button', onclick: () => start('mix', ST.miss) }, `Refaire mes ${ST.miss.length} erreurs`)) : null);
  }

  function start(mode, onlyMiss) {
    const pool = onlyMiss ? onlyMiss.slice() : shuffle(EX.map((_, i) => i)).slice(0, SERIES);
    const items = pool.map((x) => {
      const [i, dir] = typeof x === 'string' ? [Number(x.split(':')[0]), x.split(':')[1]] : [x, mode === 'mix' ? (Math.random() < 0.5 ? 'u2j' : 'j2u') : mode];
      return { i, dir };
    });
    run = { mode, items, k: 0, ok: 0, missed: [], retry: !!onlyMiss };
    ask();
  }

  function ask() {
    const it = run.items[run.k];
    if (!it) return end();
    const ex = EX[it.i];
    const base = clone(ex);
    const opts = shuffle([{ sp: base, good: true }, ...ex.muts.map((m) => ({ sp: mutate(ex, m.ch), msg: m.msg }))]);
    const u2j = it.dir === 'u2j';
    const fb = h('div', { class: 'uj-fb', 'aria-live': 'polite' });
    let answered = false;
    const next = () => { run.k++; ask(); };
    const choose = (j) => {
      if (answered) return;
      answered = true;
      const o = opts[j];
      btns.forEach((b, x) => { b.disabled = true; if (opts[x].good) b.classList.add('right'); });
      if (o.good) run.ok++; else { btns[j].classList.add('wrong'); run.missed.push(`${it.i}:${it.dir}`); }
      put(fb,
        h('p', { class: o.good ? 'ok' : 'bad' }, o.good ? '✓ Exact !' : `✗ Non, la bonne réponse est ${L[opts.findIndex((x) => x.good)]}.`),
        !o.good ? h('p', { html: `<b>Ta réponse ${L[j]} :</b> ${o.msg}` }) : null,
        h('p', { html: `<b>Pourquoi :</b> ${ex.why}` }),
        h('button', { class: 'btn block', type: 'button', onclick: next }, run.k + 1 < run.items.length ? 'Suivant →' : 'Voir mon score →'));
      fb.querySelector('button').focus({ preventScroll: true });
      keyFn = (e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } };
    };
    const btns = opts.map((o, j) => h('button', { class: 'uj-opt', type: 'button', onclick: () => choose(j) },
      h('span', { class: 'uj-letter' }, L[j]), u2j ? codeEl(o.sp) : umlEl(o.sp)));
    const wide = !u2j && Math.max(...opts.map((o) => Number(btns[opts.indexOf(o)].querySelector('svg').dataset.w))) > 520;
    put(root,
      h('div', { class: 'top-line' },
        h('button', { class: 'linkish', type: 'button', onclick: home }, '← Modes'),
        h('span', { class: 'muted' }, `${run.retry ? 'Erreurs' : MODES[run.mode]} · ${run.k + 1}/${run.items.length} · ${run.ok} ✓`)),
      h('div', { class: 'bar' }, h('div', { style: `width:${Math.round((run.k / run.items.length) * 100)}%` })),
      h('h3', {}, u2j ? `Quel code Java correspond à ce diagramme ?` : `Quel diagramme UML correspond à ce code ?`, h('span', { class: 'muted uj-t' }, ` · ${ex.title}`)),
      h('div', { class: 'uj-q' }, u2j ? umlEl(base, true) : codeEl(base)),
      h('div', { class: 'uj-grid' + (u2j ? ' code' : wide ? ' one' : '') }, btns),
      fb);
    keyFn = (e) => { const j = '1234'.indexOf(e.key); if (j >= 0 && j < btns.length) { e.preventDefault(); choose(j); } };
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function end() {
    keyFn = null;
    const n = run.items.length, sc = run.ok;
    if (!run.retry && n === SERIES) ST.best[run.mode] = Math.max(ST.best[run.mode] || 0, sc);
    const done = new Set(run.items.map((x) => `${x.i}:${x.dir}`));
    ST.miss = [...new Set(ST.miss.filter((x) => !done.has(x)).concat(run.missed))];
    save();
    const pct = Math.round((sc / n) * 100);
    put(root,
      h('h3', {}, `Score : ${sc}/${n} (${pct} %)`),
      h('p', {}, pct === 100 ? 'Sans faute : tu traduis UML ↔ Java comme un pro. ' : pct >= 70 ? 'Solide. Refais tes erreurs pour verrouiller les derniers pièges.' : 'Relis le tableau « Trancher vite » et les 11 types d\'association, puis refais une série.'),
      run.missed.length ? h('ul', { class: 'pc-err' }, run.missed.map((x) => { const [i, d] = x.split(':'); return h('li', {}, `${EX[i].title} (${MODES[d]})`); })) : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn', type: 'button', onclick: () => start(run.mode === 'mix' || run.retry ? 'mix' : run.mode) }, '↻ Nouvelle série'),
        ST.miss.length ? h('button', { class: 'btn alt', type: 'button', onclick: () => start('mix', ST.miss) }, `Refaire mes ${ST.miss.length} erreurs`) : null,
        h('button', { class: 'btn alt', type: 'button', onclick: home }, 'Changer de mode')),
      h('p', { class: 'muted' }, h('a', { href: '#associations' }, 'Revoir les associations UML ↑')));
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  home();
})();
