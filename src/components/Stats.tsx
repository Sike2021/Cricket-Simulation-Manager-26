import React from 'react';
import { Player, PlayerRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PlayerAvatar from './PlayerAvatar';

export default function Stats({ players }: { players: Player[] }) {
  const battingData = players
    .filter(p => p.role !== PlayerRole.BOWLER)
    .map(p => ({ name: p.name, runs: p.stats.runs }))
    .sort((a, b) => b.runs - a.runs);

  const bowlingData = players
    .filter(p => p.role !== PlayerRole.BATSMAN)
    .map(p => ({ name: p.name, wickets: p.stats.wickets }))
    .sort((a, b) => b.wickets - a.wickets);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-bg border border-border rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-accent rounded-full" />
            Top Run Scorers
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={battingData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#151515', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="runs" radius={[0, 4, 4, 0]} barSize={20}>
                  {battingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#00ff88' : 'rgba(0,255,136,0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card-bg border border-border rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-500 rounded-full" />
            Leading Wicket Takers
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bowlingData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#151515', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="wickets" radius={[0, 4, 4, 0]} barSize={20}>
                  {bowlingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : 'rgba(59,130,246,0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card-bg border border-border rounded-3xl p-8 overflow-x-auto">
        <h3 className="text-xl font-bold mb-8">Detailed Player Statistics</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-ink/40 uppercase tracking-widest border-b border-border">
              <th className="pb-4 font-medium">Player</th>
              <th className="pb-4 font-medium">Matches</th>
              <th className="pb-4 font-medium">Runs</th>
              <th className="pb-4 font-medium">Wickets</th>
              <th className="pb-4 font-medium">Average</th>
              <th className="pb-4 font-medium">Strike Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.map(player => (
              <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-4">
                    <PlayerAvatar avatar={player.avatar} size="md" />
                    <div>
                      <div className="font-bold">{player.name}</div>
                      <div className="text-xs text-ink/40">{player.role}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 font-mono">{player.stats.matches}</td>
                <td className="py-4 font-mono">{player.stats.runs}</td>
                <td className="py-4 font-mono">{player.stats.wickets}</td>
                <td className="py-4 font-mono">{player.stats.average}</td>
                <td className="py-4 font-mono">{player.stats.strikeRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
