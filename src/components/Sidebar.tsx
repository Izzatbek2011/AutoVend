import React from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import {
  LayoutDashboard,
  DownloadCloud,
  ListPlus,
  PackageCheck,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  Scale,
  GitBranch,
  Sparkles,
  Store,
  Compass,
  Zap,
  Layers,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, importQueue, orders, automationRules } = useApp();

  const awaitingOrdersCount = orders.filter((o) => o.status === 'awaiting_order').length;
  const activeRulesCount = automationRules.filter((r) => r.isEnabled).length;

  const mainNav: { category: string; items: NavItem[] }[] = [
    {
      category: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'ai_analyst', label: 'AI Business Advisor', icon: Sparkles, badge: 'Gemini 3.7', badgeColor: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' },
      ],
    },
    {
      category: 'Sourcing & Products',
      items: [
        { id: 'importer', label: 'Product Importer', icon: DownloadCloud },
        {
          id: 'import_list',
          label: 'Import List',
          icon: ListPlus,
          badge: importQueue.length > 0 ? importQueue.length : undefined,
          badgeColor: 'bg-indigo-600 text-white',
        },
        { id: 'products', label: 'My Products & Mapping', icon: PackageCheck },
        { id: 'suppliers_compare', label: 'Supplier Comparison', icon: Scale, badge: 'Ali vs 1688', badgeColor: 'bg-amber-100 text-amber-800' },
      ],
    },
    {
      category: 'Automation & Logistics',
      items: [
        {
          id: 'orders',
          label: 'Orders & Fulfillment',
          icon: ShoppingBag,
          badge: awaitingOrdersCount > 0 ? awaitingOrdersCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'pricing_rules', label: 'Pricing & Repricing', icon: DollarSign },
        { id: 'inventory_sync', label: 'Inventory Sync & Logs', icon: RefreshCw },
        {
          id: 'automation_rules',
          label: 'Automation Workflows',
          icon: GitBranch,
          badge: `${activeRulesCount} on`,
          badgeColor: 'bg-emerald-100 text-emerald-700',
        },
      ],
    },
    {
      category: 'Store Integrations & Test',
      items: [
        { id: 'stores', label: 'Multi-Store Manager', icon: Store },
        { id: 'storefront_sandbox', label: 'Storefront Sandbox', icon: Compass, badge: 'Live Sim', badgeColor: 'bg-emerald-500 text-white' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base leading-none">AutoVend</span>
              <span className="text-[10px] uppercase font-extrabold px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">2.0</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Dropship Automation Engine</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {mainNav.map((section) => (
          <div key={section.category} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {section.category}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Supplier & Gateway Real-Time Status Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
        <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Supplier Gateways
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">100% OK</span>
        </div>
        <div className="text-[10px] text-slate-400 space-y-0.5">
          <div className="flex justify-between">
            <span>AliExpress Direct</span>
            <span className="text-slate-300">24ms</span>
          </div>
          <div className="flex justify-between">
            <span>Alibaba 1-Click API</span>
            <span className="text-slate-300">41ms</span>
          </div>
          <div className="flex justify-between">
            <span>1688 OEM Sync</span>
            <span className="text-slate-300">38ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
