import React from 'react';
import { motion } from 'motion/react';
import { Icons } from './Icons';

// --- Shared Styled Components ---

/**
 * A modern, slanted container with glassmorphism effects.
 * Aligned with V2.0 design language.
 */
export const SlantedContainer = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <div className={`relative overflow-hidden glass-card rounded-2xl border border-white/10 ${className}`}>
        <div className="absolute inset-0 skew-x-[-8deg] bg-gradient-to-br from-teal-500/5 to-blue-500/5 pointer-events-none" />
        <div className="relative z-10">{children}</div>
    </div>
);

/**
 * A high-impact action button with V2.0 styling.
 * Supports different variants and animations.
 */
export const ActionButton = ({ onClick, children, variant = "primary", className = "", disabled = false }: { 
    onClick: () => void, 
    children?: React.ReactNode, 
    variant?: "primary" | "secondary" | "danger" | "ghost", 
    className?: string,
    disabled?: boolean
}) => {
    const variants = {
        primary: "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]",
        secondary: "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 backdrop-blur-md",
        danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
        ghost: "bg-transparent hover:bg-white/5 text-white/60 hover:text-white"
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, translateY: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={`
                relative py-4 px-8 rounded-2xl font-black italic tracking-widest uppercase transition-all 
                flex items-center justify-center gap-3 overflow-hidden
                ${variants[variant]} 
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                ${className}
            `}
        >
            {variant === 'primary' && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            )}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    );
};

export { Icons };
