import crypto from 'crypto';

export interface ShopifyStoreConfig {
  shopDomain: string; // e.g. 'mystore.myshopify.com'
  accessToken: string; // 'shpat_...'
  apiVersion?: string;
  webhookSecret?: string;
}

export interface WooCommerceStoreConfig {
  storeUrl: string; // e.g. 'https://mywoostore.com'
  consumerKey: string; // 'ck_...'
  consumerSecret: string; // 'cs_...'
  webhookSecret?: string;
}

/**
 * Production Shopify Admin REST API Client & Webhook Verifier
 */
export class ShopifyAdminClient {
  private config: ShopifyStoreConfig;
  private apiVersion: string;

  constructor(config: ShopifyStoreConfig) {
    this.config = config;
    this.apiVersion = config.apiVersion || '2024-01';
  }

  /**
   * Verifies incoming Shopify webhook signature (HMAC-SHA256)
   */
  public verifyWebhookSignature(rawBody: string | Buffer, receivedHmacHeader: string): boolean {
    if (!this.config.webhookSecret) return true; // if secret not set, skip or log warning
    const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
    hmac.update(rawBody);
    const calculatedHmac = hmac.digest('base64');
    return crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(receivedHmacHeader));
  }

  /**
   * Pushes product with variants and images to Shopify catalog
   */
  public async pushProduct(productData: {
    title: string;
    bodyHtml: string;
    vendor: string;
    images: { src: string }[];
    variants: {
      price: string;
      sku: string;
      inventory_quantity?: number;
      option1?: string;
    }[];
  }): Promise<{ shopifyProductId: string; handle: string }> {
    const url = `https://${this.config.shopDomain}/admin/api/${this.apiVersion}/products.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.config.accessToken,
      },
      body: JSON.stringify({ product: productData }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API Error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return {
      shopifyProductId: String(data.product.id),
      handle: data.product.handle,
    };
  }

  /**
   * Updates inventory levels on Shopify
   */
  public async updateInventoryLevel(inventoryItemId: string, locationId: string, availableQuantity: number): Promise<boolean> {
    const url = `https://${this.config.shopDomain}/admin/api/${this.apiVersion}/inventory_levels/set.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.config.accessToken,
      },
      body: JSON.stringify({
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: availableQuantity,
      }),
    });

    return response.ok;
  }
}

/**
 * Production WooCommerce REST API Client & Webhook Verifier
 */
export class WooCommerceAdminClient {
  private config: WooCommerceStoreConfig;

  constructor(config: WooCommerceStoreConfig) {
    this.config = config;
  }

  /**
   * Verifies incoming WooCommerce webhook signature
   */
  public verifyWebhookSignature(rawBody: string | Buffer, receivedSignature: string): boolean {
    if (!this.config.webhookSecret) return true;
    const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('base64');
    return crypto.timingSafeEqual(Buffer.from(calculatedSignature), Buffer.from(receivedSignature));
  }

  /**
   * Pushes product with variants to WooCommerce
   */
  public async pushProduct(productData: {
    name: string;
    type: 'simple' | 'variable';
    regular_price?: string;
    description: string;
    images: { src: string }[];
  }): Promise<{ wooProductId: number; permalink: string }> {
    const authHeader = 'Basic ' + Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    const url = `${this.config.storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API Error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return {
      wooProductId: data.id,
      permalink: data.permalink,
    };
  }
}
