import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Search, Check, X, ShieldAlert, User, MessageSquare, Loader2 } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface CollabRequest {
    id: string;
    name: string;
    role: string;
    skills: string[];
    details: string;
    type: 'Developer' | 'Designer' | 'Freelancer' | 'Researcher' | 'Business Consultant' | 'Legal Advisor';
    status: 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
    avatar?: string;
}

const CollaborationHub: React.FC = () => {
    const [collabs, setCollabs] = useState<CollabRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchCollabs();
    }, []);

    const fetchCollabs = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/collaborations`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setCollabs(data);
            }
        } catch (err) {
            console.error("Failed to load collaborations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (id: string, decision: 'Accepted' | 'Shortlisted' | 'Rejected') => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/collaborations/${id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ status: decision })
            });
            if (res.ok) {
                setCollabs(prev => prev.map(col => col.id === id ? { ...col, status: decision } : col));
            } else {
                alert('Action failed.');
            }
        } catch (err) {
            alert('Network error updating collaboration request.');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredCollabs = collabs.filter(col => {
        const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              col.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              col.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || col.type === typeFilter;
        const matchesStatus = statusFilter === 'All' || col.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getGlowStyles = (status: string) => {
        switch (status) {
            case 'Accepted': return 'hover:shadow-emerald-500/10 hover:border-emerald-200 border-emerald-50/50';
            case 'Shortlisted': return 'hover:shadow-indigo-500/10 hover:border-indigo-200 border-indigo-50/50';
            case 'Rejected': return 'hover:shadow-rose-500/5 hover:border-rose-200 border-rose-50/50';
            default: return 'hover:shadow-pink-500/10 hover:border-pink-200 border-slate-100';
        }
    };

    const collabTypes = ['All', 'Developer', 'Designer', 'Freelancer', 'Researcher', 'Business Consultant', 'Legal Advisor'];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 font-sans pb-10 text-left"
        >
            <div>
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    Collaboration Hub <Share2 className="text-[#EC4899] animate-pulse" size={24} />
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                    Manage incoming partnership and project collaboration offers from independent makers, researchers, and professional advisors.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/10">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search collaborators by name, role, details..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)} 
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all cursor-pointer"
                    >
                        {collabTypes.map(type => (
                            <option key={type} value={type}>{type === 'All' ? 'All Roles' : type}</option>
                        ))}
                    </select>

                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)} 
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending Only</option>
                        <option value="Shortlisted">Shortlisted Only</option>
                        <option value="Accepted">Accepted Only</option>
                        <option value="Rejected">Rejected Only</option>
                    </select>
                </div>
            </div>

            {/* Collabs Grid List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <Loader2 className="animate-spin text-pink-500 mb-3" size={28} />
                    <span className="text-xs font-bold text-slate-500">Connecting to collaboration stream...</span>
                </div>
            ) : filteredCollabs.length > 0 ? (
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredCollabs.map((col) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ y: -6, scale: 1.015 }}
                                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                key={col.id}
                                className={`bg-white rounded-[2.5rem] border p-6 flex flex-col justify-between text-left space-y-5 shadow-2xl shadow-slate-100/30 transition-all ${getGlowStyles(col.status)}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                            {col.avatar ? (
                                                <img src={col.avatar} alt={col.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h3 className="font-black text-slate-900 text-sm truncate tracking-tight">{col.name}</h3>
                                            <p className="text-[10px] font-black text-[#EC4899] uppercase tracking-wide mt-0.5">
                                                {col.role}
                                            </p>
                                            <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200/20 text-slate-600 text-[8px] font-black rounded-lg uppercase tracking-wider mt-1.5 shadow-xs">
                                                {col.type}
                                            </span>
                                        </div>
                                        
                                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm ${
                                            col.status === 'Accepted' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                                            col.status === 'Rejected' ? 'bg-rose-50 border border-rose-100 text-rose-700' :
                                            col.status === 'Shortlisted' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' :
                                            'bg-amber-50 border border-amber-100 text-amber-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                col.status === 'Accepted' ? 'bg-emerald-500' :
                                                col.status === 'Rejected' ? 'bg-rose-500' :
                                                col.status === 'Shortlisted' ? 'bg-indigo-500' :
                                                'bg-amber-500 animate-pulse'
                                            }`} />
                                            {col.status}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <MessageSquare size={11} className="text-[#EC4899]" /> Collaboration Pitch
                                        </span>
                                        <blockquote className="text-slate-600 text-xs leading-relaxed font-semibold m-0">{col.details}</blockquote>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Skills & Expertise</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {col.skills.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200/50 rounded-xl text-[9px] font-bold">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {col.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(col.id, 'Accepted')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border border-solid border-emerald-250 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                            >
                                                Accept Partner
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(col.id, 'Shortlisted')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-850 border border-solid border-indigo-250 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                            >
                                                Shortlist
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleRespond(col.id, 'Rejected')}
                                                disabled={actionLoading}
                                                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-solid border-rose-250 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
                                                title="Decline Offer"
                                            >
                                                <X size={14} />
                                            </motion.button>
                                        </div>
                                    )}

                                    {col.status === 'Shortlisted' && (
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(col.id, 'Accepted')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-solid border-emerald-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <Check size={14} /> Finalize Accept
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(col.id, 'Rejected')}
                                                disabled={actionLoading}
                                                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-solid border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <X size={14} /> Decline
                                            </motion.button>
                                        </div>
                                    )}

                                    {col.status === 'Accepted' && (
                                        <div className="p-3.5 bg-emerald-50/50 border border-dashed border-emerald-200 rounded-2xl text-center text-[10px] text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                                            <Check size={13} className="animate-pulse" /> Partnership established. Check messaging inbox to sync up workspace tokens.
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
                    <p className="text-slate-900 font-black text-sm uppercase tracking-wide">No Partners Online</p>
                    <p className="text-slate-400 text-xs font-semibold mt-2">Create opportunities tagged with "Collaboration Request" to seek partners.</p>
                </div>
            )}
        </motion.div>
    );
};

export default CollaborationHub;
