import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ExternalLink, Play } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockPlaybooks = [
  { id: "p-1", title: "SaaS Product-Market Validation Playbook", format: "Document", length: "15 min read", creator: "StudLyf Editorial", desc: "A comprehensive roadmap outlining validation milestones, user interview frameworks, and metric setups before scaling." },
  { id: "p-2", title: "VC Pitch Presentation Masterclass", format: "Video Guide", length: "45 min video", creator: "Sandeep Singhal", desc: "Sequoia India representative breaks down structural pitch decks, check range expectations, and seed terms sheet analysis." },
  { id: "p-3", title: "Rust distributed systems performance tuning", format: "Case Study", length: "20 min read", creator: "Sarah Croft", desc: "Deep-dive case study outlining optimization patterns, memory allocation hacks, and SRE monitoring layouts." },
  { id: "p-4", title: "Student Founder Guides to Innovation Grants", format: "Document", length: "10 min read", creator: "Ecosystem Panel", desc: "Step-by-step documentation detailing how student leads can claim state innovation grants and lab incubation spaces." }
];

const DiscoverLearning: React.FC = () => {
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
      <DiscoverBackground category="learning" cursorOffset={cursorOffset} />

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
            <BookOpen className="w-9 h-9 text-indigo-600" /> Founder Playbooks
          </h1>
          <p className="text-xs text-slate-500 font-medium">Recommended learning playbooks, guide documents, podcasts, and case studies.</p>
        </div>

        {/* Learning Hub list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockPlaybooks.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {p.format}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{p.length}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{p.desc}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Author: {p.creator}</span>
                <button className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer">
                  {p.format === 'Video Guide' ? (
                    <>
                      Watch Video <Play className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Read Playbook <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoverLearning;
