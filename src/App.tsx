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

const Dashboard = ({ team, onSimulate }: { team: Team, onSimulate: () => void }) => {
  const [showNewGame, setShowNewGame] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold">Season Overview</h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowNewGame(true)}
            className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-tighter hover:bg-white/10 transition-all flex items-center gap-2"
          >
            New Game
          </button>
          <button 
            onClick={onSimulate}
            className="bg-accent text-bg px-8 py-3 rounded-2xl font-black uppercase tracking-tighter hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all flex items-center gap-2"
          >
            <Activity size={20} />
            Simulate Next Match
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNewGame && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card-bg border border-border rounded-[40px] p-12 max-w-2xl w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-accent rounded-full" />
              </div>

              <div className="relative z-10 text-center">
                <h2 className="text-4xl font-display uppercase tracking-tighter mb-4">Initialize Match</h2>
                <p className="text-ink/60 mb-12">Prepare your squad for the upcoming fixture against {TEAMS[1].name}.</p>

                <div className="flex justify-center items-center gap-8 mb-12">
                  <div className="text-center">
                    <img src={team.logo} alt={team.name} className="w-24 h-24 rounded-3xl border border-border mb-4 mx-auto" referrerPolicy="no-referrer" />
                    <div className="font-display text-2xl uppercase tracking-tighter">{team.shortName}</div>
                  </div>
                  <div className="text-4xl font-black text-ink/20">VS</div>
                  <div className="text-center">
                    <img src={TEAMS[1].logo} alt={TEAMS[1].name} className="w-24 h-24 rounded-3xl border border-border mb-4 mx-auto" referrerPolicy="no-referrer" />
                    <div className="font-display text-2xl uppercase tracking-tighter">{TEAMS[1].shortName}</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setShowNewGame(false)}
                    className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowNewGame(false);
                      onSimulate();
                    }}
                    className="bg-accent text-bg px-12 py-4 rounded-2xl font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all"
                  >
                    Start Match
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myTeam, setMyTeam] = useState(TEAMS[0]);

  const updatePlayer = (updatedPlayer: Player) => {
    setMyTeam(prev => ({
      ...prev,
      squad: prev.squad.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    }));
  };

  const randomizeAllAvatars = () => {
    setMyTeam(prev => ({
      ...prev,
      squad: prev.squad.map(p => ({
        ...p,
        avatar: {
          type: 'svg',
          svgConfig: {
            faceShape: Math.random() > 0.5 ? 'round' : 'oval',
            skinColor: ['#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#3d2c23'][Math.floor(Math.random() * 5)],
            hairStyle: ['short', 'curly', 'bald'][Math.floor(Math.random() * 3)],
            facialHair: ['none', 'beard', 'mustache'][Math.floor(Math.random() * 3)]
          }
        }
      }))
    }));
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
            {activeTab === 'dashboard' && <Dashboard team={myTeam} onSimulate={() => setActiveTab('simulation')} />}
            {activeTab === 'squad' && <Squad players={myTeam.squad} onUpdatePlayer={updatePlayer} onRandomizeAll={randomizeAllAvatars} />}
            {activeTab === 'fixtures' && <Fixtures matches={MATCHES} teams={TEAMS} />}
            {activeTab === 'stats' && <Stats players={PLAYERS} />}
            {activeTab === 'market' && <Market />}
            {activeTab === 'simulation' && <MatchView battingTeam={myTeam} bowlingTeam={TEAMS[1]} onComplete={() => setActiveTab('dashboard')} />}
            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center h-96 text-ink/20">
                <Activity size={64} className="mb-4 opacity-10" />
                <p className="text-xl font-medium uppercase tracking-widest">Module Under Construction</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
