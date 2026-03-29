import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Trophy, Calendar, LayoutGrid, List, 
    TrendingUp, TrendingDown, Minus, 
    ChevronRight, Info, Search, Filter,
    BarChart3, Shield, Star
} from 'lucide-react';
import { GameData, Format, Standing, Match } from '../types';
import { Category, getFormatsForCategory, resolveMatch } from '../utils';

interface StandingsProps {
    gameData: GameData;
}

const StandingRow: React.FC<{ standing: Standing; index: number; isFirstClass: boolean }> = ({ standing, index, isFirstClass }) => {
    const isTop4 = index < 4;
    
    return (
        <motion.tr 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border-b border-white/5 transition-all duration-300 hover:bg-teal-500/10 group ${isTop4 ? 'bg-teal-500/5' : ''}`}
        >
            <td className="p-6">
                <div className="flex items-center gap-6">
                    <span className={`text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-xl italic ${isTop4 ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(45,212,191,0.3)]' : 'bg-white/5 text-white/40'}`}>
                        {index + 1}
                    </span>
                    <div className="flex flex-col">
                        <span className="font-black text-lg uppercase tracking-tighter italic group-hover:text-teal-400 transition-colors">
                            {standing.teamName}
                        </span>
                        {isTop4 && <span className="text-[8px] font-mono font-bold text-teal-500 uppercase tracking-widest">QUALIFICATION_ZONE</span>}
                    </div>
                </div>
            </td>
            <td className="p-6 text-center font-mono text-sm font-bold text-white/60">{standing.played}</td>
            <td className="p-6 text-center font-black text-teal-400 text-sm">{standing.won}</td>
            <td className="p-6 text-center font-black text-red-400 text-sm">{standing.lost}</td>
            {isFirstClass && <td className="p-6 text-center font-black text-white/40 text-sm">{standing.drawn}</td>}
            <td className="p-6 text-center">
                <span className="font-black text-teal-400 text-2xl tracking-tighter italic">{standing.points}</span>
            </td>
            <td className="p-6 text-center font-mono text-xs font-bold text-white/40">
                {standing.netRunRate > 0 ? `+${standing.netRunRate.toFixed(2)}` : standing.netRunRate.toFixed(2)}
            </td>
        </motion.tr>
    );
};

const FixtureItem: React.FC<{ match: Match; resolved: Match; result?: any }> = ({ match, resolved, result }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group ${result ? 'bg-teal-500/5 border-teal-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
    >
        {result && (
            <div className="absolute top-0 right-0 bg-teal-500 text-black px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg shadow-teal-500/20">
                FINAL_RESULT
            </div>
        )}
        
        <div className="flex justify-between items-center text-[9px] mb-6 text-white/40 uppercase tracking-[0.3em] font-black">
            <span className="bg-white/10 px-3 py-1 rounded-full text-white/60 border border-white/5">MATCH_{match.matchNumber}</span>
            <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{match.date}</span>
            </div>
        </div>

        <div className="flex items-center justify-between gap-8 mb-6">
            <div className="flex-1 text-right">
                <h4 className="font-black text-2xl tracking-tighter uppercase italic group-hover:text-teal-400 transition-colors leading-none mb-1">{resolved.teamA}</h4>
                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">HOME_TEAM</p>
            </div>
            <div className="relative">
                <div className="px-6 py-2 bg-white/5 rounded-2xl text-[12px] font-black text-white/40 uppercase italic tracking-widest border border-white/5 backdrop-blur-md">VS</div>
                <div className="absolute -inset-4 bg-teal-500/5 blur-xl rounded-full -z-10" />
            </div>
            <div className="flex-1 text-left">
                <h4 className="font-black text-2xl tracking-tighter uppercase italic group-hover:text-teal-400 transition-colors leading-none mb-1">{resolved.teamB}</h4>
                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">AWAY_TEAM</p>
            </div>
        </div>

        {result && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-teal-400 font-black italic uppercase tracking-tight mb-2">{result.summary}</p>
                <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">VERIFIED</span>
                    </div>
                </div>
            </div>
        )}
    </motion.div>
);

const Standings: React.FC<StandingsProps> = ({ gameData }) => {
    const [category, setCategory] = useState<Category>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);
    const [view, setView] = useState<'standings' | 'fixtures'>('standings');

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category]);

    const standings = gameData.standings[selectedFormat] || [];
    const schedule = gameData.schedule[selectedFormat] || [];
    const isFirstClass = selectedFormat === Format.SHIELD;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Trophy className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">LEAGUE_TABLES // v2.0</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            SEASON<br/>
                            <span className="text-teal-500">{view === 'standings' ? 'STANDINGS' : 'FIXTURES'}</span>
                        </h1>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                        <button 
                            onClick={() => setView('standings')} 
                            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${view === 'standings' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                        >
                            League Table
                        </button>
                        <button 
                            onClick={() => setView('fixtures')} 
                            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${view === 'fixtures' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                        >
                            Match Schedule
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-6 mt-12 relative z-10">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        {['T20', 'List A', 'First Class'].map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setCategory(cat as any)} 
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${category === cat ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">FORMAT:</p>
                        <div className="flex gap-2">
                            {getFormatsForCategory(category).map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setSelectedFormat(fmt)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFormat === fmt ? 'bg-white/10 text-teal-400 border border-teal-500/30' : 'text-white/20 hover:text-white/40 border border-transparent'}`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                            <Info className="w-3 h-3 text-teal-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                Top 4 Teams Qualify for Playoffs
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {view === 'standings' ? (
                            <motion.div 
                                key="table"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-card rounded-[40px] border-white/5 overflow-hidden shadow-2xl"
                            >
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="p-8 font-black text-[10px] uppercase tracking-[0.3em] text-white/40">TEAM_IDENTITY</th>
                                            <th className="p-8 text-center font-black text-[10px] uppercase tracking-[0.3em] text-white/40">P</th>
                                            <th className="p-8 text-center font-black text-[10px] uppercase tracking-[0.3em] text-white/40">W</th>
                                            <th className="p-8 text-center font-black text-[10px] uppercase tracking-[0.3em] text-white/40">L</th>
                                            {isFirstClass && <th className="p-8 text-center font-black text-[10px] uppercase tracking-[0.3em] text-white/40">D</th>}
                                            <th className="p-8 text-center font-black text-[10px] uppercase tracking-[0.3em] text-white/40">PTS</th>
                                            <th className="p-8 text-center font-black text-[10px] uppercase tracking-[0.3em] text-white/40">NRR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {standings.map((standing, idx) => (
                                            <StandingRow key={standing.teamId} standing={standing} index={idx} isFirstClass={isFirstClass} />
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="fixtures"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {schedule.map((match, idx) => {
                                    const resolved = resolveMatch(match, gameData, selectedFormat);
                                    const result = gameData.matchResults[selectedFormat]?.find(r => r.matchNumber === match.matchNumber);
                                    return (
                                        <FixtureItem key={idx} match={match} resolved={resolved} result={result} />
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Standings;
