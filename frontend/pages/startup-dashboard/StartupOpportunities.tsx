import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Edit2, Trash2, Calendar, MapPin, DollarSign, 
    X, AlertTriangle, Archive, CheckCircle, Loader2, Sparkles, Briefcase
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface Opportunity {
    _id?: string;
    id?: string;
    title: string;
    type: string;
    description: string;
    requirements: string;
    locationType: string;
    salaryMin: string;
    salaryMax: string;
    skills: string[];
    deadline: string;
    status: 'active' | 'draft' | 'closed' | 'archived';
    institution_id: string;
}

interface StartupOpportunitiesProps {
    institutionId: string;
}

const OPPORTUNITY_TYPES = [
    'Job Opening',
    'Internship',
    'Hiring Developers',
    'Hiring Designers',
    'Hiring AI Engineers',
    'Hiring Marketing Experts',
    'Looking for Investors',
    'Looking for Mentors',
    'Looking for Co-Founder',
    'Looking for Business Partner',
    'Collaboration Request'
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    }
};

const StartupOpportunities: React.FC<StartupOpportunitiesProps> = ({ institutionId }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Form fields state
    const [formState, setFormState] = useState({
        title: '',
        type: OPPORTUNITY_TYPES[0],
        description: '',
        requirements: '',
        locationType: 'On-site',
        salaryMin: '',
        salaryMax: '',
        skills: [] as string[],
        skillInput: '',
        deadline: '',
        status: 'active' as 'active' | 'draft' | 'closed' | 'archived'
    });

    useEffect(() => {
        fetchOpportunities();
    }, [institutionId]);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/opportunities/?institution_id=${institutionId}`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setOpportunities(data);
            }
        } catch (err) {
            console.error("Failed to fetch opportunities", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingOpportunity(null);
        setFormState({
            title: '',
            type: OPPORTUNITY_TYPES[0],
            description: '',
            requirements: '',
            locationType: 'On-site',
            salaryMin: '',
            salaryMax: '',
            skills: [],
            skillInput: '',
            deadline: '',
            status: 'active'
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (opp: Opportunity) => {
        setEditingOpportunity(opp);
        setFormState({
            title: opp.title || '',
            type: opp.type || OPPORTUNITY_TYPES[0],
            description: opp.description || '',
            requirements: opp.requirements || '',
            locationType: opp.locationType || 'On-site',
            salaryMin: opp.salaryMin || '',
            salaryMax: opp.salaryMax || '',
            skills: opp.skills || [],
            skillInput: '',
            deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
            status: opp.status || 'active'
        });
        setIsFormOpen(true);
    };

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && formState.skillInput.trim()) {
            e.preventDefault();
            if (!formState.skills.includes(formState.skillInput.trim())) {
                setFormState(prev => ({
                    ...prev,
                    skills: [...prev.skills, prev.skillInput.trim()],
                    skillInput: ''
                }));
            }
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setFormState(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                title: formState.title,
                type: formState.type,
                description: formState.description,
                requirements: formState.requirements,
                locationType: formState.locationType,
                salaryMin: formState.salaryMin,
                salaryMax: formState.salaryMax,
                skills: formState.skills,
                deadline: formState.deadline,
                status: formState.status,
                institution_id: institutionId
            };

            let res;
            if (editingOpportunity && editingOpportunity._id) {
                res = await fetch(`${API_BASE_URL}/api/opportunities/${editingOpportunity._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_BASE_URL}/api/opportunities/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                setIsFormOpen(false);
                fetchOpportunities();
            } else {
                const data = await res.json().catch(() => ({}));
                alert('Action failed: ' + (data.detail || 'Unknown server error'));
            }
        } catch (err) {
            alert('Network error. Is the backend running?');
        } finally {
            setFormLoading(false);
        }
    };

    const handleCloseOpportunity = async (oppId?: string) => {
        if (!oppId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/opportunities/${oppId}/close`, {
                method: 'PATCH',
                headers: authHeaders()
            });
            if (res.ok) {
                fetchOpportunities();
            }
        } catch (err) {
            console.error("Failed to close opportunity", err);
        }
    };

    const handleArchiveOpportunity = async (opp: Opportunity) => {
        if (!opp._id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/opportunities/${opp._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ ...opp, status: 'archived' })
            });
            if (res.ok) {
                fetchOpportunities();
            }
        } catch (err) {
            console.error("Failed to archive opportunity", err);
        }
    };

    const handleDeleteOpportunity = async (oppId?: string) => {
        if (!oppId) return;
        if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/opportunities/${oppId}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (res.ok) {
                fetchOpportunities();
            }
        } catch (err) {
            console.error("Failed to delete opportunity", err);
        }
    };

    // Filter and search computation
    const filteredOpportunities = opportunities.filter(opp => {
        const matchesSearch = opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              opp.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedTypeFilter === 'All Types' || opp.type === selectedTypeFilter;
        const matchesStatus = selectedStatusFilter === 'All Statuses' || 
                              (selectedStatusFilter === 'Active' && opp.status === 'active') ||
                              (selectedStatusFilter === 'Closed' && opp.status === 'closed') ||
                              (selectedStatusFilter === 'Archived' && opp.status === 'archived');
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="space-y-8 font-sans pb-10 text-left relative">
            {/* Ambient Background Mesh */}
            <div className="absolute top-0 right-0 -w-72 -h-72 bg-[#EC4899]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Asymmetrical Magazine Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white/40 to-transparent p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-1">
                        <Briefcase size={12} /> Recruitment Hub
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Opportunities & Postings
                    </h1>
                    <p className="text-xs text-slate-500 max-w-xl font-medium">
                        Publish team job positions, internship opportunities, co-founder searches, or investor invitations to attract top-tier talent and partners.
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenCreate}
                    className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-[#EC4899] text-white hover:from-pink-600 hover:to-pink-700 rounded-2xl text-xs font-black shadow-lg shadow-pink-500/20 flex items-center gap-2 transition-all cursor-pointer border-none shrink-0"
                >
                    <Plus size={16} />
                    Post New Opportunity
                </motion.button>
            </div>

            {/* Glass Filter Section */}
            <div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-xl p-4 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search listings by title, description or keyword..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-xs font-medium focus:outline-none focus:border-pink-400 focus:bg-white transition-all shadow-inner"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <select 
                        value={selectedTypeFilter} 
                        onChange={(e) => setSelectedTypeFilter(e.target.value)} 
                        className="px-4 py-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-pink-400 cursor-pointer"
                    >
                        <option value="All Types">All Types</option>
                        {OPPORTUNITY_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <select 
                        value={selectedStatusFilter} 
                        onChange={(e) => setSelectedStatusFilter(e.target.value)} 
                        className="px-4 py-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-pink-400 cursor-pointer"
                    >
                        <option value="All Statuses">All Statuses</option>
                        <option value="Active">Active Only</option>
                        <option value="Closed">Closed Only</option>
                        <option value="Archived">Archived Only</option>
                    </select>
                </div>
            </div>

            {/* Opportunities List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Loader2 className="animate-spin text-pink-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading opportunity board...</span>
                </div>
            ) : filteredOpportunities.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {filteredOpportunities.map((opp) => (
                        <motion.div 
                            key={opp._id || opp.id}
                            variants={cardVariants}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 hover:border-pink-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.06)] transition-all flex flex-col justify-between group relative overflow-hidden"
                        >
                            {/* Accent Glow Decorator */}
                            <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-pink-600 transition-colors">{opp.title}</h3>
                                        <span className="inline-block px-2.5 py-1 bg-pink-50 text-[#EC4899] text-[9px] font-black rounded-lg mt-2 uppercase tracking-widest border border-pink-100/50">
                                            {opp.type}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1.5 ${
                                        opp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        opp.status === 'closed' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                        'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}>
                                        {opp.status === 'active' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                                        {opp.status}
                                    </span>
                                </div>

                                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 font-medium">{opp.description}</p>
                                
                                {opp.skills && opp.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {opp.skills.map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100/80 mt-6 pt-4 flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[10px] font-bold">
                                    <span className="flex items-center gap-1"><MapPin size={12} className="text-pink-500/80" /> {opp.locationType}</span>
                                    {opp.salaryMin && (
                                        <span className="flex items-center gap-0.5 text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"><DollarSign size={11} className="text-emerald-500" /> {opp.salaryMin} - {opp.salaryMax}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => handleOpenEdit(opp)}
                                        className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50/50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        title="Edit Listing"
                                    >
                                        <Edit2 size={13} />
                                    </button>
                                    
                                    {opp.status === 'active' && (
                                        <button 
                                            onClick={() => handleCloseOpportunity(opp._id || opp.id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                            title="Close Application"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}

                                    {opp.status !== 'archived' && (
                                        <button 
                                            onClick={() => handleArchiveOpportunity(opp)}
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50/50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                            title="Archive Listing"
                                        >
                                            <Archive size={13} />
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleDeleteOpportunity(opp._id || opp.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        title="Delete Listing"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="py-20 text-center bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-10 shadow-sm">
                    <AlertTriangle className="mx-auto text-slate-300 mb-4 animate-bounce" size={44} />
                    <p className="text-slate-900 font-extrabold text-sm uppercase tracking-wider">Board Is Empty</p>
                    <p className="text-slate-400 text-xs font-semibold mt-2">Publish your first job position or outreach listing to attract applications.</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/80 shadow-2xl p-8 space-y-6 scrollbar-none"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-pink-500" size={18} />
                                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                                        {editingOpportunity ? 'Modify Opportunity Post' : 'Create New Listing'}
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => setIsFormOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-600 border-none cursor-pointer transition-all"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 text-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opportunity Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formState.title}
                                            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner" 
                                            placeholder="e.g. Lead AI Software Engineer"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opportunity Type</label>
                                        <select 
                                            value={formState.type}
                                            onChange={(e) => setFormState(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-pink-500 focus:bg-white cursor-pointer"
                                        >
                                            {OPPORTUNITY_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location Type</label>
                                        <select 
                                            value={formState.locationType}
                                            onChange={(e) => setFormState(prev => ({ ...prev, locationType: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-pink-500 focus:bg-white cursor-pointer"
                                        >
                                            <option value="On-site">On-site</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary / Equity Min</label>
                                        <input 
                                            type="text" 
                                            value={formState.salaryMin}
                                            onChange={(e) => setFormState(prev => ({ ...prev, salaryMin: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner" 
                                            placeholder="e.g. ₹15L or 1.5% Equity"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary / Equity Max</label>
                                        <input 
                                            type="text" 
                                            value={formState.salaryMax}
                                            onChange={(e) => setFormState(prev => ({ ...prev, salaryMax: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner" 
                                            placeholder="e.g. ₹25L or 2.5% Equity"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Deadline</label>
                                        <input 
                                            type="date" 
                                            value={formState.deadline}
                                            onChange={(e) => setFormState(prev => ({ ...prev, deadline: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white cursor-pointer" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Status</label>
                                        <select 
                                            value={formState.status}
                                            onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as any }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-pink-500 focus:bg-white cursor-pointer"
                                        >
                                            <option value="active">Active / Public</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <textarea 
                                        rows={3}
                                        required
                                        value={formState.description}
                                        onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner resize-none" 
                                        placeholder="Describe the opportunity details, responsibilities, and team profile..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirements & Qualifications</label>
                                    <textarea 
                                        rows={2}
                                        value={formState.requirements}
                                        onChange={(e) => setFormState(prev => ({ ...prev, requirements: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner resize-none" 
                                        placeholder="List necessary qualifications, experience, or tools..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Skills (Press Enter)</label>
                                    <input 
                                        type="text" 
                                        value={formState.skillInput}
                                        onChange={(e) => setFormState(prev => ({ ...prev, skillInput: e.target.value }))}
                                        onKeyDown={handleAddSkill}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner" 
                                        placeholder="e.g. React Native (Press Enter)"
                                    />
                                    {formState.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {formState.skills.map(s => (
                                                <span key={s} className="px-3 py-1 bg-pink-50 border border-pink-100 text-[#EC4899] text-[10px] font-black rounded-lg flex items-center gap-1.5">
                                                    {s}
                                                    <button type="button" onClick={() => handleRemoveSkill(s)} className="text-pink-400 hover:text-pink-600 border-none bg-transparent cursor-pointer font-extrabold text-[12px] leading-none">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-solid border-slate-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={formLoading}
                                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-[#EC4899] text-white hover:opacity-90 rounded-xl text-xs font-black shadow-lg shadow-pink-500/10 flex items-center gap-2 border-none cursor-pointer"
                                    >
                                        {formLoading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                        {formLoading ? 'Saving...' : 'Publish Listing'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StartupOpportunities;
