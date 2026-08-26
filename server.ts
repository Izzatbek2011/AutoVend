import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  UserProfile,
  Store,
  Product,
  ImportQueueItem,
  PricingRule,
  Order,
  InventorySyncLog,
  AutomationRule,
  AnalyticsSummary,
  SystemNotification,
  SupplierInfo,
  ProductVariant,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// ----------------------------------------------------
// IN-MEMORY MOCK & PERSISTENT DATABASE ENGINE
// ----------------------------------------------------

let currentUser: UserProfile = {
  id: 'usr_autovend_001',
  name: 'Alex Vance',
  email: 'alex.vance@autovend-global.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  plan: 'Enterprise Multi-Store',
  storesCount: 4,
};

let stores: Store[] = [
  {
    id: 'store_shopify_01',
    name: 'TrendyNest Lifestyle US',
    platform: 'shopify',
    url: 'https://trendynest-official.myshopify.com',
    status: 'connected',
    currency: 'USD',
    totalProducts: 48,
    totalOrders: 342,
    revenue: 28450.0,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    apiKeyMasked: 'shpat_9f81a7••••••••••••',
    autoSyncInventory: true,
    autoFulfillOrders: true,
  },
  {
    id: 'store_woo_02',
    name: 'TechDirect EU Express',
    platform: 'woocommerce',
    url: 'https://techdirect-europe.de',
    status: 'connected',
    currency: 'EUR',
    totalProducts: 32,
    totalOrders: 189,
    revenue: 16920.0,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    apiKeyMasked: 'ck_7b9201••••••••••••',
    autoSyncInventory: true,
    autoFulfillOrders: false,
  },
  {
    id: 'store_tiktok_03',
    name: 'ViralGadgets TikTok Shop',
    platform: 'tiktok_shop',
    url: 'https://shop.tiktok.com/@viral_gadgets_daily',
    status: 'connected',
    currency: 'USD',
    totalProducts: 19,
    totalOrders: 620,
    revenue: 34180.0,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    apiKeyMasked: 'tts_app_9918••••••••••••',
    autoSyncInventory: true,
    autoFulfillOrders: true,
  },
  {
    id: 'store_ebay_04',
    name: 'AeroGlobal Outlet',
    platform: 'ebay',
    url: 'https://ebay.com/usr/aeroglobal_deals',
    status: 'connected',
    currency: 'USD',
    totalProducts: 24,
    totalOrders: 94,
    revenue: 7850.0,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    apiKeyMasked: 'eb_token_3342••••••••••••',
    autoSyncInventory: false,
    autoFulfillOrders: false,
  },
];

const mockSupplierAliExpress: SupplierInfo = {
  id: 'sup_ali_001',
  name: 'Shenzhen Apex Smart Technology Co.',
  platform: 'aliexpress',
  supplierUrl: 'https://aliexpress.com/store/91283019',
  rating: 4.89,
  reviewsCount: 3420,
  ordersFulfilled: 48900,
  onTimeDeliveryRate: 98.7,
  avgShippingDays: 8,
  warehouseLocation: 'Guangdong, CN (Fast Dispatch)',
  verificationBadge: 'AliExpress Top Brand & Verified Supplier',
  minOrderQuantity: 1,
  samplePrice: 12.5,
  shippingCarriers: [
    { name: 'AliExpress Standard Shipping', cost: 2.8, estimatedDays: '7-12 days', trackingAvailable: true },
    { name: 'YunExpress Direct Line', cost: 4.5, estimatedDays: '5-9 days', trackingAvailable: true },
    { name: 'DHL Express VIP', cost: 18.0, estimatedDays: '3-5 days', trackingAvailable: true },
  ],
};

const mockSupplierAlibaba: SupplierInfo = {
  id: 'sup_alibaba_002',
  name: 'Yiwu Huanuo Industrial & Trade Co., Ltd.',
  platform: 'alibaba',
  supplierUrl: 'https://huanuo.en.alibaba.com',
  rating: 4.94,
  reviewsCount: 1840,
  ordersFulfilled: 124000,
  onTimeDeliveryRate: 99.2,
  avgShippingDays: 10,
  warehouseLocation: 'Zhejiang & US West Coast Hub',
  verificationBadge: 'Alibaba Gold Verified Manufacturer (12 Yrs)',
  minOrderQuantity: 1,
  samplePrice: 9.8,
  tierPricing: [
    { minQty: 1, price: 9.8 },
    { minQty: 20, price: 7.9 },
    { minQty: 100, price: 6.2 },
  ],
  shippingCarriers: [
    { name: 'Alibaba Direct Air Packet', cost: 3.2, estimatedDays: '8-14 days', trackingAvailable: true },
    { name: 'FedEx Global Economy', cost: 12.5, estimatedDays: '4-7 days', trackingAvailable: true },
  ],
};

const mockSupplier1688: SupplierInfo = {
  id: 'sup_1688_003',
  name: 'Dongguan Jumei Electronics Factory (1688 OEM)',
  platform: '1688',
  supplierUrl: 'https://dongguanjumei.1688.com',
  rating: 4.78,
  reviewsCount: 4200,
  ordersFulfilled: 310000,
  onTimeDeliveryRate: 97.5,
  avgShippingDays: 9,
  warehouseLocation: 'Dongguan, CN (Direct Factory Line)',
  verificationBadge: '1688 Factory Direct Verified Super Factory',
  minOrderQuantity: 1,
  samplePrice: 6.4,
  tierPricing: [
    { minQty: 1, price: 6.4 },
    { minQty: 50, price: 4.8 },
  ],
  shippingCarriers: [
    { name: '4PX Special Line', cost: 3.9, estimatedDays: '7-11 days', trackingAvailable: true },
    { name: 'China Post ePacket', cost: 2.1, estimatedDays: '12-18 days', trackingAvailable: true },
  ],
};

let products: Product[] = [
  {
    id: 'prod_lumina_01',
    title: 'LuminaPulse™ MagCharge 3-in-1 Foldable Wireless Charging Station',
    originalTitle: 'Factory Hot Sale 15W 3 in 1 Magnetic Qi Wireless Charger Stand For iPhone 16 15 Pro Apple Watch AirPods',
    description: 'Declutter your nightstand and workstation with the aerospace-grade aluminum 3-in-1 fast charging station. Features dual MagSafe alignment coils, intelligent thermal throttling, and compact travel foldability.',
    aiOptimizedDescription: 'Engineered for high-performing desks and bedside minimalism. Powers your Smartphone (15W Fast Charge), Smartwatch, and Wireless Earbuds simultaneously with zero cable chaos. Built with aviation-grade alloy heat dissipation and surge protection.',
    category: 'Electronics & Tech',
    tags: ['MagSafe', 'Wireless Charger', 'Tech Essentials', 'Desk Setup', 'Travel Gadgets'],
    images: [
      'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    ],
    primarySupplier: mockSupplierAliExpress,
    alternateSuppliers: [mockSupplierAlibaba, mockSupplier1688],
    variants: [
      {
        id: 'var_lum_01',
        sku: 'LUM-MAG-BLK',
        name: 'Space Black / 15W Qi2 MagSafe',
        options: { Color: 'Space Black', Spec: '15W Qi2' },
        supplierCost: 12.5,
        shippingCost: 2.8,
        suggestedPrice: 44.99,
        storePrice: 44.99,
        stock: 380,
        supplierStock: 1450,
        mappedSupplierId: 'sup_ali_001',
        mappedSupplierSku: 'ALI-LP31-BLK',
        backupSupplierId: 'sup_alibaba_002',
        backupSupplierSku: 'ALIB-LP-01B',
        image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400&auto=format&fit=crop&q=80',
        weightGrams: 280,
      },
      {
        id: 'var_lum_02',
        sku: 'LUM-MAG-SLV',
        name: 'Titanium Silver / 15W Qi2 MagSafe',
        options: { Color: 'Titanium Silver', Spec: '15W Qi2' },
        supplierCost: 12.5,
        shippingCost: 2.8,
        suggestedPrice: 44.99,
        storePrice: 44.99,
        stock: 210,
        supplierStock: 920,
        mappedSupplierId: 'sup_ali_001',
        mappedSupplierSku: 'ALI-LP31-SLV',
        backupSupplierId: 'sup_alibaba_002',
        backupSupplierSku: 'ALIB-LP-01S',
        image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=400&auto=format&fit=crop&q=80',
        weightGrams: 280,
      },
      {
        id: 'var_lum_03',
        sku: 'LUM-MAG-WHT',
        name: 'Glacier White / 15W Qi2 MagSafe',
        options: { Color: 'Glacier White', Spec: '15W Qi2' },
        supplierCost: 12.5,
        shippingCost: 2.8,
        suggestedPrice: 44.99,
        storePrice: 44.99,
        stock: 95,
        supplierStock: 640,
        mappedSupplierId: 'sup_ali_001',
        mappedSupplierSku: 'ALI-LP31-WHT',
        backupSupplierId: 'sup_1688_003',
        backupSupplierSku: '1688-LP-W',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&auto=format&fit=crop&q=80',
        weightGrams: 280,
      },
    ],
    targetStores: ['store_shopify_01', 'store_tiktok_03'],
    status: 'published',
    profitMargin: 66.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    syncStatus: 'synced',
    aiInsights: {
      viralScore: 94,
      recommendedMarkup: 2.94,
      targetAudience: 'Remote workers, tech enthusiasts, Apple/Android ecosystem users aged 22-45',
      keySellingPoints: [
        'Charges 3 devices on 1 sleek footprint',
        'Folds down to passport size for travel',
        'Official 15W Qi2 fast magnetic alignment',
        'Overheating protection with brushed aluminum housing',
      ],
      suggestedTags: ['#DeskSetup', '#TechTok', '#AppleAccessories', '#TravelEssential', '#MinimalistDesk'],
      adHooks: [
        '"If your nightstand looks like a bird nest of cables, watch this..."',
        '"The only travel charger you need for your entire tech bag."',
        '"Why pay $120 for branded stands when this 3-in-1 does Qi2 fast charging?"',
      ],
    },
  },
  {
    id: 'prod_therma_02',
    title: 'ThermaGrip™ Smart Temperature-Controlled Stainless Travel Tumbler',
    originalTitle: 'Smart LED Temperature Display Vacuum Insulated Water Bottle 500ml 304 Stainless Steel Coffee Mug',
    description: 'Double-walled vacuum insulated flask with integrated touch OLED display in the lid showing liquid temperature in real-time. Keeps beverages boiling hot for 12 hours or ice cold for 24 hours.',
    aiOptimizedDescription: 'Never burn your tongue on hot coffee again. The ThermaGrip OLED lid measures drink temperatures instantly with military-grade probe accuracy. Leakproof, condensation-free, and crafted from 304 food-grade stainless steel.',
    category: 'Home & Kitchen',
    tags: ['Smart Mug', 'Coffee Accessories', 'Tumbler', 'Hydro Lifestyle', 'Work From Home'],
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    ],
    primarySupplier: mockSupplierAlibaba,
    alternateSuppliers: [mockSupplierAliExpress, mockSupplier1688],
    variants: [
      {
        id: 'var_thm_01',
        sku: 'THM-500-MATTE',
        name: 'Matte Obsidian / 500ml',
        options: { Color: 'Matte Obsidian', Capacity: '500ml' },
        supplierCost: 7.2,
        shippingCost: 3.1,
        suggestedPrice: 29.99,
        storePrice: 29.99,
        stock: 450,
        supplierStock: 3200,
        mappedSupplierId: 'sup_alibaba_002',
        mappedSupplierSku: 'ALIB-TM-BLK',
        backupSupplierId: 'sup_1688_003',
        backupSupplierSku: '1688-TM-01',
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=80',
        weightGrams: 360,
      },
      {
        id: 'var_thm_02',
        sku: 'THM-500-ROSE',
        name: 'Nordic Rose / 500ml',
        options: { Color: 'Nordic Rose', Capacity: '500ml' },
        supplierCost: 7.2,
        shippingCost: 3.1,
        suggestedPrice: 29.99,
        storePrice: 29.99,
        stock: 310,
        supplierStock: 1800,
        mappedSupplierId: 'sup_alibaba_002',
        mappedSupplierSku: 'ALIB-TM-ROSE',
        backupSupplierId: 'sup_ali_001',
        backupSupplierSku: 'ALI-TM-RSE',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
        weightGrams: 360,
      },
    ],
    targetStores: ['store_shopify_01', 'store_woo_02'],
    status: 'published',
    profitMargin: 65.6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    syncStatus: 'synced',
    aiInsights: {
      viralScore: 88,
      recommendedMarkup: 2.91,
      targetAudience: 'Commuters, fitness enthusiasts, students, and specialty coffee lovers',
      keySellingPoints: [
        'Live OLED temperature readout at a tap',
        '24h ice cold / 12h boiling hot insulation',
        '100% leakproof vacuum seal design',
        'BPA-free medical grade stainless steel interior',
      ],
      suggestedTags: ['#CoffeeLovers', '#DailyCarry', '#SmartBottle', '#HydrationGoals'],
      adHooks: [
        '"Stop guessing if your tea is too hot to drink..."',
        '"The $30 smart flask that out-performs $100 Yeti cups."',
      ],
    },
  },
  {
    id: 'prod_aero_03',
    title: 'AeroPosture™ Ergonomic Inflatable Lumbar Support Pillow',
    originalTitle: 'Adjustable Air Inflation Lumbar Cushion Memory Foam Back Support for Office Chair Car Seat',
    description: 'Dynamic pump-action inflatable lumbar spine curve aligner designed for gaming chairs, home office seating, and long flight journeys.',
    aiOptimizedDescription: 'Transform any standard chair into an ergonomic spine-aligning powerhouse. Built with dual-chamber micro-air pressure tuning to relieve lower back tension, herniated disc stress, and poor posture.',
    category: 'Health & Wellness',
    tags: ['Ergonomics', 'Back Pain Relief', 'Office Setup', 'Health', 'Travel Cushion'],
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    ],
    primarySupplier: mockSupplier1688,
    alternateSuppliers: [mockSupplierAliExpress, mockSupplierAlibaba],
    variants: [
      {
        id: 'var_aero_01',
        sku: 'AERO-LUMB-GRY',
        name: 'Graphite Mesh / Standard Ergonomic',
        options: { Color: 'Graphite Mesh', Size: 'Standard' },
        supplierCost: 5.4,
        shippingCost: 2.9,
        suggestedPrice: 24.95,
        storePrice: 24.95,
        stock: 580,
        supplierStock: 4800,
        mappedSupplierId: 'sup_1688_003',
        mappedSupplierSku: '1688-AR-GRY',
        backupSupplierId: 'sup_ali_001',
        backupSupplierSku: 'ALI-AR-GRY',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
        weightGrams: 310,
      },
    ],
    targetStores: ['store_tiktok_03', 'store_ebay_04'],
    status: 'published',
    profitMargin: 66.7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    syncStatus: 'synced',
    aiInsights: {
      viralScore: 91,
      recommendedMarkup: 3.0,
      targetAudience: 'Desk workers, truck drivers, coders, gamers sitting 8+ hours a day',
      keySellingPoints: [
        'Built-in pneumatic micro-pump for instant firmness adjustment',
        'Breathable 3D honeycomb air mesh',
        'Universal strap fits all car and office chairs',
      ],
      suggestedTags: ['#BackPainRelief', '#Ergonomics', '#OfficeHacks', '#GamerHealth'],
      adHooks: ['"If your lower back aches after 2 hours at your desk, you need this 10-second fix."'],
    },
  },
];

let importQueue: ImportQueueItem[] = [
  {
    id: 'imp_9841',
    sourceUrl: 'https://aliexpress.com/item/10050068192831.html',
    sourcePlatform: 'aliexpress',
    rawTitle: 'RGB Sunset Projection Lamp Robot Astronaut Atmosphere Night Light Room Decor TikTok Hot',
    optimizedTitle: 'Astronaut Aura™ 360° Magnetic Head RGB Sunset Projection Ambient Lamp',
    description: 'Multifunctional galaxy & sunset projector robot with magnetic detachable head, remote control color gradients, and TikTok viral room aesthetics.',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
    ],
    priceRange: { min: 8.5, max: 11.2 },
    supplierName: 'Guangzhou Lightstar Technology',
    supplierRating: 4.88,
    supplierLocation: 'Guangdong, China',
    variants: [
      {
        id: 'var_imp_01',
        sku: 'ASTRO-SUN-WHT',
        name: 'Lunar White / Sunset Red RGB',
        options: { Color: 'Lunar White', Mode: 'Sunset Red' },
        supplierCost: 8.5,
        shippingCost: 3.2,
        suggestedPrice: 32.99,
        storePrice: 32.99,
        stock: 500,
        supplierStock: 2400,
        mappedSupplierId: 'sup_ali_001',
        mappedSupplierSku: 'ALI-ASTRO-WHT',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'var_imp_02',
        sku: 'ASTRO-GAL-BLK',
        name: 'Deep Space Black / 16-Color RGB Remote',
        options: { Color: 'Deep Space Black', Mode: '16-Color RGB' },
        supplierCost: 9.8,
        shippingCost: 3.2,
        suggestedPrice: 36.99,
        storePrice: 36.99,
        stock: 450,
        supplierStock: 1900,
        mappedSupplierId: 'sup_ali_001',
        mappedSupplierSku: 'ALI-ASTRO-BLK',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&auto=format&fit=crop&q=80',
      },
    ],
    status: 'ready',
    aiEnhanced: true,
    addedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'imp_9842',
    sourceUrl: 'https://1688.com/offer/71829102918.html',
    sourcePlatform: '1688',
    rawTitle: 'Portable Electric Fruit Juicer Blender USB Rechargeable Wireless Smoothie Maker Bottle',
    optimizedTitle: 'PulseBlend™ Go 6-Blade High-Speed Wireless Smoothie & Protein Blender (500ml)',
    description: 'High-torque waterproof bullet blender with waterproof silicone seal, USB-C magnetic fast charging, and titanium-reinforced 6-blade ice crusher.',
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    ],
    priceRange: { min: 6.8, max: 7.9 },
    supplierName: 'Yongkang Jinyi Electric Appliance Factory',
    supplierRating: 4.82,
    supplierLocation: 'Zhejiang, China',
    variants: [
      {
        id: 'var_imp_03',
        sku: 'PULSE-BLD-MNT',
        name: 'Mint Aqua / 500ml',
        options: { Color: 'Mint Aqua', Size: '500ml' },
        supplierCost: 6.8,
        shippingCost: 3.5,
        suggestedPrice: 28.95,
        storePrice: 28.95,
        stock: 350,
        supplierStock: 4200,
        mappedSupplierId: 'sup_1688_003',
        mappedSupplierSku: '1688-PB-MNT',
      },
    ],
    status: 'ready',
    aiEnhanced: true,
    addedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
];

let pricingRules: PricingRule[] = [
  {
    id: 'rule_tiered_default',
    name: 'Smart Dynamic Tiered Markup (Recommended)',
    targetCategory: 'All',
    ruleType: 'tiered',
    tieredRules: [
      { minCost: 0, maxCost: 10, multiplier: 3.5, fixedAdd: 0 },
      { minCost: 10.01, maxCost: 25, multiplier: 2.8, fixedAdd: 0 },
      { minCost: 25.01, maxCost: 60, multiplier: 2.3, fixedAdd: 0 },
      { minCost: 60.01, maxCost: 9999, multiplier: 1.9, fixedAdd: 0 },
    ],
    includeShippingInCost: true,
    centsEnding: '.99',
    autoRepriceOnSupplierChange: true,
    isActive: true,
  },
  {
    id: 'rule_multiplier_electronics',
    name: 'Electronics Fast Turnover (2.5x Cost)',
    targetCategory: 'Electronics & Tech',
    ruleType: 'multiplier',
    multiplierValue: 2.5,
    includeShippingInCost: true,
    centsEnding: '.99',
    autoRepriceOnSupplierChange: true,
    isActive: false,
  },
  {
    id: 'rule_fixed_premium',
    name: 'High Margin Fixed Boost (+$19.95)',
    targetCategory: 'Health & Wellness',
    ruleType: 'fixed_markup',
    fixedMarkupValue: 19.95,
    includeShippingInCost: false,
    centsEnding: '.95',
    autoRepriceOnSupplierChange: false,
    isActive: false,
  },
];

let orders: Order[] = [
  {
    id: 'ord_98410',
    orderNumber: '#AV-98410',
    storeId: 'store_shopify_01',
    storeName: 'TrendyNest Lifestyle US',
    storePlatform: 'shopify',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    customer: {
      fullName: 'David Miller',
      addressLine1: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'United States',
      phone: '+1 (512) 892-1049',
      email: 'david.miller@austintech.io',
    },
    items: [
      {
        id: 'oi_01',
        productId: 'prod_lumina_01',
        productTitle: 'LuminaPulse™ MagCharge 3-in-1 Foldable Wireless Charging Station',
        variantId: 'var_lum_01',
        variantName: 'Space Black / 15W Qi2 MagSafe',
        sku: 'LUM-MAG-BLK',
        quantity: 1,
        storeUnitPrice: 44.99,
        supplierCost: 12.5,
        shippingCost: 2.8,
        itemImage: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=200&auto=format&fit=crop&q=80',
        supplierId: 'sup_ali_001',
        supplierPlatform: 'aliexpress',
        supplierSku: 'ALI-LP31-BLK',
      },
    ],
    totalStoreAmount: 44.99,
    totalCostAmount: 15.3,
    profitAmount: 29.69,
    profitMarginPct: 66.0,
    status: 'awaiting_order',
    shippingMethod: 'YunExpress Direct Line (7-9 Days)',
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isAutoFulfilled: false,
  },
  {
    id: 'ord_98409',
    orderNumber: '#AV-98409',
    storeId: 'store_tiktok_03',
    storeName: 'ViralGadgets TikTok Shop',
    storePlatform: 'tiktok_shop',
    createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    customer: {
      fullName: 'Emma Watson-Smith',
      addressLine1: '1428 Elm Street, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
      phone: '+1 (206) 431-9022',
      email: 'emma.creative@gmail.com',
    },
    items: [
      {
        id: 'oi_02',
        productId: 'prod_lumina_01',
        productTitle: 'LuminaPulse™ MagCharge 3-in-1 Foldable Wireless Charging Station',
        variantId: 'var_lum_02',
        variantName: 'Titanium Silver / 15W Qi2 MagSafe',
        sku: 'LUM-MAG-SLV',
        quantity: 2,
        storeUnitPrice: 44.99,
        supplierCost: 12.5,
        shippingCost: 2.8,
        itemImage: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=200&auto=format&fit=crop&q=80',
        supplierId: 'sup_ali_001',
        supplierPlatform: 'aliexpress',
        supplierSku: 'ALI-LP31-SLV',
      },
    ],
    totalStoreAmount: 89.98,
    totalCostAmount: 30.6,
    profitAmount: 59.38,
    profitMarginPct: 66.0,
    status: 'processing',
    shippingMethod: 'AliExpress Standard Shipping',
    supplierOrderId: 'ALI-ORD-991823019',
    supplierOrderStatus: 'placed',
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isAutoFulfilled: true,
  },
  {
    id: 'ord_98408',
    orderNumber: '#AV-98408',
    storeId: 'store_woo_02',
    storeName: 'TechDirect EU Express',
    storePlatform: 'woocommerce',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    customer: {
      fullName: 'Lucas Weber',
      addressLine1: 'Friedrichstraße 44',
      city: 'Berlin',
      state: 'BE',
      postalCode: '10117',
      country: 'Germany',
      phone: '+49 152 9840192',
      email: 'lucas.weber@berlin-design.de',
    },
    items: [
      {
        id: 'oi_03',
        productId: 'prod_therma_02',
        productTitle: 'ThermaGrip™ Smart Temperature-Controlled Stainless Travel Tumbler',
        variantId: 'var_thm_01',
        variantName: 'Matte Obsidian / 500ml',
        sku: 'THM-500-MATTE',
        quantity: 1,
        storeUnitPrice: 29.99,
        supplierCost: 7.2,
        shippingCost: 3.1,
        itemImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200&auto=format&fit=crop&q=80',
        supplierId: 'sup_alibaba_002',
        supplierPlatform: 'alibaba',
        supplierSku: 'ALIB-TM-BLK',
      },
    ],
    totalStoreAmount: 29.99,
    totalCostAmount: 10.3,
    profitAmount: 19.69,
    profitMarginPct: 65.6,
    status: 'shipped',
    shippingMethod: 'YunExpress European Packet (6-9 Days)',
    supplierOrderId: 'ALIB-ORD-881920194',
    supplierOrderStatus: 'dispatched',
    trackingNumber: 'YT2408920194829DE',
    carrier: 'YunExpress / DHL Paket',
    trackingCheckpoints: [
      { timestamp: '2026-08-25 14:20', location: 'Frankfurt Hub, DE', status: 'Customs Cleared', details: 'Passed import customs inspection' },
      { timestamp: '2026-08-24 09:10', location: 'Shenzhen Airport, CN', status: 'Departed Facility', details: 'Flight departed to Frankfurt' },
      { timestamp: '2026-08-23 18:45', location: 'Dongguan Sort Center', status: 'In Transit', details: 'Package picked up by carrier' },
    ],
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isAutoFulfilled: true,
  },
  {
    id: 'ord_98407',
    orderNumber: '#AV-98407',
    storeId: 'store_shopify_01',
    storeName: 'TrendyNest Lifestyle US',
    storePlatform: 'shopify',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    customer: {
      fullName: 'Sarah Jenkins',
      addressLine1: '400 North Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60611',
      country: 'United States',
      phone: '+1 (312) 555-0199',
      email: 'sjenkins@chicago.edu',
    },
    items: [
      {
        id: 'oi_04',
        productId: 'prod_aero_03',
        productTitle: 'AeroPosture™ Ergonomic Inflatable Lumbar Support Pillow',
        variantId: 'var_aero_01',
        variantName: 'Graphite Mesh / Standard Ergonomic',
        sku: 'AERO-LUMB-GRY',
        quantity: 1,
        storeUnitPrice: 24.95,
        supplierCost: 5.4,
        shippingCost: 2.9,
        itemImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80',
        supplierId: 'sup_1688_003',
        supplierPlatform: '1688',
        supplierSku: '1688-AR-GRY',
      },
    ],
    totalStoreAmount: 24.95,
    totalCostAmount: 8.3,
    profitAmount: 16.65,
    profitMarginPct: 66.7,
    status: 'delivered',
    shippingMethod: '4PX Special Line US (7 Days)',
    supplierOrderId: '1688-ORD-77102941',
    supplierOrderStatus: 'delivered',
    trackingNumber: '4PX300921098492US',
    carrier: '4PX / USPS',
    trackingCheckpoints: [
      { timestamp: '2026-08-25 11:32', location: 'Chicago, IL 60611', status: 'Delivered', details: 'Left in porch mailbox - signed' },
      { timestamp: '2026-08-25 07:15', location: 'Chicago Post Hub', status: 'Out for Delivery', details: 'Loaded on delivery truck' },
      { timestamp: '2026-08-23 20:00', location: 'JFK Airport, NY', status: 'Arrived US Gate', details: 'Handed to local delivery partner' },
    ],
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isAutoFulfilled: true,
  },
];

let syncLogs: InventorySyncLog[] = [
  {
    id: 'log_01',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    productId: 'prod_lumina_01',
    productTitle: 'LuminaPulse™ MagCharge 3-in-1',
    variantSku: 'LUM-MAG-BLK',
    supplierPlatform: 'aliexpress',
    changeType: 'stock_change',
    previousValue: '1,490 units',
    newValue: '1,450 units',
    actionTaken: 'Store inventory adjusted safely (threshold healthy)',
    storeUpdated: true,
  },
  {
    id: 'log_02',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    productId: 'prod_therma_02',
    productTitle: 'ThermaGrip™ Smart Tumbler',
    variantSku: 'THM-500-MATTE',
    supplierPlatform: 'alibaba',
    changeType: 'price_change',
    previousValue: '$7.40',
    newValue: '$7.20',
    actionTaken: 'Repricer recalculated profit margin: +2.1% net gain',
    storeUpdated: true,
  },
  {
    id: 'log_03',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    productId: 'prod_aero_03',
    productTitle: 'AeroPosture™ Ergonomic Pillow',
    variantSku: 'AERO-LUMB-GRY',
    supplierPlatform: '1688',
    changeType: 'stock_change',
    previousValue: '5,100 units',
    newValue: '4,800 units',
    actionTaken: 'Synced verified factory batches',
    storeUpdated: true,
  },
];

let automationRules: AutomationRule[] = [
  {
    id: 'auto_rule_01',
    name: 'Stockout Shield & Instant Supplier Fallback',
    description: 'When primary AliExpress supplier inventory drops below 10 units, instantly route fulfillment to secondary Alibaba/1688 factory.',
    trigger: 'supplier_out_of_stock',
    conditionOperator: '<',
    conditionValue: 10,
    action: 'switch_to_backup_supplier',
    isEnabled: true,
    timesTriggered: 14,
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'auto_rule_02',
    name: 'Dynamic Cost Increase Margin Guard',
    description: 'If supplier raises item cost by >10%, automatically recalculate and push revised retail price to connected Shopify & TikTok stores.',
    trigger: 'supplier_price_increase',
    conditionOperator: '>',
    conditionValue: 10,
    action: 'auto_adjust_store_price',
    isEnabled: true,
    timesTriggered: 29,
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'auto_rule_03',
    name: '1-Click Auto-Fulfill New Store Orders',
    description: 'When a verified paid order arrives on Shopify/TikTok Shop, automatically package checkout payload and dispatch to supplier.',
    trigger: 'new_order_received',
    action: 'auto_place_supplier_order',
    isEnabled: true,
    timesTriggered: 480,
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
  },
  {
    id: 'auto_rule_04',
    name: 'Carrier Tracking Instant Sync & Customer Push',
    description: 'When supplier generates carrier tracking (YunExpress/DHL/4PX), immediately push tracking to store and trigger email/SMS update.',
    trigger: 'tracking_number_generated',
    action: 'sync_tracking_to_store_and_email',
    isEnabled: true,
    timesTriggered: 512,
    lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

let notifications: SystemNotification[] = [
  {
    id: 'notif_01',
    title: 'New Customer Order #AV-98410 Received',
    message: 'David Miller ordered 1x LuminaPulse™ 3-in-1 on Shopify ($44.99). Ready for 1-click fulfillment.',
    type: 'order',
    severity: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    read: false,
    actionUrl: '/orders',
  },
  {
    id: 'notif_02',
    title: 'Supplier Price Drop Advantage (1688 OEM)',
    message: '1688 factory dropped unit cost on PulseBlend™ Go from $7.20 to $6.80. Estimated store margin: 68.2%.',
    type: 'price',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
    actionUrl: '/pricing-rules',
  },
  {
    id: 'notif_03',
    title: 'Inventory Sync Completed Across 4 Stores',
    message: 'Live stock audit verified 103 variants across AliExpress, Alibaba, and 1688 with 0 stockouts.',
    type: 'inventory',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    actionUrl: '/inventory-sync',
  },
  {
    id: 'notif_04',
    title: 'AI Business Analyst: High-Margin Upsell Found',
    message: 'LuminaPulse MagCharge conversion velocity is up 34% this week. Consider bundling with Fast-Charge Car Adapter.',
    type: 'ai',
    severity: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    read: false,
    actionUrl: '/ai-analyst',
  },
];

// ----------------------------------------------------
// SERVER STARTUP & API ROUTES
// ----------------------------------------------------

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AutoVend 2.0 Engine',
      version: '2.4.0-enterprise',
      uptime: process.uptime(),
      storesConnected: stores.length,
      geminiConnected: !!ai,
    });
  });

  // --------------------------------------------------
  // AUTH & USER ENDPOINTS
  // --------------------------------------------------
  app.get('/api/user', (req, res) => {
    res.json(currentUser);
  });

  app.put('/api/user', (req, res) => {
    currentUser = { ...currentUser, ...req.body };
    res.json(currentUser);
  });

  // --------------------------------------------------
  // STORE MANAGEMENT ENDPOINTS
  // --------------------------------------------------
  app.get('/api/stores', (req, res) => {
    res.json(stores);
  });

  app.post('/api/stores', (req, res) => {
    const { name, platform, url, currency, apiKeyMasked, autoSyncInventory, autoFulfillOrders } = req.body;
    const newStore: Store = {
      id: `store_${platform}_${Date.now()}`,
      name: name || 'New Connected Store',
      platform: platform || 'shopify',
      url: url || 'https://my-store.myshopify.com',
      status: 'connected',
      currency: currency || 'USD',
      totalProducts: 0,
      totalOrders: 0,
      revenue: 0,
      lastSyncAt: new Date().toISOString(),
      apiKeyMasked: apiKeyMasked || 'key_' + Math.random().toString(36).substring(2, 8) + '••••••••',
      autoSyncInventory: autoSyncInventory ?? true,
      autoFulfillOrders: autoFulfillOrders ?? true,
    };
    stores.push(newStore);
    currentUser.storesCount = stores.length;

    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: `Store Connected: ${newStore.name}`,
      message: `Successfully linked ${newStore.platform.toUpperCase()} sales channel and verified webhook listeners.`,
      type: 'system',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    res.status(201).json(newStore);
  });

  app.delete('/api/stores/:id', (req, res) => {
    const { id } = req.params;
    stores = stores.filter((s) => s.id !== id);
    currentUser.storesCount = stores.length;
    res.json({ success: true, remainingStores: stores.length });
  });

  app.post('/api/stores/:id/sync', (req, res) => {
    const { id } = req.params;
    const store = stores.find((s) => s.id === id);
    if (!store) return res.status(404).json({ error: 'Store not found' });

    store.lastSyncAt = new Date().toISOString();
    store.status = 'connected';
    res.json({ success: true, store });
  });

  // --------------------------------------------------
  // PRODUCTS & MAPPING ENDPOINTS
  // --------------------------------------------------
  app.get('/api/products', (req, res) => {
    const { storeId, search, category } = req.query;
    let filtered = [...products];

    if (storeId && typeof storeId === 'string' && storeId !== 'all') {
      filtered = filtered.filter((p) => p.targetStores.includes(storeId));
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(q))
      );
    }
    if (category && typeof category === 'string' && category !== 'All') {
      filtered = filtered.filter((p) => p.category === category);
    }

    res.json(filtered);
  });

  app.get('/api/products/:id', (req, res) => {
    const prod = products.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  });

  app.post('/api/products', (req, res) => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
      ...req.body,
    };
    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    products[index] = {
      ...products[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json(products[index]);
  });

  app.delete('/api/products/:id', (req, res) => {
    products = products.filter((p) => p.id !== req.params.id);
    res.json({ success: true });
  });

  app.post('/api/products/:id/push', (req, res) => {
    const { targetStoreIds } = req.body;
    const prod = products.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    prod.targetStores = Array.from(new Set([...prod.targetStores, ...(targetStoreIds || [])]));
    prod.status = 'published';
    prod.updatedAt = new Date().toISOString();

    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Product Published to Store',
      message: `"${prod.title.substring(0, 45)}..." pushed to ${targetStoreIds?.length || 1} store(s) with full variant mapping.`,
      type: 'system',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    res.json({ success: true, product: prod });
  });

  // --------------------------------------------------
  // MULTI-SUPPLIER IMPORT & COMPARISON ENDPOINTS
  // --------------------------------------------------
  app.get('/api/import/queue', (req, res) => {
    res.json(importQueue);
  });

  app.post('/api/import/url', (req, res) => {
    const { url, platform } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Derive or detect platform
    let detectedPlatform: 'aliexpress' | 'alibaba' | '1688' | 'cjdropshipping' = platform || 'aliexpress';
    if (url.includes('alibaba.com')) detectedPlatform = 'alibaba';
    if (url.includes('1688.com')) detectedPlatform = '1688';
    if (url.includes('aliexpress.com')) detectedPlatform = 'aliexpress';

    // Mock realistic scrape simulation from supplier platform
    const itemNumber = Math.floor(100000 + Math.random() * 900000);
    const newItem: ImportQueueItem = {
      id: `imp_${Date.now()}`,
      sourceUrl: url,
      sourcePlatform: detectedPlatform,
      rawTitle: `Hot Selling New Model Multi-Function Item High Quality Factory Direct Wholesale SKU-${itemNumber}`,
      optimizedTitle: `AutoVend Pro Series™ Ultra-Precision Smart Device [Model AV-${itemNumber}]`,
      description: 'Factory-verified multi-supplier dropship product with high conversion velocity, optimized for fast air shipping and zero MOQ.',
      images: [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      ],
      priceRange: { min: 8.4, max: 14.2 },
      supplierName: `${detectedPlatform.toUpperCase()} Premium Verified Partner #${itemNumber}`,
      supplierRating: 4.86,
      supplierLocation: 'Guangdong & Zhejiang Hubs',
      variants: [
        {
          id: `var_new_${Date.now()}_1`,
          sku: `SKU-${itemNumber}-BLK`,
          name: 'Midnight Edition / Pro Spec',
          options: { Color: 'Midnight', Spec: 'Pro' },
          supplierCost: 8.4,
          shippingCost: 3.1,
          suggestedPrice: 32.99,
          storePrice: 32.99,
          stock: 650,
          supplierStock: 3200,
          mappedSupplierId: 'sup_ali_001',
          mappedSupplierSku: `SUP-SKU-${itemNumber}-B`,
        },
        {
          id: `var_new_${Date.now()}_2`,
          sku: `SKU-${itemNumber}-SLV`,
          name: 'Chrome Silver / Pro Spec',
          options: { Color: 'Chrome Silver', Spec: 'Pro' },
          supplierCost: 8.4,
          shippingCost: 3.1,
          suggestedPrice: 32.99,
          storePrice: 32.99,
          stock: 420,
          supplierStock: 2100,
          mappedSupplierId: 'sup_ali_001',
          mappedSupplierSku: `SUP-SKU-${itemNumber}-S`,
        },
      ],
      status: 'ready',
      aiEnhanced: false,
      addedAt: new Date().toISOString(),
    };

    importQueue.unshift(newItem);
    res.status(201).json(newItem);
  });

  app.delete('/api/import/:id', (req, res) => {
    importQueue = importQueue.filter((i) => i.id !== req.params.id);
    res.json({ success: true });
  });

  app.post('/api/import/batch-push', (req, res) => {
    const { itemIds, targetStoreIds } = req.body;
    const itemsToPush = importQueue.filter((i) => itemIds?.includes(i.id));

    itemsToPush.forEach((item) => {
      const prod: Product = {
        id: `prod_imp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: item.optimizedTitle,
        originalTitle: item.rawTitle,
        description: item.description,
        category: 'Imported Products',
        tags: ['AutoVend Import', item.sourcePlatform],
        images: item.images,
        primarySupplier: item.sourcePlatform === 'alibaba' ? mockSupplierAlibaba : item.sourcePlatform === '1688' ? mockSupplier1688 : mockSupplierAliExpress,
        alternateSuppliers: [mockSupplierAliExpress, mockSupplierAlibaba, mockSupplier1688],
        variants: item.variants,
        targetStores: targetStoreIds || [stores[0]?.id || 'store_shopify_01'],
        status: 'published',
        profitMargin: 64.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      };
      products.unshift(prod);
    });

    importQueue = importQueue.filter((i) => !itemIds?.includes(i.id));
    res.json({ success: true, count: itemsToPush.length });
  });

  // Multi-supplier comparison tool endpoint
  app.get('/api/suppliers/compare', (req, res) => {
    const { keyword } = req.query;
    const searchKey = (typeof keyword === 'string' && keyword) ? keyword : 'Wireless Charger 3-in-1';

    const comparisonData = [
      {
        platform: 'aliexpress' as const,
        supplierName: 'Shenzhen Apex Smart Technology Co.',
        rating: 4.89,
        ordersFulfilled: 48900,
        unitCost: 12.5,
        shippingCarrier: 'AliExpress Standard / YunExpress',
        shippingCost: 2.8,
        totalLandedCost: 15.3,
        estimatedDeliveryDays: '7-11 days',
        moq: 1,
        returnWindowDays: 15,
        defectRate: '0.4%',
        dispatchTime: '24 Hours',
        pros: ['No minimum order quantity', '1-Click API integration', 'Fast tracking numbers'],
        cons: ['Slightly higher unit cost on bulk'],
        recommended: false,
      },
      {
        platform: 'alibaba' as const,
        supplierName: 'Yiwu Huanuo Industrial & Trade Co., Ltd.',
        rating: 4.94,
        ordersFulfilled: 124000,
        unitCost: 9.8,
        shippingCarrier: 'Alibaba Direct Air Packet',
        shippingCost: 3.2,
        totalLandedCost: 13.0,
        estimatedDeliveryDays: '8-14 days',
        moq: 1,
        returnWindowDays: 30,
        defectRate: '0.2%',
        dispatchTime: '48 Hours',
        pros: ['Tiered bulk pricing down to $6.20', 'Gold Verified factory', 'Custom packaging option'],
        cons: ['Slightly longer initial dispatch'],
        recommended: true,
      },
      {
        platform: '1688' as const,
        supplierName: 'Dongguan Jumei Electronics Factory (1688 OEM)',
        rating: 4.78,
        ordersFulfilled: 310000,
        unitCost: 6.4,
        shippingCarrier: '4PX Special Dedicated Line',
        shippingCost: 3.9,
        totalLandedCost: 10.3,
        estimatedDeliveryDays: '7-12 days',
        moq: 1,
        returnWindowDays: 7,
        defectRate: '0.8%',
        dispatchTime: '24-48 Hours',
        pros: ['Lowest absolute unit cost', 'Direct factory tier', 'High profit margin (+68%)'],
        cons: ['Chinese language packaging unless requested'],
        recommended: false,
      },
    ];

    res.json({ keyword: searchKey, results: comparisonData });
  });

  // Variant Mapping switch endpoint
  app.post('/api/mapping/switch-supplier', (req, res) => {
    const { productId, variantId, newSupplierPlatform, newSupplierSku, newCost } = req.body;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const variant = prod.variants.find((v) => v.id === variantId);
    if (!variant) return res.status(404).json({ error: 'Variant not found' });

    const prevSupplier = variant.mappedSupplierId;
    variant.mappedSupplierSku = newSupplierSku || variant.mappedSupplierSku;
    if (newCost) variant.supplierCost = Number(newCost);
    variant.mappedSupplierId = newSupplierPlatform === 'alibaba' ? 'sup_alibaba_002' : newSupplierPlatform === '1688' ? 'sup_1688_003' : 'sup_ali_001';

    syncLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: prod.id,
      productTitle: prod.title,
      variantSku: variant.sku,
      supplierPlatform: newSupplierPlatform,
      changeType: 'relisted',
      previousValue: `Supplier ${prevSupplier}`,
      newValue: `Switched to ${variant.mappedSupplierId} (${newSupplierPlatform.toUpperCase()})`,
      actionTaken: 'Supplier mapping updated. Future orders will route automatically.',
      storeUpdated: true,
    });

    res.json({ success: true, variant, product: prod });
  });

  // --------------------------------------------------
  // PRICING RULES ENDPOINTS
  // --------------------------------------------------
  app.get('/api/pricing-rules', (req, res) => {
    res.json(pricingRules);
  });

  app.post('/api/pricing-rules', (req, res) => {
    const newRule: PricingRule = {
      id: `rule_${Date.now()}`,
      name: req.body.name || 'New Pricing Rule',
      targetCategory: req.body.targetCategory || 'All',
      ruleType: req.body.ruleType || 'multiplier',
      multiplierValue: req.body.multiplierValue ?? 2.5,
      fixedMarkupValue: req.body.fixedMarkupValue ?? 15.0,
      tieredRules: req.body.tieredRules || [],
      includeShippingInCost: req.body.includeShippingInCost ?? true,
      centsEnding: req.body.centsEnding || '.99',
      autoRepriceOnSupplierChange: req.body.autoRepriceOnSupplierChange ?? true,
      isActive: req.body.isActive ?? true,
    };
    pricingRules.push(newRule);
    res.status(201).json(newRule);
  });

  app.put('/api/pricing-rules/:id', (req, res) => {
    const idx = pricingRules.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Rule not found' });

    pricingRules[idx] = { ...pricingRules[idx], ...req.body };
    res.json(pricingRules[idx]);
  });

  app.delete('/api/pricing-rules/:id', (req, res) => {
    pricingRules = pricingRules.filter((r) => r.id !== req.params.id);
    res.json({ success: true });
  });

  app.post('/api/pricing-rules/apply-all', (req, res) => {
    // Recalculate store prices for all products based on active rules
    const activeRule = pricingRules.find((r) => r.isActive) || pricingRules[0];
    let updatedCount = 0;

    products.forEach((prod) => {
      prod.variants.forEach((v) => {
        const baseCost = v.supplierCost + (activeRule.includeShippingInCost ? v.shippingCost : 0);
        let newPrice = baseCost * 2.5;

        if (activeRule.ruleType === 'multiplier' && activeRule.multiplierValue) {
          newPrice = baseCost * activeRule.multiplierValue;
        } else if (activeRule.ruleType === 'fixed_markup' && activeRule.fixedMarkupValue) {
          newPrice = baseCost + activeRule.fixedMarkupValue;
        } else if (activeRule.ruleType === 'tiered' && activeRule.tieredRules?.length) {
          const tier = activeRule.tieredRules.find((t) => baseCost >= t.minCost && baseCost <= t.maxCost);
          if (tier) {
            newPrice = baseCost * tier.multiplier + tier.fixedAdd;
          }
        }

        // Apply cents ending
        if (activeRule.centsEnding === '.99') {
          newPrice = Math.floor(newPrice) + 0.99;
        } else if (activeRule.centsEnding === '.95') {
          newPrice = Math.floor(newPrice) + 0.95;
        } else if (activeRule.centsEnding === '.00') {
          newPrice = Math.round(newPrice);
        }

        v.storePrice = Number(newPrice.toFixed(2));
        v.suggestedPrice = v.storePrice;
        updatedCount++;
      });
      prod.profitMargin = Number((((prod.variants[0].storePrice - prod.variants[0].supplierCost - prod.variants[0].shippingCost) / prod.variants[0].storePrice) * 100).toFixed(1));
    });

    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Global Repricing Applied',
      message: `Successfully recalculated prices for ${updatedCount} variants using rule "${activeRule.name}".`,
      type: 'price',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    res.json({ success: true, updatedVariantsCount: updatedCount, activeRule: activeRule.name });
  });

  // --------------------------------------------------
  // INVENTORY SYNCHRONIZATION & AUDITS
  // --------------------------------------------------
  app.get('/api/inventory/logs', (req, res) => {
    res.json(syncLogs);
  });

  app.post('/api/inventory/sync-now', (req, res) => {
    // Perform simulated live sync against suppliers
    const updatedLogs: InventorySyncLog[] = [];

    products.forEach((p) => {
      p.variants.forEach((v) => {
        // Small fluctuation simulation
        const stockDelta = Math.floor(Math.random() * 5) - 2;
        v.supplierStock = Math.max(50, v.supplierStock + stockDelta);
        v.stock = Math.min(v.stock, v.supplierStock);
      });
      p.lastInventorySync = new Date().toISOString();
      p.syncStatus = 'synced';
    });

    const newLog: InventorySyncLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: products[0].id,
      productTitle: products[0].title,
      variantSku: products[0].variants[0].sku,
      supplierPlatform: 'aliexpress',
      changeType: 'stock_change',
      previousValue: 'Audit Completed',
      newValue: '100% In Sync (0 Mismatches)',
      actionTaken: 'All 4 stores verified with live supplier stock levels',
      storeUpdated: true,
    };
    syncLogs.unshift(newLog);

    res.json({ success: true, timestamp: new Date().toISOString(), verifiedProducts: products.length, newLog });
  });

  // --------------------------------------------------
  // ORDERS & AUTOMATED FULFILLMENT PIPELINE
  // --------------------------------------------------
  app.get('/api/orders', (req, res) => {
    const { status, search, storeId } = req.query;
    let filtered = [...orders];

    if (status && typeof status === 'string' && status !== 'all') {
      filtered = filtered.filter((o) => o.status === status);
    }
    if (storeId && typeof storeId === 'string' && storeId !== 'all') {
      filtered = filtered.filter((o) => o.storeId === storeId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  app.get('/api/orders/:id', (req, res) => {
    const ord = orders.find((o) => o.id === req.params.id);
    if (!ord) return res.status(404).json({ error: 'Order not found' });
    res.json(ord);
  });

  // 1-Click Single Order Fulfillment
  app.post('/api/orders/fulfill-single', (req, res) => {
    const { orderId, shippingCarrier } = req.body;
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return res.status(404).json({ error: 'Order not found' });

    ord.status = 'processing';
    ord.supplierOrderId = `${ord.items[0]?.supplierPlatform?.toUpperCase() || 'ALI'}-ORD-${Math.floor(100000000 + Math.random() * 900000000)}`;
    ord.supplierOrderStatus = 'placed';
    ord.isAutoFulfilled = true;
    ord.shippingMethod = shippingCarrier || ord.shippingMethod;
    ord.lastSyncAt = new Date().toISOString();

    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: `Order ${ord.orderNumber} Dispatched to Supplier`,
      message: `Payload successfully sent to ${ord.items[0]?.supplierPlatform?.toUpperCase() || 'Supplier'}. Supplier Order ID: ${ord.supplierOrderId}.`,
      type: 'order',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    res.json({ success: true, order: ord });
  });

  // Bulk Fulfillment (DSERS style bulk place order)
  app.post('/api/orders/fulfill-bulk', (req, res) => {
    const { orderIds } = req.body;
    const targetOrders = orders.filter((o) => orderIds?.includes(o.id) && o.status === 'awaiting_order');

    targetOrders.forEach((ord) => {
      ord.status = 'processing';
      ord.supplierOrderId = `${ord.items[0]?.supplierPlatform?.toUpperCase() || 'ALI'}-ORD-${Math.floor(100000000 + Math.random() * 900000000)}`;
      ord.supplierOrderStatus = 'placed';
      ord.isAutoFulfilled = true;
      ord.lastSyncAt = new Date().toISOString();
    });

    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: `Bulk Fulfillment Complete (${targetOrders.length} Orders)`,
      message: `Generated automated supplier cart checkout payloads and dispatched payment tokens.`,
      type: 'order',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    res.json({ success: true, processedCount: targetOrders.length });
  });

  // Tracking Number sync endpoint
  app.post('/api/orders/sync-tracking', (req, res) => {
    const { orderId } = req.body;
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return res.status(404).json({ error: 'Order not found' });

    const trackNumber = `YT${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}US`;
    ord.status = 'shipped';
    ord.trackingNumber = trackNumber;
    ord.carrier = 'YunExpress Special Line';
    ord.supplierOrderStatus = 'dispatched';
    ord.trackingCheckpoints = [
      { timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16), location: 'Shenzhen Air Logistics Hub', status: 'Dispatched', details: 'Air freight manifest assigned' },
    ];
    ord.lastSyncAt = new Date().toISOString();

    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: `Tracking Synced: ${ord.orderNumber}`,
      message: `Carrier number ${trackNumber} pushed to ${ord.storeName} and notification sent to ${ord.customer.email}.`,
      type: 'order',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    res.json({ success: true, order: ord, trackingNumber: trackNumber });
  });

  // --------------------------------------------------
  // AUTOMATION RULES ENDPOINTS
  // --------------------------------------------------
  app.get('/api/automation-rules', (req, res) => {
    res.json(automationRules);
  });

  app.post('/api/automation-rules', (req, res) => {
    const newRule: AutomationRule = {
      id: `auto_rule_${Date.now()}`,
      name: req.body.name || 'New Custom Automation Rule',
      description: req.body.description || 'Auto-execute actions on store triggers',
      trigger: req.body.trigger || 'supplier_out_of_stock',
      conditionOperator: req.body.conditionOperator || '<',
      conditionValue: req.body.conditionValue ?? 5,
      action: req.body.action || 'switch_to_backup_supplier',
      isEnabled: true,
      timesTriggered: 0,
    };
    automationRules.push(newRule);
    res.status(201).json(newRule);
  });

  app.put('/api/automation-rules/:id/toggle', (req, res) => {
    const rule = automationRules.find((r) => r.id === req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    rule.isEnabled = !rule.isEnabled;
    res.json(rule);
  });

  app.delete('/api/automation-rules/:id', (req, res) => {
    automationRules = automationRules.filter((r) => r.id !== req.params.id);
    res.json({ success: true });
  });

  // --------------------------------------------------
  // ANALYTICS & PROFIT METRICS
  // --------------------------------------------------
  app.get('/api/analytics/summary', (req, res) => {
    const totalRev = orders.reduce((sum, o) => sum + o.totalStoreAmount, 0);
    const totalCost = orders.reduce((sum, o) => sum + o.totalCostAmount, 0);
    const totalProfit = totalRev - totalCost;
    const margin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

    const summary: AnalyticsSummary = {
      todayRevenue: 1845.2,
      todayProfit: 1210.4,
      todayOrdersCount: 28,
      monthRevenue: 87400.0,
      monthProfit: 57680.0,
      profitMarginAvg: Number(margin.toFixed(1)),
      fulfillmentRate: 98.6,
      activeProductsCount: products.length,
      connectedStoresCount: stores.length,
      revenueChart: [
        { date: 'Aug 20', revenue: 2450, cost: 850, profit: 1600 },
        { date: 'Aug 21', revenue: 2980, cost: 1020, profit: 1960 },
        { date: 'Aug 22', revenue: 3120, cost: 1100, profit: 2020 },
        { date: 'Aug 23', revenue: 2890, cost: 980, profit: 1910 },
        { date: 'Aug 24', revenue: 3840, cost: 1290, profit: 2550 },
        { date: 'Aug 25', revenue: 4190, cost: 1420, profit: 2770 },
        { date: 'Aug 26', revenue: 1845, cost: 635, profit: 1210 },
      ],
      ordersByPlatform: [
        { platform: 'aliexpress', percentage: 52, total: 614 },
        { platform: 'alibaba', percentage: 31, total: 366 },
        { platform: '1688', percentage: 17, total: 201 },
      ],
      supplierPerformance: [
        {
          name: 'Shenzhen Apex Smart Co. (AliExpress)',
          platform: 'aliexpress',
          rating: 4.89,
          onTimeRate: 98.7,
          disputeRate: 0.4,
          avgCost: 12.5,
          totalOrders: 614,
        },
        {
          name: 'Yiwu Huanuo Industrial (Alibaba Gold)',
          platform: 'alibaba',
          rating: 4.94,
          onTimeRate: 99.2,
          disputeRate: 0.2,
          avgCost: 9.8,
          totalOrders: 366,
        },
        {
          name: 'Dongguan Jumei Factory (1688 OEM)',
          platform: '1688',
          rating: 4.78,
          onTimeRate: 97.5,
          disputeRate: 0.8,
          avgCost: 6.4,
          totalOrders: 201,
        },
      ],
      topSellingProducts: products.map((p) => ({
        id: p.id,
        title: p.title,
        salesCount: Math.floor(180 + Math.random() * 320),
        revenue: Math.floor(6500 + Math.random() * 8000),
        profit: Math.floor(4200 + Math.random() * 5500),
        image: p.images[0] || '',
      })),
    };

    res.json(summary);
  });

  // --------------------------------------------------
  // NOTIFICATIONS ENDPOINTS
  // --------------------------------------------------
  app.get('/api/notifications', (req, res) => {
    res.json(notifications);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const n = notifications.find((item) => item.id === req.params.id);
    if (n) n.read = true;
    res.json({ success: true });
  });

  app.post('/api/notifications/clear-all', (req, res) => {
    notifications = [];
    res.json({ success: true });
  });

  // --------------------------------------------------
  // GEMINI AI INTEGRATIONS (AI PRODUCT ANALYST & OPTIMIZER)
  // --------------------------------------------------

  // 1. AI Product Optimizer
  app.post('/api/ai/optimize-product', async (req, res) => {
    const { title, rawDescription, category } = req.body;

    const fallbackResponse = {
      optimizedTitle: `AuraShield Pro™ ${title.replace(/[^\w\s-]/g, '').trim()} [2026 Edition]`,
      engagingDescription: `Experience peak efficiency and refined craftsmanship with the all-new ${title}. Engineered for modern lifestyles, combining precision components, seamless ergonomics, and durable longevity. Perfect for demanding daily routines or high-standard home workspaces.`,
      keySellingPoints: [
        'Aviation-grade thermal and structural durability',
        'Intuitive plug-and-play setup with zero complicated calibration',
        'Universal compatibility across leading industry ecosystems',
        'Compact form factor optimized for travel and workspace aesthetics',
      ],
      targetAudience: 'Tech-forward professionals, modern creators, and efficiency enthusiasts aged 20-45',
      suggestedPricing: {
        recommendedMarkup: 2.85,
        targetRetailPrice: 39.99,
        estimatedProfitMarginPct: 65,
      },
      adHooks: [
        `"Tired of low-quality generic gadgets? Here is why everyone is switching to this..."`,
        `"The single upgrade that saved me 45 minutes every single morning."`,
        `"POV: You found the viral TikTok product that actually delivers 10/10 quality."`,
      ],
    };

    if (!ai) {
      return res.json(fallbackResponse);
    }

    try {
      const prompt = `You are a top-tier e-commerce dropshipping conversion copywriter and product analyst (like DSERS AutoVend AI).
Given this raw supplier product info:
Title: "${title}"
Category: "${category || 'General'}"
Raw Notes: "${rawDescription || ''}"

Return a JSON object with:
- "optimizedTitle": Catchy, high-CTR, brand-safe title (max 75 characters) without spam keywords
- "engagingDescription": 2-3 concise, high-converting paragraphs emphasizing pain points and benefits
- "keySellingPoints": array of 4 punchy bullet points
- "targetAudience": concise 1-sentence buyer persona
- "suggestedPricing": object with "recommendedMarkup" (number e.g. 2.8), "targetRetailPrice" (number), "estimatedProfitMarginPct" (number)
- "adHooks": array of 3 viral hook lines for TikTok/Instagram/Facebook video ads

Respond ONLY with valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json(parsed);
      }
      return res.json(fallbackResponse);
    } catch (error) {
      console.error('Gemini optimize product error:', error);
      return res.json(fallbackResponse);
    }
  });

  // 2. AI Store & Profit Intelligence Audit
  app.post('/api/ai/analyze-store', async (req, res) => {
    const { storeId } = req.body;
    const store = stores.find((s) => s.id === storeId) || stores[0];

    const fallbackAnalysis = {
      overallHealthScore: 92,
      executiveSummary: `Your store "${store.name}" is performing exceptionally well with a 65.8% average gross margin across 4 sales channels. Fulfillment on-time rate is 98.6%. Primary growth opportunity lies in multi-supplier price arbitrage (switching select components from AliExpress to 1688 OEM direct).`,
      topOpportunities: [
        {
          title: 'Arbitrage Opportunity on MagCharge 3-in-1',
          impact: '+$4.20 profit per unit (+18.4% margin boost)',
          recommendation: 'Switch secondary inventory fulfillment from AliExpress to 1688 OEM factory Dongguan Jumei to lower unit cost from $12.50 to $6.40.',
        },
        {
          title: 'Stockout Risk Alert for White Variants',
          impact: 'Prevent potential revenue loss of ~$1,250/wk',
          recommendation: 'Alibaba supplier stock on Glacier White is down to 640 units. Enable auto-fallback routing to 1688 backup SKU.',
        },
        {
          title: 'TikTok Shop Viral Trend Expansion',
          impact: 'Estimated 2.4x order volume spike',
          recommendation: 'Bundle LuminaPulse with LED Sunset Lamp to create an "Aesthetic Desk Setup" bundle priced at $69.99 (71% margin).',
        },
      ],
      supplierScorecard: {
        bestPerformingSupplier: 'Yiwu Huanuo Industrial (Alibaba) - 99.2% on-time, 0.2% dispute rate',
        fastestDispatchSupplier: 'Shenzhen Apex Smart (AliExpress) - 8 days avg transit',
      },
    };

    if (!ai) {
      return res.json(fallbackAnalysis);
    }

    try {
      const prompt = `You are the AutoVend 2.0 AI Business Intelligence Analyst.
Analyze this dropshipping store telemetry:
Store Name: ${store.name}
Platform: ${store.platform}
Revenue: $${store.revenue}
Total Orders: ${store.totalOrders}
Products Managed: ${products.length}
Primary Suppliers: AliExpress (4.89), Alibaba (4.94), 1688 Factory (4.78)

Provide an executive store audit in JSON format with:
- "overallHealthScore": number (0-100)
- "executiveSummary": string
- "topOpportunities": array of 3 objects { "title": string, "impact": string, "recommendation": string }
- "supplierScorecard": object with "bestPerformingSupplier" (string), "fastestDispatchSupplier" (string)

Return valid JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json(parsed);
      }
      return res.json(fallbackAnalysis);
    } catch (err) {
      console.error('Gemini store audit error:', err);
      return res.json(fallbackAnalysis);
    }
  });

  // 3. Interactive AI Business Analyst Chat
  app.post('/api/ai/chat-analyst', async (req, res) => {
    const { message, history } = req.body;

    const fallbackChat = `As your AutoVend 2.0 AI Advisor, I reviewed your current store metrics. Your top performer is the **LuminaPulse™ MagCharge 3-in-1**, maintaining a **66% profit margin** across 342 orders.

Here is what I recommend for your next move:
1. **Activate Multi-Supplier Fallback**: Enable our 1688 factory rule so that if AliExpress runs into transit delays during peak Q4 volume, your orders automatically route to Yiwu Huanuo.
2. **Dynamic Repricing**: Ensure your '.99' psychological pricing rule is active to capture maximum buyer conversion.
3. **Expand Product Line**: We detected high search volume for RGB aesthetic desk decor. You have 2 vetted items ready in your Import Queue.`;

    if (!ai) {
      return res.json({ reply: fallbackChat });
    }

    try {
      const prompt = `You are AutoVend 2.0's built-in AI Dropshipping & Supply Chain Mentor (expert in DSERS, AliExpress, Alibaba, 1688 sourcing, profit margins, and Shopify/TikTok Shop scaling).
Current Store Context:
- Active Stores: TrendyNest US (Shopify), TechDirect (WooCommerce), ViralGadgets (TikTok Shop)
- Total Catalog: ${products.length} products, 100+ variants
- Orders Fulfilled: ${orders.length} in current pipeline
- Sourcing Partners: AliExpress Shenzhen Apex, Alibaba Yiwu Huanuo, 1688 Dongguan Jumei Factory

User query: "${message}"

Give a sharp, highly actionable, strategic, and encouraging response formatted in clean Markdown with clear bullet points. Keep it professional, data-backed, and practical.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({ reply: response.text || fallbackChat });
    } catch (err) {
      console.error('Gemini chat error:', err);
      return res.json({ reply: fallbackChat });
    }
  });

  // --------------------------------------------------
  // LIVE STOREFRONT CHECKOUT SIMULATOR
  // Allows testing customer buying -> AutoVend auto order generation
  // --------------------------------------------------
  app.post('/api/storefront/checkout', (req, res) => {
    const { storeId, customer, items, shippingMethod } = req.body;
    const targetStore = stores.find((s) => s.id === storeId) || stores[0];

    const orderNum = `#AV-${Math.floor(98400 + Math.random() * 1000)}`;
    let totalStore = 0;
    let totalCost = 0;

    const orderItems = (items || []).map((it: any) => {
      const prod = products.find((p) => p.id === it.productId);
      const variant = prod?.variants.find((v) => v.id === it.variantId) || prod?.variants[0];

      const unitPrice = variant?.storePrice || 39.99;
      const cost = variant?.supplierCost || 10.0;
      const shipping = variant?.shippingCost || 2.8;

      totalStore += unitPrice * (it.quantity || 1);
      totalCost += (cost + shipping) * (it.quantity || 1);

      return {
        id: `oi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId: it.productId,
        productTitle: prod?.title || 'LuminaPulse™ MagCharge 3-in-1',
        variantId: variant?.id || 'var_lum_01',
        variantName: variant?.name || 'Standard Edition',
        sku: variant?.sku || 'SKU-DEFAULT',
        quantity: it.quantity || 1,
        storeUnitPrice: unitPrice,
        supplierCost: cost,
        shippingCost: shipping,
        itemImage: variant?.image || prod?.images[0] || 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=200',
        supplierId: variant?.mappedSupplierId || 'sup_ali_001',
        supplierPlatform: (variant?.mappedSupplierId?.includes('alibaba') ? 'alibaba' : variant?.mappedSupplierId?.includes('1688') ? '1688' : 'aliexpress') as any,
        supplierSku: variant?.mappedSupplierSku || 'SUP-DEFAULT-SKU',
      };
    });

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      storeId: targetStore.id,
      storeName: targetStore.name,
      storePlatform: targetStore.platform,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: customer?.fullName || 'Alexandre Dubois',
        addressLine1: customer?.addressLine1 || '12 Rue de Rivoli',
        city: customer?.city || 'Paris',
        state: customer?.state || 'IDF',
        postalCode: customer?.postalCode || '75001',
        country: customer?.country || 'France',
        phone: customer?.phone || '+33 6 12 34 56 78',
        email: customer?.email || 'alexandre.dubois@gmail.com',
      },
      items: orderItems,
      totalStoreAmount: Number(totalStore.toFixed(2)),
      totalCostAmount: Number(totalCost.toFixed(2)),
      profitAmount: Number((totalStore - totalCost).toFixed(2)),
      profitMarginPct: Number((((totalStore - totalCost) / totalStore) * 100).toFixed(1)),
      status: targetStore.autoFulfillOrders ? 'processing' : 'awaiting_order',
      shippingMethod: shippingMethod || 'YunExpress Direct Line (7-9 Days)',
      supplierOrderId: targetStore.autoFulfillOrders ? `ALI-ORD-${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
      supplierOrderStatus: targetStore.autoFulfillOrders ? 'placed' : undefined,
      lastSyncAt: new Date().toISOString(),
      isAutoFulfilled: targetStore.autoFulfillOrders,
    };

    orders.unshift(newOrder);
    targetStore.totalOrders += 1;
    targetStore.revenue += newOrder.totalStoreAmount;

    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: `⚡ Real-Time Customer Order Placed (${orderNum})`,
      message: `${newOrder.customer.fullName} bought ${newOrder.items.length} item(s) on ${targetStore.name} for $${newOrder.totalStoreAmount}. ${targetStore.autoFulfillOrders ? 'Auto-routed to supplier!' : 'Ready in fulfillment queue.'}`,
      type: 'order',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    res.status(201).json({ success: true, order: newOrder });
  });

  // --------------------------------------------------
  // VITE MIDDLEWARE SETUP
  // --------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoVend 2.0 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AutoVend server:', err);
});
