import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store as StoreIcon,
  RefreshCw,
  Bell,
  Sparkles,
  ShoppingBag,
  Check,
  ChevronDown,
  ExternalLink,
  Layers,
  Search,
  Zap,
  Globe2,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const {
    user,
    stores,
    selectedStoreId,
    setSelectedStoreId,
    activeStore,
    isSyncing,
    syncInventory,
    notifications,
    unreadNotifsCount,
    markNotificationAsRead,
    clearNotifications,
    setActiveTab,
  } = useApp();

  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const storeMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (storeMenuRef.current && !storeMenuRef.current.contains(e.target as Node)) {
        setStoreMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'shopify':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Shopify</span>;
      case 'woocommerce':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">Woo</span>;
      case 'tiktok_shop':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">TikTok</span>;
      case 'ebay':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">eBay</span>;
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Store Selector & Platform Indicator */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={storeMenuRef}>
          <button
            id="header-store-selector-btn"
            onClick={() => setStoreMenuOpen(!storeMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition-all text-slate-800 text-sm font-medium focus:outline-hidden"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <StoreIcon className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block max-w-[180px] truncate">
              <span className="block text-xs font-semibold text-slate-900 truncate">
                {activeStore ? activeStore.name : 'All Channels (4 Stores)'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {activeStore ? `${(activeStore.platform || 'Store').toUpperCase()} • Live Sync` : 'Unified Aggregator'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${storeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Store Switcher Dropdown */}
          <AnimatePresence>
            {storeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Sales Channels
                </div>

                {/* All Stores option */}
                <button
                  id="select-all-stores-btn"
                  onClick={() => {
                    setSelectedStoreId('all');
                    setStoreMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    selectedStoreId === 'all' ? 'bg-indigo-50/60 text-indigo-900 font-semibold' : 'text-slate-700 text-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-slate-700">
                      <Layers className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">All Stores (Unified View)</div>
                      <div className="text-[10px] text-slate-500">{stores.length} connected channels</div>
                    </div>
                  </div>
                  {selectedStoreId === 'all' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {stores.map((store) => (
                  <button
                    key={store.id}
                    id={`select-store-${store.id}`}
                    onClick={() => {
                      setSelectedStoreId(store.id);
                      setStoreMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedStoreId === store.id ? 'bg-indigo-50/60 text-indigo-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{store.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                          {getPlatformBadge(store.platform)}
                          <span>${store.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {selectedStoreId === store.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                ))}

                <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                  <button
                    id="manage-stores-btn"
                    onClick={() => {
                      setActiveTab('stores');
                      setStoreMenuOpen(false);
                    }}
                    className="w-full py-1.5 px-2 text-center text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-md transition-colors"
                  >
                    + Manage & Connect New Store
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search Bar */}
        <div className="hidden lg:flex items-center relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="header-global-search-input"
            type="text"
            placeholder="Search SKU, orders, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white text-xs rounded-lg text-slate-800 placeholder-slate-400 transition-all outline-hidden"
          />
        </div>
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2.5">
        {/* Find Suppliers / Whitelist Quick Link */}
        <button
          id="header-find-suppliers-btn"
          onClick={() => setActiveTab('find_suppliers')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
          title="Browse AliExpress, Alibaba, and 1688 Live Catalog"
        >
          <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Find Suppliers</span>
        </button>

        {/* Live Inventory Sync Button */}
        <button
          id="header-sync-inventory-btn"
          onClick={syncInventory}
          disabled={isSyncing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            isSyncing
              ? 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
          }`}
          title="Verify stock counts across AliExpress, Alibaba, and 1688"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing Feeds...' : 'Sync Stock & Prices'}</span>
        </button>

        {/* Test Sandbox Storefront Shortcut */}
        <button
          id="header-sandbox-store-btn"
          onClick={() => setActiveTab('storefront_sandbox')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs"
          title="Simulate customer buying on your live storefront"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">Test Storefront</span>
        </button>

        {/* AI Business Analyst Quick Trigger */}
        <button
          id="header-ai-advisor-btn"
          onClick={() => setActiveTab('ai_analyst')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Advisor</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            id="header-notifications-btn"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50"
              >
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live System Alerts</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                      {unreadNotifsCount} new
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      id="clear-all-notifs-btn"
                      onClick={clearNotifications}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">No active notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                          !n.read ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'order' && <Zap className="w-4 h-4 text-emerald-500" />}
                          {n.type === 'price' && <RefreshCw className="w-4 h-4 text-amber-500" />}
                          {n.type === 'ai' && <Sparkles className="w-4 h-4 text-indigo-500" />}
                          {n.type === 'inventory' && <Layers className="w-4 h-4 text-sky-500" />}
                          {n.type === 'system' && <Check className="w-4 h-4 text-slate-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 leading-snug">{n.title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar & Plan */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="User Profile"
            className="w-8 h-8 rounded-full border border-slate-300 object-cover"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Alex Vance'}</div>
            <div className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {user?.plan || 'Enterprise'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
