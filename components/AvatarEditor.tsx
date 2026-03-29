import React, { useState } from 'react';
import { Player, PlayerAvatar as PlayerAvatarType } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { AVATAR_OPTIONS } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, RefreshCw, Save } from 'lucide-react';

interface AvatarEditorProps {
    player: Player;
    onSave: (updatedPlayer: Player) => void;
    onClose: () => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ player, onSave, onClose }) => {
    const [avatar, setAvatar] = useState<PlayerAvatarType>(player.avatar || {
        faceShape: 'oval',
        skinColor: '#F1C27D',
        hairStyle: 'short',
        hairColor: '#2C222B',
        facialHair: 'none'
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRandomize = () => {
        const randomAvatar = {
            faceShape: AVATAR_OPTIONS.faceShapes[Math.floor(Math.random() * AVATAR_OPTIONS.faceShapes.length)],
            skinColor: AVATAR_OPTIONS.skinColors[Math.floor(Math.random() * AVATAR_OPTIONS.skinColors.length)],
            hairStyle: AVATAR_OPTIONS.hairStyles[Math.floor(Math.random() * AVATAR_OPTIONS.hairStyles.length)],
            hairColor: AVATAR_OPTIONS.hairColors[Math.floor(Math.random() * AVATAR_OPTIONS.hairColors.length)],
            facialHair: AVATAR_OPTIONS.facialHairs[Math.floor(Math.random() * AVATAR_OPTIONS.facialHairs.length)],
        };
        setAvatar(randomAvatar);
    };

    const handleSave = () => {
        onSave({ ...player, avatar });
        onClose();
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
            <div className="bg-[#0a0f0f] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="font-display text-2xl tracking-tight uppercase italic">Edit Player Avatar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Preview Section */}
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative group">
                            <PlayerAvatar avatar={avatar} size={200} className="border-4 border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.3)]" />
                            <label className="absolute bottom-2 right-2 p-3 bg-teal-500 text-black rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                <Upload size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                        <div className="text-center">
                            <h3 className="font-display text-xl uppercase italic text-teal-500">{player.name}</h3>
                            <p className="text-white/50 text-sm font-mono uppercase tracking-widest">{player.role}</p>
                        </div>
                        <button 
                            onClick={handleRandomize}
                            className="flex items-center space-x-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm uppercase tracking-widest font-bold"
                        >
                            <RefreshCw size={16} />
                            <span>Randomize</span>
                        </button>
                    </div>

                    {/* Controls Section */}
                    <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {/* Skin Color */}
                        <div className="space-y-3">
                            <label className="label-micro">Skin Tone</label>
                            <div className="flex flex-wrap gap-2">
                                {AVATAR_OPTIONS.skinColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setAvatar(prev => ({ ...prev, skinColor: color, photoUrl: undefined }))}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${avatar.skinColor === color ? 'border-teal-500 scale-110' : 'border-transparent opacity-50'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Hair Style */}
                        <div className="space-y-3">
                            <label className="label-micro">Hair Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {AVATAR_OPTIONS.hairStyles.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setAvatar(prev => ({ ...prev, hairStyle: style, photoUrl: undefined }))}
                                        className={`px-3 py-2 rounded-lg border text-xs uppercase font-bold transition-all ${avatar.hairStyle === style ? 'bg-teal-500 text-black border-teal-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hair Color */}
                        <div className="space-y-3">
                            <label className="label-micro">Hair Color</label>
                            <div className="flex flex-wrap gap-2">
                                {AVATAR_OPTIONS.hairColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setAvatar(prev => ({ ...prev, hairColor: color, photoUrl: undefined }))}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${avatar.hairColor === color ? 'border-teal-500 scale-110' : 'border-transparent opacity-50'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Facial Hair */}
                        <div className="space-y-3">
                            <label className="label-micro">Facial Hair</label>
                            <div className="grid grid-cols-3 gap-2">
                                {AVATAR_OPTIONS.facialHairs.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setAvatar(prev => ({ ...prev, facialHair: style, photoUrl: undefined }))}
                                        className={`px-3 py-2 rounded-lg border text-xs uppercase font-bold transition-all ${avatar.facialHair === style ? 'bg-teal-500 text-black border-teal-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end space-x-4">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-3 bg-teal-500 text-black rounded-full font-bold uppercase tracking-widest text-sm hover:bg-teal-400 transition-colors flex items-center space-x-2"
                    >
                        <Save size={18} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
