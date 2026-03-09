"use client";

import { useEffect, useState } from "react";
import type { AIModelOption, AISettings } from "../types";
import { getAISettingsDefaults, getAvailableModels } from "../services/aiService";
import { loadStoredSettings, saveStoredSettings } from "../services/settingsStorage";

type State = {
  settings: AISettings | null;
  modelOptions: AIModelOption[];
  loading: boolean;
  error: string;
};

export function useAISettings() {
  const [state, setState] = useState<State>({
    settings: null,
    modelOptions: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const defaults = await getAISettingsDefaults();
        const stored = loadStoredSettings();
        const availableModels =
          stored?.availableModels && stored.availableModels.length > 0
            ? stored.availableModels
            : defaults.models;

        const selectedModel =
          stored?.selectedModel ||
          availableModels[0] ||
          defaults.models[0] ||
          "";

        const settings: AISettings = {
          apiKey: stored?.apiKey ?? defaults.apiKey,
          availableModels,
          selectedModel,
        };

        if (!active) {
          return;
        }

        saveStoredSettings(settings);
        setState({
          settings,
          modelOptions: availableModels.map((id) => ({ id, name: id })),
          loading: false,
          error: "",
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load settings.",
        }));
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.settings || state.loading) {
      return;
    }

    const currentKey = state.settings.apiKey?.trim();
    if (!currentKey && state.settings.availableModels.length > 0) {
      return;
    }

    void refreshModels(currentKey);
  }, [state.loading, state.settings?.apiKey]);

  const updateSettings = (updater: (current: AISettings) => AISettings) => {
    setState((current) => {
      if (!current.settings) {
        return current;
      }

      const nextSettings = updater(current.settings);
      saveStoredSettings(nextSettings);
      return {
        ...current,
        settings: nextSettings,
      };
    });
  };

  const refreshModels = async (apiKey?: string) => {
    setState((current) => ({ ...current, error: "" }));

    try {
      const models = await getAvailableModels(apiKey);
      const modelIds = models.map((model) => model.id);

      setState((current) => {
        if (!current.settings) {
          return current;
        }

        const selectedModel = modelIds.includes(current.settings.selectedModel)
          ? current.settings.selectedModel
          : modelIds[0] || current.settings.selectedModel;

        const settings = {
          ...current.settings,
          apiKey: apiKey ?? current.settings.apiKey,
          availableModels: modelIds.length > 0 ? modelIds : current.settings.availableModels,
          selectedModel,
        };

        saveStoredSettings(settings);

        return {
          ...current,
          settings,
          modelOptions: models.length > 0 ? models : current.modelOptions,
        };
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Failed to load models.",
      }));
    }
  };

  return {
    ...state,
    updateSettings,
    refreshModels,
  };
}
