import React from 'react';
import { Match, Team } from '../types';
import { MapPin, Clock, Trophy } from 'lucide-react';

const MatchCard = ({ match, teams }: { match: Match, teams: Team[] }) => {
  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  if (!homeTeam || !awayTeam) return null;

  return (
    <div className="bg-card-bg/40 border border-border rounded-[32px] p-8 hover:border-teal/30 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">
          <Clock size={14} className="text-teal" /> 
          {new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
          match.status === 'Live' ? 'bg-red-500 text-white animate-pulse' : 
          match.status === 'Completed' ? 'bg-white/10 text-ink/40' : 'bg-teal/20 text-teal'
        }`}>
          {match.status}
        </div>
      </div>

      <div className="flex items-center justify-between gap-8 mb-8 relative z-10">
        <div className="flex-1 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-[32px] bg-bg border border-border flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
            <img 
              src={homeTeam.logo} 
              alt={homeTeam.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="font-display text-xl tracking-tight">{homeTeam.shortName}</div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {match.status === 'Completed' ? (
            <div className="text-3xl font-display tracking-tighter">
              {match.score?.home.runs}/{match.score?.home.wickets} <span className="text-ink/10 mx-2">VS</span> {match.score?.away.runs}/{match.score?.away.wickets}
            </div>
          ) : (
            <div className="text-5xl font-display text-ink/5 italic tracking-tighter">VS</div>
          )}
        </div>

        <div className="flex-1 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-[32px] bg-bg border border-border flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
            <img 
              src={awayTeam.logo} 
              alt={awayTeam.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="font-display text-xl tracking-tight">{awayTeam.shortName}</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border/50 relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink/40">
          <MapPin size={14} className="text-teal" /> {match.venue}
        </div>
        {match.result && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal">
            <Trophy size={14} /> {match.result}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Fixtures({ matches, teams }: { matches: Match[], teams: Team[] }) {
  return (
    <div className="p-6 space-y-12">
      <div className="flex gap-4">
        <button className="bg-teal text-bg px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg glow-teal">Upcoming</button>
        <button className="bg-card-bg border border-border text-ink/40 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-colors">Results</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} teams={teams} />
        ))}
      </div>
    </div>
  );
}
