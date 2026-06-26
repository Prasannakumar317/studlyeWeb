import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Search, Download, Check, X, AlertTriangle, 
    Mail, Phone, Calendar, User, MessageSquare, Loader2, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface Applicant {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
    event_title: string;
    status: 'pending' | 'accepted' | 'rejected' | 'shortlisted';
    registered_at?: string;
    resume_url?: string;
    opportunity_id?: string;
    user_id?: string;
}

interface StartupApplicationsProps {
    institutionId: string;
    onNavigateToMessages?: (receiverId: string) => void;
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
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 120,
            damping: 18
        }
    }
};

const StartupApplications: React.FC<StartupApplicationsProps> = ({ institutionId, onNavigateToMessages }) => {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchApplicants();
    }, [institutionId]);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/participants/${institutionId}`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                // Filter to keep only opportunity applicants (i.e. those with opportunity_id)
                const oppApplicants = data.filter((item: any) => item.opportunity_id);
                setApplicants(oppApplicants);
            }
        } catch (err) {
            console.error("Failed to load applicants", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (applicant: Applicant, newStatus: 'accepted' | 'rejected' | 'shortlisted') => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/opportunity-applications/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    institution_id: institutionId,
                    status: newStatus,
                    application_id: applicant._id,
                    user_id: applicant.user_id,
                    opportunity_id: applicant.opportunity_id
                })
            });

            if (res.ok) {
                // Update local status
                setApplicants(prev => prev.map(a => a._id === applicant._id ? { ...a, status: newStatus } : a));
                if (selectedApplicant && selectedApplicant._id === applicant._id) {
                    setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
                }
            } else {
                alert('Failed to update status.');
            }
        } catch (err) {
            alert('Network error updating application status.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleContact = (applicant: Applicant) => {
        if (onNavigateToMessages && applicant.user_id) {
            onNavigateToMessages(applicant.user_id);
        } else {
            window.location.hash = `#/startup-dashboard/messages?chat=${applicant.user_id || ''}`;
        }
    };

    const filteredApplicants = applicants.filter(app => {
        const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              app.event_title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 font-sans pb-10 text-left relative">
            {/* Ambient Background Mesh */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Asymmetrical Magazine Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white/40 to-transparent p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-1">
                        <Users size={12} /> Candidate Review
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Applicant Roster
                    </h1>
                    <p className="text-xs text-slate-500 max-w-xl font-medium">
                        Manage incoming candidate streams. Access professional profiles, evaluate submitted resumes, and communicate decision states directly.
                    </p>
                </div>
            </div>

            {/* Glass Filter Panel */}
            <div className="flex flex-wrap items-center gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filter candidates by name, email or position title..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-xs font-medium focus:outline-none focus:border-pink-400 focus:bg-white transition-all shadow-inner"
                    />
                </div>

                <div className="flex gap-1.5 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/30">
                    {['All', 'Pending', 'Shortlisted', 'Accepted', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none relative ${
                                statusFilter === status 
                                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/10' 
                                    : 'bg-transparent text-slate-500 hover:text-slate-950'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Applicants List (Left/Center) */}
                <div className="xl:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                            <Loader2 className="animate-spin text-pink-500" size={28} />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading candidate list...</span>
                        </div>
                    ) : filteredApplicants.length > 0 ? (
                        <motion.div 
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3.5"
                        >
                            {filteredApplicants.map((app) => (
                                <motion.div 
                                    key={app._id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.01, x: 4 }}
                                    onClick={() => setSelectedApplicant(app)}
                                    className={`p-5 rounded-2xl bg-white/70 backdrop-blur-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                        selectedApplicant?._id === app._id 
                                            ? 'border-pink-300 shadow-[0_12px_30px_rgba(236,72,153,0.06)] bg-white/90' 
                                            : 'border-slate-100 hover:border-slate-200/80 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-50 to-indigo-50 text-[#EC4899] border border-pink-100/50 flex items-center justify-center font-black text-sm shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                            {app.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-slate-900 text-sm">{app.full_name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{app.event_title}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none border-slate-50 pt-3 md:pt-0">
                                        <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${
                                            app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                            app.status === 'shortlisted' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold' :
                                            'bg-amber-50 text-amber-700 border border-amber-100 font-bold'
                                        }`}>
                                            {app.status}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400">
                                            {app.registered_at ? new Date(app.registered_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="py-20 text-center bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-sm">
                            <AlertTriangle className="mx-auto text-slate-300 mb-4 animate-bounce" size={44} />
                            <p className="text-slate-900 font-black text-sm uppercase tracking-wider">No Applicants Found</p>
                            <p className="text-slate-400 text-xs font-semibold mt-2">There are no candidates matching your current filter selection.</p>
                        </div>
                    )}
                </div>

                {/* Candidate Detail Card (Right) */}
                <div className="xl:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedApplicant ? (
                            <motion.div 
                                key={selectedApplicant._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ type: 'spring', duration: 0.4 }}
                                className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] text-left space-y-6 sticky top-6 overflow-hidden"
                            >
                                {/* Header Info */}
                                <div className="text-center space-y-3 pb-5 border-b border-slate-100">
                                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-pink-50 to-indigo-50 text-[#EC4899] border border-pink-100/50 flex items-center justify-center font-black text-2xl mx-auto shadow-inner relative">
                                        {selectedApplicant.full_name.charAt(0).toUpperCase()}
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
                                            <ShieldCheck className="text-white" size={10} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{selectedApplicant.full_name}</h3>
                                        <span className="inline-block px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg mt-1 uppercase tracking-widest border border-slate-200/50">
                                            {selectedApplicant.event_title}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Information</span>
                                    
                                    <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                                        <div className="flex items-center gap-3">
                                            <Mail size={14} className="text-pink-500/80" />
                                            <span className="truncate">{selectedApplicant.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={14} className="text-pink-500/80" />
                                            <span>{selectedApplicant.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={14} className="text-pink-500/80" />
                                            <span>Applied: {selectedApplicant.registered_at ? new Date(selectedApplicant.registered_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Resume Section */}
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</span>
                                    {selectedApplicant.resume_url ? (
                                        <a 
                                            href={selectedApplicant.resume_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-pink-50 hover:border-pink-200 border border-slate-200 border-solid rounded-2xl text-xs font-black text-slate-700 hover:text-[#EC4899] transition-all no-underline shadow-sm"
                                        >
                                            <span className="flex items-center gap-2"><User size={14} className="text-slate-400" /> Candidate Resume</span>
                                            <Download size={14} />
                                        </a>
                                    ) : (
                                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200/60 rounded-2xl text-center text-[10px] text-slate-400 font-bold">
                                            No resume submitted.
                                        </div>
                                    )}
                                </div>

                                {/* Application Operations */}
                                <div className="space-y-3.5 pt-5 border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recruiting Decision</span>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.button
                                            whileHover={{ y: -1 }}
                                            onClick={() => handleUpdateStatus(selectedApplicant, 'accepted')}
                                            disabled={actionLoading}
                                            className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:border-emerald-300 border border-solid border-emerald-200 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Check size={14} />
                                            Accept
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ y: -1 }}
                                            onClick={() => handleUpdateStatus(selectedApplicant, 'rejected')}
                                            disabled={actionLoading}
                                            className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:border-rose-300 border border-solid border-rose-200 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <X size={14} />
                                            Reject
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ y: -1 }}
                                            onClick={() => handleUpdateStatus(selectedApplicant, 'shortlisted')}
                                            disabled={actionLoading}
                                            className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:border-indigo-300 border border-solid border-indigo-200 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 col-span-2 shadow-sm"
                                        >
                                            <ArrowUpRight size={14} />
                                            Shortlist Candidate
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        whileHover={{ y: -1 }}
                                        onClick={() => handleContact(selectedApplicant)}
                                        className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-solid border-slate-200 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MessageSquare size={14} className="text-slate-400" />
                                        Contact via Inbox
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-dashed border-slate-200/80 text-center text-slate-400 text-xs font-bold py-36 sticky top-6 shadow-sm flex flex-col items-center justify-center gap-3">
                                <Users className="opacity-30" size={36} />
                                <span>Select a candidate roster slot to review information details.</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StartupApplications;
