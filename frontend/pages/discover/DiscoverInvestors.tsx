import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Landmark, Send, Check } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockInvestors = [
  { id: "inv-1", name: "Sequoia Capital (India)", representative: "Sandeep Singhal", stage: "Seed / Series A", range: "₹50L - ₹2Cr", logo: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120", email: "sandeep@sequoia.com", details: "Deeply interested in core backend architectures, Web3 protocols, AI models, and infrastructure plays." },
  { id: "inv-2", name: "Kalaari Capital", representative: "Vani Kola", stage: "Pre-Seed / Seed", range: "₹20L - ₹50L", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120", email: "contact@kalaari.com", details: "Focuses on EdTech simulations, consumer brands, scalable B2B SaaS, and health workflow tools." },
  { id: "inv-3", name: "Elevation Capital", representative: "Mukul Arora", stage: "Seed / Series A", range: "₹1Cr - ₹3Cr", logo: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=120", email: "mukul@elevation.com", details: "Investing in developer platforms, fintech systems, and next-generation API protocols." },
  { id: "inv-4", name: "India Quotient", representative: "Anand Lunia", stage: "Pre-Seed", range: "₹10L - ₹30L", logo: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=120", email: "anand@indiaquotient.com", details: "Backs raw, early talent before product-market fit is fully proven. Prefers strong technical founders." }
];

const DiscoverInvestors: React.FC = () => {
  const navigate = useNavigate();
  const [pitchSent, setPitchSent] = useState<string[]>([]);
  const [pitchText, setPitchText] = useState<Record<string, string>>({});
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  const handleSendPitch = (id: string) => {
    if (!pitchText[id]?.trim()) return;
    setPitchSent(prev => [...prev, id]);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="investors" cursorOffset={cursorOffset} />

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
            <Landmark className="w-9 h-9 text-indigo-600" /> VC & Angel Networks
          </h1>
          <p className="text-xs text-slate-500 font-medium">Discover investment firms, check typical ticket sizes, and pitch your startup directly.</p>
        </div>

        {/* Investors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockInvestors.map((inv, index) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <img src={inv.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200/60 shadow-sm" />
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{inv.name}</h3>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Rep: {inv.representative}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {inv.stage}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">{inv.details}</p>

                <div className="flex justify-between bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs font-semibold">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Investment Range</span>
                  <span className="text-indigo-600 font-extrabold">{inv.range}</span>
                </div>

                {/* Pitch Interface */}
                {pitchSent.includes(inv.id) ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-600 font-black uppercase tracking-wider flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Pitch Submitted!
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Elevator Pitch Description</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write your pitch..."
                        value={pitchText[inv.id] || ''}
                        onChange={(e) => setPitchText(prev => ({ ...prev, [inv.id]: e.target.value }))}
                        className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-800 font-semibold placeholder-slate-400"
                      />
                      <button
                        onClick={() => handleSendPitch(inv.id)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoverInvestors;
