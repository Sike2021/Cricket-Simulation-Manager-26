import React from 'react';
import { Player } from '../types';
import { Activity, Shield, Zap, Heart } from 'lucide-react';

const PlayerCard = ({ player }: { player: Player }) => (
  <div className="bg-card-bg border border-border rounded-2xl p-6 hover:border-accent/50 transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl font-black text-accent/20 group-hover:text-accent transition-colors">
        {player.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="text-right">
        <div className="text-xs text-ink/40 uppercase tracking-widest mb-1">{player.role}</div>
        <div className="text-xl font-bold">{player.name}</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Zap size={12} /> Batting
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${player.batting}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Shield size={12} /> Bowling
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${player.bowling}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Heart size={12} /> Fitness
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-red-500" style={{ width: `${player.fitness}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Activity size={12} /> Form
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500" style={{ width: `${player.form}%` }} />
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-border">
      <div className="text-sm font-mono text-ink/60">VALUE</div>
      <div className="text-lg font-bold text-accent">${(player.value / 1000000).toFixed(1)}M</div>
    </div>
  </div>
);

export default function Squad({ players }: { players: Player[] }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Active Squad ({players.length})</h3>
        <button className="bg-accent text-bg px-6 py-2 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
          Manage Lineup
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
