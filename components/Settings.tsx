import React from 'react';
import { motion } from 'motion/react';
import { 
    Save, Download, RotateCcw, Moon, Sun, 
    ShieldAlert, Settings as SettingsIcon, 
    Database, Palette, Bell, Globe, 
    ShieldCheck, Info, ChevronRight, 
    Monitor, Smartphone, Cpu
} from 'lucide-react';

interface SettingsProps {
    onResetGame: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    saveGame: () => void;
    loadGame: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onResetGame, theme, setTheme, saveGame, loadGame }) => {
    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <SettingsIcon className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">SYSTEM_PREFERENCES // v2.0</h2>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                        GLOBAL<br/>
                        <span className="text-teal-500">SETTINGS</span>
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Appearance Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <Palette className="w-4 h-4 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">VISUAL_INTERFACE</h3>
                        </div>
                        
                        <div className="glass-card p-8 rounded-[32px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-tight italic">THEME_SELECTION</h4>
                                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Adjust the visual aesthetic of the management suite.</p>
                            </div>
                            
                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                                <button 
                                    onClick={() => setTheme('light')} 
                                    className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${theme === 'light' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                                >
                                    <Sun size={14} />
                                    LIGHT_MODE
                                </button>
                                <button 
                                    onClick={() => setTheme('dark')} 
                                    className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${theme === 'dark' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                                >
                                    <Moon size={14} />
                                    DARK_MODE
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Data Management Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Database className="w-4 h-4 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">DATA_MANAGEMENT</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button 
                                onClick={saveGame} 
                                className="glass-card p-8 rounded-[32px] border border-white/5 hover:border-blue-500/30 transition-all group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Save className="w-12 h-12" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                    <Save className="w-5 h-5 text-blue-500" />
                                </div>
                                <h4 className="text-lg font-black italic uppercase tracking-tighter mb-1 group-hover:text-blue-400 transition-colors">SAVE_CAREER</h4>
                                <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Persist current progress to local storage.</p>
                            </button>

                            <button 
                                onClick={loadGame} 
                                className="glass-card p-8 rounded-[32px] border border-white/5 hover:border-teal-500/30 transition-all group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Download className="w-12 h-12" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                                    <Download className="w-5 h-5 text-teal-500" />
                                </div>
                                <h4 className="text-lg font-black italic uppercase tracking-tighter mb-1 group-hover:text-teal-400 transition-colors">LOAD_CAREER</h4>
                                <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Restore previously saved career data.</p>
                            </button>
                        </div>
                    </section>

                    {/* Danger Zone Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">DANGER_ZONE</h3>
                        </div>

                        <div className="glass-card p-8 rounded-[32px] border border-red-500/20 bg-red-500/5 relative overflow-hidden group">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-2 max-w-md">
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter text-red-400">RESET_ALL_PROGRESS</h4>
                                    <p className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest leading-relaxed">
                                        Permanently delete all career data, including matches, stats, and franchise history. This action is irreversible.
                                    </p>
                                </div>
                                <button 
                                    onClick={onResetGame} 
                                    className="px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500 flex items-center gap-3 whitespace-nowrap"
                                >
                                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                                    INITIALIZE_RESET
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* System Info */}
                    <footer className="pt-12 pb-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <Cpu className="w-3 h-3 text-white/20" />
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">BUILD_2026.03.25</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <ShieldCheck className="w-3 h-3 text-teal-500" />
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">SECURE_SESSION</span>
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">SIKE_CRICKET_MANAGER // V2.0_STABLE</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Settings;
