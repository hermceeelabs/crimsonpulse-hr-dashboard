import React from 'react';
import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import type { BusinessInsight } from '../utils/insightsEngine';

const signalStyles: Record<
  BusinessInsight['signal'],
  { text: string; bar: string; icon: React.FC<{ className?: string }> }
> = {
  'Action Required': {
    text: 'text-[#6B0F1A] dark:text-rose-300',
    bar: 'bg-[#6B0F1A]',
    icon: AlertTriangle,
  },
  Watch: {
    text: 'text-amber-700 dark:text-amber-300',
    bar: 'bg-amber-600',
    icon: Eye,
  },
  Positive: {
    text: 'text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-600',
    icon: CheckCircle2,
  },
};

export const InsightsStrip: React.FC<{
  title?: string;
  insights: BusinessInsight[];
}> = ({ title = 'Rule-Based Business Insights', insights }) => (
  <div className="shrink-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 shadow-xs">
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="text-sm font-bold">{title}</h2>
      <span className="text-[11px] text-[var(--text-muted)]">
        Auto-evaluated from active filters
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {insights.map((ins) => {
        const cfg = signalStyles[ins.signal];
        const Icon = cfg.icon;
        return (
          <div
            key={ins.id}
            className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/65 pl-4 pr-3.5 py-2.5 overflow-hidden"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                <Icon className="h-3 w-3" />
                {ins.signal}
              </span>
              <span className="text-xs font-extrabold tabular-nums text-[var(--text-primary)]">
                {ins.metric}
              </span>
            </div>
            <div className="text-xs font-bold leading-snug text-[var(--text-primary)]">
              {ins.headline}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
              {ins.detail}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);

export const InsightsStack: React.FC<{
  title?: string;
  subtitle?: string;
  insights: BusinessInsight[];
}> = ({
  title = 'Rule-Based Business Insights',
  subtitle = 'Live rules evaluated on current slice',
  insights,
}) => (
  <div className="min-h-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5 shadow-xs flex flex-col justify-between overflow-hidden">
    <div className="shrink-0 mb-2">
      <h2 className="text-sm font-bold leading-tight">{title}</h2>
      <p className="text-[11px] text-[var(--text-muted)]">{subtitle}</p>
    </div>
    <div className="flex-1 min-h-0 flex flex-col justify-center gap-2">
      {insights.map((ins) => {
        const cfg = signalStyles[ins.signal];
        const Icon = cfg.icon;
        return (
          <div
            key={ins.id}
            className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/65 pl-3.5 pr-3 py-2 overflow-hidden"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                <Icon className="h-3 w-3" />
                {ins.signal}
              </span>
              <span className="text-[11px] font-extrabold tabular-nums text-[var(--text-primary)]">
                {ins.metric}
              </span>
            </div>
            <div className="text-[11px] font-bold text-[var(--text-primary)] mt-0.5 truncate">
              {ins.headline}
            </div>
            <p className="text-[10.5px] text-[var(--text-secondary)] leading-snug line-clamp-2 mt-0.5">
              {ins.detail}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);
