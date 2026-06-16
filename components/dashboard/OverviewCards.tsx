import { Users, DollarSign, TrendingUp, BarChart2, UserCheck, Repeat } from 'lucide-react';
import StatCard from './StatCard';
import type { OverviewMetrics } from '@/lib/types';

const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const num = (n: number) => new Intl.NumberFormat('en-US').format(n);
const pct = (a: number, b: number) => b === 0 ? '0%' : ((a / b) * 100).toFixed(1) + '%';

export default function OverviewCards({ data }: { data: OverviewMetrics }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Unique Customers" value={num(data.totalUniqueCustomers)} icon={<Users />} color="blue" />
        <StatCard label="Total Revenue" value={usd(data.totalRevenue)} icon={<DollarSign />} color="emerald" />
        <StatCard label="Average LTV" value={usd(data.averageLTV)} icon={<TrendingUp />} color="purple" />
        <StatCard label="Median LTV" value={usd(data.medianLTV)} icon={<BarChart2 />} color="amber" />
        <StatCard label="Single Buyers" value={num(data.singleBuyers)} subtitle={pct(data.singleBuyers, data.totalUniqueCustomers) + ' of customers'} icon={<UserCheck />} color="rose" />
        <StatCard label="Repeat Buyers" value={num(data.repeatBuyers)} subtitle={pct(data.repeatBuyers, data.totalUniqueCustomers) + ' of customers'} icon={<Repeat />} color="indigo" />
      </div>

      {data.customersByOrderCount.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Customers by Number of Orders</h3>
          <div className="flex flex-wrap gap-2">
            {data.customersByOrderCount.map(({ count, customers }) => (
              <div key={count} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">{count === 1 ? '1 order' : `${count} orders`}</span>
                <span className="text-sm font-bold text-slate-800">{num(customers)}</span>
                <span className="text-xs text-slate-400">({pct(customers, data.totalUniqueCustomers)})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
