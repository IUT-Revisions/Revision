// R3.07 SQL dans un langage de programmation — données du parcours guidé (BUT2 · S3). Généré à partir de la banque GabouLearn.
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 [
  "L3",
  "r307",
  "Un curseur sert à…",
  [
   "parcourir le résultat d'une requête ligne par ligne",
   "créer un index",
   "verrouiller la base",
   "remplacer une transaction"
  ],
  "A",
  "OPEN, FETCH dans une boucle, CLOSE. Ou plus simple : FOR rec IN SELECT … LOOP."
 ],
 [
  "L1",
  "r307",
  "Fonction de trigger en PL/pgSQL",
  [
   "elle renvoie le type TRIGGER",
   "elle accède aux lignes via NEW et OLD",
   "elle prend obligatoirement deux paramètres",
   "elle renvoie un SETOF"
  ],
  "AB",
  "CREATE FUNCTION f() RETURNS TRIGGER … puis CREATE TRIGGER … BEFORE/AFTER … FOR EACH ROW EXECUTE FUNCTION f()."
 ],
 [
  "L2",
  "r307",
  "Dans un trigger BEFORE … FOR EACH ROW, renvoyer NULL…",
  [
   "annule l'opération sur cette ligne",
   "insère une ligne vide",
   "n'a aucun effet",
   "supprime la table"
  ],
  "A",
  "On renvoie NEW (éventuellement modifiée) pour laisser passer l'insertion ou la mise à jour."
 ],
 [
  "L4",
  "r307",
  "Propriétés ACID d'une transaction",
  [
   "Atomicité",
   "Cohérence",
   "Isolation",
   "Durabilité"
  ],
  "ABCD",
  "Tout ou rien, base cohérente avant et après, transactions isolées, résultat durable après COMMIT."
 ],
 [
  "L5",
  "r307",
  "Un index…",
  [
   "accélère les recherches (WHERE, jointures)",
   "ralentit un peu les écritures",
   "accélère toujours tout",
   "remplace la clé primaire"
  ],
  "AB",
  "Il faut le mettre à jour à chaque INSERT/UPDATE/DELETE."
 ],
 [
  "L6",
  "r307",
  "Déclarer une fonction PL/pgSQL",
  [
   "CREATE OR REPLACE FUNCTION f(…) RETURNS type AS $$ … $$ LANGUAGE plpgsql",
   "DECLARE pour les variables, BEGIN … END pour le corps",
   "CREATE PROCEDURE est obligatoire",
   "LANGUAGE sql suffit pour utiliser IF et LOOP"
  ],
  "AB",
  "LANGUAGE sql n'a ni IF ni LOOP : il faut plpgsql."
 ],
 [
  "L7",
  "r307",
  "Lever une erreur métier en PL/pgSQL",
  [
   "RAISE EXCEPTION 'message'",
   "elle annule la transaction si personne ne l'attrape",
   "RAISE NOTICE bloque l'opération",
   "PRINT ERROR"
  ],
  "AB",
  "RAISE NOTICE affiche seulement un message. EXCEPTION WHEN … THEN attrape une erreur dans un bloc."
 ],
 [
  "L8",
  "r307",
  "Variable qui contient une ligne entière d'une table",
  [
   "v ma_table%ROWTYPE",
   "v RECORD",
   "v ma_table.col%TYPE",
   "v TEXT[]"
  ],
  "AB",
  "%TYPE = type d'une seule colonne. RECORD prend la forme de la ligne qu'on lui affecte."
 ],
 [
  "L9",
  "r307",
  "BEFORE ou AFTER ?",
  [
   "BEFORE peut modifier NEW avant l'écriture",
   "AFTER voit la ligne déjà écrite (journal, contrôles)",
   "AFTER peut encore modifier NEW",
   "BEFORE ne voit jamais NEW"
  ],
  "AB",
  "Valeur calculée ou correction : BEFORE. Historique : AFTER."
 ],
 [
  "L10",
  "r307",
  "Deux transactions modifient la même ligne en même temps",
  [
   "la seconde attend le verrou de la première",
   "le niveau d'isolation règle ce qu'une transaction voit des autres",
   "les deux écritures sont fusionnées",
   "la seconde est perdue sans erreur"
  ],
  "AB",
  "READ COMMITTED par défaut dans PostgreSQL ; SERIALIZABLE est le plus strict."
 ]
];
const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const STEPS = [
 {
  "id": "plpgsql",
  "icon": "",
  "title": "Fonctions et curseurs",
  "min": 6,
  "anchor": "fonctions",
  "recap": [
   "<code>CREATE OR REPLACE FUNCTION f(…) RETURNS type AS $$ DECLARE … BEGIN … END; $$ LANGUAGE plpgsql;</code>",
   "Variables : <code>%TYPE</code> (une colonne), <code>%ROWTYPE</code> (une ligne), RECORD.",
   "Curseur ou <code>FOR rec IN SELECT … LOOP</code> pour parcourir ligne par ligne. <code>RAISE EXCEPTION</code> pour une erreur métier."
  ],
  "cards": [
   [
    "%ROWTYPE ?",
    "Le type d'une ligne entière d'une table."
   ]
  ],
  "qs": [
   "L3",
   "L6",
   "L7",
   "L8"
  ]
 },
 {
  "id": "triggers",
  "icon": "",
  "title": "Triggers",
  "min": 6,
  "star": true,
  "anchor": "triggers",
  "recap": [
   "Fonction <code>RETURNS TRIGGER</code>, lignes via <b>NEW</b> (insert/update) et <b>OLD</b> (update/delete).",
   "<code>CREATE TRIGGER t BEFORE INSERT ON table FOR EACH ROW EXECUTE FUNCTION f();</code>",
   "BEFORE : peut modifier NEW, <code>RETURN NULL</code> annule la ligne. AFTER : la ligne est écrite (journal, contrôles)."
  ],
  "cards": [
   [
    "BEFORE + RETURN NULL ?",
    "La ligne n'est pas écrite."
   ]
  ],
  "qs": [
   "L1",
   "L2",
   "L9"
  ]
 },
 {
  "id": "transac",
  "icon": "",
  "title": "Transactions et index",
  "min": 5,
  "anchor": "transactions",
  "recap": [
   "ACID : Atomicité, Cohérence, Isolation, Durabilité. BEGIN … COMMIT / ROLLBACK.",
   "Accès concurrent : verrous, niveaux d'isolation (READ COMMITTED par défaut, SERIALIZABLE le plus strict).",
   "Index : lectures plus rapides, écritures un peu plus lentes."
  ],
  "cards": [
   [
    "A de ACID ?",
    "Atomicité : tout ou rien."
   ]
  ],
  "qs": [
   "L4",
   "L5",
   "L10"
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
const data = { key: "r307", title: "R3.07 SQL dans un langage de programmation", QUESTIONS, STEPS, tips: {"semaine":["Refais les exercices en ligne AMeTICE jusqu'à 20 : ils sont recommençables.","Écris de tête un trigger BEFORE qui refuse une ligne invalide."],"qcm":["Trigger : demande-toi BEFORE ou AFTER, et ce que vaut NEW / OLD pour l'opération."]} };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
