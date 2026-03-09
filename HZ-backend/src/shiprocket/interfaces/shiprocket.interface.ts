export interface ShiprocketAuthResponse {
  token: string;
}

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

export interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code: string;
  courier_company_id: number;
  courier_name: string;
}

export interface ShiprocketTrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_company_id: number;
      shipment_id: number;
      order_id: number;
      pickup_date: string;
      delivered_date: string;
      weight: string;
      packages: number;
      current_status: string;
      delivered_to: string;
      destination: string;
      consignee_name: string;
      origin: string;
      courier_agent_details: string | null;
      edd: string | null;
    }>;
    shipment_track_activities: Array<{
      date: string;
      status: string;
      activity: string;
      location: string;
      'sr-status': string;
      'sr-status-label': string;
    }>;
    track_url: string;
    etd: string;
  };
}

export interface ShiprocketServiceabilityResponse {
  data: {
    available_courier_companies: Array<{
      courier_company_id: number;
      courier_name: string;
      freight_charge: number;
      etd: string;
      estimated_delivery_days: string;
      rate: number;
      cod: number;
      rating: number;
    }>;
  };
  status: number;
}

export interface ShiprocketWebhookPayload {
  awb: string;
  courier_name: string;
  current_status: string;
  current_status_id: number;
  shipment_status: string;
  shipment_status_id: number;
  current_timestamp: string;
  order_id?: string;
  etd?: string;
  scans?: Array<{
    location: string;
    date: string;
    activity: string;
    status: string;
  }>;
}

export const SHIPROCKET_STATUS_MAP: Record<number, string> = {
  1: 'PICKUP_SCHEDULED',
  2: 'PICKUP_GENERATED',
  3: 'PICKUP_QUEUED',
  4: 'MANIFEST_GENERATED',
  5: 'PICKUP_EXCEPTION',
  6: 'SHIPPED',
  7: 'DELIVERED',
  8: 'CANCELLED',
  9: 'RTO_INITIATED',
  10: 'RTO_DELIVERED',
  12: 'LOST',
  13: 'PICKUP_ERROR',
  14: 'RTO_ACKNOWLEDGED',
  15: 'OUT_FOR_PICKUP',
  16: 'IN_TRANSIT',
  17: 'OUT_FOR_DELIVERY',
  18: 'SHIPMENT_DELAYED',
  19: 'PARTIALLY_DELIVERED',
  20: 'CONTACT_CUSTOMER',
  21: 'SHIPMENT_HELD',
  22: 'RTO_IN_TRANSIT',
  38: 'REACHED_DESTINATION_HUB',
  39: 'MISROUTED',
  40: 'RTO_NDR',
  41: 'RTO_OFD',
  42: 'PICKED_UP',
  43: 'SELF_FULFILLED',
  44: 'DISPOSED_OFF',
  45: 'CANCELLED_BEFORE_DISPATCHED',
  46: 'RTO_DISPOSED_OFF',
};
