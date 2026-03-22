
import React, { useState, useCallback } from 'react';
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
            <div className="p-4 space-y-4 max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-green-500/20">
                 <div className="flex justify-between items-center border-b border-green-500/30 pb-4">
                    <div className="flex items-center gap-4">
                        {selectedPlayer.photo && (
                            <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-16 h-16 rounded-full border-2 border-green-500 object-cover" referrerPolicy="no-referrer" />
                        )}
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-green-600">{isCreating ? 'CREATE_NEW_PLAYER' : 'EDIT_PLAYER_DATA'}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={savePlayer} className="bg-green-600 text-white px-6 py-2 rounded font-black uppercase italic text-sm hover:bg-green-500 transition-colors shadow-lg shadow-green-500/20">Save</button>
                        <button onClick={() => setSelectedPlayer(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-black uppercase italic text-sm hover:bg-gray-300 transition-colors">Cancel</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono font-bold text-green-600/70 uppercase tracking-widest">Basic Information</h3>
                        <div>
                            <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Player Name</label>
                            <input type="text" value={selectedPlayer.name} onChange={e => setSelectedPlayer({...selectedPlayer, name: e.target.value})} placeholder="Name" className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-green-500 transition-all outline-none font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Nationality</label>
                            <input type="text" value={selectedPlayer.nationality} onChange={e => setSelectedPlayer({...selectedPlayer, nationality: e.target.value})} placeholder="Nationality" className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-green-500 transition-all outline-none font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Primary Role</label>
                                <select value={selectedPlayer.role} onChange={e => setSelectedPlayer({...selectedPlayer, role: e.target.value as PlayerRole})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-green-500 transition-all outline-none font-bold">
                                    {Object.values(PlayerRole).map(r => <option key={r} value={r}>{getRoleFullName(r)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Style</label>
                                <select value={selectedPlayer.style} onChange={e => setSelectedPlayer({...selectedPlayer, style: e.target.value as BattingStyle})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-green-500 transition-all outline-none font-bold">
                                    {BATTING_STYLE_OPTIONS.map(s => <option key={s} value={s}>{getBattingStyleLabel(s)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={selectedPlayer.isOpener} onChange={e => setSelectedPlayer({...selectedPlayer, isOpener: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <span className="text-xs font-bold uppercase tracking-tight group-hover:text-green-600 transition-colors">Opener</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={selectedPlayer.isForeign} onChange={e => setSelectedPlayer({...selectedPlayer, isForeign: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <span className="text-xs font-bold uppercase tracking-tight group-hover:text-green-600 transition-colors">Foreign</span>
                            </label>
                        </div>
                    </div>

                    {/* Skills & Performance */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono font-bold text-green-600/70 uppercase tracking-widest">Skill Metrics</h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-mono uppercase opacity-50">Batting Skill</label>
                                <span className="text-lg font-black italic text-green-600">{selectedPlayer.battingSkill}</span>
                            </div>
                            <input type="range" min="1" max="99" value={selectedPlayer.battingSkill} onChange={e => setSelectedPlayer({...selectedPlayer, battingSkill: +e.target.value})} className="w-full accent-green-600" />
                            
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-mono uppercase opacity-50">Bowling Skill</label>
                                <span className="text-lg font-black italic text-green-600">{selectedPlayer.secondarySkill}</span>
                            </div>
                            <input type="range" min="1" max="99" value={selectedPlayer.secondarySkill} onChange={e => setSelectedPlayer({...selectedPlayer, secondarySkill: +e.target.value})} className="w-full accent-green-600" />
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="text-[8px] font-mono uppercase opacity-50 block mb-1">Aggression</label>
                                    <input type="number" min="1" max="99" value={selectedPlayer.aggression || 50} onChange={e => setSelectedPlayer({...selectedPlayer, aggression: +e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-800 font-bold text-center border border-gray-200 dark:border-gray-700" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-mono uppercase opacity-50 block mb-1">Potential</label>
                                    <input type="number" min="1" max="99" value={selectedPlayer.potential || 50} onChange={e => setSelectedPlayer({...selectedPlayer, potential: +e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-800 font-bold text-center border border-gray-200 dark:border-gray-700" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[8px] font-mono uppercase opacity-50 block mb-1">Form</label>
                                    <input type="number" min="1" max="99" value={selectedPlayer.form || 50} onChange={e => setSelectedPlayer({...selectedPlayer, form: +e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-800 font-bold text-center border border-gray-200 dark:border-gray-700" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-mono uppercase opacity-50 block mb-1">Fitness</label>
                                    <input type="number" min="1" max="99" value={selectedPlayer.fitness || 50} onChange={e => setSelectedPlayer({...selectedPlayer, fitness: +e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-800 font-bold text-center border border-gray-200 dark:border-gray-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-green-500/20 pt-4">
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono font-bold text-green-600/70 uppercase tracking-widest">Base Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Batting Avg</label>
                                <input type="number" step="0.1" value={selectedPlayer.battingAverage || 0} onChange={e => setSelectedPlayer({...selectedPlayer, battingAverage: +e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold outline-none focus:border-green-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Batting SR</label>
                                <input type="number" step="0.1" value={selectedPlayer.battingStrikeRate || 0} onChange={e => setSelectedPlayer({...selectedPlayer, battingStrikeRate: +e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold outline-none focus:border-green-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Bowling Avg</label>
                                <input type="number" step="0.1" value={selectedPlayer.bowlingAverage || 0} onChange={e => setSelectedPlayer({...selectedPlayer, bowlingAverage: +e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold outline-none focus:border-green-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Economy</label>
                                <input type="number" step="0.1" value={selectedPlayer.economy || 0} onChange={e => setSelectedPlayer({...selectedPlayer, economy: +e.target.value})} className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold outline-none focus:border-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-mono font-bold text-green-600/70 uppercase tracking-widest">Format Profiles</h3>
                            <div className="flex gap-1">
                                {Object.values(Format).map(f => (
                                    <button key={f} onClick={() => setEditorFormatTab(f)} className={`px-3 py-1 text-[10px] font-black uppercase italic transition-all ${editorFormatTab === f ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-green-600'}`}>{f.split(' ')[1] || f}</button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Target Average</label>
                                <input type="number" value={customAvg || ''} onChange={e => handleProfileChange('avg', e.target.value)} placeholder={`Default: ${defaultProfile.avg}`} className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 font-bold outline-none border border-gray-200 dark:border-gray-700 focus:border-green-500" />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Target SR</label>
                                <input type="number" value={customSR || ''} onChange={e => handleProfileChange('sr', e.target.value)} placeholder={`Default: ${defaultProfile.sr}`} className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 font-bold outline-none border border-gray-200 dark:border-gray-700 focus:border-green-500" />
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    if (selectedPlayer) return renderPlayerEditor();

    return (
        <div className="p-2 h-[calc(100vh-90px)] flex flex-col bg-white dark:bg-gray-950">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-center mb-2 text-green-600">Game Editor</h2>
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-800 mb-2">
                <button onClick={() => setEditType('players')} className={`px-4 py-2 font-black uppercase italic text-sm transition-all ${editType === 'players' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-400'}`}>Players</button>
                <button onClick={() => setEditType('grounds')} className={`px-4 py-2 font-black uppercase italic text-sm transition-all ${editType === 'grounds' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-400'}`}>Stadiums</button>
                <button onClick={() => setEditType('rules')} className={`px-4 py-2 font-black uppercase italic text-sm transition-all ${editType === 'rules' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-400'}`}>Rules</button>
            </div>

            {editType === 'players' && (
                <div className="flex-grow overflow-y-auto px-2">
                    <button onClick={handleAddNewPlayer} className="w-full bg-green-600 text-white p-3 rounded-xl font-black uppercase italic mb-4 shadow-lg shadow-green-500/20 hover:bg-green-500 transition-all">Add New Player</button>
                    <ul className="space-y-2">
                    {gameData.allPlayers.map(p => (
                        <li key={p.id} onClick={() => handleSelectPlayer(p.id)} className="flex items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-green-500/50 transition-all group">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 mr-3 group-hover:border-green-500 transition-all">
                                <img src={p.photo} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-sm">{p.name} {p.isForeign ? '(F)' : ''}</p>
                                <p className={`text-[10px] font-black uppercase italic ${getRoleColor(p.role)}`}>{getRoleFullName(p.role)}</p>
                            </div>
                            <span className="font-black italic text-green-600">{p.battingSkill}</span>
                        </li>
                    ))}
                    </ul>
                </div>
            )}

            {editType === 'grounds' && (
                 <div className="space-y-4 overflow-y-auto pb-20 px-2">
                    {gameData.grounds.map(g => (
                        <div key={g.code} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Stadium Name</label>
                                        <input type="text" value={g.name} onChange={e => handleGroundChange(g.code, 'name', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm outline-none focus:border-green-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Code</label>
                                        <input type="text" value={g.code} disabled className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 font-bold text-sm opacity-50" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Pitch Type</label>
                                    <select value={g.pitch} onChange={e => handleGroundChange(g.code, 'pitch', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm outline-none focus:border-green-500">
                                        {PITCH_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Weather</label>
                                        <select value={g.weather || 'Sunny'} onChange={e => handleGroundChange(g.code, 'weather', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm outline-none focus:border-green-500">
                                            {['Sunny', 'Overcast', 'Rainy', 'Humid', 'Dry'].map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Outfield</label>
                                        <select value={g.outfieldSpeed || 'Medium'} onChange={e => handleGroundChange(g.code, 'outfieldSpeed', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm outline-none focus:border-green-500">
                                            {['Fast', 'Medium', 'Slow', 'Lightning'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Boundaries</label>
                                        <select value={g.boundarySize || 'Medium'} onChange={e => handleGroundChange(g.code, 'boundarySize', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm outline-none focus:border-green-500">
                                            {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Dimensions</label>
                                        <input type="text" value={g.dimensions || ''} onChange={e => handleGroundChange(g.code, 'dimensions', e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm outline-none focus:border-green-500" placeholder="e.g. 70m / 65m" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

             {editType === 'rules' && (
                 <div className="space-y-3 overflow-y-auto px-2">
                    {gameData.grounds.map(g => (
                        <div key={g.code} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                            <p className="font-black uppercase italic text-green-600 mb-2">{g.name}</p>
                            {Object.values(Format).map(format => (
                                <div key={format} className="mb-4 last:mb-0">
                                    <p className="font-bold text-xs opacity-50 uppercase tracking-widest mb-2">{format}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(format === Format.SHIELD ? [1, 2, 3, 4] : [1, 2]).map(inning => (
                                            <div key={inning} className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                                <p className="text-[10px] font-black uppercase italic mb-1">Inning {inning}</p>
                                                <div className="flex space-x-2">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Runs"
                                                        value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxRuns || ''}
                                                        onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxRuns', e.target.value, inning)}
                                                        className="w-1/2 p-2 rounded bg-gray-50 dark:bg-gray-900 text-xs font-bold outline-none focus:border-green-500"
                                                    />
                                                    <input 
                                                        type="number"
                                                        placeholder="Wkts"
                                                        value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxWickets || ''}
                                                        onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxWickets', e.target.value, inning)}
                                                        className="w-1/2 p-2 rounded bg-gray-50 dark:bg-gray-900 text-xs font-bold outline-none focus:border-green-500"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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