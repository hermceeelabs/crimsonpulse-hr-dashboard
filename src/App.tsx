import React, { useMemo, useRef, useState } from 'react';
import { toPng, toSvg } from 'html-to-image';
import {
  Users,
  UserMinus,
  HeartHandshake,
  Clock,
  Home,
  UserPlus,
  ShieldAlert,
  Wallet,
  Award,
  Search,
  Download,
  Camera,
  Moon,
  Sun,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Bell,
  CheckCircle2,
  BarChart3,
  Lightbulb,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import {
  DEPARTMENTS,
  LOCATIONS,
  TIMEFRAMES,
  DEPARTMENT_STATS,
  MONTHLY_TRENDS,
  RECRUITING_FUNNEL,
  EXIT_REASONS,
  HIRING_SOURCES,
  OPEN_REQUISITIONS,
  EMPLOYEES,
  PAY_EQUITY_BY_LEVEL,
} from './data/hrData';
import type { Department, Location, Timeframe, Employee } from './data/hrData';
import {
  Sparkline,
  HeadcountTrendChart,
  DepartmentBarChart,
  AttritionDonutChart,
} from './components/Charts';
import { EmployeeDrawer } from './components/EmployeeDrawer';
import { EditableBoard } from './components/EditableBoard';
import { InsightsStack, InsightsStrip } from './components/InsightsPanel';
import {
  generateTalentInsights,
  generateRetentionInsights,
  generateCompInsights,
  generatePerformanceInsights,
  generateDirectorySummary,
  generateMasterAdminInsights,
} from './utils/insightsEngine';
import type { BusinessInsight } from './utils/insightsEngine';

type NavTab =
  | 'overview'
  | 'insights'
  | 'talent'
  | 'retention'
  | 'compensation'
  | 'performance'
  | 'directory';

const RAIL_ITEMS: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'insights', label: 'Admin Insights', icon: Lightbulb },
  { id: 'talent', label: 'Talent & Hiring', icon: UserPlus },
  { id: 'retention', label: 'Retention & Risk', icon: ShieldAlert },
  { id: 'compensation', label: 'Compensation', icon: Wallet },
  { id: 'performance', label: 'Performance', icon: Award },
  { id: 'directory', label: 'Directory', icon: Users },
];

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedDept, setSelectedDept] = useState<Department>('All Departments');
  const [selectedLocation, setSelectedLocation] = useState<Location>('All Hubs');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('Q4 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [darkOxblood, setDarkOxblood] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<BusinessInsight | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [snapshotMenuOpen, setSnapshotMenuOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [dirPage, setDirPage] = useState(1);
  const [insightCategory, setInsightCategory] = useState<
    'All' | 'Flight Risk' | 'Hiring' | 'Compensation' | 'Performance'
  >('All');
  const [editMode, setEditMode] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [selected9BoxCell, setSelected9BoxCell] = useState<{
    perf: Employee['performance'];
    pot: Employee['potential'];
  } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const filteredDepts = useMemo(() => {
    if (selectedDept === 'All Departments') return DEPARTMENT_STATS;
    return DEPARTMENT_STATS.filter((d) => d.name === selectedDept);
  }, [selectedDept]);

  const locationFactor = useMemo(() => {
    switch (selectedLocation) {
      case 'New York':
        return 0.34;
      case 'London':
        return 0.26;
      case 'Lagos':
        return 0.22;
      case 'Remote':
        return 0.18;
      default:
        return 1;
    }
  }, [selectedLocation]);

  const timeframeAdjust = useMemo(() => {
    switch (selectedTimeframe) {
      case 'Q1 2026':
        return { hc: 0.91, attr: 0.9, enps: -5, ttf: 5 };
      case 'Q2 2026':
        return { hc: 0.94, attr: 0.4, enps: -3, ttf: 3 };
      case 'Q3 2026':
        return { hc: 0.96, attr: -0.6, enps: -2, ttf: 2 };
      case 'YTD 2026':
        return { hc: 0.99, attr: -0.2, enps: -1, ttf: 1 };
      case 'Last 12 Months':
        return { hc: 1, attr: 0.3, enps: -1, ttf: 0 };
      case 'All Time':
        return { hc: 1, attr: -0.8, enps: 2, ttf: -2 };
      default:
        return { hc: 1, attr: 0, enps: 0, ttf: 0 };
    }
  }, [selectedTimeframe]);

  const kpis = useMemo(() => {
    const baseHeadcount = filteredDepts.reduce((sum, d) => sum + d.headcount, 0);
    const totalHeadcount = Math.max(
      12,
      Math.round(baseHeadcount * locationFactor * timeframeAdjust.hc)
    );
    const totalOpenReqs = Math.max(
      1,
      Math.round(filteredDepts.reduce((sum, d) => sum + d.openReqs, 0) * locationFactor)
    );
    const weightedAttrition =
      filteredDepts.reduce((sum, d) => sum + d.attritionRate * d.headcount, 0) /
      (baseHeadcount || 1);
    const attritionRate = Math.max(3.2, +(weightedAttrition + timeframeAdjust.attr).toFixed(1));
    const weightedEnps =
      filteredDepts.reduce((sum, d) => sum + d.eNps * d.headcount, 0) / (baseHeadcount || 1);
    const eNps = Math.round(weightedEnps + timeframeAdjust.enps);
    const weightedTtf =
      filteredDepts.reduce((sum, d) => sum + d.avgTimeToFill * d.headcount, 0) /
      (baseHeadcount || 1);
    const avgTimeToFill = Math.round(weightedTtf + timeframeAdjust.ttf);

    // Dynamic deltas & positive indicators reactive to Department, Hub & Timeframe
    const qoqGrowth =
      selectedTimeframe === 'Q1 2026'
        ? +(3.4 + (eNps - 45) * 0.1).toFixed(1)
        : selectedTimeframe === 'Q2 2026'
        ? +(4.1 + (eNps - 47) * 0.12).toFixed(1)
        : selectedTimeframe === 'Q3 2026'
        ? +(4.8 + (eNps - 50) * 0.12).toFixed(1)
        : selectedTimeframe === 'YTD 2026'
        ? +(12.4 + (eNps - 50) * 0.15).toFixed(1)
        : selectedTimeframe === 'All Time'
        ? +(28.5 + (eNps - 50) * 0.2).toFixed(1)
        : +(6.2 + (eNps - 54) * 0.18).toFixed(1);
    const periodLabel =
      selectedTimeframe === 'YTD 2026'
        ? 'YTD'
        : selectedTimeframe === 'All Time'
        ? 'All Time'
        : 'QoQ';
    const headcountDelta = `${qoqGrowth >= 0 ? '+' : ''}${qoqGrowth}% ${periodLabel}`;

    const attrDiff = +(attritionRate - 12.0).toFixed(1);
    const attritionPositive = attrDiff <= 0;
    const attritionDelta =
      attrDiff <= 0 ? `${attrDiff}% vs 12% target` : `+${attrDiff}% above ceiling`;

    const enpsDiff = eNps - 50;
    const eNpsPositive = enpsDiff >= 0;
    const eNpsDelta =
      enpsDiff >= 0 ? `+${enpsDiff} pts vs 50 target` : `${enpsDiff} pts below target`;

    const ttfDiff = avgTimeToFill - 34;
    const ttfPositive = ttfDiff <= 0;
    const ttfDelta = ttfDiff <= 0 ? `${ttfDiff}d vs 34d SLA` : `+${ttfDiff}d over SLA`;

    return {
      totalHeadcount,
      totalOpenReqs,
      attritionRate,
      eNps,
      avgTimeToFill,
      scaleFactor: totalHeadcount / 426,
      headcountDelta,
      attritionDelta,
      attritionPositive,
      eNpsDelta,
      eNpsPositive,
      ttfDelta,
      ttfPositive,
    };
  }, [filteredDepts, locationFactor, timeframeAdjust, selectedTimeframe]);

  const filteredEmployees = useMemo(() => {
    return EMPLOYEES.filter((emp) => {
      if (selectedDept !== 'All Departments' && emp.department !== selectedDept) return false;
      if (selectedLocation !== 'All Hubs' && emp.location !== selectedLocation) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [selectedDept, selectedLocation, searchQuery]);

  const filteredReqs = useMemo(() => {
    return OPEN_REQUISITIONS.filter((r) => {
      if (selectedDept !== 'All Departments' && r.department !== selectedDept) return false;
      if (selectedLocation !== 'All Hubs' && r.location !== selectedLocation) return false;
      return true;
    });
  }, [selectedDept, selectedLocation]);

  const insightCtx = useMemo(
    () => ({
      departments: filteredDepts,
      employees: filteredEmployees,
      requisitions: filteredReqs,
      selectedDept,
      eNps: kpis.eNps,
      attritionRate: kpis.attritionRate,
      avgTimeToFill: kpis.avgTimeToFill,
    }),
    [filteredDepts, filteredEmployees, filteredReqs, selectedDept, kpis]
  );

  const funnelScale = useMemo(() => {
    const tfFactor =
      selectedTimeframe === 'Q1 2026'
        ? 0.82
        : selectedTimeframe === 'Q2 2026'
        ? 0.9
        : selectedTimeframe === 'Q3 2026'
        ? 0.95
        : selectedTimeframe === 'YTD 2026'
        ? 2.8
        : selectedTimeframe === 'Last 12 Months'
        ? 3.6
        : selectedTimeframe === 'All Time'
        ? 6.4
        : 1;
    return kpis.scaleFactor * tfFactor;
  }, [kpis.scaleFactor, selectedTimeframe]);

  const filteredFunnel = useMemo(
    () =>
      RECRUITING_FUNNEL.map((step) => ({
        ...step,
        count: Math.max(1, Math.round(step.count * funnelScale)),
      })),
    [funnelScale]
  );

  const filteredSources = useMemo(
    () =>
      HIRING_SOURCES.map((src) => ({
        ...src,
        hires: Math.max(1, Math.round(src.hires * funnelScale)),
        avgDays: Math.max(14, Math.round(src.avgDays + (kpis.avgTimeToFill - 32) * 0.6)),
      })),
    [funnelScale, kpis.avgTimeToFill]
  );

  const filteredExitReasons = useMemo(
    () =>
      EXIT_REASONS.map((item) => ({
        ...item,
        count: Math.max(1, Math.round(item.count * funnelScale)),
      })),
    [funnelScale]
  );

  const filteredTenureRisk = useMemo(() => {
    const buckets = [
      { cohort: '< 6 Months', match: (t: number) => t < 0.5 },
      { cohort: '6–18 Months', match: (t: number) => t >= 0.5 && t < 1.5 },
      { cohort: '1.5–3 Years', match: (t: number) => t >= 1.5 && t < 3 },
      { cohort: '3–5 Years', match: (t: number) => t >= 3 && t < 5 },
      { cohort: '5+ Years', match: (t: number) => t >= 5 },
    ];
    return buckets.map((b) => {
      const list = filteredEmployees.filter((e) => b.match(e.tenureYears));
      const total = list.length || 1;
      const high = Math.round((list.filter((e) => e.flightRisk === 'High').length / total) * 100);
      const medium = Math.round((list.filter((e) => e.flightRisk === 'Medium').length / total) * 100);
      const low = Math.max(0, 100 - high - medium);
      return { cohort: b.cohort, count: list.length, low, medium, high };
    });
  }, [filteredEmployees]);

  const filteredPayEquity = useMemo(() => {
    const deptMult =
      selectedDept === 'Engineering'
        ? 1.06
        : selectedDept === 'Product & Design'
        ? 1.02
        : selectedDept === 'Sales & GTM'
        ? 0.98
        : selectedDept === 'Customer Success'
        ? 0.94
        : 1.0;
    const hubMult =
      selectedLocation === 'New York'
        ? 1.05
        : selectedLocation === 'London'
        ? 1.01
        : selectedLocation === 'Lagos'
        ? 0.93
        : 1.0;
    const mult = deptMult * hubMult;
    return PAY_EQUITY_BY_LEVEL.map((lvl) => ({
      level: lvl.level,
      maleAvg: Math.round(lvl.maleAvg * mult),
      femaleAvg: Math.round(lvl.femaleAvg * mult),
      targetBand: Math.round(lvl.targetBand * mult),
    }));
  }, [selectedDept, selectedLocation]);

  const talentInsights = useMemo(() => generateTalentInsights(insightCtx), [insightCtx]);
  const retentionInsights = useMemo(() => generateRetentionInsights(insightCtx), [insightCtx]);
  const compInsights = useMemo(() => generateCompInsights(insightCtx), [insightCtx]);
  const perfInsights = useMemo(() => generatePerformanceInsights(insightCtx), [insightCtx]);
  const dirSummary = useMemo(() => generateDirectorySummary(insightCtx), [insightCtx]);
  const masterInsights = useMemo(() => generateMasterAdminInsights(insightCtx), [insightCtx]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Role', 'Department', 'Location', 'Salary', 'CompaRatio', 'Risk'];
    const rows = filteredEmployees.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.role}"`,
      `"${e.department}"`,
      e.location,
      e.salary,
      e.compaRatio,
      e.riskScore,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crimsonpulse-hr-${selectedDept.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredEmployees.length} records`);
  };

  const captureNode = async (tabId: NavTab, format: 'png' | 'svg') => {
    const node = dashboardRef.current;
    if (!node) return;

    const prevStyle = {
      width: node.style.width,
      height: node.style.height,
      position: node.style.position,
      top: node.style.top,
      left: node.style.left,
    };

    try {
      node.style.position = 'fixed';
      node.style.top = '0';
      node.style.left = '0';
      node.style.width = '1920px';
      node.style.height = '1080px';

      await new Promise((r) => setTimeout(r, 120));

      const options = {
        width: 1920,
        height: 1080,
        canvasWidth: 1920,
        canvasHeight: 1080,
        pixelRatio: 1,
        filter: (el: HTMLElement) => el?.dataset?.snapshotIgnore !== 'true',
      };
      const dataUrl = format === 'png' ? await toPng(node, options) : await toSvg(node, options);
      const link = document.createElement('a');
      link.download = `crimsonpulse-${tabId}-1920x1080.${format}`;
      link.href = dataUrl;
      link.click();
    } finally {
      node.style.width = prevStyle.width;
      node.style.height = prevStyle.height;
      node.style.position = prevStyle.position;
      node.style.top = prevStyle.top;
      node.style.left = prevStyle.left;
    }
  };

  const handleSnapshot = async (format: 'png' | 'svg', allPages: boolean) => {
    setSnapshotMenuOpen(false);
    setIsCapturing(true);
    const originalTab = activeTab;

    try {
      if (!allPages) {
        await new Promise((r) => setTimeout(r, 120));
        await captureNode(activeTab, format);
        showToast(`Saved ${activeTab} (${format.toUpperCase()} · 1920×1080)`);
      } else {
        for (const item of RAIL_ITEMS) {
          setActiveTab(item.id);
          await new Promise((r) => setTimeout(r, 260));
          await captureNode(item.id, format);
        }
        setActiveTab(originalTab);
        showToast(`Exported all ${RAIL_ITEMS.length} pages (${format.toUpperCase()} · 1920×1080)`);
      }
    } catch {
      setActiveTab(originalTab);
      showToast('Snapshot failed — please try again');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className={`${darkOxblood ? 'dark-oxblood' : ''} h-screen w-screen overflow-hidden`}>
      {/* Single-screen locked viewport: zero scroll on left rail & zero scroll on right canvas */}
      <div
        ref={dashboardRef}
        className="h-full w-full overflow-hidden flex bg-[var(--bg-canvas)] text-[var(--text-primary)] p-2.5 sm:p-3.5 gap-3"
      >
        {/* Slim Icon-Only Left Sidebar Rail (matching reference image style) */}
        <aside className="relative z-30 w-16 shrink-0 h-full flex flex-col items-center justify-between py-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs overflow-visible">
          {/* Top Brand Mark */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            aria-label="CrimsonPulse HR"
            className="group relative h-10 w-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#6B0F1A] to-[#450912] text-white shadow-sm cursor-pointer"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl bg-[#26060B] px-3 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
              CrimsonPulse HR
            </span>
          </button>

          {/* Center Circular Icon Stack */}
          <nav className="flex flex-col items-center gap-3">
            {RAIL_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`group relative h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#6B0F1A] text-white shadow-md shadow-[#6B0F1A]/25 scale-105'
                      : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[#6B0F1A]/50 hover:text-[#6B0F1A] shadow-2xs'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl bg-[#26060B] px-3 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Settings / Theme Circular Button */}
          <button
            type="button"
            onClick={() => setDarkOxblood((d) => !d)}
            aria-label="Toggle Oxblood Theme"
            className="group relative h-10 w-10 rounded-full flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[#6B0F1A]/50 hover:text-[#6B0F1A] transition cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl bg-[#26060B] px-3 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
              {darkOxblood ? 'Ivory Mode' : 'Oxblood Dark'}
            </span>
          </button>
        </aside>

        {/* Right Main Content Frame (zero vertical scroll, fits 100vh) */}
        <div className="flex-1 min-w-0 h-full flex flex-col gap-3 overflow-hidden">
          {/* Top Floating Bar (search, filters, actions) */}
          <header className="shrink-0 flex items-center justify-between gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 shadow-xs">
            {/* Left Search */}
            <div className="flex items-center gap-3">
              {showSearchInput ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setShowSearchInput(false)}
                    placeholder="Search people..."
                    className="w-44 rounded-full border border-[#6B0F1A]/40 bg-[var(--bg-canvas)] pl-8 pr-3 py-1 text-xs focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearchInput(true)}
                  title="Search"
                  className="h-8 w-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[#6B0F1A]/50 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Center/Right Compact Filters */}
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as Department)}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1.5 font-medium focus:outline-none cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as Location)}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1.5 font-medium focus:outline-none cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as Timeframe)}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1.5 font-medium focus:outline-none cursor-pointer"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Avatar Stack + Layout Edit + Snapshot + Export + Theme + Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex -space-x-2">
                {EMPLOYEES.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEmployee(e)}
                    title={e.name}
                    className="h-8 w-8 rounded-full bg-[#6B0F1A] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-surface)] hover:z-10 cursor-pointer"
                  >
                    {e.avatarInitials}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="flex items-center gap-1.5" data-snapshot-ignore="true">
                  <button
                    type="button"
                    onClick={() => setEditMode((m) => !m)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      editMode
                        ? 'bg-[#6B0F1A] text-white'
                        : 'bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[#6B0F1A]'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{editMode ? 'Done' : 'Edit Layout'}</span>
                  </button>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetSignal((s) => s + 1);
                        showToast('Dashboard layout reset to default');
                      }}
                      title="Reset Layout"
                      className="h-8 w-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[#6B0F1A] cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="relative" data-snapshot-ignore="true">
                <button
                  type="button"
                  disabled={isCapturing}
                  onClick={() => setSnapshotMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#6B0F1A] hover:bg-[#450912] text-white px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>{isCapturing ? 'Capturing...' : 'Snapshot'}</span>
                </button>

                {snapshotMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1.5 shadow-xl z-50 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Full HD · 1920 × 1080
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSnapshot('png', false)}
                      className="w-full text-left rounded-xl px-3 py-2 hover:bg-[var(--bg-surface-muted)] font-medium cursor-pointer"
                    >
                      Current Page (PNG)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSnapshot('svg', false)}
                      className="w-full text-left rounded-xl px-3 py-2 hover:bg-[var(--bg-surface-muted)] font-medium cursor-pointer"
                    >
                      Current Page (SVG)
                    </button>
                    <div className="my-1 border-t border-[var(--border-subtle)]" />
                    <button
                      type="button"
                      onClick={() => handleSnapshot('png', true)}
                      className="w-full text-left rounded-xl px-3 py-2 hover:bg-[var(--bg-surface-muted)] font-bold text-[#6B0F1A] dark:text-rose-200 cursor-pointer"
                    >
                      All 6 Pages (PNG)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSnapshot('svg', true)}
                      className="w-full text-left rounded-xl px-3 py-2 hover:bg-[var(--bg-surface-muted)] font-bold text-[#6B0F1A] dark:text-rose-200 cursor-pointer"
                    >
                      All 6 Pages (SVG)
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[#6B0F1A] px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#6B0F1A]" />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={() => setDarkOxblood((d) => !d)}
                title="Toggle Theme"
                className="h-8 w-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[#6B0F1A] cursor-pointer"
              >
                {darkOxblood ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => showToast('All HR systems synced · Q4 2026')}
                className="h-8 w-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[#6B0F1A] cursor-pointer"
              >
                <Bell className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* Single-Screen Bento Content (min-h-0 flex-1, zero scroll) */}
          <main className="flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
            {activeTab === 'overview' && (
              <EditableBoard
                boardKey="overview"
                editMode={editMode}
                resetSignal={resetSignal}
                widgets={[
                  {
                    id: 'kpi-headcount',
                    colSpan: 3,
                    heightPx: 112,
                    content: (
                      <KpiCard
                        title="Total Headcount"
                        value={kpis.totalHeadcount.toLocaleString()}
                        delta={kpis.headcountDelta}
                        positive
                        icon={<Users className="h-4 w-4 text-[#6B0F1A]" />}
                        sparkData={MONTHLY_TRENDS.slice(-8).map((m) =>
                          Math.round(m.headcount * kpis.scaleFactor)
                        )}
                      />
                    ),
                  },
                  {
                    id: 'kpi-attrition',
                    colSpan: 3,
                    heightPx: 112,
                    content: (
                      <KpiCard
                        title="Annualized Attrition"
                        value={`${kpis.attritionRate}%`}
                        delta={kpis.attritionDelta}
                        positive={kpis.attritionPositive}
                        icon={<UserMinus className="h-4 w-4 text-[#6B0F1A]" />}
                        sparkData={[12.8, 12.4, 11.9, 11.6, 11.2, 10.9, 10.6, kpis.attritionRate]}
                        sparkColor="#B83B5E"
                      />
                    ),
                  },
                  {
                    id: 'kpi-enps',
                    colSpan: 3,
                    heightPx: 112,
                    content: (
                      <KpiCard
                        title="Engagement (eNPS)"
                        value={`+${kpis.eNps}`}
                        delta={kpis.eNpsDelta}
                        positive={kpis.eNpsPositive}
                        icon={<HeartHandshake className="h-4 w-4 text-[#6B0F1A]" />}
                        sparkData={[48, 49, 51, 50, 52, 54, 55, kpis.eNps]}
                      />
                    ),
                  },
                  {
                    id: 'kpi-ttf',
                    colSpan: 3,
                    heightPx: 112,
                    content: (
                      <KpiCard
                        title="Avg. Time-to-Fill"
                        value={`${kpis.avgTimeToFill}d`}
                        delta={kpis.ttfDelta}
                        positive={kpis.ttfPositive}
                        icon={<Clock className="h-4 w-4 text-[#6B0F1A]" />}
                        sparkData={[41, 39, 38, 36, 35, 34, 33, kpis.avgTimeToFill]}
                      />
                    ),
                  },
                  {
                    id: 'chart-velocity',
                    colSpan: 7,
                    heightPx: 255,
                    content: (
                      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 shadow-xs flex flex-col overflow-hidden">
                        <div className="shrink-0 flex items-center justify-between mb-1.5">
                          <div>
                            <h2 className="text-sm font-bold leading-tight">Headcount Velocity & Turnover</h2>
                            <p className="text-[11px] text-[var(--text-muted)]">
                              12-month active workforce with hires vs. departures
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-[#6B0F1A]" /> Headcount (L)
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-sm bg-[#B83B5E]/60" /> Hires (R)
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-sm bg-[#D49BA4]/80" /> Exits (R)
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <HeadcountTrendChart data={MONTHLY_TRENDS} scaleFactor={kpis.scaleFactor} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'chart-departments',
                    colSpan: 5,
                    heightPx: 255,
                    content: (
                      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 shadow-xs flex flex-col overflow-hidden">
                        <div className="shrink-0 flex items-center justify-between mb-1.5">
                          <div>
                            <h2 className="text-sm font-bold leading-tight">Department Headcount</h2>
                            <p className="text-[11px] text-[var(--text-muted)]">
                              Click any bar to filter dashboard
                            </p>
                          </div>
                          {selectedDept !== 'All Departments' && (
                            <button
                              type="button"
                              onClick={() => setSelectedDept('All Departments')}
                              className="text-[11px] font-semibold text-[#6B0F1A] hover:underline cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
                          <DepartmentBarChart
                            departments={DEPARTMENT_STATS}
                            selectedDept={selectedDept}
                            onSelectDept={(dept) =>
                              setSelectedDept((prev) => (prev === dept ? 'All Departments' : dept))
                            }
                          />
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'card-funnel',
                    colSpan: 6,
                    heightPx: 215,
                    content: (
                      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 shadow-xs flex flex-col overflow-hidden">
                        <div className="shrink-0 flex items-center justify-between mb-2">
                          <h2 className="text-sm font-bold">Recruiting Pipeline</h2>
                          <button
                            type="button"
                            onClick={() => setActiveTab('talent')}
                            className="text-[11px] font-semibold text-[#6B0F1A] hover:underline cursor-pointer"
                          >
                            View all ↗
                          </button>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col justify-center space-y-2">
                          {filteredFunnel.slice(0, 5).map((step, i) => {
                            const pct = Math.max(12, (step.count / filteredFunnel[0].count) * 100);
                            return (
                              <div key={step.stage} className="space-y-0.5">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-medium truncate">{step.stage}</span>
                                  <span className="tabular-nums font-bold">
                                    {step.count.toLocaleString()}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: i > 2 ? '#6B0F1A' : '#A12536',
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'card-watchlist',
                    colSpan: 6,
                    heightPx: 215,
                    content: (
                      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 shadow-xs flex flex-col overflow-hidden">
                        <div className="shrink-0 flex items-center justify-between mb-2">
                          <h2 className="text-sm font-bold">Retention Watchlist</h2>
                          <button
                            type="button"
                            onClick={() => setActiveTab('retention')}
                            className="text-[11px] font-semibold text-[#6B0F1A] hover:underline cursor-pointer"
                          >
                            View all ↗
                          </button>
                        </div>
                        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2">
                          {filteredEmployees.slice(0, 4).map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => setSelectedEmployee(emp)}
                              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/70 hover:border-[#6B0F1A] px-2.5 py-2 text-left transition cursor-pointer flex items-center gap-2.5 min-w-0"
                            >
                              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#6B0F1A] to-[#B83B5E] text-white text-[10px] font-bold flex items-center justify-center">
                                {emp.avatarInitials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold truncate">{emp.name}</div>
                                <div className="text-[10px] text-[var(--text-muted)] truncate">
                                  {emp.role}
                                </div>
                                <div className="text-[10px] font-semibold text-[#6B0F1A] tabular-nums">
                                  Risk {emp.riskScore}/100
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            )}

            {/* ADMIN INSIGHTS HUB (Aggregated Rule-Based Engine across all pages) */}
            {activeTab === 'insights' && (() => {
              const categories = ['All', 'Flight Risk', 'Hiring', 'Compensation', 'Performance'] as const;
              const visibleInsights =
                insightCategory === 'All'
                  ? masterInsights
                  : masterInsights.filter((i) => i.category === insightCategory);
              const actionCount = masterInsights.filter((i) => i.signal === 'Action Required').length;
              const watchCount = masterInsights.filter((i) => i.signal === 'Watch').length;
              const positiveCount = masterInsights.filter((i) => i.signal === 'Positive').length;

              return (
                <div className="flex-1 min-h-0 flex flex-col gap-3 animate-enter overflow-hidden">
                  {/* Top Summary & Category Filter Bar */}
                  <div className="shrink-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-5 text-xs">
                      <div>
                        <span className="text-[var(--text-muted)]">Rules Evaluated: </span>
                        <strong className="tabular-nums">{masterInsights.length}</strong>
                      </div>
                      <div>
                        <span className="text-[#6B0F1A] font-semibold">Action Required: </span>
                        <strong className="tabular-nums text-[#6B0F1A]">{actionCount}</strong>
                      </div>
                      <div>
                        <span className="text-amber-700 font-semibold">Watch: </span>
                        <strong className="tabular-nums text-amber-700">{watchCount}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700 font-semibold">Positive: </span>
                        <strong className="tabular-nums text-emerald-700">{positiveCount}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setInsightCategory(cat)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                            insightCategory === cat
                              ? 'bg-[#6B0F1A] text-white'
                              : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[#6B0F1A]/50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Insights Grid (clean summary cards; click any card to reveal full details) */}
                  <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
                    {visibleInsights.slice(0, 8).map((ins) => {
                      const barColor =
                        ins.signal === 'Action Required'
                          ? 'bg-[#6B0F1A]'
                          : ins.signal === 'Watch'
                          ? 'bg-amber-600'
                          : 'bg-emerald-600';
                      const sigColor =
                        ins.signal === 'Action Required'
                          ? 'text-[#6B0F1A] dark:text-rose-300'
                          : ins.signal === 'Watch'
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-emerald-700 dark:text-emerald-400';

                      return (
                        <button
                          key={ins.id}
                          type="button"
                          onClick={() => setSelectedInsight(ins)}
                          className="relative text-left rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pl-5 pr-5 py-3.5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:border-[#6B0F1A] transition group"
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor}`} />
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${sigColor}`}>
                              {ins.signal} · {ins.category}
                            </span>
                            <span className="text-xs font-extrabold tabular-nums text-[var(--text-primary)]">
                              {ins.metric}
                            </span>
                          </div>
                          <div className="flex items-end justify-between gap-3 w-full mt-1">
                            <div className="text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                              {ins.headline}
                            </div>
                            <span className="shrink-0 text-[11px] font-semibold text-[#6B0F1A] dark:text-rose-300 opacity-75 group-hover:opacity-100 transition">
                              Details →
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* TALENT & HIRING TAB (single-screen fit with insights) */}
            {activeTab === 'talent' && (() => {
              const criticalCount = filteredReqs.filter((r) => r.priority === 'Critical').length;
              return (
              <div className="flex-1 min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto] gap-3 animate-enter">
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard
                    title="Open Requisitions"
                    value={`${kpis.totalOpenReqs}`}
                    delta={`${criticalCount} Critical`}
                    positive={criticalCount <= 2}
                    icon={<UserPlus className="h-4 w-4 text-[#6B0F1A]" />}
                    sparkData={[28, 30, 31, 29, 33, 34, 35, kpis.totalOpenReqs]}
                  />
                  <KpiCard
                    title="Offer Acceptance"
                    value="88.5%"
                    delta="+6.4% vs 82% target"
                    positive
                    icon={<CheckCircle2 className="h-4 w-4 text-[#6B0F1A]" />}
                    sparkData={[79, 80, 82, 83, 85, 86, 88, 88.5]}
                  />
                  <KpiCard
                    title="Avg. Cost-per-Hire"
                    value="$4,280"
                    delta="-9.2% vs $4.7K avg"
                    positive
                    icon={<Wallet className="h-4 w-4 text-[#6B0F1A]" />}
                    sparkData={[4900, 4820, 4710, 4600, 4520, 4410, 4350, 4280]}
                  />
                  <KpiCard
                    title="Avg. Time-to-Fill"
                    value={`${kpis.avgTimeToFill}d`}
                    delta={kpis.ttfDelta}
                    positive={kpis.ttfPositive}
                    icon={<Clock className="h-4 w-4 text-[#6B0F1A]" />}
                    sparkData={[40, 39, 37, 36, 35, 34, 33, kpis.avgTimeToFill]}
                  />
                </section>

                <div className="min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-5 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h2 className="text-sm font-bold">Source Quality & Velocity</h2>
                      <p className="text-[11px] text-[var(--text-muted)]">Channel performance</p>
                    </div>
                    <table className="w-full text-xs my-auto">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-left">
                          <th className="pb-2 font-semibold">Channel</th>
                          <th className="pb-2 font-semibold text-right">Hires</th>
                          <th className="pb-2 font-semibold text-right">Accept</th>
                          <th className="pb-2 font-semibold text-right">Quality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] tabular-nums">
                        {filteredSources.map((src) => (
                          <tr key={src.source}>
                            <td className="py-2 font-semibold">{src.source}</td>
                            <td className="py-2 text-right font-bold">{src.hires}</td>
                            <td className="py-2 text-right">{src.acceptanceRate}%</td>
                            <td className="py-2 text-right font-bold text-[#6B0F1A]">
                              {src.qualityScore}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="lg:col-span-7 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h2 className="text-sm font-bold">Priority Open Requisitions</h2>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {filteredReqs.length} active roles
                      </p>
                    </div>
                    <table className="w-full text-xs my-auto">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-left">
                          <th className="pb-2 font-semibold">Role</th>
                          <th className="pb-2 font-semibold">Department</th>
                          <th className="pb-2 font-semibold">Stage</th>
                          <th className="pb-2 font-semibold text-right">Days</th>
                          <th className="pb-2 font-semibold text-right">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {filteredReqs.slice(0, 5).map((req) => (
                          <tr key={req.id}>
                            <td className="py-2 font-semibold">{req.title}</td>
                            <td className="py-2 text-[var(--text-secondary)]">{req.department}</td>
                            <td className="py-2">{req.stage}</td>
                            <td className="py-2 text-right tabular-nums">{req.daysOpen}d</td>
                            <td className="py-2 text-right font-bold text-[#6B0F1A]">
                              {req.priority}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <InsightsStrip title="Hiring & Pipeline Insights" insights={talentInsights} />
              </div>
              );
            })()}

            {/* RETENTION & RISK TAB */}
            {activeTab === 'retention' && (
              <div className="flex-1 min-h-0 grid grid-rows-[minmax(0,1fr)_auto] gap-3 animate-enter">
                <div className="min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-6 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h2 className="text-sm font-bold">Primary Exit Drivers (LTM)</h2>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Hover segments to inspect departure reasons
                      </p>
                    </div>
                    <div className="my-auto">
                      <AttritionDonutChart items={filteredExitReasons} />
                    </div>
                  </div>

                  <div className="lg:col-span-6 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h2 className="text-sm font-bold">Tenure Cohort Risk Distribution</h2>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Low / Medium / High flight risk split
                      </p>
                    </div>
                    <div className="space-y-3.5 my-auto">
                      {filteredTenureRisk.map((row) => (
                        <div key={row.cohort} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold">{row.cohort}</span>
                            <span className="tabular-nums text-[var(--text-muted)]">
                              {row.count} staff · <strong className="text-[#6B0F1A]">{row.high}% high</strong>
                            </span>
                          </div>
                          <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--bg-surface-muted)]">
                            <div style={{ width: `${row.low}%` }} className="bg-[#EAD2D6] dark:bg-[#4A1C24]" />
                            <div style={{ width: `${row.medium}%` }} className="bg-[#B83B5E]" />
                            <div style={{ width: `${row.high}%` }} className="bg-[#6B0F1A]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <InsightsStrip title="Retention & Attrition Insights" insights={retentionInsights} />
              </div>
            )}

            {/* COMPENSATION & EQUITY TAB */}
            {activeTab === 'compensation' && (() => {
              const totalPayrollM = (
                filteredEmployees.reduce((s, e) => s + e.salary, 0) / 1_000_000
              ).toFixed(1);
              const avgCompa = +(
                filteredEmployees.reduce((s, e) => s + e.compaRatio, 0) /
                (filteredEmployees.length || 1)
              ).toFixed(2);
              const compaDiff = +((avgCompa - 1.0) * 100).toFixed(1);
              return (
              <div className="flex-1 min-h-0 grid grid-rows-[auto_minmax(0,1fr)] gap-3 animate-enter">
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <KpiCard
                    title="Annualized Base Payroll"
                    value={`$${totalPayrollM}M`}
                    delta={`${filteredEmployees.length} active staff`}
                    positive
                    icon={<Wallet className="h-4 w-4 text-[#6B0F1A]" />}
                    sparkData={[61, 62, 63, 64, 65, 66, 67, Number(totalPayrollM)]}
                  />
                  <KpiCard
                    title="Avg. Compa-Ratio"
                    value={`${avgCompa.toFixed(2)}x`}
                    delta={
                      compaDiff >= 0
                        ? `+${compaDiff}% vs median`
                        : `${compaDiff}% below median`
                    }
                    positive={avgCompa >= 0.96}
                    icon={<ArrowUpRight className="h-4 w-4 text-[#6B0F1A]" />}
                    sparkData={[0.97, 0.98, 0.98, 0.99, 0.99, 1.0, 1.0, avgCompa]}
                  />
                  <KpiCard
                    title="Gender Pay Parity"
                    value="99.1%"
                    delta="+0.6% YoY"
                    positive
                    icon={<Award className="h-4 w-4 text-[#6B0F1A]" />}
                    sparkData={[97.8, 98.1, 98.4, 98.6, 98.8, 98.9, 99.0, 99.1]}
                  />
                </section>

                <div className="min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-7 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h2 className="text-sm font-bold">Pay Equity by Career Level</h2>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Male vs. Female average base salary compared to market band
                      </p>
                    </div>
                    <div className="space-y-3 my-auto">
                      {filteredPayEquity.map((lvl) => {
                        const maxVal = 240000;
                        return (
                          <div key={lvl.level} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold">{lvl.level}</span>
                              <span className="tabular-nums text-[var(--text-muted)]">
                                Target: ${lvl.targetBand.toLocaleString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-12 text-[11px] text-[var(--text-muted)]">Male</span>
                                <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#6B0F1A]"
                                    style={{ width: `${(lvl.maleAvg / maxVal) * 100}%` }}
                                  />
                                </div>
                                <span className="w-16 text-right text-xs font-semibold tabular-nums">
                                  ${lvl.maleAvg.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-12 text-[11px] text-[var(--text-muted)]">Female</span>
                                <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#B83B5E]"
                                    style={{ width: `${(lvl.femaleAvg / maxVal) * 100}%` }}
                                  />
                                </div>
                                <span className="w-16 text-right text-xs font-semibold tabular-nums">
                                  ${lvl.femaleAvg.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-5 min-h-0 flex flex-col">
                    <InsightsStack
                      title="Compensation & Equity Insights"
                      subtitle="Band alignment & pay parity rules"
                      insights={compInsights}
                    />
                  </div>
                </div>
              </div>
              );
            })()}

            {/* PERFORMANCE & 9-BOX TAB */}
            {activeTab === 'performance' && (
              <div className="flex-1 min-h-0 grid grid-rows-[minmax(0,1fr)_auto] gap-3 animate-enter">
                <div className="min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-7 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold">Interactive 9-Box Talent Matrix</h2>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Click any cell to inspect employees
                        </p>
                      </div>
                      {selected9BoxCell && (
                        <button
                          type="button"
                          onClick={() => setSelected9BoxCell(null)}
                          className="text-xs font-semibold text-[#6B0F1A] hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 my-auto">
                      {(['High', 'Moderate', 'Core'] as const).map((pot) =>
                        (['Developing', 'Strong', 'Exceeds'] as const).map((perf) => {
                          const matches = filteredEmployees.filter(
                            (e) => e.potential === pot && e.performance === perf
                          );
                          const isSelected =
                            selected9BoxCell?.perf === perf && selected9BoxCell?.pot === pot;
                          return (
                            <button
                              key={`${pot}-${perf}`}
                              type="button"
                              onClick={() => setSelected9BoxCell({ perf, pot })}
                              className={`rounded-2xl p-3 text-left border transition cursor-pointer ${
                                isSelected
                                  ? 'border-[#6B0F1A] bg-[var(--maroon-100)] dark:bg-[#6B0F1A]/35'
                                  : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)]/70 hover:border-[#6B0F1A]/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                                  {perf} · {pot}
                                </span>
                                <span className="text-sm font-extrabold tabular-nums text-[#6B0F1A] dark:text-rose-200">
                                  {matches.length}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                      <h2 className="text-sm font-bold">
                        {selected9BoxCell
                          ? `${selected9BoxCell.perf} · ${selected9BoxCell.pot}`
                          : 'Engagement Sentiment (eNPS)'}
                      </h2>
                      <p className="text-[11px] text-[var(--text-muted)]">Q4 Pulse Distribution</p>
                    </div>
                    {selected9BoxCell ? (
                      <div className="space-y-2 my-auto">
                        {filteredEmployees
                          .filter(
                            (e) =>
                              e.performance === selected9BoxCell.perf &&
                              e.potential === selected9BoxCell.pot
                          )
                          .slice(0, 4)
                          .map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => setSelectedEmployee(emp)}
                              className="w-full flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-2.5 hover:border-[#6B0F1A] text-left cursor-pointer"
                            >
                              <span className="text-xs font-bold">{emp.name}</span>
                              <span className="text-[11px] text-[var(--text-muted)]">{emp.role}</span>
                            </button>
                          ))}
                      </div>
                    ) : (() => {
                      const promoters = Math.min(82, Math.max(40, Math.round(52 + kpis.eNps * 0.3)));
                      const detractors = Math.max(4, promoters - kpis.eNps);
                      const passives = Math.max(0, 100 - promoters - detractors);
                      return (
                      <div className="space-y-4 my-auto">
                        <div className="text-4xl font-extrabold tabular-nums text-[#6B0F1A] dark:text-rose-200">
                          +{kpis.eNps}
                        </div>
                        <div className="flex h-3.5 w-full overflow-hidden rounded-full">
                          <div style={{ width: `${promoters}%` }} className="bg-[#6B0F1A]" />
                          <div style={{ width: `${passives}%` }} className="bg-[#D49BA4]" />
                          <div style={{ width: `${detractors}%` }} className="bg-[#26060B]" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
                          <div className="rounded-xl bg-[var(--bg-canvas)] p-2.5">
                            <div className="text-[var(--text-muted)]">Promoters</div>
                            <div className="font-bold text-[#6B0F1A]">{promoters}%</div>
                          </div>
                          <div className="rounded-xl bg-[var(--bg-canvas)] p-2.5">
                            <div className="text-[var(--text-muted)]">Passives</div>
                            <div className="font-bold">{passives}%</div>
                          </div>
                          <div className="rounded-xl bg-[var(--bg-canvas)] p-2.5">
                            <div className="text-[var(--text-muted)]">Detractors</div>
                            <div className="font-bold">{detractors}%</div>
                          </div>
                        </div>
                      </div>
                      );
                    })()}
                  </div>
                </div>

                <InsightsStrip title="Performance & Succession Insights" insights={perfInsights} />
              </div>
            )}

            {/* DIRECTORY TAB */}
            {activeTab === 'directory' && (() => {
              const pageSize = 8;
              const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
              const safePage = Math.min(dirPage, totalPages);
              const pageRows = filteredEmployees.slice(
                (safePage - 1) * pageSize,
                safePage * pageSize
              );
              return (
              <div className="flex-1 min-h-0 flex flex-col gap-3 animate-enter overflow-hidden">
                <div className="flex-1 min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-sm font-bold">
                        People Directory ({filteredEmployees.length})
                      </h2>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Click any employee to open their 360° profile
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                        Page {safePage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setDirPage((p) => Math.max(1, p - 1))}
                        className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1 font-semibold disabled:opacity-40 hover:border-[#6B0F1A] cursor-pointer"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setDirPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1 font-semibold disabled:opacity-40 hover:border-[#6B0F1A] cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-left">
                          <th className="pb-2 font-semibold">Employee</th>
                          <th className="pb-2 font-semibold">Department</th>
                          <th className="pb-2 font-semibold">Hub</th>
                          <th className="pb-2 font-semibold text-right">Tenure</th>
                          <th className="pb-2 font-semibold text-right">Salary</th>
                          <th className="pb-2 font-semibold text-right">Compa-Ratio</th>
                          <th className="pb-2 font-semibold text-right">Risk Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {pageRows.map((emp) => (
                          <tr
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp)}
                            className="hover:bg-[var(--bg-surface-muted)]/50 cursor-pointer transition-colors"
                          >
                            <td className="py-2">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-[#6B0F1A] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {emp.avatarInitials}
                                </div>
                                <div>
                                  <div className="font-bold">{emp.name}</div>
                                  <div className="text-[10px] text-[var(--text-muted)]">{emp.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 text-[var(--text-secondary)]">{emp.department}</td>
                            <td className="py-2">{emp.location}</td>
                            <td className="py-2 text-right tabular-nums">{emp.tenureYears}y</td>
                            <td className="py-2 text-right tabular-nums font-semibold">
                              ${emp.salary.toLocaleString()}
                            </td>
                            <td className="py-2 text-right tabular-nums">{emp.compaRatio.toFixed(2)}x</td>
                            <td className="py-2 text-right tabular-nums font-bold text-[#6B0F1A]">
                              {emp.flightRisk} ({emp.riskScore})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rule-Based Roster Summary Strip */}
                <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">Avg. Base Salary</span>
                    <span className="text-sm font-extrabold tabular-nums">
                      ${dirSummary.avgSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">Below 0.93x Band</span>
                    <span className="text-sm font-extrabold tabular-nums text-[#6B0F1A]">
                      {dirSummary.belowBandCount} staff
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">High Flight Risk</span>
                    <span className="text-sm font-extrabold tabular-nums text-[#6B0F1A]">
                      {dirSummary.highRiskCount} staff
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">Overdue Reviews</span>
                    <span className="text-sm font-extrabold tabular-nums text-amber-700">
                      {dirSummary.overdueCount} pending
                    </span>
                  </div>
                </div>
              </div>
              );
            })()}
          </main>
        </div>
      </div>

      {/* 360° Employee Profile Drawer */}
      <EmployeeDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onActionToast={showToast}
      />

      {/* Insight Detail Modal */}
      {selectedInsight && (() => {
        const linkedEmp = selectedInsight.employeeId
          ? EMPLOYEES.find((e) => e.id === selectedInsight.employeeId)
          : undefined;
        const targetTab: NavTab =
          selectedInsight.category === 'Hiring'
            ? 'talent'
            : selectedInsight.category === 'Compensation'
            ? 'compensation'
            : selectedInsight.category === 'Performance'
            ? 'performance'
            : 'retention';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#1A0408]/55 backdrop-blur-xs"
              onClick={() => setSelectedInsight(null)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl space-y-4 animate-enter">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B0F1A] dark:text-rose-300">
                  {selectedInsight.signal} · {selectedInsight.category}
                </span>
                <span className="text-sm font-extrabold tabular-nums text-[var(--text-primary)]">
                  {selectedInsight.metric}
                </span>
              </div>

              <h3 className="text-lg font-extrabold leading-snug text-[var(--text-primary)]">
                {selectedInsight.headline}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--text-secondary)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/70 p-4">
                {selectedInsight.detail}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInsight(null)}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-4 py-2 text-xs font-semibold hover:border-[#6B0F1A] cursor-pointer"
                >
                  Close
                </button>
                {linkedEmp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInsight(null);
                      setSelectedEmployee(linkedEmp);
                    }}
                    className="rounded-full bg-[#6B0F1A] hover:bg-[#450912] text-white px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Open {linkedEmp.name}'s 360° Profile →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInsight(null);
                      setActiveTab(targetTab);
                    }}
                    className="rounded-full bg-[#6B0F1A] hover:bg-[#450912] text-white px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    View {selectedInsight.category} Page →
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#26060B] text-white px-4 py-2 text-xs font-semibold shadow-xl animate-enter">
          <CheckCircle2 className="h-3.5 w-3.5 text-rose-300" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  delta: string;
  positive?: boolean;
  icon: React.ReactNode;
  sparkData: number[];
  sparkColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  delta,
  positive = true,
  icon,
  sparkData,
  sparkColor = '#6B0F1A',
}) => (
  <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 shadow-xs hover:border-[#851826]/50 transition">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] font-semibold text-[var(--text-muted)]">{title}</span>
      <div className="h-7 w-7 rounded-full bg-[var(--maroon-100)] dark:bg-[#6B0F1A]/30 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="flex items-end justify-between gap-2">
      <div>
        <div className="text-xl sm:text-2xl font-extrabold tracking-tight tabular-nums leading-none">
          {value}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px]">
          <span
            className={`inline-flex items-center gap-0.5 font-bold ${
              positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#B83B5E]'
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta}
          </span>
        </div>
      </div>
      <Sparkline data={sparkData} color={sparkColor} height={28} />
    </div>
  </div>
);

export default App;
