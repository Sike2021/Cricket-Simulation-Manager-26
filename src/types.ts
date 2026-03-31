export enum Format {
    T20 = 'T20',
    ODI = 'ODI',
    FC = 'FC'
}

export enum PlayerArchetype {
    AGGRESSIVE = 'Aggressive',
    ADAPTIVE = 'Adaptive',
    BALANCED = 'Balanced',
    DEFENSIVE = 'Defensive'
}

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  archetype?: PlayerArchetype;
  batting: number;
  bowling: number;
  rating: number;
  age: number;
  fitness: number;
  form: number;
  value: number;
  stats: {
    matches: number;
    runs: number;
    wickets: number;
    average: number;
    strikeRate: number;
  };
}

export interface BallResult {
  over: number;
  ball: number;
  batsman: string;
  bowler: string;
  runs: number;
  isWicket: boolean;
  commentary: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  squad: Player[];
  budget: number;
  nextYearBudgetReduction: number;
  points: number;
  played: number;
  won: number;
  lost: number;
  nrr: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  venue: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  result?: string;
  score?: {
    home: { runs: number; wickets: number; overs: number };
    away: { runs: number; wickets: number; overs: number };
  };
}
