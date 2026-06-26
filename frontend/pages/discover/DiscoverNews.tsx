import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockNewsList = [
  { id: "news-1", type: "Funding", title: "Aether AI raises ₹4.5 Cr Seed Round from Sequoia Capital India", date: "2 hours ago", author: "Rohan Sharma", content: "The decentralized cloud orchestration startup Aether AI has announced the closure of a ₹4.5 Cr seed round led by Sequoia Capital India. The capital will be deployed to accelerate development of automatic microservices scheduling protocols." },
  { id: "news-2", type: "Product Launch", title: "Helix Health launches somatic gene sequencing oncology pipeline v1.0", date: "5 hours ago", author: "Dr. Neha Roy", content: "Helix Health has rolled out its first clinical-ready pipeline designed to analyze tumor biopsies against known datasets in under 12 hours, streamlining cancer treatment workflows." },
  { id: "news-3", type: "Hiring", title: "FinFlow announces offline micro API implementation, looking for Rust Developers", date: "1 day ago", author: "Vikram Mehta", content: "FinFlow is expanding its offline POS API platform across tier-3 villages and is currently hiring Remote Rust and System Reliability Engineers." },
  { id: "news-4", type: "Acquisition", title: "EdVantage acquires Simulator Labs to boost interactive Sandbox features", date: "3 days ago", author: "EdVantage PR", content: "EdVantage has finalized terms to buy Simulator Labs. The acquisition integrates virtual sandbox containers directly into EdVantage skill assessment pages." }
];

const DiscoverNews: React.FC = () => {
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
      <DiscoverBackground category="news" cursorOffset={cursorOffset} />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Back Button & Title */}
        <div className="space-y-1 border-b border-slate-200/60 pb-6">
          <button 
            onClick={() => navigate('/discover')}
            className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors mb-2 cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </button>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <FileText className="w-9 h-9 text-indigo-600" /> Ecosystem News
          </h1>
          <p className="text-xs text-slate-500 font-medium">Read about funding announcements, acquisitions, launches, and hiring reports.</p>
        </div>

        {/* Timeline News Feed */}
        <div className="space-y-6">
          {mockNewsList.map((n, index) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-md transition-all duration-300 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                    {n.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{n.date}</span>
                </div>
                <span className="text-[10px] text-slate-500">By {n.author}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.content}</p>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <span className="text-[9px] text-slate-400 uppercase font-black">Verified News Ticker</span>
                <button className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer">
                  Read Full Press Release <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoverNews;
