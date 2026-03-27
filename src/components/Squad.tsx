import React, { useState } from 'react';
import { Player } from '../types';
import { UserPlus, Shield, Zap, Edit2 } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import PlayerEditor from './PlayerEditor';

interface Props {
  players: Player[];
  onUpdatePlayer: (player: Player) => void;
}

export default function Squad({ players, onUpdatePlayer }: Props) {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const squadLimit = 16;
  const currentSquadSize = players.length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-display tracking-tighter mb-2">Your Squad</h2>
          <p className="text-ink/40 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-teal" />
            Team Management
          </p>
        </div>
        <div className="bg-card-bg border border-border px-6 py-3 rounded-2xl flex items-center gap-4 glow-teal">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-ink/40">Squad Size</div>
            <div className="text-2xl font-display">
              {currentSquadSize}<span className="text-teal">/</span>{squadLimit}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
            <UserPlus size={24} className="text-teal" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map((player) => (
          <div 
            key={player.id}
            className="group bg-card-bg border border-border rounded-3xl p-6 hover:border-teal/50 transition-all hover:translate-y-[-4px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setEditingPlayer(player)}
                className="p-2 bg-teal text-bg rounded-xl shadow-lg hover:scale-110 transition-transform"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="flex gap-6 items-start">
              <PlayerAvatar avatar={player.avatar} size={80} className="shadow-xl" />
              <div className="flex-1 space-y-1">
                <h4 className="text-xl font-display leading-none">{player.name}</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-teal">{player.role}</p>
                <div className="flex gap-4 mt-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-ink/20">Batting</div>
                    <div className="text-lg font-display">{player.batting}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-ink/20">Bowling</div>
                    <div className="text-lg font-display">{player.bowling}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingPlayer && (
        <PlayerEditor 
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSave={(updated) => {
            onUpdatePlayer(updated);
            setEditingPlayer(null);
          }}
        />
      )}
    </div>
  );
}
