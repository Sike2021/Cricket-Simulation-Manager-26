import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Team, Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Shield, Zap, Info, ChevronLeft, Play, Pause, FastForward } from 'lucide-react';

export default function MatchView({ battingTeam, bowlingTeam, onComplete }: { battingTeam: Team, bowlingTeam: Team, onComplete: () => void }) {
  const [aggression, setAggression] = useState(50);
  const [intensity, setIntensity] = useState(50);
  const { balls, currentBallIndex, isSimulating, score, startSimulation, currentBall, strikerIndex, nonStrikerIndex } = useSimulation(battingTeam, bowlingTeam, aggression, intensity);

  const target = 220; // Mock target for "KINGS Chase"
  const runsRequired = target - score.runs;
  const ballsRemaining = 120 - (score.overs * 6 + score.balls);
  const oversRemaining = (ballsRemaining / 6).toFixed(1);

  const striker = battingTeam.squad[strikerIndex] || battingTeam.squad[0];
  const nonStriker = battingTeam.squad[nonStrikerIndex] || battingTeam.squad[1];
  const activeBatsmen = [striker, nonStriker];

  const getBatterStats = (name: string) => {
    const batterBalls = balls.filter(b => b.batsman === name);
    const runs = batterBalls.reduce((acc, b) => acc + b.runs, 0);
    return { runs, balls: batterBalls.length };
  };

  const bowlingRotation = bowlingTeam.squad.filter(p => p.role === 'Bowler' || p.role === 'All-rounder').slice(0, 2);

  const recentBalls = balls.slice(Math.max(0, balls.length - 6));

  return (
    <div className="max-w-md mx-auto bg-[#0F171A] min-h-screen text-ink font-sans pb-20">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <button onClick={onComplete} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] italic">Match Engine Simulation</h2>
        <div className="w-10" />
      </div>

      <div className="p-6 space-y-6">
        {/* Scoreboard Card */}
        <div className="bg-[#1A262B] border border-accent/20 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="text-center space-y-1 mb-6">
            <div className="text-accent text-3xl font-black tracking-tighter uppercase italic">Target {target}</div>
            <div className="text-ink/40 text-[10px] font-bold uppercase tracking-widest">({battingTeam.shortName} Chase)</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-accent text-5xl font-black tracking-tighter italic">{battingTeam.shortName}</span>
              <span className="text-5xl font-black tracking-tighter italic">{score.runs}/{score.wickets}</span>
            </div>
            <div className="text-ink/40 text-sm font-mono font-bold">({score.overs}.{score.balls} Overs)</div>
          </div>
        </div>

        {/* Target Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1A262B] border border-white/5 rounded-2xl p-4 text-center">
            <div className="text-[10px] text-ink/40 font-bold uppercase tracking-widest mb-1">Runs Required</div>
            <div className="text-2xl font-black italic">{runsRequired}</div>
          </div>
          <div className="bg-[#1A262B] border border-white/5 rounded-2xl p-4 text-center">
            <div className="text-[10px] text-ink/40 font-bold uppercase tracking-widest mb-1">Overs Remaining</div>
            <div className="text-2xl font-black italic">{oversRemaining}</div>
          </div>
        </div>

        <div className="text-center text-[10px] text-ink/40 font-bold uppercase tracking-widest px-4">
          {battingTeam.name} won the toss to play the team second innings.
        </div>

        {/* Active Batsmen */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
            <div className="w-1 h-4 bg-accent rounded-full" />
            Active Batsmen
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {activeBatsmen.map((player, i) => (
              <div key={player.id} className="bg-[#1A262B] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/${player.id}/40/40`} alt="" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{player.name} {player.role === 'Batsman' ? 'BT' : 'AR'}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-black italic">{getBatterStats(player.name).runs}{i === 0 ? '*' : ''}</span>
                    <span className="text-[10px] text-ink/40 font-mono">{getBatterStats(player.name).balls}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bowling Rotation */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
            <div className="w-1 h-4 bg-accent rounded-full" />
            Bowling Rotation
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {bowlingRotation.map((player, i) => (
              <div key={player.id} className="bg-[#1A262B] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/${player.id}/40/40`} alt="" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{player.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-black italic">1</span>
                    <span className="text-[10px] text-ink/40 font-mono">13</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Over Log */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
            <div className="w-1 h-4 bg-accent rounded-full" />
            Recent Over Log
          </h3>
          <div className="flex gap-2">
            {recentBalls.map((ball, i) => (
              <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic border border-white/5 ${
                ball.runs === 4 ? 'bg-accent text-bg' : ball.runs === 6 ? 'bg-purple-500 text-white' : ball.isWicket ? 'bg-red-500 text-white' : 'bg-white/5 text-ink'
              }`}>
                {ball.isWicket ? 'W' : ball.runs}
              </div>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest italic">Batting Aggression Slider</span>
              <span className="text-[10px] font-mono text-accent">1-100</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={aggression}
              onChange={(e) => setAggression(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest italic">Bowling Intensity Slider</span>
              <span className="text-[10px] font-mono text-accent">1-100</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="pt-8 flex justify-center gap-6">
          {!isSimulating && balls.length === 0 ? (
            <button 
              onClick={startSimulation}
              className="bg-accent text-bg px-12 py-4 rounded-2xl text-lg font-black uppercase tracking-tighter italic hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all flex items-center gap-2"
            >
              <Play size={20} fill="currentColor" />
              Start Match
            </button>
          ) : (
            <div className="flex gap-4">
              <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-ink/40 hover:text-accent transition-colors">
                <Pause size={24} fill="currentColor" />
              </button>
              <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-ink/40 hover:text-accent transition-colors">
                <FastForward size={24} fill="currentColor" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Event Overlay */}
      <AnimatePresence>
        {currentBall && (currentBall.runs >= 4 || currentBall.isWicket) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-8xl font-black italic tracking-tighter text-accent drop-shadow-[0_0_30px_rgba(0,255,136,0.5)] uppercase"
              >
                {currentBall.isWicket ? 'Wicket!' : currentBall.runs === 4 ? 'Four!' : 'Six!'}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
