// S3 parcours B — données du parcours guidé (ressources R3.xx + cours Réseaux BUT2).
// Sources : programme national BUT Informatique 2022 (fiches R3.01 à R3.14), plans des cours AMeTICE de l'IUT d'Aix,
// QCM d'entraînement IPv6 et tests de contrôle continu R3.09 (pièges les plus fréquents).
// Format d'une question : [id, chapitre, énoncé, [propositions A, B, C, D], bonnes réponses (lettres), explication]
// Plusieurs bonnes réponses possibles. L'ordre est mélangé à l'affichage.
(function (root) {
'use strict';

const RAW = [
  // ---------------------------------------------------------------- Organisation du S3
  ['O1', 'org', 'Au S3 (parcours B, IUT d\'Aix), quelle part du coefficient de chaque UE vient de la SAÉ et de l\'alternance ?', ['environ 40 à 46 %', 'environ 10 %', 'aucune : seules les ressources comptent', '100 %'], 'A', 'SAÉ 3.B.01 : coef 10 à 20 ; alternance : coef 10 à 26 selon l\'UE. C\'est le plus gros levier du semestre.'],
  ['O2', 'org', 'Quelle ressource pèse le plus dans l\'UE3.1B Réaliser (hors SAÉ et alternance) ?', ['R3.04 Qualité de développement (coef 16)', 'R3.14 PPP (coef 1)', 'R3.13 Communication (coef 3)', 'R3.11 Droit (coef 3)'], 'A', 'R3.04 coef 16, puis R3.02 et R3.03 (12 chacune), R3.01 (10).'],
  ['O3', 'org', 'Pour un dossier d\'école d\'ingénieur en Informatique & Réseaux, quelles ressources du S3 le jury regarde-t-il en premier ?', ['R3.05 Programmation système', 'R3.06 Architecture des réseaux', 'R3.09 Cryptographie et sécurité', 'R3.13 Communication'], 'ABC', 'Ce sont les ressources « cœur » d\'une spécialité réseau. Vise 16-17 dessus.'],

  // ---------------------------------------------------------------- Réseaux : DHCP
  ['D1', 'dhcp', 'Dans quel ordre se déroule l\'échange DHCP (DORA) ?', ['Discover → Offer → Request → Ack', 'Request → Offer → Discover → Ack', 'Discover → Request → Offer → Ack', 'Offer → Discover → Ack → Request'], 'A', 'D-O-R-A : le client cherche, le serveur propose, le client demande, le serveur confirme.'],
  ['D2', 'dhcp', 'Quels ports utilise DHCP (IPv4) ?', ['UDP 67 côté serveur', 'UDP 68 côté client', 'TCP 53', 'TCP 80'], 'AB', 'DHCP est sur UDP. 53 = DNS, 80 = HTTP.'],
  ['D3', 'dhcp', 'Le premier message DHCPDISCOVER est envoyé…', ['en broadcast vers 255.255.255.255', 'avec l\'adresse source 0.0.0.0', 'en unicast vers le serveur DHCP', 'en multicast ff02::1:2'], 'AB', 'Le client n\'a pas encore d\'adresse et ne connaît pas le serveur. ff02::1:2 = DHCPv6.'],
  ['D4', 'dhcp', 'Le serveur DHCP est dans un autre réseau que les clients. Que faut-il ?', ['un agent relais DHCP sur le routeur (ip helper-address sur Cisco)', 'rien : le broadcast traverse les routeurs', 'un deuxième serveur DNS', 'désactiver le NAT'], 'A', 'Un routeur ne relaie pas les broadcasts. Le relais transforme le Discover en unicast vers le serveur.'],
  ['D5', 'dhcp', 'Sur un routeur Cisco, à quoi sert « ip dhcp excluded-address 192.168.1.1 192.168.1.10 » ?', ['réserver ces adresses (passerelle, serveurs) pour qu\'elles ne soient jamais distribuées', 'interdire à ces machines d\'utiliser DHCP', 'créer le pool DHCP', 'activer le NAT'], 'A', 'On exclut d\'abord les adresses fixes, puis on crée le pool (ip dhcp pool, network, default-router, dns-server).'],
  ['D6', 'dhcp', 'Un bail (lease) DHCP…', ['a une durée limitée', 'est renouvelé par le client, en général à 50 % de sa durée (T1)', 'est définitif une fois attribué', 'est renouvelé par le serveur sans que le client ne demande rien'], 'AB', 'Le client renouvelle en unicast à T1 (50 %), puis en broadcast à T2 (87,5 %).'],

  // ---------------------------------------------------------------- Réseaux : NAT
  ['A1', 'nat', 'Quelles plages sont privées (RFC 1918) ?', ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '169.254.0.0/16'], 'ABC', '169.254.0.0/16 = APIPA (adresse locale de lien quand DHCP échoue), pas une plage RFC 1918.'],
  ['A2', 'nat', 'Le PAT (NAT overload)…', ['fait sortir plusieurs hôtes privés derrière une seule adresse publique', 'distingue les connexions grâce aux numéros de port', 'associe une adresse publique fixe à chaque hôte', 'ne fonctionne qu\'en IPv6'], 'AB', 'NAT statique = 1 pour 1 ; NAT dynamique = pool d\'adresses publiques ; PAT = plusieurs vers une, par les ports.'],
  ['A3', 'nat', 'Vocabulaire Cisco : l\'adresse publique qui représente un hôte interne vu d\'Internet est…', ['inside global', 'inside local', 'outside local', 'outside global'], 'A', 'Inside local = adresse privée de l\'hôte ; inside global = son adresse traduite (publique).'],
  ['A4', 'nat', 'Pour publier un serveur web interne (192.168.1.10) sur l\'adresse publique du routeur, on utilise…', ['une traduction statique (redirection de port)', 'un pool NAT dynamique', 'un relais DHCP', 'une route par défaut seulement'], 'A', 'Ex. : ip nat inside source static tcp 192.168.1.10 80 <IP publique> 80.'],
  ['A5', 'nat', 'Configuration NAT Cisco : qu\'est-ce qui est indispensable ?', ['marquer les interfaces avec ip nat inside / ip nat outside', 'une ACL (ou un pool) qui désigne les adresses à traduire', 'un serveur DHCP', 'IPv6 activé'], 'AB', 'Sans « inside/outside » sur les interfaces, la règle NAT ne s\'applique jamais.'],

  // ---------------------------------------------------------------- Réseaux : IPv6 adressage
  ['V1', 'ipv6a', 'Une adresse IPv6 tient sur…', ['128 bits', '8 groupes de 16 bits', '64 bits', '32 bits'], 'AB', '8 groupes de 4 chiffres hexadécimaux, séparés par « : ».'],
  ['V2', 'ipv6a', 'Forme complète de 2007:A8::75C:357:49C3 ?', ['2007:A8:0:0:0:75C:357:49C3', '2007:A8::0:0:0:75C:357:49C3', '2007:A8:0:0:75C:357:49C3', '2007:0A80:0:0:0:75C:357:49C3'], 'A', '5 groupes écrits, il en faut 8 : « :: » remplace 3 groupes de 0. Le « :: » disparaît dans la forme complète (piège du QCM d\'entraînement).'],
  ['V3', 'ipv6a', 'Règles de compression d\'une adresse IPv6', ['on peut supprimer les 0 en tête de chaque groupe', '« :: » remplace une suite de groupes à 0, une seule fois par adresse', '« :: » peut apparaître deux fois', 'on peut supprimer les 0 en fin de groupe'], 'AB', '0db8 → db8, mais 2a00 ne devient jamais 2a. Deux « :: » rendraient l\'adresse ambiguë.'],
  ['V4', 'ipv6a', 'Associer le préfixe à son type : fe80::917:57:224', ['lien local (fe80::/10)', 'globale (2000::/3)', 'multicast (ff00::/8)', 'locale unique (fc00::/7)'], 'A', 'Une adresse de lien local existe sur chaque interface IPv6 et ne passe pas les routeurs.'],
  ['V5', 'ipv6a', 'fd02:1537:81:910::127 est une adresse…', ['locale unique (ULA, fc00::/7)', 'de lien local', 'globale', 'multicast'], 'A', 'fd… = ULA, l\'équivalent des adresses privées IPv4. ff15::1234 = multicast, 2a00:1450:… = globale.'],
  ['V6', 'ipv6a', 'MAC 84:2b:2b:a0:59:f5 : identifiant d\'interface en EUI-64 modifié ?', ['862b:2bff:fea0:59f5', '842b:2bff:fea0:59f5', '842b:2bfe:ffa0:59f5', '862b:2bfe:ffa0:59f5'], 'A', 'On coupe la MAC en deux, on insère FF:FE au milieu et on inverse le 7e bit du premier octet : 84 → 86.'],
  ['V7', 'ipv6a', 'Qu\'est-ce qui n\'existe plus en IPv6 ?', ['le broadcast', 'ARP (remplacé par NDP)', 'le multicast', 'les adresses de lien local'], 'AB', 'Le broadcast est remplacé par le multicast (ff02::1 = tous les nœuds, ff02::2 = tous les routeurs).'],

  // ---------------------------------------------------------------- Réseaux : IPv6 configuration
  ['W1', 'ipv6b', 'Les messages ICMPv6 RS, RA, NS et NA font partie de…', ['NDP (Neighbor Discovery Protocol)', 'DHCPv6', 'ARP', 'OSPFv3'], 'A', 'RS/RA : dialogue hôte ↔ routeur. NS/NA : dialogue entre voisins (résolution d\'adresse, DAD).'],
  ['W2', 'ipv6b', 'SLAAC (autoconfiguration sans état) utilise…', ['uniquement un routeur, qui annonce le préfixe dans un RA', 'uniquement un serveur DHCPv6', 'un routeur et un serveur DHCPv6 obligatoirement', 'un serveur DNS'], 'A', 'Piège du QCM d\'entraînement : en SLAAC pur, aucun serveur DHCP. L\'hôte construit son adresse à partir du préfixe du RA.'],
  ['W3', 'ipv6b', 'En SLAAC + DHCPv6 sans état, le serveur DHCPv6 fournit…', ['les serveurs DNS (et le nom de domaine)', 'l\'adresse IPv6 de l\'hôte', 'la passerelle par défaut', 'le préfixe du lien'], 'A', 'L\'adresse vient de SLAAC, la passerelle vient toujours du RA (l\'adresse lien local du routeur). DHCPv6 ne donne jamais de passerelle.'],
  ['W4', 'ipv6b', 'Associer : NS sert à…', ['vérifier si un voisin utilise déjà une adresse (DAD) ou trouver sa MAC', 'annoncer le préfixe du réseau', 'demander au routeur de s\'annoncer', 'répondre « c\'est moi qui ai cette adresse »'], 'A', 'RS = demande au routeur ; RA = le routeur annonce le préfixe ; NS = sollicitation de voisin ; NA = « je porte cette adresse ».'],
  ['W5', 'ipv6b', 'La procédure DAD (Duplicate Address Detection) sert à…', ['vérifier qu\'une adresse n\'est pas déjà utilisée sur le lien local', 'détecter les doublons de route', 'distribuer les adresses DNS', 'chiffrer les échanges'], 'A', 'Avant d\'utiliser une adresse, l\'hôte envoie un NS pour elle-même : s\'il reçoit un NA, l\'adresse est prise.'],
  ['W6', 'ipv6b', 'Drapeaux d\'un RA : M = 1 signifie…', ['DHCPv6 avec état : l\'adresse est donnée par le serveur', 'SLAAC seul', 'il faut demander les DNS uniquement', 'le routeur n\'est pas une passerelle'], 'A', 'M (Managed) = 1 : DHCPv6 avec état. O (Other) = 1 avec M = 0 : SLAAC + DHCPv6 sans état.'],

  // ---------------------------------------------------------------- R3.05 : fichiers et makefiles
  ['F1', 'fich', 'Descripteurs ouverts par défaut dans un processus Unix', ['0 = entrée standard', '1 = sortie standard', '2 = sortie d\'erreur', '3 = clavier'], 'ABC', 'open() renvoie ensuite le plus petit descripteur libre (souvent 3).'],
  ['F2', 'fich', 'Que contient un inode ?', ['les droits, le propriétaire, la taille, les dates', 'les adresses des blocs de données', 'le nom du fichier', 'le chemin complet'], 'AB', 'Le nom est stocké dans le répertoire (association nom → numéro d\'inode).'],
  ['F3', 'fich', 'read(fd, buf, n) renvoie…', ['le nombre d\'octets effectivement lus', '0 en fin de fichier', '-1 en cas d\'erreur (errno est positionné)', 'toujours n'], 'ABC', 'Il peut lire moins de n octets : on boucle tant que le résultat est > 0.'],
  ['F4', 'fich', 'Lien dur et lien symbolique', ['un lien dur partage le même inode que le fichier', 'un lien symbolique a son propre inode et contient un chemin', 'supprimer la cible casse un lien dur', 'un lien dur peut viser un répertoire sans restriction'], 'AB', 'Le fichier n\'est supprimé que quand son compteur de liens durs tombe à 0. C\'est le lien symbolique qui « casse ».'],
  ['F5', 'fich', 'Dans un Makefile, $@, $< et $^ désignent…', ['$@ = la cible', '$< = la première dépendance', '$^ = toutes les dépendances', '$@ = toutes les dépendances'], 'ABC', 'Règle : cible: dépendances, puis une ligne de commande qui commence par une TABULATION.'],
  ['F6', 'fich', 'Quand make reconstruit-il une cible ?', ['quand elle n\'existe pas', 'quand une dépendance est plus récente qu\'elle', 'à chaque appel, toujours', 'jamais si elle existe'], 'AB', 'make compare les dates de modification. .PHONY déclare les cibles qui ne sont pas des fichiers (clean, all).'],

  // ---------------------------------------------------------------- R3.05 : processus et signaux
  ['P1', 'proc', 'Valeur de retour de fork()', ['0 dans le fils', 'le PID du fils dans le père', '-1 en cas d\'échec', 'le PID du père dans le fils'], 'ABC', 'Le fils retrouve le PID de son père avec getppid().'],
  ['P2', 'proc', 'Un processus zombie est…', ['un fils terminé dont le père n\'a pas encore fait wait()', 'un fils dont le père est mort', 'un processus bloqué sur un read()', 'un processus qui ignore SIGTERM'], 'A', 'Un orphelin (père mort) est adopté par init/systemd (PID 1), qui fera le wait().'],
  ['P3', 'proc', 'Après un appel réussi à execvp()…', ['le code du processus est remplacé par le nouveau programme', 'le PID reste le même', 'la fonction ne revient jamais', 'un nouveau processus est créé'], 'ABC', 'Créer = fork ; remplacer = exec. Les deux ensemble lancent une commande, comme le shell.'],
  ['P4', 'proc', 'Quels signaux ne peuvent être ni captés ni ignorés ?', ['SIGKILL (9)', 'SIGSTOP', 'SIGINT (2)', 'SIGTERM (15)'], 'AB', 'SIGINT = Ctrl+C, SIGTERM = signal par défaut de kill : on peut les intercepter avec sigaction().'],
  ['P5', 'proc', 'kill(pid, sig) en C', ['pid > 0 : envoie sig au processus pid', 'pid = 0 : à tout le groupe du processus appelant', 'kill(pid, 0) teste si le processus existe sans rien lui envoyer', 'tue forcément le processus'], 'ABC', 'Malgré son nom, kill envoie n\'importe quel signal. Un « wrapper » vérifie le retour -1 et affiche l\'erreur avec perror().'],
  ['P6', 'proc', 'Quel signal le père reçoit-il quand un de ses fils se termine ?', ['SIGCHLD', 'SIGHUP', 'SIGALRM', 'SIGSEGV'], 'A', 'Un gestionnaire de SIGCHLD qui fait waitpid(-1, …, WNOHANG) évite les zombies.'],

  // ---------------------------------------------------------------- R3.05 : sockets TCP en C
  ['K1', 'sock', 'Ordre des appels côté serveur TCP', ['socket → bind → listen → accept', 'socket → connect → listen → accept', 'bind → socket → accept → listen', 'socket → accept → bind → listen'], 'A', 'Côté client : socket → connect, puis read/write et close.'],
  ['K2', 'sock', 'accept() renvoie…', ['un nouveau descripteur dédié à ce client', 'le descripteur d\'écoute lui-même', '0 si tout va bien', 'le numéro de port du client'], 'A', 'La socket d\'écoute reste ouverte pour les clients suivants : on lit/écrit sur la nouvelle.'],
  ['K3', 'sock', 'Pourquoi htons(port) ?', ['pour convertir le port dans l\'ordre réseau (big-endian)', 'pour chiffrer le port', 'parce que le port est sur 32 bits', 'pour résoudre un nom DNS'], 'A', 'h-to-n-s : host to network, short (16 bits). htonl pour une adresse 32 bits (INADDR_ANY).'],
  ['K4', 'sock', 'socket(AF_INET, SOCK_STREAM, 0) crée…', ['une socket TCP sur IPv4', 'une socket UDP', 'une socket IPv6', 'un tube nommé'], 'A', 'SOCK_DGRAM = UDP ; AF_INET6 = IPv6.'],
  ['K5', 'sock', 'Une requête HTTP/0.9…', ['tient en une ligne : GET /chemin', 'n\'a pas d\'en-têtes', 'commence par POST', 'reçoit un code de statut 200'], 'AB', 'Le serveur renvoie directement le document puis ferme la connexion : pas de statut, pas d\'en-têtes.'],
  ['K6', 'sock', 'bind() échoue avec « Address already in use » au redémarrage du serveur. Que faire ?', ['activer SO_REUSEADDR avec setsockopt avant bind', 'changer AF_INET en AF_UNIX', 'appeler listen avant bind', 'utiliser un port < 1024 sans être root'], 'A', 'L\'ancienne connexion est en TIME_WAIT. Les ports < 1024 demandent les droits root.'],

  // ---------------------------------------------------------------- R3.09 : arithmétique
  ['C1', 'arith', 'PGCD(640, 520) ?', ['40', '20', '80', '120'], 'A', 'Euclide : 640 = 1×520 + 120 ; 520 = 4×120 + 40 ; 120 = 3×40 + 0.'],
  ['C2', 'arith', 'Reste de 7^2021 dans la division par 5 ?', ['2', '1', '3', '4'], 'A', '7 ≡ 2 (mod 5) et 2⁴ ≡ 1. 2021 = 4×505 + 1, donc 7^2021 ≡ 2¹ = 2.'],
  ['C3', 'arith', 'Si a ≡ 5 (mod 7), alors 2a ≡ … (mod 7)', ['3', '10', '5', '2'], 'A', '2a ≡ 10 ≡ 3 (mod 7). On réduit toujours entre 0 et n − 1.'],
  ['C4', 'arith', 'Inverse de 3 modulo 7 ?', ['5', '3', '2', 'il n\'existe pas'], 'A', '3 × 5 = 15 = 2×7 + 1. Un inverse modulo n existe si et seulement si PGCD(a, n) = 1.'],
  ['C5', 'arith', 'Petit théorème de Fermat : p premier, a non multiple de p…', ['a^(p−1) ≡ 1 (mod p)', 'a^p ≡ a (mod p)', 'a^p ≡ 0 (mod p)', 'a^(p+1) ≡ 1 (mod p)'], 'AB', 'C\'est l\'outil pour réduire les grandes puissances (et la base de RSA avec φ(n)).'],
  ['C6', 'arith', '37 et 154 sont-ils premiers entre eux ?', ['oui', 'non, ils sont divisibles par 7', 'non, ils sont divisibles par 2', 'on ne peut pas savoir sans calculatrice'], 'A', '154 = 2 × 7 × 11 et 37 est premier : PGCD = 1.'],

  // ---------------------------------------------------------------- R3.09 : chiffrements classiques
  ['S1', 'sym', 'Chiffrer CHAT par substitution (décalage) de clé 12 ?', ['OTMF', 'OTNF', 'NSLE', 'PUNG'], 'A', 'C(2)+12 = 14 → O ; H(7)+12 = 19 → T ; A(0)+12 = 12 → M ; T(19)+12 = 31 ≡ 5 → F.'],
  ['S2', 'sym', 'Déchiffrer un décalage de clé k', ['x = (y − k) mod 26', 'x = (y + k) mod 26', 'x = (y × k) mod 26', 'x = y − k sans modulo'], 'A', 'Le modulo évite les valeurs négatives : (2 − 10) mod 26 = 18.'],
  ['S3', 'sym', 'Pourquoi César est-il faible ?', ['seulement 25 clés utiles : on les essaie toutes', 'l\'analyse de fréquences le casse aussi', 'il utilise une clé publique', 'il est trop lent'], 'AB', 'Une substitution quelconque a 26! clés, mais reste cassée par l\'analyse de fréquences (E le plus fréquent en français).'],
  ['S4', 'sym', 'Chiffrement par permutation avec une grille et une clé (ex. TIRE)', ['on écrit le message ligne par ligne dans la grille', 'on lit les colonnes dans l\'ordre alphabétique des lettres de la clé', 'on lit les lignes dans l\'ordre de la clé', 'on décale chaque lettre de la valeur de la clé'], 'AB', 'TIRE → ordre E, I, R, T = colonnes 4, 2, 3, 1. Pour déchiffrer : découper le message en colonnes de la hauteur de la grille et les remettre à leur place.'],
  ['S5', 'sym', 'RENDEZ VOUS CHEZ MOI, grille 5×4, espaces = 0, clé TIRE. Message chiffré ?', ['DV0ZIEZUHMN0SEOREOC0', 'REOC0EZUHMN0SEODV0ZI', 'RENDEZ0VOUS0CHEZ0MOI', 'DV0ZIN0SEOEZUHMREOC0'], 'A', 'Colonne E (4e) : DV0ZI ; I (2e) : EZUHM ; R (3e) : N0SEO ; T (1re) : REOC0.'],
  ['S6', 'sym', 'Vigenère', ['est polyalphabétique : une même lettre claire peut donner plusieurs lettres chiffrées', 'répète la clé sur toute la longueur du message', 'se casse en trouvant la longueur de la clé (Kasiski, indice de coïncidence)', 'est un chiffrement asymétrique'], 'ABC', 'Une fois la longueur L trouvée, ce sont L chiffrements de César à casser par analyse de fréquences.'],

  // ---------------------------------------------------------------- R3.09 : asymétrique et codes
  ['R1', 'asym', 'RSA : p = 3, q = 11, e = 3. Que valent n, φ(n) et d ?', ['n = 33, φ(n) = 20, d = 7', 'n = 33, φ(n) = 32, d = 11', 'n = 14, φ(n) = 20, d = 7', 'n = 33, φ(n) = 20, d = 3'], 'A', 'φ = (p−1)(q−1) = 20 ; d = e⁻¹ mod 20 : 3 × 7 = 21 ≡ 1.'],
  ['R2', 'asym', 'Toujours avec n = 33 et e = 3 : chiffrement de m = 4 ?', ['31', '12', '64', '4'], 'A', 'c = 4³ mod 33 = 64 − 33 = 31. Vérification : 31⁷ mod 33 = 4.'],
  ['R3', 'asym', 'Dans RSA, qu\'est-ce qui est public ?', ['n', 'e', 'd', 'p et q'], 'AB', 'Clé publique (n, e), clé privée d. Connaître p et q permet de calculer φ(n), donc d.'],
  ['R4', 'asym', 'Diffie-Hellman : p = 23, g = 5, secret a = 6. Valeur envoyée A = g^a mod p ?', ['8', '6', '30', '15'], 'A', '5² = 25 ≡ 2 ; 5⁶ = (5²)³ ≡ 2³ = 8 (mod 23).'],
  ['R5', 'asym', 'Faiblesse de Diffie-Hellman « nu » ?', ['l\'attaque de l\'homme du milieu (pas d\'authentification)', 'il faut s\'échanger la clé secrète en clair', 'il ne marche qu\'avec RSA', 'p doit rester secret'], 'A', 'p et g sont publics. On authentifie les échanges (signatures, certificats) pour bloquer le MitM.'],
  ['R6', 'asym', 'Code de Hamming (7,4)', ['4 bits de données, 3 bits de contrôle', 'corrige 1 erreur', 'détecte 2 erreurs', 'corrige 2 erreurs'], 'ABC', 'Distance minimale 3. Un simple bit de parité détecte un nombre impair d\'erreurs mais ne corrige rien.'],

  // ---------------------------------------------------------------- R3.04 Qualité de développement
  ['Q1', 'r304', 'Le « D » de SOLID', ['Dependency inversion : dépendre d\'abstractions, pas d\'implémentations', 'Don\'t repeat yourself', 'Documentation', 'Decorator'], 'A', 'S responsabilité unique, O ouvert/fermé, L substitution de Liskov, I ségrégation des interfaces, D inversion des dépendances.'],
  ['Q2', 'r304', 'Les 3 familles de patrons de conception du GoF', ['création', 'structure', 'comportement', 'persistance'], 'ABC', 'Création : Singleton, Fabrique, Builder… Structure : Adaptateur, Décorateur, Composite, Façade, Proxy… Comportement : Observateur, Stratégie, Commande, État, Itérateur…'],
  ['Q3', 'r304', 'Quel patron notifie automatiquement des abonnés quand un objet change ?', ['Observateur', 'Singleton', 'Adaptateur', 'Fabrique'], 'A', 'Sujet + liste d\'observateurs, méthode notifier(). Base des écouteurs d\'événements.'],
  ['Q4', 'r304', 'Quel patron rend des algorithmes interchangeables à l\'exécution ?', ['Stratégie', 'Décorateur', 'Composite', 'Builder'], 'A', 'Une interface Stratégie, plusieurs implémentations, injectées dans le contexte.'],
  ['Q5', 'r304', 'Le refactoring (restructuration de code)…', ['change la structure du code sans changer son comportement', 'se fait sous la protection de tests', 'ajoute des fonctionnalités', 'est réservé à la fin du projet'], 'AB', 'Petites étapes, tests verts entre chaque étape.'],
  ['Q6', 'r304', 'Objectifs d\'une bonne architecture', ['couplage faible', 'cohésion forte', 'couplage fort', 'classes « Dieu » qui font tout'], 'AB', 'Modules indépendants et centrés sur une seule responsabilité.'],

  // ---------------------------------------------------------------- R3.01 Développement web
  ['H1', 'r301', 'Meilleure protection contre l\'injection SQL', ['les requêtes préparées (paramètres liés)', 'concaténer les saisies après un trim()', 'cacher les messages d\'erreur', 'passer en POST'], 'A', 'La requête et les données voyagent séparément : la saisie ne peut pas devenir du SQL.'],
  ['H2', 'r301', 'Contre le XSS, il faut…', ['échapper les données à l\'affichage (htmlspecialchars en PHP)', 'filtrer et valider les saisies', 'stocker les mots de passe en MD5', 'désactiver les cookies'], 'AB', 'XSS = injection de script dans la page. On échappe en sortie, on valide en entrée.'],
  ['H3', 'r301', 'Stocker un mot de passe', ['password_hash() (bcrypt/argon2, sel inclus)', 'vérifier avec password_verify()', 'MD5 ou SHA-1 simples', 'en clair dans une colonne protégée'], 'AB', 'Un hachage rapide sans sel se casse avec des tables précalculées.'],
  ['H4', 'r301', 'Une session PHP', ['stocke les données côté serveur', 'identifie le client par un cookie (PHPSESSID)', 'stocke tout dans le cookie du client', 'rend HTTP « avec état » par nature'], 'AB', 'HTTP reste sans état : la session est une mémoire côté serveur, retrouvée grâce à l\'identifiant du cookie.'],
  ['H5', 'r301', 'Dans MVC, le contrôleur…', ['reçoit la requête et orchestre modèle et vue', 'contient l\'accès aux données', 'génère le HTML', 'est le fichier CSS'], 'A', 'Modèle = données et règles métier ; Vue = affichage ; Contrôleur = chef d\'orchestre.'],

  // ---------------------------------------------------------------- R3.07 SQL dans un langage
  ['L1', 'r307', 'Fonction de trigger en PL/pgSQL', ['elle renvoie le type TRIGGER', 'elle accède aux lignes via NEW et OLD', 'elle prend obligatoirement deux paramètres', 'elle renvoie un SETOF'], 'AB', 'CREATE FUNCTION f() RETURNS TRIGGER … puis CREATE TRIGGER … BEFORE/AFTER … FOR EACH ROW EXECUTE FUNCTION f().'],
  ['L2', 'r307', 'Dans un trigger BEFORE … FOR EACH ROW, renvoyer NULL…', ['annule l\'opération sur cette ligne', 'insère une ligne vide', 'n\'a aucun effet', 'supprime la table'], 'A', 'On renvoie NEW (éventuellement modifiée) pour laisser passer l\'insertion ou la mise à jour.'],
  ['L3', 'r307', 'Un curseur sert à…', ['parcourir le résultat d\'une requête ligne par ligne', 'créer un index', 'verrouiller la base', 'remplacer une transaction'], 'A', 'OPEN, FETCH dans une boucle, CLOSE. Ou plus simple : FOR rec IN SELECT … LOOP.'],
  ['L4', 'r307', 'Propriétés ACID d\'une transaction', ['Atomicité', 'Cohérence', 'Isolation', 'Durabilité'], 'ABCD', 'Tout ou rien, base cohérente avant et après, transactions isolées, résultat durable après COMMIT.'],
  ['L5', 'r307', 'Un index…', ['accélère les recherches (WHERE, jointures)', 'ralentit un peu les écritures', 'accélère toujours tout', 'remplace la clé primaire'], 'AB', 'Il faut le mettre à jour à chaque INSERT/UPDATE/DELETE.'],

  // ---------------------------------------------------------------- R3.08 Probabilités
  ['B1', 'r308', 'P(A | B) = ?', ['P(A ∩ B) / P(B)', 'P(A) × P(B)', 'P(B | A)', 'P(A) + P(B)'], 'A', 'Bayes : P(A | B) = P(B | A) P(A) / P(B).'],
  ['B2', 'r308', 'A et B sont indépendants si…', ['P(A ∩ B) = P(A) × P(B)', 'P(A | B) = P(A)', 'A ∩ B = ∅', 'P(A) = P(B)'], 'AB', 'Piège : des événements incompatibles (A ∩ B = ∅) de probabilités non nulles ne sont jamais indépendants.'],
  ['B3', 'r308', 'X suit une loi binomiale B(n, p)', ['E(X) = np', 'V(X) = np(1 − p)', 'E(X) = p', 'V(X) = np'], 'AB', 'n épreuves de Bernoulli indépendantes de même paramètre p.'],
  ['B4', 'r308', 'Loi de Poisson de paramètre λ', ['E(X) = λ', 'V(X) = λ', 'V(X) = λ²', 'E(X) = 1/λ'], 'AB', '1/λ = espérance de la loi exponentielle (continue).'],
  ['B5', 'r308', 'Loi normale : proportion des valeurs dans [μ − 2σ ; μ + 2σ] ?', ['≈ 95 %', '≈ 68 %', '≈ 99,7 %', '50 %'], 'A', 'Règle 68 – 95 – 99,7 pour 1, 2 et 3 écarts-types.'],
  ['B6', 'r308', 'Le théorème central limite dit que…', ['la somme (ou la moyenne) de nombreuses variables indépendantes de même loi suit à peu près une loi normale', 'toute variable aléatoire est normale', 'la moyenne converge vers 0', 'la variance est toujours 1'], 'A', 'D\'où l\'usage de la loi normale pour les intervalles de confiance.'],
];

const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const byCh = (...chs) => QUESTIONS.filter((x) => chs.includes(x.ch)).map((x) => x.id);

// ---------------------------------------------------------------- Le parcours
const STEPS = [
  {
    id: 'carte', icon: '🗺️', title: 'La carte du S3 : où sont les points', min: 4, anchor: 'cibles',
    recap: [
      '<b>6 UE</b> : Réaliser, Optimiser, Administrer, Gérer (6 ECTS chacune), Conduire et Collaborer (3 ECTS). Chaque UE est une moyenne pondérée de ressources + SAÉ + alternance.',
      '<b>SAÉ + alternance = 40 à 46 % de chaque UE.</b> Un rendu de SAÉ raté coûte plus cher qu\'un examen raté.',
      'Les plus gros coefficients en ressources : <b>R3.04</b> (16 dans Réaliser), <b>R3.09</b> (14 dans Administrer), <b>R3.07</b> (14 dans Gérer), <b>R3.02 / R3.03</b> (12).',
      'Pour un dossier d\'école d\'ingé réseau : <b>R3.05, R3.06, R3.09</b> à 16-17, le reste à 15+. Le tableau des cibles est juste au-dessus.',
    ],
    cards: [
      ['Quelle part d\'une UE pèsent SAÉ + alternance ?', '40 à 46 % selon l\'UE.'],
      ['Les 3 ressources « cœur » pour une spécialité réseau ?', 'R3.05 Prog système, R3.06 Réseaux, R3.09 Crypto.'],
    ],
    qs: byCh('org'),
  },
  {
    id: 'dhcp', icon: '📡', title: 'Réseaux · DHCP', min: 8, star: true, anchor: 'reseaux',
    recap: [
      '<b>DORA</b> : Discover (broadcast, source 0.0.0.0) → Offer → Request → Ack. UDP <b>67</b> serveur, <b>68</b> client.',
      'Le broadcast ne traverse pas un routeur : serveur distant = <b>agent relais</b> (Cisco : <code>ip helper-address</code> sur l\'interface côté clients).',
      'Cisco : <code>ip dhcp excluded-address</code> d\'abord, puis <code>ip dhcp pool</code> → <code>network</code>, <code>default-router</code>, <code>dns-server</code>.',
      'Bail à durée limitée : renouvellement à <b>T1 = 50 %</b> (unicast), puis T2 = 87,5 % (broadcast). Sans DHCP, Windows prend une <b>APIPA 169.254.x.x</b>.',
    ],
    cards: [
      ['Ports DHCP ?', 'UDP 67 (serveur) et 68 (client).'],
      ['Commande Cisco du relais DHCP ?', 'ip helper-address <IP du serveur>'],
      ['Que signifie DORA ?', 'Discover, Offer, Request, Ack.'],
    ],
    qs: byCh('dhcp'),
  },
  {
    id: 'nat', icon: '🔁', title: 'Réseaux · NAT et PAT', min: 7, anchor: 'reseaux',
    recap: [
      'Plages privées <b>RFC 1918</b> : 10/8, 172.16/12, 192.168/16. Elles ne sont pas routées sur Internet : il faut traduire.',
      '<b>Statique</b> = 1 privée ↔ 1 publique (publier un serveur). <b>Dynamique</b> = pool d\'adresses publiques. <b>PAT / overload</b> = toutes derrière une seule IP, distinguées par les ports.',
      'Vocabulaire Cisco : <b>inside local</b> = IP privée de l\'hôte ; <b>inside global</b> = son IP publique traduite.',
      'Indispensable : <code>ip nat inside</code> / <code>ip nat outside</code> sur les interfaces + une ACL qui désigne qui traduire. PAT : <code>ip nat inside source list 1 interface g0/1 overload</code>.',
    ],
    cards: [
      ['NAT pour publier un serveur web interne ?', 'NAT statique (redirection de port).'],
      ['Inside local vs inside global ?', 'Privée de l\'hôte vs son adresse publique traduite.'],
    ],
    qs: byCh('nat'),
  },
  {
    id: 'ipv6a', icon: '🔢', title: 'Réseaux · Adressage IPv6', min: 9, star: true, anchor: 'reseaux',
    recap: [
      '<b>128 bits</b> = 8 groupes de 16 bits en hexadécimal. Compression : 0 de tête supprimés, <b>« :: » une seule fois</b>. Pour développer, compte les groupes manquants.',
      'Types par préfixe : <b>fe80::/10</b> lien local · <b>fc00::/7</b> (en pratique fd…) locale unique · <b>ff00::/8</b> multicast · <b>2000::/3</b> globale · ::1 boucle locale.',
      '<b>EUI-64 modifié</b> : MAC coupée en deux, <b>FF:FE</b> au milieu, <b>7e bit du 1er octet inversé</b> (84 → 86, 08 → 0a).',
      'Plus de <b>broadcast</b> ni d\'ARP : multicast (ff02::1 tous les nœuds, ff02::2 tous les routeurs) et NDP.',
    ],
    cards: [
      ['fe80::… ?', 'Lien local.'],
      ['fd… ?', 'Locale unique (ULA), l\'équivalent du privé IPv4.'],
      ['MAC 08:00:27:cb:ee:d7 en EUI-64 ?', '0a00:27ff:fecb:eed7'],
      ['Combien de « :: » par adresse ?', 'Un seul.'],
    ],
    qs: byCh('ipv6a'),
  },
  {
    id: 'ipv6b', icon: '🛰️', title: 'Réseaux · SLAAC, NDP et DHCPv6', min: 8, star: true, anchor: 'reseaux',
    recap: [
      '<b>NDP</b> (ICMPv6) : <b>RS</b> l\'hôte demande un routeur · <b>RA</b> le routeur annonce préfixe et passerelle · <b>NS</b> sollicitation de voisin · <b>NA</b> « c\'est moi ».',
      '<b>SLAAC pur = routeur seul</b> : l\'hôte prend le préfixe du RA et fabrique son identifiant (EUI-64 ou aléatoire). Aucun serveur DHCP.',
      '<b>SLAAC + DHCPv6 sans état</b> (O = 1) : le serveur donne seulement les <b>DNS</b>. <b>DHCPv6 avec état</b> (M = 1) : le serveur donne l\'adresse.',
      'La <b>passerelle vient toujours du RA</b>, jamais de DHCPv6. <b>DAD</b> : un NS pour sa propre adresse avant de l\'utiliser.',
    ],
    cards: [
      ['SLAAC utilise… ?', 'Uniquement un routeur (RA).'],
      ['DHCPv6 sans état fournit… ?', 'Les serveurs DNS.'],
      ['D\'où vient la passerelle par défaut en IPv6 ?', 'Du RA du routeur (son adresse lien local).'],
    ],
    qs: byCh('ipv6b'),
  },
  {
    id: 'fich', icon: '📁', title: 'R3.05 · Fichiers Unix et Makefiles', min: 8, anchor: 'r305',
    recap: [
      'Descripteurs : <b>0</b> stdin, <b>1</b> stdout, <b>2</b> stderr. <code>open</code> renvoie le plus petit libre, <b>-1</b> en cas d\'erreur (errno, perror).',
      '<code>read</code> renvoie le nombre d\'octets lus, <b>0 en fin de fichier</b>, -1 en erreur : on boucle tant que > 0.',
      'L\'<b>inode</b> porte droits, propriétaire, taille, dates, blocs, <b>pas le nom</b>. Lien dur = même inode ; lien symbolique = son propre inode + un chemin.',
      'Makefile : <code>cible: dépendances</code> puis <b>TAB</b> commande. <b>$@</b> cible, <b>$&lt;</b> 1re dépendance, <b>$^</b> toutes. Reconstruit si une dépendance est plus récente. <code>.PHONY: clean all</code>.',
    ],
    cards: [
      ['read() renvoie 0 : que se passe-t-il ?', 'Fin de fichier.'],
      ['$< dans un Makefile ?', 'La première dépendance.'],
      ['Où est stocké le nom d\'un fichier ?', 'Dans le répertoire, pas dans l\'inode.'],
    ],
    qs: byCh('fich'),
  },
  {
    id: 'proc', icon: '⚙️', title: 'R3.05 · Processus et signaux', min: 9, star: true, anchor: 'r305',
    recap: [
      '<code>fork()</code> : <b>0 dans le fils</b>, <b>PID du fils dans le père</b>, -1 si échec. Les deux reprennent juste après l\'appel.',
      '<code>exec*</code> remplace le programme, garde le PID, <b>ne revient pas</b> si succès. <code>wait/waitpid</code> récupère le statut (WEXITSTATUS).',
      '<b>Zombie</b> = fils fini pas encore attendu. <b>Orphelin</b> = père mort, adopté par PID 1. <b>SIGCHLD</b> prévient le père.',
      '<code>kill(pid, sig)</code> envoie un signal (pid 0 = groupe ; sig 0 = test d\'existence). <b>SIGKILL</b> et <b>SIGSTOP</b> ne s\'interceptent pas. <code>sigaction</code> plutôt que <code>signal</code>.',
    ],
    cards: [
      ['fork() renvoie quoi au fils ?', '0'],
      ['Deux signaux impossibles à capter ?', 'SIGKILL et SIGSTOP.'],
      ['Zombie ?', 'Fils terminé que le père n\'a pas encore wait().'],
    ],
    qs: byCh('proc'),
  },
  {
    id: 'sock', icon: '🔌', title: 'R3.05 · Sockets TCP en C', min: 7, anchor: 'r305',
    recap: [
      'Serveur : <b>socket → bind → listen → accept</b> → read/write → close. Client : <b>socket → connect</b> → read/write → close.',
      '<code>socket(AF_INET, SOCK_STREAM, 0)</code> = TCP/IPv4 (SOCK_DGRAM = UDP). Port en ordre réseau : <code>htons</code> ; adresse : <code>htonl(INADDR_ANY)</code>.',
      '<code>accept</code> renvoie une <b>nouvelle socket</b> par client ; la socket d\'écoute reste ouverte.',
      'HTTP/0.9 : une ligne <code>GET /chemin</code>, le serveur renvoie le document et ferme. « Address already in use » → <code>SO_REUSEADDR</code>.',
    ],
    cards: [
      ['Les 4 appels du serveur TCP dans l\'ordre ?', 'socket, bind, listen, accept.'],
      ['htons ?', 'Host to network short : ordre big-endian pour le port.'],
    ],
    qs: byCh('sock'),
  },
  {
    id: 'arith', icon: '🧮', title: 'R3.09 · Arithmétique modulaire', min: 8, anchor: 'r309',
    recap: [
      'Division euclidienne a = bq + r avec 0 ≤ r < b. <b>PGCD par Euclide</b> : on remplace (a, b) par (b, r) jusqu\'à r = 0.',
      'Congruences : on <b>réduit avant de calculer</b> (7 ≡ 2 mod 5) et on cherche une <b>période</b> des puissances (2⁴ ≡ 1 mod 5).',
      'a a un <b>inverse modulo n ⇔ PGCD(a, n) = 1</b> (Bézout). On le trouve avec Euclide étendu ou en essayant.',
      '<b>Fermat</b> : p premier, a non multiple de p ⇒ a^(p−1) ≡ 1 (mod p).',
    ],
    cards: [
      ['PGCD(640, 520) ?', '40'],
      ['Condition d\'existence d\'un inverse modulo n ?', 'PGCD(a, n) = 1.'],
    ],
    qs: byCh('arith'),
  },
  {
    id: 'sym', icon: '🔐', title: 'R3.09 · César, substitution, permutation, Vigenère', min: 9, star: true, anchor: 'r309',
    recap: [
      'Décalage de clé k : <b>y = (x + k) mod 26</b>, déchiffrement <b>x = (y − k) mod 26</b>, avec A = 0.',
      '<b>Permutation (grille + clé)</b> : écrire le message <b>ligne par ligne</b>, lire les <b>colonnes dans l\'ordre alphabétique des lettres de la clé</b>. Déchiffrer = découper en colonnes de la hauteur de la grille, les replacer, lire les lignes.',
      'Faiblesses : César = 25 clés (force brute) ; substitution = analyse de fréquences.',
      '<b>Vigenère</b> : polyalphabétique, clé répétée ; on trouve la longueur de clé (Kasiski, indice de coïncidence) puis on casse chaque César.',
    ],
    cards: [
      ['Ordre de lecture avec la clé TIRE ?', 'E, I, R, T → colonnes 4, 2, 3, 1.'],
      ['CHAT, décalage 12 ?', 'OTMF'],
    ],
    qs: byCh('sym'),
  },
  {
    id: 'asym', icon: '🗝️', title: 'R3.09 · RSA, Diffie-Hellman, Hamming', min: 9, anchor: 'r309',
    recap: [
      '<b>RSA</b> : n = pq, φ = (p−1)(q−1), e premier avec φ, <b>d = e⁻¹ mod φ</b>. Chiffrer c = m^e mod n, déchiffrer m = c^d mod n. Public (n, e), privé d.',
      '<b>Diffie-Hellman</b> : p, g publics ; A = g^a, B = g^b ; secret commun g^(ab) mod p. Sans authentification : <b>homme du milieu</b>.',
      '<b>Hamming (7,4)</b> : 4 bits utiles + 3 de contrôle, distance 3 : <b>corrige 1 erreur</b>, en détecte 2. Parité simple : détecte un nombre impair d\'erreurs.',
    ],
    cards: [
      ['d en RSA ?', 'L\'inverse de e modulo φ(n).'],
      ['Faille de Diffie-Hellman seul ?', 'Homme du milieu.'],
    ],
    qs: byCh('asym'),
  },
  {
    id: 'r304', icon: '🏛️', title: 'R3.04 · SOLID et patrons de conception', min: 7, anchor: 'r304',
    recap: [
      '<b>SOLID</b> : responsabilité unique, ouvert/fermé, Liskov, ségrégation des interfaces, inversion des dépendances.',
      'GoF, 3 familles : <b>création</b> (Singleton, Fabrique, Builder), <b>structure</b> (Adaptateur, Décorateur, Composite, Façade, Proxy), <b>comportement</b> (Observateur, Stratégie, Commande, État).',
      '<b>Refactoring</b> = même comportement, meilleure structure, sous tests. Viser <b>couplage faible, cohésion forte</b>.',
      'Coef 16 dans l\'UE Réaliser : <b>le projet (coef 15) et l\'exposé (coef 4)</b> font la note.',
    ],
    cards: [
      ['Observateur ?', 'Notifier automatiquement des abonnés d\'un changement.'],
      ['Stratégie ?', 'Algorithmes interchangeables derrière une interface.'],
    ],
    qs: byCh('r304'),
  },
  {
    id: 'r301', icon: '🌍', title: 'R3.01 · Sécurité web et MVC', min: 6, anchor: 'autres',
    recap: [
      'Injection SQL → <b>requêtes préparées</b>. XSS → <b>échapper à l\'affichage</b> (htmlspecialchars) + valider les saisies.',
      'Mots de passe : <code>password_hash</code> / <code>password_verify</code>, jamais MD5/SHA-1 brut.',
      'Session = données côté serveur + identifiant dans un cookie. HTTP reste sans état. MVC : Modèle / Vue / <b>Contrôleur</b> chef d\'orchestre.',
    ],
    cards: [['Contre l\'injection SQL ?', 'Requêtes préparées.']],
    qs: byCh('r301'),
  },
  {
    id: 'r307', icon: '🗄️', title: 'R3.07 · PL/pgSQL, triggers, transactions', min: 6, anchor: 'autres',
    recap: [
      'Fonction de trigger : <code>RETURNS TRIGGER</code>, lignes via <b>NEW</b> / <b>OLD</b>, déclenchement BEFORE/AFTER, FOR EACH ROW.',
      'BEFORE + <code>RETURN NULL</code> = l\'opération sur la ligne est annulée. On renvoie NEW pour la laisser passer.',
      'Curseur = parcours ligne par ligne (OPEN / FETCH / CLOSE ou FOR … IN SELECT). Transactions <b>ACID</b>. Index : lectures plus rapides, écritures un peu plus lentes.',
    ],
    cards: [['BEFORE trigger qui renvoie NULL ?', 'La ligne n\'est pas insérée / modifiée.']],
    qs: byCh('r307'),
  },
  {
    id: 'r308', icon: '🎲', title: 'R3.08 · Probabilités', min: 6, anchor: 'autres',
    recap: [
      'P(A | B) = P(A ∩ B) / P(B) ; indépendance : P(A ∩ B) = P(A) P(B).',
      'Binomiale : E = np, V = np(1 − p). Poisson : E = V = λ. Exponentielle : E = 1/λ.',
      'Normale : 68 – 95 – 99,7 %. TCL : une somme de nombreuses variables indépendantes de même loi est à peu près normale.',
    ],
    cards: [['V(X) pour B(n, p) ?', 'np(1 − p)']],
    qs: byCh('r308'),
  },
  { id: 'exam', icon: '⏱️', title: 'Examen blanc S3', min: 15, exam: 25, recap: [], cards: [] },
  { id: 'fin', icon: '🏁', title: 'Carnet d\'erreurs & plan de la semaine', min: 4, final: true, recap: [], cards: [] },
];

const data = { QUESTIONS, STEPS };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.GS3 = data;
})(typeof window !== 'undefined' ? window : globalThis);
