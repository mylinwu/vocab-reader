"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import { db } from "../services/db";
import type { Article } from "../types";

export function ReadArticlePage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayLevel, setDisplayLevel] = useState(0);

  useEffect(() => {
    if (!params?.id) {
      return;
    }

    db.getArticle(params.id).then((data) => {
      setArticle(data || null);
      setLoading(false);
    });
  }, [params?.id]);

  function shouldShowTranslation(difficulty: number) {
    if (displayLevel === 0 || difficulty === 0) {
      return false;
    }
    return difficulty <= displayLevel;
  }

  function getLevelDescription() {
    if (displayLevel === 0) return "Hidden";
    if (displayLevel === 1) return "Hard";
    if (displayLevel === 2) return "Medium + Hard";
    return "All";
  }

  if (loading) {
    return <div style={{ padding: "96px 0", textAlign: "center", color: "var(--muted)" }}>Loading article...</div>;
  }

  if (!article) {
    return (
      <div className="panel" style={{ padding: 32, textAlign: "center" }}>
        <h1 className="serif-title">Article not found</h1>
        <Link href="/" className="btn btn-secondary">Return to library</Link>
      </div>
    );
  }

  return (
    <section style={{ display: "grid", gap: 18, paddingBottom: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back
        </Link>

        <button
          type="button"
          className={`btn ${displayLevel === 0 ? "btn-secondary" : "btn-primary"}`}
          onClick={() => setDisplayLevel((value) => (value + 1) % 4)}
        >
          <Layers size={16} />
          Mark Words: {getLevelDescription()}
        </button>
      </div>

      <article className="panel" style={{ padding: "32px clamp(20px, 5vw, 56px)" }}>
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 className="serif-title" style={{ fontSize: "clamp(2.2rem, 5vw, 4.4rem)", margin: 0 }}>
            {article.title}
          </h1>
        </header>

        <div style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(1.1rem, 2vw, 1.45rem)", lineHeight: 2.15 }}>
          {article.paragraphs.map((paragraph) => (
            <p key={paragraph.id} style={{ margin: "0 0 1.2em", textAlign: "justify" }}>
              {paragraph.sentences.map((sentence) => (
                <span key={sentence.id}>
                  {sentence.tokens.map((token, index) => {
                    if (!token.isWord) {
                      return <span key={index}>{token.text}</span>;
                    }

                    if (shouldShowTranslation(token.difficulty || 0)) {
                      return (
                        <ruby
                          key={index}
                          style={{
                            background: "rgba(197, 221, 232, 0.4)",
                            borderRadius: 8,
                            padding: "0 4px",
                            margin: "0 1px",
                          }}
                        >
                          <span>{token.text}</span>
                          <rt style={{ fontFamily: "var(--font-body), sans-serif", fontSize: 12, fontWeight: 700, paddingTop: 2 }}>
                            {token.translation}
                          </rt>
                        </ruby>
                      );
                    }

                    return (
                      <span key={index} title={token.translation || ""} style={{ padding: "0 2px" }}>
                        {token.text}
                      </span>
                    );
                  })}
                </span>
              ))}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
