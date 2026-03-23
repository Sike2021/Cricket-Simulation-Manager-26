
import React from 'react';
import { motion } from 'motion/react';
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
            <div className="p-4 text-center h-full flex items-center justify-center">
                <p>Tournament finished, calculating results...</p>
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
                const sfResult = gameData.matchResults[gameData.currentFormat].find(r => r.matchNumber === sfMatchNumber);
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

    // Safety fix: Case-insensitive and trimmed name comparison for user match detection
    const isUserMatch = userTeam ? (
        nextMatch.teamA.trim().toLowerCase() === userTeam.name.trim().toLowerCase() || 
        nextMatch.teamB.trim().toLowerCase() === userTeam.name.trim().toLowerCase()
    ) : false;
    
    const teamAData = gameData.allTeamsData.find(t => t.name === nextMatch.teamA);
    const homeGround = teamAData ? gameData.grounds.find(g => g.code === teamAData.homeGround) : null;

    const renderTournamentLogo = () => {
        if (sponsorship?.tournamentLogo) {
            return <div className={`w-8 h-8 mx-auto mb-1 ${sponsorship.logoColor}`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo}}></div>;
        }
        return <div className="w-8 h-8 mx-auto mb-1 text-slate-300" dangerouslySetInnerHTML={{__html: TOURNAMENT_LOGOS[0].svg}}></div>;
    };

    return (
        <div className="p-6 space-y-8 bg-[#E4E3E0] dark:bg-[#041414] min-h-full font-sans text-[#141414] dark:text-[#E4E3E0]">
            <header className="card-signify flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 text-white px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest rounded">LIVE_SYSTEM</span>
                        <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest">SEASON {gameData.currentSeason} // {gameData.currentFormat}</p>
                    </div>
                    {sponsorship ? (
                         <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none font-display text-white">
                            {sponsorship.sponsorName} <span className="text-white/60 font-light not-italic">{sponsorship.tournamentName}</span>
                        </h1>
                    ) : (
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none font-display text-white">{gameData.currentFormat}</h1>
                    )}
                    <p className="text-xs font-mono font-bold mt-3 text-white/80 uppercase tracking-tight border-l-2 border-white/40 pl-3">OPERATIONAL_UNIT: {userTeam?.name || 'N/A'}</p>
                </div>
                <div className="text-right hidden md:block">
                    {renderTournamentLogo()}
                    <p className="text-[10px] font-mono font-bold mt-1 tracking-widest text-white/50">OFFICIAL_BOARD</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Next Match Card */}
                <div className="card-green relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-white/20 text-white px-4 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-bl-xl">
                        NEXT_ENGAGEMENT
                    </div>
                    
                    <div className="mt-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-white/50 uppercase mb-1">HOME_FRANCHISE</span>
                                <span className="text-3xl font-black uppercase tracking-tighter font-display text-white">{nextMatch.teamA}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-light italic text-white/20 font-display">VS</span>
                                <div className="w-px h-8 bg-white/10" />
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] font-mono text-white/50 uppercase mb-1">AWAY_FRANCHISE</span>
                                <span className="text-3xl font-black uppercase tracking-tighter font-display text-white">{nextMatch.teamB}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight italic text-white">{homeGround?.name || 'Neutral Venue'}</p>
                                <p className="text-[10px] font-mono text-white/60 uppercase mt-1">{nextMatch.date}</p>
                            </div>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 bg-white/40" />)}
                            </div>
                        </div>

                        {isUserMatch ? (
                            <button 
                                onClick={handlePlayMatch} 
                                className="w-full bg-white text-emerald-700 font-black py-5 px-6 uppercase tracking-widest text-lg italic hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center space-x-4 shadow-xl rounded-xl"
                            >
                                <Icons.PlayMatch />
                                <span>COMMENCE_MATCH</span>
                            </button>
                        ) : (
                            <button 
                                onClick={handleForwardDay} 
                                className="w-full border-2 border-white/30 text-white font-black py-5 px-6 uppercase tracking-widest text-lg italic hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-4 rounded-xl"
                            >
                                <Icons.PlayMatch />
                                <span>SIMULATE_CYCLE</span>
                            </button>
                        )}
                    </div>
                </div>
            
                {/* Stats / Info Card */}
                <div className="space-y-6">
                    <div className="card-blue flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">FRANCHISE_POPULARITY</p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="w-40 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${popularity}%` }}
                                        className="h-full bg-white"
                                    />
                                </div>
                                <span className="text-lg font-black font-mono text-white">{popularity}%</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">TIER_STATUS</p>
                            <p className="text-xl font-black uppercase tracking-tighter italic font-display text-white">
                                {popularity >= 80 ? 'ELITE_FORCE' : popularity >= 50 ? 'PRO_UNIT' : 'ROOKIE_CLASS'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <button 
                            onClick={() => setScreen('NEWS')}
                            className="card-red p-6 text-left hover:scale-[1.02] transition-all group"
                        >
                            <p className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-2 group-hover:text-white">INTELLIGENCE_FEED</p>
                            <p className="text-sm font-black uppercase tracking-tight line-clamp-2 italic leading-tight text-white">{gameData.news?.[0]?.headline || 'NO_DATA'}</p>
                        </button>
                        <button 
                            onClick={() => setScreen('LEAGUES')}
                            className="bg-gradient-to-br from-amber-500 to-orange-700 rounded-2xl p-6 text-white shadow-2xl shadow-amber-500/30 border border-white/20 text-left hover:scale-[1.02] transition-all group"
                        >
                            <p className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-2 group-hover:text-white">RANKING_MATRIX</p>
                            <p className="text-sm font-black uppercase tracking-tight italic text-white">VIEW_STANDINGS</p>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { screen: 'LINEUPS', icon: <Icons.Lineups />, label: 'LINEUPS', color: 'bg-emerald-500' },
                    { screen: 'TRANSFERS', icon: <Icons.Transfers />, label: 'TRANSFERS', color: 'bg-blue-500' },
                    { screen: 'PLAYER_DATABASE', icon: <Icons.Database />, label: 'DATABASE', color: 'bg-indigo-500' },
                    { screen: 'RATING_BOARD', icon: <Icons.Podium />, label: 'RATING_BOARD', highlight: true, color: 'bg-teal-500' },
                ].map((item) => (
                    <button 
                        key={item.screen}
                        onClick={() => setScreen(item.screen as CareerScreen)}
                        className={`p-6 rounded-2xl border border-white/10 text-left hover:scale-[1.05] transition-all group relative overflow-hidden ${item.highlight ? 'bg-teal-600/20 border-teal-500/50' : 'bg-white/5'}`}
                    >
                        <div className={`mb-3 ${item.highlight ? 'text-teal-400' : 'text-white/40 group-hover:text-white'}`}>
                            {item.icon}
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest font-mono text-white">{item.label}</p>
                        {item.highlight && <div className="absolute top-0 right-0 w-8 h-8 bg-teal-500 rotate-45 translate-x-4 -translate-y-4" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
