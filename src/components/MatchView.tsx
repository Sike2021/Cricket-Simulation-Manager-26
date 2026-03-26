import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Team } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Shield, Zap, Info, Sliders, History } from 'lucide-react';

export default function MatchView({ battingTeam, bowlingTeam, onComplete }: { battingTeam: Team, bowlingTeam: Team, onComplete: () => void }) {
  const [aggression, setAggression] = useState(50);
  const [intensity, setIntensity] = useState(50);
  const { balls, currentBallIndex, isSimulating, score, recentBalls, startSimulation, currentBall } = useSimulation(battingTeam, bowlingTeam, aggression, intensity);

  return (
    <div className="space-y-8">
      {/* Main Scoreboard */}
      <div className="bg-card-bg border border-border rounded-[40px] p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-accent rounded-full" />
        </div>

        <div className="text-center mb-8 relative z-10">
          <div className="text-xs font-black text-accent uppercase tracking-[0.4em] mb-2">Match Simulation V2.0</div>
          <div className="text-5xl font-black tracking-tighter text-white">
            {battingTeam.shortName} <span className="text-accent">{score.runs}/{score.wickets}</span>
          </div>
          <div className="text-sm text-ink/40 font-mono mt-1">({score.overs}.{score.balls} Overs)</div>
        </div>

        {/* Players Display */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
              {currentBall?.batsman.split(' ').map(n => n[0]).join('') || 'BT'}
            </div>
            <div>
              <div className="font-bold text-sm">{currentBall?.batsman || 'Active Batsman'}</div>
              <div className="text-xs text-accent font-mono">{currentBall?.runs || 0}* <span className="text-ink/40">(12)</span></div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
              {currentBall?.bowler.split(' ').map(n => n[0]).join('') || 'BL'}
            </div>
            <div>
              <div className="font-bold text-sm">{currentBall?.bowler || 'Active Bowler'}</div>
              <div className="text-xs text-blue-500 font-mono">0/12 <span className="text-ink/40">(2.4)</span></div>
            </div>
          </div>
        </div>

        {/* Big Event Display */}
        <AnimatePresence mode="wait">
          {currentBall && (
            <motion.div 
              key={currentBallIndex}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.5, rotate: 10 }}
              className="text-center py-6 relative z-10"
            >
              <div className={`text-8xl font-black italic tracking-tighter uppercase ${currentBall.isWicket ? 'text-red-500' : currentBall.runs >= 4 ? 'text-accent' : 'text-white'}`}>
                {currentBall.isWicket ? 'OUT!' : currentBall.runs === 6 ? 'SIX!' : currentBall.runs === 4 ? 'FOUR!' : currentBall.runs}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Over Log */}
        <div className="mt-8 relative z-10">
          <div className="text-[10px] font-black text-ink/40 uppercase tracking-widest mb-3 flex items-center gap-2">
            <History size={12} /> Recent Over Log
          </div>
          <div className="flex gap-2">
            {recentBalls.map((r, i) => (
              <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${r === 4 || r === 6 ? 'bg-accent text-bg border-accent' : 'bg-white/5 border-white/10 text-ink/60'}`}>
                {r}
              </div>
            ))}
            {[...Array(6 - recentBalls.length)].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-border rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Sliders size={16} className="text-accent" /> Batting Aggression
            </h3>
            <span className="text-accent font-mono font-bold">{aggression}%</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={aggression}
            onChange={(e) => setAggression(parseInt(e.target.value))}
            className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-ink/40 font-bold uppercase tracking-widest">
            <span>Defensive</span>
            <span>Ultra Aggressive</span>
          </div>
        </div>

        <div className="bg-card-bg border border-border rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Sliders size={16} className="text-blue-500" /> Bowling Intensity
            </h3>
            <span className="text-blue-500 font-mono font-bold">{intensity}%</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full accent-blue-500 bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-ink/40 font-bold uppercase tracking-widest">
            <span>Conservative</span>
            <span>All Out Attack</span>
          </div>
        </div>
      </div>

      {!isSimulating && balls.length === 0 && (
        <button 
          onClick={startSimulation}
          className="w-full bg-accent text-bg py-6 rounded-3xl text-2xl font-black uppercase tracking-tighter hover:shadow-[0_0_50px_rgba(0,255,136,0.5)] transition-all flex items-center justify-center gap-3"
        >
          <Zap size={24} /> Start Match Simulation
        </button>
      )}

      {/* Commentary */}
      <div className="bg-card-bg border border-border rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
          <Activity size={20} className="text-accent" />
          Live Commentary
        </h3>
        <div className="space-y-4 max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20">
          {balls.slice(0, currentBallIndex).reverse().map((ball, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="font-mono font-bold text-accent">{ball.over}.{ball.ball}</div>
              <div>
                <span className="font-bold">{ball.batsman}</span> to <span className="font-bold">{ball.bowler}</span>, {ball.runs} runs. {ball.commentary}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
