import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Trophy, Award, Star, Users, 
    ChevronRight, Check, Lock, Zap,
    Shield, BarChart3, History, Calendar,
    TrendingUp, DollarSign, Briefcase,
    Info, AlertCircle, UserPlus, UserMinus
} from 'lucide-react';
import { GameData, Format, Player, Team } from '../types';
import { getRoleFullName, getRoleColor } from '../utils';

interface EndOfFormatScreenProps {
    gameData: GameData;
    handleFormatChange: (newFormat: Format) => void;
    handleEndSeason: (retainedPlayers: Player[]) => void;
}

const EndOfFormatScreen: React.FC<EndOfFormatScreenProps> = ({ gameData, handleFormatChange, handleEndSeason }) => {
    const [view, setView] = useState<'awards' | 'retention'>('awards');
    const [retainedIds, setRetainedIds] = useState<Set<string>>(new Set());
    const userTeam = useMemo(() => gameData.teams.find(t => t.id === gameData.userTeamId), [gameData]);
    
    const RETENTION_BUDGET = 30.0;

    const calculatePlayerAsk = useCallback((player: Player) => {
        const skill = Math.max(player.battingSkill, player.secondarySkill);
        let baseAsk = 1.0;
        if (skill > 85) baseAsk = 12.0;
        else if (skill > 80) baseAsk = 8.0;
        else if (skill > 75) baseAsk = 5.0;
        else if (skill > 70) baseAsk = 3.0;
        else if (skill > 60) baseAsk = 1.5;

        let perfMultiplier = 1.0;
        const formats = [Format.T20, Format.ODI, Format.SHIELD];
        let totalRuns = 0;
        let totalWickets = 0;
        
        formats.forEach(f => {
            const s = player.stats[f];
            if (s) {
                totalRuns += s.runs;
                totalWickets += s.wickets;
            }
        });

        if (totalRuns > 1000) perfMultiplier += 0.5;
        else if (totalRuns > 600) perfMultiplier += 0.3;
        else if (totalRuns > 300) perfMultiplier += 0.15;

        if (totalWickets > 30) perfMultiplier += 0.5;
        else if (totalWickets > 20) perfMultiplier += 0.3;
        else if (totalWickets > 10) perfMultiplier += 0.15;

        return Number((baseAsk * perfMultiplier).toFixed(2));
    }, []);

    const playerAsks = useMemo(() => {
        const asks: Record<string, number> = {};
        userTeam?.squad.forEach(p => {
            asks[p.id] = calculatePlayerAsk(p);
        });
        return asks;
    }, [userTeam, calculatePlayerAsk]);

    const currentTotalCost = useMemo(() => {
        let total = 0;
        retainedIds.forEach(id => {
            total += playerAsks[id] || 0;
        });
        return total;
    }, [retainedIds, playerAsks]);

    const lastAward = gameData.awardsHistory[gameData.awardsHistory.length-1];
    
    const formatsOrder = [
        Format.T20, Format.ODI, Format.SHIELD
    ];

    const currentIdx = formatsOrder.indexOf(gameData.currentFormat);
    const nextFormat = currentIdx !== -1 && currentIdx < formatsOrder.length - 1 ? formatsOrder[currentIdx + 1] : null;

    const toggleRetention = (id: string) => {
        const player = userTeam?.squad.find(p => p.id === id);
        if (!player) return;

        const ask = playerAsks[id] || 0;

        setRetainedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                if (currentTotalCost + ask > RETENTION_BUDGET) return prev;

                const retainedPlayers = userTeam?.squad.filter(p => next.has(p.id)) || [];
                const nationalCount = retainedPlayers.filter(p => !p.isForeign).length;
                const internationalCount = retainedPlayers.filter(p => p.isForeign).length;

                if (player.isForeign) {
                    if (internationalCount < 2) next.add(id);
                } else {
                    if (nationalCount < 5) next.add(id);
                }
            }
            return next;
        });
    };

    const handleRetentionConfirm = () => {
        const retainedPlayers = userTeam?.squad.filter(p => retainedIds.has(p.id)) || [];
        handleEndSeason(retainedPlayers);
    };

    const nationalCount = useMemo(() => {
        return userTeam?.squad.filter(p => retainedIds.has(p.id) && !p.isForeign).length || 0;
    }, [retainedIds, userTeam]);

    const internationalCount = useMemo(() => {
        return userTeam?.squad.filter(p => retainedIds.has(p.id) && p.isForeign).length || 0;
    }, [retainedIds, userTeam]);

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
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">FORMAT_CONCLUSION // v2.0</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            {gameData.currentFormat}<br/>
                            <span className="text-teal-500">DEBRIEF</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center min-w-[140px] bg-white/5">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">BUDGET_REMAINING</p>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-teal-500" />
                                <p className="text-4xl font-black font-mono text-white italic">{(RETENTION_BUDGET - currentTotalCost).toFixed(1)}M</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-6 mt-12 relative z-10">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button 
                            onClick={() => setView('awards')} 
                            className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${view === 'awards' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                        >
                            FORMAT_AWARDS
                        </button>
                        <button 
                            onClick={() => setView('retention')} 
                            className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${view === 'retention' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                        >
                            SQUAD_RETENTION
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {view === 'awards' ? (
                            <motion.div 
                                key="awards"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                {/* Format Awards Section */}
                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                            <Award className="w-4 h-4 text-teal-500" />
                                        </div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter">SEASON_HONOURS</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {/* MVP */}
                                        <div className="glass-card p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-teal-500/5 to-transparent relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Star className="w-24 h-24" />
                                            </div>
                                            <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-6">MOST_VALUABLE_PLAYER</p>
                                            <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">{lastAward?.mvp.name}</h4>
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-6">{lastAward?.mvp.teamName}</p>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">POINTS</span>
                                                    <span className="text-xl font-black font-mono text-teal-400 italic">{lastAward?.mvp.points}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Orange Cap */}
                                        <div className="glass-card p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-orange-500/5 to-transparent relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Zap className="w-24 h-24" />
                                            </div>
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6">ORANGE_CAP_WINNER</p>
                                            <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">{lastAward?.orangeCap.name}</h4>
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-6">{lastAward?.orangeCap.teamName}</p>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">RUNS</span>
                                                    <span className="text-xl font-black font-mono text-orange-400 italic">{lastAward?.orangeCap.runs}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Purple Cap */}
                                        <div className="glass-card p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Shield className="w-24 h-24" />
                                            </div>
                                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-6">PURPLE_CAP_WINNER</p>
                                            <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">{lastAward?.purpleCap.name}</h4>
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-6">{lastAward?.purpleCap.teamName}</p>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">WICKETS</span>
                                                    <span className="text-xl font-black font-mono text-purple-400 italic">{lastAward?.purpleCap.wickets}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Next Action */}
                                <div className="flex justify-center pt-12">
                                    {nextFormat ? (
                                        <button 
                                            onClick={() => handleFormatChange(nextFormat)}
                                            className="px-12 py-6 rounded-3xl bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-2xl flex items-center gap-4 group"
                                        >
                                            PROCEED_TO_{nextFormat}_SEASON
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setView('retention')}
                                            className="px-12 py-6 rounded-3xl bg-teal-500 text-black text-sm font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-2xl flex items-center gap-4 group"
                                        >
                                            INITIATE_SQUAD_RETENTION
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="retention"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                {/* Retention Rules Info */}
                                <div className="glass-card p-8 rounded-[40px] border-teal-500/20 bg-teal-500/5 flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
                                        <Info className="w-8 h-8 text-teal-500" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="text-lg font-black italic uppercase tracking-tighter">RETENTION_PROTOCOL_V2.0</h4>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Select up to <span className="text-teal-400 font-bold">5 Domestic</span> and <span className="text-teal-400 font-bold">2 International</span> players to retain for the next season. 
                                            Total retention cost cannot exceed the <span className="text-teal-400 font-bold">30.0M budget</span>.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center px-6 py-3 rounded-2xl bg-black/40 border border-white/5">
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">DOMESTIC</span>
                                            <span className={`text-xl font-black font-mono italic ${nationalCount === 5 ? 'text-teal-400' : 'text-white'}`}>{nationalCount}/5</span>
                                        </div>
                                        <div className="flex flex-col items-center px-6 py-3 rounded-2xl bg-black/40 border border-white/5">
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">INTL</span>
                                            <span className={`text-xl font-black font-mono italic ${internationalCount === 2 ? 'text-teal-400' : 'text-white'}`}>{internationalCount}/2</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Player Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userTeam?.squad.map((player) => {
                                        const isRetained = retainedIds.has(player.id);
                                        const ask = playerAsks[player.id];
                                        const canAfford = currentTotalCost + ask <= RETENTION_BUDGET || isRetained;
                                        
                                        let canAdd = true;
                                        if (!isRetained) {
                                            if (player.isForeign && internationalCount >= 2) canAdd = false;
                                            if (!player.isForeign && nationalCount >= 5) canAdd = false;
                                        }

                                        const isDisabled = !isRetained && (!canAfford || !canAdd);

                                        return (
                                            <motion.div 
                                                key={player.id}
                                                whileHover={!isDisabled ? { scale: 1.02, y: -5 } : {}}
                                                onClick={() => !isDisabled && toggleRetention(player.id)}
                                                className={`glass-card p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden group ${
                                                    isRetained 
                                                    ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_30px_rgba(45,212,191,0.1)]' 
                                                    : isDisabled 
                                                    ? 'border-white/5 opacity-40 grayscale cursor-not-allowed' 
                                                    : 'border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic ${isRetained ? 'bg-teal-500 text-black' : 'bg-white/5 text-white/40'}`}>
                                                            {player.name[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-lg uppercase tracking-tighter italic leading-none mb-1">{player.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 ${getRoleColor(player.role)}`}>{player.role}</span>
                                                                {player.isForeign && <Globe className="w-3 h-3 text-blue-400" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xl font-black font-mono italic leading-none mb-1 ${isRetained ? 'text-teal-400' : 'text-white'}`}>{ask}M</p>
                                                        <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">CONTRACT_ASK</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center">
                                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">BAT</span>
                                                        <span className="text-sm font-black font-mono italic">{player.battingSkill}</span>
                                                    </div>
                                                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center">
                                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">BOWL</span>
                                                        <span className="text-sm font-black font-mono italic">{player.secondarySkill}</span>
                                                    </div>
                                                </div>

                                                <div className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${isRetained ? 'bg-teal-500 text-black border-teal-400' : 'bg-white/5 text-white/40 border-white/5 group-hover:bg-white/10'}`}>
                                                    {isRetained ? (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">RETAINED</span>
                                                        </>
                                                    ) : isDisabled ? (
                                                        <>
                                                            <Lock className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">UNAVAILABLE</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">RETAIN_PLAYER</span>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Confirm Action */}
                                <div className="flex justify-center pt-12">
                                    <button 
                                        onClick={handleRetentionConfirm}
                                        className="px-16 py-6 rounded-3xl bg-teal-500 text-black text-base font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-2xl flex items-center gap-4 group"
                                    >
                                        CONFIRM_RETENTIONS_AND_END_SEASON
                                        <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default EndOfFormatScreen;
