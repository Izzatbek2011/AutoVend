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
} from '../types';

export const api = {
  // Auth & Profile
  async getUser(): Promise<UserProfile> {
    const res = await fetch('/api/user');
    return res.json();
  },

  async updateUser(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Stores
  async getStores(): Promise<Store[]> {
    const res = await fetch('/api/stores');
    return res.json();
  },

  async createStore(store: Partial<Store>): Promise<Store> {
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store),
    });
    return res.json();
  },

  async deleteStore(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async syncStore(id: string): Promise<{ success: boolean; store: Store }> {
    const res = await fetch(`/api/stores/${id}/sync`, { method: 'POST' });
    return res.json();
  },

  // Products
  async getProducts(params?: { storeId?: string; search?: string; category?: string }): Promise<Product[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/products?${query}`);
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async pushProduct(id: string, targetStoreIds: string[]): Promise<{ success: boolean; product: Product }> {
    const res = await fetch(`/api/products/${id}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStoreIds }),
    });
    return res.json();
  },

  // Sourcing & Import Queue
  async getImportQueue(): Promise<ImportQueueItem[]> {
    const res = await fetch('/api/import/queue');
    return res.json();
  },

  async importFromUrl(url: string, platform?: string): Promise<ImportQueueItem> {
    const res = await fetch('/api/import/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, platform }),
    });
    return res.json();
  },

  async deleteImportItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/import/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async batchPushImports(itemIds: string[], targetStoreIds: string[]): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/import/batch-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds, targetStoreIds }),
    });
    return res.json();
  },

  async compareSuppliers(keyword?: string): Promise<{ keyword: string; results: any[] }> {
    const res = await fetch(`/api/suppliers/compare?keyword=${encodeURIComponent(keyword || '')}`);
    return res.json();
  },

  async switchVariantSupplier(payload: {
    productId: string;
    variantId: string;
    newSupplierPlatform: string;
    newSupplierSku?: string;
    newCost?: number;
  }): Promise<{ success: boolean; variant: any; product: Product }> {
    const res = await fetch('/api/mapping/switch-supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Pricing Rules
  async getPricingRules(): Promise<PricingRule[]> {
    const res = await fetch('/api/pricing-rules');
    return res.json();
  },

  async createPricingRule(rule: Partial<PricingRule>): Promise<PricingRule> {
    const res = await fetch('/api/pricing-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    return res.json();
  },

  async updatePricingRule(id: string, updates: Partial<PricingRule>): Promise<PricingRule> {
    const res = await fetch(`/api/pricing-rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deletePricingRule(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/pricing-rules/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async applyAllPricingRules(): Promise<{ success: boolean; updatedVariantsCount: number; activeRule: string }> {
    const res = await fetch('/api/pricing-rules/apply-all', { method: 'POST' });
    return res.json();
  },

  // Inventory Sync
  async getInventoryLogs(): Promise<InventorySyncLog[]> {
    const res = await fetch('/api/inventory/logs');
    return res.json();
  },

  async syncInventoryNow(): Promise<{ success: boolean; timestamp: string; verifiedProducts: number; newLog: InventorySyncLog }> {
    const res = await fetch('/api/inventory/sync-now', { method: 'POST' });
    return res.json();
  },

  // Orders & Fulfillment
  async getOrders(params?: { status?: string; search?: string; storeId?: string }): Promise<Order[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/orders?${query}`);
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    return res.json();
  },

  async fulfillSingleOrder(orderId: string, shippingCarrier?: string): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/orders/fulfill-single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, shippingCarrier }),
    });
    return res.json();
  },

  async fulfillBulkOrders(orderIds: string[]): Promise<{ success: boolean; processedCount: number }> {
    const res = await fetch('/api/orders/fulfill-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds }),
    });
    return res.json();
  },

  async syncOrderTracking(orderId: string): Promise<{ success: boolean; order: Order; trackingNumber: string }> {
    const res = await fetch('/api/orders/sync-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    return res.json();
  },

  // Automation Rules
  async getAutomationRules(): Promise<AutomationRule[]> {
    const res = await fetch('/api/automation-rules');
    return res.json();
  },

  async createAutomationRule(rule: Partial<AutomationRule>): Promise<AutomationRule> {
    const res = await fetch('/api/automation-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    return res.json();
  },

  async toggleAutomationRule(id: string): Promise<AutomationRule> {
    const res = await fetch(`/api/automation-rules/${id}/toggle`, { method: 'PUT' });
    return res.json();
  },

  async deleteAutomationRule(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/automation-rules/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Analytics
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/analytics/summary');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<SystemNotification[]> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  async clearAllNotifications(): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/clear-all', { method: 'POST' });
    return res.json();
  },

  // AI Integrations
  async aiOptimizeProduct(title: string, rawDescription?: string, category?: string): Promise<any> {
    const res = await fetch('/api/ai/optimize-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, rawDescription, category }),
    });
    return res.json();
  },

  async aiAnalyzeStore(storeId?: string): Promise<any> {
    const res = await fetch('/api/ai/analyze-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId }),
    });
    return res.json();
  },

  async aiChatAnalyst(message: string, history?: any[]): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/chat-analyst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    return res.json();
  },

  // Storefront Simulator Checkout
  async simulateStorefrontCheckout(payload: {
    storeId: string;
    customer: any;
    items: any[];
    shippingMethod?: string;
  }): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/storefront/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
