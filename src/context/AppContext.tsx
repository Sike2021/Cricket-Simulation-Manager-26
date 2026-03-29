import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, Team, Format, Match, Standing, MatchResult, GameData } from '../../types';
import { PLAYERS, TEAMS, GROUNDS, INITIAL_SPONSORSHIPS, INITIAL_NEWS } from '../../data';
import { generateLeagueSchedule } from '../../utils';

interface AppContextType {
  gameData: GameData | null;
  setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
  budget: number;
  setBudget: (amount: number) => void;
  squad: Player[];
  setSquad: (players: Player[]) => void;
  playingXI: string[];
  setPlayingXI: (playerIds: string[]) => void;
  auctionPlayers: Player[];
  setAuctionPlayers: (players: Player[]) => void;
  currentAuctionIndex: number;
  setCurrentAuctionIndex: (index: number) => void;
  matchSettings: { battingAggression: number; bowlingIntensity: number };
  setMatchSettings: (settings: { battingAggression: number; bowlingIntensity: number }) => void;
  initializeGame: (userTeamId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [budget, setBudget] = useState(100.0);
  const [squad, setSquad] = useState<Player[]>([]);
  const [playingXI, setPlayingXI] = useState<string[]>([]);
  const [auctionPlayers, setAuctionPlayers] = useState<Player[]>([]);
  const [currentAuctionIndex, setCurrentAuctionIndex] = useState(0);
  const [matchSettings, setMatchSettings] = useState({ battingAggression: 50, bowlingIntensity: 50 });

  // Sync state with gameData when it changes
  useEffect(() => {
    if (gameData) {
      const userTeam = gameData.teams.find(t => t.id === gameData.userTeamId);
      if (userTeam) {
        setBudget(userTeam.purse);
        setSquad(userTeam.squad);
        const xi = gameData.playingXIs[userTeam.id]?.[gameData.currentFormat] || [];
        setPlayingXI(xi);
      }
    }
  }, [gameData]);

  const initializeGame = (userTeamId: string) => {
    const allPlayersPool = [...PLAYERS].sort(() => Math.random() - 0.5);
    const initialTeamsData = [...TEAMS];
    
    // For the auction, we start with an empty squad for the user, or just a few players
    // The user wants to buy 16 players.
    
    const initialTeams: Team[] = initialTeamsData.map(teamData => {
      return { 
        id: teamData.id, 
        name: teamData.name, 
        squad: [], 
        captains: {}, 
        purse: 100.0 
      };
    });

    const initialStandings = (teams: Team[]) => teams.map(team => ({ 
        teamId: team.id, teamName: team.name, played: 0, won: 0, lost: 0, drawn: 0, points: 0, netRunRate: 0, runsFor: 0, runsAgainst: 0 
    }));

    const schedules = Object.values(Format).reduce((acc, format) => {
        acc[format] = generateLeagueSchedule(initialTeams, format, true);
        return acc;
    }, {} as Record<Format, Match[]>);

    const newGameData: GameData = {
      userTeamId,
      teams: initialTeams,
      grounds: [...GROUNDS],
      allTeamsData: initialTeamsData,
      allPlayers: [...PLAYERS],
      schedule: schedules,
      currentMatchIndex: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Format, number>),
      standings: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: initialStandings(initialTeams) }), {} as Record<Format, Standing[]>),
      matchResults: Object.values(Format).reduce((acc, format) => {
        acc[format] = [];
        return acc;
      }, {} as Record<Format, MatchResult[]>),
      playingXIs: {},
      currentSeason: 1,
      currentFormat: Format.T20, 
      awardsHistory: [],
      scoreLimits: {},
      records: {
        batterVsBowler: [],
        teamVsTeam: [],
        playerVsTeam: [],
      },
      promotionHistory: [],
      popularity: 50,
      sponsorships: INITIAL_SPONSORSHIPS,
      news: INITIAL_NEWS,
      activeMatch: null,
      settings: {
          isDoubleRoundRobin: true
      }
    };

    setGameData(newGameData);
    setAuctionPlayers(allPlayersPool.slice(0, 50)); // Pool of 50 players for auction
    setCurrentAuctionIndex(0);
  };

  return (
    <AppContext.Provider value={{
      gameData, setGameData,
      budget, setBudget,
      squad, setSquad,
      playingXI, setPlayingXI,
      auctionPlayers, setAuctionPlayers,
      currentAuctionIndex, setCurrentAuctionIndex,
      matchSettings, setMatchSettings,
      initializeGame
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
