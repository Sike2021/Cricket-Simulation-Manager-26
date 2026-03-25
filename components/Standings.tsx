
import React, { useState, useEffect } from 'react';
import { GameData, Format, Standing, Match } from '../types';
import { Category, getFormatsForCategory, resolveMatch } from '../utils';
import { CategoryTabs, FormatDropdown } from './SharedUI';

interface StandingsProps {
    gameData: GameData;
}

const StandingRow: React.FC<{ standing: Standing; index: number; isFirstClass: boolean }> = ({ standing, index, isFirstClass }) => (
    <tr className={`border-b dark:border-gray-700/50 transition-colors hover:bg-teal-500/5 dark:hover:bg-teal-500/10 ${index < 4 ? 'bg-teal-500/5' : ''}`}>
        <td className="p-4">
            <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${index < 4 ? 'bg-teal-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{index + 1}</span>
                <span className="font-bold text-sm tracking-tight">{standing.teamName}</span>
            </div>
        </td>
        <td className="p-4 text-center font-medium">{standing.played}</td>
        <td className="p-4 text-center font-medium text-emerald-600 dark:text-emerald-400">{standing.won}</td>
        <td className="p-4 text-center font-medium text-red-600 dark:text-red-400">{standing.lost}</td>
        {isFirstClass && <td className="p-4 text-center font-medium text-gray-500">{standing.drawn}</td>}
        <td className="p-4 text-center font-black text-teal-600 dark:text-teal-400 text-base">{standing.points}</td>
        <td className="p-4 text-center font-mono text-xs font-bold">{standing.netRunRate > 0 ? `+${standing.netRunRate.toFixed(2)}` : standing.netRunRate.toFixed(2)}</td>
    </tr>
);

const FixtureItem: React.FC<{ match: Match; resolved: Match; result?: any }> = ({ match, resolved, result }) => (
    <div className={`p-4 rounded-xl border-2 transition-all ${result ? 'bg-white dark:bg-gray-800/40 border-teal-500/20 shadow-sm' : 'bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800'}`}>
        <div className="flex justify-between items-center text-[10px] mb-3 text-gray-400 uppercase tracking-widest font-black">
            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Match {match.matchNumber}</span>
            <span>{match.date}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-right font-black text-sm tracking-tight truncate">{resolved.teamA}</div>
            <div className="px-3 py-1 bg-teal-500/10 rounded-full text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase italic">VS</div>
            <div className="flex-1 text-left font-black text-sm tracking-tight truncate">{resolved.teamB}</div>
        </div>
        {result && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 text-center text-[11px] text-teal-600 dark:text-teal-400 font-bold italic">
                {result.summary}
            </div>
        )}
    </div>
);

const Standings: React.FC<StandingsProps> = ({ gameData }) => {
    const [category, setCategory] = useState<Category>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);
    const [view, setView] = useState<'standings' | 'fixtures'>('standings');

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category]);

    const standings = gameData.standings[selectedFormat] || [];
    const schedule = gameData.schedule[selectedFormat] || [];
    const isFirstClass = selectedFormat === Format.SHIELD;

    return (
        <div className="p-4 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-teal-600 dark:text-teal-400">Leagues</h2>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setView('standings')} 
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'standings' ? 'bg-white dark:bg-gray-700 shadow-md text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Standings
                    </button>
                    <button 
                        onClick={() => setView('fixtures')} 
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'fixtures' ? 'bg-white dark:bg-gray-700 shadow-md text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Fixtures
                    </button>
                </div>
            </div>
            
            <div className="space-y-4 mb-6">
                <CategoryTabs category={category} setCategory={setCategory} />
                <FormatDropdown category={category} selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat} />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                {view === 'standings' ? (
                    <div className="bg-white dark:bg-gray-800/20 rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b-2 border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Team</th>
                                    <th className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">P</th>
                                    <th className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">W</th>
                                    <th className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">L</th>
                                    {isFirstClass && <th className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">D</th>}
                                    <th className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">Pts</th>
                                    <th className="p-4 text-center font-black text-[10px] uppercase tracking-widest text-gray-400">NRR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {standings.map((s, index) => (
                                    <StandingRow key={s.teamId} standing={s} index={index} isFirstClass={isFirstClass} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {schedule.map((match, index) => (
                            <FixtureItem 
                                key={`${selectedFormat}-fixture-${index}`}
                                match={match}
                                resolved={resolveMatch(match, gameData, selectedFormat)}
                                result={gameData.matchResults[selectedFormat]?.find(r => r.matchNumber === match.matchNumber)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Standings;
