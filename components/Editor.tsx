
import React, { useState, useCallback, useRef } from 'react';
import { GameData, Player, PlayerRole, Format, BattingStyle, ScoreLimits, Ground } from '../types';
import { getBatterTier, BATTING_PROFILES, getRoleColor, getRoleFullName, getBattingStyleLabel, BATTING_STYLE_OPTIONS } from '../utils';
import { PITCH_TYPES, generateInitialStats } from '../data';
import { PlayerAvatar } from './PlayerAvatar';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Icons } from './Icons';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedPlayer) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${selectedPlayer.id}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setSelectedPlayer(prev => prev ? { ...prev, avatarUrl: url } : null);
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Failed to upload photo.");
        } finally {
            setIsUploading(false);
        }
    };

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
            // Maintain backward compatibility if the function expects a string for pitch only
            // But prefer object update
            handleUpdateGround(code, { pitch: value });
        } else {
            handleUpdateGround(code, { [field]: value });
        }
    };

    const renderPlayerEditor = () => {
        if (!selectedPlayer) return null;

        return (
            <div className="p-6 space-y-6 max-w-4xl mx-auto bg-[#F0F4F8] dark:bg-[#0A0F0F] rounded-2xl shadow-2xl border border-teal-500/20 text-gray-900 dark:text-white">
                 <div className="flex justify-between items-center border-b border-teal-500/30 pb-4">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-teal-600 dark:text-teal-500">{isCreating ? 'CREATE_NEW_ENTITY' : 'PLAYER EDITOR'}</h2>
                    <div className="flex gap-2">
                        <button onClick={savePlayer} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-teal-600/20">Save Profile</button>
                        <button onClick={() => setSelectedPlayer(null)} className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row gap-8">
                     {/* Left Side: Avatar & Upload */}
                     <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
                         <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Generate Avatar</div>
                         <div className="flex gap-2 mb-4">
                             {[1, 2, 3, 4].map(i => (
                                 <button 
                                     key={i}
                                     onClick={() => setSelectedPlayer({...selectedPlayer, avatarUrl: undefined, avatarSeed: Math.random().toString(36).substring(7)})}
                                     className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:border-teal-500 transition-all overflow-hidden"
                                 >
                                     <PlayerAvatar player={{...selectedPlayer, avatarUrl: undefined, avatarSeed: `seed-${i}`}} size="sm" />
                                 </button>
                             ))}
                         </div>
                         
                         <div className="relative group">
                             <PlayerAvatar player={selectedPlayer} size="xl" className="shadow-2xl border-4 border-white dark:border-gray-800" />
                         </div>
                         
                         <h3 className="text-xl font-black uppercase tracking-tighter mt-4 text-center">{selectedPlayer.name || 'UNKNOWN'}</h3>

                         <input 
                             type="file" 
                             ref={fileInputRef} 
                             onChange={handlePhotoUpload} 
                             accept="image/*" 
                             className="hidden" 
                         />
                         <button 
                             onClick={() => fileInputRef.current?.click()}
                             disabled={isUploading}
                             className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                         >
                             {isUploading ? 'Uploading...' : 'Upload Photo'}
                         </button>
                     </div>

                     {/* Right Side: Grid */}
                     <div className="w-full md:w-2/3 space-y-6">
                         
                         {/* Basic Info */}
                         <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Basic Info</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Name</label>
                                     <input type="text" value={selectedPlayer.name} onChange={e => setSelectedPlayer({...selectedPlayer, name: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-teal-500 transition-all outline-none font-bold text-sm" />
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Age</label>
                                     <input type="number" value={selectedPlayer.age || 25} onChange={e => setSelectedPlayer({...selectedPlayer, age: +e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-teal-500 transition-all outline-none font-bold text-sm" />
                                 </div>
                                 <div className="sm:col-span-2">
                                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Team</label>
                                     <select value={selectedPlayer.teamName || ''} onChange={e => setSelectedPlayer({...selectedPlayer, teamName: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-teal-500 transition-all outline-none font-bold text-sm">
                                         <option value="">Free Agent</option>
                                         {gameData.teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                     </select>
                                 </div>
                             </div>
                         </div>

                         {/* Attributes & Skills */}
                         <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Attributes & Skills</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                 <div>
                                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Role</label>
                                     <select value={selectedPlayer.role} onChange={e => setSelectedPlayer({...selectedPlayer, role: e.target.value as PlayerRole})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-teal-500 transition-all outline-none font-bold text-sm">
                                         {Object.values(PlayerRole).map(r => <option key={r} value={r}>{getRoleFullName(r)}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Style</label>
                                     <select value={selectedPlayer.style} onChange={e => setSelectedPlayer({...selectedPlayer, style: e.target.value as BattingStyle})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-teal-500 transition-all outline-none font-bold text-sm">
                                         {BATTING_STYLE_OPTIONS.map(s => <option key={s} value={s}>{getBattingStyleLabel(s)}</option>)}
                                     </select>
                                 </div>
                             </div>

                             <div className="space-y-5">
                                 <div>
                                     <div className="flex justify-between items-center mb-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Batting Power</label>
                                         <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{selectedPlayer.battingSkill}/100</span>
                                     </div>
                                     <input type="range" min="1" max="99" value={selectedPlayer.battingSkill} onChange={e => setSelectedPlayer({...selectedPlayer, battingSkill: +e.target.value})} className="w-full accent-teal-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                 </div>
                                 <div>
                                     <div className="flex justify-between items-center mb-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Bowling Speed</label>
                                         <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{selectedPlayer.secondarySkill}/100</span>
                                     </div>
                                     <input type="range" min="1" max="99" value={selectedPlayer.secondarySkill} onChange={e => setSelectedPlayer({...selectedPlayer, secondarySkill: +e.target.value})} className="w-full accent-teal-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                 </div>
                                 <div>
                                     <div className="flex justify-between items-center mb-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Fielding</label>
                                         <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{selectedPlayer.fielding || 50}/100</span>
                                     </div>
                                     <input type="range" min="1" max="99" value={selectedPlayer.fielding || 50} onChange={e => setSelectedPlayer({...selectedPlayer, fielding: +e.target.value})} className="w-full accent-teal-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                 </div>
                                 <div>
                                     <div className="flex justify-between items-center mb-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Accuracy</label>
                                         <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{selectedPlayer.accuracy || 50}/100</span>
                                     </div>
                                     <input type="range" min="1" max="99" value={selectedPlayer.accuracy || 50} onChange={e => setSelectedPlayer({...selectedPlayer, accuracy: +e.target.value})} className="w-full accent-teal-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                 </div>
                             </div>
                         </div>

                         {/* Advanced Stats */}
                         <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Advanced Stats</h3>
                             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-teal-500 transition-colors">
                                 <div>
                                     <div className="text-sm font-black uppercase tracking-tight">T20 Big Score Bias</div>
                                     <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target: 160-250</div>
                                 </div>
                                 <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
                             </div>
                         </div>

                     </div>
                 </div>
            </div>
        );
    }

    if (selectedPlayer) return renderPlayerEditor();

    return (
        <div className="p-2 h-[calc(100vh-90px)] flex flex-col">
            <h2 className="text-xl font-bold text-center mb-2">Game Editor</h2>
            <div className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-2">
                <button onClick={() => setEditType('players')} className={`px-4 py-2 font-semibold ${editType === 'players' ? 'border-b-2 border-teal-500 text-teal-500' : ''}`}>Players</button>
                <button onClick={() => setEditType('grounds')} className={`px-4 py-2 font-semibold ${editType === 'grounds' ? 'border-b-2 border-teal-500 text-teal-500' : ''}`}>Grounds</button>
                <button onClick={() => setEditType('rules')} className={`px-4 py-2 font-semibold ${editType === 'rules' ? 'border-b-2 border-teal-500 text-teal-500' : ''}`}>Rules</button>
            </div>

            {editType === 'players' && (
                <div className="flex-grow overflow-y-auto">
                    <button onClick={handleAddNewPlayer} className="w-full bg-green-500 text-white p-2 rounded mb-2">Add New Player</button>
                    <ul className="space-y-1">
                    {gameData.allPlayers.map(p => (
                        <li key={p.id} onClick={() => handleSelectPlayer(p.id)} className="flex items-center bg-gray-100 dark:bg-gray-800/50 p-2 rounded-md cursor-pointer">
                            <span className={`font-bold w-8 text-sm ${getRoleColor(p.role)}`}>{p.role}</span>
                            <span className="flex-grow">{p.name} {p.isForeign ? '(F)' : ''}</span>
                            <span className="font-semibold">{p.battingSkill}</span>
                        </li>
                    ))}
                    </ul>
                </div>
            )}

            {editType === 'grounds' && (
                 <div className="space-y-4 overflow-y-auto pb-20">
                    {gameData.grounds.map(g => (
                        <div key={g.code} className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-lg">{g.name}</p>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{g.code}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Pitch Type</label>
                                    <select value={g.pitch} onChange={e => handleGroundChange(g.code, 'pitch', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm">
                                        {PITCH_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Weather</label>
                                        <select value={g.weather || 'Sunny'} onChange={e => handleGroundChange(g.code, 'weather', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm">
                                            {['Sunny', 'Overcast', 'Rainy', 'Humid', 'Dry'].map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Outfield</label>
                                        <select value={g.outfieldSpeed || 'Medium'} onChange={e => handleGroundChange(g.code, 'outfieldSpeed', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm">
                                            {['Fast', 'Medium', 'Slow', 'Lightning'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Boundaries</label>
                                        <select value={g.boundarySize || 'Medium'} onChange={e => handleGroundChange(g.code, 'boundarySize', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm">
                                            {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Dimensions</label>
                                        <input type="text" value={g.dimensions || ''} onChange={e => handleGroundChange(g.code, 'dimensions', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm" placeholder="e.g. 70m / 65m" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

             {editType === 'rules' && (
                 <div className="space-y-3 overflow-y-auto">
                    {gameData.grounds.map(g => (
                        <div key={g.code} className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-md">
                            <p className="font-bold mb-2">{g.name}</p>
                            {Object.values(Format).map(format => (
                                <div key={format} className="mb-2 last:mb-0">
                                    <p className="font-semibold text-sm">{format}</p>
                                    {(format === Format.SHIELD ? [1, 2, 3, 4] : [1, 2]).map(inning => (
                                        <div key={inning} className="pl-2 mt-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Inning {inning}</p>
                                            <div className="flex space-x-2 mt-1">
                                                <input 
                                                    type="number" 
                                                    placeholder="Max Runs"
                                                    value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxRuns || ''}
                                                    onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxRuns', e.target.value, inning)}
                                                    className="w-1/2 p-1 rounded bg-white dark:bg-gray-900 text-sm"
                                                />
                                                <input 
                                                    type="number"
                                                    placeholder="Max Wkts"
                                                    value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxWickets || ''}
                                                    onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxWickets', e.target.value, inning)}
                                                    className="w-1/2 p-1 rounded bg-white dark:bg-gray-900 text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};

export default Editor;