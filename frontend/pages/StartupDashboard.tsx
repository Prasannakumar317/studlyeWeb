import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Loader2 } from 'lucide-react';
import StartupSidebar from '../components/startup/StartupSidebar';
import StartupNavbar from '../components/startup/StartupNavbar';
import { institutionIdFromUser } from '../utils/institutionScope';

// Lazy load the independent Startup sub-pages
const StartupHome = lazy(() => import('./startup-dashboard/StartupHome'));
const StartupProfile = lazy(() => import('./startup-dashboard/StartupProfile'));
const StartupOpportunities = lazy(() => import('./startup-dashboard/StartupOpportunities'));
const StartupApplications = lazy(() => import('./startup-dashboard/StartupApplications'));
const InvestorCenter = lazy(() => import('./startup-dashboard/InvestorCenter'));
const MentorCenter = lazy(() => import('./startup-dashboard/MentorCenter'));
const CollaborationHub = lazy(() => import('./startup-dashboard/CollaborationHub'));
const StartupFeed = lazy(() => import('./startup-dashboard/StartupFeed'));
const StartupMessages = lazy(() => import('./startup-dashboard/StartupMessages'));
const StartupNotifications = lazy(() => import('./startup-dashboard/StartupNotifications'));
const StartupAnalytics = lazy(() => import('./startup-dashboard/StartupAnalytics'));
const StartupSettings = lazy(() => import('./startup-dashboard/StartupSettings'));
const StartupIdeaValidator = lazy(() => import('./startup-dashboard/StartupIdeaValidator'));
const StartupRoadmap = lazy(() => import('./startup-dashboard/StartupRoadmap'));

const TabLoader = () => (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-sans">
        <Loader2 className="animate-spin text-pink-500 mb-3" size={28} />
        <span className="text-xs font-bold text-slate-500">Syncing dashboard configurations...</span>
    </div>
);

const StartupDashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);

    // Handle URL-based navigation to set active tab
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/profile')) {
            setActiveTab('profile');
        } else if (path.includes('/opportunities')) {
            setActiveTab('opportunities');
        } else if (path.includes('/applications')) {
            setActiveTab('applications');
        } else if (path.includes('/investors')) {
            setActiveTab('investors');
        } else if (path.includes('/mentors')) {
            setActiveTab('mentors');
        } else if (path.includes('/collaborations')) {
            setActiveTab('collaborations');
        } else if (path.includes('/feed')) {
            setActiveTab('feed');
        } else if (path.includes('/messages')) {
            setActiveTab('messages');
        } else if (path.includes('/notifications')) {
            setActiveTab('notifications');
        } else if (path.includes('/analytics')) {
            setActiveTab('analytics');
        } else if (path.includes('/validator')) {
            setActiveTab('validator');
        } else if (path.includes('/roadmap')) {
            setActiveTab('roadmap');
        } else if (path.includes('/settings')) {
            setActiveTab('settings');
        } else {
            setActiveTab('dashboard');
        }
    }, [location.pathname]);

    // Update URL when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const basePath = '/startup-dashboard';
        const tabPath = tab === 'dashboard' ? basePath : `${basePath}/${tab}`;
        navigate(tabPath, { replace: true });
    };

    const institutionId = institutionIdFromUser(user);

    const handleProfileUpdate = () => {
        setProfileRefreshTrigger(prev => prev + 1);
    };

    const renderContent = () => {
        if (!institutionId) {
            return (
                <div className="p-8 max-w-lg mx-auto rounded-[2.5rem] border border-pink-100 bg-white shadow-2xl flex flex-col items-center justify-center text-center space-y-5">
                    <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center border border-pink-100 shadow-inner">
                        <Building2 size={32} className="text-[#EC4899]" />
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Startup Setup Required</h3>
                        <p className="text-slate-500 font-semibold text-xs leading-relaxed max-w-sm">
                            Your startup account needs to be configured by the system administrator. Please reach out to support.
                        </p>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'profile':
                return <StartupProfile institutionId={institutionId} onProfileUpdate={handleProfileUpdate} />;
            case 'opportunities':
                return <StartupOpportunities institutionId={institutionId} />;
            case 'applications':
                return <StartupApplications institutionId={institutionId} onNavigateToMessages={(uid) => handleTabChange(`messages?chat=${uid}`)} />;
            case 'investors':
                return <InvestorCenter />;
            case 'mentors':
                return <MentorCenter />;
            case 'collaborations':
                return <CollaborationHub />;
            case 'feed':
                return <StartupFeed />;
            case 'messages': {
                const queryParams = new URLSearchParams(location.search);
                const chatUser = queryParams.get('chat') || undefined;
                return <StartupMessages initialReceiverId={chatUser} />;
            }
            case 'notifications':
                return <StartupNotifications />;
            case 'analytics':
                return <StartupAnalytics institutionId={institutionId} />;
            case 'validator':
                return <StartupIdeaValidator />;
            case 'roadmap':
                return <StartupRoadmap />;
            case 'settings':
                return <StartupSettings institutionId={institutionId} onProfileUpdate={handleProfileUpdate} />;
            case 'dashboard':
            default:
                return (
                    <StartupHome 
                        institutionId={institutionId} 
                        onNavigate={handleTabChange} 
                        onCreateOpportunity={() => handleTabChange('opportunities')}
                    />
                );
        }
    };

    return (
        <div className="h-screen bg-[#FBFDFE] flex overflow-hidden font-sans relative">
            {/* Ambient background meshes */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/5 via-transparent to-transparent blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-64 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

            <div className="shrink-0 relative z-10">
                <StartupSidebar 
                    activeTab={activeTab} 
                    onTabChange={handleTabChange} 
                    onPost={() => handleTabChange('opportunities')}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
                <StartupNavbar 
                    refreshKey={profileRefreshTrigger}
                    onNavigate={handleTabChange}
                    onNavigateToSettings={() => handleTabChange('settings')}
                />
                
                <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 mt-2">
                    <div className="max-w-[1400px] mx-auto py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                <Suspense fallback={<TabLoader />}>{renderContent()}</Suspense>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StartupDashboard;
