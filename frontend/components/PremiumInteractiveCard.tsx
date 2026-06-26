import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

export interface PremiumInteractiveCardProps {
  glowColor?: 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'cyan';
  isActive?: boolean;
  gradientBorder?: boolean;
  className?: string;
  children: React.ReactNode;
  artworkUrl?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  badge?: string;
  style?: React.CSSProperties;
}

export const PremiumInteractiveCard: React.FC<PremiumInteractiveCardProps> = ({
  glowColor = 'blue',
  isActive = false,
  gradientBorder = true,
  className = "",
  children,
  artworkUrl,
  onClick,
  badge,
  style = {}
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate tracking relative to the card's bounding box [0 to 1]
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs for cursor responsiveness
  const springX = useSpring(mouseX, { stiffness: 100, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 15 });

  // 3D rotation mappings (Max 6 to 8 degrees tilt)
  const rotateX = useTransform(springY, [0, 1], [7, -7]);
  const rotateY = useTransform(springX, [0, 1], [-7, 7]);

  // Parallax shifts for background artwork (shifts slightly opposite to cursor)
  const artworkX = useTransform(springX, [0, 1], [10, -10]);
  const artworkY = useTransform(springY, [0, 1], [10, -10]);

  // Cursor light reflection gradient coordinates
  const lightX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const lightY = useTransform(springY, [0, 1], ["0%", "100%"]);
  const reflectionBackground = useMotionTemplate`radial-gradient(circle at ${lightX} ${lightY}, rgba(255, 255, 255, 0.28) 0%, transparent 60%)`;

  // Spring animations for card lift and scaling
  const liftY = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const scale = useSpring(useMotionValue(isActive ? 1.03 : 1), { stiffness: 120, damping: 20 });

  useEffect(() => {
    scale.set(isActive ? 1.04 : isHovered ? 1.035 : 1);
    liftY.set(isHovered ? -10 : 0);
  }, [isActive, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    mouseX.set(relativeX);
    mouseY.set(relativeY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Determine border gradient base colors based on theme color
  const getGradientBorderClasses = () => {
    if (!gradientBorder) return "border border-white/50";
    switch (glowColor) {
      case 'blue': return "from-blue-400 via-indigo-500 to-purple-500";
      case 'purple': return "from-purple-400 via-indigo-500 to-pink-500";
      case 'pink': return "from-pink-400 via-orange-500 to-rose-500";
      case 'orange': return "from-orange-400 via-yellow-500 to-red-500";
      case 'green': return "from-emerald-400 via-teal-500 to-blue-500";
      case 'cyan': return "from-cyan-400 via-blue-500 to-indigo-500";
      default: return "from-indigo-400 via-purple-500 to-pink-500";
    }
  };

  return (
    <div 
      className="relative group/premium flex items-center justify-center select-none"
      style={{ ...style }}
    >
      {/* 1. Ambient pulsing background glow (matches theme, is stronger on active/hover) */}
      <div 
        className={`absolute inset-0 -z-10 rounded-[28px] opacity-0 group-hover/premium:opacity-100 transition-opacity duration-500 pointer-events-none scale-105 animate-premium-pulse-glow glow-theme-${glowColor} ${
          isActive ? 'opacity-100 scale-110 !duration-1000' : ''
        }`}
      />

      {/* 2. Main 3D Card Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          y: liftY,
          scale: scale,
          transformStyle: "preserve-3d",
          perspective: 1000
        }}
        whileTap={{ scale: 0.98 }}
        className={`relative w-full rounded-[28px] bg-white/70 backdrop-blur-xl overflow-hidden p-[1.5px] cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-white/30 transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${
          isActive ? 'shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-white/60' : ''
        } ${className}`}
      >
        {/* Continuous slow animating gradient border wrapper */}
        <div className={`absolute inset-0 -z-10 bg-gradient-to-tr rounded-[28px] animate-premium-gradient-border opacity-50 group-hover/premium:opacity-100 transition-opacity duration-300 ${getGradientBorderClasses()}`} />

        {/* Inner Card Card-Face */}
        <div className="relative w-full h-full bg-[#FCFCFD]/90 rounded-[26.5px] p-6 overflow-hidden flex flex-col justify-between [transform-style:preserve-3d]">
          
          {/* Constant slow floating background loop overlay (when idle) */}
          <motion.div 
            animate={!isHovered && !isActive ? {
              y: [0, -4, 0],
              rotate: [0, 0.3, -0.3, 0]
            } : {}}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 pointer-events-none -z-10"
          />

          {/* 3. Parallax Artwork Layer (Moves independently behind content) */}
          {artworkUrl && (
            <div className="absolute inset-0 -z-20 overflow-hidden rounded-[26.5px]">
              <motion.div 
                style={{
                  x: artworkX,
                  y: artworkY,
                  scale: isHovered ? 1.08 : 1.02
                }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 20
                }}
                className="absolute inset-0 w-full h-full"
              >
                <img 
                  src={artworkUrl} 
                  alt="" 
                  className="w-full h-full object-cover opacity-[0.09] filter saturate-[1.2]" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#FCFCFD]/50 via-transparent to-[#FCFCFD]" />
              </motion.div>
            </div>
          )}

          {/* 4. Glass Shimmer Sweep overlay (sweeps diagonally every few seconds) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[26.5px]">
            <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/20 to-transparent -rotate-[45deg] animate-premium-shimmer-sweep" />
          </div>

          {/* 5. Cursor Reflection Follower overlay */}
          <motion.div 
            style={{ background: reflectionBackground }} 
            className="absolute inset-0 pointer-events-none mix-blend-overlay z-20 rounded-[26.5px]" 
          />

          {/* 6. Card content wrapper */}
          <div className="w-full h-full relative z-10 flex flex-col justify-between">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumInteractiveCard;
