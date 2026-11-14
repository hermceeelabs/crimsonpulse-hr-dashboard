import type { DepartmentStat, Employee, Requisition } from '../data/hrData';

export interface BusinessInsight {
  id: string;
  signal: 'Action Required' | 'Watch' | 'Positive';
  headline: string;
  detail: string;
  metric: string;
}

export interface InsightContext {
  departments: DepartmentStat[];
  employees: Employee[];
  requisitions: Requisition[];
  selectedDept: string;
  eNps: number;
  attritionRate: number;
  avgTimeToFill: number;
}

export function generateOverviewInsights(ctx: InsightContext): BusinessInsight[] {
  const insights: BusinessInsight[] = [];

  const topAttrDept = [...ctx.departments].sort((a, b) => b.attritionRate - a.attritionRate)[0];
  if (topAttrDept && topAttrDept.attritionRate > 12) {
    insights.push({
      id: 'ov-attr',
      signal: 'Action Required',
      headline: `${topAttrDept.name} attrition exceeds 12% ceiling`,
      detail: `Running at ${topAttrDept.attritionRate}% annualized turnover across ${topAttrDept.headcount} staff. Prioritize skip-level stay interviews.`,
      metric: `${topAttrDept.attritionRate}%`,
    });
  } else if (topAttrDept) {
    insights.push({
      id: 'ov-attr-ok',
      signal: 'Positive',
      headline: `Turnover within target across ${ctx.selectedDept}`,
      detail: `Annualized attrition at ${ctx.attritionRate}% sits comfortably below the 12.0% operational threshold.`,
      metric: `${ctx.attritionRate}%`,
    });
  }

  const underpaidAtRisk = ctx.employees.filter(
    (e) => e.compaRatio < 0.93 && e.riskScore >= 65
  );
  if (underpaidAtRisk.length > 0) {
    insights.push({
      id: 'ov-comp-risk',
      signal: 'Action Required',
      headline: `${underpaidAtRisk.length} high-risk staff paid below 0.93x band`,
      detail: `Market-lagging pay is compounding flight risk. Targeted mid-cycle adjustments can cut preventable exits.`,
      metric: `${underpaidAtRisk.length} staff`,
    });
  } else {
    insights.push({
      id: 'ov-enps',
      signal: ctx.eNps >= 50 ? 'Positive' : 'Watch',
      headline: ctx.eNps >= 50 ? 'Engagement outperforming SaaS benchmark' : 'Engagement needs manager focus',
      detail: `Current eNPS of +${ctx.eNps} reflects strong leadership alignment and 91% pulse participation.`,
      metric: `+${ctx.eNps}`,
    });
  }

  const staleReqs = ctx.requisitions.filter((r) => r.daysOpen >= 30);
  if (staleReqs.length > 0) {
    insights.push({
      id: 'ov-req-age',
      signal: 'Watch',
      headline: `${staleReqs.length} priority role${staleReqs.length > 1 ? 's' : ''} open 30+ days`,
      detail: `Extended time-to-fill (${ctx.avgTimeToFill}d avg) risks slowing Q4 delivery. Shift sourcing toward employee referrals.`,
      metric: `${staleReqs.length} reqs`,
    });
  }

  return insights.slice(0, 3);
}

export function generateTalentInsights(ctx: InsightContext): BusinessInsight[] {
  const staleReqs = ctx.requisitions.filter((r) => r.daysOpen >= 30);
  const criticalReqs = ctx.requisitions.filter((r) => r.priority === 'Critical');
  const totalOpen = ctx.departments.reduce((s, d) => s + d.openReqs, 0);

  return [
    {
      id: 'tal-ref',
      signal: 'Positive',
      headline: 'Referrals close 11 days faster than inbound',
      detail: 'Referral hires average 24 days to fill with 94% offer acceptance and a 92 quality score. Expand Q4 referral bonus.',
      metric: '94% accept',
    },
    {
      id: 'tal-stale',
      signal: staleReqs.length > 0 ? 'Action Required' : 'Positive',
      headline:
        staleReqs.length > 0
          ? `${staleReqs.length} requisition${staleReqs.length > 1 ? 's' : ''} aged past 30 days`
          : 'All active requisitions within 30-day SLA',
      detail:
        staleReqs.length > 0
          ? `Longest open: ${staleReqs[0].title} (${staleReqs[0].daysOpen}d). Calibrate rubric or widen remote hub eligibility.`
          : 'Pipeline velocity is healthy across all active hiring stages.',
      metric: staleReqs.length > 0 ? `${staleReqs[0].daysOpen}d max` : 'On SLA',
    },
    {
      id: 'tal-crit',
      signal: criticalReqs.length >= 2 ? 'Watch' : 'Positive',
      headline: `${criticalReqs.length} critical-priority roles of ${totalOpen} open`,
      detail: `Concentrated in Engineering and Sales & GTM. Final-panel conversion is 44.1%—keep executive interviewers unblocked.`,
      metric: `${criticalReqs.length} critical`,
    },
  ];
}

export function generateRetentionInsights(ctx: InsightContext): BusinessInsight[] {
  const highRisk = ctx.employees.filter((e) => e.flightRisk === 'High');
  const overdueHighRisk = highRisk.filter((e) => e.reviewStatus === 'Overdue');
  const topDept = [...ctx.departments].sort((a, b) => b.attritionRate - a.attritionRate)[0];

  return [
    {
      id: 'ret-tenure',
      signal: 'Action Required',
      headline: '1.5–3 year tenure band has peak flight risk (16%)',
      detail: 'Career progression (34%) and compensation (26%) drive 60% of exits. Launch L4→L5 growth pathing before 24-month mark.',
      metric: '16% high',
    },
    {
      id: 'ret-overdue',
      signal: overdueHighRisk.length > 0 ? 'Action Required' : 'Watch',
      headline: `${highRisk.length} employees flagged high-risk (${overdueHighRisk.length} overdue reviews)`,
      detail:
        overdueHighRisk.length > 0
          ? 'Overdue performance reviews strongly correlate with voluntary exits within 90 days. Escalate to department heads.'
          : 'All high-risk staff have current review cycles; focus on equity refreshers and workload balance.',
      metric: `${highRisk.length} at risk`,
    },
    {
      id: 'ret-dept',
      signal: topDept && topDept.attritionRate > 12 ? 'Watch' : 'Positive',
      headline: `${topDept?.name ?? 'Org'} leads turnover at ${topDept?.attritionRate ?? ctx.attritionRate}%`,
      detail: 'Exit interviews cite territory/career clarity. Pairing manager coaching with quarterly pulse check-ins reduces churn.',
      metric: `${topDept?.attritionRate ?? ctx.attritionRate}%`,
    },
  ];
}

export function generateCompInsights(ctx: InsightContext): BusinessInsight[] {
  const belowBand = ctx.employees.filter((e) => e.compaRatio < 0.93);
  const highPerfBelow = belowBand.filter((e) => e.performance === 'Exceeds');
  const avgCompa =
    ctx.employees.reduce((s, e) => s + e.compaRatio, 0) / (ctx.employees.length || 1);

  return [
    {
      id: 'comp-below',
      signal: belowBand.length > 0 ? 'Action Required' : 'Positive',
      headline: `${belowBand.length} employees below 0.93x market band`,
      detail: `${highPerfBelow.length} of them are "Exceeds" performers—highest ROI for targeted merit adjustments before Q1.`,
      metric: `${belowBand.length} staff`,
    },
    {
      id: 'comp-parity',
      signal: 'Positive',
      headline: 'Gender pay parity holding at 99.1%',
      detail: 'Adjusted gap across L3–L7 is under 1.0%, outperforming the 97.5% industry benchmark (+0.6% YoY improvement).',
      metric: '99.1%',
    },
    {
      id: 'comp-median',
      signal: avgCompa < 0.96 ? 'Watch' : 'Positive',
      headline: `Filtered org compa-ratio averages ${avgCompa.toFixed(2)}x`,
      detail: 'Total payroll tracks at 94% of budget, leaving ~6% headroom for critical-skill retention grants.',
      metric: `${avgCompa.toFixed(2)}x`,
    },
  ];
}

export function generatePerformanceInsights(ctx: InsightContext): BusinessInsight[] {
  const total = ctx.employees.length || 1;
  const stars = ctx.employees.filter(
    (e) => e.performance === 'Exceeds' && e.potential === 'High'
  );
  const overdue = ctx.employees.filter((e) => e.reviewStatus === 'Overdue');
  const developing = ctx.employees.filter((e) => e.performance === 'Developing');

  return [
    {
      id: 'perf-stars',
      signal: 'Positive',
      headline: `${stars.length} "Exceeds · High Potential" future leaders`,
      detail: `Represents ${Math.round((stars.length / total) * 100)}% of filtered workforce—ready for succession planning and stretch projects.`,
      metric: `${Math.round((stars.length / total) * 100)}% bench`,
    },
    {
      id: 'perf-overdue',
      signal: overdue.length > 0 ? 'Action Required' : 'Positive',
      headline: `${overdue.length} performance evaluations overdue`,
      detail: `${Math.round((overdue.length / total) * 100)}% of filtered reviews remain unsubmitted. Lock deadline is Nov 20.`,
      metric: `${overdue.length} overdue`,
    },
    {
      id: 'perf-dev',
      signal: developing.length / total > 0.25 ? 'Watch' : 'Positive',
      headline: `${developing.length} employees in "Developing" tier`,
      detail: `Accounts for ${Math.round((developing.length / total) * 100)}% of filtered staff—assign structured 60-day coaching milestones.`,
      metric: `${developing.length} staff`,
    },
  ];
}

export function generateDirectorySummary(ctx: InsightContext): {
  avgSalary: number;
  belowBandCount: number;
  highRiskCount: number;
  overdueCount: number;
} {
  const count = ctx.employees.length || 1;
  const avgSalary = Math.round(
    ctx.employees.reduce((s, e) => s + e.salary, 0) / count
  );
  return {
    avgSalary,
    belowBandCount: ctx.employees.filter((e) => e.compaRatio < 0.93).length,
    highRiskCount: ctx.employees.filter((e) => e.flightRisk === 'High').length,
    overdueCount: ctx.employees.filter((e) => e.reviewStatus === 'Overdue').length,
  };
}
