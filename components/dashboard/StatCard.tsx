import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo' | 'violet';
}

const colors = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    ring: 'ring-blue-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  ring: 'ring-purple-100' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   ring: 'ring-amber-100' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    ring: 'ring-rose-100' },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  ring: 'ring-indigo-100' },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  ring: 'ring-violet-100' },
};

export default function StatCard({ label, value, subtitle, icon, color }: Props) {
  const c = colors[color];
  return (
    <div className="stat-card">
      <div className={`inline-flex p-3 rounded-xl ${c.bg} ring-1 ${c.ring} mb-4`}>
        <div className={`w-5 h-5 ${c.icon}`}>{icon}</div>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
