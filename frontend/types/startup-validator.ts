export interface FounderInputs {
  idea: string;
  problemStatement: string;
  customerSegment: string;
  geography: string;
}

export interface Competitor {
  name: string;
  type: "Direct" | "Indirect" | string;
  description: string;
  fundingHistory: string;
  pricing: string;
  strength: string;
  weakness: string;
}

export interface CustomerPersona {
  avatarName: string;
  avatarDescription: string;
  idealCustomerProfile: string;
  painPoints: string[];
  behavior: string[];
}

export interface ValidationScores {
  demand: number;
  competition: number;
  scalability: number;
  revenuePotential: number;
  overall: number;
  rationale: {
    demand: string;
    competition: string;
    scalability: string;
    revenuePotential: string;
  };
}

export interface MarketResearch {
  marketSize: string;
  growthTrends: string;
  industryOverview: string;
}

export interface SummaryAndNextSteps {
  verdict: "Go" | "Pivot" | "No-Go" | string;
  reasoning: string;
  suggestedNextSteps: string[];
}

export interface ValidationReport {
  marketResearch: MarketResearch;
  competitorDiscovery: Competitor[];
  customerPersona: CustomerPersona;
  validationScores: ValidationScores;
  summaryAndNextSteps: SummaryAndNextSteps;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ValidationResponse {
  success: boolean;
  data?: ValidationReport;
  sources?: GroundingSource[];
  error?: string;
}

export interface SavedIdea extends FounderInputs {
  id: string;
  timestamp: string;
  report: ValidationReport;
  sources: GroundingSource[];
}
