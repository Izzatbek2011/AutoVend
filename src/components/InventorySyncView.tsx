import React from 'react';
import { useApp } from '../context/AppContext';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

export const InventorySyncView: React.FC = () => {
  const { inventoryLogs, isSyncing, syncInventory, products } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Live Inventory Synchronizer</span>
            <span className="text-xs text-slate-400">• Automated Stock & Price Polling</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory & Cost Sync Audit Logs
          </h2>
          <p className="text-xs text-slate-500">
            Real-time feed verification against AliExpress, Alibaba, and 1688 API gateways to eliminate overselling and protect profit margins.
          </p>
        </div>

        <button
          id="sync-now-large-btn"
          onClick={syncInventory}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronizing Supplier Feeds...' : 'Run Instant Deep Audit'}
        </button>
      </div>

      {/* Synchronizer Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gateway Status</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All 3 Feeds Synchronized
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Polling interval: <strong className="text-slate-700">Every 15 minutes</strong>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monitored SKUs</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {products.reduce((acc, p) => acc + p.variants.length, 0)} Active Variants
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across 4 connected Shopify, Woo & TikTok stores
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stockout Protection</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> 100% Zero-Oversell
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auto-zero quantity on out-of-stock active
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Synchronization History & Event Ledger</h3>
          </div>
          <span className="text-xs text-slate-500">{inventoryLogs.length} audit runs recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Target Product & SKU</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Old Value</th>
                <th className="py-3 px-4">New Verified Value</th>
                <th className="py-3 px-4">Automated Platform Action</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {inventoryLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{log.productTitle}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{log.variantSku}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log?.eventType === 'price_change'
                          ? 'bg-amber-100 text-amber-800'
                          : log?.eventType === 'stock_update'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {(log?.eventType || 'SYNC').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{log.oldValue}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.newValue}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{log.actionTaken}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                      Synchronized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
