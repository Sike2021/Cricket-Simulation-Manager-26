import React, { useState } from 'react';
import { TEAMS, PLAYERS } from './data';
import { Team, Player } from './types';
import MatchView from './components/MatchView';
import Squad from './components/Squad';
import Market from './components/Market';
import Stats from './components/Stats';
import { Trophy, Users, ShoppingCart, BarChart3, PlayCircle, Settings, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Fixtures from './components/Fixtures';
import { MATCHES } from './data';

export default function App() {
  const [activeTab, setActiveTab] = useState<'MATCH' | 'SQUAD' | 'MARKET' | 'STATS' | 'FIXTURES'>('SQUAD');
  const [userTeam, setUserTeam] = useState<Team>(TEAMS[0]);
  const [opponentTeam, setOpponentTeam] = useState<Team>(TEAMS[1]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showTeamSelect, setShowTeamSelect] = useState(false);

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setUserTeam(prev => ({
      ...prev,
      squad: prev.squad.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    }));
  };

  const startNewGame = (selectedTeam: Team) => {
    setUserTeam(selectedTeam);
    // Pick a random opponent that isn't the user team
    const otherTeams = TEAMS.filter(t => t.id !== selectedTeam.id);
    setOpponentTeam(otherTeams[Math.floor(Math.random() * otherTeams.length)]);
    setGameStarted(true);
    setActiveTab('MATCH');
    setShowTeamSelect(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-teal selection:text-bg">
      {/* Stadium Visuals */}
      <div className="stadium-bg" />
      <div className="stadium-silhouette" />

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-card-bg/80 backdrop-blur-2xl border-t border-border z-50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {[
            { id: 'SQUAD', icon: Users, label: 'Squad' },
            { id: 'MATCH', icon: PlayCircle, label: 'Match' },
            { id: 'FIXTURES', icon: Calendar, label: 'Fixtures' },
            { id: 'MARKET', icon: ShoppingCart, label: 'Market' },
            { id: 'STATS', icon: BarChart3, label: 'Stats' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id ? 'text-teal scale-110' : 'text-ink/40 hover:text-ink'
              }`}
            >
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Header */}
      <header className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-bg/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal rounded-2xl flex items-center justify-center shadow-lg glow-teal">
            <Trophy size={24} className="text-bg" />
          </div>
          <div>
            <h1 className="text-2xl font-display tracking-tighter leading-none">Cricket Manager</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal">Pro Edition • Offline</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-ink/40">Active Team</div>
            <div className="text-sm font-bold">{userTeam.name}</div>
          </div>
          <button 
            onClick={() => setShowTeamSelect(true)}
            className="p-3 bg-teal text-bg rounded-2xl hover:scale-105 transition-all shadow-lg glow-teal"
            title="New Game"
          >
            <PlayCircle size={20} />
          </button>
          <button className="p-3 bg-white/5 border border-border rounded-2xl hover:bg-white/10 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'SQUAD' && (
              <Squad 
                players={userTeam.squad} 
                onUpdatePlayer={handleUpdatePlayer}
              />
            )}
            
            {activeTab === 'MATCH' && (
              <MatchView 
                battingTeam={userTeam} 
                bowlingTeam={opponentTeam}
                onComplete={() => setGameStarted(false)}
              />
            )}

            {activeTab === 'MARKET' && (
              <Market 
                players={PLAYERS.filter(p => !userTeam.squad.find(up => up.id === p.id))}
                onBuyPlayer={(player: Player) => {
                  if (userTeam.squad.length < 16) {
                    setUserTeam(prev => ({
                      ...prev,
                      squad: [...prev.squad, player]
                    }));
                  }
                }}
              />
            )}

            {activeTab === 'STATS' && (
              <Stats players={userTeam.squad} />
            )}

            {activeTab === 'FIXTURES' && (
              <Fixtures matches={MATCHES} teams={TEAMS} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Team Selection Modal */}
      <AnimatePresence>
        {showTeamSelect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 backdrop-blur-2xl p-6"
          >
            <div className="max-w-2xl w-full space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-display tracking-tighter">Choose Your Side</h2>
                <p className="text-ink/40 font-black uppercase tracking-widest text-xs">Select a team to begin your management career</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {TEAMS.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => startNewGame(team)}
                    className="group relative bg-card-bg border border-border rounded-[40px] p-10 hover:border-teal transition-all hover:scale-105 text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Trophy size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="w-20 h-20 bg-bg border border-border rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="text-3xl font-display tracking-tight leading-none mb-2">{team.name}</h4>
                        <div className="flex gap-4">
                          <div className="text-[10px] font-black uppercase tracking-widest text-teal">Budget: ${(team.budget / 1000000).toFixed(1)}M</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-ink/40">Squad: {team.squad.length} Players</div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowTeamSelect(false)}
                className="w-full py-4 text-ink/40 font-black uppercase tracking-widest text-xs hover:text-ink transition-colors"
              >
                Cancel Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Game Overlay if not started */}
      {!gameStarted && activeTab === 'MATCH' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-xl p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="w-32 h-32 bg-teal/20 rounded-[40px] flex items-center justify-center mx-auto glow-teal">
              <PlayCircle size={64} className="text-teal" />
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-display tracking-tighter">Ready for Match?</h2>
              <p className="text-ink/60 font-medium">Your squad is prepared. Tactical settings are locked. Let's hit the field.</p>
            </div>
            <button 
              onClick={() => setShowTeamSelect(true)}
              className="w-full bg-teal text-bg py-6 rounded-[32px] font-black text-xl uppercase tracking-tighter shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              Start New Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
