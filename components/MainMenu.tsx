
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
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-96 h-96 border-8 border-teal-500 rotate-12" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 border-8 border-white -rotate-12" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-16 text-center"
            >
                <div className="inline-block bg-teal-500 text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em] mb-4 border-2 border-white">
                    SIKE'S_MANAGEMENT_SYSTEM
                </div>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.8] text-white font-display mb-2">
                    CRICKET<br/>MANAGER
                </h1>
                <div className="flex items-center justify-center gap-4">
                    <div className="h-[2px] flex-grow bg-white/20" />
                    <span className="text-5xl font-black italic text-teal-500 font-display">25</span>
                    <div className="h-[2px] flex-grow bg-white/20" />
                </div>
            </motion.div>

            <div className="space-y-6">
                {hasSaveData && (
                    <button
                        onClick={onResumeGame}
                        className="w-full bg-teal-500 text-black py-6 px-8 font-black italic tracking-tighter text-3xl uppercase hover:invert transition-all border-4 border-white flex items-center justify-between group"
                    >
                        <span>RESUME_SESSION</span>
                        <Play size={32} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                )}
                
                <button
                    onClick={onStartNewGame}
                    className="w-full bg-white text-black py-6 px-8 font-black italic tracking-tighter text-3xl uppercase hover:bg-teal-500 transition-all border-4 border-white flex items-center justify-between group"
                >
                    <span>{hasSaveData ? "NEW_CAREER" : "START_CAREER"}</span>
                    <RotateCcw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>

                <button
                    onClick={onOpenEditor}
                    className="w-full bg-transparent text-white py-6 px-8 font-black italic tracking-tighter text-3xl uppercase hover:bg-white/10 transition-all border-4 border-white/20 flex items-center justify-between group"
                >
                    <span>DATA_EDITOR</span>
                    <Database size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            <div className="mt-16 text-center">
                <p className="text-[9px] font-mono font-bold opacity-30 uppercase tracking-[0.5em]">BUILD_V2.0.26 // STABLE_RELEASE</p>
            </div>
        </div>
    </div>
);

export default MainMenu;
