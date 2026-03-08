import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Article } from '../types';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import clsx from 'clsx';

export default function ReadArticle() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 0: Hide all
  // 1: Show Level 1 (Hardest)
  // 2: Show Level 1 & 2
  // 3: Show Level 1, 2 & 3
  const [displayLevel, setDisplayLevel] = useState(0);

  useEffect(() => {
    if (id) {
      db.getArticle(id).then(data => {
        setArticle(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  const toggleDisplayLevel = () => {
    setDisplayLevel((prev) => (prev + 1) % 4);
  };

  const getLevelDescription = () => {
    switch (displayLevel) {
      case 0: return "Hidden";
      case 1: return "Hardest Words";
      case 2: return "Medium + Hard Words";
      case 3: return "All Words";
      default: return "";
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-pulse text-stone-400">Loading article...</div></div>;
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Article not found</h2>
        <Link to="/" className="text-macaron-blue-dark hover:underline font-medium">Return to library</Link>
      </div>
    );
  }

  const shouldShowTranslation = (difficulty: number) => {
    if (displayLevel === 0) return false;
    if (difficulty === 0) return false; // Basic words never shown
    
    // Level 1: Only difficulty 1
    // Level 2: Difficulty 1 and 2
    // Level 3: Difficulty 1, 2, and 3
    return difficulty <= displayLevel;
  };

  return (
    <div className="w-full pb-20">
      <div className="mb-8 flex items-center justify-between sticky top-16 bg-[#FFFBF0]/90 backdrop-blur-md py-4 z-10 border-b border-stone-200/50">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Link>
        
        <button
          onClick={toggleDisplayLevel}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border",
            displayLevel === 0 
              ? "bg-white border-stone-200 text-stone-600 hover:bg-stone-50" 
              : "bg-macaron-yellow border-macaron-yellow-dark text-stone-800 hover:bg-[#FDFD96]/80"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Mark Words: {getLevelDescription()}</span>
        </button>
      </div>

      <article className="bg-white rounded-[2.5rem] p-8 sm:p-14 shadow-sm border border-stone-100">
        <header className="mb-12 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-stone-800 font-serif leading-tight mb-6">{article.title}</h1>
          <div className="flex items-center justify-center text-sm font-medium text-stone-400 gap-2 bg-stone-50 inline-flex px-4 py-2 rounded-full">
            <BookOpen className="w-4 h-4" />
            <span>Reading Mode</span>
          </div>
        </header>

        <div className="space-y-6 text-lg sm:text-xl text-stone-700 leading-[2.2] font-serif">
          {article.paragraphs.map(paragraph => (
            <p key={paragraph.id} className="text-justify">
              {paragraph.sentences.map(sentence => (
                <span key={sentence.id} className="mr-1.5">
                  {sentence.tokens.map((token, i) => {
                    const showTrans = token.isWord && token.difficulty && shouldShowTranslation(token.difficulty);
                    
                    if (!token.isWord) {
                      return <span key={i}>{token.text}</span>;
                    }

                    if (showTrans) {
                      return (
                        <ruby key={i} className={clsx("mx-[2px] rounded-md px-1 py-0.5 transition-colors", "bg-macaron-blue/30 text-macaron-blue-dark")}>
                          <span className="text-stone-900 font-medium">{token.text}</span>
                          <rt className="text-[13px] font-sans font-bold tracking-wide select-none">
                            <span className="block pt-1 leading-none">{token.translation}</span>
                          </rt>
                        </ruby>
                      );
                    }

                    return (
                      <span key={i} className="relative inline-block group mx-[1px]">
                        <span className="hover:bg-macaron-yellow/40 rounded px-1 py-0.5 transition-colors cursor-default">
                          {token.text}
                        </span>
                        {token.translation && token.difficulty !== 0 && (
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-stone-800 text-white text-sm font-sans font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                            {token.translation}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800"></div>
                          </span>
                        )}
                      </span>
                    );
                  })}
                </span>
              ))}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
