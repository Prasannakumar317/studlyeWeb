import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, ArrowRight, TrendingUp, Briefcase, Calendar, 
  Users, Bookmark, Cpu, Sparkles, Building, Landmark, Compass, 
  Heart, Award, Zap, Shield, FileText, Globe, BookOpen, Flame,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../AuthContext';
import DiscoverBackground from './DiscoverBackground';
import PremiumInteractiveCard from '../../components/PremiumInteractiveCard';
import { StatDisplay } from '../../components/AnimatedCounter';


// --- HIGH FIDELITY MOCK ECOSYSTEM DATA ---

const mockStartups = [
  { id: "startup-1", name: "Aether AI", stage: "Series A", industry: "AI & ML", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120", tagline: "Decentralized AI orchestration for cloud-native clusters.", growth: "↑ +45% this week", status: "🔥 Hot", funding: "₹4.5 Cr", location: "India" },
  { id: "startup-2", name: "FinFlow", stage: "Pre-Seed", industry: "FinTech", logo: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120", tagline: "API-first micro-investment infrastructure for rural markets.", growth: "↑ +20%", status: "New Today", funding: "₹50L", location: "India" },
  { id: "startup-3", name: "EdVantage", stage: "Seed", industry: "EdTech", logo: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=120", tagline: "Gamified simulation-based corporate skill assessments.", growth: "↑ +15%", status: "Recently Funded", funding: "₹1.2 Cr", location: "Singapore" },
  { id: "startup-4", name: "Helix Health", stage: "Seed", industry: "HealthTech", logo: "https://images.unsplash.com/photo-1618005198143-e528346d9a74?w=120", tagline: "Predictive genomic sequencing oncology diagnostic models.", growth: "↑ +35%", status: "Recently Funded", funding: "₹2 Cr", location: "United States" },
  { id: "startup-5", name: "Nebula Space", stage: "Series B", industry: "DeepTech", logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120", tagline: "Autonomous satellite cluster scheduling tools.", growth: "↑ +85%", status: "🔥 Hot", funding: "₹22 Cr", location: "Remote" }
];

const mockFounders = [
  { id: "f-1", name: "Aman Sen", company: "Aether AI", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120", role: "CEO", bio: "Ex-Google DeepMind Architect, specializing in distributed agent systems.", achievement: "Raised ₹4.5 Cr from Sequoia India", followers: "2.4k", built: "2 startups", activity: "Active: Hiring AI Engineers" },
  { id: "f-2", name: "Sarah Croft", company: "Aether AI", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120", role: "CTO", bio: "Systems reliability compiler researcher. Interested in Rust infrastructure compiler extensions.", achievement: "Launched Aether Core API v2", followers: "1.8k", built: "1 startup", activity: "Active: Open-sourced SatScheduler" },
  { id: "f-3", name: "Vikram Mehta", company: "FinFlow", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120", role: "CEO", bio: "Ex-Razorpay PM. Building micro-investment tools that run offline in low-coverage rural areas.", achievement: "Partnered with 400 rural local centers", followers: "1.2k", built: "2 startups", activity: "Active: Designing FinFlow API v1" },
  { id: "f-4", name: "Neha Roy", company: "Helix Health", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120", role: "Founder", bio: "PhD in Computational Genomics from IISc. Somatic variations compiler author.", achievement: "Matched oncology genetic variations in record 72h", followers: "950", built: "1 startup", activity: "Active: Shortlisting genomic research team" }
];

const mockInvestors = [
  { id: "inv-1", name: "Sequoia Capital (India)", rep: "Sandeep Singhal", focus: "Seed / Series A", range: "₹50L - ₹2Cr", logo: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120", portfolio: ["Aether AI", "Razorpay"], latest: "Aether AI Seed Round" },
  { id: "inv-2", name: "Kalaari Capital", rep: "Vani Kola", focus: "Pre-Seed / Seed", range: "₹20L - ₹50L", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120", portfolio: ["FinFlow", "Simplilearn"], latest: "FinFlow Pre-Seed Round" },
  { id: "inv-3", name: "Elevation Capital", rep: "Mukul Arora", focus: "Seed / Series A", range: "₹1Cr - ₹3Cr", logo: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=120", portfolio: ["Meesho", "Paytm"], latest: "Helix Health Seed Round" }
];

const mockNews = [
  { id: "n-1", type: "Funding", title: "Aether AI raises ₹4.5 Cr Seed Round from Sequoia Capital India", date: "2 hours ago", desc: "The decentralized orchestration company plans to double engineering team headcount." },
  { id: "n-2", type: "Product Launch", title: "Helix Health launches somatic gene sequencing oncology software pipeline v1.0", date: "5 hours ago", desc: "Enables clinicians to match patient genetic variations with trials in under 12 hours." },
  { id: "n-3", type: "Hiring", title: "FinFlow announces offline micro API implementation, looking for Rust Developers", date: "1 day ago", desc: "Aims to roll out POS terminals across 500 tier-3 villages by Q3 2026." }
];

const mockEcosystems = [
  { name: "India", count: "84 Startups", activeVcs: "12 VCs", cities: "Bengaluru, Delhi/NCR, Mumbai", label: "Fastest Growing" },
  { name: "United States", count: "32 Startups", activeVcs: "18 VCs", cities: "San Francisco, New York, Austin", label: "Mature Capital" },
  { name: "Singapore", count: "14 Startups", activeVcs: "6 VCs", cities: "Marina Bay, One-North", label: "Gateway to SEA" },
  { name: "Remote", count: "48 Startups", activeVcs: "10 VCs", cities: "Global Distributed Teams", label: "Decentralized Teams" }
];

const mockCommunities = [
  { name: "AI Builders", members: "12.4k members", activeTopic: "Large Language Models & Orchestration", badge: "🔥 Hot" },
  { name: "SaaS Founders", members: "4.8k members", activeTopic: "Stripe Integrations & Cold Emails", badge: "Active" },
  { name: "Indie Hackers", members: "9.2k members", activeTopic: "Bootstrap growth playbooks", badge: "Active" },
  { name: "Student Entrepreneurs", members: "3.2k members", activeTopic: "University innovation grants", badge: "New" }
];

const mockPlaybooks = [
  { title: "SaaS Product-Market Validation Playbook", format: "Document", length: "15 min read", creator: "StudLyf Editorial" },
  { title: "VC Pitch Presentation Masterclass", format: "Video Guide", length: "45 min video", creator: "Sandeep Singhal" },
  { title: "Rust distributed systems performance tuning", format: "Case Study", length: "20 min read", creator: "Sarah Croft" }
];

// Helper component for Lucide Icons mapping
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Building': return <Building className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Landmark': return <Landmark className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Bookmark': return <Bookmark className={className} />;
    default: return <Compass className={className} />;
  }
};

const carouselCards = [
  {
    title: "Startups",
    path: "/discover/startups",
    stats: "150+ Companies",
    desc: "Explore high-growth tech ventures in real-time.",
    artwork: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&auto=format&fit=crop&q=80",
    badge: "High Growth",
    color: "from-blue-500 to-indigo-600",
    colorBg: "rgba(59, 130, 246, 0.08)",
    accent: "text-blue-600",
    shadow: "shadow-blue-500/10",
    iconName: "Building",
    logos: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80",
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80"
    ]
  },
  {
    title: "Founders",
    path: "/discover/founders",
    stats: "450+ Builders",
    desc: "Connect with technical minds and top startup authors.",
    artwork: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    badge: "Elite Talent",
    color: "from-pink-500 to-orange-500",
    colorBg: "rgba(236, 72, 153, 0.08)",
    accent: "text-pink-600",
    shadow: "shadow-pink-500/10",
    iconName: "Users",
    logos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"
    ]
  },
  {
    title: "Investors",
    path: "/discover/investors",
    stats: "80+ VCs & Angels",
    desc: "Venture funds, check ranges, and partner leads.",
    artwork: "https://images.unsplash.com/photo-1553729459-beb747028b42?w=600&auto=format&fit=crop&q=80",
    badge: "Active Capital",
    color: "from-emerald-500 to-teal-500",
    colorBg: "rgba(16, 185, 129, 0.08)",
    accent: "text-emerald-600",
    shadow: "shadow-emerald-500/10",
    iconName: "Landmark",
    logos: [
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80"
    ]
  },
  {
    title: "Industries",
    path: "/discover/industries",
    stats: "12 Tech Sectors",
    desc: "Breakdown of YoY growth rates and sector job statistics.",
    artwork: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    badge: "Sector Analysis",
    color: "from-yellow-500 to-orange-500",
    colorBg: "rgba(245, 158, 11, 0.08)",
    accent: "text-orange-600",
    shadow: "shadow-orange-500/10",
    iconName: "Cpu",
    logos: [
      "https://images.unsplash.com/photo-1618005198143-e528346d9a74?w=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
    ]
  },
  {
    title: "Jobs",
    path: "/discover/jobs",
    stats: "120+ Live Roles",
    desc: "Active high-fidelity careers at tech startups.",
    artwork: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop&q=80",
    badge: "Hiring Now",
    color: "from-orange-500 to-yellow-500",
    colorBg: "rgba(245, 158, 11, 0.08)",
    accent: "text-amber-600",
    shadow: "shadow-amber-500/10",
    iconName: "Briefcase",
    logos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
    ]
  },
  {
    title: "Communities",
    path: "/discover/communities",
    stats: "25+ Vetted Groups",
    desc: "Slack, Discord, and regional entrepreneur peer chapters.",
    artwork: "https://images.unsplash.com/photo-1556761175-b813d53a962e?w=600&auto=format&fit=crop&q=80",
    badge: "Interactive Hub",
    color: "from-purple-500 to-pink-500",
    colorBg: "rgba(168, 85, 247, 0.08)",
    accent: "text-purple-600",
    shadow: "shadow-purple-500/10",
    iconName: "Globe",
    logos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"
    ]
  },
  {
    title: "Events",
    path: "/discover/events",
    stats: "8 Upcoming Mixers",
    desc: "Upcoming Demo Days, mixers, and hackathons.",
    artwork: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
    badge: "Live Calendar",
    color: "from-rose-500 to-pink-500",
    colorBg: "rgba(244, 63, 94, 0.08)",
    accent: "text-rose-600",
    shadow: "shadow-rose-500/10",
    iconName: "Calendar",
    logos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
    ]
  },
  {
    title: "Technologies",
    path: "/discover/technologies",
    stats: "30+ Stack Repos",
    desc: "Trending development frameworks and system stack stats.",
    artwork: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    badge: "Stack Trends",
    color: "from-blue-500 to-cyan-500",
    colorBg: "rgba(6, 182, 212, 0.08)",
    accent: "text-cyan-600",
    shadow: "shadow-cyan-500/10",
    iconName: "Cpu",
    logos: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80",
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80"
    ]
  },
  {
    title: "Funding",
    path: "/discover/funding",
    stats: "₹12 Cr Active Capital",
    desc: "Accelerator grants and venture backing programs.",
    artwork: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80",
    badge: "Capital Programs",
    color: "from-green-500 to-blue-500",
    colorBg: "rgba(16, 185, 129, 0.08)",
    accent: "text-emerald-600",
    shadow: "shadow-emerald-500/10",
    iconName: "Zap",
    logos: [
      "https://images.unsplash.com/photo-1618005198143-e528346d9a74?w=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
    ]
  },
  {
    title: "Learning",
    path: "/discover/learning",
    stats: "40+ Playbooks",
    desc: "Guides, playbooks, and startup case study videos.",
    artwork: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80",
    badge: "Founder Playbooks",
    color: "from-sky-400 to-emerald-500",
    colorBg: "rgba(13, 148, 136, 0.08)",
    accent: "text-teal-600",
    shadow: "shadow-teal-500/10",
    iconName: "BookOpen",
    logos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
    ]
  },
  {
    title: "Collections",
    path: "/discover/collections",
    stats: "6 Curated Banners",
    desc: "Curated groups such as AI Disruptors & Student Founders.",
    artwork: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    badge: "Curated Banners",
    color: "from-pink-500 to-rose-500",
    colorBg: "rgba(236, 72, 153, 0.08)",
    accent: "text-pink-600",
    shadow: "shadow-pink-500/10",
    iconName: "Bookmark",
    logos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"
    ]
  },
  {
    title: "Ecosystems",
    path: "/discover/ecosystems",
    stats: "4 Geographic Hubs",
    desc: "Geographic startup clusters across India, USA, Singapore.",
    artwork: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
    badge: "Regional Clusters",
    color: "from-indigo-500 to-purple-500",
    colorBg: "rgba(79, 70, 229, 0.08)",
    accent: "text-indigo-600",
    shadow: "shadow-indigo-500/10",
    iconName: "Globe",
    logos: [
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80",
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80"
    ]
  }
];

const DiscoverHub: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ category: string; items: { id: string; name: string; type: string; path: string }[] }[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // 3D Carousel active card state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  const [transitioningCard, setTransitioningCard] = useState<any | null>(null);

  // Interactions and followings states
  const [followedFounders, setFollowedFounders] = useState<string[]>([]);
  const [followedInvestors, setFollowedInvestors] = useState<string[]>([]);
  const [savedStartups, setSavedStartups] = useState<string[]>([]);

  // Drag and Swipe logic
  const dragStartX = useRef<number | null>(null);
  const wheelTimeout = useRef<boolean>(false);

  // Search input cycles placeholders
  const searchPlaceholders = [
    "Search Aether AI, FinFlow, Sarah Croft...",
    "Query Rust compiler jobs, Sequoia funding...",
    "Explore AI Builders community, Demo Day events...",
    "Find Seed Round investments, Remote startups..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % searchPlaceholders.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (searchFocused) return;
      if (e.key === 'ArrowRight') {
        setActiveCardIndex(prev => (prev + 1) % carouselCards.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveCardIndex(prev => (prev - 1 + carouselCards.length) % carouselCards.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused]);

  // Universal Live Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const categories: { category: string; items: { id: string; name: string; type: string; path: string }[] }[] = [];

    // Search Startups
    const matchedStartups = mockStartups
      .filter(s => s.name.toLowerCase().includes(query) || s.tagline.toLowerCase().includes(query) || s.industry.toLowerCase().includes(query))
      .map(s => ({ id: s.id, name: s.name, type: s.industry, path: `/startup/${s.id}` }));
    if (matchedStartups.length > 0) {
      categories.push({ category: "Startups", items: matchedStartups });
    }

    // Search Founders
    const matchedFounders = mockFounders
      .filter(f => f.name.toLowerCase().includes(query) || f.company.toLowerCase().includes(query) || f.bio.toLowerCase().includes(query))
      .map(f => ({ id: f.id, name: f.name, type: `${f.role} at ${f.company}`, path: `/discover/founders` }));
    if (matchedFounders.length > 0) {
      categories.push({ category: "Founders", items: matchedFounders });
    }

    // Search Investors
    const matchedInvestors = mockInvestors
      .filter(i => i.name.toLowerCase().includes(query) || i.focus.toLowerCase().includes(query) || i.rep.toLowerCase().includes(query))
      .map(i => ({ id: i.id, name: i.name, type: i.focus, path: `/discover/investors` }));
    if (matchedInvestors.length > 0) {
      categories.push({ category: "Investors", items: matchedInvestors });
    }

    // Search Communities
    const matchedComms = mockCommunities
      .filter(c => c.name.toLowerCase().includes(query) || c.activeTopic.toLowerCase().includes(query))
      .map((c, idx) => ({ id: `comm-${idx}`, name: c.name, type: c.members, path: `/discover/communities` }));
    if (matchedComms.length > 0) {
      categories.push({ category: "Communities", items: matchedComms });
    }

    setSearchResults(categories);
  }, [searchQuery]);

  // Navigate after shared element transition finishes
  useEffect(() => {
    if (transitioningCard) {
      const timer = setTimeout(() => {
        navigate(transitioningCard.path);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [transitioningCard, navigate]);

  const handleFollowFounder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowedFounders(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleFollowInvestor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowedInvestors(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveStartup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedStartups(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Mouse tilt tracking on carousel container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // range [-1, 1]
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2); // range [-1, 1]
    setCursorOffset({ x, y });
  };

  const handleMouseLeaveContainer = () => {
    setCursorOffset({ x: 0, y: 0 });
  };

  // Wheel event for rotating carousel
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelTimeout.current) return;
    wheelTimeout.current = true;
    setTimeout(() => { wheelTimeout.current = false; }, 300); // 300ms throttling

    if (e.deltaY > 0) {
      setActiveCardIndex(prev => (prev + 1) % carouselCards.length);
    } else {
      setActiveCardIndex(prev => (prev - 1 + carouselCards.length) % carouselCards.length);
    }
  };

  // Drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(diffX) > 60) {
      if (diffX > 0) {
        setActiveCardIndex(prev => (prev - 1 + carouselCards.length) % carouselCards.length);
      } else {
        setActiveCardIndex(prev => (prev + 1) % carouselCards.length);
      }
    }
    dragStartX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const diffX = e.clientX - dragStartX.current;
    if (Math.abs(diffX) > 60) {
      if (diffX > 0) {
        setActiveCardIndex(prev => (prev - 1 + carouselCards.length) % carouselCards.length);
      } else {
        setActiveCardIndex(prev => (prev + 1) % carouselCards.length);
      }
    }
    dragStartX.current = null;
  };

  const handleCardClick = (card: any, idx: number) => {
    if (idx !== activeCardIndex) {
      setActiveCardIndex(idx);
    } else {
      setTransitioningCard(card);
    }
  };

  const currentTheme = carouselCards[activeCardIndex];

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-800 pb-32 relative select-none font-sans overflow-hidden">
      
      {/* Premium Multi-Layer Dynamic Background System */}
      <DiscoverBackground category={currentTheme.title} cursorOffset={cursorOffset} />

      {/* Hero section with Interactive 3D Carousel */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveContainer}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="relative min-h-[90vh] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 text-center pt-28 pb-10 z-10 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-200/50 rounded-full text-[10px] font-black text-indigo-600 tracking-[0.2em] uppercase shadow-[0_4px_12px_rgba(79,70,229,0.05)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Digital Startup Ecosystem
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-700">
            Ecosystem Exploration
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-light leading-relaxed">
            Drag, swipe, or scroll to rotate through the discovery modules. Click the central card to explore.
          </p>
        </div>

        {/* 3D Carousel Cylinder Scene */}
        <div className="relative w-full max-w-5xl h-[460px] flex items-center justify-center overflow-visible mt-6 [perspective:1200px]">
          <div className="absolute inset-0 flex items-center justify-center overflow-visible [transform-style:preserve-3d]">
            {carouselCards.map((card, idx) => {
              const count = carouselCards.length;
              const offset = ((idx - activeCardIndex + count + count / 2) % count) - count / 2;
              const absOffset = Math.abs(offset);
              
              // Only render cards that are nearby in the 3D space to improve performance
              if (absOffset > 3) return null;

              const xTranslation = offset * (window.innerWidth < 640 ? 170 : 250);
              const zTranslation = -absOffset * (window.innerWidth < 640 ? 130 : 200);
              const rotY = offset * -26;
              const cardScale = 1 - absOffset * 0.16;
              const cardOpacity = absOffset <= 1 ? 1 : absOffset === 2 ? 0.6 : 0.2;
              const cardZIndex = 50 - absOffset;

              // Add mouse tilt to the focused active card
              const tiltX = offset === 0 ? cursorOffset.y * 14 : 0;
              const tiltY = offset === 0 ? -cursorOffset.x * 14 : 0;
              // Glow & border configurations based on category
              const isCardActive = offset === 0;
              const getGlowTheme = () => {
                switch (card.title) {
                  case 'Startups': return 'blue';
                  case 'Founders': return 'pink';
                  case 'Investors': return 'green';
                  case 'Jobs': return 'orange';
                  case 'Communities': return 'purple';
                  case 'Events': return 'pink';
                  case 'Technologies': return 'cyan';
                  case 'Funding': return 'green';
                  case 'Learning': return 'cyan';
                  case 'Collections': return 'pink';
                  case 'Ecosystems': return 'purple';
                  default: return 'blue';
                }
              };
              
              const glowColor = getGlowTheme();
              const lightX = `${(cursorOffset.x + 1) * 50}%`;
              const lightY = `${(cursorOffset.y + 1) * 50}%`;
              const reflectionBg = `radial-gradient(circle at ${lightX} ${lightY}, rgba(255, 255, 255, 0.28) 0%, transparent 60%)`;

              const borderGradientClass = isCardActive
                ? `bg-gradient-to-tr ${
                    glowColor === 'blue' ? 'from-blue-400 via-indigo-500 to-purple-500' :
                    glowColor === 'pink' ? 'from-pink-400 via-orange-500 to-rose-500' :
                    glowColor === 'green' ? 'from-emerald-400 via-teal-500 to-blue-500' :
                    glowColor === 'orange' ? 'from-orange-400 via-yellow-500 to-red-500' :
                    glowColor === 'purple' ? 'from-purple-400 via-indigo-500 to-pink-500' :
                    glowColor === 'cyan' ? 'from-cyan-400 via-blue-500 to-indigo-500' : 'from-blue-400 via-indigo-500 to-purple-500'
                  } animate-premium-gradient-border`
                : 'border border-white/80 bg-white/75';

              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: cardOpacity, 
                    scale: cardScale * (isCardActive ? 1.03 : 1),
                    x: xTranslation,
                    z: zTranslation,
                    rotateY: rotY + tiltY,
                    rotateX: tiltX
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    damping: 18,
                    mass: 0.8
                  }}
                  onClick={() => handleCardClick(card, idx)}
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex: cardZIndex
                  }}
                  className={`absolute w-[290px] sm:w-[325px] h-[390px] rounded-[2.2rem] overflow-hidden p-[1.5px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-shadow duration-300 pointer-events-auto select-none ${borderGradientClass}`}
                >
                  {/* Ambient Glow for Active Card */}
                  {isCardActive && (
                    <div className={`absolute inset-0 -z-10 rounded-[2.2rem] scale-105 animate-premium-pulse-glow glow-theme-${glowColor}`} />
                  )}

                  {/* Inner Glass Box */}
                  <div className="relative w-full h-full bg-[#FCFCFD]/90 backdrop-blur-xl rounded-[2.1rem] p-5 flex flex-col justify-between overflow-hidden [transform-style:preserve-3d]">
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.1rem] -z-10">
                      <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/20 to-transparent -rotate-[45deg] animate-premium-shimmer-sweep" />
                    </div>

                    {/* Cursor Light Reflection Follower */}
                    {isCardActive && (
                      <div 
                        style={{ background: reflectionBg }} 
                        className="absolute inset-0 pointer-events-none mix-blend-overlay z-20 rounded-[2.1rem]" 
                      />
                    )}

                    {/* Floating effect inside individual card container */}
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        rotate: [0, 0.4, -0.4, 0]
                      }}
                      transition={{
                        duration: 5 + (idx % 3),
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-full h-full flex flex-col justify-between relative z-10"
                    >
                      {/* Artwork Container */}
                      <div className="relative h-40 rounded-2xl overflow-hidden mb-3">
                        <img 
                          src={card.artwork} 
                          alt={card.title} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                        
                        {/* Stats badge */}
                        <span className="absolute top-2.5 right-2.5 text-[8px] font-black uppercase tracking-widest text-slate-700 px-2.5 py-0.5 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-full shadow-sm">
                          {card.badge}
                        </span>
                      </div>

                      {/* Glowing Floating Icon */}
                      <motion.div 
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-[0_6px_20px_rgba(79,70,229,0.2)] -mt-9 ml-4 relative z-20 border border-white/40`}
                      >
                        <IconComponent name={card.iconName} className="w-5.5 h-5.5" />
                      </motion.div>

                      {/* Title & Description */}
                      <div className="px-3 py-1 space-y-1 text-left flex-grow">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            {card.title}
                          </h3>
                          <StatDisplay text={card.stats} className="text-[10px] font-extrabold text-slate-500" />
                        </div>
                        <p className="text-[11px] text-slate-600 font-light leading-snug line-clamp-2">
                          {card.desc}
                        </p>
                      </div>

                      {/* Logos list & Enter button */}
                      <div className="px-3 border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {card.logos.map((logo, lIdx) => (
                            <img 
                              key={lIdx} 
                              src={logo} 
                              alt="" 
                              className="w-5.5 h-5.5 rounded-full object-cover border border-white shadow-sm" 
                            />
                          ))}
                        </div>
                        
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1 group/btn transition-transform duration-200 hover:translate-x-0.5">
                          Enter Module <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

              );
            })}
          </div>
        </div>

        {/* Indicators and Actions */}
        <div className="w-full space-y-6">
          {/* Navigation indicators */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setActiveCardIndex(prev => (prev - 1 + carouselCards.length) % carouselCards.length)}
              className="w-10 h-10 rounded-full border border-slate-200/60 bg-white/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {carouselCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeCardIndex ? `w-5 bg-gradient-to-r ${currentTheme.color}` : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveCardIndex(prev => (prev + 1) % carouselCards.length)}
              className="w-10 h-10 rounded-full border border-slate-200/60 bg-white/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Universal Search Bar placed directly under carousel */}
          <div className="relative max-w-md mx-auto z-50">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-15" />
            <div className="relative bg-white/90 border border-slate-200/70 backdrop-blur-md rounded-2xl p-1 shadow-lg">
              <div className="flex items-center px-4 py-3">
                <Search className="w-4.5 h-4.5 text-indigo-500 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder={searchPlaceholders[placeholderIndex]}
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-800 outline-none placeholder-slate-400 text-xs font-semibold"
                />
              </div>

              {/* Grouped Live Search Suggestions */}
              <AnimatePresence>
                {searchFocused && searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-2xl max-h-[350px] overflow-y-auto z-[100] text-left p-4 space-y-4 shadow-xl"
                  >
                    {searchResults.map((cat) => (
                      <div key={cat.category} className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 block border-b border-slate-100 pb-1">
                          {cat.category}
                        </span>
                        <div className="grid gap-0.5">
                          {cat.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => navigate(item.path)}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors group cursor-pointer"
                            >
                              <span className="text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                              <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1">
                                {item.type} <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trending Today Snapping Carousel ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 flex items-center gap-2">
              <Flame className="w-5 h-5 text-pink-500 animate-pulse" /> Trending Today
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Live activities, hiring shifts, and funding indications.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/startups')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            Explore all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar select-none">
          {/* Trending item 1: Startup */}
          <PremiumInteractiveCard 
            glowColor="blue"
            onClick={() => navigate(`/startup/${mockStartups[0].id}`)}
            className="flex-shrink-0 w-[290px] snap-start"
          >
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                  Startup
                </span>
                <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{mockStartups[0].growth}</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={mockStartups[0].logo} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200/60" />
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{mockStartups[0].name}</h4>
                  <p className="text-[10px] text-slate-500">{mockStartups[0].industry}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{mockStartups[0].tagline}</p>
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 w-full">
              <span className="text-[9px] font-black uppercase text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded">
                {mockStartups[0].status}
              </span>
              <span className="text-[10px] text-slate-900 hover:text-indigo-600 font-bold flex items-center gap-1 group/link">
                View Space <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </PremiumInteractiveCard>

          {/* Trending item 2: Founder */}
          <PremiumInteractiveCard 
            glowColor="pink"
            onClick={() => navigate('/discover/founders')}
            className="flex-shrink-0 w-[290px] snap-start"
          >
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded-full">
                  Founder
                </span>
                <span className="text-[10px] text-purple-600 font-black bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">🔥 Hot Affiliate</span>
              </div>
              <div className="flex gap-3 items-center">
                <img src={mockFounders[1].avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200/60" />
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{mockFounders[1].name}</h4>
                  <p className="text-[10px] text-slate-500">{mockFounders[1].role} at {mockFounders[1].company}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{mockFounders[1].bio}</p>
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 w-full">
              <span className="text-[9px] text-slate-500 font-bold uppercase">
                <StatDisplay text={mockFounders[1].followers} /> followers
              </span>
              <button 
                onClick={(e) => handleFollowFounder(mockFounders[1].id, e)}
                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded transition-colors ${
                  followedFounders.includes(mockFounders[1].id) ? 'bg-pink-50 border border-pink-200 text-pink-600' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {followedFounders.includes(mockFounders[1].id) ? 'Following' : 'Follow'}
              </button>
            </div>
          </PremiumInteractiveCard>

          {/* Trending item 3: Technology */}
          <PremiumInteractiveCard 
            glowColor="cyan"
            onClick={() => navigate('/discover/technologies')}
            className="flex-shrink-0 w-[290px] snap-start"
          >
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  Technology
                </span>
                <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">↑ +84% hiring growth</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100/70 flex items-center justify-center text-blue-500 shadow-inner">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Rust Systems</h4>
                  <p className="text-[10px] text-slate-500">High performance infrastructure</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">Used heavily for Satellite scheduler telemetry systems, telemetry routers, and consensus databases.</p>
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 w-full">
              <span className="text-[9px] text-slate-500 font-bold uppercase">
                <StatDisplay text="12 active repos" />
              </span>
              <span className="text-[10px] text-slate-900 hover:text-indigo-600 font-bold flex items-center gap-1 group/link">
                Explore Tech <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </PremiumInteractiveCard>
        </div>

      </section>

      {/* ─── Explore by Industry (Showcase Cards) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-8 relative z-10">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Explore by Industry
          </h2>
          <p className="text-xs text-slate-500 font-light mt-0.5">Comprehensive domains showing featured startups and jobs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Industry 1: Artificial Intelligence */}
          <PremiumInteractiveCard 
            glowColor="purple"
            onClick={() => navigate('/discover/industries')}
            className="min-h-[350px]"
          >
            <div className="space-y-6 w-full text-left">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                  AI & Machine Learning
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 group-hover/premium:text-indigo-600 transition-colors">Artificial Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
                  Decentralized agent orchestrations, somatic genomes computational compilers, LLM vector search layers, and training metrics dashboards.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-4 text-[10px] font-semibold">
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Featured Venture</span>
                  <span className="text-slate-800 block mt-0.5 font-bold">Aether AI</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Growth rate</span>
                  <StatDisplay text="+45% YoY" className="text-emerald-600 block mt-0.5 font-extrabold" />
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Open positions</span>
                  <StatDisplay text="18 roles hiring" className="text-indigo-600 block mt-0.5 font-extrabold" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center pt-2 w-full">
              <span className="text-[10px] text-slate-500">Latest update: Aether Core v2 launch</span>
              <span className="text-xs text-indigo-600 group-hover/premium:text-indigo-700 font-bold flex items-center gap-1">
                Explore Domain <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </PremiumInteractiveCard>

          {/* Industry 2: FinTech */}
          <PremiumInteractiveCard 
            glowColor="pink"
            onClick={() => navigate('/discover/industries')}
            className="min-h-[350px]"
          >
            <div className="space-y-6 w-full text-left">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                  <Landmark className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <span className="text-[10px] text-pink-600 font-black uppercase tracking-wider px-3 py-1 bg-pink-50 border border-pink-100 rounded-full">
                  Financial Technology
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 group-hover/premium:text-pink-600 transition-colors">Financial Systems</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
                  API micro-investments POS software, offline transactional layers, fractional asset indexes, and decentralized peer payment gateways.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-4 text-[10px] font-semibold">
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Featured Venture</span>
                  <span className="text-slate-800 block mt-0.5 font-bold">FinFlow</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Growth rate</span>
                  <StatDisplay text="+20% YoY" className="text-emerald-600 block mt-0.5 font-extrabold" />
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Open positions</span>
                  <StatDisplay text="12 roles hiring" className="text-pink-600 block mt-0.5 font-extrabold" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center pt-2 w-full">
              <span className="text-[10px] text-slate-500">Latest update: Seed funded rural terminals</span>
              <span className="text-xs text-pink-600 group-hover/premium:text-pink-700 font-bold flex items-center gap-1">
                Explore Domain <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </PremiumInteractiveCard>
        </div>

      </section>

      {/* ─── Founder Spotlight Carousel ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Founder Spotlight
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Visionary builders driving innovation across their sectors.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/founders')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            See Founders Circle <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar select-none">
          {mockFounders.map((founder) => (
            <PremiumInteractiveCard
              key={founder.id}
              glowColor="pink"
              className="flex-shrink-0 w-[290px] snap-start"
            >
              <div className="space-y-4 text-left w-full">
                <div className="flex gap-3 items-center">
                  <img src={founder.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200/60" />
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover/premium:text-indigo-600 transition-colors">{founder.name}</h4>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider">{founder.role} at <span className="underline">{founder.company}</span></p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 min-h-[48px] line-clamp-3 leading-relaxed font-medium">{founder.bio}</p>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-semibold space-y-1 w-full">
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Achievement</span>
                    <StatDisplay text={founder.achievement} className="text-slate-700 block truncate" />
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Recent Activity</span>
                    <span className="text-pink-600 block truncate">{founder.activity}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 w-full">
                <StatDisplay text={`${founder.built} built`} className="text-[9px] text-slate-500 font-bold uppercase" />
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleFollowFounder(founder.id, e)}
                    className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
                      followedFounders.includes(founder.id) ? 'bg-pink-50 border border-pink-200 text-pink-600' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {followedFounders.includes(founder.id) ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    onClick={() => navigate('/discover/founders')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-lg text-slate-700 text-xs cursor-pointer transition-colors"
                  >
                    Profile
                  </button>
                </div>
              </div>
            </PremiumInteractiveCard>
          ))}
        </div>

      </section>

      {/* ─── Startup Collections Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Startup Collections
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Handpicked selections targeting niche criteria.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/collections')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            See Collections <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            { title: "AI Disruptors", count: "18 startups", desc: "Machine learning foundation layers.", glow: "purple" as const },
            { title: "Recently Funded", count: "12 startups", desc: "Startups that raised within 30 days.", glow: "pink" as const },
            { title: "Hidden Gems", count: "8 startups", desc: "Under-the-radar high performance teams.", glow: "blue" as const },
            { title: "Remote First", count: "24 startups", desc: "Fully distributed technical projects.", glow: "green" as const }
          ].map((col) => (
            <PremiumInteractiveCard
              key={col.title}
              glowColor={col.glow}
              onClick={() => navigate('/discover/collections')}
              className="min-h-[170px]"
            >
              <div className="space-y-2 text-left w-full">
                <h4 className="font-extrabold group-hover/premium:text-indigo-600 transition-colors text-lg">{col.title}</h4>
                <p className="text-[10px] text-slate-600 leading-normal font-semibold">{col.desc}</p>
              </div>
              <div className="flex justify-between items-center mt-6 w-full">
                <StatDisplay text={col.count} className="text-[10px] font-black uppercase tracking-wider text-slate-800 bg-white/70 border border-slate-200/30 px-2.5 py-0.5 rounded-full" />
                <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover/premium:bg-indigo-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </PremiumInteractiveCard>
          ))}
        </div>

      </section>

      {/* ─── Discover Investors Panel ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Active Investors
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Top venture funds and angels reviewing platform applications.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/investors')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            See Investors <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {mockInvestors.map((inv) => (
            <PremiumInteractiveCard
              key={inv.id}
              glowColor="green"
              className="min-h-[280px]"
            >
              <div className="space-y-4 text-left w-full">
                <div className="flex gap-3 items-center">
                  <img src={inv.logo} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200/60" />
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover/premium:text-indigo-600 transition-colors text-sm">{inv.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">Rep: {inv.rep}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-semibold space-y-1 w-full">
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Investment Focus</span>
                    <span className="text-slate-700 block">{inv.focus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Typical Ticket</span>
                    <StatDisplay text={inv.range} className="text-indigo-600 block font-extrabold" />
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Latest Allocation</span>
                    <span className="text-pink-600 block truncate">{inv.latest}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 w-full">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Focus: SaaS, DeepTech</span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleFollowInvestor(inv.id, e)}
                    className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
                      followedInvestors.includes(inv.id) ? 'bg-pink-50 border border-pink-200 text-pink-600' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {followedInvestors.includes(inv.id) ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    onClick={() => navigate('/discover/investors')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-lg text-slate-700 text-xs cursor-pointer transition-colors"
                  >
                    Pitch
                  </button>
                </div>
              </div>
            </PremiumInteractiveCard>
          ))}
        </div>

      </section>

      {/* ─── Startup Ecosystems Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Startup Ecosystems
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Explore technological ventures by geographic hubs.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/ecosystems')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            See Ecosystems <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {mockEcosystems.map((eco) => (
            <PremiumInteractiveCard
              key={eco.name}
              glowColor="purple"
              onClick={() => navigate('/discover/ecosystems')}
              className="min-h-[170px]"
            >
              <div className="space-y-2 text-left w-full">
                <div className="flex justify-between items-center w-full">
                  <h4 className="font-bold text-slate-900 group-hover/premium:text-indigo-600 transition-colors text-lg flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-500" /> {eco.name}
                  </h4>
                  <span className="text-[8px] font-black uppercase text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded">
                    {eco.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">{eco.cities}</p>
              </div>
              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 w-full">
                <div className="text-[10px] text-indigo-600 font-bold flex gap-1 items-center flex-wrap">
                  <StatDisplay text={eco.count} />
                  <span>•</span>
                  <StatDisplay text={eco.activeVcs} />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover/premium:bg-slate-900 group-hover/premium:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </PremiumInteractiveCard>
          ))}
        </div>

      </section>

      {/* ─── Communities Carousel ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Startup Communities
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Vetted peer rooms, Discord chapters, and local hubs.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/communities')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            See Communities <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar select-none">
          {mockCommunities.map((comm, idx) => (
            <PremiumInteractiveCard
              key={idx}
              glowColor="purple"
              onClick={() => navigate('/discover/communities')}
              className="flex-shrink-0 w-[290px] snap-start"
            >
              <div className="space-y-4 text-left w-full">
                <div className="flex justify-between items-start w-full">
                  <h4 className="font-extrabold text-slate-900 group-hover/premium:text-indigo-600 transition-colors text-base truncate pr-2">{comm.name}</h4>
                  <span className="text-[8px] font-black uppercase text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full shrink-0">
                    {comm.badge}
                  </span>
                </div>
                <div className="space-y-1 text-left">
                  <StatDisplay text={comm.members} className="text-[10px] text-indigo-600 font-bold block" />
                  <p className="text-xs text-slate-600 leading-normal font-medium">Topic: {comm.activeTopic}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 w-full">
                <span className="text-[10px] text-slate-500">Live chat invite</span>
                <span className="text-[10px] font-black uppercase text-slate-900 hover:text-indigo-600 flex items-center gap-0.5 group/btn transition-transform hover:translate-x-0.5">
                  Join Room <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </PremiumInteractiveCard>
          ))}
        </div>

      </section>

      {/* ─── Upcoming Events Calendar ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Upcoming Events
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Hackathons, pitch competitions, and virtual speed datings.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/events')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            See Events <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {[
            { title: "National Demo Day 2026", date: "July 12, 2026", location: "Bengaluru Innovation Hub", focus: "Demo Day" },
            { title: "Micro-SaaS Pitch Night", date: "July 18, 2026", location: "Discord Live Stage", focus: "Pitching" }
          ].map((evt, idx) => (
            <PremiumInteractiveCard
              key={idx}
              glowColor="pink"
              onClick={() => navigate('/discover/events')}
              className="p-1"
            >
              <div className="flex justify-between items-center w-full text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {evt.focus}
                    </span>
                    <StatDisplay text={evt.date} className="text-[10px] text-slate-500 font-semibold" />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover/premium:text-indigo-600 transition-colors text-base">{evt.title}</h4>
                  <p className="text-xs text-slate-600 font-medium">{evt.location}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover/premium:bg-slate-900 group-hover/premium:text-white transition-colors shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </PremiumInteractiveCard>
          ))}
        </div>

      </section>

      {/* ─── Learning Hub / Playbooks ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Founder Learning Hub
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Recommended playbooks, guide documents, and case studies.</p>
          </div>
          <button 
            onClick={() => navigate('/discover/learning')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            See Playbooks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {mockPlaybooks.map((p, idx) => (
            <PremiumInteractiveCard
              key={idx}
              glowColor="cyan"
              onClick={() => navigate('/discover/learning')}
              className="min-h-[160px]"
            >
              <div className="space-y-3 text-left w-full">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {p.format}
                  </span>
                  <StatDisplay text={p.length} className="text-[10px] text-slate-500" />
                </div>
                <h4 className="font-bold text-slate-900 group-hover/premium:text-indigo-600 transition-colors text-sm leading-snug">{p.title}</h4>
              </div>
              <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3 text-[10px] w-full">
                <span className="text-slate-500 font-bold">Author: {p.creator}</span>
                <span className="text-indigo-600 group-hover/premium:text-indigo-700 font-bold flex items-center gap-0.5">
                  Read <BookOpen className="w-3.5 h-3.5" />
                </span>
              </div>
            </PremiumInteractiveCard>
          ))}
        </div>

      </section>

      {/* ─── Personalized Discovery / Role Recommendations ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-10">
        <div className="relative rounded-[2.5rem] overflow-hidden border border-indigo-100 bg-gradient-to-tr from-indigo-50 via-purple-50/80 to-pink-50 p-8 sm:p-12 shadow-xl">
          <div className="absolute top-6 left-6 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100/60 border border-indigo-200/50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              🎯 Personalized Recommendations
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Tailored for your {role || 'Learner'} Persona</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl font-medium">
                Based on your profile, we have identified these startup ecosystem recommendations to streamline your interactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/40 max-w-3xl text-left">
              <PremiumInteractiveCard 
                glowColor="blue"
                gradientBorder={false}
                onClick={() => navigate('/discover/jobs')}
                className="p-1.5"
              >
                <div className="flex items-center justify-between gap-4 w-full text-left">
                  <div>
                    <span className="text-[8px] font-black uppercase text-indigo-600 block tracking-wider font-sans">Recommended Job</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">AI Research Engineer</h4>
                    <p className="text-xs text-slate-500 font-medium">Aether AI • Bengaluru (Hybrid)</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </PremiumInteractiveCard>

              <PremiumInteractiveCard 
                glowColor="pink"
                gradientBorder={false}
                onClick={() => navigate('/discover/communities')}
                className="p-1.5"
              >
                <div className="flex items-center justify-between gap-4 w-full text-left">
                  <div>
                    <span className="text-[8px] font-black uppercase text-pink-600 block tracking-wider font-sans">Recommended Community</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">AI Builders Space</h4>
                    <StatDisplay text="12.4k active members" className="text-xs text-slate-500 font-semibold block" />
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </PremiumInteractiveCard>
            </div>

          </div>
        </div>
      </section>

      {/* Cinematic Shared Portal Transition Overlay */}
      <AnimatePresence>
        {transitioningCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#FAFBFF]"
          >
            {/* Background mesh glow */}
            <div className={`absolute inset-0 bg-white pointer-events-none`} />
            <motion.div 
              animate={{
                background: `radial-gradient(circle at 50% 50%, ${transitioningCard.colorBg} 0%, transparent 60%)`
              }}
              className="absolute inset-0 opacity-80 pointer-events-none"
            />
            
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1.04, y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-6 max-w-lg px-6 z-10"
            >
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr ${transitioningCard.color} flex items-center justify-center text-white text-3xl shadow-xl border border-white/40`}>
                <IconComponent name={transitioningCard.iconName} className="w-10 h-10" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-slate-900">
                {transitioningCard.title}
              </h2>
              <p className="text-xs text-slate-500 font-light max-w-md mx-auto leading-relaxed">
                Synchronizing ecosystem protocol details. Loading portal interface...
              </p>
              <div className="w-44 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden mt-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={`h-full bg-gradient-to-r ${transitioningCard.color}`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DiscoverHub;
