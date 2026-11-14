import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Award,
  Mail,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import type { Employee } from '../data/hrData';

interface EmployeeDrawerProps {
  employee: Employee | null;
  onClose: () => void;
  onActionToast: (msg: string) => void;
}

export const EmployeeDrawer: React.FC<EmployeeDrawerProps> = ({
  employee,
  onClose,
  onActionToast,
}) => {
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  if (!employee) return null;

  const isFlagged = flagged[employee.id];
  const compaPct = Math.min(130, Math.max(70, Math.round(employee.compaRatio * 100)));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#1A0408]/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <aside className="relative z-10 w-full max-w-md bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col h-full overflow-y-auto animate-enter">
        {/* Maroon Hero Header */}
        <div
          className="relative px-6 pt-6 pb-7 text-white"
          style={{
            background: 'linear-gradient(135deg, #26060B 0%, #6B0F1A 65%, #8F1D2C 100%)',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close profile drawer"
            className="absolute right-4 top-4 rounded-full p-2 text-white/75 hover:bg-white/15 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-lg font-bold tracking-wide shadow-inner">
              {employee.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">{employee.name}</h2>
                <span className="text-xs font-semibold text-rose-200/80">
                  · {employee.level}
                </span>
              </div>
              <p className="text-sm text-rose-100/90">{employee.role}</p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-rose-200/80">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {employee.department}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {employee.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/55 p-3">
              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Tenure & Hire Date
              </div>
              <div className="mt-1 text-sm font-bold tabular-nums">
                {employee.tenureYears} yrs
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">Since {employee.hireDate}</div>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/55 p-3">
              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" /> 9-Box Placement
              </div>
              <div className="mt-1 text-sm font-bold">
                {employee.performance} / {employee.potential}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Review: {employee.reviewStatus}
              </div>
            </div>
          </div>

          {/* Compensation & Compa-Ratio */}
          <div className="rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Compensation & Market Band
              </span>
              <span className="text-xs font-bold tabular-nums text-[#6B0F1A] dark:text-rose-300">
                Compa-Ratio: {employee.compaRatio.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tabular-nums">
                ${employee.salary.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--text-muted)]">Base Annual (USD)</span>
            </div>

            {/* Band Gauge */}
            <div>
              <div className="relative h-2.5 w-full rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((compaPct - 70) / 60) * 100}%`,
                    background:
                      employee.compaRatio < 0.93
                        ? '#B83B5E'
                        : 'linear-gradient(90deg, #6B0F1A, #8F1D2C)',
                  }}
                />
                {/* 1.00 Market Median Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[var(--text-primary)] opacity-50"
                  style={{ left: '50%' }}
                  title="Market Median (1.00x)"
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[var(--text-muted)] tabular-nums">
                <span>0.70x Band Min</span>
                <span>1.00x Median</span>
                <span>1.30x Band Max</span>
              </div>
            </div>
          </div>

          {/* Flight Risk Assessment */}
          <div className="rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-[#851826]" /> Retention Risk Index
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                {employee.flightRisk} Risk ({employee.riskScore}/100)
              </span>
            </div>

            <div className="space-y-1.5">
              {employee.riskFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-lg bg-[var(--bg-surface-muted)]/60 px-3 py-2 text-xs text-[var(--text-secondary)]"
                >
                  {employee.flightRisk === 'High' ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-[#B83B5E] shrink-0 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5 text-[#6B0F1A] shrink-0 mt-0.5" />
                  )}
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reporting Line */}
          <div className="rounded-xl border border-[var(--border-subtle)] p-3.5 flex items-center justify-between text-xs">
            <div>
              <div className="text-[var(--text-muted)]">Direct Manager</div>
              <div className="font-semibold text-[var(--text-primary)] mt-0.5">
                {employee.manager}
              </div>
            </div>
            <a
              href={`mailto:${employee.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-3 py-1.5 font-medium hover:bg-[var(--bg-surface-muted)] transition"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[var(--border-subtle)] p-4 bg-[var(--bg-surface-muted)]/40 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setFlagged((prev) => ({ ...prev, [employee.id]: !prev[employee.id] }));
              onActionToast(
                isFlagged
                  ? `Removed retention review flag for ${employee.name}`
                  : `Scheduled retention & comp review for ${employee.name}`
              );
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B0F1A] hover:bg-[#450912] text-white px-4 py-2.5 text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isFlagged ? 'Retention Review Scheduled' : 'Schedule Retention Review'}
          </button>
        </div>
      </aside>
    </div>
  );
};
