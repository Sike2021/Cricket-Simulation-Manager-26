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
        <div className="p-6 h-full flex flex-col bg-slate-50 dark:bg-[#050808] font-sans text-gray-900 dark:text-white">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Transfer <span className="text-teal-600">Hub</span></h2>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Manage your squad and negotiate trades</p>
                </div>
                <div className="bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Squad Size: {selectedTeam.squad.length}/{LOCAL_MAX_SQUAD_SIZE}</span>
                </div>
            </div>

            <div className="mb-6">
                <select 
                    value={selectedTeamId} 
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-teal-600 text-sm font-bold uppercase tracking-widest outline-none transition-all"
                >
                    {gameData.teams.map(team => <option key={team.id} value={team.id} className="dark:bg-[#0A0F0F]">{team.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-hidden">
                {/* Left Panel: My Squad */}
                <div className="flex flex-col bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
                    <h3 className="font-black text-xs uppercase tracking-widest mb-4 text-teal-600">My Roster</h3>
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
                        {selectedTeam.squad.map(p => (
                            <div key={p.id} 
                                onClick={() => tradeSource !== 'free-agents' && setPlayerToTradeOut(p)}
                                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                    playerToTradeOut?.id === p.id 
                                    ? 'bg-teal-600/10 border-teal-600' 
                                    : 'bg-gray-50 dark:bg-black/20 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                            >
                                <div className="flex-grow">
                                    <p className="text-sm font-bold">{p.name} {p.isForeign ? <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">F</span> : ''}</p>
                                    <p className="text-[10px] opacity-50 uppercase">{p.role}</p>
                                </div>
                                <div className="text-right mr-4">
                                    <p className="text-[10px] opacity-40">SKILL</p>
                                    <p className="font-mono font-bold">{p.battingSkill}</p>
                                </div>
                                {tradeSource === 'free-agents' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); releasePlayer(p.id); }}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Icons.RemoveCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Market */}
                <div className="flex flex-col bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
                    <select 
                        value={tradeSource} 
                        onChange={e => setTradeSource(e.target.value)}
                        className="w-full p-4 mb-4 rounded-2xl bg-gray-100 dark:bg-black/20 border-transparent text-xs font-bold uppercase tracking-widest outline-none"
                    >
                        <option value="free-agents">Free Agents Market</option>
                        {gameData.teams.filter(t => t.id !== selectedTeamId).map(team => (
                            <option key={team.id} value={team.id}>{team.name} Squad</option>
                        ))}
                    </select>

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
                        {rightPanelList.map(p => (
                            <div key={p.id} 
                                onClick={() => tradeSource !== 'free-agents' && setPlayerToTradeIn(p)}
                                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                    playerToTradeIn?.id === p.id 
                                    ? 'bg-teal-600/10 border-teal-600' 
                                    : 'bg-gray-50 dark:bg-black/20 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                            >
                                <div className="flex-grow">
                                    <p className="text-sm font-bold">{p.name} {p.isForeign ? <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">F</span> : ''}</p>
                                    <p className="text-[10px] opacity-50 uppercase">{p.role}</p>
                                </div>
                                <div className="text-right mr-4">
                                    <p className="text-[10px] opacity-40">SKILL</p>
                                    <p className="font-mono font-bold">{p.battingSkill}</p>
                                </div>
                                {tradeSource === 'free-agents' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); signPlayer(p); }}
                                        className="p-2 text-teal-600 hover:bg-teal-600/10 rounded-xl transition-all"
                                    >
                                        <Icons.PlusCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {tradeSource !== 'free-agents' && (
                <div className="mt-6 bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="bg-gray-100 dark:bg-black/20 p-4 rounded-2xl">
                            <p className="text-[10px] opacity-40 uppercase">Offering</p>
                            <p className="font-bold">{playerToTradeOut?.name || '---'}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-black/20 p-4 rounded-2xl">
                            <p className="text-[10px] opacity-40 uppercase">Requesting</p>
                            <p className="font-bold">{playerToTradeIn?.name || '---'}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleTrade}
                        disabled={!playerToTradeOut || !playerToTradeIn}
                        className="bg-teal-600 text-white font-bold py-4 px-8 rounded-2xl uppercase text-xs hover:bg-teal-700 transition-all disabled:opacity-30"
                    >
                        Propose Trade
                    </button>
                </div>
            )}
        </div>
    );
};

export default Transfers;