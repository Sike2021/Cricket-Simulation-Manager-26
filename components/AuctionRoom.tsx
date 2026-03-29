import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Player, Team, GameData, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { Icons } from './Icons';

interface AuctionRoomProps {
    gameData: GameData;
    onAuctionComplete: (updatedTeams: Team[]) => void;
}

const STARTING_PURSE = 100.0;
const MAX_FOREIGN_LIMIT = 3; 
const MAX_EMERGING_LIMIT = 3;
const MIN_EMERGING_LIMIT = 3;
const MAX_SQUAD_SIZE = 16;
const MIN_SQUAD_SIZE = 16;
const DOMESTIC_LIMIT = 10;

// Targeted Balanced Squad Ratios
const TARGET_OPENERS = 4;
const TARGET_BATTERS = 7; // specialists total
const TARGET_KEEPERS = 1;
const TARGET_ALL_ROUNDERS = 3;
const TARGET_SPINNERS = 3;
const TARGET_FAST = 5;

// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const AuctionRoom: React.FC<AuctionRoomProps> = ({ gameData, onAuctionComplete }) => {
    const mainTeamIds = useMemo(() => 
        gameData.allTeamsData.filter(td => !td.isYouthTeam).map(td => td.id), 
    [gameData.allTeamsData]);

    const [teams, setTeams] = useState<Team[]>(() => 
        gameData.teams.map(t => ({ ...t, squad: t.squad || [], purse: t.purse || STARTING_PURSE }))
    );

    const [activeOverlay, setActiveOverlay] = useState<'none' | 'franchises' | 'pool'>('none');

    // Sorted Pool with deep randomness for auto-auction
    const sortedPool = useMemo(() => {
        const retainedPlayerIds = new Set(teams.flatMap(t => t.squad.map(p => p.id)));
        return gameData.allPlayers
            .filter(pl => !retainedPlayerIds.has(pl.id))
            .sort((a, b) => {
                // Base sorting on skill but with high variance for "randomness"
                const skillA = Math.max(a.battingSkill, a.secondarySkill);
                const skillB = Math.max(b.battingSkill, b.secondarySkill);
                const jitter = (Math.random() * 20) - 10;
                return (skillB + jitter) - (skillA + jitter);
            });
    }, [gameData.allPlayers, teams]);

    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const [currentBid, setCurrentBid] = useState(0);
    const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
    const [isAuctioning, setIsAuctioning] = useState(false);
    const [biddingLog, setBiddingLog] = useState<string[]>([]);
    const [auctionFinished, setAuctionFinished] = useState(false);
    const [currentLotBids, setCurrentLotBids] = useState<{teamName: string, bid: number}[]>([]);

    const currentPlayer = sortedPool[currentPlayerIdx] || null;
    const userTeam = teams.find(t => t.id === gameData.userTeamId);

    const getBasePrice = (player: Player) => {
        // Use custom base price if defined (convert Lacs to Crore)
        if (player.basePrice !== undefined) {
            return player.basePrice / 100;
        }

        const attr = Math.max(player.battingSkill, player.secondarySkill);
        if (attr > 70) return 2.0;
        if (attr >= 61) return 1.0; 
        if (attr >= 51) return 0.6;
        return 0.25;
    };

    const getBidIncrement = (price: number) => {
        if (price >= 10.0) return 1.0;
        if (price >= 5.0) return 0.5;
        if (price >= 2.0) return 0.2;
        return 0.1;
    };

    const startNextPlayer = useCallback(() => {
        if (auctionFinished) return;

        if (currentPlayerIdx >= sortedPool.length) {
            setAuctionFinished(true);
            return;
        }

        const player = sortedPool[currentPlayerIdx];
        if (!player) {
            setCurrentPlayerIdx(prev => prev + 1);
            return;
        }

        const bp = getBasePrice(player);
        setCurrentBid(bp);
        setHighestBidderId(null);
        setIsAuctioning(true);
        setCurrentLotBids([]);
        setBiddingLog(prev => [`Lot #${currentPlayerIdx + 1}: ${player.name} (${getRoleFullName(player.role)}) up for ${bp.toFixed(2)} Cr`, ...prev.slice(0, 5)]);
    }, [currentPlayerIdx, sortedPool, auctionFinished]);

    const handleUserBid = (multiplier: number = 1) => {
        if (!userTeam || !isAuctioning || !currentPlayer) return;
        
        if (currentPlayer.isForeign && userTeam.squad.filter(p => p.isForeign).length >= MAX_FOREIGN_LIMIT) {
            setBiddingLog(prev => [`Foreign limit reached!`, ...prev.slice(0, 5)]);
            return;
        }

        if (currentPlayer.isEmerging && userTeam.squad.filter(p => p.isEmerging).length >= MAX_EMERGING_LIMIT) {
            setBiddingLog(prev => [`Emerging limit reached!`, ...prev.slice(0, 5)]);
            return;
        }

        const increment = getBidIncrement(currentBid) * multiplier;
        const nextBid = Number((currentBid + increment).toFixed(2));
        if (userTeam.purse < nextBid) return;
        
        setCurrentBid(nextBid);
        setHighestBidderId(userTeam.id);
        setCurrentLotBids(prev => [{teamName: userTeam.name, bid: nextBid}, ...prev]);
        setBiddingLog(prev => [`${userTeam.name} bids ${nextBid.toFixed(2)} Cr! (+${increment.toFixed(1)})`, ...prev.slice(0, 5)]);
    };

    const skipPlayer = () => {
        if (!currentPlayer || !isAuctioning) return;
        setIsAuctioning(false);

        // Safety: don't skip if already processing next
        const eligibleTeams = teams.filter(t => 
            mainTeamIds.includes(t.id) &&
            t.id !== gameData.userTeamId &&
            t.purse >= (getBasePrice(currentPlayer) + 0.2) &&
            t.squad.length < MAX_SQUAD_SIZE &&
            (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT) &&
            (!currentPlayer.isEmerging || t.squad.filter(p => p.isEmerging).length < MAX_EMERGING_LIMIT) &&
            (!(!currentPlayer.isForeign && !currentPlayer.isEmerging) || t.squad.filter(p => !p.isForeign && !p.isEmerging).length < DOMESTIC_LIMIT)
        );

        if (eligibleTeams.length > 0) {
            const winner = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];
            const finalPrice = Number((getBasePrice(currentPlayer) + (Math.random() * 0.4)).toFixed(2));
            setTeams(prev => prev.map(t => {
                if (t.id === winner.id) {
                    return { ...t, purse: Number((t.purse - finalPrice).toFixed(2)), squad: [...t.squad, currentPlayer] };
                }
                return t;
            }));
            setBiddingLog(prev => [`Sold to ${winner.name} for ${finalPrice.toFixed(2)} Cr`, ...prev]);
        } else {
            setBiddingLog(prev => [`Unsold: ${currentPlayer.name}`, ...prev]);
        }
        
        setTimeout(() => setCurrentPlayerIdx(prev => prev + 1), 200);
    };

    const autoAuctionRemaining = () => {
        setIsAuctioning(false);
        setAuctionFinished(true);
    };

    useEffect(() => {
        if (!isAuctioning || !currentPlayer || auctionFinished) return;

        const timer = setTimeout(() => {
            if (!isAuctioning) return;
            const increment = getBidIncrement(currentBid);
            const eligibleTeams = teams.filter(t => 
                mainTeamIds.includes(t.id) &&
                t.id !== highestBidderId && 
                t.purse >= (currentBid + increment) &&
                t.squad.length < MAX_SQUAD_SIZE &&
                (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT) &&
                (!currentPlayer.isEmerging || t.squad.filter(p => p.isEmerging).length < MAX_EMERGING_LIMIT) &&
                (currentPlayer.isForeign || currentPlayer.isEmerging || t.squad.filter(p => !p.isForeign && !p.isEmerging).length < DOMESTIC_LIMIT)
            );

            if (eligibleTeams.length > 0) {
                const rating = Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill);
                
                const biddingTeam = eligibleTeams.find(t => {
                    if (t.id === gameData.userTeamId) return false;
                    
                    // Improved AI Valuation Logic
                    // Non-linear scaling: Elite players are worth much more
                    let baseValuation = Math.pow(rating / 50, 3.5) * 1.2;

                    // Adjust based on team needs
                    const squad = t.squad;
                    const roleCount = squad.filter(p => p.role === currentPlayer.role).length;
                    
                    let targetCount = 3;
                    if (currentPlayer.role === PlayerRole.BATSMAN) targetCount = TARGET_BATTERS;
                    if (currentPlayer.role === PlayerRole.WICKET_KEEPER) targetCount = TARGET_KEEPERS;
                    if (currentPlayer.role === PlayerRole.ALL_ROUNDER) targetCount = TARGET_ALL_ROUNDERS;
                    if (currentPlayer.role === PlayerRole.SPIN_BOWLER) targetCount = TARGET_SPINNERS;
                    if (currentPlayer.role === PlayerRole.FAST_BOWLER) targetCount = TARGET_FAST;

                    let needFactor = 1.0;
                    if (roleCount >= targetCount) {
                        needFactor = 0.4; // Already have enough
                    } else if (roleCount < targetCount / 2) {
                        needFactor = 1.6; // Desperate for this role
                    }

                    // Foreign player penalty if close to limit
                    if (currentPlayer.isForeign) {
                        const foreignCount = squad.filter(p => p.isForeign).length;
                        if (foreignCount >= MAX_FOREIGN_LIMIT - 1) {
                            needFactor *= 0.2;
                        }
                    }

                    // Personality jitter
                    const personalityJitter = 0.7 + (Math.random() * 0.6);
                    const finalValuation = baseValuation * needFactor * personalityJitter;

                    return (currentBid + increment) <= finalValuation;
                });

                if (biddingTeam) {
                    const nextBid = Number((currentBid + increment).toFixed(2));
                    setCurrentBid(nextBid);
                    setHighestBidderId(biddingTeam.id);
                    setCurrentLotBids(prev => [{teamName: biddingTeam.name, bid: nextBid}, ...prev]);
                    setBiddingLog(prev => [`${biddingTeam.name} bids ${nextBid.toFixed(2)} Cr!`, ...prev.slice(0, 5)]);
                } else if (highestBidderId) {
                    sellPlayer();
                } else {
                    unsoldPlayer();
                }
            } else if (highestBidderId) {
                sellPlayer();
            } else {
                unsoldPlayer();
            }
        }, 800 + Math.random() * 700); // Slightly slower AI for better UX

        return () => clearTimeout(timer);
    }, [isAuctioning, currentBid, highestBidderId, currentPlayer, gameData.userTeamId, mainTeamIds, teams, auctionFinished]);

    const sellPlayer = () => {
        const winner = teams.find(t => t.id === highestBidderId);
        if (winner && currentPlayer) {
            setTeams(prev => prev.map(t => {
                if (t.id === winner.id) {
                    return {
                        ...t,
                        purse: Number((t.purse - currentBid).toFixed(2)),
                        squad: [...t.squad, currentPlayer]
                    };
                }
                return t;
            }));
            setBiddingLog(prev => [`SOLD! ${currentPlayer.name} to ${winner.name}`, ...prev]);
        }
        setIsAuctioning(false);
        setCurrentPlayerIdx(prev => prev + 1);
    };

    const unsoldPlayer = () => {
        setBiddingLog(prev => [`UNSOLD: ${currentPlayer.name}`, ...prev]);
        setIsAuctioning(false);
        setCurrentPlayerIdx(prev => prev + 1);
    };

    useEffect(() => {
        if (!isAuctioning && !auctionFinished) {
            startNextPlayer();
        }
    }, [currentPlayerIdx, sortedPool, isAuctioning, auctionFinished, startNextPlayer]);

    const finishAuction = () => {
        const soldPlayerIds = new Set(teams.flatMap(t => t.squad.map(p => p.id)));
        const unauctioned = gameData.allPlayers.filter(p => !soldPlayerIds.has(p.id));
        let pool = shuffle([...unauctioned]);

        const finalTeams = teams.map(team => {
            const isDev = gameData.allTeamsData.find(td => td.id === team.id)?.isYouthTeam;
            const targetTotalSize = 16;
            
            let squad = [...team.squad];
            let purse = team.purse;

            const fillNeeded = (type: 'FOREIGN' | 'EMERGING' | 'DOMESTIC', count: number) => {
                let existing = 0;
                if (type === 'FOREIGN') existing = squad.filter(p => p.isForeign).length;
                if (type === 'EMERGING') existing = squad.filter(p => p.isEmerging).length;
                if (type === 'DOMESTIC') existing = squad.filter(p => !p.isForeign && !p.isEmerging).length;
                
                while (existing < count && pool.length > 0) {
                    const choices = pool.filter(p => {
                        if (type === 'FOREIGN') return p.isForeign;
                        if (type === 'EMERGING') return p.isEmerging;
                        return !p.isForeign && !p.isEmerging;
                    }).slice(0, 20);
                    
                    if (choices.length > 0) {
                        choices.sort((a, b) => Math.max(b.battingSkill, b.secondarySkill) - Math.max(a.battingSkill, a.secondarySkill));
                        const p = choices[0];
                        const poolIdx = pool.findIndex(pl => pl.id === p.id);
                        pool.splice(poolIdx, 1);
                        squad.push(p);
                        existing++;
                        if (!isDev) purse = Math.max(0, purse - 0.2);
                    } else break;
                }
            };

            // Strict enforcement of 16 players: 3 Foreign, 3 Emerging, 10 Domestic
            fillNeeded('FOREIGN', MAX_FOREIGN_LIMIT);
            fillNeeded('EMERGING', MAX_EMERGING_LIMIT);
            fillNeeded('DOMESTIC', DOMESTIC_LIMIT);

            return { ...team, squad, purse };
        });

        onAuctionComplete(finalTeams);
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0F0F] text-[#E4E3E0] font-sans overflow-hidden relative">
            {activeOverlay === 'franchises' && (
                <div className="absolute inset-0 z-50 bg-[#0A0F0F] flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-6 border-b-2 border-[#E4E3E0] pb-4">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">FRANCHISE ROSTERS</h2>
                        <button onClick={() => setActiveOverlay('none')} className="bg-[#E4E3E0] text-[#0A0F0F] p-2 rounded-full hover:invert transition-all"><Icons.X /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-6">
                        {teams.map(team => {
                            const td = gameData.allTeamsData.find(d => d.id === team.id);
                            const isDev = td?.isYouthTeam;
                            return (
                                <div key={team.id} className={`p-6 border-2 ${team.id === gameData.userTeamId ? 'bg-[#E4E3E0]/5 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.1)]' : 'bg-transparent border-[#E4E3E0]/10'}`}>
                                    <div className="flex justify-between mb-4 border-b border-[#E4E3E0]/10 pb-2 items-end">
                                        <div>
                                            <h4 className="font-black uppercase tracking-tighter text-xl leading-none">{team.name} {isDev ? '(DEV)' : ''}</h4>
                                            <p className="text-[10px] font-mono font-bold opacity-50 mt-1 uppercase tracking-widest">{team.squad.length} / {isDev ? 14 : 22} SIGNED</p>
                                        </div>
                                        <span className="text-lg font-black font-mono text-teal-400">{team.purse.toFixed(2)} Cr</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                                        {team.squad.map(p => (
                                            <div key={p.id} className="flex justify-between text-[11px] font-bold border-b border-[#E4E3E0]/5 pb-1">
                                                <span className="truncate uppercase tracking-tight">{p.name}</span>
                                                <span className={`${getRoleColor(p.role)} opacity-80`}>{p.role}</span>
                                            </div>
                                        ))}
                                        {team.squad.length === 0 && <p className="text-xs opacity-30 italic col-span-full">No signings yet...</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-[#0A0F0F] p-6 pt-12 border-b-2 border-[#E4E3E0] flex flex-col gap-2 z-10">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-teal-500 text-[#0A0F0F] px-2 py-0.5 font-black text-[10px] uppercase tracking-widest">LIVE AUCTION</div>
                            <span className="text-[10px] font-mono font-bold opacity-50 uppercase tracking-widest">SESSION 01 // LOT {currentPlayerIdx + 1}</span>
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">MARKET BOARD</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-mono font-bold opacity-50 uppercase tracking-widest leading-none mb-1">YOUR PURSE</p>
                        <span className="text-3xl font-black font-mono text-teal-400">{userTeam?.purse?.toFixed(2) || '0.00'} <span className="text-sm">Cr</span></span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {!auctionFinished ? (
                    <>
                        {currentPlayer ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                                {/* Player Details Card */}
                                <div className="lg:col-span-2 border-2 border-[#E4E3E0] p-8 flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#E4E3E0] text-[#0A0F0F] px-4 py-1 text-[10px] font-mono font-bold uppercase tracking-widest">
                                        {getRoleFullName(currentPlayer.role)} {currentPlayer.isForeign ? '// INT' : '// DOM'}
                                    </div>

                                    <div className="mt-4">
                                        <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
                                            {currentPlayer.name}
                                        </h2>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                                            <div className="border-l-2 border-[#E4E3E0]/20 pl-4">
                                                <p className="text-[10px] font-mono opacity-50 uppercase mb-1">Batting</p>
                                                <p className="text-3xl font-black font-mono text-blue-400">{currentPlayer.battingSkill}</p>
                                            </div>
                                            <div className="border-l-2 border-[#E4E3E0]/20 pl-4">
                                                <p className="text-[10px] font-mono opacity-50 uppercase mb-1">Bowling</p>
                                                <p className="text-3xl font-black font-mono text-red-400">{currentPlayer.secondarySkill}</p>
                                            </div>
                                            <div className="border-l-2 border-[#E4E3E0]/20 pl-4">
                                                <p className="text-[10px] font-mono opacity-50 uppercase mb-1">Style</p>
                                                <p className="text-xl font-black uppercase tracking-tight">{currentPlayer.style}</p>
                                            </div>
                                            <div className="border-l-2 border-[#E4E3E0]/20 pl-4">
                                                <p className="text-[10px] font-mono opacity-50 uppercase mb-1">Base Price</p>
                                                <p className="text-xl font-black font-mono">{getBasePrice(currentPlayer).toFixed(2)} Cr</p>
                                            </div>
                                        </div>

                                        {/* Detailed Stats Section */}
                                        <div className="mt-8 pt-6 border-t border-[#E4E3E0]/10">
                                            <p className="text-[10px] font-mono font-bold opacity-50 uppercase tracking-widest mb-4">CAREER STATISTICS (ALL FORMATS)</p>
                                            {(() => {
                                                const stats = aggregateStats(currentPlayer, [Format.T20, Format.ODI, Format.SHIELD]);
                                                const isBatter = [PlayerRole.BATSMAN, PlayerRole.WICKET_KEEPER, PlayerRole.ALL_ROUNDER].includes(currentPlayer.role);
                                                const isBowler = [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(currentPlayer.role);

                                                return (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                                                        {(isBatter || currentPlayer.role === PlayerRole.ALL_ROUNDER) && (
                                                            <>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-mono opacity-40 uppercase">Matches</span>
                                                                    <span className="text-lg font-black font-mono">{stats.matches}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-mono opacity-40 uppercase">Runs</span>
                                                                    <span className="text-lg font-black font-mono">{stats.runs}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-mono opacity-40 uppercase">Avg</span>
                                                                    <span className="text-lg font-black font-mono">{stats.average.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-mono opacity-40 uppercase">S/R</span>
                                                                    <span className="text-lg font-black font-mono">{stats.strikeRate.toFixed(1)}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        {(isBowler || currentPlayer.role === PlayerRole.ALL_ROUNDER) && (
                                                            <>
                                                                {!(isBatter || currentPlayer.role === PlayerRole.ALL_ROUNDER) && (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-mono opacity-40 uppercase">Matches</span>
                                                                        <span className="text-lg font-black font-mono">{stats.matches}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-mono opacity-40 uppercase text-red-400">Wickets</span>
                                                                    <span className="text-lg font-black font-mono text-red-400">{stats.wickets}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-mono opacity-40 uppercase text-red-400">Econ</span>
                                                                    <span className="text-lg font-black font-mono text-red-400">{stats.economy.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-mono opacity-40 uppercase text-red-400">Bowl Avg</span>
                                                                    <span className="text-lg font-black font-mono text-red-400">{stats.bowlingAverage.toFixed(2)}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => handleUserBid(1)}
                                            disabled={!isAuctioning || (highestBidderId === userTeam?.id) || (userTeam?.purse || 0) < (currentBid + getBidIncrement(currentBid))}
                                            className={`py-6 px-8 font-black text-3xl italic uppercase tracking-tighter transition-all transform active:scale-95 flex items-center justify-center gap-4 ${
                                                highestBidderId === userTeam?.id 
                                                ? 'bg-teal-500 text-[#0A0F0F]' 
                                                : 'border-2 border-[#E4E3E0] text-[#E4E3E0] hover:bg-[#E4E3E0] hover:text-[#0A0F0F]'
                                            } disabled:opacity-20`}
                                        >
                                            {highestBidderId === userTeam?.id ? 'LEADING' : 'PLACE BID'}
                                            <span className="text-xl font-mono not-italic">({(currentBid + getBidIncrement(currentBid)).toFixed(2)})</span>
                                        </button>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={skipPlayer} className="border border-[#E4E3E0]/20 hover:bg-[#E4E3E0]/5 py-4 text-[10px] font-black uppercase tracking-widest transition-colors">PASS LOT</button>
                                            <button onClick={autoAuctionRemaining} className="border border-red-500/30 text-red-400 hover:bg-red-500/5 py-4 text-[10px] font-black uppercase tracking-widest transition-colors">AUTO DRAFT</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Bidding & Log Card */}
                                <div className="flex flex-col gap-6">
                                    <div className="border-2 border-[#E4E3E0] p-6 bg-[#E4E3E0] text-[#0A0F0F] flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 opacity-60">CURRENT HIGHEST BID</span>
                                        <div className="text-7xl font-black font-mono tracking-tighter leading-none">
                                            {currentBid.toFixed(2)}
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-tight mt-2">
                                            {highestBidderId ? teams.find(t => t.id === highestBidderId)?.name : 'AWAITING OPENING BID'}
                                        </p>
                                    </div>

                                    <div className="flex-1 border border-[#E4E3E0]/20 p-4 flex flex-col overflow-hidden">
                                        <p className="text-[10px] font-mono font-bold opacity-50 uppercase tracking-widest mb-4 border-b border-[#E4E3E0]/10 pb-2">BIDDING LOG</p>
                                        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px]">
                                            {currentLotBids.map((bid, idx) => (
                                                <div key={idx} className={`flex justify-between items-center pb-1 border-b border-[#E4E3E0]/5 ${idx === 0 ? 'text-teal-400 font-bold' : 'opacity-40'}`}>
                                                    <span className="uppercase">{bid.teamName}</span>
                                                    <span>{bid.bid.toFixed(2)} Cr</span>
                                                </div>
                                            ))}
                                            {currentLotBids.length === 0 && <p className="opacity-20 italic">Waiting for activity...</p>}
                                        </div>
                                    </div>

                                    <button onClick={() => setActiveOverlay('franchises')} className="border-2 border-[#E4E3E0] py-4 font-black uppercase tracking-widest text-xs hover:bg-[#E4E3E0] hover:text-[#0A0F0F] transition-all flex items-center justify-center gap-3">
                                        <Icons.Podium /> VIEW ALL ROSTERS
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                        <h2 className="text-8xl font-black italic tracking-tighter leading-none mb-8 uppercase">AUCTION<br/>CLOSED</h2>
                        <p className="text-xl font-bold uppercase tracking-tight mb-12 opacity-60">All squads have reached the minimum requirement. The tournament board is now active.</p>
                        <button onClick={finishAuction} className="w-full bg-teal-500 text-[#0A0F0F] py-8 font-black italic tracking-tighter text-4xl uppercase hover:invert transition-all shadow-[0_0_50px_rgba(20,184,166,0.2)]">
                            ENTER CAREER HUB
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionRoom;