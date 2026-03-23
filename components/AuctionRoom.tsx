import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gavel, Trophy, User, Timer, History, TrendingUp, SkipForward, DollarSign, Users, Globe, X } from 'lucide-react';
import { Player, Team, GameData, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { Icons } from './Icons';

interface AuctionRoomProps {
    gameData: GameData;
    onAuctionComplete: (updatedTeams: Team[]) => void;
}

const STARTING_PURSE = 100.0;
const MAX_FOREIGN_LIMIT = 3; // Match App.tsx
const MAX_EMERGING_LIMIT = 3;
const MAX_SQUAD_SIZE = 22;
const MIN_SQUAD_SIZE = 15;

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
    const [isAuctioning, setIsAuctioning] = useState(false);
    const [currentBid, setCurrentBid] = useState(0);
    const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [biddingLog, setBiddingLog] = useState<{teamName: string, bid: number}[]>([]);
    const [auctionFinished, setAuctionFinished] = useState(false);

    const currentPlayer = sortedPool[currentPlayerIdx] || null;
    const userTeam = teams.find(t => t.id === gameData.userTeamId);
    const highestBidder = teams.find(t => t.id === highestBidderId);

    const formatCurrency = (val: number) => `${val.toFixed(2)} Cr`;

    const getBasePrice = (player: Player) => {
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
        if (auctionFinished || isTransitioning || isAuctioning) return;

        if (currentPlayerIdx >= sortedPool.length) {
            setAuctionFinished(true);
            return;
        }

        const player = sortedPool[currentPlayerIdx];
        if (!player) {
            // If player is null for some reason, move to next
            setCurrentPlayerIdx(prev => prev + 1);
            return;
        }

        const bp = getBasePrice(player);
        setCurrentBid(bp);
        setHighestBidderId(null);
        setIsAuctioning(true);
        setIsTransitioning(false);
        setTimeLeft(10);
        setBiddingLog([]);
    }, [currentPlayerIdx, sortedPool, auctionFinished, isTransitioning, isAuctioning]);

    const handleUserBid = (multiplier: number = 1) => {
        if (!userTeam || !isAuctioning || !currentPlayer || isTransitioning) return;
        
        if (currentPlayer.isForeign && userTeam.squad.filter(p => p.isForeign).length >= MAX_FOREIGN_LIMIT) {
            setBiddingLog(prev => [`Foreign limit reached!`, ...prev.slice(0, 5)]);
            return;
        }

        if (currentPlayer.isEmerging && userTeam.squad.filter(p => p.isEmerging).length >= MAX_EMERGING_LIMIT) {
            setBiddingLog(prev => [`Emerging limit reached! (Max 3)`, ...prev.slice(0, 5)]);
            return;
        }

        const increment = getBidIncrement(currentBid) * multiplier;
        const nextBid = Number((currentBid + increment).toFixed(2));
        if (userTeam.purse < nextBid) return;
        
        setCurrentBid(nextBid);
        setHighestBidderId(userTeam.id);
        setTimeLeft(10);
        setBiddingLog(prev => [{teamName: userTeam.name, bid: nextBid}, ...prev]);
    };

    const skipPlayer = () => {
        if (!currentPlayer || !isAuctioning || isTransitioning) return;
        setIsAuctioning(false);
        setIsTransitioning(true);

        const eligibleTeams = teams.filter(t => 
            mainTeamIds.includes(t.id) &&
            t.id !== gameData.userTeamId &&
            t.purse >= (getBasePrice(currentPlayer) + 0.2) &&
            t.squad.length < 22 &&
            (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT)
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
        
        setTimeout(() => {
            setCurrentPlayerIdx(prev => prev + 1);
            setIsTransitioning(false);
        }, 1200);
    };

    const autoAuctionRemaining = () => {
        setIsAuctioning(false);
        setAuctionFinished(true);
    };

    // Timer Effect
    useEffect(() => {
        if (!isAuctioning || isTransitioning || auctionFinished) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (highestBidderId) sellPlayer();
                    else unsoldPlayer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isAuctioning, isTransitioning, auctionFinished, highestBidderId]);

    useEffect(() => {
        if (!isAuctioning || !currentPlayer || auctionFinished || isTransitioning) return;

        const bidTimer = setTimeout(() => {
            // AI only bids if time is running out or randomly
            if (timeLeft > 8 && Math.random() > 0.3) return;

            const increment = getBidIncrement(currentBid);
            const eligibleTeams = teams.filter(t => 
                mainTeamIds.includes(t.id) &&
                t.id !== highestBidderId && 
                t.purse >= (currentBid + increment) &&
                t.squad.length < 22 &&
                (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT)
            );

            if (eligibleTeams.length > 0) {
                const rating = Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill);
                
                const biddingTeam = eligibleTeams.find(t => {
                    if (t.id === gameData.userTeamId) return false;
                    
                    let baseValuation = Math.pow(rating / 50, 3.5) * 1.2;
                    const squad = t.squad;

                    if (currentPlayer.isEmerging && squad.filter(p => p.isEmerging).length >= MAX_EMERGING_LIMIT) {
                        return false;
                    }

                    const roleCount = squad.filter(p => p.role === currentPlayer.role).length;
                    
                    let targetCount = 3;
                    if (currentPlayer.role === PlayerRole.BATSMAN) targetCount = TARGET_BATTERS;
                    if (currentPlayer.role === PlayerRole.WICKET_KEEPER) targetCount = TARGET_KEEPERS;
                    if (currentPlayer.role === PlayerRole.ALL_ROUNDER) targetCount = TARGET_ALL_ROUNDERS;
                    if (currentPlayer.role === PlayerRole.SPIN_BOWLER) targetCount = TARGET_SPINNERS;
                    if (currentPlayer.role === PlayerRole.FAST_BOWLER) targetCount = TARGET_FAST;

                    let needFactor = 1.0;
                    if (roleCount >= targetCount) needFactor = 0.4;
                    else if (roleCount < targetCount / 2) needFactor = 1.6;

                    if (currentPlayer.isForeign) {
                        const foreignCount = squad.filter(p => p.isForeign).length;
                        if (foreignCount >= MAX_FOREIGN_LIMIT - 1) needFactor *= 0.2;
                    }

                    const personalityJitter = 0.7 + (Math.random() * 0.6);
                    const finalValuation = baseValuation * needFactor * personalityJitter;

                    return (currentBid + increment) <= finalValuation;
                });

                if (biddingTeam) {
                    const nextBid = Number((currentBid + increment).toFixed(2));
                    setCurrentBid(nextBid);
                    setHighestBidderId(biddingTeam.id);
                    setTimeLeft(10);
                    setBiddingLog(prev => [{teamName: biddingTeam.name, bid: nextBid}, ...prev]);
                }
            }
        }, 1000 + Math.random() * 2000);

        return () => clearTimeout(bidTimer);
    }, [isAuctioning, currentBid, highestBidderId, currentPlayer, gameData.userTeamId, mainTeamIds, teams, timeLeft, isTransitioning]);

    const sellPlayer = () => {
        setIsAuctioning(false);
        setIsTransitioning(true);
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
        setTimeout(() => {
            setCurrentPlayerIdx(prev => prev + 1);
            setIsTransitioning(false);
        }, 1000);
    };

    const unsoldPlayer = () => {
        setIsAuctioning(false);
        setIsTransitioning(true);
        setBiddingLog(prev => [`UNSOLD: ${currentPlayer.name}`, ...prev]);
        setTimeout(() => {
            setCurrentPlayerIdx(prev => prev + 1);
            setIsTransitioning(false);
        }, 1000);
    };

    useEffect(() => {
        if (!isAuctioning && !auctionFinished && !isTransitioning) {
            startNextPlayer();
        }
    }, [currentPlayerIdx, sortedPool, isAuctioning, auctionFinished, isTransitioning, startNextPlayer]);

    const finishAuction = () => {
        const soldPlayerIds = new Set(teams.flatMap(t => t.squad.map(p => p.id)));
        const unauctioned = gameData.allPlayers.filter(p => !soldPlayerIds.has(p.id));
        // Shuffle the pool for true randomness in AI squads
        let pool: Player[] = shuffle([...unauctioned]);

        const finalTeams = teams.map(team => {
            const isDev = gameData.allTeamsData.find(td => td.id === team.id)?.isYouthTeam;
            const targetTotalSize = isDev ? 14 : 20;
            
            let squad = [...team.squad];
            let purse = team.purse;

            const fillNeeded = (role: PlayerRole, count: number, foreignOk: boolean = true) => {
                let existing = squad.filter(p => p.role === role).length;
                while (existing < count && pool.length > 0) {
                    const choices = pool.filter(p => p.role === role && (foreignOk || !p.isForeign)).slice(0, 10);
                    if (choices.length > 0) {
                        // Sort by skill to pick better players during auto-draft
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

            if (squad.length < targetTotalSize) {
                fillNeeded(PlayerRole.WICKET_KEEPER, TARGET_KEEPERS);
                fillNeeded(PlayerRole.ALL_ROUNDER, TARGET_ALL_ROUNDERS);
                fillNeeded(PlayerRole.SPIN_BOWLER, 2);
                fillNeeded(PlayerRole.FAST_BOWLER, 3);
            }

            // Final fill to squad size
            while (squad.length < targetTotalSize && pool.length > 0) {
                const choices = pool.slice(0, 10);
                // Sort by skill to pick better players during final auto-draft fill
                choices.sort((a, b) => Math.max(b.battingSkill, b.secondarySkill) - Math.max(a.battingSkill, a.secondarySkill));
                const p = choices[0];
                const poolIdx = pool.findIndex(pl => pl.id === p.id);
                pool.splice(poolIdx, 1);
                squad.push(p);
                if (!isDev) purse = Math.max(0, purse - 0.2);
            }

            return { ...team, squad, purse };
        });

        onAuctionComplete(finalTeams);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0A0F0F] text-white font-sans overflow-hidden">
            {/* Overlay for Franchises */}
            {activeOverlay === 'franchises' && (
                <div className="absolute inset-0 z-[100] bg-[#0A0F0F] flex flex-col p-8 animate-in slide-in-from-bottom duration-500">
                    <div className="flex justify-between items-center mb-4 border-b-2 border-white pb-2">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase font-display">FRANCHISE_ROSTERS</h2>
                        <button onClick={() => setActiveOverlay('none')} className="bg-white text-black p-2 hover:bg-teal-500 transition-all">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {teams.map(team => {
                            const td = gameData.allTeamsData.find(d => d.id === team.id);
                            const isDev = td?.isYouthTeam;
                            return (
                                <div key={team.id} className={`p-4 border-2 ${team.id === gameData.userTeamId ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 bg-white/5'}`}>
                                    <div className="flex justify-between mb-3 border-b border-white/10 pb-2 items-end">
                                        <div>
                                            <h4 className="font-black uppercase tracking-tighter text-xl leading-none font-display">{team.name} {isDev ? '(DEV)' : ''}</h4>
                                            <p className="text-[9px] font-mono font-bold opacity-50 mt-1 uppercase tracking-[0.2em]">{team.squad.length} / {isDev ? 14 : 22} SIGNED</p>
                                        </div>
                                        <span className="text-xl font-black font-mono text-teal-500 tracking-tighter">{formatCurrency(team.purse)}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {team.squad.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-2 border border-white/10 bg-white/5 group hover:border-teal-500 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-tight group-hover:text-teal-500">{p.name}</span>
                                                    <span className="text-[8px] font-mono opacity-50 uppercase">{p.role}</span>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold">{Math.max(p.battingSkill, p.secondarySkill)}</span>
                                            </div>
                                        ))}
                                        {team.squad.length === 0 && <p className="text-xs opacity-30 italic font-mono uppercase tracking-widest">AWAITING_SIGNINGS...</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="p-4 border-b-2 border-white/10 flex justify-between items-center bg-[#050808] z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-500 flex items-center justify-center border-2 border-white rotate-3 shadow-[2px_2px_0px_white]">
                        <Trophy size={20} className="text-black -rotate-3" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter font-display leading-none">AUCTION_HUB</h2>
                        <p className="text-[8px] font-mono font-bold text-teal-500 tracking-[0.2em] mt-1 uppercase">LIVE_SESSION_ID: {gameData.currentSeason}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-mono font-bold opacity-50 uppercase tracking-widest mb-1">REMAINING_CAPITAL</p>
                    <p className="text-2xl font-black font-mono text-teal-500 tracking-tighter leading-none">
                        {formatCurrency(userTeam?.purse || 0)}
                    </p>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Left: Player Info */}
                <div className="flex-1 p-6 overflow-y-auto border-r-2 border-white/10 bg-[#0A0F0F] custom-scrollbar">
                    {!auctionFinished ? (
                        currentPlayer ? (
                            <motion.div
                                key={currentPlayer.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-6 max-w-4xl"
                            >
                                <div className="relative">
                                    <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-teal-500" />
                                    <div className="bg-white/5 p-6 border-2 border-white/10 relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-teal-500 text-black px-2 py-0.5 text-[9px] font-mono font-bold tracking-[0.1em] uppercase">
                                                        {currentPlayer.role}
                                                    </span>
                                                    <span className="border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold tracking-[0.1em] uppercase">
                                                        {currentPlayer.isForeign ? 'INTERNATIONAL' : 'DOMESTIC'}
                                                    </span>
                                                    {currentPlayer.isEmerging && (
                                                        <span className="bg-yellow-500 text-black px-2 py-0.5 text-[9px] font-mono font-bold tracking-[0.1em] uppercase">
                                                            EMERGING
                                                        </span>
                                                    )}
                                                </div>
                                                <h1 className="text-5xl font-black uppercase tracking-tighter font-display leading-[0.9] italic">
                                                    {currentPlayer.name}
                                                </h1>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-mono font-bold opacity-50 uppercase tracking-widest mb-1">BASE_VALUATION</p>
                                                <p className="text-2xl font-black font-mono tracking-tighter">{formatCurrency(getBasePrice(currentPlayer))}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { label: 'BATTING', value: currentPlayer.battingSkill, color: 'text-blue-400' },
                                                { label: 'BOWLING', value: currentPlayer.secondarySkill, color: 'text-red-400' },
                                                { label: 'OVERALL', value: Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill), highlight: true }
                                            ].map(stat => (
                                                <div key={stat.label} className={`p-4 border-2 ${stat.highlight ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 bg-white/5'}`}>
                                                    <p className="text-[8px] font-mono font-bold opacity-50 uppercase tracking-widest mb-1">{stat.label}</p>
                                                    <p className={`text-3xl font-black font-mono ${stat.highlight ? 'text-teal-500' : stat.color || ''}`}>{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Auction Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border-2 border-white/10 p-6 bg-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-teal-500/10 rotate-45 translate-x-6 -translate-y-6" />
                                        <p className="text-[8px] font-mono font-bold opacity-50 uppercase tracking-widest mb-4">CURRENT_VALUATION</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black font-mono text-teal-500 tracking-tighter leading-none">
                                                {formatCurrency(currentBid)}
                                            </span>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-white/10">
                                            <p className="text-[10px] font-mono font-bold opacity-80 uppercase tracking-widest">
                                                HIGHEST_BIDDER: <span className="text-teal-500 font-black italic ml-2">{highestBidder?.name || 'AWAITING_BID'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-2 border-white/10 p-6 bg-white/5 flex flex-col justify-center items-center text-center relative">
                                        <p className="text-[8px] font-mono font-bold opacity-50 uppercase tracking-widest mb-2">TIME_REMAINING</p>
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="34"
                                                    fill="transparent"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    className="text-white/5"
                                                />
                                                <motion.circle
                                                    cx="40"
                                                    cy="40"
                                                    r="34"
                                                    fill="transparent"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    strokeDasharray="213.6"
                                                    animate={{ strokeDashoffset: 213.6 * (1 - timeLeft / 10) }}
                                                    transition={{ duration: 1, ease: "linear" }}
                                                    className={timeLeft <= 3 ? "text-red-500" : "text-teal-500"}
                                                />
                                            </svg>
                                            <span className={`absolute text-2xl font-black font-mono ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 border-8 border-dashed border-teal-500/30 rounded-full mb-8" 
                                />
                                <h3 className="text-5xl font-black uppercase tracking-tighter italic font-display">PREPARING_NEXT_LOT</h3>
                                <p className="text-[10px] font-mono font-bold text-teal-500 tracking-[0.4em] mt-4 uppercase">SYNCHRONIZING_MARKET_DATA...</p>
                            </div>
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative mb-12"
                            >
                                <div className="absolute -inset-10 border-4 border-dashed border-teal-500/20 rounded-full animate-spin-slow" />
                                <h2 className="text-[12rem] font-black italic tracking-tighter leading-[0.75] uppercase font-display text-white/10 absolute inset-0 flex items-center justify-center pointer-events-none">CLOSED</h2>
                                <h2 className="text-9xl font-black italic tracking-tighter leading-none uppercase font-display relative z-10">AUCTION<br/>COMPLETE</h2>
                            </motion.div>
                            <p className="text-xl font-bold uppercase tracking-widest mb-12 opacity-50 font-mono">ALL_SQUADS_FINALIZED // MARKET_SESSION_TERMINATED</p>
                            <button 
                                onClick={finishAuction} 
                                className="w-full bg-teal-500 text-black py-8 px-12 font-black italic tracking-tighter text-5xl uppercase hover:invert transition-all shadow-[0_20px_60px_rgba(20,184,166,0.3)] border-4 border-white"
                            >
                                ENTER_CAREER_HUB
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Controls & History */}
                <div className="w-full md:w-[280px] flex flex-col bg-[#050808] border-l border-white/10 z-10">
                    {/* Controls */}
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <button
                            onClick={() => handleUserBid(1)}
                            disabled={!isAuctioning || isTransitioning || (userTeam && userTeam.purse < currentBid + getBidIncrement(currentBid))}
                            className="w-full bg-teal-500 text-black font-black py-4 px-3 uppercase tracking-widest text-lg italic hover:invert transition-all duration-300 disabled:opacity-20 disabled:grayscale flex flex-col items-center justify-center gap-0.5 shadow-[0_5px_15px_rgba(20,184,166,0.2)] border border-white relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative z-10 flex items-center gap-2">
                                <DollarSign size={18} />
                                <span>PLACE_BID</span>
                            </div>
                            <span className="relative z-10 text-[8px] font-mono opacity-70 mt-0.5">NEXT: {formatCurrency(currentBid + getBidIncrement(currentBid))}</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={skipPlayer}
                                disabled={!isAuctioning || isTransitioning}
                                className="border border-white/20 text-white font-black py-2 px-1 uppercase tracking-widest text-[8px] italic hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-20 flex items-center justify-center gap-1.5"
                            >
                                <SkipForward size={12} />
                                <span>PASS_LOT</span>
                            </button>
                            <button
                                onClick={() => setActiveOverlay('franchises')}
                                className="border border-white/20 text-white font-black py-2 px-1 uppercase tracking-widest text-[8px] italic hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all duration-300 flex items-center justify-center gap-1.5"
                            >
                                <Trophy size={12} />
                                <span>ROSTERS</span>
                            </button>
                        </div>
                    </div>

                    {/* History */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 bg-white/5 border-b-2 border-white/10 flex justify-between items-center">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-teal-500">TRANSACTION_LOG</span>
                            <span className="text-[8px] font-mono font-bold bg-white/10 px-2 py-0.5 uppercase tracking-widest">{biddingLog.length} BIDS</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] custom-scrollbar">
                            {biddingLog.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 italic space-y-3">
                                    <div className="w-8 h-0.5 bg-white/20" />
                                    <p className="tracking-widest uppercase text-[8px]">AWAITING_INITIAL_BID</p>
                                    <div className="w-8 h-0.5 bg-white/20" />
                                </div>
                            ) : (
                                biddingLog.map((bid, idx) => (
                                    <motion.div
                                        initial={{ x: 10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        key={idx}
                                        className={`flex justify-between items-center p-2 border ${idx === 0 ? 'border-teal-500 bg-teal-500/10' : 'border-white/5 bg-white/[0.02] opacity-50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {idx === 0 && <div className="w-1.5 h-1.5 bg-teal-500 animate-pulse" />}
                                            <span className="font-black uppercase tracking-tight">{bid.teamName}</span>
                                        </div>
                                        <span className={`font-black ${idx === 0 ? 'text-teal-500 text-sm' : ''}`}>{formatCurrency(bid.bid)}</span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer / Progress Bar */}
            <div className="h-4 bg-white/5 relative z-20">
                <motion.div 
                    className="h-full bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentPlayerIdx + 1) / sortedPool.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
};

export default AuctionRoom;