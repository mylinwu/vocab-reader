import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { Article } from '../types';
import { FileText, Trash2, Clock, ChevronRight } from 'lucide-react';

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const data = await db.getAllArticles();
    setArticles(data);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this article?')) {
      await db.deleteArticle(id);
      loadArticles();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-pulse text-stone-400">Loading library...</div></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-stone-800">Your Library</h1>
        <Link to="/create" className="bg-macaron-blue hover:bg-macaron-blue-dark text-stone-800 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm">
          Add Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <div className="bg-macaron-pink/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-macaron-pink-dark" />
          </div>
          <h3 className="text-xl font-semibold text-stone-800 mb-2">No articles yet</h3>
          <p className="text-stone-500 mb-8 max-w-sm mx-auto">Add your first article to start learning vocabulary in context with beautiful annotations.</p>
          <Link to="/create" className="text-macaron-blue-dark font-semibold hover:text-stone-800 transition-colors bg-macaron-blue/20 px-6 py-3 rounded-2xl">
            Create an article &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => {
            // Cycle through macaron colors for cards
            const colors = [
              { bg: 'bg-macaron-pink/20', text: 'text-macaron-pink-dark', border: 'hover:border-macaron-pink' },
              { bg: 'bg-macaron-blue/20', text: 'text-macaron-blue-dark', border: 'hover:border-macaron-blue' },
              { bg: 'bg-macaron-green/20', text: 'text-macaron-green-dark', border: 'hover:border-macaron-green' },
              { bg: 'bg-macaron-purple/20', text: 'text-macaron-purple-dark', border: 'hover:border-macaron-purple' },
              { bg: 'bg-macaron-peach/20', text: 'text-macaron-peach-dark', border: 'hover:border-macaron-peach' },
            ];
            const color = colors[index % colors.length];

            return (
              <Link key={article.id} to={`/article/${article.id}`} className={`group block bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-md ${color.border} transition-all duration-300`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`${color.bg} ${color.text} p-3 rounded-2xl`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, article.id)}
                    className="text-stone-300 hover:text-red-400 transition-colors p-2 bg-stone-50 hover:bg-red-50 rounded-xl"
                    title="Delete article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-stone-800 mb-3 line-clamp-2 group-hover:text-stone-900 transition-colors leading-tight">
                  {article.title}
                </h2>
                <div className="flex items-center text-xs font-medium text-stone-400 mt-auto pt-5 border-t border-stone-50">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(article.createdAt).toLocaleDateString()}
                  <div className={`ml-auto flex items-center ${color.text} font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300`}>
                    Read <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
