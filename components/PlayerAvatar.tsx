import React from 'react';
import { PlayerAvatar as PlayerAvatarType } from '../types';

interface PlayerAvatarProps {
    avatar?: PlayerAvatarType;
    size?: number;
    className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ avatar, size = 40, className = "" }) => {
    if (avatar?.photoUrl) {
        return (
            <div 
                className={`rounded-full overflow-hidden bg-white/10 border border-white/20 ${className}`}
                style={{ width: size, height: size }}
            >
                <img 
                    src={avatar.photoUrl} 
                    alt="Player" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
            </div>
        );
    }

    // Default SVG Avatar
    const {
        skinColor = '#F1C27D',
        hairColor = '#2C222B',
        hairStyle = 'short',
        faceShape = 'oval',
        facialHair = 'none'
    } = avatar || {};

    return (
        <div 
            className={`rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Face */}
                <circle cx="50" cy="50" r="40" fill={skinColor} />
                
                {/* Eyes */}
                <circle cx="35" cy="45" r="3" fill="#000" />
                <circle cx="65" cy="45" r="3" fill="#000" />
                
                {/* Mouth */}
                <path d="M40 65 Q50 70 60 65" stroke="#000" strokeWidth="2" fill="none" />

                {/* Hair */}
                {hairStyle === 'short' && (
                    <path d="M20 40 Q50 10 80 40 L80 30 Q50 0 20 30 Z" fill={hairColor} />
                )}
                {hairStyle === 'spiky' && (
                    <path d="M20 40 L25 25 L35 35 L50 20 L65 35 L75 25 L80 40 Z" fill={hairColor} />
                )}
                {hairStyle === 'curly' && (
                    <g fill={hairColor}>
                        <circle cx="30" cy="30" r="10" />
                        <circle cx="50" cy="25" r="10" />
                        <circle cx="70" cy="30" r="10" />
                    </g>
                )}
                {hairStyle === 'fade' && (
                    <path d="M25 40 Q50 25 75 40 L75 35 Q50 20 25 35 Z" fill={hairColor} />
                )}
                {hairStyle === 'long' && (
                    <path d="M20 40 Q50 10 80 40 L85 80 Q50 70 15 80 Z" fill={hairColor} />
                )}

                {/* Facial Hair */}
                {facialHair === 'beard' && (
                    <path d="M30 60 Q50 90 70 60 L70 70 Q50 95 30 70 Z" fill={hairColor} opacity="0.8" />
                )}
                {facialHair === 'mustache' && (
                    <path d="M35 60 Q50 65 65 60 L65 62 Q50 67 35 62 Z" fill={hairColor} />
                )}
                {facialHair === 'stubble' && (
                    <circle cx="50" cy="70" r="15" fill={hairColor} opacity="0.2" />
                )}
                {facialHair === 'goatee' && (
                    <path d="M45 70 Q50 85 55 70 Z" fill={hairColor} opacity="0.8" />
                )}
            </svg>
        </div>
    );
};
