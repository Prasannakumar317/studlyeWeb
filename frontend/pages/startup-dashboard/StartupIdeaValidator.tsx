import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Search, 
  Lightbulb, 
  MapPin, 
  Target, 
  Users, 
  BrainCircuit, 
  ChevronRight, 
  ArrowLeft, 
  Compass, 
  Trash2, 
  Save, 
  Share2, 
  HelpCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  TrendingUp,
  Award,
  Zap,
  Info,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Check
} from "lucide-react";

import { FounderInputs, ValidationReport, GroundingSource, SavedIdea } from "../../types/startup-validator";
import { STARTUP_PRESETS, StartupPreset } from "../../data/startup-presets";
import MetricCard from "../../components/startup/MetricCard";
import CompetitorGrid from "../../components/startup/CompetitorGrid";
import PersonaCard from "../../components/startup/PersonaCard";
import SourceLinks from "../../components/startup/SourceLinks";
import MarketInsights from "../../components/startup/MarketInsights";
import { API_BASE_URL, authHeaders } from "../../apiConfig";

const steps = [
  {
    id: "idea",
    title: "Startup Pitch",
    description: "What core product or service are you creating?",
    icon: Lightbulb,
    color: "text-blue-500 bg-blue-50 border-blue-100",
    gradient: "from-blue-500 to-cyan-400",
    why: "A clear startup pitch highlights your core product utility. Keep it focused and describe the value proposition simply.",
    example: "A peer-to-peer solar grid marketplace that allows homeowners to trade excess energy locally.",
  },
  {
    id: "problemStatement",
    title: "Target Problem",
    description: "What primary pain point or friction does this solve?",
    icon: Target,
    color: "text-purple-500 bg-purple-50 border-purple-100",
    gradient: "from-purple-500 to-indigo-400",
    why: "Successful startups begin with painful problems. Clearly outline the core friction your customers face.",
    example: "Homeowners cannot easily sell excess solar energy to neighbors due to municipal restrictions and lack of grid software.",
  },
  {
    id: "customerSegment",
    title: "Customer Segment",
    description: "Who is your primary beachhead customer?",
    icon: Users,
    color: "text-pink-500 bg-pink-50 border-pink-100",
    gradient: "from-pink-500 to-rose-400",
    why: "If everyone is your customer, no one is. Define a narrow initial target segment to win your beachhead market.",
    example: "Suburban homeowners with grid-tied solar panels looking to offset billing limits.",
  },
  {
    id: "geography",
    title: "Geography scope",
    description: "Where will you launch this venture initially?",
    icon: MapPin,
    color: "text-emerald-500 bg-emerald-50 border-emerald-100",
    gradient: "from-emerald-500 to-teal-400",
    why: "Ecosystem conditions, distribution networks, regulations, and marketing methods are bounded by geography.",
    example: "California, USA (due to favorable net-metering structures and high solar adoption).",
  }
];

export default function StartupIdeaValidator() {
  const [inputs, setInputs] = useState<FounderInputs>({
    idea: "",
    problemStatement: "",
    customerSegment: "",
    geography: ""
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"dashboard" | "market" | "competitors" | "persona" | "sources">("dashboard");
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [tipIndex, setTipIndex] = useState(0);
  const loadingTips = [
    "Sophisticated founders spend up to 50% of their early cycles purely validating market risk before coding.",
    "Search Grounding: By querying Google in real-time, our system uncovers active competitors rather than outdated datasets.",
    "Crunchbase-style competitor discovery extracts funding history and pricing models to gauge capitalization barriers.",
    "A single numeric validation score is incomplete without analyzing Demand, Scalability, and Barriers separately.",
    "Pivot verdicts are highly common and should be celebrated — finding out early saves months of waste.",
    "A tight Customer Segment focus increases initial conversion. If everyone is your customer, no one is."
  ];

  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    let tipInterval: NodeJS.Timeout;

    if (isLoading) {
      stepInterval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 3500);

      tipInterval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 4500);
    } else {
      setLoadingStep(0);
      setTipIndex(0);
    }

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [isLoading]);

  useEffect(() => {
    const local = localStorage.getItem("rava_saved_ideas");
    if (local) {
      try {
        setSavedIdeas(JSON.parse(local));
      } catch (err) {
        console.error("Error reading saved ideas:", err);
      }
    }
  }, []);

  const saveIdeaToLocalStorage = (newReport: ValidationReport, currentSources: GroundingSource[]) => {
    const newSaved: SavedIdea = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      idea: inputs.idea,
      problemStatement: inputs.problemStatement,
      customerSegment: inputs.customerSegment,
      geography: inputs.geography,
      timestamp: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      report: newReport,
      sources: currentSources
    };

    const updated = [newSaved, ...savedIdeas];
    setSavedIdeas(updated);
    localStorage.setItem("rava_saved_ideas", JSON.stringify(updated));
  };

  const deleteSavedIdea = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedIdeas.filter(idea => idea.id !== id);
    setSavedIdeas(updated);
    localStorage.setItem("rava_saved_ideas", JSON.stringify(updated));
  };

  const loadSavedIdea = (saved: SavedIdea) => {
    setInputs({
      idea: saved.idea,
      problemStatement: saved.problemStatement,
      customerSegment: saved.customerSegment,
      geography: saved.geography
    });
    setReport(saved.report);
    setSources(saved.sources);
    setActiveTab("dashboard");
    setShowHistory(false);
    setError(null);
    setActiveStep(0);
  };

  const handleApplyPreset = (preset: StartupPreset) => {
    setInputs({
      idea: preset.idea,
      problemStatement: preset.problemStatement,
      customerSegment: preset.customerSegment,
      geography: preset.geography
    });
    setError(null);
    setActiveStep(0);
  };

  const handleValidate = async (e?: React.FormEvent, forceSimulate = false) => {
    if (e) e.preventDefault();
    if (!inputs.idea || !inputs.problemStatement || !inputs.customerSegment || !inputs.geography) {
      setError("Please complete all four founder input fields before validating.");
      return;
    }

    setError(null);
    setIsQuotaError(false);
    setIsLoading(true);
    setLoadingStep(0);
    setReport(null);
    setSources([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/startup/validate-idea`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          ...inputs,
          simulate: forceSimulate
        })
      });

      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.error || "Failed to validate your idea.");
      }

      if (!resData.success) {
        if (resData.isQuotaError) {
          setIsQuotaError(true);
          setError(resData.error);
          return;
        }
        throw new Error(resData.error || "Failed to validate your idea.");
      }

      setReport(resData.data);
      setSources(resData.sources || []);
      saveIdeaToLocalStorage(resData.data, resData.sources || []);
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      const errMsg = String(err.message || "");
      const isQuota = errMsg.includes("429") || 
                      errMsg.toLowerCase().includes("quota") || 
                      errMsg.includes("RESOURCE_EXHAUSTED") || 
                      errMsg.toLowerCase().includes("limit");
      if (isQuota) {
        setIsQuotaError(true);
        setError("Gemini API Quota Exceeded (429). The real-time web-grounding engine is currently rate-limited by API quotas. Would you like to bypass and run in simulated sandbox mode?");
      } else {
        setError(errMsg || "An unexpected network error occurred. Please check your setup.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadingSubText = [
    "Executing Google Search grounding query to analyze current market conditions...",
    "Crawling competitor pricing models, landing pages, and funding histories...",
    "Structuring ideal target customer personas, pain points, and behavioral patterns...",
    "Synthesizing multi-dimensional scores across Demand, Scalability, and Market Potential...",
    "Drafting final Go / Pivot / No-Go investment jury rationale..."
  ];

  const getVerdictStyles = (verdict: string) => {
    const v = verdict?.toLowerCase() || "";
    if (v.includes("go") && !v.includes("no-go") && !v.includes("pivot")) {
      return {
        bg: "bg-emerald-50/60 border-emerald-100/70 shadow-emerald-500/5",
        text: "text-emerald-700",
        badge: "bg-emerald-500 text-white",
        icon: CheckCircle2,
        label: "GO"
      };
    } else if (v.includes("pivot")) {
      return {
        bg: "bg-amber-50/60 border-amber-100/70 shadow-amber-500/5",
        text: "text-amber-700",
        badge: "bg-amber-500 text-white",
        icon: AlertTriangle,
        label: "PIVOT"
      };
    } else {
      return {
        bg: "bg-rose-50/60 border-rose-100/70 shadow-rose-500/5",
        text: "text-rose-700",
        badge: "bg-rose-500 text-white",
        icon: XCircle,
        label: "NO-GO"
      };
    }
  };

  const verdictTheme = report ? getVerdictStyles(report.summaryAndNextSteps.verdict) : null;
  const VerdictIcon = verdictTheme?.icon;

  const currentStepInfo = steps[activeStep];
  const StepIcon = currentStepInfo.icon;
  const currentInputValue = inputs[currentStepInfo.id as keyof FounderInputs] || "";

  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const calculateProgress = () => {
    let filled = 0;
    if (inputs.idea.trim()) filled++;
    if (inputs.problemStatement.trim()) filled++;
    if (inputs.customerSegment.trim()) filled++;
    if (inputs.geography.trim()) filled++;
    return (filled / 4) * 100;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50/30 text-slate-900 font-sans pb-12 text-left relative overflow-hidden"
    >
      {/* Ambient Radial Glowing Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-pink-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Upper header summary banner */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 py-6 px-6 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-indigo-500/10">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                AI Startup Lab Validator
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1.5 max-w-2xl leading-relaxed">
              Verify demand parameters, search-grounded competitors, and regional legal hurdles inside a dynamic AI interview deck.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-center space-x-2 px-4.5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition duration-200 shadow-sm cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-500" />
              <span>Saved Sandboxes ({savedIdeas.length})</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* Validation History Drawer */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 28 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden bg-white/90 backdrop-blur-2xl border border-slate-150 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-100/30"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" /> Previous Idea Sandboxes
                </span>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-xs text-[#EC4899] font-black hover:underline bg-transparent border-none cursor-pointer"
                >
                  Close History
                </button>
              </div>

              {savedIdeas.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-sans text-xs font-semibold">
                  No saved validation snapshots in this local session yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedIdeas.map((idea) => {
                    const styles = getVerdictStyles(idea.report.summaryAndNextSteps.verdict);
                    return (
                      <motion.div
                        whileHover={{ y: -4, scale: 1.01 }}
                        key={idea.id}
                        onClick={() => loadSavedIdea(idea)}
                        className="p-4.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#EC4899]/30 hover:shadow-xl hover:shadow-[#EC4899]/5 cursor-pointer transition duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-slate-400 font-mono">{idea.timestamp}</span>
                            <span className={`px-2 py-0.5 text-[8.5px] font-black rounded ${styles.badge} shadow-sm`}>
                              {styles.label}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                            {idea.idea}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold line-clamp-2 mt-1 leading-normal">
                            {idea.problemStatement}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100/50 mt-3">
                          <span className="text-[9px] text-slate-400 font-bold flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-[#EC4899]" /> {idea.geography}
                          </span>
                          <button
                            onClick={(e) => deleteSavedIdea(idea.id, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition duration-150 bg-transparent border-none cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Thinking State Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/30 backdrop-blur-md px-6"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-md w-full bg-white/90 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Decorative Mesh Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#EC4899]/10 via-[#6366f1]/10 to-transparent -z-10" />

                {/* Simulated Radar Scan Animation */}
                <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping" />
                  <div className="absolute inset-3 rounded-full border border-pink-500/25 animate-pulse" />
                  <div className="absolute inset-6 rounded-full border-2 border-dashed border-indigo-500/20 animate-spin" />
                  <div className="w-16 h-16 bg-gradient-to-tr from-[#EC4899] to-[#6366f1] rounded-2xl shadow-xl flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-white animate-bounce" />
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 uppercase tracking-wide">
                  Synthesizing Market Intelligence <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                </h3>
                
                {/* Dynamic reasoning timeline progress */}
                <div className="space-y-3 w-full my-5 text-left font-sans text-xs">
                  {loadingSubText.map((text, idx) => {
                    const isActive = idx === loadingStep;
                    const isCompleted = idx < loadingStep;
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-3 transition-opacity duration-300 ${
                          isActive ? 'opacity-100 font-bold' : isCompleted ? 'opacity-60' : 'opacity-20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                          isActive ? 'bg-indigo-500 border-indigo-400 text-white' :
                          isCompleted ? 'bg-emerald-500 border-emerald-400 text-white' :
                          'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] truncate ${isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Did You Know Tips */}
                <div className="bg-slate-50/80 border border-slate-150/40 p-4.5 rounded-2xl text-left w-full mt-2 shadow-inner">
                  <p className="text-[9px] font-black text-[#EC4899] uppercase tracking-widest flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Research Tip
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                    {loadingTips[tipIndex]}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/80 border border-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-100/10">
              
              {/* Presets List */}
              <div className="mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">
                  Load Sandbox Templates
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {STARTUP_PRESETS.map((preset) => (
                    <motion.button
                      whileHover={{ y: -2 }}
                      key={preset.title}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-4.5 py-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-xl transition duration-150 group cursor-pointer flex flex-col shrink-0 min-w-[170px]"
                    >
                      <div className="flex items-center space-x-1.5 w-full">
                        <span className="text-xs shrink-0">{preset.emoji}</span>
                        <span className="text-[10px] font-black text-slate-700 truncate">
                          {preset.title}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100/60 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Founder Interview
                    </h3>
                  </div>
                  {/* Completeness gauge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Completeness</span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-[#EC4899]" style={{ width: `${calculateProgress()}%` }} />
                    </div>
                  </div>
                </div>

                {/* Conversational step container */}
                <div className="bg-slate-50/50 border border-slate-150/40 rounded-2xl p-5 mb-5 space-y-4">
                  
                  {/* Step status bar indicator */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-150/40">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      Step {activeStep + 1} of 4
                    </span>
                    <div className="flex gap-1.5">
                      {steps.map((_, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveStep(idx)}
                          className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${
                            idx === activeStep ? 'bg-[#EC4899]' : idx < activeStep ? 'bg-indigo-500' : 'bg-slate-200'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Step prompt content */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeStep}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl flex items-center justify-center border ${currentStepInfo.color}`}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{currentStepInfo.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold">{currentStepInfo.description}</p>
                        </div>
                      </div>

                      {/* Conversational input inputs */}
                      {activeStep === 0 && (
                        <textarea
                          value={inputs.idea}
                          onChange={(e) => setInputs({ ...inputs, idea: e.target.value })}
                          placeholder={currentStepInfo.example}
                          rows={4}
                          className="w-full p-4 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all resize-none shadow-inner"
                        />
                      )}
                      {activeStep === 1 && (
                        <textarea
                          value={inputs.problemStatement}
                          onChange={(e) => setInputs({ ...inputs, problemStatement: e.target.value })}
                          placeholder={currentStepInfo.example}
                          rows={4}
                          className="w-full p-4 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all resize-none shadow-inner"
                        />
                      )}
                      {activeStep === 2 && (
                        <input
                          type="text"
                          value={inputs.customerSegment}
                          onChange={(e) => setInputs({ ...inputs, customerSegment: e.target.value })}
                          placeholder={currentStepInfo.example}
                          className="w-full px-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner"
                        />
                      )}
                      {activeStep === 3 && (
                        <input
                          type="text"
                          value={inputs.geography}
                          onChange={(e) => setInputs({ ...inputs, geography: e.target.value })}
                          placeholder={currentStepInfo.example}
                          className="w-full px-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation step buttons */}
                  <div className="flex gap-2.5 pt-3.5 border-t border-slate-150/40 justify-between">
                    <button
                      type="button"
                      disabled={activeStep === 0}
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase border border-solid border-slate-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    {activeStep < steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer border-none shadow-md shadow-indigo-500/10"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => handleValidate(e, false)}
                        className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-[#EC4899] text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 cursor-pointer border-none shadow-lg shadow-pink-500/10"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" /> Validate
                      </motion.button>
                    )}
                  </div>

                </div>

                {/* Error Panel */}
                {error && (
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 flex items-start space-x-2 mb-5">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-[10px] font-semibold leading-relaxed">
                      {error}
                      {isQuotaError && (
                        <div className="mt-2.5 flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleValidate(undefined, true)}
                            className="px-3.5 py-1.5 bg-[#EC4899] text-white rounded-xl font-black hover:bg-pink-600 transition tracking-wide uppercase text-[9px] border-none cursor-pointer shadow-sm"
                          >
                            Run Sandbox Simulation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Persistent AI Co-pilot assistant card */}
            <div className="bg-white/80 border border-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-100/10 text-left">
              <div className="flex items-center gap-2 mb-3.5">
                <BrainCircuit className="w-4 h-4 text-pink-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  AI Co-pilot Assistant
                </span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50/50 border border-slate-150/40 rounded-2xl">
                  <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    Why specify this?
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {currentStepInfo.why}
                  </p>
                </div>
                
                {/* Visual checkpoints checks */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Validation Checklist</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className={`p-2 rounded-xl flex items-center gap-2 border ${inputs.idea.trim() ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" /> Pitch Setup
                    </div>
                    <div className={`p-2 rounded-xl flex items-center gap-2 border ${inputs.problemStatement.trim() ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" /> Problem Scope
                    </div>
                    <div className={`p-2 rounded-xl flex items-center gap-2 border ${inputs.customerSegment.trim() ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" /> Segment Focus
                    </div>
                    <div className={`p-2 rounded-xl flex items-center gap-2 border ${inputs.geography.trim() ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" /> Geography limits
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7">
            {report ? (
              <div className="space-y-6">
                
                {/* Tab selector */}
                <div className="flex border-b border-slate-150 overflow-x-auto whitespace-nowrap scrollbar-none gap-2 font-sans text-xs pb-1">
                  {[
                    { id: "dashboard", label: "Dashboard Consensus" },
                    { id: "market", label: "Market TAM/SAM" },
                    { id: "competitors", label: "Competitor discovery" },
                    { id: "persona", label: "ICP Personas" },
                    { id: "sources", label: `Search Sources (${sources.length})` }
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 px-3.5 font-bold transition-all relative border-none bg-transparent cursor-pointer ${
                          isActive ? "text-[#EC4899] font-black" : "text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        {tab.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeReportTab"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#EC4899] z-10 rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="min-h-[400px]">
                  {activeTab === "dashboard" && (
                    <div className="space-y-6">
                      
                      {/* Overall Verdict Banner */}
                      {verdictTheme && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-6 border rounded-[2.5rem] ${verdictTheme.bg} flex items-start space-x-4 shadow-2xl text-left relative overflow-hidden`}
                        >
                          {/* Radial ambient circle highlight */}
                          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />

                          <div className={`p-3 rounded-2xl ${verdictTheme.badge} shrink-0 shadow-md`}>
                            {VerdictIcon && <VerdictIcon className="w-6 h-6 animate-pulse" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Investment Jury Consensus Verdict
                              </span>
                              <span className={`px-2 py-0.5 text-[9px] font-black rounded ${verdictTheme.badge} shadow-xs`}>
                                {verdictTheme.label}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed pr-2">
                              {report.summaryAndNextSteps.reasoning}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Scores Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MetricCard
                          label="Target Market Demand"
                          score={report.validationScores.demand}
                          rationale={report.validationScores.rationale.demand}
                          type="demand"
                        />
                        <MetricCard
                          label="Competitive Advantage Index"
                          score={report.validationScores.competition}
                          rationale={report.validationScores.rationale.competition}
                          type="competition"
                        />
                        <MetricCard
                          label="Operational Scalability"
                          score={report.validationScores.scalability}
                          rationale={report.validationScores.rationale.scalability}
                          type="scalability"
                        />
                        <MetricCard
                          label="Revenue Model Potential"
                          score={report.validationScores.revenuePotential}
                          rationale={report.validationScores.rationale.revenuePotential}
                          type="revenuePotential"
                        />
                      </div>

                      {/* Suggested Next Steps */}
                      <div className="bg-white border border-slate-150 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-100/10 text-left relative overflow-hidden">
                        {/* Radial overlay */}
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                          Actionable De-Risking Protocol
                        </span>
                        <div className="flex flex-col gap-3 text-xs">
                          {report.summaryAndNextSteps.suggestedNextSteps.map((step, idx) => (
                            <motion.div 
                              whileHover={{ x: 3 }}
                              key={idx} 
                              className="flex items-start space-x-3.5 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl"
                            >
                              <span className="w-6 h-6 rounded-xl bg-pink-50 text-[#EC4899] border border-pink-100/50 flex items-center justify-center font-black text-[10px] flex-shrink-0 shadow-sm">
                                {idx + 1}
                              </span>
                              <span className="text-slate-600 leading-relaxed font-semibold pt-0.5">
                                {step}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {activeTab === "market" && (
                    <MarketInsights research={report.marketResearch} />
                  )}

                  {activeTab === "competitors" && (
                    <CompetitorGrid competitors={report.competitorDiscovery} />
                  )}

                  {activeTab === "persona" && (
                    <PersonaCard persona={report.customerPersona} />
                  )}

                  {activeTab === "sources" && (
                    <SourceLinks sources={sources} />
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white/80 border border-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 text-center min-h-[500px] shadow-2xl shadow-slate-100/10 relative overflow-hidden">
                {/* Mesh graphic details */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.04),transparent_40%)] pointer-events-none" />

                <div className="w-16 h-16 bg-pink-50 border border-pink-100 text-[#EC4899] rounded-[1.5rem] flex items-center justify-center mb-5 shadow-inner animate-pulse">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-800 uppercase tracking-wide">
                  Awaiting Deck Configuration
                </h4>
                <p className="text-xs text-slate-400 font-semibold max-w-sm mt-1.5 leading-relaxed">
                  Fill out the parameters inside the conversational step cards to query search grounding models and formulate a report.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}
