import React, { useState } from 'react';
import { Player } from '../types';
import { ShoppingBag, Search, Filter, TrendingUp, SkipForward, Gavel, ArrowRightLeft } from 'lucide-react';
import { PLAYERS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

const MarketPlayerCard = ({ player, onBuy }: { player: Player, onBuy: (p: Player) => void }) => (
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

    <button 
      onClick={() => onBuy(player)}
      className="w-full bg-accent text-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all"
    >
      <ShoppingBag size={18} />
      Make Offer
    </button>
  </div>
);

export default function Market() {
  const [mode, setMode] = useState<'auction' | 'transfer'>('auction');
  const [auctionIndex, setAuctionIndex] = useState(0);
  const [mySquad, setMySquad] = useState<Player[]>([]);
  const [budget, setBudget] = useState(50000000);

  const currentAuctionPlayer = PLAYERS[auctionIndex];

  const handleAuctionAction = (action: 'buy' | 'skip') => {
    if (action === 'buy' && currentAuctionPlayer) {
      if (budget >= currentAuctionPlayer.value) {
        setBudget(prev => prev - currentAuctionPlayer.value);
        setMySquad(prev => [...prev, currentAuctionPlayer]);
      } else {
        alert("Insufficient budget!");
        return;
      }
    }
    
    // Increment index only once
    if (auctionIndex < PLAYERS.length - 1) {
      setAuctionIndex(prev => prev + 1);
    } else {
      alert("Auction completed!");
    }
  };

  const handleTransferBuy = (player: Player) => {
    if (budget >= player.value) {
      setBudget(prev => prev - player.value);
      setMySquad(prev => [...prev, player]);
      alert(`${player.name} added to your squad!`);
    } else {
      alert("Insufficient budget!");
    }
  };

  return (
    <div className="space-y-12">
      {/* Mode Switcher */}
      <div className="flex gap-4 bg-card-bg p-2 rounded-3xl border border-border w-fit mx-auto">
        <button 
          onClick={() => setMode('auction')}
          className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${mode === 'auction' ? 'bg-accent text-bg shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'text-ink/60 hover:text-ink'}`}
        >
          <Gavel size={18} /> Auction
        </button>
        <button 
          onClick={() => setMode('transfer')}
          className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${mode === 'transfer' ? 'bg-accent text-bg shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'text-ink/60 hover:text-ink'}`}
        >
          <ArrowRightLeft size={18} /> Transfer
        </button>
      </div>

      <div className="flex justify-between items-center bg-card-bg p-6 rounded-3xl border border-border">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm text-ink/40 uppercase tracking-widest">Available Budget</div>
            <div className="text-3xl font-black tracking-tighter">${(budget / 1000000).toFixed(1)}M</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-ink/40 uppercase tracking-widest">Squad Size</div>
          <div className="text-3xl font-black tracking-tighter">{mySquad.length}<span className="text-ink/20">/16</span></div>
        </div>
      </div>

      {mode === 'auction' ? (
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {currentAuctionPlayer ? (
              <motion.div
                key={currentAuctionPlayer.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-card-bg border border-border rounded-[40px] p-12 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-accent/20">
                  <motion.div 
                    className="h-full bg-accent" 
                    initial={{ width: 0 }}
                    animate={{ width: `${((auctionIndex + 1) / PLAYERS.length) * 100}%` }}
                  />
                </div>

                <div className="text-xs font-mono text-accent mb-4 uppercase tracking-[0.3em]">Current Lot #{auctionIndex + 1}</div>
                <div className="w-32 h-32 rounded-[40px] bg-white/5 mx-auto mb-8 flex items-center justify-center text-5xl font-black text-accent/20">
                  {currentAuctionPlayer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-4xl font-black tracking-tighter mb-2">{currentAuctionPlayer.name}</h3>
                <p className="text-xl text-ink/40 uppercase tracking-widest mb-12">{currentAuctionPlayer.role}</p>

                <div className="grid grid-cols-2 gap-6 mb-12">
                  <div className="bg-white/5 rounded-3xl p-6">
                    <div className="text-xs text-ink/40 uppercase tracking-widest mb-2">Base Price</div>
                    <div className="text-3xl font-black text-accent">${(currentAuctionPlayer.value / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6">
                    <div className="text-xs text-ink/40 uppercase tracking-widest mb-2">Batting Rating</div>
                    <div className="text-3xl font-black">{currentAuctionPlayer.batting}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleAuctionAction('skip')}
                    className="flex-1 bg-white/5 border border-border py-6 rounded-3xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                  >
                    <SkipForward size={24} /> Skip Player
                  </button>
                  <button 
                    onClick={() => handleAuctionAction('buy')}
                    className="flex-1 bg-accent text-bg py-6 rounded-3xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:shadow-[0_0_50px_rgba(0,255,136,0.3)] transition-all"
                  >
                    <Gavel size={24} /> Buy Player
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-card-bg border border-border rounded-[40px]">
                <div className="text-6xl mb-6">🏆</div>
                <h3 className="text-3xl font-black tracking-tighter mb-4">Auction Complete</h3>
                <p className="text-ink/40 mb-8">You have built your squad. Ready for the season?</p>
                <button 
                  onClick={() => setAuctionIndex(0)}
                  className="bg-accent text-bg px-12 py-4 rounded-2xl font-bold uppercase tracking-widest"
                >
                  Restart Auction
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PLAYERS.map(player => (
            <MarketPlayerCard key={player.id} player={player} onBuy={handleTransferBuy} />
          ))}
        </div>
      )}
    </div>
  );
}
