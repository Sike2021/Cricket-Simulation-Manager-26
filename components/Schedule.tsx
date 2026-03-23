
import React, { useState, useEffect } from 'react';
import { GameData, Team, MatchResult, Format, Match } from '../types';
import { Category, getFormatsForCategory, resolveMatch } from '../utils';
import { CategoryTabs, FormatDropdown } from './SharedUI';
import { Icons } from './Icons';

interface ScheduleProps {
    gameData: GameData;
    userTeam: Team | null;
    viewMatchResult: (result: MatchResult) => void;
}

const MatchItem: React.FC<{
    match: Match;
    resolved: Match;
    result?: MatchResult;
    isUserMatch: boolean;
    isNextMatch: boolean;
    userTeamName?: string;
    onViewResult: (result: MatchResult) => void;
}> = ({ match, resolved, result, isUserMatch, isNextMatch, userTeamName, onViewResult }) => (
    <div className={`p-5 rounded-2xl border-2 transition-all ${result ? 'bg-white dark:bg-gray-800/20 border-teal-500/20 shadow-xl' : 'bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800'} ${isNextMatch ? 'border-teal-500 ring-4 ring-teal-500/10' : ''}`}>
        <div className="flex justify-between items-center text-[10px] mb-4 text-gray-400 uppercase tracking-widest font-black">
            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Match {match.matchNumber}</span>
            <span>{match.date}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
            <div className={`flex-1 text-center font-black text-lg tracking-tighter uppercase ${isUserMatch && resolved.teamA === userTeamName ? 'text-teal-600 dark:text-teal-400' : ''}`}>{resolved.teamA}</div>
            <div className="px-3 py-1 bg-teal-500/10 rounded-full text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase italic">VS</div>
            <div className={`flex-1 text-center font-black text-lg tracking-tighter uppercase ${isUserMatch && resolved.teamB === userTeamName ? 'text-teal-600 dark:text-teal-400' : ''}`}>{resolved.teamB}</div>
        </div>
        {result && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <p className="text-xs font-bold text-center text-teal-600 dark:text-teal-400 mb-4 italic leading-tight">{result.summary}</p>
                <button 
                    onClick={() => onViewResult(result)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl shadow-lg shadow-teal-600/20"
                >
                    View Full Scorecard
                </button>
            </div>
        )}
    </div>
);

const Schedule: React.FC<ScheduleProps> = ({ gameData, userTeam, viewMatchResult }) => {
    const [category, setCategory] = useState<Category>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category]);

    const schedule = gameData.schedule[selectedFormat] || [];

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0A0F0F] overflow-hidden font-sans text-gray-900 dark:text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Match <span className="text-teal-600">Fixtures</span></h2>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">TOURNAMENT_CALENDAR_SYSTEM</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-gray-100 dark:border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">FORMAT: {selectedFormat}</span>
                </div>
            </div>
            
            <div className="space-y-6 mb-8">
                <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/10">
                    {['T20', 'List A', 'First Class'].map((cat) => (
                        <button 
                            key={cat} 
                            onClick={() => setCategory(cat as any)} 
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${category === cat ? 'bg-white dark:bg-white/10 shadow-lg text-teal-600' : 'opacity-40 hover:opacity-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                <div className="relative">
                    <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as Format)}
                        className="w-full p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-teal-600 text-xs font-black uppercase tracking-widest appearance-none outline-none transition-all"
                    >
                        {getFormatsForCategory(category).map(f => (
                            <option key={f} value={f} className="dark:bg-[#0A0F0F]">{f}</option>
                        ))}
                    </select>
                    <Icons.ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 opacity-20 pointer-events-none" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
                {schedule.map((match, index) => {
                    const resolved = resolveMatch(match, gameData, selectedFormat);
                    const result = gameData.matchResults[selectedFormat]?.find(r => String(r.matchNumber) === String(match.matchNumber));
                    const isUserMatch = !!userTeam && (resolved.teamA === userTeam.name || resolved.teamB === userTeam.name);
                    const isNextMatch = selectedFormat === gameData.currentFormat && index === gameData.currentMatchIndex[selectedFormat];
                    
                    return (
                        <div key={`${selectedFormat}-${match.matchNumber}-${index}`} className={`p-6 rounded-[32px] border-2 transition-all ${
                            isNextMatch 
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-teal-600 shadow-2xl shadow-teal-600/20' 
                            : 'bg-gray-50 dark:bg-white/5 border-transparent'
                        }`}>
                            <div className="flex justify-between items-center mb-6">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isNextMatch ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-white/10 opacity-40'}`}>MATCH_{match.matchNumber}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{match.date}</span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className="flex-1">
                                    <p className={`text-xl font-black uppercase tracking-tighter leading-none ${isUserMatch && resolved.teamA === userTeam?.name ? 'text-teal-600' : ''}`}>{resolved.teamA}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">HOME</p>
                                </div>
                                <div className="text-xs font-light italic opacity-20">VS</div>
                                <div className="flex-1 text-right">
                                    <p className={`text-xl font-black uppercase tracking-tighter leading-none ${isUserMatch && resolved.teamB === userTeam?.name ? 'text-teal-600' : ''}`}>{resolved.teamB}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">AWAY</p>
                                </div>
                            </div>

                            {result && (
                                <div className={`mt-6 pt-6 border-t ${isNextMatch ? 'border-white/10 dark:border-gray-900/10' : 'border-gray-200 dark:border-white/10'}`}>
                                    <p className="text-xs font-black uppercase tracking-tight text-center mb-6 leading-snug italic opacity-80">{result.summary}</p>
                                    <button 
                                        onClick={() => viewMatchResult(result)}
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                            isNextMatch 
                                            ? 'bg-teal-600 text-white hover:bg-teal-700' 
                                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                        }`}
                                    >
                                        VIEW_FULL_SCORECARD
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {schedule.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                        <Icons.Schedule className="w-12 h-12 mb-4" />
                        <p className="font-black text-[10px] uppercase tracking-widest">NO_MATCHES_SCHEDULED</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
