import React, { useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { useSimulation } from '../hooks/useSimulation';
import { Team, Player } from '../types';
import { Play, SkipForward, FastForward, RotateCcw, GripVertical, Trophy, Users, Zap, CheckCircle2 } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';

interface Props {
  battingTeam: Team;
  bowlingTeam: Team;
  onComplete: () => void;
}

export default function MatchView({ battingTeam, bowlingTeam, onComplete }: Props) {
  const [aggression, setAggression] = useState(50);
  const [intensity, setIntensity] = useState(50);
  const [battingOrder, setBattingOrder] = useState<Player[]>(battingTeam.squad);

  const {
    balls,
    currentBallIndex,
    isSimulating,
    score,
    simulateNext,
    startSimulation,
    isComplete,
    currentBall
  } = useSimulation(battingTeam, bowlingTeam, { aggression, intensity, battingOrder });

  const recentBalls = balls.slice(Math.max(0, currentBallIndex - 6), currentBallIndex);

  return (
    <div className="relative min-h-[calc(100vh-120px)] p-6 overflow-hidden">
      {/* Stadium Visuals */}
      <div className="stadium-bg" />
      <div className="stadium-silhouette" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left: Tactics & Lineup */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg/80 backdrop-blur-xl border border-border rounded-3xl p-6 glow-teal">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-teal mb-6 flex items-center gap-2">
              <Zap size={16} />
              Tactical Control
            </h3>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-ink/60">Batting Aggression</span>
                  <span className="text-teal">{aggression}%</span>
                </div>
                <input 
                  type="range" 
                  value={aggression} 
                  onChange={(e) => setAggression(parseInt(e.target.value))}
                  className="w-full accent-teal h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-ink/60">Bowling Intensity</span>
                  <span className="text-accent">{intensity}%</span>
                </div>
                <input 
                  type="range" 
                  value={intensity} 
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full accent-accent h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-card-bg/80 backdrop-blur-xl border border-border rounded-3xl p-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-ink/40 mb-6 flex items-center gap-2">
              <Users size={16} />
              Batting Order
            </h3>
            <Reorder.Group axis="y" values={battingOrder} onReorder={setBattingOrder} className="space-y-2">
              {battingOrder.map((player) => (
                <Reorder.Item 
                  key={player.id} 
                  value={player}
                  className="bg-white/5 border border-border p-3 rounded-xl flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                >
                  <GripVertical size={16} className="text-ink/20" />
                  <PlayerAvatar avatar={player.avatar} size={32} />
                  <div className="flex-1">
                    <div className="text-sm font-bold">{player.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-ink/40">{player.role}</div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>

        {/* Middle: Live Match */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card-bg/80 backdrop-blur-xl border border-border rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
            {/* Score Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
              <div className="text-center md:text-left">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-teal mb-2">Current Score</div>
                <div className="text-7xl font-display leading-none">
                  {score.runs}<span className="text-teal">/</span>{score.wickets}
                </div>
              </div>
              
              <div className="h-16 w-px bg-border hidden md:block" />

              <div className="text-center md:text-right">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-ink/40 mb-2">Overs Completed</div>
                <div className="text-5xl font-display leading-none">
                  {score.overs}<span className="text-2xl text-ink/20">.{score.balls}</span>
                </div>
              </div>
            </div>

            {/* Commentary/Visual Area */}
            <div className="bg-black/40 rounded-3xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center border border-white/5">
              {currentBall ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={currentBallIndex}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="px-4 py-1 bg-teal/20 text-teal rounded-full text-xs font-black uppercase tracking-widest">
                      {currentBall.over}.{currentBall.ball}
                    </div>
                    <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${currentBall.isWicket ? 'bg-red-500 text-white' : 'bg-accent/20 text-accent'}`}>
                      {currentBall.isWicket ? 'WICKET' : `${currentBall.runs} RUNS`}
                    </div>
                  </div>
                  <p className="text-2xl font-medium leading-relaxed max-w-xl mx-auto italic">
                    "{currentBall.commentary}"
                  </p>
                  <div className="text-xs font-bold uppercase tracking-widest text-ink/40">
                    {currentBall.batsman} vs {currentBall.bowler}
                  </div>
                </motion.div>
              ) : (
                <div className="text-ink/20 font-display text-4xl">Ready to Play</div>
              )}
            </div>

            {/* Recent Over Log */}
            <div className="mt-8 flex justify-center gap-3">
              {[...Array(6)].map((_, i) => {
                const ball = recentBalls[i];
                return (
                  <div 
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${
                      ball ? (
                        ball.isWicket ? 'bg-red-500 border-red-400 text-white' : 
                        ball.runs === 4 ? 'bg-teal border-teal/50 text-bg' :
                        ball.runs === 6 ? 'bg-accent border-accent/50 text-bg' :
                        'bg-white/10 border-white/20 text-ink/60'
                      ) : 'bg-white/5 border-white/5 text-ink/10'
                    }`}
                  >
                    {ball ? (ball.isWicket ? 'W' : ball.runs) : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="bg-card-bg/80 backdrop-blur-xl border border-border rounded-3xl p-4 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={startSimulation}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
              title="Reset Match"
            >
              <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
            </button>

            <div className="h-8 w-px bg-border mx-2" />

            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[
                { id: 'BALL', icon: Play, label: 'Ball' },
                { id: 'OVER', icon: SkipForward, label: 'Over' },
                { id: 'INNING', icon: FastForward, label: 'Inning' },
                { id: 'MATCH', icon: Trophy, label: 'Match' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => simulateNext(tab.id as any)}
                  disabled={isSimulating || isComplete}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-20"
                >
                  <tab.icon size={16} className="text-teal" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {isComplete && (
              <button 
                onClick={onComplete}
                className="bg-accent text-bg px-8 py-3 rounded-2xl font-black uppercase tracking-tighter flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <CheckCircle2 size={20} />
                Match Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
