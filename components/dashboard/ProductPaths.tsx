import { ArrowRight, GitBranch } from 'lucide-react';
import type { ProductPath } from '@/lib/types';

export default function ProductPaths({ data }: { data: ProductPath[] }) {
  const max = data[0]?.count || 1;
  return (
    <div className="section-card p-6">
      <div className="flex items-center gap-2 mb-0.5">
        <GitBranch className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-semibold text-slate-800">Product Purchase Paths</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">Most common customer journeys — first product → second product</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left px-3 py-2.5 rounded-l-lg w-8">#</th>
              <th className="text-left px-3 py-2.5">First Product</th>
              <th className="w-8 py-2.5"></th>
              <th className="text-left px-3 py-2.5">Second Product</th>
              <th className="text-right px-3 py-2.5 rounded-r-lg">Customers</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">No repeat buyer path data yet</td></tr>
            ) : data.map((p, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-3 text-slate-400 font-medium text-xs">{i + 1}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-medium max-w-xs truncate">{p.firstProduct}</span>
                </td>
                <td className="py-3 text-slate-300"><ArrowRight className="w-4 h-4" /></td>
                <td className="px-3 py-3">
                  <span className="inline-flex px-3 py-1.5 rounded-lg bg-violet-50 text-violet-800 text-xs font-medium max-w-xs truncate">{p.secondProduct}</span>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(p.count / max) * 100}%` }} />
                    </div>
                    <span className="font-semibold text-slate-700 w-6 text-right">{p.count}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
