import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { getDefaultApiKey, getDefaultModels } from "@/src/server/env";

const requestSchema = z.object({
  sentence: z.string().min(1),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

const analysisSchema = z.array(
  z.object({
    word: z.string(),
    translation: z.string(),
    difficulty: z.number().int().min(0).max(3),
    role: z.string(),
  }),
);

function serializeError(error: unknown, depth = 0): unknown {
  if (depth > 3) {
    return "[Max depth reached]";
  }

  if (error instanceof Error) {
    const errorRecord = error as unknown as Record<string, unknown>;
    const ownProps = Object.fromEntries(
      Object.getOwnPropertyNames(error).map((key) => [
        key,
        serializeError(errorRecord[key], depth + 1),
      ]),
    );

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...ownProps,
      cause:
        "cause" in error
          ? serializeError((error as Error & { cause?: unknown }).cause, depth + 1)
          : undefined,
    };
  }

  if (Array.isArray(error)) {
    return error.map((item) => serializeError(item, depth + 1));
  }

  if (error && typeof error === "object") {
    return Object.fromEntries(
      Object.entries(error).map(([key, value]) => [key, serializeError(value, depth + 1)]),
    );
  }

  return error;
}

function extractJsonArray(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("[")) {
    return trimmed;
  }

  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new Error("Model did not return a JSON array.");
}

export async function POST(request: Request) {
  let model = "";
  let sentence = "";

  try {
    const payload = requestSchema.parse(await request.json());
    const apiKey = payload.apiKey?.trim() || getDefaultApiKey();
    model = payload.model?.trim() || getDefaultModels()[0];
    sentence = payload.sentence;

    if (!apiKey) {
      return Response.json(
        { error: "Missing API key. Configure it in settings or .env." },
        { status: 400 },
      );
    }

    if (!model) {
      return Response.json(
        { error: "No default model is configured. Check DEFAULT_AI_MODELS." },
        { status: 400 },
      );
    }

    const openrouter = createOpenRouter({ apiKey });
    const words = payload.sentence
      .split(/([a-zA-Z0-9'-]+)/)
      .filter((token) => /^[a-zA-Z0-9'-]+$/.test(token));

    const result = await generateText({
      model: openrouter(model),
      prompt: `Analyze the following English sentence. For each word in the provided list, return its context-aware Chinese translation, difficulty level, and syntactic role.

Difficulty levels:
0: Basic words that do not need translation
1: Hardest words
2: Medium difficulty
3: Easier but still meaningful words

Syntactic roles:
subject, verb, object, predicative, complement, attributive, adverbial, other

Output requirements:
- Return only a JSON array.
- Do not wrap it in Markdown code fences.
- Each item must have exactly these keys: word, translation, difficulty, role.
- translation must be an empty string when difficulty is 0.
- Keep the same number of items and the same word spellings as the input list.

Context sentence: ${payload.sentence}
Words to analyze: ${JSON.stringify(words)}`,
    });

    const parsedItems = analysisSchema.parse(JSON.parse(extractJsonArray(result.text)));

    return Response.json({ items: parsedItems });
  } catch (error) {
    const serialized = serializeError(error);

    console.error("[api/ai/process] provider error", {
      model,
      sentenceLength: sentence.length,
      sentencePreview: sentence.slice(0, 160),
      error: serialized,
    });

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Failed to process sentence.";

    return Response.json({ error: message }, { status: 500 });
  }
}
