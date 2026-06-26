import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Users, Mail, MessageSquare, Sparkles } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockFounders = [
  { id: "f-1", name: "Aman Sen", role: "Co-Founder & CEO", company: "Aether AI", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120", bio: "Ex-Google DeepMind Architect, specializing in high-throughput distributed ML clusters. Building automated cloud systems.", skills: ["Orchestration", "Deep Learning", "FastAPI"], location: "Bengaluru, India" },
  { id: "f-2", name: "Sarah Croft", role: "Co-Founder & CTO", company: "Aether AI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120", role: "CTO", bio: "Systems reliability researcher and compiler optimization enthusiast. Interested in Rust infrastructure.", skills: ["Rust", "Kubernetes", "Linux Kernel"], location: "San Francisco, USA" },
  { id: "f-3", name: "Vikram Mehta", role: "Founder & CEO", company: "FinFlow", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120", role: "CEO", bio: "Ex-Razorpay PM. Building transaction layers that work without high-speed internet protocols in tier-3 regions.", skills: ["Product Management", "Payment APIs", "Strategy"], location: "Mumbai, India" },
  { id: "f-4", name: "Neha Roy", role: "Founder & Lead Biologist", company: "Helix Health", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120", role: "Founder", bio: "PhD in Computational Genomics from IISc. Designing hybrid transformers that recognize mutation outcomes.", skills: ["Genomics", "PyTorch", "Medical Workflows"], location: "New Delhi, India" }
];

const DiscoverFounders: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  const filtered = mockFounders.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.company.toLowerCase().includes(search.toLowerCase()) ||
    f.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="founders" cursorOffset={cursorOffset} />

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
              <Users className="w-9 h-9 text-indigo-600" /> Founders Circle
            </h1>
            <p className="text-xs text-slate-500 font-medium">Connect and collaborate with elite builders and technical project leads.</p>
          </div>

          {/* Search bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-15 group-hover:opacity-30 transition" />
            <div className="relative flex items-center bg-white/90 border border-slate-200/80 rounded-xl px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Query founder..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-slate-800 outline-none placeholder-slate-400 text-xs min-w-[180px] font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Founder grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f, index) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <img src={f.avatar} alt="" className="w-14 h-14 rounded-full object-cover border border-slate-200/60 shadow-sm" />
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{f.name}</h3>
                    <p className="text-xs text-indigo-600 font-black uppercase tracking-wider">{f.role} at <span className="underline">{f.company}</span></p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[50px] font-medium">{f.bio}</p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {f.skills.map(s => (
                    <span key={s} className="text-[9px] font-bold text-slate-600 px-2.5 py-0.5 bg-slate-100 border border-slate-200/60 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{f.location}</span>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200">
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm font-medium">
              No founders found matching your filters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DiscoverFounders;
