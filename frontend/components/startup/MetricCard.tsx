import { motion } from "framer-motion";
import { TrendingUp, Users, ShieldAlert, Award, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

interface MetricCardProps {
  label: string;
  score: number;
  rationale: string;
  type: "demand" | "competition" | "scalability" | "revenuePotential";
}

export default function MetricCard({ label, score, rationale, type }: MetricCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getTheme = () => {
    switch (type) {
      case "demand":
        return {
          bg: "bg-gradient-to-br from-blue-500/5 to-indigo-500/5 hover:from-blue-500/10 hover:to-indigo-500/10 border-blue-100 dark:border-blue-900/30",
          glow: "shadow-blue-500/5 hover:shadow-blue-500/10",
          text: "text-blue-600 dark:text-blue-400",
          bar: "bg-gradient-to-r from-blue-400 to-indigo-500",
          track: "bg-blue-100/40 dark:bg-blue-950/20",
          badge: "bg-blue-500/10 text-blue-600",
          icon: Users
        };
      case "competition":
        return {
          bg: "bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:from-purple-500/10 hover:to-pink-500/10 border-purple-100 dark:border-purple-900/30",
          glow: "shadow-purple-500/5 hover:shadow-purple-500/10",
          text: "text-purple-600 dark:text-purple-400",
          bar: "bg-gradient-to-r from-purple-400 to-pink-500",
          track: "bg-purple-100/40 dark:bg-purple-950/20",
          badge: "bg-purple-500/10 text-purple-600",
          icon: ShieldAlert
        };
      case "scalability":
        return {
          bg: "bg-gradient-to-br from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10 border-emerald-100 dark:border-emerald-900/30",
          glow: "shadow-emerald-500/5 hover:shadow-emerald-500/10",
          text: "text-emerald-600 dark:text-emerald-400",
          bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
          track: "bg-emerald-100/40 dark:bg-emerald-950/20",
          badge: "bg-emerald-500/10 text-emerald-600",
          icon: TrendingUp
        };
      case "revenuePotential":
        return {
          bg: "bg-gradient-to-br from-amber-500/5 to-orange-500/5 hover:from-amber-500/10 hover:to-orange-500/10 border-amber-100 dark:border-amber-900/30",
          glow: "shadow-amber-500/5 hover:shadow-amber-500/10",
          text: "text-amber-600 dark:text-amber-400",
          bar: "bg-gradient-to-r from-amber-400 to-orange-500",
          track: "bg-amber-100/40 dark:bg-amber-950/20",
          badge: "bg-amber-500/10 text-amber-600",
          icon: Award
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`p-6 rounded-[2.2rem] border backdrop-blur-xl bg-white/70 shadow-2xl transition-all duration-300 text-left relative overflow-hidden cursor-pointer ${theme.bg} ${theme.glow}`}
      onClick={() => setIsOpen(!isOpen)}
      id={`metric-card-${type}`}
    >
      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl bg-white border border-white shadow-sm flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${theme.text}`} />
          </div>
          <span className="text-xs font-black text-slate-700 dark:text-slate-350 font-sans tracking-tight uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-end space-x-1">
          <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono leading-none">{score}</span>
          <span className="text-[10px] text-slate-400 font-bold font-sans">/100</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative mb-4 z-10">
        <div className={`w-full h-3 rounded-full ${theme.track} overflow-hidden shadow-inner p-[2px]`}>
          <motion.div 
            className={`h-full ${theme.bar} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </div>
        
        {/* Glow indicator at the edge of active value */}
        {score > 0 && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ left: `calc(${score}% - 4px)` }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest pt-2.5 border-t border-slate-150/40 relative z-10">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
          Click to reveal research rationale
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? 14 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden relative z-10"
      >
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold pt-3.5 border-t border-slate-150/40">
          <div className="p-3 bg-white/60 rounded-xl border border-white/65 shadow-inner">
            {rationale}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
