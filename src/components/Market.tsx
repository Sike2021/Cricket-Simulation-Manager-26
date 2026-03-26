import React, { useState } from 'react';
import { Player, Team } from '../types';
import { ShoppingBag, Search, Filter, TrendingUp, Gavel, ArrowRightLeft } from 'lucide-react';
import { PLAYERS, TEAMS } from '../data';
import AuctionView from './AuctionView';

interface MarketProps {
  myTeam: Team;
  allPlayers: Player[];
  onUpdateTeam: (team: Team) => void;
  onUpdatePlayers: (players: Player[]) => void;
}

const MarketPlayerCard = ({ player, onBuy, canAfford }: { player: Player, onBuy: (p: Player) => void, canAfford: boolean }) => (
  <div className="bg-card-bg border border-border rounded-[32px] p-8 hover:border-accent/30 transition-all group">
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

    <button 
      onClick={() => onBuy(player)}
      disabled={!canAfford}
      className="w-full bg-accent text-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
    >
      <ShoppingBag size={18} />
      {canAfford ? 'Make Offer' : 'Insufficient Funds'}
    </button>
  </div>
);

export default function Market({ myTeam, allPlayers, onUpdateTeam, onUpdatePlayers }: MarketProps) {
  const [view, setView] = useState<'auction' | 'transfer'>('auction');
  const [auctionIndex, setAuctionIndex] = useState(0);

  const auctionPool = allPlayers.filter(p => !p.teamId);

  const handleAuctionBuy = (player: Player, price: number) => {
    const updatedPlayer = { ...player, teamId: myTeam.id };
    const updatedPlayers = allPlayers.map(p => p.id === player.id ? updatedPlayer : p);
    
    const updatedTeam = {
      ...myTeam,
      budget: myTeam.budget - price,
      squad: [...myTeam.squad, updatedPlayer]
    };

    onUpdatePlayers(updatedPlayers);
    onUpdateTeam(updatedTeam);
    setAuctionIndex(prev => prev + 1);
  };

  const handleAuctionSkip = () => {
    setAuctionIndex(prev => prev + 1);
  };

  const handleTransferBuy = (player: Player) => {
    if (myTeam.budget >= player.value) {
      handleAuctionBuy(player, player.value);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-center mb-12">
        <div className="bg-white/5 p-2 rounded-[24px] border border-border flex gap-2">
          <button
            onClick={() => setView('auction')}
            className={`px-8 py-3 rounded-2xl font-black uppercase tracking-tighter flex items-center gap-2 transition-all ${
              view === 'auction' ? 'bg-accent text-bg' : 'text-ink/40 hover:text-ink'
            }`}
          >
            <Gavel size={18} />
            Auction
          </button>
          <button
            onClick={() => setView('transfer')}
            className={`px-8 py-3 rounded-2xl font-black uppercase tracking-tighter flex items-center gap-2 transition-all ${
              view === 'transfer' ? 'bg-accent text-bg' : 'text-ink/40 hover:text-ink'
            }`}
          >
            <ArrowRightLeft size={18} />
            Transfer Market
          </button>
        </div>
      </div>

      {view === 'auction' ? (
        <AuctionView 
          players={auctionPool} 
          myTeam={myTeam} 
          onBuy={handleAuctionBuy} 
          onSkip={handleAuctionSkip} 
          currentIndex={auctionIndex} 
        />
      ) : (
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
            {allPlayers.filter(p => p.teamId && p.teamId !== myTeam.id).map(player => (
              <MarketPlayerCard 
                key={player.id} 
                player={player} 
                onBuy={handleTransferBuy} 
                canAfford={myTeam.budget >= player.value}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
