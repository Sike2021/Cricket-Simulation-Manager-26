import { useState, useEffect, useCallback } from 'react';
import { Team, Player, BallResult, PlayerArchetype, Format } from '../types';
import { BATTING_PROFILES, getBatterTier } from '../../utils';

export function useSimulation(battingTeam: Team, bowlingTeam: Team, aggression: number = 50, intensity: number = 50, format: Format = Format.T20) {
  const [balls, setBalls] = useState<BallResult[]>([]);
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [strikerIndex, setStrikerIndex] = useState(0);
  const [nonStrikerIndex, setNonStrikerIndex] = useState(1);
  const [bowlerIndex, setBowlerIndex] = useState(0);

  const maxOvers = format === Format.T20 ? 20 : format === Format.ODI ? 50 : 90;

  const simulateBall = useCallback((
    currentScore: number, 
    currentWickets: number, 
    currentOvers: number, 
    currentBalls: number,
    sIndex: number,
    nsIndex: number,
    bIndex: number
  ): BallResult => {
    const striker = battingTeam.squad[sIndex] || battingTeam.squad[0];
    const bowler = bowlingTeam.squad[bowlingTeam.squad.length - 1 - bIndex] || bowlingTeam.squad[bowlingTeam.squad.length - 1];
    
    const batterTier = getBatterTier(striker.batting);
    const archetype = striker.archetype || PlayerArchetype.BALANCED;
    
    // @ts-ignore
    const profile = BATTING_PROFILES[format][batterTier][archetype] || BATTING_PROFILES[format][batterTier]['N'];
    
    let baseSR = profile.sr;
    let baseAvg = profile.avg;

    // Adaptive Archetype Logic: Starts slow, scales up
    if (archetype === PlayerArchetype.ADAPTIVE) {
      const ballsFaced = balls.filter(b => b.batsman === striker.name).length;
      // Start at ~80% of base SR, scale to ~140% after 30 balls
      const scaling = Math.min(1.4, 0.8 + (ballsFaced / 50));
      baseSR *= scaling;
    }

    // Aggression Slider Impact (1-100, 50 is neutral)
    const aggressionFactor = aggression / 50;
    const intensityFactor = intensity / 50;

    const expectedRunsPerBall = (baseSR / 100) * aggressionFactor;
    // Wicket probability increases with aggression and bowler intensity
    const baseWicketProb = baseAvg > 0 ? expectedRunsPerBall / baseAvg : 0.05;
    const wicketProb = baseWicketProb * (1 + (aggression - 50) / 100) * intensityFactor;

    const isWicket = Math.random() < wicketProb;
    let runs = 0;
    let commentary = "";

    if (isWicket) {
      commentary = `OUT! ${striker.name} is gone! ${bowler.name} strikes.`;
    } else {
      // Simple run distribution based on expected runs
      const rand = Math.random();
      if (expectedRunsPerBall > 1.5) { // Highly aggressive
        if (rand < 0.15) runs = 6;
        else if (rand < 0.35) runs = 4;
        else if (rand < 0.70) runs = 1;
        else runs = 0;
      } else if (expectedRunsPerBall > 1.0) { // Balanced/Aggressive
        if (rand < 0.08) runs = 6;
        else if (rand < 0.25) runs = 4;
        else if (rand < 0.75) runs = 1;
        else runs = 0;
      } else { // Defensive/Balanced
        if (rand < 0.03) runs = 6;
        else if (rand < 0.15) runs = 4;
        else if (rand < 0.80) runs = 1;
        else runs = 0;
      }

      if (runs === 6) commentary = `SIX! ${striker.name} launches it over the ropes!`;
      else if (runs === 4) commentary = `FOUR! Beautifully timed by ${striker.name}.`;
      else if (runs === 0) commentary = `Solid defense from ${striker.name}.`;
      else commentary = `${striker.name} tucks it away for ${runs}.`;
    }

    return {
      over: currentOvers,
      ball: currentBalls + 1,
      batsman: striker.name,
      bowler: bowler.name,
      runs,
      isWicket,
      commentary
    };
  }, [battingTeam, bowlingTeam, aggression, intensity, balls]);

  const startSimulation = () => {
    setIsSimulating(true);
    setBalls([]);
    setCurrentBallIndex(0);
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setStrikerIndex(0);
    setNonStrikerIndex(1);
    setBowlerIndex(0);
  };

  useEffect(() => {
    if (isSimulating && score.wickets < 10 && score.overs < maxOvers) {
      const timer = setTimeout(() => {
        const ball = simulateBall(
          score.runs, 
          score.wickets, 
          score.overs, 
          score.balls,
          strikerIndex,
          nonStrikerIndex,
          bowlerIndex
        );

        setBalls(prev => [...prev, ball]);
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

        if (ball.isWicket) {
          setStrikerIndex(Math.max(strikerIndex, nonStrikerIndex) + 1);
        } else if (ball.runs % 2 !== 0) {
          setStrikerIndex(nonStrikerIndex);
          setNonStrikerIndex(strikerIndex);
        }

        if ((score.balls + 1) === 6) {
          setBowlerIndex(prev => (prev + 1) % 5); // Simple bowler rotation
          // Switch ends
          setStrikerIndex(prev => {
            const currentNS = nonStrikerIndex;
            setNonStrikerIndex(prev);
            return currentNS;
          });
        }

        setCurrentBallIndex(prev => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isSimulating) {
      setIsSimulating(false);
    }
  }, [isSimulating, score, strikerIndex, nonStrikerIndex, bowlerIndex, simulateBall]);

  return {
    balls,
    currentBallIndex,
    isSimulating,
    score,
    startSimulation,
    currentBall: balls[balls.length - 1],
    strikerIndex,
    nonStrikerIndex
  };
}
