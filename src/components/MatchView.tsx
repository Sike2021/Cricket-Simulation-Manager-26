import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Team } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Shield, Zap, Info } from 'lucide-react';

export default function MatchView({ battingTeam, bowlingTeam, onComplete }: { battingTeam: Team, bowlingTeam: Team, onComplete: () => void }) {
  const { balls, currentBallIndex, isSimulating, score, startSimulation, currentBall } = useSimulation(battingTeam, bowlingTeam);

  return (
    <div className="space-y-12">
      <div className="bg-card-bg border border-border rounded-[40px] p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-accent rounded-full" />
        </div>

        <div className="flex justify-between items-center mb-16 relative z-10">
          <div className="flex items-center gap-6">
            <img src={battingTeam.logo} alt={battingTeam.name} className="w-24 h-24 rounded-3xl border border-border" referrerPolicy="no-referrer" />
            <div>
              <div className="text-4xl font-black tracking-tighter">{battingTeam.shortName}</div>
              <div className="text-accent font-mono text-sm uppercase tracking-widest">BATTING</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-7xl font-black tracking-tighter mb-2">
              {score.runs}<span className="text-accent">/</span>{score.wickets}
            </div>
            <div className="text-xl text-ink/40 font-mono uppercase tracking-widest">
              OVERS: {score.overs}.{score.balls}
            </div>
          </div>

          <div className="flex items-center gap-6 text-right">
            <div>
              <div className="text-4xl font-black tracking-tighter">{bowlingTeam.shortName}</div>
              <div className="text-blue-500 font-mono text-sm uppercase tracking-widest">BOWLING</div>
            </div>
            <img src={bowlingTeam.logo} alt={bowlingTeam.name} className="w-24 h-24 rounded-3xl border border-border" referrerPolicy="no-referrer" />
          </div>
        </div>

        {!isSimulating && balls.length === 0 && (
          <div className="text-center py-20">
            <button 
              onClick={startSimulation}
              className="bg-accent text-bg px-12 py-6 rounded-3xl text-2xl font-black uppercase tracking-tighter hover:shadow-[0_0_50px_rgba(0,255,136,0.5)] transition-all"
            >
              Start Simulation
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentBall && (
            <motion.div 
              key={currentBallIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent text-bg flex items-center justify-center font-black text-xl">
                    {currentBall.runs}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{currentBall.batsman}</div>
                    <div className="text-sm text-ink/40">vs {currentBall.bowler}</div>
                  </div>
                </div>
                {currentBall.isWicket && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest animate-bounce">
                    WICKET!
                  </div>
                )}
              </div>
              <p className="text-xl italic text-ink/80 leading-relaxed">
                "{currentBall.commentary}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card-bg border border-border rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Activity size={20} className="text-accent" />
            Live Commentary
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
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

        <div className="bg-card-bg border border-border rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Info size={20} className="text-blue-500" />
            Innings Summary
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-ink/40 uppercase text-xs tracking-widest">Run Rate</div>
              <div className="font-mono font-bold text-xl">
                {score.overs > 0 ? (score.runs / (score.overs + score.balls/6)).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-ink/40 uppercase text-xs tracking-widest">Projected Score</div>
              <div className="font-mono font-bold text-xl">
                {score.overs > 0 ? Math.round((score.runs / (score.overs + score.balls/6)) * 20) : '0'}
              </div>
            </div>
            <div className="pt-6 border-t border-border">
              <div className="text-xs text-ink/40 uppercase tracking-widest mb-4">Win Probability</div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-accent" style={{ width: '65%' }} />
                <div className="h-full bg-blue-500" style={{ width: '35%' }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-accent">{battingTeam.shortName} 65%</span>
                <span className="text-blue-500">{bowlingTeam.shortName} 35%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
