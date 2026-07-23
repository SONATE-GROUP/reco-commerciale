/**
 * Décodage d'un lien partagé du simulateur SEA/SMA (sonate-group/simulateur-commercial-sea)
 * et recalcul des mêmes métriques, portées fidèlement depuis marketing-simulator.jsx
 * (lignes ~483-591 au moment du portage). Le lien partagé encode l'intégralité des
 * paramètres d'entrée en base64 dans le paramètre d'URL `s` — aucun appel réseau
 * au simulateur n'est nécessaire, tout se décode et se recalcule ici.
 *
 * Si les formules du simulateur évoluent, penser à reporter les changements ici.
 */

const CHANNEL_LABELS: Record<string, string> = {
  "google-ads": "Google Ads",
  "meta-ads": "Meta Ads",
  "linkedin-ads": "LinkedIn Ads",
  "tiktok-ads": "TikTok Ads",
};

const SECTOR_LABELS: Record<string, string> = {
  saas: "SaaS / Tech",
  industrie: "Industrie",
  finance: "Finance / Banque",
  assurance: "Assurance / Mutuelle",
  immo: "Immobilier",
  batiment: "Bâtiment / BTP",
  energie: "Énergie / Rénovation",
  artisanat: "Artisanat / Dépannage",
  auto: "Automobile",
  sante: "Santé / Médical",
  juridique: "Juridique / Avocats",
  rh: "RH / Recrutement",
  conseil: "Conseil / Services",
  formation: "Éducation / Formation",
  tourisme: "Tourisme / Hôtellerie",
  restauration: "Restauration / CHR",
  beaute: "Beauté / Bien-être",
  mode: "Mode / Luxe",
  ecom: "E-commerce",
};

const BUSINESS_TYPES: Record<
  string,
  { conversionStage: string; finalStage: string; hasClosing: boolean; cplShort: string }
> = {
  urgence: { conversionStage: "Appels", finalStage: "Clients", hasClosing: true, cplShort: "CPA" },
  lead: { conversionStage: "Leads", finalStage: "Clients", hasClosing: true, cplShort: "CPL" },
  ecommerce: { conversionStage: "Commandes", finalStage: "Ventes", hasClosing: false, cplShort: "CPA" },
};

const LEARNING_STEPS_MULT = [1.0, 0.92, 0.85, 0.78, 0.76, 0.75];

interface SimulatorState {
  channel: string;
  sector: string;
  mode: "budget" | "leads";
  budget: number;
  tLeads: number;
  cpc: number;
  ctr: number;
  conv: number;
  billing: "cpc" | "cpm";
  cpm: number;
  businessType: string;
  panierMoyen: number;
  revenueType: "ponctuel" | "recurrent";
  mrr: number;
  lifetime: number;
  marge: number;
  closing: number;
  cycleVente: number;
  seasonalityEnabled: boolean;
  startMonth: number;
  highSeasonMonths: boolean[];
  highSeasonMultiplier: number;
  prospect?: string;
  website?: string;
}

export interface SimulatorResult {
  channelLabel: string;
  sectorLabel: string;
  businessTypeLabel: string;
  prospect: string;
  website: string;
  monthly: {
    impressions: number;
    clicks: number;
    leads: number;
    clients: number;
    cpl: number;
    spend: number;
    roas: number;
    roiPct: number;
    breakEvenRoas: number;
  };
  annual: {
    leads: number;
    clients: number;
    ca: number;
    spend: number;
    roas: number;
    roiPct: number;
  };
  lowSignal: boolean;
}

function decodeState(rawParam: string): SimulatorState {
  // btoa() côté navigateur encode la chaîne telle quelle (Latin-1) : on décode
  // symétriquement en latin1 plutôt qu'en utf-8 pour retomber sur le même JSON.
  const json = Buffer.from(rawParam, "base64").toString("latin1");
  return JSON.parse(json);
}

export function parseSimulatorLink(url: string): SimulatorResult {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error("Le lien du simulateur n'est pas une URL valide.");
  }

  const s = parsed.searchParams.get("s");
  if (!s) {
    throw new Error(
      "Ce lien ne contient pas de rapport de simulation (paramètre 's' manquant). Utilise le lien généré par le bouton \"Enregistrer\" du simulateur."
    );
  }

  let d: SimulatorState;
  try {
    d = decodeState(s);
  } catch {
    throw new Error("Impossible de lire les données du lien du simulateur (format inattendu).");
  }

  const biz = BUSINESS_TYPES[d.businessType] ?? BUSINESS_TYPES.lead;
  const isCpm = d.billing === "cpm";
  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);

  let impr = 0;
  let clicks = 0;
  let leads = 0;
  let budgetOut = 0;

  if (d.mode === "budget") {
    if (isCpm) {
      impr = Math.round(safeDiv(d.budget, d.cpm) * 1000);
      clicks = Math.round((impr * d.ctr) / 100);
    } else {
      clicks = Math.round(safeDiv(d.budget, d.cpc));
      impr = Math.round(safeDiv(clicks, d.ctr / 100));
    }
    leads = Math.round((clicks * d.conv) / 100);
    budgetOut = d.budget;
  } else {
    leads = d.tLeads;
    clicks = Math.round(safeDiv(leads, d.conv / 100));
    impr = Math.round(safeDiv(clicks, d.ctr / 100));
    budgetOut = isCpm ? Math.round(safeDiv(impr, 1000) * d.cpm) : Math.round(clicks * d.cpc);
  }

  const spend = d.mode === "budget" ? d.budget : budgetOut;
  const cpl = leads > 0 ? safeDiv(spend, leads) : 0;
  const clients = biz.hasClosing ? Math.round((leads * d.closing) / 100) : leads;
  const recurring = d.revenueType === "recurrent";
  const clientValue = recurring ? d.mrr * d.lifetime : d.panierMoyen;
  const caPotentiel = clients * clientValue;
  const roas = spend > 0 ? caPotentiel / spend : 0;
  const profit = (caPotentiel * d.marge) / 100 - spend;
  const roiPct = spend > 0 ? (profit / spend) * 100 : 0;
  const breakEvenRoas = d.marge > 0 ? 100 / d.marge : Infinity;
  const lowSignal = leads > 0 && leads < 30;

  const highSeasonMonths = Array.isArray(d.highSeasonMonths) && d.highSeasonMonths.length === 12
    ? d.highSeasonMonths
    : new Array(12).fill(false);
  const startMonth = d.startMonth >= 0 && d.startMonth <= 11 ? d.startMonth : 0;

  const seasonalMonths = Array.from({ length: 12 }, (_, i) => {
    const calMonth = (startMonth + i) % 12;
    const high = d.seasonalityEnabled && highSeasonMonths[calMonth];
    const coef = high ? d.highSeasonMultiplier || 1 : 1;
    const lm = LEARNING_STEPS_MULT[i] ?? LEARNING_STEPS_MULT[LEARNING_STEPS_MULT.length - 1];
    const mLeads = d.mode === "budget" ? (leads * coef) / lm : leads * coef;
    const mClients = biz.hasClosing ? (mLeads * d.closing) / 100 : mLeads;
    const mCa = mClients * clientValue;
    const mSpend = d.mode === "budget" ? spend * coef : spend * coef * lm;
    return { ca: mCa, spend: mSpend, leads: mLeads, clients: mClients };
  });

  const annualLeads = seasonalMonths.reduce((sum, m) => sum + m.leads, 0);
  const annualClients = seasonalMonths.reduce((sum, m) => sum + m.clients, 0);
  const annualCa = seasonalMonths.reduce((sum, m) => sum + m.ca, 0);
  const annualSpend = seasonalMonths.reduce((sum, m) => sum + m.spend, 0);
  const annualRoas = annualSpend > 0 ? annualCa / annualSpend : 0;
  const annualRoiPct = annualSpend > 0 ? ((annualCa * d.marge) / 100 - annualSpend) / annualSpend * 100 : 0;

  return {
    channelLabel: CHANNEL_LABELS[d.channel] ?? d.channel,
    sectorLabel: SECTOR_LABELS[d.sector] ?? d.sector,
    businessTypeLabel: biz.conversionStage,
    prospect: d.prospect ?? "",
    website: d.website ?? "",
    monthly: {
      impressions: impr,
      clicks,
      leads,
      clients,
      cpl: Math.round(cpl * 100) / 100,
      spend,
      roas: Math.round(roas * 100) / 100,
      roiPct: Math.round(roiPct * 10) / 10,
      breakEvenRoas: Number.isFinite(breakEvenRoas) ? Math.round(breakEvenRoas * 100) / 100 : 0,
    },
    annual: {
      leads: Math.round(annualLeads),
      clients: Math.round(annualClients),
      ca: Math.round(annualCa),
      spend: Math.round(annualSpend),
      roas: Math.round(annualRoas * 100) / 100,
      roiPct: Math.round(annualRoiPct * 10) / 10,
    },
    lowSignal,
  };
}
