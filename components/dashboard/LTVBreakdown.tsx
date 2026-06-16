'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { LTVBracket } from '@/lib/types';

const COLORS = ['#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'];
const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function Tip({ active, payload }: { active?: boolean; payload?: { payload: LTVBracket }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm min-w-[180px]">
      <p className="font-semibold text-slate-800 mb-2">{d.label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4"><span className="text-slate-500">Customers</span><span className="font-medium">{d.count.toLocaleString()}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-500">Revenue</span><span className="font-medium text-indigo-600">{usd(d.totalRevenue)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-500">Share</span><span className="font-medium">{d.percentage.toFixed(1)}%</span></div>
      </div>
    </div>
  );
}

export default function LTVBreakdown({ data }: { data: LTVBracket[] }) {
  const active = data.filter(d => d.count > 0);
  return (
    <div className="section-card p-6">
      <h2 className="text-lg font-semibold text-slate-800">Lifetime Value Breakdown</h2>
      <p className="text-sm text-slate-500 mt-0.5 mb-6">Revenue distribution by customer spending tier</p>

      {active.length > 0 ? (
        <div className="h-56 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={active} barSize={36} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
              <Bar dataKey="totalRevenue" radius={[6, 6, 0, 0]}>
                {active.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-56 flex items-center justify-center text-slate-400 text-sm mb-6">No data yet</div>
      )}

      <table className="w-full text-sm">
        <thead className="table-header">
          <tr>
            <th className="text-left px-3 py-2.5 rounded-l-lg">Tier</th>
            <th className="text-right px-3 py-2.5">Customers</th>
            <th className="text-right px-3 py-2.5">Revenue</th>
            <th className="text-right px-3 py-2.5 rounded-r-lg">Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-medium text-slate-700">{b.label}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right text-slate-600">{b.count.toLocaleString()}</td>
              <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{usd(b.totalRevenue)}</td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                  </div>
                  <span className="text-slate-500 text-xs w-9 text-right">{b.percentage.toFixed(1)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
