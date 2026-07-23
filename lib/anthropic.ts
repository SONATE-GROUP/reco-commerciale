import Anthropic from "@anthropic-ai/sdk";

/**
 * Appelle Claude et force une réponse structurée via un outil unique,
 * plus fiable que de parser un bloc JSON brut dans le texte de réponse.
 *
 * La clé API peut venir soit de la variable d'environnement ANTHROPIC_API_KEY
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
  const apiKey = opts.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Aucune clé API Anthropic fournie. Renseigne-la dans la page Réglages de l'outil, ou définis ANTHROPIC_API_KEY sur le serveur."
    );
  }
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
    tools: [
      {
        name: "renvoyer_resultat",
        description: "Renvoie le résultat structuré demandé.",
        input_schema: {
          type: "object",
          properties: opts.schema,
          required: Object.keys(opts.schema),
        },
      },
    ],
    tool_choice: { type: "tool", name: "renvoyer_resultat" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude n'a pas renvoyé de résultat structuré exploitable.");
  }
  return toolUse.input as T;
}
