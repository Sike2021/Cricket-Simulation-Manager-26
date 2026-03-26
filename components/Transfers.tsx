import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowRightLeft, Search, Filter, TrendingUp, UserPlus, 
    UserMinus, Shield, Zap, Target, Wallet, Info, 
    ChevronRight, Gavel, X, TrendingDown, Activity,
    Trophy, Star, Briefcase, Globe
} from 'lucide-react';
import { GameData, Player, Team, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, getPlayerById, aggregateStats } from '../utils';

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
    const [activeTab, setActiveTab] = useState<'market' | 'squad'>('market');

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
        const price = ((player.battingSkill + player.secondarySkill) / 10) * 0.8; // 20% tax
        
        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => {
                    if (t.id === userTeam.id) {
                        return { ...t, purse: Number((t.purse + price).toFixed(2)), squad: t.squad.filter(p => p.id !== player.id) };
                    }
                    return t;
                })
            };
        });
        showFeedback(`Sold ${player.name} for ${price.toFixed(2)} Cr`, "success");
        setSelectedPlayer(null);
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ArrowRightLeft className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">MARKET_EXCHANGE // LIVE</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            TRANSFER<br/>
                            <span className="text-teal-500">PORTAL</span>
                        </h1>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border-teal-500/20 flex flex-col items-end min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="w-3 h-3 text-teal-500" />
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">AVAILABLE_PURSE</p>
                        </div>
                        <p className="text-4xl font-black font-mono text-teal-400 tracking-tighter">
                            {userTeam?.purse.toFixed(2)}<span className="text-sm ml-1 opacity-40">CR</span>
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 mt-8">
                    <button 
                        onClick={() => setActiveTab('market')}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'market' 
                            ? 'bg-teal-500 text-[#050808] shadow-[0_0_20px_rgba(45,212,191,0.3)]' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                    >
                        TRANSFER MARKET
                    </button>
                    <button 
                        onClick={() => setActiveTab('squad')}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'squad' 
                            ? 'bg-teal-500 text-[#050808] shadow-[0_0_20px_rgba(45,212,191,0.3)]' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                    >
                        MY SQUAD
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {activeTab === 'market' && (
                        <>
                            {/* Search & Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-500 transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder="SEARCH_PLAYER_DATABASE..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-mono tracking-wider placeholder:text-white/10"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                    {['ALL', 'BAT', 'BOWL', 'AR', 'WK'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => setRoleFilter(role as any)}
                                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                roleFilter === role 
                                                ? 'bg-teal-500 text-[#050808]' 
                                                : 'glass-card text-white/40 hover:bg-white/10'
                                            }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Market Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredMarket.map((player) => (
                                        <motion.div
                                            key={player.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            onClick={() => setSelectedPlayer(player)}
                                            className="glass-card p-6 rounded-[32px] group cursor-pointer hover:border-teal-500/50 transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <TrendingUp className="w-24 h-24 -mr-6 -mt-6" />
                                            </div>

                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${getRoleColor(player.role)}`}>
                                                        {getRoleFullName(player.role)}
                                                    </p>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-teal-400 transition-colors">
                                                        {player.name}
                                                    </h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">VALUATION</p>
                                                    <p className="text-xl font-black font-mono text-teal-400">
                                                        {((player.battingSkill + player.secondarySkill) / 10).toFixed(2)}<span className="text-[10px] ml-1">CR</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">BATTING</p>
                                                    <p className="text-lg font-black font-mono">{player.battingSkill}</p>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">SECONDARY</p>
                                                    <p className="text-lg font-black font-mono">{player.secondarySkill}</p>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between relative z-10">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star 
                                                            key={s} 
                                                            className={`w-2 h-2 ${s <= Math.ceil((player.battingSkill + player.secondarySkill) / 40) ? 'text-teal-500 fill-teal-500' : 'text-white/10'}`} 
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 text-teal-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">NEGOTIATE</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </>
                    )}

                    {activeTab === 'squad' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {userTeam?.squad.map((player) => (
                                    <motion.div
                                        key={player.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setSelectedPlayer(player)}
                                        className="glass-card p-6 rounded-[32px] group cursor-pointer hover:border-red-500/30 transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Briefcase className="w-24 h-24 -mr-6 -mt-6" />
                                        </div>

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${getRoleColor(player.role)}`}>
                                                    {getRoleFullName(player.role)}
                                                </p>
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-red-400 transition-colors">
                                                    {player.name}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">RESALE_VAL</p>
                                                <p className="text-xl font-black font-mono text-red-400">
                                                    {(((player.battingSkill + player.secondarySkill) / 10) * 0.8).toFixed(2)}<span className="text-[10px] ml-1">CR</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 relative z-10">
                                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">BATTING</p>
                                                <p className="text-lg font-black font-mono">{player.battingSkill}</p>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">SECONDARY</p>
                                                <p className="text-lg font-black font-mono">{player.secondarySkill}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-2 text-white/40">
                                                <Activity className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">CONTRACT_ACTIVE</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <span className="text-[10px] font-black uppercase tracking-widest">TERMINATE</span>
                                                <UserMinus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Negotiation Modal */}
            <AnimatePresence>
                {selectedPlayer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPlayer(null)}
                            className="absolute inset-0 bg-[#050808]/90 backdrop-blur-xl"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="glass-card w-full max-w-2xl rounded-[40px] overflow-hidden relative z-10 border-white/10"
                        >
                            <div className="p-8 md:p-12">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getRoleColor(selectedPlayer.role)} bg-white/5`}>
                                                {getRoleFullName(selectedPlayer.role)}
                                            </span>
                                            <span className="text-[10px] font-mono text-white/20 tracking-widest">ID: {selectedPlayer.id.slice(0, 8)}</span>
                                        </div>
                                        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                            {selectedPlayer.name}
                                        </h2>
                                        <p className="text-white/40 text-sm font-medium">Elite Professional Athlete // Tier 1 Status</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedPlayer(null)}
                                        className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                    <div className="space-y-6">
                                        <div className="glass-card p-6 rounded-3xl border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">BATTING_SKILL</p>
                                                <p className="text-2xl font-black font-mono">{selectedPlayer.battingSkill}</p>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedPlayer.battingSkill}%` }}
                                                    className="h-full bg-teal-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="glass-card p-6 rounded-3xl border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">SECONDARY_SKILL</p>
                                                <p className="text-2xl font-black font-mono">{selectedPlayer.secondarySkill}</p>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedPlayer.secondarySkill}%` }}
                                                    className="h-full bg-teal-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-card p-8 rounded-3xl border-teal-500/20 bg-teal-500/5 flex flex-col justify-center items-center text-center">
                                        <Gavel className="w-12 h-12 text-teal-500 mb-4" />
                                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">NEGOTIATED_FEE</p>
                                        <p className="text-5xl font-black font-mono text-teal-400 tracking-tighter">
                                            {activeTab === 'market' 
                                                ? ((selectedPlayer.battingSkill + selectedPlayer.secondarySkill) / 10).toFixed(2)
                                                : (((selectedPlayer.battingSkill + selectedPlayer.secondarySkill) / 10) * 0.8).toFixed(2)
                                            }<span className="text-xl ml-1">CR</span>
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-teal-500/60 uppercase tracking-widest">
                                            <Info className="w-3 h-3" />
                                            <span>Includes Agency Fees & Taxes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setSelectedPlayer(null)}
                                        className="flex-1 py-6 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 transition-all"
                                    >
                                        CANCEL_OFFER
                                    </button>
                                    {activeTab === 'market' ? (
                                        <button 
                                            onClick={() => handleBuy(selectedPlayer)}
                                            className="flex-[2] py-6 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] bg-teal-500 text-[#050808] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all flex items-center justify-center gap-3"
                                        >
                                            <UserPlus className="w-5 h-5" />
                                            CONFIRM_SIGNING
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleSell(selectedPlayer)}
                                            className="flex-[2] py-6 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] bg-red-500 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-3"
                                        >
                                            <UserMinus className="w-5 h-5" />
                                            CONFIRM_SALE
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transfers;
