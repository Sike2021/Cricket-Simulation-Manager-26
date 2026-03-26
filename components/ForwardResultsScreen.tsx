import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    History, ChevronRight, BarChart3, 
    Trophy, Zap, Shield, Target,
    LayoutGrid, List, Search, Filter,
    ArrowRight, Info, CheckCircle2
} from 'lucide-react';
import { MatchResult } from '../types';

interface ForwardResultsScreenProps {
    results: MatchResult[];
    onBack: () => void;
    userTeamId: string;
    onViewResult: (result: MatchResult) => void;
}

const ForwardResultsScreen: React.FC<ForwardResultsScreenProps> = ({ results, onBack, onViewResult }) => {
    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <History className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">SIMULATION_COMPLETE // v2.0</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            MATCH<br/>
                            <span className="text-teal-500">RESULTS</span>
                        </h1>
                    </div>

                    <button 
                        onClick={onBack}
                        className="px-12 py-4 rounded-2xl bg-teal-500 text-black text-[12px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-3 group"
                    >
                        CONTINUE_TO_DASHBOARD
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6">
                    {results.map((result, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card p-8 rounded-[32px] border border-white/5 hover:border-white/10 transition-all relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BarChart3 className="w-24 h-24" />
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">MATCH_0{result.matchNumber}</span>
                                        <div className="h-px w-8 bg-white/10" />
                                        <span className="text-[10px] font-mono text-teal-500 uppercase tracking-widest">COMPLETED</span>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{result.firstInning.teamName}</span>
                                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest italic">vs</span>
                                            <span className="text-2xl font-black italic uppercase tracking-tighter leading-none mt-1">{result.secondInning.teamName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                                        <p className="text-sm font-bold text-teal-400 italic leading-none">{result.summary}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onViewResult(result)}
                                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 group/btn"
                                >
                                    VIEW_SCORECARD
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <History className="w-10 h-10 text-white/20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">NO_RECENT_SIMULATIONS</h3>
                                <p className="text-white/40 text-sm font-medium uppercase tracking-widest">All match data has been processed.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForwardResultsScreen;
