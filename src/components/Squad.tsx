import React, { useState } from 'react';
import { Player } from '../types';
import { Activity, Shield, Zap, Heart, GripVertical, Check } from 'lucide-react';
import { motion, Reorder } from 'motion/react';

const PlayerRoleBadge = ({ role }: { role: string }) => {
  const colors: Record<string, string> = {
    'BT': 'bg-blue-500/20 text-blue-500',
    'WK': 'bg-teal-500/20 text-teal-500',
    'BL': 'bg-purple-500/20 text-purple-500',
    'SB': 'bg-red-500/20 text-red-500',
    'AR': 'bg-orange-500/20 text-orange-500'
  };
  const shortRole = role === 'Batsman' ? 'BT' : role === 'Bowler' ? 'BL' : role === 'Wicketkeeper' ? 'WK' : 'AR';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${colors[shortRole] || 'bg-white/10 text-ink/40'}`}>
      {shortRole}
    </span>
  );
};

export default function Squad({ players }: { players: Player[] }) {
  const [items, setItems] = useState(players);

  const finalXI = items.slice(0, 11);
  const reserves = items.slice(11);

  return (
    <div className="max-w-md mx-auto bg-[#0F171A] min-h-screen text-ink font-sans pb-20 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Squad Selection <span className="text-accent">(16/16)</span></h2>
          <p className="text-accent text-[10px] font-bold uppercase tracking-widest italic mt-1">Confirm Final XI</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Final XI */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 italic">Batting</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 italic">Player Roles</span>
          </div>
          
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
            {finalXI.map((player, index) => (
              <Reorder.Item 
                key={player.id} 
                value={player}
                className="bg-[#1A262B] border border-white/5 rounded-xl p-3 flex items-center gap-4 group cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-[10px] font-black text-ink/20 italic w-4">{index + 1}</div>
                  <PlayerRoleBadge role={player.role} />
                  <div className="font-bold text-sm">{player.name}</div>
                </div>
                <div className="flex items-center gap-4">
                  <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none text-ink/40 hover:text-accent transition-colors">
                    <option>{player.role}</option>
                  </select>
                  <GripVertical size={16} className="text-ink/10 group-hover:text-accent transition-colors" />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Reserves */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-ink/40 italic px-2">Reserves</h3>
          <div className="space-y-2 opacity-60">
            {reserves.map((player) => (
              <div key={player.id} className="bg-[#1A262B] border border-white/5 rounded-xl p-3 flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-4" />
                  <PlayerRoleBadge role={player.role} />
                  <div className="font-bold text-sm">{player.name}</div>
                </div>
                <GripVertical size={16} className="text-ink/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <button className="w-full bg-accent text-bg py-5 rounded-3xl font-black uppercase tracking-tighter italic text-lg hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2 mt-8">
          Confirm Selection
        </button>
      </div>
    </div>
  );
}
