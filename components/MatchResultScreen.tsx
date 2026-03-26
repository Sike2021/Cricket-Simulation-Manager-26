import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Trophy, Award, Star, Users, 
    ChevronRight, Check, Lock, Zap,
    Shield, BarChart3, History, Calendar,
    TrendingUp, DollarSign, Briefcase,
    Info, AlertCircle, UserPlus, UserMinus,
    ArrowLeft, LayoutGrid, List, Search, Filter
} from 'lucide-react';
import { MatchResult, Inning } from '../types';
import { getRoleColor } from '../utils';

interface ScorecardDisplayProps {
    inning: Inning;
    inningNumber: number;
}

const ScorecardDisplay: React.FC<ScorecardDisplayProps> = ({ inning, inningNumber }) => {
    const getBallsFromOvers = (overs: string) => {
        const parts = overs.split('.');
        return (parseInt(parts[0], 10) * 6) + (parseInt(parts[1] || '0', 10));
    };

    return (
        <div className="space-y-8">
            {/* Inning Header */}
            <div className="glass-card p-6 rounded-3xl border-white/10 bg-gradient-to-r from-white/5 to-transparent flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] mb-1">
                        {inningNumber <= 2 ? `${inningNumber === 1 ? '1ST' : '2ND'}` : `${inningNumber === 3 ? '3RD' : '4TH'}`}_INNINGS
                    </span>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{inning.teamName}</h3>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-black font-mono text-teal-400 italic leading-none mb-1">
                        {inning.score}<span className="text-white/40">/</span>{inning.wickets}
                    </p>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">OVERS: {inning.overs}</p>
                </div>
            </div>

            {/* Batting Table */}
            <div className="glass-card rounded-[32px] border-white/5 overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">BATTING_PERFORMANCE</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest">BATTER</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest">STATUS</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">R</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">B</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">SR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {inning.batting.map(p => (
                                <tr key={p.playerId} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-black text-sm uppercase tracking-tighter italic group-hover:text-teal-400 transition-colors">{p.playerName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-medium text-white/30 italic">{p.dismissalText}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black font-mono text-base text-teal-400 italic">{p.runs}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-xs text-white/40">{p.balls}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-xs text-white/20">{p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bowling Table */}
            <div className="glass-card rounded-[32px] border-white/5 overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">BOWLING_PERFORMANCE</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest">BOWLER</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">O</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">M</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">R</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">W</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">ECON</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {inning.bowling.map(p => (
                                <tr key={p.playerId} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-black text-sm uppercase tracking-tighter italic group-hover:text-blue-400 transition-colors">{p.playerName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-xs text-white/40">{p.overs}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-xs text-white/40">{p.maidens}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-xs text-white/40">{p.runsConceded}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black font-mono text-base text-blue-400 italic">{p.wickets}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-xs text-white/20">{getBallsFromOvers(p.overs) > 0 ? ((p.runsConceded / getBallsFromOvers(p.overs)) * 6).toFixed(2) : "0.00"}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface MatchResultScreenProps {
    result: MatchResult | null;
    onBack: () => void;
    userTeamId: string;
}

const MatchResultScreen: React.FC<MatchResultScreenProps> = ({ result, onBack, userTeamId }) => {
    const [view, setView] = useState<'summary' | 'scorecard'>('summary');
    
    if (!result) return (
        <div className="h-full flex flex-col items-center justify-center bg-[#050808] p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <AlertCircle className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4">MATCH_DATA_NOT_FOUND</h2>
            <button onClick={onBack} className="px-8 py-3 rounded-xl bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all">RETURN_TO_DASHBOARD</button>
        </div>
    );

    const { firstInning, secondInning, thirdInning, fourthInning, summary, manOfTheMatch } = result;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <History className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors group">
                                <ArrowLeft className="w-4 h-4 text-teal-500 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">MATCH_SCORECARD // v2.0</h2>
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none max-w-2xl">
                            {summary}
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center min-w-[200px] bg-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Star className="w-12 h-12" />
                            </div>
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-2">MAN_OF_THE_MATCH</p>
                            <p className="text-xl font-black italic uppercase tracking-tighter text-teal-400 leading-none mb-1">{manOfTheMatch.playerName}</p>
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{manOfTheMatch.summary}</p>
                        </div>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-6 mt-12 relative z-10">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button 
                            onClick={() => setView('summary')} 
                            className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${view === 'summary' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                        >
                            MATCH_SUMMARY
                        </button>
                        <button 
                            onClick={() => setView('scorecard')} 
                            className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${view === 'scorecard' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                        >
                            FULL_SCORECARD
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        {view === 'summary' ? (
                            <motion.div 
                                key="summary"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {[firstInning, secondInning, thirdInning, fourthInning].filter(Boolean).map((inning, idx) => (
                                    <div key={idx} className="glass-card p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Trophy className="w-32 h-32" />
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">INNINGS_0{idx + 1}</span>
                                                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{inning?.teamName}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-6xl font-black font-mono text-teal-400 italic leading-none mb-2">
                                                    {inning?.score}<span className="text-white/20">/</span>{inning?.wickets}
                                                </p>
                                                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest italic">OVERS: {inning?.overs}</p>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                            <div>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">TOP_BATTERS</p>
                                                <div className="space-y-3">
                                                    {inning?.batting.slice(0, 3).map(p => (
                                                        <div key={p.playerId} className="flex justify-between items-center">
                                                            <span className="font-black text-sm uppercase italic tracking-tighter">{p.playerName}</span>
                                                            <span className="font-black font-mono text-teal-400 italic">{p.runs} ({p.balls})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">TOP_BOWLERS</p>
                                                <div className="space-y-3">
                                                    {inning?.bowling.slice(0, 3).map(p => (
                                                        <div key={p.playerId} className="flex justify-between items-center">
                                                            <span className="font-black text-sm uppercase italic tracking-tighter">{p.playerName}</span>
                                                            <span className="font-black font-mono text-blue-400 italic">{p.wickets}-{p.runsConceded}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="scorecard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-16 pb-12"
                            >
                                {[firstInning, secondInning, thirdInning, fourthInning].filter(Boolean).map((inning, idx) => (
                                    <ScorecardDisplay key={idx} inning={inning!} inningNumber={idx + 1} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MatchResultScreen;
