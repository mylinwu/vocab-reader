const splitModels = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function getDefaultApiKey() {
  return process.env.DEFAUT_API_KEY?.trim() || "";
}

export function getDefaultModels() {
  const envValue = process.env.DEFAULT_AI_MODELS?.trim() || "";
  const models = envValue ? splitModels(envValue) : [];
  return models.length > 0 ? models : ["openai/gpt-4o-mini"];
}
