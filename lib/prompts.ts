// Prompts repris et adaptés du scénario Make d'origine
// ("Génération proposition commerciale"), portés vers OpenRouter
// avec sortie structurée forcée (tool use) au lieu du mode JSON texte.

const EXPERTISE_SCHEMA = {
  type: "object",
  properties: {
    nom: { type: "string", description: "Nom du canal, ex: SEA, SEO, SMA, Outreach. Chaîne vide si expertise non utilisée." },
    strategie: { type: "string", description: "3-4 points clés avec tirets '- ' et sauts de ligne '\\n'." },
    objectifs: { type: "string" },
    leads_estimes: { type: "string", description: "Ex: '20 à 40 leads/mois' ou vide." },
    appels_estimes: { type: "string", description: "Ex: '8 à 15 appels/mois' ou vide." },
  },
  required: ["nom", "strategie", "objectifs", "leads_estimes", "appels_estimes"],
};

export function recoCorePrompt(inputText: string) {
  const system =
    "Tu es le Directeur de Stratégie d'une agence de marketing digital reconnue. " +
    "Ton rôle est d'analyser les demandes entrantes pour préparer une recommandation " +
    "(reco) sur-mesure. Tu as une vision 360° : acquisition, conversion et fidélisation. " +
    "Ton ton est professionnel, expert, rassurant et synthétique.";

  const user = `Tu es le Directeur Stratégie d'une agence de marketing digital. Analyse la demande entrante ci-dessous (transcript d'appel ou email d'un prospect) et prépare les variables d'une proposition commerciale.

INSTRUCTIONS STRICTES :
1. Rédige les contenus pour qu'ils soient lus sur des slides/une page de synthèse : phrases courtes, directes et impactantes.
2. N'utilise AUCUN formatage Markdown (pas d'astérisques, pas de gras, pas de #).
3. Pour faire des listes, utilise uniquement des tirets "- " suivis d'un retour à la ligne "\\n".
4. Le client peut demander jusqu'à 4 expertises (ex: SEA, SEO, Outreach, Social Ads). Si la demande concerne moins de 4 expertises, laisse les expertises non utilisées avec un nom vide ("").
5. Les titres doivent contenir MAXIMUM 7 mots.
6. Le nom de chaque expertise doit contenir uniquement le nom du canal (ex : SEA, SEO, SMA...), pas de texte superflu.
7. ORTHOGRAPHE FRANÇAISE : conserve tous les accents (é, è, à, ê, ç, etc.).
8. Pour les estimations de leads et d'appels entrants, donne des fourchettes réalistes et adaptées au secteur d'activité du prospect. Si l'expertise ne génère pas directement des leads/appels (ex: SEO en phase initiale), indique une estimation honnête ou "En montée en puissance".
9. Le champ url_site doit contenir l'URL du site web si elle est mentionnée dans le texte, sinon "À définir".
10. projections_kpis_detail : génère 3 à 4 projections chiffrées strictement adaptées aux expertises demandées (SEA → CPC/volumes/CPL, SEO → trafic organique/mots-clés/délai ROI, Outreach → taux d'ouverture/coût par contact/taux de réponse, Dev/Web → temps de chargement/taux de conversion/délai de livraison). Format : tirets courts "- ".

CONTENU DE LA DEMANDE DU PROSPECT (transcript d'appel ou email) :
"""
${inputText}
"""`;

  const schema = {
    expertises_concernees: { type: "string", description: "Ex: SEA & SEO, ou Prospection Automatisée" },
    nom_entreprise: { type: "string" },
    url_site: { type: "string", description: "URL du site web si fournie, sinon 'À définir'" },
    titre_logique_marketing: { type: "string" },
    explication_marche_cible: { type: "string", description: "2-3 phrases max" },
    zones_geographiques: { type: "string" },
    ciblage_personae: { type: "string" },
    canaux_actives: { type: "string" },
    expertise_1: EXPERTISE_SCHEMA,
    expertise_2: EXPERTISE_SCHEMA,
    expertise_3: EXPERTISE_SCHEMA,
    expertise_4: EXPERTISE_SCHEMA,
    kpis_estimations: { type: "string", description: "Liste de 3 KPIs estimés, tirets + \\n" },
    missions_expert: { type: "string", description: "3 missions clés de l'agence, tirets + \\n" },
    rythme_reporting: { type: "string", description: "Mensuel ou Trimestriel" },
    projections_kpis_detail: { type: "string" },
  };

  return { system, user, schema };
}

export function lpAuditPrompt(params: {
  nomEntreprise: string;
  urlSite: string;
  secteur: string;
  mobile: any;
  desktop: any;
}) {
  const system =
    "Tu es un expert en optimisation de landing pages et UX conversion. Tu analyses des " +
    "données techniques PageSpeed pour produire une évaluation claire destinée à un slide commercial.";

  const user = `Voici les données PageSpeed Insights réelles d'une landing page prospect, analysée sur mobile ET desktop.

Entreprise : ${params.nomEntreprise}
URL : ${params.urlSite}
Secteur : ${params.secteur}

DONNÉES MOBILE (JSON PageSpeed brut) :
${JSON.stringify(params.mobile)}

DONNÉES DESKTOP (JSON PageSpeed brut) :
${JSON.stringify(params.desktop)}

RÈGLES DE NOTATION :
- Poids : < 500 Ko = 9-10/10 | 500 Ko-1 Mo = 7-8/10 | 1-3 Mo = 4-6/10 | > 3 Mo = 1-3/10
- Performance (score × 100) : > 80 = bien | 50-80 = moyen | < 50 = problématique
- TTI : < 3,8s = bien | 3,8-7,3s = moyen | > 7,3s = lent
- CLS : < 0,1 = bien | 0,1-0,25 = moyen | > 0,25 = problématique
- Note CTA : basée sur le score accessibilité
- Note structure : basée sur accessibilité + CLS
- Note globale : moyenne pondérée performance mobile (40%) + CTA (30%) + structure (30%)
- Labels : vert = "bon"/"maîtrisé"/"rapide" | orange = "moyen"/"à optimiser" | rouge = "lent"/"à corriger"/"problématique"

INSTRUCTIONS STRICTES :
1. Convertis les scores en notes lisibles sur 10.
2. Convertis le poids en Ko ou Mo.
3. Rédige pour des slides : phrases courtes, pas de markdown, tirets + \\n pour les listes.
4. Conserve tous les accents français.`;

  const schema = {
    lp_note_globale: { type: "string", description: "Ex: 6/10" },
    lp_note_poids: { type: "string", description: "Ex: 8/10" },
    lp_note_cta: { type: "string", description: "Ex: 5/10" },
    lp_note_structure: { type: "string", description: "Ex: 6/10" },
    lp_poids_affiche: { type: "string", description: "Ex: 974 Ko" },
    lp_score_mobile: { type: "string", description: "Ex: 66/100" },
    lp_lcp_mobile: { type: "string", description: "Ex: 2,4s" },
    lp_tti_mobile: { type: "string", description: "Ex: 7,5s" },
    lp_score_desktop: { type: "string", description: "Ex: 84/100" },
    lp_lcp_desktop: { type: "string", description: "Ex: 1,1s" },
    lp_tti_desktop: { type: "string", description: "Ex: 2,3s" },
    lp_perf_label: { type: "string", description: "Ex: moyen" },
    lp_lcp_mobile_label: { type: "string" },
    lp_tti_mobile_label: { type: "string" },
    lp_lcp_desktop_label: { type: "string" },
    lp_tti_desktop_label: { type: "string" },
    lp_poids_label: { type: "string" },
    lp_synthese: { type: "string", description: "1-2 phrases comparant mobile et desktop" },
    lp_points_forts: { type: "string", description: "- Point fort 1\\n- Point fort 2" },
    lp_points_ameliorer: { type: "string", description: "- Axe 1\\n- Axe 2\\n- Axe 3" },
  };

  return { system, user, schema };
}

export function competitorsPrompt(params: {
  secteur: string;
  nomEntreprise: string;
  zones: string;
  personae: string;
  canaux: string;
}) {
  const system =
    "Tu es un expert en stratégie digitale et veille concurrentielle. Tu identifies les " +
    "principaux annonceurs Google Ads actifs dans un secteur donné pour aider une agence " +
    "à préparer ses propositions commerciales.";

  const user = `À partir des informations suivantes sur un prospect, identifie les 3 plus gros concurrents directs qui font (ou sont susceptibles de faire) de la publicité Google Ads dans le même secteur et la même zone géographique.

Secteur / expertises demandées : ${params.secteur}
Entreprise prospect : ${params.nomEntreprise}
Zone géographique : ${params.zones}
Personae ciblés : ${params.personae}
Canaux activés : ${params.canaux}

INSTRUCTIONS STRICTES :
1. Les URL Google Ads Transparency doivent suivre ce format exact : https://adstransparency.google.com/?region=FR&advertiserName=NOM_DU_CONCURRENT (remplace les espaces par %20).
2. Pour l'analyse de chaque concurrent, rédige 1 phrase courte et directe sur leur positionnement publicitaire supposé ou connu (estimation basée sur ta connaissance du secteur, pas une donnée live).
3. La note d'intensité concurrentielle est un entier entre 1 et 10 (1 = quasi aucune concurrence ads, 10 = marché très saturé).
4. ORTHOGRAPHE FRANÇAISE : conserve tous les accents.`;

  const competitorSchema = {
    type: "object",
    properties: {
      nom: { type: "string" },
      url_ads: { type: "string" },
      analyse: { type: "string" },
    },
    required: ["nom", "url_ads", "analyse"],
  };

  const schema = {
    concurrent_1: competitorSchema,
    concurrent_2: competitorSchema,
    concurrent_3: competitorSchema,
    intensite_concurrence: { type: "string", description: "Ex: 7/10" },
    intensite_analyse: { type: "string" },
  };

  return { system, user, schema };
}
