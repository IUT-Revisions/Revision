// Coefficients du BUT informatique 2e année, IUT d'Aix-Marseille (site d'Aix), année 2026-2027.
// Source : fichier « Coefficients_BUT2_BUT3.xlsx » publié par le département sur AMeTICE.
// Clés : parcours (A ou B) - régime (FI = formation initiale, FA = alternance). UE : [nom, ECTS, { élément: coefficient }].
window.COEF_BUT2 = {
  'A-FI': {
    S3: [
      ['UE3.1 Réaliser', 6, { 'S3.A.01': 40, 'R3.01': 10, 'R3.02': 10, 'R3.03': 10, 'R3.04': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, 'R3.A.L1': 8 }],
      ['UE3.2 Optimiser', 6, { 'S3.A.01': 40, 'R3.01': 8, 'R3.02': 8, 'R3.03': 8, 'R3.08': 11, 'R3.09': 10, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, 'R3.A.L1': 8 }],
      ['UE3.3 Administrer', 6, { 'S3.A.01': 40, 'R3.01': 8, 'R3.05': 12, 'R3.06': 10, 'R3.09': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, 'R3.A.L1': 8 }],
      ['UE3.4 Gérer', 6, { 'S3.A.01': 40, 'R3.01': 8, 'R3.07': 12, 'R3.08': 8, 'R3.09': 8, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, 'R3.A.L1': 8 }],
      ['UE3.5 Conduire', 3, { 'S3.A.01': 20, 'R3.01': 6, 'R3.03': 4, 'R3.04': 4, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.6 Collaborer', 3, { 'S3.A.01': 20, 'R3.04': 8, 'R3.10': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
    ],
    S4: [
      ['UE4.1 Réaliser', 6, { 'S4.A.01': 22, Portfolio: 2, Stage: 36, 'R4.01': 10, 'R4.02': 9, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.A.10': 6, 'R4.A.11': 6, 'R4.A.L1': 4 }],
      ['UE4.2 Optimiser', 6, { 'S4.A.01': 22, Portfolio: 2, Stage: 36, 'R4.04': 8, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.A.09': 5, 'R4.A.10': 5, 'R4.A.11': 5, 'R4.A.12': 8, 'R4.A.L1': 4 }],
      ['UE4.3 Administrer', 6, { 'S4.A.01': 22, Portfolio: 2, Stage: 36, 'R4.01': 12, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.A.08': 18, 'R4.A.L1': 5 }],
      ['UE4.4 Gérer', 6, { 'S4.A.01': 22, Portfolio: 2, Stage: 36, 'R4.03': 10, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.A.10': 10, 'R4.A.11': 11, 'R4.A.L1': 4 }],
      ['UE4.5 Conduire', 3, { 'S4.A.01': 10, Portfolio: 2, Stage: 18, 'R4.02': 4, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.A.09': 4, 'R4.A.10': 4, 'R4.A.11': 3 }],
      ['UE4.6 Collaborer', 3, { 'S4.A.01': 10, Portfolio: 2, Stage: 18, 'R4.01': 15, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1 }],
    ],
  },
  'A-FA': {
    S3: [
      ['UE3.1 Réaliser', 6, { 'S3.A.01': 20, Alternance: 28, 'R3.01': 10, 'R3.02': 10, 'R3.03': 10, 'R3.04': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.2 Optimiser', 6, { 'S3.A.01': 20, Alternance: 28, 'R3.01': 8, 'R3.02': 8, 'R3.03': 8, 'R3.08': 11, 'R3.09': 10, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.3 Administrer', 6, { 'S3.A.01': 20, Alternance: 28, 'R3.01': 8, 'R3.05': 12, 'R3.06': 10, 'R3.09': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.4 Gérer', 6, { 'S3.A.01': 20, Alternance: 28, 'R3.01': 8, 'R3.07': 12, 'R3.08': 8, 'R3.09': 8, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.5 Conduire', 3, { 'S3.A.01': 10, Alternance: 10, 'R3.01': 6, 'R3.03': 4, 'R3.04': 4, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.6 Collaborer', 3, { 'S3.A.01': 10, Alternance: 10, 'R3.04': 8, 'R3.10': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
    ],
    S4: [
      ['UE4.1 Réaliser', 6, { 'S4.A.01': 22, Portfolio: 2, Alternance: 36, 'R4.01': 10, 'R4.02': 9, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.A.10': 7, 'R4.A.11': 7 }],
      ['UE4.2 Optimiser', 6, { 'S4.A.01': 22, Portfolio: 2, Alternance: 36, 'R4.04': 8, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.A.09': 5, 'R4.A.10': 6, 'R4.A.11': 6, 'R4.A.12': 8 }],
      ['UE4.3 Administrer', 6, { 'S4.A.01': 22, Portfolio: 2, Alternance: 36, 'R4.01': 15, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.A.08': 18 }],
      ['UE4.4 Gérer', 6, { 'S4.A.01': 22, Portfolio: 2, Alternance: 36, 'R4.03': 10, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.A.10': 11, 'R4.A.11': 12 }],
      ['UE4.5 Conduire', 3, { 'S4.A.01': 10, Portfolio: 2, Alternance: 18, 'R4.02': 4, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.A.09': 3, 'R4.A.10': 3, 'R4.A.11': 3 }],
      ['UE4.6 Collaborer', 3, { 'S4.A.01': 10, Portfolio: 2, Alternance: 18, 'R4.01': 13, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1 }],
    ],
  },
  'B-FI': {
    S3: [
      ['UE3.1 Réaliser', 6, { 'S3.B.01': 40, 'R3.01': 10, 'R3.02': 12, 'R3.03': 12, 'R3.04': 16, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.2 Optimiser', 6, { 'S3.B.01': 40, 'R3.01': 9, 'R3.02': 9, 'R3.03': 9, 'R3.08': 10, 'R3.09': 10, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, 'R3.B.L1': 6 }],
      ['UE3.3 Administrer', 6, { 'S3.B.01': 40, 'R3.01': 10, 'R3.05': 10, 'R3.06': 10, 'R3.09': 14, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, 'R3.B.L1': 6 }],
      ['UE3.4 Gérer', 6, { 'S3.B.01': 40, 'R3.01': 9, 'R3.07': 14, 'R3.08': 9, 'R3.09': 9, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1, 'R3.B.L1': 3 }],
      ['UE3.5 Conduire', 3, { 'S3.B.01': 20, 'R3.01': 6, 'R3.03': 4, 'R3.04': 4, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.6 Collaborer', 3, { 'S3.B.01': 20, 'R3.04': 8, 'R3.10': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
    ],
    S4: [
      ['UE4.1 Réaliser', 6, { 'S4.B.01': 22, Portfolio: 2, Stage: 36, 'R4.01': 10, 'R4.02': 9, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.B.L1': 16 }],
      ['UE4.2 Optimiser', 6, { 'S4.B.01': 22, Portfolio: 2, Stage: 36, 'R4.04': 8, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.B.09': 10, 'R4.B.10': 10, 'R4.B.L1': 7 }],
      ['UE4.3 Administrer', 6, { 'S4.B.01': 22, Portfolio: 2, Stage: 36, 'R4.01': 12, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.B.08': 5, 'R4.B.10': 5, 'R4.B.11': 4, 'R4.B.12': 4, 'R4.B.L1': 5 }],
      ['UE4.4 Gérer', 6, { 'S4.B.01': 22, Portfolio: 2, Stage: 36, 'R4.03': 10, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.B.10': 18, 'R4.B.L1': 7 }],
      ['UE4.5 Conduire', 3, { 'S4.B.01': 10, Portfolio: 2, Stage: 18, 'R4.02': 4, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1, 'R4.B.09': 11 }],
      ['UE4.6 Collaborer', 3, { 'S4.B.01': 10, Portfolio: 2, Stage: 18, 'R4.01': 15, 'R4.05': 2, 'R4.06': 2, 'R4.07': 1 }],
    ],
  },
  'B-FA': {
    S3: [
      ['UE3.1 Réaliser', 6, { 'S3.B.01': 20, Alternance: 20, 'R3.01': 10, 'R3.02': 12, 'R3.03': 12, 'R3.04': 16, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.2 Optimiser', 6, { 'S3.B.01': 20, Alternance: 26, 'R3.01': 9, 'R3.02': 9, 'R3.03': 9, 'R3.08': 10, 'R3.09': 10, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.3 Administrer', 6, { 'S3.B.01': 20, Alternance: 26, 'R3.01': 10, 'R3.05': 10, 'R3.06': 10, 'R3.09': 14, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.4 Gérer', 6, { 'S3.B.01': 20, Alternance: 23, 'R3.01': 9, 'R3.07': 14, 'R3.08': 9, 'R3.09': 9, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.5 Conduire', 3, { 'S3.B.01': 10, Alternance: 10, 'R3.01': 6, 'R3.03': 4, 'R3.04': 4, 'R3.10': 6, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
      ['UE3.6 Collaborer', 3, { 'S3.B.01': 10, Alternance: 10, 'R3.04': 8, 'R3.10': 12, 'R3.11': 3, 'R3.12': 3, 'R3.13': 3, 'R3.14': 1 }],
    ],
    S4: [
      ['UE4.1 Réaliser', 6, { 'S4.B.01': 22, Portfolio: 2, Alternance: 36, 'R4.01': 18, 'R4.02': 15, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1 }],
      ['UE4.2 Optimiser', 6, { 'S4.B.01': 22, Portfolio: 2, Alternance: 36, 'R4.04': 11, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.B.09': 11, 'R4.B.10': 11 }],
      ['UE4.3 Administrer', 6, { 'S4.B.01': 22, Portfolio: 2, Alternance: 36, 'R4.01': 10, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.B.08': 6, 'R4.B.10': 7, 'R4.B.11': 5, 'R4.B.12': 5 }],
      ['UE4.4 Gérer', 6, { 'S4.B.01': 22, Portfolio: 2, Alternance: 36, 'R4.03': 15, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.B.10': 18 }],
      ['UE4.5 Conduire', 3, { 'S4.B.01': 10, Portfolio: 2, Alternance: 18, 'R4.02': 4, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1, 'R4.B.09': 9 }],
      ['UE4.6 Collaborer', 3, { 'S4.B.01': 10, Portfolio: 2, Alternance: 18, 'R4.01': 13, 'R4.05': 3, 'R4.06': 3, 'R4.07': 1 }],
    ],
  },
};

window.LIBELLES_BUT2 = {
  'S3.A.01': 'SAÉ 3.A.01 (projet du semestre)', 'S3.B.01': 'SAÉ 3.B.01 Services applicatifs', 'S4.A.01': 'SAÉ 4.A.01 (projet du semestre)', 'S4.B.01': 'SAÉ 4.B.01 Déployer et sécuriser des services',
  Portfolio: 'Portfolio', Stage: 'Stage', Alternance: 'Alternance',
  'R3.01': 'Développement web', 'R3.02': 'Développement efficace', 'R3.03': 'Analyse', 'R3.04': 'Qualité de développement', 'R3.05': 'Programmation système',
  'R3.06': 'Architecture des réseaux', 'R3.07': 'SQL dans un langage', 'R3.08': 'Probabilités', 'R3.09': 'Cryptographie et sécurité', 'R3.10': 'Management des SI',
  'R3.11': 'Droit des contrats et du numérique', 'R3.12': 'Anglais', 'R3.13': 'Communication professionnelle', 'R3.14': 'PPP', 'R3.A.L1': 'Ressource locale', 'R3.B.L1': 'Ressource locale',
  'R4.01': 'Architecture logicielle', 'R4.02': 'Qualité de développement', 'R4.03': 'Qualité et au-delà du relationnel', 'R4.04': 'Méthodes d\'optimisation', 'R4.05': 'Anglais',
  'R4.06': 'Communication interne', 'R4.07': 'PPP', 'R4.A.08': 'Virtualisation', 'R4.A.09': 'Management avancé des SI', 'R4.A.10': 'Complément web', 'R4.A.11': 'Développement mobile',
  'R4.A.12': 'Automates et langages', 'R4.A.L1': 'Ressource locale', 'R4.B.08': 'Virtualisation', 'R4.B.09': 'Management avancé des SI', 'R4.B.10': 'Cryptographie et sécurité',
  'R4.B.11': 'Réseau avancé', 'R4.B.12': 'Sécurité système et réseaux', 'R4.B.L1': 'Ressource locale',
};
