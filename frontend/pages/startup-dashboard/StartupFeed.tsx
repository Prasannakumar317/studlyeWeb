import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, Send, Heart, MessageCircle, Loader2, Sparkles, CornerDownRight } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface Comment {
    id: string;
    user_name: string;
    text: string;
    created_at?: string;
}

interface FeedPost {
    id: string;
    author_name: string;
    author_logo?: string;
    content: string;
    likes: string[];
    comments: Comment[];
    type: string;
    created_at: string;
}

const POST_TYPES = [
    'Product Launch',
    'Hiring Post',
    'Funding Announcement',
    'Startup Milestone',
    'Event',
    'Partnership Update'
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

const postVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 16
        }
    }
};

const getPostTypeColor = (type: string) => {
    switch (type) {
        case 'Product Launch':
            return 'bg-pink-50 text-pink-600 border-pink-100';
        case 'Hiring Post':
            return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'Funding Announcement':
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'Startup Milestone':
            return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'Event':
            return 'bg-sky-50 text-sky-600 border-sky-100';
        case 'Partnership Update':
            return 'bg-purple-50 text-purple-600 border-purple-100';
        default:
            return 'bg-slate-50 text-slate-600 border-slate-100';
    }
};

const StartupFeed: React.FC = () => {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState(POST_TYPES[0]);
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/feed`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) {
            console.error("Failed to fetch feed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    content: newPostContent,
                    type: newPostType
                })
            });

            if (res.ok) {
                setNewPostContent('');
                fetchFeed();
            }
        } catch (err) {
            console.error("Failed to post update", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/feed/${postId}/like`, {
                method: 'POST',
                headers: authHeaders()
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
            }
        } catch (err) {
            console.error("Failed to like post", err);
        }
    };

    const handleComment = async (postId: string) => {
        const text = commentInputs[postId]?.trim();
        if (!text) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/startup/feed/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ text })
            });

            if (res.ok) {
                const data = await res.json();
                setCommentInputs(prev => ({ ...prev, [postId]: '' }));
                setPosts(prev => prev.map(p => {
                    if (p.id === postId) {
                        return { ...p, comments: [...p.comments, data.comment] };
                    }
                    return p;
                }));
            }
        } catch (err) {
            console.error("Failed to submit comment", err);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 font-sans pb-10 text-left relative">
            {/* Ambient background glows */}
            <div className="absolute top-10 left-10 w-44 h-44 bg-pink-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />
            <div className="absolute bottom-20 right-10 w-52 h-52 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Asymmetrical Magazine Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white/40 to-transparent p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-1">
                        <Rss size={12} /> Tech Network
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Startup Feed
                    </h1>
                    <p className="text-xs text-slate-500 max-w-xl font-medium">
                        Broadcast product announcements, milestone completions, recruitment requests, or fundraising logs to ecosystem channels.
                    </p>
                </div>
            </div>

            {/* Premium Post Publisher */}
            <motion.form 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleCreatePost} 
                className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-4"
            >
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-[#EC4899] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-pink-500/10">
                        HQ
                    </div>
                    <div className="flex-1 space-y-3">
                        <textarea
                            rows={3}
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Share an update on milestones, product launches, or openings..."
                            className="w-full p-4 bg-slate-50/50 border border-slate-200/60 focus:border-pink-300 rounded-2xl text-xs font-semibold focus:outline-none focus:bg-white transition-all resize-none shadow-inner"
                        />
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type:</span>
                                <select 
                                    value={newPostType}
                                    onChange={(e) => setNewPostType(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] font-bold text-slate-700 focus:outline-none focus:border-pink-400 cursor-pointer"
                                >
                                    {POST_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={submitting || !newPostContent.trim()}
                                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-[#EC4899] text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-pink-500/10 hover:opacity-95 border-none cursor-pointer"
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                Broadcast Update
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.form>

            {/* Feed List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Loader2 className="animate-spin text-pink-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Syncing ecosystem feeds...</span>
                </div>
            ) : posts.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {posts.map((post) => (
                        <motion.div 
                            key={post.id}
                            variants={postVariants}
                            className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:border-pink-100/50 transition-colors"
                        >
                            {/* Author Row */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-50 to-indigo-50 border border-pink-100/50 text-[#EC4899] flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
                                        {post.author_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-xs">{post.author_name}</h3>
                                        <span className="text-[9px] text-slate-400 font-bold">
                                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                </div>

                                <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest border ${getPostTypeColor(post.type)}`}>
                                    {post.type}
                                </span>
                            </div>

                            {/* Content */}
                            <p className="text-slate-700 text-xs leading-relaxed font-semibold pr-4 whitespace-pre-wrap">{post.content}</p>

                            {/* Actions Bar */}
                            <div className="flex items-center gap-6 pt-3 border-t border-slate-100/60 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-1.5 hover:text-pink-600 border-none bg-transparent cursor-pointer font-black"
                                >
                                    <Heart size={15} className={post.likes.length > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                                    <span>{post.likes.length} Likes</span>
                                </motion.button>
                                
                                <button 
                                    onClick={() => setActiveCommentBox(activeCommentBox === post.id ? null : post.id)}
                                    className="flex items-center gap-1.5 hover:text-pink-600 border-none bg-transparent cursor-pointer font-black"
                                >
                                    <MessageCircle size={15} />
                                    <span>{post.comments.length} Comments</span>
                                </button>
                            </div>

                            {/* Comments Section */}
                            <AnimatePresence>
                                {activeCommentBox === post.id && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden space-y-4 pt-4 border-t border-slate-100/60"
                                    >
                                        {/* Comments list */}
                                        {post.comments.length > 0 && (
                                            <div className="space-y-3.5 pl-4 border-l-2 border-pink-100">
                                                {post.comments.map((comment) => (
                                                    <div key={comment.id} className="text-xs space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-extrabold text-slate-900">{comment.user_name}</span>
                                                            {comment.created_at && (
                                                                <span className="text-[9px] text-slate-400 font-bold">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-600 leading-relaxed font-semibold flex gap-1.5 items-start">
                                                            <CornerDownRight size={12} className="text-pink-500 shrink-0 mt-0.5" />
                                                            {comment.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Write Comment Box */}
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={commentInputs[post.id] || ''}
                                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                placeholder="Add a comment to this update..." 
                                                className="flex-1 px-4 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner"
                                            />
                                            <motion.button 
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleComment(post.id)}
                                                className="p-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl border-none cursor-pointer transition-colors"
                                            >
                                                <Send size={14} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="py-20 text-center bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-sm">
                    <Sparkles className="mx-auto text-slate-300 mb-4 animate-pulse" size={44} />
                    <p className="text-slate-900 font-black text-sm uppercase tracking-wider">Feed Is Empty</p>
                    <p className="text-slate-400 text-xs font-semibold mt-2">Publish your first launch update or milestone to begin feed stream interactions.</p>
                </div>
            )}
        </div>
    );
};

export default StartupFeed;
