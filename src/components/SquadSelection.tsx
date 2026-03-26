import React, { useState } from 'react';
import { Player, PlayerRoleSelection } from '../types';
import { Users, CheckCircle2, GripVertical, UserPlus, Shield } from 'lucide-react';
import { motion, Reorder } from 'motion/react';

interface SquadSelectionProps {
  squad: Player[];
  onConfirm: (selection: PlayerRoleSelection[]) => void;
}

export default function SquadSelection({ squad, onConfirm }: SquadSelectionProps) {
  const [items, setItems] = useState(squad);
  const [selections, setSelections] = useState<Record<string, 'BT' | 'BL' | 'WK' | 'AR'>>({});

  const playingXI = items.slice(0, 11);
  const reserves = items.slice(11);

  const handleRoleChange = (playerId: string, role: 'BT' | 'BL' | 'WK' | 'AR') => {
    setSelections(prev => ({ ...prev, [playerId]: role }));
  };

  const handleConfirm = () => {
    const finalSelection: PlayerRoleSelection[] = playingXI.map((p, i) => ({
      playerId: p.id,
      role: selections[p.id] || (p.role === 'Batsman' ? 'BT' : p.role === 'Bowler' ? 'BL' : p.role === 'Wicketkeeper' ? 'WK' : 'AR'),
      position: i + 1
    }));
    onConfirm(finalSelection);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">
            Squad <span className="text-accent">Selection</span>
            <span className="ml-4 text-xl text-ink/40 font-mono">({squad.length}/16)</span>
          </h2>
          <p className="text-ink/40">Drag to reorder. Top 11 will be your Playing XI.</p>
        </div>
        <button 
          onClick={handleConfirm}
          className="bg-accent text-bg px-8 py-4 rounded-2xl font-black uppercase tracking-tighter flex items-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all"
        >
          <CheckCircle2 size={20} />
          Confirm Final XI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Playing XI List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-accent mb-4">
            <Shield size={14} /> Playing XI (Batting Order)
          </div>
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
            {items.map((player, index) => (
              <Reorder.Item 
                key={player.id} 
                value={player}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  index < 11 
                    ? 'bg-card-bg border-border hover:border-accent/30' 
                    : 'bg-white/5 border-transparent opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={20} className="text-ink/20 cursor-grab active:cursor-grabbing" />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold ${index < 11 ? 'bg-accent text-bg' : 'bg-white/10 text-ink/40'}`}>
                    {index + 1}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-accent">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold">{player.name}</div>
                    <div className="text-[10px] text-ink/40 uppercase tracking-widest">{player.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(['BT', 'BL', 'WK', 'AR'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(player.id, role)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                        (selections[player.id] || (player.role === 'Batsman' ? 'BT' : player.role === 'Bowler' ? 'BL' : player.role === 'Wicketkeeper' ? 'WK' : 'AR')) === role
                          ? 'bg-accent text-bg'
                          : 'bg-white/5 text-ink/40 hover:bg-white/10'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Roles Summary */}
        <div className="space-y-8">
          <div className="bg-card-bg border border-border rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users size={20} className="text-accent" />
              Team Balance
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Batsmen', count: playingXI.filter(p => (selections[p.id] || p.role) === 'BT' || p.role === 'Batsman').length, target: 5 },
                { label: 'Bowlers', count: playingXI.filter(p => (selections[p.id] || p.role) === 'BL' || p.role === 'Bowler').length, target: 4 },
                { label: 'All-rounders', count: playingXI.filter(p => (selections[p.id] || p.role) === 'AR' || p.role === 'All-rounder').length, target: 1 },
                { label: 'Wicketkeeper', count: playingXI.filter(p => (selections[p.id] || p.role) === 'WK' || p.role === 'Wicketkeeper').length, target: 1 },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                    <span>{stat.label}</span>
                    <span className={stat.count >= stat.target ? 'text-accent' : 'text-yellow-500'}>
                      {stat.count} / {stat.target}+
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stat.count / stat.target) * 100, 100)}%` }}
                      className={`h-full ${stat.count >= stat.target ? 'bg-accent' : 'bg-yellow-500'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
              <UserPlus size={20} />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-sm text-ink/60">
              <li className="flex gap-2">• Ensure you have at least one Wicketkeeper.</li>
              <li className="flex gap-2">• Balanced teams usually have 5 batsmen and 4 bowlers.</li>
              <li className="flex gap-2">• Drag your best openers to the top of the list.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
