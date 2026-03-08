export interface WordToken {
  text: string;
  isWord: boolean;
  translation?: string;
  difficulty?: number; // 1 (Hardest), 2 (Medium), 3 (Easiest), 0 (Basic)
  role?: string; // 'subject', 'verb', 'object', 'predicative', 'complement', 'attributive', 'adverbial', 'other'
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
