import React, { useState } from 'react';
import type { MonthlyTrend, DepartmentStat } from '../data/hrData';

export const Sparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#851826', height = 34 }) => {
  const width = 104;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const areaPath = `M ${pad},${height} L ${points.join(' L ')} L ${width - pad},${height} Z`;
  const linePath = `M ${points.join(' L ')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-20 sm:w-[104px] h-auto shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${color.replace('#', '')})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const HeadcountTrendChart: React.FC<{
  data: MonthlyTrend[];
  scaleFactor?: number;
}> = ({ data, scaleFactor = 1 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const scaled = data.map((d) => ({
    ...d,
    headcount: Math.round(d.headcount * scaleFactor),
    hires: Math.max(1, Math.round(d.hires * scaleFactor)),
    exits: Math.max(0, Math.round(d.exits * scaleFactor)),
  }));

  const width = 680;
  const height = 200;
  const padL = 42;
  const padR = 36;
  const padT = 12;
  const padB = 26;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const xInset = 18;

  const rawMin = Math.floor(Math.min(...scaled.map((d) => d.headcount)) * 0.94);
  const rawMax = Math.ceil(Math.max(...scaled.map((d) => d.headcount)) * 1.03);
  const minHC = Math.floor(rawMin / 10) * 10;
  const maxHC = Math.ceil(rawMax / 10) * 10;
  const hcRange = maxHC - minHC || 1;

  const rawFlowMax = Math.max(...scaled.map((d) => Math.max(d.hires, d.exits)), 8);
  const maxFlow = Math.ceil(rawFlowMax / 4) * 4;
  const flowTicks = [0, Math.round(maxFlow * 0.25), Math.round(maxFlow * 0.5), Math.round(maxFlow * 0.75), maxFlow];

  const getX = (i: number) =>
    padL + xInset + (i / (scaled.length - 1)) * (chartW - xInset * 2);
  const getY = (val: number) => padT + chartH - ((val - minHC) / hcRange) * chartH;

  const linePoints = scaled.map((d, i) => `${getX(i)},${getY(d.headcount)}`);
  const areaD = `M ${getX(0)},${padT + chartH} L ${linePoints.join(' L ')} L ${getX(scaled.length - 1)},${padT + chartH} Z`;
  const lineD = `M ${linePoints.join(' L ')}`;

  const gridTicks = 4;
  const yTicks = Array.from({ length: gridTicks + 1 }, (_, i) =>
    Math.round(minHC + (i / gridTicks) * hcRange)
  );

  const activePoint = hoveredIdx !== null ? scaled[hoveredIdx] : null;

  return (
    <div className="relative w-full lg:h-full flex items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto lg:h-full max-h-full block overflow-hidden"
      >
        <defs>
          <linearGradient id="hcAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B0F1A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6B0F1A" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Subtle chart plot frame & solid X/Y axis lines */}
        <rect
          x={padL}
          y={padT}
          width={chartW}
          height={chartH}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />

        {/* Grid lines & Y-axis ticks */}
        {yTicks.map((tick, idx) => {
          const y = getY(tick);
          return (
            <g key={idx}>
              {idx > 0 && idx < yTicks.length - 1 && (
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 4"
                />
              )}
              <line
                x1={padL - 4}
                y1={y}
                x2={padL}
                y2={y}
                stroke="var(--border-strong)"
                strokeWidth="1.25"
              />
              <text
                x={padL - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[var(--text-muted)] text-[10px] tabular-nums font-medium"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Solid Y-axis spines (left & right) and X-axis baseline */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + chartH}
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        <line
          x1={width - padR}
          y1={padT}
          x2={width - padR}
          y2={padT + chartH}
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        <line
          x1={padL}
          y1={padT + chartH}
          x2={width - padR}
          y2={padT + chartH}
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />

        {/* Right Y-axis ticks & labels (0-based Hires / Exits scale) */}
        {flowTicks.map((tick, idx) => {
          const y = padT + chartH - (tick / maxFlow) * (chartH * 0.48);
          return (
            <g key={`flow-${idx}`}>
              <line
                x1={width - padR}
                y1={y}
                x2={width - padR + 4}
                y2={y}
                stroke="var(--border-strong)"
                strokeWidth="1.25"
              />
              <text
                x={width - padR + 7}
                y={y + 3.5}
                textAnchor="start"
                className="fill-[#B83B5E] text-[9.5px] tabular-nums font-medium"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Hires & Exits bars (mapped to right Y-axis 0..maxFlow) */}
        {scaled.map((d, i) => {
          const x = getX(i);
          const barW = 8;
          const hireH = (d.hires / maxFlow) * (chartH * 0.48);
          const exitH = (d.exits / maxFlow) * (chartH * 0.48);
          const isHovered = hoveredIdx === i;
          return (
            <g key={d.month}>
              <rect
                x={x - barW - 1}
                y={padT + chartH - hireH}
                width={barW}
                height={hireH}
                rx={2.5}
                fill="#2E7D5B"
                opacity={isHovered ? 0.95 : 0.65}
                className="transition-all duration-150"
              />
              <rect
                x={x + 1}
                y={padT + chartH - exitH}
                width={barW}
                height={exitH}
                rx={2.5}
                fill="#C96A2B"
                opacity={isHovered ? 0.95 : 0.65}
                className="transition-all duration-150"
              />
            </g>
          );
        })}

        {/* Headcount Area + Line */}
        <path d={areaD} fill="url(#hcAreaGrad)" />
        <path
          d={lineD}
          fill="none"
          stroke="#6B0F1A"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover vertical guide */}
        {hoveredIdx !== null && (
          <line
            x1={getX(hoveredIdx)}
            y1={padT}
            x2={getX(hoveredIdx)}
            y2={padT + chartH}
            stroke="#6B0F1A"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.55"
          />
        )}

        {/* Data points + X labels + Invisible hit targets */}
        {scaled.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.headcount);
          const isHovered = hoveredIdx === i;
          return (
            <g
              key={d.month}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 5.5 : 3.2}
                fill={isHovered ? '#6B0F1A' : 'var(--bg-surface)'}
                stroke="#6B0F1A"
                strokeWidth="2"
                className="transition-all duration-150"
              />
              <line
                x1={cx}
                y1={padT + chartH}
                x2={cx}
                y2={padT + chartH + 4}
                stroke="var(--border-strong)"
                strokeWidth="1.25"
              />
              <text
                x={cx}
                y={height - 7}
                textAnchor="middle"
                className={`text-[10.5px] font-medium ${
                  isHovered ? 'fill-[#6B0F1A] font-bold' : 'fill-[var(--text-muted)]'
                }`}
              >
                {d.month}
              </text>
              <rect
                x={cx - chartW / scaled.length / 2}
                y={padT}
                width={chartW / scaled.length}
                height={chartH + 24}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {activePoint && hoveredIdx !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 shadow-lg text-xs"
          style={{
            left: hoveredIdx > 7 ? 'auto' : `${Math.min(72, (hoveredIdx / 11) * 78 + 8)}%`,
            right: hoveredIdx > 7 ? `${Math.max(4, ((11 - hoveredIdx) / 11) * 30 + 4)}%` : 'auto',
          }}
        >
          <div className="font-bold text-[var(--text-primary)] mb-1">
            {activePoint.month} 2026 Snapshot
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 tabular-nums">
            <span className="text-[var(--text-muted)]">Headcount:</span>
            <span className="font-semibold text-right">{activePoint.headcount}</span>
            <span className="text-[var(--text-muted)]">New Hires:</span>
            <span className="font-semibold text-[#2E7D5B] text-right">+{activePoint.hires}</span>
            <span className="text-[var(--text-muted)]">Departures:</span>
            <span className="font-semibold text-[#C96A2B] text-right">
              -{activePoint.exits}
            </span>
            <span className="text-[var(--text-muted)]">Net Growth:</span>
            <span className="font-bold text-emerald-600 text-right">
              +{activePoint.hires - activePoint.exits}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const DepartmentBarChart: React.FC<{
  departments: DepartmentStat[];
  selectedDept: string;
  onSelectDept: (dept: DepartmentStat['name']) => void;
}> = ({ departments, selectedDept, onSelectDept }) => {
  const maxHC = Math.max(...departments.map((d) => d.headcount));

  return (
    <div className="space-y-1">
      {departments.map((dept) => {
        const pct = (dept.headcount / maxHC) * 100;
        const isSelected = selectedDept === dept.name;
        return (
          <button
            key={dept.name}
            type="button"
            onClick={() => onSelectDept(dept.name)}
            className={`w-full text-left rounded-lg px-2 py-1 transition-all border ${
              isSelected
                ? 'border-[#6B0F1A] bg-[var(--maroon-100)]/60 dark:bg-[#6B0F1A]/15'
                : 'border-transparent hover:bg-[var(--bg-surface-muted)]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-[var(--text-primary)] truncate">{dept.name}</span>
                <span className="text-[10px] font-medium text-[var(--text-muted)] tabular-nums shrink-0">
                  · {dept.openReqs} open
                </span>
              </div>
              <div className="flex items-center gap-2.5 tabular-nums shrink-0">
                <span className="text-[10px] text-[var(--text-muted)]">
                  Attr.{' '}
                  <strong
                    className={
                      dept.attritionRate > 12 ? 'text-[#B83B5E]' : 'text-[var(--text-primary)]'
                    }
                  >
                    {dept.attritionRate}%
                  </strong>
                </span>
                <span className="font-bold text-[var(--text-primary)] w-7 text-right">
                  {dept.headcount}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: isSelected
                    ? 'linear-gradient(90deg, #450912, #851826)'
                    : 'linear-gradient(90deg, #6B0F1A, #B83B5E)',
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const AttritionDonutChart: React.FC<{
  items: { reason: string; pct: number; count: number; color: string }[];
}> = ({ items }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const size = 180;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePct = 0;
  const totalCount = items.reduce((acc, i) => acc + i.count, 0);
  const activeItem = activeIdx !== null ? items[activeIdx] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {items.map((item, idx) => {
            const dash = (item.pct / 100) * circumference;
            const offset = -(cumulativePct / 100) * circumference;
            cumulativePct += item.pct;
            const isHovered = activeIdx === idx;
            return (
              <circle
                key={item.reason}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? stroke + 4 : stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                className="cursor-pointer transition-all duration-200"
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-2xl font-extrabold tabular-nums text-[var(--text-primary)]">
            {activeItem ? `${activeItem.pct}%` : totalCount}
          </span>
          <span className="text-[11px] font-medium text-[var(--text-muted)] leading-tight">
            {activeItem ? activeItem.reason : 'Total Exits (LTM)'}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.reason}
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
              activeIdx === idx ? 'bg-[var(--bg-surface-muted)]' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-[var(--text-primary)]">{item.reason}</span>
            </div>
            <div className="flex items-center gap-2.5 tabular-nums">
              <span className="text-[var(--text-muted)]">{item.count}</span>
              <span className="font-bold text-[var(--text-primary)] w-9 text-right">
                {item.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
