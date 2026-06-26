import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscoverBackgroundProps {
  category: string; // startups, founders, investors, etc.
  cursorOffset?: { x: number; y: number };
}

// Custom category SVGs representing visual identities (adapted for light theme)
const StartupsSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <path d="M50 500 h700 M100 500 V300 h50 v200 M200 500 V200 h80 v300 M350 500 V150 h60 v350 M480 500 V250 h70 v250 M620 500 V350 h60 v150" strokeWidth="1.5" strokeDasharray="6 6" />
    <circle cx="150" cy="300" r="5" fill="#4F9DFF" className="animate-pulse" />
    <circle cx="280" cy="200" r="5" fill="#A855F7" />
    <circle cx="350" cy="150" r="6" fill="#FF6EC7" className="animate-ping" />
    <circle cx="550" cy="250" r="5" fill="#3DD9B4" />
    <path d="M150 300 L280 200 L350 150 L550 250" strokeWidth="1" opacity="0.3" />
  </svg>
);

const FoundersSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <circle cx="400" cy="300" r="50" strokeWidth="1.5" opacity="0.4" />
    <circle cx="400" cy="300" r="110" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
    <circle cx="400" cy="300" r="180" strokeWidth="1" opacity="0.2" />
    <circle cx="300" cy="250" r="9" fill="#A855F7" />
    <circle cx="500" cy="350" r="11" fill="#FF6EC7" />
    <circle cx="350" cy="420" r="7" fill="#FFD84D" />
    <line x1="300" y1="250" x2="400" y2="300" strokeWidth="1" opacity="0.3" />
    <line x1="500" y1="350" x2="400" y2="300" strokeWidth="1" opacity="0.3" />
    <line x1="350" y1="420" x2="400" y2="300" strokeWidth="1" opacity="0.3" />
  </svg>
);

const InvestorsSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <path d="M100 100 v400 h600" strokeWidth="2" opacity="0.3" />
    <path d="M100 450 L250 380 L400 410 L550 240 L700 150" strokeWidth="2.5" />
    <circle cx="250" cy="380" r="6" fill="#3DD9B4" />
    <circle cx="400" cy="410" r="6" fill="#4F9DFF" />
    <circle cx="550" cy="240" r="6" fill="#A855F7" />
    <circle cx="700" cy="150" r="7" fill="#FFD84D" className="animate-pulse" />
    <path d="M100 200 h600 M100 300 h600 M100 400 h600" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
  </svg>
);

const CommunitiesSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <circle cx="250" cy="200" r="15" strokeWidth="1.5" />
    <circle cx="550" cy="200" r="15" strokeWidth="1.5" />
    <circle cx="400" cy="400" r="20" strokeWidth="2" />
    <path d="M265 200 H535 M400 380 L265 200 M400 380 L535 200" strokeWidth="1.2" opacity="0.3" />
    <circle cx="400" cy="200" r="7" fill="#FF6EC7" />
    <circle cx="330" cy="290" r="7" fill="#4F9DFF" />
    <circle cx="470" cy="290" r="7" fill="#A855F7" />
  </svg>
);

const TechnologiesSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <rect x="350" y="250" width="100" height="100" rx="10" strokeWidth="2" opacity="0.4" />
    <path d="M350 300 H200 v-50 M450 300 H600 v50 M400 250 V150 h50 M400 350 V450 h-50" strokeWidth="1.5" opacity="0.3" />
    <circle cx="200" cy="250" r="6" fill="#A855F7" />
    <circle cx="600" cy="350" r="6" fill="#FF6EC7" />
    <circle cx="450" cy="150" r="6" fill="#4F9DFF" />
    <circle cx="350" cy="450" r="6" fill="#3DD9B4" />
  </svg>
);

const FundingSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <rect x="150" y="150" width="500" height="300" rx="15" strokeWidth="1.5" opacity="0.3" />
    <path d="M200 400 L300 340 L400 370 L500 240 L600 270" strokeWidth="2.5" />
    <circle cx="500" cy="240" r="7" fill="#FFD84D" className="animate-pulse" />
    <circle cx="600" cy="270" r="7" fill="#3DD9B4" />
    <path d="M150 250 h500 M150 350 h500" strokeWidth="1" strokeDasharray="4 4" opacity="0.1" />
  </svg>
);

const EventsSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <path d="M150 100 L300 450 M650 100 L500 450" strokeWidth="2.5" opacity="0.2" />
    <path d="M300 450 h200 M350 450 v-30 h100 v30" strokeWidth="2" opacity="0.4" />
    <circle cx="400" cy="150" r="30" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
    <circle cx="250" cy="300" r="6" fill="#FF6B6B" />
    <circle cx="550" cy="300" r="6" fill="#FFD84D" />
  </svg>
);

const LearningSvg = () => (
  <svg className="w-full h-full stroke-current" fill="none" viewBox="0 0 800 600">
    <path d="M300 350 h200 v-100 L400 200 L300 250 Z" strokeWidth="1.5" opacity="0.4" />
    <line x1="400" y1="200" x2="400" y2="350" strokeWidth="1.5" opacity="0.4" />
    <path d="M250 420 L400 380 L550 420" strokeWidth="1" opacity="0.2" />
    <circle cx="400" cy="200" r="6" fill="#3DD9B4" />
    <circle cx="300" cy="250" r="5" fill="#4F9DFF" />
    <circle cx="500" cy="250" r="5" fill="#A855F7" />
  </svg>
);

// Map categories to vibrant light themes
const themeMap: Record<string, {
  colorBg: string;
  blobColorLeft: string;
  blobColorRight: string;
  textColor: string;
  svg: React.ComponentType;
}> = {
  startups: {
    colorBg: 'rgba(79, 70, 229, 0.08)',
    blobColorLeft: '#4F9DFF', // Blue
    blobColorRight: '#A855F7', // Purple
    textColor: 'text-indigo-400/20',
    svg: StartupsSvg
  },
  founders: {
    colorBg: 'rgba(236, 72, 153, 0.08)',
    blobColorLeft: '#FF6EC7', // Pink
    blobColorRight: '#FF6B6B', // Coral
    textColor: 'text-pink-400/20',
    svg: FoundersSvg
  },
  investors: {
    colorBg: 'rgba(16, 185, 129, 0.08)',
    blobColorLeft: '#3DD9B4', // Mint
    blobColorRight: '#4F9DFF', // Blue
    textColor: 'text-teal-400/20',
    svg: InvestorsSvg
  },
  communities: {
    colorBg: 'rgba(168, 85, 247, 0.08)',
    blobColorLeft: '#A855F7', // Purple
    blobColorRight: '#FF6EC7', // Pink
    textColor: 'text-purple-400/20',
    svg: CommunitiesSvg
  },
  technologies: {
    colorBg: 'rgba(6, 182, 212, 0.08)',
    blobColorLeft: '#4F9DFF', // Blue
    blobColorRight: '#3DD9B4', // Mint
    textColor: 'text-cyan-400/20',
    svg: TechnologiesSvg
  },
  funding: {
    colorBg: 'rgba(16, 185, 129, 0.08)',
    blobColorLeft: '#3DD9B4', // Mint
    blobColorRight: '#4F9DFF', // Blue
    textColor: 'text-emerald-400/20',
    svg: FundingSvg
  },
  events: {
    colorBg: 'rgba(244, 63, 94, 0.08)',
    blobColorLeft: '#FF6B6B', // Coral
    blobColorRight: '#FF6EC7', // Pink
    textColor: 'text-rose-400/20',
    svg: EventsSvg
  },
  learning: {
    colorBg: 'rgba(13, 148, 136, 0.08)',
    blobColorLeft: '#4F9DFF', // Blue
    blobColorRight: '#3DD9B4', // Mint
    textColor: 'text-teal-400/20',
    svg: LearningSvg
  },
  jobs: {
    colorBg: 'rgba(245, 158, 11, 0.08)',
    blobColorLeft: '#FF6B6B', // Coral
    blobColorRight: '#FFD84D', // Yellow
    textColor: 'text-amber-400/20',
    svg: StartupsSvg
  },
  industries: {
    colorBg: 'rgba(245, 158, 11, 0.08)',
    blobColorLeft: '#FFD84D', // Yellow
    blobColorRight: '#FF6B6B', // Coral
    textColor: 'text-yellow-400/20',
    svg: TechnologiesSvg
  },
  collections: {
    colorBg: 'rgba(236, 72, 153, 0.08)',
    blobColorLeft: '#FF6EC7', // Pink
    blobColorRight: '#FF6B6B', // Coral
    textColor: 'text-pink-400/20',
    svg: FoundersSvg
  },
  ecosystems: {
    colorBg: 'rgba(79, 70, 229, 0.08)',
    blobColorLeft: '#4F9DFF', // Blue
    blobColorRight: '#A855F7', // Purple
    textColor: 'text-indigo-400/20',
    svg: CommunitiesSvg
  },
  news: {
    colorBg: 'rgba(59, 130, 246, 0.08)',
    blobColorLeft: '#4F9DFF', // Blue
    blobColorRight: '#3DD9B4', // Mint
    textColor: 'text-blue-400/20',
    svg: InvestorsSvg
  }
};

const DiscoverBackground: React.FC<DiscoverBackgroundProps> = ({ 
  category, 
  cursorOffset = { x: 0, y: 0 } 
}) => {
  const normCategory = category.toLowerCase();
  const theme = themeMap[normCategory] || themeMap.startups;
  const SVGIcon = theme.svg;

  // Statically generated particles list for light theme
  const particles = React.useMemo(() => {
    const bubbleColors = ['#FF6EC7', '#4F9DFF', '#FFD84D', '#A855F7', '#FF6B6B', '#3DD9B4'];
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 4, // slightly larger, soft bubbles
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5,
      color: bubbleColors[i % bubbleColors.length]
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#FAFBFF]">
      
      {/* ─── Layer 1: Animated Gradient Mesh ─── */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={normCategory + '_mesh'}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            background: `radial-gradient(circle at ${50 + cursorOffset.x * 6}% ${40 + cursorOffset.y * 6}%, ${theme.colorBg} 0%, transparent 70%)`
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </AnimatePresence>

      {/* ─── Layer 2: Blurred Ambient Glow Blobs ─── */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={normCategory + '_blobs'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }} // higher opacity for bright premium feel
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Blob 1 */}
          <motion.div
            animate={{
              x: cursorOffset.x * 18,
              y: cursorOffset.y * 18
            }}
            transition={{ type: "spring", stiffness: 45, damping: 18 }}
            style={{ backgroundColor: theme.blobColorLeft }}
            className="absolute -top-[10%] left-[10%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full blur-[140px]"
          />
          {/* Blob 2 */}
          <motion.div
            animate={{
              x: -cursorOffset.x * 18,
              y: -cursorOffset.y * 18
            }}
            transition={{ type: "spring", stiffness: 45, damping: 18 }}
            style={{ backgroundColor: theme.blobColorRight }}
            className="absolute bottom-[10%] right-[10%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full blur-[140px]"
          />
        </motion.div>
      </AnimatePresence>

      {/* ─── Layer 3: Dynamic Technology Illustration ─── */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={normCategory + '_svg'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: cursorOffset.x * 8,
            y: cursorOffset.y * 8
          }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute inset-0 flex items-center justify-center ${theme.textColor} max-w-4xl mx-auto`}
        >
          <SVGIcon />
        </motion.div>
      </AnimatePresence>

      {/* ─── Layer 4: Particle System ─── */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: ["0%", "-35%", "0%"],
              x: ["0%", `${cursorOffset.x * 20}px`, "0%"],
              opacity: [0.15, 0.45, 0.15]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay
            }}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* ─── Layer 5: Subtle Premium Dot Grid Texture ─── */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1.2px, transparent 1.2px)', backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFF]/0 via-[#FAFBFF]/40 to-[#FAFBFF]" />

      {/* ─── Layer 6: Glass Overlays & Light reflections ─── */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]" />

      {/* ─── Layer 7: Dynamic Foreground Lighting Beam ─── */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={normCategory + '_beam'}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 0.4,
            x: cursorOffset.x * 20
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute -top-[50%] left-[20%] w-[60%] h-[200%] bg-gradient-to-b from-transparent via-white/40 to-transparent blur-[100px] rotate-12"
        />
      </AnimatePresence>

    </div>
  );
};

export default DiscoverBackground;
