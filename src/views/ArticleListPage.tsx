"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, FileText, Trash2 } from "lucide-react";
import { db } from "../services/db";
import type { Article } from "../types";

export function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadArticles();
  }, []);

  async function loadArticles() {
    const data = await db.getAllArticles();
    setArticles(data);
    setLoading(false);
  }

  async function handleDelete(event: React.MouseEvent, id: string) {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm("Are you sure you want to delete this article?")) {
      await db.deleteArticle(id);
      await loadArticles();
    }
  }

  if (loading) {
    return <div style={{ padding: "96px 0", textAlign: "center", color: "var(--muted)" }}>Loading library...</div>;
  }

  return (
    <section style={{ display: "grid", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <div className="chip">Context-first vocabulary reading</div>
          <h1 className="serif-title" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)", margin: "16px 0 8px" }}>
            Your library.
          </h1>
          <p style={{ maxWidth: 620, margin: 0, color: "var(--muted)", fontSize: "1.05rem" }}>
            Build a private reading shelf, then open any article with layered vocabulary glosses.
          </p>
        </div>

        <Link href="/create" className="btn btn-primary">
          Add Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              background: "linear-gradient(135deg, var(--sky), #fff)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={40} />
          </div>
          <h2 className="serif-title" style={{ fontSize: "2rem", marginBottom: 8 }}>No articles yet</h2>
          <p style={{ color: "var(--muted)", maxWidth: 420, margin: "0 auto 24px" }}>
            Paste an English article, then let the AI annotate words by difficulty and role.
          </p>
          <Link href="/create" className="btn btn-secondary">Create the first one</Link>
        </div>
      ) : (
        <div className="grid-cards">
          {articles.map((article, index) => {
            const backgrounds = [
              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(241,214,196,0.52))",
              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(197,221,232,0.48))",
              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(216,232,206,0.55))",
            ];

            return (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="panel"
                style={{
                  padding: 22,
                  display: "grid",
                  gap: 18,
                  background: backgrounds[index % backgrounds.length],
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div className="chip" style={{ color: "var(--text)" }}>
                    <FileText size={14} />
                    Saved
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ minHeight: 40, padding: "0 12px" }}
                    onClick={(event) => void handleDelete(event, article.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div>
                  <h2 className="serif-title" style={{ fontSize: "1.65rem", margin: 0 }}>
                    {article.title}
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)" }}>
                  <Clock size={14} />
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    Read
                    <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
