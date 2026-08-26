import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DashboardView: React.FC = () => {
  const {
    analytics,
    orders,
    products,
    stores,
    activeStore,
    fulfillOrder,
    fulfillBulkOrders,
    setActiveTab,
    isSyncing,
    syncInventory,
  } = useApp();

  const [activeChartMetric, setActiveChartMetric] = useState<'revenue' | 'profit'>('revenue');

  const awaitingOrders = orders.filter((o) => o.status === 'awaiting_order');
  const recentOrders = orders.slice(0, 5);

  const handleBulkFulfill = () => {
    const ids = awaitingOrders.map((o) => o.id);
    if (ids.length > 0) {
      fulfillBulkOrders(ids);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Channel Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AutoVend Fulfillment Engine: Online
              </span>
              <span className="text-xs text-slate-400">
                {activeStore ? `Filtered to: ${activeStore.name}` : `Aggregating ${stores.length} connected sales channels`}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Dropshipping Operations Control Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Multi-supplier routing across AliExpress, Alibaba, and 1688 with automated repricing, instant customer order dispatch, and live inventory sync.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="dashboard-sync-btn"
              onClick={syncInventory}
              disabled={isSyncing}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-xs font-semibold text-white backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Verifying Feeds...' : 'Audit Live Feeds'}
            </button>
            <button
              id="dashboard-ai-audit-btn"
              onClick={() => setActiveTab('ai_analyst')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Profit Audit
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ${analytics?.todayRevenue ? analytics.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '1,845.20'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs yesterday</span>
            <span className="text-slate-400 font-normal">({analytics?.todayOrdersCount || 28} orders)</span>
          </div>
        </div>

        {/* Card 2: Net Profit & Margin */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ${analytics?.todayProfit ? analytics.todayProfit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '1,210.40'}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium mt-2">
            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
              {analytics?.profitMarginAvg || 65.6}% Margin
            </span>
            <span className="text-slate-500 font-normal">After COGS & air freight</span>
          </div>
        </div>

        {/* Card 3: Orders Awaiting Fulfillment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Awaiting Order</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{awaitingOrders.length}</span>
            <span className="text-xs text-slate-500 font-medium">orders pending dispatch</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            {awaitingOrders.length > 0 ? (
              <button
                id="dashboard-1click-fulfill-btn"
                onClick={handleBulkFulfill}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-rose-600" />
                1-Click Auto Fulfill All
              </button>
            ) : (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Orders Dispatched
              </span>
            )}
            <button
              id="view-all-orders-shortcut"
              onClick={() => setActiveTab('orders')}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              View →
            </button>
          </div>
        </div>

        {/* Card 4: Sourcing & Inventory Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Fulfillment Health</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {analytics?.fulfillmentRate || 98.6}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span className="text-emerald-600 font-medium">0 Stockouts</span>
            <span>• {products.length} Products Active</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Performance Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Velocity & Margin Breakdown</h3>
              <p className="text-xs text-slate-500">Real-time store earnings vs supplier unit & shipping costs</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                id="chart-metric-revenue"
                onClick={() => setActiveChartMetric('revenue')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeChartMetric === 'revenue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gross Revenue
              </button>
              <button
                id="chart-metric-profit"
                onClick={() => setActiveChartMetric('profit')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeChartMetric === 'profit' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Net Profit ($)
              </button>
            </div>
          </div>

          {/* SVG Visual Graph */}
          <div className="h-64 w-full relative flex items-end justify-between gap-2 pt-8 pb-4 px-2">
            {analytics?.revenueChart.map((day, idx) => {
              const maxVal = 4500;
              const revHeight = (day.revenue / maxVal) * 100;
              const costHeight = (day.cost / maxVal) * 100;
              const profitHeight = (day.profit / maxVal) * 100;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Hover Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded pointer-events-none z-20 whitespace-nowrap shadow-lg">
                    {day.date}: Rev ${day.revenue} | Profit ${day.profit}
                  </div>

                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                    {/* Cost bar */}
                    <div
                      style={{ height: `${costHeight}%` }}
                      className="w-1/2 bg-slate-200 rounded-t-sm group-hover:bg-slate-300 transition-all"
                      title={`Supplier Cost: $${day.cost}`}
                    />
                    {/* Profit / Revenue Bar */}
                    <div
                      style={{ height: activeChartMetric === 'revenue' ? `${revHeight}%` : `${profitHeight}%` }}
                      className={`w-1/2 rounded-t-sm transition-all ${
                        activeChartMetric === 'revenue'
                          ? 'bg-indigo-600 group-hover:bg-indigo-500'
                          : 'bg-emerald-500 group-hover:bg-emerald-400'
                      }`}
                      title={`${activeChartMetric === 'revenue' ? 'Revenue' : 'Profit'}: $${
                        activeChartMetric === 'revenue' ? day.revenue : day.profit
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 font-medium">{day.date}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
              <span>Gross Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              <span>Net Margin (Take Home)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-slate-200"></span>
              <span>Landed Supplier Cost</span>
            </div>
          </div>
        </div>

        {/* Multi-Supplier Sourcing Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Multi-Supplier Matrix</h3>
                <p className="text-xs text-slate-500">Volume routed per gateway</p>
              </div>
              <button
                id="view-supplier-comparison-btn"
                onClick={() => setActiveTab('suppliers_compare')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Compare →
              </button>
            </div>

            <div className="space-y-4">
              {/* AliExpress */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    AliExpress (Standard Direct)
                  </span>
                  <span className="text-slate-900 font-bold">52% (614 orders)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '52%' }}></div>
                </div>
              </div>

              {/* Alibaba */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Alibaba Gold (Tiered Pricing)
                  </span>
                  <span className="text-slate-900 font-bold">31% (366 orders)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '31%' }}></div>
                </div>
              </div>

              {/* 1688 Direct OEM */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    1688 OEM Factory Direct
                  </span>
                  <span className="text-slate-900 font-bold">17% (201 orders)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '17%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Advantage callout */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl mt-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-indigo-950">1688 Sourcing Advantage Active</div>
                <p className="text-[11px] text-indigo-800/80 mt-0.5 leading-relaxed">
                  Routing high-volume orders to 1688 factories saves an average of <span className="font-bold text-indigo-950">$4.10 per unit</span> compared to standard AliExpress single-unit pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Order Stream & Urgent Fulfillment */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Orders & Automated Fulfillment Queue</h3>
            <p className="text-xs text-slate-500">Recent customer purchases synced across your sales channels</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="view-all-orders-btn"
              onClick={() => setActiveTab('orders')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Open Full Orders Manager ({orders.length}) →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order # / Channel</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Item & Variant</th>
                <th className="py-3 px-4">Store Price / Margin</th>
                <th className="py-3 px-4">Status & Supplier Route</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentOrders.map((ord) => {
                const item = ord.items[0];
                return (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-500">{ord.storeName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{ord.customer.fullName}</div>
                      <div className="text-[11px] text-slate-500">{ord.customer.city}, {ord.customer.country}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 max-w-xs">
                        <img
                          src={item?.itemImage || 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=100'}
                          alt={item?.productTitle}
                          className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-medium text-slate-900 truncate">{item?.productTitle}</div>
                          <div className="text-[10px] text-slate-500 truncate">{item?.variantName} (Qty: {item?.quantity})</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">${ord.totalStoreAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        +${ord.profitAmount.toFixed(2)} ({ord.profitMarginPct}%)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.status === 'awaiting_order' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Awaiting Dispatch
                        </span>
                      )}
                      {ord.status === 'processing' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          In Supplier Queue ({ord.supplierOrderId || 'Dispatched'})
                        </span>
                      )}
                      {ord.status === 'shipped' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          Shipped: {ord.trackingNumber?.substring(0, 12)}...
                        </span>
                      )}
                      {ord.status === 'delivered' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Delivered
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ord.status === 'awaiting_order' ? (
                        <button
                          id={`fulfill-single-${ord.id}`}
                          onClick={() => fulfillOrder(ord.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                        >
                          Auto-Order
                        </button>
                      ) : (
                        <button
                          id={`view-order-${ord.id}`}
                          onClick={() => setActiveTab('orders')}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
