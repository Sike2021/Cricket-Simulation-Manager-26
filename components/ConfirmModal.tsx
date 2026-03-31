
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'warning'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-sm bg-[#050808] border-4 border-white overflow-hidden relative"
                    >
                        {/* Decorative background */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />
                        
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-teal-500/20 text-teal-500'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                                    {title}
                                </h3>
                            </div>
                            
                            <p className="text-sm font-medium text-white/70 mb-8 leading-relaxed">
                                {message}
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className={`w-full py-4 font-black italic uppercase tracking-tighter text-xl border-4 border-white transition-all ${
                                        type === 'danger' 
                                            ? 'bg-red-600 text-white hover:bg-red-700' 
                                            : 'bg-teal-500 text-black hover:invert'
                                    }`}
                                >
                                    {confirmText}
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="w-full py-3 font-black italic uppercase tracking-tighter text-sm text-white/50 hover:text-white transition-colors"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
