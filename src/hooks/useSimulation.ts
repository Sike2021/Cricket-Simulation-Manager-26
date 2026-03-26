import { useState, useEffect } from 'react';
import { BallResult, simulateMatchInnings } from '../services/geminiService';
import { Team } from '../types';

export function useSimulation(battingTeam: Team, bowlingTeam: Team, aggression: number, intensity: number) {
  const [balls, setBalls] = useState<BallResult[]>([]);
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [recentBalls, setRecentBalls] = useState<number[]>([]);

  const startSimulation = async () => {
    setIsSimulating(true);
    setCurrentBallIndex(0);
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setRecentBalls([]);
    
    // Pass aggression and intensity to simulation service
    const results = await simulateMatchInnings(battingTeam, bowlingTeam, aggression, intensity);
    setBalls(results);
  };

  useEffect(() => {
    if (isSimulating && balls.length > 0 && currentBallIndex < balls.length) {
      const timer = setTimeout(() => {
        const ball = balls[currentBallIndex];
        setScore(prev => {
          const newBalls = prev.balls + 1;
          const newOvers = newBalls === 6 ? prev.overs + 1 : prev.overs;
          return {
            runs: prev.runs + ball.runs,
            wickets: prev.wickets + (ball.isWicket ? 1 : 0),
            overs: newOvers,
            balls: newBalls === 6 ? 0 : newBalls
          };
        });
        
        setRecentBalls(prev => {
          const next = [...prev, ball.runs];
          if (next.length > 6) return next.slice(1);
          return next;
        });

        setCurrentBallIndex(prev => prev + 1);
      }, 1000); // Faster simulation

      return () => clearTimeout(timer);
    } else if (currentBallIndex >= balls.length && balls.length > 0) {
      setIsSimulating(false);
    }
  }, [isSimulating, balls, currentBallIndex]);

  return {
    balls,
    currentBallIndex,
    isSimulating,
    score,
    recentBalls,
    startSimulation,
    currentBall: balls[currentBallIndex - 1]
  };
}
