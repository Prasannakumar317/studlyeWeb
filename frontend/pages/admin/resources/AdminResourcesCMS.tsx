import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
    Plus, Search, Edit2, Trash2, Upload, FileText, Check, AlertCircle, 
    X, Sparkles, Pin, BookOpen, Clock, Calendar, CheckSquare, Eye, Download, Info
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

// Helper to format date
const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) {
        return dateStr;
    }
};

const AdminResourcesCMS: React.FC = () => {
    const { user } = useAuth();
    
    // API Data
    const [resources, setResources] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Search/List Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    
    // CMS Modal/Form State
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentResourceId, setCurrentResourceId] = useState<string | null>(null);
    
    // Form fields
    const [title, setTitle] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [category, setCategory] = useState('Startup Guides');
    const [author, setAuthor] = useState('Studlyf Admin');
    const [readingTime, setReadingTime] = useState('5 mins');
    const [resourceType, setResourceType] = useState('article'); // article, guide, template, spreadsheet, legal, slide
    const [tagsInput, setTagsInput] = useState('');
    const [shortSummary, setShortSummary] = useState('');
    const [fullContent, setFullContent] = useState('');
    const [attachments, setAttachments] = useState<any[]>([]); // { name, url, size }
    const [featured, setFeatured] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [status, setStatus] = useState('published'); // draft, published, archived
    const [schedulePublish, setSchedulePublish] = useState('');

    // Category lists helper
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Upload Helper states
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Fetch initial list
    const fetchResourcesList = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/resources?limit=100`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            if (selectedCategoryFilter) url += `&category=${encodeURIComponent(selectedCategoryFilter)}`;

            // Include X-Admin-Email header for admin access to drafts
            const headers: any = { ...authHeaders() };
            if (user?.email) {
                headers['X-Admin-Email'] = user.email;
            }

            const res = await fetch(url, { headers });
            if (res.ok) {
                const data = await res.json();
                setResources(data.resources || []);
                if (data.categories) setCategories(data.categories);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchResourcesList();
        }
    }, [user, searchQuery, selectedCategoryFilter]);

    // Handle Delete resource
    const handleDeleteResource = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource permanentely?")) return;

        try {
            const headers: any = { ...authHeaders() };
            if (user?.email) headers['X-Admin-Email'] = user.email;

            const res = await fetch(`${API_BASE_URL}/api/resources/admin/${id}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                fetchResourcesList();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Handle file upload (Cover Image / attachments)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'attachment') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');
        if (type === 'cover') setIsUploadingCover(true);
        else setIsUploadingAttachment(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const headers: any = { ...authHeaders() };
            if (user?.email) headers['X-Admin-Email'] = user.email;

            const res = await fetch(`${API_BASE_URL}/api/resources/admin/upload`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (type === 'cover') {
                    setCoverImage(data.url);
                } else {
                    setAttachments(prev => [...prev, { name: data.name || file.name, url: data.url, size: data.size }]);
                }
            } else {
                const errData = await res.json();
                setUploadError(errData.detail || "Upload failed");
            }
        } catch (err: any) {
            setUploadError(err.message || "Failed upload connection");
        } finally {
            setIsUploadingCover(false);
            setIsUploadingAttachment(false);
        }
    };

    // Remove Attachment item
    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Category CMS controls
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const catName = newCategoryName.trim();
        if (!catName) return;

        try {
            const headers: any = { ...authHeaders(), 'Content-Type': 'application/json' };
            if (user?.email) headers['X-Admin-Email'] = user.email;

            const res = await fetch(`${API_BASE_URL}/api/resources/admin/categories`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: catName })
            });

            if (res.ok) {
                setNewCategoryName('');
                fetchResourcesList();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCategory = async (catName: string) => {
        if (!confirm(`Delete category "${catName}"? This will not delete the associated articles but remove the option.`)) return;

        try {
            const headers: any = { ...authHeaders() };
            if (user?.email) headers['X-Admin-Email'] = user.email;

            const res = await fetch(`${API_BASE_URL}/api/resources/admin/categories/${encodeURIComponent(catName)}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                fetchResourcesList();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Open creation modal
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentResourceId(null);
        setTitle('');
        setCoverImage('');
        setCategory(categories[0] || 'Startup Guides');
        setAuthor(user?.full_name || 'Studlyf Admin');
        setReadingTime('5 mins');
        setResourceType('article');
        setTagsInput('');
        setShortSummary('');
        setFullContent('');
        setAttachments([]);
        setFeatured(false);
        setPinned(false);
        setStatus('published');
        setSchedulePublish('');
        setShowFormModal(true);
    };

    // Open editing modal
    const openEditModal = (resource: any) => {
        setIsEditing(true);
        setCurrentResourceId(resource.id);
        setTitle(resource.title || '');
        setCoverImage(resource.cover_image || '');
        setCategory(resource.category || 'Startup Guides');
        setAuthor(resource.author || 'Studlyf Admin');
        setReadingTime(resource.reading_time || '5 mins');
        setResourceType(resource.resource_type || 'article');
        setTagsInput(resource.tags ? resource.tags.join(', ') : '');
        setShortSummary(resource.short_summary || '');
        setFullContent(resource.full_content || '');
        setAttachments(resource.attachments || []);
        setFeatured(resource.featured || false);
        setPinned(resource.pinned || false);
        setStatus(resource.status || 'published');
        
        // Format date string for datetime-local picker if it exists
        if (resource.schedule_publish) {
            try {
                const date = new Date(resource.schedule_publish);
                const isoStr = date.toISOString().slice(0, 16);
                setSchedulePublish(isoStr);
            } catch (_) {
                setSchedulePublish('');
            }
        } else {
            setSchedulePublish('');
        }
        
        setShowFormModal(true);
    };

    // Handle Form submission
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse tags
        const tags = tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(t => t !== '');

        const payload = {
            title,
            cover_image: coverImage,
            category,
            author,
            reading_time: readingTime,
            resource_type: resourceType,
            tags,
            short_summary: shortSummary,
            full_content: fullContent,
            attachments,
            featured,
            pinned,
            status,
            schedule_publish: schedulePublish ? new Date(schedulePublish).toISOString() : null
        };

        try {
            const headers: any = { ...authHeaders(), 'Content-Type': 'application/json' };
            if (user?.email) headers['X-Admin-Email'] = user.email;

            let res;
            if (isEditing && currentResourceId) {
                res = await fetch(`${API_BASE_URL}/api/resources/admin/${currentResourceId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_BASE_URL}/api/resources/admin`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                setShowFormModal(false);
                fetchResourcesList();
            } else {
                alert("Failed to submit form.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 p-1 sm:p-4 text-[#F4F4F5]">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <BookOpen className="text-purple-500" size={32} />
                        <span>CMS: Startup Resources</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Publish guides, spreadsheet calculations, and regulatory documents to the knowledge portal.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCategoryManager(!showCategoryManager)}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer"
                    >
                        Manage Categories
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
                    >
                        <Plus size={16} />
                        <span>Add New Resource</span>
                    </button>
                </div>
            </div>

            {/* Category manager drawer / inline board */}
            <AnimatePresence>
                {showCategoryManager && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#111026] border border-[#7C3AED]/20 rounded-2xl p-5 space-y-4 overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-purple-300">Category Configurator</h3>
                            <button onClick={() => setShowCategoryManager(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
                            <input
                                type="text"
                                placeholder="Create new category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-2 text-sm w-full outline-none focus:border-purple-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold uppercase whitespace-nowrap"
                            >
                                Add Option
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {categories.map((cat) => (
                                <span 
                                    key={cat} 
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#09090B] border border-slate-800 text-xs font-medium text-slate-300"
                                >
                                    <span>{cat}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleDeleteCategory(cat)}
                                        className="text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search resources by title, keywords, authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#09090B] border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full outline-none focus:border-purple-500"
                    />
                </div>

                <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 cursor-pointer min-w-[200px]"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* List Table of Articles */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-3" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Querying resources ledger...</span>
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-[#09090B]/30">
                    <Info className="mx-auto text-slate-600 mb-3" size={32} />
                    <h3 className="font-bold text-slate-300">No resources found</h3>
                    <p className="text-xs text-slate-500 mt-1">Add your first article using the "Add New Resource" button.</p>
                </div>
            ) : (
                <div className="bg-[#09090B] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm">
                        <thead className="bg-slate-900 border-b border-slate-850 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Author</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Stats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 font-medium">
                            {resources.map((resource) => (
                                <tr key={resource.id} className="hover:bg-slate-900/30 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-white text-sm sm:text-base">{resource.title}</span>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase">
                                                <span className="flex items-center gap-1"><Clock size={11} />{resource.reading_time}</span>
                                                <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(resource.publish_date)}</span>
                                                {resource.pinned && <span className="text-purple-400 flex items-center gap-0.5"><Pin size={10} fill="currentColor"/> Pinned</span>}
                                                {resource.featured && <span className="text-amber-400 flex items-center gap-0.5"><Sparkles size={10} /> Featured</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] uppercase font-bold">
                                            {resource.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{resource.author}</td>
                                    <td className="px-6 py-4">
                                        {resource.status === 'published' ? (
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-black">Published</span>
                                        ) : resource.status === 'draft' ? (
                                            <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] uppercase font-black">Draft</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] uppercase font-black">Archived</span>
                                        )}
                                        {resource.schedule_publish && (
                                            <div className="text-[9px] text-purple-400 mt-1 font-bold">Scheduled: {formatDate(resource.schedule_publish)}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1"><Eye size={12} />{resource.view_count || 0}</span>
                                            <span className="flex items-center gap-1"><Download size={11} />{resource.download_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(resource)}
                                                className="p-2 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                                                title="Edit Resource"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteResource(resource.id)}
                                                className="p-2 rounded bg-red-950/20 hover:bg-red-950/60 text-red-400 transition-all cursor-pointer"
                                                title="Delete Resource"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 📝 LARGE FORM DIALOG / CREATION DRAWER */}
            <AnimatePresence>
                {showFormModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFormModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[90vh] relative z-10 flex flex-col justify-between overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                                    <Sparkles className="text-purple-500" size={20} />
                                    <span>{isEditing ? 'Modify Resource Ledger' : 'Create Knowledge Resource'}</span>
                                </h2>
                                <button
                                    onClick={() => setShowFormModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Scrollable Body */}
                            <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
                                
                                {uploadError && (
                                    <div className="p-4 rounded-2xl bg-red-950/20 border border-red-550/30 text-red-400 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        <span>{uploadError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleFormSubmit} className="space-y-6">
                                    
                                    {/* Row 1: Title & Author */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Title</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter a captivating title..."
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Author / Source</label>
                                            <input
                                                type="text"
                                                required
                                                value={author}
                                                onChange={(e) => setAuthor(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 2: Category, Type, Reading Time */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium cursor-pointer"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Type</label>
                                            <select
                                                value={resourceType}
                                                onChange={(e) => setResourceType(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium cursor-pointer"
                                            >
                                                <option value="article">Article / Guides</option>
                                                <option value="template">Word Template</option>
                                                <option value="spreadsheet">Financial Spreadsheet</option>
                                                <option value="legal">Legal Document</option>
                                                <option value="slide">Pitch Deck Slides</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Reading time</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 5 mins"
                                                value={readingTime}
                                                onChange={(e) => setReadingTime(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Tags, Status, Scheduled Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags (comma separated)</label>
                                            <input
                                                type="text"
                                                placeholder="fundraising, pitchdeck, guide"
                                                value={tagsInput}
                                                onChange={(e) => setTagsInput(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Publish Status</label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium cursor-pointer"
                                            >
                                                <option value="published">Published</option>
                                                <option value="draft">Draft</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule Publication (Optional)</label>
                                            <input
                                                type="datetime-local"
                                                value={schedulePublish}
                                                onChange={(e) => setSchedulePublish(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggles: Featured, Pinned */}
                                    <div className="flex gap-8 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={featured}
                                                onChange={(e) => setFeatured(e.target.checked)}
                                                className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-800 outline-none"
                                            />
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Feature on homepage</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={pinned}
                                                onChange={(e) => setPinned(e.target.checked)}
                                                className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-800 outline-none"
                                            />
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Pin to top</span>
                                        </label>
                                    </div>

                                    {/* Cover Image Upload */}
                                    <div className="space-y-2 bg-slate-950/20 p-5 border border-slate-850 rounded-2xl">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cover Image</label>
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <input
                                                type="text"
                                                placeholder="Enter image URL or upload file..."
                                                value={coverImage}
                                                onChange={(e) => setCoverImage(e.target.value)}
                                                className="bg-[#09090B] border border-slate-850 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-purple-500 text-white font-medium"
                                            />
                                            <div className="relative flex-shrink-0">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'cover')}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={isUploadingCover}
                                                    className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold uppercase whitespace-nowrap flex items-center gap-1.5"
                                                >
                                                    {isUploadingCover ? 'Uploading...' : <Upload size={14} />}
                                                    <span>Upload File</span>
                                                </button>
                                            </div>
                                        </div>
                                        {coverImage && (
                                            <div className="w-24 h-16 rounded border border-slate-800 overflow-hidden mt-2">
                                                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Attachments Upload */}
                                    <div className="space-y-3 bg-slate-950/20 p-5 border border-slate-850 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments & Templates</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileUpload(e, 'attachment')}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={isUploadingAttachment}
                                                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer text-slate-200"
                                                >
                                                    {isUploadingAttachment ? 'Uploading...' : <Upload size={12} />}
                                                    <span>Add File</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* List attachments */}
                                        {attachments.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                {attachments.map((file, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center justify-between p-3 rounded-xl bg-[#09090B] border border-slate-850"
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FileText size={15} className="text-slate-400 flex-shrink-0" />
                                                            <span className="text-xs font-bold text-slate-200 truncate">{file.name}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAttachment(idx)}
                                                            className="text-slate-500 hover:text-red-400 p-1"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 font-medium pt-1">No attachments added. Upload spreadsheets or PDF slides.</p>
                                        )}
                                    </div>

                                    {/* Short Summary */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Summary (Brief outline)</label>
                                        <textarea
                                            placeholder="Write a brief, clean outline of the article..."
                                            value={shortSummary}
                                            onChange={(e) => setShortSummary(e.target.value)}
                                            className="bg-[#09090B] border border-slate-850 rounded-xl p-4 text-sm w-full outline-none focus:border-purple-500 text-white font-medium h-20 resize-none"
                                        />
                                    </div>

                                    {/* Markdown workspace with Live preview */}
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Body Content (Markdown format supported)</label>
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                                            {/* Editor */}
                                            <div className="flex flex-col h-full bg-[#09090B] border border-slate-850 rounded-2xl overflow-hidden focus-within:border-purple-500 transition-all">
                                                <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-850 text-[10px] font-black text-slate-400 uppercase tracking-wider">Markdown Editor</div>
                                                <textarea
                                                    placeholder="# Header 1&#10;Write detailed instructions, resources analysis, or links using markdown standard..."
                                                    value={fullContent}
                                                    onChange={(e) => setFullContent(e.target.value)}
                                                    className="w-full h-full bg-transparent border-none outline-none p-4 text-slate-200 font-mono text-sm resize-none"
                                                />
                                            </div>

                                            {/* Live Preview */}
                                            <div className="flex flex-col h-full bg-[#050507] border border-slate-850 rounded-2xl overflow-hidden">
                                                <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-850 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Sparkles size={11} className="text-purple-400" />
                                                    <span>Live Render Preview</span>
                                                </div>
                                                <div className="p-4 overflow-y-auto h-full prose prose-invert prose-slate prose-sm leading-relaxed text-slate-350">
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                    >
                                                        {fullContent || '*No content to preview yet. Start writing in the editor.*'}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Modal Footer Controls */}
                            <div className="p-6 border-t border-slate-850 bg-slate-900/40 flex items-center justify-end gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-350 text-xs font-bold uppercase transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFormSubmit}
                                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Article'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AdminResourcesCMS;
