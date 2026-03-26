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
  teamId?: string;
  isAuctioned?: boolean;
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
  playingXIIds: string[];
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
    home: { runs: number; wickets: number; overs: number; balls: number };
    away: { runs: number; wickets: number; overs: number; balls: number };
  };
}

export interface AuctionState {
  currentPool: Player[];
  currentIndex: number;
  soldPlayers: { playerId: string; teamId: string; price: number }[];
  skippedPlayerIds: string[];
}
