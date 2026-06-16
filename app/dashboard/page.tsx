'use client';
import { useCallback, useEffect, useState } from 'react';
import { BarChart2, Loader2 } from 'lucide-react';
import type { DashboardData } from '@/lib/types';
import OverviewCards from '@/components/dashboard/OverviewCards';
import RepeatBuyerAnalysis from '@/components/dashboard/RepeatBuyerAnalysis';
import LTVBreakdown from '@/components/dashboard/LTVBreakdown';
import TopCustomers from '@/components/dashboard/TopCustomers';
import ProductPaths from '@/components/dashboard/ProductPaths';
import TrafficAnalysis from '@/components/dashboard/TrafficAnalysis';
import SyncPanel from '@/components/dashboard/SyncPanel';
import EmptyState from '@/components/dashboard/EmptyState';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to load'); }
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const isEmpty = !loading && !error && data && data.overview.totalUniqueCustomers === 0 && !data.lastSynced;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>

      {/* Header */}
      <header className="gradient-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center ring-1 ring-white/20">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-indigo-200 text-sm font-medium">Reporting System</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
                Customer Purchase Behaviour
              </h1>
              <p className="text-indigo-300 font-semibold mt-1 text-lg">Tania Khazaal</p>
              {data && data.overview.totalUniqueCustomers > 0 && (
                <p className="text-indigo-300/60 text-sm mt-2">
                  {data.overview.totalUniqueCustomers.toLocaleString()} customers &middot; {data.totalOrders.toLocaleString()} orders
                </p>
              )}
            </div>
            <div className="lg:w-[400px]">
              <SyncPanel lastSynced={data?.lastSynced ?? null} onSyncComplete={loadData} />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-slate-500 text-sm">Loading dashboard…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <p className="font-semibold text-rose-800 mb-1">Could not load dashboard</p>
            <p className="text-rose-600 text-sm mb-4">{error}</p>
            <button onClick={loadData} className="text-sm text-rose-700 font-medium underline">Try again</button>
          </div>
        )}

        {!loading && !error && isEmpty && <EmptyState />}

        {!loading && !error && data && !isEmpty && (
          <div className="space-y-8">
            <OverviewCards data={data.overview} />
            <RepeatBuyerAnalysis data={data.repeatBuyers} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <LTVBreakdown data={data.ltvBreakdown} />
              <TopCustomers data={data.topCustomers} />
            </div>

            <ProductPaths data={data.productPaths} />

            {data.ga4 && <TrafficAnalysis data={data.ga4} />}

            <p className="text-center text-xs text-slate-400 py-4">
              Kajabi API → Google Sheets · Built for Tania Khazaal
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
