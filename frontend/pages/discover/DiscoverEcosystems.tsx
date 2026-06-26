import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, ArrowRight } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockEcosystemsList = [
  { name: "India", count: "84 active startups", activeVcs: "12 VCs", cities: "Bengaluru, Delhi/NCR, Mumbai, Chennai", label: "Fastest Growing Hub", description: "Driven by high tech talent in SaaS, fintech API layers, and AI engineering sandboxes." },
  { name: "United States", count: "32 active startups", activeVcs: "18 VCs", cities: "San Francisco, New York City, Austin, Boston", label: "Mature Capital Markets", description: "Home to foundation AI computing modules, biotech genomic clusters, and corporate simulation modules." },
  { name: "Singapore", count: "14 active startups", activeVcs: "6 VCs", cities: "Marina Bay, One-North Innovation District", label: "Gateway to Southeast Asia", description: "Regional headquarters for fintech expansion, web3 structures, and corporate training dashboards." },
  { name: "Europe", count: "28 active startups", activeVcs: "10 VCs", cities: "London, Berlin, Paris, Stockholm", label: "Decentralized Clusters", description: "Focusing on carbon-neutral industrial tech, open-source compliance compilers, and secure clinical registries." }
];

const DiscoverEcosystems: React.FC = () => {
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
      <DiscoverBackground category="ecosystems" cursorOffset={cursorOffset} />

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
            <Globe className="w-9 h-9 text-indigo-600" /> Startup Ecosystems
          </h1>
          <p className="text-xs text-slate-500 font-medium">Explore regional clusters, active local communities, and localized investment trends.</p>
        </div>

        {/* Ecosystems List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockEcosystemsList.map((eco, index) => (
            <motion.div
              key={eco.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" /> {eco.name}
                  </h3>
                  <span className="text-[9px] font-black uppercase text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded">
                    {eco.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">{eco.description}</p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-[10px] font-semibold">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Major Cities</span>
                    <span className="text-slate-700 block mt-0.5">{eco.cities}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Ventures Registered</span>
                    <span className="text-indigo-600 block font-bold mt-0.5">{eco.count}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Focus: VC Hub ({eco.activeVcs})</span>
                <button 
                  onClick={() => navigate('/discover/startups')}
                  className="text-xs text-indigo-600 group-hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Explore startups <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoverEcosystems;
