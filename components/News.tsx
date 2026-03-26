import React from 'react';
import { NewsArticle } from '../types';
import { Icons } from './Icons';

interface NewsProps {
    news: NewsArticle[];
}

const News: React.FC<NewsProps> = ({ news }) => (
    <div className="p-0 h-full flex flex-col bg-[#050808] overflow-hidden font-sans text-white">
        {/* V2.0 Broadcast Header */}
        <div className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-[#0A0F0F]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Icons.FileText className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
                <p className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em] mb-2">MEDIA_CENTRE // v2.0</p>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8] text-white">
                    LEAGUE<br/>
                    <span className="text-teal-500">NEWS</span>
                </h1>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-4xl mx-auto space-y-6">
                {news.map(article => (
                    <div key={article.id} className="glass-card p-8 border-white/5 hover:border-teal-500/30 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-4">
                             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none group-hover:text-teal-400 transition-colors">{article.headline}</h3>
                             <span className="text-[9px] bg-white/5 px-3 py-1 rounded-full font-black uppercase tracking-widest text-white/40 border border-white/10 whitespace-nowrap ml-6">{article.date}</span>
                        </div>
                        <div className="h-px w-12 bg-teal-500 mb-6 group-hover:w-24 transition-all duration-500" />
                        <p className="text-sm text-white/60 leading-relaxed font-medium" dangerouslySetInnerHTML={{__html: article.content}}></p>
                    </div>
                ))}
                {news.length === 0 && (
                    <div className="glass-card p-20 text-center">
                        <Icons.FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">No news articles available at this time.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default News;
