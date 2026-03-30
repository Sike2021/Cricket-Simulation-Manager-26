import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameData, Format, Player, Team } from '../types';
import { Icons } from './Icons';
import { getRoleFullName } from '../utils';

interface EndOfFormatScreenProps {
    gameData: GameData;
    handleFormatChange: (newFormat: Format) => void;
    handleEndSeason: (retainedPlayers: Player[]) => void;
}

const EndOfFormatScreen: React.FC<EndOfFormatScreenProps> = ({ gameData, handleFormatChange, handleEndSeason }) => {
    const [view, setView] = useState<'awards' | 'retention'>('awards');
    const [retainedIds, setRetainedIds] = useState<Set<string>>(new Set());
    const userTeam = useMemo(() => gameData.teams.find(t => t.id === gameData.userTeamId), [gameData]);
    
    const RETENTION_BUDGET = 30.0;

    const calculatePlayerAsk = useCallback((player: Player) => {
        // Base price calculation based on skill
        const skill = Math.max(player.battingSkill, player.secondarySkill);
        let baseAsk = 1.0;
        if (skill > 85) baseAsk = 12.0;
        else if (skill > 80) baseAsk = 8.0;
        else if (skill > 75) baseAsk = 5.0;
        else if (skill > 70) baseAsk = 3.0;
        else if (skill > 60) baseAsk = 1.5;

        // Performance multiplier based on current season stats
        let perfMultiplier = 1.0;
        const formats = [Format.T20, Format.ODI, Format.SHIELD];
        let totalRuns = 0;
        let totalWickets = 0;
        
        formats.forEach(f => {
            const s = player.stats[f];
            if (s) {
                totalRuns += s.runs;
                totalWickets += s.wickets;
            }
        });

        // Simple performance boost
        if (totalRuns > 1000) perfMultiplier += 0.5;
        else if (totalRuns > 600) perfMultiplier += 0.3;
        else if (totalRuns > 300) perfMultiplier += 0.15;

        if (totalWickets > 30) perfMultiplier += 0.5;
        else if (totalWickets > 20) perfMultiplier += 0.3;
        else if (totalWickets > 10) perfMultiplier += 0.15;

        return Number((baseAsk * perfMultiplier).toFixed(2));
    }, []);

    const playerAsks = useMemo(() => {
        const asks: Record<string, number> = {};
        userTeam?.squad.forEach(p => {
            asks[p.id] = calculatePlayerAsk(p);
        });
        return asks;
    }, [userTeam, calculatePlayerAsk]);

    const currentTotalCost = useMemo(() => {
        let total = 0;
        retainedIds.forEach(id => {
            total += playerAsks[id] || 0;
        });
        return total;
    }, [retainedIds, playerAsks]);

    const lastAward = gameData.awardsHistory[gameData.awardsHistory.length-1];
    
    const formatsOrder = [
        Format.T20, Format.ODI, Format.SHIELD
    ];

    const currentIdx = formatsOrder.indexOf(gameData.currentFormat);
    const nextFormat = currentIdx !== -1 && currentIdx < formatsOrder.length - 1 ? formatsOrder[currentIdx + 1] : null;

    const toggleRetention = (id: string) => {
        const player = userTeam?.squad.find(p => p.id === id);
        if (!player) return;

        const ask = playerAsks[id] || 0;

        setRetainedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                if (currentTotalCost + ask > RETENTION_BUDGET) return prev;

                const retainedPlayers = userTeam?.squad.filter(p => next.has(p.id)) || [];
                const nationalCount = retainedPlayers.filter(p => !p.isForeign).length;
                const internationalCount = retainedPlayers.filter(p => p.isForeign).length;

                if (player.isForeign) {
                    if (internationalCount < 2) next.add(id);
                } else {
                    if (nationalCount < 5) next.add(id);
                }
            }
            return next;
        });
    };

    const finalizeSeason = () => {
        const retainedPlayers = userTeam?.squad.filter(p => retainedIds.has(p.id)) || [];
        // Pass the total cost so CareerHub can adjust the purse
        handleEndSeason(retainedPlayers);
    };

    const retainedPlayersList = useMemo(() => userTeam?.squad.filter(p => retainedIds.has(p.id)) || [], [userTeam, retainedIds]);
    const nationalCount = retainedPlayersList.filter(p => !p.isForeign).length;
    const internationalCount = retainedPlayersList.filter(p => p.isForeign).length;

    if (view === 'retention') {
        return (
            <div className="p-6 h-full flex flex-col bg-slate-950 text-white overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Retention Room</h2>
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest">Negotiate with players based on performance</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Budget</div>
                        <div className="text-xl font-black text-teal-400">{(RETENTION_BUDGET - currentTotalCost).toFixed(2)} Cr</div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-1">
                    {userTeam?.squad.map(p => {
                        const isRetained = retainedIds.has(p.id);
                        const ask = playerAsks[p.id];
                        const canRetain = isRetained || (currentTotalCost + ask <= RETENTION_BUDGET);
                        
                        return (
                            <div 
                                key={p.id} 
                                onClick={() => toggleRetention(p.id)}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${isRetained ? 'bg-teal-500/20 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : canRetain ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/50 border-slate-900 opacity-50'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg">{p.name} {p.isForeign ? '✈️' : ''}</p>
                                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold">S:{Math.max(p.battingSkill, p.secondarySkill)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">{getRoleFullName(p.role)}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-black ${isRetained ? 'text-teal-400' : 'text-slate-400'}`}>
                                            ASK: {ask.toFixed(2)} Cr
                                        </div>
                                        <div className={`text-[10px] font-bold ${isRetained ? 'text-teal-500' : 'text-slate-600'}`}>
                                            {isRetained ? 'RETAINED' : 'RELEASE'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">National</span>
                            <span className={`text-xl font-black italic ${nationalCount === 3 ? 'text-teal-400' : 'text-white'}`}>{nationalCount}/3</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">International</span>
                            <span className={`text-xl font-black italic ${internationalCount === 1 ? 'text-teal-400' : 'text-white'}`}>{internationalCount}/1</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={finalizeSeason}
                    className="w-full bg-teal-500 py-6 rounded-3xl text-xl font-black italic uppercase tracking-tighter shadow-2xl hover:bg-teal-400 transition-all active:scale-95"
                >
                    Finalize & Open Auction
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 text-center flex flex-col justify-between h-full bg-slate-900 overflow-y-auto">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">{lastAward?.format} Complete!</h2>
                <div className="my-4 bg-yellow-400/20 border-2 border-yellow-500 rounded-2xl p-6">
                    <p className="text-lg font-semibold text-yellow-300">Champions</p>
                    <p className="text-4xl font-black italic uppercase tracking-tighter text-white">{lastAward?.winnerTeamName}</p>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-400/10 border-2 border-blue-500/30 rounded-2xl p-4">
                        <p className="font-bold text-blue-400 text-xs uppercase mb-1">Best Batter</p>
                        <p className="font-bold text-white truncate">{lastAward?.bestBatter.playerName}</p>
                        <p className="text-2xl font-black text-white">{lastAward?.bestBatter.runs}</p>
                    </div>
                    <div className="bg-red-400/10 border-2 border-red-500/30 rounded-2xl p-4">
                         <p className="font-bold text-red-400 text-xs uppercase mb-1">Best Bowler</p>
                        <p className="font-bold text-white truncate">{lastAward?.bestBowler.playerName}</p>
                        <p className="text-2xl font-black text-white">{lastAward?.bestBowler.wickets}</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-4">
                {nextFormat ? (
                    <button onClick={() => handleFormatChange(nextFormat)} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-5 px-10 text-xl rounded-2xl shadow-lg uppercase italic tracking-tighter">
                        Proceed to {nextFormat}
                    </button>
                ) : (
                    <button onClick={() => setView('retention')} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-5 px-10 text-xl rounded-2xl shadow-lg uppercase italic tracking-tighter">
                        End Season & Retain Players
                    </button>
                )}
            </div>
        </div>
    )
}

export default EndOfFormatScreen;