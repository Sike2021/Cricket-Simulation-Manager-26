import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  Settings, 
  ChevronRight,
  Trophy,
  Activity,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TEAMS, PLAYERS, MATCHES } from './data';
import { Team, Player, Match } from './types';
import Squad from './components/Squad';
import Fixtures from './components/Fixtures';
import Stats from './components/Stats';
import Market from './components/Market';
import MatchView from './components/MatchView';
import { quickSimulateMatch } from './services/geminiService';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-accent text-bg shadow-[0_0_20px_rgba(0,255,136,0.3)]' 
        : 'text-ink/60 hover:text-ink hover:bg-white/5'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto"><ChevronRight size={16} /></motion.div>}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-card-bg border border-border p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="text-ink/60 text-sm font-medium mb-1">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const Dashboard = ({ team, nextMatch, onPlay, onQuickSimulate }: { team: Team, nextMatch: Match | undefined, onPlay: () => void, onQuickSimulate: () => void }) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-2xl font-bold">Season Overview</h3>
      {nextMatch && (
        <div className="flex gap-4">
          <button 
            onClick={onQuickSimulate}
            className="bg-white/5 text-ink/60 px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            Quick Simulate
          </button>
          <button 
            onClick={onPlay}
            className="bg-accent text-bg px-8 py-3 rounded-2xl font-black uppercase tracking-tighter hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all flex items-center gap-2"
          >
            <Activity size={20} />
            Play Next Match
          </button>
        </div>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="League Position" value="2nd" icon={Trophy} color="yellow-500" />
      <StatCard label="Team Form" value="W W L W W" icon={Activity} color="green-500" />
      <StatCard label="Budget" value={`$${(team.budget / 1000000).toFixed(1)}M`} icon={DollarSign} color="emerald-500" />
      <StatCard label="Win Rate" value={`${((team.won / team.played) * 100).toFixed(0)}%`} icon={TrendingUp} color="blue-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-card-bg border border-border rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6">Recent Performance</h3>
        <div className="h-64 flex items-end gap-4">
          {[65, 45, 85, 30, 90, 55, 75].map((h, i) => (
            <div key={i} className="flex-1 group relative">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="bg-accent/20 group-hover:bg-accent transition-colors rounded-t-lg"
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono">
                {h}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-ink/40 font-mono">
          <span>MATCH 1</span>
          <span>MATCH 7</span>
        </div>
      </div>

      <div className="bg-card-bg border border-border rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6">Top Performers</h3>
        <div className="space-y-6">
          {PLAYERS.slice(0, 3).map((player, i) => (
            <div key={player.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-bold text-accent">
                {i + 1}
              </div>
              <div>
                <div className="font-bold">{player.name}</div>
                <div className="text-sm text-ink/40">{player.role}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-mono font-bold">{player.stats.runs || player.stats.wickets}</div>
                <div className="text-[10px] text-ink/40 uppercase tracking-wider">
                  {player.role === 'Bowler' ? 'WICKETS' : 'RUNS'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myTeam, setMyTeam] = useState<Team>(TEAMS[0]);
  const [allPlayers, setAllPlayers] = useState<Player[]>(PLAYERS);
  const [allMatches, setAllMatches] = useState<Match[]>(MATCHES);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  const handleUpdateTeam = (updatedTeam: Team) => {
    setMyTeam(updatedTeam);
  };

  const handleUpdatePlayers = (updatedPlayers: Player[]) => {
    setAllPlayers(updatedPlayers);
  };

  const nextMatch = allMatches.find(m => m.status === 'Upcoming' && (m.homeTeamId === myTeam.id || m.awayTeamId === myTeam.id));

  const handlePlayMatch = (match: Match) => {
    setCurrentMatch(match);
    setActiveTab('simulation');
  };

  const handleQuickSimulate = async (match: Match) => {
    const homeTeam = TEAMS.find(t => t.id === match.homeTeamId)!;
    const awayTeam = TEAMS.find(t => t.id === match.awayTeamId)!;
    
    const result = await quickSimulateMatch(homeTeam, awayTeam);
    
    const updatedMatch: Match = {
      ...match,
      status: 'Completed',
      result: result.result,
      score: {
        home: result.homeScore,
        away: result.awayScore
      }
    };

    setAllMatches(prev => prev.map(m => m.id === match.id ? updatedMatch : m));
    
    // Update team stats (simplified)
    const isHomeWin = result.result.toLowerCase().includes(homeTeam.name.toLowerCase());
    if (match.homeTeamId === myTeam.id) {
      setMyTeam(prev => ({
        ...prev,
        played: prev.played + 1,
        won: prev.won + (isHomeWin ? 1 : 0),
        lost: prev.lost + (isHomeWin ? 0 : 1),
        points: prev.points + (isHomeWin ? 2 : 0)
      }));
    } else if (match.awayTeamId === myTeam.id) {
      setMyTeam(prev => ({
        ...prev,
        played: prev.played + 1,
        won: prev.won + (!isHomeWin ? 1 : 0),
        lost: prev.lost + (!isHomeWin ? 0 : 1),
        points: prev.points + (!isHomeWin ? 2 : 0)
      }));
    }
  };

  const handleMatchComplete = (matchId: string, result: string, score: any) => {
    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;

    const updatedMatch: Match = {
      ...match,
      status: 'Completed',
      result,
      score
    };

    setAllMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
    
    // Update team stats
    const isHomeWin = result.toLowerCase().includes(TEAMS.find(t => t.id === match.homeTeamId)!.name.toLowerCase());
    if (match.homeTeamId === myTeam.id) {
      setMyTeam(prev => ({
        ...prev,
        played: prev.played + 1,
        won: prev.won + (isHomeWin ? 1 : 0),
        lost: prev.lost + (isHomeWin ? 0 : 1),
        points: prev.points + (isHomeWin ? 2 : 0)
      }));
    } else if (match.awayTeamId === myTeam.id) {
      setMyTeam(prev => ({
        ...prev,
        played: prev.played + 1,
        won: prev.won + (!isHomeWin ? 1 : 0),
        lost: prev.lost + (!isHomeWin ? 0 : 1),
        points: prev.points + (!isHomeWin ? 2 : 0)
      }));
    }
    
    setActiveTab('dashboard');
    setCurrentMatch(null);
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-bg font-black italic">
            C26
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            Cricket <span className="text-accent">Manager</span>
          </h1>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Users} 
            label="Squad" 
            active={activeTab === 'squad'} 
            onClick={() => setActiveTab('squad')} 
          />
          <SidebarItem 
            icon={Calendar} 
            label="Fixtures" 
            active={activeTab === 'fixtures'} 
            onClick={() => setActiveTab('fixtures')} 
          />
          <SidebarItem 
            icon={TrendingUp} 
            label="Stats" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
          />
          <SidebarItem 
            icon={ShoppingBag} 
            label="Market" 
            active={activeTab === 'market'} 
            onClick={() => setActiveTab('market')} 
          />
        </nav>

        <div className="mt-auto">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-ink/40">Welcome back, Manager. Season 2026 is in full swing.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-bold">{myTeam.name}</div>
              <div className="text-sm text-accent font-mono">PREMIUM FRANCHISE</div>
            </div>
            <img 
              src={myTeam.logo} 
              alt="Team Logo" 
              className="w-12 h-12 rounded-2xl border border-border"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                team={myTeam} 
                nextMatch={nextMatch}
                onPlay={() => nextMatch && handlePlayMatch(nextMatch)}
                onQuickSimulate={() => nextMatch && handleQuickSimulate(nextMatch)}
              />
            )}
            {activeTab === 'squad' && (
              <Squad 
                players={myTeam.squad} 
                team={myTeam} 
                onUpdateTeam={handleUpdateTeam} 
              />
            )}
            {activeTab === 'fixtures' && (
              <Fixtures 
                matches={allMatches} 
                teams={TEAMS} 
                onPlay={handlePlayMatch}
                onSimulate={handleQuickSimulate}
              />
            )}
            {activeTab === 'stats' && <Stats players={allPlayers} />}
            {activeTab === 'market' && (
              <Market 
                myTeam={myTeam} 
                allPlayers={allPlayers} 
                onUpdateTeam={handleUpdateTeam} 
                onUpdatePlayers={handleUpdatePlayers} 
              />
            )}
            {activeTab === 'simulation' && currentMatch && (
              <MatchView 
                battingTeam={TEAMS.find(t => t.id === currentMatch.homeTeamId)!} 
                bowlingTeam={TEAMS.find(t => t.id === currentMatch.awayTeamId)!} 
                onComplete={(result, score) => handleMatchComplete(currentMatch.id, result, score)} 
              />
            )}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="bg-card-bg border border-border rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <Settings size={24} className="text-accent" />
                    General Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <div className="font-bold">Team Name</div>
                        <div className="text-sm text-ink/40">Change your franchise name</div>
                      </div>
                      <input 
                        type="text" 
                        value={myTeam.name}
                        onChange={(e) => handleUpdateTeam({...myTeam, name: e.target.value})}
                        className="bg-bg border border-border px-4 py-2 rounded-xl text-sm font-bold focus:border-accent outline-none transition-all"
                      />
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <div className="font-bold">Short Name</div>
                        <div className="text-sm text-ink/40">3-letter abbreviation</div>
                      </div>
                      <input 
                        type="text" 
                        maxLength={3}
                        value={myTeam.shortName}
                        onChange={(e) => handleUpdateTeam({...myTeam, shortName: e.target.value.toUpperCase()})}
                        className="bg-bg border border-border px-4 py-2 rounded-xl text-sm font-bold focus:border-accent outline-none transition-all w-20 text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg border border-border rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-red-500">
                    <Activity size={24} />
                    Danger Zone
                  </h3>
                  <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <p className="text-sm text-ink/60 mb-6">Resetting the game will clear all your progress, including your squad, budget, and match history. This action cannot be undone.</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                    >
                      Reset Game Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
