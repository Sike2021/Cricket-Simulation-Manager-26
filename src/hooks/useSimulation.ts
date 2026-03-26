import { useState, useEffect } from 'react';
import { BallResult, simulateMatchInnings } from '../services/geminiService';
import { Team } from '../types';

export function useSimulation(battingTeam: Team, bowlingTeam: Team) {
  const [balls, setBalls] = useState<BallResult[]>([]);
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [aggression, setAggression] = useState(50);
  const [intensity, setIntensity] = useState(50);

  const startSimulation = async () => {
    setIsSimulating(true);
    setCurrentBallIndex(0);
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    
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
        setCurrentBallIndex(prev => prev + 1);
      }, 1500);

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
    startSimulation,
    aggression,
    setAggression,
    intensity,
    setIntensity,
    currentBall: balls[currentBallIndex - 1]
  };
}
