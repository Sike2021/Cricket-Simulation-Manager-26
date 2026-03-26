export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  batting: number;
  bowling: number;
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

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  squad: Player[];
  budget: number;
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

export interface BallResult {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  batsman: string;
  bowler: string;
  commentary: string;
}

export interface MatchState {
  target: number;
  currentInnings: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  score: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
  };
  activeBatsmen: {
    striker: Player;
    nonStriker: Player;
  };
  currentBowler: Player;
  recentBalls: number[];
  isCompleted: boolean;
}

export interface PlayerRoleSelection {
  playerId: string;
  role: 'BT' | 'BL' | 'WK' | 'AR';
  position: number;
}
