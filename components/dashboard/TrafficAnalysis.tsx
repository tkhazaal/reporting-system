'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ExternalLink } from 'lucide-react';
import type { GA4Data } from '@/lib/types';

const SOCIAL_COLORS: Record<string, string> = {
  'Facebook Stories': '#1877f2',
  'Facebook Post':    '#1877f2',
  'Facebook':         '#1877f2',
  'Instagram Stories':'#e1306c',
  'Instagram Post':   '#e1306c',
  'Instagram':        '#e1306c',
  'Google':           '#4285f4',
  'Email':            '#10b981',
  'Direct':           '#94a3b8',
};

function getColor(label: string, idx: number) {
  if (SOCIAL_COLORS[label]) return SOCIAL_COLORS[label];
  const fallbacks = ['#6366f1', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6'];
  return fallbacks[idx % fallbacks.length];
}

const pct = (n: number) => n.toFixed(1) + '%';
const num = (n: number) => n.toLocaleString();

function Tip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; sessions: number; conversions: number; conversionRate: number; revenue: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm min-w-[190px]">
      <p className="font-semibold text-slate-800 mb-2">{d.label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4"><span className="text-slate-500">Sessions</span><span className="font-medium">{num(d.sessions)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-500">Conversions</span><span className="font-medium text-emerald-600">{num(d.conversions)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-500">Conv. Rate</span><span className="font-medium">{pct(d.conversionRate)}</span></div>
        {d.revenue > 0 && <div className="flex justify-between gap-4"><span className="text-slate-500">Revenue</span><span className="font-medium">${d.revenue.toFixed(0)}</span></div>}
      </div>
    </div>
  );
}

export default function TrafficAnalysis({ data }: { data: GA4Data }) {
  if (data.error && !data.trafficSources.length) {
    return (
      <div className="section-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-800">Traffic & Conversion Analysis</h2>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>GA4 not configured:</strong> {data.error}
        </div>
      </div>
    );
  }

  const chartData = data.trafficSources.slice(0, 12);

  return (
    <div className="section-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-800">Traffic & Conversion Analysis</h2>
          </div>
          <p className="text-sm text-slate-500">Last 90 days · Google Analytics 4</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-slate-400">Total Sessions</p>
            <p className="text-xl font-bold text-slate-800">{num(data.totalSessions)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Conversions</p>
            <p className="text-xl font-bold text-emerald-700">{num(data.totalConversions)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Overall CVR</p>
            <p className="text-xl font-bold text-indigo-700">{pct(data.overallConversionRate)}</p>
          </div>
        </div>
      </div>

      {/* Sessions by source bar chart */}
      {chartData.length > 0 && (
        <div className="h-52 mb-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Sessions by Traffic Source</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={32} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="sessions" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={getColor(d.label, i)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Traffic source table */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Source Breakdown</p>
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left px-3 py-2.5 rounded-l-lg">Source</th>
              <th className="text-right px-3 py-2.5">Sessions</th>
              <th className="text-right px-3 py-2.5">Conversions</th>
              <th className="text-right px-3 py-2.5 rounded-r-lg">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.trafficSources.map((s, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(s.label, i) }} />
                    <span className="font-medium text-slate-700">{s.label}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600">{num(s.sessions)}</td>
                <td className="px-3 py-2.5 text-right text-emerald-600 font-medium">{num(s.conversions)}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.conversionRate > 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>
                    {pct(s.conversionRate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Landing pages */}
      {data.landingPages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Top Landing Pages</p>
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                <th className="text-left px-3 py-2.5 rounded-l-lg">Page</th>
                <th className="text-right px-3 py-2.5">Sessions</th>
                <th className="text-right px-3 py-2.5">Conversions</th>
                <th className="text-right px-3 py-2.5 rounded-r-lg">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.landingPages.map((p, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      <span className="text-slate-600 text-xs font-mono truncate max-w-xs">{p.pagePath}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{num(p.sessions)}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-600 font-medium">{num(p.conversions)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.conversionRate > 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>
                      {pct(p.conversionRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
