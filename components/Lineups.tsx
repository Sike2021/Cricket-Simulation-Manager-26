import React, { useState, useEffect, useMemo } from 'react';
import { GameData, Team, Format, Player, PlayerRole } from '../types';
import { Icons } from './Icons';
import { getRoleColor, generateAutoXI, calculateTeamRatings, getTeamHighlights, getRoleFullName } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface LineupsProps {
    gameData: GameData;
    userTeam: Team | null;
    handleUpdatePlayingXI: (teamId: string, format: Format, newXI: string[]) => void;
    handleUpdateCaptain: (teamId: string, format: Format, playerId: string) => void;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const Lineups: React.FC<LineupsProps> = ({ gameData, userTeam, handleUpdatePlayingXI, handleUpdateCaptain, showFeedback }) => {
    const [selectedTeamId, setSelectedTeamId] = useState(userTeam?.id || '');
    const selectedTeam = useMemo(() => gameData.teams.find(t => t.id === selectedTeamId), [gameData.teams, selectedTeamId]);
    
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);

    const [playingXI, setPlayingXI] = useState<Player[]>([]);
    const [bench, setBench] = useState<Player[]>([]);
    const [playerToSwap, setPlayerToSwap] = useState<Player | null>(null);

    const teamRatings = useMemo(() => selectedTeam ? calculateTeamRatings(selectedTeam.squad) : null, [selectedTeam]);
    const teamHighlights = useMemo(() => selectedTeam ? getTeamHighlights(selectedTeam.squad) : null, [selectedTeam]);

    useEffect(() => {
        if (userTeam && !selectedTeamId) {
            setSelectedTeamId(userTeam.id);
        }
    }, [userTeam, selectedTeamId]);

    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20];
            case 'List A': return [Format.ODI];
            case 'First Class': return [Format.SHIELD];
        }
    };

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category, selectedFormat]);

    const isDomesticOnlyFormat = [Format.ODI, Format.SHIELD].includes(selectedFormat);

    useEffect(() => {
        if (!selectedTeam) return;
        const teamData = gameData.teams.find(t => t.id === selectedTeam.id);
        if (!teamData) return;

        const xiIds = gameData.playingXIs[teamData.id]?.[selectedFormat] || [];
        let xiPlayers: Player[] = [];

        if (xiIds.length === 11) {
             const foundPlayers = xiIds.map(id => teamData.squad.find(p => p.id === id)).filter(Boolean) as Player[];
             if (foundPlayers.length === 11) {
                xiPlayers = foundPlayers;
             } else {
                xiPlayers = generateAutoXI(teamData.squad, selectedFormat);
                handleUpdatePlayingXI(teamData.id, selectedFormat, xiPlayers.map(p => p.id));
             }
        } else {
            xiPlayers = generateAutoXI(teamData.squad, selectedFormat);
            handleUpdatePlayingXI(teamData.id, selectedFormat, xiPlayers.map(p => p.id));
        }
        
        setPlayingXI(xiPlayers);
        const xiIdSet = new Set(xiPlayers.map(p => p.id));
        setBench(teamData.squad.filter(p => !xiIdSet.has(p.id)));
    }, [selectedTeam, selectedFormat, gameData, handleUpdatePlayingXI]);

    useEffect(() => {
        setPlayerToSwap(null);
    }, [selectedTeam, selectedFormat]);

    if (!userTeam || !selectedTeam) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading squad data...</p>
            </div>
        );
    }

    const captainId = selectedTeam.captains[selectedFormat] || '';
    const captain = selectedTeam.squad.find(p => p.id === captainId);

    const setCaptain = (playerId: string) => {
        if (playerToSwap) {
            showFeedback("Finish the current player swap first.", "error");
            return;
        }
        const player = playingXI.find(p => p.id === playerId);
        if (isDomesticOnlyFormat && player?.isForeign) {
            showFeedback("Foreign players cannot be captain in ODI & First-Class formats.", "error");
            return;
        }
        handleUpdateCaptain(selectedTeam.id, selectedFormat, playerId);
    };

    const selectPlayerForSwap = (player: Player) => {
        if (player.id === captainId) {
            showFeedback("Cannot swap the captain. Please assign a new captain first.", "error");
            return;
        }
        if (playerToSwap && playerToSwap.id === player.id) {
            setPlayerToSwap(null);
        } else {
            setPlayerToSwap(player);
        }
    };

    const completeSwap = (playerFromBench: Player) => {
        if (!playerToSwap) return;
        if (isDomesticOnlyFormat && playerFromBench.isForeign) {
            showFeedback("Foreign players are not allowed in this format.", "error");
            return;
        }
        
        const newXI = playingXI.map(p => p.id === playerToSwap.id ? playerFromBench : p);
        const newBench = bench.filter(p => p.id !== playerFromBench.id);
        newBench.push(playerToSwap);
        newBench.sort((a, b) => a.name.localeCompare(b.name));

        setPlayingXI(newXI);
        setBench(newBench);
        handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI.map(p => p.id));
        setPlayerToSwap(null);
        showFeedback("Players swapped successfully!", "success");
    };

    const getDropStatus = (player: Player) => {
        if (!player.recentPerformances || player.recentPerformances.length === 0) return null;
        const isHighQuality = Math.max(player.battingSkill, player.secondarySkill) >= 80;
        const matchesToCheck = isHighQuality ? 8 : 3;
        if (player.recentPerformances.length < matchesToCheck) return null;
        const recent = player.recentPerformances.slice(-matchesToCheck);
        const avgRuns = recent.reduce((sum, p) => sum + p.runs, 0) / matchesToCheck;
        const avgWickets = recent.reduce((sum, p) => sum + p.wickets, 0) / matchesToCheck;
        if (avgRuns < 15 && avgWickets < 0.5) {
            return { type: 'at_risk', message: `Poor form. Consider dropping.` };
        }
        return null;
    };

    const autoGenerate = () => {
        const newXI = generateAutoXI(selectedTeam.squad, selectedFormat);
        handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI.map(p => p.id));
        showFeedback("Auto-generated a balanced XI!", "success");
    };

    return (
        <div className="p-0 h-full flex flex-col bg-white dark:bg-[#050808] overflow-hidden font-sans">
            {/* SigNify Editorial Header */}
            <div className="px-8 pt-12 pb-8 border-b-2 border-gray-900 dark:border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icons.Strategy className="w-32 h-32" />
                </div>
                <h2 className="text-[10px] font-mono font-bold text-teal-600 uppercase tracking-[0.4em] mb-2">TACTICAL_DEPLOYMENT // v4.0.1</h2>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.8] text-gray-900 dark:text-white">
                    TEAM<br/>
                    <span className="text-teal-600">LINEUPS</span>
                </h1>
                
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex gap-4">
                        <div className="relative w-64">
                            <select 
                                value={selectedTeamId} 
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-teal-600 text-xs font-black uppercase tracking-widest appearance-none outline-none transition-all"
                            >
                                {gameData.teams.map(team => <option key={team.id} value={team.id} className="dark:bg-[#0A0F0F]">{team.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                            {['T20', 'List A', 'First Class'].map((cat) => (
                                <button 
                                    key={cat} 
                                    onClick={() => setCategory(cat as any)} 
                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${category === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' : 'text-gray-400 hover:text-teal-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={autoGenerate}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-teal-500/20"
                        >
                            <Icons.Strategy className="w-4 h-4" />
                            AUTO_SELECT_XI
                        </button>
                        <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                            {playingXI.length}/11 PLAYERS SELECTED
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {isDomesticOnlyFormat && (
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center mb-8 border-2 border-red-500/20">
                        DOMESTIC_PLAYERS_ONLY_RESTRICTION_ACTIVE
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Playing XI Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-gray-900 dark:border-white pb-2">
                            <h3 className="font-black text-xl uppercase italic tracking-tighter">PLAYING_XI</h3>
                            <span className="text-[10px] font-mono font-bold text-teal-600">ACTIVE_ROSTER</span>
                        </div>
                        <div className="space-y-3">
                            {playingXI.map((player, index) => {
                                const isCaptain = captainId === player.id;
                                const isSwapping = playerToSwap?.id === player.id;
                                const dropStatus = getDropStatus(player);

                                return (
                                    <motion.div 
                                        layout
                                        key={player.id}
                                        className={`group relative flex items-center p-4 rounded-2xl border-2 transition-all ${isSwapping ? 'bg-teal-500/10 border-teal-600' : isCaptain ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white dark:bg-[#0A0F0F] border-gray-900 dark:border-white hover:border-teal-600'}`}
                                    >
                                        <div className="w-8 font-mono font-bold opacity-50">{index + 1}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-lg uppercase italic tracking-tighter">{player.name} {player.isForeign ? '(F)' : ''}</span>
                                                {isCaptain && <span className="bg-white text-teal-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">CPT</span>}
                                            </div>
                                            <div className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isCaptain ? 'text-teal-100' : 'text-gray-400'}`}>
                                                {getRoleFullName(player.role)} • {player.battingSkill}/{player.secondarySkill}
                                            </div>
                                            {dropStatus && <div className="text-[8px] text-red-500 font-black uppercase mt-1">{dropStatus.message}</div>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isCaptain && (
                                                <button 
                                                    onClick={() => setCaptain(player.id)}
                                                    className={`p-2 rounded-lg transition-colors ${isCaptain ? 'text-white' : 'text-teal-600 hover:bg-teal-500/10'}`}
                                                    title="Make Captain"
                                                >
                                                    <Icons.Award className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => selectPlayerForSwap(player)}
                                                className={`p-2 rounded-lg transition-colors ${isCaptain ? 'hover:bg-white/10' : isSwapping ? 'bg-teal-600 text-white' : 'hover:bg-red-500/10 text-red-500'}`}
                                            >
                                                <Icons.RemoveCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bench Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-gray-900 dark:border-white pb-2">
                            <h3 className="font-black text-xl uppercase italic tracking-tighter">BENCH_STRENGTH</h3>
                            <span className="text-[10px] font-mono font-bold text-gray-400">AVAILABLE_RESERVES</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {bench.map((player) => {
                                const isDisabled = playerToSwap && isDomesticOnlyFormat && player.isForeign;
                                return (
                                    <motion.div 
                                        layout
                                        key={player.id}
                                        className={`group flex items-center p-4 rounded-2xl border-2 transition-all ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-teal-600 cursor-pointer'}`}
                                        onClick={() => !isDisabled && playerToSwap && completeSwap(player)}
                                    >
                                        <div className="flex-1">
                                            <div className="font-black text-lg uppercase italic tracking-tighter group-hover:text-teal-600 transition-colors">{player.name} {player.isForeign ? '(F)' : ''}</div>
                                            <div className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                                {getRoleFullName(player.role)} • {player.battingSkill}/{player.secondarySkill}
                                            </div>
                                        </div>
                                        {playerToSwap && !isDisabled && (
                                            <div className="bg-teal-600 text-white p-2 rounded-lg">
                                                <Icons.Plus className="w-4 h-4" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lineups;
