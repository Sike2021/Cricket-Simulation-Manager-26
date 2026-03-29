
import React from 'react';
import { MatchResult } from '../types';

interface ForwardResultsScreenProps {
    results: MatchResult[];
    onBack: () => void;
    userTeamId: string;
    onViewResult: (result: MatchResult) => void;
}

const ForwardResultsScreen: React.FC<ForwardResultsScreenProps> = ({ results, onBack, onViewResult }) => {
    return (
        <div className="p-2 h-[calc(100vh-90px)] flex flex-col">
            <h2 className="text-2xl font-bold text-center mb-4 tracking-tighter uppercase italic">Simulated Results</h2>
            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                {results.map((result, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-white/5 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-black uppercase tracking-tight">{result.firstInning.teamName} <span className="text-gray-500 font-normal italic lowercase">vs</span> {result.secondInning.teamName}</p>
                            <span className="text-[10px] font-mono opacity-40">MATCH_{result.matchNumber}</span>
                        </div>
                        <p className="text-xs font-bold text-teal-500 mb-3">{result.summary}</p>
                        <button 
                            onClick={() => onViewResult(result)}
                            className="w-full bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-[#0A0F0F] py-2 rounded-lg text-[10px] font-black uppercase italic transition-all border border-teal-500/20"
                        >
                            View Full Scorecard
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={onBack} className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase italic py-3 rounded-xl transition-all">Continue to Dashboard</button>
        </div>
    );
};

export default ForwardResultsScreen;
