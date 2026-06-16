import { Crown } from 'lucide-react';
import type { TopCustomer } from '@/lib/types';

const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const rankStyle = (i: number) =>
  i === 0 ? 'bg-amber-100 text-amber-700 font-bold' :
  i === 1 ? 'bg-slate-200 text-slate-600 font-bold' :
  i === 2 ? 'bg-orange-100 text-orange-700 font-bold' :
  'bg-slate-50 text-slate-400';

export default function TopCustomers({ data }: { data: TopCustomer[] }) {
  return (
    <div className="section-card p-6">
      <div className="flex items-center gap-2 mb-0.5">
        <Crown className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-800">Top Customers</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">Ranked by lifetime value</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left px-3 py-2.5 rounded-l-lg">#</th>
              <th className="text-left px-3 py-2.5">Customer</th>
              <th className="text-right px-3 py-2.5">Orders</th>
              <th className="text-right px-3 py-2.5">Products</th>
              <th className="text-right px-3 py-2.5 rounded-r-lg">LTV</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">No data yet — sync to load</td></tr>
            ) : data.map((c, i) => (
              <tr key={c.email} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${rankStyle(i)}`}>{i + 1}</span>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-slate-800 leading-tight">{c.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.email}</p>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{c.totalOrders}</span>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{c.totalProducts}</span>
                </td>
                <td className="px-3 py-3 text-right font-bold text-emerald-700">{usd(c.lifetimeValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
