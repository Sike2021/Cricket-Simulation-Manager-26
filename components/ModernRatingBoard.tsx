
import React from 'react';
import { motion } from 'motion/react';
import { Player, PlayerRole, Format } from '../types';
import { getRoleColor } from '../utils';

interface ModernRatingBoardProps {
  players: Player[];
  title?: string;
  currentFormat?: Format;
}

const calculatePerformanceRating = (player: Player, format: Format = Format.T20): number => {
  const stats = player.stats[format];
  const skillRating = Math.max(player.battingSkill, player.secondarySkill);
  
  if (!stats || stats.matches === 0) return skillRating;

  let performanceScore = 0;
  
  // Batting Performance (0-100)
  const battingScore = (stats.average * 1.2) + (stats.strikeRate / 2.5);
  
  // Bowling Performance (0-100)
  const bowlingScore = (stats.wickets / stats.matches * 30) + (Math.max(0, 10 - stats.economy) * 7);
  
  if (player.role === PlayerRole.BATSMAN || player.role === PlayerRole.WICKET_KEEPER) {
    performanceScore = battingScore;
  } else if (player.role === PlayerRole.FAST_BOWLER || player.role === PlayerRole.SPIN_BOWLER) {
    performanceScore = bowlingScore;
  } else {
    performanceScore = (battingScore + bowlingScore) / 1.6;
  }

  // Blend skill with performance (60% performance, 40% skill)
  const finalRating = (performanceScore * 0.6) + (skillRating * 0.4);
  return Math.min(99, Math.max(40, Math.round(finalRating)));
};

const getRatingColor = (rating: number) => {
  if (rating >= 95) return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]';
  if (rating >= 90) return 'text-yellow-400';
  if (rating >= 85) return 'text-purple-500';
  if (rating >= 80) return 'text-teal-400';
  if (rating >= 70) return 'text-orange-400';
  return 'text-slate-400';
};

const ModernRatingBoard: React.FC<ModernRatingBoardProps> = ({ players, title = "PERFORMANCE BOARD", currentFormat = Format.T20 }) => {
  // Sort players by performance rating
  const playersWithPR = players.map(p => ({
    ...p,
    pr: calculatePerformanceRating(p, currentFormat)
  }));

  const sortedPlayers = [...playersWithPR].sort((a, b) => b.pr - a.pr);

  // Calculate dynamic stats for the header
  const avgBatting = Math.round(players.reduce((acc, p) => acc + p.battingSkill, 0) / players.length) || 0;
  const avgBowling = Math.round(players.reduce((acc, p) => acc + p.secondarySkill, 0) / players.length) || 0;
  const avgStrength = Math.round((avgBatting + avgBowling) / 2);
  const stars = Math.min(5, Math.max(1, Math.floor(avgStrength / 15)));

  return (
    <div className="bg-[#E4E3E0] dark:bg-[#041414] min-h-full p-6 font-sans text-gray-900 dark:text-[#E4E3E0]">
      {/* Board Ratings Header */}
      <div className="glass-card mb-8 relative p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
            Board <span className="text-white/40 not-italic">Ratings</span>
          </h2>
          <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-lg text-sm font-bold text-white">
            Season 1
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="subcard-glass">
            <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest mb-1">Strength</p>
            <p className="text-2xl font-black text-white">{avgStrength}</p>
          </div>
          <div className="subcard-glass">
            <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest mb-1">Bowling</p>
            <p className="text-2xl font-black text-white">{avgBowling}</p>
          </div>
          <div className="subcard-glass">
            <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest mb-1">Batting</p>
            <p className="text-2xl font-black text-white">{avgBatting}</p>
          </div>
          <div className="subcard-glass">
            <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest mb-1">Stars</p>
            <p className="text-2xl font-black text-white">{stars}</p>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_80px_70px] gap-4 px-4 py-2 bg-white/5 border-y border-white/10 text-[10px] font-mono font-bold text-teal-500 uppercase tracking-widest">
        <span>Rank</span>
        <span>Player Identity</span>
        <span className="text-center">Class</span>
        <span className="text-right">P-Rating</span>
      </div>

      {/* Player List */}
      <div className="mt-4 space-y-2">
        {sortedPlayers.slice(0, 50).map((player, index) => {
          const ratingColor = getRatingColor(player.pr);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              key={player.id}
              className="grid grid-cols-[40px_1fr_80px_70px] gap-4 px-4 py-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-green-50 dark:hover:bg-white/[0.05] hover:border-green-600/30 transition-all group cursor-pointer relative overflow-hidden rounded-lg"
            >
              {/* Rank Background Decoration */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-4xl font-black opacity-[0.03] dark:opacity-[0.03] italic pointer-events-none text-green-600">
                {index + 1}
              </div>

              <div className="flex items-center">
                <span className="font-mono text-xs font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base tracking-tight uppercase group-hover:text-green-600 transition-colors">
                    {player.name}
                  </span>
                  {player.isForeign && (
                    <span className="text-[8px] border border-gray-300 dark:border-white/20 px-1 rounded-sm opacity-50">INTL</span>
                  )}
                </div>
                <span className="text-[9px] font-mono opacity-40 uppercase tracking-wider">{player.nationality}</span>
              </div>

              <div className="flex items-center justify-center">
                <span className={`text-[9px] font-black px-2 py-1 bg-white/5 border border-gray-200 dark:border-white/10 rounded-sm uppercase tracking-tighter ${getRoleColor(player.role)}`}>
                  {player.role}
                </span>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-right">
                  <span className={`font-mono text-2xl font-black italic leading-none ${ratingColor}`}>
                    {player.pr}
                  </span>
                  <div className="h-1 w-full bg-gray-200 dark:bg-white/10 mt-1 overflow-hidden rounded-full">
                    <div 
                      className={`h-full transition-all duration-1000 ${ratingColor.replace('text-', 'bg-')}`} 
                      style={{ width: `${player.pr}%` }} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Decoration */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Database Size</span>
            <span className="text-lg font-black italic">#{players.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Format Focus</span>
            <span className="text-lg font-black italic text-green-600">{currentFormat}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[8px] font-mono opacity-40 uppercase">System Status</p>
                <p className="text-[10px] font-bold text-green-600">ENCRYPTED_FEED</p>
            </div>
            <div className="w-10 h-10 bg-green-600 flex items-center justify-center skew-x-[-12deg] shadow-lg shadow-green-500/20">
              <span className="text-[10px] font-black text-white -skew-x-[-12deg]">SIG</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRatingBoard;
