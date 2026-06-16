import { Database, ArrowRight } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <Database className="w-10 h-10 text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">No Data Yet</h3>
      <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
        Click <strong className="text-slate-700">Sync Now</strong> in the header to pull your Kajabi data into Google Sheets and populate the dashboard.
      </p>
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-white rounded-xl px-5 py-3 border border-slate-100 shadow-sm">
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium">Kajabi API</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-medium">Google Sheets</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg font-medium">Dashboard</span>
      </div>
    </div>
  );
}
