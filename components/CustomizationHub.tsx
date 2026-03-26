import React from 'react';
import { motion } from 'motion/react';
import { Settings, Palette, Layout, Shield, Users, Trophy, Construction, Info } from 'lucide-react';
import { GameData } from '../types';

interface CustomizationHubProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
}

const CustomizationHub: React.FC<CustomizationHubProps> = ({ gameData, setGameData }) => {
    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Construction className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">SYSTEM_CONFIGURATION // v2.0</h2>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                        CUSTOMIZATION<br/>
                        <span className="text-teal-500">HUB</span>
                    </h1>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full"
                >
                    <div className="glass-card p-12 rounded-[48px] border border-white/5 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-50" />
                        
                        <div className="relative z-10">
                            <div className="w-24 h-24 rounded-3xl bg-teal-500/10 flex items-center justify-center mx-auto mb-8 border border-teal-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Construction className="w-12 h-12 text-teal-500" />
                            </div>
                            
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">UNDER_CONSTRUCTION</h2>
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] mb-8 max-w-sm mx-auto leading-relaxed">
                                The advanced league editor and team customization suite is currently undergoing tactical optimization.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <Palette className="w-4 h-4 text-teal-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">KIT_DESIGNER</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">LOGO_EDITOR</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">ROSTER_TOOLS</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <Layout className="w-4 h-4 text-yellow-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">LEAGUE_BUILDER</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 w-fit mx-auto">
                                <Info className="w-4 h-4 text-teal-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">COMING_SOON_IN_V2.1</span>
                            </div>
                        </div>

                        {/* Animated Background Elements */}
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CustomizationHub;
