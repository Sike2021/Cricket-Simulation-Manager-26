import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Trophy, Award, Star, Users, 
    ChevronRight, Check, Lock, Zap,
    Shield, BarChart3, History, Calendar,
    TrendingUp, DollarSign, Briefcase,
    Info, AlertCircle, UserPlus, UserMinus,
    ArrowRight, LayoutGrid, List, Search, Filter,
    Play, FastForward, MapPin, Clock,
    TrendingUp as TrendingUpIcon, Target, Activity
} from 'lucide-react';
import { GameData, Team, CareerScreen } from '../types';
import { Icons } from './Icons';
import { SPONSOR_THRESHOLDS, TOURNAMENT_LOGOS } from '../data';

interface DashboardProps {
    gameData: GameData;
    userTeam: Team | null;
    setScreen: (screen: CareerScreen) => void;
    handlePlayMatch: () => void;
    handleForwardDay: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ gameData, userTeam, setScreen, handlePlayMatch, handleForwardDay }) => {
    const currentSchedule = gameData.schedule[gameData.currentFormat];
    const matchIndex = gameData.currentMatchIndex[gameData.currentFormat];
    const sponsorship = gameData.sponsorships?.[gameData.currentFormat];
    const popularity = gameData.popularity || 0;
    const currentThresholds = SPONSOR_THRESHOLDS[gameData.currentFormat] || {};

    if (matchIndex >= currentSchedule.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#050808] p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 mb-8 animate-pulse">
                    <Trophy className="w-12 h-12 text-teal-500" />
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">TOURNAMENT_COMPLETE</h2>
                <p className="text-white/40 text-sm font-medium uppercase tracking-[0.3em] mb-8">Calculating final standings and season awards...</p>
                <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full bg-teal-500"
                    />
                </div>
            </div>
        );
    }

    let nextMatch = { ...currentSchedule[matchIndex] };
    if (nextMatch.group !== 'Round-Robin') {
        const standings = gameData.standings[gameData.currentFormat];
        const getTeamName = (pos: number) => standings.length >= pos ? standings[pos - 1]?.teamName : `TBD ${pos}`;
        const resolvePlaceholder = (placeholder: string) => {
            if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) {
                return getTeamName(parseInt(placeholder[0], 10));
            }
            if (placeholder.startsWith('SF')) {
                const sfMatchNumber = placeholder.split(' ')[0];
                const sfResult = gameData.matchResults[gameData.currentFormat].find(r => r && r.matchNumber === sfMatchNumber);
                if (sfResult?.winnerId) {
                    return gameData.teams.find(t => t.id === sfResult.winnerId)?.name || 'TBD';
                }
                return `Winner of ${sfMatchNumber}`;
            }
            return placeholder;
        };
        nextMatch.teamA = resolvePlaceholder(nextMatch.teamA);
        nextMatch.teamB = resolvePlaceholder(nextMatch.teamB);
    }

    const isUserMatch = userTeam ? (
        nextMatch.teamA.trim().toLowerCase() === userTeam.name.trim().toLowerCase() || 
        nextMatch.teamB.trim().toLowerCase() === userTeam.name.trim().toLowerCase()
    ) : false;
    
    const teamAData = gameData.allTeamsData.find(t => t.name === nextMatch.teamA);
    const homeGround = teamAData ? gameData.grounds.find(g => g.code === teamAData.homeGround) : null;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Briefcase className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">FRANCHISE_HUB // v2.0</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">
                            {userTeam?.name.split(' ')[0] || 'FRANCHISE'}<br/>
                            <span className="text-teal-500">{userTeam?.name.split(' ').slice(1).join(' ') || 'MANAGEMENT'}</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center min-w-[160px] bg-white/5">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">AVAILABLE_PURSE</p>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-teal-500" />
                                <p className="text-3xl font-black font-mono text-white italic">{userTeam?.purse?.toFixed(2) || '0.00'}<span className="text-sm text-teal-500 ml-1">Cr</span></p>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center min-w-[120px] bg-white/5">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">POPULARITY</p>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <p className="text-3xl font-black font-mono text-white italic">{popularity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Next Match Card */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-teal-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">UPCOMING_FIXTURE</h3>
                            </div>

                            <div className="glass-card rounded-[48px] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                                    <Zap className="w-48 h-48" />
                                </div>
                                
                                <div className="p-10 relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                                        {/* Team A */}
                                        <div className="flex flex-col items-center text-center space-y-4 flex-1">
                                            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-700">
                                                <div className="text-4xl font-black italic text-white/20">{nextMatch.teamA[0]}</div>
                                            </div>
                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{nextMatch.teamA}</h4>
                                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">HOME_TEAM</span>
                                        </div>

                                        {/* VS Divider */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
                                                <span className="text-sm font-black italic text-teal-500">VS</span>
                                            </div>
                                            <div className="h-12 w-px bg-gradient-to-b from-teal-500/50 to-transparent" />
                                        </div>

                                        {/* Team B */}
                                        <div className="flex flex-col items-center text-center space-y-4 flex-1">
                                            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-700">
                                                <div className="text-4xl font-black italic text-white/20">{nextMatch.teamB[0]}</div>
                                            </div>
                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{nextMatch.teamB}</h4>
                                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">AWAY_TEAM</span>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">VENUE</span>
                                                <span className="text-xs font-black italic uppercase tracking-tight">{homeGround?.name || 'National Stadium'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">FORMAT</span>
                                                <span className="text-xs font-black italic uppercase tracking-tight">{gameData.currentFormat}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">STATUS</span>
                                                <span className="text-xs font-black italic uppercase tracking-tight text-teal-400">READY_FOR_PLAY</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Buttons Overlay */}
                                <div className="p-10 pt-0 flex flex-col md:flex-row gap-4 relative z-10">
                                    {isUserMatch ? (
                                        <button 
                                            onClick={handlePlayMatch}
                                            className="flex-1 py-5 rounded-2xl bg-teal-500 text-black text-sm font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 group/btn"
                                        >
                                            <Play className="w-5 h-5 fill-current" />
                                            PLAY_MATCH
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleForwardDay}
                                            className="flex-1 py-5 rounded-2xl bg-white/10 border border-white/10 text-white text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3 group/btn"
                                        >
                                            <FastForward className="w-5 h-5" />
                                            SIMULATE_DAY
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Stats & Activity Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Recent Performance */}
                            <div className="glass-card p-8 rounded-[40px] border-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <TrendingUpIcon className="w-5 h-5 text-blue-500" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">PERFORMANCE_TREND</h4>
                                    </div>
                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">LAST_5_MATCHES</span>
                                </div>
                                <div className="flex items-end gap-2 h-24">
                                    {[65, 45, 85, 70, 95].map((val, i) => (
                                        <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${val}%` }}
                                                transition={{ delay: i * 0.1, duration: 1 }}
                                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg group-hover:from-teal-500 group-hover:to-teal-300 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">WIN_RATE</span>
                                        <span className="text-xl font-black italic uppercase tracking-tighter">72.4%</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">FORM</span>
                                        <span className="text-xl font-black italic uppercase tracking-tighter text-teal-400">EXCELLENT</span>
                                    </div>
                                </div>
                            </div>

                            {/* Squad Status */}
                            <div className="glass-card p-8 rounded-[40px] border-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-purple-500" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">SQUAD_READINESS</h4>
                                    </div>
                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">ACTIVE_ROSTER</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">FITNESS_LEVEL</span>
                                        <span className="text-sm font-black font-mono text-teal-400 italic">98%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-[98%] h-full bg-teal-500" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">MORALE_INDEX</span>
                                        <span className="text-sm font-black font-mono text-blue-400 italic">84%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-[84%] h-full bg-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Quick Actions */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">QUICK_OPERATIONS</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setScreen('lineups')}
                                    className="glass-card p-6 rounded-3xl border-white/5 hover:border-teal-500/30 transition-all group flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-black transition-all">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">LINEUPS</span>
                                </button>
                                <button 
                                    onClick={() => setScreen('transfers')}
                                    className="glass-card p-6 rounded-3xl border-white/5 hover:border-teal-500/30 transition-all group flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-black transition-all">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">TRANSFERS</span>
                                </button>
                                <button 
                                    onClick={() => setScreen('standings')}
                                    className="glass-card p-6 rounded-3xl border-white/5 hover:border-teal-500/30 transition-all group flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-black transition-all">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">STANDINGS</span>
                                </button>
                                <button 
                                    onClick={() => setScreen('stats')}
                                    className="glass-card p-6 rounded-3xl border-white/5 hover:border-teal-500/30 transition-all group flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-black transition-all">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">STATISTICS</span>
                                </button>
                            </div>
                        </section>

                        {/* Sponsorship Status */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">PARTNER_STATUS</h3>
                            </div>
                            <div className="glass-card p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6" dangerouslySetInnerHTML={{ __html: sponsorship?.tournamentLogo || TOURNAMENT_LOGOS[0].svg }} />
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter mb-2">{sponsorship?.tournamentName || 'Elite League'}</h4>
                                    <div className="flex items-center gap-2 mb-8">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">POWERED_BY</span>
                                        <span className={`text-[10px] font-black italic uppercase ${sponsorship?.logoColor || 'text-teal-400'}`}>{sponsorship?.sponsorName || 'SIKE_CORP'}</span>
                                    </div>
                                    <button 
                                        onClick={() => setScreen('sponsorRoom')}
                                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        MANAGE_PARTNERSHIPS
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
