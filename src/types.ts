export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';

export interface PlayerAvatar {
  faceShape: number;
  skinColor: string;
  hairStyle: number;
  hairColor: string;
  facialHair: number;
  eyeColor: string;
  eyeShape: number;
  noseShape: number;
  earShape: number;
  customPhoto?: string; // Base64 or local URL
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  batting: number;
  bowling: number;
  fitness: number;
  form: number;
  value: number;
  avatar: PlayerAvatar;
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
