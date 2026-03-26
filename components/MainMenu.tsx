
import React from 'react';
import { motion } from 'motion/react';
import { Database, Play, RotateCcw } from 'lucide-react';

interface MainMenuProps {
    onStartNewGame: () => void;
    onResumeGame: () => void;
    onOpenEditor: () => void;
    hasSaveData: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNewGame, onResumeGame, onOpenEditor, hasSaveData }) => (
    <div className="h-full flex flex-col items-center justify-center p-10 bg-[#050808] relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-16 text-center"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block bg-teal-500/10 backdrop-blur-md text-teal-400 px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em] mb-6 border border-teal-500/30 rounded-full"
                >
                    SIKE'S_MANAGEMENT_SYSTEM_V2.0
                </motion.div>
                
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.8] text-white font-display mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    CRICKET<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">MANAGER</span>
                </h1>
                
                <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="text-5xl font-black italic text-white/90 font-display tracking-tighter">2026</span>
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
            </motion.div>

            <div className="space-y-4">
                {hasSaveData && (
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onResumeGame}
                        className="w-full group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-400 opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="relative py-5 px-8 flex items-center justify-between border border-white/20">
                            <span className="text-black font-black italic tracking-tighter text-2xl uppercase">RESUME_SESSION</span>
                            <Play size={28} className="text-black group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.button>
                )}
                
                <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartNewGame}
                    className="w-full group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 group-hover:bg-white/20 transition-all" />
                    <div className="relative py-5 px-8 flex items-center justify-between">
                        <span className="text-white font-black italic tracking-tighter text-2xl uppercase">{hasSaveData ? "NEW_CAREER" : "START_CAREER"}</span>
                        <RotateCcw size={28} className="text-teal-400 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenEditor}
                    className="w-full group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md border border-white/5 group-hover:border-white/20 transition-all" />
                    <div className="relative py-5 px-8 flex items-center justify-between">
                        <span className="text-white/60 font-black italic tracking-tighter text-2xl uppercase group-hover:text-white transition-colors">DATA_EDITOR</span>
                        <Database size={28} className="text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                </motion.button>
            </div>

            <div className="mt-20 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                    <p className="text-[8px] font-mono font-bold text-white/40 uppercase tracking-[0.3em]">BUILD_V2.0.26_STABLE</p>
                </div>
            </div>
        </div>
    </div>
);

export default MainMenu;
