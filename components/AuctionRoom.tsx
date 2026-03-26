import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Gavel, Users, User, Shield, Zap, Target, 
    Trophy, Activity, TrendingUp, ChevronRight, X, 
    Search, Filter, BarChart3, Scale, Info,
    ArrowUpRight, Globe, Award, DollarSign,
    Clock, History, LayoutGrid
} from 'lucide-react';
import { Player, Team, GameData, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';

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
        <div className="h-full flex flex-col bg-[#050808] text-white font-sans overflow-hidden relative">
            {activeOverlay === 'franchises' && (
                <div className="absolute inset-0 z-[100] bg-[#050808]/95 backdrop-blur-2xl flex flex-col p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">DATABASE // FRANCHISE_ROSTERS</h2>
                            </div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">SQUAD<br/><span className="text-teal-500">TRACKER</span></h1>
                        </div>
                        <button 
                            onClick={() => setActiveOverlay('none')} 
                            className="w-14 h-14 flex items-center justify-center bg-white/5 text-white rounded-full hover:bg-white/10 transition-all border border-white/10 active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                        {teams.map(team => {
                            const td = gameData.allTeamsData.find(d => d.id === team.id);
                            const isDev = td?.isYouthTeam;
                            const isUser = team.id === gameData.userTeamId;
                            
                            return (
                                <div key={team.id} className={`p-8 glass-card border transition-all duration-300 ${isUser ? 'border-teal-500/50 bg-teal-500/5 ring-1 ring-teal-500/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                                    <div className="flex justify-between mb-6 border-b border-white/5 pb-4 items-end">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black italic uppercase tracking-tighter text-2xl leading-none">{team.name}</h4>
                                                {isDev && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-sm border border-blue-500/20">DEV_SQUAD</span>}
                                                {isUser && <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[8px] font-black uppercase tracking-widest rounded-sm border border-teal-500/20">MY_FRANCHISE</span>}
                                            </div>
                                            <p className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">{team.squad.length} / {MAX_SQUAD_SIZE} SIGNED</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-mono font-bold text-white/20 uppercase mb-1 tracking-widest">PURSE_REMAINING</p>
                                            <span className="text-2xl font-black font-mono text-teal-400 italic">{team.purse.toFixed(2)} <span className="text-xs">Cr</span></span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {team.squad.map(p => (
                                            <div key={p.id} className="flex flex-col p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-teal-500/30 transition-all">
                                                <span className="text-[10px] font-black uppercase tracking-tight text-white/60 group-hover:text-white transition-colors truncate">{p.name}</span>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${getRoleColor(p.role)} opacity-60 group-hover:opacity-100 transition-opacity`}>{p.role}</span>
                                                    {p.isForeign && <Globe className="w-2.5 h-2.5 text-blue-400" />}
                                                </div>
                                            </div>
                                        ))}
                                        {team.squad.length === 0 && (
                                            <div className="col-span-full py-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.3em]">Awaiting_Market_Activity</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Scale className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-sm">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE_AUCTION</span>
                            </div>
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">SESSION_01 // LOT_{currentPlayerIdx + 1}</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            MARKET<br/>
                            <span className="text-teal-500">BOARD</span>
                        </h1>
                    </div>

                    <div className="text-right glass-card px-8 py-4 border-teal-500/20 bg-teal-500/5 rounded-[32px]">
                        <p className="text-[10px] font-mono font-bold text-teal-500/60 uppercase tracking-widest leading-none mb-2">AVAILABLE_PURSE</p>
                        <span className="text-4xl font-black font-mono text-white italic">{userTeam?.purse?.toFixed(2) || '0.00'} <span className="text-sm text-teal-500">Cr</span></span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {!auctionFinished ? (
                    <>
                        {currentPlayer ? (
                            <div className="grid grid-cols-1 gap-6 flex-1">
                                {/* Player Details Card - V2.0 Style */}
                                <div className="glass-card p-10 flex flex-col relative overflow-hidden border-white/10 rounded-[48px] bg-gradient-to-br from-white/[0.03] to-transparent">
                                    <div className="absolute top-0 right-0 bg-teal-500 text-black px-6 py-2 text-[11px] font-black uppercase tracking-[0.3em] rounded-bl-3xl">
                                        {getRoleFullName(currentPlayer.role)} {currentPlayer.isForeign ? '// INTERNATIONAL' : '// DOMESTIC'}
                                    </div>

                                    <div className="mt-8">
                                        <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
                                            <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-[0.8] text-white">
                                                {currentPlayer.name.split(' ')[0]}<br/>
                                                <span className="text-teal-500">{currentPlayer.name.split(' ').slice(1).join(' ')}</span>
                                            </h2>
                                            <div className="flex items-center gap-3 pb-2">
                                                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                                                <span className="text-[11px] font-mono font-bold text-white/30 uppercase tracking-[0.3em]">ACTIVE_LOT_STATUS</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="glass-card p-6 border-white/5 bg-white/[0.02] rounded-3xl group hover:bg-white/[0.04] transition-all">
                                                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-3">BATTING_SKILL</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-5xl font-black font-mono text-teal-400 italic tracking-tighter">{currentPlayer.battingSkill}</p>
                                                    <span className="text-xs font-mono opacity-20">/100</span>
                                                </div>
                                            </div>
                                            <div className="glass-card p-6 border-white/5 bg-white/[0.02] rounded-3xl group hover:bg-white/[0.04] transition-all">
                                                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-3">BOWLING_SKILL</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-5xl font-black font-mono text-blue-400 italic tracking-tighter">{currentPlayer.secondarySkill}</p>
                                                    <span className="text-xs font-mono opacity-20">/100</span>
                                                </div>
                                            </div>
                                            <div className="glass-card p-6 border-white/5 bg-white/[0.02] rounded-3xl group hover:bg-white/[0.04] transition-all">
                                                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-3">PLAYER_STYLE</p>
                                                <p className="text-2xl font-black italic uppercase tracking-tighter text-white truncate">{currentPlayer.style}</p>
                                            </div>
                                            <div className="glass-card p-6 border-white/5 bg-teal-500/5 rounded-3xl group hover:bg-teal-500/10 transition-all border-teal-500/20">
                                                <p className="text-[10px] font-black text-teal-500/60 uppercase tracking-widest mb-3">BASE_VALUATION</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-3xl font-black font-mono text-white italic">{getBasePrice(currentPlayer).toFixed(2)}</p>
                                                    <span className="text-xs font-black text-teal-500">Cr</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Stats Section */}
                                        <div className="mt-12 pt-10 border-t border-white/5">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                                    <BarChart3 className="w-5 h-5 text-teal-500" />
                                                </div>
                                                <h4 className="text-2xl font-black italic uppercase tracking-tighter">CAREER_ANALYTICS</h4>
                                                <div className="h-px flex-1 bg-gradient-to-r from-teal-500/20 to-transparent" />
                                            </div>
                                            {(() => {
                                                const stats = aggregateStats(currentPlayer, [Format.T20, Format.ODI, Format.SHIELD]);
                                                const isBatter = [PlayerRole.BATSMAN, PlayerRole.WICKET_KEEPER, PlayerRole.ALL_ROUNDER].includes(currentPlayer.role);
                                                const isBowler = [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(currentPlayer.role);

                                                return (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mb-2">MATCHES</span>
                                                            <span className="text-3xl font-black font-mono text-white/90 italic">{stats.matches}</span>
                                                        </div>
                                                        {(isBatter || currentPlayer.role === PlayerRole.ALL_ROUNDER) && (
                                                            <>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mb-2">TOTAL_RUNS</span>
                                                                    <span className="text-3xl font-black font-mono text-teal-400 italic">{stats.runs}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mb-2">AVG_RATING</span>
                                                                    <span className="text-3xl font-black font-mono text-teal-400 italic">{stats.average.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mb-2">STRIKE_RATE</span>
                                                                    <span className="text-3xl font-black font-mono text-teal-400 italic">{stats.strikeRate.toFixed(1)}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        {(isBowler || currentPlayer.role === PlayerRole.ALL_ROUNDER) && (
                                                            <>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mb-2">WICKETS</span>
                                                                    <span className="text-3xl font-black font-mono text-blue-400 italic">{stats.wickets}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black opacity-20 uppercase tracking-widest mb-2">ECONOMY</span>
                                                                    <span className="text-3xl font-black font-mono text-blue-400 italic">{stats.economy.toFixed(2)}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Bidding Controls - Apex Style */}
                                    <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-4 glass-card bg-white/5 border-white/10 p-8 flex flex-col items-center justify-center text-center rounded-[32px] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.3em] mb-3">CURRENT_HIGH_BID</p>
                                            <div className="text-6xl font-black font-mono text-white leading-none mb-4 italic drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                                {currentBid.toFixed(2)}
                                            </div>
                                            <div className="px-4 py-1.5 bg-teal-500/10 rounded-full border border-teal-500/20 w-full">
                                                <p className="text-[10px] font-black italic uppercase tracking-tighter text-teal-400 truncate">
                                                    {highestBidderId ? teams.find(t => t.id === highestBidderId)?.name : 'AWAITING_OPENER'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-8 flex flex-col gap-4">
                                            <button 
                                                onClick={() => handleUserBid(1)}
                                                disabled={!isAuctioning || (highestBidderId === userTeam?.id) || (userTeam?.purse || 0) < (currentBid + getBidIncrement(currentBid))}
                                                className={`flex-grow py-8 px-10 font-black text-4xl italic uppercase tracking-tighter transition-all transform active:scale-[0.98] flex items-center justify-between group rounded-[32px] relative overflow-hidden ${
                                                    highestBidderId === userTeam?.id 
                                                    ? 'bg-teal-500 text-black shadow-[0_20px_50px_rgba(20,184,166,0.3)]' 
                                                    : 'bg-white text-black hover:bg-teal-400 shadow-[0_20px_50px_rgba(255,255,255,0.1)]'
                                                } disabled:opacity-20`}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                                                <span className="relative z-10">{highestBidderId === userTeam?.id ? 'LEADING_BID' : 'PLACE_BID'}</span>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <span className="text-2xl font-mono not-italic opacity-60">{(currentBid + getBidIncrement(currentBid)).toFixed(2)}</span>
                                                    <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                                                </div>
                                            </button>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <button 
                                                    onClick={skipPlayer} 
                                                    className="glass-card bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all text-white/40 hover:text-white flex items-center justify-center gap-2 group"
                                                >
                                                    <History className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
                                                    PASS_LOT
                                                </button>
                                                <button 
                                                    onClick={() => setActiveOverlay('franchises')} 
                                                    className="glass-card bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all text-white/40 hover:text-white flex items-center justify-center gap-2 group"
                                                >
                                                    <LayoutGrid className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    ROSTERS
                                                </button>
                                                <button 
                                                    onClick={autoAuctionRemaining} 
                                                    className="glass-card bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                                                >
                                                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform fill-current" />
                                                    AUTO_DRAFT
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bidding Log - Compact V2.0 */}
                                <div className="glass-card border-white/5 p-8 rounded-[40px] bg-black/40 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/20" />
                                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <History className="w-4 h-4 text-teal-500" />
                                            <p className="text-[11px] font-mono font-bold text-white/30 uppercase tracking-[0.3em]">LIVE_BIDDING_LOG</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                                            <div className="w-1.5 h-1.5 bg-teal-500/40 rounded-full" />
                                            <div className="w-1.5 h-1.5 bg-teal-500/20 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="h-40 overflow-y-auto space-y-3 font-mono text-[11px] custom-scrollbar pr-4">
                                        {currentLotBids.map((bid, idx) => (
                                            <div key={idx} className={`flex justify-between items-center pb-2 border-b border-white/5 ${idx === 0 ? 'text-teal-400 font-black' : 'text-white/30'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="opacity-20">#{currentLotBids.length - idx}</span>
                                                    <span className="uppercase tracking-tighter">{bid.teamName}</span>
                                                </div>
                                                <span className="font-black italic">{bid.bid.toFixed(2)} <span className="text-[9px] opacity-40">Cr</span></span>
                                            </div>
                                        ))}
                                        {currentLotBids.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 opacity-10">
                                                <Clock className="w-8 h-8 mb-2" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting_Activity</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-20 px-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative mb-16"
                        >
                            <div className="absolute inset-0 bg-teal-500/20 blur-[120px] rounded-full animate-pulse" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-center gap-4 mb-8">
                                    <div className="h-px w-12 bg-teal-500" />
                                    <span className="text-[12px] font-black text-teal-500 uppercase tracking-[0.5em]">AUCTION_COMPLETE</span>
                                    <div className="h-px w-12 bg-teal-500" />
                                </div>
                                <h2 className="text-[10vw] font-black italic tracking-tighter leading-[0.8] uppercase text-white">
                                    MARKET<br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">CLOSED</span>
                                </h2>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-12 w-full"
                        >
                            <p className="text-lg font-bold uppercase tracking-[0.2em] text-white/40 max-w-xl mx-auto leading-relaxed">
                                All franchises have finalized their rosters. The <span className="text-white">Career Hub</span> is now operational for tournament management.
                            </p>

                            <button 
                                onClick={finishAuction} 
                                className="w-full max-w-md mx-auto group relative overflow-hidden rounded-[32px] shadow-[0_20px_60px_rgba(20,184,166,0.3)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-400 transition-transform duration-500 group-hover:scale-110" />
                                <div className="relative py-8 flex items-center justify-center gap-6">
                                    <span className="text-black font-black italic tracking-tighter text-4xl uppercase">ENTER_HUB</span>
                                    <ChevronRight size={48} className="text-black group-hover:translate-x-3 transition-transform duration-500" />
                                </div>
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionRoom;