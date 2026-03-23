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
    const [hammerState, setHammerState] = useState<'none' | 'going' | 'gone'>('none');

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
            setBiddingLog(prev => [`Emerging limit reached!`, ...prev.slice(0, 5)]);
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
                    
                    // Emerging limit check for AI
                    if (currentPlayer.isEmerging && t.squad.filter(p => p.isEmerging).length >= MAX_EMERGING_LIMIT) {
                        return false;
                    }

                    let baseValuation = Math.pow(rating / 50, 3.5) * 1.2;
                    const squad = t.squad;
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
        setHammerState('going');
        
        setTimeout(() => {
            setHammerState('gone');
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
                setHammerState('none');
                setCurrentPlayerIdx(prev => prev + 1);
                setIsTransitioning(false);
            }, 1500);
        }, 800);
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
        let pool = shuffle([...unauctioned]);

        const finalTeams = teams.map(team => {
            const isDev = gameData.allTeamsData.find(td => td.id === team.id)?.isYouthTeam;
            const targetTotalSize = isDev ? 14 : 20;
            
            let squad = [...team.squad];
            let purse = team.purse;

            const fillNeeded = (role: PlayerRole, count: number, foreignOk: boolean = true) => {
                let existing = squad.filter(p => p.role === role).length;
                while (existing < count && pool.length > 0) {
                    const choices = pool.filter(p => 
                        p.role === role && 
                        (foreignOk || !p.isForeign) &&
                        (!p.isEmerging || squad.filter(pl => pl.isEmerging).length < MAX_EMERGING_LIMIT)
                    ).slice(0, 10);
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
        <div className="h-full bg-[#050505] text-white flex flex-col overflow-hidden font-sans selection:bg-teal-500/30">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            {/* Modals / Overlays */}
            <AnimatePresence>
                {activeOverlay === 'franchises' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-8 overflow-y-auto custom-scrollbar"
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                                <div>
                                    <h2 className="text-7xl font-black italic tracking-tighter uppercase font-display leading-none">FRANCHISE_ROSTERS</h2>
                                    <p className="text-teal-500 font-mono text-xs tracking-[0.3em] mt-2 uppercase">LIVE_MARKET_INTELLIGENCE // SEASON_{gameData.currentSeason}</p>
                                </div>
                                <button 
                                    onClick={() => setActiveOverlay('none')}
                                    className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 group"
                                >
                                    <X size={32} className="group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {teams.map(team => {
                                    const isDev = gameData.allTeamsData.find(td => td.id === team.id)?.isYouthTeam;
                                    return (
                                        <div key={team.id} className="group">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-teal-500 transition-colors">{team.name}</h3>
                                                    <p className="text-[10px] font-mono font-bold opacity-40 uppercase tracking-[0.2em]">{team.squad.length} / {isDev ? 14 : 22} SIGNED</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-mono font-bold opacity-40 uppercase tracking-[0.2em] mb-1">PURSE</p>
                                                    <span className="text-xl font-black font-mono text-teal-500 tracking-tighter">{formatCurrency(team.purse)}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1">
                                                {team.squad.map((p, idx) => (
                                                    <div key={p.id} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 hover:border-teal-500/50 transition-all group/item">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-mono opacity-20 w-4">{(idx + 1).toString().padStart(2, '0')}</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold uppercase tracking-tight group-hover/item:text-teal-400">{p.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[8px] font-mono opacity-40 uppercase">{p.role}</span>
                                                                    {p.isEmerging && <span className="text-[7px] bg-yellow-500/20 text-yellow-500 px-1 font-bold">EMG</span>}
                                                                    {p.isForeign && <span className="text-[7px] bg-blue-500/20 text-blue-500 px-1 font-bold">INT</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-mono font-black text-teal-500/50">{Math.max(p.battingSkill, p.secondarySkill)}</span>
                                                    </div>
                                                ))}
                                                {team.squad.length === 0 && (
                                                    <div className="h-20 border border-dashed border-white/10 flex items-center justify-center">
                                                        <p className="text-[10px] font-mono opacity-20 uppercase tracking-[0.3em]">AWAITING_SIGNINGS</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="relative z-10 px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-12 h-12 bg-teal-500 flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#fff]">
                            <Gavel size={24} className="text-black -rotate-3" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 animate-pulse rounded-full border-2 border-black" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter font-display leading-none">AUCTION_ELITE</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-mono font-bold text-teal-500 tracking-[0.3em] uppercase">LIVE_MARKET_FEED</span>
                            <div className="w-1 h-1 bg-teal-500 rounded-full animate-ping" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="hidden lg:block text-right">
                        <p className="text-[9px] font-mono font-bold opacity-30 uppercase tracking-[0.2em] mb-1">MARKET_PHASE</p>
                        <p className="text-sm font-black uppercase tracking-widest italic">
                            {currentPlayer?.role.replace('_', ' ') || 'FINALIZING'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-mono font-bold opacity-30 uppercase tracking-[0.2em] mb-1">AVAILABLE_CAPITAL</p>
                        <p className="text-3xl font-black font-mono text-teal-500 tracking-tighter leading-none">
                            {formatCurrency(userTeam?.purse || 0)}
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
                {/* Left: Player Showcase */}
                <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
                    {!auctionFinished ? (
                        currentPlayer ? (
                            <motion.div
                                key={currentPlayer.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="max-w-5xl mx-auto"
                            >
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                                    {/* Player Identity */}
                                    <div className="xl:col-span-7 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-white text-black px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                                                    {currentPlayer.role.replace('_', ' ')}
                                                </span>
                                                <span className="border border-white/20 px-3 py-1 text-[10px] font-black tracking-widest uppercase opacity-60">
                                                    {currentPlayer.isForeign ? 'INTERNATIONAL' : 'DOMESTIC'}
                                                </span>
                                                {currentPlayer.isEmerging && (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="bg-yellow-500 text-black px-3 py-1 text-[10px] font-black tracking-widest uppercase shadow-[4px_4px_0px_rgba(234,179,8,0.3)]">
                                                            EMERGING_TALENT
                                                        </span>
                                                        {currentPlayer.yearsSelectedConsecutively !== undefined && (
                                                            <span className="text-[8px] font-mono font-bold text-yellow-500/60 uppercase tracking-widest">
                                                                YEAR_{currentPlayer.yearsSelectedConsecutively + 1}_OF_3
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {currentPlayer.isMustBuy && (
                                                    <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase shadow-[4px_4px_0px_rgba(220,38,38,0.3)]">
                                                        ELITE_TARGET
                                                    </span>
                                                )}
                                            </div>
                                            <h1 className="text-7xl lg:text-9xl font-black uppercase tracking-tighter font-display leading-[0.85] italic">
                                                {currentPlayer.name.split(' ').map((part, i) => (
                                                    <span key={i} className={i === 0 ? "block" : "block text-teal-500"}>{part}</span>
                                                ))}
                                            </h1>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            {[
                                                { label: 'BAT_SKILL', value: currentPlayer.battingSkill, color: 'text-blue-400' },
                                                { label: 'BWL_SKILL', value: currentPlayer.secondarySkill, color: 'text-red-400' },
                                                { label: 'POTENTIAL', value: Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill), highlight: true }
                                            ].map(stat => (
                                                <div key={stat.label} className={`p-6 border ${stat.highlight ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                                                    <p className="text-[9px] font-mono font-bold opacity-30 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                                    <p className={`text-4xl font-black font-mono ${stat.highlight ? 'text-teal-500' : stat.color || ''}`}>{stat.value}</p>
                                                    <div className="mt-4 h-1 bg-white/5 overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${stat.value}%` }}
                                                            className={`h-full ${stat.highlight ? 'bg-teal-500' : stat.color?.replace('text', 'bg') || 'bg-white'}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bidding Status */}
                                    <div className="xl:col-span-5 space-y-6 relative">
                                        {/* Hammer Animation Overlay */}
                                        <AnimatePresence>
                                            {hammerState !== 'none' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.5 }}
                                                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-teal-500 rounded-none shadow-[0_0_100px_rgba(20,184,166,0.5)]"
                                                >
                                                    <motion.div
                                                        animate={{ 
                                                            rotate: hammerState === 'going' ? [0, -45, 0] : 0,
                                                            scale: hammerState === 'gone' ? [1, 1.2, 1] : 1
                                                        }}
                                                        transition={{ duration: 0.3, repeat: hammerState === 'going' ? 2 : 0 }}
                                                        className="mb-4"
                                                    >
                                                        <Gavel size={120} className="text-black" />
                                                    </motion.div>
                                                    <h2 className="text-6xl font-black italic uppercase tracking-tighter text-black">
                                                        {hammerState === 'going' ? 'GOING...' : 'SOLD!'}
                                                    </h2>
                                                    {hammerState === 'gone' && highestBidder && (
                                                        <motion.p 
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            className="text-black font-mono font-bold uppercase tracking-[0.3em] mt-2"
                                                        >
                                                            TO_{highestBidder.name}
                                                        </motion.p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="p-8 border-2 border-teal-500 bg-teal-500/5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rotate-45 translate-x-12 -translate-y-12" />
                                            <p className="text-[10px] font-mono font-bold opacity-40 uppercase tracking-[0.3em] mb-6">CURRENT_VALUATION</p>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-7xl font-black font-mono text-teal-500 tracking-tighter leading-none">
                                                    {formatCurrency(currentBid)}
                                                </span>
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[9px] font-mono font-bold opacity-30 uppercase tracking-[0.2em] mb-1">HIGHEST_BIDDER</p>
                                                    <p className="text-xl font-black italic uppercase tracking-tight text-white">
                                                        {highestBidder?.name || '---'}
                                                    </p>
                                                </div>
                                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                                                    <TrendingUp size={20} className="text-teal-500" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col items-center text-center">
                                            <p className="text-[10px] font-mono font-bold opacity-30 uppercase tracking-[0.3em] mb-4">MARKET_TIMER</p>
                                            <div className="relative w-32 h-32 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                                    <motion.circle
                                                        cx="64"
                                                        cy="64"
                                                        r="58"
                                                        fill="transparent"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        strokeDasharray="364.4"
                                                        animate={{ strokeDashoffset: 364.4 * (1 - timeLeft / 10) }}
                                                        transition={{ duration: 1, ease: "linear" }}
                                                        className={timeLeft <= 3 ? "text-red-500" : "text-teal-500"}
                                                    />
                                                </svg>
                                                <div className="absolute flex flex-col items-center">
                                                    <span className={`text-5xl font-black font-mono leading-none ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}</span>
                                                    <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest mt-1">SEC</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="relative">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="w-32 h-32 border-2 border-dashed border-teal-500/20 rounded-full" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-4 bg-teal-500 rounded-full animate-ping" />
                                    </div>
                                </div>
                                <h3 className="text-6xl font-black uppercase tracking-tighter italic font-display mt-12">PREPARING_LOT</h3>
                                <p className="text-[11px] font-mono font-bold text-teal-500 tracking-[0.5em] mt-4 uppercase opacity-50">SYNCHRONIZING_MARKET_DATA</p>
                            </div>
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative mb-16"
                            >
                                <div className="absolute -inset-20 border border-dashed border-teal-500/10 rounded-full animate-spin-slow" />
                                <h2 className="text-[15rem] font-black italic tracking-tighter leading-[0.7] uppercase font-display text-white/[0.02] absolute inset-0 flex items-center justify-center pointer-events-none">FINISH</h2>
                                <h2 className="text-8xl lg:text-9xl font-black italic tracking-tighter leading-none uppercase font-display relative z-10">AUCTION<br/><span className="text-teal-500">CONCLUDED</span></h2>
                            </motion.div>
                            <p className="text-sm font-bold uppercase tracking-[0.4em] mb-16 opacity-30 font-mono">ALL_SQUADS_FINALIZED // MARKET_SESSION_TERMINATED</p>
                            <button 
                                onClick={finishAuction} 
                                className="group relative px-16 py-8 bg-teal-500 text-black font-black italic tracking-tighter text-5xl uppercase overflow-hidden transition-all duration-500 hover:scale-105"
                            >
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <span className="relative z-10 group-hover:text-black">ENTER_CAREER_HUB</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Market Operations */}
                <div className="w-full lg:w-[380px] flex flex-col bg-black/40 backdrop-blur-xl border-l border-white/10 relative overflow-hidden">
                    {/* Controls */}
                    <div className="p-8 border-b border-white/10 space-y-4">
                        <button
                            onClick={() => handleUserBid(1)}
                            disabled={!isAuctioning || isTransitioning || (userTeam && userTeam.purse < currentBid + getBidIncrement(currentBid))}
                            className="w-full h-24 bg-teal-500 text-black font-black py-4 px-3 uppercase tracking-widest text-2xl italic hover:bg-white transition-all duration-500 disabled:opacity-10 disabled:grayscale flex flex-col items-center justify-center gap-1 shadow-[0_20px_40px_rgba(20,184,166,0.2)] relative overflow-hidden group"
                        >
                            <div className="relative z-10 flex items-center gap-3">
                                <DollarSign size={24} />
                                <span>PLACE_BID</span>
                            </div>
                            <span className="relative z-10 text-[10px] font-mono font-bold opacity-60 mt-1 uppercase tracking-widest">
                                NEXT: {formatCurrency(currentBid + getBidIncrement(currentBid))}
                            </span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={skipPlayer}
                                disabled={!isAuctioning || isTransitioning}
                                className="h-14 border border-white/10 text-white font-black py-2 px-1 uppercase tracking-widest text-[10px] italic hover:bg-white hover:text-black transition-all duration-500 disabled:opacity-20 flex items-center justify-center gap-2"
                            >
                                <SkipForward size={16} />
                                <span>PASS_LOT</span>
                            </button>
                            <button
                                onClick={() => setActiveOverlay('franchises')}
                                className="h-14 border border-white/10 text-white font-black py-2 px-1 uppercase tracking-widest text-[10px] italic hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all duration-500 flex items-center justify-center gap-2"
                            >
                                <Trophy size={16} />
                                <span>ROSTERS</span>
                            </button>
                        </div>
                    </div>

                    {/* History / Transaction Log */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-teal-500">TRANSACTION_LOG</span>
                            <span className="text-[9px] font-mono font-bold bg-white/10 px-3 py-1 uppercase tracking-widest">{biddingLog.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-3 font-mono text-xs custom-scrollbar">
                            {biddingLog.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 italic space-y-4">
                                    <div className="w-12 h-[1px] bg-white" />
                                    <p className="tracking-[0.4em] uppercase text-[9px]">AWAITING_MARKET_ACTIVITY</p>
                                    <div className="w-12 h-[1px] bg-white" />
                                </div>
                            ) : (
                                biddingLog.map((bid, idx) => (
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        key={idx}
                                        className={`flex justify-between items-center p-4 border ${idx === 0 ? 'border-teal-500 bg-teal-500/10' : 'border-white/5 bg-white/[0.01] opacity-40'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {idx === 0 && <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />}
                                            <span className={`font-black uppercase tracking-tight ${idx === 0 ? 'text-white' : ''}`}>{bid.teamName}</span>
                                        </div>
                                        <span className={`font-black font-mono ${idx === 0 ? 'text-teal-500 text-lg' : ''}`}>{formatCurrency(bid.bid)}</span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Ticker / Market Feed */}
            <div className="h-8 bg-teal-500 text-black flex items-center overflow-hidden relative z-20 border-t border-white/20">
                <div className="bg-black text-white px-4 h-full flex items-center font-black italic text-[10px] tracking-widest uppercase z-10">
                    MARKET_TICKER
                </div>
                <div className="flex-1 overflow-hidden">
                    <motion.div 
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="whitespace-nowrap flex items-center gap-12 font-mono font-bold text-[10px] uppercase tracking-widest"
                    >
                        {teams.map(t => (
                            <span key={t.id} className="flex items-center gap-2">
                                <span className="opacity-60">{t.name}:</span>
                                <span>{formatCurrency(t.purse)}</span>
                                <span className="opacity-30">|</span>
                                <span className="opacity-60">SQUAD:</span>
                                <span>{t.squad.length}/22</span>
                            </span>
                        ))}
                        <span className="text-black/40">*** SEASON_{gameData.currentSeason} AUCTION LIVE ***</span>
                    </motion.div>
                </div>
            </div>

            {/* Global Progress */}
            <div className="h-1.5 bg-white/5 relative z-20">
                <motion.div 
                    className="h-full bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentPlayerIdx + 1) / sortedPool.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                />
            </div>
        </div>
    );
};

export default AuctionRoom;