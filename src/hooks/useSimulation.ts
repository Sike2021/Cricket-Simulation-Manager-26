import { useState, useEffect, useCallback } from 'react';
import { Team, Player } from '../types';

export interface BallResult {
  over: number;
  ball: number;
  batsman: string;
  bowler: string;
  runs: number;
  isWicket: boolean;
  commentary: string;
}

interface SimOptions {
  aggression: number;
  intensity: number;
  battingOrder: Player[];
}

export function useSimulation(battingTeam: Team, bowlingTeam: Team, options: SimOptions) {
  const [balls, setBalls] = useState<BallResult[]>([]);
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const generateLocalSimulation = (battingTeam: Team, bowlingTeam: Team, options: SimOptions): BallResult[] => {
    const results: BallResult[] = [];
    let wickets = 0;
    let currentBatsmanIndex = 0;
    let nonStrikerIndex = 1;

    const commentaries = [
      "Beautiful drive through the covers!",
      "Edge and safe, runs away for four.",
      "Clean bowled! What a delivery!",
      "Smashed over long on for six!",
      "Solid defense, no run.",
      "Quick single taken.",
      "Caught at deep mid-wicket!",
      "Straight down the ground for four.",
      "Swing and a miss.",
      "Leg before wicket! Huge appeal and given!",
    ];

    for (let over = 0; over < 5; over++) {
      for (let ball = 1; ball <= 6; ball++) {
        if (wickets >= 10) break;

        const batsman = options.battingOrder[currentBatsmanIndex]?.name || "Batsman";
        const bowler = bowlingTeam.squad[over % bowlingTeam.squad.length]?.name || "Bowler";
        
        // Simple probability based on aggression and intensity
        const wicketProb = (0.05 + (options.aggression / 1000) + (options.intensity / 1000));
        const isWicket = Math.random() < wicketProb;
        
        let runs = 0;
        if (!isWicket) {
          const rand = Math.random();
          if (rand < 0.3) runs = 0;
          else if (rand < 0.6) runs = 1;
          else if (rand < 0.75) runs = 2;
          else if (rand < 0.9) runs = 4;
          else runs = 6;
          
          // Boost runs if aggression is high
          if (options.aggression > 70 && runs < 4 && Math.random() > 0.5) runs = 4;
        }

        const commentary = isWicket 
          ? commentaries[Math.floor(Math.random() * 3) + 6] 
          : runs === 0 ? commentaries[4] : runs === 4 ? commentaries[0] : runs === 6 ? commentaries[3] : commentaries[5];

        results.push({
          over,
          ball,
          batsman,
          bowler,
          runs,
          isWicket,
          commentary
        });

        if (isWicket) {
          wickets++;
          currentBatsmanIndex = Math.max(currentBatsmanIndex, nonStrikerIndex) + 1;
        } else if (runs % 2 !== 0) {
          // Switch strike
          const temp = currentBatsmanIndex;
          currentBatsmanIndex = nonStrikerIndex;
          nonStrikerIndex = temp;
        }
      }
      // Switch strike at end of over
      const temp = currentBatsmanIndex;
      currentBatsmanIndex = nonStrikerIndex;
      nonStrikerIndex = temp;
    }

    return results;
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    setCurrentBallIndex(0);
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setIsComplete(false);
    
    // Simulate locally instead of calling Gemini
    const results = generateLocalSimulation(battingTeam, bowlingTeam, options);
    setBalls(results);
  };

  const simulateNext = async (level: 'BALL' | 'OVER' | 'INNING' | 'MATCH') => {
    if (balls.length === 0) {
      await startSimulation();
      return;
    }

    if (isSimulating) return;

    setIsSimulating(true);
    
    let targetIndex = currentBallIndex;
    if (level === 'BALL') targetIndex += 1;
    else if (level === 'OVER') targetIndex += 6;
    else if (level === 'INNING' || level === 'MATCH') targetIndex = balls.length;

    targetIndex = Math.min(targetIndex, balls.length);

    // Process balls up to targetIndex with a small delay for animation
    for (let i = currentBallIndex; i < targetIndex; i++) {
      const ball = balls[i];
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
      setCurrentBallIndex(i + 1);
      if (level === 'BALL' || level === 'OVER') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setIsSimulating(false);
    if (targetIndex >= balls.length) {
      setIsComplete(true);
    }
  };

  return {
    balls,
    currentBallIndex,
    isSimulating,
    score,
    startSimulation,
    simulateNext,
    isComplete,
    currentBall: balls[currentBallIndex - 1]
  };
}
