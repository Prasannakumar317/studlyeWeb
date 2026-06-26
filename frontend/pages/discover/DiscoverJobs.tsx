import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Search, Check } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockJobs = [
  { id: "job-1", title: "AI Research Engineer", company: "Aether AI", location: "Bengaluru (Hybrid)", salary: "₹18L - ₹24L", type: "Full-Time", experience: "2+ Years", skills: ["PyTorch", "Transformers", "Distributed Systems"] },
  { id: "job-2", title: "Frontend Developer (React)", company: "EdVantage", location: "Remote", salary: "₹8L - ₹12L", type: "Internship / Full-Time", experience: "0-1 Years", skills: ["React", "TypeScript", "Tailwind CSS"] },
  { id: "job-3", title: "Lead Systems Architect", company: "Aether AI", location: "Bengaluru (In-Office)", salary: "₹30L - ₹45L", type: "Full-Time", experience: "5+ Years", skills: ["Rust", "Kubernetes", "Linux Kernel"] },
  { id: "job-4", title: "Backend Engineer", company: "FinFlow", location: "Mumbai (In-Office)", salary: "₹12L - ₹18L", type: "Full-Time", experience: "1-3 Years", skills: ["FastAPI", "MongoDB", "Redis"] },
  { id: "job-5", title: "Bioinformatics Specialist", company: "Helix Health", location: "Remote", salary: "₹15L - ₹22L", type: "Contract", experience: "3+ Years", skills: ["Python", "Genomic Pipelines", "Pandas"] }
];

const DiscoverJobs: React.FC = () => {
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  const handleApply = (id: string) => {
    setAppliedJobs(prev => [...prev, id]);
  };

  const filtered = mockJobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="jobs" cursorOffset={cursorOffset} />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Back Button & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/60 pb-6">
          <div className="space-y-1">
            <button 
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors mb-2 cursor-pointer uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Discover
            </button>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Briefcase className="w-9 h-9 text-indigo-600" /> Career Opportunities
            </h1>
            <p className="text-xs text-slate-500 font-medium">Discover active engineering, design, and product listings posted by vetted startups.</p>
          </div>

          {/* Search bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-15 group-hover:opacity-30 transition" />
            <div className="relative flex items-center bg-white/90 border border-slate-200/80 rounded-xl px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Query job openings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-slate-800 outline-none placeholder-slate-400 text-xs min-w-[180px] font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((j, index) => (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{j.title}</h3>
                    <p className="text-xs text-indigo-600 font-black uppercase tracking-wider mt-1">{j.company} • <span className="text-slate-500 font-bold">{j.location}</span></p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full shrink-0">
                    {j.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-semibold">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Compensation</span>
                    <span className="text-slate-700 block mt-0.5">{j.salary}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Experience Req</span>
                    <span className="text-slate-700 block mt-0.5">{j.experience}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {j.skills.map(s => (
                    <span key={s} className="text-[9px] font-bold text-slate-600 px-2.5 py-0.5 bg-slate-100 border border-slate-200/60 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Listing</span>
                {appliedJobs.includes(j.id) ? (
                  <button className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-default shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(j.id)}
                    className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Quick Apply
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm font-medium">
              No active job listings found matching your query criteria.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DiscoverJobs;
