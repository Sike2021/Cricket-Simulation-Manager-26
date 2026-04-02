
import React from 'react';
import { Player, PlayerRole, Format } from '../types';
import { getRoleFullName, aggregateStats } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerCardProps {
  player: Player;
  onAction?: (player: Player) => void;
  actionLabel?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onAction, actionLabel }) => {
  const stats = aggregateStats(player, Object.values(Format));

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg hover:border-blue-500 transition-all flex flex-col">
      <div className="p-4 flex items-center gap-4 bg-slate-800/50 border-b border-slate-700">
        <PlayerAvatar player={player} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate text-white">{player.name}</h3>
          <div className="flex items-center gap-2 text-xs font-medium mt-1">
            <span className="text-slate-400 uppercase tracking-wider">{getRoleFullName(player.role)}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{player.nationality}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Batting</div>
            <div className="text-xl font-mono font-black text-blue-400">{player.battingSkill}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Bowling</div>
            <div className="text-xl font-mono font-black text-red-400">{player.secondarySkill}</div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3 grid grid-cols-3 gap-2 text-center mb-4">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Runs</div>
            <div className="font-mono text-sm font-bold text-white">{stats.runs}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Avg</div>
            <div className="font-mono text-sm font-bold text-white">{stats.average.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">SR</div>
            <div className="font-mono text-sm font-bold text-white">{stats.strikeRate.toFixed(1)}</div>
          </div>
        </div>

        {onAction && actionLabel && (
          <button
            onClick={() => onAction(player)}
            className="mt-auto w-full bg-slate-700 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
