import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, Trophy, Target, Zap, Shield, 
    Activity, TrendingUp, Star, Globe, 
    Award, BarChart3, Calendar, User,
    ArrowUpRight, Info
} from 'lucide-react';
import { Player, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';

interface PlayerProfileProps {
    player: Player | null;
    onBack: () => void;
    initialFormat: Format;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onBack, initialFormat }) => {
    const [selectedFormat, setSelectedFormat] = useState<Format | 'Summary'>(initialFormat);
    
    const summaryStats = useMemo(() => {
        if (!player) return null;
        
        const t20Formats = [Format.T20];
        const listAFormats = [Format.ODI];
        const fcFormats = [Format.SHIELD];
        
        const t20 = aggregateStats(player, t20Formats);
        const listA = aggregateStats(player, listAFormats);
        const fc = aggregateStats(player, fcFormats);
        const overall = aggregateStats(player, [...t20Formats, ...listAFormats, ...fcFormats]);

        return { t20, listA, fc, overall };
    }, [player]);

    if (!player || !summaryStats) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#050808]">
                <p className="text-teal-500 font-mono text-xs uppercase tracking-widest mb-4">Player_Not_Found</p>
                <button onClick={onBack} className="glass-button px-6 py-2 text-[10px] font-black uppercase tracking-widest">Return_To_Database</button>
            </div>
        );
    }
    
    const roleColor = getRoleColor(player.role);

    const StatCard = ({ label, value, subValue, icon: Icon, color }: any) => (
        <div className="glass-card p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-black font-mono italic tracking-tighter ${color}`}>{value}</p>
                {subValue && <p className="text-xs font-mono opacity-20">{subValue}</p>}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-teal-500 transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back_To_Database
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roleColor} bg-white/5 border border-white/10`}>
                                {getRoleFullName(player.role)}
                            </span>
                            {player.isForeign && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/5 border border-blue-400/10">
                                    <Globe className="w-3 h-3" /> Overseas
                                </span>
                            )}
                        </div>
                        <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
                            {player.name.split(' ')[0]}<br/>
                            <span className="text-teal-500">{player.name.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.4em]">PLAYER_ID: {player.id.slice(0, 8)}</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center min-w-[120px] bg-white/5">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">BATTING</p>
                            <p className="text-4xl font-black font-mono text-teal-400 italic">{player.battingSkill}</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center min-w-[120px] bg-white/5">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">BOWLING</p>
                            <p className="text-4xl font-black font-mono text-blue-400 italic">{player.secondarySkill}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Career Summary Table */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <Trophy className="w-4 h-4 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">CAREER_SUMMARY</h3>
                        </div>

                        <div className="glass-card rounded-3xl border-white/5 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">FORMAT</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">MATCHES</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">RUNS</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">AVG</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">SR</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">WKTS</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">B_AVG</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">ECON</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { label: 'FIRST CLASS', stats: summaryStats.fc },
                                        { label: 'LIST A', stats: summaryStats.listA },
                                        { label: 'T20', stats: summaryStats.t20 },
                                        { label: 'OVERALL', stats: summaryStats.overall, highlight: true }
                                    ].map((row, idx) => (
                                        <tr key={idx} className={`group hover:bg-white/5 transition-colors ${row.highlight ? 'bg-teal-500/5' : ''}`}>
                                            <td className="p-6">
                                                <span className={`text-xs font-black italic uppercase tracking-tight ${row.highlight ? 'text-teal-400' : 'text-white'}`}>
                                                    {row.label}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center font-mono text-sm">{row.stats.matches}</td>
                                            <td className="p-6 text-center font-mono text-sm font-bold text-teal-400">{row.stats.runs}</td>
                                            <td className="p-6 text-center font-mono text-sm">{row.stats.average.toFixed(2)}</td>
                                            <td className="p-6 text-center font-mono text-sm">{row.stats.strikeRate.toFixed(1)}</td>
                                            <td className="p-6 text-center font-mono text-sm font-bold text-blue-400">{row.stats.wickets}</td>
                                            <td className="p-6 text-center font-mono text-sm">{row.stats.bowlingAverage.toFixed(2)}</td>
                                            <td className="p-6 text-center font-mono text-sm">{row.stats.economy.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Detailed Stats Grid */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">DETAILED_METRICS</h3>
                            </div>

                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                {['Summary', Format.T20, Format.ODI, Format.SHIELD].map((fmt) => (
                                    <button 
                                        key={fmt} 
                                        onClick={() => setSelectedFormat(fmt as any)} 
                                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${selectedFormat === fmt ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                                    >
                                        {fmt === Format.SHIELD ? 'FC' : fmt === Format.ODI ? 'LIST A' : fmt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard 
                                label="BATTING_AVERAGE" 
                                value={summaryStats.overall.average.toFixed(2)} 
                                icon={TrendingUp} 
                                color="text-teal-400" 
                            />
                            <StatCard 
                                label="STRIKE_RATE" 
                                value={summaryStats.overall.strikeRate.toFixed(1)} 
                                icon={Zap} 
                                color="text-yellow-400" 
                            />
                            <StatCard 
                                label="BOWLING_AVERAGE" 
                                value={summaryStats.overall.bowlingAverage.toFixed(2)} 
                                icon={Target} 
                                color="text-blue-400" 
                            />
                            <StatCard 
                                label="ECONOMY_RATE" 
                                value={summaryStats.overall.economy.toFixed(2)} 
                                icon={Shield} 
                                color="text-purple-400" 
                            />
                        </div>
                    </section>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-8 rounded-3xl border-white/5 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Info className="w-5 h-5 text-teal-500" />
                                <h4 className="text-lg font-black italic uppercase tracking-tighter">TECHNICAL_PROFILE</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">BATTING_STYLE</p>
                                    <p className="text-sm font-bold uppercase tracking-tight">Right Hand Bat</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">BOWLING_STYLE</p>
                                    <p className="text-sm font-bold uppercase tracking-tight">Right Arm Fast</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">PREFERRED_FORMAT</p>
                                    <p className="text-sm font-bold uppercase tracking-tight text-teal-400">T20 International</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">EXPERIENCE_LEVEL</p>
                                    <p className="text-sm font-bold uppercase tracking-tight text-blue-400">Elite Professional</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-50" />
                            <Award className="w-12 h-12 text-teal-500 mb-4 relative z-10" />
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2 relative z-10">ELITE_STATUS</h4>
                            <p className="text-xs text-white/40 uppercase tracking-widest relative z-10">Top 5% of Global Players</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;
