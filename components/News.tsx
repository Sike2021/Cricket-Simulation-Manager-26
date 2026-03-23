
import React from 'react';
import { NewsArticle } from '../types';

interface NewsProps {
    news: NewsArticle[];
}

const News: React.FC<NewsProps> = ({ news }) => (
    <div className="p-4 h-full flex flex-col bg-white dark:bg-[#1a1a1a] overflow-hidden">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-teal-600 dark:text-teal-400 mb-6 text-center">League News</h2>
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-4">
            {news.map(article => (
                <div key={article.id} className="bg-white dark:bg-gray-800/20 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-xl transition-all hover:border-teal-500/30">
                    <div className="flex justify-between items-start mb-3">
                         <h3 className="font-black text-lg text-teal-600 dark:text-teal-400 leading-tight tracking-tight">{article.headline}</h3>
                         <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-black uppercase tracking-widest text-gray-400 whitespace-nowrap ml-4">{article.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium" dangerouslySetInnerHTML={{__html: article.content}}></p>
                </div>
            ))}
            {news.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="text-4xl mb-2 opacity-20">📰</div>
                    <p className="font-black text-[10px] uppercase tracking-widest">No news yet.</p>
                </div>
            )}
        </div>
    </div>
);

export default News;
