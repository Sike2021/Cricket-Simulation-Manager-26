import React, { useState } from 'react';
import { Team, TeamData } from '../types';
import { motion } from 'motion/react';
import { Trophy, Users, Play, ChevronRight } from 'lucide-react';

interface NewGameOverlayProps {
    teams: TeamData[];
    onStart: (teamId: string) => void;
    onCancel: () => void;
}

export const NewGameOverlay: React.FC<NewGameOverlayProps> = ({ teams, onStart, onCancel }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Info */}
                <div className="flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center space-x-2 px-4 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-500 text-xs font-bold uppercase tracking-widest"
                        >
                            <Trophy size={14} />
                            <span>Season 2026</span>
                        </motion.div>
                        <motion.h1 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-6xl md:text-8xl font-display uppercase italic leading-none tracking-tighter"
                        >
                            Start Your <br />
                            <span className="text-teal-500">Legacy</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/60 text-lg max-w-md"
                        >
                            Choose your franchise and lead them to glory in the most advanced cricket simulation engine ever built.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex space-x-4"
                    >
                        <button 
                            onClick={() => onStart(selectedTeamId)}
                            className="btn-brutal flex items-center space-x-3"
                        >
                            <Play size={20} fill="currentColor" />
                            <span>Initialize Match</span>
                        </button>
                        <button 
                            onClick={onCancel}
                            className="px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors"
                        >
                            Back
                        </button>
                    </motion.div>
                </div>

                {/* Right Side: Team Selection */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden flex flex-col"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="label-micro">Select Franchise</h3>
                        <div className="flex items-center space-x-2 text-white/40 text-[10px] font-mono">
                            <Users size={12} />
                            <span>{teams.length} Teams Available</span>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                        {teams.map((team) => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeamId(team.id)}
                                className={`w-full group relative p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                                    selectedTeamId === team.id 
                                    ? 'bg-teal-500 border-teal-500 text-black' 
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-display italic ${
                                        selectedTeamId === team.id ? 'bg-black/20' : 'bg-white/10'
                                    }`}>
                                        {team.name[0]}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-display text-xl uppercase italic leading-none">{team.name}</div>
                                        <div className={`text-[10px] font-mono uppercase tracking-widest mt-1 ${
                                            selectedTeamId === team.id ? 'text-black/60' : 'text-white/40'
                                        }`}>
                                            {team.homeGround}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} className={`transition-transform ${selectedTeamId === team.id ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
