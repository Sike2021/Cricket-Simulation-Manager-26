import React, { useState } from 'react';
import { Player, PlayerAvatar as AvatarType } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { X, Upload, Check, RefreshCw } from 'lucide-react';

interface Props {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onClose: () => void;
}

export default function PlayerEditor({ player, onSave, onClose }: Props) {
  const [avatar, setAvatar] = useState<AvatarType>(player.avatar);
  const [name, setName] = useState(player.name);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar({ ...avatar, customPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const randomize = () => {
    setAvatar({
      faceShape: Math.floor(Math.random() * 5),
      skinColor: ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'][Math.floor(Math.random() * 5)],
      hairStyle: Math.floor(Math.random() * 10),
      hairColor: ['#000000', '#4B2C20', '#7B3F00', '#D4AF37'][Math.floor(Math.random() * 4)],
      facialHair: Math.floor(Math.random() * 5),
      eyeColor: ['#000000', '#4B2C20', '#0000FF', '#008000'][Math.floor(Math.random() * 4)],
      eyeShape: Math.floor(Math.random() * 3),
      noseShape: Math.floor(Math.random() * 3),
      earShape: Math.floor(Math.random() * 3),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card-bg border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-display">Edit Player</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8 flex flex-col items-center">
            <PlayerAvatar avatar={avatar} size={200} className="glow-teal" />
            
            <div className="flex gap-4 w-full">
              <label className="flex-1 bg-white/5 border border-border p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:bg-white/10 transition-all">
                <Upload size={20} className="text-teal" />
                <span className="text-xs font-bold uppercase tracking-widest">Upload Photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
              <button 
                onClick={randomize}
                className="flex-1 bg-white/5 border border-border p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all"
              >
                <RefreshCw size={20} className="text-accent" />
                <span className="text-xs font-bold uppercase tracking-widest">Randomize</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/40">Player Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-border p-4 rounded-2xl outline-none focus:border-teal transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40">Skin Color</label>
                <input 
                  type="color" 
                  value={avatar.skinColor} 
                  onChange={(e) => setAvatar({ ...avatar, skinColor: e.target.value, customPhoto: undefined })}
                  className="w-full h-12 bg-white/5 border border-border rounded-xl cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40">Hair Color</label>
                <input 
                  type="color" 
                  value={avatar.hairColor} 
                  onChange={(e) => setAvatar({ ...avatar, hairColor: e.target.value, customPhoto: undefined })}
                  className="w-full h-12 bg-white/5 border border-border rounded-xl cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Hair Style</span>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map(i => (
                    <button 
                      key={i}
                      onClick={() => setAvatar({ ...avatar, hairStyle: i, customPhoto: undefined })}
                      className={`w-8 h-8 rounded-lg border ${avatar.hairStyle === i ? 'border-teal bg-teal/10' : 'border-border'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Facial Hair</span>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map(i => (
                    <button 
                      key={i}
                      onClick={() => setAvatar({ ...avatar, facialHair: i, customPhoto: undefined })}
                      className={`w-8 h-8 rounded-lg border ${avatar.facialHair === i ? 'border-teal bg-teal/10' : 'border-border'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-border flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl font-bold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave({ ...player, name, avatar })}
            className="bg-teal text-bg px-10 py-3 rounded-2xl font-black uppercase tracking-tighter flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <Check size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
