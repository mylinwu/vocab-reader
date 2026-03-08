import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { processSentence } from '../services/ai';
import { Article } from '../types';
import { Sparkles } from 'lucide-react';

export default function CreateArticle() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
      const article: Article = {
        id: uuidv4(),
        title: title.trim(),
        createdAt: Date.now(),
        paragraphs: []
      };

      const allSentences: { pIndex: number, sIndex: number, text: string }[] = [];

      for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
        const pText = paragraphs[pIndex];
        // Split by sentence boundaries (.!?) followed by space or end of string
        const sentences = pText.split(/(?<=[.!?])\s+(?=[A-Z"']|$)/).filter(s => s.trim().length > 0);
        
        article.paragraphs.push({
          id: uuidv4(),
          sentences: sentences.map(s => ({ id: uuidv4(), original: s, tokens: [] }))
        });

        for (let sIndex = 0; sIndex < sentences.length; sIndex++) {
          allSentences.push({ pIndex, sIndex, text: sentences[sIndex] });
        }
      }

      const totalSentences = allSentences.length;
      let processedCount = 0;

      // Process in batches of 5 to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < allSentences.length; i += batchSize) {
        const batch = allSentences.slice(i, i + batchSize);
        await Promise.all(batch.map(async (item) => {
          const tokens = await processSentence(item.text);
          article.paragraphs[item.pIndex].sentences[item.sIndex].tokens = tokens;
          processedCount++;
          setProgress(Math.round((processedCount / totalSentences) * 100));
        }));
      }

      await db.saveArticle(article);
      navigate(`/article/${article.id}`);
    } catch (error) {
      console.error("Error creating article:", error);
      alert("An error occurred while processing the article. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-800 mb-4">Create New Article</h1>
        <p className="text-stone-500 text-lg max-w-lg mx-auto">Paste an English article below. Our AI will analyze the vocabulary and generate context-aware translations.</p>
      </div>

      {isProcessing ? (
        <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-macaron-purple/30 mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-macaron-purple border-t-transparent animate-spin"></div>
            <Sparkles className="w-8 h-8 text-macaron-purple-dark animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">Analyzing Vocabulary...</h2>
          <p className="text-stone-500 mb-10 max-w-sm mx-auto text-lg">We are processing your article sentence by sentence to provide accurate, context-aware translations.</p>
          
          <div className="w-full bg-stone-100 rounded-full h-4 mb-3 overflow-hidden p-1">
            <div 
              className="bg-macaron-purple-dark h-full rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm font-bold text-macaron-purple-dark">{progress}% Complete</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl p-8 sm:p-10 border border-stone-100 shadow-sm">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-stone-700 mb-2">Article Title</label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-stone-50 border-transparent focus:bg-white border focus:border-macaron-blue focus:ring-4 focus:ring-macaron-blue/20 outline-none transition-all text-stone-800 font-medium"
              placeholder="e.g., The Impact of Climate Change on Oceans"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-bold text-stone-700 mb-2">Article Content</label>
            <textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-transparent focus:bg-white border focus:border-macaron-blue focus:ring-4 focus:ring-macaron-blue/20 outline-none transition-all resize-y text-stone-800 leading-relaxed"
              placeholder="Paste your English text here..."
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="w-full flex items-center justify-center gap-2 bg-macaron-blue hover:bg-macaron-blue-dark disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed text-stone-800 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm hover:shadow-md"
            >
              <Sparkles className="w-5 h-5" />
              Process Article
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
