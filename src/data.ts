import { Team, Player, Match } from './types';

export const PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Virat Kohli',
    role: 'Batsman',
    batting: 95,
    bowling: 20,
    fitness: 98,
    form: 88,
    value: 15000000,
    teamId: 't1',
    stats: { matches: 250, runs: 12000, wickets: 4, average: 58.5, strikeRate: 138.2 }
  },
  {
    id: 'p2',
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    batting: 15,
    bowling: 96,
    fitness: 92,
    form: 94,
    value: 12000000,
    teamId: 't1',
    stats: { matches: 120, runs: 200, wickets: 250, average: 22.1, strikeRate: 18.5 }
  },
  {
    id: 'p3',
    name: 'Ben Stokes',
    role: 'All-rounder',
    batting: 88,
    bowling: 85,
    fitness: 85,
    form: 82,
    value: 14000000,
    teamId: 't1',
    stats: { matches: 180, runs: 5000, wickets: 150, average: 35.2, strikeRate: 142.5 }
  },
  {
    id: 'p4',
    name: 'Rashid Khan',
    role: 'Bowler',
    batting: 45,
    bowling: 94,
    fitness: 95,
    form: 90,
    value: 11000000,
    teamId: 't2',
    stats: { matches: 150, runs: 800, wickets: 300, average: 18.2, strikeRate: 16.4 }
  },
  {
    id: 'p5',
    name: 'Jos Buttler',
    role: 'Wicketkeeper',
    batting: 92,
    bowling: 0,
    fitness: 90,
    form: 85,
    value: 13000000,
    teamId: 't2',
    stats: { matches: 160, runs: 6000, wickets: 0, average: 42.5, strikeRate: 155.2 }
  },
  {
    id: 'p6',
    name: 'Babar Azam',
    role: 'Batsman',
    batting: 93,
    bowling: 10,
    fitness: 95,
    form: 85,
    value: 12000000,
    stats: { matches: 100, runs: 4500, wickets: 0, average: 50.2, strikeRate: 130.5 }
  },
  {
    id: 'p7',
    name: 'Shaheen Afridi',
    role: 'Bowler',
    batting: 20,
    bowling: 92,
    fitness: 90,
    form: 88,
    value: 10000000,
    stats: { matches: 80, runs: 300, wickets: 150, average: 24.5, strikeRate: 17.2 }
  },
  {
    id: 'p8',
    name: 'Kane Williamson',
    role: 'Batsman',
    batting: 91,
    bowling: 15,
    fitness: 92,
    form: 82,
    value: 11000000,
    stats: { matches: 150, runs: 6500, wickets: 5, average: 48.2, strikeRate: 125.5 }
  },
  {
    id: 'p9',
    name: 'Pat Cummins',
    role: 'Bowler',
    batting: 40,
    bowling: 93,
    fitness: 94,
    form: 90,
    value: 12500000,
    stats: { matches: 120, runs: 1200, wickets: 220, average: 23.5, strikeRate: 19.8 }
  },
  {
    id: 'p10',
    name: 'Quinton de Kock',
    role: 'Wicketkeeper',
    batting: 89,
    bowling: 0,
    fitness: 88,
    form: 84,
    value: 10500000,
    stats: { matches: 140, runs: 5200, wickets: 0, average: 38.5, strikeRate: 145.2 }
  }
];

export const TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Mumbai Mavericks',
    shortName: 'MUM',
    logo: 'https://picsum.photos/seed/mumbai/100/100',
    color: '#004BA0',
    squad: PLAYERS.slice(0, 3),
    playingXIIds: ['p1', 'p2', 'p3'],
    budget: 50000000,
    points: 12,
    played: 8,
    won: 6,
    lost: 2,
    nrr: 1.25
  },
  {
    id: 't2',
    name: 'London Lions',
    shortName: 'LDN',
    logo: 'https://picsum.photos/seed/london/100/100',
    color: '#D71920',
    squad: PLAYERS.slice(3, 5),
    playingXIIds: ['p4', 'p5'],
    budget: 45000000,
    points: 10,
    played: 8,
    won: 5,
    lost: 3,
    nrr: 0.85
  }
];

export const MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeamId: 't1',
    awayTeamId: 't2',
    date: '2026-03-24T14:30:00Z',
    venue: 'Wankhede Stadium',
    status: 'Upcoming'
  },
  {
    id: 'm2',
    homeTeamId: 't2',
    awayTeamId: 't1',
    date: '2026-03-20T14:30:00Z',
    venue: 'Lord\'s Cricket Ground',
    status: 'Completed',
    result: 'Mumbai Mavericks won by 4 wickets',
    score: {
      home: { runs: 165, wickets: 8, overs: 20, balls: 0 },
      away: { runs: 168, wickets: 6, overs: 19, balls: 2 }
    }
  }
];
