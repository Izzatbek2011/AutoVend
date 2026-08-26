export type Platform = 'aliexpress' | 'alibaba' | '1688' | 'cjdropshipping';
export type StorePlatform = 'shopify' | 'woocommerce' | 'tiktok_shop' | 'ebay' | 'amazon';
export type OrderStatus = 'awaiting_order' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'alert';
export type SyncStatus = 'synced' | 'pending' | 'out_of_sync' | 'error';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'store_manager' | 'dropshipper';
  avatar: string;
  plan: 'Growth Pro' | 'Enterprise Multi-Store' | 'Starter';
  storesCount: number;
}

export interface Store {
  id: string;
  name: string;
  platform: StorePlatform;
  url: string;
  status: 'connected' | 'error' | 'syncing';
  currency: string;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  lastSyncAt: string;
  apiKeyMasked: string;
  autoSyncInventory: boolean;
  autoFulfillOrders: boolean;
}

export interface SupplierInfo {
  id: string;
  name: string;
  platform: Platform;
  supplierUrl: string;
  rating: number;
  reviewsCount: number;
  ordersFulfilled: number;
  onTimeDeliveryRate: number; // e.g. 98.4%
  avgShippingDays: number;
  warehouseLocation: string;
  verificationBadge: string;
  minOrderQuantity: number;
  samplePrice: number;
  tierPricing?: { minQty: number; price: number }[];
  shippingCarriers: {
    name: string;
    cost: number;
    estimatedDays: string;
    trackingAvailable: boolean;
  }[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string; // e.g., "Midnight Blue / Large"
  options: { [key: string]: string }; // e.g., { Color: 'Blue', Size: 'L' }
  supplierCost: number;
  shippingCost: number;
  suggestedPrice: number;
  storePrice: number;
  stock: number;
  supplierStock: number;
  mappedSupplierId: string;
  mappedSupplierSku: string;
  backupSupplierId?: string;
  backupSupplierSku?: string;
  image?: string;
  weightGrams?: number;
}

export interface Product {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  aiOptimizedDescription?: string;
  category: string;
  tags: string[];
  images: string[];
  primarySupplier: SupplierInfo;
  alternateSuppliers: SupplierInfo[];
  variants: ProductVariant[];
  targetStores: string[]; // store IDs
  status: 'imported' | 'ready_to_push' | 'published' | 'archived';
  profitMargin: number; // percentage, e.g., 62%
  createdAt: string;
  updatedAt: string;
  lastInventorySync?: string;
  syncStatus: SyncStatus;
  aiInsights?: {
    viralScore: number;
    recommendedMarkup: number;
    targetAudience: string;
    keySellingPoints: string[];
    suggestedTags: string[];
    adHooks: string[];
  };
}

export interface ImportQueueItem {
  id: string;
  sourceUrl: string;
  sourcePlatform: Platform;
  rawTitle: string;
  optimizedTitle: string;
  description: string;
  images: string[];
  priceRange: { min: number; max: number };
  supplierName: string;
  supplierRating: number;
  supplierLocation: string;
  variants: ProductVariant[];
  status: 'pending_review' | 'optimizing' | 'ready' | 'pushed';
  aiEnhanced: boolean;
  addedAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  targetCategory: string; // 'All' or specific
  ruleType: 'multiplier' | 'fixed_markup' | 'tiered';
  multiplierValue?: number; // e.g. 2.5
  fixedMarkupValue?: number; // e.g. 15.00
  tieredRules?: { minCost: number; maxCost: number; multiplier: number; fixedAdd: number }[];
  includeShippingInCost: boolean;
  centsEnding: '.99' | '.95' | '.00' | 'none';
  autoRepriceOnSupplierChange: boolean;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  storeUnitPrice: number;
  supplierCost: number;
  shippingCost: number;
  itemImage: string;
  supplierId: string;
  supplierPlatform: Platform;
  supplierSku: string;
}

export interface CustomerShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface TrackingCheckpoint {
  timestamp: string;
  location: string;
  status: string;
  details: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #AV-98421
  storeId: string;
  storeName: string;
  storePlatform: StorePlatform;
  createdAt: string;
  customer: CustomerShippingAddress;
  items: OrderItem[];
  totalStoreAmount: number;
  totalCostAmount: number;
  profitAmount: number;
  profitMarginPct: number;
  status: OrderStatus;
  shippingMethod: string;
  supplierOrderId?: string; // e.g., ALI-983109312
  supplierOrderStatus?: 'placed' | 'awaiting_dispatch' | 'dispatched' | 'delivered';
  trackingNumber?: string;
  carrier?: string;
  trackingCheckpoints?: TrackingCheckpoint[];
  lastSyncAt: string;
  fulfillmentNotes?: string;
  isAutoFulfilled: boolean;
  alertReason?: string;
}

export interface InventorySyncLog {
  id: string;
  timestamp: string;
  productId: string;
  productTitle: string;
  variantSku: string;
  supplierPlatform: Platform;
  changeType: 'stock_change' | 'price_change' | 'out_of_stock' | 'relisted';
  previousValue: string | number;
  newValue: string | number;
  actionTaken: string;
  storeUpdated: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 
    | 'supplier_out_of_stock'
    | 'supplier_price_increase'
    | 'new_order_received'
    | 'tracking_number_generated'
    | 'low_inventory_threshold';
  conditionOperator?: '>' | '<' | '=' | 'contains';
  conditionValue?: string | number;
  action: 
    | 'switch_to_backup_supplier'
    | 'set_store_inventory_zero'
    | 'auto_adjust_store_price'
    | 'auto_place_supplier_order'
    | 'sync_tracking_to_store_and_email'
    | 'send_urgent_alert';
  isEnabled: boolean;
  timesTriggered: number;
  lastTriggeredAt?: string;
}

export interface AnalyticsSummary {
  todayRevenue: number;
  todayProfit: number;
  todayOrdersCount: number;
  monthRevenue: number;
  monthProfit: number;
  profitMarginAvg: number;
  fulfillmentRate: number;
  activeProductsCount: number;
  connectedStoresCount: number;
  revenueChart: { date: string; revenue: number; cost: number; profit: number }[];
  ordersByPlatform: { platform: Platform; percentage: number; total: number }[];
  supplierPerformance: {
    name: string;
    platform: Platform;
    rating: number;
    onTimeRate: number;
    disputeRate: number;
    avgCost: number;
    totalOrders: number;
  }[];
  topSellingProducts: {
    id: string;
    title: string;
    salesCount: number;
    revenue: number;
    profit: number;
    image: string;
  }[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'price' | 'system' | 'ai';
  severity: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
