import { GroundingSource } from "../../types/startup-validator";
import { Link2, ExternalLink } from "lucide-react";

interface SourceLinksProps {
  sources: GroundingSource[];
}

export default function SourceLinks({ sources }: SourceLinksProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-6 text-center border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/5" id="no-sources-state">
        <p className="text-xs text-slate-500 font-sans">
          Grounding complete. This report was generated using state-of-the-art market context. No direct URL annotations returned.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm" id="sources-links-panel">
      <div className="flex items-center space-x-2 mb-4">
        <Link2 className="w-4 h-4 text-slate-500" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-sans">
          Live Search Grounding Sources ({sources.length})
        </h4>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4 leading-relaxed">
        Our LLM executed dynamic Google searches to gather the most current competitive and financial details. You can inspect the primary references below:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sources.map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-100 hover:bg-indigo-50/20 dark:hover:border-indigo-900/30 dark:hover:bg-indigo-950/10 transition-all group"
            id={`source-link-${idx}`}
          >
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-sans">
                {src.title || "Web Reference"}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono mt-0.5">
                {src.url}
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 flex-shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
