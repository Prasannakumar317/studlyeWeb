import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Cpu, Landmark, Heart, Building, ArrowRight } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockIndustriesDetailed = [
  { name: "AI & ML", count: 24, icon: Cpu, desc: "Neural architectures, automated agent orchestration, custom LLMs, and foundational machine learning stacks.", growth: "+45% YoY Growth", fundingAvg: "₹2.5 Cr Average Seed", activeRoles: 18 },
  { name: "FinTech", count: 18, icon: Landmark, desc: "Micro-investment systems, automated taxation workflows, API payment gateways, and high-frequency ledger layers.", growth: "+20% YoY Growth", fundingAvg: "₹1.8 Cr Average Seed", activeRoles: 12 },
  { name: "EdTech", count: 15, icon: Compass, desc: "Simulation workspaces, automated curriculum curation, technical assessment platforms, and visual engineering tutorials.", growth: "+15% YoY Growth", fundingAvg: "₹1.1 Cr Average Seed", activeRoles: 8 },
  { name: "HealthTech", count: 12, icon: Heart, desc: "Genomic sequence trackers, medical record schedulers, automated clinic workflows, and remote patient monitoring widgets.", growth: "+35% YoY Growth", fundingAvg: "₹3.2 Cr Average Seed", activeRoles: 14 },
  { name: "SaaS", count: 32, icon: Building, desc: "B2B productivity tools, workflow automation builders, client reporting portals, and internal metric visualizers.", growth: "+28% YoY Growth", fundingAvg: "₹1.5 Cr Average Seed", activeRoles: 25 }
];

const DiscoverIndustries: React.FC = () => {
  const navigate = useNavigate();
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="industries" cursorOffset={cursorOffset} />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Back Button & Title */}
        <div className="space-y-1 border-b border-slate-200/60 pb-6">
          <button 
            onClick={() => navigate('/discover')}
            className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors mb-2 cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </button>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Compass className="w-9 h-9 text-indigo-600" /> Industry Sectors
          </h1>
          <p className="text-xs text-slate-500 font-medium">Deep-dive into tech-focused domains represented in the startup ecosystem.</p>
        </div>

        {/* Detailed industries list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockIndustriesDetailed.map((ind, index) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
                className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                        <Icon className="w-5 h-5 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{ind.name}</h3>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full">
                      {ind.count} companies
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[50px] font-medium">{ind.desc}</p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-4 rounded-xl text-[10px] font-semibold">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">YoY Growth</span>
                      <span className="text-emerald-600 block font-bold mt-0.5">{ind.growth}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Avg Funding</span>
                      <span className="text-slate-700 block mt-0.5">{ind.fundingAvg}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Hiring roles</span>
                      <span className="text-indigo-600 block font-bold mt-0.5">{ind.activeRoles} open</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => navigate('/discover/startups')}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-black cursor-pointer uppercase tracking-wider"
                  >
                    View active startups <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default DiscoverIndustries;
