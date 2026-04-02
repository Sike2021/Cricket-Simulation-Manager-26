import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightLeft, Search, Filter, TrendingUp, UserPlus, UserMinus, Shield, Zap, Target, Wallet, Info, ChevronRight, Gavel, X } from 'lucide-react';
import { GameData, Player, Team, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, getPlayerById, aggregateStats } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';

interface TransfersProps {
    gameData: GameData;
    userTeam: Team | null;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const Transfers: React.FC<TransfersProps> = ({ gameData, userTeam, setGameData, showFeedback }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<PlayerRole | 'ALL'>('ALL');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeTab, setActiveTab] = useState<'market' | 'squad' | 'swap'>('market');
    const [selectedOtherTeamId, setSelectedOtherTeamId] = useState<string>(gameData.teams.find(t => t.id !== userTeam?.id)?.id || '');
    const [selectedMyPlayerForSwap, setSelectedMyPlayerForSwap] = useState<Player | null>(null);
    const [selectedOtherPlayerForSwap, setSelectedOtherPlayerForSwap] = useState<Player | null>(null);

    const availablePlayers = useMemo(() => {
        const ownedIds = new Set(gameData.teams.flatMap(t => t.squad.map(p => p.id)));
        return gameData.allPlayers.filter(p => !ownedIds.has(p.id));
    }, [gameData.allPlayers, gameData.teams]);

    const filteredMarket = useMemo(() => {
        return availablePlayers.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
            return matchesSearch && matchesRole;
        }).sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
    }, [availablePlayers, searchQuery, roleFilter]);

    const handleBuy = (player: Player) => {
        if (!userTeam) return;
        const price = (player.battingSkill + player.secondarySkill) / 10;
        if (userTeam.purse < price) {
            showFeedback("Insufficient funds!", "error");
            return;
        }
        if (userTeam.squad.length >= 25) {
            showFeedback("Squad full!", "error");
            return;
        }

        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => {
                    if (t.id === userTeam.id) {
                        return { ...t, purse: Number((t.purse - price).toFixed(2)), squad: [...t.squad, player] };
                    }
                    return t;
                })
            };
        });
        showFeedback(`Signed ${player.name} for ${price.toFixed(2)} Cr`, "success");
        setSelectedPlayer(null);
    };

    const handleSell = (player: Player) => {
        if (!userTeam) return;
        const price = ((player.battingSkill + player.secondarySkill) / 10) * 0.8;
        
        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => {
                    if (t.id === userTeam.id) {
                        return { 
                            ...t, 
                            purse: Number((t.purse + price).toFixed(2)), 
                            squad: t.squad.filter(p => p.id !== player.id) 
                        };
                    }
                    return t;
                })
            };
        });
        showFeedback(`Sold ${player.name} for ${price.toFixed(2)} Cr`, "success");
        setSelectedPlayer(null);
    };

    const handleSwap = () => {
        if (!userTeam || !selectedMyPlayerForSwap || !selectedOtherPlayerForSwap || !selectedOtherTeamId) return;

        const otherTeam = gameData.teams.find(t => t.id === selectedOtherTeamId);
        if (!otherTeam) return;

        // Penalty logic: if we swap with a great like 80+ we have 10cr less next year auction
        const penalty = selectedOtherPlayerForSwap.battingSkill >= 80 || selectedOtherPlayerForSwap.secondarySkill >= 80 ? 10 : 0;

        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => {
                    if (t.id === userTeam.id) {
                        const newSquad = t.squad.filter(p => p.id !== selectedMyPlayerForSwap.id);
                        newSquad.push(selectedOtherPlayerForSwap);
                        return { 
                            ...t, 
                            squad: newSquad, 
                            nextYearBudgetReduction: (t.nextYearBudgetReduction || 0) + penalty 
                        };
                    }
                    if (t.id === selectedOtherTeamId) {
                        const newSquad = t.squad.filter(p => p.id !== selectedOtherPlayerForSwap.id);
                        newSquad.push(selectedMyPlayerForSwap);
                        return { ...t, squad: newSquad };
                    }
                    return t;
                })
            };
        });

        showFeedback(`Swapped ${selectedMyPlayerForSwap.name} with ${selectedOtherPlayerForSwap.name}${penalty > 0 ? '. 10Cr penalty applied for next season.' : ''}`, penalty > 0 ? "error" : "success");
        setSelectedMyPlayerForSwap(null);
        setSelectedOtherPlayerForSwap(null);
        setSelectedPlayer(null);
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* Editorial Header */}
            <header className="px-8 pt-12 pb-8 border-b-2 border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ArrowRightLeft className="w-32 h-32" />
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em] mb-2">MARKET_EXCHANGE // v4.0</h2>
                        <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.8]">
                            TRANSFER<br/>
                            <span className="text-teal-500">HUB</span>
                        </h1>
                    </div>
                    <div className="text-right bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">AVAILABLE_PURSE</p>
                        <p className="text-4xl font-black font-mono text-teal-400 tracking-tighter">
                            {userTeam?.purse.toFixed(2)}<span className="text-sm ml-1 opacity-40">CR</span>
                        </p>
                    </div>
                </div>

                {/* Modern Tabs */}
                <div className="flex gap-8 mt-12">
                    {['market', 'squad', 'swap'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`group relative pb-4 transition-all ${activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                        >
                            <span className="text-xs font-black uppercase tracking-[0.3em]">
                                {tab === 'market' ? 'FREE_AGENTS' : tab === 'squad' ? 'CURRENT_SQUAD' : 'PLAYER_SWAP'}
                            </span>
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="transfer-tab" 
                                    className="absolute bottom-0 left-0 w-full h-1 bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.6)]" 
                                />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'swap' ? (
                    <div className="w-full flex flex-col p-8 overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* My Squad */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Your_Squad</h3>
                                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Select_One</span>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {userTeam?.squad?.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedMyPlayerForSwap(p)}
                                            className={`p-4 rounded-[24px] border-2 transition-all text-left flex justify-between items-center gap-4 ${selectedMyPlayerForSwap?.id === p.id ? 'bg-teal-500 text-black border-white shadow-[0_0_30px_rgba(20,184,166,0.3)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                        >
                                            <PlayerAvatar player={p} size="sm" />
                                            <div className="flex-1">
                                                <p className="text-lg font-black italic uppercase tracking-tighter truncate">{p.name}</p>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${selectedMyPlayerForSwap?.id === p.id ? 'text-black/60' : 'text-teal-500'}`}>{p.role}</p>
                                            </div>
                                            <div className="text-3xl font-black italic font-mono">{Math.max(p.battingSkill, p.secondarySkill)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Other Squad */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-[300px]">
                                        {gameData.teams.filter(t => t.id !== userTeam?.id).map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setSelectedOtherTeamId(t.id);
                                                    setSelectedOtherPlayerForSwap(null);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedOtherTeamId === t.id ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Select_One</span>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {gameData.teams.find(t => t.id === selectedOtherTeamId)?.squad?.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedOtherPlayerForSwap(p)}
                                            className={`p-4 rounded-[24px] border-2 transition-all text-left flex justify-between items-center gap-4 ${selectedOtherPlayerForSwap?.id === p.id ? 'bg-teal-500 text-black border-white shadow-[0_0_30px_rgba(20,184,166,0.3)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                        >
                                            <PlayerAvatar player={p} size="sm" />
                                            <div className="flex-1">
                                                <p className="text-lg font-black italic uppercase tracking-tighter truncate">{p.name}</p>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${selectedOtherPlayerForSwap?.id === p.id ? 'text-black/60' : 'text-teal-500'}`}>{p.role}</p>
                                            </div>
                                            <div className="text-3xl font-black italic font-mono">{Math.max(p.battingSkill, p.secondarySkill)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Swap Confirmation Face-to-Face View */}
                        {selectedMyPlayerForSwap && selectedOtherPlayerForSwap && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="fixed inset-0 z-50 bg-[#050808]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
                            >
                                <div className="w-full max-w-6xl flex items-stretch justify-center gap-8 relative">
                                    {/* Left Player Card */}
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-500/20 to-transparent" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-6 relative z-10">Your Player</p>
                                        <PlayerAvatar player={selectedMyPlayerForSwap} size="lg" />
                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter mt-6 mb-2 relative z-10">{selectedMyPlayerForSwap.name}</h2>
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8 relative z-10">{selectedMyPlayerForSwap.role}</p>
                                    </div>

                                    {/* Center VS & Stats Comparison */}
                                    <div className="w-80 flex flex-col items-center justify-center z-10">
                                        <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(20,184,166,0.4)]">
                                            <span className="text-4xl font-black italic text-black">VS</span>
                                        </div>
                                        
                                        <div className="w-full space-y-6">
                                            {/* Batting Stat */}
                                            <div>
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-teal-400">{selectedMyPlayerForSwap.battingSkill}</span>
                                                    <span className="text-white/40">Batting</span>
                                                    <span className="text-white">{selectedOtherPlayerForSwap.battingSkill}</span>
                                                </div>
                                                <div className="flex h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="bg-teal-500 h-full" style={{ width: `${(selectedMyPlayerForSwap.battingSkill / (selectedMyPlayerForSwap.battingSkill + selectedOtherPlayerForSwap.battingSkill || 1)) * 100}%` }} />
                                                    <div className="bg-white h-full" style={{ width: `${(selectedOtherPlayerForSwap.battingSkill / (selectedMyPlayerForSwap.battingSkill + selectedOtherPlayerForSwap.battingSkill || 1)) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Bowling Stat */}
                                            <div>
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-teal-400">{selectedMyPlayerForSwap.secondarySkill}</span>
                                                    <span className="text-white/40">Bowling</span>
                                                    <span className="text-white">{selectedOtherPlayerForSwap.secondarySkill}</span>
                                                </div>
                                                <div className="flex h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="bg-teal-500 h-full" style={{ width: `${(selectedMyPlayerForSwap.secondarySkill / (selectedMyPlayerForSwap.secondarySkill + selectedOtherPlayerForSwap.secondarySkill || 1)) * 100}%` }} />
                                                    <div className="bg-white h-full" style={{ width: `${(selectedOtherPlayerForSwap.secondarySkill / (selectedMyPlayerForSwap.secondarySkill + selectedOtherPlayerForSwap.secondarySkill || 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                            
                                            {/* Fielding Stat */}
                                            <div>
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-teal-400">{selectedMyPlayerForSwap.fielding || 50}</span>
                                                    <span className="text-white/40">Fielding</span>
                                                    <span className="text-white">{selectedOtherPlayerForSwap.fielding || 50}</span>
                                                </div>
                                                <div className="flex h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="bg-teal-500 h-full" style={{ width: `${((selectedMyPlayerForSwap.fielding || 50) / ((selectedMyPlayerForSwap.fielding || 50) + (selectedOtherPlayerForSwap.fielding || 50) || 1)) * 100}%` }} />
                                                    <div className="bg-white h-full" style={{ width: `${((selectedOtherPlayerForSwap.fielding || 50) / ((selectedMyPlayerForSwap.fielding || 50) + (selectedOtherPlayerForSwap.fielding || 50) || 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Player Card */}
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-6 relative z-10">Target Player</p>
                                        <PlayerAvatar player={selectedOtherPlayerForSwap} size="lg" />
                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter mt-6 mb-2 relative z-10">{selectedOtherPlayerForSwap.name}</h2>
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8 relative z-10">{selectedOtherPlayerForSwap.role}</p>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-col items-center gap-4">
                                    {(selectedOtherPlayerForSwap.battingSkill >= 80 || selectedOtherPlayerForSwap.secondarySkill >= 80) && (
                                        <p className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2 bg-red-500/10 px-6 py-3 rounded-full">
                                            <TrendingUp size={14} /> -10Cr Next Season Penalty
                                        </p>
                                    )}
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => {
                                                setSelectedMyPlayerForSwap(null);
                                                setSelectedOtherPlayerForSwap(null);
                                            }}
                                            className="px-8 py-4 rounded-full border-2 border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSwap}
                                            className="bg-teal-500 text-black px-12 py-4 rounded-full font-black italic text-xl uppercase tracking-tighter hover:bg-white transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)]"
                                        >
                                            Confirm Swap
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Left Side: List */}
                        <div className="w-full lg:w-1/2 flex flex-col border-r border-white/10 bg-black/20">
                    <div className="p-8 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-teal-500 transition-colors" />
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="SEARCH_IDENTITY..."
                                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold tracking-tight focus:outline-none focus:border-teal-500 transition-all placeholder:text-white/10"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['ALL', ...Object.values(PlayerRole)].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role as any)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${roleFilter === role ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3 scrollbar-hide">
                        {(activeTab === 'market' ? filteredMarket : userTeam?.squad || []).map(player => (
                            <motion.button
                                layout
                                key={player.id}
                                onClick={() => setSelectedPlayer(player)}
                                className={`w-full p-6 rounded-[24px] flex items-center justify-between transition-all border-2 ${selectedPlayer?.id === player.id ? 'bg-teal-500 border-teal-500 text-black shadow-2xl' : 'bg-white/5 border-transparent hover:border-white/20'}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl italic ${selectedPlayer?.id === player.id ? 'bg-black/20' : 'bg-white/5'} ${getRoleColor(player.role)}`}>
                                        {player.name[0]}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black uppercase tracking-tighter text-xl italic leading-none mb-1">{player.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${selectedPlayer?.id === player.id ? 'bg-black/20' : 'bg-white/10'}`}>
                                                {player.role}
                                            </span>
                                            <span className="text-[9px] font-mono font-bold opacity-40 uppercase tracking-widest">{player.nationality}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black font-mono tracking-tighter ${selectedPlayer?.id === player.id ? 'text-black' : 'text-teal-400'}`}>
                                        {activeTab === 'market' 
                                            ? `${((player.battingSkill + player.secondarySkill) / 10).toFixed(2)}`
                                            : `${(((player.battingSkill + player.secondarySkill) / 10) * 0.8).toFixed(2)}`
                                        }
                                        <span className="text-[10px] ml-1 opacity-40">CR</span>
                                    </p>
                                    <p className={`text-[8px] font-black uppercase tracking-widest ${selectedPlayer?.id === player.id ? 'text-black/40' : 'opacity-30'}`}>
                                        {activeTab === 'market' ? 'VALUATION' : 'SELL_VALUE'}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="hidden lg:flex lg:w-1/2 flex-col bg-black/40 p-12 overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                        {selectedPlayer ? (
                            <motion.div
                                key={selectedPlayer.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] ${getRoleColor(selectedPlayer.role)} bg-white/10`}>
                                                {getRoleFullName(selectedPlayer.role)}
                                            </span>
                                            {selectedPlayer.isForeign && <span className="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] bg-blue-500/20 text-blue-400 border border-blue-500/20">International</span>}
                                        </div>
                                        <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-[0.8] text-white">
                                            {selectedPlayer.name.split(' ')[0]}<br/>
                                            <span className="text-teal-500">{selectedPlayer.name.split(' ')[1] || ''}</span>
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-teal-500 to-blue-600 p-1 shadow-2xl shadow-teal-500/20">
                                            <div className="w-full h-full rounded-[38px] bg-[#050808] flex flex-col items-center justify-center">
                                                <span className="text-5xl font-black italic text-white leading-none">
                                                    {Math.max(selectedPlayer.battingSkill, selectedPlayer.secondarySkill)}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-teal-500 mt-1">Rating</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-12">
                                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Zap className="w-16 h-16" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Batting_Skill</p>
                                        <div className="text-5xl font-black font-mono text-white tracking-tighter">{selectedPlayer.battingSkill}</div>
                                        <div className="h-2 w-full bg-white/5 rounded-full mt-6 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${selectedPlayer.battingSkill}%` }}
                                                className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" 
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Target className="w-16 h-16" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Bowling_Skill</p>
                                        <div className="text-5xl font-black font-mono text-white tracking-tighter">{selectedPlayer.secondarySkill}</div>
                                        <div className="h-2 w-full bg-white/5 rounded-full mt-6 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${selectedPlayer.secondarySkill}%` }}
                                                className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 mb-12">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Career_Metrics</p>
                                        <div className="flex gap-1">
                                            {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-teal-500" />)}
                                        </div>
                                    </div>
                                    {(() => {
                                        const stats = aggregateStats(selectedPlayer, Object.values(Format));
                                        return (
                                            <div className="grid grid-cols-4 gap-8">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Matches</p>
                                                    <p className="text-3xl font-black font-mono tracking-tighter">{stats.matches}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Runs</p>
                                                    <p className="text-3xl font-black font-mono tracking-tighter text-teal-500">{stats.runs}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Wickets</p>
                                                    <p className="text-3xl font-black font-mono tracking-tighter text-blue-500">{stats.wickets}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Average</p>
                                                    <p className="text-3xl font-black font-mono tracking-tighter">{stats.average.toFixed(1)}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="mt-auto">
                                    {activeTab === 'market' ? (
                                        <button 
                                            onClick={() => handleBuy(selectedPlayer)}
                                            className="w-full bg-white text-black py-8 rounded-[32px] font-black italic text-3xl uppercase tracking-tighter hover:bg-teal-500 transition-all flex items-center justify-center gap-6 shadow-2xl active:scale-[0.98]"
                                        >
                                            <UserPlus className="w-10 h-10" />
                                            <span>Sign Identity // {((selectedPlayer.battingSkill + selectedPlayer.secondarySkill) / 10).toFixed(2)} CR</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleSell(selectedPlayer)}
                                            className="w-full bg-red-500/10 text-red-500 border-2 border-red-500/20 py-8 rounded-[32px] font-black italic text-3xl uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-6 active:scale-[0.98]"
                                        >
                                            <UserMinus className="w-10 h-10" />
                                            <span>Release Identity // {(((selectedPlayer.battingSkill + selectedPlayer.secondarySkill) / 10) * 0.8).toFixed(2)} CR</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                                    <ArrowRightLeft className="w-12 h-12 opacity-20" />
                                </div>
                                <p className="text-2xl font-black uppercase tracking-[0.3em] opacity-20 italic">Select_Identity_For_Analysis</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </>
        )}
    </div>

            {/* Mobile Selection Modal */}
            <AnimatePresence>
                {selectedPlayer && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="lg:hidden fixed inset-0 z-[100] bg-[#050808] p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <div className="bg-teal-500 text-black px-3 py-1 font-black text-[10px] uppercase tracking-widest">IDENTITY_DETAILS</div>
                            <button onClick={() => setSelectedPlayer(null)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8] mb-4">
                                        {selectedPlayer.name.split(' ')[0]}<br/>
                                        <span className="text-teal-500">{selectedPlayer.name.split(' ')[1] || ''}</span>
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${getRoleColor(selectedPlayer.role)} bg-white/10`}>
                                            {selectedPlayer.role}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold opacity-40 uppercase tracking-widest">{selectedPlayer.nationality}</span>
                                    </div>
                                </div>
                                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black italic text-teal-500 leading-none">
                                        {Math.max(selectedPlayer.battingSkill, selectedPlayer.secondarySkill)}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">OVR</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-2">Batting</span>
                                    <div className="text-3xl font-black font-mono text-white">{selectedPlayer.battingSkill}</div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-2">Bowling</span>
                                    <div className="text-3xl font-black font-mono text-white">{selectedPlayer.secondarySkill}</div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 mb-8">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-4">Career_Stats</p>
                                {(() => {
                                    const stats = aggregateStats(selectedPlayer, Object.values(Format));
                                    return (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-[8px] opacity-40 uppercase mb-1">Matches</p>
                                                <p className="text-xl font-black font-mono">{stats.matches}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] opacity-40 uppercase mb-1">Runs</p>
                                                <p className="text-xl font-black font-mono text-teal-500">{stats.runs}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] opacity-40 uppercase mb-1">Wickets</p>
                                                <p className="text-xl font-black font-mono text-blue-500">{stats.wickets}</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="mt-auto pt-8">
                                {activeTab === 'market' ? (
                                    <button 
                                        onClick={() => handleBuy(selectedPlayer)}
                                        className="w-full bg-teal-500 text-black py-6 rounded-3xl font-black italic text-2xl uppercase tracking-tighter shadow-2xl"
                                    >
                                        SIGN // {((selectedPlayer.battingSkill + selectedPlayer.secondarySkill) / 10).toFixed(2)} CR
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleSell(selectedPlayer)}
                                        className="w-full bg-red-500 text-white py-6 rounded-3xl font-black italic text-2xl uppercase tracking-tighter shadow-2xl"
                                    >
                                        RELEASE // {(((selectedPlayer.battingSkill + selectedPlayer.secondarySkill) / 10) * 0.8).toFixed(2)} CR
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transfers;
