import React from 'react';
import { PlayerAvatar as AvatarType } from '../types';

interface PlayerAvatarProps {
  avatar?: AvatarType;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ avatar, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const containerStyle = typeof size === 'number' ? { width: size, height: size } : {};
  const containerClass = typeof size === 'string' ? sizeClasses[size] : '';

  const photo = avatar?.customPhoto || (avatar as any)?.photoUrl;

  if (photo) {
    return (
      <div 
        className={`rounded-full overflow-hidden border-2 border-teal-500/30 ${containerClass} ${className}`}
        style={containerStyle}
      >
        <img 
          src={photo} 
          alt="Player" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Default SVG Avatar
  // Note: types.ts uses numbers for faceShape, hairStyle, facialHair
  // We'll map them or just use them if they are strings in some cases
  const {
    faceShape = 0,
    skinColor = '#FAD7B0',
    hairStyle = 0,
    hairColor = '#4B2C20',
    facialHair = 0,
  } = avatar || {};

  const isRoundFace = (faceShape as any) === 1 || (faceShape as any) === 'round';
  const isBald = (hairStyle as any) === 2 || (hairStyle as any) === 'bald';
  const isLongHair = (hairStyle as any) === 1 || (hairStyle as any) === 'long';
  const hasFacialHair = (facialHair as any) !== 0 && (facialHair as any) !== 'none';

  return (
    <div 
      className={`rounded-full overflow-hidden bg-white/5 border-2 border-teal-500/20 flex items-center justify-center ${containerClass} ${className}`}
      style={containerStyle}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Face */}
        <path 
          d={isRoundFace ? "M20,50 Q20,85 50,85 Q80,85 80,50 Q80,15 50,15 Q20,15 20,50" : "M25,40 Q25,85 50,85 Q75,85 75,40 Q75,15 50,15 Q25,15 25,40"} 
          fill={skinColor} 
        />
        
        {/* Eyes */}
        <circle cx="40" cy="45" r="3" fill="#333" />
        <circle cx="60" cy="45" r="3" fill="#333" />
        
        {/* Mouth */}
        <path d="M40,65 Q50,70 60,65" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />

        {/* Hair */}
        {!isBald && (
          <path 
            d={isLongHair ? "M20,40 Q20,10 50,10 Q80,10 80,40 L80,70 Q80,80 70,80 L30,80 Q20,80 20,70 Z" : "M25,40 Q25,15 50,15 Q75,15 75,40 Q75,30 50,30 Q25,30 25,40"} 
            fill={hairColor} 
          />
        )}

        {/* Facial Hair */}
        {hasFacialHair && (
          <path 
            d="M35,75 Q50,85 65,75 L65,80 Q50,90 35,80 Z" 
            fill={hairColor} 
            opacity="0.6"
          />
        )}
      </svg>
    </div>
  );
};

export default PlayerAvatar;
