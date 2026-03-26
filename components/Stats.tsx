import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    BarChart3, TrendingUp, Target, Zap, Shield, 
    Trophy, Search, Filter, ChevronRight, 
    ArrowUpRight, Info, User, Globe,
    ChevronDown, ChevronUp, LayoutGrid, List
} from 'lucide-react';
import { GameData, Format, Player, PlayerStats } from '../types';
import { aggregateStats, getRoleColor } from '../utils';

interface StatsProps {
    gameData: GameData;
    viewPlayerProfile: (player: Player, format: Format) => void;
}

type StatFormatOption = Format | 'All_T20' | 'All_ListA' | 'All_FC' | 'Overall';

const Stats: React.FC<StatsProps> = ({ gameData, viewPlayerProfile }) => {
    const [statType, setStatType] = useState<'batting' | 'bowling' | 'milestones'>('batting');
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');
    const [selectedFormatOption, setSelectedFormatOption] = useState<StatFormatOption>(gameData.currentFormat);
    const [sortConfig, setSortConfig] = useState({ key: 'runs', direction: 'descending' });
    const [searchQuery, setSearchQuery] = useState('');

    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20];
            case 'List A': return [Format.ODI];
            case 'First Class': return [Format.SHIELD];
        }
    };

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormatOption as Format) && !['All_T20', 'All_ListA', 'All_FC', 'Overall'].includes(selectedFormatOption)) {
            setSelectedFormatOption(formats[0]);
        }
    }, [category]);

    const allPlayersWithStats = useMemo(() => {
        return gameData.allPlayers.map(p => {
            const team = gameData.teams.find(t => t.squad.some(sp => sp.id === p.id));
            let stats: PlayerStats;

            if (selectedFormatOption === 'Overall') {
                stats = aggregateStats(p, Object.values(Format));
            } else if (selectedFormatOption === 'All_T20') {
                stats = aggregateStats(p, [Format.T20]);
            } else if (selectedFormatOption === 'All_ListA') {
                stats = aggregateStats(p, [Format.ODI]);
            } else if (selectedFormatOption === 'All_FC') {
                stats = aggregateStats(p, [Format.SHIELD]);
            } else {
                stats = p.stats[selectedFormatOption as Format];
            }

            return { ...p, teamName: team?.name || 'Free Agent', displayStats: stats };
        }).filter(p => p.displayStats.matches > 0);
    }, [gameData, selectedFormatOption]);

    const requestSort = (key: string) => {
        let direction = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        } else if (sortConfig.key !== key && ['average', 'bowlingAverage', 'economy'].includes(key)) {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const handleStatTypeChange = (type: 'batting' | 'bowling' | 'milestones') => {
        setStatType(type);
        if (type === 'batting') {
            setSortConfig({ key: 'runs', direction: 'descending' });
        } else if (type === 'bowling') {
            setSortConfig({ key: 'wickets', direction: 'descending' });
        }
    };
    
    const getSortIndicator = (key: string) => {
        if (sortConfig.key !== key) return <div className="w-4 h-4 opacity-0" />;
        return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4 text-teal-500" /> : <ChevronDown className="w-4 h-4 text-teal-500" />;
    };

    const sortedPlayers = useMemo(() => {
        let sortablePlayers = [...allPlayersWithStats];

        if (searchQuery) {
            sortablePlayers = sortablePlayers.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.teamName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statType === 'milestones') return sortablePlayers;

        sortablePlayers.sort((a, b) => {
            if (sortConfig.key === 'name') {
                 if (a.name < b.name) return sortConfig.direction === 'ascending' ? -1 : 1;
                 if (a.name > b.name) return sortConfig.direction === 'ascending' ? 1 : -1;
                 return 0;
            }

            const aStat = a.displayStats;
            const bStat = b.displayStats;
            
            if (sortConfig.key === 'bestBowling') {
                if (aStat.bestBowling === '-') return 1;
                if (bStat.bestBowling === '-') return -1;
                const [aWickets, aRuns] = aStat.bestBowling.split('/').map(Number);
                const [bWickets, bRuns] = bStat.bestBowling.split('/').map(Number);

                if (aWickets !== bWickets) return sortConfig.direction === 'ascending' ? aWickets - bWickets : bWickets - aWickets;
                return sortConfig.direction === 'ascending' ? aRuns - bRuns : bRuns - aRuns;
            }

            const aValue = (aStat as any)[sortConfig.key] || 0;
            const bValue = (bStat as any)[sortConfig.key] || 0;

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return sortablePlayers;
    }, [allPlayersWithStats, sortConfig, statType, searchQuery]);

    const milestones = useMemo(() => {
        const results: { player: Player; type: string; value: number; teamName: string }[] = [];
        allPlayersWithStats.forEach(p => {
            if (p.displayStats.runs >= 1000) results.push({ player: p, type: '1000 Runs', value: p.displayStats.runs, teamName: p.teamName });
            if (p.displayStats.wickets >= 50) results.push({ player: p, type: '50 Wickets', value: p.displayStats.wickets, teamName: p.teamName });
            if (p.displayStats.hundreds >= 1) results.push({ player: p, type: 'Century', value: p.displayStats.hundreds, teamName: p.teamName });
            if (p.displayStats.fiveWickets >= 1) results.push({ player: p, type: '5-Wkt Haul', value: p.displayStats.fiveWickets, teamName: p.teamName });
        });
        return results.sort((a, b) => b.value - a.value);
    }, [allPlayersWithStats]);

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BarChart3 className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">PERFORMANCE_ANALYTICS // v2.0</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            PLAYER<br/>
                            <span className="text-teal-500">STATISTICS</span>
                        </h1>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                        {['batting', 'bowling', 'milestones'].map((type) => (
                            <button 
                                key={type} 
                                onClick={() => handleStatTypeChange(type as any)} 
                                className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${statType === type ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {type}
                            </button>
                        ))}
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

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="SEARCH_PLAYERS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all w-64"
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                            <Info className="w-3 h-3 text-teal-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                {selectedFormatOption === 'Overall' ? 'All Formats Combined' : `Showing ${selectedFormatOption} Data`}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {statType === 'milestones' ? (
                            <motion.div 
                                key="milestones"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {milestones.map((m, idx) => (
                                    <div key={idx} className="glass-card p-6 rounded-[32px] border border-white/5 hover:border-teal-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Trophy className="w-12 h-12" />
                                        </div>
                                        <p className="text-[8px] font-black text-teal-500 uppercase tracking-[0.3em] mb-2">{m.type}</p>
                                        <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 group-hover:text-teal-400 transition-colors">{m.player.name}</h4>
                                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4">{m.teamName}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black font-mono italic text-white">{m.value}</span>
                                            <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">RECORDED</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
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
                                            <th className="p-6 cursor-pointer group" onClick={() => requestSort('name')}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">PLAYER_IDENTITY</span>
                                                    {getSortIndicator('name')}
                                                </div>
                                            </th>
                                            <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('matches')}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">M</span>
                                                    {getSortIndicator('matches')}
                                                </div>
                                            </th>
                                            {statType === 'batting' ? (
                                                <>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('runs')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">RUNS</span>
                                                            {getSortIndicator('runs')}
                                                        </div>
                                                    </th>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('average')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">AVG</span>
                                                            {getSortIndicator('average')}
                                                        </div>
                                                    </th>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('strikeRate')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">SR</span>
                                                            {getSortIndicator('strikeRate')}
                                                        </div>
                                                    </th>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('hundreds')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">100S</span>
                                                            {getSortIndicator('hundreds')}
                                                        </div>
                                                    </th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('wickets')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">WKTS</span>
                                                            {getSortIndicator('wickets')}
                                                        </div>
                                                    </th>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('bowlingAverage')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">B_AVG</span>
                                                            {getSortIndicator('bowlingAverage')}
                                                        </div>
                                                    </th>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('economy')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">ECON</span>
                                                            {getSortIndicator('economy')}
                                                        </div>
                                                    </th>
                                                    <th className="p-6 text-center cursor-pointer group" onClick={() => requestSort('bestBowling')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-teal-500 transition-colors">BBI</span>
                                                            {getSortIndicator('bestBowling')}
                                                        </div>
                                                    </th>
                                                </>
                                            )}
                                            <th className="p-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sortedPlayers.map((player, idx) => (
                                            <tr 
                                                key={player.id} 
                                                className="group hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => viewPlayerProfile(player, selectedFormatOption as Format)}
                                            >
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg italic bg-white/5 ${getRoleColor(player.role)}`}>
                                                            {player.name[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-base uppercase tracking-tighter italic group-hover:text-teal-400 transition-colors leading-none mb-1">
                                                                {player.name}
                                                            </span>
                                                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{player.teamName}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center font-mono text-sm text-white/60">{player.displayStats.matches}</td>
                                                {statType === 'batting' ? (
                                                    <>
                                                        <td className="p-6 text-center font-mono text-sm font-bold text-teal-400">{player.displayStats.runs}</td>
                                                        <td className="p-6 text-center font-mono text-sm">{player.displayStats.average.toFixed(2)}</td>
                                                        <td className="p-6 text-center font-mono text-sm">{player.displayStats.strikeRate.toFixed(1)}</td>
                                                        <td className="p-6 text-center font-mono text-sm">{player.displayStats.hundreds}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-6 text-center font-mono text-sm font-bold text-blue-400">{player.displayStats.wickets}</td>
                                                        <td className="p-6 text-center font-mono text-sm">{player.displayStats.bowlingAverage.toFixed(2)}</td>
                                                        <td className="p-6 text-center font-mono text-sm">{player.displayStats.economy.toFixed(2)}</td>
                                                        <td className="p-6 text-center font-mono text-sm">{player.displayStats.bestBowling}</td>
                                                    </>
                                                )}
                                                <td className="p-6 text-right">
                                                    <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-teal-500 transition-colors ml-auto" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Stats;
