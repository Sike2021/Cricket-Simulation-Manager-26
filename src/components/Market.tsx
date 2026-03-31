import React, { useState } from 'react';
import { Player, Team } from '../types';
import { ShoppingBag, Search, Filter, TrendingUp, ArrowLeftRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PlayerCard = ({ player, selected, onClick, side }: { player: Player, selected: boolean, onClick: () => void, side: 'my' | 'other' }) => (
  <div 
    onClick={onClick}
    className={`bg-card-bg border ${selected ? 'border-accent shadow-[0_0_20px_rgba(0,255,136,0.2)]' : 'border-border'} rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/5 group`}
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold ${selected ? 'text-accent' : 'text-ink/20'}`}>
          {player.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-bold text-sm">{player.name}</div>
          <div className="text-[10px] text-ink/40 uppercase tracking-widest">{player.role}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-black tracking-tighter ${player.rating >= 80 ? 'text-accent' : 'text-ink'}`}>
          {player.rating}
        </div>
        <div className="text-[8px] text-ink/40 uppercase tracking-widest">RATING</div>
      </div>
    </div>
  </div>
);

export default function Market({ myTeam, otherTeams, onSwap }: { myTeam: Team, otherTeams: Team[], onSwap: (myId: string, otherId: string, teamId: string) => void }) {
  const [selectedMyPlayer, setSelectedMyPlayer] = useState<string | null>(null);
  const [selectedOtherPlayer, setSelectedOtherPlayer] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(otherTeams[0]?.id || '');

  const otherTeam = otherTeams.find(t => t.id === selectedTeamId);

  const handleSwapClick = () => {
    if (selectedMyPlayer && selectedOtherPlayer && selectedTeamId) {
      onSwap(selectedMyPlayer, selectedOtherPlayer, selectedTeamId);
      setSelectedMyPlayer(null);
      setSelectedOtherPlayer(null);
    }
  };

  const myPlayer = myTeam.squad.find(p => p.id === selectedMyPlayer);
  const otherPlayer = otherTeam?.squad.find(p => p.id === selectedOtherPlayer);

  return (
    <div className="space-y-8">
      <div className="bg-card-bg border border-border rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="text-accent" size={24} />
            Player Swap Portal
          </h3>
          <div className="flex gap-2">
            {otherTeams.map(team => (
              <button
                key={team.id}
                onClick={() => {
                  setSelectedTeamId(team.id);
                  setSelectedOtherPlayer(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTeamId === team.id 
                    ? 'bg-accent text-bg' 
                    : 'bg-white/5 text-ink/40 hover:bg-white/10'
                }`}
              >
                {team.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 items-center">
          {/* My Team Side */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Your Squad ({myTeam.shortName})</span>
              <span className="text-[10px] font-mono text-accent">SELECT ONE</span>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {myTeam.squad.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  side="my"
                  selected={selectedMyPlayer === player.id}
                  onClick={() => setSelectedMyPlayer(player.id)}
                />
              ))}
            </div>
          </div>

          {/* Swap Indicator */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <ArrowLeftRight size={32} />
            </div>
            <AnimatePresence>
              {selectedMyPlayer && selectedOtherPlayer && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSwapClick}
                  className="bg-accent text-bg px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all"
                >
                  Confirm Swap
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Other Team Side */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/40">{otherTeam?.name} Squad</span>
              <span className="text-[10px] font-mono text-accent">SELECT ONE</span>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {otherTeam?.squad.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  side="other"
                  selected={selectedOtherPlayer === player.id}
                  onClick={() => setSelectedOtherPlayer(player.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Swap Preview */}
        {(myPlayer || otherPlayer) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 pt-8 border-t border-border grid grid-cols-2 gap-8"
          >
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <div className="text-[10px] text-ink/40 uppercase tracking-widest mb-4">Giving Away</div>
              {myPlayer ? (
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">{myPlayer.name}</div>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono">{myPlayer.rating}</div>
                </div>
              ) : (
                <div className="text-ink/20 italic">Select a player from your squad</div>
              )}
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <div className="text-[10px] text-ink/40 uppercase tracking-widest mb-4">Receiving</div>
              {otherPlayer ? (
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-2xl font-bold">{otherPlayer.name}</div>
                    <div className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-xs font-mono">{otherPlayer.rating}</div>
                  </div>
                  {otherPlayer.rating >= 80 && (
                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp size={10} /> -10cr Next Year Budget (Great Player Penalty)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-ink/20 italic">Select a player from {otherTeam?.shortName}</div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Budget Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-border p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-ink/40 text-xs uppercase tracking-widest mb-1">Current Budget</div>
            <div className="text-2xl font-black tracking-tighter text-accent">${(myTeam.budget / 1000000).toFixed(1)}M</div>
          </div>
          <ShoppingBag className="text-accent opacity-20" size={32} />
        </div>
        <div className="bg-card-bg border border-border p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-ink/40 text-xs uppercase tracking-widest mb-1">Next Year Penalty</div>
            <div className="text-2xl font-black tracking-tighter text-red-500">-${(myTeam.nextYearBudgetReduction / 1000000).toFixed(1)}M</div>
          </div>
          <TrendingUp className="text-red-500 opacity-20" size={32} />
        </div>
      </div>
    </div>
  );
}
