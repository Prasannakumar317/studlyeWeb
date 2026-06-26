import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Cpu, ArrowRight } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockTechnologies = [
  { name: "Rust", category: "Languages & Systems", growth: "↑ +85% hiring YoY", activeRepos: 12, desc: "Used heavily for satellite cluster scheduling, local POS transactional protocols, and memory-safe telemetry processors." },
  { name: "PyTorch", category: "AI & ML Frameworks", growth: "↑ +120%", activeRepos: 18, desc: "Standard framework for somatic genetic variations computational transformers and self-healing cloud microservice agents." },
  { name: "FastAPI", category: "Backend Infrastructure", growth: "↑ +40%", activeRepos: 25, desc: "Powering all of our platform backend endpoints, securing RBAC operations, and managing async task queues." },
  { name: "TypeScript", category: "Frontend Applications", growth: "↑ +30%", activeRepos: 32, desc: "Compiling our entire browser client interface, ensuring strict typing for custom dashboard tours and interactive 3D charts." }
];

const DiscoverTechnologies: React.FC = () => {
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
      <DiscoverBackground category="technologies" cursorOffset={cursorOffset} />

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
            <Cpu className="w-9 h-9 text-indigo-600" /> Technology Trends
          </h1>
          <p className="text-xs text-slate-500 font-medium">Deep-dive into language tools and computational platforms dominating our ecosystem.</p>
        </div>

        {/* Technologies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockTechnologies.map((t, index) => (
            <motion.div
              key={t.name}
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
                      <Cpu className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{t.name}</h3>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">{t.category}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {t.growth}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.desc}</p>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">{t.activeRepos} open-source repositories</span>
                <button 
                  onClick={() => navigate('/discover/jobs')}
                  className="text-xs text-indigo-600 group-hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  View tech jobs <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoverTechnologies;
