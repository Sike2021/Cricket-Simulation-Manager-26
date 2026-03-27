import React from 'react';
import { PlayerAvatar as AvatarType } from '../types';

interface Props {
  avatar: AvatarType;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ avatar, size = 100, className = "" }: Props) {
  if (avatar.customPhoto) {
    return (
      <div 
        className={`rounded-2xl overflow-hidden bg-white/5 border border-white/10 ${className}`}
        style={{ width: size, height: size }}
      >
        <img 
          src={avatar.customPhoto} 
          alt="Player" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Simple SVG-based dynamic avatar
  return (
    <div 
      className={`rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative ${className}`}
      style={{ width: size, height: size, backgroundColor: avatar.skinColor }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Face Shape */}
        <path 
          d={avatar.faceShape === 0 ? "M20,40 Q50,90 80,40 T20,40" : "M25,35 Q50,85 75,35 T25,35"} 
          fill={avatar.skinColor} 
        />
        
        {/* Eyes */}
        <circle cx="35" cy="45" r={2 + avatar.eyeShape} fill={avatar.eyeColor} />
        <circle cx="65" cy="45" r={2 + avatar.eyeShape} fill={avatar.eyeColor} />
        
        {/* Nose */}
        <path 
          d={`M50,45 L${48 + avatar.noseShape},55 L${52 - avatar.noseShape},55 Z`} 
          fill="rgba(0,0,0,0.1)" 
        />
        
        {/* Hair */}
        <path 
          d={avatar.hairStyle === 0 ? "M20,40 Q50,10 80,40" : "M15,45 Q50,5 85,45"} 
          stroke={avatar.hairColor} 
          strokeWidth="8" 
          fill="none" 
        />
        
        {/* Facial Hair */}
        {avatar.facialHair > 0 && (
          <path 
            d="M30,70 Q50,85 70,70" 
            stroke={avatar.hairColor} 
            strokeWidth={avatar.facialHair} 
            fill="none" 
            opacity="0.5"
          />
        )}
      </svg>
    </div>
  );
}
