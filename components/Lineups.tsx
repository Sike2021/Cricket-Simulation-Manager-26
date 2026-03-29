import React, { useState, useEffect, useMemo } from 'react';
import { GameData, Team, Format, Player, PlayerRole } from '../types';
import { Icons } from './Icons';
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

    const teamRatings = useMemo(() => selectedTeam ? calculateTeamRatings(selectedTeam.squad) : null, [selectedTeam]);
    const teamHighlights = useMemo(() => selectedTeam ? getTeamHighlights(selectedTeam.squad) : null, [selectedTeam]);

    // Sync selectedTeamId if userTeam changes
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
            return {
                type: 'at_risk',
                message: `Poor form over last ${matchesToCheck} matches. Consider dropping.`
            };
        }
        return null;
    };

    const renderPlayerList = (players: Player[], isXI: boolean) => (
        <ul className="space-y-1">
            {players.map(player => {
                const dropStatus = getDropStatus(player);
                return (
                    <li key={player.id} className={`flex items-center p-2 rounded-md transition-colors ${playerToSwap?.id === player.id ? 'bg-teal-200 dark:bg-teal-800' : 'bg-gray-100 dark:bg-gray-900/50'} ${dropStatus ? 'border-l-4 border-red-500' : ''}`}>
                        <span className={`font-bold w-8 text-sm ${getRoleColor(player.role)}`}>{player.role}</span>
                        <div className="flex-grow flex flex-col">
                            <span className="text-sm font-medium">{player.name} {player.isForeign ? '(F)' : ''} {player.isEmerging ? '(E)' : ''} {player.id === captainId ? '(C)' : ''}</span>
                            {dropStatus && <span className="text-[10px] text-red-500 font-semibold">{dropStatus.message}</span>}
                        </div>
                        <span className="font-semibold mr-2 text-sm">{player.battingSkill}</span>
                        <span className="font-semibold text-gray-500 mr-4 text-sm">{player.secondarySkill}</span>
                        {isXI && player.id !== captainId && (
                            <button onClick={() => setCaptain(player.id)} className="text-[10px] bg-yellow-500 text-white px-1 rounded mr-1">C</button>
                        )}
                        {isXI ? (
                             <button onClick={() => selectPlayerForSwap(player)} className="text-gray-400 hover:text-red-500"><Icons.RemoveCircle /></button>
                        ) : (
                            <button onClick={() => completeSwap(player)} disabled={!playerToSwap || (isDomesticOnlyFormat && player.isForeign)} className="disabled:opacity-30 text-teal-500">
                                <Icons.PlusCircle />
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <div className="p-2 h-[calc(100vh-90px)] flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold text-center mb-2">Team Showcase</h2>
            
            <div className="mb-4 flex items-center justify-between">
                <div className="flex-grow mr-4">
                    <select 
                        value={selectedTeamId} 
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-bold"
                    >
                        {gameData.teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[80px]">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Squad</span>
                    <span className={`text-lg font-display italic leading-none ${selectedTeam.squad.length > 16 ? 'text-red-500' : 'text-teal-500'}`}>
                        {selectedTeam.squad.length}<span className="text-white/20 text-xs not-italic">/16</span>
                    </span>
                </div>
            </div>

            {/* Team Board Ratings */}
            {teamRatings && (
                <div className="glass-card p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black italic uppercase tracking-tighter text-xl text-white">Team Board Ratings</h3>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                            Season {gameData.currentSeason}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="subcard-glass p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Strength</div>
                            <div className="text-2xl font-black font-mono text-white">{teamRatings.strength}</div>
                        </div>
                        <div className="subcard-glass p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Bowling</div>
                            <div className="text-2xl font-black font-mono text-white">{teamRatings.bowling}</div>
                        </div>
                        <div className="subcard-glass p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Batting</div>
                            <div className="text-2xl font-black font-mono text-white">{teamRatings.batting}</div>
                        </div>
                        <div className="subcard-glass p-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Stars</div>
                            <div className="text-2xl font-black font-mono text-white">{teamRatings.starPlayers}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Highlights */}
            {teamHighlights && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                        <div className="text-[10px] uppercase font-bold text-gray-500">Most Complete</div>
                        <div className="text-xs font-bold truncate">{teamHighlights.mostComplete.name}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                        <div className="text-[10px] uppercase font-bold text-gray-500">Best Batter</div>
                        <div className="text-xs font-bold truncate">{teamHighlights.bestBatter.name}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                        <div className="text-[10px] uppercase font-bold text-gray-500">Best Bowler</div>
                        <div className="text-xs font-bold truncate">{teamHighlights.bestBowler.name}</div>
                    </div>
                </div>
            )}

            {/* Captain Showcase */}
            {captain && (
                <div className="bg-white dark:bg-gray-800 border-2 border-yellow-500 p-3 rounded-xl mb-4 flex items-center shadow-md">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 mr-3">
                        <Icons.User className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-yellow-600">Team Captain</div>
                        <div className="text-lg font-bold">{captain.name}</div>
                        <div className="text-xs text-gray-500">{captain.nationality} • {captain.role}</div>
                    </div>
                </div>
            )}
            
             {/* Category Tabs */}
             <div className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-2">
                {['T20', 'List A', 'First Class'].map((cat) => (
                    <button 
                        key={cat} 
                        onClick={() => setCategory(cat as any)} 
                        className={`px-4 py-2 text-sm font-semibold ${category === cat ? 'border-b-2 border-teal-500 text-teal-500' : 'text-gray-500'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Tournament Dropdown */}
            <div className="mb-2">
                <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as Format)}
                    className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
                >
                    {getFormatsForCategory(category).map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            {isDomesticOnlyFormat && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 p-2 rounded-md text-sm text-center my-2">
                    Only domestic players are allowed in ODI and First-Class formats.
                </div>
            )}
            <div className="flex-grow">
                <h3 className="font-bold my-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span>Playing XI ({playingXI.length} / 11)</span>
                        <button 
                            onClick={() => {
                                const newXI = generateAutoXI(selectedTeam.squad, selectedFormat);
                                handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI.map(p => p.id));
                                showFeedback("Auto-generated a balanced XI!", "success");
                            }}
                            className="text-[10px] bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider transition-colors"
                        >
                            Auto Select
                        </button>
                    </div>
                    {playingXI.length < 11 && <span className="text-xs text-red-500">Incomplete Squad</span>}
                </h3>
                {renderPlayerList(playingXI, true)}
                <h3 className="font-bold my-2">Bench</h3>
                {renderPlayerList(bench, false)}
            </div>
        </div>
    );
};

export default Lineups;
