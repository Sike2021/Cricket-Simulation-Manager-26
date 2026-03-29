
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
        <div className="h-full flex flex-col bg-white dark:bg-[#0A0F0F] font-sans text-gray-900 dark:text-white overflow-hidden">
            <header className="p-6 bg-white dark:bg-[#0A0F0F] border-b border-gray-100 dark:border-white/10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Player <span className="text-teal-600">Registry</span></h2>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">GLOBAL_TALENT_DATABASE</p>
                    </div>
                    <button 
                        onClick={onAddPlayer}
                        className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-2xl shadow-xl shadow-teal-600/20 transition-all active:scale-95"
                        title="Add New Player"
                    >
                        <Icons.PlusCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                        <input 
                            type="text" 
                            placeholder="SEARCH_WORLD_TALENT..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-teal-600 rounded-3xl text-xs font-black uppercase tracking-widest outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {(['ALL', ...Object.values(PlayerRole)] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                                        roleFilter === role 
                                        ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20' 
                                        : 'bg-gray-50 dark:bg-white/5 border-transparent opacity-40 hover:opacity-100'
                                    }`}
                                >
                                    {role === 'ALL' ? 'WORLD' : getRoleFullName(role as PlayerRole).toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowOnlyForeign(!showOnlyForeign)}
                            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                                showOnlyForeign 
                                ? 'bg-teal-600 border-teal-600 text-white' 
                                : 'bg-gray-50 dark:bg-white/5 border-transparent opacity-40 hover:opacity-100'
                            }`}
                        >
                            FOREIGN ✈️
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40 pt-2 border-t border-gray-100 dark:border-white/10">
                        <span>SORT_BY</span>
                        <div className="flex gap-6">
                            <button 
                                onClick={() => setSortBy('skill')}
                                className={sortBy === 'skill' ? 'text-teal-600 opacity-100' : 'hover:opacity-100'}
                            >
                                SKILL
                            </button>
                            <button 
                                onClick={() => setSortBy('name')}
                                className={sortBy === 'name' ? 'text-teal-600 opacity-100' : 'hover:opacity-100'}
                            >
                                NAME
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-12 scrollbar-hide">
                {nationalities.length > 0 ? nationalities.map(nat => (
                    <div key={nat} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">{nat}</h3>
                            <div className="h-px bg-gray-100 dark:bg-white/10 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {groupedPlayers[nat].map(player => (
                                <div 
                                    key={player.id}
                                    onClick={() => onViewPlayer(player)}
                                    className="group bg-gray-50 dark:bg-white/5 border-2 border-transparent hover:border-teal-600 p-5 rounded-[32px] flex items-center justify-between transition-all cursor-pointer hover:shadow-2xl hover:shadow-teal-600/10"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                                            {player.role === PlayerRole.WICKET_KEEPER ? '🧤' : player.role === PlayerRole.BATSMAN ? '🏏' : '⚾'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black uppercase tracking-tighter leading-none mb-2 group-hover:text-teal-600 transition-colors">{player.name}</p>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${getRoleColor(player.role)}`}>
                                                    {getRoleFullName(player.role).toUpperCase()}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{player.style === 'A' ? 'AGGRESSIVE' : player.style === 'D' ? 'DEFENSIVE' : 'BALANCED'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-teal-600 font-mono leading-none mb-1">{Math.max(player.battingSkill, player.secondarySkill)}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">RATING</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-white/10 flex items-center justify-center group-hover:border-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                            <Icons.ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                        <Icons.Database className="w-16 h-16 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-widest">NO_PLAYERS_FOUND</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerDatabase;
