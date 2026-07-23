export async function runPagespeed(
  url: string,
  strategy: "mobile" | "desktop",
  apiKey?: string
) {
  const params = new URLSearchParams();
  params.set("url", url);
  params.set("strategy", strategy);
  params.append("category", "performance");
  params.append("category", "accessibility");
  params.set("locale", "fr");
  const key = apiKey || process.env.PAGESPEED_API_KEY;
  if (key) {
    params.set("key", key);
  }

  const res = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`
  );
  if (!res.ok) {
    throw new Error(`PageSpeed API a répondu ${res.status} pour ${strategy}`);
  }
  return res.json();
}

/** Extrait un sous-ensemble léger et pertinent du rapport PageSpeed pour ne pas
 * saturer le prompt Claude avec des dizaines de Ko de JSON inutile. */
export function extractPagespeedSummary(raw: any) {
  const audits = raw?.lighthouseResult?.audits ?? {};
  const categories = raw?.lighthouseResult?.categories ?? {};
  const metricsItems = audits?.metrics?.details?.items?.[0] ?? {};

  return {
    performanceScore: categories?.performance?.score ?? null,
    accessibilityScore: categories?.accessibility?.score ?? null,
    totalByteWeight: audits?.["total-byte-weight"]?.numericValue ?? null,
    lcpDisplay: audits?.["largest-contentful-paint"]?.displayValue ?? null,
    ttiDisplay: audits?.interactive?.displayValue ?? null,
    totalBlockingTimeMs: metricsItems?.totalBlockingTime ?? null,
    cumulativeLayoutShift: metricsItems?.cumulativeLayoutShift ?? null,
  };
}
