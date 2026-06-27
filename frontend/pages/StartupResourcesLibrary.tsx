import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, BookOpen, Download, Bookmark, Share2, Eye, Clock, Calendar, 
    ArrowRight, Sparkles, Filter, X, ChevronRight, Check, AlertCircle, FileText,
    TrendingUp, Award, HelpCircle, Newspaper, ArrowUpRight, Flame, ExternalLink
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../apiConfig';
import { useAuth } from '../AuthContext';

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

// Helper to determine if a resource is "New" (published in last 48 hours)
const isNewResource = (dateStr: string) => {
    if (!dateStr) return false;
    try {
        const pub = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - pub.getTime();
        const diffHours = diffMs / (1050 * 60 * 60); // approx hours
        return diffHours >= 0 && diffHours <= 48;
    } catch (_) {
        return false;
    }
};

// Colors mapping for category badges in light theme
const CATEGORY_COLOR_SCHEMES: Record<string, { bg: string, text: string, border: string }> = {
    "Fundraising": { bg: "bg-blue-50 text-blue-600", text: "text-blue-600", border: "border-blue-200" },
    "Pitch Decks": { bg: "bg-violet-50 text-violet-600", text: "text-violet-600", border: "border-violet-200" },
    "Financial Models": { bg: "bg-amber-50 text-amber-600", text: "text-amber-600", border: "border-amber-200" },
    "Legal Templates": { bg: "bg-red-50 text-red-600", text: "text-red-600", border: "border-red-200" },
    "Founder Stories": { bg: "bg-pink-50 text-pink-600", text: "text-pink-600", border: "border-pink-200" },
    "Product Development": { bg: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", border: "border-emerald-200" },
    "Marketing": { bg: "bg-cyan-50 text-cyan-600", text: "text-cyan-600", border: "border-cyan-200" },
    "Sales": { bg: "bg-teal-50 text-teal-600", text: "text-teal-600", border: "border-teal-200" },
    "Hiring": { bg: "bg-indigo-50 text-indigo-600", text: "text-indigo-600", border: "border-indigo-200" },
    "AI Startups": { bg: "bg-purple-50 text-purple-600", text: "text-purple-600", border: "border-purple-200" },
    "Government Schemes": { bg: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", border: "border-emerald-200" },
    "Grants": { bg: "bg-cyan-50 text-cyan-600", text: "text-cyan-600", border: "border-cyan-200" },
    "Incubators": { bg: "bg-rose-50 text-rose-600", text: "text-rose-600", border: "border-rose-200" },
    "Accelerators": { bg: "bg-orange-50 text-orange-600", text: "text-orange-600", border: "border-orange-200" },
    "Compliance": { bg: "bg-yellow-50 text-yellow-600", text: "text-yellow-600", border: "border-yellow-200" },
    "Startup India": { bg: "bg-orange-50 text-orange-600", text: "text-orange-600", border: "border-orange-200" },
    "Business Planning": { bg: "bg-blue-50 text-blue-600", text: "text-blue-600", border: "border-blue-200" },
    "Startup Guides": { bg: "bg-indigo-50 text-indigo-600", text: "text-indigo-600", border: "border-indigo-200" },
    "Legal & Compliance": { bg: "bg-red-50 text-red-600", text: "text-red-600", border: "border-red-200" },
    "Investors": { bg: "bg-blue-50 text-blue-600", text: "text-blue-600", border: "border-blue-200" }
};

const getCategoryStyle = (cat: string) => {
    return CATEGORY_COLOR_SCHEMES[cat] || { bg: "bg-slate-50 text-slate-600", text: "text-slate-600", border: "border-slate-205" };
};

// ─── PREMIUM HORIZONTAL CONTINUOUS MARQUEE COMPONENT (LIGHT THEME) ───
interface MarqueeProps {
    items: any[];
    direction: 'left' | 'right';
    onBookmark: (e: React.MouseEvent, id: string) => void;
    onShare: (e: React.MouseEvent, id: string) => void;
    onPreview: (resource: any) => void;
    copiedId: string | null;
    navigate: (url: string) => void;
}

const MarqueeRow: React.FC<MarqueeProps> = ({ 
    items, direction, onBookmark, onShare, onPreview, copiedId, navigate 
}) => {
    let renderItems = [...items];
    if (renderItems.length < 8 && renderItems.length > 0) {
        while (renderItems.length < 16) {
            renderItems = [...renderItems, ...items];
        }
    }

    const marqueeClass = direction === 'left' ? 'marquee-inner-left' : 'marquee-inner-right';

    return (
        <div className="marquee-container w-full overflow-hidden relative py-4">
            <div className={`${marqueeClass} flex gap-6 hover:cursor-grab active:cursor-grabbing`}>
                {renderItems.map((resource, index) => {
                    const style = getCategoryStyle(resource.category);
                    const isNew = isNewResource(resource.publish_date);
                    
                    return (
                        <motion.div
                            key={`${resource.id}-${index}`}
                            whileHover={{ y: -8, scale: 1.01 }}
                            onClick={() => navigate(`/startup-resources/${resource.id}`)}
                            className="group relative w-[310px] sm:w-[350px] bg-white/80 backdrop-blur-xl border border-white/60 hover:border-indigo-500/35 rounded-[24px] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 p-5 flex flex-col justify-between flex-shrink-0 cursor-pointer transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent blur-2xl group-hover:from-indigo-500/15 transition-all rounded-full pointer-events-none" />
                            
                            <div>
                                {/* Cover image */}
                                {resource.cover_image && (
                                    <div className="w-full h-36 overflow-hidden rounded-2xl border border-slate-100 relative mb-4">
                                        <img 
                                            src={resource.cover_image} 
                                            alt={resource.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md border text-[9px] font-black uppercase tracking-wider ${style.bg} ${style.border}`}>
                                            {resource.category}
                                        </span>
                                        
                                        {/* Orange NEW Badge */}
                                        {isNew && (
                                            <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-orange-500 border border-orange-400 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shadow-md shadow-orange-500/20">
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Source and logo */}
                                <div className="flex items-center gap-2 mb-2 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100 inline-flex">
                                    {resource.source_logo ? (
                                        <img 
                                            src={resource.source_logo} 
                                            alt={resource.source_name} 
                                            className="w-4 h-4 rounded-full object-contain" 
                                        />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">S</div>
                                    )}
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{resource.source_name || "Startup Portal"}</span>
                                </div>

                                {/* Heading and description */}
                                <h3 className="text-slate-800 group-hover:text-indigo-650 text-sm sm:text-base font-extrabold line-clamp-2 leading-snug mb-2 transition-colors">
                                    {resource.title}
                                </h3>

                                <p className="text-slate-500 text-xs leading-relaxed font-medium line-clamp-3 mb-4">
                                    {resource.short_summary}
                                </p>
                            </div>

                            <div>
                                {/* Stats */}
                                <div className="flex items-center gap-3.5 text-[10px] text-slate-400 font-bold mb-4 border-t border-slate-50 pt-3">
                                    <span className="flex items-center gap-1"><Eye size={12} /> {resource.view_count || 0}</span>
                                    <span className="flex items-center gap-1"><Clock size={11} /> {resource.reading_time || '5m'}</span>
                                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(resource.publish_date)}</span>
                                </div>

                                {/* Actions footer */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => onBookmark(e, resource.id)}
                                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                resource.is_bookmarked 
                                                    ? 'bg-indigo-600/10 text-indigo-650 border border-indigo-500/20' 
                                                    : 'bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-655 hover:bg-slate-100'
                                            }`}
                                            title="Bookmark"
                                        >
                                            <Bookmark size={13} fill={resource.is_bookmarked ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={(e) => onShare(e, resource.id)}
                                            className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-655 hover:bg-slate-100 transition-all cursor-pointer relative"
                                            title="Copy Link"
                                        >
                                            {copiedId === resource.id ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPreview(resource);
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase transition-all"
                                        >
                                            Outline
                                        </button>
                                        
                                        <a
                                            href={resource.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold uppercase flex items-center gap-1 shadow-md shadow-indigo-600/10 transition-all"
                                        >
                                            <span>Read More</span>
                                            <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── MAIN LIBRARY COMPONENT ───

const StartupResourcesLibrary: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // API states
    const [resources, setResources] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter parameters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('latest');
    
    // Interactive Overlays
    const [previewResource, setPreviewResource] = useState<any | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalReason, setAuthModalReason] = useState('');
    const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    // Sync search trends
    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/resources/trending-searches`);
                if (res.ok) {
                    const trends = await res.json();
                    setTrendingSearches(trends);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTrends();
    }, []);

    // Main API fetch
    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                let url = `${API_BASE_URL}/api/resources?sort=${sortBy}&limit=150`;
                if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
                if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
                if (selectedTag) url += `&tag=${encodeURIComponent(selectedTag)}`;

                const headers: any = { ...authHeaders() };
                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@studlyf.com';
                if (user && user.email?.toLowerCase() === adminEmail.toLowerCase()) {
                    headers['X-Admin-Email'] = user.email;
                }

                const res = await fetch(url, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setResources(data.resources || []);
                    if (data.categories) setCategories(data.categories);
                    if (data.tags) setTags(data.tags);
                }
            } catch (err) {
                console.error("Sync library resources failed:", err);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchResources();
        }, searchQuery ? 300 : 0);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, selectedCategory, selectedTag, sortBy, user]);

    // Handle Bookmark click
    const handleBookmark = async (e: React.MouseEvent, resourceId: string) => {
        e.stopPropagation();
        if (!user) {
            setAuthModalReason('Bookmark resources to pin them on your dashboard timeline');
            setShowAuthModal(true);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/bookmark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                }
            });
            if (res.ok) {
                const data = await res.json();
                setResources(prev => prev.map(r => {
                    if (r.id === resourceId) {
                        return { ...r, is_bookmarked: data.status === 'bookmarked' };
                    }
                    return r;
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Share link
    const handleShare = (e: React.MouseEvent, resourceId: string) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/#/startup-resources/${resourceId}`;
        navigator.clipboard.writeText(shareUrl);
        setCopiedId(resourceId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Newsletter submit
    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;
        setIsSubscribing(true);
        setTimeout(() => {
            setIsSubscribing(false);
            setSubscribed(true);
            setNewsletterEmail('');
        }, 1200);
    };

    // Filters categories mapping
    const getItemsByCategory = (catName: string) => {
        return resources.filter(r => r.category === catName);
    };

    // 10 Homepage Layout Filter Rows:
    // 1. 🔥 Featured Resources
    const featuredResources = resources.filter(r => r.featured || r.pinned);
    
    // 2. 🚀 Latest from Y Combinator
    const ycResources = resources.filter(r => r.source_name && r.source_name.toLowerCase().includes("y combinator"));
    
    // 3. ⭐ Latest from Wellfound
    const wellfoundResources = resources.filter(r => r.source_name && r.source_name.toLowerCase().includes("wellfound"));
    
    // 4. 💰 Funding & Investment
    const fundingResources = resources.filter(r => ["Fundraising", "Investors", "Grants"].includes(r.category));
    
    // 5. 📈 Startup Growth
    const growthResources = resources.filter(r => ["Business Strategy", "Marketing", "Sales"].includes(r.category));
    
    // 6. 🤖 AI Startups
    const aiResources = resources.filter(r => r.category === "AI Startups");
    
    // 7. 🏛 Startup India & Government Schemes
    const govtResources = resources.filter(r => ["Startup India", "Government Schemes"].includes(r.category));
    
    // 8. 📚 Founder Guides
    const guidesResources = resources.filter(r => ["Startup Guides", "Founder Stories"].includes(r.category));
    
    // 9. 🎯 Product & Marketing
    const productMarketingResources = resources.filter(r => ["Product Development", "Marketing"].includes(r.category));
    
    // 10. 💼 Hiring & Team Building
    const hiringResources = resources.filter(r => r.category === "Hiring");

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-x-hidden pt-28 pb-0 relative">
            
            {/* Styles for carousels & blobs */}
            <style>{`
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .marquee-inner-left {
                    display: flex;
                    width: max-content;
                    animation: marquee-left 42s linear infinite;
                }
                .marquee-inner-right {
                    display: flex;
                    width: max-content;
                    animation: marquee-right 42s linear infinite;
                }
                .marquee-container:hover .marquee-inner-left,
                .marquee-container:hover .marquee-inner-right {
                    animation-play-state: paused;
                }
                
                /* Mesh floats */
                @keyframes float-blob-1 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(40px, -60px) scale(1.1); }
                    66% { transform: translate(-30px, 30px) scale(0.95); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float-blob-2 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(-50px, 50px) scale(1.15); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .mesh-blob-1 {
                    animation: float-blob-1 22s ease-in-out infinite;
                }
                .mesh-blob-2 {
                    animation: float-blob-2 25s ease-in-out infinite;
                }
            `}</style>

            {/* 🌌 LIGHT MESH GRADIENTS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="mesh-blob-1 absolute top-20 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-sky-400/20 to-indigo-300/15 blur-[120px] rounded-full" />
                <div className="mesh-blob-2 absolute top-1/4 right-5 w-[650px] h-[650px] bg-gradient-to-tr from-purple-300/15 to-pink-300/20 blur-[140px] rounded-full" />
                <div className="mesh-blob-1 absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-300/15 to-emerald-300/20 blur-[130px] rounded-full" />
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50/40 via-[#F8FAFC]/5 to-transparent" />
            </div>

            {/* 🌟 HERO PANEL (Light theme with sky-blue gradients) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                <div className="text-center max-w-4xl mx-auto mb-14 space-y-6 pt-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 text-xs font-black uppercase tracking-wider shadow-sm"
                    >
                        <Sparkles size={12} className="text-indigo-505" />
                        <span>Dynamic Multi-Feed Knowledge Ledgers</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-7xl font-black tracking-tight leading-none text-slate-900"
                    >
                        Startup Resource Library
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-500 text-sm sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Curated startup publications indexed in real-time from Y Combinator, TechCrunch, Hacker News, Product Hunt, and official scheme boards.
                    </motion.p>
                </div>

                {/* 🔍 SEARCH AND Live Suggestions */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto mb-16 relative"
                >
                    <div className="relative bg-white/70 border border-slate-200/80 rounded-2xl p-2 flex items-center shadow-lg focus-within:border-indigo-500 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
                        <Search className="text-slate-400 ml-4 flex-shrink-0" size={20} />
                        <input
                            type="text"
                            placeholder="Search YC guides, pitch decks, Wellfound updates, grants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full bg-transparent border-none outline-none py-3 px-4 text-slate-800 text-sm placeholder:text-slate-400 font-bold"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-450 mr-2"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showSuggestions && (
                            <>
                                <div className="fixed inset-0 z-15" onClick={() => setShowSuggestions(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xl z-20"
                                >
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Trending Searches</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {trendingSearches.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => {
                                                    setSearchQuery(term);
                                                    setShowSuggestions(false);
                                                }}
                                                className="text-xs px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-655 hover:text-indigo-650 border border-slate-200/60 hover:border-indigo-200 transition-all font-bold"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* 📂 CATEGORIES SELECTION ROW */}
                <div className="mb-14 flex items-center gap-2.5 overflow-x-auto no-scrollbar border-b border-slate-100 pb-5">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                            selectedCategory === null 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-650/20' 
                                : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                                    isSelected 
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-650/20' 
                                        : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* ACTIVE FILTER SUMMARIES */}
                {(selectedCategory || selectedTag || searchQuery) && (
                    <div className="mb-8 flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Filter size={14}/> Active Filters:</span>
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-655 text-xs font-semibold">
                                    Category: {selectedCategory}
                                    <X size={12} className="cursor-pointer" onClick={() => setSelectedCategory(null)} />
                                </span>
                            )}
                            {selectedTag && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-655 text-xs font-semibold">
                                    Tag: #{selectedTag}
                                    <X size={12} className="cursor-pointer" onClick={() => setSelectedTag(null)} />
                                </span>
                            )}
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-655 text-xs font-semibold">
                                    Query: "{searchQuery}"
                                    <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setSelectedCategory(null);
                                setSelectedTag(null);
                                setSearchQuery('');
                            }}
                            className="text-xs text-slate-450 hover:text-slate-850 font-bold uppercase"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {/* SKELETON LOADER */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white rounded-[24px] border border-slate-200 h-[340px] p-5 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-full h-36 bg-slate-105 rounded-2xl" />
                                    <div className="h-4 bg-slate-105 rounded w-3/4" />
                                    <div className="h-3 bg-slate-105 rounded w-5/6" />
                                </div>
                                <div className="h-8 bg-slate-105 rounded-xl w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : resources.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
                        <AlertCircle className="mx-auto text-slate-455 mb-3" size={38} />
                        <h3 className="text-lg font-bold text-slate-705">No matches found</h3>
                        <p className="text-slate-500 text-xs mt-1">Try another keyword query.</p>
                    </div>
                ) : (
                    <div className="space-y-16 pb-12">
                        
                        {/* 1. Search Results Grid */}
                        {(searchQuery || selectedCategory || selectedTag) ? (
                            <div className="space-y-6">
                                <h3 className="text-base font-black uppercase tracking-widest text-slate-500 border-l-2 border-indigo-500 pl-3">Search Results</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resources.map((resource) => {
                                        const style = getCategoryStyle(resource.category);
                                        const isNew = isNewResource(resource.publish_date);
                                        return (
                                            <motion.div
                                                key={resource.id}
                                                whileHover={{ y: -6 }}
                                                onClick={() => navigate(`/startup-resources/${resource.id}`)}
                                                className="group bg-white/80 border border-slate-200/80 hover:border-indigo-300 rounded-[24px] p-5 flex flex-col justify-between min-h-[340px] cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl"
                                            >
                                                <div>
                                                    {resource.cover_image && (
                                                        <div className="w-full h-36 overflow-hidden rounded-2xl border border-slate-100 relative mb-4">
                                                            <img src={resource.cover_image} alt={resource.title} className="w-full h-full object-cover" />
                                                            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${style.bg} ${style.border}`}>
                                                                {resource.category}
                                                            </span>
                                                            {isNew && (
                                                                <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-orange-500 border border-orange-400 text-white text-[9px] font-black uppercase tracking-wider">
                                                                    NEW
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Source Badging */}
                                                    <div className="flex items-center gap-2 mb-2 bg-slate-50 p-1 rounded-lg inline-flex">
                                                        {resource.source_logo ? (
                                                            <img src={resource.source_logo} alt={resource.source_name} className="w-3.5 h-3.5 rounded-full object-contain" />
                                                        ) : (
                                                            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">S</div>
                                                        )}
                                                        <span className="text-[9px] font-black text-slate-500 uppercase">{resource.source_name}</span>
                                                    </div>

                                                    <h4 className="text-slate-800 group-hover:text-indigo-650 font-extrabold text-sm mb-2 transition-colors line-clamp-2 leading-snug">{resource.title}</h4>
                                                    <p className="text-slate-555 text-xs font-medium line-clamp-3 leading-relaxed">{resource.short_summary}</p>
                                                </div>
                                                
                                                <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={(e) => handleBookmark(e, resource.id)} 
                                                            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-655"
                                                        >
                                                            <Bookmark size={13}/>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleShare(e, resource.id)} 
                                                            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-655"
                                                        >
                                                            {copiedId === resource.id ? (
                                                                <Check size={13} className="text-green-500" />
                                                            ) : (
                                                                <Share2 size={13}/>
                                                            )}
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex gap-1.5">
                                                        <button onClick={(e) => { e.stopPropagation(); setPreviewResource(resource); }} className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-505">Outline</button>
                                                        <a 
                                                            href={resource.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            onClick={(e) => e.stopPropagation()} 
                                                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-650/10"
                                                        >
                                                            <span>Read</span>
                                                            <ExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* 2. Redesigned 10 Homepage Layout Sections */
                            <div className="space-y-12">
                                
                                {/* 1. 🔥 Featured Resources (Hero Glow) */}
                                {featuredResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-indigo-100/50 via-blue-50/30 to-indigo-50/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-indigo-500 pl-3">
                                            <Flame className="text-indigo-600 animate-pulse" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">🔥 Featured Resources</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={featuredResources} 
                                            direction="left" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 2. 🚀 Latest from Y Combinator */}
                                {ycResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-amber-100/40 via-orange-50/20 to-amber-50/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-orange-500 pl-3">
                                            <Sparkles className="text-orange-605" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">🚀 Latest from Y Combinator</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={ycResources} 
                                            direction="right" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 3. ⭐ Latest from Wellfound */}
                                {wellfoundResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-sky-100/50 via-blue-50/30 to-indigo-100/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-sky-500 pl-3">
                                            <TrendingUp className="text-sky-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">⭐ Latest from Wellfound</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={wellfoundResources} 
                                            direction="left" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 4. 💰 Funding & Investment */}
                                {fundingResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-emerald-100/40 via-teal-50/20 to-cyan-100/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-emerald-500 pl-3">
                                            <Award className="text-emerald-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">💰 Funding & Investment</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={fundingResources} 
                                            direction="right" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 5. 📈 Startup Growth */}
                                {growthResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-indigo-100/40 via-purple-50/30 to-indigo-50/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-indigo-500 pl-3">
                                            <TrendingUp className="text-indigo-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">📈 Startup Growth</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={growthResources} 
                                            direction="left" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 6. 🤖 AI Startups */}
                                {aiResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-cyan-100/50 via-purple-50/30 to-indigo-100/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-cyan-500 pl-3">
                                            <Sparkles className="text-cyan-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-655">🤖 AI Startups</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={aiResources} 
                                            direction="right" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 7. 🏛 Startup India & Government Schemes */}
                                {govtResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-emerald-100/50 via-teal-50/30 to-emerald-50/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-emerald-500 pl-3">
                                            <Award className="text-emerald-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">🏛 Startup India & Government Schemes</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={govtResources} 
                                            direction="left" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 8. 📚 Founder Guides */}
                                {guidesResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-indigo-100/50 via-blue-50/30 to-indigo-50/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-indigo-500 pl-3">
                                            <FileText className="text-indigo-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">📚 Founder Guides</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={guidesResources} 
                                            direction="right" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 9. 🎯 Product & Marketing */}
                                {productMarketingResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-sky-100/50 via-pink-50/20 to-purple-100/20 rounded-[32px] p-6 border border-white/60 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-sky-500 pl-3">
                                            <Sparkles className="text-sky-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">🎯 Product & Marketing</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={productMarketingResources} 
                                            direction="left" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                                {/* 10. 💼 Hiring & Team Building */}
                                {hiringResources.length > 0 && (
                                    <div className="relative bg-gradient-to-br from-slate-100 via-slate-50/50 to-zinc-100/30 rounded-[32px] p-6 border border-slate-200 shadow-md overflow-hidden">
                                        <div className="flex items-center gap-2 mb-4 border-l-3 border-slate-550 pl-3">
                                            <HelpCircle className="text-slate-600" size={18} />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-605">💼 Hiring & Team Building</h3>
                                        </div>
                                        <MarqueeRow 
                                            items={hiringResources} 
                                            direction="right" 
                                            onBookmark={handleBookmark} 
                                            onShare={handleShare} 
                                            onPreview={setPreviewResource} 
                                            copiedId={copiedId} 
                                            navigate={navigate} 
                                        />
                                    </div>
                                )}

                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* 📬 NEWSLETTER BLOCK (Blue -> Pink Gradient) */}
            <div className="bg-gradient-to-r from-blue-50 via-pink-50/40 to-purple-50 py-16 border-t border-slate-150 mt-16 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-805">Founder Knowledge Ledger Sync</h3>
                    <p className="text-slate-505 text-xs sm:text-sm font-medium max-w-lg mx-auto">Get instant notifications on new Y Combinator posts, Microsoft cloud guidelines, and Government MSME fund releases.</p>
                    
                    {subscribed ? (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-4 bg-emerald-50 border border-emerald-205 rounded-2xl text-emerald-600 text-sm font-bold inline-block"
                        >
                            ✓ Subscribed successfully! You have joined our builder community.
                        </motion.div>
                    ) : (
                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                            <input
                                type="email"
                                required
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Enter your email address..."
                                className="w-full bg-white border border-slate-205 rounded-2xl py-3.5 px-5 text-slate-805 outline-none focus:border-indigo-505 text-sm font-bold shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="py-3.5 px-6 rounded-2xl bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer shadow-md shadow-indigo-650/15"
                            >
                                {isSubscribing ? 'Joining...' : 'Subscribe'}
                            </button>
                        </form>
                    )}
                </div>
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
                            className="bg-white border border-slate-205 rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-2xl text-center space-y-4"
                        >
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>

                            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-605">
                                <Sparkles size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-850">Unlock Full Features</h3>
                            <p className="text-slate-550 text-sm font-medium leading-relaxed">
                                {authModalReason || 'Bookmark resources, rate guides, and participate in founder review discussions.'}
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-605/15"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-205 transition-all cursor-pointer"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🔍 QUICK PREVIEW DRAWER */}
            <AnimatePresence>
                {previewResource && (
                    <div className="fixed inset-0 z-[190] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewResource(null)}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white border-l border-slate-200/80 h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                                        {previewResource.category}
                                    </span>
                                    <button
                                        onClick={() => setPreviewResource(null)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-450 hover:text-slate-700"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Source badge */}
                                <div className="flex items-center gap-2">
                                    {previewResource.source_logo ? (
                                        <img src={previewResource.source_logo} alt={previewResource.source_name} className="w-5 h-5 rounded-full object-contain" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-slate-150 flex items-center justify-center text-xs font-bold">S</div>
                                    )}
                                    <span className="text-xs font-black text-slate-500 uppercase">{previewResource.source_name}</span>
                                </div>

                                <h2 className="text-2xl font-black text-slate-850 leading-tight">
                                    {previewResource.title}
                                </h2>

                                <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                                    <span>Author: {previewResource.author}</span>
                                    <span>•</span>
                                    <span>Published: {formatDate(previewResource.publish_date)}</span>
                                    <span>•</span>
                                    <span>Type: {previewResource.resource_type}</span>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <FileText size={12} className="text-slate-500" />
                                        <span>Summary Outline</span>
                                    </h4>
                                    <p className="text-slate-606 text-xs sm:text-sm font-medium leading-relaxed">
                                        {previewResource.short_summary}
                                    </p>
                                </div>

                                <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-2">
                                    <h4 className="text-xs font-bold text-slate-750">Original Resource Link</h4>
                                    <p className="text-xs text-slate-400 font-medium">Read the original posting directly on the verified host portal.</p>
                                    <a
                                        href={previewResource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-650 hover:text-indigo-600 font-bold flex items-center gap-1 pt-1.5"
                                    >
                                        <span>Read at {previewResource.source_name}</span>
                                        <ArrowUpRight size={13} />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 mt-8 flex gap-3">
                                <a
                                    href={previewResource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-grow py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-extrabold uppercase tracking-widest text-center shadow-md shadow-indigo-650/15 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>Read Full Article</span>
                                    <ExternalLink size={13} />
                                </a>
                                <button
                                    onClick={() => setPreviewResource(null)}
                                    className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-150 text-slate-600 text-xs font-extrabold uppercase border border-slate-205 transition-all cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default StartupResourcesLibrary;
