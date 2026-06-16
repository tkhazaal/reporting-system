'use client';
import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SyncStats { customers: number; orders: number; orderItems: number; lastSynced: string }
interface Props { lastSynced: string | null; onSyncComplete: () => void }

export default function SyncPanel({ lastSynced, onSyncComplete }: Props) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [error, setError] = useState('');

  async function doSync() {
    setStatus('syncing'); setError(''); setStats(null);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setStats(data.stats);
      setStatus('success');
      onSyncComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
      setStatus('error');
    }
  }

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return iso; }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">Data Source</p>
          <p className="text-white font-bold text-sm mt-0.5">Kajabi API → Google Sheets</p>
          {lastSynced
            ? <p className="text-white/50 text-xs mt-0.5">Last synced {fmtDate(lastSynced)}</p>
            : <p className="text-amber-300 text-xs mt-0.5">Not yet synced — click to load data</p>
          }
        </div>
        <button
          onClick={doSync}
          disabled={status === 'syncing'}
          className="flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
        >
          {status === 'syncing'
            ? <><Loader2 className="w-4 h-4 animate-spin" />Syncing…</>
            : <><RefreshCw className="w-4 h-4" />Sync Now</>
          }
        </button>
      </div>

      {status === 'success' && stats && (
        <div className="mt-3 flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-3 py-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
          <span className="text-emerald-200 text-xs font-medium">
            {stats.customers} customers · {stats.orders} orders · {stats.orderItems} line items synced
          </span>
        </div>
      )}
      {status === 'error' && (
        <div className="mt-3 flex items-start gap-2 bg-rose-500/20 border border-rose-400/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-300 flex-shrink-0 mt-0.5" />
          <span className="text-rose-200 text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}
