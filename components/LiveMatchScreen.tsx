
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
    <div className="flex flex-col items-center bg-white/5 rounded-xl p-2 flex-1 border border-white/5">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</span>
        <div className="flex bg-black/40 rounded-lg p-1 w-full justify-center gap-1">
            {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`px-2 py-1.5 text-[9px] uppercase font-black rounded-md transition-all flex-1 ${value === s 
                        ? s === 'attacking' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : s === 'defensive' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                        : 'text-slate-500 hover:text-slate-300'}`}
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
            <header className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${sponsorship.logoColor} drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo || TOURNAMENT_LOGOS[0].svg}}></div>
                    <div>
                        <p className="v2-label tracking-[0.4em] mb-0.5">{gameData.currentFormat} // PRE_MATCH</p>
                        <h1 className="broadcast-header text-3xl text-white">{sponsorship.sponsorName} {sponsorship.tournamentName}</h1>
                    </div>
                </div>
                <div className={`w-20 h-12 opacity-60`} dangerouslySetInnerHTML={{__html: sponsorship.tvLogo || ''}}></div>
            </header>

            <div className="flex-grow flex flex-col justify-center space-y-16 py-8">
                <div className="flex items-center justify-between px-4 max-w-4xl mx-auto w-full">
                    <motion.div 
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center space-y-6 w-1/3"
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-600/20 flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.2)] border-2 border-teal-500/30 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-20 h-20 relative z-10" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamA?.id)?.logo || ''}}></div>
                        </div>
                        <div className="text-center">
                            <h2 className="broadcast-header text-2xl text-white mb-2">{teamA?.name}</h2>
                            <div className="px-4 py-1.5 bg-teal-500/10 rounded-full border border-teal-500/20 inline-block">
                                <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Home Franchise</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col items-center">
                        <div className="text-7xl font-black italic text-white/5 tracking-tighter mb-4 select-none">VS</div>
                        <div className="w-[2px] h-24 bg-gradient-to-b from-transparent via-teal-500 to-transparent opacity-40 shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                    </div>

                    <motion.div 
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center space-y-6 w-1/3"
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700/20 to-slate-900/20 flex items-center justify-center border-2 border-white/10 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-20 h-20 relative z-10" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamB?.id)?.logo || ''}}></div>
                        </div>
                        <div className="text-center">
                            <h2 className="broadcast-header text-2xl text-white mb-2">{teamB?.name}</h2>
                            <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 inline-block">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Away Franchise</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="glass-card p-8 mx-auto w-full max-w-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 opacity-50" />
                    <div className="flex justify-between items-center mb-8">
                        <span className="v2-label tracking-[0.3em]">VENUE_CONDITIONS // {ground?.name || 'STADIUM'}</span>
                        <div className="flex gap-2">
                            {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-teal-500/30 transition-colors group">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 group-hover:text-teal-400/50 transition-colors">Pitch Report</p>
                            <p className="text-xl font-bold text-teal-400 italic tracking-tight">{ground?.pitch}</p>
                            <p className="text-[11px] text-white/20 mt-2 uppercase tracking-tighter">Favors {ground?.pitch.includes('Spin') ? 'Spin' : ground?.pitch.includes('Green') ? 'Pace' : 'Batting'}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-teal-500/30 transition-colors group">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 group-hover:text-teal-400/50 transition-colors">Weather</p>
                            <p className="text-xl font-bold flex items-center gap-3 text-white italic tracking-tight">
                                <span className="text-2xl">{getWeatherIcon(ground?.weather)}</span> {ground?.weather || 'Clear'}
                            </p>
                            <p className="text-[11px] text-white/20 mt-2 uppercase tracking-tighter">{ground?.outfieldSpeed || 'Medium'} Outfield Speed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 flex justify-center">
                <button 
                    onClick={onStart}
                    className="w-full max-w-md bg-teal-500 text-black font-black py-6 px-8 rounded-[24px] uppercase tracking-[0.3em] text-sm hover:bg-teal-400 transition-all duration-500 shadow-[0_20px_50px_rgba(20,184,166,0.3)] active:scale-[0.98] relative overflow-hidden group"
                >
                    <span className="relative z-10">Enter Match Broadcast</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                </button>
            </div>
        </div>
    );
};

const AutoArrivalNotification = ({ playerName, onOverride, secondsLeft }: { playerName: string, onOverride: () => void, secondsLeft: number }) => (
    <div className="glass-card p-4 flex items-center gap-4 animate-slide-up min-w-[320px] border-teal-500/30 shadow-[0_20px_50px_rgba(20,184,166,0.15)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 animate-pulse shadow-[0_0_20px_rgba(45,212,191,0.2)]">
            <Icons.User className="w-6 h-6" />
        </div>
        <div className="flex-grow">
            <p className="v2-label text-teal-400 mb-0.5 tracking-[0.2em]">NEXT BATTER ARRIVING</p>
            <p className="text-white font-black text-xl italic uppercase tracking-tighter leading-tight">{playerName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center">
                <span className="text-xs font-black italic text-teal-400">{secondsLeft}</span>
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-white transition-colors">SKIP</div>
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
        <div className="absolute inset-0 bg-[#05070a]/95 z-[160] flex flex-col p-6 animate-fade-in backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-white/20">
                        <Icons.Bot className="text-white" />
                    </div>
                    <div>
                        <p className="v2-label text-teal-400 tracking-[0.2em] mb-0.5">AI_ANALYST // LIVE</p>
                        <h3 className="broadcast-header text-xl text-white">MATCH STRATEGIST</h3>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
                >
                    <Icons.X className="text-white" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${m.sender === 'user' ? 'bg-teal-500 text-black rounded-tr-sm shadow-[0_10px_30px_rgba(20,184,166,0.2)]' : 'glass-card text-slate-200 rounded-tl-sm border-white/10'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center gap-2 text-[10px] text-teal-400 font-black uppercase tracking-widest animate-pulse">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                        Analyzing Match Dynamics...
                    </div>
                )}
                <div ref={endRef} />
            </div>
            <div className="flex gap-3 bg-white/5 p-2 rounded-[32px] border border-white/10 focus-within:border-teal-500/50 transition-all">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && send()} 
                    placeholder="Ask for tactical advice..." 
                    className="flex-grow bg-transparent px-6 py-3 text-sm text-white focus:outline-none placeholder:text-slate-600 font-medium" 
                />
                <button 
                    onClick={send} 
                    className="bg-teal-500 hover:bg-teal-400 text-black p-4 rounded-full shadow-lg transition-all active:scale-90"
                >
                    <Icons.Play className="h-5 w-5 fill-current" />
                </button>
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
    const [showStrategy, setShowStrategy] = useState(false);

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
        const nonStriker = currentInning.batting.find(b => b.playerId === currentBatters.nonStrikerId);
        
        let playerProj = 0;
        if (striker) {
            const expectedBalls = ballsRemaining * 0.4; 
            const currentSR = striker.balls > 0 ? (striker.runs / striker.balls) : 0.8; 
            playerProj = Math.round(striker.runs + (expectedBalls * currentSR));
        }

        // Partnership
        const partnershipRuns = (striker?.runs || 0) + (nonStriker?.runs || 0);
        const partnershipBalls = (striker?.balls || 0) + (nonStriker?.balls || 0);

        return {
            winProb: Math.round(winProb),
            projCurrent,
            proj6,
            proj8,
            proj10,
            playerProj,
            partnershipRuns,
            partnershipBalls
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 blur-[150px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-500 text-black px-3 py-1 font-black text-[11px] uppercase tracking-[0.3em] rounded-sm">LIVE BROADCAST</div>
                        <span className="v2-label tracking-[0.2em]">MATCH DAY // TOSS</span>
                    </div>
                    
                    <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-16 text-center leading-none">THE <span className="text-teal-500 drop-shadow-[0_0_20px_rgba(45,212,191,0.4)]">TOSS</span></h2>
                    
                    <div className="glass-card p-12 rounded-[48px] w-full text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Icons.Trophy size={120} className="text-white" />
                        </div>
                        
                        {tvLogo && (
                            <div className={`absolute top-6 right-6 w-24 h-12 opacity-40 ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                        )}
                        
                        <div className="flex justify-between items-center mb-16 px-8 relative z-10">
                            <div className="text-center group">
                                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-4xl font-black italic mb-4 border border-white/10 group-hover:border-teal-500/50 transition-colors shadow-2xl">
                                    {match.teamA[0]}
                                </div>
                                <p className="text-[12px] font-black uppercase tracking-widest text-white/60">{match.teamA}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-xl font-mono font-bold text-white/10 uppercase tracking-[0.5em] mb-2">VS</div>
                                <div className="w-px h-12 bg-white/10" />
                            </div>
                            <div className="text-center group">
                                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-4xl font-black italic mb-4 border border-white/10 group-hover:border-teal-500/50 transition-colors shadow-2xl">
                                    {match.teamB[0]}
                                </div>
                                <p className="text-[12px] font-black uppercase tracking-widest text-white/60">{match.teamB}</p>
                            </div>
                        </div>

                        {tossState === 'coin' ? (
                            <motion.button 
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
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
                                className="w-full bg-teal-500 text-black font-black py-7 rounded-[32px] text-2xl uppercase italic tracking-tighter shadow-[0_20px_60px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all duration-500 flex items-center justify-center gap-4 group"
                            >
                                <span>FLIP COIN</span>
                                <span className="text-3xl group-hover:rotate-[360deg] transition-transform duration-700">🪙</span>
                            </motion.button>
                        ) : (
                            <div className="space-y-8 animate-fade-in relative z-10">
                                <div>
                                    <p className="text-teal-400 font-black text-4xl uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">YOU WON THE TOSS!</p>
                                    <p className="v2-label tracking-[0.3em] mt-2">SELECT YOUR STRATEGY</p>
                                </div>
                                <div className="flex gap-6">
                                    <button 
                                        onClick={() => { console.log("User chose to bat"); startMatch(gameData.userTeamId, 'bat'); }} 
                                        className="flex-1 bg-white text-black py-6 rounded-3xl font-black uppercase italic tracking-tighter hover:bg-teal-500 transition-all duration-500 shadow-xl"
                                    >
                                        BAT 🏏
                                    </button>
                                    <button 
                                        onClick={() => { console.log("User chose to bowl"); startMatch(gameData.userTeamId, 'bowl'); }} 
                                        className="flex-1 bg-white/5 text-white border border-white/10 py-6 rounded-3xl font-black uppercase italic tracking-tighter hover:bg-white/10 transition-all duration-500"
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
            <div className="absolute inset-0 bg-[#05070a]/95 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-sm">
                <div className="w-full max-w-sm space-y-6 glass-card p-8 border-teal-500/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
                    
                    <div className="text-center">
                        <p className="v2-label tracking-[0.3em] mb-1">STRATEGY // SELECTION</p>
                        <h3 className="broadcast-header text-xl text-white">{title}</h3>
                    </div>

                    <div className="space-y-4">
                        {extraSelect}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Choose Player</label>
                            <select 
                                className="w-full p-4 bg-white/5 text-white rounded-2xl border border-white/10 focus:border-teal-500/50 focus:outline-none transition-all font-bold italic text-sm appearance-none" 
                                value={selectedValue} 
                                onChange={e => setValue(e.target.value)}
                            >
                                <option value="" className="bg-[#05070a]">Select Player</option>
                                {options.map(p => <option key={p.playerId} value={p.playerId} className="bg-[#05070a]">{p.playerName} {p.overs ? `(${p.overs})` : ''}</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        disabled={!selectedValue || (extraSelect && !selectedOpener1)}
                        onClick={onConfirm}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs transition-all shadow-[0_10px_30px_rgba(20,184,166,0.2)] disabled:opacity-30 active:scale-[0.98]"
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>
        );
    };

    // --- Match Centre Overlay ---
    const renderMatchCentre = () => (
        <div className="absolute inset-0 bg-[#05070a]/98 z-[150] flex flex-col p-6 animate-fade-in backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                    <p className="v2-label tracking-[0.3em] mb-1">MATCH_CENTRE // LIVE</p>
                    <h2 className="broadcast-header text-2xl text-white">STATISTICAL ANALYSIS</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Match Progress</p>
                        <div className="w-32 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                            <div 
                                className="h-full bg-teal-500 transition-all duration-1000" 
                                style={{ width: `${(ballsBowled / totalBalls) * 100}%` }}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowMatchCentre(false)} 
                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all active:scale-90"
                    >
                        <Icons.X className="h-6 w-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Match Info Strip */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Icons.MapPin size={16} className="text-teal-400" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Venue</span>
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter">{gameData.venue}</span>
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Icons.Cloud size={16} className="text-blue-400" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Weather</span>
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter">28°C Clear</span>
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <Icons.Coins size={16} className="text-yellow-400" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Toss</span>
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter">{gameData.tossWinner} chose to {gameData.tossDecision}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/5">
                {['scorecard', 'commentary', 'analysis'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'text-slate-500 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-hide">
                {activeTab === 'scorecard' && (
                    <div className="space-y-6">
                        <div className="glass-card p-5 border-white/5">
                            <h3 className="broadcast-header text-sm text-teal-400 mb-4 border-b border-white/5 pb-2">BATTING LOG</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-500 text-left uppercase tracking-widest">
                                        <th className="pb-3">Batter</th>
                                        <th className="text-right pb-3">R</th>
                                        <th className="text-right pb-3">B</th>
                                        <th className="text-right pb-3">4s</th>
                                        <th className="text-right pb-3">6s</th>
                                        <th className="text-right pb-3">SR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentInning.batting.map(b => (
                                        <tr key={b.playerId} className={`${b.isOut ? 'opacity-40' : 'text-white'}`}>
                                            <td className="py-3">
                                                <p className="text-xs font-black italic uppercase tracking-tighter">
                                                    {b.playerName} {b.playerId === currentBatters.strikerId ? '*' : ''}
                                                </p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{b.dismissalText}</p>
                                            </td>
                                            <td className="text-right text-sm font-black italic text-teal-400">{b.runs}</td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.balls}</td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.fours}</td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.sixes}</td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.balls > 0 ? Math.round((b.runs/b.balls)*100) : 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="glass-card p-5 border-white/5">
                            <h3 className="broadcast-header text-sm text-blue-400 mb-4 border-b border-white/5 pb-2">BOWLING ANALYSIS</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-500 text-left uppercase tracking-widest">
                                        <th className="pb-3">Bowler</th>
                                        <th className="text-right pb-3">O</th>
                                        <th className="text-right pb-3">M</th>
                                        <th className="text-right pb-3">R</th>
                                        <th className="text-right pb-3">W</th>
                                        <th className="text-right pb-3">Econ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentInning.bowling.filter(b => parseFloat(b.overs) > 0 || b.playerId === currentBowlerId).map(b => (
                                        <tr key={b.playerId} className="text-white">
                                            <td className="py-3 font-black italic uppercase tracking-tighter text-xs">
                                                {b.playerName} {b.playerId === currentBowlerId ? '🥎' : ''}
                                            </td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.overs}</td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.maidens}</td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.runsConceded}</td>
                                            <td className="text-right text-sm font-black italic text-yellow-400">{b.wickets}</td>
                                            <td className="text-right text-xs font-bold text-slate-400">{b.ballsBowled > 0 ? ((b.runsConceded/b.ballsBowled)*6).toFixed(1) : '0.0'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'commentary' && (
                    <div className="space-y-6">
                        {/* Last 12 Balls Visualizer */}
                        <div className="glass-card p-5 border-white/5">
                            <h3 className="broadcast-header text-sm text-white mb-4">RECENT BALLS</h3>
                            <div className="flex flex-wrap gap-2">
                                {recentBalls.slice(0, 12).map((ball, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black italic border ${
                                            ball === 'W' ? 'bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                                            ball === '4' || ball === '6' ? 'bg-teal-500 border-teal-400 text-black shadow-[0_0_15px_rgba(20,184,166,0.5)]' :
                                            'bg-white/5 border-white/10 text-slate-300'
                                        }`}
                                    >
                                        {ball}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3" ref={commentaryRef}>
                            {commentary.map((line, i) => (
                                <div key={i} className="glass-card p-4 border-l-4 border-teal-500 bg-white/5">
                                    <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                                        {line}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && predictions && (
                    <div className="space-y-6">
                        <div className="glass-card p-6 border-white/5">
                            <h3 className="broadcast-header text-sm text-white mb-4">WIN PROBABILITY</h3>
                            <div className="h-6 bg-white/5 rounded-full overflow-hidden relative border border-white/10 p-1">
                                <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(20,184,166,0.5)]" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] mt-3 font-black uppercase tracking-widest">
                                <span className="text-teal-400">{gameData.userTeamId === battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                                <span className="text-slate-500">{gameData.userTeamId !== battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id !== gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                            </div>
                        </div>

                        <div className="glass-card p-6 border-white/5">
                            <h3 className="broadcast-header text-sm text-white mb-4">PROJECTED SCORE</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Rate</p>
                                    <p className="text-2xl font-black italic text-white">{predictions.projCurrent}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">At 8 RPO</p>
                                    <p className="text-2xl font-black italic text-white">{predictions.proj8}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">At 10 RPO</p>
                                    <p className="text-2xl font-black italic text-white">{predictions.proj10}</p>
                                </div>
                                 <div className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20">
                                    <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Safe Score</p>
                                    <p className="text-2xl font-black italic text-teal-400">{gameData.currentFormat.includes('T20') ? 175 : 285}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Icons.Users size={80} />
                            </div>
                            <h3 className="broadcast-header text-sm text-white mb-4">CURRENT PARTNERSHIP</h3>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black italic text-teal-400 tracking-tighter">{predictions.partnershipRuns}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Runs from {predictions.partnershipBalls} balls</span>
                                </div>
                                <div className="flex -space-x-3">
                                    {[striker, nonStriker].map((b, i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-[#05070a] bg-slate-800 overflow-hidden">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b?.playerName || 'Player'}`} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Icons.Bot size={80} />
                            </div>
                            <h3 className="broadcast-header text-sm text-white mb-4">PLAYER PREDICTION</h3>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{striker?.playerName}</span>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Projected Runs</span>
                                </div>
                                <span className="text-4xl font-black italic text-teal-400 tracking-tighter">{predictions.playerProj}</span>
                            </div>
                            <p className="text-[9px] text-slate-600 mt-4 font-bold uppercase tracking-widest italic">AI Analysis: Based on current strike rate and match situation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // MATCH COMPLETION SCREEN (V2.0)
    if (state.status === 'completed') {
        const winner = state.matchResult?.winnerId ? gameData.teams.find(t => t.id === state.matchResult?.winnerId) : null;
        const pom = state.matchResult?.playerOfMatch ? getPlayerById(state.matchResult.playerOfMatch, gameData.allPlayers) : null;

        return (
            <div className="fixed inset-0 z-[200] bg-[#05070a] flex flex-col p-6 text-white overflow-y-auto animate-fade-in">
                <div className="flex justify-between items-end mb-12">
                    <div className="flex flex-col">
                        <p className="v2-label tracking-[0.4em] mb-1">MATCH_SUMMARY // FINAL</p>
                        <h2 className="broadcast-header text-3xl text-white">POST MATCH BROADCAST</h2>
                    </div>
                    <div className="w-16 h-10 opacity-40" dangerouslySetInnerHTML={{ __html: sponsorship?.tvLogo || '' }} />
                </div>

                <div className="space-y-8 max-w-2xl mx-auto w-full pb-12">
                    {/* Result Card */}
                    <div className="glass-card p-10 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0" />
                        <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <p className="text-teal-400 font-black text-4xl uppercase italic tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                            {state.matchResult?.resultText}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-px bg-white/10" />
                            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.3em]">
                                MATCH_ID: {state.matchResult?.matchNumber} // {new Date().toLocaleDateString()}
                            </p>
                            <div className="w-12 h-px bg-white/10" />
                        </div>
                    </div>

                    {/* Player of the Match */}
                    <section>
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="broadcast-header text-sm tracking-widest text-white/60">PLAYER OF THE MATCH</h3>
                            <div className="flex gap-1">
                                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-teal-500 rounded-full" />)}
                            </div>
                        </div>
                        <div className="glass-card p-8 flex items-center gap-8 relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                                <Icons.Trophy size={200} className="text-white" />
                            </div>
                            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-teal-500/30 overflow-hidden flex-shrink-0 shadow-[0_0_50px_rgba(45,212,191,0.2)] relative z-10">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pom?.name || 'Player'}`} 
                                    alt="POM" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            <div className="flex-grow relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icons.Star size={18} className="text-teal-400 fill-current" />
                                    <span className="v2-label text-teal-400/60 tracking-[0.2em]">OUTSTANDING PERFORMANCE</span>
                                </div>
                                <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">{pom?.name}</h4>
                                <div className="flex gap-4 mt-4">
                                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact</p>
                                        <p className="text-lg font-black italic text-teal-400">9.8/10</p>
                                    </div>
                                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-lg font-black italic text-white">ELITE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Score Summary */}
                    <div className="grid grid-cols-2 gap-6">
                        {innings.map((inn, i) => (
                            <div key={i} className="glass-card p-6 relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/20 group-hover:bg-teal-500 transition-colors" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{gameData.teams.find(t => t.id === inn.battingTeamId)?.name}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black italic text-white tracking-tighter">{inn.score}<span className="text-teal-500">/</span>{inn.wickets}</p>
                                    <p className="text-[12px] font-mono text-slate-500">({inn.overs} Ov)</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 pt-8">
                        <button 
                            onClick={() => setShowMatchCentre(true)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-sm transition-all border border-white/10 backdrop-blur-xl"
                        >
                            View Full Match Centre
                        </button>
                        <button 
                            onClick={handleExit}
                            className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black py-6 rounded-2xl uppercase tracking-[0.4em] text-sm transition-all shadow-[0_20px_50px_rgba(20,184,166,0.25)] active:scale-[0.98]"
                        >
                            Continue to Career Hub
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#05070a] flex flex-col text-white font-sans select-none overflow-hidden">
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

            {/* Strategy Overlay */}
            <AnimatePresence>
                {showStrategy && (
                    <motion.div 
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="absolute top-24 right-4 z-[140] w-72 glass-card p-6 border-teal-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="broadcast-header text-sm text-white">MATCH STRATEGY</h3>
                            <button onClick={() => setShowStrategy(false)} className="text-slate-500 hover:text-white transition-colors">
                                <Icons.X size={16} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BATTING_MODE</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${strategies.batting === 'attacking' ? 'text-red-400' : strategies.batting === 'defensive' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                        {strategies.batting}
                                    </span>
                                </div>
                                <div className="flex bg-black/40 rounded-xl p-1 gap-1">
                                    {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setBattingStrategy(s)}
                                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${strategies.batting === s ? 'bg-teal-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {s.slice(0,3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BOWLING_INTENSITY</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${strategies.bowling === 'attacking' ? 'text-red-400' : strategies.bowling === 'defensive' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                        {strategies.bowling}
                                    </span>
                                </div>
                                <div className="flex bg-black/40 rounded-xl p-1 gap-1">
                                    {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setBowlingStrategy(s)}
                                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${strategies.bowling === s ? 'bg-teal-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {s.slice(0,3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                                    Strategy affects run rate, wicket probability, and player fatigue.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOP BAR - Broadcast Style */}
            <div className="bg-[#05070a] p-4 flex justify-between items-center z-20 border-b border-white/5 flex-shrink-0 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-500/5 to-transparent pointer-events-none" />
                 
                 <div className="flex items-center gap-4 relative z-10">
                     <div className="flex flex-col">
                         <div className="flex items-center gap-2 mb-1">
                            <p className="v2-label">LIVE BROADCAST</p>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                         </div>
                         <h2 className="text-lg font-black italic uppercase tracking-tighter text-white leading-none">
                            {match.teamA} <span className="text-white/20 not-italic mx-1">VS</span> {match.teamB}
                         </h2>
                     </div>
                 </div>

                 <div className="flex items-center gap-4 relative z-10">
                    <button 
                        onClick={handleExit}
                        className="bg-white/5 hover:bg-red-500/10 p-2 rounded-lg border border-white/10 transition-all group"
                        title="Exit Match"
                    >
                        <Icons.LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </button>
                    <button 
                        onClick={() => setShowMatchCentre(true)}
                        className="bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/10 transition-all group"
                        title="Match Centre"
                    >
                        <Icons.BarChart2 className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                        onClick={() => setShowStrategy(!showStrategy)}
                        className={`p-2 rounded-lg border transition-all group ${showStrategy ? 'bg-teal-500 border-teal-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        title="Match Strategy"
                    >
                        <Icons.Settings className={`w-5 h-5 ${showStrategy ? 'text-black' : 'text-teal-400 group-hover:rotate-90 transition-transform duration-500'}`} />
                    </button>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{battingTeam.name}</p>
                        <p className="text-2xl font-black italic tracking-tighter leading-none">
                            {currentInning.score}<span className="text-teal-500">/</span>{currentInning.wickets}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">({currentInning.overs} Overs)</p>
                    </div>
                 </div>
            </div>

            {/* MAIN FIELD / BROADCAST VIEW */}
            <div className="flex-1 relative bg-[#050808] overflow-hidden flex flex-col min-h-0">
                {/* Field Background Pattern */}
                <div className="absolute inset-0 bg-[#0a1a0a] opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.05)_0%,transparent_70%)]" />
                
                {/* 2D Field Representation */}
                <div className="h-64 relative border-b border-white/5 overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-transparent" />
                    
                    {/* Stadium Image Background */}
                    <div className="absolute inset-0 opacity-20">
                        <img 
                            src="https://picsum.photos/seed/cricket_stadium/1200/400" 
                            alt="Stadium" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>

                    {/* Venue Info Overlay */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border-l-4 border-teal-500 flex items-center gap-3 shadow-2xl">
                            <Icons.MapPin size={14} className="text-teal-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{gameData.venue}</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Live from Stadium</span>
                            </div>
                        </div>
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border-l-4 border-blue-500 flex items-center gap-3 shadow-2xl">
                            <Icons.Cloud size={14} className="text-blue-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">28°C Clear Sky</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Humidity: 45%</span>
                            </div>
                        </div>
                    </div>

                    {/* Toss Info Overlay */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                    <Icons.Coins size={16} className="text-teal-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Toss Result</span>
                                    <span className="text-[11px] font-black text-white uppercase tracking-tighter">
                                        {gameData.tossWinner} won & chose to {gameData.tossDecision}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SVG Field */}
                    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full p-4">
                        {/* Boundary */}
                        <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx="200" cy="200" r="175" fill="none" stroke="rgba(45,212,191,0.2)" strokeWidth="1" />
                        
                        {/* Pitch */}
                        <rect x="185" y="140" width="30" height="120" fill="rgba(204,182,141,0.4)" rx="2" />
                        
                        {/* Fielders */}
                        {fielders.map((f, i) => (
                            <motion.circle 
                                key={i}
                                cx={f.x} 
                                cy={f.y} 
                                r="4" 
                                fill="#FDE047" 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="shadow-[0_0_8px_rgba(253,224,71,0.5)]"
                            />
                        ))}

                        {/* Keeper & Bowler */}
                        <circle cx="200" cy="270" r="5" fill="#3B82F6" /> {/* Keeper */}
                        <circle cx="200" cy="130" r="5" fill="#EF4444" /> {/* Bowler */}

                        {/* Ball Animation (Only when playing) */}
                        {state.status === 'playing' && (
                            <motion.circle 
                                cx="200" cy="135" r="3" fill="white"
                                animate={{ 
                                    cy: [135, 260, 200, Math.random() * 300 + 50],
                                    cx: [200, 200, 200, Math.random() * 300 + 50],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        )}
                    </svg>

                    {/* Broadcast Overlay Info */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">LAST BALL</span>
                            <span className="text-lg font-black italic text-white">{lastBall || '-'}</span>
                        </div>
                        {lastBallSpeed !== '-' && (
                            <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/5 inline-block">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{lastBallSpeed}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Main Match View - Scrollable Stats */}
                <div className="flex-grow flex flex-col overflow-y-auto bg-[#05070a] relative scrollbar-hide">

                    <div className="relative z-10 p-4 space-y-6">
                        {/* Target Breakdown Card */}
                        {target && (
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="glass-card p-4 border-teal-500/20"
                            >
                                <div className="text-center mb-4">
                                    <h3 className="broadcast-header text-sm text-teal-400">Target Breakdown</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Runs Required</p>
                                        <p className="text-3xl font-black italic text-white">{runsNeeded}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overs Remaining</p>
                                        <p className="text-3xl font-black italic text-white">{ballsRemaining > 0 ? (ballsRemaining / 6).toFixed(1) : '0.0'}</p>
                                    </div>
                                </div>
                                <p className="text-center text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-tighter italic">
                                    {battingTeam.name} won the toss to play the team second innings
                                </p>
                            </motion.div>
                        )}

                        {/* Active Batsmen Section */}
                        <section>
                            <div className="flex justify-between items-end mb-3">
                                <h3 className="broadcast-header text-sm tracking-tight">ACTIVE BATSMEN</h3>
                                <span className="v2-label">V2.0</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[striker, nonStriker].map((b, i) => (
                                    <div key={i} className={`glass-card p-3 flex items-center gap-3 ${b?.playerId === currentBatters.strikerId ? 'border-teal-500/40' : ''}`}>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden flex-shrink-0">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b?.playerName || 'Player'}`} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-[10px] font-bold text-white truncate uppercase italic">{b?.playerName || 'TBD'}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-black italic text-teal-400">{b?.runs || 0}*</span>
                                                <span className="text-[10px] font-bold text-slate-500">({b?.balls || 0})</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Bowling Rotation Section */}
                        <section>
                            <div className="flex justify-between items-end mb-3">
                                <h3 className="broadcast-header text-sm tracking-tight">BOWLING ROTATION</h3>
                                <span className="v2-label">V2.0</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {currentInning.bowling.filter(b => b.playerId === currentBowlerId || b.ballsBowled > 0).slice(0, 2).map((b, i) => (
                                    <div key={i} className={`glass-card p-3 flex items-center gap-3 ${b.playerId === currentBowlerId ? 'border-teal-500/40' : ''}`}>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden flex-shrink-0">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b.playerName}`} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-[10px] font-bold text-white truncate uppercase italic">{b.playerName}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-black italic text-teal-400">{b.wickets}</span>
                                                <span className="text-[10px] font-bold text-slate-500">({b.runsConceded})</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Over Log */}
                        <section>
                            <div className="flex justify-between items-end mb-3">
                                <h3 className="broadcast-header text-sm tracking-tight">RECENT OVER LOG</h3>
                                <span className="v2-label">V2.0</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {recentBalls.slice(0, 6).reverse().map((ball, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black italic text-sm border-2 ${
                                            ball === 'W' ? 'bg-red-500/20 border-red-500 text-red-500' :
                                            ball === '4' || ball === '6' ? 'bg-teal-500/20 border-teal-500 text-teal-500' :
                                            'bg-white/5 border-white/10 text-white'
                                        }`}
                                    >
                                        {ball}
                                    </div>
                                ))}
                                {recentBalls.length === 0 && <p className="text-xs text-slate-500 font-bold italic uppercase">Waiting for first ball...</p>}
                            </div>
                        </section>

                        {/* Simulation Controls */}
                        <section className="space-y-4 pt-4 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={playBall}
                                    disabled={!!state.autoPlayType}
                                    className="bg-teal-500 hover:bg-teal-400 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(20,184,166,0.2)]"
                                >
                                    Next Ball
                                </button>
                                <button 
                                    onClick={state.autoPlayType ? stopAutoPlay : playOver}
                                    className="bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all active:scale-95 border border-white/10"
                                >
                                    {state.autoPlayType ? 'Stop' : 'Play Over'}
                                </button>
                            </div>
                            
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <button onClick={autoSimulate} className="flex-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-400 transition-colors border-r border-white/5">Auto Sim</button>
                                <button onClick={simulateInning} className="flex-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-400 transition-colors border-r border-white/5">Sim Inning</button>
                                <button onClick={simulateMatch} className="flex-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-400 transition-colors">Sim Match</button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMatchScreen;
