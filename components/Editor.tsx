
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Settings, Plus, Save, Trash2, ChevronRight, Search, Filter, Database, Trophy, Users, Globe, Info, Play, Pause, X, Check, RefreshCw, TrendingUp, TrendingDown, Bot, Gavel, LineChart, LayoutDashboard, Newspaper, ListOrdered, Settings2, UserCircle, Map, Shield, History as HistoryIcon, DollarSign, Timer, SkipForward } from 'lucide-react';
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
            stats: generateInitialStats()
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
            // Maintain backward compatibility if the function expects a string for pitch only
            // But prefer object update
            handleUpdateGround(code, { pitch: value });
        } else {
            handleUpdateGround(code, { [field]: value });
        }
    };

    const renderPlayerEditor = () => {
        if (!selectedPlayer) return null;
        const defaultProfile = getPlayerProfileForFormat(selectedPlayer, editorFormatTab);
        const customAvg = selectedPlayer.customProfiles?.[editorFormatTab]?.avg;
        const customSR = selectedPlayer.customProfiles?.[editorFormatTab]?.sr;

        return (
            <div className="p-4 space-y-4 max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-teal-500/20">
                 <div className="flex justify-between items-center border-b border-teal-500/30 pb-4">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-teal-500">{isCreating ? 'CREATE_NEW_ENTITY' : 'EDIT_ENTITY_DATA'}</h2>
                    <div className="flex gap-2">
                        <button onClick={savePlayer} className="bg-teal-500 text-[#0A0F0F] px-6 py-2 rounded font-black uppercase italic text-sm hover:bg-teal-400 transition-colors">Save</button>
                        <button onClick={() => setSelectedPlayer(null)} className="bg-gray-700 text-white px-6 py-2 rounded font-black uppercase italic text-sm hover:bg-gray-600 transition-colors">Cancel</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono font-bold text-teal-500/70 uppercase tracking-widest">Basic Information</h3>
                        <div>
                            <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Entity Name</label>
                            <input type="text" value={selectedPlayer.name} onChange={e => setSelectedPlayer({...selectedPlayer, name: e.target.value})} placeholder="Name" className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-teal-500 transition-all outline-none font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Nationality</label>
                            <input type="text" value={selectedPlayer.nationality} onChange={e => setSelectedPlayer({...selectedPlayer, nationality: e.target.value})} placeholder="Nationality" className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-teal-500 transition-all outline-none font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Primary Role</label>
                                <select value={selectedPlayer.role} onChange={e => setSelectedPlayer({...selectedPlayer, role: e.target.value as PlayerRole})} className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-teal-500 transition-all outline-none font-bold">
                                    {Object.values(PlayerRole).map(r => <option key={r} value={r}>{getRoleFullName(r)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Batting Style</label>
                                <select value={selectedPlayer.style} onChange={e => setSelectedPlayer({...selectedPlayer, style: e.target.value as BattingStyle})} className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-teal-500 transition-all outline-none font-bold">
                                    {BATTING_STYLE_OPTIONS.map(s => <option key={s} value={s}>{getBattingStyleLabel(s)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={selectedPlayer.isOpener} onChange={e => setSelectedPlayer({...selectedPlayer, isOpener: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                                <span className="text-xs font-bold uppercase tracking-tight group-hover:text-teal-500 transition-colors">Opener</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={selectedPlayer.isForeign} onChange={e => setSelectedPlayer({...selectedPlayer, isForeign: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                                <span className="text-xs font-bold uppercase tracking-tight group-hover:text-teal-500 transition-colors">Foreign</span>
                            </label>
                        </div>
                    </div>

                    {/* Skills & Performance */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono font-bold text-teal-500/70 uppercase tracking-widest">Skill Metrics</h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-mono uppercase opacity-50">Batting Skill</label>
                                <span className="text-lg font-black italic text-teal-500">{selectedPlayer.battingSkill}</span>
                            </div>
                            <input type="range" min="1" max="99" value={selectedPlayer.battingSkill} onChange={e => setSelectedPlayer({...selectedPlayer, battingSkill: +e.target.value})} className="w-full accent-teal-500" />
                            
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-mono uppercase opacity-50">Bowling Skill</label>
                                <span className="text-lg font-black italic text-teal-500">{selectedPlayer.secondarySkill}</span>
                            </div>
                            <input type="range" min="1" max="99" value={selectedPlayer.secondarySkill} onChange={e => setSelectedPlayer({...selectedPlayer, secondarySkill: +e.target.value})} className="w-full accent-teal-500" />
                            
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <div>
                                    <label className="text-[8px] font-mono uppercase opacity-50 block mb-1">Potential</label>
                                    <input type="number" min="1" max="99" value={selectedPlayer.potential || 50} onChange={e => setSelectedPlayer({...selectedPlayer, potential: +e.target.value})} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 font-bold text-center" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-mono uppercase opacity-50 block mb-1">Form</label>
                                    <input type="number" min="1" max="99" value={selectedPlayer.form || 50} onChange={e => setSelectedPlayer({...selectedPlayer, form: +e.target.value})} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 font-bold text-center" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-mono uppercase opacity-50 block mb-1">Fitness</label>
                                    <input type="number" min="1" max="99" value={selectedPlayer.fitness || 50} onChange={e => setSelectedPlayer({...selectedPlayer, fitness: +e.target.value})} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 font-bold text-center" />
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="border-t border-teal-500/20 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-mono font-bold text-teal-500/70 uppercase tracking-widest">Custom Format Profiles</h3>
                        <div className="flex gap-1">
                            {Object.values(Format).map(f => (
                                <button key={f} onClick={() => setEditorFormatTab(f)} className={`px-3 py-1 text-[10px] font-black uppercase italic transition-all ${editorFormatTab === f ? 'bg-teal-500 text-[#0A0F0F]' : 'bg-gray-800 text-gray-500 hover:text-white'}`}>{f.split(' ')[1] || f}</button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-white/5">
                        <div>
                            <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Target Average</label>
                            <input type="number" value={customAvg || ''} onChange={e => handleProfileChange('avg', e.target.value)} placeholder={`Default: ${defaultProfile.avg}`} className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 font-bold outline-none border border-transparent focus:border-teal-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Target Strike Rate</label>
                            <input type="number" value={customSR || ''} onChange={e => handleProfileChange('sr', e.target.value)} placeholder={`Default: ${defaultProfile.sr}`} className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 font-bold outline-none border border-transparent focus:border-teal-500" />
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    if (selectedPlayer) return renderPlayerEditor();

    return (
        <div className="p-6 h-[calc(100vh-90px)] flex flex-col bg-[#050808]">
            <div className="flex justify-between items-center mb-8 border-b-4 border-white pb-4">
                <h2 className="text-5xl font-black italic tracking-tighter uppercase font-display">DATA_EDITOR</h2>
                <div className="flex bg-white/5 border-2 border-white/10 p-1">
                    <button 
                        onClick={() => setEditType('players')} 
                        className={`px-6 py-2 text-[10px] font-black uppercase italic transition-all ${editType === 'players' ? 'bg-teal-500 text-black' : 'text-white/50 hover:text-white'}`}
                    >
                        PLAYERS
                    </button>
                    <button 
                        onClick={() => setEditType('grounds')} 
                        className={`px-6 py-2 text-[10px] font-black uppercase italic transition-all ${editType === 'grounds' ? 'bg-teal-500 text-black' : 'text-white/50 hover:text-white'}`}
                    >
                        GROUNDS
                    </button>
                    <button 
                        onClick={() => setEditType('rules')} 
                        className={`px-6 py-2 text-[10px] font-black uppercase italic transition-all ${editType === 'rules' ? 'bg-teal-500 text-black' : 'text-white/50 hover:text-white'}`}
                    >
                        RULES
                    </button>
                </div>
            </div>

            {editType === 'players' && (
                <div className="flex-grow flex flex-col overflow-hidden">
                    <button 
                        onClick={handleAddNewPlayer} 
                        className="w-full bg-white text-black py-4 px-6 font-black italic tracking-tighter text-xl uppercase hover:bg-teal-500 transition-all mb-6 border-4 border-white flex items-center justify-center gap-3"
                    >
                        <Plus size={24} />
                        <span>REGISTER_NEW_ENTITY</span>
                    </button>
                    
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-2">
                            {gameData.allPlayers.map(p => (
                                <motion.div 
                                    key={p.id} 
                                    whileHover={{ x: 10 }}
                                    onClick={() => handleSelectPlayer(p.id)} 
                                    className="flex items-center bg-white/5 p-4 border-2 border-white/10 cursor-pointer group hover:border-teal-500 transition-all"
                                >
                                    <div className={`w-12 h-12 flex items-center justify-center font-black text-xs border-2 border-white/10 mr-4 group-hover:border-teal-500/50 ${getRoleColor(p.role)}`}>
                                        {p.role.substring(0, 3)}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-black uppercase tracking-tight text-lg leading-none group-hover:text-teal-500">{p.name}</p>
                                        <p className="text-[10px] font-mono opacity-50 uppercase mt-1">{p.nationality} {p.isForeign ? '// INTERNATIONAL' : '// DOMESTIC'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono opacity-50 uppercase">SKILL_RATING</p>
                                        <p className="text-xl font-black font-mono text-teal-500">{p.battingSkill}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {editType === 'grounds' && (
                 <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {gameData.grounds.map(g => (
                        <div key={g.code} className="bg-white/5 p-6 border-4 border-white/10 hover:border-white/20 transition-all">
                            <div className="flex justify-between items-end mb-6 border-b-2 border-white/10 pb-4">
                                <div>
                                    <h4 className="text-3xl font-black uppercase tracking-tighter italic font-display leading-none">{g.name}</h4>
                                    <p className="text-[10px] font-mono font-bold text-teal-500 mt-2 uppercase tracking-widest">LOC_ID: {g.code}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-mono uppercase opacity-50 mb-2 block tracking-widest">Surface_Type</label>
                                    <select 
                                        value={g.pitch} 
                                        onChange={e => handleGroundChange(g.code, 'pitch', e.target.value)} 
                                        className="w-full p-4 bg-white/5 border-2 border-white/10 focus:border-teal-500 outline-none font-black uppercase italic text-sm transition-all"
                                    >
                                        {PITCH_TYPES.map(pt => <option key={pt} value={pt} className="bg-[#0A0F0F]">{pt}</option>)}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 mb-2 block tracking-widest">Atmosphere</label>
                                        <select 
                                            value={g.weather || 'Sunny'} 
                                            onChange={e => handleGroundChange(g.code, 'weather', e.target.value)} 
                                            className="w-full p-4 bg-white/5 border-2 border-white/10 focus:border-teal-500 outline-none font-black uppercase italic text-sm transition-all"
                                        >
                                            {['Sunny', 'Overcast', 'Rainy', 'Humid', 'Dry'].map(w => <option key={w} value={w} className="bg-[#0A0F0F]">{w}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 mb-2 block tracking-widest">Outfield_Velocity</label>
                                        <select 
                                            value={g.outfieldSpeed || 'Medium'} 
                                            onChange={e => handleGroundChange(g.code, 'outfieldSpeed', e.target.value)} 
                                            className="w-full p-4 bg-white/5 border-2 border-white/10 focus:border-teal-500 outline-none font-black uppercase italic text-sm transition-all"
                                        >
                                            {['Fast', 'Medium', 'Slow', 'Lightning'].map(s => <option key={s} value={s} className="bg-[#0A0F0F]">{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 mb-2 block tracking-widest">Boundary_Scale</label>
                                        <select 
                                            value={g.boundarySize || 'Medium'} 
                                            onChange={e => handleGroundChange(g.code, 'boundarySize', e.target.value)} 
                                            className="w-full p-4 bg-white/5 border-2 border-white/10 focus:border-teal-500 outline-none font-black uppercase italic text-sm transition-all"
                                        >
                                            {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s} className="bg-[#0A0F0F]">{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 mb-2 block tracking-widest">Spatial_Dimensions</label>
                                        <input 
                                            type="text" 
                                            value={g.dimensions || ''} 
                                            onChange={e => handleGroundChange(g.code, 'dimensions', e.target.value)} 
                                            className="w-full p-4 bg-white/5 border-2 border-white/10 focus:border-teal-500 outline-none font-black uppercase italic text-sm transition-all" 
                                            placeholder="e.g. 70m / 65m" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

             {editType === 'rules' && (
                 <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6">
                    {gameData.grounds.map(g => (
                        <div key={g.code} className="bg-white/5 p-6 border-4 border-white/10">
                            <div className="flex justify-between items-center mb-6 border-b-2 border-white/10 pb-4">
                                <h4 className="text-2xl font-black uppercase tracking-tighter italic font-display">{g.name}</h4>
                                <span className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-widest">LIMIT_CONFIG</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {Object.values(Format).map(format => (
                                    <div key={format} className="space-y-4">
                                        <p className="text-[11px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 inline-block">{format}</p>
                                        <div className="space-y-4">
                                            {(format === Format.SHIELD ? [1, 2, 3, 4] : [1, 2]).map(inning => (
                                                <div key={inning} className="p-4 bg-black/40 border border-white/5 space-y-3">
                                                    <p className="text-[9px] font-mono font-bold opacity-50 uppercase tracking-widest">INNING_0{inning}</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[8px] font-mono uppercase opacity-30 block mb-1">MAX_RUNS</label>
                                                            <input 
                                                                type="number" 
                                                                value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxRuns || ''}
                                                                onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxRuns', e.target.value, inning)}
                                                                className="w-full p-2 bg-white/5 border border-white/10 focus:border-teal-500 outline-none font-black text-xs text-center"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[8px] font-mono uppercase opacity-30 block mb-1">MAX_WKTS</label>
                                                            <input 
                                                                type="number"
                                                                value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxWickets || ''}
                                                                onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxWickets', e.target.value, inning)}
                                                                className="w-full p-2 bg-white/5 border border-white/10 focus:border-teal-500 outline-none font-black text-xs text-center"
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
            )}
        </div>
    );
};

export default Editor;