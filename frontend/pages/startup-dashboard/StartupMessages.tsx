import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search, User, UserCheck, ShieldAlert, Loader2, Sparkles } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface Message {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    receiver_id: string;
    text: string;
    timestamp: string;
}

interface Partner {
    id: string;
    name: string;
    role: string;
}

interface StartupMessagesProps {
    initialReceiverId?: string;
}

const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
};

const bubbleVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 5 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 18 }
    }
};

const StartupMessages: React.FC<StartupMessagesProps> = ({ initialReceiverId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [newMessageText, setNewMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Poll messages every 10s
        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom when partner changes or messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedPartnerId]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/messages`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                
                // Group partners from messages
                const partnerMap = new Map<string, Partner>();
                
                // Pre-populate some default contacts if empty
                partnerMap.set('inv-1', { id: 'inv-1', name: 'Sandeep (Sequoia)', role: 'Investor' });
                partnerMap.set('inv-2', { id: 'inv-2', name: 'Vani Kola (Kalaari)', role: 'Investor' });
                partnerMap.set('men-1', { id: 'men-1', name: 'Ankur Warikoo', role: 'Mentor' });
                
                data.forEach((msg: Message) => {
                    const isStartupSender = msg.sender_id === 'startup-1';
                    const partnerId = isStartupSender ? msg.receiver_id : msg.sender_id;
                    const partnerName = isStartupSender ? msg.receiver_id : msg.sender_name;
                    const partnerRole = isStartupSender ? 'Contact' : msg.sender_role;

                    if (partnerId && partnerId !== 'startup-1') {
                        partnerMap.set(partnerId, {
                            id: partnerId,
                            name: partnerName.replace(' (You)', ''),
                            role: partnerRole
                        });
                    }
                });

                const partnerList = Array.from(partnerMap.values());
                setPartners(partnerList);

                // Set initial active partner
                if (initialReceiverId && partnerMap.has(initialReceiverId)) {
                    setSelectedPartnerId(initialReceiverId);
                } else if (!selectedPartnerId && partnerList.length > 0) {
                    setSelectedPartnerId(partnerList[0].id);
                }
            }
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessageText.trim() || !selectedPartnerId) return;

        setSending(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    receiver_id: selectedPartnerId,
                    text: newMessageText
                })
            });

            if (res.ok) {
                setNewMessageText('');
                fetchMessages();
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
        }
    };

    const activePartner = partners.find(p => p.id === selectedPartnerId);
    
    // Filter messages for active chat room
    const chatRoomMessages = messages.filter(msg => 
        (msg.sender_id === 'startup-1' && msg.receiver_id === selectedPartnerId) ||
        (msg.sender_id === selectedPartnerId && msg.receiver_id === 'startup-1')
    );

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden h-[78vh] flex font-sans relative">
            {/* Sidebar Column */}
            <div className="w-80 border-r border-slate-100 flex flex-col shrink-0 bg-white/40">
                <div className="p-6 border-b border-slate-100/60 text-left">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
                        Inbox Channels <MessageSquare className="text-pink-500" size={16} />
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5 scrollbar-none">
                    {loading ? (
                        <div className="py-12 text-center text-slate-400 text-xs gap-2 flex flex-col items-center">
                            <Loader2 className="animate-spin text-pink-500" size={20} />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Connecting channels...</span>
                        </div>
                    ) : partners.length > 0 ? (
                        <motion.div 
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-1.5"
                        >
                            {partners.map((partner) => {
                                const lastMsg = messages.filter(msg => 
                                    (msg.sender_id === 'startup-1' && msg.receiver_id === partner.id) ||
                                    (msg.sender_id === partner.id && msg.receiver_id === 'startup-1')
                                ).slice(-1)[0];
                                const isActive = selectedPartnerId === partner.id;

                                return (
                                    <motion.button
                                        key={partner.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.01 }}
                                        onClick={() => setSelectedPartnerId(partner.id)}
                                        className={`w-full p-4 rounded-2xl flex items-center gap-3 border-none text-left cursor-pointer transition-all ${
                                            isActive 
                                                ? 'bg-pink-500/10 text-pink-600 shadow-sm border border-pink-100/50' 
                                                : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                                            isActive ? 'bg-pink-500 text-white border-pink-400' : 'bg-slate-50 border-slate-200'
                                        }`}>
                                            <User size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-extrabold text-xs truncate text-slate-900">{partner.name}</h4>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                                    isActive 
                                                        ? 'bg-pink-500 text-white border-pink-400' 
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                    {partner.role}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 truncate mt-1.5 font-medium">
                                                {lastMsg ? lastMsg.text : 'Start a discussion channel.'}
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            No channels active.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area Column */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/20">
                {activePartner ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-5 bg-white/60 backdrop-blur-md border-b border-slate-100 flex items-center gap-3 shrink-0 text-left relative z-10 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-50 to-indigo-50 border border-pink-100/50 flex items-center justify-center shadow-inner">
                                <UserCheck size={18} className="text-[#EC4899]" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-xs">{activePartner.name}</h3>
                                <p className="text-[9px] text-[#EC4899] font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />
                                    {activePartner.role} Workspace Channel
                                </p>
                            </div>
                        </div>

                        {/* Message Log */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
                            {chatRoomMessages.map((msg) => {
                                const isStartupSender = msg.sender_id === 'startup-1';
                                return (
                                    <div 
                                        key={msg.id}
                                        className={`flex ${isStartupSender ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <motion.div 
                                            variants={bubbleVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className={`max-w-[70%] p-4 rounded-[20px] text-left shadow-sm ${
                                                isStartupSender 
                                                    ? 'bg-gradient-to-br from-pink-500 to-[#EC4899] text-white rounded-br-none' 
                                                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                                            }`}
                                        >
                                            <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            <span className={`text-[8px] block mt-1.5 font-bold tracking-wide uppercase ${isStartupSender ? 'text-white/60 text-right' : 'text-slate-400'}`}>
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </motion.div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white/60 backdrop-blur-md border-t border-slate-100 flex gap-2.5 shrink-0">
                            <input 
                                type="text"
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                                placeholder={`Type a message to ${activePartner.name}...`}
                                className="flex-1 px-4 py-3.5 bg-slate-50/80 border border-slate-200/60 focus:border-pink-300 rounded-2xl text-xs font-semibold focus:outline-none focus:bg-white transition-all shadow-inner"
                            />
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={sending || !newMessageText.trim()}
                                className="px-5 py-3 bg-gradient-to-r from-pink-500 to-[#EC4899] text-white rounded-2xl text-xs font-black transition-all border-none cursor-pointer flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/10 hover:opacity-95"
                            >
                                <Send size={14} />
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <MessageSquare className="opacity-30 animate-pulse" size={44} />
                        <p className="text-slate-900 font-black text-xs uppercase tracking-wider">No Channel Focused</p>
                        <p className="text-slate-400 text-[10px] font-semibold">Select a workspace channel from the inbox list to read transaction logs.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StartupMessages;
