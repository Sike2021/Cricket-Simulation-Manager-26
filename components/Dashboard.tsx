
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
    onNewGame: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ gameData, userTeam, setScreen, handlePlayMatch, handleForwardDay, onNewGame }) => {
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

    // Safety fix: Case-insensitive and trimmed name comparison for user match detection
    const isUserMatch = userTeam ? (
        nextMatch.teamA.trim().toLowerCase() === userTeam.name.trim().toLowerCase() || 
        nextMatch.teamB.trim().toLowerCase() === userTeam.name.trim().toLowerCase()
    ) : false;
    
    const teamAData = gameData.allTeamsData.find(t => t.name === nextMatch.teamA);
    const homeGround = teamAData ? gameData.grounds.find(g => g.code === teamAData.homeGround) : null;

    // Calculate dynamic stats for the header
    const avgBatting = Math.round(gameData.allPlayers.reduce((acc, p) => acc + p.battingSkill, 0) / gameData.allPlayers.length) || 0;
    const avgBowling = Math.round(gameData.allPlayers.reduce((acc, p) => acc + p.secondarySkill, 0) / gameData.allPlayers.length) || 0;
    const avgStrength = Math.round((avgBatting + avgBowling) / 2);
    const stars = Math.min(5, Math.max(1, Math.floor(avgStrength / 15)));

    const renderTournamentLogo = () => {
        if (sponsorship?.tournamentLogo) {
            return <div className={`w-8 h-8 mx-auto mb-1 ${sponsorship.logoColor}`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo}}></div>;
        }
        return <div className="w-8 h-8 mx-auto mb-1 text-slate-300" dangerouslySetInnerHTML={{__html: TOURNAMENT_LOGOS[0].svg}}></div>;
    };

    return (
        <div className="p-4 space-y-6 bg-[#050808] min-h-full font-sans text-slate-100 pb-24">
            <header className="broadcast-header">
                <div>
                    <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.4em] mb-1">TOURNAMENT_FEED // {gameData.currentFormat}</p>
                    {sponsorship ? (
                         <h1 className={`text-4xl font-black italic uppercase tracking-tighter leading-none ${sponsorship.logoColor || 'text-teal-500'}`}>
                            {sponsorship.sponsorName} <span className="text-white font-light not-italic">{sponsorship.tournamentName}</span>
                        </h1>
                    ) : (
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{gameData.currentFormat}</h1>
                    )}
                </div>
                <div className="text-right flex flex-col items-end">
                    <button 
                        onClick={onNewGame}
                        className="mb-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                        New Game
                    </button>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Manager_ID</p>
                    <p className="text-xs font-black uppercase tracking-tight text-white/80">{userTeam?.name || 'N/A'}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {/* Next Match Card */}
                <div className="glass-card p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-teal-500 text-black px-5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-2xl shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                        Next Match
                    </div>
                    
                    <div className="mt-6 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Home</span>
                                <span className="text-3xl font-black uppercase tracking-tighter italic">{nextMatch.teamA}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <span className="text-sm font-black italic text-teal-500">VS</span>
                                </div>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Away</span>
                                <span className="text-3xl font-black uppercase tracking-tighter italic">{nextMatch.teamB}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">{homeGround?.name || 'Neutral Venue'}</p>
                                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{nextMatch.date}</p>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-500/20" />)}
                            </div>
                        </div>

                        {isUserMatch ? (
                            <button 
                                onClick={handlePlayMatch} 
                                className="w-full bg-teal-500 text-black font-black py-5 px-6 rounded-[20px] uppercase tracking-[0.2em] text-sm hover:bg-teal-400 transition-all duration-500 flex items-center justify-center space-x-3 shadow-2xl shadow-teal-500/30 active:scale-[0.98]"
                            >
                                <Icons.PlayMatch />
                                <span>Enter Match</span>
                            </button>
                        ) : (
                            <button 
                                onClick={handleForwardDay} 
                                className="w-full bg-white text-black font-black py-5 px-6 rounded-[20px] uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all duration-500 flex items-center justify-center space-x-3 active:scale-[0.98]"
                            >
                                <Icons.PlayMatch />
                                <span>Simulate Day</span>
                            </button>
                        )}
                    </div>
                </div>
            
                {/* Stats / Info Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-4 rounded-2xl">
                        <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest mb-2">Popularity</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-grow h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${popularity}%` }}
                                    className="h-full bg-teal-500"
                                />
                            </div>
                            <span className="text-xs font-black font-mono">{popularity}%</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col justify-center">
                        <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest mb-1">Tier</p>
                        <p className="text-xs font-black uppercase tracking-tight text-teal-500">
                            {popularity >= 80 ? 'Elite' : popularity >= 50 ? 'Pro' : 'Rookie'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {[
                    { screen: 'LINEUPS', icon: <Icons.Lineups />, label: 'Lineups' },
                    { screen: 'TRANSFERS', icon: <Icons.Transfers />, label: 'Transfers' },
                    { screen: 'PLAYER_DATABASE', icon: <Icons.Database />, label: 'Database' },
                    { screen: 'NEWS', icon: <Icons.Newspaper />, label: 'News Feed' },
                ].map((item) => (
                    <button 
                        key={item.screen}
                        onClick={() => setScreen(item.screen as CareerScreen)}
                        className="p-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl text-left hover:border-teal-500 transition-all group"
                    >
                        <div className="mb-3 text-teal-500 opacity-60 group-hover:opacity-100 transition-opacity">
                            {item.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
