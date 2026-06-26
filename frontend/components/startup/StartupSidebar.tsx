import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { 
    LayoutDashboard, 
    Rocket,
    Briefcase, 
    Users, 
    Settings,
    Plus,
    DollarSign,
    UserCheck,
    Share2,
    Newspaper,
    MessageSquare,
    Bell,
    TrendingUp,
    Lightbulb,
    Route
} from 'lucide-react';

interface StartupSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onPost: () => void;
}

const sidebarItems = [
    { id: 'dashboard', label: 'Startup Home', icon: LayoutDashboard },
    { id: 'profile', label: 'Startup Profile', icon: Rocket },
    { id: 'roadmap', label: 'Venture Roadmap', icon: Route },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: Users },
    { id: 'investors', label: 'Investor Center', icon: DollarSign },
    { id: 'mentors', label: 'Mentor Center', icon: UserCheck },
    { id: 'collaborations', label: 'Collaboration Hub', icon: Share2 },
    { id: 'feed', label: 'Startup Feed', icon: Newspaper },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'validator', label: 'Idea Validator', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const StartupSidebar: React.FC<StartupSidebarProps> = ({ activeTab, onTabChange, onPost }) => {
    const navigate = useNavigate();

    return (
        <div className="w-64 h-screen bg-[#090D16] border-r border-slate-900/60 flex flex-col shrink-0 sticky top-0 overflow-hidden z-20 font-sans shadow-2xl">
            {/* Header logo area */}
            <div className="p-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#FF5B5B] flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:rotate-6 transition-transform duration-300">
                        <Rocket size={18} className="text-white" />
                    </div>
                    <span className="font-black text-slate-100 tracking-wider text-sm uppercase">Studlyf Hub</span>
                </div>
            </div>

            {/* CTA action block */}
            <div className="px-4 mb-4 mt-2">
                <motion.button 
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onPost}
                    className="w-full py-3 bg-gradient-to-r from-[#EC4899] to-[#FF5B5B] text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all text-xs border-none cursor-pointer tracking-wider uppercase"
                >
                    <Plus size={16} />
                    Post Hiring Listing
                </motion.button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-2">
                {sidebarItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-left whitespace-nowrap text-xs border-none cursor-pointer relative overflow-hidden group ${
                                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100 bg-transparent'
                            }`}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="sidebarActiveBackground"
                                    className="absolute inset-0 bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-transparent border-l-2 border-[#EC4899]"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                            <item.icon size={16} className={`relative z-10 ${isActive ? 'text-[#EC4899] scale-110' : 'text-slate-400 group-hover:text-slate-100'} transition-all`} />
                            <span className="relative z-10">{item.label}</span>
                        </motion.button>
                    );
                })}
            </nav>

            {/* Bottom Support Widget */}
            <div className="p-4 mt-auto border-t border-slate-900 bg-[#070A11]/60">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
                    <p className="text-[9px] font-black text-[#EC4899] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#EC4899] rounded-full animate-ping" />
                        Employer Support
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mb-2.5">Need help recruiting tech talent? Ask our help desk.</p>
                    <a 
                        href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'employers@studlyf.com'}`}
                        className="text-[10px] font-black text-[#EC4899] hover:text-pink-400 hover:underline transition-colors block"
                    >
                        Hiring Help desk →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default StartupSidebar;
