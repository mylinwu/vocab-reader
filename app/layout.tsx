import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { BookOpen, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "VocabReader",
  description: "Read articles with AI-assisted vocabulary annotations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <div className="app-shell">
          <header className="topbar">
            <div className="topbar-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">
                  <BookOpen size={18} />
                </span>
                <span>VocabReader</span>
              </Link>

              <nav className="topnav">
                <Link href="/create" className="nav-link">
                  <PlusCircle size={16} />
                  <span>New Article</span>
                </Link>
                <Link href="/settings" className="nav-link">
                  <Settings size={16} />
                  <span>设置</span>
                </Link>
              </nav>
            </div>
          </header>

          <main className="page-shell">{children}</main>
        </div>
      </body>
    </html>
  );
}
