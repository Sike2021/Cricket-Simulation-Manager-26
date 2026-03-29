
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Match, GameData, MatchResult, Strategy, LiveMatchState, Player, Ground, Message, Format } from '../types';
import { useLiveMatch } from '../hooks/useLiveMatch';
import { Icons } from './Icons';
import { TV_CHANNELS, INITIAL_SPONSORSHIPS, TOURNAMENT_LOGOS } from '../data';
import { getPlayerById } from '../utils';
import { streamAssistantResponse } from '../geminiService';

interface LiveMatchScreenProps {
    match: Match;
    gameData: GameData;
    onMatchComplete: (result: MatchResult) => void;
    onExit: (stateToSave?: LiveMatchState) => void;
    savedState?: LiveMatchState | null;
}

const StrategyToggle = ({ label, value, onChange }: { label: string, value: Strategy, onChange: (s: Strategy) => void }) => (
    <div className="flex flex-col items-center bg-slate-800 rounded p-1 flex-1">
        <span className="text-[9px] text-slate-400 uppercase mb-1">{label}</span>
        <div className="flex bg-slate-900 rounded p-0.5 w-full justify-center">
            {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`px-2 py-1 text-[9px] uppercase font-bold rounded transition-colors flex-1 ${value === s 
                        ? s === 'attacking' ? 'bg-red-600 text-white' : s === 'defensive' ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white' 
                        : 'text-slate-500 hover:bg-slate-700'}`}
                >
                    {s.slice(0,3)}
                </button>
            ))}
        </div>
    </div>
);

const PreMatchPanel = ({ match, gameData, onStart }: { match: Match, gameData: GameData, onStart: () => void }) => {
    const sponsorship = gameData.sponsorships?.[gameData.currentFormat] || INITIAL_SPONSORSHIPS[gameData.currentFormat];
    const teamA = gameData.teams.find(t => t.name === match.teamA);
    const teamB = gameData.teams.find(t => t.name === match.teamB);
    const ground = gameData.grounds.find(g => g.code === (gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround || 'KCG'));
    
    const getWeatherIcon = (w?: string) => {
        switch(w) {
            case 'Sunny': return '☀️';
            case 'Overcast': return '☁️';
            case 'Rainy': return '🌧️';
            case 'Humid': return '🌫️';
            default: return '🌤️';
        }
    };

    return (
        <div className="absolute inset-0 z-[120] bg-[#050808] flex flex-col p-6 font-sans overflow-y-auto">
            {/* Header */}
            <header className="broadcast-header">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${sponsorship.logoColor}`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo || TOURNAMENT_LOGOS[0].svg}}></div>
                    <div>
                        <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.4em] mb-0.5">{gameData.currentFormat} // PRE_MATCH</p>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">{sponsorship.sponsorName} {sponsorship.tournamentName}</h1>
                    </div>
                </div>
                <div className={`w-16 h-10 opacity-40`} dangerouslySetInnerHTML={{__html: sponsorship.tvLogo || ''}}></div>
            </header>

            <div className="flex-grow flex flex-col justify-center space-y-12 py-8">
                <div className="flex items-center justify-between px-4">
                    <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center space-y-4 w-1/3"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)] border-4 border-white/10 overflow-hidden">
                            <div className="w-16 h-16" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamA?.id)?.logo || ''}}></div>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter italic text-center text-white">{teamA?.name}</h2>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Home</span>
                        </div>
                    </motion.div>

                    <div className="flex flex-col items-center">
                        <div className="text-5xl font-black italic text-white/10 tracking-tighter mb-2">VS</div>
                        <div className="w-1 h-12 bg-gradient-to-b from-transparent via-teal-500 to-transparent opacity-30" />
                    </div>

                    <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center space-y-4 w-1/3"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-4 border-white/10 overflow-hidden">
                            <div className="w-16 h-16" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamB?.id)?.logo || ''}}></div>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter italic text-center text-white">{teamB?.name}</h2>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Away</span>
                        </div>
                    </motion.div>
                </div>

                <div className="glass-card p-6 mx-auto w-full max-w-md">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Match Conditions</span>
                        <div className="flex gap-1">
                            {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-teal-500 rounded-full" />)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Pitch Report</p>
                            <p className="text-sm font-bold text-teal-400">{ground?.pitch}</p>
                            <p className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter">Favors {ground?.pitch.includes('Spin') ? 'Spin' : ground?.pitch.includes('Green') ? 'Pace' : 'Batting'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Conditions</p>
                            <p className="text-sm font-bold flex items-center gap-2 text-white">
                                <span>{getWeatherIcon(ground?.weather)}</span> {ground?.weather || 'Clear'}
                            </p>
                            <p className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter">{ground?.outfieldSpeed || 'Medium'} Outfield</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6">
                <button 
                    onClick={onStart}
                    className="w-full bg-teal-500 text-black font-black py-5 px-6 rounded-[20px] uppercase tracking-[0.2em] text-sm hover:bg-teal-400 transition-all duration-500 shadow-2xl shadow-teal-500/30 active:scale-[0.98]"
                >
                    Enter Match Broadcast
                </button>
            </div>
        </div>
    );
};

const AutoArrivalNotification = ({ playerName, onOverride, secondsLeft }: { playerName: string, onOverride: () => void, secondsLeft: number }) => (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-teal-500/50 rounded-lg shadow-2xl p-4 flex items-center gap-4 animate-slide-up min-w-[300px]">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center text-teal-400 animate-pulse">
            <Icons.User className="w-6 h-6" />
        </div>
        <div className="flex-grow">
            <p className="text-[10px] text-teal-400 uppercase font-bold">Next Batter Arriving</p>
            <p className="text-white font-bold text-lg">{playerName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-mono text-slate-400">{secondsLeft}s</span>
            <div className="text-[9px] text-gray-500 uppercase">Click to skip</div>
        </div>
    </div>
);

// Broadcast Style Chat Overlay
const MatchChat = ({ gameData, onClose }: { gameData: GameData, onClose: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([{ id: '1', text: "Analyzing real-time match data... How can I assist?", sender: 'bot' }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(p => [...p, userMsg]);
        setInput('');
        setIsTyping(true);
        try {
            const botId = (Date.now()+1).toString();
            setMessages(p => [...p, { id: botId, text: '', sender: 'bot' }]);
            const stream = streamAssistantResponse(userMsg.text, messages, gameData);
            let full = '';
            for await (const chunk of stream) {
                full += chunk;
                setMessages(p => p.map(m => m.id === botId ? { ...m, text: full } : m));
            }
        } catch {
            setMessages(p => [...p, { id: Date.now().toString(), text: "Signal lost.", sender: 'bot' }]);
        } finally { setIsTyping(false); }
    };

    return (
        <div className="absolute inset-0 bg-slate-900/95 z-[130] flex flex-col p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Icons.Bot />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Match Analyst</h3>
                        <p className="text-[10px] text-cyan-400 uppercase tracking-wider">Real-Time Analyst</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700"><Icons.X /></button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-2">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-cyan-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-xs text-cyan-500 animate-pulse">Analyzing...</div>}
                <div ref={endRef} />
            </div>
            <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask for tactics..." className="flex-grow bg-slate-800 border border-slate-600 rounded-full px-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                <button onClick={send} className="bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-full"><Icons.Play className="h-5 w-5" /></button>
            </div>
        </div>
    );
};

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ match, gameData, onMatchComplete, onExit, savedState }) => {
    const { state, playBall, playOver, autoSimulate, simulateInning, simulateMatch, setBattingStrategy, setBowlingStrategy, selectOpeners, selectNextBatter, selectNextBowler, startMatch, beginMatch, declareInning, stopAutoPlay } = useLiveMatch(match, gameData, onMatchComplete, savedState);
    const commentaryRef = useRef<HTMLDivElement>(null);
    const [lastBallSpeed, setLastBallSpeed] = useState<string>("-");
    
    // Match Centre State
    const [showMatchCentre, setShowMatchCentre] = useState(false);
    const [showAnalyst, setShowAnalyst] = useState(false);
    const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'analysis'>('scorecard');
    
    const [selectedOpener1, setSelectedOpener1] = useState('');
    const [selectedOpener2, setSelectedOpener2] = useState('');
    const [selectedBatter, setSelectedBatter] = useState('');
    const [selectedBowler, setSelectedBowler] = useState('');
    const [tossState, setTossState] = useState<'coin' | 'result'>('coin');
    const [showPreMatch, setShowPreMatch] = useState(false);

    // Auto Arrival State
    const [autoArrivalSeconds, setAutoArrivalSeconds] = useState<number | null>(null);
    const autoArrivalTimerRef = useRef<any>(null);
    const [nextAutoPlayerId, setNextAutoPlayerId] = useState<string | null>(null);

    const sponsorship = gameData.sponsorships?.[gameData.currentFormat];
    const tvChannelData = TV_CHANNELS.find(t => t.name === sponsorship?.tvChannel);
    const tvLogo = sponsorship?.tvLogo;
    const tvColor = tvChannelData?.color || 'text-white';

    // Pre-match Panel Logic
    useEffect(() => {
        if (state?.status === 'ready' && !savedState) {
            setShowPreMatch(true);
        }
    }, [state?.status, savedState]);

    // Auto-select / Pre-fill logic AND Auto-Arrival
    useEffect(() => {
        if (!state) return;
        
        // Clear previous timer if state changes away from waiting
        if (!state.waitingFor) {
            if (autoArrivalTimerRef.current) {
                clearInterval(autoArrivalTimerRef.current);
                autoArrivalTimerRef.current = null;
            }
            setAutoArrivalSeconds(null);
            setNextAutoPlayerId(null);
            return;
        }

        // Helper to find next player
        const getNextPlayer = () => {
            const currentInning = state.innings[state.currentInningIndex];
            if (state.waitingFor === 'batter') {
                return currentInning.batting.find(b => !b.isOut && b.playerId !== state.currentBatters.strikerId && b.playerId !== state.currentBatters.nonStrikerId);
            } else if (state.waitingFor === 'bowler') {
                const overLimit = gameData.currentFormat.includes('T20') ? 4 : 10;
                const validBowlers = currentInning.bowling.filter(b => b.playerId !== state.currentBowlerId && b.ballsBowled < overLimit * 6);
                // Simple rotation logic for auto
                return validBowlers[0];
            }
            return null;
        };

        if (state.waitingFor === 'openers') {
             const currentInning = state.innings[state.currentInningIndex];
             const available = currentInning.batting.filter(b => !b.isOut);
             if (available.length >= 2) {
                 setSelectedOpener1(available[0].playerId);
                 setSelectedOpener2(available[1].playerId);
             }
        } else if (state.waitingFor === 'batter' || state.waitingFor === 'bowler') {
            const nextP = getNextPlayer();
            
            if (nextP) {
                // Pre-fill selection
                if (state.waitingFor === 'batter') setSelectedBatter(nextP.playerId);
                if (state.waitingFor === 'bowler') setSelectedBowler(nextP.playerId);
                setNextAutoPlayerId(nextP.playerId);

                // Start Auto-Arrival Countdown
                if (!autoArrivalTimerRef.current) {
                    setAutoArrivalSeconds(5);
                    autoArrivalTimerRef.current = setInterval(() => {
                        setAutoArrivalSeconds(prev => {
                            if (prev === 1) {
                                clearInterval(autoArrivalTimerRef.current);
                                autoArrivalTimerRef.current = null;
                                // Trigger Action
                                if (state.waitingFor === 'batter') selectNextBatter(nextP.playerId);
                                if (state.waitingFor === 'bowler') selectNextBowler(nextP.playerId);
                                return 0;
                            }
                            return (prev || 0) - 1;
                        });
                    }, 1000);
                }
            }
        }
    }, [state?.waitingFor, state?.currentInningIndex, state?.innings, state?.currentBatters, state?.currentBowlerId, gameData.currentFormat]);

    const handleOverrideAuto = () => {
        if (autoArrivalTimerRef.current) {
            clearInterval(autoArrivalTimerRef.current);
            autoArrivalTimerRef.current = null;
        }
        setAutoArrivalSeconds(null);
        setNextAutoPlayerId(null);
        
        // Immediate execution if click happens
        if (nextAutoPlayerId) {
             if (state?.waitingFor === 'batter') selectNextBatter(nextAutoPlayerId);
             if (state?.waitingFor === 'bowler') selectNextBowler(nextAutoPlayerId);
        }
    };

    useEffect(() => {
        if (activeTab === 'commentary' && commentaryRef.current) {
            commentaryRef.current.scrollTop = 0;
        }
    }, [state?.commentary, activeTab]);

    useEffect(() => {
        if (state?.recentBalls.length) {
            const baseSpeed = 130;
            const variation = Math.floor(Math.random() * 25) - 10;
            setLastBallSpeed(`${baseSpeed + variation} km/h`);
        }
    }, [state?.innings[state.currentInningIndex].overs]);

    // --- PREDICTIONS & STATS CALCULATIONS ---
    const predictions = useMemo(() => {
        if (!state) return null;
        const { innings, currentInningIndex, target, battingTeam, bowlingTeam, currentBatters } = state;
        const currentInning = innings[currentInningIndex];
        const maxOvers = gameData.currentFormat.includes('T20') ? 20 : 50;
        const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + (parseFloat(currentInning.overs) % 1 * 10);
        const ballsRemaining = (maxOvers * 6) - ballsBowled;
        const currentRunRate = ballsBowled > 0 ? (currentInning.score / ballsBowled) * 6 : 6;
        
        // Win Probability
        let winProb = 50;
        if (target) {
            const runsNeeded = target - currentInning.score + 1;
            const reqRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 99;
            
            if (runsNeeded <= 0) winProb = 100;
            else if (ballsRemaining <= 0) winProb = 0;
            else {
                // Simple logistic-like heuristic
                const rateDiff = currentRunRate - reqRate;
                const wicketsFactor = (10 - currentInning.wickets) * 5;
                winProb = 50 + (rateDiff * 10) + (wicketsFactor - 25); // Base 50, adjust by rate and wickets
                if (currentInning.wickets >= 9) winProb -= 30;
            }
        } else {
            // Batting first
            const projScore = currentInning.score + (currentRunRate * (ballsRemaining/6));
            const parScore = maxOvers === 20 ? 160 : 280;
            winProb = 50 + ((projScore - parScore) / 2);
        }
        winProb = Math.max(0, Math.min(100, winProb));

        // Projected Scores
        const projCurrent = Math.round(currentInning.score + (currentRunRate * (ballsRemaining/6)));
        const proj6 = Math.round(currentInning.score + (6 * (ballsRemaining/6)));
        const proj8 = Math.round(currentInning.score + (8 * (ballsRemaining/6)));
        const proj10 = Math.round(currentInning.score + (10 * (ballsRemaining/6)));

        // Player Prediction
        const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
        let playerProj = 0;
        if (striker) {
            // Assume they face 40% of remaining balls if top order, less if tail
            const expectedBalls = ballsRemaining * 0.4; 
            const currentSR = striker.balls > 0 ? (striker.runs / striker.balls) : 0.8; // Default 80 SR
            playerProj = Math.round(striker.runs + (expectedBalls * currentSR));
        }

        return {
            winProb: Math.round(winProb),
            projCurrent,
            proj6,
            proj8,
            proj10,
            playerProj
        };
    }, [state, gameData.currentFormat]);


    if (!state) return <div className="h-full flex items-center justify-center bg-slate-900 text-white">Loading Match...</div>;

    const { battingTeam, bowlingTeam, innings, currentInningIndex, currentBatters, currentBowlerId, recentBalls, commentary, target, waitingFor, strategies } = state;
    
    const isUserBatting = battingTeam?.id === gameData.userTeamId;
    const isUserBowling = bowlingTeam?.id === gameData.userTeamId;

    const handleExit = () => {
        // If match not finished, save state
        if (state.status !== 'completed') {
            onExit(state);
        } else {
            onExit();
        }
    };

    if (showPreMatch && state.status === 'ready') {
        return <PreMatchPanel match={match} gameData={gameData} onStart={() => { setShowPreMatch(false); beginMatch(); }} />;
    }

    if (state.status === 'toss') {
        return (
            <div className="absolute inset-0 z-[100] bg-[#050808] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center max-w-md w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-teal-500 text-black px-2 py-0.5 font-black text-[10px] uppercase tracking-widest">LIVE BROADCAST</div>
                        <span className="text-[10px] font-mono font-bold opacity-40 uppercase tracking-widest">MATCH DAY // TOSS</span>
                    </div>
                    
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 text-center leading-none">THE <span className="text-teal-500">TOSS</span></h2>
                    
                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 w-full text-center shadow-2xl">
                        {tvLogo && (
                            <div className={`absolute -top-10 -right-4 w-20 h-20 opacity-80 ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                        )}
                        
                        <div className="flex justify-between items-center mb-10 px-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-black italic mb-2 border border-white/10">
                                    {match.teamA[0]}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{match.teamA}</p>
                            </div>
                            <div className="text-xs font-mono font-bold opacity-20 uppercase tracking-widest">VS</div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-black italic mb-2 border border-white/10">
                                    {match.teamB[0]}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{match.teamB}</p>
                            </div>
                        </div>

                        {tossState === 'coin' ? (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const winnerId = Math.random() > 0.5 ? gameData.teams.find(t => t.name === match.teamA)?.id : gameData.teams.find(t => t.name === match.teamB)?.id;
                                    const winnerTeam = gameData.teams.find(t => t.id === winnerId);

                                    if (!winnerTeam) {
                                        console.error('Toss winner not found!');
                                        return;
                                    }

                                    if (winnerTeam.id === gameData.userTeamId) {
                                        setTossState('result');
                                    } else {
                                        const decision = Math.random() > 0.5 ? 'bat' : 'bowl';
                                        startMatch(winnerTeam.id, decision);
                                    }
                                }}
                                className="w-full bg-teal-500 text-black font-black py-6 rounded-3xl text-2xl uppercase italic tracking-tighter shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:invert transition-all"
                            >
                                FLIP COIN 🪙
                            </motion.button>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <p className="text-teal-400 font-black text-2xl uppercase italic tracking-tighter">YOU WON THE TOSS!</p>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">SELECT YOUR STRATEGY</p>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => { console.log("User chose to bat"); startMatch(gameData.userTeamId, 'bat'); }} 
                                        className="flex-1 bg-white text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-teal-500 transition-all"
                                    >
                                        BAT 🏏
                                    </button>
                                    <button 
                                        onClick={() => { console.log("User chose to bowl"); startMatch(gameData.userTeamId, 'bowl'); }} 
                                        className="flex-1 bg-white/10 text-white border border-white/10 py-5 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-white/20 transition-all"
                                    >
                                        BOWL ⚾
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!innings || innings.length === 0) {
        console.warn('LiveMatchScreen: Innings data not available yet.');
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Initializing Match...</h2>
                <p className="text-xs font-mono opacity-40 uppercase tracking-widest mt-2">Preparing the field and players</p>
            </div>
        );
    }

    // Ensure currentInningIndex is valid
    if (currentInningIndex < 0 || currentInningIndex >= innings.length) {
        console.error('LiveMatchScreen: Invalid currentInningIndex:', currentInningIndex);
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">Error: Invalid Inning State</h2>
                <p className="text-xs font-mono opacity-40 uppercase tracking-widest mt-2">Something went wrong with the match initialization</p>
            </div>
        );
    }

    const currentInning = innings[currentInningIndex];
    console.log("LiveMatchScreen state status:", state.status);
    const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
    const nonStriker = currentInning.batting.find(b => b.playerId === currentBatters.nonStrikerId);
    const bowler = currentInning.bowling.find(b => b.playerId === currentBowlerId);

    const runRate = parseFloat(currentInning.overs) > 0 ? (currentInning.score / parseFloat(currentInning.overs)).toFixed(2) : "0.00";
    let reqRate = "N/A";
    let runsNeeded = 0;
    let ballsRemaining = 0;
    
    if (target) {
        runsNeeded = target - currentInning.score + 1;
        const totalBalls = (gameData.currentFormat.includes('T20') ? 20 : 50) * 6;
        const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + (parseFloat(currentInning.overs) % 1 * 10);
        ballsRemaining = totalBalls - ballsBowled;
        if (ballsRemaining > 0) {
             reqRate = (runsNeeded / (ballsRemaining/6)).toFixed(2);
        }
    }

    const fielders = [
        { x: 160, y: 80 }, { x: 240, y: 80 }, { x: 100, y: 160 }, { x: 300, y: 160 },
        { x: 120, y: 280 }, { x: 280, y: 280 }, { x: 200, y: 340 }, { x: 60, y: 200 }, { x: 340, y: 200 }
    ];

    const lastBall = recentBalls.length > 0 ? recentBalls[0] : null;
    const isWicket = lastBall === 'W';
    const isBoundary = lastBall === '4' || lastBall === '6';

    // --- Selection Modals ---
    const renderSelectionModal = (title: string, options: any[], onSelect: (id: any) => void, onConfirm: () => void, selectedValue: string, setValue: (v: string) => void, extraSelect?: any) => {
        // If auto-arrival is active, don't show modal yet
        if (autoArrivalSeconds !== null) return null;

        if (state.autoPlayType === 'inning' || state.autoPlayType === 'match') return <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center text-white font-bold animate-pulse">Simulating...</div>;
        return (
            <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6">
                <h3 className="text-xl font-bold mb-4 text-white text-center">{title}</h3>
                <div className="w-full max-w-sm space-y-4 bg-slate-800 p-4 rounded-lg shadow-xl">
                    {extraSelect}
                    <select className="w-full p-2 bg-slate-900 text-white rounded border border-slate-600" value={selectedValue} onChange={e => setValue(e.target.value)}>
                        <option value="">Select Player</option>
                        {options.map(p => <option key={p.playerId} value={p.playerId}>{p.playerName} {p.overs ? `(${p.overs})` : ''}</option>)}
                    </select>
                    <button 
                        disabled={!selectedValue || (extraSelect && !selectedOpener1)} // Hacky check for openers
                        onClick={onConfirm}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        );
    };

    // --- Match Centre Overlay ---
    const renderMatchCentre = () => (
        <div className="absolute inset-0 bg-slate-900/95 z-40 flex flex-col p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-teal-400">Match Centre</h2>
                <button onClick={() => setShowMatchCentre(false)} className="p-2 bg-slate-800 rounded-full"><Icons.X className="h-5 w-5" /></button>
            </div>
            
            <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
                {['scorecard', 'commentary', 'analysis'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-md ${activeTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                {activeTab === 'scorecard' && (
                    <div className="space-y-4">
                        <div className="bg-slate-800 rounded-lg p-3">
                            <h3 className="text-sm font-bold text-yellow-400 mb-2 border-b border-slate-700 pb-1">Batting</h3>
                            <table className="w-full text-xs">
                                <thead><tr className="text-slate-500 text-left"><th className="pb-1">Batter</th><th className="text-right pb-1">R</th><th className="text-right pb-1">B</th><th className="text-right pb-1">4s</th><th className="text-right pb-1">6s</th><th className="text-right pb-1">SR</th></tr></thead>
                                <tbody>
                                    {currentInning.batting.map(b => (
                                        <tr key={b.playerId} className={`border-b border-slate-700/50 ${b.isOut ? 'text-slate-500' : 'text-white'}`}>
                                            <td className="py-1.5 font-medium">
                                                {b.playerName} {b.playerId === currentBatters.strikerId ? '*' : ''}
                                                <div className="text-[9px] text-slate-500 font-normal">{b.dismissalText}</div>
                                            </td>
                                            <td className="text-right font-bold">{b.runs}</td>
                                            <td className="text-right">{b.balls}</td>
                                            <td className="text-right">{b.fours}</td>
                                            <td className="text-right">{b.sixes}</td>
                                            <td className="text-right">{b.balls > 0 ? Math.round((b.runs/b.balls)*100) : 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                            <h3 className="text-sm font-bold text-blue-400 mb-2 border-b border-slate-700 pb-1">Bowling</h3>
                            <table className="w-full text-xs">
                                <thead><tr className="text-slate-500 text-left"><th className="pb-1">Bowler</th><th className="text-right pb-1">O</th><th className="text-right pb-1">M</th><th className="text-right pb-1">R</th><th className="text-right pb-1">W</th><th className="text-right pb-1">Econ</th></tr></thead>
                                <tbody>
                                    {currentInning.bowling.filter(b => parseFloat(b.overs) > 0 || b.playerId === currentBowlerId).map(b => (
                                        <tr key={b.playerId} className="border-b border-slate-700/50 text-white">
                                            <td className="py-1.5 font-medium">{b.playerName} {b.playerId === currentBowlerId ? '🥎' : ''}</td>
                                            <td className="text-right">{b.overs}</td>
                                            <td className="text-right">{b.maidens}</td>
                                            <td className="text-right">{b.runsConceded}</td>
                                            <td className="text-right font-bold text-yellow-400">{b.wickets}</td>
                                            <td className="text-right">{b.ballsBowled > 0 ? ((b.runsConceded/b.ballsBowled)*6).toFixed(1) : '0.0'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'commentary' && (
                    <div className="space-y-2" ref={commentaryRef}>
                        {commentary.map((line, i) => (
                            <div key={i} className="bg-slate-800 p-2 rounded text-xs font-mono text-slate-300 border-l-2 border-teal-500">
                                {line}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'analysis' && predictions && (
                    <div className="space-y-4">
                        <div className="bg-slate-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-white mb-3">Win Probability</h3>
                            <div className="h-4 bg-slate-700 rounded-full overflow-hidden relative">
                                <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1 font-bold">
                                <span className="text-teal-400">{gameData.userTeamId === battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                                <span className="text-slate-400">{gameData.userTeamId !== battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id !== gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-white mb-3">Projected Score</h3>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-slate-700/50 p-2 rounded">
                                    <div className="text-[10px] text-slate-400 uppercase">Current Rate</div>
                                    <div className="text-xl font-bold text-white">{predictions.projCurrent}</div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded">
                                    <div className="text-[10px] text-slate-400 uppercase">At 8 RPO</div>
                                    <div className="text-xl font-bold text-white">{predictions.proj8}</div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded">
                                    <div className="text-[10px] text-slate-400 uppercase">At 10 RPO</div>
                                    <div className="text-xl font-bold text-white">{predictions.proj10}</div>
                                </div>
                                 <div className="bg-slate-700/50 p-2 rounded border border-yellow-600/30">
                                    <div className="text-[10px] text-yellow-400 uppercase">Safe Score</div>
                                    <div className="text-xl font-bold text-yellow-400">{gameData.currentFormat.includes('T20') ? 175 : 285}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-white mb-2">Player Prediction</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">{striker?.playerName} to score</span>
                                <span className="text-xl font-bold text-teal-400">{predictions.playerProj}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Based on current strike rate and match situation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white font-sans overflow-hidden relative">
            <style>{`
                @keyframes ball-path {
                    0% { cy: 175; cx: 205; opacity: 0; }
                    20% { opacity: 1; }
                    100% { cy: 220; cx: 200; }
                }
                @keyframes bat-swing {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(-45deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-ball { animation: ball-path 0.5s ease-in forwards; }
                .animate-bat { animation: bat-swing 0.3s ease-out; transform-origin: top center; }
                @keyframes slide-up { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
            `}</style>

            {/* Broadcaster Overlay */}
            {tvLogo && (
                <div className="absolute top-14 right-2 z-20 flex flex-col items-end pointer-events-none animate-fade-in">
                    <div className={`w-16 h-12 opacity-80 flex items-center justify-end ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                    <div className="bg-red-600 text-white text-[8px] font-bold px-1 rounded flex items-center gap-1">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> LIVE
                    </div>
                </div>
            )}

            {/* Analyst Button */}
            <div className="absolute top-28 right-2 z-20">
                <button onClick={() => setShowAnalyst(true)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-white border-2 border-white/20 active:scale-95 transition-transform">
                    <Icons.Bot />
                </button>
            </div>

            {/* Clickable Area for Auto-Dismiss (Only visible when timer is active) */}
            {autoArrivalSeconds !== null && (
                <div 
                    className="absolute inset-0 z-25 cursor-pointer" 
                    onClick={handleOverrideAuto}
                    title="Click anywhere to skip timer"
                ></div>
            )}

            {/* Auto Arrival Notification */}
            {autoArrivalSeconds !== null && nextAutoPlayerId && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"> 
                    {/* Wrapper to position centered, content inside */}
                    <AutoArrivalNotification 
                        playerName={getPlayerById(nextAutoPlayerId, gameData.allPlayers).name} 
                        onOverride={handleOverrideAuto} 
                        secondsLeft={autoArrivalSeconds} 
                    />
                </div>
            )}

            {waitingFor === 'openers' && renderSelectionModal("Select Opening Pair", currentInning.batting.filter(p => !p.isOut && p.playerId !== selectedOpener1), (id) => setSelectedOpener2(id), () => { selectOpeners(selectedOpener1, selectedOpener2); setSelectedOpener1(''); setSelectedOpener2(''); }, selectedOpener2, setSelectedOpener2, (
                <div>
                    <label className="text-sm text-gray-300 block mb-1">Striker</label>
                    <select className="w-full p-2 bg-slate-900 text-white rounded border border-slate-600" value={selectedOpener1} onChange={e => setSelectedOpener1(e.target.value)}>
                        <option value="">Select Player</option>
                        {currentInning.batting.filter(p => !p.isOut).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName}</option>)}
                    </select>
                </div>
            ))}
            {waitingFor === 'batter' && renderSelectionModal("Select Next Batter", currentInning.batting.filter(p => !p.isOut && p.playerId !== currentBatters.nonStrikerId && p.playerId !== currentBatters.strikerId), (id) => setSelectedBatter(id), () => { selectNextBatter(selectedBatter); setSelectedBatter(''); }, selectedBatter, setSelectedBatter)}
            {waitingFor === 'bowler' && renderSelectionModal("Select Next Bowler", currentInning.bowling.filter(p => p.playerId !== currentBowlerId), (id) => setSelectedBowler(id), () => { selectNextBowler(selectedBowler); setSelectedBowler(''); }, selectedBowler, setSelectedBowler)}

            {showMatchCentre && renderMatchCentre()}
            {showAnalyst && <MatchChat gameData={gameData} onClose={() => setShowAnalyst(false)} />}

            {/* TOP BAR - Broadcast Style */}
            <div className="bg-[#050808] p-3 flex justify-between items-center z-20 border-b border-white/10 flex-shrink-0 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-500/5 to-transparent pointer-events-none" />
                 
                 <div className="flex items-center gap-4 relative z-10">
                     <div className="flex flex-col">
                         <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[8px] font-black text-teal-500 uppercase tracking-[0.4em]">LIVE_STREAM</p>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                         </div>
                         <h2 className="text-sm font-black italic uppercase tracking-tighter text-white">
                            {match.teamA} <span className="text-white/30 not-italic">v</span> {match.teamB}
                         </h2>
                     </div>
                     <div className="h-8 w-px bg-white/10" />
                     <div className="flex flex-col">
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Format</p>
                         <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">{gameData.currentFormat}</p>
                     </div>
                 </div>

                 <div className="flex items-center gap-6 relative z-10">
                     <div className="hidden md:flex flex-col items-end">
                         <p className="text-[8px] font-black text-teal-500/40 uppercase tracking-[0.5em] italic">Apex Broadcast</p>
                         <div className="h-0.5 w-12 bg-teal-500/20 mt-1" />
                     </div>
                     <div className="text-right">
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Overs</p>
                         <p className="text-lg font-black text-teal-500 tracking-tighter leading-none">{currentInning.overs}</p>
                     </div>
                     <button 
                        onClick={handleExit} 
                        className="bg-white/5 hover:bg-white/10 text-[9px] font-black text-white/60 uppercase tracking-[0.2em] px-3 py-2 rounded-lg border border-white/10 transition-all active:scale-95"
                     >
                        {state.status === 'completed' ? 'Exit' : 'Save_Exit'}
                     </button>
                 </div>
                 
                 {/* Win Probability Bar - HUD */}
                 <div className="absolute bottom-0 left-0 w-full h-[2px] flex">
                    <div className="h-full bg-teal-500 shadow-[0_0_10px_#14b8a6] transition-all duration-1000" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions?.winProb : 100 - (predictions?.winProb||50)}%` }} />
                    <div className="h-full bg-white/10 flex-1" />
                 </div>
            </div>

            {/* MAIN FIELD */}
            <div className="flex-1 relative bg-[#050808] overflow-hidden flex flex-col items-center justify-center min-h-0">
                {/* Field Background Pattern */}
                <div className="absolute inset-0 bg-[#1a3a1a] opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                
                {/* Top Left Stats - Broadcast Overlay */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute top-6 left-6 z-10"
                >
                    <div className="bg-black/80 backdrop-blur-xl border-l-4 border-teal-500 p-4 rounded-r-2xl shadow-2xl min-w-[160px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-teal-500 uppercase tracking-[0.3em]">{battingTeam.name}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter italic leading-none mb-3">
                            {currentInning.score}<span className="text-white/30 not-italic mx-1">/</span>{currentInning.wickets}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">CRR</span>
                                <span className="text-xs font-black text-white/80">{runRate}</span>
                            </div>
                            {target && (
                                <div className="flex flex-col text-right">
                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">RRR</span>
                                    <span className="text-xs font-black text-teal-500">{reqRate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Top Right Stats - Broadcast Overlay */}
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute top-6 right-6 z-10"
                >
                    <div className="bg-black/80 backdrop-blur-xl border-r-4 border-blue-500 p-4 rounded-l-2xl shadow-2xl min-w-[160px] text-right">
                        <div className="flex justify-between items-center mb-2 flex-row-reverse">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">{bowlingTeam.name}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        </div>
                        
                        {target ? (
                            <>
                                <div className="text-3xl font-black text-white tracking-tighter italic leading-none mb-1">
                                    {runsNeeded} <span className="text-sm font-light not-italic text-white/40 uppercase tracking-widest">Needed</span>
                                </div>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">from {ballsRemaining} balls</p>
                            </>
                        ) : (
                            <>
                                <div className="text-3xl font-black text-white tracking-tighter italic leading-none mb-1">
                                    {predictions?.projCurrent || '-'}
                                </div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Projected Score</p>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Field SVG */}
                <div className="w-full h-full flex items-center justify-center p-2">
                    <svg viewBox="0 0 400 400" className="h-full w-full max-h-[60vh] max-w-md drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <pattern id="grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <rect width="10" height="10" fill="#35682d" />
                                <circle cx="1" cy="1" r="1" fill="#3e7a35" />
                            </pattern>
                        </defs>
                        <circle cx="200" cy="200" r="190" fill="url(#grass)" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
                        <circle cx="200" cy="200" r="80" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="4,4" />
                        <rect x="196" y="170" width="8" height="60" fill="#d2b48c" stroke="#bfa07a" strokeWidth="0.5" />
                        <line x1="194" y1="178" x2="206" y2="178" stroke="white" strokeWidth="0.5" />
                        <line x1="194" y1="222" x2="206" y2="222" stroke="white" strokeWidth="0.5" />
                        <circle cx="200" cy="177" r="1" fill="black" />
                        <circle cx="200" cy="223" r="1" fill="black" />
                        
                        <g transform="translate(200, 165)">
                             <circle r="3" fill="#ef4444" stroke="white" strokeWidth="1" />
                             <text y="-4" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">{bowler?.playerName.split(' ').pop()?.substring(0,1)}</text>
                        </g>
                        
                         <g transform="translate(200, 225)">
                             <circle r="3" fill="#eab308" stroke="white" strokeWidth="1" />
                             <rect x="2" y="-1" width="2" height="8" fill="#854d0e" className={lastBall ? "animate-bat" : ""} transform="rotate(15)" />
                        </g>
                        
                        <g transform="translate(190, 178)">
                             <circle r="3" fill="#eab308" stroke="white" strokeWidth="1" opacity="0.8" />
                        </g>
                        
                        <g transform="translate(200, 235)">
                             <circle r="2" fill="black" stroke="white" strokeWidth="0.5" />
                        </g>

                        {fielders.map((pos, i) => (
                            <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="#ef4444" stroke="white" strokeWidth="0.5" opacity="0.9" />
                        ))}
                        
                        {lastBall && (
                            <circle cx="200" cy="175" r="1.5" fill="white" className="animate-ball" />
                        )}
                    </svg>
                </div>

                {/* Ball Result Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                    <AnimatePresence mode="wait">
                        {lastBall && (
                            <motion.div 
                                key={currentInning.overs}
                                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 1.2, opacity: 0, y: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`
                                    flex flex-col items-center justify-center rounded-[40px] p-10 min-w-[180px]
                                    ${isWicket ? 'bg-red-600 shadow-[0_0_60px_rgba(220,38,38,0.6)]' : 
                                      isBoundary ? 'bg-teal-500 shadow-[0_0_60px_rgba(20,184,166,0.6)]' : 
                                      'bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl'}
                                    border-4 border-white/20
                                `}
                            >
                                <span className={`text-[11px] font-black uppercase tracking-[0.6em] mb-3 ${isWicket || isBoundary ? 'text-black/60' : 'text-teal-500'}`}>
                                    {isWicket ? 'Wicket' : isBoundary ? 'Boundary' : 'Result'}
                                </span>
                                <span className={`text-7xl font-black italic tracking-tighter ${isWicket || isBoundary ? 'text-black' : 'text-white'}`}>
                                    {lastBall === 'W' ? 'OUT' : lastBall}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="absolute bottom-2 right-2 z-10">
                    <button onClick={() => setShowMatchCentre(true)} className="bg-slate-800/90 text-xs font-bold text-white px-4 py-2 rounded-full border border-slate-600 shadow-lg flex items-center gap-2 animate-pulse">
                        <Icons.ChartPie /> Match Centre
                    </button>
                </div>
            </div>

            {/* BOTTOM INFO BAR - Broadcast Style */}
            <div className="bg-[#050808] border-t border-white/10 p-2 flex-shrink-0">
                <div className="flex items-stretch bg-white/[0.03] rounded-2xl overflow-hidden text-xs border border-white/5">
                    
                    {/* Bowler Stats */}
                    <div className="flex-1 p-3 border-r border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Bowling</p>
                        <div className="font-black text-white truncate text-sm italic">{bowler?.playerName}</div>
                        <div className="text-white/40 font-black tracking-tighter mt-0.5">
                            {bowler?.wickets}<span className="text-white/20 mx-0.5">-</span>{bowler?.runsConceded} 
                            <span className="text-[9px] font-light ml-1 text-white/20">({bowler?.overs})</span>
                        </div>
                    </div>

                    {/* Batters Stats - Enhanced */}
                    <div className="flex-[2.5] flex">
                        <div className={`flex-1 p-3 border-r border-white/5 transition-all duration-500 bg-teal-500/10`}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-teal-500">Striker</p>
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_5px_#14b8a6]" />
                            </div>
                            <div className="font-black truncate text-sm italic transition-colors text-white">{striker?.playerName}</div>
                            <div className="text-white/40 font-black tracking-tighter mt-0.5">
                                {striker?.runs} <span className="text-[9px] font-light ml-1 text-white/20">({striker?.balls})</span>
                            </div>
                        </div>
                        <div className={`flex-1 p-3 border-r border-white/5 transition-all duration-500`}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Non-Striker</p>
                            </div>
                            <div className="font-black truncate text-sm italic transition-colors text-white/40">{nonStriker?.playerName}</div>
                            <div className="text-white/40 font-black tracking-tighter mt-0.5">
                                {nonStriker?.runs} <span className="text-[9px] font-light ml-1 text-white/20">({nonStriker?.balls})</span>
                            </div>
                        </div>
                    </div>

                    {/* Last Ball */}
                    <div className="flex-1 p-3 text-right bg-gradient-to-b from-white/[0.02] to-transparent">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Last Ball</p>
                        <div className="text-white/40 font-mono text-[9px] mb-0.5 tracking-widest">{lastBallSpeed}</div>
                        <div className={`font-black text-2xl italic tracking-tighter leading-none ${isWicket ? 'text-red-500' : isBoundary ? 'text-teal-400' : 'text-white'}`}>
                            {lastBall || '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROL PANEL - Apex Style */}
            <div className="bg-[#050808] p-4 pb-8 flex-shrink-0">
                 <div className="flex gap-3 mb-4">
                    {isUserBatting && (
                        <StrategyToggle label="Batting Tactics" value={strategies.batting} onChange={setBattingStrategy} />
                    )}
                    {isUserBowling && (
                        <StrategyToggle label="Bowling Tactics" value={strategies.bowling} onChange={setBowlingStrategy} />
                    )}
                 </div>

                <div className="flex items-center gap-3 mb-6 overflow-x-auto py-2 scrollbar-hide">
                     <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex-shrink-0">This Over:</span>
                     {recentBalls.slice(0, 8).map((b, i) => (
                         <div key={i} className={`
                            h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 border transition-all
                            ${b === 'W' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 
                              b === '6' ? 'bg-teal-500 border-teal-400 text-black shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 
                              b === '4' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 
                              'bg-white/5 border-white/10 text-white/40'}
                         `}>
                             {b}
                         </div>
                     ))}
                </div>

                <div className="flex gap-3">
                    {state.status === 'completed' ? (
                        <button 
                            onClick={handleExit} 
                            className="flex-1 bg-red-600 text-white font-black py-5 rounded-[20px] uppercase tracking-[0.2em] text-xs hover:bg-red-500 transition-all active:scale-95 shadow-2xl shadow-red-600/20"
                        >
                            End Match
                        </button>
                    ) : (
                        <>
                            {state.autoPlayType ? (
                                <button 
                                    onClick={stopAutoPlay} 
                                    className="flex-1 bg-red-600 text-white font-black py-5 rounded-[20px] uppercase tracking-[0.2em] text-xs hover:bg-red-500 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl shadow-red-600/20"
                                >
                                    <Icons.Pause className="h-5 w-5" />
                                    <span>STOP SIM</span>
                                </button>
                            ) : (
                                <>
                                    {gameData.currentFormat === Format.SHIELD && isUserBatting && (
                                        <button 
                                            onClick={declareInning} 
                                            className="bg-red-600 text-white font-black py-5 px-6 rounded-[20px] uppercase tracking-[0.2em] text-xs hover:bg-red-500 transition-all active:scale-95 flex items-center justify-center shadow-2xl shadow-red-600/20"
                                        >
                                            <span className="text-lg">🚩</span>
                                        </button>
                                    )}
                                    <button 
                                        onClick={playBall} 
                                        className={`flex-[2] ${isUserBatting ? 'bg-teal-500' : 'bg-blue-600'} text-black font-black py-5 rounded-[20px] uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl ${isUserBatting ? 'shadow-teal-500/30' : 'shadow-blue-600/30'}`}
                                    >
                                        <Icons.Play className="h-5 w-5" />
                                        <span>{isUserBatting ? 'PLAY BALL' : 'BOWL BALL'}</span>
                                    </button>
                                    <button 
                                        onClick={playOver} 
                                        className="flex-1 bg-white/5 text-white font-black py-5 rounded-[20px] uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all active:scale-95 border border-white/10"
                                    >
                                        OVER
                                    </button>
                                    <button 
                                        onClick={simulateInning} 
                                        className="flex-1 bg-white/5 text-white font-black py-5 rounded-[20px] uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all active:scale-95 border border-white/10"
                                    >
                                        INN
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveMatchScreen;
