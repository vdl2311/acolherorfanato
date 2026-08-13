import React from 'react';
import { Card } from '../common/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
  color = 'sky',
  onClick,
  id,
}) => {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 border-sky-100 dark:border-sky-900',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-100 dark:border-purple-900',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-100 dark:border-rose-900',
  };

  const trendStyles = {
    positive: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
    negative: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
    neutral: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
  };

  return (
    <Card id={id} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-2xl border ${colorMap[color]} shrink-0`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trendStyles[trendType]}`}>
            {trend}
          </span>
          <span className="text-[11px] text-slate-400">em relação ao mês anterior</span>
        </div>
      )}
    </Card>
  );
};
