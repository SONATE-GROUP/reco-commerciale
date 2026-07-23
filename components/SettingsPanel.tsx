"use client";

import { useEffect, useState } from "react";

export const OPENROUTER_KEY_STORAGE = "reco_openrouter_api_key";
export const PAGESPEED_KEY_STORAGE = "reco_pagespeed_api_key";

export function getStoredKeys() {
  if (typeof window === "undefined") return { openrouterApiKey: "", pagespeedApiKey: "" };
  return {
    openrouterApiKey: window.localStorage.getItem(OPENROUTER_KEY_STORAGE) || "",
    pagespeedApiKey: window.localStorage.getItem(PAGESPEED_KEY_STORAGE) || "",
  };
}

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  const [pagespeedApiKey, setPagespeedApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getStoredKeys();
    setOpenrouterApiKey(stored.openrouterApiKey);
    setPagespeedApiKey(stored.pagespeedApiKey);
  }, []);

  function handleSave() {
    window.localStorage.setItem(OPENROUTER_KEY_STORAGE, openrouterApiKey.trim());
    window.localStorage.setItem(PAGESPEED_KEY_STORAGE, pagespeedApiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-sonate-cream-border bg-sonate-ivory-light p-6 shadow-sonate">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-sonate-green">Réglages</h2>
          <button
            onClick={onClose}
            className="text-sonate-ink-muted hover:text-sonate-ink"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-sonate-ink-muted">
          Ces clés restent uniquement dans ton navigateur (jamais envoyées ailleurs qu'à OpenRouter /
          Google pour générer la reco). Si tu changes d'ordinateur ou de navigateur, il faudra les
          resaisir.
        </p>

        <label className="mb-1 block text-xs font-semibold uppercase text-sonate-ink-muted">
          Clé API OpenRouter (obligatoire)
        </label>
        <input
          type="password"
          value={openrouterApiKey}
          onChange={(e) => setOpenrouterApiKey(e.target.value)}
          placeholder="sk-or-..."
          className="mb-1 w-full rounded-xl border border-sonate-cream-border bg-white p-2.5 text-sm outline-none focus:border-sonate-green"
        />
        <p className="mb-4 text-xs text-sonate-ink-muted">
          À récupérer sur{" "}
          <a
            href="https://openrouter.ai/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="text-sonate-orange hover:underline"
          >
            openrouter.ai/settings/keys
          </a>
          .
        </p>

        <label className="mb-1 block text-xs font-semibold uppercase text-sonate-ink-muted">
          Clé API Google PageSpeed (optionnelle)
        </label>
        <input
          type="password"
          value={pagespeedApiKey}
          onChange={(e) => setPagespeedApiKey(e.target.value)}
          placeholder="AIza..."
          className="mb-1 w-full rounded-xl border border-sonate-cream-border bg-white p-2.5 text-sm outline-none focus:border-sonate-green"
        />
        <p className="mb-6 text-xs text-sonate-ink-muted">
          Sans elle, l'audit de la landing page fonctionne quand même, avec un quota plus limité.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="rounded-full bg-sonate-green px-5 py-2 text-sm font-semibold text-sonate-ivory transition hover:bg-sonate-green-dark"
          >
            Enregistrer
          </button>
          {saved && <span className="text-sm font-semibold text-sonate-green-mid">Enregistré ✓</span>}
        </div>
      </div>
    </div>
  );
}
