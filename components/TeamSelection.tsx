
import React from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft } from 'lucide-react';
import { TEAMS } from '../data';

interface TeamSelectionProps {
    onTeamSelected: (teamId: string) => void;
    theme: 'light' | 'dark';
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected, theme }) => {
    const mainTeams = TEAMS.filter(t => !t.isYouthTeam);
    const devTeams = TEAMS.filter(t => t.isYouthTeam);

    return (
        <div className="p-8 h-full overflow-y-auto bg-[#050808] text-white custom-scrollbar">
            <div className="max-w-5xl mx-auto">
                <div className="mb-16 text-center relative">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full"></div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-block bg-teal-500/10 backdrop-blur-md text-teal-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.4em] mb-6 border border-teal-500/30 rounded-full">
                            FRANCHISE_ENROLLMENT_V2.0
                        </div>
                        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 relative z-10 leading-none">
                            SELECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">FRANCHISE</span>
                        </h2>
                        <p className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.5em] relative z-10">Choose your legacy • Season 2026</p>
                    </motion.div>
                </div>
                
                <div className="mb-20">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black italic text-white uppercase tracking-tighter">PRO_LEAGUE</h3>
                            <span className="text-[9px] font-mono font-bold text-teal-500 uppercase tracking-[0.3em]">DIVISION_I_TEAMS</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-teal-500/30 via-teal-500/10 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {mainTeams.map((team, idx) => (
                            <motion.div 
                                key={team.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => onTeamSelected(team.id)}
                                className="group relative glass-card p-8 cursor-pointer border border-white/5 hover:border-teal-500/40 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping shadow-[0_0_15px_rgba(20,184,166,0.8)]"></div>
                                </div>
                                
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                    <div className="flex-grow">
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight group-hover:text-teal-400 transition-colors mb-2">{team.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest">EST. 2024</span>
                                            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                            <span className="text-[9px] font-mono font-bold text-teal-500 uppercase tracking-widest">TIER_1</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">INITIALIZE_CONTRACT</span>
                                    <ArrowRightLeft size={14} className="text-teal-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mb-10">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black italic text-white/40 uppercase tracking-tighter">ACADEMY_TALENT</h3>
                            <span className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[0.3em]">DEVELOPMENT_SQUADS</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {devTeams.map((team, idx) => (
                            <motion.div 
                                key={team.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (idx * 0.05) }}
                                onClick={() => onTeamSelected(team.id)}
                                className="group relative bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                <h3 className="text-[11px] font-black italic uppercase tracking-tighter text-white/30 leading-none text-center group-hover:text-white transition-colors">{team.name}</h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSelection;
