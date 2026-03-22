
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
        <div className="p-4 space-y-6 bg-[#E4E3E0] dark:bg-[#0A0F0F] min-h-full font-sans text-[#141414] dark:text-[#E4E3E0]">
            <header className="border-b-2 border-[#141414] dark:border-[#E4E3E0] pb-4 flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-mono font-bold opacity-60 uppercase tracking-widest mb-1">SEASON {gameData.currentSeason} // {gameData.currentFormat}</p>
                    {sponsorship ? (
                         <h1 className={`text-4xl font-black italic uppercase tracking-tighter leading-none ${sponsorship.logoColor || 'text-teal-500'}`}>
                            {sponsorship.sponsorName} <span className="text-[#141414] dark:text-[#E4E3E0] font-light not-italic">{sponsorship.tournamentName}</span>
                        </h1>
                    ) : (
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{gameData.currentFormat}</h1>
                    )}
                    <p className="text-xs font-mono font-bold mt-2 opacity-80 uppercase tracking-tight">Manager: {userTeam?.name || 'N/A'}</p>
                </div>
                <div className="text-right hidden md:block">
                    {renderTournamentLogo()}
                    <p className="text-[10px] font-mono font-bold mt-1">OFFICIAL BOARD</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Next Match Card */}
                <div className="border-2 border-[#141414] dark:border-[#E4E3E0] p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest">
                        Next Match
                    </div>
                    
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-mono opacity-50 uppercase">Home</span>
                                <span className="text-2xl font-black uppercase tracking-tighter">{nextMatch.teamA}</span>
                            </div>
                            <span className="text-xl font-light italic opacity-30 px-4">VS</span>
                            <div className="flex flex-col text-right">
                                <span className="text-xs font-mono opacity-50 uppercase">Away</span>
                                <span className="text-2xl font-black uppercase tracking-tighter">{nextMatch.teamB}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#141414]/10 dark:border-[#E4E3E0]/10 flex justify-between items-end">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-tight">{homeGround?.name || 'Neutral Venue'}</p>
                                <p className="text-[10px] font-mono opacity-60 uppercase">{nextMatch.date}</p>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-[#141414] dark:bg-[#E4E3E0]" />)}
                            </div>
                        </div>

                        {isUserMatch ? (
                            <button 
                                onClick={handlePlayMatch} 
                                className="w-full bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] font-black py-4 px-6 uppercase tracking-widest text-sm hover:invert transition-all duration-300 flex items-center justify-center space-x-3"
                            >
                                <Icons.PlayMatch />
                                <span>Enter Match</span>
                            </button>
                        ) : (
                            <button 
                                onClick={handleForwardDay} 
                                className="w-full border-2 border-[#141414] dark:border-[#E4E3E0] text-[#141414] dark:text-[#E4E3E0] font-black py-4 px-6 uppercase tracking-widest text-sm hover:bg-[#141414] hover:text-[#E4E3E0] dark:hover:bg-[#E4E3E0] dark:hover:text-[#141414] transition-all duration-300 flex items-center justify-center space-x-3"
                            >
                                <Icons.PlayMatch />
                                <span>Simulate Day</span>
                            </button>
                        )}
                    </div>
                </div>
            
                {/* Stats / Info Card */}
                <div className="space-y-4">
                    <div className="border border-[#141414]/20 dark:border-[#E4E3E0]/20 p-4 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-mono opacity-50 uppercase">Franchise Popularity</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-32 h-2 bg-[#141414]/10 dark:bg-[#E4E3E0]/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${popularity}%` }}
                                        className="h-full bg-teal-500"
                                    />
                                </div>
                                <span className="text-sm font-black font-mono">{popularity}%</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-mono opacity-50 uppercase">Current Tier</p>
                            <p className="text-sm font-black uppercase tracking-tight">
                                {popularity >= 80 ? 'Elite' : popularity >= 50 ? 'Pro' : 'Rookie'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setScreen('NEWS')}
                            className="border border-[#141414]/20 dark:border-[#E4E3E0]/20 p-4 text-left hover:bg-[#141414]/5 dark:hover:bg-[#E4E3E0]/5 transition-colors"
                        >
                            <p className="text-[10px] font-mono opacity-50 uppercase mb-1">Latest News</p>
                            <p className="text-xs font-bold uppercase tracking-tight line-clamp-1">{gameData.news?.[0]?.headline || 'No News'}</p>
                        </button>
                        <button 
                            onClick={() => setScreen('LEAGUES')}
                            className="border border-[#141414]/20 dark:border-[#E4E3E0]/20 p-4 text-left hover:bg-[#141414]/5 dark:hover:bg-[#E4E3E0]/5 transition-colors"
                        >
                            <p className="text-[10px] font-mono opacity-50 uppercase mb-1">Standings</p>
                            <p className="text-xs font-bold uppercase tracking-tight">View Table</p>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { screen: 'LINEUPS', icon: <Icons.Lineups />, label: 'Lineups' },
                    { screen: 'TRANSFERS', icon: <Icons.Transfers />, label: 'Transfers' },
                    { screen: 'PLAYER_DATABASE', icon: <Icons.Database />, label: 'Database' },
                    { screen: 'RATING_BOARD', icon: <Icons.Podium />, label: 'Rating Board', highlight: true },
                ].map((item) => (
                    <button 
                        key={item.screen}
                        onClick={() => setScreen(item.screen as CareerScreen)}
                        className={`p-4 border ${item.highlight ? 'border-teal-500 bg-teal-500/5' : 'border-[#141414]/10 dark:border-[#E4E3E0]/10'} text-left hover:bg-[#141414] hover:text-[#E4E3E0] dark:hover:bg-[#E4E3E0] dark:hover:text-[#141414] transition-all group`}
                    >
                        <div className={`mb-2 ${item.highlight ? 'text-teal-500 group-hover:text-inherit' : 'opacity-50 group-hover:opacity-100'}`}>
                            {item.icon}
                        </div>
                        <p className="text-xs font-black uppercase tracking-tight">{item.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
