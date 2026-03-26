
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, History, MessageSquare, Zap } from 'lucide-react';
import { GameData, Message } from '../types';
import { streamAssistantResponse } from '../geminiService';

interface AssistantProps {
    gameData: GameData;
}

const Assistant: React.FC<AssistantProps> = ({ gameData }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I'm your AI Strategy Consultant. I can analyze your squad, suggest match tactics, or help you scout the next big talent. How can I assist your campaign today?", sender: 'bot' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const botMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot' }]);
            
            const stream = streamAssistantResponse(userMessage.text, messages, gameData);
            
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: fullResponse } : m));
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "System error: Neural link interrupted. Please try again.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* V2.0 Broadcast Header */}
            <header className="px-8 pt-12 pb-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-teal-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Bot className="w-48 h-48 -mr-12 -mt-12 rotate-12" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <h2 className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-[0.4em]">AI_STRATEGY_CONSULTANT // v2.0</h2>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                        STRATEGY<br/>
                        <span className="text-teal-500">ASSISTANT</span>
                    </h1>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-teal-500/10 border-teal-500/30'}`}>
                                    {msg.sender === 'user' ? <User className="w-5 h-5 text-blue-400" /> : <Bot className="w-5 h-5 text-teal-400" />}
                                </div>
                                
                                <div className={`relative p-6 rounded-[32px] border ${
                                    msg.sender === 'user' 
                                    ? 'bg-blue-500/5 border-blue-500/20 rounded-tr-none text-right' 
                                    : 'glass-card border-white/5 rounded-tl-none'
                                }`}>
                                    <div className={`absolute top-0 ${msg.sender === 'user' ? 'right-0' : 'left-0'} p-2 opacity-5`}>
                                        {msg.sender === 'user' ? <MessageSquare className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap relative z-10">
                                        {msg.text}
                                    </p>
                                    <div className={`mt-3 text-[8px] font-mono uppercase tracking-widest opacity-20 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.sender === 'user' ? 'TRANSMISSION_SENT' : 'AI_RESPONSE_GENERATED'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center animate-pulse">
                                <Bot className="w-5 h-5 text-teal-400" />
                            </div>
                            <div className="glass-card px-6 py-4 rounded-[24px] rounded-tl-none border-white/5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-black/40 border-t border-white/10 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-[32px] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                    <div className="relative flex items-center gap-4 bg-[#0a0f0f] border border-white/10 rounded-[32px] p-2 pr-4 focus-within:border-teal-500/50 transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about strategy, players, or opponents..."
                            className="flex-1 bg-transparent py-4 px-6 text-sm font-medium focus:outline-none placeholder:text-white/10"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                !input.trim() || isTyping 
                                ? 'bg-white/5 text-white/10 cursor-not-allowed' 
                                : 'bg-teal-500 text-black shadow-lg shadow-teal-500/20 hover:bg-teal-400 active:scale-95'
                            }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-teal-500" />
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">NEURAL_LINK_ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <History className="w-3 h-3 text-blue-500" />
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">CONTEXT_AWARE_SIMULATION</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
