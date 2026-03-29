import React from 'react';
import { Player, PlayerAvatar as AvatarType } from '../../types';
import { AVATAR_OPTIONS, getRandomAvatar } from '../utils/avatarUtils';
import { PlayerAvatar } from './PlayerAvatar';
import { Camera, RefreshCw, X } from 'lucide-react';

interface AvatarEditorProps {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onClose: () => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ player, onSave, onClose }) => {
  const [avatar, setAvatar] = React.useState<AvatarType>(player.avatar || getRandomAvatar());

  const handleOptionChange = (key: keyof AvatarType, value: string) => {
    setAvatar(prev => ({ ...prev, [key]: value }));
  };

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
    setAvatar(getRandomAvatar());
  };

  const handleSave = () => {
    onSave({ ...player, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Preview Section */}
        <div className="md:w-1/3 bg-black/40 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
          <PlayerAvatar avatar={avatar} size="xl" className="mb-6 shadow-[0_0_40px_rgba(20,184,166,0.2)]" />
          <h3 className="font-display text-2xl text-teal-500 uppercase italic tracking-tighter mb-1">{player.name}</h3>
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest">{player.role}</p>
          
          <div className="mt-8 flex gap-3">
            <button 
              onClick={handleRandomize}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
              title="Randomize"
            >
              <RefreshCw className="w-5 h-5 text-teal-500 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <label className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer group" title="Upload Photo">
              <Camera className="w-5 h-5 text-teal-500" />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        {/* Editor Section */}
        <div className="md:w-2/3 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-3xl text-white uppercase italic tracking-tighter">Player Editor</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-6 h-6 text-white/40" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 flex-grow overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {/* Face Shape */}
            <div>
              <label className="label-micro mb-3 block">Face Shape</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.FACE_SHAPES.map(shape => (
                  <button
                    key={shape}
                    onClick={() => handleOptionChange('faceShape', shape)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${avatar.faceShape === shape ? 'bg-teal-500 text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Color */}
            <div>
              <label className="label-micro mb-3 block">Skin Tone</label>
              <div className="flex flex-wrap gap-3">
                {AVATAR_OPTIONS.SKIN_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleOptionChange('skinColor', color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${avatar.skinColor === color ? 'border-teal-500 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div>
              <label className="label-micro mb-3 block">Hair Style</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.HAIR_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => handleOptionChange('hairStyle', style)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${avatar.hairStyle === style ? 'bg-teal-500 text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div>
              <label className="label-micro mb-3 block">Hair Color</label>
              <div className="flex flex-wrap gap-3">
                {AVATAR_OPTIONS.HAIR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleOptionChange('hairColor', color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${avatar.hairColor === color ? 'border-teal-500 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Facial Hair */}
            <div>
              <label className="label-micro mb-3 block">Facial Hair</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.FACIAL_HAIR.map(style => (
                  <button
                    key={style}
                    onClick={() => handleOptionChange('facialHair', style)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${avatar.facialHair === style ? 'bg-teal-500 text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
            <button 
              onClick={handleSave}
              className="flex-grow btn-brutal py-4"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
