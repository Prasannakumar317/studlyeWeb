import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Check } from 'lucide-react';
import DiscoverBackground from './DiscoverBackground';

const mockEvents = [
  { id: "e-1", title: "National Demo Day 2026", desc: "Top 20 student-led startups present their products to 50+ VCs and angel investors from across India.", date: "July 12, 2026 • 2:00 PM", location: "Bengaluru Innovation Hub (Physical)", rsvps: 340, tags: ["Demo Day", "VC Pitch"] },
  { id: "e-2", title: "Micro-SaaS Pitch Night", desc: "Showcase early-stage B2B SaaS workflows, automation tools, and productivity dashboard hacks.", date: "July 18, 2026 • 6:30 PM", location: "Online (Discord Live)", rsvps: 180, tags: ["Pitch", "Online"] },
  { id: "e-3", title: "VC Speed Dating", desc: "1-on-1 networking sessions with active investment associates from Elevation, Kalaari, and Sequoia.", date: "August 02, 2026 • 11:00 AM", location: "Taj MG Road, Bengaluru (Physical)", rsvps: 95, tags: ["Networking", "Investors"] },
  { id: "e-4", title: "Edtech & Learner Mixers", desc: "Connect with course builders, student organizers, and education developers in our community.", date: "August 10, 2026 • 5:00 PM", location: "Online (Vite Space Room)", rsvps: 210, tags: ["Mixer", "Online"] }
];

const DiscoverEvents: React.FC = () => {
  const navigate = useNavigate();
  const [rsvped, setRsvped] = useState<string[]>([]);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setCursorOffset({ x, y });
  };

  const handleRsvp = (id: string) => {
    setRsvped(prev => [...prev, id]);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFBFF] text-slate-800 pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none"
    >
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category="events" cursorOffset={cursorOffset} />

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
            <Calendar className="w-9 h-9 text-indigo-600" /> Events Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium">Join online pitch sessions, demo days, and peer networking mixers.</p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockEvents.map((evt, index) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(79, 70, 229, 0.4)' }}
              className="p-6 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col justify-between group shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{evt.title}</h3>
                  <div className="flex flex-wrap gap-1 justify-end shrink-0">
                    {evt.tags.map(t => (
                      <span key={t} className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[48px] font-medium">{evt.desc}</p>

                {/* Date & Location */}
                <div className="space-y-2.5 text-xs text-slate-700 pt-3 border-t border-slate-100 font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-black">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{evt.rsvps + (rsvped.includes(evt.id) ? 1 : 0)} Attending</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                {rsvped.includes(evt.id) ? (
                  <button className="w-full text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-default shadow-sm">
                    <Check className="w-4 h-4" /> RSVP Confirmed
                  </button>
                ) : (
                  <button
                    onClick={() => handleRsvp(evt.id)}
                    className="w-full text-xs font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 py-3 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    RSVP for Event
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

export default DiscoverEvents;
