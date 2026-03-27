import { Team, Player, Match, PlayerAvatar } from './types';

const createRandomAvatar = (): PlayerAvatar => ({
  faceShape: Math.floor(Math.random() * 5),
  skinColor: ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'][Math.floor(Math.random() * 5)],
  hairStyle: Math.floor(Math.random() * 10),
  hairColor: ['#000000', '#4B2C20', '#7B3F00', '#D4AF37'][Math.floor(Math.random() * 4)],
  facialHair: Math.floor(Math.random() * 5),
  eyeColor: ['#000000', '#4B2C20', '#0000FF', '#008000'][Math.floor(Math.random() * 4)],
  eyeShape: Math.floor(Math.random() * 3),
  noseShape: Math.floor(Math.random() * 3),
  earShape: Math.floor(Math.random() * 3),
});

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
    avatar: createRandomAvatar(),
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
    avatar: createRandomAvatar(),
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
    avatar: createRandomAvatar(),
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
    avatar: createRandomAvatar(),
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
    avatar: createRandomAvatar(),
    stats: { matches: 160, runs: 6000, wickets: 0, average: 42.5, strikeRate: 155.2 }
  },
  {
    id: 'p6',
    name: 'Nasir Jamshed',
    role: 'Batsman',
    batting: 78,
    bowling: 10,
    fitness: 80,
    form: 75,
    value: 5000000,
    avatar: createRandomAvatar(),
    stats: { matches: 48, runs: 1418, wickets: 0, average: 31.5, strikeRate: 112.4 }
  },
  {
    id: 'p7',
    name: 'Musa Khan',
    role: 'Bowler',
    batting: 20,
    bowling: 82,
    fitness: 88,
    form: 80,
    value: 4000000,
    avatar: createRandomAvatar(),
    stats: { matches: 12, runs: 45, wickets: 18, average: 28.5, strikeRate: 24.2 }
  },
  {
    id: 'p8',
    name: 'Brad Haddin',
    role: 'Wicketkeeper',
    batting: 84,
    bowling: 0,
    fitness: 85,
    form: 82,
    value: 7000000,
    avatar: createRandomAvatar(),
    stats: { matches: 126, runs: 3122, wickets: 0, average: 31.5, strikeRate: 128.4 }
  },
  {
    id: 'p9',
    name: 'Kane Williamson',
    role: 'Batsman',
    batting: 91,
    bowling: 15,
    fitness: 94,
    form: 86,
    value: 11000000,
    avatar: createRandomAvatar(),
    stats: { matches: 150, runs: 6500, wickets: 2, average: 48.2, strikeRate: 128.5 }
  },
  {
    id: 'p10',
    name: 'Trent Boult',
    role: 'Bowler',
    batting: 12,
    bowling: 93,
    fitness: 90,
    form: 88,
    value: 9500000,
    avatar: createRandomAvatar(),
    stats: { matches: 100, runs: 150, wickets: 190, average: 24.5, strikeRate: 21.2 }
  },
  {
    id: 'p11',
    name: 'Glenn Maxwell',
    role: 'All-rounder',
    batting: 87,
    bowling: 78,
    fitness: 92,
    form: 84,
    value: 12500000,
    avatar: createRandomAvatar(),
    stats: { matches: 140, runs: 3500, wickets: 60, average: 32.4, strikeRate: 154.2 }
  }
];

export const TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Mumbai Mavericks',
    shortName: 'MUM',
    logo: 'https://picsum.photos/seed/mumbai/100/100',
    color: '#004BA0',
    squad: [PLAYERS[0], PLAYERS[1], PLAYERS[2], PLAYERS[5], PLAYERS[6], PLAYERS[7], PLAYERS[8], PLAYERS[9], PLAYERS[10]],
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
    squad: [PLAYERS[3], PLAYERS[4]],
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
      home: { runs: 165, wickets: 8, overs: 20 },
      away: { runs: 168, wickets: 6, overs: 19.2 }
    }
  }
];
