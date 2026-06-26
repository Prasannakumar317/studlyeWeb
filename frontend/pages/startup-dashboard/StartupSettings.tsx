import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Bell, Lock, Mail, CreditCard, Rocket, CheckCircle2, Phone } from 'lucide-react';
import StartupProfile from './StartupProfile';

interface StartupSettingsProps {
    institutionId: string;
    onProfileUpdate?: () => void;
}

const StartupSettings: React.FC<StartupSettingsProps> = ({ institutionId, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'team'>('profile');
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    // Notification states
    const [notifState, setNotifState] = useState({
        appReceived: true,
        investorInterest: true,
        mentorRequest: true,
        feedInteraction: false,
        marketing: false
    });

    const handleSaveNotif = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 font-sans pb-10 text-left max-w-5xl mx-auto relative"
        >
            <div>
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    Startup Settings <Settings className="text-[#EC4899] animate-pulse" size={22} />
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                    Manage your recruitment dashboard, login credentials, advisor communications, and billing settings.
                </p>
            </div>

            {/* Save Toast */}
            <AnimatePresence>
                {saveSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm"
                    >
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        ✓ Configurations successfully updated and locked.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inner Nav */}
            <div className="flex border-b border-slate-100 gap-1 overflow-x-auto no-scrollbar">
                {[
                    { id: 'profile', label: 'Startup Profile', icon: Rocket },
                    { id: 'account', label: 'Security & Access', icon: Shield },
                    { id: 'notifications', label: 'Notifications Toggles', icon: Bell },
                    { id: 'team', label: 'Plan & Billing', icon: CreditCard }
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-3.5 border-none bg-transparent font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer relative ${
                                isActive ? 'text-pink-600 font-black' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                            {isActive && (
                                <motion.div 
                                    layoutId="settingsActiveTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EC4899] z-10"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 p-8">
                {activeTab === 'profile' && (
                    <StartupProfile institutionId={institutionId} onProfileUpdate={onProfileUpdate} />
                )}

                {activeTab === 'account' && (
                    <form className="space-y-6 max-w-3xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Update Security Credentials</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500">Security Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="email" defaultValue="admin@acme.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500">Workspace Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" defaultValue="+91 99999 88888" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="password" placeholder="••••••••••••" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="password" placeholder="••••••••••••" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-pink-500 focus:bg-white transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button" 
                                onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }} 
                                className="px-6 py-3 bg-[#EC4899] text-white rounded-2xl text-xs font-black shadow-lg shadow-pink-500/20 border-none cursor-pointer"
                            >
                                Save Security Credentials
                            </motion.button>
                        </div>
                    </form>
                )}

                {activeTab === 'notifications' && (
                    <form onSubmit={handleSaveNotif} className="space-y-6 max-w-3xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Notification Delivery Options</span>

                        <div className="space-y-4">
                            {[
                                { key: 'appReceived', label: 'Candidate Application Submissions', desc: 'Alert me instantly via email when a student applies for a job listing.' },
                                { key: 'investorInterest', label: 'Investor Connection Outreach', desc: 'Trigger notifications when VC or Angels request to view pitch books.' },
                                { key: 'mentorRequest', label: 'Advisor Recommendation Alerts', desc: 'Send summary updates when certified mentors offer office hours.' },
                                { key: 'feedInteraction', label: 'Feed Interaction Likes & Comments', desc: 'Send summary of comments and likes on broadcast feed updates.' }
                            ].map((toggle) => (
                                <div key={toggle.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <div className="text-left pr-4">
                                        <p className="font-bold text-slate-900 text-xs">{toggle.label}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{toggle.desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNotifState(prev => ({ ...prev, [toggle.key]: !prev[toggle.key as keyof typeof prev] }))}
                                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer border-none relative flex items-center p-0.5 ${
                                            notifState[toggle.key as keyof typeof notifState] ? 'bg-[#EC4899]' : 'bg-slate-350'
                                        }`}
                                    >
                                        <motion.div 
                                            layout
                                            className="w-5 h-5 bg-white rounded-full shadow-sm" 
                                            animate={{ x: notifState[toggle.key as keyof typeof notifState] ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                className="px-6 py-3 bg-[#EC4899] text-white rounded-2xl text-xs font-black shadow-lg shadow-pink-500/20 border-none cursor-pointer"
                            >
                                Save Notification Prefs
                            </motion.button>
                        </div>
                    </form>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-6 text-left max-w-3xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Active Workspace Plan</span>

                        <div className="p-6 bg-gradient-to-br from-pink-500/5 to-rose-500/5 border border-pink-100 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-black text-[#EC4899] text-sm uppercase tracking-wider">Premium Founder Pro</h4>
                                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Full VCs outreach & hiring dashboard activated</p>
                                </div>
                                <span className="px-3 py-1.5 bg-white text-[#EC4899] text-[9px] font-black rounded-lg uppercase tracking-wide shadow-sm border border-solid border-pink-100">Active</span>
                            </div>

                            <div className="h-px bg-pink-100/50" />

                            <div className="flex justify-between text-xs font-bold text-slate-650">
                                <span>Employer Credit Balance</span>
                                <span className="text-[#EC4899] font-black text-sm">5,000 Credits</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-4">Billing Address & Invoice Info</span>
                            <div className="p-4 border border-slate-200 border-solid rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50/50">
                                <span>Acme Corp Inc. • Bangalore office</span>
                                <button className="text-pink-500 hover:text-[#EC4899] border-none bg-transparent cursor-pointer font-black text-xs transition-colors">Update Address</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StartupSettings;
