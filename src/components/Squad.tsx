import React, { useState, useEffect } from 'react';
import { Player, Team } from '../types';
import { Users, Shield, Zap, Star, ChevronDown, GripVertical, Check } from 'lucide-react';
import { motion, Reorder } from 'motion/react';

interface SquadProps {
  players: Player[];
  team: Team;
  onUpdateTeam: (team: Team) => void;
}

export default function Squad({ players, team, onUpdateTeam }: SquadProps) {
  const [playingXI, setPlayingXI] = useState<Player[]>([]);
  const [reserves, setReserves] = useState<Player[]>([]);

  useEffect(() => {
    const xi = players.filter(p => team.playingXIIds.includes(p.id));
    const res = players.filter(p => !team.playingXIIds.includes(p.id));
    
    // Maintain order for XI if possible
    const orderedXI = team.playingXIIds
      .map(id => xi.find(p => p.id === id))
      .filter((p): p is Player => !!p);

    setPlayingXI(orderedXI);
    setReserves(res);
  }, [players, team.playingXIIds]);

  const togglePlayer = (player: Player) => {
    if (playingXI.find(p => p.id === player.id)) {
      if (playingXI.length > 7) { // Minimum 7 players
        const newXI = playingXI.filter(p => p.id !== player.id);
        setPlayingXI(newXI);
        setReserves([...reserves, player]);
      }
    } else {
      if (playingXI.length < 11) {
        const newRes = reserves.filter(p => p.id !== player.id);
        setReserves(newRes);
        setPlayingXI([...playingXI, player]);
      }
    }
  };

  const handleConfirm = () => {
    onUpdateTeam({
      ...team,
      playingXIIds: playingXI.map(p => p.id)
    });
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-4xl font-black tracking-tighter uppercase italic mb-2">
            Squad <span className="text-accent">Selection</span>
          </h3>
          <p className="text-ink/40 font-mono uppercase tracking-widest text-xs">
            Confirm Final XI ({playingXI.length}/11)
          </p>
        </div>
        <button 
          onClick={handleConfirm}
          className="bg-accent text-bg px-10 py-4 rounded-2xl font-black uppercase tracking-tighter hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all flex items-center gap-2"
        >
          <Check size={20} />
          Confirm Selection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-ink/40">Batting Order</h4>
            <div className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full">
              Drag to Reorder
            </div>
          </div>
          
          <Reorder.Group axis="y" values={playingXI} onReorder={setPlayingXI} className="space-y-3">
            {playingXI.map((player, index) => (
              <Reorder.Item
                key={player.id}
                value={player}
                className="bg-card-bg border border-border p-4 rounded-2xl flex items-center gap-4 group cursor-grab active:cursor-grabbing hover:border-accent/30 transition-colors"
              >
                <div className="text-ink/20 group-hover:text-accent transition-colors">
                  <GripVertical size={20} />
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                  player.role === 'Batsman' ? 'bg-blue-500/20 text-blue-500' :
                  player.role === 'Bowler' ? 'bg-red-500/20 text-red-500' :
                  'bg-accent/20 text-accent'
                }`}>
                  {player.role === 'Batsman' ? 'BT' : player.role === 'Bowler' ? 'BL' : 'AR'}
                </div>
                <div className="font-mono text-sm text-ink/40 w-6">{index + 1}</div>
                <div className="font-bold flex-1">{player.name}</div>
                <button 
                  onClick={() => togglePlayer(player)}
                  className="text-ink/20 hover:text-red-500 transition-colors"
                >
                  <Shield size={18} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        <div className="space-y-8">
          <div className="bg-card-bg border border-border rounded-[32px] p-8 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-ink/40 mb-6">Player Roles</h4>
            <div className="space-y-4">
              {playingXI.slice(0, 5).map(player => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      player.role === 'Batsman' ? 'bg-blue-500/20 text-blue-500' : 'bg-accent/20 text-accent'
                    }`}>
                      {player.role === 'Batsman' ? 'BT' : 'AR'}
                    </div>
                    <div className="font-bold text-sm">{player.name}</div>
                  </div>
                  <ChevronDown size={16} className="text-ink/20" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card-bg border border-border rounded-[32px] p-8 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-ink/40 mb-6">Reserves</h4>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {reserves.map(player => (
                <div 
                  key={player.id}
                  onClick={() => togglePlayer(player)}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-accent/30 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                    player.role === 'Batsman' ? 'bg-blue-500/20 text-blue-500' :
                    player.role === 'Bowler' ? 'bg-red-500/20 text-red-500' :
                    'bg-accent/20 text-accent'
                  }`}>
                    {player.role === 'Batsman' ? 'BT' : player.role === 'Bowler' ? 'BL' : 'AR'}
                  </div>
                  <div className="font-bold flex-1">{player.name}</div>
                  <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Zap size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
