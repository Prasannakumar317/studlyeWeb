import { Competitor } from "../../types/startup-validator";
import { DollarSign, Landmark, Shield, AlertTriangle } from "lucide-react";

interface CompetitorGridProps {
  competitors: Competitor[];
}

export default function CompetitorGrid({ competitors }: CompetitorGridProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl" id="no-competitors-state">
        <p className="text-sm text-slate-500 font-sans">No competitor data uncovered during this search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="competitor-grid">
      {competitors.map((comp, idx) => (
        <div 
          key={idx} 
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col justify-between"
          id={`competitor-card-${idx}`}
        >
          {/* Header Row */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
                  {comp.name}
                </h4>
                <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium font-sans ${
                  comp.type === "Direct" 
                    ? "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30" 
                    : "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                }`}>
                  {comp.type} Competitor
                </span>
              </div>

              {/* Funding Stage / History Badge */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider">Funding History</span>
                <span className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded border border-slate-200/60 dark:border-slate-700/50 font-mono mt-0.5">
                  <Landmark className="w-3 h-3 mr-1 text-slate-500" />
                  {comp.fundingHistory || "Undisclosed"}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-4">
              {comp.description}
            </p>
          </div>

          {/* Pricing & Strategic Gaps */}
          <div className="space-y-3 pt-3 border-t border-slate-50 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1" /> Estimated Pricing:
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">
                {comp.pricing || "N/A"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-sans">
              <div className="bg-emerald-50/40 dark:bg-emerald-950/5 p-2 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20">
                <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                  <Shield className="w-3 h-3 mr-1" /> Strength
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">{comp.strength}</p>
              </div>
              <div className="bg-amber-50/40 dark:bg-amber-950/5 p-2 rounded-lg border border-amber-100/50 dark:border-amber-900/20">
                <div className="flex items-center text-amber-700 dark:text-amber-400 font-semibold mb-1">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Gap / Weakness
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">{comp.weakness}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
