import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ShiprocketOrderPayload,
  ShiprocketOrderResponse,
  ShiprocketTrackingResponse,
  ShiprocketServiceabilityResponse,
  SHIPROCKET_STATUS_MAP,
} from './interfaces/shiprocket.interface';

@Injectable()
export class ShiprocketService {
  private readonly logger = new Logger(ShiprocketService.name);
  private token: string | null = null;
  private tokenExpiresAt: number = 0;
  private readonly apiBase: string;
  private readonly email: string;
  private readonly password: string;
  private readonly channelId: string;

  constructor(private readonly configService: ConfigService) {
    this.apiBase = this.configService.get('SHIPROCKET_API_BASE', 'https://apiv2.shiprocket.in/v1/external');
    this.email = this.configService.get('SHIPROCKET_EMAIL', '');
    this.password = this.configService.get('SHIPROCKET_PASSWORD', '');
    this.channelId = this.configService.get('SHIPROCKET_CHANNEL_ID', '');
  }

  private async authenticate(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    if (!this.email || !this.password) {
      throw new BadRequestException('Shiprocket credentials not configured');
    }

    try {
      const res = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Shiprocket auth failed: ${res.status} ${body}`);
      }

      const data = await res.json();
      this.token = data.token;
      this.tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
      return this.token!;
    } catch (err) {
      this.logger.error(`Shiprocket authentication failed: ${err.message}`);
      throw new BadRequestException('Shiprocket authentication failed');
    }
  }

  private async apiRequest<T>(method: string, path: string, body?: any): Promise<T> {
    const token = await this.authenticate();

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    let url = `${this.apiBase}${path}`;
    if (method === 'GET' && body) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(body)) {
        if (v !== undefined && v !== null) params.append(k, String(v));
      }
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Shiprocket API error [${method} ${path}]: ${res.status} ${text}`);
      throw new BadRequestException(`Shiprocket API error: ${res.status}`);
    }

    return res.json();
  }

  async createOrder(payload: ShiprocketOrderPayload): Promise<ShiprocketOrderResponse> {
    if (this.channelId) {
      payload.channel_id = this.channelId;
    }
    return this.apiRequest<ShiprocketOrderResponse>('POST', '/orders/create/adhoc', payload);
  }

  async generateAWB(shipmentId: number, courierId?: number): Promise<any> {
    const body: any = { shipment_id: shipmentId };
    if (courierId) body.courier_id = courierId;
    return this.apiRequest('POST', '/courier/assign/awb', body);
  }

  async generateLabel(shipmentIds: number[]): Promise<any> {
    return this.apiRequest('POST', '/courier/generate/label', {
      shipment_id: shipmentIds,
    });
  }

  async generateManifest(shipmentIds: number[]): Promise<any> {
    return this.apiRequest('POST', '/manifests/generate', {
      shipment_id: shipmentIds,
    });
  }

  async schedulePickup(shipmentId: number): Promise<any> {
    return this.apiRequest('POST', '/courier/generate/pickup', {
      shipment_id: [shipmentId],
    });
  }

  async trackShipment(awbCode: string): Promise<ShiprocketTrackingResponse> {
    return this.apiRequest('GET', '/courier/track/awb/' + awbCode);
  }

  async trackByShipmentId(shipmentId: number): Promise<ShiprocketTrackingResponse> {
    return this.apiRequest('GET', `/courier/track/shipment/${shipmentId}`);
  }

  async cancelShipment(awbs: string[]): Promise<any> {
    return this.apiRequest('POST', '/orders/cancel', { awbs });
  }

  async checkServiceability(params: {
    pickup_postcode: string;
    delivery_postcode: string;
    weight: number;
    cod?: number;
  }): Promise<ShiprocketServiceabilityResponse> {
    return this.apiRequest('GET', '/courier/serviceability/', {
      pickup_postcode: params.pickup_postcode,
      delivery_postcode: params.delivery_postcode,
      weight: params.weight,
      cod: params.cod ?? 0,
    });
  }

  buildShipmentPayload(order: any): ShiprocketOrderPayload {
    const billing = order.billingDetails ?? {};
    const shipping = order.shippingDetails ?? {};
    const items = (order.items ?? []).map((item: any) => ({
      name: item.name || 'Product',
      sku: item.productId || item.id,
      units: item.quantity ?? 1,
      selling_price: parseFloat(item.sellingPrice || item.itemTotal || '0'),
      discount: parseFloat(item.discountAmount || '0'),
      tax: parseFloat(item.taxAmount || '0'),
    }));

    const isCOD = order.meta?.paymentMethod === 'COD';

    return {
      order_id: order.orderNo || order.id,
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: 'Primary',
      billing_customer_name: billing.name || billing.firstName || 'Customer',
      billing_last_name: billing.lastName || '',
      billing_address: billing.address || billing.addressLine1 || '',
      billing_address_2: billing.addressLine2 || '',
      billing_city: billing.city || '',
      billing_pincode: String(billing.pincode || billing.postalCode || ''),
      billing_state: billing.state || '',
      billing_country: billing.country || 'India',
      billing_email: billing.email || '',
      billing_phone: String(billing.phone || ''),
      shipping_is_billing: !shipping.address,
      shipping_customer_name: shipping.name || undefined,
      shipping_address: shipping.address || shipping.addressLine1 || undefined,
      shipping_address_2: shipping.addressLine2 || undefined,
      shipping_city: shipping.city || undefined,
      shipping_pincode: shipping.pincode ? String(shipping.pincode) : undefined,
      shipping_state: shipping.state || undefined,
      shipping_country: shipping.country || undefined,
      order_items: items,
      payment_method: isCOD ? 'COD' : 'Prepaid',
      sub_total: parseFloat(order.grandTotal || '0'),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };
  }

  mapStatusIdToOrderStatus(statusId: number): string | null {
    const label = SHIPROCKET_STATUS_MAP[statusId];
    if (!label) return null;

    switch (label) {
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'REACHED_DESTINATION_HUB':
        return 'SHIPPED';
      case 'OUT_FOR_DELIVERY':
        return 'OUT_FOR_DELIVERY';
      case 'DELIVERED':
        return 'DELIVERED';
      case 'CANCELLED':
      case 'CANCELLED_BEFORE_DISPATCHED':
        return 'CANCELLED';
      case 'RTO_INITIATED':
      case 'RTO_IN_TRANSIT':
      case 'RTO_DELIVERED':
        return 'RETURN_REQUESTED';
      default:
        return null;
    }
  }
}
