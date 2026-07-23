export interface ExpertiseBlock {
  nom: string;
  strategie: string;
  objectifs: string;
  leads_estimes: string;
  appels_estimes: string;
}

export interface RecoCore {
  expertises_concernees: string;
  nom_entreprise: string;
  url_site: string;
  titre_logique_marketing: string;
  explication_marche_cible: string;
  zones_geographiques: string;
  ciblage_personae: string;
  canaux_actives: string;
  expertises: ExpertiseBlock[]; // 1 à 4 expertises
  kpis_estimations: string;
  missions_expert: string;
  rythme_reporting: string;
  projections_kpis_detail: string;
}

export interface LpAudit {
  lp_note_globale: string;
  lp_note_poids: string;
  lp_note_cta: string;
  lp_note_structure: string;
  lp_poids_affiche: string;
  lp_score_mobile: string;
  lp_lcp_mobile: string;
  lp_tti_mobile: string;
  lp_score_desktop: string;
  lp_lcp_desktop: string;
  lp_tti_desktop: string;
  lp_perf_label: string;
  lp_lcp_mobile_label: string;
  lp_tti_mobile_label: string;
  lp_lcp_desktop_label: string;
  lp_tti_desktop_label: string;
  lp_poids_label: string;
  lp_synthese: string;
  lp_points_forts: string;
  lp_points_ameliorer: string;
}

export interface Competitor {
  nom: string;
  url_ads: string;
  analyse: string;
}

export interface CompetitorAnalysis {
  concurrents: Competitor[];
  intensite_concurrence: string;
  intensite_analyse: string;
}

export interface RecoResult {
  core: RecoCore;
  lpAudit: LpAudit | null;
  competitors: CompetitorAnalysis | null;
  warnings: string[];
}
