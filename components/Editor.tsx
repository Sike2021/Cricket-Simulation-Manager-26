import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    User, 
    MapPin, 
    Settings2, 
    Plus, 
    Save, 
    X, 
    ChevronRight, 
    Search, 
    Globe, 
    Zap, 
    Shield, 
    Trophy,
    Cloud,
    Wind,
    Maximize2,
    Activity,
    Target,
    BarChart3,
    Star
} from 'lucide-react';
import { GameData, Player, PlayerRole, Format, BattingStyle, ScoreLimits, Ground } from '../types';
import { getBatterTier, BATTING_PROFILES, getRoleColor, getRoleFullName, getBattingStyleLabel, BATTING_STYLE_OPTIONS } from '../utils';
import { PITCH_TYPES, generateInitialStats } from '../data';

interface EditorProps {
    gameData: GameData;
    handleUpdatePlayer: (player: Player) => void;
    handleCreatePlayer: (player: Player) => void;
    handleUpdateGround: (code: string, updates: Partial<Ground> | string) => void;
    handleUpdateScoreLimits: (groundCode: string, format: Format, field: keyof ScoreLimits, value: any, inning: number) => void;
}

const Editor: React.FC<EditorProps> = ({ gameData, handleUpdatePlayer, handleCreatePlayer, handleUpdateGround, handleUpdateScoreLimits }) => {
    const [editType, setEditType] = useState<'players' | 'grounds' | 'rules'>('players');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editorFormatTab, setEditorFormatTab] = useState<Format>(Format.T20);
    const [searchQuery, setSearchQuery] = useState('');

    const getPlayerProfileForFormat = useCallback((player: Player, format: Format) => {
        const custom = player.customProfiles?.[format];
        if (custom && custom.avg > 0 && custom.sr > 0) {
            return custom;
        }
        const tier = getBatterTier(player.battingSkill);
        const style = player.style;
        // @ts-ignore
        return BATTING_PROFILES[format][tier][style] || BATTING_PROFILES[format][tier]['N'];
    }, []);

    const handleProfileChange = (field: 'avg' | 'sr', value: string) => {
        if (!selectedPlayer) return;
        const numericValue = value ? parseFloat(value) : 0;
        if (isNaN(numericValue)) return;

        setSelectedPlayer(prev => {
            if (!prev) return null;
            const newProfiles = { ...(prev.customProfiles || {}) };
            const newFormatProfile = { avg: 0, sr: 0, ...(newProfiles[editorFormatTab] || {}) };
            newFormatProfile[field] = numericValue;

            if (newFormatProfile.avg <= 0 && newFormatProfile.sr <= 0) {
                delete newProfiles[editorFormatTab];
            } else {
                newProfiles[editorFormatTab] = newFormatProfile;
            }

            if (Object.keys(newProfiles).length === 0) {
                const updatedPlayer = {...prev};
                delete updatedPlayer.customProfiles;
                return updatedPlayer;
            }
            return { ...prev, customProfiles: newProfiles };
        });
    };

    const handleSelectPlayer = (playerId: string) => {
        setIsCreating(false);
        setSelectedPlayer(gameData.allPlayers.find(p => p.id === playerId) || null);
    };

    const handleAddNewPlayer = () => {
        setIsCreating(true);
        setSelectedPlayer({
            id: `new-player-${Date.now()}`,
            name: '',
            nationality: 'Local',
            role: PlayerRole.BATSMAN,
            battingSkill: 50,
            secondarySkill: 10,
            style: 'N',
            isOpener: false,
            isForeign: false,
            stats: generateInitialStats(),
            recentPerformances: []
        });
    }

    const savePlayer = () => {
        if (!selectedPlayer) return;
        if (isCreating) {
            handleCreatePlayer(selectedPlayer);
        } else {
            handleUpdatePlayer(selectedPlayer);
        }
        setSelectedPlayer(null);
        setIsCreating(false);
    }

    const handleGroundChange = (code: string, field: keyof Ground, value: any) => {
        if (field === 'pitch') {
            handleUpdateGround(code, { pitch: value });
        } else {
            handleUpdateGround(code, { [field]: value });
        }
    };

    const filteredPlayers = gameData.allPlayers.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderPlayerEditor = () => {
        if (!selectedPlayer) return null;
        const defaultProfile = getPlayerProfileForFormat(selectedPlayer, editorFormatTab);
        const customAvg = selectedPlayer.customProfiles?.[editorFormatTab]?.avg;
        const customSR = selectedPlayer.customProfiles?.[editorFormatTab]?.sr;

        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 space-y-6 max-w-3xl mx-auto glass-card rounded-3xl border border-white/10 shadow-2xl mb-24"
            >
                 <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-teal-400">
                            {isCreating ? 'CREATE_ENTITY' : 'EDIT_ENTITY'}
                        </h2>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">System Configuration v2.0</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSelectedPlayer(null)} 
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 font-black uppercase italic text-xs hover:bg-white/10 transition-all"
                        >
                            <X size={14} />
                            Cancel
                        </button>
                        <button 
                            onClick={savePlayer} 
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-teal-500 text-[#0A0F0F] font-black uppercase italic text-xs hover:bg-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all"
                        >
                            <Save size={14} />
                            Save Changes
                        </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-teal-400/70">
                            <User size={14} />
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Identity & Core</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-mono uppercase text-white/30 mb-1.5 block tracking-widest">Full Name</label>
                                <input 
                                    type="text" 
                                    value={selectedPlayer.name} 
                                    onChange={e => setSelectedPlayer({...selectedPlayer, name: e.target.value})} 
                                    placeholder="Enter player name" 
                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 transition-all outline-none font-bold text-white placeholder:text-white/10" 
                                />
                            </div>
                            
                            <div>
                                <label className="text-[9px] font-mono uppercase text-white/30 mb-1.5 block tracking-widest">Nationality</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input 
                                        type="text" 
                                        value={selectedPlayer.nationality} 
                                        onChange={e => setSelectedPlayer({...selectedPlayer, nationality: e.target.value})} 
                                        placeholder="Nationality" 
                                        className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 transition-all outline-none font-bold text-white" 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-mono uppercase text-white/30 mb-1.5 block tracking-widest">Primary Role</label>
                                    <select 
                                        value={selectedPlayer.role} 
                                        onChange={e => setSelectedPlayer({...selectedPlayer, role: e.target.value as PlayerRole})} 
                                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 transition-all outline-none font-bold text-white appearance-none"
                                    >
                                        {Object.values(PlayerRole).map(r => <option key={r} value={r} className="bg-[#0A0F0F]">{getRoleFullName(r)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase text-white/30 mb-1.5 block tracking-widest">Batting Style</label>
                                    <select 
                                        value={selectedPlayer.style} 
                                        onChange={e => setSelectedPlayer({...selectedPlayer, style: e.target.value as BattingStyle})} 
                                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 transition-all outline-none font-bold text-white appearance-none"
                                    >
                                        {BATTING_STYLE_OPTIONS.map(s => <option key={s} value={s} className="bg-[#0A0F0F]">{getBattingStyleLabel(s)}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedPlayer.isOpener ? 'bg-teal-500 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'border-white/10 bg-white/5 group-hover:border-white/20'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPlayer.isOpener} 
                                            onChange={e => setSelectedPlayer({...selectedPlayer, isOpener: e.target.checked})} 
                                            className="hidden" 
                                        />
                                        {selectedPlayer.isOpener && <Zap size={12} className="text-[#0A0F0F]" />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Opener</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedPlayer.isForeign ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-white/10 bg-white/5 group-hover:border-white/20'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPlayer.isForeign} 
                                            onChange={e => setSelectedPlayer({...selectedPlayer, isForeign: e.target.checked})} 
                                            className="hidden" 
                                        />
                                        {selectedPlayer.isForeign && <Globe size={12} className="text-white" />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Overseas</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-400/70">
                            <Zap size={14} />
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Performance Metrics</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <Target size={14} className="text-teal-400" />
                                        <label className="text-[9px] font-mono uppercase text-white/30 tracking-widest">Batting Skill</label>
                                    </div>
                                    <span className="text-2xl font-black italic text-teal-400">{selectedPlayer.battingSkill}</span>
                                </div>
                                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${selectedPlayer.battingSkill}%` }}
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-600 to-teal-400"
                                    />
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="99" 
                                        value={selectedPlayer.battingSkill} 
                                        onChange={e => setSelectedPlayer({...selectedPlayer, battingSkill: +e.target.value})} 
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-blue-400" />
                                        <label className="text-[9px] font-mono uppercase text-white/30 tracking-widest">Bowling Skill</label>
                                    </div>
                                    <span className="text-2xl font-black italic text-blue-400">{selectedPlayer.secondarySkill}</span>
                                </div>
                                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${selectedPlayer.secondarySkill}%` }}
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400"
                                    />
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="99" 
                                        value={selectedPlayer.secondarySkill} 
                                        onChange={e => setSelectedPlayer({...selectedPlayer, secondarySkill: +e.target.value})} 
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 pt-2">
                                {[
                                    { label: 'Potential', key: 'potential', icon: Star },
                                    { label: 'Form', key: 'form', icon: Activity },
                                    { label: 'Fitness', key: 'fitness', icon: Zap }
                                ].map((stat) => (
                                    <div key={stat.key} className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <stat.icon size={10} className="text-white/30" />
                                            <label className="text-[8px] font-mono uppercase text-white/30 tracking-widest">{stat.label}</label>
                                        </div>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="99" 
                                            // @ts-ignore
                                            value={selectedPlayer[stat.key] || 50} 
                                            // @ts-ignore
                                            onChange={e => setSelectedPlayer({...selectedPlayer, [stat.key]: +e.target.value})} 
                                            className="w-full bg-transparent font-black italic text-center text-lg outline-none text-white" 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="border-t border-white/10 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-purple-400/70">
                            <BarChart3 size={14} />
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Format-Specific Overrides</h3>
                        </div>
                        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                            {Object.values(Format).map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setEditorFormatTab(f)} 
                                    className={`px-4 py-1.5 text-[9px] font-black uppercase italic rounded-lg transition-all ${editorFormatTab === f ? 'bg-teal-500 text-[#0A0F0F] shadow-lg' : 'text-white/40 hover:text-white'}`}
                                >
                                    {f.split(' ')[1] || f}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                        <div>
                            <label className="text-[9px] font-mono uppercase text-white/30 mb-2 block tracking-widest">Target Average</label>
                            <input 
                                type="number" 
                                value={customAvg || ''} 
                                onChange={e => handleProfileChange('avg', e.target.value)} 
                                placeholder={`Default: ${defaultProfile.avg}`} 
                                className="w-full p-4 rounded-2xl bg-[#0A0F0F]/50 border border-white/10 font-black italic text-xl outline-none focus:border-teal-500/50 transition-all text-white placeholder:text-white/10" 
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-mono uppercase text-white/30 mb-2 block tracking-widest">Target Strike Rate</label>
                            <input 
                                type="number" 
                                value={customSR || ''} 
                                onChange={e => handleProfileChange('sr', e.target.value)} 
                                placeholder={`Default: ${defaultProfile.sr}`} 
                                className="w-full p-4 rounded-2xl bg-[#0A0F0F]/50 border border-white/10 font-black italic text-xl outline-none focus:border-teal-500/50 transition-all text-white placeholder:text-white/10" 
                            />
                        </div>
                    </div>
                    <p className="mt-4 text-[9px] font-mono text-white/20 uppercase tracking-widest text-center">Leave blank to use system-calculated profiles based on skill tier.</p>
                 </div>
            </motion.div>
        );
    }

    return (
        <div className="p-6 h-[calc(100vh-90px)] flex flex-col bg-[#050808]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">
                        SYSTEM <span className="text-teal-400">EDITOR</span>
                    </h1>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] mt-1">Global Configuration Interface</p>
                </div>
                
                <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                    {[
                        { id: 'players', label: 'PLAYERS', icon: User },
                        { id: 'grounds', label: 'GROUNDS', icon: MapPin },
                        { id: 'rules', label: 'RULES', icon: Settings2 }
                    ].map((type) => (
                        <button 
                            key={type.id}
                            // @ts-ignore
                            onClick={() => setEditType(type.id)} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all duration-500 ${editType === type.id ? 'bg-teal-500 text-[#0A0F0F] shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <type.icon size={14} />
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {editType === 'players' && (
                    <motion.div 
                        key="players-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-grow flex flex-col min-h-0"
                    >
                        <div className="flex gap-4 mb-6">
                            <div className="flex-grow relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                <input 
                                    type="text" 
                                    placeholder="SEARCH PLAYER DATABASE..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none font-black italic uppercase text-sm transition-all text-white placeholder:text-white/10"
                                />
                            </div>
                            <button 
                                onClick={handleAddNewPlayer}
                                className="h-14 px-8 rounded-2xl bg-teal-500 text-[#0A0F0F] font-black uppercase italic text-xs flex items-center gap-2 hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                            >
                                <Plus size={16} />
                                CREATE NEW
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredPlayers.map(p => (
                                    <motion.button 
                                        key={p.id} 
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        onClick={() => handleSelectPlayer(p.id)} 
                                        className="flex items-center gap-4 glass-card p-4 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all group text-left"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-sm ${getRoleColor(p.role)} bg-white/5 border border-white/5`}>
                                            {p.role}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black uppercase italic text-sm text-white group-hover:text-teal-400 transition-colors">{p.name}</span>
                                                {p.isForeign && <Globe size={10} className="text-blue-400" />}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{p.nationality}</span>
                                                <div className="h-1 w-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-mono text-teal-400/50 uppercase tracking-widest">SKILL: {p.battingSkill}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-white/10 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {editType === 'grounds' && (
                    <motion.div 
                        key="grounds-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-grow overflow-y-auto pr-2 custom-scrollbar pb-24"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {gameData.grounds.map(g => (
                                <div key={g.code} className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">{g.name}</h3>
                                            <span className="text-[10px] font-mono text-teal-400/50 uppercase tracking-[0.3em]">{g.code}</span>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <MapPin size={20} className="text-teal-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-mono uppercase text-white/30 tracking-widest block">Pitch Characteristics</label>
                                            <select 
                                                value={g.pitch} 
                                                onChange={e => handleGroundChange(g.code, 'pitch', e.target.value)} 
                                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none font-bold text-white appearance-none"
                                            >
                                                {PITCH_TYPES.map(pt => <option key={pt} value={pt} className="bg-[#0A0F0F]">{pt}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-white/30">
                                                    <Cloud size={12} />
                                                    <label className="text-[9px] font-mono uppercase tracking-widest">Weather</label>
                                                </div>
                                                <select 
                                                    value={g.weather || 'Sunny'} 
                                                    onChange={e => handleGroundChange(g.code, 'weather', e.target.value)} 
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none font-bold text-white appearance-none"
                                                >
                                                    {['Sunny', 'Overcast', 'Rainy', 'Humid', 'Dry'].map(w => <option key={w} value={w} className="bg-[#0A0F0F]">{w}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-white/30">
                                                    <Wind size={12} />
                                                    <label className="text-[9px] font-mono uppercase tracking-widest">Outfield</label>
                                                </div>
                                                <select 
                                                    value={g.outfieldSpeed || 'Medium'} 
                                                    onChange={e => handleGroundChange(g.code, 'outfieldSpeed', e.target.value)} 
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none font-bold text-white appearance-none"
                                                >
                                                    {['Fast', 'Medium', 'Slow', 'Lightning'].map(s => <option key={s} value={s} className="bg-[#0A0F0F]">{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-white/30">
                                                    <Trophy size={12} />
                                                    <label className="text-[9px] font-mono uppercase tracking-widest">Boundaries</label>
                                                </div>
                                                <select 
                                                    value={g.boundarySize || 'Medium'} 
                                                    onChange={e => handleGroundChange(g.code, 'boundarySize', e.target.value)} 
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none font-bold text-white appearance-none"
                                                >
                                                    {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s} className="bg-[#0A0F0F]">{s}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-white/30">
                                                    <Maximize2 size={12} />
                                                    <label className="text-[9px] font-mono uppercase tracking-widest">Dimensions</label>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={g.dimensions || ''} 
                                                    onChange={e => handleGroundChange(g.code, 'dimensions', e.target.value)} 
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none font-bold text-white placeholder:text-white/10" 
                                                    placeholder="e.g. 70m / 65m" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                 {editType === 'rules' && (
                    <motion.div 
                        key="rules-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-grow overflow-y-auto pr-2 custom-scrollbar pb-24"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {gameData.grounds.map(g => (
                                <div key={g.code} className="glass-card p-6 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-teal-500/10 rounded-lg">
                                            <Settings2 size={16} className="text-teal-400" />
                                        </div>
                                        <h3 className="text-xl font-black italic uppercase text-white">{g.name}</h3>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {Object.values(Format).map(format => (
                                            <div key={format} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-px flex-grow bg-white/5" />
                                                    <span className="text-[10px] font-black uppercase italic text-teal-400/50 tracking-widest">{format}</span>
                                                    <div className="h-px flex-grow bg-white/5" />
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {(format === Format.SHIELD ? [1, 2, 3, 4] : [1, 2]).map(inning => (
                                                        <div key={inning} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                            <p className="text-[9px] font-mono uppercase text-white/30 mb-3 tracking-widest">Inning {inning}</p>
                                                            <div className="flex gap-3">
                                                                <div className="flex-grow">
                                                                    <label className="text-[8px] font-mono uppercase text-white/20 block mb-1">Max Runs</label>
                                                                    <input 
                                                                        type="number" 
                                                                        placeholder="---"
                                                                        value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxRuns || ''}
                                                                        onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxRuns', e.target.value, inning)}
                                                                        className="w-full p-3 rounded-xl bg-[#0A0F0F]/50 border border-white/10 font-black italic text-center text-teal-400 outline-none focus:border-teal-500/50"
                                                                    />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <label className="text-[8px] font-mono uppercase text-white/20 block mb-1">Max Wkts</label>
                                                                    <input 
                                                                        type="number"
                                                                        placeholder="---"
                                                                        value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxWickets || ''}
                                                                        onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxWickets', e.target.value, inning)}
                                                                        className="w-full p-3 rounded-xl bg-[#0A0F0F]/50 border border-white/10 font-black italic text-center text-red-400 outline-none focus:border-red-500/50"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Editor;
