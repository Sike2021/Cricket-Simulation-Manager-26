import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Settings, 
  Dice5, 
  RotateCcw, 
  Save, 
  User, 
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Zap,
  DollarSign
} from 'lucide-react';
import { Player, PlayerCustomization } from '../types';
import { generatePlayerAvatar } from '../services/geminiService';
import { getPlayerAvatar } from '../lib/avatar';

interface PlayerEditorProps {
  player: Player;
  teamBudget: number;
  onSave: (updatedPlayer: Player, budgetDeduction: number) => void;
  onBack: () => void;
}
// ... (rest of the constants)
const faceShapes = [1, 2, 3, 4, 5];
const skinTones = [
  '#F5CBA7', '#EB984E', '#D35400', '#A04000', '#5D4037', '#3E2723'
];
const hairStyles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const facialHairStyles = [0, 1, 2, 3, 4, 5];
const eyeColors = ['#2E7D32', '#1565C0', '#4E342E', '#212121', '#78909C'];
const hairColors = ['#212121', '#4E342E', '#8D6E63', '#BDBDBD', '#FFD54F'];

export const PlayerEditor: React.FC<PlayerEditorProps> = ({ player, teamBudget, onSave, onBack }) => {
  const [customization, setCustomization] = useState<PlayerCustomization>(
    player.customization || {
      faceShape: 1,
      skinTone: 0,
      hairStyle: 1,
      facialHair: 0,
      eyeColor: eyeColors[3],
      hairColor: hairColors[0],
    }
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(player.avatarUrl || getPlayerAvatar(player));
  const [activeTab, setActiveTab] = useState<'APPEARANCE' | 'HAIR STYLE' | 'TRAINING'>('APPEARANCE');

  // Training state
  const [tempStats, setTempStats] = useState({
    batting: player.batting,
    bowling: player.bowling,
    rating: player.rating
  });
  const [budgetDeduction, setBudgetDeduction] = useState(0);

  const UPGRADE_COST = 50000; // $50k per point

  const handleUpgrade = (stat: 'batting' | 'bowling') => {
    if (teamBudget - budgetDeduction < UPGRADE_COST) return;
    
    setTempStats(prev => {
      const newVal = prev[stat] + 1;
      const newRating = Math.round((prev.batting + prev.bowling + (stat === 'batting' ? 1 : 0) + (stat === 'bowling' ? 1 : 0)) / 2);
      return {
        ...prev,
        [stat]: newVal,
        rating: Math.max(prev.rating, newRating)
      };
    });
    setBudgetDeduction(prev => prev + UPGRADE_COST);
  };

  const handleRandomize = () => {
    setCustomization({
      faceShape: Math.floor(Math.random() * faceShapes.length) + 1,
      skinTone: Math.floor(Math.random() * skinTones.length),
      hairStyle: Math.floor(Math.random() * hairStyles.length) + 1,
      facialHair: Math.floor(Math.random() * facialHairStyles.length),
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
    });
  };

  const handleOfflineGenerate = () => {
    // Generate a random picsum seed for variety
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://picsum.photos/seed/${randomSeed}/400/400`);
  };

  const handleGenerateAvatar = async () => {
    setIsGenerating(true);
    try {
      const hairDesc = `Hair style ${customization.hairStyle} with ${customization.hairColor} color`;
      const skinDesc = `Skin tone index ${customization.skinTone}`;
      const facialDesc = `Facial hair style ${customization.facialHair} and ${customization.eyeColor} eyes`;
      
      const url = await generatePlayerAvatar(
        player.name,
        player.role,
        hairDesc,
        skinDesc,
        facialDesc
      );
      
      if (url) {
        setAvatarUrl(url);
      }
    } catch (error) {
      console.error("Gemini generation failed, falling back to offline", error);
      handleOfflineGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...player,
      batting: tempStats.batting,
      bowling: tempStats.bowling,
      rating: tempStats.rating,
      customization,
      avatarUrl,
    }, budgetDeduction);
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1C1E] text-white font-sans overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#141618]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase italic">Player Customizer</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Editing: {player.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Available Budget</div>
            <div className="text-xl font-black italic text-accent flex items-center justify-end gap-1">
              <DollarSign size={16} />
              {((teamBudget - budgetDeduction) / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Current Rating</div>
            <div className="text-xl font-black italic text-[#00FFCC]">{tempStats.rating}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
            <Settings className="w-5 h-5 text-white/20" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Preview */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#1A1C1E] to-[#0D0E0F]">
          <div className="relative w-full max-w-sm aspect-square bg-[#0A0B0C] rounded-3xl border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Character Preview */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={avatarUrl}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  src={avatarUrl} 
                  alt="Player Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                  <Loader2 className="w-12 h-12 text-[#00FFCC] animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest italic text-[#00FFCC] animate-pulse">AI Generating Portrait...</p>
                </div>
              )}
            </div>

            {/* Overlay Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                {player.role}
              </div>
              <div className="px-3 py-1 bg-[#00FFCC]/20 backdrop-blur-md border border-[#00FFCC]/30 rounded-lg text-[10px] font-black uppercase tracking-widest italic text-[#00FFCC]">
                LVL {Math.floor(tempStats.rating / 10)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
            <button 
              onClick={handleOfflineGenerate}
              className="py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 uppercase text-[10px] font-black tracking-widest"
            >
              <ImageIcon className="w-4 h-4" />
              Offline Gen
            </button>
            <button 
              onClick={handleGenerateAvatar}
              disabled={isGenerating}
              className="py-3 bg-[#00FFCC] hover:bg-[#00E6B8] text-black rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[10px] font-black tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,204,0.2)]"
            >
              <Sparkles className="w-4 h-4" />
              AI Generate
            </button>
            <button 
              onClick={handleRandomize}
              className="col-span-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 uppercase text-[10px] font-black tracking-widest"
            >
              <Dice5 className="w-4 h-4" />
              Randomize Appearance
            </button>
          </div>
        </div>

        {/* Right Side - Customization Panel */}
        <div className="hidden lg:block w-1/2 border-l border-white/10 bg-[#141618] overflow-y-auto custom-scrollbar">
          {/* Tabs */}
          <div className="flex border-b border-white/10 sticky top-0 bg-[#141618] z-10">
            <button 
              onClick={() => setActiveTab('APPEARANCE')}
              className={`flex-1 py-5 text-[10px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'APPEARANCE' ? 'border-[#00FFCC] text-[#00FFCC]' : 'border-transparent text-white/40 hover:text-white'}`}
            >
              Appearance
            </button>
            <button 
              onClick={() => setActiveTab('HAIR STYLE')}
              className={`flex-1 py-5 text-[10px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'HAIR STYLE' ? 'border-[#00FFCC] text-[#00FFCC]' : 'border-transparent text-white/40 hover:text-white'}`}
            >
              Hair Style
            </button>
            <button 
              onClick={() => setActiveTab('TRAINING')}
              className={`flex-1 py-5 text-[10px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'TRAINING' ? 'border-[#00FFCC] text-[#00FFCC]' : 'border-transparent text-white/40 hover:text-white'}`}
            >
              Training
            </button>
          </div>

          <div className="p-8 space-y-10">
            {activeTab === 'APPEARANCE' && (
              <>
                {/* Face Shape */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Face Structure</h3>
                    <span className="text-[10px] font-mono text-[#00FFCC]">TYPE {customization.faceShape}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {faceShapes.map(shape => (
                      <button 
                        key={shape}
                        onClick={() => setCustomization(prev => ({ ...prev, faceShape: shape }))}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${customization.faceShape === shape ? 'border-[#00FFCC] bg-[#00FFCC]/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                      >
                        <div className="w-6 h-8 border-2 border-white/20 rounded-full"></div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Skin Tone */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Skin Tone</h3>
                  </div>
                  <div className="flex gap-2 h-10">
                    {skinTones.map((tone, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCustomization(prev => ({ ...prev, skinTone: idx }))}
                        className={`flex-1 rounded-lg transition-all border-2 ${customization.skinTone === idx ? 'border-[#00FFCC] scale-110 z-10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: tone }}
                      ></button>
                    ))}
                  </div>
                </section>

                {/* Eyes */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Eye Color</h3>
                  </div>
                  <div className="flex gap-4">
                    {eyeColors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setCustomization(prev => ({ ...prev, eyeColor: color }))}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${customization.eyeColor === color ? 'border-[#00FFCC] scale-110' : 'border-white/5 hover:border-white/20'}`}
                      >
                        <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: color }}></div>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
            {activeTab === 'HAIR STYLE' && (
              <>
                {/* Hair Style */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Hair Style</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {hairStyles.map(style => (
                      <button 
                        key={style}
                        onClick={() => setCustomization(prev => ({ ...prev, hairStyle: style }))}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${customization.hairStyle === style ? 'border-[#00FFCC] bg-[#00FFCC]/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                      >
                        <User className="w-6 h-6 text-white/10" />
                      </button>
                    ))}
                  </div>
                </section>

                {/* Hair Color */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Hair Color</h3>
                  </div>
                  <div className="flex gap-4">
                    {hairColors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setCustomization(prev => ({ ...prev, hairColor: color }))}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${customization.hairColor === color ? 'border-[#00FFCC] scale-110' : 'border-white/5 hover:border-white/20'}`}
                      >
                        <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: color }}></div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Facial Hair */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Facial Hair</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {facialHairStyles.map(style => (
                      <button 
                        key={style}
                        onClick={() => setCustomization(prev => ({ ...prev, facialHair: style }))}
                        className={`py-4 rounded-xl border flex items-center justify-center transition-all ${customization.facialHair === style ? 'border-[#00FFCC] bg-[#00FFCC]/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                      >
                        <span className="text-[9px] uppercase font-black tracking-widest italic">Style {style}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'TRAINING' && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest italic mb-4 flex items-center gap-2">
                    <Zap className="text-accent" size={16} />
                    Skill Upgrades
                  </h3>
                  <div className="space-y-6">
                    {/* Batting */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Batting Skill</div>
                        <div className="text-2xl font-black italic">{tempStats.batting}</div>
                      </div>
                      <button 
                        onClick={() => handleUpgrade('batting')}
                        disabled={teamBudget - budgetDeduction < UPGRADE_COST}
                        className="px-6 py-3 bg-accent text-bg rounded-xl font-black uppercase tracking-tighter text-[10px] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all disabled:opacity-20"
                      >
                        Upgrade ($50K)
                      </button>
                    </div>

                    {/* Bowling */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Bowling Skill</div>
                        <div className="text-2xl font-black italic">{tempStats.bowling}</div>
                      </div>
                      <button 
                        onClick={() => handleUpgrade('bowling')}
                        disabled={teamBudget - budgetDeduction < UPGRADE_COST}
                        className="px-6 py-3 bg-accent text-bg rounded-xl font-black uppercase tracking-tighter text-[10px] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all disabled:opacity-20"
                      >
                        Upgrade ($50K)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-accent italic mb-2">Training Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/60">Total Cost:</span>
                    <span className="text-lg font-black italic text-accent">${(budgetDeduction / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-white/60">Rating Increase:</span>
                    <span className="text-lg font-black italic text-[#00FFCC]">+{tempStats.rating - player.rating}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/10 bg-[#0D0E0F] sticky bottom-0 flex gap-4">
            <button 
              onClick={() => {
                setCustomization(player.customization || customization);
                setTempStats({
                  batting: player.batting,
                  bowling: player.bowling,
                  rating: player.rating
                });
                setBudgetDeduction(0);
              }}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 transition-all uppercase text-[10px] font-black tracking-widest border border-white/5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-4 bg-[#00FFCC] hover:bg-[#00E6B8] text-black rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[10px] font-black tracking-widest shadow-[0_0_30px_rgba(0,255,204,0.3)]"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
