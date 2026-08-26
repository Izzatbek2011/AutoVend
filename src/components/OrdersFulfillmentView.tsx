import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Zap,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  Copy,
  MapPin,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';

export const OrdersFulfillmentView: React.FC = () => {
  const {
    orders,
    fulfillOrder,
    fulfillBulkOrders,
    syncTracking,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'awaiting_order' | 'processing' | 'shipped' | 'delivered'>('awaiting_order');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [activeOrderDetail, setActiveOrderDetail] = useState<Order | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.items.some((i) => i.productTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const awaitingOrders = orders.filter((o) => o.status === 'awaiting_order');

  const toggleSelectAll = () => {
    const currentAwaitingIds = filteredOrders.filter((o) => o.status === 'awaiting_order').map((o) => o.id);
    if (selectedOrderIds.length === currentAwaitingIds.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(currentAwaitingIds);
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkFulfill = async () => {
    const ids = selectedOrderIds.length > 0 ? selectedOrderIds : awaitingOrders.map((o) => o.id);
    if (ids.length === 0) {
      addToast({ title: 'No Orders', message: 'No orders awaiting fulfillment.', type: 'warning' });
      return;
    }

    setIsProcessingBulk(true);
    try {
      await fulfillBulkOrders(ids);
      setSelectedOrderIds([]);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied', message: `${label} copied to clipboard.`, type: 'info' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Bulk Fulfill Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Automated Fulfillment Center</span>
            <span className="text-xs text-slate-400">• DSERS 1-Click Multi-Order Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Orders & Supplier Auto-Dispatch
          </h2>
          <p className="text-xs text-slate-500">
            Automatically package customer shipping information, place batch orders with AliExpress/Alibaba/1688 suppliers, and sync live tracking back to stores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="orders-bulk-fulfill-btn"
            onClick={handleBulkFulfill}
            disabled={awaitingOrders.length === 0 || isProcessingBulk}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-white" />
            {isProcessingBulk ? 'Fulfilling Orders...' : `1-Click Auto Fulfill (${selectedOrderIds.length > 0 ? selectedOrderIds.length : awaitingOrders.length})`}
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            id="orders-tab-awaiting"
            onClick={() => setActiveTab('awaiting_order')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'awaiting_order'
                ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Awaiting Order
            {awaitingOrders.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                {awaitingOrders.length}
              </span>
            )}
          </button>

          <button
            id="orders-tab-processing"
            onClick={() => setActiveTab('processing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'processing'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            In Processing ({orders.filter((o) => o.status === 'processing').length})
          </button>

          <button
            id="orders-tab-shipped"
            onClick={() => setActiveTab('shipped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'shipped'
                ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Shipped ({orders.filter((o) => o.status === 'shipped').length})
          </button>

          <button
            id="orders-tab-delivered"
            onClick={() => setActiveTab('delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'delivered'
                ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered ({orders.filter((o) => o.status === 'delivered').length})
          </button>

          <button
            id="orders-tab-all"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="orders-search-input"
            type="text"
            placeholder="Search order #, customer, tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-hidden"
          />
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                {activeTab === 'awaiting_order' && (
                  <th className="py-3 px-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700">
                      {selectedOrderIds.length > 0 && selectedOrderIds.length === awaitingOrders.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                )}
                <th className="py-3 px-4">Order & Channel</th>
                <th className="py-3 px-4">Customer & Shipping Address</th>
                <th className="py-3 px-4">Products & Variants</th>
                <th className="py-3 px-4">Store Revenue / Profit</th>
                <th className="py-3 px-4">Supplier Routing & Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No orders matching criteria in this view.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id);
                  const firstItem = ord.items[0];

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      {activeTab === 'awaiting_order' && (
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleSelectOrder(ord.id)}
                            className="text-slate-400 hover:text-indigo-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ord.orderNumber}</div>
                        <div className="text-[10px] text-slate-500">{ord.storeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{ord.customer.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{ord.customer.city}, {ord.customer.state} ({ord.customer.country})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          <img
                            src={firstItem?.itemImage || 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=100'}
                            alt={firstItem?.productTitle}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                          <div className="truncate">
                            <div className="font-medium text-slate-900 truncate">{firstItem?.productTitle}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {firstItem?.variantName} × {firstItem?.quantity}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              SKU: {firstItem?.supplierSku}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">${ord.totalStoreAmount.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">
                          Cost: ${(ord.totalSupplierCost + ord.totalShippingCost).toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600">
                          +${ord.profitAmount.toFixed(2)} ({ord.profitMarginPct}%)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded text-white ${
                              ord?.supplierPlatform === 'alibaba'
                                ? 'bg-amber-500'
                                : ord?.supplierPlatform === '1688'
                                ? 'bg-indigo-600'
                                : 'bg-rose-500'
                            }`}
                          >
                            {(ord?.supplierPlatform || ord?.platform || 'ALIEXPRESS').toString().toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-600 truncate">{ord.supplierName}</span>
                        </div>

                        {ord.status === 'awaiting_order' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Awaiting Dispatch
                          </span>
                        )}
                        {ord.status === 'processing' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Supplier Order: {ord.supplierOrderId}
                          </span>
                        )}
                        {ord.status === 'shipped' && (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 block truncate">
                              Tracking: {ord.trackingNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{ord.shippingCarrier}</span>
                          </div>
                        )}
                        {ord.status === 'delivered' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Delivered ({ord.trackingNumber})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {ord.status === 'awaiting_order' && (
                            <button
                              id={`fulfill-btn-${ord.id}`}
                              onClick={() => fulfillOrder(ord.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3 fill-white" />
                              Auto-Order
                            </button>
                          )}

                          {ord.status === 'processing' && (
                            <button
                              id={`sync-tracking-btn-${ord.id}`}
                              onClick={() => syncTracking(ord.id)}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Fetch Tracking
                            </button>
                          )}

                          <button
                            id={`view-order-details-${ord.id}`}
                            onClick={() => setActiveOrderDetail(ord)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrderDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {activeOrderDetail.storeName}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Order Breakdown: {activeOrderDetail.orderNumber}
                </h3>
              </div>
              <button
                id="close-order-modal-btn"
                onClick={() => setActiveOrderDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" /> Customer Shipping Address
                </h4>
                <div className="text-slate-700 space-y-0.5">
                  <div className="font-semibold">{activeOrderDetail.customer.fullName} ({activeOrderDetail.customer.email})</div>
                  <div>{activeOrderDetail.customer.addressLine1}</div>
                  <div>{activeOrderDetail.customer.city}, {activeOrderDetail.customer.state} {activeOrderDetail.customer.postalCode}</div>
                  <div className="font-bold text-slate-900">{activeOrderDetail.customer.country}</div>
                  <div className="text-slate-500">Phone: {activeOrderDetail.customer.phone}</div>
                </div>
              </div>

              {/* Items in order */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Purchased Items & Supplier SKUs</h4>
                <div className="space-y-2">
                  {activeOrderDetail.items.map((it) => (
                    <div key={it.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.itemImage || 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=100'}
                          alt={it.productTitle}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{it.productTitle}</div>
                          <div className="text-[11px] text-slate-500">
                            {it.variantName} • Qty: {it.quantity}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Mapped SKU: {it.supplierSku}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">${(it.unitStorePrice * it.quantity).toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">
                          Supplier Cost: ${(it.unitSupplierCost * it.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logistics & Tracking info */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950">
                    Supplier Gateway: {(activeOrderDetail?.supplierPlatform || activeOrderDetail?.platform || 'ALIEXPRESS').toString().toUpperCase()}
                  </span>
                  <span className="font-mono text-slate-600">ID: {activeOrderDetail.supplierOrderId || 'Pending Placement'}</span>
                </div>
                {activeOrderDetail.trackingNumber && (
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Tracking Number ({activeOrderDetail.shippingCarrier})</span>
                      <span className="font-mono font-bold text-indigo-900">{activeOrderDetail.trackingNumber}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeOrderDetail.trackingNumber!, 'Tracking Number')}
                      className="px-2 py-1 bg-white border border-indigo-200 rounded text-[11px] text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveOrderDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
