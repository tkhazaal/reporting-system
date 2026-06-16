import { Zap, ArrowRight, Timer } from 'lucide-react';
import type { RepeatBuyerMetrics } from '@/lib/types';

const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtDays = (n: number) => n < 1 ? `${(n * 24).toFixed(1)}h` : `${n.toFixed(1)} days`;

export default function RepeatBuyerAnalysis({ data }: { data: RepeatBuyerMetrics }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Repeat Buyer Analysis</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="stat-card border-l-4 border-l-violet-400">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-violet-50 rounded-lg"><Zap className="w-4 h-4 text-violet-600" /></div>
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">Same Session (&lt;24h)</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.sameSessionRepeatBuyers}</p>
          <p className="text-sm text-slate-500 mt-1">bought again within 24 hours</p>
          <div className="mt-3 bg-violet-50 rounded-xl px-3 py-2">
            <p className="text-xs text-violet-600 font-medium">Upsell revenue</p>
            <p className="text-lg font-bold text-violet-800">{usd(data.sameSessionRevenue)}</p>
          </div>
        </div>

        <div className="stat-card border-l-4 border-l-blue-400">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg"><ArrowRight className="w-4 h-4 text-blue-600" /></div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Independent Return (24h+)</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{data.independentReturners}</p>
          <p className="text-sm text-slate-500 mt-1">came back after 24 hours</p>
          <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2">
            <p className="text-xs text-blue-600 font-medium">Return revenue</p>
            <p className="text-lg font-bold text-blue-800">{usd(data.independentReturnRevenue)}</p>
          </div>
        </div>

        <div className="stat-card border-l-4 border-l-emerald-400">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg"><Timer className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Gap Between Purchases</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Average</p>
              <p className="text-xl font-bold text-slate-900">{fmtDays(data.averageGapDays)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Median</p>
              <p className="text-xl font-bold text-slate-900">{fmtDays(data.medianGapDays)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Between 1st and 2nd purchase</p>
        </div>

      </div>
    </section>
  );
}
