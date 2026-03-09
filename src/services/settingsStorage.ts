"use client";

import type { AISettings } from "../types";

const STORAGE_KEY = "vocab-reader.ai-settings.v1";

export function loadStoredSettings(): Partial<AISettings> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<AISettings>) : null;
  } catch {
    return null;
  }
}

export function saveStoredSettings(settings: AISettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
