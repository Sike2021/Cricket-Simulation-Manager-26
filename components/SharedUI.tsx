
import React from 'react';
import { motion } from 'motion/react';
import { Category, getFormatsForCategory } from '../utils';
import { Format } from '../types';
import { Layers, ChevronDown } from 'lucide-react';

interface CategoryTabsProps {
    category: Category;
    setCategory: (cat: Category) => void;
    className?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ category, setCategory, className = "" }) => {
    const categories: Category[] = ['T20', 'List A', 'First Class'];
    
    return (
        <div className={`flex items-center justify-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md mb-8 ${className}`}>
            {categories.map((cat) => (
                <button 
                    key={cat} 
                    onClick={() => setCategory(cat)} 
                    className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        category === cat 
                        ? 'text-black' 
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                >
                    {category === cat && (
                        <motion.div 
                            layoutId="activeCategory"
                            className="absolute inset-0 bg-teal-500 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{cat}</span>
                </button>
            ))}
        </div>
    );
};

interface FormatDropdownProps {
    category: Category;
    selectedFormat: Format;
    setSelectedFormat: (f: Format) => void;
    className?: string;
}

export const FormatDropdown: React.FC<FormatDropdownProps> = ({ category, selectedFormat, setSelectedFormat, className = "" }) => {
    const formats = getFormatsForCategory(category);
    
    return (
        <div className={`relative group ${className}`}>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Layers className="w-4 h-4 text-teal-500/50 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as Format)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl glass-input border border-white/10 text-xs font-black uppercase tracking-widest appearance-none focus:border-teal-500/50 transition-all cursor-pointer"
            >
                {formats.map(f => (
                    <option key={f} value={f} className="bg-[#0a0f0f] text-white py-2">{f}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
        </div>
    );
};
