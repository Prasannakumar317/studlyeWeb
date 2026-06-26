import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Rocket, Building2, TrendingUp, Users, ArrowUpRight, Plus, 
    MessageSquare, Briefcase, DollarSign, Bell, Award, ArrowRight, Activity, Zap, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface StartupHomeProps {
    institutionId: string;
    onNavigate: (tab: string) => void;
    onCreateOpportunity: () => void;
}

const StartupHome: React.FC<StartupHomeProps> = ({ institutionId, onNavigate, onCreateOpportunity }) => {
    const [profile, setProfile] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Profile
                const profileRes = await fetch(`${API_BASE_URL}/api/v1/institution/startup-profile-public/${institutionId}`);
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData);
                }

                // 2. Fetch Analytics
                const analyticsRes = await fetch(`${API_BASE_URL}/api/v1/startup/analytics/${institutionId}`, {
                    headers: authHeaders()
                });
                if (analyticsRes.ok) {
                    const analyticsData = await analyticsRes.json();
                    setAnalytics(analyticsData);
                }

                // 3. Fetch Notifications
                const notifRes = await fetch(`${API_BASE_URL}/api/v1/startup/notifications`, {
                    headers: authHeaders()
                });
                if (notifRes.ok) {
                    const notifData = await notifRes.json();
                    setNotifications(notifData.slice(0, 4));
                }
            } catch (err) {
                console.error("Error loading home data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [institutionId]);

    const resolveMediaUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
        return url;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-sans">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-pink-500/30 animate-ping" />
                    <Rocket className="text-[#EC4899] animate-bounce" size={28} />
                </div>
                <span className="font-bold text-slate-655 font-sans">Booting founder protocol...</span>
            </div>
        );
    }

    const companyName = profile?.company_name || 'My Startup';
    const tagline = profile?.tagline || 'Innovation begins here. Complete your profile to share your tagline.';
    const stage = profile?.stage || 'Seed';
    const industry = profile?.industry || 'Tech Startup';
    const activeHiring = profile?.team_size ? true : false; 
    const logoUrl = resolveMediaUrl(profile?.logo_url);
    const bannerUrl = resolveMediaUrl(profile?.hero_image_url) || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 font-sans pb-16 text-left"
        >
            {/* Magazine-style Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Hero Profile Showcase card */}
                <div className="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl p-8 flex flex-col justify-between min-h-[340px]">
                    {/* Background decorations */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <img src={bannerUrl} alt="Visual Banner" className="w-full h-full object-cover mix-blend-overlay filter blur-[1px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                    </div>
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex justify-between items-start gap-4">
                        <motion.div 
                            whileHover={{ scale: 1.05, rotate: 1 }}
                            className="w-20 h-20 bg-white border-2 border-slate-850 rounded-[1.8rem] shadow-2xl flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 size={32} className="text-[#EC4899]" />
                            )}
                        </motion.div>

                        <div className="flex flex-wrap gap-2.5">
                            <span className="px-3.5 py-1 bg-pink-500/10 border border-pink-500/30 text-[#EC4899] text-[9px] font-black rounded-lg uppercase tracking-wider shadow-sm backdrop-blur-sm">
                                {stage} Stage
                            </span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-[9px] font-black rounded-lg uppercase tracking-wider shadow-sm backdrop-blur-sm">
                                {industry}
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-3 mt-6 lg:mt-0">
                        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">{companyName}</h1>
                        <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xl">{tagline}</p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-800/40">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onNavigate('profile')}
                            className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm backdrop-blur-md"
                        >
                            Configure Showcase
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onCreateOpportunity}
                            className="px-5 py-3 bg-gradient-to-r from-[#EC4899] to-[#FF5B5B] text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20 border-none cursor-pointer"
                        >
                            Publish Listing
                        </motion.button>
                    </div>
                </div>

                {/* Hero side validation spotlight */}
                <div className="lg:col-span-4 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl p-6 flex flex-col justify-between text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">Validator Score</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900">84</span>
                            <span className="text-slate-400 font-bold text-xs">/100</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Idea validation confidence level</p>

                        <div className="space-y-2 mt-6">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>Market Demand</span>
                                <span>88%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: '88%' }} />
                            </div>
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onNavigate('validator')}
                        className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black rounded-2xl transition-all border border-solid border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                        Verify Product Market Fit
                        <ArrowUpRight size={14} className="text-[#EC4899]" />
                    </motion.button>
                </div>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Hiring Spotlight (Double grid width) */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left space-y-6 flex flex-col justify-between relative overflow-hidden group">
                    {/* Glowing flow edge animation */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-border-flow opacity-60 pointer-events-none" />
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">Hiring Spotlight</span>
                                <h3 className="text-base font-black text-slate-900 mt-1 tracking-tight">Active Recruitment Streams</h3>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg uppercase tracking-wide flex items-center gap-1">
                                <Activity size={10} className="animate-pulse" /> Active Match
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            Review application pipelines, shortlist student candidates, and verify credentials.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center border border-pink-100/40 shrink-0">
                                <Briefcase size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-xs">Total Listings</p>
                                <p className="text-xl font-black text-slate-950 mt-1">{analytics?.opportunities_published || 2}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100/40 shrink-0">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-xs">Total Applicants</p>
                                <p className="text-xl font-black text-slate-950 mt-1">{analytics?.applications_received || 0}</p>
                            </div>
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => onNavigate('opportunities')}
                        className="py-3 bg-[#EC4899] text-white hover:bg-pink-600 rounded-2xl text-xs font-black transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10"
                    >
                        Manage Hiring Listings
                        <ChevronRight size={14} />
                    </motion.button>
                </div>

                {/* 2. Operations quick statistics panel */}
                <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">Performance Metric</span>
                        <h3 className="text-base font-black text-slate-900 mt-1 tracking-tight">Outreach Log</h3>
                        
                        <div className="space-y-3 mt-6">
                            {[
                                { label: 'VC Interests', count: analytics?.investor_interest || 0, pct: '+14%', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                                { label: 'Advisors Connected', count: analytics?.mentor_interest || 0, pct: 'Hold', color: 'text-amber-700 bg-amber-50 border-amber-100' },
                                { label: 'Partner Outreach', count: analytics?.collaboration_requests || 0, pct: '+8%', color: 'text-purple-700 bg-purple-50 border-purple-100' },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800 text-xs">{stat.label}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-slate-900 text-xs">{stat.count}</span>
                                        <span className={`px-2 py-0.5 text-[8px] font-black rounded-lg ${stat.color}`}>{stat.pct}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onNavigate('analytics')}
                        className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl transition-all border border-solid border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                        Review Full Logs
                        <ArrowUpRight size={14} />
                    </motion.button>
                </div>
            </div>

            {/* Horizontal Match Carousels */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">Match carousels</span>
                        <h3 className="text-base font-black text-slate-900 mt-1 tracking-tight">Target Outreach Channels</h3>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 scroll-smooth">
                    {[
                        { title: 'Attract VC Groups', desc: 'Connect with matching funding lists', icon: DollarSign, tab: 'investors', color: 'from-[#6C3BFF] to-[#8B5CF6]', shadow: 'hover:shadow-indigo-500/10 hover:border-indigo-200' },
                        { title: 'Find Advisors', desc: 'Enlist certified mentors to guide pivots', icon: Award, tab: 'mentors', color: 'from-amber-400 to-orange-500', shadow: 'hover:shadow-amber-500/10 hover:border-amber-200' },
                        { title: 'Collaboration Partners', desc: 'Build joint research or product features', icon: Users, tab: 'collaborations', color: 'from-sky-400 to-indigo-500', shadow: 'hover:shadow-sky-500/10 hover:border-sky-200' }
                    ].map((channel, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -6, scale: 1.02 }}
                            onClick={() => onNavigate(channel.tab)}
                            className={`min-w-[280px] flex-1 p-6 rounded-[2.2rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/30 transition-all cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group ${channel.shadow}`}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${channel.color} text-white flex items-center justify-center shadow-lg`}>
                                <channel.icon size={20} className="group-hover:rotate-6 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1 mt-auto">
                                <p className="font-black text-slate-900 text-sm group-hover:text-[#EC4899] transition-colors">{channel.title}</p>
                                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed leading-normal">{channel.desc}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center absolute right-6 top-6 text-slate-400 group-hover:text-white group-hover:bg-[#EC4899] group-hover:border-transparent transition-all shadow-xs">
                                <ArrowRight size={14} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Split layout: Recent Activity Timeline & Command Metrics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Area: Recent Activities timeline view */}
                <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">Timeline view</span>
                            <h3 className="text-base font-black text-slate-900 mt-1 tracking-tight">Recent Activity Stream</h3>
                        </div>
                        <button 
                            onClick={() => onNavigate('notifications')}
                            className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#EC4899] text-[10px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer border-none shadow-xs"
                        >
                            View Log
                        </button>
                    </div>

                    {notifications.length > 0 ? (
                        <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6 py-2">
                            {notifications.map((notif, idx) => (
                                <motion.div 
                                    key={notif.id || idx}
                                    whileHover={{ x: 2 }}
                                    className="relative flex items-start gap-4"
                                >
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#EC4899] shadow-sm z-10" />
                                    <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#EC4899] border border-pink-100/30 flex items-center justify-center shrink-0 shadow-xs">
                                        <Bell size={16} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-black text-slate-900 truncate">{notif.title}</p>
                                            <span className="text-[9px] font-black text-slate-400 shrink-0 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-0.5">{notif.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 text-xs font-semibold bg-slate-50/40 rounded-[2.5rem] border border-dashed border-slate-200">
                            No recent activity logged.
                        </div>
                    )}
                </div>

                {/* Right Area: Performance progress rails */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Performance Rails</h3>
                    
                    <div className="space-y-5">
                        {[
                            { label: 'Investor Interest', val: analytics?.investor_interest || 0, total: 10, pct: Math.min(((analytics?.investor_interest || 0) / 10) * 100, 100), color: 'from-[#6C3BFF] to-[#8B5CF6]' },
                            { label: 'Mentor Connections', val: analytics?.mentor_interest || 0, total: 10, pct: Math.min(((analytics?.mentor_interest || 0) / 10) * 100, 100), color: 'from-amber-400 to-orange-500' },
                            { label: 'Applications Handled', val: analytics?.applications_received || 0, total: 20, pct: Math.min(((analytics?.applications_received || 0) / 20) * 100, 100), color: 'from-emerald-400 to-teal-500' },
                            { label: 'Job Opportunities', val: analytics?.opportunities_published || 0, total: 5, pct: Math.min(((analytics?.opportunities_published || 0) / 5) * 100, 100), color: 'from-pink-500 to-[#FF5B5B]' }
                        ].map((metric, i) => (
                            <div key={i} className="space-y-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-500">{metric.label}</span>
                                    <span className="text-slate-950 font-black">{metric.val} / {metric.total}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.pct}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`h-full bg-gradient-to-r ${metric.color} rounded-full`} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StartupHome;
