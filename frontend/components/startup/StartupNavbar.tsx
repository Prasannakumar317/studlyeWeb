import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { Bell, Search, LogOut, Zap, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { institutionIdFromUser } from '../../utils/institutionScope';

interface StartupNavbarProps {
    refreshKey?: number;
    onNavigate?: (tab: string) => void;
    onNavigateToSettings?: () => void;
}

const StartupNavbar: React.FC<StartupNavbarProps> = ({ refreshKey, onNavigate, onNavigateToSettings }) => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    const displayName = user?.institution_name || user?.full_name || 'Startup Portal';
    const institutionId = institutionIdFromUser(user);
    
    const [notifCount, setNotifCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [imgError, setImgError] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const query = searchQuery.toLowerCase().trim();
            const navMap: {[key: string]: string} = {
                'settings': 'settings',
                'profile': 'profile',
                'startup profile': 'profile',
                'dashboard': 'dashboard',
                'startup home': 'dashboard',
                'opportunities': 'opportunities',
                'applications': 'applications',
                'investors': 'investors',
                'investor center': 'investors',
                'mentors': 'mentors',
                'mentor center': 'mentors',
                'collaborations': 'collaborations',
                'collaboration hub': 'collaborations',
                'feed': 'feed',
                'startup feed': 'feed',
                'messages': 'messages',
                'notifications': 'notifications',
                'analytics': 'analytics',
            };

            if (navMap[query]) {
                if (onNavigate) {
                    onNavigate(navMap[query]);
                }
                setSearchQuery('');
                return;
            }
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            if (role !== 'startup') return;
            try {
                const endpoint = `${API_BASE_URL}/api/v1/startup/notifications`;
                const res = await fetch(endpoint, {
                    headers: { ...authHeaders() }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                    setNotifCount(data.filter((n: any) => n.unread !== false).length);
                }
            } catch (err: any) { 
                setNotifications([]);
                setNotifCount(0);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, [role]);

    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            const pages = [
                { id: 'dashboard', title: 'Startup Home', type: 'Page', link: '#' },
                { id: 'profile', title: 'Startup Profile', type: 'Page', link: '#' },
                { id: 'opportunities', title: 'Opportunities', type: 'Page', link: '#' },
                { id: 'applications', title: 'Applications', type: 'Page', link: '#' },
                { id: 'investors', title: 'Investor Center', type: 'Page', link: '#' },
                { id: 'mentors', title: 'Mentor Center', type: 'Page', link: '#' },
                { id: 'collaborations', title: 'Collaboration Hub', type: 'Page', link: '#' },
                { id: 'feed', title: 'Startup Feed', type: 'Page', link: '#' },
                { id: 'messages', title: 'Messages', type: 'Page', link: '#' },
                { id: 'notifications', title: 'Notifications', type: 'Page', link: '#' },
                { id: 'analytics', title: 'Analytics', type: 'Page', link: '#' },
                { id: 'settings', title: 'Settings', type: 'Page', link: '#' },
            ];

            if (searchQuery.length < 2) {
                setSearchResults(pages);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/institution/search?q=${searchQuery}&institution_id=${institutionId}`, {
                    headers: { ...authHeaders() },
                });
                let data = [];
                if (res.ok) {
                    data = await res.json();
                }
                const matchedPages = pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
                setSearchResults([...matchedPages, ...data]);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        };
        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, institutionId]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!institutionId) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/institution/startup-profile-public/${institutionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setImgError(false);
                }
            } catch (err) {
                setProfile(null);
            }
        };
        fetchProfile();
    }, [institutionId, refreshKey]);

    const resolveMediaUrl = (url?: string | null) => {
        if (!url) return '';
        if (url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
        return url;
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleMarkAllAsRead = async () => {
        try {
            setNotifications([]);
            setNotifCount(0);
            const endpoint = institutionId
                ? `${API_BASE_URL}/api/v1/institution/notifications/${institutionId}/mark-read`
                : `${API_BASE_URL}/api/v1/institution/notifications/me/mark-read`;
            await fetch(endpoint, {
                method: 'POST',
                headers: { ...authHeaders() },
            });
        } catch (err) {
            console.error("Mark all as read failed", err);
        }
    };

    return (
        <div className="w-full font-sans px-6 pt-4 relative z-30">
            <motion.div 
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-white/80 backdrop-blur-xl border border-slate-100/80 h-16 rounded-2xl shadow-xl shadow-slate-100/40 flex items-center px-6"
            >
                {/* Search query box */}
                <div className="flex-1 max-w-lg relative z-10 hidden md:block">
                    <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-[#EC4899] transition-colors" size={16} />
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search workspace components... (Ctrl+K)" 
                            className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#EC4899]/60 focus:ring-1 focus:ring-[#EC4899]/30 transition-all font-semibold text-xs shadow-inner"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                            ⌘K
                        </span>
 
                        <AnimatePresence>
                            {isSearchFocused && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl overflow-hidden p-2.5 border border-slate-100 z-50 text-left"
                                >
                                    {searchResults.length > 0 ? (
                                        <div className="space-y-0.5">
                                            {searchResults.map((result, idx) => (
                                                <button 
                                                    key={`${result.id}-${idx}`}
                                                    onClick={() => {
                                                        if (result.id === 'settings' && onNavigateToSettings) {
                                                            onNavigateToSettings();
                                                        } else if (result.type === 'Page' && onNavigate) {
                                                            onNavigate(result.id);
                                                        } else {
                                                            navigate(result.link);
                                                        }
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all text-left group border-none bg-transparent cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-pink-50 text-[#EC4899] rounded-lg flex items-center justify-center shadow-xs">
                                                            <Zap size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-xs">{result.title}</p>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{result.type}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="text-slate-300 group-hover:text-[#EC4899] group-hover:translate-x-0.5 transition-all" size={14} />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 italic text-xs">
                                            No matching results found...
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Side Icons Info */}
                <div className="flex items-center gap-4 relative z-10 shrink-0 ml-auto" ref={notifRef}>
                    
                    {/* Notifications bell */}
                    <div className="relative">
                        <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all border-none cursor-pointer"
                        >
                            <Bell size={18} className={`${isNotifOpen ? 'fill-slate-500' : ''}`} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center text-[8.5px] font-black text-white animate-pulse">
                                    {notifCount}
                                </span>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left"
                                >
                                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-widest text-[9px]">Notifications</p>
                                            <p className="text-[9px] text-[#EC4899] font-bold mt-0.5">Real-time alerts</p>
                                        </div>
                                        <div className="px-2.5 py-1 bg-pink-50 border border-pink-100 text-[#EC4899] rounded-lg text-[9px] font-black shadow-xs">
                                            {notifCount} unread
                                        </div>
                                    </div>

                                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2">
                                        {notifications.length > 0 ? (
                                            <div className="space-y-1">
                                                {notifications.map((n, idx) => (
                                                    <div 
                                                        key={n.id || idx}
                                                        className="p-3.5 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group/item flex gap-3 border border-transparent hover:border-slate-100"
                                                    >
                                                        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:bg-pink-50 group-hover/item:text-[#EC4899] shrink-0 border border-slate-100">
                                                            <Zap size={14} className="group-hover/item:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-slate-800 leading-normal group-hover/item:text-slate-950">
                                                                {n.message || 'New workspace alert logged'}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                                                                <Clock size={10} />
                                                                <p className="text-[8.5px] font-bold uppercase tracking-wider">{n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-slate-400">
                                                <Bell size={28} className="mx-auto text-slate-200 mb-2" />
                                                <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Workspace Clear</p>
                                                <p className="text-[10px] text-slate-400 mt-1">No alerts pending review.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {notifications.length > 0 && (
                                        <button 
                                            onClick={handleMarkAllAsRead}
                                            className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-[9px] font-black text-[#EC4899] uppercase tracking-widest transition-all border-t border-slate-100 border-none cursor-pointer"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile avatar & Logout */}
                    <div 
                        onClick={onNavigateToSettings}
                        className="flex items-center gap-2 p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-full transition-all cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-full bg-pink-50 text-[#EC4899] font-black shadow-inner overflow-hidden shrink-0 flex items-center justify-center text-xs border border-white">
                             {profile?.logo_url && !imgError ? (
                                <img
                                    src={resolveMediaUrl(profile.logo_url)}
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                             ) : (
                                displayName.charAt(0).toUpperCase()
                             )}
                        </div>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block mx-0.5" />
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLogout();
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors bg-transparent border-none cursor-pointer"
                            title="Sign Out"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StartupNavbar;
