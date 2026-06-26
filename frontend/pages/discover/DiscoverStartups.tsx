import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Building, ExternalLink, Bookmark, Sparkles, Zap } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockStartupsList = [
  { id: "startup-1", name: "Aether AI", stage: "Series A", industry: "AI & ML", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120", tagline: "Decentralized AI orchestration for cloud-native workloads.", details: "Aether AI automates complex scheduling across multi-cloud clusters using autonomous optimization algorithms.", founders: "Aman Sen & Sarah Croft", funding: "₹4.5 Cr", employees: "12 - 50" },
  { id: "startup-2", name: "FinFlow", stage: "Pre-Seed", industry: "FinTech", logo: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120", tagline: "API-first micro-investment infrastructure for rural markets.", details: "FinFlow brings digital investment products to rural retail points of sale through micro APIs.", founders: "Vikram Mehta", funding: "₹50L", employees: "1 - 10" },
  { id: "startup-3", name: "EdVantage", stage: "Seed", industry: "EdTech", logo: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=120", tagline: "Gamified simulation-based corporate skill assessments.", details: "EdVantage provides realistic sandbox environments to assess candidate technical capability.", founders: "Dr. Ramesh Nair", funding: "₹1.2 Cr", employees: "10 - 25" },
  { id: "startup-4", name: "Helix Health", stage: "Seed", industry: "HealthTech", logo: "https://images.unsplash.com/photo-1618005198143-e528346d9a74?w=120", tagline: "Predictive genomic sequencing workflows for oncology clinics.", details: "Helix Health matches somatic genetic variations with clinical outcomes to save diagnosis times.", founders: "Neha Roy", funding: "₹2 Cr", employees: "5 - 15" },
  { id: "startup-5", name: "Nebula Commerce", stage: "Bootstrap", industry: "SaaS", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120", tagline: "Next-gen spatial shopping engines for immersive web.", details: "Nebula builds highly customized 3D storefront experiences optimized for modern spatial browsers.", founders: "Karan Johar", funding: "N/A", employees: "2 - 8" }
];

const DiscoverStartups: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  const filtered = mockStartupsList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.industry.toLowerCase().includes(search.toLowerCase()) ||
                          s.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesStage = selectedStage === 'All' ? true : s.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="startups" cursorOffset={cursorOffset} />

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
              <Building className="w-9 h-9 text-indigo-600" /> Startups Directory
            </h1>
            <p className="text-xs text-slate-500 font-medium">Explore and query high-potential tech companies in our digital registry.</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-15 group-hover:opacity-30 transition" />
              <div className="relative flex items-center bg-white/90 border border-slate-200/80 rounded-xl px-3 py-2 text-xs">
                <Search className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Query startups..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-slate-800 outline-none placeholder-slate-400 text-xs min-w-[180px] font-semibold"
                />
              </div>
            </div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-white/90 border border-slate-200/80 rounded-xl text-xs px-3 py-2.5 outline-none text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
            >
              <option value="All">All Stages</option>
              <option value="Bootstrap">Bootstrap</option>
              <option value="Pre-Seed">Pre-Seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
            </select>
          </div>
        </div>

        {/* List of cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <img src={s.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200/60" />
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{s.name}</h3>
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider">
                        {s.industry}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-black tracking-wider uppercase text-slate-600 bg-slate-100 border border-slate-200/60 px-2 py-1 rounded">
                    {s.stage}
                  </span>
                </div>
                
                <p className="text-xs font-bold text-slate-800 leading-normal">{s.tagline}</p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{s.details}</p>

                {/* Meta details */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-semibold">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Founders</span>
                    <span className="text-slate-700 truncate block mt-0.5">{s.founders}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Funding raised</span>
                    <span className="text-slate-700 block mt-0.5">{s.funding}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Employees</span>
                    <span className="text-slate-700 block mt-0.5">{s.employees}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                <button 
                  onClick={() => navigate(`/startup/${s.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-black cursor-pointer uppercase tracking-wider"
                >
                  View Profile <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
                  Request Info
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverStartups;
