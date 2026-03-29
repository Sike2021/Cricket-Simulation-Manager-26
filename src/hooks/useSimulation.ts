import { useState, useEffect, useCallback } from 'react';
import { Team, Player } from '../types';

export interface BallResult {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  batsman: string;
  bowler: string;
  commentary: string;
  extras?: number;
}

export function useSimulation(battingTeam: Team, bowlingTeam: Team) {
  const [balls, setBalls] = useState<BallResult[]>([]);
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [battingOrder, setBattingOrder] = useState<Player[]>(battingTeam.squad.slice(0, 11));
  const [battingAggression, setBattingAggression] = useState(50);
  const [bowlingIntensity, setBowlingIntensity] = useState(50);
  const [simSpeed, setSimSpeed] = useState<'BALL' | 'OVER' | 'INNING' | 'MATCH'>('BALL');

  const generateBallResult = (over: number, ball: number, batsman: Player, bowler: Player, agg: number, int: number): BallResult => {
    // Simple local simulation logic based on stats and intensity
    const batSkill = batsman.batting * (agg / 50);
    const bowlSkill = bowler.bowling * (int / 50);
    
    const randomFactor = Math.random() * 100;
    let runs = 0;
    let isWicket = false;
    let commentary = "";

    if (bowlSkill > batSkill + randomFactor) {
      isWicket = true;
      commentary = "Clean bowled! What a delivery!";
    } else if (batSkill > bowlSkill + randomFactor + 20) {
      runs = 6;
      commentary = "Massive hit! That's out of the ground for six!";
    } else if (batSkill > bowlSkill + randomFactor + 10) {
      runs = 4;
      commentary = "Beautiful shot, races away to the boundary for four.";
    } else if (batSkill > bowlSkill + randomFactor) {
      runs = Math.floor(Math.random() * 3) + 1;
      commentary = `Pushed into the gap for ${runs}.`;
    } else {
      runs = 0;
      commentary = "Solid defense, no run.";
    }

    return {
      over,
      ball,
      runs,
      isWicket,
      batsman: batsman.name,
      bowler: bowler.name,
      commentary
    };
  };

  const simulateNext = useCallback((count: number) => {
    if (score.wickets >= 10 || (score.overs === 20 && score.balls === 0)) {
      setIsSimulating(false);
      return;
    }

    let currentOvers = score.overs;
    let currentBalls = score.balls;
    let currentRuns = score.runs;
    let currentWickets = score.wickets;
    let currentBatsmanIdx = score.wickets;
    
    const newBalls: BallResult[] = [];

    for (let i = 0; i < count; i++) {
      if (currentWickets >= 10 || (currentOvers === 20 && currentBalls === 0)) break;

      const batsman = battingOrder[currentBatsmanIdx] || battingOrder[battingOrder.length - 1];
      const bowler = bowlingTeam.squad[Math.floor(Math.random() * 5) + 6] || bowlingTeam.squad[0]; // Pick a bowler

      const result = generateBallResult(currentOvers, currentBalls + 1, batsman, bowler, battingAggression, bowlingIntensity);
      newBalls.push(result);

      currentRuns += result.runs;
      if (result.isWicket) {
        currentWickets += 1;
        currentBatsmanIdx += 1;
      }

      currentBalls += 1;
      if (currentBalls === 6) {
        currentOvers += 1;
        currentBalls = 0;
      }
    }

    setBalls(prev => [...prev, ...newBalls]);
    setScore({
      runs: currentRuns,
      wickets: currentWickets,
      overs: currentOvers,
      balls: currentBalls
    });
    setCurrentBallIndex(prev => prev + newBalls.length);
  }, [score, battingOrder, battingAggression, bowlingIntensity, bowlingTeam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      const delay = simSpeed === 'BALL' ? 1500 : simSpeed === 'OVER' ? 500 : 100;
      const count = simSpeed === 'BALL' ? 1 : simSpeed === 'OVER' ? 6 : 120; // 120 for inning/match

      timer = setTimeout(() => {
        simulateNext(count);
        if (simSpeed === 'INNING' || simSpeed === 'MATCH') {
            setIsSimulating(false);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isSimulating, simulateNext, simSpeed]);

  const startSimulation = () => {
    setIsSimulating(true);
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setBalls([]);
    setCurrentBallIndex(0);
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  };

  return {
    balls,
    currentBallIndex,
    isSimulating,
    score,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    currentBall: balls[balls.length - 1],
    battingOrder,
    setBattingOrder,
    battingAggression,
    setBattingAggression,
    bowlingIntensity,
    setBowlingIntensity,
    simSpeed,
    setSimSpeed
  };
}
