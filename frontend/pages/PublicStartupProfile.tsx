import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import { 
    ArrowLeft, 
    Globe, 
    Mail, 
    Phone, 
    Briefcase, 
    Users, 
    TrendingUp, 
    Share2, 
    Copy, 
    Linkedin, 
    Twitter, 
    Instagram,
    Building2,
    Rocket,
    User,
    Sparkles,
    ExternalLink
} from 'lucide-react';

const PublicStartupProfile: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/startup/${institutionId}`;

  useEffect(() => {
    const loadProfile = async () => {
      if (!institutionId) {
        setError('Startup profile link is missing the institution ID.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/institution/startup-profile-public/${institutionId}`);
        if (!res.ok) {
          throw new Error('Startup profile not found');
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load startup profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [institutionId]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareProfile = async () => {
    const payload = {
      title: `${profile?.company_name || 'Startup Profile'}`,
      text: `Check out ${profile?.company_name || 'this startup'} on Studlyf.`,
      url: publicUrl,
    };

    if (navigator.share) {
      await navigator.share(payload);
      return;
    }

    await copyLink();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] px-4 py-8 sm:px-6 lg:px-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7C3AED]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-[3rem] border border-gray-100 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Rocket className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Startup profile unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">{error || 'The startup profile you requested could not be loaded.'}</p>
          <div className="mt-6 flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#7C3AED]/20">
              <ArrowLeft className="h-4 w-4" /> Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Founded', value: profile.founded_year || 'N/A', tone: 'emerald' },
    { label: 'Team Size', value: profile.team_size || 'N/A', tone: 'violet' },
    { label: 'Stage', value: profile.stage || 'N/A', tone: 'sky' },
    { label: 'Founders', value: profile.founders?.length || 0, tone: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F6] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-700 shadow-sm transition hover:border-[#7C3AED]/30 hover:text-[#7C3AED]">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 shadow-sm border border-gray-100">
            <Rocket className="h-3 w-3 text-[#7C3AED]" /> Startup Profile
          </div>
        </div>

        {/* Hero Banner & Logo */}
        {profile.hero_image_url && (
          <div className="rounded-[3rem] overflow-hidden mb-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] relative h-64 border border-gray-100">
            <img src={profile.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
            {profile.logo_url && (
              <div className="absolute -bottom-12 left-10">
                <div className="w-32 h-32 rounded-[2rem] bg-white border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden relative">
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr] mt-16">
          {/* Main Content */}
          <section className="relative overflow-hidden rounded-[3rem] border border-gray-100 bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#06B6D4]/10 pointer-events-none" />
            <div className="relative">
              {!profile.hero_image_url && profile.logo_url && (
                <div className="flex items-start gap-5 mb-8">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white bg-gray-50 shadow-lg ring-4 ring-[#7C3AED]/10">
                    <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">
                  <Sparkles className="h-3 w-3" /> Startup Profile
                </div>
                <h1 className="break-words text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{profile.company_name}</h1>
                <p className="mt-3 text-lg text-[#7C3AED] font-bold">{profile.tagline}</p>
                
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  {profile.industry && (
                    <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 font-medium text-gray-700">
                      {profile.industry}
                    </span>
                  )}
                  {profile.stage && (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                      {profile.stage}
                    </span>
                  )}
                </div>

                <p className="mt-8 max-w-3xl text-base leading-8 text-gray-700">{profile.description}</p>

                {profile.pitch && (
                  <div className="mt-8 p-6 bg-[#F5F3FF] border border-[#7C3AED]/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-2">Pitch</p>
                    <p className="text-sm font-bold text-gray-900">{profile.pitch}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="mt-8 space-y-4 border-t border-gray-100 pt-8">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Mail size={18} className="text-[#7C3AED]" /> Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.email && (
                      <a href={`mailto:${profile.email}`} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#7C3AED]/30 hover:bg-[#F5F3FF] transition-all">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
                        <p className="mt-2 font-bold text-gray-900 break-all">{profile.email}</p>
                      </a>
                    )}
                    {profile.phone && (
                      <a href={`tel:${profile.phone}`} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#7C3AED]/30 hover:bg-[#F5F3FF] transition-all">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                        <p className="mt-2 font-bold text-gray-900">{profile.phone}</p>
                      </a>
                    )}
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#7C3AED]/30 hover:bg-[#F5F3FF] transition-all">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Website</p>
                        <p className="mt-2 font-bold text-gray-900 flex items-center gap-2">
                          {profile.website.replace(/^https?:\/\//, '')}
                          <ExternalLink size={14} />
                        </p>
                      </a>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(profile.social?.linkedin || profile.social?.twitter || profile.social?.instagram) && (
                  <div className="mt-8 space-y-4 border-t border-gray-100 pt-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Share2 size={18} className="text-[#7C3AED]" /> Follow Us
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.social?.linkedin && (
                        <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <Linkedin size={18} className="text-blue-600" />
                          <span className="text-sm font-bold text-gray-900">LinkedIn</span>
                        </a>
                      )}
                      {profile.social?.twitter && (
                        <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-sky-300 hover:bg-sky-50 transition-all">
                          <Twitter size={18} className="text-sky-600" />
                          <span className="text-sm font-bold text-gray-900">Twitter</span>
                        </a>
                      )}
                      {profile.social?.instagram && (
                        <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-pink-300 hover:bg-pink-50 transition-all">
                          <Instagram size={18} className="text-pink-600" />
                          <span className="text-sm font-bold text-gray-900">Instagram</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="rounded-[3rem] border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Share</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Promote this startup</p>
              </div>
              <Share2 className="h-5 w-5 text-[#7C3AED]" />
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={copyLink} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-900 transition hover:border-[#7C3AED]/30 flex items-center justify-center gap-2">
                <Copy size={14} />
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button onClick={shareProfile} className="w-full rounded-2xl bg-[#7C3AED] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#7C3AED]/20 transition hover:bg-[#6D28D9]">
                Share Profile
              </button>
            </div>
            <div className="mt-6 rounded-3xl border border-[#7C3AED]/10 bg-[#F5F3FF]/70 p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">Profile URL</div>
              <p className="mt-3 text-sm text-gray-700 break-all font-mono">{publicUrl}</p>
            </div>
          </aside>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${stat.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : stat.tone === 'violet' ? 'bg-[#F5F3FF] text-[#7C3AED]' : stat.tone === 'sky' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
                {stat.label}
              </div>
              <div className="mt-4 text-3xl font-black text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Founders Section */}
        {profile.founders && profile.founders.length > 0 && (
          <section className="mt-8 rounded-[3rem] border border-gray-100 bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                  <Users size={24} className="text-[#7C3AED]" /> Founding Team
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Meet the founders</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.founders.map((founder: any, idx: number) => (
                <div key={idx} className="rounded-3xl border border-gray-100 bg-gray-50/80 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
                      <User size={20} className="text-[#7C3AED]" />
                    </div>
                    <div>
                      <div className="font-black text-gray-900">{founder.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{founder.role}</div>
                    </div>
                  </div>
                  {founder.email && (
                    <a href={`mailto:${founder.email}`} className="text-[10px] font-bold text-[#7C3AED] hover:text-[#6D28D9] break-all">
                      {founder.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PublicStartupProfile;
