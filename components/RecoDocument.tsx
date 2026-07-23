"use client";

import type { RecoResult } from "@/lib/types";

function BulletList({ text }: { text: string }) {
  const lines = (text || "")
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2 text-sonate-ink">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sonate-orange" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print-page rounded-2xl border border-sonate-cream-border bg-sonate-ivory-light p-8 shadow-sonate">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-sonate-orange">{title}</h2>
      {children}
    </section>
  );
}

function LabelPill({ label }: { label: string }) {
  const isGood = /bon|ma[iî]tris[ée]|rapide/i.test(label);
  const isBad = /lent|corriger|probl[ée]matique/i.test(label);
  const cls = isGood
    ? "bg-sonate-green-100 text-sonate-green"
    : isBad
    ? "bg-sonate-accent-soft text-sonate-orange-dark"
    : "bg-sonate-cream-border text-sonate-ink-muted";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export default function RecoDocument({ result }: { result: RecoResult }) {
  const { core, lpAudit, competitors, warnings } = result;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      {warnings.length > 0 && (
        <div className="no-print rounded-xl border border-sonate-orange-border bg-sonate-accent-soft p-4 text-sm text-sonate-orange-dark">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {/* Page de garde */}
      <section className="print-page rounded-2xl bg-sonate-green p-10 text-sonate-ivory shadow-sonate">
        <img src="/logo/sonate-logo-vert.png" alt="" className="hidden" />
        <p className="text-sm uppercase tracking-widest text-sonate-orange">Proposition commerciale</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight">{core.nom_entreprise}</h1>
        <p className="mt-2 text-lg text-sonate-ivory/80">{core.expertises_concernees}</p>
        {core.url_site && (
          <p className="mt-4 text-sm text-sonate-ivory/60">{core.url_site}</p>
        )}
      </section>

      {/* Logique marché */}
      <Section title={core.titre_logique_marketing || "Notre approche"}>
        <p className="whitespace-pre-line text-sonate-ink">{core.explication_marche_cible}</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Zones géographiques</p>
            <div className="mt-1 whitespace-pre-line text-sm">{core.zones_geographiques}</div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Ciblage / personae</p>
            <div className="mt-1 whitespace-pre-line text-sm">{core.ciblage_personae}</div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Canaux activés</p>
            <div className="mt-1 whitespace-pre-line text-sm">{core.canaux_actives}</div>
          </div>
        </div>
      </Section>

      {/* Expertises */}
      {core.expertises.map((exp, i) => (
        <Section key={i} title={`Dispositif ${i + 1} — ${exp.nom}`}>
          <p className="mb-4 font-semibold text-sonate-green">{exp.objectifs}</p>
          <BulletList text={exp.strategie} />
          {(exp.leads_estimes || exp.appels_estimes) && (
            <div className="mt-5 flex flex-wrap gap-6 border-t border-sonate-cream-border pt-4">
              {exp.leads_estimes && (
                <div>
                  <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Leads estimés</p>
                  <p className="text-sm font-semibold text-sonate-green">{exp.leads_estimes}</p>
                </div>
              )}
              {exp.appels_estimes && (
                <div>
                  <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Appels estimés</p>
                  <p className="text-sm font-semibold text-sonate-green">{exp.appels_estimes}</p>
                </div>
              )}
            </div>
          )}
        </Section>
      ))}

      {/* Audit landing page */}
      {lpAudit && (
        <Section title="Audit de la landing page">
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Note globale</p>
              <p className="text-2xl font-extrabold text-sonate-green">{lpAudit.lp_note_globale}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Poids</p>
              <p className="text-sm">{lpAudit.lp_poids_affiche} <LabelPill label={lpAudit.lp_poids_label} /></p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-sonate-ink-muted">CTA</p>
              <p className="text-sm font-semibold">{lpAudit.lp_note_cta}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-sonate-ink-muted">Structure</p>
              <p className="text-sm font-semibold">{lpAudit.lp_note_structure}</p>
            </div>
          </div>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-sonate-green-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-sonate-ink-muted">Mobile</p>
              <p className="text-sm">Score : {lpAudit.lp_score_mobile}</p>
              <p className="text-sm">LCP : {lpAudit.lp_lcp_mobile} <LabelPill label={lpAudit.lp_lcp_mobile_label} /></p>
              <p className="text-sm">TTI : {lpAudit.lp_tti_mobile} <LabelPill label={lpAudit.lp_tti_mobile_label} /></p>
            </div>
            <div className="rounded-xl bg-sonate-green-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-sonate-ink-muted">Desktop</p>
              <p className="text-sm">Score : {lpAudit.lp_score_desktop}</p>
              <p className="text-sm">LCP : {lpAudit.lp_lcp_desktop} <LabelPill label={lpAudit.lp_lcp_desktop_label} /></p>
              <p className="text-sm">TTI : {lpAudit.lp_tti_desktop} <LabelPill label={lpAudit.lp_tti_desktop_label} /></p>
            </div>
          </div>
          <p className="mb-4 italic text-sonate-ink-muted">{lpAudit.lp_synthese}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-sonate-ink-muted">Points forts</p>
              <BulletList text={lpAudit.lp_points_forts} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-sonate-ink-muted">Axes d'amélioration</p>
              <BulletList text={lpAudit.lp_points_ameliorer} />
            </div>
          </div>
        </Section>
      )}

      {/* Concurrence */}
      {competitors && (
        <Section title="Analyse concurrentielle">
          <p className="mb-4 text-sm text-sonate-ink-muted">
            Intensité de la concurrence :{" "}
            <span className="font-bold text-sonate-green">{competitors.intensite_concurrence}</span> —{" "}
            {competitors.intensite_analyse}
          </p>
          <div className="space-y-3">
            {competitors.concurrents.map((c, i) => (
              <div key={i} className="rounded-xl border border-sonate-cream-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sonate-green">{c.nom}</p>
                  <a
                    href={c.url_ads}
                    target="_blank"
                    rel="noreferrer"
                    className="no-print text-xs text-sonate-orange hover:underline"
                  >
                    Voir sur Ads Transparency
                  </a>
                </div>
                <p className="mt-1 text-sm text-sonate-ink">{c.analyse}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* KPIs & organisation */}
      <Section title="KPIs suivis & organisation">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-sonate-ink-muted">KPIs estimés</p>
            <BulletList text={core.kpis_estimations} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-sonate-ink-muted">Missions de l'expert dédié</p>
            <BulletList text={core.missions_expert} />
          </div>
        </div>
        <div className="mt-6 border-t border-sonate-cream-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-sonate-ink-muted">Projections chiffrées</p>
          <BulletList text={core.projections_kpis_detail} />
        </div>
        <p className="mt-4 text-sm text-sonate-ink-muted">
          Rythme de reporting : <span className="font-semibold text-sonate-green">{core.rythme_reporting}</span>
        </p>
      </Section>
    </div>
  );
}
