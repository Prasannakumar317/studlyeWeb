import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Check } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockFunding = [
  { id: "fund-1", provider: "Y Combinator (Summer 2026)", type: "VC Accelerator", amount: "$500,000 for 7%", deadline: "July 25, 2026", details: "YC provides standard funding, mentorship, networking, and a lifetime brand community for high-growth tech ventures." },
  { id: "fund-2", provider: "Startup India Seed Fund", type: "Government Grant", amount: "Up to ₹50L Equity-Free", deadline: "Rolling Applications", details: "Government funding to assist early-stage startups with validation, trial prototypes, and commercial deployment." },
  { id: "fund-3", provider: "Sequoia Spark (Fellowship)", type: "VC Fellowship", amount: "$100,000 Equity-Free Grant", deadline: "August 15, 2026", details: "A immersive program specifically focused on female-led technical and product startups in India & SEA." },
  { id: "fund-4", provider: "IIT Madras Incubation Cell", type: "University Incubator", amount: "₹10L + Lab Space Access", deadline: "September 01, 2026", details: "Incubation workspace, technical mentorship, and intellectual property licensing help for university students." }
];

const DiscoverFunding: React.FC = () => {
  const navigate = useNavigate();
  const [applied, setApplied] = useState<string[]>([]);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  const handleApply = (id: string) => {
    setApplied(prev => [...prev, id]);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="funding" cursorOffset={cursorOffset} />

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
            <Award className="w-9 h-9 text-indigo-600" /> Grants & Funding
          </h1>
          <p className="text-xs text-slate-500 font-medium">Browse equity-free government grants, VC accelerator fellowships, and incubator packages.</p>
        </div>

        {/* Funding cards list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockFunding.map((fund, index) => (
            <motion.div
              key={fund.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{fund.provider}</h3>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider">
                      {fund.type}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[48px] font-medium">{fund.details}</p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-[10px] font-semibold">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Funding Amount</span>
                    <span className="text-indigo-600 font-extrabold mt-0.5">{fund.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Deadline</span>
                    <span className="text-pink-600 font-extrabold mt-0.5">{fund.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 font-semibold">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Status: Active</span>
                {applied.includes(fund.id) ? (
                  <button className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-default shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Registered
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(fund.id)}
                    className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoverFunding;
