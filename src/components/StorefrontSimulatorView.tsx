import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const StorefrontSimulatorView: React.FC = () => {
  const { products, stores, refreshData, setActiveTab, addToast } = useApp();

  const [selectedProduct, setSelectedProduct] = useState(products[0] || null);
  const [selectedVariant, setSelectedVariant] = useState(products[0]?.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [targetStoreId, setTargetStoreId] = useState(stores[0]?.id || 'store_shopify_01');

  // Customer Checkout Form
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@example.com');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('OR');
  const [postalCode, setPostalCode] = useState('97477');
  const [country, setCountry] = useState('United States');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  const handleProductSelect = (p: any) => {
    setSelectedProduct(p);
    setSelectedVariant(p.variants[0] || null);
  };

  const handleSimulatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedVariant) return;

    setIsSubmitting(true);
    try {
      const res = await api.simulateStorefrontCheckout({
        storeId: targetStoreId,
        customer: {
          fullName,
          email,
          addressLine1: address,
          city,
          state,
          postalCode,
          country,
          phone: '+1 (555) 234-5678',
        },
        items: [
          {
            productId: selectedProduct.id,
            variantId: selectedVariant.id,
            quantity,
          },
        ],
        shippingMethod: 'Express Air Line (10-14 days)',
      });

      await refreshData();
      setCompletedOrderNumber(res.order.orderNumber);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      addToast({
        title: 'Customer Purchase Simulated!',
        message: `Order ${res.order.orderNumber} successfully received and ingested into AutoVend pipeline.`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Simulation Error', message: 'Failed to complete test purchase.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              Live Storefront Simulator
            </span>
            <span className="text-xs text-slate-400">• End-to-End Purchase Flow Test</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Customer Checkout & Ingestion Sandbox
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Simulate a real customer purchasing on your storefront. Watch the order get instantly ingested, mapped to suppliers, and queued for 1-click fulfillment.
          </p>
        </div>

        {completedOrderNumber && (
          <button
            id="go-to-fulfilled-order-btn"
            onClick={() => setActiveTab('orders')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Zap className="w-4 h-4 fill-white" />
            Fulfill Test Order ({completedOrderNumber}) →
          </button>
        )}
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product & Variant Picker */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>1. Choose Product to Buy</span>
              <span className="text-xs text-slate-500 font-normal">{products.length} Products Available</span>
            </h3>

            {/* Product selection tiles */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {products.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleProductSelect(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=100'}
                      alt={p.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-bold text-emerald-600">${p.price.toFixed(2)}</span>
                        <span>• {p.variants.length} options</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Variant Option Selector */}
            {selectedProduct && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Select Variant</label>
                  <select
                    value={selectedVariant?.id}
                    onChange={(e) => {
                      const v = selectedProduct.variants.find((item) => item.id === e.target.value);
                      if (v) setSelectedVariant(v);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold outline-hidden"
                  >
                    {selectedProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — ${v.storePrice.toFixed(2)} ({v.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-md bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 rounded-md bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Mock Checkout Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              2. Simulated Customer Checkout
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter test shipping information and submit payment authorization
            </p>

            <form onSubmit={handleSimulatePurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State / Prov</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ZIP / Postal</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-hidden focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                  <span>${((selectedVariant?.storePrice || 0) * quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tracked Air Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Paid by Customer</span>
                  <span className="text-emerald-600">
                    ${((selectedVariant?.storePrice || 0) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                id="submit-simulated-checkout-btn"
                type="submit"
                disabled={isSubmitting || !selectedVariant}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {isSubmitting ? 'Simulating Instant Checkout...' : 'Simulate Customer Purchase Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
