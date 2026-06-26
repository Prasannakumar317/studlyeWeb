import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert, CheckCircle, Clock, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface StartupNotification {
    id: string;
    title: string;
    description: string;
    created_at: string;
    unread: boolean;
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
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 16 }
    }
};

const StartupNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<StartupNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/notifications`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to load notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        setClearing(true);
        try {
            // We set local state directly
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            
            // Backend endpoint to mark all read
            await fetch(`${API_BASE_URL}/api/v1/institution/notifications/me/mark-read`, {
                method: 'POST',
                headers: authHeaders()
            });
        } catch (err) {
            console.error("Failed to mark all read", err);
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="space-y-8 font-sans pb-10 text-left max-w-3xl mx-auto relative">
            {/* Ambient Background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Asymmetrical Magazine Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white/40 to-transparent p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-1">
                        <Sparkles size={12} /> Live Workspace Updates
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Notifications Center
                    </h1>
                    <p className="text-xs text-slate-500 max-w-xl font-medium">
                        Track live logs, candidate applications, investor updates, advisor replies, and general ecosystem notices.
                    </p>
                </div>
                
                {notifications.some(n => n.unread) && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleMarkAllRead}
                        disabled={clearing}
                        className="px-4 py-2.5 bg-white/70 backdrop-blur-md border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
                    >
                        {clearing ? <Loader2 size={13} className="animate-spin text-pink-500" /> : <CheckCircle size={13} className="text-emerald-500" />}
                        Mark all as read
                    </motion.button>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Loader2 className="animate-spin text-pink-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accessing notifications stream...</span>
                </div>
            ) : notifications.length > 0 ? (
                <motion.div 
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative pl-6 border-l-2 border-slate-100 space-y-5"
                >
                    {notifications.map((notif) => {
                        const isUnread = notif.unread;
                        return (
                            <motion.div 
                                key={notif.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.008 }}
                                className={`p-5 rounded-3xl border transition-all flex items-start gap-4 relative ${
                                    isUnread 
                                        ? 'bg-pink-50/15 border-pink-100/50 shadow-md shadow-pink-50/10' 
                                        : 'bg-white/80 backdrop-blur-xl border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)]'
                                }`}
                            >
                                {/* Timeline Bullet Indicator */}
                                <div className={`absolute -left-[31px] top-6 w-3 h-3 rounded-full border-2 ${
                                    isUnread ? 'bg-pink-500 border-white ring-4 ring-pink-500/10' : 'bg-slate-300 border-white'
                                }`} />

                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                                    isUnread 
                                        ? 'bg-gradient-to-tr from-pink-500 to-[#EC4899] text-white border-pink-400 shadow-md shadow-pink-500/10' 
                                        : 'bg-slate-50 text-slate-400 border-slate-200/50'
                                }`}>
                                    <Bell size={18} className={isUnread ? 'animate-swing' : ''} />
                                </div>

                                <div className="flex-1 space-y-1.5 text-left">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">{notif.title}</h4>
                                        {isUnread && (
                                            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-slate-600 text-xs leading-relaxed font-semibold pr-4">{notif.description}</p>
                                    
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 pt-1">
                                        <Clock size={11} className="text-slate-300" />
                                        <span>{notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Just now'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                <div className="py-20 text-center bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-sm">
                    <ShieldAlert className="mx-auto text-slate-300 mb-4" size={44} />
                    <p className="text-slate-900 font-extrabold text-sm uppercase tracking-wider">Timeline Log Clear</p>
                    <p className="text-slate-400 text-xs font-semibold mt-2">There are no notification events registered for your workspace yet.</p>
                </div>
            )}
        </div>
    );
};

export default StartupNotifications;
