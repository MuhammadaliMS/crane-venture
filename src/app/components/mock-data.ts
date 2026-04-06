// Mock data for Crane Portfolio Intelligence Platform — v5

export type HealthStatus = 'On Track' | 'At Risk' | 'Underperforming';
export type RAGStatus = 'Green' | 'Amber' | 'Red' | 'Grey';
export type UpsideCategory = 'High Potential' | 'Emerging' | 'Limited Potential';
export type ActionType = 'Lean In' | 'Lean In / Anticipate' | 'Watch' | 'De-prioritise';
export type Stage = 'Pre-seed' | 'Seed' | 'Series A' | 'Series B+';
export type Fund = 'Fund I' | 'Fund II' | 'Fund III';
export type LifecycleState = 'Active — Core' | 'Active — Non-core' | 'Exited' | 'Wound Down';
export type Currency = 'GBP' | 'USD' | 'EUR';
export type FlagType = 'Runway Alert' | 'Burn Acceleration' | 'Growth Inflection' | 'New Sales Motion' | 'Key Departure' | 'Board Coming Up' | 'Engagement Gap' | 'Fundraising Signal' | 'Market Signal' | 'Pivot Signal';
export type Region = 'UK' | 'DACH' | 'IBERIA' | 'BENELUX' | 'US' | 'NORDICS';

export interface MonthlyFinancials {
  month: string; // YYYY-MM
  arr?: number;
  revenue?: number;
  cogs?: number;
  overheads?: number;
  totalCosts?: number;
  grossProfit?: number;
  grossMargin?: number;
  ebitda?: number;
  ebitdaMargin?: number;
  cashBurnLTM?: number;
  cashBalance?: number;
  monthlyNetBurn?: number;
  headcountFTE?: number;
  boardHeadcount?: number;
  femalePctFTE?: number;
  malePctFTE?: number;
  femalePctBoard?: number;
  malePctBoard?: number;
  ethnicMinorityPctFTE?: number;
  ethnicMinorityPctBoard?: number;
  revenueOther?: number;
  rdCosts?: number;
  salesMarketingCosts?: number;
  generalAdminCosts?: number;
  bookings?: number;
  customerCount?: number;
  netRetentionRate?: number;
  netAssetsLiabilities?: number;
  headcountMale?: number;
  headcountFemale?: number;
  headcountEthnicMinority?: number;
  boardMale?: number;
  boardFemale?: number;
  boardEthnicMinority?: number;
}

export interface InvestmentAccounting {
  costAtPeriodEnd: number;
  carryingValue: number;
  moic: number;
  navUplift: number;
  valuationBasis: string;
  followOnAmount?: number;
  followOnDescription?: string;
}

export interface ExitData {
  exitDate: string;
  exitType: 'Sale' | 'Wind-down' | 'Write-off' | 'Secondary';
  exitIRR?: number;
  exitMoIC: number;
  escrowAmount?: number;
  escrowReleaseDate?: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  sector: string;
  stage: Stage;
  fund: Fund;
  lifecycle: LifecycleState;
  health: HealthStatus;
  rag: RAGStatus;
  ragHistory: RAGStatus[]; // last 4 quarters
  upside: UpsideCategory;
  action: ActionType;
  owners: string[];
  observers?: string[];
  ownerAvatars?: string[];
  currency: Currency;
  region: Region;
  mrr: number;
  mrrTrend: number[];
  arrGrowth: number;
  burn: number;
  runway: number;
  headcount: number;
  customers: number;
  lastUpdate: string;
  nextBoard: string | null;
  flagCount: number;
  investmentDate: string;
  checkSize: string;
  ownership: string;
  logoColor: string;
  location: string;
  website: string;
  managementTeam: string;
  accounting: InvestmentAccounting;
  exitData?: ExitData;
  monthlyFinancials: MonthlyFinancials[];
  recentProgress: string;
  summary: string;
  keyConcerns: string[];
  actionPoints: string[];
  equityFundraisingStatus: string;
  debtFundraisingStatus: string;
  burnReductionActions: string;
  nearTermExit: string;
}

export interface Flag {
  id: string;
  companyId: string;
  companyName: string;
  type: FlagType;
  headline: string;
  explanation: string;
  suggestedAction: string;
  urgency: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface Todo {
  id: string;
  companyName: string;
  title: string;
  dueDate: string;
  source: 'manual' | 'flag';
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ActivityEvent {
  id: string;
  companyName: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low' | 'info';
}

export interface FundEntity {
  id: string;
  name: string;
  vintage: number;
  totalCommitted: number;
  currency: Currency;
  deployed: number;
  deployedPct: number;
  availableForDeployment: number;
  tvpiNet: number;
  tvpiGross: number;
  dpi: number;
  navCurrent: number;
  navPrior: number;
  gp: string;
  administrator: string;
  accountingBasis: string;
  geographicDistribution: { region: Region; pct: number; amount: number }[];
  tvpiHistory: { quarter: string; tvpiFund: number; dpi: number; tvpiNet: number }[];
  navWaterfall: { label: string; value: number }[];
  usesOfFunds: { category: string; amount: number }[];
}

export const currentUser = {
  name: 'Anna',
  role: 'Principal',
  avatar: 'A',
  companyCount: 6,
};

export const teamMembers = [
  { name: 'Scott', role: 'General Partner', avatar: 'S', companyCount: 8 },
  { name: 'Krishna', role: 'General Partner', avatar: 'K', companyCount: 7 },
  { name: 'Anna', role: 'Principal', avatar: 'A', companyCount: 6 },
  { name: 'James', role: 'Associate', avatar: 'J', companyCount: 4 },
  { name: 'Elena', role: 'Associate', avatar: 'E', companyCount: 3 },
  { name: 'Marcus', role: 'Analyst', avatar: 'M', companyCount: 3 },
  { name: 'Sophie', role: 'VP Operations', avatar: 'So', companyCount: 2 },
  { name: 'David', role: 'Venture Partner', avatar: 'D', companyCount: 2 },
];

function generateMonthlyFinancials(baseMRR: number, currency: Currency, months = 12): MonthlyFinancials[] {
  const data: MonthlyFinancials[] = [];
  const baseDate = new Date('2025-04-01');
  for (let i = 0; i < months; i++) {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + i);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const growth = 1 + (i * 0.03);
    const rev = Math.round(baseMRR * growth);
    const revenueOther = Math.round(rev * 0.05);
    const cogs = Math.round(rev * 0.3);
    const overheads = Math.round(rev * 0.5 + baseMRR * 0.4);
    const rdCosts = Math.round(overheads * 0.4);
    const salesMarketingCosts = Math.round(overheads * 0.35);
    const generalAdminCosts = overheads - rdCosts - salesMarketingCosts;
    const gp = rev - cogs;
    const ebitda = rev - cogs - overheads;
    const cashBalance = Math.max(500000 - Math.abs(ebitda) * i, 100000);
    const headcountFTE = 10 + Math.floor(i * 0.5);
    const boardHeadcount = 4;
    const femalePctFTE = 35 + Math.floor(Math.random() * 5);
    const malePctFTE = 65 - Math.floor(Math.random() * 5);
    const femalePctBoard = 25;
    const malePctBoard = 75;
    const ethnicMinorityPctFTE = 18 + Math.floor(Math.random() * 4);
    const ethnicMinorityPctBoard = 25;
    data.push({
      month,
      arr: rev * 12,
      revenue: rev,
      revenueOther,
      cogs,
      overheads,
      rdCosts,
      salesMarketingCosts,
      generalAdminCosts,
      totalCosts: cogs + overheads,
      grossProfit: gp,
      grossMargin: Math.round((gp / rev) * 100),
      ebitda,
      ebitdaMargin: Math.round((ebitda / rev) * 100),
      cashBurnLTM: Math.abs(ebitda) * 12,
      cashBalance,
      monthlyNetBurn: Math.abs(ebitda),
      bookings: Math.round(rev * (1.1 + Math.random() * 0.2)),
      customerCount: Math.round(10 + baseMRR / 5000 + i * 1.5),
      netRetentionRate: Math.round(105 + Math.random() * 10),
      netAssetsLiabilities: Math.round(cashBalance - baseMRR * 2),
      headcountFTE,
      boardHeadcount,
      femalePctFTE,
      malePctFTE,
      femalePctBoard,
      malePctBoard,
      ethnicMinorityPctFTE,
      ethnicMinorityPctBoard,
      headcountFemale: Math.round(headcountFTE * femalePctFTE / 100),
      headcountMale: Math.round(headcountFTE * malePctFTE / 100),
      headcountEthnicMinority: Math.round(headcountFTE * ethnicMinorityPctFTE / 100),
      boardFemale: Math.round(boardHeadcount * femalePctBoard / 100),
      boardMale: Math.round(boardHeadcount * malePctBoard / 100),
      boardEthnicMinority: Math.round(boardHeadcount * ethnicMinorityPctBoard / 100),
    });
  }
  return data;
}

export const companies: Company[] = [
  {
    id: '1', name: 'Arcline', description: 'AI-powered code review for engineering teams',
    sector: 'DevTools', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Amber', 'Green'],
    upside: 'High Potential', action: 'Lean In',
    owners: ['Anna', 'Scott'], ownerAvatars: ['A', 'S'], observers: ['James'], currency: 'GBP', region: 'UK',
    mrr: 45000, mrrTrend: [18, 24, 29, 35, 40, 45], arrGrowth: 18,
    burn: 120000, runway: 16, headcount: 14, customers: 32, lastUpdate: '2026-03-12',
    nextBoard: '2026-03-28', flagCount: 1, investmentDate: '2024-09-15', checkSize: '£1.5M',
    ownership: '12%', logoColor: '#3B82F6', location: 'London, UK', website: 'arcline.io',
    managementTeam: 'CEO: Sarah Chen, CTO: James Wright',
    accounting: { costAtPeriodEnd: 1500000, carryingValue: 2800000, moic: 1.87, navUplift: 300000, valuationBasis: 'Last round valuation with 15% uplift based on revenue growth' },
    monthlyFinancials: generateMonthlyFinancials(45000, 'GBP'),
    recentProgress: 'Strong enterprise traction with 4 new logos in Q1. Product-market fit solidifying with NPS of 72. v2.0 shipped with enterprise SSO.',
    summary: 'Arcline continues to execute well with accelerating revenue growth and strong enterprise pipeline. Product velocity remains high.',
    keyConcerns: ['1. CAC increasing as market matures', '2. Competitor CodeReview.ai raised Series A'],
    actionPoints: ['1. Connect founders with VP Sales candidates from network', '2. Review pricing strategy ahead of next board'],
    equityFundraisingStatus: 'Planning Series A for Q3 2026', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A — healthy runway', nearTermExit: 'N/A',
  },
  {
    id: '2', name: 'Nebula Data', description: 'Real-time data pipeline orchestration',
    sector: 'Data Infra', stage: 'Series A', fund: 'Fund II', lifecycle: 'Active — Core',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Green', 'Green'],
    upside: 'High Potential', action: 'Lean In',
    owners: ['Anna'], ownerAvatars: ['A'], currency: 'USD', region: 'US',
    mrr: 128000, mrrTrend: [72, 85, 95, 108, 118, 128], arrGrowth: 22,
    burn: 280000, runway: 18, headcount: 38, customers: 85, lastUpdate: '2026-03-10',
    nextBoard: '2026-04-15', flagCount: 0, investmentDate: '2023-06-20', checkSize: '£2.5M',
    ownership: '8%', logoColor: '#8B5CF6', location: 'San Francisco, US', website: 'nebuladata.io',
    managementTeam: 'CEO: Mike Torres, CTO: Priya Shah',
    accounting: { costAtPeriodEnd: 2500000, carryingValue: 6200000, moic: 2.48, navUplift: 800000, valuationBasis: 'Series A valuation at last round price' },
    monthlyFinancials: generateMonthlyFinancials(128000, 'USD'),
    recentProgress: 'Crossed $1.5M ARR milestone. Enterprise pipeline strong with 3 Fortune 500 POCs in progress.',
    summary: 'Nebula Data is the standout performer in Fund II. Revenue growing 22% MoM with strong unit economics.',
    keyConcerns: ['1. US market requires local presence — team still mostly remote', '2. Competition from Fivetran increasing'],
    actionPoints: ['1. Intro to Datadog for potential partnership', '2. Support hiring of VP Engineering'],
    equityFundraisingStatus: 'Not currently raising', debtFundraisingStatus: 'Exploring venture debt',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  {
    id: '3', name: 'Vaultik', description: 'Zero-trust infrastructure for cloud-native apps',
    sector: 'Security', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'At Risk', rag: 'Amber', ragHistory: ['Green', 'Amber', 'Amber', 'Amber'],
    upside: 'High Potential', action: 'Lean In / Anticipate',
    owners: ['Anna', 'Krishna'], ownerAvatars: ['A', 'K'], observers: ['Elena'], currency: 'GBP', region: 'UK',
    mrr: 22000, mrrTrend: [15, 18, 20, 21, 21, 22], arrGrowth: 3,
    burn: 150000, runway: 9, headcount: 11, customers: 18, lastUpdate: '2026-02-28',
    nextBoard: '2026-03-22', flagCount: 3, investmentDate: '2024-11-01', checkSize: '£1.2M',
    ownership: '14%', logoColor: '#EF4444', location: 'London, UK', website: 'vaultik.io',
    managementTeam: 'CEO: Tom Hughes, CTO: Ana Reyes',
    accounting: { costAtPeriodEnd: 1200000, carryingValue: 1200000, moic: 1.0, navUplift: 0, valuationBasis: 'Held at cost — growth below expectations' },
    monthlyFinancials: generateMonthlyFinancials(22000, 'GBP'),
    recentProgress: 'Product pivot to focus on API security. New positioning gaining initial traction but too early to confirm.',
    summary: 'Vaultik is at risk with stalling revenue growth and elevated burn. Pivot to API security shows early promise but unproven.',
    keyConcerns: ['1. Runway dropping — 9 months at current burn', '2. Revenue growth stalled at 3% MoM', '3. Competitor CrowdAPI raised €15M'],
    actionPoints: ['1. Schedule runway review with founders', '2. Assess bridge financing options', '3. Connect with API security sector experts'],
    equityFundraisingStatus: 'Considering bridge round', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'Reviewing headcount plan — may defer 2 hires', nearTermExit: 'N/A',
  },
  {
    id: '4', name: 'Synthwave', description: 'Generative AI for product design workflows',
    sector: 'AI/ML', stage: 'Pre-seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Green', 'Green'],
    upside: 'Emerging', action: 'Lean In',
    owners: ['Anna'], ownerAvatars: ['A'], currency: 'GBP', region: 'UK',
    mrr: 8000, mrrTrend: [0, 0, 2, 4, 6, 8], arrGrowth: 45,
    burn: 65000, runway: 14, headcount: 5, customers: 8, lastUpdate: '2026-03-14',
    nextBoard: null, flagCount: 0, investmentDate: '2025-08-10', checkSize: '£500K',
    ownership: '18%', logoColor: '#F59E0B', location: 'London, UK', website: 'synthwave.design',
    managementTeam: 'CEO: Lara Kim',
    accounting: { costAtPeriodEnd: 500000, carryingValue: 750000, moic: 1.5, navUplift: 50000, valuationBasis: 'Uplift based on early traction and comparable pre-seed valuations' },
    monthlyFinancials: generateMonthlyFinancials(8000, 'GBP'),
    recentProgress: 'First paying customers onboarded. Design partner programme with 3 agencies. Strong founder with deep domain expertise.',
    summary: 'Early but promising. Synthwave is finding product-market fit in the design automation space with strong initial signals.',
    keyConcerns: ['1. Very early — limited revenue data', '2. Generative AI space highly competitive'],
    actionPoints: ['1. Intro to potential design partner (Figma)', '2. Monitor competitive landscape closely'],
    equityFundraisingStatus: 'Will raise Seed in H2 2026', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  {
    id: '5', name: 'Gridform', description: 'No-code backend builder for SaaS teams',
    sector: 'DevTools', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'At Risk', rag: 'Amber', ragHistory: ['Green', 'Green', 'Amber', 'Amber'],
    upside: 'Emerging', action: 'Watch',
    owners: ['Anna'], ownerAvatars: ['A'], currency: 'GBP', region: 'UK',
    mrr: 15000, mrrTrend: [12, 14, 15, 15, 15, 15], arrGrowth: 0,
    burn: 95000, runway: 7, headcount: 8, customers: 22, lastUpdate: '2026-02-15',
    nextBoard: null, flagCount: 2, investmentDate: '2025-01-20', checkSize: '£800K',
    ownership: '10%', logoColor: '#10B981', location: 'Manchester, UK', website: 'gridform.dev',
    managementTeam: 'CEO: Dan Morris, CTO: Amy Liu',
    accounting: { costAtPeriodEnd: 800000, carryingValue: 600000, moic: 0.75, navUplift: -100000, valuationBasis: 'Written down to reflect stagnating growth' },
    monthlyFinancials: generateMonthlyFinancials(15000, 'GBP'),
    recentProgress: 'Revenue flat for 3 months. Team exploring pivot to enterprise from SMB. Engagement gap — no update in 30 days.',
    summary: 'Gridform is struggling with flat revenue and declining runway. Enterprise pivot under consideration but unvalidated.',
    keyConcerns: ['1. Revenue flat for 3 consecutive months', '2. Runway at 7 months — approaching critical threshold', '3. No founder communication for 30 days'],
    actionPoints: ['1. Schedule urgent founder check-in', '2. Review cost structure and runway extension options'],
    equityFundraisingStatus: 'Not currently raising', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'Founder considering headcount reduction', nearTermExit: 'N/A',
  },
  {
    id: '6', name: 'Pulsetrack', description: 'Developer experience analytics platform',
    sector: 'DevTools', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'Underperforming', rag: 'Red', ragHistory: ['Amber', 'Amber', 'Red', 'Red'],
    upside: 'Limited Potential', action: 'De-prioritise',
    owners: ['Anna'], ownerAvatars: ['A'], currency: 'GBP', region: 'UK',
    mrr: 5000, mrrTrend: [8, 7, 6, 6, 5, 5], arrGrowth: -15,
    burn: 80000, runway: 4, headcount: 6, customers: 10, lastUpdate: '2026-01-20',
    nextBoard: null, flagCount: 4, investmentDate: '2024-04-15', checkSize: '£700K',
    ownership: '11%', logoColor: '#6B7280', location: 'London, UK', website: 'pulsetrack.dev',
    managementTeam: 'CEO: Raj Patel',
    accounting: { costAtPeriodEnd: 700000, carryingValue: 200000, moic: 0.29, navUplift: -250000, valuationBasis: 'Written down significantly — runway critical, revenue declining' },
    monthlyFinancials: generateMonthlyFinancials(5000, 'GBP'),
    recentProgress: 'Revenue declining. No communication from founder since January. Runway critical at 4 months.',
    summary: 'Pulsetrack is significantly underperforming with declining revenue and critical runway. Requires immediate attention.',
    keyConcerns: ['1. Runway at 4 months — below critical threshold', '2. Revenue declining 15% MoM', '3. No founder communication for 2 months', '4. No fundraising activity'],
    actionPoints: ['1. Urgent founder call — discuss survival plan', '2. Assess bridge financing or wind-down options'],
    equityFundraisingStatus: 'Not raising — no investor interest', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'Emergency cost review needed', nearTermExit: 'Potential wind-down if no improvement',
  },
  {
    id: '7', name: 'DataForge', description: 'Automated data warehouse modernization',
    sector: 'Data Infra', stage: 'Series A', fund: 'Fund II', lifecycle: 'Active — Core',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Green', 'Green'],
    upside: 'High Potential', action: 'Lean In',
    owners: ['Scott'], ownerAvatars: ['S'], currency: 'GBP', region: 'UK',
    mrr: 210000, mrrTrend: [140, 155, 170, 185, 195, 210], arrGrowth: 12,
    burn: 350000, runway: 22, headcount: 52, customers: 120, lastUpdate: '2026-03-15',
    nextBoard: '2026-04-02', flagCount: 0, investmentDate: '2022-11-10', checkSize: '£3M',
    ownership: '6%', logoColor: '#0EA5E9', location: 'London, UK', website: 'dataforge.io',
    managementTeam: 'CEO: Mark Stevens, CTO: Elena Vasquez',
    accounting: { costAtPeriodEnd: 3000000, carryingValue: 9500000, moic: 3.17, navUplift: 1200000, valuationBasis: 'Series B comparable valuation based on revenue multiples' },
    monthlyFinancials: generateMonthlyFinancials(210000, 'GBP'),
    recentProgress: 'ARR crossed £2.5M. Strong quarter with major enterprise wins including a FTSE 100 customer.',
    summary: 'DataForge is a top performer delivering consistent growth. Approaching Series B readiness.',
    keyConcerns: ['1. Sales cycle lengthening for enterprise deals'],
    actionPoints: ['1. Support Series B preparation', '2. Intro to growth-stage VCs'],
    equityFundraisingStatus: 'Series B planned for Q4 2026', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  {
    id: '8', name: 'Cortex AI', description: 'Enterprise LLM orchestration platform',
    sector: 'AI/ML', stage: 'Series A', fund: 'Fund II', lifecycle: 'Active — Core',
    health: 'On Track', rag: 'Green', ragHistory: ['Amber', 'Green', 'Green', 'Green'],
    upside: 'High Potential', action: 'Lean In',
    owners: ['Scott', 'Anna'], ownerAvatars: ['S', 'A'], observers: ['Marcus'], currency: 'USD', region: 'US',
    mrr: 185000, mrrTrend: [90, 110, 130, 150, 168, 185], arrGrowth: 28,
    burn: 420000, runway: 15, headcount: 45, customers: 65, lastUpdate: '2026-03-11',
    nextBoard: '2026-03-30', flagCount: 1, investmentDate: '2023-08-22', checkSize: '£2.8M',
    ownership: '7%', logoColor: '#7C3AED', location: 'New York, US', website: 'cortexai.com',
    managementTeam: 'CEO: David Kim, CTO: Rachel Green',
    accounting: { costAtPeriodEnd: 2800000, carryingValue: 8400000, moic: 3.0, navUplift: 1500000, valuationBasis: 'Series B pricing from inbound term sheets' },
    monthlyFinancials: generateMonthlyFinancials(185000, 'USD'),
    recentProgress: 'Revenue growing 28% MoM — fastest in portfolio. Multiple Series B term sheets received.',
    summary: 'Cortex AI is accelerating rapidly. Strong enterprise demand for LLM orchestration. Series B imminent.',
    keyConcerns: ['1. High burn — $420K/mo, but justified by growth'],
    actionPoints: ['1. Assess follow-on opportunity for Series B', '2. Schedule GP review of term sheets'],
    equityFundraisingStatus: 'Active Series B — multiple term sheets', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  {
    id: '9', name: 'Shieldnet', description: 'API security monitoring and threat detection',
    sector: 'Security', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'At Risk', rag: 'Amber', ragHistory: ['Green', 'Green', 'Amber', 'Amber'],
    upside: 'Emerging', action: 'Watch',
    owners: ['Scott'], ownerAvatars: ['S'], currency: 'GBP', region: 'UK',
    mrr: 18000, mrrTrend: [10, 13, 15, 16, 17, 18], arrGrowth: 8,
    burn: 110000, runway: 8, headcount: 9, customers: 15, lastUpdate: '2026-03-05',
    nextBoard: null, flagCount: 2, investmentDate: '2025-03-01', checkSize: '£1M',
    ownership: '13%', logoColor: '#DC2626', location: 'London, UK', website: 'shieldnet.io',
    managementTeam: 'CEO: Oliver Hart, CTO: Fatima Al-Rashid',
    accounting: { costAtPeriodEnd: 1000000, carryingValue: 1000000, moic: 1.0, navUplift: 0, valuationBasis: 'Held at cost' },
    monthlyFinancials: generateMonthlyFinancials(18000, 'GBP'),
    recentProgress: 'Slow but steady growth. Competitor CrowdAPI raising aggressively. Team exploring channel partnerships.',
    summary: 'Shieldnet shows modest growth but faces increasing competitive pressure from well-funded CrowdAPI.',
    keyConcerns: ['1. CrowdAPI raised €15M — competitive pressure increasing', '2. Runway at 8 months'],
    actionPoints: ['1. Discuss competitive positioning', '2. Explore partnership opportunities'],
    equityFundraisingStatus: 'Not currently raising', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'Considering deferring non-essential hires', nearTermExit: 'N/A',
  },
  {
    id: '10', name: 'Flowbase', description: 'Visual API builder for non-technical teams',
    sector: 'DevTools', stage: 'Pre-seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Green', 'Green'],
    upside: 'Emerging', action: 'Lean In',
    owners: ['Krishna'], ownerAvatars: ['K'], currency: 'EUR', region: 'DACH',
    mrr: 3000, mrrTrend: [0, 0, 0, 1, 2, 3], arrGrowth: 60,
    burn: 45000, runway: 20, headcount: 4, customers: 5, lastUpdate: '2026-03-13',
    nextBoard: null, flagCount: 0, investmentDate: '2025-11-15', checkSize: '£400K',
    ownership: '20%', logoColor: '#14B8A6', location: 'Berlin, Germany', website: 'flowbase.dev',
    managementTeam: 'CEO: Max Weber',
    accounting: { costAtPeriodEnd: 400000, carryingValue: 400000, moic: 1.0, navUplift: 0, valuationBasis: 'Held at cost — very early stage' },
    monthlyFinancials: generateMonthlyFinancials(3000, 'EUR'),
    recentProgress: 'First paying customers. Design partner programme launched. Strong founder execution.',
    summary: 'Very early but founder executing well. First revenue signals positive.',
    keyConcerns: ['1. Very early — limited data'],
    actionPoints: ['1. Monitor progress quarterly'],
    equityFundraisingStatus: 'Seed round planned for Q1 2027', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  {
    id: '11', name: 'Metrik', description: 'Financial analytics for SaaS startups',
    sector: 'Fintech', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Green', 'Green'],
    upside: 'Emerging', action: 'Lean In',
    owners: ['Krishna'], ownerAvatars: ['K'], currency: 'EUR', region: 'IBERIA',
    mrr: 35000, mrrTrend: [20, 24, 27, 30, 32, 35], arrGrowth: 14,
    burn: 88000, runway: 13, headcount: 10, customers: 45, lastUpdate: '2026-03-09',
    nextBoard: '2026-04-10', flagCount: 0, investmentDate: '2024-07-08', checkSize: '£1.1M',
    ownership: '12%', logoColor: '#F97316', location: 'Lisbon, Portugal', website: 'metrik.finance',
    managementTeam: 'CEO: Maria Santos, CTO: Pedro Costa',
    accounting: { costAtPeriodEnd: 1100000, carryingValue: 1650000, moic: 1.5, navUplift: 150000, valuationBasis: 'Uplift based on strong revenue traction' },
    monthlyFinancials: generateMonthlyFinancials(35000, 'EUR'),
    recentProgress: 'Consistent growth across Iberian market. Expanding to DACH region.',
    summary: 'Metrik delivers steady growth with strong founder execution. Regional expansion underway.',
    keyConcerns: ['1. Regional expansion adds complexity'],
    actionPoints: ['1. Support DACH market entry with intros'],
    equityFundraisingStatus: 'Series A planned for Q1 2027', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  {
    id: '12', name: 'Stackpilot', description: 'AI copilot for DevOps',
    sector: 'DevTools', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Core',
    health: 'Underperforming', rag: 'Red', ragHistory: ['Green', 'Amber', 'Red', 'Red'],
    upside: 'Emerging', action: 'Watch',
    owners: ['James'], ownerAvatars: ['J'], currency: 'GBP', region: 'UK',
    mrr: 7000, mrrTrend: [9, 9, 8, 8, 7, 7], arrGrowth: -10,
    burn: 75000, runway: 5, headcount: 6, customers: 12, lastUpdate: '2026-02-20',
    nextBoard: null, flagCount: 3, investmentDate: '2024-12-01', checkSize: '£600K',
    ownership: '15%', logoColor: '#64748B', location: 'London, UK', website: 'stackpilot.dev',
    managementTeam: 'CEO: Ben Carter (solo founder after CTO departure)',
    accounting: { costAtPeriodEnd: 600000, carryingValue: 300000, moic: 0.5, navUplift: -150000, valuationBasis: 'Written down 50% — CTO departure, declining revenue' },
    monthlyFinancials: generateMonthlyFinancials(7000, 'GBP'),
    recentProgress: 'CTO departed. Revenue declining. Solo founder struggling with technical roadmap.',
    summary: 'Stackpilot is underperforming significantly following CTO departure. Requires close monitoring.',
    keyConcerns: ['1. CTO departed — critical leadership gap', '2. Revenue declining 10% MoM', '3. Runway at 5 months'],
    actionPoints: ['1. Emergency check-in with founder', '2. Assess CTO replacement plan', '3. Consider bridge or wind-down'],
    equityFundraisingStatus: 'Not raising', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'Founder considering reducing to 4 FTE', nearTermExit: 'Potential wind-down if no CTO found',
  },
  // Non-core companies
  {
    id: '13', name: 'Plumerai', description: 'Edge AI inference optimization',
    sector: 'AI/ML', stage: 'Seed', fund: 'Fund I', lifecycle: 'Active — Non-core',
    health: 'On Track', rag: 'Grey', ragHistory: ['Grey', 'Grey', 'Grey', 'Grey'],
    upside: 'Limited Potential', action: 'De-prioritise',
    owners: ['Krishna'], ownerAvatars: ['K'], currency: 'GBP', region: 'UK',
    mrr: 12000, mrrTrend: [10, 10, 11, 11, 12, 12], arrGrowth: 5,
    burn: 40000, runway: 24, headcount: 6, customers: 8, lastUpdate: '2026-01-15',
    nextBoard: null, flagCount: 0, investmentDate: '2020-06-01', checkSize: '£300K',
    ownership: '4%', logoColor: '#94A3B8', location: 'London, UK', website: 'plumerai.com',
    managementTeam: 'CEO: Tijmen Blankevoort',
    accounting: { costAtPeriodEnd: 300000, carryingValue: 300000, moic: 1.0, navUplift: 0, valuationBasis: 'Held at cost — non-core position' },
    monthlyFinancials: generateMonthlyFinancials(12000, 'GBP'),
    recentProgress: 'Steady but small position. Minimal tracking required.', summary: 'Non-core position. Stable.',
    keyConcerns: [], actionPoints: [],
    equityFundraisingStatus: 'N/A', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  {
    id: '14', name: 'Omni:us', description: 'AI document processing for insurance',
    sector: 'AI/ML', stage: 'Series A', fund: 'Fund I', lifecycle: 'Active — Non-core',
    health: 'At Risk', rag: 'Grey', ragHistory: ['Grey', 'Grey', 'Grey', 'Grey'],
    upside: 'Limited Potential', action: 'De-prioritise',
    owners: ['Scott'], ownerAvatars: ['S'], currency: 'EUR', region: 'DACH',
    mrr: 25000, mrrTrend: [28, 27, 26, 25, 25, 25], arrGrowth: -3,
    burn: 60000, runway: 12, headcount: 15, customers: 20, lastUpdate: '2025-12-10',
    nextBoard: null, flagCount: 0, investmentDate: '2019-09-15', checkSize: '£500K',
    ownership: '3%', logoColor: '#A78BFA', location: 'Berlin, Germany', website: 'omnius.com',
    managementTeam: 'CEO: Sofie Quidenus-Wahlforss',
    accounting: { costAtPeriodEnd: 500000, carryingValue: 350000, moic: 0.7, navUplift: 0, valuationBasis: 'Written down — non-core, declining revenue' },
    monthlyFinancials: generateMonthlyFinancials(25000, 'EUR'),
    recentProgress: 'Stable but non-core. Minimal engagement required.', summary: 'Non-core position. Legacy investment.',
    keyConcerns: [], actionPoints: [],
    equityFundraisingStatus: 'N/A', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A',
  },
  // Exited companies
  {
    id: '15', name: 'Reinfer', description: 'NLP for enterprise communications',
    sector: 'AI/ML', stage: 'Series A', fund: 'Fund I', lifecycle: 'Exited',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Green', 'Green'],
    upside: 'High Potential', action: 'Lean In',
    owners: ['Scott'], ownerAvatars: ['S'], currency: 'GBP', region: 'UK',
    mrr: 0, mrrTrend: [180, 200, 220, 240, 260, 0], arrGrowth: 0,
    burn: 0, runway: 0, headcount: 0, customers: 0, lastUpdate: '2024-08-15',
    nextBoard: null, flagCount: 0, investmentDate: '2019-03-10', checkSize: '£1.8M',
    ownership: '0%', logoColor: '#059669', location: 'London, UK', website: 'reinfer.io',
    managementTeam: 'Acquired by UiPath',
    accounting: { costAtPeriodEnd: 1800000, carryingValue: 0, moic: 4.2, navUplift: 0, valuationBasis: 'Exited — acquired by UiPath' },
    exitData: { exitDate: '2024-08-15', exitType: 'Sale', exitIRR: 38, exitMoIC: 4.2 },
    monthlyFinancials: [],
    recentProgress: 'Exited. Acquired by UiPath for £7.6M (Crane share).',
    summary: 'Successful exit via acquisition by UiPath. Strong return.',
    keyConcerns: [], actionPoints: [],
    equityFundraisingStatus: 'N/A', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A — exited',
  },
  {
    id: '16', name: 'Shipamax', description: 'Document AI for logistics',
    sector: 'AI/ML', stage: 'Series A', fund: 'Fund I', lifecycle: 'Exited',
    health: 'On Track', rag: 'Green', ragHistory: ['Green', 'Green', 'Green', 'Green'],
    upside: 'High Potential', action: 'Lean In',
    owners: ['Krishna'], ownerAvatars: ['K'], currency: 'GBP', region: 'UK',
    mrr: 0, mrrTrend: [120, 140, 160, 180, 200, 0], arrGrowth: 0,
    burn: 0, runway: 0, headcount: 0, customers: 0, lastUpdate: '2025-01-20',
    nextBoard: null, flagCount: 0, investmentDate: '2019-07-22', checkSize: '£1.2M',
    ownership: '0%', logoColor: '#2563EB', location: 'London, UK', website: 'shipamax.com',
    managementTeam: 'Acquired by E2open',
    accounting: { costAtPeriodEnd: 1200000, carryingValue: 0, moic: 3.1, navUplift: 0, valuationBasis: 'Exited — acquired by E2open' },
    exitData: { exitDate: '2025-01-20', exitType: 'Sale', exitIRR: 28, exitMoIC: 3.1, escrowAmount: 180000, escrowReleaseDate: '2026-07-20' },
    monthlyFinancials: [],
    recentProgress: 'Exited. Acquired by E2open. Escrow of £180K pending release Jul 2026.',
    summary: 'Successful exit. Escrow pending.',
    keyConcerns: [], actionPoints: [],
    equityFundraisingStatus: 'N/A', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A — exited',
  },
  // Wound down
  {
    id: '17', name: 'AlertFusion', description: 'Unified alerting for DevOps teams',
    sector: 'DevTools', stage: 'Seed', fund: 'Fund I', lifecycle: 'Wound Down',
    health: 'Underperforming', rag: 'Red', ragHistory: ['Amber', 'Red', 'Red', 'Red'],
    upside: 'Limited Potential', action: 'De-prioritise',
    owners: ['James'], ownerAvatars: ['J'], currency: 'GBP', region: 'UK',
    mrr: 0, mrrTrend: [5, 4, 3, 2, 1, 0], arrGrowth: 0,
    burn: 0, runway: 0, headcount: 0, customers: 0, lastUpdate: '2025-09-01',
    nextBoard: null, flagCount: 0, investmentDate: '2021-05-10', checkSize: '£600K',
    ownership: '0%', logoColor: '#9CA3AF', location: 'London, UK', website: 'alertfusion.io',
    managementTeam: 'Company dissolved',
    accounting: { costAtPeriodEnd: 600000, carryingValue: 0, moic: 0.0, navUplift: 0, valuationBasis: 'Written to £0 — wound down' },
    exitData: { exitDate: '2025-09-01', exitType: 'Wind-down', exitMoIC: 0.0 },
    monthlyFinancials: [],
    recentProgress: 'Wound down. Company dissolved September 2025.',
    summary: 'Failed to achieve product-market fit. Lessons: too niche, market timing.',
    keyConcerns: [], actionPoints: [],
    equityFundraisingStatus: 'N/A', debtFundraisingStatus: 'N/A',
    burnReductionActions: 'N/A', nearTermExit: 'N/A — wound down',
  },
];

export const funds: FundEntity[] = [
  {
    id: 'fund1', name: 'Fund I', vintage: 2018, totalCommitted: 70300000, currency: 'GBP',
    deployed: 56240000, deployedPct: 80, availableForDeployment: 14060000,
    tvpiNet: 1.72, tvpiGross: 1.95, dpi: 0.45, navCurrent: 89200000, navPrior: 84500000,
    gp: 'Scott Sage / Krishna Visvanathan', administrator: 'Langham Hall',
    accountingBasis: 'UK GAAP',
    geographicDistribution: [
      { region: 'UK', pct: 61, amount: 34310000 },
      { region: 'DACH', pct: 14, amount: 7874000 },
      { region: 'IBERIA', pct: 11, amount: 6186000 },
      { region: 'BENELUX', pct: 7, amount: 3937000 },
      { region: 'US', pct: 7, amount: 3937000 },
      { region: 'NORDICS', pct: 0, amount: 0 },
    ],
    tvpiHistory: [
      { quarter: 'Q1 2023', tvpiFund: 1.15, dpi: 0.0, tvpiNet: 1.10 },
      { quarter: 'Q2 2023', tvpiFund: 1.22, dpi: 0.0, tvpiNet: 1.17 },
      { quarter: 'Q3 2023', tvpiFund: 1.30, dpi: 0.0, tvpiNet: 1.25 },
      { quarter: 'Q4 2023', tvpiFund: 1.38, dpi: 0.0, tvpiNet: 1.32 },
      { quarter: 'Q1 2024', tvpiFund: 1.45, dpi: 0.0, tvpiNet: 1.39 },
      { quarter: 'Q2 2024', tvpiFund: 1.52, dpi: 0.12, tvpiNet: 1.45 },
      { quarter: 'Q3 2024', tvpiFund: 1.60, dpi: 0.25, tvpiNet: 1.52 },
      { quarter: 'Q4 2024', tvpiFund: 1.68, dpi: 0.32, tvpiNet: 1.58 },
      { quarter: 'Q1 2025', tvpiFund: 1.75, dpi: 0.38, tvpiNet: 1.62 },
      { quarter: 'Q2 2025', tvpiFund: 1.82, dpi: 0.40, tvpiNet: 1.65 },
      { quarter: 'Q3 2025', tvpiFund: 1.88, dpi: 0.42, tvpiNet: 1.68 },
      { quarter: 'Q4 2025', tvpiFund: 1.95, dpi: 0.45, tvpiNet: 1.72 },
    ],
    navWaterfall: [
      { label: 'NAV Start', value: 84500000 },
      { label: 'Contributions', value: 2800000 },
      { label: 'Distributions', value: -1500000 },
      { label: 'Realised Gains', value: 1200000 },
      { label: 'Unrealised Gains', value: 3100000 },
      { label: 'Operating', value: -400000 },
      { label: 'GP Share', value: -500000 },
      { label: 'NAV End', value: 89200000 },
    ],
    usesOfFunds: [
      { category: 'Investments', amount: 52000000 },
      { category: 'Follow-ons', amount: 4240000 },
      { category: 'Divestments', amount: -8500000 },
      { category: 'GP Share', amount: 2100000 },
      { category: 'Fund Expenses', amount: 3200000 },
      { category: 'Available', amount: 14060000 },
    ],
  },
  {
    id: 'fund2', name: 'Fund II', vintage: 2022, totalCommitted: 120000000, currency: 'GBP',
    deployed: 48000000, deployedPct: 40, availableForDeployment: 72000000,
    tvpiNet: 1.35, tvpiGross: 1.48, dpi: 0.0, navCurrent: 64800000, navPrior: 58000000,
    gp: 'Scott Sage / Krishna Visvanathan', administrator: 'Langham Hall',
    accountingBasis: 'UK GAAP',
    geographicDistribution: [
      { region: 'UK', pct: 45, amount: 21600000 },
      { region: 'US', pct: 30, amount: 14400000 },
      { region: 'DACH', pct: 15, amount: 7200000 },
      { region: 'IBERIA', pct: 5, amount: 2400000 },
      { region: 'BENELUX', pct: 5, amount: 2400000 },
      { region: 'NORDICS', pct: 0, amount: 0 },
    ],
    tvpiHistory: [
      { quarter: 'Q1 2023', tvpiFund: 1.0, dpi: 0.0, tvpiNet: 1.0 },
      { quarter: 'Q2 2023', tvpiFund: 1.02, dpi: 0.0, tvpiNet: 1.01 },
      { quarter: 'Q3 2023', tvpiFund: 1.05, dpi: 0.0, tvpiNet: 1.03 },
      { quarter: 'Q4 2023', tvpiFund: 1.10, dpi: 0.0, tvpiNet: 1.07 },
      { quarter: 'Q1 2024', tvpiFund: 1.15, dpi: 0.0, tvpiNet: 1.12 },
      { quarter: 'Q2 2024', tvpiFund: 1.20, dpi: 0.0, tvpiNet: 1.17 },
      { quarter: 'Q3 2024', tvpiFund: 1.28, dpi: 0.0, tvpiNet: 1.22 },
      { quarter: 'Q4 2024', tvpiFund: 1.35, dpi: 0.0, tvpiNet: 1.28 },
      { quarter: 'Q1 2025', tvpiFund: 1.38, dpi: 0.0, tvpiNet: 1.30 },
      { quarter: 'Q2 2025', tvpiFund: 1.42, dpi: 0.0, tvpiNet: 1.32 },
      { quarter: 'Q3 2025', tvpiFund: 1.45, dpi: 0.0, tvpiNet: 1.33 },
      { quarter: 'Q4 2025', tvpiFund: 1.48, dpi: 0.0, tvpiNet: 1.35 },
    ],
    navWaterfall: [
      { label: 'NAV Start', value: 58000000 },
      { label: 'Contributions', value: 8500000 },
      { label: 'Distributions', value: 0 },
      { label: 'Realised Gains', value: 0 },
      { label: 'Unrealised Gains', value: -700000 },
      { label: 'Operating', value: -500000 },
      { label: 'GP Share', value: -500000 },
      { label: 'NAV End', value: 64800000 },
    ],
    usesOfFunds: [
      { category: 'Investments', amount: 42000000 },
      { category: 'Follow-ons', amount: 6000000 },
      { category: 'Divestments', amount: 0 },
      { category: 'GP Share', amount: 1800000 },
      { category: 'Fund Expenses', amount: 2400000 },
      { category: 'Available', amount: 72000000 },
    ],
  },
];

export const flags: Flag[] = [
  {
    id: 'f1', companyId: '3', companyName: 'Vaultik', type: 'Burn Acceleration',
    headline: 'Burn rate accelerating at Vaultik — runway dropped from 14 to 9 months',
    explanation: 'Burn increased 40% over last quarter while revenue growth stalled at 3% MoM. Current burn is £150K/mo against £22K MRR. At this rate, runway will hit critical 6-month threshold by May.',
    suggestedAction: 'Schedule founder check-in to discuss runway extension and cost reduction strategy',
    urgency: 'high', createdAt: '2026-03-15',
  },
  {
    id: 'f2', companyId: '3', companyName: 'Vaultik', type: 'Board Coming Up',
    headline: 'Vaultik board meeting in 5 days — prep not started',
    explanation: 'Board meeting scheduled for March 22. Latest Q4 board deck and February email update have been ingested. Several discussion points flagged around burn rate and product pivot considerations.',
    suggestedAction: 'Start board prep — review AI-generated brief',
    urgency: 'high', createdAt: '2026-03-17',
  },
  {
    id: 'f3', companyId: '1', companyName: 'Arcline', type: 'Growth Inflection',
    headline: 'Arcline MRR up 18% MoM — growth accelerating',
    explanation: 'Revenue growth has accelerated for the third consecutive month. MRR increased from £40K to £45K. Notable enterprise customer wins reported in latest update. Customer count grew from 28 to 32.',
    suggestedAction: 'Discuss follow-on opportunity and connect founders with venture partners for enterprise sales',
    urgency: 'medium', createdAt: '2026-03-12',
  },
  {
    id: 'f4', companyId: '5', companyName: 'Gridform', type: 'Engagement Gap',
    headline: 'No interaction with Gridform for 30 days',
    explanation: 'Last team interaction was on February 15. No email updates, check-ins, or board communications received. The company had previously been flagged for stagnating growth.',
    suggestedAction: 'Schedule a founder check-in to assess current status',
    urgency: 'medium', createdAt: '2026-03-17',
  },
  {
    id: 'f5', companyId: '6', companyName: 'Pulsetrack', type: 'Runway Alert',
    headline: 'Pulsetrack runway at 4 months — below critical threshold',
    explanation: 'Current runway is 4 months at £80K/mo burn against declining revenue (MRR dropped from £8K to £5K over 6 months). No fundraising activity detected. Last update was January 20.',
    suggestedAction: 'Urgent founder call — discuss survival plan and potential bridge financing',
    urgency: 'high', createdAt: '2026-03-16',
  },
  {
    id: 'f6', companyId: '5', companyName: 'Gridform', type: 'Runway Alert',
    headline: 'Gridform runway approaching 6-month threshold',
    explanation: 'Runway is at 7 months with flat revenue and steady burn at £95K/mo. If no improvement in revenue, will breach the 6-month threshold next month.',
    suggestedAction: 'Review cost structure and revenue pipeline with founders',
    urgency: 'medium', createdAt: '2026-03-14',
  },
  {
    id: 'f7', companyId: '6', companyName: 'Pulsetrack', type: 'Engagement Gap',
    headline: 'No update from Pulsetrack since January 20',
    explanation: 'Almost 2 months without any communication. Combined with runway concerns, this is a significant red flag requiring immediate attention.',
    suggestedAction: 'Reach out directly to founder for status update',
    urgency: 'high', createdAt: '2026-03-17',
  },
  {
    id: 'f8', companyId: '8', companyName: 'Cortex AI', type: 'Fundraising Signal',
    headline: 'Cortex AI showing signs of upcoming Series B',
    explanation: 'Founder mentioned exploring Series B timing in latest email. ARR growth at 28% MoM positions them well. Multiple investor inbound inquiries reported.',
    suggestedAction: 'Assess follow-on opportunity — schedule GP review',
    urgency: 'medium', createdAt: '2026-03-11',
  },
  {
    id: 'f9', companyId: '9', companyName: 'Shieldnet', type: 'Market Signal',
    headline: 'Competitor CrowdAPI raised £15M Series A',
    explanation: 'CrowdAPI, a direct competitor to Shieldnet in the API security space, raised a £15M Series A led by Accel. This may increase competitive pressure and validate the market opportunity.',
    suggestedAction: 'Discuss competitive positioning with Shieldnet founders',
    urgency: 'low', createdAt: '2026-03-13',
  },
  {
    id: 'f10', companyId: '12', companyName: 'Stackpilot', type: 'Key Departure',
    headline: 'CTO departed at Stackpilot',
    explanation: 'Co-founder and CTO Alex Chen left the company. This is a critical leadership gap for a DevTools company. Remaining founder is non-technical.',
    suggestedAction: 'Emergency check-in with founder — assess impact and hiring plan',
    urgency: 'high', createdAt: '2026-03-10',
  },
];

export const todos: Todo[] = [
  { id: 't1', companyName: 'Vaultik', title: 'Prepare for board meeting (March 22)', dueDate: '2026-03-21', source: 'flag', completed: false, priority: 'high' },
  { id: 't2', companyName: 'Vaultik', title: 'Schedule founder call re: runway concerns', dueDate: '2026-03-19', source: 'flag', completed: false, priority: 'high' },
  { id: 't3', companyName: 'Arcline', title: 'Connect founders with venture partner for enterprise sales', dueDate: '2026-03-25', source: 'flag', completed: false, priority: 'medium' },
  { id: 't4', companyName: 'Gridform', title: 'Schedule founder check-in', dueDate: '2026-03-20', source: 'flag', completed: false, priority: 'medium' },
  { id: 't5', companyName: 'Pulsetrack', title: 'Urgent founder call — survival plan discussion', dueDate: '2026-03-18', source: 'flag', completed: false, priority: 'high' },
  { id: 't6', companyName: 'Nebula Data', title: 'Review Q1 metrics and prep investor update', dueDate: '2026-03-28', source: 'manual', completed: false, priority: 'low' },
  { id: 't7', companyName: 'Synthwave', title: 'Intro to potential design partner (Figma)', dueDate: '2026-03-22', source: 'manual', completed: false, priority: 'medium' },
  { id: 't8', companyName: 'Arcline', title: 'Reviewed latest board deck', dueDate: '2026-03-10', source: 'manual', completed: true, priority: 'low' },
  { id: 't9', companyName: 'Nebula Data', title: 'Sent customer intro to Datadog', dueDate: '2026-03-08', source: 'manual', completed: true, priority: 'medium' },
];

export const activityFeed: ActivityEvent[] = [
  { id: 'a1', companyName: 'Vaultik', type: 'Burn Acceleration', title: 'Burn rate alert', description: 'Burn up 40% while revenue flat — runway impact', timestamp: '2026-03-17T09:00:00', severity: 'high' },
  { id: 'a2', companyName: 'Pulsetrack', type: 'Runway Alert', title: 'Critical runway alert', description: 'Runway at 4 months — below 6-month threshold', timestamp: '2026-03-16T14:30:00', severity: 'high' },
  { id: 'a3', companyName: 'Arcline', type: 'Metric Update', title: 'MRR updated', description: 'MRR updated: £40K → £45K (+12.5%)', timestamp: '2026-03-15T10:15:00', severity: 'info' },
  { id: 'a4', companyName: 'Gridform', type: 'Engagement Gap', title: 'No interaction for 30 days', description: 'No update from Gridform since February 15', timestamp: '2026-03-15T08:00:00', severity: 'medium' },
  { id: 'a5', companyName: 'Nebula Data', type: 'Document Ingested', title: 'New document', description: 'Q1 Board Deck uploaded from Dropbox', timestamp: '2026-03-14T16:45:00', severity: 'info' },
  { id: 'a6', companyName: 'Cortex AI', type: 'Fundraising Signal', title: 'Series B exploration', description: 'Founder mentioned Series B timing in email update', timestamp: '2026-03-13T11:20:00', severity: 'medium' },
  { id: 'a7', companyName: 'Shieldnet', type: 'External Signal', title: 'Competitor raised', description: 'CrowdAPI raised £15M Series A', timestamp: '2026-03-13T09:30:00', severity: 'low' },
  { id: 'a8', companyName: 'Arcline', type: 'Customer Signal', title: 'Enterprise win', description: 'Signed 2 new enterprise customers (£8K MRR combined)', timestamp: '2026-03-12T15:00:00', severity: 'info' },
  { id: 'a9', companyName: 'Synthwave', type: 'Metric Update', title: 'Customers growing', description: 'Customer count: 6 → 8 (+33%)', timestamp: '2026-03-12T10:00:00', severity: 'info' },
  { id: 'a10', companyName: 'Stackpilot', type: 'Key Hire / Departure', title: 'CTO departed', description: 'Co-founder & CTO Alex Chen left the company', timestamp: '2026-03-10T12:00:00', severity: 'high' },
  { id: 'a11', companyName: 'DataForge', type: 'Metric Update', title: 'ARR milestone', description: 'ARR crossed £2.5M — strong quarter', timestamp: '2026-03-09T14:00:00', severity: 'info' },
  { id: 'a12', companyName: 'Metrik', type: 'Document Ingested', title: 'Email update', description: 'Monthly founder update ingested from Gmail', timestamp: '2026-03-09T09:00:00', severity: 'info' },
  { id: 'a13', companyName: 'Vaultik', type: 'Board Upcoming', title: 'Board in 5 days', description: 'Board meeting scheduled for March 22 — prep recommended', timestamp: '2026-03-17T08:00:00', severity: 'medium' },
  { id: 'a14', companyName: 'Flowbase', type: 'Metric Update', title: 'First paying customers', description: 'MRR went from €2K to €3K — 3 new design partners', timestamp: '2026-03-08T11:00:00', severity: 'info' },
];

export const sectors = ['DevTools', 'Data Infra', 'AI/ML', 'Security', 'Fintech'];

export function getActiveCompanies() {
  return companies.filter(c => c.lifecycle === 'Active — Core');
}

// NOTE: Action placement is a manual team judgment, not auto-calculated. This function provides defaults that the team overrides during monthly reviews.
export function getActionType(health: HealthStatus, upside: UpsideCategory): ActionType {
  if (upside === 'High Potential') {
    if (health === 'On Track') return 'Lean In';
    return 'Lean In / Anticipate';
  }
  if (upside === 'Emerging') {
    if (health === 'On Track') return 'Lean In';
    return 'Watch';
  }
  if (health === 'On Track') return 'Watch';
  return 'De-prioritise';
}

export function formatCurrency(value: number, currency: Currency = 'GBP'): string {
  const sym = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
  if (value >= 1000000) return `${sym}${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${sym}${(value / 1000).toFixed(0)}K`;
  return `${sym}${value}`;
}

export function formatCurrencyFull(value: number, currency: Currency = 'GBP'): string {
  const sym = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
  return `${sym}${value.toLocaleString()}`;
}

export function getHealthColor(health: HealthStatus): string {
  switch (health) {
    case 'On Track': return '#10B981';
    case 'At Risk': return '#F59E0B';
    case 'Underperforming': return '#EF4444';
  }
}

export function getRAGColor(rag: RAGStatus): string {
  switch (rag) {
    case 'Green': return '#10B981';
    case 'Amber': return '#F59E0B';
    case 'Red': return '#EF4444';
    case 'Grey': return '#9CA3AF';
  }
}

export function getUpsideColor(upside: UpsideCategory): string {
  switch (upside) {
    case 'High Potential': return '#3B82F6';
    case 'Emerging': return '#8B5CF6';
    case 'Limited Potential': return '#6B7280';
  }
}

export function getActionColor(action: ActionType): string {
  switch (action) {
    case 'Lean In': return '#3B82F6';
    case 'Lean In / Anticipate': return '#F59E0B';
    case 'Watch': return '#8B5CF6';
    case 'De-prioritise': return '#6B7280';
  }
}

// Flag icon mapping — returns Lucide icon name string for use with FlagIcon component
// IMPORTANT: Do NOT use emojis as icons. Use SVG icons (Lucide) for consistent rendering.
export function getFlagIconName(type: FlagType): string {
  switch (type) {
    case 'Runway Alert': return 'alert-circle';
    case 'Burn Acceleration': return 'flame';
    case 'Growth Inflection': return 'trending-up';
    case 'New Sales Motion': return 'rocket';
    case 'Key Departure': return 'user-minus';
    case 'Board Coming Up': return 'clipboard-list';
    case 'Engagement Gap': return 'mail-x';
    case 'Fundraising Signal': return 'banknote';
    case 'Market Signal': return 'bar-chart-3';
    case 'Pivot Signal': return 'refresh-cw';
  }
}

// Color mapping for flag type icons
export function getFlagIconColor(type: FlagType): string {
  switch (type) {
    case 'Runway Alert': return '#EF4444';
    case 'Burn Acceleration': return '#F97316';
    case 'Growth Inflection': return '#10B981';
    case 'New Sales Motion': return '#3B82F6';
    case 'Key Departure': return '#EF4444';
    case 'Board Coming Up': return '#8B5CF6';
    case 'Engagement Gap': return '#F59E0B';
    case 'Fundraising Signal': return '#10B981';
    case 'Market Signal': return '#6366F1';
    case 'Pivot Signal': return '#F59E0B';
  }
}
