
import React, { useState, useMemo } from 'react';
import { GameData, Player, PlayerRole } from '../types';
import { getRoleColor, getRoleFullName } from '../utils';
import { Icons } from './Icons';

interface PlayerDatabaseProps {
    gameData: GameData;
    onAddPlayer: () => void;
    onViewPlayer: (player: Player) => void;
}

const PlayerDatabase: React.FC<PlayerDatabaseProps> = ({ gameData, onAddPlayer, onViewPlayer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<PlayerRole | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'skill' | 'name'>('skill');
    const [showOnlyForeign, setShowOnlyForeign] = useState(false);

    const filteredPlayers = useMemo(() => {
        return gameData.allPlayers.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
            const matchesForeign = !showOnlyForeign || p.isForeign;
            return matchesSearch && matchesRole && matchesForeign;
        }).sort((a, b) => {
            if (sortBy === 'skill') {
                return (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill);
            }
            return a.name.localeCompare(b.name);
        });
    }, [gameData.allPlayers, searchTerm, roleFilter, sortBy, showOnlyForeign]);

    const groupedPlayers = useMemo(() => {
        // Group by nationality
        const groups: Record<string, Player[]> = {};
        filteredPlayers.forEach(p => {
            const nat = p.nationality || 'Unspecified';
            if (!groups[nat]) groups[nat] = [];
            groups[nat].push(p);
        });

        return groups;
    }, [filteredPlayers]);

    const nationalities = useMemo(() => 
        Object.keys(groupedPlayers).sort((a, b) => a.localeCompare(b))
    , [groupedPlayers]);

    return (
        <div className="h-full flex flex-col bg-[#050808] font-sans text-white overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <div className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-[#0A0F0F]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Icons.Database className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">GLOBAL_TALENT_REGISTRY // v2.0</p>
                        <button 
                            onClick={onAddPlayer}
                            className="glass-button px-4 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group"
                        >
                            <Icons.PlusCircle className="w-3 h-3 text-teal-400 group-hover:scale-125 transition-transform" />
                            Register New Player
                        </button>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8] text-white mb-8">
                        PLAYER<br/>
                        <span className="text-teal-500">DATABASE</span>
                    </h1>

                    <div className="space-y-6">
                        <div className="relative max-w-2xl">
                            <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500/40" />
                            <input 
                                type="text" 
                                placeholder="SEARCH_WORLD_TALENT..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass-input pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest"
                            />
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {(['ALL', ...Object.values(PlayerRole)] as const).map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setRoleFilter(role)}
                                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                            roleFilter === role 
                                            ? 'bg-teal-500 border-teal-500 text-black shadow-lg shadow-teal-500/20' 
                                            : 'bg-white/5 border-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        {role === 'ALL' ? 'WORLD' : getRoleFullName(role as PlayerRole).toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setShowOnlyForeign(!showOnlyForeign)}
                                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                    showOnlyForeign 
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                    : 'bg-white/5 border-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
                                }`}
                            >
                                FOREIGN_ONLY
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Icons.ArrowRightLeft className="w-2.5 h-2.5 text-teal-500" />
                                <span>SORT_BY</span>
                            </div>
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => setSortBy('skill')}
                                    className={`transition-colors ${sortBy === 'skill' ? 'text-teal-400' : 'hover:text-white'}`}
                                >
                                    SKILL_RATING
                                </button>
                                <button 
                                    onClick={() => setSortBy('name')}
                                    className={`transition-colors ${sortBy === 'name' ? 'text-teal-400' : 'hover:text-white'}`}
                                >
                                    ALPHABETICAL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                <div className="max-w-6xl mx-auto space-y-12">
                    {nationalities.length > 0 ? nationalities.map(nat => (
                        <section key={nat} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <h3 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">{nat}</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-teal-500/20 to-transparent" />
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{groupedPlayers[nat].length} ASSETS</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {groupedPlayers[nat].map(player => (
                                    <div 
                                        key={player.id} 
                                        onClick={() => onViewPlayer(player)}
                                        className="glass-card p-5 flex items-center gap-4 border-white/5 hover:border-teal-500/30 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/20 group-hover:bg-teal-500 transition-colors" />
                                        
                                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-teal-500/50 transition-colors">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
                                                alt={player.name}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-black italic uppercase tracking-tight text-white truncate group-hover:text-teal-400 transition-colors">{player.name}</h4>
                                                {player.isForeign && <span className="text-[7px] font-black bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded uppercase tracking-widest border border-blue-500/30">F</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${getRoleColor(player.role)}`}>{player.role}</span>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">SKILL: {player.battingSkill + player.secondarySkill}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <div className="text-lg font-black font-mono text-white/80 group-hover:text-teal-400 transition-colors">
                                                {Math.max(player.battingSkill, player.secondarySkill)}
                                            </div>
                                            <div className="text-[7px] font-black text-white/20 uppercase tracking-widest">RATING</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )) : (
                        <div className="glass-card p-20 text-center">
                            <Icons.Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">No players found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerDatabase;
