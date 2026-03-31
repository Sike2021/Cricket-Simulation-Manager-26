import React, { useState } from 'react';
import { Player, Team } from '../types';
import { ChevronDown, Filter, Search } from 'lucide-react';

export default function Stats({ teams }: { teams: Team[] }) {
  const [selectedTeam, setSelectedTeam] = useState<string>('All Teams');
  const [searchQuery, setSearchQuery] = useState('');

  const allPlayers = teams.flatMap(t => t.squad);
  const filteredPlayers = allPlayers.filter(p => {
    const matchesTeam = selectedTeam === 'All Teams' || teams.find(t => t.id === selectedTeam)?.squad.some(sp => sp.id === p.id);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const getRoleAbbr = (role: string) => {
    switch (role) {
      case 'Batsman': return 'BT';
      case 'Bowler': return 'BL';
      case 'All-rounder': return 'AR';
      case 'Wicketkeeper': return 'WK';
      default: return 'SB';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#0F171A] min-h-screen text-ink font-sans pb-20 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Player Database</h2>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <select 
              className="w-full bg-[#1A262B] border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none italic text-ink"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option>All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40" size={14} />
          </div>
          <button className="bg-[#1A262B] p-3 rounded-xl">
            <Filter size={18} className="text-accent" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={16} />
          <input 
            type="text"
            placeholder="Search players..."
            className="w-full bg-[#1A262B] border-none rounded-xl py-3 pl-12 pr-4 text-xs font-bold italic placeholder:text-ink/10 text-ink"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-ink/20 italic border-b border-white/5">
              <th className="pb-4 px-2">Role</th>
              <th className="pb-4">Name</th>
              <th className="pb-4 text-center">Rating</th>
              <th className="pb-4 text-center">Age</th>
              <th className="pb-4 text-center">Fitness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-4 px-2">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    player.role === 'All-rounder' ? 'bg-accent/20 text-accent' :
                    player.role === 'Batsman' ? 'bg-blue-500/20 text-blue-400' :
                    player.role === 'Bowler' ? 'bg-red-500/20 text-red-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {getRoleAbbr(player.role)}
                  </span>
                </td>
                <td className="py-4">
                  <div className="text-xs font-black italic tracking-tight">{player.name}</div>
                </td>
                <td className="py-4 text-center">
                  <div className="text-xs font-black italic text-accent">{player.rating}</div>
                </td>
                <td className="py-4 text-center">
                  <div className="text-[10px] font-bold text-ink/40">{player.age}</div>
                </td>
                <td className="py-4 text-center">
                  <div className="text-[10px] font-bold text-green-400">{player.fitness}%</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
