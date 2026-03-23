import React, { useState, useMemo, useEffect } from 'react';
import { GameData, Team, Player } from '../types';
import { Icons } from './Icons';

interface TransfersProps {
    gameData: GameData;
    userTeam: Team | null;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const LOCAL_MAX_SQUAD_SIZE = 22;
const LOCAL_MIN_SQUAD_SIZE = 15;
const LOCAL_MAX_FOREIGN_PLAYERS = 3;

const Transfers: React.FC<TransfersProps> = ({ gameData, userTeam, setGameData, showFeedback }) => {
    // Hooks MUST be at top level
    const [selectedTeamId, setSelectedTeamId] = useState(userTeam?.id || '');
    const [tradeSource, setTradeSource] = useState('free-agents');
    const [playerToTradeOut, setPlayerToTradeOut] = useState<Player | null>(null);
    const [playerToTradeIn, setPlayerToTradeIn] = useState<Player | null>(null);

    const selectedTeam = useMemo(() => gameData.teams.find(t => t.id === selectedTeamId), [gameData.teams, selectedTeamId]);

    // Sync selectedTeamId if userTeam changes
    useEffect(() => {
        if (userTeam && !selectedTeamId) {
            setSelectedTeamId(userTeam.id);
        }
    }, [userTeam, selectedTeamId]);

    useEffect(() => {
        setPlayerToTradeOut(null);
        setPlayerToTradeIn(null);
    }, [selectedTeamId, tradeSource]);

    const freeAgents = useMemo(() => {
        const allSquadPlayerIds = new Set(gameData.teams.flatMap(t => t.squad.map(p => p.id)));
        return gameData.allPlayers.filter(p => !allSquadPlayerIds.has(p.id))
            .sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
    }, [gameData]);

    if (!userTeam || !selectedTeam) return <div className="p-4 text-center">Loading Management...</div>;

    const handleTrade = () => {
        if (!playerToTradeOut || !playerToTradeIn) return;
        
        const team1 = selectedTeam;
        const team2 = gameData.teams.find(t => t.id === tradeSource);
        
        if (!team2) {
            showFeedback("Invalid trade partner.", "error");
            return;
        }

        const team1ForeignCount = team1.squad.filter(p => p.isForeign).length;
        const team2ForeignCount = team2.squad.filter(p => p.isForeign).length;

        const newTeam1ForeignCount = team1ForeignCount - (playerToTradeOut.isForeign ? 1 : 0) + (playerToTradeIn.isForeign ? 1 : 0);
        const newTeam2ForeignCount = team2ForeignCount - (playerToTradeIn.isForeign ? 1 : 0) + (playerToTradeOut.isForeign ? 1 : 0);

        if (newTeam1ForeignCount > LOCAL_MAX_FOREIGN_PLAYERS) {
            showFeedback(`${team1.name} would exceed the ${LOCAL_MAX_FOREIGN_PLAYERS} foreign player limit.`, "error");
            return;
        }
        if (newTeam2ForeignCount > LOCAL_MAX_FOREIGN_PLAYERS) {
            showFeedback(`${team2.name} would exceed the ${LOCAL_MAX_FOREIGN_PLAYERS} foreign player limit.`, "error");
            return;
        }

        setGameData(prev => {
            if (!prev) return null;
            const newTeams = prev.teams.map(t => {
                if (t.id === team1.id) {
                    const newSquad = t.squad.filter(p => p.id !== playerToTradeOut.id);
                    newSquad.push(playerToTradeIn);
                    return { ...t, squad: newSquad };
                }
                if (t.id === team2.id) {
                    const newSquad = t.squad.filter(p => p.id !== playerToTradeIn.id);
                    newSquad.push(playerToTradeOut);
                    return { ...t, squad: newSquad };
                }
                return t;
            });
            return { ...prev, teams: newTeams };
        });
        showFeedback("Trade successful!", "success");
        setPlayerToTradeOut(null);
        setPlayerToTradeIn(null);
    };

    const releasePlayer = (playerId: string) => {
        if (selectedTeam.squad.length <= LOCAL_MIN_SQUAD_SIZE) {
            showFeedback(`Squad size cannot be below ${LOCAL_MIN_SQUAD_SIZE}`, "error");
            return;
        }
        setGameData(prev => {
            if (!prev) return null;
            const newTeams = prev.teams.map(t => {
                if (t.id === selectedTeamId) {
                    return { ...t, squad: t.squad.filter(p => p.id !== playerId) };
                }
                return t;
            });
            return { ...prev, teams: newTeams };
        });
        showFeedback("Player released to free agency.", "success");
    };

    const signPlayer = (player: Player) => {
        if (selectedTeam.squad.length >= LOCAL_MAX_SQUAD_SIZE) {
            showFeedback(`Squad size cannot exceed ${LOCAL_MAX_SQUAD_SIZE}`, "error");
            return;
        }
        const foreignPlayersCount = selectedTeam.squad.filter(p => p.isForeign).length;
        if (player.isForeign && foreignPlayersCount >= LOCAL_MAX_FOREIGN_PLAYERS) {
            showFeedback(`You can only have ${LOCAL_MAX_FOREIGN_PLAYERS} foreign players.`, "error");
            return;
        }
        setGameData(prev => {
            if (!prev) return null;
            const newTeams = prev.teams.map(t => {
                if (t.id === selectedTeamId) {
                    return { ...t, squad: [...t.squad, player] };
                }
                return t;
            });
            return { ...prev, teams: newTeams };
        });
        showFeedback("Player signed!", "success");
    };

    const rightPanelList = tradeSource === 'free-agents' ? freeAgents : (gameData.teams.find(t => t.id === tradeSource)?.squad || []);

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0A0F0F] overflow-hidden font-sans text-gray-900 dark:text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Transfer <span className="text-teal-600">Hub</span></h2>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">SQUAD_REINFORCEMENT_PROTOCOL</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-gray-100 dark:border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">SQUAD_SIZE: {selectedTeam.squad.length}/{LOCAL_MAX_SQUAD_SIZE}</span>
                </div>
            </div>

            <div className="mb-8">
                 <div className="relative">
                    <select 
                        value={selectedTeamId} 
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-teal-600 text-xs font-black uppercase tracking-widest appearance-none outline-none transition-all"
                    >
                        {gameData.teams.map(team => <option key={team.id} value={team.id} className="dark:bg-[#0A0F0F]">{team.name}</option>)}
                    </select>
                    <Icons.ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 opacity-20 pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden">
                {/* Left Panel: My Squad */}
                <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        <h3 className="font-black text-[10px] uppercase tracking-widest opacity-40">{selectedTeam.name}_ROSTER</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-2">
                        {selectedTeam.squad.map(p => (
                            <div key={p.id} 
                                onClick={() => tradeSource !== 'free-agents' && setPlayerToTradeOut(p)}
                                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                    playerToTradeOut?.id === p.id 
                                    ? 'bg-teal-600/10 border-teal-600 shadow-lg' 
                                    : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                            >
                                <div className="flex-grow">
                                    <p className="text-sm font-black tracking-tight leading-none mb-1">{p.name} {p.isForeign ? '(F)' : ''}</p>
                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">{p.role}</p>
                                </div>
                                <div className="text-right mr-4">
                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-0.5">SKILL</p>
                                    <p className="text-sm font-black font-mono">{p.battingSkill}</p>
                                </div>
                                {tradeSource === 'free-agents' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); releasePlayer(p.id); }}
                                        className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Icons.RemoveCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Market */}
                <div className="flex flex-col overflow-hidden">
                    <div className="relative mb-6">
                        <select 
                            value={tradeSource} 
                            onChange={e => setTradeSource(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest appearance-none outline-none transition-all"
                        >
                            <option value="free-agents">FREE_AGENTS_MARKET</option>
                            {gameData.teams.filter(t => t.id !== selectedTeamId).map(team => (
                                <option key={team.id} value={team.id}>{team.name.toUpperCase()}_SQUAD</option>
                            ))}
                        </select>
                        <Icons.ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 opacity-40 pointer-events-none" />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-2">
                        {rightPanelList.map(p => (
                            <div key={p.id} 
                                onClick={() => tradeSource !== 'free-agents' && setPlayerToTradeIn(p)}
                                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                    playerToTradeIn?.id === p.id 
                                    ? 'bg-teal-600/10 border-teal-600 shadow-lg' 
                                    : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                            >
                                <div className="flex-grow">
                                    <p className="text-sm font-black tracking-tight leading-none mb-1">{p.name} {p.isForeign ? '(F)' : ''}</p>
                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">{p.role}</p>
                                </div>
                                <div className="text-right mr-4">
                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-0.5">SKILL</p>
                                    <p className="text-sm font-black font-mono">{p.battingSkill}</p>
                                </div>
                                {tradeSource === 'free-agents' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); signPlayer(p); }}
                                        className="p-2 bg-teal-600/10 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all"
                                    >
                                        <Icons.PlusCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {tradeSource !== 'free-agents' && (
                <div className="mt-8 bg-gray-900 dark:bg-white p-8 rounded-[40px] text-white dark:text-gray-900 shadow-2xl shadow-teal-600/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 dark:border-gray-900/10 pb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">OFFERING</span>
                                <span className="text-sm font-black uppercase tracking-tight">{playerToTradeOut?.name || 'SELECT_PLAYER'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">REQUESTING</span>
                                <span className="text-sm font-black uppercase tracking-tight">{playerToTradeIn?.name || 'SELECT_PLAYER'}</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleTrade}
                            disabled={!playerToTradeOut || !playerToTradeIn}
                            className="w-full md:w-auto bg-teal-600 text-white font-black py-5 px-12 rounded-2xl uppercase tracking-widest text-xs hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-20 disabled:scale-100 shadow-xl shadow-teal-600/20"
                        >
                            PROPOSE_TRADE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfers;