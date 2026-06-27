import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
    ArrowLeft, Calendar, User, Clock, Eye, Download, Bookmark, Share2, 
    MessageSquare, Star, Sparkles, Check, ChevronRight, Lock, FileText, Send, X, ExternalLink
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../apiConfig';
import { useAuth } from '../AuthContext';

// Helper to format date
const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (_) {
        return dateStr;
    }
};

const StartupResourceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // API States
    const [resource, setResource] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    
    // UI Form States
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalReason, setAuthModalReason] = useState('');
    const [copied, setCopied] = useState(false);

    const fetchResource = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setResource(data);
            } else {
                console.error("Resource not found");
            }
        } catch (err) {
            console.error("Failed to load details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchResource();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [id]);

    // Handle Bookmark click
    const handleBookmark = async () => {
        if (!user) {
            setAuthModalReason('Bookmark resources to keep them in your personalized dashboard library');
            setShowAuthModal(true);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/resources/${id}/bookmark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                }
            });
            if (res.ok) {
                const data = await res.json();
                setResource((prev: any) => ({
                    ...prev,
                    is_bookmarked: data.status === 'bookmarked'
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Handle Download click
    const handleDownload = async () => {
        if (!user) {
            setAuthModalReason('Download premium templates, slides, spreadsheets, and legal files');
            setShowAuthModal(true);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/resources/${id}/download`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (data.attachments && data.attachments.length > 0) {
                    data.attachments.forEach((file: any) => {
                        window.open(file.url, '_blank');
                    });
                    
                    setResource((prev: any) => ({
                        ...prev,
                        download_count: (prev.download_count || 0) + 1
                    }));
                } else {
                    alert("No download attachments found.");
                }
            } else {
                alert("Failed to download.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Handle Share click
    const handleShare = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle Comment Submit
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setAuthModalReason('Submit ratings and reviews to contribute to the founder community');
            setShowAuthModal(true);
            return;
        }

        if (!commentText.trim()) return;
        setIsSubmittingComment(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/resources/${id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify({ comment_text: commentText, rating })
            });

            if (res.ok) {
                const data = await res.json();
                setResource((prev: any) => ({
                    ...prev,
                    comments: [...(prev.comments || []), data.comment]
                }));
                setCommentText('');
                setRating(5);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4" />
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Opening Resource Ledger...</span>
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center px-4 pt-20">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Resource not found</h2>
                <p className="text-slate-500 text-sm mb-6">The database record may have been archived or removed by an administrator.</p>
                <button
                    onClick={() => navigate('/startup-resources')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                    Return to Library
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-x-hidden pt-28 pb-20 relative">
            
            {/* Mesh keyframes */}
            <style>{`
                @keyframes float-blob-1 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float-blob-2 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(-40px, 40px) scale(1.15); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .mesh-blob-1 {
                    animation: float-blob-1 18s ease-in-out infinite;
                }
                .mesh-blob-2 {
                    animation: float-blob-2 22s ease-in-out infinite;
                }
            `}</style>

            {/* 🌌 DYNAMIC MESH BACKGROUND GRADIENTS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="mesh-blob-1 absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 to-purple-400/10 blur-[130px] rounded-full" />
                <div className="mesh-blob-2 absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tr from-pink-400/10 to-rose-400/5 blur-[150px] rounded-full" />
                <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-50/20 via-slate-50/5 to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
                
                {/* ⬅️ Back Button */}
                <button
                    onClick={() => navigate('/startup-resources')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold group cursor-pointer"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Resources Library</span>
                </button>

                {/* Cover Image / Hero Header */}
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 text-xs font-bold uppercase tracking-wider">
                            {resource.category}
                        </span>
                        {resource.featured && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-250 text-amber-600 text-xs font-bold">
                                <Sparkles size={11} />
                                Featured
                            </span>
                        )}
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} />
                            {resource.reading_time || '5 mins'} read
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                        {resource.title}
                    </h1>

                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-200/80 text-xs sm:text-sm text-slate-500 font-bold">
                        <span className="flex items-center gap-2">
                            <User size={16} className="text-indigo-600" />
                            Author: {resource.author}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-600" />
                            Published: {formatDate(resource.publish_date)}
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye size={16} className="text-indigo-600" />
                            {resource.view_count || 0} views
                        </span>
                    </div>
                </div>

                {/* Source information panel */}
                {resource.source_name && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            {resource.source_logo ? (
                                <img src={resource.source_logo} alt={resource.source_name} className="w-6 h-6 rounded-full object-contain" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">S</div>
                            )}
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Origin: {resource.source_name}</h4>
                                <p className="text-[10px] text-slate-400 font-semibold">Metadata synced directly from verified publisher stream.</p>
                            </div>
                        </div>

                        <a 
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all"
                        >
                            <span>Visit Site</span>
                            <ExternalLink size={12} />
                        </a>
                    </div>
                )}

                {/* Cover Image banner */}
                {resource.cover_image && (
                    <div className="w-full max-h-[400px] overflow-hidden rounded-3xl border border-slate-100 shadow-xl">
                        <img 
                            src={resource.cover_image} 
                            alt={resource.title} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}

                {/* Content Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Article content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[400px]">
                            <article className="prose prose-slate max-w-none prose-sm sm:prose-base leading-relaxed text-slate-600">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                >
                                    {resource.full_content || 'No text content provided.'}
                                </ReactMarkdown>
                            </article>

                            {/* Direct External Read More link at the end of article */}
                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <a 
                                    href={resource.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest shadow-md shadow-indigo-600/15 transition-all"
                                >
                                    <span>Read Full Publication at {resource.source_name}</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleBookmark}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all cursor-pointer font-bold text-xs uppercase tracking-wider ${
                                    resource.is_bookmarked
                                        ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/15'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <Bookmark size={15} fill={resource.is_bookmarked ? "currentColor" : "none"} />
                                <span>{resource.is_bookmarked ? 'Bookmarked' : 'Add Bookmark'}</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer font-bold text-xs uppercase tracking-wider"
                            >
                                {copied ? <Check size={15} className="text-green-600" /> : <Share2 size={15} />}
                                <span>{copied ? 'Copied Link' : 'Share URL'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Sidebar Attachments, Action locks, Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Attachments Card */}
                        <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                                <Download size={16} className="text-indigo-655" />
                                <span>Attachments</span>
                            </h3>

                            {resource.attachments?.length > 0 ? (
                                <div className="space-y-3">
                                    {resource.attachments.map((file: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2"
                                        >
                                            <div className="flex items-start gap-2">
                                                <FileText size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs font-bold text-slate-700 line-clamp-2 leading-snug">{file.name}</span>
                                            </div>

                                            {user ? (
                                                <button
                                                    onClick={handleDownload}
                                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Download size={12} />
                                                    <span>Download File</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleDownload}
                                                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-slate-200"
                                                >
                                                    <Lock size={12} className="text-slate-400" />
                                                    <span>Login to Get</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-450 font-medium">This resource redirects users directly to external web guidelines without attached static templates.</p>
                            )}
                        </div>

                        {/* Resource stats */}
                        <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-3 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Ledger</h4>
                            <div className="space-y-2 text-xs font-bold text-slate-500">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span>Downloads</span>
                                    <span className="text-slate-800">{resource.download_count || 0}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span>Views</span>
                                    <span className="text-slate-800">{resource.view_count || 0}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span>Type</span>
                                    <span className="text-slate-800 uppercase tracking-wider">{resource.resource_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 💬 REVIEWS AND COMMENTS VIEW */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-8 space-y-8 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-base font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                            <MessageSquare size={18} className="text-indigo-600" />
                            <span>Community Feedback</span>
                        </h3>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                            {resource.comments?.length || 0} Comments
                        </span>
                    </div>

                    {/* Write comment container */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-650">Submit Review & Rating</h4>
                        
                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            {/* Star rating clicker */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 font-bold mr-2">Your Rating:</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="p-0.5 text-amber-500 transition-transform hover:scale-110 cursor-pointer animate-none bg-transparent border-none"
                                    >
                                        <Star 
                                            size={20} 
                                            fill={star <= rating ? "currentColor" : "none"} 
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-end">
                                <textarea
                                    placeholder={user ? "Write comments, feedback, or review on the templates..." : "Please log in to submit comments"}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={!user}
                                    className="w-full bg-transparent border-none outline-none p-3 text-slate-750 text-xs sm:text-sm placeholder:text-slate-400 resize-none h-20"
                                />
                                {user && (
                                    <button
                                        type="submit"
                                        disabled={isSubmittingComment || !commentText.trim()}
                                        className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer mb-1 mr-1 shadow-md shadow-indigo-600/10"
                                    >
                                        <Send size={14} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* List comments */}
                    <div className="space-y-4">
                        {resource.comments && resource.comments.length > 0 ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                {resource.comments.map((comment: any) => (
                                    <div 
                                        key={comment.id}
                                        className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-805">{comment.user_name}</span>
                                            
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={12} 
                                                        className="text-amber-500"
                                                        fill={i < (comment.rating || 5) ? "currentColor" : "none"} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{comment.comment_text}</p>
                                        <div className="text-[10px] text-slate-400 font-semibold">{formatDate(comment.date)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-450 text-center py-6 font-medium">No reviews posted yet. Be the first to share your experience!</p>
                        )}
                    </div>
                </div>

                {/* RELATED KNOWLEDGE ITEMS GRID */}
                {resource.related && resource.related.length > 0 && (
                    <div className="space-y-6 pt-6">
                        <h3 className="text-base font-black uppercase tracking-widest text-slate-500 border-l-2 border-indigo-500 pl-3">Related Resources</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {resource.related.map((r: any) => (
                                <div
                                    key={r.id}
                                    onClick={() => navigate(`/startup-resources/${r.id}`)}
                                    className="p-5 bg-white border border-slate-205 hover:border-indigo-305 rounded-2xl cursor-pointer hover:y-[-3px] transition-all flex flex-col justify-between min-h-[200px] shadow-sm hover:shadow-md"
                                >
                                    <div>
                                        <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-bold uppercase mb-3 inline-block">
                                            {r.category}
                                        </span>
                                        <h4 className="text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug hover:text-indigo-650 transition-colors">
                                            {r.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-4 border-t border-slate-100">
                                        <span className="flex items-center gap-1"><Clock size={11} />{r.reading_time || '5 mins'}</span>
                                        <span className="text-indigo-600 uppercase tracking-widest flex items-center gap-1 font-bold">Read <ChevronRight size={11} /></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 🚪 AUTHENTICATION MODAL */}
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAuthModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-2xl text-center space-y-4"
                        >
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>

                            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-650">
                                <Sparkles size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-800">Unlock Full Features</h3>
                            <p className="text-slate-550 text-sm font-medium leading-relaxed">
                                {authModalReason || 'Access files, bookmark resources, track portfolio milestones, and ask questions directly to experts.'}
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/15"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
                                >
                                    Register
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StartupResourceDetail;
