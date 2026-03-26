import React, { useState } from 'react';
import { Player, Team } from '../types';
import { ShoppingBag, X, ChevronRight, Trophy, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuctionViewProps {
  players: Player[];
  myTeam: Team;
  onBuy: (player: Player, price: number) => void;
  onSkip: () => void;
  currentIndex: number;
}

export default function AuctionView({ players, myTeam, onBuy, onSkip, currentIndex }: AuctionViewProps) {
  const currentPlayer = players[currentIndex];

  if (!currentPlayer) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Trophy size={64} className="text-accent mb-4 opacity-20" />
        <h3 className="text-2xl font-bold mb-2">Auction Completed</h3>
        <p className="text-ink/40">All players in this pool have been auctioned.</p>
      </div>
    );
  }

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (myTeam.budget >= currentPlayer.value) {
      onBuy(currentPlayer, currentPlayer.value);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSkip();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Live Auction</h3>
          <p className="text-ink/40">Player {currentIndex + 1} of {players.length}</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 px-6 py-3 rounded-2xl flex items-center gap-3">
          <DollarSign size={20} className="text-accent" />
          <div className="text-xl font-black text-accent tracking-tighter">
            ${(myTeam.budget / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-card-bg border border-border rounded-[40px] p-12 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShoppingBag size={200} />
          </div>

          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="w-full md:w-64 h-64 bg-white/5 rounded-[32px] flex items-center justify-center text-7xl font-black text-accent/20">
              {currentPlayer.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div className="flex-1 space-y-8">
              <div>
                <div className="text-sm text-accent font-mono uppercase tracking-[0.2em] mb-2">{currentPlayer.role}</div>
                <h2 className="text-5xl font-black tracking-tighter">{currentPlayer.name}</h2>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <div className="text-[10px] text-ink/40 uppercase tracking-widest mb-2">BATTING</div>
                  <div className="text-3xl font-black">{currentPlayer.batting}</div>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <div className="text-[10px] text-ink/40 uppercase tracking-widest mb-2">BOWLING</div>
                  <div className="text-3xl font-black">{currentPlayer.bowling}</div>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <div className="text-[10px] text-ink/40 uppercase tracking-widest mb-2">FITNESS</div>
                  <div className="text-3xl font-black text-yellow-500">{currentPlayer.fitness}%</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleBuy}
                  disabled={myTeam.budget < currentPlayer.value}
                  className="flex-1 bg-accent text-bg h-20 rounded-[24px] font-black uppercase tracking-tighter text-xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <ShoppingBag size={24} />
                  Buy for ${(currentPlayer.value / 1000000).toFixed(1)}M
                </button>
                <button
                  onClick={handleSkip}
                  className="px-10 h-20 bg-white/5 border border-border rounded-[24px] font-black uppercase tracking-tighter text-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <X size={24} />
                  Skip
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
