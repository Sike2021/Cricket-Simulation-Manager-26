import React from 'react';
import { Player } from '../types';
import { ShoppingBag, Search, Filter, TrendingUp } from 'lucide-react';
import { PLAYERS } from '../data';

const MarketPlayerCard = ({ player }: { player: Player }) => (
  <div className="bg-card-bg border border-border rounded-3xl p-8 hover:border-accent/30 transition-all group">
    <div className="flex justify-between items-start mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl font-black text-accent/20 group-hover:text-accent transition-colors">
          {player.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="text-xl font-bold">{player.name}</div>
          <div className="text-sm text-ink/40 uppercase tracking-widest">{player.role}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-black text-accent tracking-tighter">${(player.value / 1000000).toFixed(1)}M</div>
        <div className="text-[10px] text-ink/40 uppercase tracking-widest">MARKET VALUE</div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white/5 rounded-2xl p-4 text-center">
        <div className="text-xs text-ink/40 uppercase tracking-widest mb-1">BATTING</div>
        <div className="text-xl font-bold">{player.batting}</div>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 text-center">
        <div className="text-xs text-ink/40 uppercase tracking-widest mb-1">BOWLING</div>
        <div className="text-xl font-bold">{player.bowling}</div>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 text-center">
        <div className="text-xs text-ink/40 uppercase tracking-widest mb-1">FORM</div>
        <div className="text-xl font-bold text-yellow-500">{player.form}</div>
      </div>
    </div>

    <button className="w-full bg-accent text-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all">
      <ShoppingBag size={18} />
      Make Offer
    </button>
  </div>
);

export default function Market() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input 
            type="text" 
            placeholder="Search players..." 
            className="w-full bg-card-bg border border-border rounded-2xl py-4 pl-12 pr-4 focus:border-accent/50 outline-none transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-border px-6 py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-border px-6 py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors">
            <TrendingUp size={18} /> Sort
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {PLAYERS.map(player => (
          <MarketPlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
