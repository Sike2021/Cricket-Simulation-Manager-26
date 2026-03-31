import React from 'react';
import { Match, Team } from '../types';
import { MapPin, Clock, Trophy } from 'lucide-react';

export default function Fixtures({ matches, teams }: { matches: Match[], teams: Team[] }) {
  // Group matches by "Match Day" (mocking for UI)
  const matchDays = [
    { day: 1, matches: matches.slice(0, 2) },
    { day: 2, matches: matches.slice(0, 2) },
    { day: 3, matches: matches.slice(0, 2) },
    { day: 4, matches: matches.slice(0, 1) },
    { day: 5, matches: matches.slice(0, 1) },
  ];

  return (
    <div className="max-w-md mx-auto bg-[#0F171A] min-h-screen text-ink font-sans pb-20 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">T20 League Fixtures</h2>
      </div>

      <div className="space-y-8">
        {matchDays.map((day) => (
          <div key={day.day} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40 italic px-2">Match Day {day.day}</h3>
            <div className="space-y-2">
              {day.matches.map((match, idx) => {
                const homeTeam = teams.find(t => t.id === match.homeTeamId);
                const awayTeam = teams.find(t => t.id === match.awayTeamId);
                if (!homeTeam || !awayTeam) return null;

                return (
                  <div key={`${day.day}-${idx}`} className="bg-[#1A262B] border-l-4 border-accent rounded-xl p-4 flex items-center justify-between group hover:bg-[#202E34] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black italic tracking-tight w-16">{homeTeam.shortName === 'MUM' ? 'KINGS' : homeTeam.shortName}</span>
                          <img src={homeTeam.logo} className="w-4 h-4 rounded-sm" alt="" />
                          <span className="text-[10px] font-black text-ink/20 italic">VS</span>
                          <img src={awayTeam.logo} className="w-4 h-4 rounded-sm" alt="" />
                          <span className="text-xs font-black italic tracking-tight">{awayTeam.shortName === 'LDN' ? 'SIXERS' : awayTeam.shortName}</span>
                        </div>
                        <div className="text-[8px] text-ink/40 font-bold uppercase tracking-widest ml-1">
                          {idx === 0 ? 'Keenjhur' : 'School Ground'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
