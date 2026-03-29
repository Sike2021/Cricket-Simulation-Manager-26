import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowRightLeft, Users, User, Shield, Zap, Target, 
    Trophy, Activity, TrendingUp, ChevronRight, X, 
    Search, Filter, BarChart3, Scale, Info
} from 'lucide-react';
import { GameData, Format, Player, Team } from '../types';

interface ComparisonScreenProps {
    gameData: GameData;
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ gameData }) => {
    const [comparisonType, setComparisonType] = useState<'player-vs-player' | 'team-vs-team' | 'player-vs-team'>('player-vs-player');
    const [selection1, setSelection1] = useState('');
    const [selection2, setSelection2] = useState('');
    const [pvpFormat, setPvpFormat] = useState<Format>(gameData.currentFormat);

    const sortedPlayers = useMemo(() => [...gameData.allPlayers].sort((a, b) => a.name.localeCompare(b.name)), [gameData.allPlayers]);
    const sortedTeams = useMemo(() => [...gameData.teams].sort((a, b) => a.name.localeCompare(b.name)), [gameData.teams]);

    const handleTypeChange = (type: 'player-vs-player' | 'team-vs-team' | 'player-vs-team') => {
        setComparisonType(type);
        setSelection1('');
        setSelection2('');
    };

    const StatRow = ({ label, value1, value2 }: { label: string, value1: any, value2: any }) => {
        const val1 = typeof value1 === 'number' ? parseFloat(value1.toFixed(2)) : value1;
        const val2 = typeof value2 === 'number' ? parseFloat(value2.toFixed(2)) : value2;
        
        const isLowerBetter = ['Avg', 'Econ'].includes(label);
        const isBetter1 = isLowerBetter ? val1 < val2 : val1 > val2;
        const isBetter2 = isLowerBetter ? val2 < val1 : val2 > val1;

        return (
            <div className="flex items-center gap-4 py-4 border-b border-white/5 group">
                <div className={`flex-1 text-right font-mono text-xl font-black transition-all ${isBetter1 ? 'text-teal-400 scale-110' : 'text-white/40'}`}>
                    {val1}
                </div>
                <div className="w-24 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-teal-500/40 transition-colors">
                        {label}
                    </span>
                </div>
                <div className={`flex-1 text-left font-mono text-xl font-black transition-all ${isBetter2 ? 'text-teal-400 scale-110' : 'text-white/40'}`}>
                    {val2}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Scale className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">ANALYTICS_LAB // COMPARISON</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            DATA<br/>
                            <span className="text-teal-500">CONTRAST</span>
                        </h1>
                    </div>

                    <div className="flex gap-2">
                        {[
                            { id: 'player-vs-player', icon: User, label: 'PVP' },
                            { id: 'team-vs-team', icon: Shield, label: 'TVT' },
                            { id: 'player-vs-team', icon: Users, label: 'PVT' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => handleTypeChange(type.id as any)}
                                className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 border ${
                                    comparisonType === type.id 
                                    ? 'bg-teal-500 border-teal-500 text-[#050808] shadow-[0_0_20px_rgba(45,212,191,0.3)]' 
                                    : 'glass-card border-white/10 text-white/40 hover:bg-white/10'
                                }`}
                            >
                                <type.icon className="w-5 h-5 mb-1" />
                                <span className="text-[8px] font-black uppercase tracking-widest">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* Selection Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">SUBJECT_ALPHA</label>
                            <select 
                                value={selection1} 
                                onChange={e => setSelection1(e.target.value)}
                                className="glass-input w-full p-6 rounded-[32px] text-sm font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-teal-500/30 transition-all"
                            >
                                <option value="">SELECT_ENTITY...</option>
                                {(comparisonType === 'team-vs-team' ? sortedTeams : sortedPlayers).map(o => (
                                    <option key={o.id} value={o.id} className="bg-[#0A0F0F]">{o.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full glass-card border-teal-500/30 flex items-center justify-center">
                                <span className="text-xs font-black italic text-teal-500">VS</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4">SUBJECT_BETA</label>
                            <select 
                                value={selection2} 
                                onChange={e => setSelection2(e.target.value)}
                                className="glass-input w-full p-6 rounded-[32px] text-sm font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-teal-500/30 transition-all"
                            >
                                <option value="">SELECT_ENTITY...</option>
                                {(comparisonType === 'player-vs-player' ? sortedPlayers : sortedTeams).map(o => (
                                    <option key={o.id} value={o.id} className="bg-[#0A0F0F]">{o.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Format Selector for Player Comparison */}
                    {comparisonType === 'player-vs-player' && (
                        <div className="flex justify-center gap-2">
                            {Object.values(Format).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setPvpFormat(f)}
                                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                        pvpFormat === f 
                                        ? 'bg-white text-[#050808]' 
                                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results Area */}
                    <AnimatePresence mode="wait">
                        {(!selection1 || !selection2 || selection1 === selection2) ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                            >
                                <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center opacity-20">
                                    <BarChart3 className="w-10 h-10" />
                                </div>
                                <p className="text-xl font-black italic uppercase tracking-tighter opacity-20">
                                    Awaiting_Dual_Entity_Selection
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Entity Headers */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="glass-card p-8 rounded-[40px] text-center border-teal-500/20 bg-teal-500/5">
                                        <p className="text-[10px] font-black text-teal-500/60 uppercase tracking-widest mb-2">ENTITY_A</p>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                                            {(comparisonType === 'team-vs-team' ? sortedTeams : sortedPlayers).find(o => o.id === selection1)?.name}
                                        </h3>
                                    </div>
                                    <div className="glass-card p-8 rounded-[40px] text-center border-teal-500/20 bg-teal-500/5">
                                        <p className="text-[10px] font-black text-teal-500/60 uppercase tracking-widest mb-2">ENTITY_B</p>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                                            {(comparisonType === 'player-vs-player' ? sortedPlayers : sortedTeams).find(o => o.id === selection2)?.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Stats Contrast */}
                                <div className="glass-card p-8 rounded-[40px] border-white/5">
                                    {comparisonType === 'player-vs-player' && (() => {
                                        const p1 = gameData.allPlayers.find(p => p.id === selection1);
                                        const p2 = gameData.allPlayers.find(p => p.id === selection2);
                                        if (!p1 || !p2) return null;
                                        const s1 = p1.stats[pvpFormat];
                                        const s2 = p2.stats[pvpFormat];
                                        return (
                                            <div className="space-y-2">
                                                <StatRow label="Matches" value1={s1.matches} value2={s2.matches} />
                                                <StatRow label="Runs" value1={s1.runs} value2={s2.runs} />
                                                <StatRow label="Avg" value1={s1.average} value2={s2.average} />
                                                <StatRow label="SR" value1={s1.strikeRate} value2={s2.strikeRate} />
                                                <StatRow label="Wickets" value1={s1.wickets} value2={s2.wickets} />
                                                <StatRow label="Econ" value1={s1.economy} value2={s2.economy} />
                                                <StatRow label="BBI" value1={s1.bestBowling} value2={s2.bestBowling} />
                                            </div>
                                        );
                                    })()}

                                    {comparisonType === 'team-vs-team' && (() => {
                                        const t1 = gameData.teams.find(t => t.id === selection1);
                                        const t2 = gameData.teams.find(t => t.id === selection2);
                                        if (!t1 || !t2) return null;
                                        return (
                                            <div className="space-y-2">
                                                <StatRow label="Squad Size" value1={t1.squad.length} value2={t2.squad.length} />
                                                <StatRow label="Purse" value1={t1.purse} value2={t2.purse} />
                                                <StatRow label="Avg Rating" 
                                                    value1={t1.squad.reduce((acc, p) => acc + Math.max(p.battingSkill, p.secondarySkill), 0) / t1.squad.length} 
                                                    value2={t2.squad.reduce((acc, p) => acc + Math.max(p.battingSkill, p.secondarySkill), 0) / t2.squad.length} 
                                                />
                                            </div>
                                        );
                                    })()}

                                    {comparisonType === 'player-vs-team' && (() => {
                                        const p = gameData.allPlayers.find(p => p.id === selection1);
                                        const t = gameData.teams.find(t => t.id === selection2);
                                        if (!p || !t) return null;
                                        const pStats = p.stats[pvpFormat];
                                        const tAvgRating = t.squad.reduce((acc, pl) => acc + Math.max(pl.battingSkill, pl.secondarySkill), 0) / t.squad.length;
                                        return (
                                            <div className="space-y-2">
                                                <StatRow label="Rating" value1={Math.max(p.battingSkill, p.secondarySkill)} value2={tAvgRating} />
                                                <StatRow label="Valuation" value1={(p.battingSkill + p.secondarySkill) / 10} value2={t.purse} />
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Summary Note */}
                                <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <Info className="w-5 h-5 text-teal-500 mt-1 shrink-0" />
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        Comparative analysis is based on current season performance metrics and historical data. 
                                        Teal highlights indicate superior performance in the respective category. 
                                        For bowling metrics (Avg, Econ), lower values are prioritized.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ComparisonScreen;
