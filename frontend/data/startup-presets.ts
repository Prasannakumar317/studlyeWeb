import { FounderInputs } from "../types/startup-validator";

export interface StartupPreset extends FounderInputs {
  title: string;
  emoji: string;
  description: string;
}

export const STARTUP_PRESETS: StartupPreset[] = [
  {
    title: "Freelance Tax & Bookkeeping AI",
    emoji: "💼",
    description: "Automated expense categorizing and receipt matching for freelancers.",
    idea: "AI-powered automated expense tagging and monthly tax filing tailored specifically for freelance designers and copywriters.",
    problemStatement: "Independent freelancers spend up to 10 hours a month manually matching bank receipts, reconciling business versus personal expenses, and calculating quarterly estimated taxes.",
    customerSegment: "Freelance creative professionals, solo developers, and content creators",
    geography: "United States"
  },
  {
    title: "Eco-Packaging Circular Loop",
    emoji: "📦",
    description: "RFID-tracked reusable shipping container network for e-commerce brands.",
    idea: "A full-service circular packaging platform offering RFID-tracked smart shipping boxes that customers return via local drop boxes, saving packaging cost and waste.",
    problemStatement: "E-commerce brands face high single-use packaging costs and mounting consumer pressure regarding sustainable delivery, while cardboard recycling is highly inefficient.",
    customerSegment: "Direct-to-consumer (DTC) fashion, cosmetics, and organic product e-tailers",
    geography: "Germany & France"
  },
  {
    title: "P2P Neighborhood Solar Microgrid",
    emoji: "☀️",
    description: "IoT platform for trading residential solar energy among neighbors.",
    idea: "A peer-to-peer local energy marketplace app connecting residential solar power generators directly with neighboring home-owners to sell excess battery storage capacity.",
    problemStatement: "Residential solar owners waste excess generated power or sell it back to major utility grids for low feed-in tariffs, while neighbors pay premium utility rates for electricity.",
    customerSegment: "Eco-conscious suburban homeowners, EV owners, and smart-home adopters",
    geography: "Australia"
  }
];
