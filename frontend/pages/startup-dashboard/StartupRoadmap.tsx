import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, Lock, Play, ChevronRight, 
  BookOpen, Wrench, ShieldAlert, Compass, Target, HelpCircle,
  TrendingUp, Award, Zap, Activity, Info, FileText, ChevronLeft, MapPin, Check
} from 'lucide-react';

interface Task {
  id: string;
  label: string;
  completed: boolean;
}

interface Milestone {
  id: string;
  phaseId: number;
  title: string;
  shortDesc: string;
  status: 'completed' | 'active' | 'locked';
  why: string;
  tasks: Task[];
  resources: { name: string; type: string }[];
  tools: string[];
}

const PHASES = [
  {
    id: 1,
    title: "Ideation & Validation",
    tag: "Phase 1",
    theme: "from-blue-500/10 via-cyan-500/5 to-transparent border-blue-100",
    text: "text-blue-600",
    badge: "bg-blue-500 text-white",
    glow: "shadow-blue-500/10 hover:shadow-blue-500/20",
    accent: "bg-blue-500"
  },
  {
    id: 2,
    title: "MVP Development",
    tag: "Phase 2",
    theme: "from-purple-500/10 via-pink-500/5 to-transparent border-purple-100",
    text: "text-purple-600",
    badge: "bg-purple-500 text-white",
    glow: "shadow-purple-500/10 hover:shadow-purple-500/20",
    accent: "bg-purple-500"
  },
  {
    id: 3,
    title: "Launch & Traction",
    tag: "Phase 3",
    theme: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-100",
    text: "text-emerald-600",
    badge: "bg-emerald-500 text-white",
    glow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    accent: "bg-emerald-500"
  },
  {
    id: 4,
    title: "Scale & Fundraising",
    tag: "Phase 4",
    theme: "from-amber-500/10 via-orange-500/5 to-transparent border-amber-100",
    text: "text-amber-600",
    badge: "bg-amber-500 text-white",
    glow: "shadow-amber-500/10 hover:shadow-amber-500/20",
    accent: "bg-amber-500"
  }
];

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: "m1",
    phaseId: 1,
    title: "Idea Validation Sandbox",
    shortDesc: "Run search-grounded feasibility logic on core product pitch.",
    status: "completed",
    why: "Validating market feasibility early prevents building products that target non-existent demand.",
    tasks: [
      { id: "t1_1", label: "Enter pitch configuration in Sandbox", completed: true },
      { id: "t1_2", label: "Perform real-time Google search grounding checks", completed: true },
      { id: "t1_3", label: "Address initial feasibility suggestions", completed: true }
    ],
    resources: [
      { name: "Feasibility Analysis Framework", type: "PDF Guide" },
      { name: "Pre-validation Sandbox Template", type: "Blueprint" }
    ],
    tools: ["Google Search Engine", "Gemini Validator"]
  },
  {
    id: "m2",
    phaseId: 1,
    title: "Customer Persona Mapping",
    shortDesc: "Map initial beachhead target profiles and core friction.",
    status: "completed",
    why: "Understanding primary ICP buying behaviors shapes product development priorities.",
    tasks: [
      { id: "t2_1", label: "Define Primary ICP Demographics", completed: true },
      { id: "t2_2", label: "Interview 5-10 beachhead candidates", completed: true },
      { id: "t2_3", label: "Document pain points and current alternatives", completed: true }
    ],
    resources: [
      { name: "ICP Interview Questions Kit", type: "Document" },
      { name: "Figma Customer Journey Board", type: "Figma File" }
    ],
    tools: ["Figma", "UserTesting"]
  },
  {
    id: "m3",
    phaseId: 1,
    title: "Competitor Advantage Index",
    shortDesc: "Locate strategic weaknesses and product opportunities.",
    status: "active",
    why: "Identifying competitor gaps defines your startup's core value proposition.",
    tasks: [
      { id: "t3_1", label: "Map direct and indirect competitors", completed: false },
      { id: "t3_2", label: "Analyze competitor pricing structures", completed: false },
      { id: "t3_3", label: "Identify a core feature differentiation gap", completed: false }
    ],
    resources: [
      { name: "Competitive Analysis Guide", type: "Framework" },
      { name: "VC Benchmarking Workbook", type: "Excel Template" }
    ],
    tools: ["Crunchbase", "Semrush", "ProductHunt"]
  },
  {
    id: "m4",
    phaseId: 2,
    title: "System Architecture Design",
    shortDesc: "Establish core tech stacks, integrations and endpoints.",
    status: "locked",
    why: "Selecting stable technology frameworks prevents costly refactoring later.",
    tasks: [
      { id: "t4_1", label: "Draft architecture block diagrams", completed: false },
      { id: "t4_2", label: "Choose frontend and database stack", completed: false },
      { id: "t4_3", label: "List third-party API dependencies", completed: false }
    ],
    resources: [
      { name: "Architecture Layout Template", type: "Diagram" },
      { name: "Database Schema Checklist", type: "Guide" }
    ],
    tools: ["Mermaid.live", "AWS Calculator", "PostgreSQL"]
  },
  {
    id: "m5",
    phaseId: 2,
    title: "Figma UI/UX Wireframing",
    shortDesc: "Design layout wireframes and user interaction flows.",
    status: "locked",
    why: "Visualizing layout screens beforehand establishes user flow logic and avoids frontend redesign loops.",
    tasks: [
      { id: "t5_1", label: "Establish color theme tokens", completed: false },
      { id: "t5_2", label: "Create responsive prototype screens", completed: false },
      { id: "t5_3", label: "Run basic user navigation tests", completed: false }
    ],
    resources: [
      { name: "Studlyf Dashboard UI Kit", type: "Figma UI Kit" },
      { name: "Responsive Component Guidelines", type: "PDF Specification" }
    ],
    tools: ["Figma", "Canva", "Proto.io"]
  },
  {
    id: "m6",
    phaseId: 3,
    title: "Alpha Version Release",
    shortDesc: "Deploy core features to staging env for alpha testers.",
    status: "locked",
    why: "Launching a simplified alpha prototype validates the user experience with minimal dev overhead.",
    tasks: [
      { id: "t6_1", label: "Complete MVP feature coding cycles", completed: false },
      { id: "t6_2", label: "Deploy staging server environment", completed: false },
      { id: "t6_3", label: "Onboard 5 sandbox alpha feedback testers", completed: false }
    ],
    resources: [
      { name: "Alpha Release Checklist", type: "Manual" },
      { name: "Bug Logging & Feedback Form", type: "Template" }
    ],
    tools: ["Vercel", "GitHub Actions", "Sentry"]
  },
  {
    id: "m7",
    phaseId: 3,
    title: "Private Beta Program",
    shortDesc: "Onboard early target list to evaluate product utility.",
    status: "locked",
    why: "Gathering metrics from a wider beta user list helps validate operational load issues.",
    tasks: [
      { id: "t7_1", label: "Launch landing page with email registration", completed: false },
      { id: "t7_2", label: "Onboard first 50 beta candidates", completed: false },
      { id: "t7_3", label: "Track customer conversion metrics", completed: false }
    ],
    resources: [
      { name: "Beta Testing Onboarding Guide", type: "PDF" },
      { name: "Product Analytics Setups", type: "Document" }
    ],
    tools: ["Mailchimp", "Mixpanel", "Segment"]
  },
  {
    id: "m8",
    phaseId: 4,
    title: "Advisory Board Recruitment",
    shortDesc: "Build core board with expert mentors and industry guides.",
    status: "locked",
    why: "Experienced industry guides validate your model and open strategic channel partners.",
    tasks: [
      { id: "t8_1", label: "Identify 3 key advisory gap roles", completed: false },
      { id: "t8_2", label: "Reach out via Studlyf Mentor Center", completed: false },
      { id: "t8_3", label: "Finalize advisory equity share contracts", completed: false }
    ],
    resources: [
      { name: "Advisor FAST Agreement", type: "Legal Template" },
      { name: "Advisor Pitch Presentation", type: "Pitch Deck" }
    ],
    tools: ["Studlyf Mentors", "LinkedIn Recruiter"]
  },
  {
    id: "m9",
    phaseId: 4,
    title: "VC & Angel Pitching",
    shortDesc: "Complete investment deck and start seed round outreach.",
    status: "locked",
    why: "Pitching with robust validation and beachhead metrics increases funding success rate.",
    tasks: [
      { id: "t9_1", label: "Design VC-facing Pitch Presentation", completed: false },
      { id: "t9_2", label: "Formulate 3-year growth model sheets", completed: false },
      { id: "t9_3", label: "Initiate outreach in Studlyf Investor Center", completed: false }
    ],
    resources: [
      { name: "VC Seed Pitch Guidelines", type: "Slide Blueprint" },
      { name: "Financial Projection Workbook", type: "Excel Model" }
    ],
    tools: ["Studlyf Investors", "Pitch.com", "Excel"]
  }
];

export default function StartupRoadmap() {
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>("m3");
  const [activePhaseId, setActivePhaseId] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({
    m1: "Idea validator reports were saved. Demand score was 84/100.",
    m2: "Interviewed 8 designers. Main pain point was team wireframe handoffs.",
    m3: "Semrush shows competitors are bidding high on 'wireframe developer'."
  });

  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId);

  // Toggle tasks to update milestone stats
  const handleToggleTask = (milestoneId: string, taskId: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      const updatedTasks = m.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      
      // Calculate new status based on task completion
      const total = updatedTasks.length;
      const completedCount = updatedTasks.filter(t => t.completed).length;
      let newStatus: Milestone['status'] = m.status;
      
      if (completedCount === total) {
        newStatus = 'completed';
      } else if (completedCount > 0 || m.status === 'completed') {
        newStatus = 'active';
      }

      return {
        ...m,
        tasks: updatedTasks,
        status: newStatus
      };
    }));
  };

  // Calculate overall metrics
  const calculateTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    milestones.forEach(m => {
      totalTasks += m.tasks.length;
      completedTasks += m.tasks.filter(t => t.completed).length;
    });
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Calculate specific phase progress
  const getPhaseProgress = (phaseId: number) => {
    const phaseMilestones = milestones.filter(m => m.phaseId === phaseId);
    let total = 0;
    let completed = 0;
    phaseMilestones.forEach(m => {
      total += m.tasks.length;
      completed += m.tasks.filter(t => t.completed).length;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const totalProgress = calculateTotalProgress();

  // Find active milestone recommendations for AI Co-pilot
  const getAICoPilotInsight = () => {
    if (!selectedMilestone) return "Select a milestone on the blueprint grid to analyze objectives.";
    
    if (selectedMilestone.status === 'completed') {
      return `Objective completed! The mission metrics for "${selectedMilestone.title}" are secured. You can review resources for further reference or proceed to the next objective.`;
    }
    
    if (selectedMilestone.status === 'locked') {
      return `Attention: "${selectedMilestone.title}" is currently locked. Complete the predecessor objectives in validation phase to proceed.`;
    }

    // Active status advice
    switch (selectedMilestone.id) {
      case "m3":
        return "Insight: competitor analysis is your critical validation objective. Check competitor pricing plans and map them against founder feature gaps to isolate our initial product advantage.";
      case "m4":
        return "Insight: Staging API integrations will speed up MVP release. I suggest matching AWS costs against our 3-year projected scale constraints.";
      default:
        return `Insight: "${selectedMilestone.title}" is your active mission. Complete the tasks listed on the slide drawer to satisfy this objective.`;
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10 text-left relative min-h-screen">
      {/* Background blueprint grids & aurora beams */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(241,245,249,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(241,245,249,0.5)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10 opacity-60" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Asymmetrical Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-white/60 to-transparent p-6 rounded-3xl border border-white/20 backdrop-blur-sm shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-1">
            <Compass size={12} className="animate-spin-slow" /> Mission Command Center
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Founder Adventure Roadmap
          </h1>
          <p className="text-xs text-slate-500 max-w-xl font-medium leading-relaxed">
            Manage your venture lifecycle. Track milestones from early pre-validation checkpoints to MVP prototype deployment and VC pitches.
          </p>
        </div>

        {/* Global Progress Rings */}
        <div className="flex items-center gap-6 bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="#EC4899" strokeWidth="4" fill="transparent"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * totalProgress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-slate-900 font-mono">{totalProgress}%</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mission Success</h4>
              <p className="text-xs font-bold text-slate-800">Total Completion</p>
            </div>
          </div>

          <div className="w-[1px] h-10 bg-slate-100" />

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="#6366f1" strokeWidth="4" fill="transparent"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * 78) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-slate-900 font-mono">78%</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Venture Health</h4>
              <p className="text-xs font-bold text-slate-800">Operational Index</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Segment Selectors */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {PHASES.map((p) => {
          const isActive = activePhaseId === p.id;
          const prog = getPhaseProgress(p.id);
          return (
            <motion.button
              whileHover={{ y: -2 }}
              key={p.id}
              onClick={() => setActivePhaseId(p.id)}
              className={`p-4 rounded-[2rem] border backdrop-blur-xl text-left transition-all cursor-pointer flex flex-col justify-between shrink-0 min-w-[200px] border-solid relative overflow-hidden group ${
                isActive 
                  ? 'bg-white shadow-[0_8px_30px_rgba(99,102,241,0.06)]' 
                  : 'bg-white/50 border-slate-150/40 hover:bg-white/70'
              }`}
            >
              {/* Progress track border color indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${isActive ? p.accent : 'bg-slate-200'}`} />

              <div className="pl-2 space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.tag}</span>
                <h4 className="text-xs font-black text-slate-800">{p.title}</h4>
              </div>
              <div className="pl-2 flex items-center justify-between mt-4">
                <span className="text-[10px] font-bold text-slate-400 font-mono">Completed: {prog}%</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Timeline Grid Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Horizontal Timeline Map */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white/80 border border-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
            
            {/* Ambient grid decorator */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Mission Blueprint Navigator
                </h3>
              </div>
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                Interactive Grid View
              </span>
            </div>

            {/* Horizontal Timeline Scroll Box */}
            <div className="relative overflow-x-auto pb-8 pt-4 px-4 scrollbar-none select-none z-10 flex gap-12 min-h-[220px] items-center">
              
              {/* Timeline Connector Path */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10 rounded-full" />
              
              {milestones
                .filter(m => m.phaseId === activePhaseId)
                .map((m, idx, arr) => {
                  const isActive = selectedMilestoneId === m.id;
                  const isCompleted = m.status === 'completed';
                  const isLocked = m.status === 'locked';
                  
                  return (
                    <div key={m.id} className="relative flex flex-col items-center shrink-0">
                      {/* Interactive Objective Node */}
                      <motion.div
                        whileHover={!isLocked ? { scale: 1.1, y: -4 } : {}}
                        whileTap={!isLocked ? { scale: 0.95 } : {}}
                        onClick={() => !isLocked && setSelectedMilestoneId(m.id)}
                        className={`w-14 h-14 rounded-2xl border flex items-center justify-center cursor-pointer transition-all shadow-md relative z-10 ${
                          isActive 
                            ? 'bg-gradient-to-tr from-pink-500 to-[#EC4899] text-white border-pink-400 ring-4 ring-pink-500/10' 
                            : isCompleted 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : isLocked
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <Play className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                        )}

                        {/* Status Beacon Pulse */}
                        {m.status === 'active' && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 border-2 border-white rounded-full animate-pulse" />
                        )}
                      </motion.div>

                      {/* Milestone Title */}
                      <div className="mt-4 text-center max-w-[140px]">
                        <h4 className={`text-xs font-black truncate ${isActive ? 'text-pink-600' : 'text-slate-800'}`}>
                          {m.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-bold font-mono tracking-tight block mt-0.5 uppercase">
                          {m.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4 mt-4 relative z-10">
              <span>← Swipe left / right to navigate</span>
              <span className="flex items-center gap-1.5"><Info size={12} /> Click node to view drawer details</span>
            </div>

          </div>

          {/* Floating AI Mission Assistant Panel */}
          <div className="bg-gradient-to-r from-indigo-500/5 to-pink-500/5 border border-indigo-100/50 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm flex items-start gap-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="p-3 bg-gradient-to-tr from-pink-500 to-indigo-500 text-white rounded-2xl shadow-md shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">AI Mission Assistant</span>
              <h4 className="text-xs font-black text-slate-900 uppercase">Strategic Co-pilot Advice</h4>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed pr-2">
                {getAICoPilotInsight()}
              </p>
            </div>
          </div>
        </div>

        {/* Side Detail Card Panel (Desktop Side Dashboard) */}
        <div className="xl:col-span-4">
          <AnimatePresence mode="wait">
            {selectedMilestone ? (
              <motion.div
                key={selectedMilestone.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white/80 border border-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.03)] text-left space-y-6 sticky top-6 overflow-hidden"
              >
                {/* Milestone Node Details Header */}
                <div className="flex justify-between items-start pb-5 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-200/50 text-[9px] font-black rounded-lg uppercase tracking-widest">
                      Objective Node
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{selectedMilestone.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1.5 ${
                    selectedMilestone.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    selectedMilestone.status === 'active' ? 'bg-pink-50 text-pink-700 border border-pink-100' :
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {selectedMilestone.status === 'active' && <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />}
                    {selectedMilestone.status}
                  </span>
                </div>

                {/* Why it matters */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Objective Rationale</span>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {selectedMilestone.why}
                  </p>
                </div>

                {/* Sub-Tasks Checklist */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mission Task Checklist</span>
                  <div className="space-y-2">
                    {selectedMilestone.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => handleToggleTask(selectedMilestone.id, task.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          task.completed 
                            ? 'bg-emerald-50/20 border-emerald-100/50 text-emerald-800' 
                            : 'bg-slate-50/60 border-slate-150/40 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-semibold leading-snug">{task.label}</span>
                        <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white border-slate-300'
                        }`}>
                          {task.completed && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advisor Resource Templates */}
                {selectedMilestone.resources && selectedMilestone.resources.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Blueprint Templates</span>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedMilestone.resources.map((res, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-100 border border-slate-200/50 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-sm"
                        >
                          <span className="flex items-center gap-2">
                            <FileText size={14} className="text-indigo-500" /> {res.name}
                          </span>
                          <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                            {res.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Software Tools */}
                {selectedMilestone.tools && selectedMilestone.tools.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Recommended Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMilestone.tools.map((tool, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-150/40 text-[9px] font-black rounded-lg uppercase tracking-wider">
                          <Wrench className="w-2.5 h-2.5 inline mr-1 text-[#EC4899]/85" /> {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes panel */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Founder Log Notes</span>
                  <textarea
                    rows={2}
                    value={notes[selectedMilestone.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [selectedMilestone.id]: e.target.value })}
                    placeholder="Log technical details, questions, or metrics for this milestone..."
                    className="w-full p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400 focus:bg-white transition-all resize-none shadow-inner"
                  />
                </div>

              </motion.div>
            ) : (
              <div className="bg-white/50 border border-dashed border-slate-250/80 backdrop-blur-xl p-10 rounded-[2.5rem] text-center text-slate-400 text-xs font-bold py-36 sticky top-6 shadow-inner flex flex-col items-center justify-center gap-3">
                <Compass className="opacity-30" size={36} />
                <span>Select a mission node on the left timeline to review tasks, checklists and tools.</span>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
