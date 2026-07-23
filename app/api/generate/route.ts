import { NextRequest, NextResponse } from "next/server";
import { generateStructured } from "@/lib/openrouter";
import { recoCorePrompt, lpAuditPrompt, competitorsPrompt } from "@/lib/prompts";
import { runPagespeed, extractPagespeedSummary } from "@/lib/pagespeed";
import type { RecoResult, RecoCore, ExpertiseBlock, LpAudit, CompetitorAnalysis } from "@/lib/types";

export const maxDuration = 60;

function isRealUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || /^à\s*d[ée]finir$/i.test(trimmed)) return false;
  try {
    new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(value: string): string {
  return value.startsWith("http") ? value : `https://${value}`;
}

export async function POST(req: NextRequest) {
  let body: { text?: string; openrouterApiKey?: string; pagespeedApiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const inputText = body.text?.trim();
  if (!inputText || inputText.length < 20) {
    return NextResponse.json(
      { error: "Merci de coller un transcript d'appel ou un email suffisamment détaillé." },
      { status: 400 }
    );
  }

  // Clé saisie dans la page Réglages (prioritaire) sinon variable d'environnement du serveur
  const openrouterApiKey = body.openrouterApiKey?.trim() || undefined;
  const pagespeedApiKey = body.pagespeedApiKey?.trim() || undefined;

  const warnings: string[] = [];
  const modelReco = process.env.OPENROUTER_MODEL_RECO || "anthropic/claude-opus-4.6";
  const modelAudit = process.env.OPENROUTER_MODEL_AUDIT || "anthropic/claude-sonnet-4.6";
  const modelCompetitors = process.env.OPENROUTER_MODEL_COMPETITORS || "anthropic/claude-opus-4.6";

  // 1. Génération du coeur de la reco (variables commerciales)
  let rawCore: any;
  try {
    const { system, user, schema } = recoCorePrompt(inputText);
    rawCore = await generateStructured({ model: modelReco, system, user, schema, maxTokens: 8000, apiKey: openrouterApiKey });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Échec de la génération de la reco : ${err.message}` },
      { status: 502 }
    );
  }

  const expertises: ExpertiseBlock[] = [1, 2, 3, 4]
    .map((i) => rawCore[`expertise_${i}`] as ExpertiseBlock | undefined)
    .filter((e): e is ExpertiseBlock => !!e && !!e.nom && e.nom.trim().length > 0);

  const core: RecoCore = {
    expertises_concernees: rawCore.expertises_concernees ?? "",
    nom_entreprise: rawCore.nom_entreprise ?? "",
    url_site: rawCore.url_site ?? "À définir",
    titre_logique_marketing: rawCore.titre_logique_marketing ?? "",
    explication_marche_cible: rawCore.explication_marche_cible ?? "",
    zones_geographiques: rawCore.zones_geographiques ?? "",
    ciblage_personae: rawCore.ciblage_personae ?? "",
    canaux_actives: rawCore.canaux_actives ?? "",
    expertises,
    kpis_estimations: rawCore.kpis_estimations ?? "",
    missions_expert: rawCore.missions_expert ?? "",
    rythme_reporting: rawCore.rythme_reporting ?? "",
    projections_kpis_detail: rawCore.projections_kpis_detail ?? "",
  };

  // 2. Audit de la landing page (PageSpeed) si une URL exploitable est fournie
  let lpAudit: LpAudit | null = null;
  if (isRealUrl(core.url_site)) {
    const url = normalizeUrl(core.url_site);
    try {
      const [mobileRaw, desktopRaw] = await Promise.all([
        runPagespeed(url, "mobile", pagespeedApiKey),
        runPagespeed(url, "desktop", pagespeedApiKey),
      ]);
      const mobile = extractPagespeedSummary(mobileRaw);
      const desktop = extractPagespeedSummary(desktopRaw);
      const { system, user, schema } = lpAuditPrompt({
        nomEntreprise: core.nom_entreprise,
        urlSite: url,
        secteur: core.expertises_concernees,
        mobile,
        desktop,
      });
      lpAudit = await generateStructured<LpAudit>({ model: modelAudit, system, user, schema, maxTokens: 2000, apiKey: openrouterApiKey });
    } catch (err: any) {
      warnings.push(`Audit de la landing page indisponible : ${err.message}`);
    }
  }

  // 3. Analyse concurrentielle (déclenchée quand une expertise Ads est demandée)
  let competitors: CompetitorAnalysis | null = null;
  const hasAdsExpertise = expertises.some((e) => /sea|sma|social ads|google ads/i.test(e.nom));
  if (hasAdsExpertise) {
    try {
      const { system, user, schema } = competitorsPrompt({
        secteur: core.expertises_concernees,
        nomEntreprise: core.nom_entreprise,
        zones: core.zones_geographiques,
        personae: core.ciblage_personae,
        canaux: core.canaux_actives,
      });
      const raw = await generateStructured<any>({ model: modelCompetitors, system, user, schema, maxTokens: 2000, apiKey: openrouterApiKey });
      competitors = {
        concurrents: [raw.concurrent_1, raw.concurrent_2, raw.concurrent_3].filter(Boolean),
        intensite_concurrence: raw.intensite_concurrence ?? "",
        intensite_analyse: raw.intensite_analyse ?? "",
      };
    } catch (err: any) {
      warnings.push(`Analyse concurrentielle indisponible : ${err.message}`);
    }
  }

  const result: RecoResult = { core, lpAudit, competitors, warnings };
  return NextResponse.json(result);
}
