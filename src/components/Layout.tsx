import { Link, Outlet } from 'react-router-dom';
import { BookOpen, PlusCircle, Home } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] text-stone-800 font-sans selection:bg-macaron-pink selection:text-stone-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-macaron-blue-dark font-bold text-xl tracking-tight">
            <div className="bg-macaron-blue/30 p-1.5 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>VocabReader</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-stone-500 hover:text-macaron-blue-dark flex items-center gap-1.5 text-sm font-medium transition-colors">
              <Home className="w-4 h-4" />
              <span>Library</span>
            </Link>
            <Link to="/create" className="text-stone-500 hover:text-macaron-blue-dark flex items-center gap-1.5 text-sm font-medium transition-colors">
              <PlusCircle className="w-4 h-4" />
              <span>New Article</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
