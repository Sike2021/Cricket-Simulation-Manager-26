
import React from 'react';
import { TEAMS } from '../data';

interface TeamSelectionProps {
    onTeamSelected: (teamId: string) => void;
    theme: 'light' | 'dark';
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected, theme }) => {
    const mainTeams = TEAMS.filter(t => !t.isYouthTeam);
    const devTeams = TEAMS.filter(t => t.isYouthTeam);

    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-[#121212]">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
                        SELECT <span className="text-teal-600">FRANCHISE</span>
                    </h2>
                    <p className="text-sm font-mono font-bold text-gray-500 uppercase tracking-widest">Choose your legacy</p>
                </div>
                
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-xs font-mono font-bold text-teal-600 uppercase tracking-[0.3em]">PRO_LEAGUE</h3>
                        <div className="h-px flex-1 bg-teal-600/20"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {mainTeams.map(team => (
                            <div key={team.id}
                                onClick={() => onTeamSelected(team.id)}
                                className="group relative bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl cursor-pointer border-2 border-transparent hover:border-teal-600 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-teal-500/10"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-ping"></div>
                                </div>
                                <div className="w-24 h-24 mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-500" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">{team.name}</h3>
                                <div className="mt-2 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">SELECT_TEAM</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-[0.3em]">DEV_ACADEMY</h3>
                        <div className="h-px flex-1 bg-gray-400/20"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {devTeams.map(team => (
                            <div key={team.id}
                                onClick={() => onTeamSelected(team.id)}
                                className="group relative bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl cursor-pointer border-2 border-transparent hover:border-gray-400 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all duration-500" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-gray-500 dark:text-gray-400 leading-none group-hover:text-gray-900 dark:group-hover:text-white">{team.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSelection;
