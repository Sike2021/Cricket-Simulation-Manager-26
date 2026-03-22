
import React from 'react';
import { motion } from 'motion/react';
import { Player, PlayerRole } from '../types';
import { getRoleColor, getRoleFullName } from '../utils';

interface ModernRatingBoardProps {
  players: Player[];
  title?: string;
}

const ModernRatingBoard: React.FC<ModernRatingBoardProps> = ({ players, title = "PLAYER RATINGS" }) => {
  // Sort players by overall rating
  const sortedPlayers = [...players].sort((a, b) => {
    const ratingA = Math.max(a.battingSkill, a.secondarySkill);
    const ratingB = Math.max(b.battingSkill, b.secondarySkill);
    return ratingB - ratingA;
  });

  return (
    <div className="bg-[#E4E3E0] dark:bg-[#0A0F0F] min-h-full p-4 font-sans text-[#141414] dark:text-[#E4E3E0]">
      {/* Header */}
      <div className="border-b-2 border-[#141414] dark:border-[#E4E3E0] pb-2 mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{title}</h2>
          <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest mt-1">Official Board Performance Metrics // Season 26</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono font-bold">VERIFIED DATA</p>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 bg-[#141414] dark:bg-[#E4E3E0]" />)}
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_80px_60px] gap-2 px-2 py-1 border-b border-[#141414]/20 dark:border-[#E4E3E0]/20 text-[10px] font-mono font-bold opacity-50 uppercase">
        <span>#</span>
        <span>Player</span>
        <span className="text-center">Role</span>
        <span className="text-right">Rating</span>
      </div>

      {/* Player List */}
      <div className="mt-2 space-y-px">
        {sortedPlayers.map((player, index) => {
          const rating = Math.max(player.battingSkill, player.secondarySkill);
          const isHighRating = rating >= 80;
          
          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              key={player.id}
              className="grid grid-cols-[40px_1fr_80px_60px] gap-2 px-2 py-3 border-b border-[#141414]/10 dark:border-[#E4E3E0]/10 hover:bg-[#141414] dark:hover:bg-[#E4E3E0] hover:text-[#E4E3E0] dark:hover:text-[#141414] transition-colors group cursor-pointer"
            >
              <span className="font-mono text-xs opacity-40 group-hover:opacity-100">{(index + 1).toString().padStart(2, '0')}</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight uppercase">{player.name}</span>
                <span className="text-[9px] font-mono opacity-60 group-hover:opacity-100 uppercase">{player.nationality}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className={`text-[9px] font-black px-1.5 py-0.5 border border-current rounded-sm uppercase ${getRoleColor(player.role)} group-hover:text-inherit`}>
                  {player.role.split('_')[0]}
                </span>
              </div>
              <div className="flex items-center justify-end">
                <span className={`font-mono text-lg font-black ${isHighRating ? 'text-teal-500' : ''} group-hover:text-inherit`}>
                  {rating}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Decoration */}
      <div className="mt-8 pt-4 border-t border-[#141414]/20 dark:border-[#E4E3E0]/20 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono opacity-50 uppercase">Total Pool</span>
            <span className="text-xs font-bold">{players.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono opacity-50 uppercase">Elite Tier</span>
            <span className="text-xs font-bold">{players.filter(p => Math.max(p.battingSkill, p.secondarySkill) >= 80).length}</span>
          </div>
        </div>
        <div className="w-12 h-12 border-2 border-[#141414] dark:border-[#E4E3E0] flex items-center justify-center rotate-45">
          <span className="text-[8px] font-black -rotate-45">SIG</span>
        </div>
      </div>
    </div>
  );
};

export default ModernRatingBoard;
