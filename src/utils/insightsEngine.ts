import type { DepartmentStat, Employee, Requisition } from '../data/hrData';

export interface BusinessInsight {
  id: string;
  signal: 'Action Required' | 'Watch' | 'Positive';
  category?: 'Flight Risk' | 'Hiring' | 'Compensation' | 'Performance';
  headline: string;
  detail: string;
  metric: string;
  employeeId?: string;
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
      headline: `${topAttrDept.name} is losing too many people`,
      detail: `${topAttrDept.attritionRate}% of ${topAttrDept.name} staff are leaving per year, which is above our 12% limit. Managers should hold check-in talks.`,
      metric: `${topAttrDept.attritionRate}%`,
    });
  } else if (topAttrDept) {
    insights.push({
      id: 'ov-attr-ok',
      signal: 'Positive',
      headline: `Staff turnover is healthy in ${ctx.selectedDept}`,
      detail: `Only ${ctx.attritionRate}% of staff are leaving per year, well below our 12% limit.`,
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
      headline: `${underpaidAtRisk.length} high-risk staff are paid below average`,
      detail: `These employees are likely to leave soon and earn less than the market rate. Raising their pay can keep them.`,
      metric: `${underpaidAtRisk.length} staff`,
    });
  } else {
    insights.push({
      id: 'ov-enps',
      signal: ctx.eNps >= 50 ? 'Positive' : 'Watch',
      headline:
        ctx.eNps >= 50
          ? 'Employees are happy and engaged'
          : 'Employee happiness needs attention',
      detail: `Our employee happiness score is +${ctx.eNps}, based on 91% of staff completing the survey.`,
      metric: `+${ctx.eNps}`,
    });
  }

  const staleReqs = ctx.requisitions.filter((r) => r.daysOpen >= 30);
  if (staleReqs.length > 0) {
    insights.push({
      id: 'ov-req-age',
      signal: 'Watch',
      headline: `${staleReqs.length} open job${staleReqs.length > 1 ? 's have' : ' has'} been unfilled for 30+ days`,
      detail: `Taking ${ctx.avgTimeToFill} days on average to hire can slow down team goals. Ask staff for referrals to hire faster.`,
      metric: `${staleReqs.length} jobs`,
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
      headline: 'Staff referrals get hired 11 days faster',
      detail: 'People referred by current employees are hired in 24 days on average and accept job offers 94% of the time.',
      metric: '94% accept',
    },
    {
      id: 'tal-stale',
      signal: staleReqs.length > 0 ? 'Action Required' : 'Positive',
      headline:
        staleReqs.length > 0
          ? `${staleReqs.length} open job${staleReqs.length > 1 ? 's are' : ' is'} taking over 30 days`
          : 'All open jobs are moving on schedule',
      detail:
        staleReqs.length > 0
          ? `The longest open role is ${staleReqs[0].title} (${staleReqs[0].daysOpen} days). Consider opening it to remote candidates.`
          : 'Every open role is currently being filled within our 30-day goal.',
      metric: staleReqs.length > 0 ? `${staleReqs[0].daysOpen}d max` : 'On time',
    },
    {
      id: 'tal-crit',
      signal: criticalReqs.length >= 2 ? 'Watch' : 'Positive',
      headline: `${criticalReqs.length} urgent roles out of ${totalOpen} open jobs`,
      detail: 'Most urgent openings are in Engineering and Sales. Keep interview panels scheduled quickly so we do not lose candidates.',
      metric: `${criticalReqs.length} urgent`,
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
      headline: 'Staff here 1.5–3 years are most likely to leave',
      detail: 'Lack of career growth (34%) and pay (26%) cause most departures. Show clear promotion steps before year 2.',
      metric: '16% high',
    },
    {
      id: 'ret-overdue',
      signal: overdueHighRisk.length > 0 ? 'Action Required' : 'Watch',
      headline: `${highRisk.length} staff are likely to leave (${overdueHighRisk.length} have overdue reviews)`,
      detail:
        overdueHighRisk.length > 0
          ? 'People whose performance reviews are late are much more likely to quit within 3 months. Have managers complete them now.'
          : 'All high-risk staff have up-to-date reviews; focus on fair pay and manageable workloads.',
      metric: `${highRisk.length} at risk`,
    },
    {
      id: 'ret-dept',
      signal: topDept && topDept.attritionRate > 12 ? 'Watch' : 'Positive',
      headline: `${topDept?.name ?? 'The company'} has the highest turnover (${topDept?.attritionRate ?? ctx.attritionRate}%)`,
      detail: 'People leaving say they want clearer growth paths and better team support. Regular 1-on-1s can help keep them.',
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
      headline: `${belowBand.length} employees are paid below the market average`,
      detail: `${highPerfBelow.length} of them are top performers. Giving them a raise before next quarter will help keep them.`,
      metric: `${belowBand.length} staff`,
    },
    {
      id: 'comp-parity',
      signal: 'Positive',
      headline: 'Men and women in the same roles are paid equally',
      detail: 'Pay between men and women at the same job level is 99.1% equal, better than the 97.5% industry average.',
      metric: '99.1%',
    },
    {
      id: 'comp-median',
      signal: avgCompa < 0.96 ? 'Watch' : 'Positive',
      headline: `Average pay is right on the market rate (${avgCompa.toFixed(2)}x)`,
      detail: 'We have used 94% of our salary budget, leaving 6% room for raises and retention bonuses.',
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
      headline: `${stars.length} top performers are ready for bigger roles`,
      detail: `That is ${Math.round((stars.length / total) * 100)}% of this group—strong candidates for future leadership and key projects.`,
      metric: `${Math.round((stars.length / total) * 100)}% ready`,
    },
    {
      id: 'perf-overdue',
      signal: overdue.length > 0 ? 'Action Required' : 'Positive',
      headline: `${overdue.length} performance reviews are past due`,
      detail: `${Math.round((overdue.length / total) * 100)}% of reviews in this group still need to be finished before the Nov 20 deadline.`,
      metric: `${overdue.length} overdue`,
    },
    {
      id: 'perf-dev',
      signal: developing.length / total > 0.25 ? 'Watch' : 'Positive',
      headline: `${developing.length} employees still need extra coaching`,
      detail: `Makes up ${Math.round((developing.length / total) * 100)}% of this group—set clear 60-day goals with their managers.`,
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

export function generateMasterAdminInsights(ctx: InsightContext): BusinessInsight[] {
  const results: BusinessInsight[] = [];

  const highRiskStaff = [...ctx.employees]
    .filter((e) => e.riskScore >= 68)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);

  for (const emp of highRiskStaff) {
    const payPct = Math.round((1 - emp.compaRatio) * 100);
    const payNote =
      payPct > 0
        ? `paid ${payPct}% below the average for this role`
        : `paid ${Math.abs(payPct)}% above the role average`;
    const reviewNote =
      emp.reviewStatus === 'Overdue' ? 'with an overdue review' : `(${emp.tenureYears} yrs at company)`;
    results.push({
      id: `admin-emp-${emp.id}`,
      signal: 'Action Required',
      category: 'Flight Risk',
      headline: `${emp.name} is very likely to leave the company`,
      detail: `${emp.role} in ${emp.department} — ${payNote} ${reviewNote}. Main concern: ${emp.riskFactors[0]}.`,
      metric: `${emp.riskScore}/100 risk`,
      employeeId: emp.id,
    });
  }

  const overCeilingDepts = ctx.departments.filter((d) => d.attritionRate > 12);
  if (overCeilingDepts.length > 0) {
    const worst = [...overCeilingDepts].sort((a, b) => b.attritionRate - a.attritionRate)[0];
    results.push({
      id: 'admin-dept-attr',
      signal: 'Action Required',
      category: 'Flight Risk',
      headline: `${worst.name} is losing too many employees`,
      detail: `${worst.attritionRate}% of ${worst.name} staff are leaving per year (+${(worst.attritionRate - 12).toFixed(1)}% above our 12% limit) across ${worst.headcount} people. Schedule check-in talks.`,
      metric: `${worst.attritionRate}%`,
    });
  } else {
    results.push({
      id: 'admin-dept-attr-ok',
      signal: 'Positive',
      category: 'Flight Risk',
      headline: `Staff turnover is healthy across all selected teams`,
      detail: `Turnover is ${ctx.attritionRate}% per year, staying safely under our 12% limit and saving replacement hiring costs.`,
      metric: `${ctx.attritionRate}%`,
    });
  }

  const underpaidStars = ctx.employees.filter(
    (e) => e.performance === 'Exceeds' && e.compaRatio < 0.94
  );
  if (underpaidStars.length > 0) {
    const lead = underpaidStars[0];
    results.push({
      id: 'admin-comp-stars',
      signal: 'Action Required',
      category: 'Compensation',
      headline: `${underpaidStars.length} top performers are paid below market rate`,
      detail: `Includes ${lead.name} (paid ${Math.round((1 - lead.compaRatio) * 100)}% below average). Raising their pay will help stop other companies from recruiting them.`,
      metric: `${underpaidStars.length} top staff`,
      employeeId: lead.id,
    });
  } else {
    const avgCompa =
      ctx.employees.reduce((s, e) => s + e.compaRatio, 0) / (ctx.employees.length || 1);
    results.push({
      id: 'admin-comp-healthy',
      signal: 'Positive',
      category: 'Compensation',
      headline: `Top performers are paid fairly (${avgCompa.toFixed(2)}x market rate)`,
      detail: `No top performers are underpaid, and men and women in the same roles are paid 99.1% equally.`,
      metric: `${avgCompa.toFixed(2)}x`,
    });
  }

  const agedReqs = [...ctx.requisitions].sort((a, b) => b.daysOpen - a.daysOpen);
  if (agedReqs.length > 0 && agedReqs[0].daysOpen >= 30) {
    const topReq = agedReqs[0];
    results.push({
      id: 'admin-req-bottleneck',
      signal: 'Watch',
      category: 'Hiring',
      headline: `${topReq.title} has been open for ${topReq.daysOpen} days`,
      detail: `Currently in ${topReq.stage} with ${topReq.candidates} applicants (Hiring Manager: ${topReq.hiringManager}). Ask staff for referrals to speed this up.`,
      metric: `${topReq.daysOpen}d open`,
    });
  } else {
    results.push({
      id: 'admin-req-sla',
      signal: 'Positive',
      category: 'Hiring',
      headline: `Open jobs are being filled within our 30-day goal`,
      detail: `It takes ${ctx.avgTimeToFill} days on average to hire someone, and 88.5% of candidates accept our job offers.`,
      metric: `${ctx.avgTimeToFill}d avg`,
    });
  }

  const overdueStaff = ctx.employees.filter((e) => e.reviewStatus === 'Overdue');
  const totalCount = ctx.employees.length || 1;
  results.push({
    id: 'admin-perf-overdue',
    signal: overdueStaff.length > 0 ? 'Watch' : 'Positive',
    category: 'Performance',
    headline:
      overdueStaff.length > 0
        ? `${overdueStaff.length} staff have overdue performance reviews`
        : `All performance reviews are up to date`,
    detail:
      overdueStaff.length > 0
        ? `${Math.round((overdueStaff.length / totalCount) * 100)}% of reviews are still waiting on managers. Remind them before the Nov 20 deadline.`
        : `Every employee in this group has a completed or in-progress review.`,
    metric: `${overdueStaff.length} overdue`,
  });

  const stars = ctx.employees.filter(
    (e) => e.performance === 'Exceeds' && e.potential === 'High'
  );
  results.push({
    id: 'admin-perf-bench',
    signal: ctx.eNps >= 50 ? 'Positive' : 'Watch',
    category: 'Performance',
    headline: `${stars.length} high-performing staff are ready for leadership`,
    detail: `Employee happiness is +${ctx.eNps}, and ${Math.round((stars.length / totalCount) * 100)}% of this team are strong candidates for future promotions.`,
    metric: `+${ctx.eNps} eNPS`,
  });

  return results;
}
