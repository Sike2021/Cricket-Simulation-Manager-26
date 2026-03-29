import React from 'react';
import { Player } from '../types';

export const PlayerAvatar = ({ player, size = 16 }: { player: Player, size?: number }) => {
  if (player.avatar?.type === 'photo' && player.avatar.url) {
    return (
      <img 
        src={player.avatar.url} 
        alt={player.name} 
        className={`w-${size} h-${size} rounded-2xl object-cover border border-white/10`}
        referrerPolicy="no-referrer"
      />
    );
  }

  if (player.avatar?.type === 'svg' && player.avatar.svgConfig) {
    const { skinColor, hairStyle, facialHair, faceShape } = player.avatar.svgConfig;
    // Simple SVG avatar representation based on config
    return (
      <svg viewBox="0 0 100 100" className={`w-${size} h-${size} rounded-2xl bg-white/5`}>
        {/* Face */}
        <circle cx="50" cy="50" r={faceShape === 'round' ? 40 : 35} fill={skinColor} />
        {/* Eyes */}
        <circle cx="35" cy="45" r="4" fill="#1a1a1a" />
        <circle cx="65" cy="45" r="4" fill="#1a1a1a" />
        {/* Mouth */}
        <path d="M 40 65 Q 50 75 60 65" stroke="#1a1a1a" strokeWidth="3" fill="transparent" />
        
        {/* Hair */}
        {hairStyle === 'short' && <path d="M 20 40 Q 50 10 80 40 L 80 30 Q 50 0 20 30 Z" fill="#1a1a1a" />}
        {hairStyle === 'curly' && <path d="M 15 45 A 10 10 0 1 1 25 35 A 10 10 0 1 1 45 25 A 10 10 0 1 1 65 25 A 10 10 0 1 1 85 35 A 10 10 0 1 1 85 55 A 10 10 0 1 1 75 65" fill="#1a1a1a" />}
        {hairStyle === 'bald' && null}

        {/* Facial Hair */}
        {facialHair === 'beard' && <path d="M 25 55 Q 50 90 75 55 Q 50 80 25 55" fill="#1a1a1a" />}
        {facialHair === 'mustache' && <path d="M 35 60 Q 50 55 65 60 Q 50 65 35 60" fill="#1a1a1a" />}
      </svg>
    );
  }

  // Fallback to initials
  return (
    <div className={`w-${size} h-${size} rounded-2xl bg-white/5 flex items-center justify-center text-3xl font-black text-accent/20 group-hover:text-accent transition-colors border border-white/5`}>
      {player.name.split(' ').map(n => n[0]).join('')}
    </div>
  );
};
