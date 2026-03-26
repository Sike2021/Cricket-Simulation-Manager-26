import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Trophy, TrendingUp, TrendingDown, Minus, 
    Award, Star, Users, Target, Zap, 
    Shield, BarChart3, ChevronRight, Info,
    ArrowUpRight, History, Calendar
} from 'lucide-react';
import { GameData, Player, Format, PlayerStats } from '../types';
import { getPlayerById, aggregateStats, getRoleColor } from '../utils';

interface SeasonSummaryProps {
    gameData: GameData;
    onContinue: (updatedPlayers: Player[]) => void;
}

interface RatingChange {
    playerId: string;
    playerName: string;
    oldBatting: number;
    newBatting: number;
    oldBowling: number;
    newBowling: number;
    reason: string;
    type: 'up' | 'down' | 'neutral';
}

const SeasonSummary: React.FC<SeasonSummaryProps> = ({ gameData, onContinue }) => {
    const summaryData = useMemo(() => {
        const ratingChanges: RatingChange[] = [];
        const updatedPlayers = JSON.parse(JSON.stringify(gameData.allPlayers)) as Player[];

        updatedPlayers.forEach(player => {
            // Emerging Status Logic
            if (player.teamName && player.teamName !== 'Free Agent') {
                player.yearsInTeam = (player.yearsInTeam || 0) + 1;
                if (player.isEmerging && player.yearsInTeam >= 3) {
                    player.isEmerging = false;
                }
            } else {
                player.yearsInTeam = 0; // Reset if they become free agent
            }

            const seasonStats = aggregateStats(player, Object.values(Format));
            const oldBatting = player.battingSkill;
            const oldBowling = player.secondarySkill;
            let newBatting = oldBatting;
            let newBowling = oldBowling;
            let reason = '';
            let type: 'up' | 'down' | 'neutral' = 'neutral';

            // Extraordinary Performance
            if (seasonStats.runs >= 1000 || seasonStats.wickets >= 50) {
                newBatting = Math.min(100, oldBatting + 3);
                newBowling = Math.min(100, oldBowling + 3);
                reason = seasonStats.runs >= 1000 ? 'Incredible 1000+ runs season!' : 'Historic 50+ wickets season!';
                type = 'up';
            }
            // Good Performance (No change)
            else if (seasonStats.runs >= 400 || seasonStats.wickets >= 20) {
                reason = 'Solid season performance.';
                type = 'neutral';
            }
            // Consistent Failures (Only if played enough matches)
            else if (seasonStats.matches >= 10) {
                if (seasonStats.runs < 150 && seasonStats.wickets < 5) {
                    newBatting = Math.max(30, oldBatting - 2);
                    newBowling = Math.max(30, oldBowling - 2);
                    reason = 'Poor form throughout the season.';
                    type = 'down';
                }
            }

            if (type !== 'neutral') {
                player.battingSkill = newBatting;
                player.secondarySkill = newBowling;
                ratingChanges.push({
                    playerId: player.id,
                    playerName: player.name,
                    oldBatting,
                    newBatting,
                    oldBowling,
                    newBowling,
                    reason,
                    type
                });
            }
        });

        // Top Performers for display
        const topBatters = [...updatedPlayers].sort((a, b) => aggregateStats(b, Object.values(Format)).runs - aggregateStats(a, Object.values(Format)).runs).slice(0, 5);
        const topBowlers = [...updatedPlayers].sort((a, b) => aggregateStats(b, Object.values(Format)).wickets - aggregateStats(a, Object.values(Format)).wickets).slice(0, 5);

        return { ratingChanges, updatedPlayers, topBatters, topBowlers };
    }, [gameData]);

    const { ratingChanges, updatedPlayers, topBatters, topBowlers } = summaryData;

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
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">SEASON_DEBRIEF // v2.0</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            SEASON<br/>
                            <span className="text-teal-500">SUMMARY</span>
                        </h1>
                    </div>

                    <button 
                        onClick={() => onContinue(updatedPlayers)}
                        className="px-12 py-4 rounded-2xl bg-teal-500 text-black text-[12px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-3 group"
                    >
                        CONTINUE_TO_NEXT_SEASON
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-16">
                    
                    {/* Top Performers Grid */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Batting Leaders */}
                        <div className="glass-card rounded-[40px] border-white/5 overflow-hidden">
                            <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-teal-500" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">BATTING_LEADERS</h4>
                                </div>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">SEASON_TOTALS</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {topBatters.map((player, idx) => {
                                    const stats = aggregateStats(player, Object.values(Format));
                                    return (
                                        <div key={player.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-mono text-white/20">0{idx + 1}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-lg uppercase tracking-tighter italic group-hover:text-teal-400 transition-colors leading-none mb-1">{player.name}</span>
                                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{player.teamName}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black font-mono text-teal-400 italic leading-none mb-1">{stats.runs}</p>
                                                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">RUNS_SCORED</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bowling Leaders */}
                        <div className="glass-card rounded-[40px] border-white/5 overflow-hidden">
                            <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-blue-500" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">BOWLING_LEADERS</h4>
                                </div>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">SEASON_TOTALS</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {topBowlers.map((player, idx) => {
                                    const stats = aggregateStats(player, Object.values(Format));
                                    return (
                                        <div key={player.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-mono text-white/20">0{idx + 1}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-lg uppercase tracking-tighter italic group-hover:text-blue-400 transition-colors leading-none mb-1">{player.name}</span>
                                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{player.teamName}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black font-mono text-blue-400 italic leading-none mb-1">{stats.wickets}</p>
                                                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">WICKETS_TAKEN</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Rating Adjustments */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">SKILL_ADJUSTMENTS</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ratingChanges.map((change, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`glass-card p-6 rounded-[32px] border relative overflow-hidden group ${
                                        change.type === 'up' ? 'border-teal-500/20 bg-teal-500/5' : 
                                        change.type === 'down' ? 'border-red-500/20 bg-red-500/5' : 
                                        'border-white/5'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg italic bg-white/5`}>
                                                {change.playerName[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-base uppercase tracking-tighter italic leading-none mb-1">{change.playerName}</span>
                                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">PLAYER_UPDATE</span>
                                            </div>
                                        </div>
                                        {change.type === 'up' ? <TrendingUp className="w-4 h-4 text-teal-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 rounded-2xl bg-black/40 border border-white/5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">BATTING</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-white/40">{change.oldBatting}</span>
                                                <ChevronRight className="w-3 h-3 text-white/10" />
                                                <span className={`text-sm font-black font-mono ${change.newBatting > change.oldBatting ? 'text-teal-400' : change.newBatting < change.oldBatting ? 'text-red-400' : 'text-white'}`}>{change.newBatting}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-2xl bg-black/40 border border-white/5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">BOWLING</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-white/40">{change.oldBowling}</span>
                                                <ChevronRight className="w-3 h-3 text-white/10" />
                                                <span className={`text-sm font-black font-mono ${change.newBowling > change.oldBowling ? 'text-blue-400' : change.newBowling < change.oldBowling ? 'text-red-400' : 'text-white'}`}>{change.newBowling}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <p className="text-[9px] font-medium text-white/40 leading-relaxed italic">{change.reason}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SeasonSummary;
