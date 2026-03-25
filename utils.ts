import React from 'react';
import { Format, Player, PlayerRole, Team, Match, PlayerStats, Sponsorship, MatchResult, NewsArticle, GameData, Standing } from './types';
import { BRANDS, SPONSOR_THRESHOLDS, generateSingleFormatInitialStats, TV_CHANNELS, TOURNAMENT_LOGOS } from './data';

export type Category = 'T20' | 'List A' | 'First Class';

export const getFormatsForCategory = (cat: Category): Format[] => {
    switch(cat) {
        case 'T20': return [Format.T20];
        case 'List A': return [Format.ODI];
        case 'First Class': return [Format.SHIELD];
        default: return [Format.T20];
    }
};

export const resolveMatch = (match: Match, gameData: GameData, format: Format) => {
    let resolvedMatch = { ...match };
    if (resolvedMatch.group !== 'Round-Robin') {
        const standings = gameData.standings[format] || [];
        const getTeamName = (pos: number) => standings.length >= pos ? standings[pos - 1]?.teamName : `TBD`;
        
        const resolvePlaceholder = (placeholder: string) => {
            if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) {
                return getTeamName(parseInt(placeholder[0], 10));
            }
            if (placeholder.startsWith('SF')) {
                const sfMatchNumber = placeholder.split(' ')[0];
                const sfResult = gameData.matchResults[format]?.find(r => r.matchNumber === sfMatchNumber);
                if (sfResult?.winnerId) {
                    return gameData.teams.find(t => t.id === sfResult.winnerId)?.name || 'TBD';
                }
                return `Winner of ${sfMatchNumber}`;
            }
            return placeholder;
        };
        resolvedMatch.teamA = resolvePlaceholder(resolvedMatch.teamA);
        resolvedMatch.teamB = resolvePlaceholder(resolvedMatch.teamB);
    }
    return resolvedMatch;
};

export const PITCH_MODIFIERS = {
  "Balanced Sporting Pitch": { [Format.T20]: { runRate: 3.85, wicketChance: 1.20 }, [Format.ODI]: { runRate: 2.45, wicketChance: 1.15 }, [Format.SHIELD]: { runRate: 1.0, wicketChance: 1.0 }, paceBonus: 0, spinBonus: 0, chasePenalty: 1.0, deterioration: 0.02, unpredictability: 0 },
  "Dusty Spinner’s Haven": { [Format.T20]: { runRate: 3.10, wicketChance: 1.40 }, [Format.ODI]: { runRate: 2.10, wicketChance: 1.25 }, [Format.SHIELD]: { runRate: 0.9, wicketChance: 1.15 }, paceBonus: -0.05, spinBonus: 0.15, chasePenalty: 0.95, deterioration: 0.1, unpredictability: 0.005 },
  "Green Top": { [Format.T20]: { runRate: 3.30, wicketChance: 1.45 }, [Format.ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.SHIELD]: { runRate: 0.85, wicketChance: 1.2 }, paceBonus: 0.15, spinBonus: -0.05, chasePenalty: 1.0, deterioration: 0.05, unpredictability: 0 },
  "Batting Paradise": { [Format.T20]: { runRate: 4.40, wicketChance: 1.0 }, [Format.ODI]: { runRate: 2.85, wicketChance: 1.0 }, [Format.SHIELD]: { runRate: 1.2, wicketChance: 0.85 }, paceBonus: 0, spinBonus: 0, chasePenalty: 1.0, deterioration: 0, unpredictability: 0 },
  "Dead Slow Track": { [Format.T20]: { runRate: 2.75, wicketChance: 1.30 }, [Format.ODI]: { runRate: 2.0, wicketChance: 1.20 }, [Format.SHIELD]: { runRate: 0.8, wicketChance: 1.1 }, paceBonus: -0.05, spinBonus: 0.1, chasePenalty: 1.0, deterioration: 0.05, unpredictability: 0 },
  "Cracked Worn Surface": { [Format.T20]: { runRate: 3.30, wicketChance: 1.40 }, [Format.ODI]: { runRate: 2.20, wicketChance: 1.30 }, [Format.SHIELD]: { runRate: 0.75, wicketChance: 1.25 }, paceBonus: 0.05, spinBonus: 0.1, chasePenalty: 0.98, deterioration: 0.15, unpredictability: 0.015 },
};

export const COMMENTARY_TEMPLATES = {
    '0': ["Defended solidly back to the bowler.", "No run, straight to the fielder.", "Beaten! Lovely delivery.", "Leaves it alone outside off.", "Solid defense, respects the good ball."],
    '1': ["Pushed into the gap for a single.", "Quick single taken.", "Worked away to square leg for one.", "Edged but safe, they take a run.", "Tapped to mid-on for a sharp single."],
    '2': ["Driven through covers, they'll come back for two.", "Good running, two runs added.", "Flicked away, easy couple.", "Punched off the back foot for a brace."],
    '3': ["Great placement! They push hard for three.", "Stopped just inside the boundary, three runs saved.", "Timed well, but the outfield is slow. Three runs."],
    '4': ["FOUR! Glorious shot through the covers!", "Smashed down the ground for FOUR!", "Edged and four! Lucky boundary.", "FOUR! Pulled away with power.", "Beautiful drive, races to the fence for FOUR!"],
    '6': ["SIX! That's huge! Out of the ground!", "SIX! Clean strike over long-on!", "Maximum! He's picked the length early.", "Top edge... and it flies for SIX!", "Launched into the stands! massive hit!"],
    'W': ["OUT! Clean bowled! What a delivery!", "Caught! Straight to the fielder.", "LBW! That looked plumb.", "Run out! Mix up in the middle!", "Edged and taken! The keeper makes no mistake."],
    'Wd': ["Wide ball, too far outside off.", "Drifting down leg, called wide.", "Wayward delivery, signaled wide."],
    'Nb': ["No ball! Overstepping.", "No ball for height, free hit coming up."],
};

export const getCommentary = (runs: number, isOut: boolean, batterName: string, bowlerName: string, extraType?: string) => {
    if (isOut) {
        const templates = COMMENTARY_TEMPLATES['W'];
        return templates[Math.floor(Math.random() * templates.length)].replace('The keeper', 'The keeper').replace('fielder', 'fielder');
    }
    if (extraType === 'Wd') return COMMENTARY_TEMPLATES['Wd'][Math.floor(Math.random() * COMMENTARY_TEMPLATES['Wd'].length)];
    if (extraType === 'Nb') return COMMENTARY_TEMPLATES['Nb'][Math.floor(Math.random() * COMMENTARY_TEMPLATES['Nb'].length)];

    const key = runs > 6 ? '6' : runs.toString() as keyof typeof COMMENTARY_TEMPLATES;
    const templates = COMMENTARY_TEMPLATES[key] || COMMENTARY_TEMPLATES['0'];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const getRoleColor = (role: PlayerRole) => {
  switch (role) {
    case PlayerRole.BATSMAN: return 'text-blue-500 dark:text-blue-400';
    case PlayerRole.WICKET_KEEPER: return 'text-green-600 dark:text-green-400';
    case PlayerRole.ALL_ROUNDER: return 'text-yellow-600 dark:text-yellow-400';
    case PlayerRole.SPIN_BOWLER: return 'text-purple-600 dark:text-purple-400';
    case PlayerRole.FAST_BOWLER: return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
};

export const getRoleFullName = (role: PlayerRole) => {
    switch (role) {
        case PlayerRole.BATSMAN: return 'Batsman';
        case PlayerRole.WICKET_KEEPER: return 'Wicket-Keeper';
        case PlayerRole.ALL_ROUNDER: return 'All-Rounder';
        case PlayerRole.SPIN_BOWLER: return 'Spin Bowler';
        case PlayerRole.FAST_BOWLER: return 'Bowler';
        default: return 'Player';
    }
};

export const getBattingStyleLabel = (style: string) => {
    switch (style) {
        case 'A': return 'Aggressive';
        case 'D': return 'Defensive';
        case 'N': return 'Balanced';
        case 'NA': return 'N/A';
        default: return style;
    }
};

export const BATTING_STYLE_OPTIONS = ['A', 'D', 'N', 'NA'];

export const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
}

export const getPlayerById = (id: string, allPlayers: Player[]) => {
    const player = allPlayers.find(p => p.id === id);
    if (!player) {
      return { id: 'unknown', name: 'Unknown Player', role: PlayerRole.BATSMAN, battingSkill: 30, secondarySkill: 30, style: 'N' } as any as Player;
    }
    return player;
};

export const generateAutoXI = (squad: Player[], format: Format) => {
    const xi: Player[] = [];
    const selectedIds = new Set<string>();
    
    const MAX_FOREIGN_IN_XI = 4; 
    let foreignInXI = 0;

    const addPlayer = (p: Player) => {
        if (selectedIds.has(p.id)) return false;
        if (p.isForeign && foreignInXI >= MAX_FOREIGN_IN_XI) return false;
        
        xi.push(p);
        selectedIds.add(p.id);
        if (p.isForeign) foreignInXI++;
        return true;
    };

    // Sort squad by overall quality for the format
    const sortedSquad = [...squad].sort((a, b) => {
        const scoreA = Math.max(a.battingSkill, a.secondarySkill);
        const scoreB = Math.max(b.battingSkill, b.secondarySkill);
        return scoreB - scoreA;
    });

    // 1. Must have exactly 1 Wicket Keeper (Best batting keeper)
    const keepers = sortedSquad.filter(p => p.role === PlayerRole.WICKET_KEEPER);
    if (keepers.length > 0) addPlayer(keepers[0]);

    // 2. Ensure at least one Emerging Player (if available)
    const emerging = sortedSquad.filter(p => p.isEmerging);
    if (emerging.length > 0) {
        addPlayer(emerging[0]);
    }

    // 3. Must have 5 Batters (Best available)
    const batters = sortedSquad.filter(p => p.role === PlayerRole.BATSMAN);
    let bCount = 0;
    for (const p of batters) {
        if (bCount < 5) {
            if (addPlayer(p)) bCount++;
        } else break;
    }

    // 3. Must have 1 or 2 All-Rounders
    const allRounders = sortedSquad.filter(p => p.role === PlayerRole.ALL_ROUNDER);
    let arCount = 0;
    for (const p of allRounders) {
        if (xi.length < 11 && arCount < 2) {
            if (addPlayer(p)) arCount++;
        } else break;
    }

    // 4. Must have 3 or 4 Bowlers (Fast or Spin)
    const bowlers = sortedSquad.filter(p => 
        [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER].includes(p.role)
    );
    let bowlingCount = 0;
    for (const p of bowlers) {
        if (xi.length < 11 && bowlingCount < 4) {
            if (addPlayer(p)) bowlingCount++;
        } else break;
    }

    // 5. Emergency fill if rules were too strict or squad is small
    const remainingBest = sortedSquad.filter(p => !selectedIds.has(p.id));
    for (const p of remainingBest) {
        if (xi.length < 11) {
            addPlayer(p);
        } else break;
    }

    // Sort XI for a realistic batting order: Openers -> Batters -> ARs -> Bowlers
    return xi.sort((a, b) => {
        const roleOrder = {
            [PlayerRole.BATSMAN]: 1,
            [PlayerRole.WICKET_KEEPER]: 2,
            [PlayerRole.ALL_ROUNDER]: 3,
            [PlayerRole.SPIN_BOWLER]: 4,
            [PlayerRole.FAST_BOWLER]: 5,
        };
        // Openers first
        if (a.isOpener && !b.isOpener) return -1;
        if (!a.isOpener && b.isOpener) return 1;
        
        // Then by role order
        if (roleOrder[a.role] !== roleOrder[b.role]) {
            return roleOrder[a.role] - roleOrder[b.role];
        }
        
        // Then by batting skill
        return b.battingSkill - a.battingSkill;
    }).slice(0, 11);
};

export const calculateTeamRatings = (squad: Player[]) => {
    if (squad.length === 0) return { strength: 0, batting: 0, bowling: 0, starPlayers: 0 };
    
    const top11 = [...squad].sort((a, b) => Math.max(b.battingSkill, b.secondarySkill) - Math.max(a.battingSkill, a.secondarySkill)).slice(0, 11);
    
    const battingAvg = top11.reduce((sum, p) => sum + p.battingSkill, 0) / 11;
    const bowlingAvg = top11.reduce((sum, p) => sum + p.secondarySkill, 0) / 11;
    const strength = (battingAvg * 0.5) + (bowlingAvg * 0.5);
    const starPlayers = squad.filter(p => Math.max(p.battingSkill, p.secondarySkill) >= 80).length;
    
    return {
        strength: Math.round(strength),
        batting: Math.round(battingAvg),
        bowling: Math.round(bowlingAvg),
        starPlayers
    };
};

export const getTeamHighlights = (squad: Player[]) => {
    if (squad.length === 0) return null;
    
    const bestBatter = [...squad].sort((a, b) => b.battingSkill - a.battingSkill)[0];
    const bestBowler = [...squad].sort((a, b) => b.secondarySkill - a.secondarySkill)[0];
    const mostComplete = [...squad].sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill))[0];
    
    return {
        bestBatter,
        bestBowler,
        mostComplete
    };
};

export const getBatterTier = (battingSkill: number) => {
    if (battingSkill >= 80) return 'tier1';
    if (battingSkill >= 65) return 'tier2';
    if (battingSkill >= 50) return 'tier3';
    if (battingSkill >= 30) return 'tier4';
    return 'tier5';
};

const T20_PROFILES = {
    tier1: { NA: { avg: 40, sr: 135 }, N: { avg: 40, sr: 125 }, D: { avg: 30, sr: 110 }, A: { avg: 25, sr: 155 } },
    tier2: { NA: { avg: 32, sr: 125 }, N: { avg: 32, sr: 115 }, D: { avg: 25, sr: 100 }, A: { avg: 22, sr: 140 } },
    tier3: { NA: { avg: 25, sr: 115 }, N: { avg: 25, sr: 105 }, D: { avg: 20, sr: 95 }, A: { avg: 18, sr: 125 } },
    tier4: { NA: { avg: 18, sr: 100 }, N: { avg: 18, sr: 90 }, D: { avg: 15, sr: 85 }, A: { avg: 15, sr: 110 } },
    tier5: { NA: { avg: 12, sr: 85 }, N: { avg: 12, sr: 80 }, D: { avg: 10, sr: 70 }, A: { avg: 10, sr: 95 } },
};
const ODI_PROFILES = {
    tier1: { NA: { avg: 45, sr: 95 }, N: { avg: 45, sr: 90 }, D: { avg: 40, sr: 80 }, A: { avg: 35, sr: 105 } },
    tier2: { NA: { avg: 38, sr: 90 }, N: { avg: 38, sr: 85 }, D: { avg: 32, sr: 75 }, A: { avg: 28, sr: 100 } },
    tier3: { NA: { avg: 30, sr: 85 }, N: { avg: 30, sr: 80 }, D: { avg: 25, sr: 70 }, A: { avg: 22, sr: 90 } },
    tier4: { NA: { avg: 22, sr: 75 }, N: { avg: 22, sr: 70 }, D: { avg: 18, sr: 65 }, A: { avg: 16, sr: 85 } },
    tier5: { NA: { avg: 15, sr: 70 }, N: { avg: 15, sr: 65 }, D: { avg: 12, sr: 60 }, A: { avg: 12, sr: 75 } },
};
const FC_PROFILES = {
    tier1: { NA: { avg: 45, sr: 55 }, N: { avg: 45, sr: 50 }, D: { avg: 48, sr: 45 }, A: { avg: 40, sr: 65 } },
    tier2: { NA: { avg: 38, sr: 50 }, N: { avg: 38, sr: 45 }, D: { avg: 40, sr: 40 }, A: { avg: 32, sr: 60 } },
    tier3: { NA: { avg: 30, sr: 45 }, N: { avg: 30, sr: 40 }, D: { avg: 32, sr: 38 }, A: { avg: 25, sr: 55 } },
    tier4: { NA: { avg: 22, sr: 40 }, N: { avg: 22, sr: 38 }, D: { avg: 25, sr: 35 }, A: { avg: 18, sr: 48 } },
    tier5: { NA: { avg: 15, sr: 35 }, N: { avg: 15, sr: 32 }, D: { avg: 18, sr: 30 }, A: { avg: 12, sr: 40 } },
};

export const BATTING_PROFILES = {
  [Format.T20]: T20_PROFILES,
  [Format.ODI]: ODI_PROFILES,
  [Format.SHIELD]: FC_PROFILES,
};

export const LoadingSpinner = () => (
    React.createElement("div", { className: "flex justify-center items-center h-full w-full" },
        React.createElement("div", { className: "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 dark:border-teal-400" })
    )
);

export const aggregateStats = (player: Player, formats: Format[]): PlayerStats => {
    const total = generateSingleFormatInitialStats();
    formats.forEach(f => {
        const s = player.stats[f];
        if (s) {
            total.matches += s.matches;
            total.runs += s.runs;
            total.ballsFaced += s.ballsFaced;
            total.dismissals += s.dismissals;
            if (s.highestScore > total.highestScore) total.highestScore = s.highestScore;
            total.hundreds += s.hundreds;
            total.fifties += s.fifties;
            total.thirties += s.thirties;
            total.fours += s.fours;
            total.sixes += s.sixes;
            if (s.fastestFifty > 0 && (total.fastestFifty === 0 || s.fastestFifty < total.fastestFifty)) total.fastestFifty = s.fastestFifty;
            if (s.fastestHundred > 0 && (total.fastestHundred === 0 || s.fastestHundred < total.fastestHundred)) total.fastestHundred = s.fastestHundred;
            total.wickets += s.wickets;
            total.ballsBowled += s.ballsBowled;
            total.runsConceded += s.runsConceded;
            total.threeWicketHauls += s.threeWicketHauls;
            total.fiveWicketHauls += s.fiveWicketHauls;
            total.catches += s.catches;
            total.runOuts += s.runOuts;
            total.manOfTheMatchAwards += s.manOfTheMatchAwards;
            if (s.bestBowlingWickets > total.bestBowlingWickets || (s.bestBowlingWickets === total.bestBowlingWickets && s.bestBowlingRuns < total.bestBowlingRuns)) {
                total.bestBowlingWickets = s.bestBowlingWickets;
                total.bestBowlingRuns = s.bestBowlingRuns;
                total.bestBowling = s.bestBowling;
            }
        }
    });
    total.average = total.dismissals > 0 ? total.runs / total.dismissals : total.runs;
    total.strikeRate = total.ballsFaced > 0 ? (total.runs / total.ballsFaced) * 100 : 0;
    total.bowlingAverage = total.wickets > 0 ? total.runsConceded / total.wickets : 0; 
    total.economy = total.ballsBowled > 0 ? (total.runsConceded / total.ballsBowled) * 6 : 0;
    return total;
};

export const calculatePopularityPoints = (result: MatchResult, format: Format, userTeamId: string): number => {
    let points = 0;
    const userInnings = [result.firstInning, result.secondInning, result.thirdInning, result.fourthInning].filter(i => i?.teamId === userTeamId);
    userInnings.forEach(ing => { if (ing && ing.score >= 200) points += 1; });
    if (result.winnerId === userTeamId) points += 2;
    return points;
};

export const generateLeagueSchedule = (teams: Team[], format: Format, doubleRoundRobin: boolean = true): Match[] => {
    const matches: Match[] = [];
    if (teams.length < 2) return [];

    // Basic round-robin pairs
    const pairs: [Team, Team][] = [];
    for(let i=0; i<teams.length; i++) {
        for(let j=i+1; j<teams.length; j++) {
            pairs.push([teams[i], teams[j]]);
        }
    }

    // Add matches
    let matchCounter = 1;
    pairs.forEach(([tA, tB]) => {
        matches.push({ matchNumber: matchCounter++, teamA: tA.name, teamAId: tA.id, vs: 'vs', teamB: tB.name, teamBId: tB.id, date: `Match Day ${matchCounter}`, group: 'Round-Robin' });
    });

    if (doubleRoundRobin) {
        pairs.forEach(([tA, tB]) => {
            matches.push({ matchNumber: matchCounter++, teamA: tB.name, teamAId: tB.id, vs: 'vs', teamB: tA.name, teamBId: tA.id, date: `Match Day ${matchCounter}`, group: 'Round-Robin' });
        });
    }

    // Add knockouts
    if (teams.length >= 4) {
        matches.push({ matchNumber: 'SF1', teamA: '1st', vs: 'vs', teamB: '4th', date: 'Semi-Final Day', group: 'Semi-Finals' });
        matches.push({ matchNumber: 'SF2', teamA: '2nd', vs: 'vs', teamB: '3rd', date: 'Semi-Final Day', group: 'Semi-Finals' });
        matches.push({ matchNumber: 'Final', teamA: 'SF1 Winner', vs: 'vs', teamB: 'SF2 Winner', date: 'Finals Day', group: 'Final' });
    } else if (teams.length >= 2) {
        matches.push({ matchNumber: 'Final', teamA: '1st', vs: 'vs', teamB: '2nd', date: 'Finals Day', group: 'Final' });
    }

    return matches;
};

export const negotiateSponsorships = (popularity: number): Record<Format, Sponsorship> => {
    const newSponsorships: any = {};
    Object.values(Format).forEach(f => {
        newSponsorships[f] = { sponsorName: BRANDS[0].name, tournamentName: "Cup", logoColor: "text-teal-500", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: TV_CHANNELS[0].name, tvLogo: TV_CHANNELS[0].logo };
    });
    return newSponsorships;
};

export const generateMatchNews = (result: MatchResult, format: string, sponsorship: Sponsorship): NewsArticle => ({
    id: `news-${(Date.now())}`, headline: `Match Result: ${result.summary}`, date: new Date().toLocaleDateString(), excerpt: result.summary, content: result.summary, type: 'match'
});

export const generatePreMatchNews = (match: Match, gameData: GameData): NewsArticle => ({
    id: `news-pre-${(Date.now())}`, headline: `Upcoming: ${match.teamA} vs ${match.teamB}`, date: new Date().toLocaleDateString(), excerpt: "Pre-match preview.", content: "Full preview content.", type: 'match'
});

export interface PlayerRanking {
    player: Player;
    points: number;
    teamName: string;
}

export const calculatePlayerRankings = (players: Player[], format: Format, teams: Team[]) => {
    const scoredPlayers = players.map(p => ({ player: p, points: p.stats[format]?.runs || 0, teamName: "Team" }));
    return { batters: scoredPlayers, bowlers: scoredPlayers, allRounders: scoredPlayers };
};