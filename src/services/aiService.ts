"use client";

import type { AIModelOption, AISettingsDefaults, WordToken } from "../types";

type ProcessSentenceArgs = {
  sentence: string;
  apiKey?: string;
  model?: string;
};

const WORD_PATTERN = /^[a-zA-Z0-9'-]+$/;

export async function getAISettingsDefaults(): Promise<AISettingsDefaults> {
  const response = await fetch("/api/ai/models", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load default AI settings.");
  }

  const data = (await response.json()) as { defaults: AISettingsDefaults };
  return data.defaults;
}

export async function getAvailableModels(apiKey?: string): Promise<AIModelOption[]> {
  const response = await fetch("/api/ai/models", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Failed to load model list.");
  }

  const data = (await response.json()) as { models?: AIModelOption[] };
  return data.models || [];
}

export async function processSentence({
  sentence,
  apiKey,
  model,
}: ProcessSentenceArgs): Promise<WordToken[]> {
  const tokens = sentence.split(/([a-zA-Z0-9'-]+)/);
  const words = tokens.filter((token) => WORD_PATTERN.test(token));

  if (words.length === 0) {
    return tokens.map((token) => ({ text: token, isWord: false }));
  }

  try {
    const response = await fetch("/api/ai/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sentence, apiKey, model }),
    });

    const data = (await response.json()) as {
      items?: Array<{
        word: string;
        translation: string;
        difficulty: number;
        role: string;
      }>;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error || "Failed to process sentence.");
    }

    const queues = new Map<string, NonNullable<typeof data.items>>();
    for (const item of data.items || []) {
      const key = item.word.toLowerCase();
      const existing = queues.get(key) || [];
      existing.push(item);
      queues.set(key, existing);
    }

    return tokens.map((token) => {
      if (!WORD_PATTERN.test(token)) {
        return { text: token, isWord: false };
      }

      const queue = queues.get(token.toLowerCase());
      const item = queue?.shift();
      return {
        text: token,
        isWord: true,
        translation: item?.translation || "",
        difficulty: item?.difficulty || 0,
        role: item?.role || "other",
      };
    });
  } catch (error) {
    console.error("Error processing sentence:", error);
    throw error instanceof Error ? error : new Error("Failed to process sentence.");
  }
}
