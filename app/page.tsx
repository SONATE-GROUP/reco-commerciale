"use client";

import { useState } from "react";
import RecoDocument from "@/components/RecoDocument";
import type { RecoResult } from "@/lib/types";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecoResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue.");
      }
      setResult(data as RecoResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sonate-ivory px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-8 flex items-center gap-3">
          <img src="/logo/sonate-logo-vert.png" alt="Sonate" className="h-8" />
          <div>
            <h1 className="text-xl font-extrabold text-sonate-green">Générateur de reco commerciale</h1>
            <p className="text-sm text-sonate-ink-muted">
              Colle un transcript d'appel ou un email de prospect pour générer une proposition.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="no-print space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Colle ici le transcript de l'appel ou le contenu de l'email du prospect..."
            className="h-64 w-full rounded-2xl border border-sonate-cream-border bg-sonate-ivory-light p-4 text-sm text-sonate-ink shadow-sonate outline-none focus:border-sonate-green"
            required
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-sonate-green px-6 py-2.5 text-sm font-semibold text-sonate-ivory shadow-sonate transition hover:bg-sonate-green-dark disabled:opacity-50"
            >
              {loading ? "Génération en cours..." : "Générer la reco"}
            </button>
            {result && (
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-sonate-green px-6 py-2.5 text-sm font-semibold text-sonate-green transition hover:bg-sonate-green-100"
              >
                Exporter en PDF
              </button>
            )}
          </div>
          {loading && (
            <p className="text-sm text-sonate-ink-muted">
              Génération de la reco, puis audit de la landing page et analyse concurrentielle si pertinent... cela peut prendre jusqu'à une minute.
            </p>
          )}
          {error && <p className="text-sm font-semibold text-sonate-orange-dark">{error}</p>}
        </form>

        {result && <RecoDocument result={result} />}
      </div>
    </main>
  );
}
