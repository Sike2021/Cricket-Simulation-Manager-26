import { Player, Format, PlayerRole } from '../types';
import { getBatterTier, BATTING_PROFILES } from './index';

export interface BallResult {
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  commentary: string;
}

export const calculateBallResult = (
  striker: Player,
  bowler: Player,
  format: Format,
  battingIntensity: number, // 1-100
  bowlingIntensity: number, // 1-100
  pitchMods: any,
  isChase: boolean = false
): BallResult => {
  const formatMods = pitchMods[format] || { wicketChance: 1.0 };
  
  // Intensity impacts
  // Batting Intensity (1-100): 1 is extremely defensive, 100 is extremely aggressive
  // Bowling Intensity (1-100): 1 is extremely defensive (containment), 100 is extremely aggressive (wicket-taking)
  
  const aggressionFactor = (battingIntensity / 50) * (isChase ? 1.1 : 1.0);
  const bowlingAggression = (bowlingIntensity / 50);

  let batterProfile;
  const customProfile = striker.customProfiles?.[format];
  if (customProfile && customProfile.avg > 0 && customProfile.sr > 0) {
    batterProfile = customProfile;
  } else {
    const batterTier = getBatterTier(striker.battingSkill);
    const batterStyle = striker.style;
    // @ts-ignore
    batterProfile = BATTING_PROFILES[format][batterTier][batterStyle] || BATTING_PROFILES[format][batterTier]['N'];
  }

  const expectedRunsPerBall = (batterProfile.sr / 100) * aggressionFactor * (isChase ? pitchMods.chasePenalty : 1);
  const baseWicketProb = batterProfile.avg > 0 ? expectedRunsPerBall / batterProfile.avg : 0.05;
  
  // Skill impact
  let wicketProbability = (baseWicketProb * bowlingAggression)
    + ((bowler.secondarySkill - striker.battingSkill) / 400)
    + (bowler.role === PlayerRole.FAST_BOWLER ? pitchMods.paceBonus / 2 : 0) 
    + (bowler.role === PlayerRole.SPIN_BOWLER ? pitchMods.spinBonus / 2 : 0);
  
  wicketProbability *= formatMods.wicketChance;
  
  // Intensity trade-offs
  // High batting intensity increases runs but also increases wicket chance
  wicketProbability *= (1 + (battingIntensity - 50) / 100);
  // High bowling intensity increases wicket chance but also increases run rate (more boundaries)
  const runRateMod = (1 + (bowlingIntensity - 50) / 150);

  wicketProbability = Math.max(0.005, Math.min(0.4, wicketProbability));

  if (Math.random() < wicketProbability) {
    return {
      runs: 0,
      isWicket: true,
      wicketType: 'bowled',
      commentary: `${striker.name} is GONE! ${bowler.name} strikes!`,
    };
  }

  // Scoring logic
  let runs = 0;
  const rand = Math.random();
  
  // Base probabilities
  let p_dot = 0.35, p_1 = 0.35, p_2 = 0.1, p_3 = 0.02, p_4 = 0.12, p_6 = 0.06;
  
  // Adjust based on intensities
  const intensityDiff = (battingIntensity - 50) / 50;
  p_dot -= intensityDiff * 0.2;
  p_4 += intensityDiff * 0.1;
  p_6 += intensityDiff * 0.1;
  
  // Normalize
  const totalP = p_dot + p_1 + p_2 + p_3 + p_4 + p_6;
  const scoringRandom = rand * totalP * runRateMod;

  if (scoringRandom < p_dot) runs = 0;
  else if (scoringRandom < p_dot + p_1) runs = 1;
  else if (scoringRandom < p_dot + p_1 + p_2) runs = 2;
  else if (scoringRandom < p_dot + p_1 + p_2 + p_3) runs = 3;
  else if (scoringRandom < p_dot + p_1 + p_2 + p_3 + p_4) runs = 4;
  else runs = 6;

  return {
    runs,
    isWicket: false,
    commentary: runs === 4 ? "FOUR! Beautifully timed shot." : runs === 6 ? "SIX! That's out of the park!" : runs === 0 ? "No run. Solid defense." : `${runs} run${runs > 1 ? 's' : ''} taken.`,
  };
};
