export interface WordToken {
  text: string;
  isWord: boolean;
  translation?: string;
  difficulty?: number;
  role?: string;
}

export interface SentenceData {
  id: string;
  original: string;
  tokens: WordToken[];
}

export interface ParagraphData {
  id: string;
  sentences: SentenceData[];
}

export interface Article {
  id: string;
  title: string;
  paragraphs: ParagraphData[];
  createdAt: number;
}

export interface AISettings {
  apiKey: string;
  selectedModel: string;
  availableModels: string[];
}

export interface AISettingsDefaults {
  apiKey: string;
  models: string[];
}

export interface AIModelOption {
  id: string;
  name: string;
  contextLength?: number;
}
