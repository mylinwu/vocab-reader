import { getDefaultApiKey, getDefaultModels } from "@/src/server/env";

type OpenRouterModel = {
  id: string;
  name?: string;
  context_length?: number;
};

export async function GET() {
  return Response.json({
    defaults: {
      apiKey: getDefaultApiKey(),
      models: getDefaultModels(),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { apiKey?: string };
    const apiKey = body.apiKey?.trim() || getDefaultApiKey();

    if (!apiKey) {
      return Response.json({
        defaults: {
          apiKey: "",
          models: getDefaultModels(),
        },
        models: getDefaultModels().map((id) => ({ id, name: id })),
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Failed to fetch models from OpenRouter." },
        { status: response.status },
      );
    }

    const data = (await response.json()) as { data?: OpenRouterModel[] };
    const models =
      data.data?.map((model) => ({
        id: model.id,
        name: model.name || model.id,
        contextLength: model.context_length,
      })) || [];

    return Response.json({
      defaults: {
        apiKey,
        models: getDefaultModels(),
      },
      models,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load models.";
    return Response.json({ error: message }, { status: 500 });
  }
}
