export type Department =
  | 'All Departments'
  | 'Engineering'
  | 'Product & Design'
  | 'Sales & GTM'
  | 'People & Ops'
  | 'Finance & Legal'
  | 'Customer Success';

export type Location = 'All Hubs' | 'New York' | 'London' | 'Lagos' | 'Remote';
export type Timeframe = 'Q4 2026' | 'YTD 2026' | 'Last 12 Months' | 'Q3 2026';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: Exclude<Department, 'All Departments'>;
  location: Exclude<Location, 'All Hubs'>;
  level: string;
  tenureYears: number;
  salary: number;
  compaRatio: number;
  performance: 'Exceeds' | 'Strong' | 'Developing';
  potential: 'High' | 'Moderate' | 'Core';
  flightRisk: 'Low' | 'Medium' | 'High';
  riskScore: number;
  eNpsContribution: number;
  manager: string;
  hireDate: string;
  avatarInitials: string;
  email: string;
  reviewStatus: 'Completed' | 'In Progress' | 'Overdue';
  riskFactors: string[];
}

export interface MonthlyTrend {
  month: string;
  headcount: number;
  hires: number;
  exits: number;
  voluntaryExits: number;
  involuntaryExits: number;
  eNps: number;
}

export interface DepartmentStat {
  name: Exclude<Department, 'All Departments'>;
  headcount: number;
  openReqs: number;
  attritionRate: number;
  avgCompaRatio: number;
  eNps: number;
  budgetUsedPct: number;
  femalePct: number;
  avgTimeToFill: number;
}

export interface Requisition {
  id: string;
  title: string;
  department: Exclude<Department, 'All Departments'>;
  location: Exclude<Location, 'All Hubs'>;
  hiringManager: string;
  daysOpen: number;
  candidates: number;
  stage: 'Sourcing' | 'Technical' | 'Final Panel' | 'Offer Extended';
  priority: 'Critical' | 'High' | 'Standard';
}

export const DEPARTMENTS: Department[] = [
  'All Departments',
  'Engineering',
  'Product & Design',
  'Sales & GTM',
  'Customer Success',
  'People & Ops',
  'Finance & Legal',
];

export const LOCATIONS: Location[] = ['All Hubs', 'New York', 'London', 'Lagos', 'Remote'];

export const TIMEFRAMES: Timeframe[] = ['Q4 2026', 'YTD 2026', 'Last 12 Months', 'Q3 2026'];

export const DEPARTMENT_STATS: DepartmentStat[] = [
  {
    name: 'Engineering',
    headcount: 148,
    openReqs: 14,
    attritionRate: 11.4,
    avgCompaRatio: 1.03,
    eNps: 54,
    budgetUsedPct: 94,
    femalePct: 36,
    avgTimeToFill: 38,
  },
  {
    name: 'Sales & GTM',
    headcount: 96,
    openReqs: 9,
    attritionRate: 14.8,
    avgCompaRatio: 0.98,
    eNps: 46,
    budgetUsedPct: 97,
    femalePct: 44,
    avgTimeToFill: 29,
  },
  {
    name: 'Product & Design',
    headcount: 58,
    openReqs: 5,
    attritionRate: 7.2,
    avgCompaRatio: 1.01,
    eNps: 63,
    budgetUsedPct: 89,
    femalePct: 52,
    avgTimeToFill: 34,
  },
  {
    name: 'Customer Success',
    headcount: 64,
    openReqs: 4,
    attritionRate: 9.8,
    avgCompaRatio: 0.96,
    eNps: 51,
    budgetUsedPct: 91,
    femalePct: 58,
    avgTimeToFill: 24,
  },
  {
    name: 'People & Ops',
    headcount: 32,
    openReqs: 2,
    attritionRate: 5.4,
    avgCompaRatio: 1.0,
    eNps: 68,
    budgetUsedPct: 88,
    femalePct: 69,
    avgTimeToFill: 26,
  },
  {
    name: 'Finance & Legal',
    headcount: 28,
    openReqs: 1,
    attritionRate: 6.1,
    avgCompaRatio: 1.02,
    eNps: 57,
    budgetUsedPct: 92,
    femalePct: 54,
    avgTimeToFill: 31,
  },
];

export const MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: 'Dec', headcount: 372, hires: 11, exits: 4, voluntaryExits: 3, involuntaryExits: 1, eNps: 48 },
  { month: 'Jan', headcount: 379, hires: 12, exits: 5, voluntaryExits: 4, involuntaryExits: 1, eNps: 49 },
  { month: 'Feb', headcount: 386, hires: 10, exits: 3, voluntaryExits: 2, involuntaryExits: 1, eNps: 50 },
  { month: 'Mar', headcount: 392, hires: 11, exits: 5, voluntaryExits: 4, involuntaryExits: 1, eNps: 51 },
  { month: 'Apr', headcount: 397, hires: 9, exits: 4, voluntaryExits: 3, involuntaryExits: 1, eNps: 52 },
  { month: 'May', headcount: 403, hires: 11, exits: 5, voluntaryExits: 3, involuntaryExits: 2, eNps: 51 },
  { month: 'Jun', headcount: 407, hires: 10, exits: 6, voluntaryExits: 5, involuntaryExits: 1, eNps: 50 },
  { month: 'Jul', headcount: 411, hires: 9, exits: 5, voluntaryExits: 4, involuntaryExits: 1, eNps: 53 },
  { month: 'Aug', headcount: 416, hires: 10, exits: 5, voluntaryExits: 3, involuntaryExits: 2, eNps: 54 },
  { month: 'Sep', headcount: 420, hires: 8, exits: 4, voluntaryExits: 3, involuntaryExits: 1, eNps: 55 },
  { month: 'Oct', headcount: 423, hires: 9, exits: 6, voluntaryExits: 5, involuntaryExits: 1, eNps: 54 },
  { month: 'Nov', headcount: 426, hires: 8, exits: 5, voluntaryExits: 4, involuntaryExits: 1, eNps: 56 },
];

export const RECRUITING_FUNNEL = [
  { stage: 'Applications Received', count: 2840, conversion: '100%' },
  { stage: 'Recruiter Screen', count: 682, conversion: '24.0%' },
  { stage: 'Technical / Role Assessment', count: 294, conversion: '43.1%' },
  { stage: 'Executive / Panel Loop', count: 118, conversion: '40.1%' },
  { stage: 'Offers Extended', count: 52, conversion: '44.1%' },
  { stage: 'Offers Accepted', count: 46, conversion: '88.5%' },
];

export const EXIT_REASONS = [
  { reason: 'Career Progression', pct: 34, count: 16, color: '#6B0F1A' },
  { reason: 'Compensation & Equity', pct: 26, count: 12, color: '#8F1D2C' },
  { reason: 'Relocation / Personal', pct: 17, count: 8, color: '#B83B5E' },
  { reason: 'Manager / Team Fit', pct: 13, count: 6, color: '#D47285' },
  { reason: 'Performance / Involuntary', pct: 10, count: 5, color: '#E8B4BC' },
];

export const HIRING_SOURCES = [
  { source: 'Employee Referrals', hires: 16, acceptanceRate: 94, avgDays: 24, qualityScore: 92 },
  { source: 'Direct Inbound', hires: 13, acceptanceRate: 86, avgDays: 31, qualityScore: 84 },
  { source: 'Executive / Sourcing', hires: 11, acceptanceRate: 89, avgDays: 39, qualityScore: 90 },
  { source: 'LinkedIn & Communities', hires: 6, acceptanceRate: 81, avgDays: 35, qualityScore: 79 },
];

export const OPEN_REQUISITIONS: Requisition[] = [
  {
    id: 'REQ-409',
    title: 'Staff Distributed Systems Engineer',
    department: 'Engineering',
    location: 'New York',
    hiringManager: 'Amara Okafor',
    daysOpen: 44,
    candidates: 38,
    stage: 'Final Panel',
    priority: 'Critical',
  },
  {
    id: 'REQ-412',
    title: 'Enterprise Account Executive (EMEA)',
    department: 'Sales & GTM',
    location: 'London',
    hiringManager: 'Marcus Vance',
    daysOpen: 31,
    candidates: 52,
    stage: 'Offer Extended',
    priority: 'Critical',
  },
  {
    id: 'REQ-418',
    title: 'Principal Product Designer',
    department: 'Product & Design',
    location: 'Remote',
    hiringManager: 'Elena Rostova',
    daysOpen: 27,
    candidates: 41,
    stage: 'Technical',
    priority: 'High',
  },
  {
    id: 'REQ-421',
    title: 'Senior ML Platform Engineer',
    department: 'Engineering',
    location: 'Lagos',
    hiringManager: 'Tunde Adeyemi',
    daysOpen: 19,
    candidates: 64,
    stage: 'Technical',
    priority: 'High',
  },
  {
    id: 'REQ-425',
    title: 'Strategic Customer Success Lead',
    department: 'Customer Success',
    location: 'New York',
    hiringManager: 'Claire Bennett',
    daysOpen: 14,
    candidates: 29,
    stage: 'Sourcing',
    priority: 'Standard',
  },
  {
    id: 'REQ-429',
    title: 'People Analytics Partner',
    department: 'People & Ops',
    location: 'London',
    hiringManager: 'Nadia Patel',
    daysOpen: 11,
    candidates: 22,
    stage: 'Final Panel',
    priority: 'High',
  },
];

export const TENURE_COHORT_RISK = [
  { cohort: '< 6 Months', count: 48, low: 82, medium: 12, high: 6 },
  { cohort: '6–18 Months', count: 112, low: 68, medium: 21, high: 11 },
  { cohort: '1.5–3 Years', count: 138, low: 59, medium: 25, high: 16 },
  { cohort: '3–5 Years', count: 84, low: 74, medium: 18, high: 8 },
  { cohort: '5+ Years', count: 44, low: 86, medium: 10, high: 4 },
];

export const HR_ALERTS = [
  {
    id: 'ALT-1',
    severity: 'critical' as const,
    title: 'L4–L5 Engineering Flight Risk Cluster',
    detail: '7 senior engineers in the 1.5–3 yr tenure band show compa-ratio < 0.92 and overdue promotion reviews.',
    department: 'Engineering',
    action: 'Review Comp Band',
  },
  {
    id: 'ALT-2',
    severity: 'warning' as const,
    title: 'Q4 Performance Calibration Deadlines',
    detail: '18 manager evaluations remain pending across Sales & GTM and Customer Success before Nov 20 lock.',
    department: 'Sales & GTM',
    action: 'Nudge Managers',
  },
  {
    id: 'ALT-3',
    severity: 'positive' as const,
    title: 'Offer Acceptance Reached 88.5% (+6.4% QoQ)',
    detail: 'Referral-sourced hires closed 14 days faster with 94% offer acceptance across Product & Engineering.',
    department: 'Product & Design',
    action: 'View Funnel',
  },
];

export const EMPLOYEES: Employee[] = [
  {
    id: 'EMP-101',
    name: 'Amara Okafor',
    role: 'VP of Platform Engineering',
    department: 'Engineering',
    location: 'Lagos',
    level: 'L8',
    tenureYears: 4.8,
    salary: 235000,
    compaRatio: 1.06,
    performance: 'Exceeds',
    potential: 'High',
    flightRisk: 'Low',
    riskScore: 14,
    eNpsContribution: 10,
    manager: 'CEO (D. Sterling)',
    hireDate: '2022-01-17',
    avatarInitials: 'AO',
    email: 'amara.okafor@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Recently promoted', 'High equity vesting'],
  },
  {
    id: 'EMP-102',
    name: 'Marcus Vance',
    role: 'Director of Enterprise Sales',
    department: 'Sales & GTM',
    location: 'New York',
    level: 'L7',
    tenureYears: 3.2,
    salary: 198000,
    compaRatio: 1.02,
    performance: 'Exceeds',
    potential: 'High',
    flightRisk: 'Low',
    riskScore: 22,
    eNpsContribution: 9,
    manager: 'CRO (H. Lin)',
    hireDate: '2023-09-04',
    avatarInitials: 'MV',
    email: 'marcus.vance@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['118% quota attainment', 'Strong team eNPS'],
  },
  {
    id: 'EMP-103',
    name: 'Elena Rostova',
    role: 'Head of Product Design',
    department: 'Product & Design',
    location: 'London',
    level: 'L7',
    tenureYears: 4.1,
    salary: 184000,
    compaRatio: 1.04,
    performance: 'Exceeds',
    potential: 'High',
    flightRisk: 'Low',
    riskScore: 18,
    eNpsContribution: 10,
    manager: 'CPO (S. Kapoor)',
    hireDate: '2022-10-10',
    avatarInitials: 'ER',
    email: 'elena.rostova@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Leading AI design system', 'High engagement'],
  },
  {
    id: 'EMP-104',
    name: 'Devon Brooks',
    role: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'New York',
    level: 'L5',
    tenureYears: 2.3,
    salary: 158000,
    compaRatio: 0.89,
    performance: 'Exceeds',
    potential: 'High',
    flightRisk: 'High',
    riskScore: 84,
    eNpsContribution: 6,
    manager: 'Amara Okafor',
    hireDate: '2024-07-22',
    avatarInitials: 'DB',
    email: 'devon.brooks@crimsonpulse.io',
    reviewStatus: 'Overdue',
    riskFactors: ['Compa-ratio 11% below market median', 'No promotion in 27 months', 'High recruiter outreach'],
  },
  {
    id: 'EMP-105',
    name: 'Chidi Nwosu',
    role: 'Staff Infrastructure Engineer',
    department: 'Engineering',
    location: 'Lagos',
    level: 'L6',
    tenureYears: 2.8,
    salary: 176000,
    compaRatio: 0.91,
    performance: 'Strong',
    potential: 'High',
    flightRisk: 'High',
    riskScore: 78,
    eNpsContribution: 7,
    manager: 'Amara Okafor',
    hireDate: '2024-01-15',
    avatarInitials: 'CN',
    email: 'chidi.nwosu@crimsonpulse.io',
    reviewStatus: 'In Progress',
    riskFactors: ['On-call load +32% above team avg', 'Compa-ratio below 0.95'],
  },
  {
    id: 'EMP-106',
    name: 'Sofia Alvarez',
    role: 'Senior Product Manager',
    department: 'Product & Design',
    location: 'Remote',
    level: 'L5',
    tenureYears: 1.9,
    salary: 162000,
    compaRatio: 1.01,
    performance: 'Exceeds',
    potential: 'Moderate',
    flightRisk: 'Low',
    riskScore: 21,
    eNpsContribution: 9,
    manager: 'Elena Rostova',
    hireDate: '2024-12-02',
    avatarInitials: 'SA',
    email: 'sofia.alvarez@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Strong peer recognition'],
  },
  {
    id: 'EMP-107',
    name: 'Liam O’Connor',
    role: 'Enterprise Account Executive',
    department: 'Sales & GTM',
    location: 'London',
    level: 'L5',
    tenureYears: 2.1,
    salary: 142000,
    compaRatio: 0.92,
    performance: 'Strong',
    potential: 'Moderate',
    flightRisk: 'High',
    riskScore: 76,
    eNpsContribution: 5,
    manager: 'Marcus Vance',
    hireDate: '2024-10-07',
    avatarInitials: 'LO',
    email: 'liam.oconnor@crimsonpulse.io',
    reviewStatus: 'Overdue',
    riskFactors: ['Territory realignment impact', 'Review overdue by 14 days'],
  },
  {
    id: 'EMP-108',
    name: 'Nadia Patel',
    role: 'VP of People & Talent',
    department: 'People & Ops',
    location: 'London',
    level: 'L8',
    tenureYears: 5.2,
    salary: 210000,
    compaRatio: 1.05,
    performance: 'Exceeds',
    potential: 'High',
    flightRisk: 'Low',
    riskScore: 11,
    eNpsContribution: 10,
    manager: 'CEO (D. Sterling)',
    hireDate: '2021-08-30',
    avatarInitials: 'NP',
    email: 'nadia.patel@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Executive leadership team'],
  },
  {
    id: 'EMP-109',
    name: 'Claire Bennett',
    role: 'Director of Customer Success',
    department: 'Customer Success',
    location: 'New York',
    level: 'L7',
    tenureYears: 3.6,
    salary: 175000,
    compaRatio: 0.99,
    performance: 'Strong',
    potential: 'High',
    flightRisk: 'Low',
    riskScore: 24,
    eNpsContribution: 8,
    manager: 'CRO (H. Lin)',
    hireDate: '2023-04-10',
    avatarInitials: 'CB',
    email: 'claire.bennett@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Net dollar retention at 121%'],
  },
  {
    id: 'EMP-110',
    name: 'Kenji Takahashi',
    role: 'Principal Security Architect',
    department: 'Engineering',
    location: 'Remote',
    level: 'L7',
    tenureYears: 4.4,
    salary: 218000,
    compaRatio: 1.08,
    performance: 'Exceeds',
    potential: 'Core',
    flightRisk: 'Low',
    riskScore: 16,
    eNpsContribution: 9,
    manager: 'Amara Okafor',
    hireDate: '2022-06-13',
    avatarInitials: 'KT',
    email: 'kenji.takahashi@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Top quartile compensation'],
  },
  {
    id: 'EMP-111',
    name: 'Zainab Bello',
    role: 'FP&A Senior Manager',
    department: 'Finance & Legal',
    location: 'Lagos',
    level: 'L6',
    tenureYears: 2.9,
    salary: 148000,
    compaRatio: 1.01,
    performance: 'Strong',
    potential: 'High',
    flightRisk: 'Medium',
    riskScore: 48,
    eNpsContribution: 8,
    manager: 'CFO (R. Chen)',
    hireDate: '2023-12-04',
    avatarInitials: 'ZB',
    email: 'zainab.bello@crimsonpulse.io',
    reviewStatus: 'In Progress',
    riskFactors: ['Q4 board prep workload'],
  },
  {
    id: 'EMP-112',
    name: 'Hannah Lindqvist',
    role: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    level: 'L4',
    tenureYears: 1.4,
    salary: 108000,
    compaRatio: 0.93,
    performance: 'Developing',
    potential: 'Moderate',
    flightRisk: 'Medium',
    riskScore: 54,
    eNpsContribution: 7,
    manager: 'Claire Bennett',
    hireDate: '2025-06-16',
    avatarInitials: 'HL',
    email: 'hannah.lindqvist@crimsonpulse.io',
    reviewStatus: 'In Progress',
    riskFactors: ['Ramp-up coaching active'],
  },
  {
    id: 'EMP-113',
    name: 'Tunde Adeyemi',
    role: 'Engineering Manager, AI',
    department: 'Engineering',
    location: 'Lagos',
    level: 'L6',
    tenureYears: 3.1,
    salary: 185000,
    compaRatio: 1.04,
    performance: 'Exceeds',
    potential: 'High',
    flightRisk: 'Low',
    riskScore: 19,
    eNpsContribution: 9,
    manager: 'Amara Okafor',
    hireDate: '2023-10-02',
    avatarInitials: 'TA',
    email: 'tunde.adeyemi@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['High team retention (96%)'],
  },
  {
    id: 'EMP-114',
    name: 'Maya Lin',
    role: 'People Operations Lead',
    department: 'People & Ops',
    location: 'New York',
    level: 'L5',
    tenureYears: 2.2,
    salary: 126000,
    compaRatio: 0.98,
    performance: 'Strong',
    potential: 'Moderate',
    flightRisk: 'Low',
    riskScore: 25,
    eNpsContribution: 9,
    manager: 'Nadia Patel',
    hireDate: '2024-09-09',
    avatarInitials: 'ML',
    email: 'maya.lin@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Strong cross-functional feedback'],
  },
  {
    id: 'EMP-115',
    name: 'Lucas Moreau',
    role: 'Solutions Architect',
    department: 'Sales & GTM',
    location: 'London',
    level: 'L5',
    tenureYears: 1.7,
    salary: 152000,
    compaRatio: 0.95,
    performance: 'Strong',
    potential: 'High',
    flightRisk: 'Medium',
    riskScore: 52,
    eNpsContribution: 7,
    manager: 'Marcus Vance',
    hireDate: '2025-03-03',
    avatarInitials: 'LM',
    email: 'lucas.moreau@crimsonpulse.io',
    reviewStatus: 'Overdue',
    riskFactors: ['High travel load in Q3–Q4'],
  },
  {
    id: 'EMP-116',
    name: 'Priya Sharma',
    role: 'Staff UX Researcher',
    department: 'Product & Design',
    location: 'New York',
    level: 'L6',
    tenureYears: 3.5,
    salary: 171000,
    compaRatio: 1.02,
    performance: 'Strong',
    potential: 'Core',
    flightRisk: 'Low',
    riskScore: 20,
    eNpsContribution: 8,
    manager: 'Elena Rostova',
    hireDate: '2023-05-15',
    avatarInitials: 'PS',
    email: 'priya.sharma@crimsonpulse.io',
    reviewStatus: 'Completed',
    riskFactors: ['Balanced workload'],
  },
];

export const PAY_EQUITY_BY_LEVEL = [
  { level: 'L3 Associate', maleAvg: 92000, femaleAvg: 91500, targetBand: 92000 },
  { level: 'L4 Mid-Level', maleAvg: 118000, femaleAvg: 116800, targetBand: 117000 },
  { level: 'L5 Senior', maleAvg: 154000, femaleAvg: 152400, targetBand: 153000 },
  { level: 'L6 Staff / Mgr', maleAvg: 182000, femaleAvg: 180500, targetBand: 181000 },
  { level: 'L7 Director', maleAvg: 206000, femaleAvg: 204000, targetBand: 205000 },
];
