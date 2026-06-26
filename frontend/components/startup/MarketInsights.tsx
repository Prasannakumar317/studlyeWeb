import { MarketResearch } from "../../types/startup-validator";
import { Landmark, TrendingUp, BarChart3, PiggyBank, Target, Activity } from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";

interface MarketInsightsProps {
  research: MarketResearch;
}

export default function MarketInsights({ research }: MarketInsightsProps) {
  if (!research) return null;

  const parseMarketSize = () => {
    try {
      const text = research.marketSize || "";
      const match = text.match(/([\$\€\£\A\$]?)\s*([0-9\.,]+)\s*(Billion|Million|B|M)?/i);
      
      let symbol = "$";
      let val = 2.5; 
      let unit = "B";

      if (match) {
        symbol = match[1] || "$";
        val = parseFloat(match[2].replace(/,/g, "")) || 2.5;
        const rawUnit = match[3] || "Billion";
        if (rawUnit.toLowerCase().startsWith("m")) {
          unit = "M";
        }
      }

      const tam = val;
      const sam = Math.round((val * 0.35) * 10) / 10;
      const som = Math.round((sam * 0.12) * 10) / 10;

      return { tam, sam, som, symbol, unit };
    } catch {
      return { tam: 2.5, sam: 0.8, som: 0.1, symbol: "$", unit: "B" };
    }
  };

  const parseCAGR = () => {
    try {
      const text = research.growthTrends || "";
      const match = text.match(/([0-9\.,]+)\%/);
      if (match) {
        return parseFloat(match[1]) || 12.5;
      }
      return 12.5; 
    } catch {
      return 12.5;
    }
  };

  const { tam, sam, som, symbol, unit } = parseMarketSize();
  const cagr = parseCAGR();

  const pieData = [
    { name: "SOM (Share of Market - Beachhead)", value: som, color: "#14b8a6" }, 
    { name: "SAM (Serviceable Addressable Market)", value: Math.max(0, sam - som), color: "#6366f1" }, 
    { name: "TAM (Unreached Total Addressable Market)", value: Math.max(0, tam - sam), color: "#ec4899" } 
  ];

  const trajectoryData = [];
  const startYear = 2026;
  let runningVal = tam;
  for (let i = 0; i <= 5; i++) {
    const year = startYear + i;
    trajectoryData.push({
      year: String(year),
      marketSize: Math.round(runningVal * 100) / 100
    });
    runningVal = runningVal * (1 + cagr / 100);
  }

  return (
    <div className="space-y-6" id="market-insights-panel">
      
      {/* Premium Multi-colored Cards Header Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* TAM Card (Pink) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 via-pink-50/40 to-white dark:from-pink-950/20 dark:via-slate-900 dark:to-slate-900 border border-pink-100 dark:border-pink-900/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-500/5 rounded-full blur-xl" />
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="p-2 rounded-xl bg-pink-500 text-white shadow-sm">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-extrabold text-pink-600 dark:text-pink-400 uppercase tracking-widest font-sans">
              Total Addressable Market
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
            {symbol}{tam}{unit}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans">
            The full potential market size if 100% market share is achieved globally.
          </p>
        </div>

        {/* SAM Card (Indigo) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-indigo-50/40 to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-sm">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-sans">
              Serviceable Addressable Market
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
            {symbol}{sam}{unit}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans">
            The share of the TAM that fits your product parameters and localized geography.
          </p>
        </div>

        {/* SOM Card (Teal) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-500/10 via-teal-50/40 to-white dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900 border border-teal-100 dark:border-teal-900/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="p-2 rounded-xl bg-teal-500 text-white shadow-sm">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-sans">
              Serviceable Obtainable Market
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
            {symbol}{som}{unit}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans">
            Your immediate beachhead target market size achievable over the next 1-3 years.
          </p>
        </div>

      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Share Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-sans">
                Venture Segment Distribution
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mb-4">
              Visual share of Total, Serviceable, and Obtainable Beachhead market limits
            </p>
          </div>

          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => [`${symbol}${value} ${unit}`, "Market Size"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                    fontFamily: "sans-serif"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 font-sans text-[10px]">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase truncate max-w-[80px]">
                    {entry.name.split(" ")[0]}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {symbol}{entry.value}{unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Forecast Area Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-sans">
                Industry Market Expansion Curve
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mb-4">
              Projected 5-year industry size trajectory based on compounding {cagr}% CAGR
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis 
                  dataKey="year" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${symbol}${val}`}
                />
                <RechartsTooltip 
                  formatter={(value: any) => [`${symbol}${value} ${unit}`, "Global Industry Size"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                    fontFamily: "sans-serif"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="marketSize" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorMarket)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between text-[11px] font-sans">
            <span className="text-slate-400 dark:text-slate-500">Historical Growth Model</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              <span>+{cagr}% Compounding Annually</span>
            </span>
          </div>
        </div>

      </div>

      {/* Macro Analysis Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-sans">
            Macro-Level Industry Analysis & Research Context
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          {research.industryOverview}
        </p>
      </div>

    </div>
  );
}
