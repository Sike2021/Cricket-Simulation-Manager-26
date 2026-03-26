import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Team } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Shield, Zap, Info, ChevronRight, Sliders, Trophy } from 'lucide-react';

export default function MatchView({ battingTeam, bowlingTeam, onComplete }: { battingTeam: Team, bowlingTeam: Team, onComplete: (result: string, score: any) => void }) {
  const { 
    balls, 
    currentBallIndex, 
    isSimulating, 
    score, 
    startSimulation, 
    currentBall,
    aggression,
    setAggression,
    intensity,
    setIntensity
  } = useSimulation(battingTeam, bowlingTeam);

  const isFinished = balls.length > 0 && currentBallIndex >= balls.length;

  const handleFinish = () => {
    const result = `${battingTeam.name} scored ${score.runs}/${score.wickets} in ${score.overs}.${score.balls} overs.`;
    const finalScore = {
      home: score,
      away: { runs: 0, wickets: 0, overs: 0, balls: 0 } // Simplified for now
    };
    onComplete(result, finalScore);
  };

  const recentBalls = balls.slice(Math.max(0, currentBallIndex - 6), currentBallIndex);

  return (
    <div className="max-w-md mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h3 className="text-3xl font-black tracking-tighter italic uppercase">
          Match <span className="text-accent">Simulation</span> <span className="text-ink/20">V2.0</span>
        </h3>
      </div>

      <div className="bg-card-bg border border-border rounded-[40px] p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[20px] border-accent rounded-full" />
        </div>

        <div className="relative z-10 text-center mb-8">
          <div className="text-5xl font-black tracking-tighter mb-2">
            {battingTeam.shortName} <span className="text-accent">{score.runs}/{score.wickets}</span>
          </div>
          <div className="text-sm text-ink/40 font-mono uppercase tracking-[0.3em]">
            ({score.overs}.{score.balls} Overs)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-3xl p-4 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Activity size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-ink/40 uppercase tracking-widest truncate">
                {currentBall?.batsman || 'Waiting...'}
              </div>
              <div className="font-bold text-sm">BATSMAN</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-3xl p-4 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Shield size={16} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-ink/40 uppercase tracking-widest truncate">
                {currentBall?.bowler || 'Waiting...'}
              </div>
              <div className="font-bold text-sm">BOWLER</div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentBall && currentBall.runs >= 4 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                {currentBall.runs === 4 ? 'FOUR!' : 'SIX!'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-48 rounded-3xl overflow-hidden mb-8 border border-white/5">
          <img 
            src="https://picsum.photos/seed/cricket/800/400" 
            alt="Stadium" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40 mb-4">Recent Over Log</div>
            <div className="flex gap-2">
              {recentBalls.map((ball, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all ${
                    ball.runs >= 4 ? 'bg-accent text-bg border-accent' :
                    ball.isWicket ? 'bg-red-500 text-white border-red-500' :
                    'bg-white/5 border-white/10'
                  }`}
                >
                  {ball.isWicket ? 'W' : ball.runs}
                </div>
              ))}
              {Array.from({ length: 6 - recentBalls.length }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-xl border border-white/5 bg-white/5" />
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-border">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">Batting Aggression</div>
                <div className="text-xs font-mono text-accent">{aggression}%</div>
              </div>
              <input 
                type="range" 
                min="1" max="100" 
                value={aggression}
                onChange={(e) => setAggression(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">Bowling Intensity</div>
                <div className="text-xs font-mono text-blue-500">{intensity}%</div>
              </div>
              <input 
                type="range" 
                min="1" max="100" 
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {!isSimulating && !isFinished && (
        <button 
          onClick={startSimulation}
          className="w-full bg-accent text-bg h-20 rounded-[24px] font-black uppercase tracking-tighter text-xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-all"
        >
          <Activity size={24} />
          {balls.length > 0 ? 'Restart Match' : 'Start Simulation'}
        </button>
      )}

      {isFinished && (
        <button 
          onClick={handleFinish}
          className="w-full bg-accent text-bg h-20 rounded-[24px] font-black uppercase tracking-tighter text-xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-all"
        >
          <Trophy size={24} />
          Finish & Return
        </button>
      )}

      {isSimulating && currentBall && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl italic text-center text-ink/60">
          "{currentBall.commentary}"
        </div>
      )}
    </div>
  );
}
