import React, { useMemo } from 'react';
import { Player, PlayerRole } from '../types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const getRoleBorderClass = (role: PlayerRole) => {
  switch (role) {
    case PlayerRole.BATSMAN: return 'border-blue-500';
    case PlayerRole.FAST_BOWLER:
    case PlayerRole.SPIN_BOWLER: return 'border-red-500';
    case PlayerRole.ALL_ROUNDER: return 'border-yellow-500';
    case PlayerRole.WICKET_KEEPER: return 'border-green-500';
    default: return 'border-purple-500';
  }
};

// Simple hash function
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, size = 'md', className = '' }) => {
  if (!player) return null;
  // Use avatarSeed if it exists, otherwise generate one
  const seedStr = player.avatarSeed || (player.avatarUrl ? `${player.id}-${player.name}-${player.avatarUrl}` : `${player.id}-${player.name}`);
  const seed = hashString(seedStr);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  const borderClass = getRoleBorderClass(player.role);
  
  // Generate a deterministic SVG avatar
  const svgContent = useMemo(() => {
    const bgColors = ['#1e293b', '#334155', '#0f172a', '#111827', '#18181b', '#020617', '#172554', '#450a0a', '#14532d', '#4a044e'];
    const bgColor = bgColors[seed % bgColors.length];
    
    // Generate some random shapes based on seed
    const shapes = [];
    for(let i=0; i<4; i++) {
      const shapeType = (seed + i) % 3;
      const cx = 10 + ((seed * (i+1)) % 80);
      const cy = 10 + ((seed * (i+2)) % 80);
      const r = 15 + ((seed * (i+3)) % 35);
      const opacity = 0.1 + (((seed * (i+4)) % 40) / 100);
      
      if (shapeType === 0) {
        shapes.push(`<circle cx="${cx}%" cy="${cy}%" r="${r}%" fill="white" opacity="${opacity}" />`);
      } else if (shapeType === 1) {
        shapes.push(`<rect x="${cx}%" y="${cy}%" width="${r}%" height="${r}%" fill="white" opacity="${opacity}" rx="8" transform="rotate(${(seed*i)%360} ${cx} ${cy})" />`);
      } else {
        shapes.push(`<polygon points="${cx},${cy-r} ${cx+r},${cy+r} ${cx-r},${cy+r}" fill="white" opacity="${opacity}" transform="rotate(${(seed*i)%360} ${cx} ${cy})" />`);
      }
    }

    const initials = (player?.name || 'Unknown').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${bgColor}" />
        ${shapes.join('')}
        <text x="50" y="50" font-family="system-ui, sans-serif" font-weight="800" font-size="36" fill="white" text-anchor="middle" dominant-baseline="central" letter-spacing="-1">${initials}</text>
      </svg>
    `;
  }, [seed, player.name]);

  return (
    <div className={`relative rounded-full overflow-hidden border-2 flex-shrink-0 ${borderClass} ${sizeClasses[size]} ${className}`}>
      {player.avatarUrl && (player.avatarUrl.startsWith('http') || player.avatarUrl.startsWith('data:image/')) ? (
        <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
      ) : (
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`} alt={player.name} className="w-full h-full object-cover" />
      )}
    </div>
  );
};
