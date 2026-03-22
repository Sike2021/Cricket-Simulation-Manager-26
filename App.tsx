import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, GameData, Team, Format, MatchResult, Standing, Player } from './types';
import { PLAYERS, TEAMS, GROUNDS, PRE_BUILT_SQUADS, INITIAL_SPONSORSHIPS, INITIAL_NEWS } from './data';
import { LoadingSpinner, generateLeagueSchedule } from './utils';

// Components
import MainMenu from './components/MainMenu';
import TeamSelection from './components/TeamSelection';
import CareerHub from './components/CareerHub';
import AuctionRoom from './components/AuctionRoom';

export const MAX_SQUAD_SIZE = 22;
export const MIN_SQUAD_SIZE = 15;
export const MAX_FOREIGN_PLAYERS = 3;

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] bg-[#050808] flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 bg-teal-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-500/40 rotate-12">
          <span className="text-6xl font-black text-white -rotate-12 tracking-tighter">CM</span>
        </div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-2 border-dashed border-teal-500/30 rounded-full"
        />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2"
      >
        Cricket Manager
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-teal-500 font-black tracking-[0.3em] uppercase text-[10px]"
      >
        The Next Generation
      </motion.p>

      <div className="absolute bottom-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-full bg-teal-500"
        />
      </div>
    </motion.div>
  );
};

export const App = () => {
  const [appState, setAppState] = useState<AppState>('MAIN_MENU');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [hasSaveData, setHasSaveData] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('cricketManagerTheme') || 'dark';
    setTheme(savedTheme as 'light' | 'dark');
    const savedGame = localStorage.getItem('cricketManagerSave');
    if (savedGame) {
        setHasSaveData(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
    localStorage.setItem('cricketManagerTheme', theme);
  }, [theme]);

  useEffect(() => {
    if (gameData && !isLoading) {
      localStorage.setItem('cricketManagerSave', JSON.stringify(gameData));
      setHasSaveData(true);
    }
  }, [gameData, isLoading]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const saveGame = () => {
    showFeedback("Progress is saved automatically!");
  };

  const loadGame = () => {
    if (window.confirm("Loading a saved game will overwrite your current unsaved progress. Continue?")) {
        const savedGame = localStorage.getItem('cricketManagerSave');
        if (savedGame) {
            try {
                setGameData(JSON.parse(savedGame));
                showFeedback("Game Loaded!", "success");
                setAppState('CAREER_HUB');
            } catch (e) {
                console.error("Failed to parse saved game data during load:", e);
                localStorage.removeItem('cricketManagerSave');
                setHasSaveData(false);
                showFeedback("Failed to load saved game. It may be corrupt.", "error");
            }
        } else {
            showFeedback("No saved game found.", "error");
        }
    }
  };

  const resumeGame = () => {
    const savedGame = localStorage.getItem('cricketManagerSave');
    if (savedGame) {
        try {
            setGameData(JSON.parse(savedGame));
            setAppState('CAREER_HUB');
            showFeedback("Game Resumed!", "success");
        } catch(e) {
            console.error("Failed to parse saved game data:", e);
            localStorage.removeItem('cricketManagerSave');
            setHasSaveData(false);
            showFeedback("Failed to load saved game. It may be corrupt.", "error");
        }
    }
  };

  const handleStartNewGame = () => {
    if (hasSaveData && !window.confirm("Starting a new game will overwrite your saved progress. Are you sure?")) {
        return;
    }
    setAppState('TEAM_SELECTION');
  };

  const initializeNewGame = (userTeamId: string) => {
    setIsLoading(true);
    const allPlayersPool = [...PLAYERS].sort(() => Math.random() - 0.5);
    const initialTeamsData = [...TEAMS];
    const usedPlayerIds = new Set<string>();

    const initialTeams: Team[] = initialTeamsData.map(teamData => {
        // For a meaningful auction, we only retain a few core players (e.g., 4)
        const targetRetainedSize = 4;
        
        let squad: Player[] = [];
        // 1. Try to use pre-built if available (first 4)
        const preBuiltIds = (PRE_BUILT_SQUADS[teamData.id] || []).slice(0, targetRetainedSize);
        preBuiltIds.forEach(pid => {
            const p = PLAYERS.find(pl => pl.id === pid);
            if (p && !usedPlayerIds.has(pid)) {
                squad.push(JSON.parse(JSON.stringify(p)));
                usedPlayerIds.add(pid);
            }
        });

        // 2. If for some reason we don't have enough, fill to 4
        while (squad.length < targetRetainedSize) {
            const leftoverIndex = allPlayersPool.findIndex(p => !usedPlayerIds.has(p.id));
            if (leftoverIndex !== -1) {
                const p = allPlayersPool[leftoverIndex];
                squad.push(JSON.parse(JSON.stringify(p)));
                usedPlayerIds.add(p.id);
            } else {
                break;
            }
        }

        return { id: teamData.id, name: teamData.name, squad, captains: {}, purse: 50.0 };
    });

    const initialStandings = (teams: Team[]) => teams.map(team => ({ 
        teamId: team.id, teamName: team.name, played: 0, won: 0, lost: 0, drawn: 0, points: 0, netRunRate: 0, runsFor: 0, runsAgainst: 0 
    }));

    const schedules = {
        [Format.T20]: generateLeagueSchedule(initialTeams, Format.T20, true),
        [Format.ODI]: generateLeagueSchedule(initialTeams, Format.ODI, true),
        [Format.SHIELD]: generateLeagueSchedule(initialTeams, Format.SHIELD, true),
    };

    const newGameData: GameData = {
      userTeamId,
      teams: initialTeams,
      grounds: [...GROUNDS],
      allTeamsData: initialTeamsData,
      allPlayers: [...PLAYERS],
      schedule: schedules,
      currentMatchIndex: {
        [Format.T20]: 0,
        [Format.ODI]: 0,
        [Format.SHIELD]: 0,
      },
      standings: {
        [Format.T20]: initialStandings(initialTeams),
        [Format.ODI]: initialStandings(initialTeams),
        [Format.SHIELD]: initialStandings(initialTeams),
      },
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
    setAppState('AUCTION');
    setIsLoading(false);
  };

  const handleAuctionComplete = (finalTeams: Team[]) => {
      setGameData(prev => {
          if (!prev) return null;
          return { ...prev, teams: finalTeams };
      });
      setAppState('CAREER_HUB');
      showFeedback("Draft Room Closed! Ready for Match 1.", "success");
  };

  const resetGame = () => {
      if (window.confirm("Reset all progress?")) {
          localStorage.removeItem('cricketManagerSave');
          setGameData(null);
          setAppState('MAIN_MENU');
          setHasSaveData(false);
          showFeedback("Reset successful.", "success");
      }
  };

  const renderContent = () => {
    if (isLoading) {
        return (
          <div className="bg-[#050808] h-full flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black tracking-widest text-teal-500 uppercase">Loading Data...</p>
          </div>
        );
    }
    switch(appState) {
        case 'MAIN_MENU': return <MainMenu onStartNewGame={handleStartNewGame} onResumeGame={resumeGame} hasSaveData={hasSaveData} />;
        case 'TEAM_SELECTION': return <TeamSelection onTeamSelected={initializeNewGame} theme={theme} />;
        case 'AUCTION': return gameData ? <AuctionRoom gameData={gameData} onAuctionComplete={handleAuctionComplete} /> : null;
        case 'CAREER_HUB': return gameData ? <CareerHub gameData={gameData} setGameData={setGameData} onResetGame={resetGame} theme={theme} setTheme={setTheme} saveGame={saveGame} loadGame={loadGame} showFeedback={showFeedback} /> : null;
        default: return <div>Error</div>;
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md h-screen max-h-[932px] bg-gray-50 dark:bg-[#050808] border-4 border-gray-300 dark:border-gray-700 rounded-[60px] shadow-2xl shadow-black/50 overflow-hidden relative text-gray-900 dark:text-gray-200 flex flex-col">
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>
        {renderContent()}
        {feedbackMessage && (
            <div className={`absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg z-50 shadow-lg text-white font-semibold ${feedbackMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {feedbackMessage.text}
            </div>
        )}
      </div>
    </div>
  );
};