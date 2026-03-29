import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Team } from '../types';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Activity, Shield, Zap, Info, GripVertical, Play, Pause, RotateCcw } from 'lucide-react';

export default function MatchView({ battingTeam, bowlingTeam, onComplete }: { battingTeam: Team, bowlingTeam: Team, onComplete: () => void }) {
  const { 
    balls, 
    isSimulating, 
    score, 
    startSimulation, 
    pauseSimulation,
    resetSimulation,
    currentBall,
    battingOrder,
    setBattingOrder,
    battingAggression,
    setBattingAggression,
    bowlingIntensity,
    setBowlingIntensity,
    simSpeed,
    setSimSpeed
  } = useSimulation(battingTeam, bowlingTeam);

  const recentBalls = balls.slice(-6);

  return (
    <div className="space-y-8">
      {/* Live Stadium Visuals */}
      <div className="bg-card-bg border border-border rounded-[40px] p-8 relative overflow-hidden glow-teal">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay blur-sm pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex justify-between items-center mb-12 relative z-10">
          <div className="flex items-center gap-6">
            <img src={battingTeam.logo} alt={battingTeam.name} className="w-20 h-20 rounded-3xl border border-border" referrerPolicy="no-referrer" />
            <div>
              <div className="text-3xl font-display uppercase tracking-tighter">{battingTeam.shortName}</div>
              <div className="text-accent font-mono text-xs uppercase tracking-widest">BATTING</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-6xl font-display tracking-tighter mb-1">
              {score.runs}<span className="text-accent">/</span>{score.wickets}
            </div>
            <div className="text-lg text-ink/60 font-mono uppercase tracking-widest">
              OVERS: {score.overs}.{score.balls}
            </div>
          </div>

          <div className="flex items-center gap-6 text-right">
            <div>
              <div className="text-3xl font-display uppercase tracking-tighter">{bowlingTeam.shortName}</div>
              <div className="text-blue-500 font-mono text-xs uppercase tracking-widest">BOWLING</div>
            </div>
            <img src={bowlingTeam.logo} alt={bowlingTeam.name} className="w-20 h-20 rounded-3xl border border-border" referrerPolicy="no-referrer" />
          </div>
        </div>

        {/* Recent Over Log */}
        <div className="flex justify-center gap-2 mb-8 relative z-10">
          {recentBalls.map((ball, i) => (
            <div 
              key={i} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                ball.isWicket 
                  ? 'bg-red-500/20 border-red-500 text-red-500' 
                  : ball.runs === 6 
                    ? 'bg-accent/20 border-accent text-accent' 
                    : ball.runs === 4 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                      : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              {ball.isWicket ? 'W' : ball.runs}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - recentBalls.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10 rounded-full border border-white/5 bg-white/5" />
          ))}
        </div>

        {/* Simulation Controls */}
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            {(['BALL', 'OVER', 'INNING', 'MATCH'] as const).map(speed => (
              <button
                key={speed}
                onClick={() => setSimSpeed(speed)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                  simSpeed === speed ? 'bg-accent text-bg' : 'text-ink/40 hover:text-ink'
                }`}
              >
                {speed}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            {isSimulating ? (
              <button onClick={pauseSimulation} className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-colors">
                <Pause size={20} /> Pause
              </button>
            ) : (
              <button onClick={startSimulation} className="bg-accent text-bg px-8 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all">
                <Play size={20} /> Simulate
              </button>
            )}
            <button onClick={resetSimulation} className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-colors">
              <RotateCcw size={20} /> Reset
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentBall && (
            <motion.div 
              key={balls.length}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-6 relative z-10 text-center"
            >
              <div className="text-lg italic text-ink/80">
                "{currentBall.commentary}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tactical Controls */}
        <div className="bg-card-bg border border-border rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            Tactics
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-ink/60">Batting Aggression</span>
                <span className="font-mono text-accent">{battingAggression}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={battingAggression} 
                onChange={(e) => setBattingAggression(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-ink/60">Bowling Intensity</span>
                <span className="font-mono text-blue-500">{bowlingIntensity}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={bowlingIntensity} 
                onChange={(e) => setBowlingIntensity(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Draggable Batting Order */}
        <div className="bg-card-bg border border-border rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            Batting Order
          </h3>
          <Reorder.Group axis="y" values={battingOrder} onReorder={setBattingOrder} className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {battingOrder.map((player, index) => (
              <Reorder.Item key={player.id} value={player} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-grab active:cursor-grabbing">
                <GripVertical size={16} className="text-ink/20" />
                <div className="w-6 text-xs font-mono text-ink/40">{index + 1}</div>
                <div className="font-medium text-sm">{player.name}</div>
                <div className="ml-auto text-xs text-ink/40">{player.role}</div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Live Commentary */}
        <div className="bg-card-bg border border-border rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Info size={18} className="text-blue-500" />
            Commentary
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {balls.slice().reverse().map((ball, i) => (
              <div key={i} className="text-sm border-b border-white/5 pb-3">
                <div className="font-mono text-accent text-xs mb-1">{ball.over}.{ball.ball}</div>
                <div><span className="font-bold">{ball.batsman}</span> to <span className="font-bold">{ball.bowler}</span>, {ball.runs} runs.</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
