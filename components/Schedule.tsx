
import React, { useState, useEffect } from 'react';
import { GameData, Team, MatchResult, Format, Match } from '../types';
import { Category, getFormatsForCategory, resolveMatch } from '../utils';
import { CategoryTabs, FormatDropdown } from './SharedUI';

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
    <div className={`p-4 border-2 transition-all ${result ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10' : 'bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5'} ${isNextMatch ? 'border-green-600 ring-2 ring-green-600/20' : ''} rounded-xl`}>
        <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-2 text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            <span>MATCH {match.matchNumber}</span>
            <span>{match.date}</span>
        </div>
        <div className="flex items-center justify-between py-2">
            <div className={`flex-1 text-center font-black text-lg uppercase tracking-tighter ${isUserMatch && resolved.teamA === userTeamName ? 'text-green-600' : ''}`}>{resolved.teamA}</div>
            <div className="px-4 text-[10px] font-mono font-black opacity-20 italic">VS</div>
            <div className={`flex-1 text-center font-black text-lg uppercase tracking-tighter ${isUserMatch && resolved.teamB === userTeamName ? 'text-green-600' : ''}`}>{resolved.teamB}</div>
        </div>
        {result && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                <p className="text-xs font-bold text-center text-green-600 mb-3 italic">{result.summary}</p>
                <button 
                    onClick={() => onViewResult(result)}
                    className="w-full bg-green-600 text-white py-2 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all rounded-lg shadow-lg shadow-green-600/20"
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
        <div className="p-4 flex flex-col h-full bg-white dark:bg-[#0A0F0F] text-gray-900 dark:text-[#E4E3E0]">
            <h2 className="text-3xl font-black text-center mb-6 tracking-tighter uppercase italic text-green-600">Fixtures</h2>
            
            <CategoryTabs category={category} setCategory={setCategory} />
            <FormatDropdown category={category} selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat} />

            <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                {schedule.map((match, index) => {
                    const resolved = resolveMatch(match, gameData, selectedFormat);
                    const result = gameData.matchResults[selectedFormat]?.find(r => String(r.matchNumber) === String(match.matchNumber));
                    const isUserMatch = !!userTeam && (resolved.teamA === userTeam.name || resolved.teamB === userTeam.name);
                    const isNextMatch = selectedFormat === gameData.currentFormat && index === gameData.currentMatchIndex[selectedFormat];
                    
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
                    <div className="text-center py-10 text-gray-500">
                        No matches scheduled for this format.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
