import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
  DollarSign,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export const StoresManagementView: React.FC = () => {
  const { stores, connectNewStore, removeStore, refreshData, addToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce' | 'tiktok_shop' | 'ebay'>('shopify');
  const [storeUrl, setStoreUrl] = useState('');
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);

  const handleSyncStore = async (storeId: string) => {
    setSyncingStoreId(storeId);
    try {
      await api.syncStore(storeId);
      await refreshData();
      addToast({
        title: 'Channel Synced',
        message: 'Products, catalog webhooks, and orders updated.',
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Sync Error', message: 'Failed to sync with channel.', type: 'error' });
    } finally {
      setSyncingStoreId(null);
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeUrl) return;

    try {
      await connectNewStore({
        name: storeName,
        platform,
        url: storeUrl,
        currency: 'USD',
      });
      setShowAddModal(false);
      setStoreName('');
      setStoreUrl('');
    } catch (err) {
      // handled
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Multi-Channel Gateway</span>
            <span className="text-xs text-slate-400">• Unified Aggregator</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Connected Sales Channels & Store Manager
          </h2>
          <p className="text-xs text-slate-500">
            Manage your synchronized storefronts across Shopify, WooCommerce, TikTok Shop, and eBay with automatic stock & order routing.
          </p>
        </div>

        <button
          id="connect-store-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Connect New Store
        </button>
      </div>

      {/* Connected Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map((s) => {
          const isSyncingThis = syncingStoreId === s.id;

          const getPlatformColor = () => {
            switch (s.platform) {
              case 'shopify':
                return 'bg-emerald-500';
              case 'woocommerce':
                return 'bg-purple-600';
              case 'tiktok_shop':
                return 'bg-rose-500';
              case 'ebay':
                return 'bg-blue-600';
              default:
                return 'bg-indigo-600';
            }
          };

          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${getPlatformColor()}`}></span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {(s.platform || 'Store').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Webhook Active</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                  <span>{s.url}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Revenue</span>
                    <strong className="text-slate-900 font-bold">${s.revenue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Orders</span>
                    <strong className="text-slate-900 font-bold">{s.ordersCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active SKUs</span>
                    <strong className="text-slate-900 font-bold">{s.productsCount}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Last synced: {new Date(s.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    id={`sync-store-${s.id}`}
                    onClick={() => handleSyncStore(s.id)}
                    disabled={isSyncingThis}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingThis ? 'animate-spin' : ''}`} />
                    {isSyncingThis ? 'Syncing...' : 'Sync Channel'}
                  </button>

                  <button
                    id={`remove-store-${s.id}`}
                    onClick={() => removeStore(s.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Disconnect store"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Connect New Sales Channel</h3>
            <form onSubmit={handleAddStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Platform Type</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden font-medium"
                >
                  <option value="shopify">Shopify Store</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="tiktok_shop">TikTok Shop</option>
                  <option value="ebay">eBay Merchant</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TrendyNest US"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store URL / Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://trendynest.myshopify.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-900 text-[11px] leading-relaxed">
                AutoVend will securely connect OAuth access tokens and configure webhook listeners for instant order ingest.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md"
                >
                  Link & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
