import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, ArrowRight } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockCollectionsList = [
  { id: "col-1", title: "AI Disruptors", desc: "Machine learning engineering teams creating automatic orchestrations and gene sequence compilers.", count: "6 active startups", bg: "from-purple-50 to-indigo-50/80 border-purple-100 text-purple-900" },
  { id: "col-2", title: "Recently Funded", desc: "Startups that have closed funding rounds within the past 30 days to scale their engineering teams.", count: "12 active startups", bg: "from-pink-50 to-orange-50/80 border-pink-100 text-pink-900" },
  { id: "col-3", title: "Hidden Gems", desc: "High-performing early teams working on developer tools and offline transactional API protocols.", count: "8 active startups", bg: "from-blue-50 to-cyan-50/80 border-blue-100 text-blue-900" },
  { id: "col-4", title: "Remote First", desc: "Startups built by fully distributed teams operating asynchronously across global timezones.", count: "24 active startups", bg: "from-purple-50 to-pink-50/80 border-purple-100 text-purple-900" },
  { id: "col-5", title: "Student Founders", desc: "Ventures built by students leveraging university innovation grants and local incubation cells.", count: "10 active startups", bg: "from-pink-50 to-rose-50/80 border-pink-100 text-pink-900" }
];

const DiscoverCollections: React.FC = () => {
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
      <DiscoverBackground category="collections" cursorOffset={cursorOffset} />

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
            <Bookmark className="w-9 h-9 text-indigo-600" /> Curated Collections
          </h1>
          <p className="text-xs text-slate-500 font-medium">Browse high-potential tech ventures organized by custom platform categories.</p>
        </div>

        {/* Collections list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCollectionsList.map((col, index) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => navigate('/discover/startups')}
              className={`p-6 rounded-[2rem] bg-gradient-to-tr ${col.bg} border flex flex-col justify-between group shadow-sm transition-all duration-300 min-h-[180px] cursor-pointer`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{col.title}</h3>
                  <span className="text-[9px] font-black uppercase text-slate-800 bg-white/70 border border-slate-200/30 px-2.5 py-0.5 rounded-full">
                    {col.count}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{col.desc}</p>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-200/60 pt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Explore folder</span>
                <span className="text-xs text-indigo-600 group-hover:text-indigo-700 font-bold flex items-center gap-1.5 transition-all">
                  Open Directory <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoverCollections;
