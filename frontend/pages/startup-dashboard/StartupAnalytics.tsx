import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, FileText, DollarSign, Award, Share2, Loader2, ArrowUpRight, Flame } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface AnalyticsData {
    profile_views: number;
    opportunity_views: number;
    opportunities_published: number;
    applications_received: number;
    investor_interest: number;
    mentor_interest: number;
    collaboration_requests: number;
    monthly_growth: Array<{ month: string; views: number; applications: number }>;
}

interface StartupAnalyticsProps {
    institutionId: string;
}

const StartupAnalytics: React.FC<StartupAnalyticsProps> = ({ institutionId }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/v1/startup/analytics/${institutionId}`, {
                    headers: authHeaders()
                });
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data);
                }
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [institutionId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-sans">
                <Loader2 className="animate-spin text-pink-500 mb-3" size={28} />
                <span className="text-xs font-bold text-slate-500">Accessing core data servers...</span>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="py-20 text-center bg-white border border-slate-100 rounded-[2.5rem] p-10 font-sans text-slate-400 shadow-xl shadow-slate-100/10">
                Failed to parse analytics records.
            </div>
        );
    }

    const cards = [
        { label: 'Profile Views', val: analytics.profile_views, icon: Eye, color: 'text-indigo-600 bg-indigo-50 border-indigo-150/40', glow: 'hover:shadow-indigo-500/10 hover:border-indigo-200' },
        { label: 'Opportunity Views', val: analytics.opportunity_views, icon: Eye, color: 'text-[#EC4899] bg-pink-50 border-pink-150/40', glow: 'hover:shadow-pink-500/10 hover:border-pink-200' },
        { label: 'Applications Received', val: analytics.applications_received, icon: FileText, color: 'text-sky-600 bg-sky-50 border-sky-150/40', glow: 'hover:shadow-sky-500/10 hover:border-sky-200' },
        { label: 'Investor Interests', val: analytics.investor_interest, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-150/40', glow: 'hover:shadow-emerald-500/10 hover:border-emerald-200' },
        { label: 'Mentor Connections', val: analytics.mentor_interest, icon: Award, color: 'text-amber-600 bg-amber-50 border-amber-150/40', glow: 'hover:shadow-amber-500/10 hover:border-amber-200' },
        { label: 'Collaboration Requests', val: analytics.collaboration_requests, icon: Share2, color: 'text-purple-600 bg-purple-50 border-purple-150/40', glow: 'hover:shadow-purple-500/10 hover:border-purple-200' }
    ];

    const maxMonthlyView = Math.max(...analytics.monthly_growth.map(d => d.views), 1);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 font-sans pb-10 text-left"
        >
            <div>
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    Startup Analytics Hub <BarChart3 className="text-[#EC4899] animate-pulse" size={24} />
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                    Review startup analytics. Monitor view logs, outreach rates, and pipeline activity over time.
                </p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -6, scale: 1.015 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className={`p-6 rounded-[2.5rem] border border-solid flex flex-col justify-between h-36 transition-all bg-white shadow-2xl shadow-slate-100/30 ${card.glow}`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{card.label}</span>
                            <div className={`p-2.5 rounded-xl border border-solid shrink-0 shadow-sm ${card.color}`}>
                                <card.icon size={16} />
                            </div>
                        </div>
                        <div className="space-y-1 mt-auto">
                            <h3 className="text-2xl font-black text-slate-950 tracking-tight">{card.val}</h3>
                            <p className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                                <TrendingUp size={10} className="text-emerald-500" /> +12.4% vs past cycle
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Split Visualisation Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Monthly Activity Bars (Chart) */}
                <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Growth Performance</h3>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Profile view logs over current semester</p>
                        </div>
                        <span className="px-3 py-1 bg-pink-50 border border-pink-100 text-[#EC4899] text-[9px] font-black rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm">
                            <Flame size={12} className="animate-pulse" /> Active Analytics
                        </span>
                    </div>

                    <div className="h-64 flex items-end justify-around gap-4 pt-6 border-b border-slate-100 pb-2 bg-slate-50/20 rounded-[2rem] px-4">
                        {analytics.monthly_growth.map((data, idx) => {
                            const barHeight = (data.views / maxMonthlyView) * 160;
                            const appHeight = (data.applications / maxMonthlyView) * 160;
                            return (
                                <div key={idx} className="flex flex-col items-center gap-3 w-16 group">
                                    <div className="w-full flex justify-center gap-2 items-end h-44 relative">
                                        {/* Views Bar */}
                                        <div 
                                            className="w-4 rounded-t-lg bg-gradient-to-t from-pink-400 to-[#EC4899] group-hover:shadow-md group-hover:shadow-pink-500/20 transition-all relative cursor-pointer"
                                            style={{ height: `${Math.max(barHeight, 6)}px` }}
                                        >
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-950 text-white text-[8.5px] font-black px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20 pointer-events-none">
                                                {data.views} Views
                                            </span>
                                        </div>

                                        {/* Applications Bar */}
                                        <div 
                                            className="w-4 rounded-t-lg bg-gradient-to-t from-sky-300 to-sky-500 group-hover:shadow-md group-hover:shadow-sky-500/20 transition-all relative cursor-pointer"
                                            style={{ height: `${Math.max(appHeight, 6)}px` }}
                                        >
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-950 text-white text-[8.5px] font-black px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20 pointer-events-none">
                                                {data.applications} Apps
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.month}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-6 justify-center text-[10px] font-bold text-slate-500 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-md bg-gradient-to-r from-pink-400 to-[#EC4899] shadow-sm" />
                            <span>Page Traffic Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-md bg-gradient-to-r from-sky-300 to-sky-500 shadow-sm" />
                            <span>Applications Handed</span>
                        </div>
                    </div>
                </div>

                {/* Right: Growth Benchmarks Card */}
                <div className="xl:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fulfillment Goals</h3>
                    
                    <div className="space-y-6">
                        {[
                            { label: 'Outreach Success Rate', pct: 78, desc: 'Accepted vs pending reviews', color: 'from-emerald-400 to-teal-500 shadow-emerald-200' },
                            { label: 'Profile Score Completeness', pct: 90, desc: 'Branding index details', color: 'from-indigo-500 to-purple-600 shadow-indigo-200' },
                            { label: 'Hiring Efficiency', pct: 64, desc: 'Closed listings conversion', color: 'from-pink-500 to-[#FF5B5B] shadow-pink-200' }
                        ].map((benchmark, i) => (
                            <div key={i} className="space-y-2 p-4 bg-slate-50/40 rounded-2xl border border-slate-100/30">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <div className="text-left space-y-0.5">
                                        <p className="text-slate-900 text-[11px] font-black">{benchmark.label}</p>
                                        <p className="text-[9px] text-slate-400 font-semibold leading-none">{benchmark.desc}</p>
                                    </div>
                                    <span className="text-slate-950 font-black text-sm">{benchmark.pct}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${benchmark.pct}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                        className={`h-full bg-gradient-to-r ${benchmark.color} rounded-full`} 
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

export default StartupAnalytics;
