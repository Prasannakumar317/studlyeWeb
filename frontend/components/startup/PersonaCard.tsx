import { CustomerPersona } from "../../types/startup-validator";
import { AlertCircle, Activity } from "lucide-react";

interface PersonaCardProps {
  persona: CustomerPersona;
}

export default function PersonaCard({ persona }: PersonaCardProps) {
  if (!persona) return null;

  const getAvatarUrl = () => {
    const name = (persona.avatarName || "").toLowerCase();
    if (name.includes("frank")) {
      return "https://picsum.photos/seed/frank/200/200";
    } else if (name.includes("chloe")) {
      return "https://picsum.photos/seed/chloe/200/200";
    } else if (name.includes("dan")) {
      return "https://picsum.photos/seed/dan/200/200";
    } else if (name.includes("diane")) {
      return "https://picsum.photos/seed/diane/200/200";
    }
    return "https://picsum.photos/seed/user/200/200";
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300" id="customer-persona-card">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
            <img 
              src={avatarUrl} 
              alt={persona.avatarName || "Customer Persona"} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
            ★
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
              {persona.avatarName || "Ideal Customer Profile"}
            </h4>
            <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-semibold font-sans uppercase tracking-wider">
              Primary ICP
            </span>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium font-sans mt-0.5">
            {persona.idealCustomerProfile}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-2 italic leading-relaxed">
            "{persona.avatarDescription}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 font-sans">
        <div className="p-4 bg-rose-50/20 dark:bg-rose-950/5 border border-rose-100/40 dark:border-rose-900/10 rounded-xl">
          <div className="flex items-center space-x-1.5 mb-3">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Core Pain Points & Friction
            </h5>
          </div>
          <ul className="space-y-2.5">
            {persona.painPoints?.map((p, idx) => (
              <li key={idx} className="flex items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                <span className="text-rose-500 mr-2 flex-shrink-0 mt-0.5">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/40 dark:border-emerald-900/10 rounded-xl">
          <div className="flex items-center space-x-1.5 mb-3">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Buying Behavior & Preferences
            </h5>
          </div>
          <ul className="space-y-2.5">
            {persona.behavior?.map((b, idx) => (
              <li key={idx} className="flex items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                <span className="text-emerald-500 mr-2 flex-shrink-0 mt-0.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
