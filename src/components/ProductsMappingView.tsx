import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PackageCheck,
  GitBranch,
  Layers,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Store as StoreIcon,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export const ProductsMappingView: React.FC = () => {
  const { products, stores, refreshData, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(products[0]?.id || null);
  const [isSwitching, setIsSwitching] = useState(false);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSwitchSupplier = async (
    productId: string,
    variantId: string,
    newPlatform: string,
    newCost: number
  ) => {
    setIsSwitching(true);
    try {
      await api.switchVariantSupplier({
        productId,
        variantId,
        newSupplierPlatform: newPlatform,
        newCost,
      });
      await refreshData();
      addToast({
        title: 'Supplier Mapping Re-Routed',
        message: `Variant successfully re-routed to ${newPlatform.toUpperCase()}. All future customer checkouts will dispatch here.`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Mapping Error', message: 'Failed to switch supplier mapping.', type: 'error' });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Multi-Supplier Engine</span>
            <span className="text-xs text-slate-400">• {products.length} Active SKUs</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Product Mapping & Variant Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Map store variants to primary & backup factory suppliers (AliExpress, Alibaba, 1688) with auto-fallback routing.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="mapping-search-input"
            type="text"
            placeholder="Filter by product name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden w-56"
          />
          <select
            id="mapping-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Mapping List */}
      <div className="space-y-4">
        {filteredProducts.map((prod) => {
          const isExpanded = expandedProductId === prod.id;
          const targetStoreObjs = stores.filter((s) => prod.targetStores.includes(s.id));

          return (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Product Header Row */}
              <div
                onClick={() => setExpandedProductId(isExpanded ? null : prod.id)}
                className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={prod.images[0] || 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=200'}
                    alt={prod.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {prod.category}
                      </span>
                      {targetStoreObjs.map((s) => (
                        <span key={s.id} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {s.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-xl">{prod.title}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>Variants: <strong className="text-slate-800">{prod.variants.length}</strong></span>
                      <span>Primary Sourcing: <strong className="text-slate-800">{prod.primarySupplier.name} ({prod.primarySupplier.platform.toUpperCase()})</strong></span>
                      <span className="text-emerald-600 font-bold">Margin: {prod.profitMargin}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mapping Active (0 Unmapped)
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Mapping Table */}
              {isExpanded && (
                <div className="border-t border-slate-200 p-5 bg-slate-50/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Variant Sourcing & Route Assignment
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Assign primary and backup fulfillment partners for each variant option
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> AliExpress
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Alibaba
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span> 1688 Direct
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Store Variant Option</th>
                          <th className="py-2.5 px-3">Store SKU & Price</th>
                          <th className="py-2.5 px-3">Primary Supplier Mapping</th>
                          <th className="py-2.5 px-3">Landed Cost / Margin</th>
                          <th className="py-2.5 px-3">Backup Fallback Route</th>
                          <th className="py-2.5 px-3 text-right">Switch Sourcing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {prod.variants.map((v) => {
                          const profit = (v.storePrice - v.supplierCost - v.shippingCost).toFixed(2);
                          const margin = (((v.storePrice - v.supplierCost - v.shippingCost) / v.storePrice) * 100).toFixed(1);

                          return (
                            <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{v.name}</div>
                                <div className="text-[10px] text-slate-400">Stock: {v.stock} units</div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-mono text-slate-700 font-medium">{v.sku}</div>
                                <div className="font-bold text-slate-900">${v.storePrice.toFixed(2)}</div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white ${
                                      v.mappedSupplierId.includes('alibaba')
                                        ? 'bg-amber-500'
                                        : v.mappedSupplierId.includes('1688')
                                        ? 'bg-indigo-600'
                                        : 'bg-rose-500'
                                    }`}
                                  >
                                    {v.mappedSupplierId.includes('alibaba')
                                      ? 'ALIBABA'
                                      : v.mappedSupplierId.includes('1688')
                                      ? '1688 OEM'
                                      : 'ALIEXPRESS'}
                                  </span>
                                  <span className="font-mono text-slate-600 text-[11px]">{v.mappedSupplierSku}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Supplier stock: {v.supplierStock} units
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">
                                  ${(v.supplierCost + v.shippingCost).toFixed(2)} landed
                                </div>
                                <div className="text-[10px] text-emerald-600 font-bold">
                                  +${profit} ({margin}%)
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{v.backupSupplierSku || '1688-OEM-BACKUP'} (Active)</span>
                                </div>
                                <div className="text-[10px] text-slate-400">Routes on stock &lt; 10</div>
                              </td>

                              <td className="py-3 px-3 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    id={`switch-1688-${v.id}`}
                                    onClick={() => handleSwitchSupplier(prod.id, v.id, '1688', 6.4)}
                                    disabled={isSwitching}
                                    className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-bold rounded transition-colors"
                                    title="Route to 1688 factory ($6.40 cost)"
                                  >
                                    → 1688 ($6.40)
                                  </button>
                                  <button
                                    id={`switch-alibaba-${v.id}`}
                                    onClick={() => handleSwitchSupplier(prod.id, v.id, 'alibaba', 9.8)}
                                    disabled={isSwitching}
                                    className="px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-[10px] font-bold rounded transition-colors"
                                    title="Route to Alibaba verified ($9.80 cost)"
                                  >
                                    → Alibaba ($9.80)
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
