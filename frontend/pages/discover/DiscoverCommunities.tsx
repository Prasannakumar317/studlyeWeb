import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageSquare, Check, Sparkles } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockCommunities = [
  { id: "c-1", name: "StudLyf AI Builders", platform: "Discord Server", members: "12,400+", topic: "Collaborations, Hackathons, LLM fine-tuning setups, and Groq integration tips.", inviteLink: "https://discord.gg/studlyf-ai" },
  { id: "c-2", name: "Early SaaS Hackers", platform: "Slack Community", members: "4,800+", topic: "Product-market validation, Stripe APIs, cold outbound frameworks, and pitch decks feedback.", inviteLink: "https://slack.com/studlyf-saas" },
  { id: "c-3", name: "Delhi/NCR Tech Chapter", platform: "WhatsApp Group", members: "840", topic: "Local coffee mixers, demo presentations, angel networking, and campus recruitment panels.", inviteLink: "https://chat.whatsapp.com/delhi-tech" },
  { id: "c-4", name: "Bengaluru Product Circle", platform: "Slack Community", members: "9,200+", topic: "Product management teardowns, growth marketing plays, and local startup job boards.", inviteLink: "https://slack.com/blr-product" }
];

const DiscoverCommunities: React.FC = () => {
  const navigate = useNavigate();
  const [joined, setJoined] = useState<string[]>([]);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  const handleJoin = (id: string, link: string) => {
    setJoined(prev => [...prev, id]);
    window.open(link, '_blank');
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="communities" cursorOffset={cursorOffset} />

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
            <Users className="w-9 h-9 text-indigo-600" /> Chapters & Communities
          </h1>
          <p className="text-xs text-slate-500 font-medium">Join Discord rooms, local chapters, and Slack workspaces to network with peer builders.</p>
        </div>

        {/* Community cards list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCommunities.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</h3>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider">
                      {c.platform}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{c.members} members</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[48px] font-medium">{c.topic}</p>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Verified Space
                </div>
                {joined.includes(c.id) ? (
                  <button className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-default shadow-md">
                    <Check className="w-3.5 h-3.5" /> Invited
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(c.id, c.inviteLink)}
                    className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Join Room
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

export default DiscoverCommunities;
