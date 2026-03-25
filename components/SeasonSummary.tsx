
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus, Award, Star, Users } from 'lucide-react';
import { GameData, Player, Format, PlayerStats } from '../types';
import { getPlayerById, aggregateStats } from '../utils';

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
                    ratingChanges.push({
                        playerId: player.id,
                        playerName: player.name,
                        oldBatting: player.battingSkill,
                        newBatting: player.battingSkill,
                        oldBowling: player.secondarySkill,
                        newBowling: player.secondarySkill,
                        reason: 'No longer an emerging player (3 years completed).',
                        type: 'neutral'
                    });
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
    }, [gameData.allPlayers]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block p-3 bg-teal-500/10 rounded-full text-teal-500 mb-2"
                >
                    <Trophy size={48} />
                </motion.div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Season {gameData.currentSeason} Summary</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">The curtains fall on another epic cricketing year.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Batters */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-orange-500">
                        <Star size={20} fill="currentColor" />
                        <h2 className="font-black uppercase tracking-wider">Top Batters</h2>
                    </div>
                    <div className="space-y-3">
                        {summaryData.topBatters.map((p, i) => {
                            const stats = aggregateStats(p, Object.values(Format));
                            return (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-400">#{i + 1}</span>
                                        <div>
                                            <p className="font-bold text-sm">{p.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">{p.teamName || 'Free Agent'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-teal-500">{stats.runs}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Runs</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Bowlers */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-blue-500">
                        <Award size={20} fill="currentColor" />
                        <h2 className="font-black uppercase tracking-wider">Top Bowlers</h2>
                    </div>
                    <div className="space-y-3">
                        {summaryData.topBowlers.map((p, i) => {
                            const stats = aggregateStats(p, Object.values(Format));
                            return (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-400">#{i + 1}</span>
                                        <div>
                                            <p className="font-bold text-sm">{p.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">{p.teamName || 'Free Agent'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-teal-500">{stats.wickets}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Wickets</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Rating Fluctuations */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={20} className="text-teal-500" />
                    <h2 className="font-black uppercase tracking-wider">Rating Fluctuations</h2>
                </div>
                
                {summaryData.ratingChanges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {summaryData.ratingChanges.slice(0, 12).map(change => (
                            <div key={change.playerId} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">{change.playerName}</p>
                                    <p className="text-[10px] text-slate-500 italic">{change.reason}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            <span className="text-xs font-bold">{change.oldBatting}</span>
                                            <ArrowRight size={10} className="text-slate-400" />
                                            <span className={`text-xs font-black ${change.type === 'up' ? 'text-teal-500' : 'text-rose-500'}`}>
                                                {change.newBatting}
                                            </span>
                                        </div>
                                        <p className="text-[8px] text-slate-400 uppercase font-bold">Rating</p>
                                    </div>
                                    {change.type === 'up' ? (
                                        <TrendingUp size={16} className="text-teal-500" />
                                    ) : (
                                        <TrendingDown size={16} className="text-rose-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <Minus size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No major rating changes this season</p>
                    </div>
                )}
                
                {summaryData.ratingChanges.length > 12 && (
                    <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold">
                        + {summaryData.ratingChanges.length - 12} more players affected by form
                    </p>
                )}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={() => onContinue(summaryData.updatedPlayers)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-black px-12 py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-3"
                >
                    Proceed to Next Season
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
);

export default SeasonSummary;
