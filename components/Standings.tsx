
import React, { useState, useEffect } from 'react';
import { GameData, Format, Standing, Match } from '../types';
import { Category, getFormatsForCategory, resolveMatch } from '../utils';
import { CategoryTabs, FormatDropdown } from './SharedUI';

interface StandingsProps {
    gameData: GameData;
}

const StandingRow: React.FC<{ standing: Standing; index: number; isFirstClass: boolean }> = ({ standing, index, isFirstClass }) => (
    <tr className={`border-b border-white/5 transition-all duration-300 hover:bg-teal-500/10 group ${index < 4 ? 'bg-teal-500/5' : ''}`}>
        <td className="p-5">
            <div className="flex items-center gap-4">
                <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg ${index < 4 ? 'bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-white/10 text-white/40'}`}>{index + 1}</span>
                <span className="font-black text-base uppercase tracking-tight group-hover:text-teal-400 transition-colors">{standing.teamName}</span>
            </div>
        </td>
        <td className="p-5 text-center font-mono font-bold text-white/60">{standing.played}</td>
        <td className="p-5 text-center font-black text-teal-400">{standing.won}</td>
        <td className="p-5 text-center font-black text-red-400">{standing.lost}</td>
        {isFirstClass && <td className="p-5 text-center font-black text-white/40">{standing.drawn}</td>}
        <td className="p-5 text-center font-black text-teal-400 text-xl tracking-tighter">{standing.points}</td>
        <td className="p-5 text-center font-mono text-xs font-bold text-white/40">{standing.netRunRate > 0 ? `+${standing.netRunRate.toFixed(2)}` : standing.netRunRate.toFixed(2)}</td>
    </tr>
);

const FixtureItem: React.FC<{ match: Match; resolved: Match; result?: any }> = ({ match, resolved, result }) => (
    <div className={`p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group ${result ? 'bg-white/5 border-teal-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}>
        {result && <div className="absolute top-0 right-0 bg-teal-500 text-black px-3 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-bl-lg">Result</div>}
        <div className="flex justify-between items-center text-[9px] mb-4 text-white/40 uppercase tracking-[0.2em] font-black">
            <span className="bg-white/10 px-2 py-0.5 rounded text-white/60">Match {match.matchNumber}</span>
            <span>{match.date}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
            <div className="flex-1 text-right font-black text-lg tracking-tighter uppercase italic group-hover:text-teal-400 transition-colors">{resolved.teamA}</div>
            <div className="px-4 py-1 bg-white/10 rounded-xl text-[10px] font-black text-white/40 uppercase italic tracking-widest">VS</div>
            <div className="flex-1 text-left font-black text-lg tracking-tighter uppercase italic group-hover:text-teal-400 transition-colors">{resolved.teamB}</div>
        </div>
        {result && (
            <div className="mt-4 pt-4 border-t border-white/5 text-center text-[11px] text-teal-400 font-black italic uppercase tracking-tight">
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
        <div className="p-6 flex flex-col h-full overflow-hidden bg-[#050808] text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em] mb-1">LEAGUE_TABLES // v2.0</p>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Standings</h2>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl backdrop-blur-md border border-white/5">
                    <button 
                        onClick={() => setView('standings')} 
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${view === 'standings' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Table
                    </button>
                    <button 
                        onClick={() => setView('fixtures')} 
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${view === 'fixtures' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Fixtures
                    </button>
                </div>
            </div>
            
            <div className="space-y-4 mb-8">
                <CategoryTabs category={category} setCategory={setCategory} />
                <FormatDropdown category={category} selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat} />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                {view === 'standings' ? (
                    <div className="bg-white/[0.02] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Team</th>
                                    <th className="p-5 text-center font-black text-[10px] uppercase tracking-[0.2em] text-white/40">P</th>
                                    <th className="p-5 text-center font-black text-[10px] uppercase tracking-[0.2em] text-white/40">W</th>
                                    <th className="p-5 text-center font-black text-[10px] uppercase tracking-[0.2em] text-white/40">L</th>
                                    {isFirstClass && <th className="p-5 text-center font-black text-[10px] uppercase tracking-[0.2em] text-white/40">D</th>}
                                    <th className="p-5 text-center font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Pts</th>
                                    <th className="p-5 text-center font-black text-[10px] uppercase tracking-[0.2em] text-white/40">NRR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {standings.map((s, index) => (
                                    <StandingRow key={s.teamId} standing={s} index={index} isFirstClass={isFirstClass} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 pb-8">
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
