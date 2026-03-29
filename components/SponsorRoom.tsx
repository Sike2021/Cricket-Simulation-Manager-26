import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Briefcase, DollarSign, TrendingUp, Star, 
    Tv, Shield, Globe, Award, Info, 
    ChevronRight, Check, Lock, Zap,
    LayoutGrid, List, Search, Filter
} from 'lucide-react';
import { GameData, Format, Sponsorship } from '../types';
import { BRANDS, SPONSOR_THRESHOLDS, TOURNAMENT_LOGOS, INITIAL_SPONSORSHIPS, TV_CHANNELS } from '../data';

interface SponsorRoomProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
}

const SponsorRoom: React.FC<SponsorRoomProps> = ({ gameData, setGameData }) => {
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');

    const sponsorship = gameData.sponsorships[selectedFormat] || INITIAL_SPONSORSHIPS[selectedFormat];
    const currentThresholds = SPONSOR_THRESHOLDS[selectedFormat];
    const popularity = gameData.popularity || 0;

    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20];
            case 'List A': return [Format.ODI];
            case 'First Class': return [Format.SHIELD];
        }
    };

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category]);

    const handleSelectSponsor = (brandName: string, logoColor: string) => {
        const threshold = currentThresholds[brandName as keyof typeof currentThresholds] || 999;
        if (popularity < threshold) return;

        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                sponsorName: brandName,
                logoColor: logoColor
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    };

    const handleSelectTournamentLogo = (svg: string) => {
        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                tournamentLogo: svg
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    };

    const handleSelectTV = (name: string, logo: string) => {
        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                tvChannel: name,
                tvLogo: logo
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    }

    const handleNameChange = (value: string) => {
        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                tournamentName: value
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    }

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Briefcase className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">COMMERCIAL_OPERATIONS // v2.0</h2>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            SPONSOR<br/>
                            <span className="text-teal-500">ROOM</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center min-w-[140px] bg-white/5">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">POPULARITY</p>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <p className="text-4xl font-black font-mono text-white italic">{popularity}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-6 mt-12 relative z-10">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        {['T20', 'List A', 'First Class'].map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setCategory(cat as any)} 
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${category === cat ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">FORMAT:</p>
                        <div className="flex gap-2">
                            {getFormatsForCategory(category).map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setSelectedFormat(fmt)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFormat === fmt ? 'bg-white/10 text-teal-400 border border-teal-500/30' : 'text-white/20 hover:text-white/40 border border-transparent'}`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    {/* Brand Sponsorship */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">BRAND_PARTNERSHIPS</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {BRANDS.map((brand) => {
                                const threshold = currentThresholds[brand.name as keyof typeof currentThresholds] || 0;
                                const isLocked = popularity < threshold;
                                const isSelected = sponsorship.sponsorName === brand.name;

                                return (
                                    <motion.div
                                        key={brand.name}
                                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                                        onClick={() => !isLocked && handleSelectSponsor(brand.name, brand.color)}
                                        className={`glass-card p-8 rounded-[40px] border transition-all relative overflow-hidden group cursor-pointer ${
                                            isSelected 
                                            ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_30px_rgba(45,212,191,0.2)]' 
                                            : isLocked 
                                            ? 'border-white/5 opacity-40 grayscale' 
                                            : 'border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/10 ${isSelected ? 'bg-white/10' : 'bg-white/5'}`}>
                                                <span className={`text-2xl font-black italic ${brand.color}`}>{brand.name[0]}</span>
                                            </div>
                                            <h4 className="text-lg font-black italic uppercase tracking-tighter mb-2">{brand.name}</h4>
                                            
                                            {isLocked ? (
                                                <div className="flex items-center gap-2 text-[9px] font-mono text-red-400 uppercase tracking-widest">
                                                    <Lock className="w-3 h-3" />
                                                    REQUIRES ★ {threshold}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[9px] font-mono text-teal-500 uppercase tracking-widest">
                                                    {isSelected ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                                    {isSelected ? 'ACTIVE_PARTNER' : 'AVAILABLE'}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Broadcast Rights */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Tv className="w-4 h-4 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">BROADCAST_RIGHTS</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {TV_CHANNELS.map((tv) => {
                                const isSelected = sponsorship.tvChannel === tv.name;
                                return (
                                    <div 
                                        key={tv.name}
                                        onClick={() => handleSelectTV(tv.name, tv.logo)}
                                        className={`glass-card p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-6 group ${
                                            isSelected 
                                            ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
                                            : 'border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                            <span className="text-xl font-black italic text-blue-400">{tv.name[0]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black italic uppercase tracking-tight">{tv.name}</h4>
                                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">NATIONAL_NETWORK</p>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Tournament Identity */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Award className="w-4 h-4 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">TOURNAMENT_IDENTITY</h3>
                        </div>

                        <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4 block">TOURNAMENT_NAME</label>
                                        <input 
                                            type="text"
                                            value={sponsorship.tournamentName}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-black italic uppercase tracking-tighter focus:outline-none focus:border-teal-500/50 transition-all"
                                            placeholder="Enter Tournament Name..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4 block">BRAND_IDENTITY_LOGO</label>
                                        <div className="flex flex-wrap gap-4">
                                            {TOURNAMENT_LOGOS.map((logoObj, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSelectTournamentLogo(logoObj.svg)}
                                                    className={`w-16 h-16 rounded-2xl border transition-all flex items-center justify-center p-3 ${
                                                        sponsorship.tournamentLogo === logoObj.svg 
                                                        ? 'border-teal-500 bg-teal-500/10' 
                                                        : 'border-white/5 bg-white/5 hover:border-white/20'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: logoObj.svg }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center p-12 rounded-[40px] bg-black/40 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-50" />
                                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-8 relative z-10">BROADCAST_PREVIEW</p>
                                    
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-32 h-32 mb-8 drop-shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-transform duration-700 group-hover:scale-110" dangerouslySetInnerHTML={{ __html: sponsorship.tournamentLogo || '' }} />
                                        <h4 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">{sponsorship.tournamentName}</h4>
                                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">PRESENTED_BY</span>
                                            <span className={`text-[10px] font-black italic uppercase ${sponsorship.logoColor}`}>{sponsorship.sponsorName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SponsorRoom;
