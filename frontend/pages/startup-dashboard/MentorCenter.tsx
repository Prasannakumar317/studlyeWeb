import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Search, Check, X, ShieldAlert, Compass, Users, Loader2 } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface MentorRequest {
    id: string;
    name: string;
    experience: string;
    skills: string[];
    industry: string;
    status: 'Connected' | 'Pending' | 'Rejected';
    avatar?: string;
}

const MentorCenter: React.FC = () => {
    const [mentors, setMentors] = useState<MentorRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/mentors`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setMentors(data);
            }
        } catch (err) {
            console.error("Failed to load mentors", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (id: string, decision: 'Connected' | 'Rejected') => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/mentors/${id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ status: decision })
            });
            if (res.ok) {
                setMentors(prev => prev.map(men => men.id === id ? { ...men, status: decision } : men));
            } else {
                alert('Action failed.');
            }
        } catch (err) {
            alert('Network error updating mentor connection.');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredMentors = mentors.filter(men => {
        const matchesSearch = men.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              men.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              men.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              men.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || men.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getGlowStyles = (status: string) => {
        switch (status) {
            case 'Connected': return 'hover:shadow-emerald-500/10 hover:border-emerald-200 border-emerald-50/50';
            case 'Rejected': return 'hover:shadow-rose-500/5 hover:border-rose-200 border-rose-50/50';
            default: return 'hover:shadow-amber-500/10 hover:border-amber-200 border-slate-100';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 font-sans pb-10 text-left"
        >
            <div>
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    Mentor Center <Award className="text-amber-500 animate-pulse" size={24} />
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                    Connect with industry experts, startup advisors, and seasoned entrepreneurs to guide your company.
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
                        placeholder="Search mentors by name, background, skills..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50">
                    {['All', 'Pending', 'Connected', 'Rejected'].map(status => (
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

            {/* Mentor Cards List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <Loader2 className="animate-spin text-pink-500 mb-3" size={28} />
                    <span className="text-xs font-bold text-slate-500">Querying advisor database...</span>
                </div>
            ) : filteredMentors.length > 0 ? (
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredMentors.map((men) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ y: -6, scale: 1.015 }}
                                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                key={men.id}
                                className={`bg-white rounded-[2.5rem] border p-6 flex flex-col justify-between text-left space-y-5 shadow-2xl shadow-slate-100/30 transition-all ${getGlowStyles(men.status)}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                            {men.avatar ? (
                                                <img src={men.avatar} alt={men.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h3 className="font-black text-slate-900 text-sm truncate tracking-tight">{men.name}</h3>
                                            <p className="text-[10px] font-black text-[#EC4899] uppercase tracking-wide mt-0.5 flex items-center gap-1">
                                                <Compass size={11} className="text-[#EC4899]" /> {men.industry}
                                            </p>
                                        </div>
                                        
                                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm ${
                                            men.status === 'Connected' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                                            men.status === 'Rejected' ? 'bg-rose-50 border border-rose-100 text-rose-700' :
                                            'bg-amber-50 border border-amber-100 text-amber-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                men.status === 'Connected' ? 'bg-emerald-500' :
                                                men.status === 'Rejected' ? 'bg-rose-500' :
                                                'bg-amber-500 animate-pulse'
                                            }`} />
                                            {men.status === 'Connected' ? 'Active' : men.status}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Experience / Bio</span>
                                        <p className="text-slate-600 text-xs font-semibold leading-relaxed">{men.experience}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Advisory Competencies</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {men.skills.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-amber-500/5 text-amber-800 border border-amber-100/30 rounded-xl text-[9px] font-black uppercase tracking-wider">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {men.status === 'Pending' && (
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(men.id, 'Connected')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 hover:border-amber-300 border border-solid border-amber-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <Check size={14} /> Connect
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespond(men.id, 'Rejected')}
                                                disabled={actionLoading}
                                                className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:border-rose-300 border border-solid border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <X size={14} /> Decline
                                            </motion.button>
                                        </div>
                                    )}

                                    {men.status === 'Connected' && (
                                        <div className="p-3.5 bg-emerald-50/50 border border-dashed border-emerald-200 rounded-2xl text-center text-[10px] text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                                            <Check size={13} className="animate-pulse" /> Advisor active. Email/Inbox connection ready.
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
                    <p className="text-slate-900 font-black text-sm uppercase tracking-wider">No Advisors Pending</p>
                    <p className="text-slate-400 text-xs font-semibold mt-2">Check back later or search for advisors in the directory.</p>
                </div>
            )}
        </motion.div>
    );
};

export default MentorCenter;
