import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
    Trophy, Award, Star, TrendingUp, TrendingDown, 
    ChevronRight, BarChart3, Users, Target, 
    Shield, Zap, Calendar, History, Medal
} from 'lucide-react';
import { GameData } from '../types';

interface AwardsRecordsScreenProps {
    gameData: GameData;
}

const AwardsAndRecordsScreen: React.FC<AwardsRecordsScreenProps> = ({ gameData }) => {
    const { awardsHistory, records, promotionHistory } = gameData;
    
    const sortedBvb = useMemo(() => records ? [...records.batterVsBowler].sort((a,b) => b.dismissals - a.dismissals || b.runs - a.runs) : [], [records]);
    const sortedTvt = useMemo(() => records ? [...records.teamVsTeam].sort((a,b) => b.matches - a.matches) : [], [records]);
    const sortedPvt = useMemo(() => records ? [...records.playerVsTeam].sort((a,b) => (b.runs + b.wickets * 20) - (a.runs + a.wickets * 20)) : [], [records]);

    if (awardsHistory.length === 0 && (!records || sortedBvb.length === 0) && promotionHistory.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#050808] text-center p-8">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                    <Trophy className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">NO_ACCOLADES_YET</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest max-w-xs">
                    Complete a tournament season to begin your journey into the hall of fame.
                </p>
            </div>
        );
    }

    const groupedBySeason = awardsHistory.reduce((acc: any, award) => {
        (acc[award.season] = acc[award.season] || []).push(award);
        return acc;
    }, {});

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <History className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">HALL_OF_FAME // v2.0</h2>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                        AWARDS &<br/>
                        <span className="text-teal-500">RECORDS</span>
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-16">
                    
                    {/* Promotions & Relegations */}
                    {promotionHistory.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">LEAGUE_MOVEMENTS</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {promotionHistory.map((ph, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Calendar className="w-12 h-12" />
                                        </div>
                                        <p className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mb-4">SEASON_{ph.season}</p>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                                                <div className="flex items-center gap-3">
                                                    <TrendingUp className="w-4 h-4 text-teal-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">PROMOTED</span>
                                                </div>
                                                <span className="text-sm font-black italic uppercase tracking-tight text-teal-400">{ph.promotedTeamName}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                                                <div className="flex items-center gap-3">
                                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">RELEGATED</span>
                                                </div>
                                                <span className="text-sm font-black italic uppercase tracking-tight text-red-400">{ph.relegatedTeamName}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Season Awards */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <Medal className="w-4 h-4 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">SEASON_ACCOLADES</h3>
                        </div>

                        <div className="space-y-12">
                            {Object.entries(groupedBySeason).reverse().map(([season, awards]: [string, any], sIdx) => (
                                <div key={season} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <h4 className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.5em]">SEASON_{season}</h4>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {awards.map((award: any, aIdx: number) => (
                                            <motion.div 
                                                key={aIdx}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: aIdx * 0.1 }}
                                                className="glass-card p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden group"
                                            >
                                                <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                                                    <Trophy className="w-32 h-32" />
                                                </div>
                                                
                                                <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.3em] mb-4">{award.format}</p>
                                                <h5 className="text-3xl font-black italic uppercase tracking-tighter mb-6 leading-none">
                                                    <span className="text-white/40 text-sm block mb-1 not-italic font-mono tracking-widest">CHAMPIONS</span>
                                                    {award.winnerTeamName}
                                                </h5>

                                                <div className="space-y-4 pt-6 border-t border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Target className="w-3 h-3 text-teal-500" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">BEST_BATTER</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black uppercase italic tracking-tight">{award.bestBatter.playerName}</p>
                                                            <p className="text-[9px] font-mono text-teal-400">{award.bestBatter.runs} RUNS</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="w-3 h-3 text-blue-500" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">BEST_BOWLER</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black uppercase italic tracking-tight">{award.bestBowler.playerName}</p>
                                                            <p className="text-[9px] font-mono text-blue-400">{award.bestBowler.wickets} WKTS</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Career Records */}
                    {records && (
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">HISTORICAL_RECORDS</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Batter vs Bowler */}
                                <div className="glass-card rounded-[40px] border-white/5 overflow-hidden">
                                    <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">BATTER_VS_BOWLER</h4>
                                        <Users className="w-4 h-4 text-white/20" />
                                    </div>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="p-4 text-[8px] font-black uppercase tracking-widest text-white/20">MATCHUP</th>
                                                <th className="p-4 text-center text-[8px] font-black uppercase tracking-widest text-white/20">RUNS</th>
                                                <th className="p-4 text-center text-[8px] font-black uppercase tracking-widest text-white/20">OUTS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {sortedBvb.slice(0, 5).map((r, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4">
                                                        <p className="text-xs font-black uppercase italic tracking-tight text-teal-400">{r.batterName}</p>
                                                        <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">VS {r.bowlerName}</p>
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-xs">{r.runs}</td>
                                                    <td className="p-4 text-center font-black text-red-400 text-sm italic">{r.dismissals}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Team vs Team */}
                                <div className="glass-card rounded-[40px] border-white/5 overflow-hidden">
                                    <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">TEAM_RIVALRIES</h4>
                                        <Shield className="w-4 h-4 text-white/20" />
                                    </div>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="p-4 text-[8px] font-black uppercase tracking-widest text-white/20">RIVALRY</th>
                                                <th className="p-4 text-center text-[8px] font-black uppercase tracking-widest text-white/20">PLAYED</th>
                                                <th className="p-4 text-center text-[8px] font-black uppercase tracking-widest text-white/20">SCORE</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {sortedTvt.slice(0, 5).map((r, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4">
                                                        <p className="text-xs font-black uppercase italic tracking-tight">{r.teamAName}</p>
                                                        <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">VS {r.teamBName}</p>
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-xs">{r.matches}</td>
                                                    <td className="p-4 text-center font-black text-teal-400 text-sm italic">{r.teamAWins} - {r.matches - r.teamAWins}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AwardsAndRecordsScreen;
