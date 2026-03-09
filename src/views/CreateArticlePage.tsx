"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../services/db";
import { processSentence } from "../services/aiService";
import { useAISettings } from "../hooks/useAISettings";
import type { Article } from "../types";

export function CreateArticlePage() {
  const router = useRouter();
  const { settings, loading: settingsLoading } = useAISettings();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !content.trim() || !settings) {
      return;
    }

    setError("");
    setProgress(0);
    setIsProcessing(true);

    try {
      const paragraphs = content.split(/\n+/).filter((item) => item.trim().length > 0);
      const article: Article = {
        id: uuidv4(),
        title: title.trim(),
        createdAt: Date.now(),
        paragraphs: [],
      };

      const sentencesToProcess: Array<{ pIndex: number; sIndex: number; text: string }> = [];

      for (let pIndex = 0; pIndex < paragraphs.length; pIndex += 1) {
        const sentences = paragraphs[pIndex]
          .split(/(?<=[.!?])\s+(?=[A-Z"']|$)/)
          .filter((item) => item.trim().length > 0);

        article.paragraphs.push({
          id: uuidv4(),
          sentences: sentences.map((sentence) => ({
            id: uuidv4(),
            original: sentence,
            tokens: [],
          })),
        });

        sentences.forEach((sentence, sIndex) => {
          sentencesToProcess.push({ pIndex, sIndex, text: sentence });
        });
      }

      let processed = 0;
      const batchSize = 5;

      for (let index = 0; index < sentencesToProcess.length; index += batchSize) {
        const batch = sentencesToProcess.slice(index, index + batchSize);
        await Promise.all(
          batch.map(async (item) => {
            const tokens = await processSentence({
              sentence: item.text,
              apiKey: settings.apiKey,
              model: settings.selectedModel,
            });

            article.paragraphs[item.pIndex].sentences[item.sIndex].tokens = tokens;
            processed += 1;
            setProgress(Math.round((processed / sentencesToProcess.length) * 100));
          }),
        );
      }

      await db.saveArticle(article);
      startTransition(() => {
        router.push(`/article/${article.id}`);
      });
    } catch (submitError) {
      setIsProcessing(false);
      setError(submitError instanceof Error ? submitError.message : "Failed to process article.");
    }
  }

  if (isPending) {
    return <div style={{ color: "var(--muted)" }}>Loading article...</div>;
  }

  return (
    <section style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="chip">AI-assisted import</div>
        <h1 className="serif-title" style={{ fontSize: "clamp(2.4rem, 5vw, 4.6rem)", margin: "16px 0 8px" }}>
          Create a new article.
        </h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          Paste English text, then let your configured OpenRouter model annotate each sentence.
        </p>
      </div>

      {isProcessing ? (
        <div className="panel" style={{ padding: 32, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Sparkles size={20} />
            <strong>Analyzing vocabulary</strong>
          </div>
          <div style={{ height: 14, borderRadius: 999, background: "rgba(77, 55, 26, 0.08)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--accent), var(--accent-strong))",
                transition: "width 180ms ease",
              }}
            />
          </div>
          <div style={{ marginTop: 12, color: "var(--muted)" }}>
            {progress > 0 ? `${progress}% complete` : "Submitting article and starting sentence analysis..."}
          </div>
        </div>
      ) : null}

      <form className="panel" style={{ padding: 28, display: "grid", gap: 18 }} onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Article title</div>
          <input
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The Future of Urban Farming"
            disabled={isProcessing}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Article content</div>
          <textarea
            className="textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste your English article here..."
            disabled={isProcessing}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ color: "var(--muted)" }}>
            {settingsLoading
              ? "Loading AI settings..."
              : settings?.selectedModel
                ? `Model: ${settings.selectedModel}`
                : "Configure AI settings before processing."}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              isProcessing ||
              settingsLoading ||
              !settings?.selectedModel ||
              (!settings.apiKey && !settings.selectedModel) ||
              !title.trim() ||
              !content.trim()
            }
          >
            <Sparkles size={16} />
            {isProcessing ? "Processing..." : "Process Article"}
          </button>
        </div>

        {error ? <div style={{ color: "#a33b20" }}>{error}</div> : null}
      </form>
    </section>
  );
}
