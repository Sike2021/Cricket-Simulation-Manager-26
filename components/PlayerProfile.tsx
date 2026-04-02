
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Player, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';
import { ChevronLeft, Activity, Target, Shield, Zap } from 'lucide-react';

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

    if (!player || !summaryStats) return <div>Player not found. <button onClick={onBack}>Back</button></div>;
    
    const stats = selectedFormat === 'Summary' ? summaryStats.overall : player.stats[selectedFormat];
    
    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* Header */}
            <header className="px-8 pt-8 pb-6 border-b border-white/10 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-teal-500 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Hub</span>
                </button>
                <div className="flex gap-4">
                    {['Summary', ...Object.values(Format)].map(format => (
                        <button 
                            key={format} 
                            onClick={() => setSelectedFormat(format as any)} 
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedFormat === format ? 'bg-teal-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Player Identity */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-500/20 to-transparent" />
                            <PlayerAvatar player={player} size="xl" className="relative z-10 mb-6" />
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 relative z-10">{player.name}</h2>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-6 relative z-10 ${getRoleColor(player.role)}`}>{getRoleFullName(player.role)}</p>
                            
                            <div className="w-full grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-black/40 rounded-2xl p-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Batting Style</p>
                                    <p className="text-sm font-bold uppercase tracking-widest">{player.style === 'A' ? 'Aggressive' : player.style === 'D' ? 'Defensive' : 'Balanced'}</p>
                                </div>
                                <div className="bg-black/40 rounded-2xl p-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Age</p>
                                    <p className="text-sm font-bold uppercase tracking-widest">{player.age || 25}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skill Ratings */}
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Core Attributes</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-white">Batting Power</span>
                                        <span className="text-teal-400">{player.battingSkill}</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${player.battingSkill}%` }} className="h-full bg-teal-500" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-white">Bowling Speed</span>
                                        <span className="text-teal-400">{player.secondarySkill}</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${player.secondarySkill}%` }} className="h-full bg-teal-500" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-white">Fielding</span>
                                        <span className="text-teal-400">{player.fielding || 50}</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${player.fielding || 50}%` }} className="h-full bg-teal-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats Dashboard */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Mini Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                                <Activity className="w-5 h-5 text-teal-500 mb-4" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Matches</p>
                                    <p className="text-3xl font-black italic font-mono">{stats.matches}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                                <Target className="w-5 h-5 text-teal-500 mb-4" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Batting Avg</p>
                                    <p className="text-3xl font-black italic font-mono">{stats.average.toFixed(1)}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                                <Zap className="w-5 h-5 text-teal-500 mb-4" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Strike Rate</p>
                                    <p className="text-3xl font-black italic font-mono">{stats.strikeRate.toFixed(1)}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                                <Shield className="w-5 h-5 text-teal-500 mb-4" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Wickets</p>
                                    <p className="text-3xl font-black italic font-mono">{stats.wickets}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Stats Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Batting Details */}
                            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Batting Performance</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">Total Runs</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.runs}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">High Score</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.highestScore}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">50s / 100s</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.fifties} / {stats.hundreds}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">Boundaries (4s/6s)</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.fours} / {stats.sixes}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-widest">Fastest 50</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.fastestFifty > 0 ? `${stats.fastestFifty}b` : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bowling Details */}
                            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Bowling Performance</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">Economy Rate</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.economy.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">Bowling Avg</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.bowlingAverage.toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">Best Bowling</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.bestBowling || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest">3-Wicket Hauls</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.threeWicketHauls}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-widest">5-Wicket Hauls</span>
                                        <span className="text-xl font-black italic font-mono text-teal-400">{stats.fiveWicketHauls}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerProfile;
