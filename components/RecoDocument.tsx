"use client";

import type { RecoResult } from "@/lib/types";

function BulletList({ text, spaced = false }: { text: string; spaced?: boolean }) {
  const lines = (text || "")
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className={spaced ? "space-y-4" : "space-y-3"}>
      {lines.map((line, i) => (
        <li key={i} className="flex gap-3 text-sonate-ink">
          <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-sonate-orange" />
          <span className="text-base leading-relaxed">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({
  eyebrow,
  title,
  index,
  total,
  children,
}: {
  eyebrow?: string;
  title: string;
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <section className="print-page print-break flex min-h-[70vh] flex-col justify-center rounded-3xl border border-sonate-cream-border bg-sonate-ivory-light px-10 py-14 shadow-sonate sm:px-16">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sonate-orange">
          {eyebrow ?? "Recommandation"}
        </p>
        <p className="text-sm font-medium text-sonate-ink-muted">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>
      <h2 className="mb-10 text-3xl font-extrabold leading-tight text-sonate-green">{title}</h2>
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
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}

function StatCard({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-sonate-green-50 p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">{label}</p>
      <p className="text-2xl font-extrabold text-sonate-green">{value}</p>
      {extra}
    </div>
  );
}

export default function RecoDocument({ result }: { result: RecoResult }) {
  const { core, lpAudit, competitors, warnings } = result;

  const sections: { eyebrow: string; title: string; content: React.ReactNode }[] = [];

  sections.push({
    eyebrow: "Notre approche",
    title: core.titre_logique_marketing || "Notre approche",
    content: (
      <div className="space-y-10">
        <p className="whitespace-pre-line text-lg leading-relaxed text-sonate-ink">
          {core.explication_marche_cible}
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-sonate-cream-border p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">
              Zones géographiques
            </p>
            <div className="whitespace-pre-line text-base leading-relaxed">{core.zones_geographiques}</div>
          </div>
          <div className="rounded-2xl border border-sonate-cream-border p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">
              Ciblage / personae
            </p>
            <div className="whitespace-pre-line text-base leading-relaxed">{core.ciblage_personae}</div>
          </div>
          <div className="rounded-2xl border border-sonate-cream-border p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">
              Canaux activés
            </p>
            <div className="whitespace-pre-line text-base leading-relaxed">{core.canaux_actives}</div>
          </div>
        </div>
      </div>
    ),
  });

  core.expertises.forEach((exp, i) => {
    sections.push({
      eyebrow: `Dispositif ${i + 1}`,
      title: exp.nom,
      content: (
        <div className="space-y-10">
          <p className="text-xl font-semibold leading-snug text-sonate-green">{exp.objectifs}</p>
          <BulletList text={exp.strategie} spaced />
          {(exp.leads_estimes || exp.appels_estimes) && (
            <div className="flex flex-wrap gap-6 border-t border-sonate-cream-border pt-8">
              {exp.leads_estimes && (
                <StatCard label="Leads estimés" value={exp.leads_estimes} />
              )}
              {exp.appels_estimes && (
                <StatCard label="Appels estimés" value={exp.appels_estimes} />
              )}
            </div>
          )}
        </div>
      ),
    });
  });

  if (lpAudit) {
    sections.push({
      eyebrow: "Diagnostic digital",
      title: "Audit de la landing page",
      content: (
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <StatCard label="Note globale" value={lpAudit.lp_note_globale} />
            <StatCard
              label="Poids"
              value={lpAudit.lp_poids_affiche}
              extra={<div className="mt-2"><LabelPill label={lpAudit.lp_poids_label} /></div>}
            />
            <StatCard label="CTA" value={lpAudit.lp_note_cta} />
            <StatCard label="Structure" value={lpAudit.lp_note_structure} />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-sonate-cream-border p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">Mobile</p>
              <div className="space-y-2 text-base">
                <p>Score : <span className="font-semibold">{lpAudit.lp_score_mobile}</span></p>
                <p className="flex items-center gap-2">LCP : {lpAudit.lp_lcp_mobile} <LabelPill label={lpAudit.lp_lcp_mobile_label} /></p>
                <p className="flex items-center gap-2">TTI : {lpAudit.lp_tti_mobile} <LabelPill label={lpAudit.lp_tti_mobile_label} /></p>
              </div>
            </div>
            <div className="rounded-2xl border border-sonate-cream-border p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">Desktop</p>
              <div className="space-y-2 text-base">
                <p>Score : <span className="font-semibold">{lpAudit.lp_score_desktop}</span></p>
                <p className="flex items-center gap-2">LCP : {lpAudit.lp_lcp_desktop} <LabelPill label={lpAudit.lp_lcp_desktop_label} /></p>
                <p className="flex items-center gap-2">TTI : {lpAudit.lp_tti_desktop} <LabelPill label={lpAudit.lp_tti_desktop_label} /></p>
              </div>
            </div>
          </div>
          <p className="text-lg italic leading-relaxed text-sonate-ink-muted">{lpAudit.lp_synthese}</p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">Points forts</p>
              <BulletList text={lpAudit.lp_points_forts} />
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">
                Axes d'amélioration
              </p>
              <BulletList text={lpAudit.lp_points_ameliorer} />
            </div>
          </div>
        </div>
      ),
    });
  }

  if (competitors) {
    sections.push({
      eyebrow: "Veille marché",
      title: "Analyse concurrentielle",
      content: (
        <div className="space-y-8">
          <p className="text-lg leading-relaxed text-sonate-ink-muted">
            Intensité de la concurrence :{" "}
            <span className="text-xl font-extrabold text-sonate-green">{competitors.intensite_concurrence}</span>
            <br />
            {competitors.intensite_analyse}
          </p>
          <div className="space-y-4">
            {competitors.concurrents.map((c, i) => (
              <div key={i} className="rounded-2xl border border-sonate-cream-border p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-lg font-semibold text-sonate-green">{c.nom}</p>
                  <a
                    href={c.url_ads}
                    target="_blank"
                    rel="noreferrer"
                    className="no-print shrink-0 text-sm text-sonate-orange hover:underline"
                  >
                    Voir sur Ads Transparency
                  </a>
                </div>
                <p className="mt-2 text-base leading-relaxed text-sonate-ink">{c.analyse}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  sections.push({
    eyebrow: "Pilotage",
    title: "KPIs suivis & organisation",
    content: (
      <div className="space-y-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">
              KPIs estimés
            </p>
            <BulletList text={core.kpis_estimations} spaced />
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">
              Missions de l'expert dédié
            </p>
            <BulletList text={core.missions_expert} spaced />
          </div>
        </div>
        <div className="border-t border-sonate-cream-border pt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sonate-ink-muted">
            Projections chiffrées
          </p>
          <BulletList text={core.projections_kpis_detail} spaced />
        </div>
        <p className="text-base text-sonate-ink-muted">
          Rythme de reporting : <span className="font-semibold text-sonate-green">{core.rythme_reporting}</span>
        </p>
      </div>
    ),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-14">
      {warnings.length > 0 && (
        <div className="no-print rounded-2xl border border-sonate-orange-border bg-sonate-accent-soft p-5 text-sm text-sonate-orange-dark">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {/* Page de garde */}
      <section className="print-page print-break flex min-h-[70vh] flex-col justify-center rounded-3xl bg-sonate-green px-10 py-16 text-sonate-ivory shadow-sonate sm:px-16">
        <img src="/logo/sonate-logo-vert.png" alt="" className="hidden" />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sonate-orange">
          Proposition commerciale
        </p>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight">{core.nom_entreprise}</h1>
        <p className="mt-4 text-2xl text-sonate-ivory/80">{core.expertises_concernees}</p>
        {core.url_site && <p className="mt-10 text-base text-sonate-ivory/60">{core.url_site}</p>}
      </section>

      {sections.map((s, i) => (
        <Section key={i} eyebrow={s.eyebrow} title={s.title} index={i + 1} total={sections.length}>
          {s.content}
        </Section>
      ))}
    </div>
  );
}
