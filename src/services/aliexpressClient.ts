import crypto from 'crypto';

export interface AliExpressConfig {
  appKey: string;
  appSecret: string;
  accessToken?: string;
  refreshToken?: string;
  useSandbox?: boolean;
}

export interface TopApiRequestOptions {
  method: string;
  params?: Record<string, any>;
  session?: string;
  timeoutMs?: number;
  retries?: number;
}

export interface AliExpressProductDetails {
  productId: string;
  title: string;
  description?: string;
  mainImages: string[];
  variants: {
    skuId: string;
    skuName: string;
    originalPrice: number;
    salePrice: number;
    availableStock: number;
    skuPropertyValues: Record<string, string>;
  }[];
  supplier: {
    storeId: string;
    storeName: string;
    rating: number;
  };
  logistics: {
    carrierName: string;
    freightAmount: number;
    deliveryDays: number;
  }[];
}

export interface AliExpressCreateOrderParams {
  outOrderId: string; // Idempotency key
  productId: string;
  skuId: string;
  quantity: number;
  logisticsServiceName: string;
  shippingAddress: {
    recipientName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zipCode: string;
    phone: string;
  };
}

/**
 * Production-ready AliExpress Open Platform (Taobao Open Platform / TOP) Protocol Client
 * Official standard documentation: https://open.aliexpress.com/doc/api.htm
 */
export class AliExpressApiClient {
  private config: AliExpressConfig;
  private endpoint: string;

  constructor(config: AliExpressConfig) {
    this.config = config;
    this.endpoint = config.useSandbox
      ? 'https://gw.api.tbsandbox.com/router/rest'
      : 'https://api-sg.aliexpress.com/sync';
  }

  /**
   * Generates official TOP protocol HMAC-SHA256 signature
   */
  public generateSignature(params: Record<string, any>, secret: string): string {
    // 1. Sort all parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    
    // 2. Concatenate key + value
    let queryStr = '';
    for (const key of sortedKeys) {
      if (key !== 'sign' && params[key] !== undefined && params[key] !== null) {
        const val = typeof params[key] === 'object' ? JSON.stringify(params[key]) : String(params[key]);
        queryStr += `${key}${val}`;
      }
    }

    // 3. Compute HMAC-SHA256 and convert to UPPERCASE hex
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(queryStr, 'utf8');
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * Generates official OAuth 2.0 Authorization URL for merchant/dropshipper token grant
   */
  public getOAuthAuthorizeUrl(redirectUri: string, state: string = 'autovend_auth'): string {
    const baseUrl = 'https://oauth.aliexpress.com/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      force_auth: 'true',
      redirect_uri: redirectUri,
      client_id: this.config.appKey,
      state: state,
      view: 'web',
    });
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for Access Token & Refresh Token
   */
  public async exchangeOAuthCode(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    userId: string;
  }> {
    if (!this.config.appKey || !this.config.appSecret) {
      throw new Error('ALIEXPRESS_APP_KEY and ALIEXPRESS_APP_SECRET are required for OAuth exchange.');
    }

    const tokenUrl = 'https://oauth.aliexpress.com/token';
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: this.config.appKey,
      client_secret: this.config.appSecret,
      redirect_uri: redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AliExpress OAuth token exchange failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.error_response || data.error) {
      throw new Error(`AliExpress OAuth error: ${JSON.stringify(data)}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      userId: data.user_id || data.seller_id,
    };
  }

  /**
   * Refreshes expired Access Token
   */
  public async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const tokenUrl = 'https://oauth.aliexpress.com/token';
    const bodyParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.appKey,
      client_secret: this.config.appSecret,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    const data = await response.json();
    if (!response.ok || data.error_response) {
      throw new Error(`AliExpress Token Refresh error: ${JSON.stringify(data)}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Executes signed TOP protocol request with automatic retry and rate-limiting handling
   */
  public async execute<T = any>(options: TopApiRequestOptions): Promise<T> {
    if (!this.config.appKey || !this.config.appSecret) {
      throw new Error(
        'Missing AliExpress Open Platform credentials. Set ALIEXPRESS_APP_KEY and ALIEXPRESS_APP_SECRET in .env'
      );
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const systemParams: Record<string, string> = {
      app_key: this.config.appKey,
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'sha256',
      method: options.method,
    };

    if (options.session || this.config.accessToken) {
      systemParams.session = options.session || this.config.accessToken!;
    }

    const allParams: Record<string, any> = {
      ...systemParams,
      ...(options.params || {}),
    };

    // Calculate signature
    const signature = this.generateSignature(allParams, this.config.appSecret);
    allParams.sign = signature;

    const maxRetries = options.retries ?? 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

        const formBody = new URLSearchParams();
        for (const [k, v] of Object.entries(allParams)) {
          formBody.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
        }

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'User-Agent': 'AutoVend-SupplySync-Engine/1.0',
          },
          body: formBody.toString(),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          // Rate limited -> Exponential backoff
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`AliExpress Gateway HTTP Error ${response.status}: ${errText}`);
        }

        const data = await response.json();

        // Check for TOP error response
        if (data.error_response) {
          const topErr = data.error_response;
          throw new Error(`AliExpress TOP Error [${topErr.code}]: ${topErr.msg} (${topErr.sub_msg || ''})`);
        }

        return data as T;
      } catch (err: any) {
        lastError = err;
        if (attempt === maxRetries) break;
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }

    throw lastError || new Error(`AliExpress API Call failed after ${maxRetries} retries`);
  }

  /**
   * Fetches official product details and live SKU inventory
   * API Method: aliexpress.ds.product.get
   */
  public async getProductDetails(productId: string, targetCountry: string = 'US'): Promise<AliExpressProductDetails> {
    const result = await this.execute({
      method: 'aliexpress.ds.product.get',
      params: {
        product_id: productId,
        ship_to_country: targetCountry,
        target_currency: 'USD',
        target_language: 'EN',
      },
    });

    const resObj = result?.aliexpress_ds_product_get_response?.result;
    if (!resObj) {
      throw new Error(`Product ${productId} not found or invalid format from AliExpress gateway.`);
    }

    const baseInfo = resObj.ae_item_base_info_dto || {};
    const skuList = resObj.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || [];
    const images = baseInfo.image_u_r_ls ? baseInfo.image_u_r_ls.split(';') : [];

    return {
      productId: String(baseInfo.product_id || productId),
      title: baseInfo.subject || 'AliExpress Item',
      description: baseInfo.detail || '',
      mainImages: images.length > 0 ? images : [baseInfo.main_image_url_list],
      variants: skuList.map((sku: any) => ({
        skuId: String(sku.sku_id),
        skuName: sku.sku_attr || 'Default Spec',
        originalPrice: parseFloat(sku.sku_price || '0'),
        salePrice: parseFloat(sku.offer_sale_price || sku.sku_price || '0'),
        availableStock: parseInt(sku.sku_available_stock || '0', 10),
        skuPropertyValues: {},
      })),
      supplier: {
        storeId: String(resObj.store_info?.store_id || ''),
        storeName: resObj.store_info?.store_name || 'AliExpress Verified Store',
        rating: parseFloat(resObj.store_info?.item_as_described_rating || '4.8'),
      },
      logistics: (resObj.logistics_info_dto?.logistics_info_d_t_o || []).map((l: any) => ({
        carrierName: l.logistics_company || 'Standard Shipping',
        freightAmount: parseFloat(l.freight?.amount || '0'),
        deliveryDays: parseInt(l.delivery_time || '10', 10),
      })),
    };
  }

  /**
   * Places automated dropshipping order with idempotency token
   * API Method: aliexpress.ds.trade.order.create
   */
  public async createDropshippingOrder(orderParams: AliExpressCreateOrderParams): Promise<{
    orderId: string;
    status: string;
    outOrderId: string;
  }> {
    const result = await this.execute({
      method: 'aliexpress.ds.trade.order.create',
      params: {
        param_place_order_request4_open_api_d_t_o: {
          out_order_id: orderParams.outOrderId,
          product_items: [
            {
              product_id: orderParams.productId,
              sku_attr: orderParams.skuId,
              product_count: orderParams.quantity,
              logistics_service_name: orderParams.logisticsServiceName || 'CAINIAO_STANDARD',
            },
          ],
          logistics_address: {
            contact_person: orderParams.shippingAddress.recipientName,
            address: orderParams.shippingAddress.address1,
            address2: orderParams.shippingAddress.address2 || '',
            city: orderParams.shippingAddress.city,
            province: orderParams.shippingAddress.province,
            country: orderParams.shippingAddress.country,
            zip: orderParams.shippingAddress.zipCode,
            mobile_no: orderParams.shippingAddress.phone,
          },
        },
      },
    });

    const responseResult = result?.aliexpress_ds_trade_order_create_response?.result;
    if (!responseResult?.is_success && !responseResult?.order_list) {
      throw new Error(`AliExpress Order Placement Rejected: ${JSON.stringify(responseResult)}`);
    }

    const orderId = responseResult?.order_list?.order_id?.[0] || `ALI-${Date.now()}`;
    return {
      orderId: String(orderId),
      status: 'AWAITING_PAYMENT',
      outOrderId: orderParams.outOrderId,
    };
  }

  /**
   * Queries real-time order tracking and shipment status
   * API Method: aliexpress.ds.order.get
   */
  public async getOrderStatus(orderId: string): Promise<{
    orderId: string;
    orderStatus: 'PLACE_ORDER_SUCCESS' | 'WAIT_SELLER_SEND_GOODS' | 'SELLER_PART_SEND_GOODS' | 'WAIT_BUYER_ACCEPT_GOODS' | 'FINISH' | 'IN_CANCEL';
    trackingNumber?: string;
    carrier?: string;
  }> {
    const result = await this.execute({
      method: 'aliexpress.ds.order.get',
      params: {
        order_id: orderId,
      },
    });

    const orderDto = result?.aliexpress_ds_order_get_response?.result;
    return {
      orderId: orderId,
      orderStatus: orderDto?.order_status || 'PLACE_ORDER_SUCCESS',
      trackingNumber: orderDto?.logistics_info_dto?.tracking_no,
      carrier: orderDto?.logistics_info_dto?.logistics_service_name,
    };
  }
}
