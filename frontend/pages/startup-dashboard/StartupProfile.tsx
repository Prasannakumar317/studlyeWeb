import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, Plus, Trash2, Building2, Globe, Mail, Phone, Rocket, 
    Save, FileText, Target, Code, Users, Coins, Loader2, 
    Share2, ExternalLink, Calendar, MapPin, Eye, Award, Check, X, ArrowUpRight, 
    MessageSquare, Sparkles, CheckCircle, Edit2, ShieldAlert, TrendingUp
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface Founder {
    name: string;
    photo_url: string;
    bio: string;
    role?: string;
    linkedin?: string;
}

interface TeamMember {
    name: string;
    role: string;
    skills: string;
}

interface Opportunity {
    _id?: string;
    id?: string;
    title: string;
    type: string;
    description: string;
    requirements: string;
    experienceRequired: string;
    locationType: 'On-site' | 'Remote' | 'Hybrid';
    location: string;
    salaryMin: string;
    salaryMax: string;
    equity: string;
    skills: string[];
    deadline: string;
    status: 'active' | 'draft' | 'closed' | 'archived';
}

interface Applicant {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
    event_title: string; // Hydrated by backend to show opportunity title
    status: 'pending' | 'accepted' | 'rejected' | 'shortlisted';
    registered_at?: string;
    resume_url?: string;
    portfolio_url?: string;
    linkedin_url?: string;
    skills?: string;
    opportunity_id?: string;
    user_id?: string;
}

interface StartupProfileState {
  _id?: string;
  institution_id?: string;
  company_name: string;
  tagline: string;
  description: string;
  logo_url: string;
  hero_image_url: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  founded_year?: number;
  team_size?: string;
  stage: 'Pre-seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Growth' | 'Public';
  industry: string;
  pitch: string;
  
  // Showcase section details
  problem_statement: string;
  solution: string;
  mission: string;
  vision: string;
  target_market: string;

  // Product section details
  product_name: string;
  product_description: string;
  product_screenshots: string[];
  product_demo_video: string;
  tech_stack: string;

  // Funding details
  funding_requirement: string;
  investment_status: string;

  // Gallery
  gallery_product: string[];
  gallery_team: string[];
  gallery_event: string[];
  gallery_office: string[];

  // Founders & Team Lists
  founders: Founder[];
  team_members: TeamMember[];
  
  social?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

const OPPORTUNITY_CATEGORIES = [
    'Hiring: Full Stack Developer',
    'Hiring: AI Engineer',
    'Hiring: UI/UX Designer',
    'Hiring: Marketing Executive',
    'Internship: Software',
    'Internship: Marketing',
    'Internship: Design',
    'Investor Requirement: Angel Investor',
    'Investor Requirement: Seed Funding',
    'Investor Requirement: Strategic Investor',
    'Mentor Requirement: Technical Mentor',
    'Mentor Requirement: Business Mentor',
    'Mentor Requirement: Marketing Mentor',
    'Collaboration Requirement: Startup Partner',
    'Collaboration Requirement: Research Collaboration',
    'Collaboration Requirement: Product Collaboration'
];

const StartupProfile: React.FC<{ institutionId: string; onProfileUpdate?: () => void }> = ({ institutionId, onProfileUpdate }) => {
  const [profile, setProfile] = useState<StartupProfileState>({
    company_name: '',
    tagline: '',
    description: '',
    logo_url: '',
    hero_image_url: '',
    website: '',
    email: '',
    phone: '',
    location: 'Bangalore, India',
    founded_year: new Date().getFullYear(),
    team_size: '1-10',
    stage: 'Seed',
    industry: '',
    pitch: '',
    
    problem_statement: '',
    solution: '',
    mission: '',
    vision: '',
    target_market: '',

    product_name: '',
    product_description: '',
    product_screenshots: [],
    product_demo_video: '',
    tech_stack: '',

    funding_requirement: '',
    investment_status: 'Not Funding',

    gallery_product: [],
    gallery_team: [],
    gallery_event: [],
    gallery_office: [],

    founders: [{ name: '', photo_url: '', bio: '', linkedin: '' }],
    team_members: [{ name: '', role: '', skills: '' }],
    social: {
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'showcase' | 'opportunities' | 'applicants' | 'stats'>('showcase');
  
  // Opportunities & Applicants state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [oppLoading, setOppLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Opportunity form modal states
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [oppFormLoading, setOppFormLoading] = useState(false);
  const [oppForm, setOppForm] = useState<{
      title: string;
      type: string;
      description: string;
      requirements: string;
      experienceRequired: string;
      locationType: 'On-site' | 'Remote' | 'Hybrid';
      location: string;
      salaryMin: string;
      salaryMax: string;
      equity: string;
      skills: string[];
      skillInput: string;
      deadline: string;
      status: 'active' | 'draft' | 'closed' | 'archived';
  }>({
      title: '',
      type: OPPORTUNITY_CATEGORIES[0],
      description: '',
      requirements: '',
      experienceRequired: 'Fresher',
      locationType: 'On-site',
      location: '',
      salaryMin: '',
      salaryMax: '',
      equity: '',
      skills: [],
      skillInput: '',
      deadline: '',
      status: 'active'
  });

  // Copied Link alert
  const [copiedLink, setCopiedLink] = useState(false);

  // Ref fields for image uploader
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');
  const [tempGalleryType, setTempGalleryType] = useState<'product' | 'team' | 'event' | 'office'>('product');

  useEffect(() => {
    fetchProfile();
    fetchOpportunities();
    fetchApplicants();
    fetchAnalytics();
  }, [institutionId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/institution/startup-profile/${institutionId}`, {
        headers: authHeaders()
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({ 
          ...prev, 
          ...data,
          founders: data.founders || prev.founders || [],
          team_members: data.team_members || prev.team_members || [],
          gallery_product: data.gallery_product || [],
          gallery_team: data.gallery_team || [],
          gallery_event: data.gallery_event || [],
          gallery_office: data.gallery_office || [],
          product_screenshots: data.product_screenshots || [],
          social: {
            linkedin: data.social?.linkedin || '',
            twitter: data.social?.twitter || '',
            instagram: data.social?.instagram || '',
          }
        }));
      } else if (res.status === 404) {
        setProfile(prev => ({ ...prev, institution_id: institutionId }));
      }
    } catch (err) {
      console.error('[StartupProfile] fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
      try {
          setOppLoading(true);
          const res = await fetch(`${API_BASE_URL}/api/opportunities/?institution_id=${institutionId}`, {
              headers: authHeaders()
          });
          if (res.ok) {
              const data = await res.json();
              setOpportunities(data);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setOppLoading(false);
      }
  };

  const fetchApplicants = async () => {
      try {
          setAppLoading(true);
          const res = await fetch(`${API_BASE_URL}/api/v1/institution/participants/${institutionId}`, {
              headers: authHeaders()
          });
          if (res.ok) {
              const data = await res.json();
              setApplicants(data.filter((item: any) => item.opportunity_id));
          }
      } catch (err) {
          console.error(err);
      } finally {
          setAppLoading(false);
      }
  };

  const fetchAnalytics = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/v1/startup/analytics/${institutionId}`, {
              headers: authHeaders()
          });
          if (res.ok) {
              const data = await res.json();
              setAnalytics(data);
          }
      } catch (err) {
          console.error(err);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingProfile(true);
      try {
          const { _id, ...cleanProfile } = profile;
          const res = await fetch(`${API_BASE_URL}/api/v1/institution/startup-profile`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({ ...cleanProfile, institution_id: institutionId })
          });
          if (res.ok) {
              setSaveSuccess(true);
              setIsEditModalOpen(false);
              fetchProfile();
              if (onProfileUpdate) onProfileUpdate();
              setTimeout(() => setSaveSuccess(false), 3000);
          } else {
              alert('Save profile failed.');
          }
      } catch (err) {
          alert('Network error.');
      } finally {
          setSavingProfile(false);
      }
  };

  // Opportunities Operations
  const handleOpenOppModal = (opp: Opportunity | null) => {
      if (opp) {
          setEditingOpp(opp);
          setOppForm({
              title: opp.title,
              type: opp.type || OPPORTUNITY_CATEGORIES[0],
              description: opp.description,
              requirements: opp.requirements,
              experienceRequired: opp.experienceRequired || 'Fresher',
              locationType: opp.locationType || 'On-site',
              location: opp.location || '',
              salaryMin: opp.salaryMin || '',
              salaryMax: opp.salaryMax || '',
              equity: opp.equity || '',
              skills: opp.skills || [],
              skillInput: '',
              deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
              status: opp.status || 'active'
          });
      } else {
          setEditingOpp(null);
          setOppForm({
              title: '',
              type: OPPORTUNITY_CATEGORIES[0],
              description: '',
              requirements: '',
              experienceRequired: 'Fresher',
              locationType: 'On-site',
              location: '',
              salaryMin: '',
              salaryMax: '',
              equity: '',
              skills: [],
              skillInput: '',
              deadline: '',
              status: 'active'
          });
      }
      setIsOppModalOpen(true);
  };

  const handleSaveOpp = async (e: React.FormEvent) => {
      e.preventDefault();
      setOppFormLoading(true);
      try {
          const payload = {
              title: oppForm.title,
              type: oppForm.type,
              description: oppForm.description,
              requirements: oppForm.requirements,
              experienceRequired: oppForm.experienceRequired,
              locationType: oppForm.locationType,
              location: oppForm.location,
              salaryMin: oppForm.salaryMin,
              salaryMax: oppForm.salaryMax,
              equity: oppForm.equity,
              skills: oppForm.skills,
              deadline: oppForm.deadline,
              status: oppForm.status,
              institution_id: institutionId
          };

          let res;
          if (editingOpp && editingOpp._id) {
              res = await fetch(`${API_BASE_URL}/api/opportunities/${editingOpp._id}`, {
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
              setIsOppModalOpen(false);
              fetchOpportunities();
              fetchAnalytics();
          } else {
              alert('Save failed.');
          }
      } catch (err) {
          alert('Error saving opportunity.');
      } finally {
          setOppFormLoading(false);
      }
  };

  const handleCloseOpp = async (oppId?: string) => {
      if (!oppId) return;
      try {
          const res = await fetch(`${API_BASE_URL}/api/opportunities/${oppId}/close`, {
              method: 'PATCH',
              headers: authHeaders()
          });
          if (res.ok) fetchOpportunities();
      } catch (err) {
          console.error(err);
      }
  };

  const handleDeleteOpp = async (oppId?: string) => {
      if (!oppId) return;
      if (!window.confirm('Delete this opportunity permanently?')) return;
      try {
          const res = await fetch(`${API_BASE_URL}/api/opportunities/${oppId}`, {
              method: 'DELETE',
              headers: authHeaders()
          });
          if (res.ok) {
              fetchOpportunities();
              fetchAnalytics();
          }
      } catch (err) {
          console.error(err);
      }
  };

  const handleApplicantStatus = async (app: Applicant, newStatus: 'accepted' | 'rejected' | 'shortlisted') => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/v1/institution/opportunity-applications/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({
                  institution_id: institutionId,
                  status: newStatus,
                  application_id: app._id,
                  user_id: app.user_id,
                  opportunity_id: app.opportunity_id
              })
          });
          if (res.ok) {
              fetchApplicants();
              fetchAnalytics();
          }
      } catch (err) {
          console.error(err);
      }
  };

  const handleCopyLink = () => {
      const publicUrl = `${window.location.origin}/#/startup/${institutionId}`;
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };

  const resolveUrl = (url?: string) => {
      if (!url) return '';
      if (url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
      return url;
  };

  // List management rows
  const addFounderRow = () => {
      setProfile(prev => ({ ...prev, founders: [...prev.founders, { name: '', photo_url: '', bio: '', linkedin: '' }] }));
  };
  const removeFounderRow = (idx: number) => {
      setProfile(prev => ({ ...prev, founders: prev.founders.filter((_, i) => i !== idx) }));
  };
  const updateFounderRow = (idx: number, key: keyof Founder, val: string) => {
      const updated = [...profile.founders];
      updated[idx] = { ...updated[idx], [key]: val };
      setProfile(prev => ({ ...prev, founders: updated }));
  };

  const addTeamRow = () => {
      setProfile(prev => ({ ...prev, team_members: [...prev.team_members, { name: '', role: '', skills: '' }] }));
  };
  const removeTeamRow = (idx: number) => {
      setProfile(prev => ({ ...prev, team_members: prev.team_members.filter((_, i) => i !== idx) }));
  };
  const updateTeamRow = (idx: number, key: keyof TeamMember, val: string) => {
      const updated = [...profile.team_members];
      updated[idx] = { ...updated[idx], [key]: val };
      setProfile(prev => ({ ...prev, team_members: updated }));
  };

  const addGalleryImage = () => {
      if (!tempGalleryUrl.trim()) return;
      const field = `gallery_${tempGalleryType}` as const;
      setProfile(prev => ({
          ...prev,
          [field]: [...(prev[field] as string[]), tempGalleryUrl.trim()]
      }));
      setTempGalleryUrl('');
  };

  const removeGalleryImage = (type: 'product' | 'team' | 'event' | 'office', idx: number) => {
      const field = `gallery_${type}` as const;
      setProfile(prev => ({
          ...prev,
          [field]: (prev[field] as string[]).filter((_, i) => i !== idx)
      }));
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-sans">
              <Loader2 className="animate-spin text-pink-500 mb-4" size={32} />
              <p className="font-bold text-slate-600">Accessing showcase registry...</p>
          </div>
      );
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8 font-sans pb-16 max-w-6xl mx-auto text-left relative"
    >
        {/* Header Cover Banner */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-slate-100/30">
            <div className="h-60 w-full overflow-hidden relative">
                <img 
                    src={resolveUrl(profile.hero_image_url) || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400'} 
                    alt="Cover Banner" 
                    className="w-full h-full object-cover brightness-[0.85]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-955/75 via-slate-900/30 to-transparent" />
            </div>

            {/* Profile Avatar & Primary Info Overlay */}
            <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row items-end gap-6 -mt-16 z-10">
                <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="w-32 h-32 bg-white border-4 border-white rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                >
                    {profile.logo_url ? (
                        <img src={resolveUrl(profile.logo_url)} alt="Logo" className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                        <Building2 size={48} className="text-[#EC4899]" />
                    )}
                </motion.div>

                <div className="flex-1 space-y-2.5 text-left">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{profile.company_name || 'My Startup'}</h2>
                        <span className="px-3 py-1 bg-pink-50 border border-pink-100 text-[#EC4899] text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                            {profile.stage}
                        </span>
                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                            {profile.industry || 'General Industry'}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold max-w-2xl leading-relaxed">{profile.tagline || 'Innovation and future widgets build.'}</p>
                    
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400 font-bold pt-1">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#EC4899]" /> {profile.location}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Est. {profile.founded_year}</span>
                        <span className="flex items-center gap-1.5"><Users size={14} /> {profile.team_size} Team size</span>
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#EC4899] hover:underline font-bold transition-all">
                                <Globe size={14} /> Website <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Cover Operations */}
                <div className="flex gap-2.5 shrink-0 mt-6 md:mt-0">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-black transition-all border border-solid border-slate-200 cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                        Edit Profile
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenOppModal(null)}
                        className="px-5 py-3 bg-gradient-to-r from-[#EC4899] to-[#FF5B5B] text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-pink-500/20 border-none cursor-pointer flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Opportunity
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyLink}
                        className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all border border-solid border-slate-200 cursor-pointer shadow-xs"
                        title="Copy Link to Share"
                    >
                        <Share2 size={16} />
                    </motion.button>
                </div>
            </div>
        </div>

        {/* Copy Link toast */}
        <AnimatePresence>
            {copiedLink && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-8 right-8 z-[200] p-4 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2"
                >
                    <CheckCircle size={16} className="text-emerald-400" />
                    Copied public profile link to clipboard!
                </motion.div>
            )}
        </AnimatePresence>

        {/* Sub-Navigation Tabs with animated slider indicator */}
        <div className="flex border-b border-slate-100 gap-1 overflow-x-auto no-scrollbar">
            {[
                { id: 'showcase', label: 'Company Showcase', icon: Rocket },
                { id: 'opportunities', label: 'Hiring & Postings', icon: FileText },
                { id: 'applicants', label: 'Applicants Review', icon: Users },
                { id: 'stats', label: 'Workspace Statistics', icon: TrendingUp }
            ].map(tab => {
                const isActive = activeWorkspaceTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveWorkspaceTab(tab.id as any)}
                        className={`px-5 py-3.5 border-none bg-transparent font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer relative ${
                            isActive ? 'text-pink-600 font-black' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                        {isActive && (
                            <motion.div 
                                layoutId="profileWorkspaceTabActiveIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EC4899] z-10"
                            />
                        )}
                    </button>
                );
            })}
        </div>

        <div className="space-y-8">
            <AnimatePresence mode="wait">
                {/* Showcase Tab */}
                {activeWorkspaceTab === 'showcase' && (
                    <motion.div
                        key="showcase"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-8">
                            {/* Bento About details */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left space-y-6">
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <Building2 size={16} className="text-[#EC4899]" /> About {profile.company_name || 'Startup'}
                                    </h3>
                                    <p className="text-slate-650 text-xs leading-relaxed font-semibold">
                                        {profile.description || 'Provide details about your startup in the editor.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100/60">
                                    <motion.div 
                                        whileHover={{ scale: 1.01 }}
                                        className="space-y-2 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl shadow-xs"
                                    >
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Target size={12} className="text-[#EC4899]" /> The Problem</span>
                                        <p className="text-slate-650 text-xs font-semibold leading-relaxed">{profile.problem_statement || 'N/A'}</p>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 1.01 }}
                                        className="space-y-2 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl shadow-xs"
                                    >
                                        <span className="text-[9px] font-black text-[#EC4899] uppercase tracking-widest flex items-center gap-1"><Sparkles size={12} className="text-[#EC4899]" /> The Solution</span>
                                        <p className="text-slate-655 text-xs font-semibold leading-relaxed">{profile.solution || 'N/A'}</p>
                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-slate-100/60">
                                    <motion.div 
                                        whileHover={{ scale: 1.01 }}
                                        className="space-y-2 p-4 bg-slate-50/30 border border-slate-100/80 rounded-2xl"
                                    >
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Our Mission</span>
                                        <p className="text-slate-600 text-[11px] font-semibold leading-relaxed">{profile.mission || 'N/A'}</p>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 1.01 }}
                                        className="space-y-2 p-4 bg-slate-50/30 border border-slate-100/80 rounded-2xl"
                                    >
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Our Vision</span>
                                        <p className="text-slate-600 text-[11px] font-semibold leading-relaxed">{profile.vision || 'N/A'}</p>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 1.01 }}
                                        className="space-y-2 p-4 bg-slate-50/30 border border-slate-100/80 rounded-2xl"
                                    >
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Market</span>
                                        <p className="text-slate-600 text-[11px] font-semibold leading-relaxed">{profile.target_market || 'N/A'}</p>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Product & Tech Stack */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left space-y-6">
                                <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Code size={16} className="text-[#EC4899]" /> Product & Tech Stack
                                </h3>

                                <div className="space-y-5">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{profile.product_name || 'Current Product Prototype'}</h4>
                                        <p className="text-slate-600 text-xs leading-relaxed mt-2 font-semibold">{profile.product_description || 'Product details not yet configured.'}</p>
                                    </div>

                                    {profile.tech_stack && (
                                        <div className="space-y-2 pt-2">
                                            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Technology Stack</span>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.tech_stack.split(',').map((tech, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 text-slate-655 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs">
                                                        {tech.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {profile.product_demo_video && (
                                        <div className="space-y-2 pt-2">
                                            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Demo Video Link</span>
                                            <motion.a 
                                                whileHover={{ scale: 1.015 }}
                                                whileTap={{ scale: 0.985 }}
                                                href={profile.product_demo_video} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="flex items-center gap-2.5 p-4 bg-slate-50 hover:bg-pink-50/20 rounded-2xl text-xs font-bold text-slate-700 hover:text-[#EC4899] border border-solid border-slate-200/50 transition-all no-underline w-fit shadow-xs"
                                            >
                                                <Rocket size={16} className="text-[#EC4899] animate-pulse" /> Open Video Presentation <ExternalLink size={10} />
                                            </motion.a>
                                        </div>
                                    )}

                                    {profile.product_screenshots && profile.product_screenshots.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            <span className="text-[9px] font-black text-slate-455 uppercase tracking-widest">Product Screenshots</span>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {profile.product_screenshots.map((shot, idx) => (
                                                    <motion.a 
                                                        whileHover={{ scale: 1.03 }}
                                                        key={idx} 
                                                        href={shot} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="rounded-2xl overflow-hidden border border-slate-100 h-28 block shadow-sm"
                                                    >
                                                        <img src={shot} alt={`Screenshot ${idx}`} className="w-full h-full object-cover transition-transform duration-300" />
                                                    </motion.a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Funding card */}
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left space-y-6">
                                <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-2">
                                    <Coins size={16} className="text-[#EC4899]" /> Funding Details
                                </h3>

                                <div className="space-y-4 text-xs">
                                    <div className="space-y-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-xs">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Funding Stage</span>
                                        <p className="font-bold text-slate-900 text-sm mt-0.5">{profile.stage} Round</p>
                                    </div>

                                    <div className="space-y-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-xs">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Ticket</span>
                                        <p className="font-black text-emerald-600 text-sm mt-0.5">{profile.funding_requirement || 'Not Disclosed'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Leadership Founders */}
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/20 text-left space-y-6">
                                <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-2">
                                    <Award size={16} className="text-[#EC4899]" /> Leadership Team
                                </h3>

                                <div className="space-y-4">
                                    {profile.founders.map((founder, idx) => (
                                        <motion.div 
                                            whileHover={{ scale: 1.01 }}
                                            key={idx} 
                                            className="flex gap-4 items-start p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/30 rounded-2.5rem transition-all shadow-xs"
                                        >
                                            <div className="w-12 h-12 bg-pink-50 text-[#EC4899] rounded-2xl overflow-hidden flex items-center justify-center font-black text-sm shrink-0 border border-slate-100 shadow-inner">
                                                {founder.photo_url ? (
                                                    <img src={founder.photo_url} alt={founder.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    founder.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <h4 className="font-black text-slate-900 text-xs">{founder.name}</h4>
                                                <p className="text-[10px] text-[#EC4899] font-black mt-0.5">{founder.role}</p>
                                                {founder.linkedin && (
                                                    <a href={founder.linkedin} target="_blank" rel="noreferrer" className="inline-block mt-2.5 text-[9px] font-black text-indigo-650 hover:underline">
                                                        LinkedIn Profile →
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Hiring Listings Tab */}
                {activeWorkspaceTab === 'opportunities' && (
                    <motion.div
                        key="opportunities"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hiring Board</h3>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOpenOppModal(null)}
                                className="px-5 py-3 bg-[#EC4899] text-white hover:bg-pink-600 rounded-2xl text-xs font-black shadow-lg shadow-pink-500/20 transition-all border-none cursor-pointer"
                            >
                                Publish Listing
                            </motion.button>
                        </div>

                        {oppLoading ? (
                            <div className="py-20 text-center text-slate-400 text-xs">
                                Loading listings...
                            </div>
                        ) : opportunities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                {opportunities.map(opp => (
                                    <motion.div 
                                        whileHover={{ y: -4, scale: 1.015 }}
                                        key={opp._id || opp.id} 
                                        className="p-6 bg-white border border-slate-100 hover:border-pink-200 rounded-[2.5rem] shadow-2xl shadow-slate-100/20 space-y-4 flex flex-col justify-between transition-all"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{opp.title}</h4>
                                                    <span className="inline-block px-3 py-1 bg-pink-50 border border-pink-100 text-[#EC4899] text-[9px] font-black rounded-lg uppercase tracking-wide">
                                                        {opp.type}
                                                    </span>
                                                </div>
                                                <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider shadow-xs ${
                                                    opp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                                                }`}>{opp.status}</span>
                                            </div>
                                            <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3 pt-2">{opp.description}</p>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50/50 bg-slate-50/50 -mx-6 -mb-6 p-4 rounded-b-[2.5rem]">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-3">
                                                <span className="flex items-center gap-1"><MapPin size={10} className="text-[#EC4899]" /> {opp.locationType} ({opp.location})</span>
                                                {opp.salaryMin && <span>💰 {opp.salaryMin} - {opp.salaryMax}</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenOppModal(opp)} className="p-2 text-slate-400 hover:text-[#EC4899] bg-white border border-slate-200 rounded-xl cursor-pointer shadow-xs"><Edit2 size={13} /></button>
                                                {opp.status === 'active' && <button onClick={() => handleCloseOpp(opp._id || opp.id)} className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-xs" title="Close"><X size={13} /></button>}
                                                <button onClick={() => handleDeleteOpp(opp._id || opp.id)} className="p-2 text-slate-400 hover:text-red-650 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-xs"><Trash2 size={13} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white border border-slate-100 rounded-[2.5rem] text-slate-400 text-xs font-semibold shadow-xl shadow-slate-100/10">
                                No active opportunities listed. Click "Publish Listing" to create one.
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Applicants Tab */}
                {activeWorkspaceTab === 'applicants' && (
                    <motion.div
                        key="applicants"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Received Application Roster</h3>

                        {appLoading ? (
                            <div className="py-20 text-center text-slate-400 text-xs">
                                Loading applications...
                            </div>
                        ) : applicants.length > 0 ? (
                            <div className="space-y-4">
                                {applicants.map(app => (
                                    <motion.div 
                                        whileHover={{ scale: 1.01 }}
                                        key={app._id} 
                                        className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-100/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left transition-all"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-slate-900 text-sm tracking-tight">{app.full_name}</h4>
                                                <span className={`px-2.5 py-1 text-[8.5px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                                                    app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                                                    app.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                                                    app.status === 'shortlisted' ? 'bg-indigo-50 text-indigo-700' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        app.status === 'accepted' ? 'bg-emerald-500' :
                                                        app.status === 'rejected' ? 'bg-rose-500' :
                                                        'bg-amber-500 animate-pulse'
                                                    }`} />
                                                    {app.status}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Applied for: {app.event_title}</p>
                                            <div className="flex gap-4 text-[10px] text-slate-500 font-semibold pt-1">
                                                <span>📧 {app.email}</span>
                                                {app.skills && <span>🔧 {app.skills}</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            {app.resume_url && (
                                                <a href={app.resume_url} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 hover:bg-pink-50 text-slate-700 rounded-xl border border-solid border-slate-200 transition-all text-xs font-bold no-underline shadow-xs">
                                                    Resume
                                                </a>
                                            )}
                                            {app.portfolio_url && (
                                                <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 hover:bg-pink-50 text-slate-700 rounded-xl border border-solid border-slate-200 transition-all text-xs font-bold no-underline shadow-xs">
                                                    Portfolio
                                                </a>
                                            )}
                                            {app.linkedin_url && (
                                                <a href={app.linkedin_url} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 hover:bg-indigo-50 text-indigo-650 rounded-xl border border-solid border-slate-200 transition-all text-xs font-bold no-underline shadow-xs">
                                                    LinkedIn
                                                </a>
                                            )}

                                            <div className="h-6 w-px bg-slate-100 mx-1" />

                                            <button onClick={() => handleApplicantStatus(app, 'accepted')} className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border-none cursor-pointer shadow-sm" title="Accept"><Check size={14} /></button>
                                            <button onClick={() => handleApplicantStatus(app, 'shortlisted')} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border-none cursor-pointer shadow-sm" title="Shortlist"><ArrowUpRight size={14} /></button>
                                            <button onClick={() => handleApplicantStatus(app, 'rejected')} className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border-none cursor-pointer shadow-sm" title="Decline"><X size={14} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white border border-slate-100 rounded-[2.5rem] text-slate-400 text-xs font-semibold shadow-xl shadow-slate-100/10">
                                No applicant profiles received.
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Stats Tab */}
                {activeWorkspaceTab === 'stats' && (
                    <motion.div
                        key="stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Metrics Dashboard</h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left">
                            {[
                                { label: 'Total Listings', val: opportunities.length, color: 'hover:shadow-pink-500/5 hover:border-pink-200' },
                                { label: 'Applicants Count', val: applicants.length, color: 'hover:shadow-indigo-500/5 hover:border-indigo-200' },
                                { label: 'Venture Interest', val: analytics?.investor_interest || 2, color: 'hover:shadow-emerald-500/5 hover:border-emerald-200' },
                                { label: 'Advisors Connected', val: analytics?.mentor_interest || 1, color: 'hover:shadow-amber-500/5 hover:border-amber-200' },
                                { label: 'Collaboration Outreach', val: analytics?.collaboration_requests || 2, color: 'hover:shadow-purple-500/5 hover:border-purple-200' },
                                { label: 'Profile Followers', val: analytics?.profile_views ? Math.floor(analytics.profile_views * 0.35) : 42, color: 'hover:shadow-sky-500/5 hover:border-sky-200' }
                            ].map((stat, idx) => (
                                <motion.div 
                                    whileHover={{ y: -4, scale: 1.015 }}
                                    key={idx} 
                                    className={`p-6 bg-white border border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[2.5rem] space-y-4 transition-all ${stat.color}`}
                                >
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                    <h4 className="text-2xl font-black text-slate-950 tracking-tight">{stat.val}</h4>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* ── EDIT PROFILE DRAWER MODAL ── */}
        <AnimatePresence>
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 text-left">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-8 space-y-6 custom-scrollbar"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                Edit Company Showcase <Building2 className="text-pink-500" size={20} />
                            </h2>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-[#EC4899] border-none cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-8 text-xs font-semibold">
                            {/* Tab 1: Basic Identity */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-2 block">1. Company Identity & Media</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Company Name</label>
                                        <input id="company_name" type="text" value={profile.company_name} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">One-Line Tagline</label>
                                        <input id="tagline" type="text" value={profile.tagline} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Logo Image Link</label>
                                        <input id="logo_url" type="text" value={profile.logo_url} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Cover Banner Image Link</label>
                                        <input id="hero_image_url" type="text" value={profile.hero_image_url} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                            {/* Tab 2: Profile Fields */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-2 block">2. About Startup Description</span>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Startup Description</label>
                                        <textarea id="description" rows={3} value={profile.description} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">Problem Statement</label>
                                            <textarea id="problem_statement" rows={3} value={profile.problem_statement} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">Solution Statement</label>
                                            <textarea id="solution" rows={3} value={profile.solution} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">Company Mission</label>
                                            <textarea id="mission" rows={3} value={profile.mission} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">Company Vision</label>
                                            <textarea id="vision" rows={3} value={profile.vision} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500">Target Market</label>
                                            <input id="target_market" type="text" value={profile.target_market} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. Enterprise SaaS, Mid-market B2B" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab 3: Product Section */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-2 block">3. Product & Technology</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Product Name</label>
                                        <input id="product_name" type="text" value={profile.product_name} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Demo Video Presentation Link</label>
                                        <input id="product_demo_video" type="text" value={profile.product_demo_video} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" placeholder="https://youtube.com/..." />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500">Product Description</label>
                                        <textarea id="product_description" rows={3} value={profile.product_description} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500">Technology Stack (Comma separated)</label>
                                        <input id="tech_stack" type="text" value={profile.tech_stack} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" placeholder="React, Node.js, Python, MongoDB" />
                                    </div>
                                </div>
                            </div>

                            {/* Tab 4: Founders Row */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest">4. Leadership & Founders</span>
                                    <button type="button" onClick={addFounderRow} className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-solid border-pink-200 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1"><Plus size={10} /> Add Founder</button>
                                </div>
                                <div className="space-y-4">
                                    {profile.founders.map((f, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/40 relative grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400">Founder Name</label>
                                                <input type="text" value={f.name} onChange={(e) => updateFounderRow(idx, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400">Founder Role</label>
                                                <input type="text" value={f.role} onChange={(e) => updateFounderRow(idx, 'role', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400">Bio Description</label>
                                                <input type="text" value={f.bio} onChange={(e) => updateFounderRow(idx, 'bio', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold" />
                                            </div>
                                            <div className="space-y-1 flex gap-2 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-400">LinkedIn Profile Link</label>
                                                    <input type="text" value={f.linkedin || ''} onChange={(e) => updateFounderRow(idx, 'linkedin', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold" />
                                                </div>
                                                {profile.founders.length > 1 && (
                                                    <button type="button" onClick={() => removeFounderRow(idx)} className="p-2 bg-red-50 text-red-655 rounded-lg border-none cursor-pointer"><Trash2 size={14} /></button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tab 5: Team Members Row */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest">5. Team & Advising Staff</span>
                                    <button type="button" onClick={addTeamRow} className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-solid border-pink-200 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1"><Plus size={10} /> Add Member</button>
                                </div>
                                <div className="space-y-4">
                                    {profile.team_members.map((m, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/40 relative grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400">Member Name</label>
                                                <input type="text" value={m.name} onChange={(e) => updateTeamRow(idx, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400">Member Role</label>
                                                <input type="text" value={m.role} onChange={(e) => updateTeamRow(idx, 'role', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold" />
                                            </div>
                                            <div className="space-y-1 flex gap-2 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-400">Skills (Comma separated)</label>
                                                    <input type="text" value={m.skills} onChange={(e) => updateTeamRow(idx, 'skills', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold" placeholder="Figma, Wireframing" />
                                                </div>
                                                <button type="button" onClick={() => removeTeamRow(idx)} className="p-2 bg-red-50 text-red-655 rounded-lg border-none cursor-pointer"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tab 6: Metadata & Funding */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-2 block">6. Metadata & Funding status</span>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Startup Stage</label>
                                        <select id="stage" value={profile.stage} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500 cursor-pointer">
                                            <option value="Pre-seed">Pre-seed</option>
                                            <option value="Seed">Seed</option>
                                            <option value="Series A">Series A</option>
                                            <option value="Series B">Series B</option>
                                            <option value="Series C">Series C</option>
                                            <option value="Growth">Growth</option>
                                            <option value="Public">Public</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Funding Requirement (Amount)</label>
                                        <input id="funding_requirement" type="text" value={profile.funding_requirement || ''} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. ₹75 Lakhs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500">Investment Status</label>
                                        <input id="investment_status" type="text" value={profile.investment_status || ''} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. Seed outreach open" />
                                    </div>
                                </div>
                            </div>

                            {/* Tab 7: Gallery Images */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-2 block">7. Media Gallery Link Builder</span>
                                <div className="flex flex-wrap gap-3 items-end p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex-1 space-y-1 min-w-[200px]">
                                        <label className="text-[9px] font-bold text-slate-400">Media URL Link</label>
                                        <input type="text" value={tempGalleryUrl} onChange={(e) => setTempGalleryUrl(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-pink-500" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400">Category Tag</label>
                                        <select value={tempGalleryType} onChange={(e) => setTempGalleryType(e.target.value as any)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-pink-500 cursor-pointer">
                                            <option value="product">Product Screenshot</option>
                                            <option value="team">Team Photos</option>
                                            <option value="event">Event Photos</option>
                                            <option value="office">Office Workspace</option>
                                        </select>
                                    </div>
                                    <button type="button" onClick={addGalleryImage} className="px-4 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white border-none rounded-xl text-xs font-black cursor-pointer shadow-md">Append Media</button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    {['product', 'team', 'event', 'office'].map(type => {
                                        const list = profile[`gallery_${type}` as const] || [];
                                        return list.map((img, idx) => (
                                            <div key={`${type}-${idx}`} className="relative rounded-2xl overflow-hidden border border-slate-150 h-24 group">
                                                <img src={img} alt="Showcase thumbnail" className="w-full h-full object-cover" />
                                                <span className="absolute bottom-1.5 left-1.5 bg-slate-950/60 text-white text-[7.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{type}</span>
                                                <button type="button" onClick={() => removeGalleryImage(type as any, idx)} className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer shadow-sm"><Trash2 size={10} /></button>
                                            </div>
                                        ));
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-solid border-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={savingProfile}
                                    className="px-6 py-3 bg-[#EC4899] text-white hover:bg-pink-600 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 border-none cursor-pointer"
                                >
                                    {savingProfile ? 'Saving Details…' : 'Sync Showcase Profile'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Create listings modal */}
        <AnimatePresence>
            {isOppModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 text-left">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-8 space-y-6 custom-scrollbar"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h2 className="text-base font-black text-slate-900">
                                {editingOpp ? 'Edit Listing Details' : 'Publish Workspace Opportunity'}
                            </h2>
                            <button 
                                onClick={() => setIsOppModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-[#EC4899] border-none cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOpp} className="space-y-6 text-xs font-semibold">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500">Opportunity/Listing Title</label>
                                    <input type="text" value={oppForm.title} onChange={(e) => setOppForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. Lead Frontend Architect" required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500">Classification Category</label>
                                        <select value={oppForm.type} onChange={(e) => setOppForm(prev => ({ ...prev, type: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500 cursor-pointer">
                                            {OPPORTUNITY_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500">Experience Needed</label>
                                        <input type="text" value={oppForm.experienceRequired} onChange={(e) => setOppForm(prev => ({ ...prev, experienceRequired: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. 2+ Years" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500">Location Type</label>
                                        <select value={oppForm.locationType} onChange={(e) => setOppForm(prev => ({ ...prev, locationType: e.target.value as any }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500 cursor-pointer">
                                            <option value="On-site">On-site</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500">Location Details</label>
                                        <input type="text" value={oppForm.location} onChange={(e) => setOppForm(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. Bangalore, IN" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500">Minimum Salary (INR/Year)</label>
                                        <input type="text" value={oppForm.salaryMin} onChange={(e) => setOppForm(prev => ({ ...prev, salaryMin: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. 10 LPA" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500">Maximum Salary (INR/Year)</label>
                                        <input type="text" value={oppForm.salaryMax} onChange={(e) => setOppForm(prev => ({ ...prev, salaryMax: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. 15 LPA" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500">Equity Share offer</label>
                                        <input type="text" value={oppForm.equity} onChange={(e) => setOppForm(prev => ({ ...prev, equity: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" placeholder="e.g. 0.5% - 1.0%" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500">Brief Description</label>
                                    <textarea value={oppForm.description} onChange={(e) => setOppForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" required />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500">Requirements & Qualifications</label>
                                    <textarea value={oppForm.requirements} onChange={(e) => setOppForm(prev => ({ ...prev, requirements: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500">Application Deadline</label>
                                    <input type="date" value={oppForm.deadline} onChange={(e) => setOppForm(prev => ({ ...prev, deadline: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500 cursor-pointer" required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsOppModalOpen(false)}
                                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-solid border-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={oppFormLoading}
                                    className="px-6 py-3 bg-[#EC4899] text-white hover:bg-pink-600 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 border-none cursor-pointer"
                                >
                                    {oppFormLoading ? 'Syncing...' : editingOpp ? 'Update Listing' : 'Publish Live Listing'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

export default StartupProfile;
