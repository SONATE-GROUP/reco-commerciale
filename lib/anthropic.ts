import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY manquante. Ajoute-la dans .env.local (voir .env.example)."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Appelle Claude et force une réponse structurée via un outil unique,
 * plus fiable que de parser un bloc JSON brut dans le texte de réponse.
 */
export async function generateStructured<T>(opts: {
  model: string;
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getClient();

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
