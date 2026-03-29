import React from 'react';
import { Match, Team } from '../types';
import { MapPin, Clock, Trophy } from 'lucide-react';

const MatchCard = ({ match, teams }: { match: Match, teams: Team[] }) => {
  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  if (!homeTeam || !awayTeam) return null;

  return (
    <div className="bg-card-bg border border-border rounded-3xl p-8 hover:border-accent/30 transition-all">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3 text-xs text-ink/40 font-mono uppercase tracking-widest">
          <Clock size={14} /> {new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          match.status === 'Live' ? 'bg-red-500 text-white animate-pulse' : 
          match.status === 'Completed' ? 'bg-white/10 text-ink/60' : 'bg-accent/20 text-accent'
        }`}>
          {match.status}
        </div>
      </div>

      <div className="flex items-center justify-between gap-8 mb-8">
        <div className="flex-1 text-center">
          <img 
            src={homeTeam.logo} 
            alt={homeTeam.name} 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-border"
            referrerPolicy="no-referrer"
          />
          <div className="font-bold text-lg">{homeTeam.shortName}</div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {match.status === 'Completed' ? (
            <div className="text-4xl font-black tracking-tighter">
              {match.score?.home.runs}/{match.score?.home.wickets} <span className="text-ink/20 mx-2">VS</span> {match.score?.away.runs}/{match.score?.away.wickets}
            </div>
          ) : (
            <div className="text-4xl font-black text-ink/10 italic tracking-tighter">VS</div>
          )}
        </div>

        <div className="flex-1 text-center">
          <img 
            src={awayTeam.logo} 
            alt={awayTeam.name} 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-border"
            referrerPolicy="no-referrer"
          />
          <div className="font-bold text-lg">{awayTeam.shortName}</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-ink/40">
          <MapPin size={14} /> {match.venue}
        </div>
        {match.result && (
          <div className="flex items-center gap-2 text-sm font-bold text-accent">
            <Trophy size={14} /> {match.result}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Fixtures({ matches, teams }: { matches: Match[], teams: Team[] }) {
  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-8">
        <button className="bg-accent text-bg px-6 py-2 rounded-xl font-bold">Upcoming</button>
        <button className="bg-white/5 text-ink/60 px-6 py-2 rounded-xl font-bold hover:bg-white/10 transition-colors">Results</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} teams={teams} />
        ))}
      </div>
    </div>
  );
}
