// R3.05 Programmation système — données du parcours guidé (BUT2 · S3). Généré à partir de la banque GabouLearn.
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 [
  "F1",
  "fich",
  "Descripteurs ouverts par défaut dans un processus Unix",
  [
   "0 = entrée standard",
   "1 = sortie standard",
   "2 = sortie d'erreur",
   "3 = clavier"
  ],
  "ABC",
  "open() renvoie ensuite le plus petit descripteur libre (souvent 3)."
 ],
 [
  "F2",
  "fich",
  "Que contient un inode ?",
  [
   "les droits, le propriétaire, la taille, les dates",
   "les adresses des blocs de données",
   "le nom du fichier",
   "le chemin complet"
  ],
  "AB",
  "Le nom est stocké dans le répertoire (association nom → numéro d'inode)."
 ],
 [
  "F3",
  "fich",
  "read(fd, buf, n) renvoie…",
  [
   "le nombre d'octets effectivement lus",
   "0 en fin de fichier",
   "-1 en cas d'erreur (errno est positionné)",
   "toujours n"
  ],
  "ABC",
  "Il peut lire moins de n octets : on boucle tant que le résultat est > 0."
 ],
 [
  "F4",
  "fich",
  "Lien dur et lien symbolique",
  [
   "un lien dur partage le même inode que le fichier",
   "un lien symbolique a son propre inode et contient un chemin",
   "supprimer la cible casse un lien dur",
   "un lien dur peut viser un répertoire sans restriction"
  ],
  "AB",
  "Le fichier n'est supprimé que quand son compteur de liens durs tombe à 0. C'est le lien symbolique qui « casse »."
 ],
 [
  "F5",
  "fich",
  "Dans un Makefile, $@, $< et $^ désignent…",
  [
   "$@ = la cible",
   "$< = la première dépendance",
   "$^ = toutes les dépendances",
   "$@ = toutes les dépendances"
  ],
  "ABC",
  "Règle : cible: dépendances, puis une ligne de commande qui commence par une TABULATION."
 ],
 [
  "F6",
  "fich",
  "Quand make reconstruit-il une cible ?",
  [
   "quand elle n'existe pas",
   "quand une dépendance est plus récente qu'elle",
   "à chaque appel, toujours",
   "jamais si elle existe"
  ],
  "AB",
  "make compare les dates de modification. .PHONY déclare les cibles qui ne sont pas des fichiers (clean, all)."
 ],
 [
  "P1",
  "proc",
  "Valeur de retour de fork()",
  [
   "0 dans le fils",
   "le PID du fils dans le père",
   "-1 en cas d'échec",
   "le PID du père dans le fils"
  ],
  "ABC",
  "Le fils retrouve le PID de son père avec getppid()."
 ],
 [
  "P2",
  "proc",
  "Un processus zombie est…",
  [
   "un fils terminé dont le père n'a pas encore fait wait()",
   "un fils dont le père est mort",
   "un processus bloqué sur un read()",
   "un processus qui ignore SIGTERM"
  ],
  "A",
  "Un orphelin (père mort) est adopté par init/systemd (PID 1), qui fera le wait()."
 ],
 [
  "P3",
  "proc",
  "Après un appel réussi à execvp()…",
  [
   "le code du processus est remplacé par le nouveau programme",
   "le PID reste le même",
   "la fonction ne revient jamais",
   "un nouveau processus est créé"
  ],
  "ABC",
  "Créer = fork ; remplacer = exec. Les deux ensemble lancent une commande, comme le shell."
 ],
 [
  "P4",
  "proc",
  "Quels signaux ne peuvent être ni captés ni ignorés ?",
  [
   "SIGKILL (9)",
   "SIGSTOP",
   "SIGINT (2)",
   "SIGTERM (15)"
  ],
  "AB",
  "SIGINT = Ctrl+C, SIGTERM = signal par défaut de kill : on peut les intercepter avec sigaction()."
 ],
 [
  "P5",
  "proc",
  "kill(pid, sig) en C",
  [
   "pid > 0 : envoie sig au processus pid",
   "pid = 0 : à tout le groupe du processus appelant",
   "kill(pid, 0) teste si le processus existe sans rien lui envoyer",
   "tue forcément le processus"
  ],
  "ABC",
  "Malgré son nom, kill envoie n'importe quel signal. Un « wrapper » vérifie le retour -1 et affiche l'erreur avec perror()."
 ],
 [
  "P6",
  "proc",
  "Quel signal le père reçoit-il quand un de ses fils se termine ?",
  [
   "SIGCHLD",
   "SIGHUP",
   "SIGALRM",
   "SIGSEGV"
  ],
  "A",
  "Un gestionnaire de SIGCHLD qui fait waitpid(-1, …, WNOHANG) évite les zombies."
 ],
 [
  "K1",
  "sock",
  "Ordre des appels côté serveur TCP",
  [
   "socket → bind → listen → accept",
   "socket → connect → listen → accept",
   "bind → socket → accept → listen",
   "socket → accept → bind → listen"
  ],
  "A",
  "Côté client : socket → connect, puis read/write et close."
 ],
 [
  "K2",
  "sock",
  "accept() renvoie…",
  [
   "un nouveau descripteur dédié à ce client",
   "le descripteur d'écoute lui-même",
   "0 si tout va bien",
   "le numéro de port du client"
  ],
  "A",
  "La socket d'écoute reste ouverte pour les clients suivants : on lit/écrit sur la nouvelle."
 ],
 [
  "K3",
  "sock",
  "Pourquoi htons(port) ?",
  [
   "pour convertir le port dans l'ordre réseau (big-endian)",
   "pour chiffrer le port",
   "parce que le port est sur 32 bits",
   "pour résoudre un nom DNS"
  ],
  "A",
  "h-to-n-s : host to network, short (16 bits). htonl pour une adresse 32 bits (INADDR_ANY)."
 ],
 [
  "K4",
  "sock",
  "socket(AF_INET, SOCK_STREAM, 0) crée…",
  [
   "une socket TCP sur IPv4",
   "une socket UDP",
   "une socket IPv6",
   "un tube nommé"
  ],
  "A",
  "SOCK_DGRAM = UDP ; AF_INET6 = IPv6."
 ],
 [
  "K5",
  "sock",
  "Une requête HTTP/0.9…",
  [
   "tient en une ligne : GET /chemin",
   "n'a pas d'en-têtes",
   "commence par POST",
   "reçoit un code de statut 200"
  ],
  "AB",
  "Le serveur renvoie directement le document puis ferme la connexion : pas de statut, pas d'en-têtes."
 ],
 [
  "K6",
  "sock",
  "bind() échoue avec « Address already in use » au redémarrage du serveur. Que faire ?",
  [
   "activer SO_REUSEADDR avec setsockopt avant bind",
   "changer AF_INET en AF_UNIX",
   "appeler listen avant bind",
   "utiliser un port < 1024 sans être root"
  ],
  "A",
  "L'ancienne connexion est en TIME_WAIT. Les ports < 1024 demandent les droits root."
 ]
];
const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const STEPS = [
 {
  "id": "fich",
  "icon": "",
  "title": "Fichiers Unix et Makefiles",
  "min": 8,
  "anchor": "r305",
  "recap": [
   "Descripteurs : <b>0</b> stdin, <b>1</b> stdout, <b>2</b> stderr. <code>open</code> renvoie le plus petit libre, <b>-1</b> en cas d'erreur (errno, perror).",
   "<code>read</code> renvoie le nombre d'octets lus, <b>0 en fin de fichier</b>, -1 en erreur : on boucle tant que > 0.",
   "L'<b>inode</b> porte droits, propriétaire, taille, dates, blocs, <b>pas le nom</b>. Lien dur = même inode ; lien symbolique = son propre inode + un chemin.",
   "Makefile : <code>cible: dépendances</code> puis <b>TAB</b> commande. <b>$@</b> cible, <b>$&lt;</b> 1re dépendance, <b>$^</b> toutes. Reconstruit si une dépendance est plus récente. <code>.PHONY: clean all</code>."
  ],
  "cards": [
   [
    "read() renvoie 0 : que se passe-t-il ?",
    "Fin de fichier."
   ],
   [
    "$< dans un Makefile ?",
    "La première dépendance."
   ],
   [
    "Où est stocké le nom d'un fichier ?",
    "Dans le répertoire, pas dans l'inode."
   ]
  ],
  "qs": [
   "F1",
   "F2",
   "F3",
   "F4",
   "F5",
   "F6"
  ]
 },
 {
  "id": "proc",
  "icon": "",
  "title": "Processus et signaux",
  "min": 9,
  "star": true,
  "anchor": "r305",
  "recap": [
   "<code>fork()</code> : <b>0 dans le fils</b>, <b>PID du fils dans le père</b>, -1 si échec. Les deux reprennent juste après l'appel.",
   "<code>exec*</code> remplace le programme, garde le PID, <b>ne revient pas</b> si succès. <code>wait/waitpid</code> récupère le statut (WEXITSTATUS).",
   "<b>Zombie</b> = fils fini pas encore attendu. <b>Orphelin</b> = père mort, adopté par PID 1. <b>SIGCHLD</b> prévient le père.",
   "<code>kill(pid, sig)</code> envoie un signal (pid 0 = groupe ; sig 0 = test d'existence). <b>SIGKILL</b> et <b>SIGSTOP</b> ne s'interceptent pas. <code>sigaction</code> plutôt que <code>signal</code>."
  ],
  "cards": [
   [
    "fork() renvoie quoi au fils ?",
    "0"
   ],
   [
    "Deux signaux impossibles à capter ?",
    "SIGKILL et SIGSTOP."
   ],
   [
    "Zombie ?",
    "Fils terminé que le père n'a pas encore wait()."
   ]
  ],
  "qs": [
   "P1",
   "P2",
   "P3",
   "P4",
   "P5",
   "P6"
  ]
 },
 {
  "id": "sock",
  "icon": "",
  "title": "Sockets TCP en C",
  "min": 7,
  "anchor": "r305",
  "recap": [
   "Serveur : <b>socket → bind → listen → accept</b> → read/write → close. Client : <b>socket → connect</b> → read/write → close.",
   "<code>socket(AF_INET, SOCK_STREAM, 0)</code> = TCP/IPv4 (SOCK_DGRAM = UDP). Port en ordre réseau : <code>htons</code> ; adresse : <code>htonl(INADDR_ANY)</code>.",
   "<code>accept</code> renvoie une <b>nouvelle socket</b> par client ; la socket d'écoute reste ouverte.",
   "HTTP/0.9 : une ligne <code>GET /chemin</code>, le serveur renvoie le document et ferme. « Address already in use » → <code>SO_REUSEADDR</code>."
  ],
  "cards": [
   [
    "Les 4 appels du serveur TCP dans l'ordre ?",
    "socket, bind, listen, accept."
   ],
   [
    "htons ?",
    "Host to network short : ordre big-endian pour le port."
   ]
  ],
  "qs": [
   "K1",
   "K2",
   "K3",
   "K4",
   "K5",
   "K6"
  ]
 },
 {
  "id": "exam",
  "icon": "",
  "title": "Examen blanc",
  "min": 11,
  "exam": 15,
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
const data = { key: "r305", title: "R3.05 Programmation système", QUESTIONS, STEPS, tips: {"semaine":["Réécris à blanc un Makefile (variables, $@, $<, $^, .PHONY).","Réécris à blanc un wrapper de kill() qui teste le retour -1 et appelle perror().","Relis le code client/serveur HTTP 0.9 du CM sockets."],"qcm":["fork : 0 dans le fils, PID du fils dans le père.","SIGKILL et SIGSTOP ne se captent pas."]} };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
