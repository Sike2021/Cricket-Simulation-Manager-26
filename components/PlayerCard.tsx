
import React from 'react';
import { motion } from 'motion/react';
import { User, Globe, Zap, Target, Shield } from 'lucide-react';
import { Player, PlayerRole } from '../types';
import { getRoleFullName, getRoleColor } from '../utils';

interface PlayerCardProps {
  player: Player;
  onAction?: (player: Player) => void;
  actionLabel?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onAction, actionLabel }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card rounded-[32px] overflow-hidden border border-white/5 hover:border-teal-500/30 transition-all group flex flex-col h-full"
    >
      <div className="relative h-32 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <User className="w-16 h-16 text-white/5 group-hover:text-teal-500/10 group-hover:scale-110 transition-all duration-700" />
        
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white border border-white/10 backdrop-blur-md ${getRoleColor(player.role)}`}>
          {getRoleFullName(player.role)}
        </div>

        {player.isForeign && (
          <div className="absolute top-4 left-4 p-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-md">
            <Globe className="w-3 h-3 text-blue-400" />
          </div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-teal-400 transition-colors truncate">
            {player.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest">{player.nationality}</span>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[9px] font-mono font-bold text-teal-500/50 uppercase tracking-widest">
              {player.style === 'A' ? 'AGGRESSIVE' : player.style === 'D' ? 'DEFENSIVE' : 'BALANCED'}
            </span>
          </div>
        </div>
        
        <div className="space-y-4 flex-grow">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-2.5 h-2.5 text-teal-500/50" />
                <span className="text-[8px] font-mono font-bold text-white/20 uppercase tracking-widest">BATTING</span>
              </div>
              <span className="text-[10px] font-black italic text-teal-400">{player.battingSkill}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${player.battingSkill}%` }}
                className="h-full bg-gradient-to-r from-teal-600 to-teal-400" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-2.5 h-2.5 text-blue-500/50" />
                <span className="text-[8px] font-mono font-bold text-white/20 uppercase tracking-widest">BOWLING</span>
              </div>
              <span className="text-[10px] font-black italic text-blue-400">{player.secondarySkill}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${player.secondarySkill}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400" 
              />
            </div>
          </div>
        </div>

        {onAction && actionLabel && (
          <button
            onClick={() => onAction(player)}
            className="w-full mt-6 glass-button py-3 text-[10px] font-black uppercase tracking-widest group/btn relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {actionLabel}
              <Zap className="w-3 h-3 text-teal-400 group-hover/btn:animate-pulse" />
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
