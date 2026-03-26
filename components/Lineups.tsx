import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, User, Shield, Zap, Target, Trophy, 
    Activity, TrendingUp, ChevronRight, X, 
    Search, Filter, BarChart3, Star, 
    UserPlus, UserMinus, Crown, Info, 
    ArrowRightLeft, RefreshCw, LayoutGrid, List, Globe
} from 'lucide-react';
import { GameData, Team, Format, Player, PlayerRole } from '../types';
import { getRoleColor, generateAutoXI, calculateTeamRatings, getTeamHighlights } from '../utils';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    }, [category]);

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
            <div className="h-full flex flex-col items-center justify-center bg-[#050808]">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(45,212,191,0.3)]"></div>
                <p className="text-teal-500 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing_Squad_Data...</p>
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
            showFeedback("Foreign players cannot captain in domestic formats.", "error");
            return;
        }
        handleUpdateCaptain(selectedTeam.id, selectedFormat, playerId);
        showFeedback(`${player?.name} appointed as captain.`, "success");
    };

    const handleSwap = (player: Player) => {
        if (!playerToSwap) {
            setPlayerToSwap(player);
            showFeedback(`Select a player to swap with ${player.name}`, "success");
        } else {
            if (playerToSwap.id === player.id) {
                setPlayerToSwap(null);
                return;
            }

            const isP1InXI = playingXI.some(p => p.id === playerToSwap.id);
            const isP2InXI = playingXI.some(p => p.id === player.id);

            if (isP1InXI && isP2InXI) {
                const newXI = [...playingXI];
                const idx1 = newXI.findIndex(p => p.id === playerToSwap.id);
                const idx2 = newXI.findIndex(p => p.id === player.id);
                [newXI[idx1], newXI[idx2]] = [newXI[idx2], newXI[idx1]];
                handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI.map(p => p.id));
            } else {
                const newXI = playingXI.map(p => p.id === (isP1InXI ? playerToSwap.id : player.id) ? (isP1InXI ? player.id : playerToSwap.id) : p.id);
                
                const foreignCount = newXI.map(id => selectedTeam.squad.find(p => p.id === id)).filter(p => p?.isForeign).length;
                if (isDomesticOnlyFormat && foreignCount > 4) {
                    showFeedback("Maximum 4 foreign players allowed in domestic formats.", "error");
                    setPlayerToSwap(null);
                    return;
                }

                if (isP1InXI && playerToSwap.id === captainId) {
                    handleUpdateCaptain(selectedTeam.id, selectedFormat, player.id);
                } else if (isP2InXI && player.id === captainId) {
                    handleUpdateCaptain(selectedTeam.id, selectedFormat, playerToSwap.id);
                }

                handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI);
            }

            setPlayerToSwap(null);
            showFeedback("Lineup updated successfully.", "success");
        }
    };

    const PlayerItem = ({ player, isXI, index }: { player: Player, isXI: boolean, index?: number }) => {
        const isCaptain = player.id === captainId;
        const isSelected = playerToSwap?.id === player.id;
        const roleColor = getRoleColor(player.role);

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSwap(player)}
                className={`glass-card p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                    isSelected 
                    ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_20px_rgba(45,212,191,0.2)]' 
                    : 'border-white/5 hover:border-white/20'
                }`}
            >
                <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl italic ${isSelected ? 'bg-black/20' : 'bg-white/5'} ${roleColor}`}>
                            {player.name[0]}
                        </div>
                        {isCaptain && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                                <Crown className="w-3 h-3 text-black" />
                            </div>
                        )}
                        {player.isForeign && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#050808]">
                                <Globe className="w-2 h-2 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            {isXI && index !== undefined && (
                                <span className="text-[8px] font-mono text-white/20">#{index + 1}</span>
                            )}
                            <h4 className="font-black uppercase tracking-tighter text-sm italic truncate group-hover:text-teal-400 transition-colors">
                                {player.name}
                            </h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 ${roleColor}`}>
                                {player.role}
                            </span>
                            <span className="text-[8px] font-mono font-bold opacity-20 uppercase tracking-widest">
                                OVR: {Math.max(player.battingSkill, player.secondarySkill)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {isXI && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCaptain(player.id);
                                }}
                                className={`p-2 rounded-lg transition-all ${isCaptain ? 'text-teal-500 bg-teal-500/10' : 'text-white/10 hover:text-teal-500 hover:bg-white/5'}`}
                            >
                                <Crown className="w-3 h-3" />
                            </button>
                        )}
                        <div className={`w-1.5 h-1.5 rounded-full ${isXI ? 'bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-white/10'}`} />
                    </div>
                </div>

                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </motion.div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Users className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">SQUAD_MANAGEMENT // LIVE</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            TACTICAL<br/>
                            <span className="text-teal-500">LINEUPS</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card p-4 rounded-2xl border-white/5 flex flex-col items-center min-w-[100px]">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">BATTING</p>
                            <p className="text-2xl font-black font-mono text-teal-400">{teamRatings?.batting.toFixed(1)}</p>
                        </div>
                        <div className="glass-card p-4 rounded-2xl border-white/5 flex flex-col items-center min-w-[100px]">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">BOWLING</p>
                            <p className="text-2xl font-black font-mono text-blue-400">{teamRatings?.bowling.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-6 mt-12 relative z-10">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        {['T20', 'List A', 'First Class'].map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setCategory(cat as any)} 
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${category === cat ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-teal-500' : 'text-white/20 hover:text-white/40'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-teal-500' : 'text-white/20 hover:text-white/40'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                            <Info className="w-3 h-3 text-teal-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                {isDomesticOnlyFormat ? 'Domestic Rules Active (Max 4 Foreign)' : 'International Rules Active'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Playing XI Section */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar border-r border-white/5">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-teal-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">PLAYING_XI</h3>
                            </div>
                            <span className="text-[10px] font-mono text-white/20 tracking-widest">11 / 11 SELECTED</span>
                        </div>

                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {playingXI.map((player, idx) => (
                                <PlayerItem key={player.id} player={player} isXI={true} index={idx} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bench Section */}
                <div className="w-full md:w-96 bg-black/40 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white/40" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">BENCH_RESERVES</h3>
                            </div>
                            <span className="text-[10px] font-mono text-white/20 tracking-widest">{bench.length} AVAILABLE</span>
                        </div>

                        <div className="space-y-3">
                            {bench.map((player) => (
                                <PlayerItem key={player.id} player={player} isXI={false} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Feedback Bar */}
            <AnimatePresence>
                {playerToSwap && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
                    >
                        <div className="glass-card p-4 rounded-2xl border-teal-500/50 bg-teal-500/10 flex items-center justify-between shadow-[0_0_50px_rgba(45,212,191,0.2)]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
                                    <ArrowRightLeft className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-500">SWAP_IN_PROGRESS</p>
                                    <p className="text-sm font-black italic uppercase tracking-tighter">SELECT REPLACEMENT FOR {playerToSwap.name}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setPlayerToSwap(null)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Lineups;
