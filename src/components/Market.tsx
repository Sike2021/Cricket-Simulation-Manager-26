import React from 'react';
import { Player } from '../types';
import { ShoppingBag, Search, Filter, TrendingUp } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';

const MarketPlayerCard = ({ player, onBuy }: { player: Player, onBuy: () => void }) => (
  <div className="bg-card-bg/40 border border-border rounded-[32px] p-8 hover:border-teal/30 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 blur-3xl -mr-16 -mt-16 group-hover:bg-teal/10 transition-all" />
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-bg border border-border flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
          <PlayerAvatar avatar={player.avatar} size={80} />
        </div>
        <div>
          <div className="text-2xl font-display tracking-tight">{player.name}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal">{player.role}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-display text-teal tracking-tighter">${(player.value / 1000000).toFixed(1)}M</div>
        <div className="text-[10px] font-black text-ink/40 uppercase tracking-widest">Market Value</div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
      <div className="bg-bg/50 border border-border/50 rounded-2xl p-4 text-center">
        <div className="text-[10px] text-ink/40 font-black uppercase tracking-widest mb-1">Batting</div>
        <div className="text-xl font-display">{player.batting}</div>
      </div>
      <div className="bg-bg/50 border border-border/50 rounded-2xl p-4 text-center">
        <div className="text-[10px] text-ink/40 font-black uppercase tracking-widest mb-1">Bowling</div>
        <div className="text-xl font-display">{player.bowling}</div>
      </div>
      <div className="bg-bg/50 border border-border/50 rounded-2xl p-4 text-center">
        <div className="text-[10px] text-ink/40 font-black uppercase tracking-widest mb-1">Form</div>
        <div className="text-xl font-display text-teal">{player.form}</div>
      </div>
    </div>

    <button 
      onClick={onBuy}
      className="w-full bg-teal text-bg py-5 rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-teal/20 transition-all active:scale-95"
    >
      <ShoppingBag size={18} />
      Sign Player
    </button>
  </div>
);

interface MarketProps {
  players: Player[];
  onBuyPlayer: (player: Player) => void;
}

export default function Market({ players, onBuyPlayer }: MarketProps) {
  return (
    <div className="p-6 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input 
            type="text" 
            placeholder="Search global market..." 
            className="w-full bg-card-bg/50 border border-border rounded-2xl py-5 pl-14 pr-6 focus:border-teal/50 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-card-bg border border-border px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-card-bg border border-border px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-colors">
            <TrendingUp size={18} /> Sort
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {players.map(player => (
          <MarketPlayerCard 
            key={player.id} 
            player={player} 
            onBuy={() => onBuyPlayer(player)}
          />
        ))}
      </div>
    </div>
  );
}
