/**
 * Appelle un modèle via OpenRouter (API compatible OpenAI) et force une
 * réponse structurée via le function calling, plus fiable que de parser un
 * bloc JSON brut dans le texte de réponse.
 *
 * La clé API peut venir soit de la variable d'environnement OPENROUTER_API_KEY
 * (déploiement classique), soit être fournie par l'appelant (clé saisie par
 * l'utilisateur dans la page Réglages de l'outil, transmise à chaque appel).
 */
export async function generateStructured<T>(opts: {
  model: string;
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
  apiKey?: string;
}): Promise<T> {
  const apiKey = opts.apiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Aucune clé API OpenRouter fournie. Renseigne-la dans la page Réglages de l'outil, ou définis OPENROUTER_API_KEY sur le serveur."
    );
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 4096,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "renvoyer_resultat",
            description: "Renvoie le résultat structuré demandé.",
            parameters: {
              type: "object",
              properties: opts.schema,
              required: Object.keys(opts.schema),
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "renvoyer_resultat" } },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenRouter a répondu ${response.status} : ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new Error("Le modèle n'a pas renvoyé de résultat structuré exploitable.");
  }

  try {
    return JSON.parse(toolCall.function.arguments) as T;
  } catch {
    throw new Error("Réponse du modèle illisible (JSON invalide).");
  }
}
