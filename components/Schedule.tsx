
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <div className={`glass-card p-6 transition-all duration-500 relative overflow-hidden group ${isNextMatch ? 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.2)]' : 'border-white/5 hover:border-white/20'}`}>
        {isNextMatch && (
            <div className="absolute top-0 right-0 bg-teal-500 text-black px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-lg animate-pulse">
                Next Up
            </div>
        )}
        
        <div className="flex justify-between items-center text-[9px] mb-4 text-white/40 uppercase tracking-[0.2em] font-black">
            <span className="bg-white/10 px-2 py-0.5 rounded text-white/60">Match {match.matchNumber}</span>
            <span>{match.date}</span>
        </div>

        <div className="flex items-center justify-between gap-6 mb-4">
            <div className={`flex-1 text-right font-black text-lg tracking-tighter uppercase italic transition-colors ${isUserMatch && resolved.teamA === userTeamName ? 'text-teal-400' : 'text-white'}`}>
                {resolved.teamA}
            </div>
            <div className="px-4 py-1 bg-white/10 rounded-xl text-[10px] font-black text-white/40 uppercase italic tracking-widest">VS</div>
            <div className={`flex-1 text-left font-black text-lg tracking-tighter uppercase italic transition-colors ${isUserMatch && resolved.teamB === userTeamName ? 'text-teal-400' : 'text-white'}`}>
                {resolved.teamB}
            </div>
        </div>

        {result && (
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <p className="text-[11px] text-teal-400 font-black italic uppercase tracking-tight mb-4">{result.summary}</p>
                <button 
                    onClick={() => onViewResult(result)}
                    className="glass-button px-6 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-black transition-all"
                >
                    View Scorecard
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
    const nextMatchIndex = gameData.currentMatchIndex[selectedFormat];

    return (
        <div className="p-0 h-full flex flex-col bg-[#050808] overflow-hidden font-sans text-white">
            {/* V2.0 Broadcast Header */}
            <div className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-[#0A0F0F]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Icons.Calendar className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                    <p className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em] mb-2">TOURNAMENT_CALENDAR // v2.0</p>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8] text-white mb-8">
                        SEASON<br/>
                        <span className="text-teal-500">SCHEDULE</span>
                    </h1>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-wrap gap-4">
                            {/* Category Tabs */}
                            <div className="flex bg-white/5 p-1 rounded-2xl backdrop-blur-md border border-white/5 w-fit">
                                {['T20', 'List A', 'First Class'].map((cat) => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setCategory(cat as any)} 
                                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${category === cat ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Format Dropdown */}
                            <div className="relative w-48">
                                <select
                                    value={selectedFormat}
                                    onChange={(e) => setSelectedFormat(e.target.value as Format)}
                                    className="glass-select text-[10px] font-black uppercase tracking-widest pr-10"
                                >
                                    {getFormatsForCategory(category).map(f => (
                                        <option key={f} value={f} className="bg-[#0A0F0F]">{f}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-500/50 text-[10px]">▼</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                <div className="max-w-4xl mx-auto space-y-6">
                    {schedule.map((match, index) => {
                        const resolved = resolveMatch(match, gameData, selectedFormat);
                        const result = gameData.matchResults[selectedFormat]?.find(r => r && String(r.matchNumber) === String(match.matchNumber));
                        const isUserMatch = !!userTeam && (resolved.teamA === userTeam.name || resolved.teamB === userTeam.name);
                        const isNextMatch = selectedFormat === gameData.currentFormat && index === nextMatchIndex;
                        
                        return (
                            <MatchItem 
                                key={`${selectedFormat}-${match.matchNumber}-${index}`}
                                match={match}
                                resolved={resolved}
                                result={result}
                                isUserMatch={isUserMatch}
                                isNextMatch={isNextMatch}
                                userTeamName={userTeam?.name}
                                onViewResult={viewMatchResult}
                            />
                        );
                    })}
                    {schedule.length === 0 && (
                        <div className="glass-card p-20 text-center">
                            <Icons.Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">No matches scheduled for this format.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
