import { get, set, del, keys } from 'idb-keyval';
import { Article } from '../types';

export const db = {
  async saveArticle(article: Article): Promise<void> {
    await set(`article_${article.id}`, article);
  },
  
  async getArticle(id: string): Promise<Article | undefined> {
    return await get(`article_${id}`);
  },
  
  async getAllArticles(): Promise<Article[]> {
    const allKeys = await keys();
    const articleKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('article_'));
    const articles = await Promise.all(articleKeys.map(k => get(k as string)));
    return articles.sort((a, b) => b.createdAt - a.createdAt);
  },
  
  async deleteArticle(id: string): Promise<void> {
    await del(`article_${id}`);
  }
};
