// R3.06 Réseaux : DHCP, NAT, IPv6 — données du parcours guidé (BUT2 · S3). Généré à partir de la banque GabouLearn.
// Format d'une question : [id, chapitre, énoncé, [propositions], bonnes réponses (lettres), explication]. Plusieurs bonnes réponses possibles.
(function (root) {
'use strict';
const RAW = [
 [
  "D1",
  "dhcp",
  "Dans quel ordre se déroule l'échange DHCP (DORA) ?",
  [
   "Discover → Offer → Request → Ack",
   "Request → Offer → Discover → Ack",
   "Discover → Request → Offer → Ack",
   "Offer → Discover → Ack → Request"
  ],
  "A",
  "D-O-R-A : le client cherche, le serveur propose, le client demande, le serveur confirme."
 ],
 [
  "D2",
  "dhcp",
  "Quels ports utilise DHCP (IPv4) ?",
  [
   "UDP 67 côté serveur",
   "UDP 68 côté client",
   "TCP 53",
   "TCP 80"
  ],
  "AB",
  "DHCP est sur UDP. 53 = DNS, 80 = HTTP."
 ],
 [
  "D3",
  "dhcp",
  "Le premier message DHCPDISCOVER est envoyé…",
  [
   "en broadcast vers 255.255.255.255",
   "avec l'adresse source 0.0.0.0",
   "en unicast vers le serveur DHCP",
   "en multicast ff02::1:2"
  ],
  "AB",
  "Le client n'a pas encore d'adresse et ne connaît pas le serveur. ff02::1:2 = DHCPv6."
 ],
 [
  "D4",
  "dhcp",
  "Le serveur DHCP est dans un autre réseau que les clients. Que faut-il ?",
  [
   "un agent relais DHCP sur le routeur (ip helper-address sur Cisco)",
   "rien : le broadcast traverse les routeurs",
   "un deuxième serveur DNS",
   "désactiver le NAT"
  ],
  "A",
  "Un routeur ne relaie pas les broadcasts. Le relais transforme le Discover en unicast vers le serveur."
 ],
 [
  "D5",
  "dhcp",
  "Sur un routeur Cisco, à quoi sert « ip dhcp excluded-address 192.168.1.1 192.168.1.10 » ?",
  [
   "réserver ces adresses (passerelle, serveurs) pour qu'elles ne soient jamais distribuées",
   "interdire à ces machines d'utiliser DHCP",
   "créer le pool DHCP",
   "activer le NAT"
  ],
  "A",
  "On exclut d'abord les adresses fixes, puis on crée le pool (ip dhcp pool, network, default-router, dns-server)."
 ],
 [
  "D6",
  "dhcp",
  "Un bail (lease) DHCP…",
  [
   "a une durée limitée",
   "est renouvelé par le client, en général à 50 % de sa durée (T1)",
   "est définitif une fois attribué",
   "est renouvelé par le serveur sans que le client ne demande rien"
  ],
  "AB",
  "Le client renouvelle en unicast à T1 (50 %), puis en broadcast à T2 (87,5 %)."
 ],
 [
  "A1",
  "nat",
  "Quelles plages sont privées (RFC 1918) ?",
  [
   "10.0.0.0/8",
   "172.16.0.0/12",
   "192.168.0.0/16",
   "169.254.0.0/16"
  ],
  "ABC",
  "169.254.0.0/16 = APIPA (adresse locale de lien quand DHCP échoue), pas une plage RFC 1918."
 ],
 [
  "A2",
  "nat",
  "Le PAT (NAT overload)…",
  [
   "fait sortir plusieurs hôtes privés derrière une seule adresse publique",
   "distingue les connexions grâce aux numéros de port",
   "associe une adresse publique fixe à chaque hôte",
   "ne fonctionne qu'en IPv6"
  ],
  "AB",
  "NAT statique = 1 pour 1 ; NAT dynamique = pool d'adresses publiques ; PAT = plusieurs vers une, par les ports."
 ],
 [
  "A3",
  "nat",
  "Vocabulaire Cisco : l'adresse publique qui représente un hôte interne vu d'Internet est…",
  [
   "inside global",
   "inside local",
   "outside local",
   "outside global"
  ],
  "A",
  "Inside local = adresse privée de l'hôte ; inside global = son adresse traduite (publique)."
 ],
 [
  "A4",
  "nat",
  "Pour publier un serveur web interne (192.168.1.10) sur l'adresse publique du routeur, on utilise…",
  [
   "une traduction statique (redirection de port)",
   "un pool NAT dynamique",
   "un relais DHCP",
   "une route par défaut seulement"
  ],
  "A",
  "Ex. : ip nat inside source static tcp 192.168.1.10 80 <IP publique> 80."
 ],
 [
  "A5",
  "nat",
  "Configuration NAT Cisco : qu'est-ce qui est indispensable ?",
  [
   "marquer les interfaces avec ip nat inside / ip nat outside",
   "une ACL (ou un pool) qui désigne les adresses à traduire",
   "un serveur DHCP",
   "IPv6 activé"
  ],
  "AB",
  "Sans « inside/outside » sur les interfaces, la règle NAT ne s'applique jamais."
 ],
 [
  "V1",
  "ipv6a",
  "Une adresse IPv6 tient sur…",
  [
   "128 bits",
   "8 groupes de 16 bits",
   "64 bits",
   "32 bits"
  ],
  "AB",
  "8 groupes de 4 chiffres hexadécimaux, séparés par « : »."
 ],
 [
  "V2",
  "ipv6a",
  "Forme complète de 2007:A8::75C:357:49C3 ?",
  [
   "2007:A8:0:0:0:75C:357:49C3",
   "2007:A8::0:0:0:75C:357:49C3",
   "2007:A8:0:0:75C:357:49C3",
   "2007:0A80:0:0:0:75C:357:49C3"
  ],
  "A",
  "5 groupes écrits, il en faut 8 : « :: » remplace 3 groupes de 0. Le « :: » disparaît dans la forme complète (piège du QCM d'entraînement)."
 ],
 [
  "V3",
  "ipv6a",
  "Règles de compression d'une adresse IPv6",
  [
   "on peut supprimer les 0 en tête de chaque groupe",
   "« :: » remplace une suite de groupes à 0, une seule fois par adresse",
   "« :: » peut apparaître deux fois",
   "on peut supprimer les 0 en fin de groupe"
  ],
  "AB",
  "0db8 → db8, mais 2a00 ne devient jamais 2a. Deux « :: » rendraient l'adresse ambiguë."
 ],
 [
  "V4",
  "ipv6a",
  "Associer le préfixe à son type : fe80::917:57:224",
  [
   "lien local (fe80::/10)",
   "globale (2000::/3)",
   "multicast (ff00::/8)",
   "locale unique (fc00::/7)"
  ],
  "A",
  "Une adresse de lien local existe sur chaque interface IPv6 et ne passe pas les routeurs."
 ],
 [
  "V5",
  "ipv6a",
  "fd02:1537:81:910::127 est une adresse…",
  [
   "locale unique (ULA, fc00::/7)",
   "de lien local",
   "globale",
   "multicast"
  ],
  "A",
  "fd… = ULA, l'équivalent des adresses privées IPv4. ff15::1234 = multicast, 2a00:1450:… = globale."
 ],
 [
  "V6",
  "ipv6a",
  "MAC 84:2b:2b:a0:59:f5 : identifiant d'interface en EUI-64 modifié ?",
  [
   "862b:2bff:fea0:59f5",
   "842b:2bff:fea0:59f5",
   "842b:2bfe:ffa0:59f5",
   "862b:2bfe:ffa0:59f5"
  ],
  "A",
  "On coupe la MAC en deux, on insère FF:FE au milieu et on inverse le 7e bit du premier octet : 84 → 86."
 ],
 [
  "V7",
  "ipv6a",
  "Qu'est-ce qui n'existe plus en IPv6 ?",
  [
   "le broadcast",
   "ARP (remplacé par NDP)",
   "le multicast",
   "les adresses de lien local"
  ],
  "AB",
  "Le broadcast est remplacé par le multicast (ff02::1 = tous les nœuds, ff02::2 = tous les routeurs)."
 ],
 [
  "W1",
  "ipv6b",
  "Les messages ICMPv6 RS, RA, NS et NA font partie de…",
  [
   "NDP (Neighbor Discovery Protocol)",
   "DHCPv6",
   "ARP",
   "OSPFv3"
  ],
  "A",
  "RS/RA : dialogue hôte ↔ routeur. NS/NA : dialogue entre voisins (résolution d'adresse, DAD)."
 ],
 [
  "W2",
  "ipv6b",
  "SLAAC (autoconfiguration sans état) utilise…",
  [
   "uniquement un routeur, qui annonce le préfixe dans un RA",
   "uniquement un serveur DHCPv6",
   "un routeur et un serveur DHCPv6 obligatoirement",
   "un serveur DNS"
  ],
  "A",
  "Piège du QCM d'entraînement : en SLAAC pur, aucun serveur DHCP. L'hôte construit son adresse à partir du préfixe du RA."
 ],
 [
  "W3",
  "ipv6b",
  "En SLAAC + DHCPv6 sans état, le serveur DHCPv6 fournit…",
  [
   "les serveurs DNS (et le nom de domaine)",
   "l'adresse IPv6 de l'hôte",
   "la passerelle par défaut",
   "le préfixe du lien"
  ],
  "A",
  "L'adresse vient de SLAAC, la passerelle vient toujours du RA (l'adresse lien local du routeur). DHCPv6 ne donne jamais de passerelle."
 ],
 [
  "W4",
  "ipv6b",
  "Associer : NS sert à…",
  [
   "vérifier si un voisin utilise déjà une adresse (DAD) ou trouver sa MAC",
   "annoncer le préfixe du réseau",
   "demander au routeur de s'annoncer",
   "répondre « c'est moi qui ai cette adresse »"
  ],
  "A",
  "RS = demande au routeur ; RA = le routeur annonce le préfixe ; NS = sollicitation de voisin ; NA = « je porte cette adresse »."
 ],
 [
  "W5",
  "ipv6b",
  "La procédure DAD (Duplicate Address Detection) sert à…",
  [
   "vérifier qu'une adresse n'est pas déjà utilisée sur le lien local",
   "détecter les doublons de route",
   "distribuer les adresses DNS",
   "chiffrer les échanges"
  ],
  "A",
  "Avant d'utiliser une adresse, l'hôte envoie un NS pour elle-même : s'il reçoit un NA, l'adresse est prise."
 ],
 [
  "W6",
  "ipv6b",
  "Drapeaux d'un RA : M = 1 signifie…",
  [
   "DHCPv6 avec état : l'adresse est donnée par le serveur",
   "SLAAC seul",
   "il faut demander les DNS uniquement",
   "le routeur n'est pas une passerelle"
  ],
  "A",
  "M (Managed) = 1 : DHCPv6 avec état. O (Other) = 1 avec M = 0 : SLAAC + DHCPv6 sans état."
 ]
];
const QUESTIONS = RAW.map(([id, ch, q, opts, ok, ex]) => ({ id: String(id), ch, q, opts, ok: ok.split('').map((l) => 'ABCD'.indexOf(l)), ex }));
const STEPS = [
 {
  "id": "dhcp",
  "icon": "",
  "title": "DHCP",
  "min": 8,
  "star": true,
  "anchor": "reseaux",
  "recap": [
   "<b>DORA</b> : Discover (broadcast, source 0.0.0.0) → Offer → Request → Ack. UDP <b>67</b> serveur, <b>68</b> client.",
   "Le broadcast ne traverse pas un routeur : serveur distant = <b>agent relais</b> (Cisco : <code>ip helper-address</code> sur l'interface côté clients).",
   "Cisco : <code>ip dhcp excluded-address</code> d'abord, puis <code>ip dhcp pool</code> → <code>network</code>, <code>default-router</code>, <code>dns-server</code>.",
   "Bail à durée limitée : renouvellement à <b>T1 = 50 %</b> (unicast), puis T2 = 87,5 % (broadcast). Sans DHCP, Windows prend une <b>APIPA 169.254.x.x</b>."
  ],
  "cards": [
   [
    "Ports DHCP ?",
    "UDP 67 (serveur) et 68 (client)."
   ],
   [
    "Commande Cisco du relais DHCP ?",
    "ip helper-address <IP du serveur>"
   ],
   [
    "Que signifie DORA ?",
    "Discover, Offer, Request, Ack."
   ]
  ],
  "qs": [
   "D1",
   "D2",
   "D3",
   "D4",
   "D5",
   "D6"
  ]
 },
 {
  "id": "nat",
  "icon": "",
  "title": "NAT et PAT",
  "min": 7,
  "anchor": "reseaux",
  "recap": [
   "Plages privées <b>RFC 1918</b> : 10/8, 172.16/12, 192.168/16. Elles ne sont pas routées sur Internet : il faut traduire.",
   "<b>Statique</b> = 1 privée ↔ 1 publique (publier un serveur). <b>Dynamique</b> = pool d'adresses publiques. <b>PAT / overload</b> = toutes derrière une seule IP, distinguées par les ports.",
   "Vocabulaire Cisco : <b>inside local</b> = IP privée de l'hôte ; <b>inside global</b> = son IP publique traduite.",
   "Indispensable : <code>ip nat inside</code> / <code>ip nat outside</code> sur les interfaces + une ACL qui désigne qui traduire. PAT : <code>ip nat inside source list 1 interface g0/1 overload</code>."
  ],
  "cards": [
   [
    "NAT pour publier un serveur web interne ?",
    "NAT statique (redirection de port)."
   ],
   [
    "Inside local vs inside global ?",
    "Privée de l'hôte vs son adresse publique traduite."
   ]
  ],
  "qs": [
   "A1",
   "A2",
   "A3",
   "A4",
   "A5"
  ]
 },
 {
  "id": "ipv6a",
  "icon": "",
  "title": "Adressage IPv6",
  "min": 9,
  "star": true,
  "anchor": "reseaux",
  "recap": [
   "<b>128 bits</b> = 8 groupes de 16 bits en hexadécimal. Compression : 0 de tête supprimés, <b>« :: » une seule fois</b>. Pour développer, compte les groupes manquants.",
   "Types par préfixe : <b>fe80::/10</b> lien local · <b>fc00::/7</b> (en pratique fd…) locale unique · <b>ff00::/8</b> multicast · <b>2000::/3</b> globale · ::1 boucle locale.",
   "<b>EUI-64 modifié</b> : MAC coupée en deux, <b>FF:FE</b> au milieu, <b>7e bit du 1er octet inversé</b> (84 → 86, 08 → 0a).",
   "Plus de <b>broadcast</b> ni d'ARP : multicast (ff02::1 tous les nœuds, ff02::2 tous les routeurs) et NDP."
  ],
  "cards": [
   [
    "fe80::… ?",
    "Lien local."
   ],
   [
    "fd… ?",
    "Locale unique (ULA), l'équivalent du privé IPv4."
   ],
   [
    "MAC 08:00:27:cb:ee:d7 en EUI-64 ?",
    "0a00:27ff:fecb:eed7"
   ],
   [
    "Combien de « :: » par adresse ?",
    "Un seul."
   ]
  ],
  "qs": [
   "V1",
   "V2",
   "V3",
   "V4",
   "V5",
   "V6",
   "V7"
  ]
 },
 {
  "id": "ipv6b",
  "icon": "",
  "title": "SLAAC, NDP et DHCPv6",
  "min": 8,
  "star": true,
  "anchor": "reseaux",
  "recap": [
   "<b>NDP</b> (ICMPv6) : <b>RS</b> l'hôte demande un routeur · <b>RA</b> le routeur annonce préfixe et passerelle · <b>NS</b> sollicitation de voisin · <b>NA</b> « c'est moi ».",
   "<b>SLAAC pur = routeur seul</b> : l'hôte prend le préfixe du RA et fabrique son identifiant (EUI-64 ou aléatoire). Aucun serveur DHCP.",
   "<b>SLAAC + DHCPv6 sans état</b> (O = 1) : le serveur donne seulement les <b>DNS</b>. <b>DHCPv6 avec état</b> (M = 1) : le serveur donne l'adresse.",
   "La <b>passerelle vient toujours du RA</b>, jamais de DHCPv6. <b>DAD</b> : un NS pour sa propre adresse avant de l'utiliser."
  ],
  "cards": [
   [
    "SLAAC utilise… ?",
    "Uniquement un routeur (RA)."
   ],
   [
    "DHCPv6 sans état fournit… ?",
    "Les serveurs DNS."
   ],
   [
    "D'où vient la passerelle par défaut en IPv6 ?",
    "Du RA du routeur (son adresse lien local)."
   ]
  ],
  "qs": [
   "W1",
   "W2",
   "W3",
   "W4",
   "W5",
   "W6"
  ]
 },
 {
  "id": "exam",
  "icon": "",
  "title": "Examen blanc",
  "min": 14,
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
const data = { key: "r306", title: "R3.06 Réseaux : DHCP, NAT, IPv6", QUESTIONS, STEPS, tips: {"semaine":["Refais les TP Packet Tracer (DHCP/NAT puis IPv6) en 20 min sans l'énoncé.","Refais le QCM d'entraînement IPv6 sur AMeTICE."],"qcm":["Pour développer une adresse, compte les groupes : il en faut 8.","SLAAC = routeur seul ; DHCPv6 sans état = DNS seulement ; la passerelle vient toujours du RA."]} };
if (typeof module !== 'undefined' && module.exports) module.exports = data;
else root.PARCOURS = data;
})(typeof window !== 'undefined' ? window : globalThis);
