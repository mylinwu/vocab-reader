import { GoogleGenAI, Type } from "@google/genai";
import { WordToken } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function processSentence(sentence: string): Promise<WordToken[]> {
  // Split by words and non-words. Keep punctuation and spaces intact.
  const tokens = sentence.split(/([a-zA-Z0-9'-]+)/);
  const words = tokens.filter(t => /^[a-zA-Z0-9'-]+$/.test(t));
  
  if (words.length === 0) {
    return tokens.map(t => ({ text: t, isWord: false }));
  }

  const prompt = `Analyze the following English sentence. For each word provided in the list, provide its context-aware Chinese translation, its difficulty level, and its syntactic role in the sentence.
Difficulty levels:
1: Hardest / High-frequency exam words
2: Medium difficulty
3: Easiest / Low-frequency words
0: Basic words (e.g., a, the, is, punctuation, pronouns, simple prepositions) that don't need translation.

Syntactic roles (choose one):
- "subject" (主语)
- "verb" (谓语)
- "object" (宾语)
- "predicative" (表语)
- "complement" (补语)
- "attributive" (定语)
- "adverbial" (状语)
- "other" (其他)

Context Sentence: "${sentence}"
Words to analyze: ${JSON.stringify(words)}

Return a JSON array of objects with 'word', 'translation', 'difficulty', and 'role'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              translation: { type: Type.STRING },
              difficulty: { type: Type.INTEGER },
              role: { type: Type.STRING }
            },
            required: ["word", "translation", "difficulty", "role"]
          }
        }
      }
    });

    const aiResults = JSON.parse(response.text || "[]");
    
    // Create a map of queues to handle multiple occurrences of the same word
    const wordQueues = new Map<string, any[]>();
    for (const res of aiResults) {
      const w = res.word.toLowerCase();
      if (!wordQueues.has(w)) wordQueues.set(w, []);
      wordQueues.get(w)!.push(res);
    }

    return tokens.map(t => {
      const isWord = /^[a-zA-Z0-9'-]+$/.test(t);
      if (isWord) {
        const w = t.toLowerCase();
        const queue = wordQueues.get(w);
        const res = queue && queue.length > 0 ? queue.shift() : null;
        return {
          text: t,
          isWord: true,
          translation: res?.translation || "",
          difficulty: res?.difficulty || 0,
          role: res?.role || "other"
        };
      } else {
        return { text: t, isWord: false };
      }
    });
  } catch (error) {
    console.error("Error processing sentence:", error);
    // Fallback
    return tokens.map(t => ({
      text: t,
      isWord: /^[a-zA-Z0-9'-]+$/.test(t),
      translation: "",
      difficulty: 0,
      role: "other"
    }));
  }
}
