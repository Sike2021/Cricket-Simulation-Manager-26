import React, { useState } from 'react';
import { Player } from '../types';
import { Activity, Shield, Zap, Heart, Edit2, Upload, Shuffle, X } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import { motion, AnimatePresence } from 'motion/react';

const PlayerEditor = ({ player, onClose, onSave }: { player: Player, onClose: () => void, onSave: (p: Player) => void }) => {
  const [avatarType, setAvatarType] = useState<'svg' | 'photo'>(player.avatar?.type || 'svg');
  const [photoUrl, setPhotoUrl] = useState(player.avatar?.url || '');
  const [svgConfig, setSvgConfig] = useState(player.avatar?.svgConfig || {
    faceShape: 'round',
    skinColor: '#f1c27d',
    hairStyle: 'short',
    facialHair: 'none'
  });

  const handleSave = () => {
    onSave({
      ...player,
      avatar: {
        type: avatarType,
        url: photoUrl,
        svgConfig
      }
    });
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setAvatarType('photo');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card-bg border border-border rounded-3xl p-8 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-ink/40 hover:text-ink">
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold mb-6">Edit {player.name}</h3>

        <div className="flex justify-center mb-8">
          <PlayerAvatar player={{ ...player, avatar: { type: avatarType, url: photoUrl, svgConfig } }} size={32} />
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setAvatarType('svg')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${avatarType === 'svg' ? 'bg-accent text-bg' : 'text-ink/60 hover:text-ink'}`}
            >
              Avatar Builder
            </button>
            <button
              onClick={() => setAvatarType('photo')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${avatarType === 'photo' ? 'bg-accent text-bg' : 'text-ink/60 hover:text-ink'}`}
            >
              Photo Upload
            </button>
          </div>

          {avatarType === 'svg' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-ink/60 uppercase tracking-widest mb-2">Face Shape</label>
                <select 
                  value={svgConfig.faceShape}
                  onChange={e => setSvgConfig({...svgConfig, faceShape: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-ink outline-none focus:border-accent"
                >
                  <option value="round">Round</option>
                  <option value="oval">Oval</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink/60 uppercase tracking-widest mb-2">Skin Color</label>
                <div className="flex gap-2">
                  {['#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#3d2c23'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSvgConfig({...svgConfig, skinColor: color})}
                      className={`w-8 h-8 rounded-full border-2 ${svgConfig.skinColor === color ? 'border-accent scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink/60 uppercase tracking-widest mb-2">Hair Style</label>
                <select 
                  value={svgConfig.hairStyle}
                  onChange={e => setSvgConfig({...svgConfig, hairStyle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-ink outline-none focus:border-accent"
                >
                  <option value="short">Short</option>
                  <option value="curly">Curly</option>
                  <option value="bald">Bald</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink/60 uppercase tracking-widest mb-2">Facial Hair</label>
                <select 
                  value={svgConfig.facialHair}
                  onChange={e => setSvgConfig({...svgConfig, facialHair: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-ink outline-none focus:border-accent"
                >
                  <option value="none">None</option>
                  <option value="beard">Beard</option>
                  <option value="mustache">Mustache</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-accent/50 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload size={32} className="mx-auto mb-4 text-ink/40" />
                <p className="text-sm text-ink/60">Click or drag photo to upload</p>
              </div>
            </div>
          )}

          <button 
            onClick={handleSave}
            className="w-full bg-accent text-bg py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all mt-8"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PlayerCard = ({ player, onEdit }: { player: Player, onEdit: (p: Player) => void }) => (
  <div className="bg-card-bg border border-border rounded-2xl p-6 hover:border-accent/50 transition-all group relative">
    <button 
      onClick={() => onEdit(player)}
      className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-ink/40 hover:text-accent hover:bg-accent/10 opacity-0 group-hover:opacity-100 transition-all"
    >
      <Edit2 size={14} />
    </button>

    <div className="flex justify-between items-start mb-6">
      <PlayerAvatar player={player} size={16} />
      <div className="text-right mt-2">
        <div className="text-xs text-ink/40 uppercase tracking-widest mb-1">{player.role}</div>
        <div className="text-xl font-bold">{player.name}</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Zap size={12} /> Batting
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${player.batting}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Shield size={12} /> Bowling
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${player.bowling}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Heart size={12} /> Fitness
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-red-500" style={{ width: `${player.fitness}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-ink/40 uppercase tracking-wider">
          <Activity size={12} /> Form
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500" style={{ width: `${player.form}%` }} />
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-border">
      <div className="text-sm font-mono text-ink/60">VALUE</div>
      <div className="text-lg font-bold text-accent">${(player.value / 1000000).toFixed(1)}M</div>
    </div>
  </div>
);

export default function Squad({ players, onUpdatePlayer, onRandomizeAll }: { players: Player[], onUpdatePlayer: (p: Player) => void, onRandomizeAll: () => void }) {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold">Active Squad</h3>
          <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full font-mono text-sm">
            <span className={players.length > 16 ? 'text-red-500' : 'text-accent'}>{players.length}</span>
            <span className="text-ink/40">/16</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onRandomizeAll}
            className="bg-white/5 border border-white/10 text-white px-6 py-2 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Shuffle size={16} />
            Randomize Avatars
          </button>
          <button className="bg-accent text-bg px-6 py-2 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
            Manage Lineup
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map(player => (
          <PlayerCard key={player.id} player={player} onEdit={setEditingPlayer} />
        ))}
      </div>

      <AnimatePresence>
        {editingPlayer && (
          <PlayerEditor 
            player={editingPlayer} 
            onClose={() => setEditingPlayer(null)} 
            onSave={onUpdatePlayer} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
