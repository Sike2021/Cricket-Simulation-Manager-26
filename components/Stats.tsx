
import React, { useState, useMemo, useEffect } from 'react';
import { GameData, Format, Player, PlayerStats } from '../types';
import { aggregateStats } from '../utils';
import { Icons } from './Icons';

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
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const sortedPlayers = useMemo(() => {
        if (statType === 'milestones') return [];

        let sortablePlayers = [...allPlayersWithStats];

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

                if (aWickets !== bWickets) {
                    return sortConfig.direction === 'ascending' ? aWickets - bWickets : bWickets - aWickets;
                }
                return sortConfig.direction === 'ascending' ? bRuns - aRuns : aRuns - bRuns;
            }

            // @ts-ignore
            const valA = aStat[sortConfig.key];
            // @ts-ignore
            const valB = bStat[sortConfig.key];

            if (valA < valB) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return sortablePlayers;
    }, [allPlayersWithStats, sortConfig, statType]);

    const sortedFastestFifties = useMemo(() => {
        return allPlayersWithStats
            .filter(p => p.displayStats.fastestFifty > 0)
            .sort((a,b) => a.displayStats.fastestFifty - b.displayStats.fastestFifty);
    }, [allPlayersWithStats]);

    const sortedFastestHundreds = useMemo(() => {
        return allPlayersWithStats
            .filter(p => p.displayStats.fastestHundred > 0)
            .sort((a,b) => a.displayStats.fastestHundred - b.displayStats.fastestHundred);
    }, [allPlayersWithStats]);

    const ThSortable = ({ label, sortKey }: { label: string, sortKey: string }) => (
        <th className="p-3 text-center cursor-pointer font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-teal-500 transition-colors" onClick={() => requestSort(sortKey)}>
            {label}{getSortIndicator(sortKey)}
        </th>
    );

    const getCategoryLabel = (cat: string) => {
        if(cat === 'T20') return 'All T20s';
        if(cat === 'List A') return 'All List A';
        if(cat === 'First Class') return 'All First-Class';
        return '';
    }

    return (
        <div className="p-0 h-full flex flex-col bg-white dark:bg-[#050808] overflow-hidden font-sans">
            {/* SigNify Editorial Header */}
            <div className="px-8 pt-12 pb-8 border-b-2 border-gray-900 dark:border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icons.Podium className="w-32 h-32" />
                </div>
                <h2 className="text-[10px] font-mono font-bold text-teal-600 uppercase tracking-[0.4em] mb-2">METRICS_ANALYSIS // v2.1.0</h2>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.8] text-gray-900 dark:text-white">
                    PLAYER<br/>
                    <span className="text-teal-600">STATS</span>
                </h1>
                
                <div className="flex flex-col gap-4 mt-8">
                    {/* Category Tabs */}
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
                        {['T20', 'List A', 'First Class'].map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setCategory(cat as any)} 
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${category === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' : 'text-gray-400 hover:text-teal-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-4">
                        {/* Format/Aggregation Dropdown */}
                        <div className="relative w-64">
                            <select
                                value={selectedFormatOption}
                                onChange={(e) => setSelectedFormatOption(e.target.value as StatFormatOption)}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-teal-600 text-xs font-black uppercase tracking-widest appearance-none outline-none transition-all"
                            >
                                <option value="Overall">Overall Career</option>
                                <option value={`All_${category.replace(' ', '')}`}>{getCategoryLabel(category)}</option>
                                <option disabled>──────────</option>
                                {getFormatsForCategory(category).map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                            {['batting', 'bowling', 'milestones'].map((type) => (
                                <button 
                                    key={type}
                                    onClick={() => handleStatTypeChange(type as any)} 
                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${statType === type ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' : 'text-gray-400 hover:text-teal-600'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {statType !== 'milestones' ? (
                <div className="bg-white dark:bg-[#0A0F0F] rounded-3xl border-2 border-gray-900 dark:border-white overflow-hidden shadow-2xl">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-900 dark:bg-white border-b-2 border-gray-900 dark:border-white">
                            <tr className="text-left">
                                <th className="p-6 cursor-pointer font-black text-[10px] uppercase tracking-[0.2em] text-white dark:text-gray-900" onClick={() => requestSort('name')}>Player{getSortIndicator('name')}</th>
                                {statType === 'batting' ? <>
                                    <ThSortable label="M" sortKey="matches" />
                                    <ThSortable label="Runs" sortKey="runs" />
                                    <ThSortable label="Avg" sortKey="average" />
                                    <ThSortable label="SR" sortKey="strikeRate" />
                                    <ThSortable label="HS" sortKey="highestScore" />
                                </> : <>
                                    <ThSortable label="M" sortKey="matches" />
                                    <ThSortable label="Wkts" sortKey="wickets" />
                                    <ThSortable label="Avg" sortKey="bowlingAverage" />
                                    <ThSortable label="Econ" sortKey="economy" />
                                    <ThSortable label="Best" sortKey="bestBowling" />
                                </>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {sortedPlayers.slice(0, 50).map(p => (
                            <tr key={p.id} onClick={() => viewPlayerProfile(p, gameData.currentFormat)} className="group cursor-pointer hover:bg-teal-500/5 transition-colors">
                                <td className="p-6">
                                    <div className="font-black text-lg tracking-tighter uppercase italic group-hover:text-teal-600 transition-colors">{p.name}</div>
                                    <div className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest">{p.teamName}</div>
                                </td>
                                {statType === 'batting' ? <>
                                    <td className="p-6 text-center font-mono font-bold">{p.displayStats.matches}</td>
                                    <td className="p-6 text-center font-black italic text-teal-600 text-2xl tracking-tighter">{p.displayStats.runs}</td>
                                    <td className="p-6 text-center font-mono font-bold">{p.displayStats.average.toFixed(2)}</td>
                                    <td className="p-6 text-center font-mono font-bold">{p.displayStats.strikeRate.toFixed(2)}</td>
                                    <td className="p-6 text-center font-black italic text-lg">{p.displayStats.highestScore}</td>
                                </> : <>
                                    <td className="p-6 text-center font-mono font-bold">{p.displayStats.matches}</td>
                                    <td className="p-6 text-center font-black italic text-teal-600 text-2xl tracking-tighter">{p.displayStats.wickets}</td>
                                    <td className="p-6 text-center font-mono font-bold">{p.displayStats.bowlingAverage.toFixed(2)}</td>
                                    <td className="p-6 text-center font-mono font-bold">{p.displayStats.economy.toFixed(2)}</td>
                                    <td className="p-6 text-center font-black italic text-lg">{p.displayStats.bestBowling}</td>
                                </>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="bg-white dark:bg-[#0A0F0F] rounded-[40px] border-2 border-gray-900 dark:border-white overflow-hidden shadow-2xl">
                            <div className="bg-gray-900 dark:bg-white p-6 border-b-2 border-gray-900 dark:border-white">
                                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-white dark:text-gray-900">FASTEST_FIFTIES</h3>
                            </div>
                             <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {sortedFastestFifties.slice(0, 25).map(p => (
                                    <tr key={p.id} onClick={() => viewPlayerProfile(p, gameData.currentFormat)} className="group cursor-pointer hover:bg-teal-500/5 transition-colors">
                                        <td className="p-6">
                                            <div className="font-black text-lg tracking-tighter uppercase italic group-hover:text-teal-600 transition-colors">{p.name}</div>
                                            <div className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest">{p.teamName}</div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="bg-teal-600 text-white px-6 py-2 rounded-full font-black italic text-xs uppercase tracking-tighter">
                                                {p.displayStats.fastestFifty} BALLS
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white dark:bg-[#0A0F0F] rounded-[40px] border-2 border-gray-900 dark:border-white overflow-hidden shadow-2xl">
                            <div className="bg-gray-900 dark:bg-white p-6 border-b-2 border-gray-900 dark:border-white">
                                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-white dark:text-gray-900">FASTEST_HUNDREDS</h3>
                            </div>
                             <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {sortedFastestHundreds.slice(0, 25).map(p => (
                                    <tr key={p.id} onClick={() => viewPlayerProfile(p, gameData.currentFormat)} className="group cursor-pointer hover:bg-teal-500/5 transition-colors">
                                        <td className="p-6">
                                            <div className="font-black text-lg tracking-tighter uppercase italic group-hover:text-teal-600 transition-colors">{p.name}</div>
                                            <div className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest">{p.teamName}</div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="bg-teal-600 text-white px-6 py-2 rounded-full font-black italic text-xs uppercase tracking-tighter">
                                                {p.displayStats.fastestHundred} BALLS
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stats;
