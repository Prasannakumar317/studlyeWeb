import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Search, Check, X, ShieldAlert, Landmark, MessageSquare, Loader2 } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface InvestorRequest {
    id: string;
    name: string;
    representative: string;
    stage_interest: string;
    investment_range: string;
    message: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    logo?: string;
}

const InvestorCenter: React.FC = () => {
    const [investors, setInvestors] = useState<InvestorRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchInvestors();
    }, []);

    const fetchInvestors = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/investors`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setInvestors(data);
            }
        } catch (err) {
            console.error("Failed to load investors", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (id: string, decision: 'Accepted' | 'Rejected') => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/investors/${id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ status: decision })
            });
            if (res.ok) {
                setInvestors(prev => prev.map(inv => inv.id === id ? { ...inv, status: decision } : inv));
            } else {
                alert('Action failed.');
            }
        } catch (err) {
            alert('Network error updating investor connection.');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredInvestors = investors.filter(inv => {
        const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              inv.representative.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              inv.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getGlowStyles = (status: string) => {
        switch (status) {
            case 'Accepted': return 'hover:shadow-emerald-500/10 hover:border-emerald-200 border-emerald-50/50';
            case 'Rejected': return 'hover:shadow-rose-500/5 hover:border-rose-200 border-rose-50/50';
            default: return 'hover:shadow-pink-500/10 hover:border-pink-200 border-slate-100';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 font-sans pb-10 text-left"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                        Investor Center <DollarSign className="text-emerald-500 animate-pulse" size={24} />
                    </h1>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                        Manage requests and outreach from venture capitalists, angel networks, and private equity investors.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/10">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search investors, reps, proposals..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50">
                    {['All', 'Pending', 'Accepted', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                                statusFilter === status 
                                    ? 'bg-[#EC4899] text-white shadow-md shadow-pink-500/20' 
                                    : 'bg-transparent text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Investor Cards List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <Loader2 className="animate-spin text-pink-500 mb-3" size={28} />
                    <span className="text-xs font-bold text-slate-500">Accessing venture connection registry...</span>
                </div>
            ) : filteredInvestors.length > 0 ? (
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredInvestors.map((inv) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ y: -6, scale: 1.015 }}
                                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                key={inv.id}
                                className={`bg-white rounded-[2.5rem] border p-6 flex flex-col justify-between text-left space-y-5 shadow-2xl shadow-slate-100/30 transition-all ${getGlowStyles(inv.status)}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                            {inv.logo ? (
                                                <img src={inv.logo} alt={inv.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Landmark size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h3 className="font-black text-slate-900 text-sm truncate tracking-tight">{inv.name}</h3>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                Rep: {inv.representative}
                                            </p>
                                        </div>
                                        
                                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm ${
                                            inv.status === 'Accepted' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                                            inv.status === 'Rejected' ? 'bg-rose-50 border border-rose-100 text-rose-700' :
                                            'bg-amber-50 border border-amber-100 text-amber-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                inv.status === 'Accepted' ? 'bg-emerald-500' :
                                                inv.status === 'Rejected' ? 'bg-rose-500' :
                                                'bg-amber-500 animate-pulse'
                                            }`} />
                                            {inv.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-slate-50 text-xs bg-slate-50/50 rounded-2xl px-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stage Match</span>
                                            <p className="font-bold text-slate-800">{inv.stage_interest}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Ticket</span>
                                            <p className="font-black text-emerald-600 flex items-center gap-0.5"><DollarSign size={13} /> {inv.investment_range}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <MessageSquare size={11} className="text-[#EC4899]" /> Message
                                        </span>
                                        <p className="text-slate-600 text-xs leading-relaxed font-semibold">{inv.message}</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {inv.status === 'Pending' && (
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(inv.id, 'Accepted')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:border-emerald-300 border border-solid border-emerald-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <Check size={14} /> Accept
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(inv.id, 'Rejected')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:border-rose-300 border border-solid border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <X size={14} /> Decline
                                            </motion.button>
                                        </div>
                                    )}

                                    {inv.status === 'Accepted' && (
                                        <div className="p-3.5 bg-emerald-50/50 border border-dashed border-emerald-200 rounded-2xl text-center text-[10px] text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                                            <Check size={13} className="animate-pulse" /> Connected. Calendar invite sync in progress.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="py-20 text-center bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-100/10">
                    <ShieldAlert className="mx-auto text-slate-300 mb-4 animate-bounce" size={40} />
                    <p className="text-slate-900 font-black text-sm uppercase tracking-wider">No Investor Logs</p>
                    <p className="text-slate-400 text-xs font-semibold mt-2">Complete your profile pitch to attract investment groups.</p>
                </div>
            )}
        </motion.div>
    );
};

export default InvestorCenter;
