
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
        <div className="p-8 h-full overflow-y-auto bg-[#050808] text-white">
            <div className="max-w-5xl mx-auto">
                <div className="mb-16 text-center relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full"></div>
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 relative z-10">
                        SELECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">FRANCHISE</span>
                    </h2>
                    <p className="text-sm font-mono font-bold text-gray-500 uppercase tracking-[0.4em] relative z-10">Choose your legacy • Season 2026</p>
                </div>
                
                <div className="mb-16">
                    <div className="flex items-center gap-6 mb-8">
                        <h3 className="text-sm font-mono font-bold text-teal-500 uppercase tracking-[0.5em]">PRO_LEAGUE_DIVISION_I</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-teal-500/30 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mainTeams.map(team => (
                            <div key={team.id}
                                onClick={() => onTeamSelected(team.id)}
                                className="group relative bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2rem] cursor-pointer border border-white/10 hover:border-teal-500/50 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-teal-500/20"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.8)]"></div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/5 blur-3xl group-hover:bg-teal-500/10 transition-all"></div>
                                
                                <div className="w-28 h-28 mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-tight text-center group-hover:text-teal-400 transition-colors">{team.name}</h3>
                                <div className="mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <span className="px-4 py-1 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">INITIALIZE_CONTRACT</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-6 mb-8">
                        <h3 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-[0.5em]">DEV_ACADEMY_TALENT</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-500/20 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {devTeams.map(team => (
                            <div key={team.id}
                                onClick={() => onTeamSelected(team.id)}
                                className="group relative bg-white/[0.02] p-6 rounded-3xl cursor-pointer border border-white/5 hover:border-gray-500/30 transition-all duration-500 overflow-hidden"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                <h3 className="text-sm font-black italic uppercase tracking-tighter text-gray-500 leading-none text-center group-hover:text-white transition-colors">{team.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSelection;
