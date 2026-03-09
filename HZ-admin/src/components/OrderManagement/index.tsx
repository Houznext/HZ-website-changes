import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import CustomTooltip from "@/src/common/ToolTip";
import Image from "next/image";
import apiClient from "@/src/utils/apiClient";

import {
  FaBox,
  FaShippingFast,
  FaTruck,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaMapMarkerAlt,
  FaDownload,
  FaMoneyBillWave,
  FaClock,
  FaUser,
  FaRupeeSign,
  FaRedoAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  MdPending,
  MdLocalShipping,
  MdDone,
  MdCancel,
  MdRefresh,
  MdAssignment,
  MdOutlineClose,
} from "react-icons/md";
import CustomDate from "@/src/common/FormElements/CustomDate";
import ShipmentTracker from "./ShipmentTracker";
import toast from "react-hot-toast";

// =====================================================
// BACKEND-ALIGNED ENUMS (match your Nest enums)
// =====================================================
export enum OrderStatusEnum {
  CREATED = "CREATED",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",

  // Physical products
  SHIPPED = "SHIPPED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  RETURNED = "RETURNED",

  // Service orders
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum OrderType {
  STORE = "STORE",
  SERVICE = "SERVICE",
  PROPERTY_PREMIUM = "PROPERTY_PREMIUM",
  PROPERTY_BOOKING = "PROPERTY_BOOKING",
  CUSTOM_BUILDER = "CUSTOM_BUILDER",
  LEGAL = "LEGAL",
  INTERIORS = "INTERIORS",
  ELECTRONICS = "ELECTRONICS",
  FURNITURE = "FURNITURE",
  HOME_DECOR = "HOME_DECOR",
  SOLAR = "SOLAR",
}

// UI-only payment state derived from order.amountDue/amountPaid or meta
export enum UiPaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

// Courier options for delivery integration (Delhivery, Bluedart - cost-effective for e-commerce)
const COURIER_OPTIONS = [
  { id: "Delhivery", label: "Delhivery" },
  { id: "Bluedart", label: "Blue Dart" },
  { id: "DTDC", label: "DTDC" },
  { id: "Other", label: "Other" },
];

const PRODUCT_ORDER_TYPES = new Set<string>([
  OrderType.STORE, OrderType.FURNITURE, OrderType.ELECTRONICS,
  "HOME_DECOR", "MIXED",
]);
const isProductOrder = (o: { type: OrderType | string }) => PRODUCT_ORDER_TYPES.has(String(o.type));

const getTrackingUrl = (courierName: string | undefined, trackingId: string | undefined) => {
  if (!trackingId) return null;
  const c = (courierName || "").toLowerCase();
  if (c.includes("delhivery")) return `https://www.delhivery.com/track/package/${trackingId}`;
  if (c.includes("bluedart") || c.includes("blue dart")) return `https://www.bluedart.com/tracking`;
  if (c.includes("dtdc")) return `https://www.dtdc.in/tracking/tracking_results.asp?strItem=${trackingId}`;
  return null;
};

// Return reasons (match your backend ReturnReasonEnum)
export enum ReturnReasonEnum {
  DAMAGED = "DAMAGED",
  DEFECTIVE = "DEFECTIVE",
  WRONG_ITEM = "WRONG_ITEM",
  MISSING_PARTS = "MISSING_PARTS",
  QUALITY_NOT_AS_EXPECTED = "QUALITY_NOT_AS_EXPECTED",
  SIZE_ISSUE = "SIZE_ISSUE",
  OTHER = "OTHER",
}

// =====================================================
// API TYPES (match your updated entities response)
// =====================================================
type ApiOrderUser = {
  id: number;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

type ApiOrderItem = {
  id: number;
  productType: string;
  productId: number;
  name: string;
  description?: string;
  mrp: string | number;
  sellingPrice: string | number;
  unitDiscount: string | number;
  quantity: number;
  itemSubTotal: string | number;
  taxPercent: string | number;
  taxAmount: string | number;
  discountAmount: string | number;
  itemTotal: string | number;
  snapshot?: any;
  meta?: any;
};

type ApiOrder = {
  id: number;
  orderNo: string;
  status: OrderStatusEnum | string;
  type: OrderType | string;

  currency: string;

  subTotal: string | number;
  discountTotal: string | number;
  couponDiscount: string | number;
  couponCode?: string | null;
  taxTotal: string | number;
  shippingTotal: string | number;
  feeTotal: string | number;
  grandTotal: string | number;

  amountPaid: string | number;
  amountDue: string | number;

  billingDetails?: any;
  shippingDetails?: any;
  serviceDetails?: any;
  taxBreakup?: any;

  statusHistory?: Array<{
    status: string;
    at: string;
    byUserId?: number;
    note?: string;
  }>;

  cancelReason?: string | null;

  returnReason?: ReturnReasonEnum | string | null;
  returnComment?: string | null;
  returnImages?: string[] | null;
  returnRequestedAt?: string | null;
  returnApprovedAt?: string | null;
  returnRejectedAt?: string | null;
  returnRejectedReason?: string | null;
  refundAmount?: string | number | null;

  meta?: Record<string, any> | null;

  createdAt?: string;
  updatedAt?: string;

  items: ApiOrderItem[];
  user?: ApiOrderUser;
  branch?: any;
};
type Address = {
  line1?: string;
  line2?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

type ShippingDetails = {
  deliveryAddress?: Address;
  recipientName?: string;
  recipientPhone?: string;
  instructions?: string;
  courierName?: string;
  trackingId?: string;
  shippedAt?: string;
  deliveredAt?: string;
};

type ServiceDetails = {
  scheduleDate?: string;
  timeSlot?: string;
  siteAddress?: Address;
  assignedToUserId?: number;
  assignedAt?: string;
  serviceStartAt?: string;
  serviceEndAt?: string;
  notes?: string;
};

type UiOrderItem = {
  id: number;
  name: string;
  productId: number;
  productType: string;
  image?: string;
  sku?: string;
  quantity: number;

  mrp: number;
  sellingPrice: number;
  unitDiscount: number;

  itemTotal: number;
};

type BillingDetails = {
  name?: string;
  phone?: string;
  email?: string;
  address?: Address;
};

type UiOrder = {
  id: number;
  orderNo: string;

  type: OrderType | string;
  status: OrderStatusEnum;

  userId?: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  billingDetails?: BillingDetails;

  currency: string;

  subTotal: number;
  discountTotal: number;
  couponDiscount: number;
  couponCode?: string;
  taxTotal: number;
  shippingTotal: number;
  feeTotal: number;
  grandTotal: number;

  amountPaid: number;
  amountDue: number;
  paymentStatus: UiPaymentStatus;

  shippingDetails?: ShippingDetails;
  serviceDetails?: ServiceDetails;

  cancelReason?: string;

  returnReason?: string;
  returnComment?: string;
  returnImages?: string[];
  returnRequestedAt?: Date | null;
  returnApprovedAt?: Date | null;
  returnRejectedAt?: Date | null;
  returnRejectedReason?: string | null;
  refundAmount?: number | null;

  createdAt?: Date;
  updatedAt?: Date;

  items: UiOrderItem[];

  statusHistory?: ApiOrder["statusHistory"];
};

// =====================================================
// HELPERS
// =====================================================
const toNum = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const isValidStatus = (s: any): s is OrderStatusEnum =>
  Object.values(OrderStatusEnum).includes(s);

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getUiPaymentStatus = (o: ApiOrder): UiPaymentStatus => {
  const meta = o.meta || {};
  const metaPayment = (meta.paymentStatus || meta.payment_state || "") as string;
  const upper = metaPayment.toUpperCase();

  if (upper === "PAID" || upper === "SUCCESS") return UiPaymentStatus.PAID;
  if (upper === "FAILED") return UiPaymentStatus.FAILED;
  if (upper === "REFUNDED") return UiPaymentStatus.REFUNDED;

  // derive from amountDue
  const due = toNum(o.amountDue);
  const paid = toNum(o.amountPaid);

  if (due <= 0 && paid > 0) return UiPaymentStatus.PAID;
  return UiPaymentStatus.PENDING;
};

const mapApiOrderToUiOrder = (o: ApiOrder): UiOrder => {
  const statusRaw = (o.status || OrderStatusEnum.CREATED) as any;
  const status = isValidStatus(statusRaw)
    ? statusRaw
    : OrderStatusEnum.CREATED;

  const shippingDetails: ShippingDetails | undefined = o.shippingDetails
    ? {
      deliveryAddress: o.shippingDetails.deliveryAddress || {},
      recipientName: o.shippingDetails.recipientName,
      recipientPhone: o.shippingDetails.recipientPhone,
      instructions: o.shippingDetails.instructions,
      courierName: o.shippingDetails.courierName,
      trackingId: o.shippingDetails.trackingId,
      shippedAt: o.shippingDetails.shippedAt,
      deliveredAt: o.shippingDetails.deliveredAt,
    }
    : undefined;

  const serviceDetails: ServiceDetails | undefined = o.serviceDetails
    ? {
      scheduleDate: o.serviceDetails.scheduleDate,
      timeSlot: o.serviceDetails.timeSlot,
      siteAddress: o.serviceDetails.siteAddress || {},
      assignedToUserId: o.serviceDetails.assignedToUserId,
      assignedAt: o.serviceDetails.assignedAt,
      serviceStartAt: o.serviceDetails.serviceStartAt,
      serviceEndAt: o.serviceDetails.serviceEndAt,
      notes: o.serviceDetails.notes,
    }
    : undefined;

  const items: UiOrderItem[] = (o.items || []).map((it) => {
    const meta = it.meta || {};
    const snap = it.snapshot || {};

    return {
      id: it.id,
      name: it.name,
      productId: it.productId,
      productType: it.productType,
      image: meta.image || snap.image,
      sku: snap.sku || meta.sku,
      quantity: it.quantity,

      mrp: toNum(it.mrp),
      sellingPrice: toNum(it.sellingPrice),
      unitDiscount: toNum(it.unitDiscount),

      itemTotal: toNum(it.itemTotal),
    };
  });

  const billingDetails: BillingDetails | undefined = o.billingDetails
    ? {
      name: o.billingDetails.name,
      phone: o.billingDetails.phone,
      email: o.billingDetails.email,
      address: o.billingDetails.address || {},
    }
    : undefined;

  return {
    id: o.id,
    orderNo: o.orderNo || `OC-${o.id}`,
    type: o.type,
    status,

    userId: o.user?.id,
    userName: o.user?.fullName || o.user?.name || o.billingDetails?.name,
    userEmail: o.user?.email || o.billingDetails?.email,
    userPhone: o.user?.phone || o.billingDetails?.phone,
    billingDetails,

    currency: o.currency || "INR",

    subTotal: toNum(o.subTotal),
    discountTotal: toNum(o.discountTotal),
    couponDiscount: toNum(o.couponDiscount),
    couponCode: o.couponCode ?? undefined,
    taxTotal: toNum(o.taxTotal),
    shippingTotal: toNum(o.shippingTotal),
    feeTotal: toNum(o.feeTotal),
    grandTotal: toNum(o.grandTotal),

    amountPaid: toNum(o.amountPaid),
    amountDue: toNum(o.amountDue),
    paymentStatus: getUiPaymentStatus(o),

    shippingDetails,
    serviceDetails,

    cancelReason: o.cancelReason ?? undefined,

    returnReason: o.returnReason ?? undefined,
    returnComment: o.returnComment ?? undefined,
    returnImages: o.returnImages ?? undefined,
    returnRequestedAt: o.returnRequestedAt ? new Date(o.returnRequestedAt) : null,
    returnApprovedAt: o.returnApprovedAt ? new Date(o.returnApprovedAt) : null,
    returnRejectedAt: o.returnRejectedAt ? new Date(o.returnRejectedAt) : null,
    returnRejectedReason: o.returnRejectedReason ?? null,
    refundAmount:
      o.refundAmount !== null && o.refundAmount !== undefined
        ? toNum(o.refundAmount)
        : null,

    createdAt: o.createdAt ? new Date(o.createdAt) : undefined,
    updatedAt: o.updatedAt ? new Date(o.updatedAt) : undefined,

    items,

    statusHistory: o.statusHistory || [],
  };
};

// =====================================================
// FILTERS STATE
// =====================================================
type FilterState = {
  page: number;
  limit: number;
  status?: OrderStatusEnum;
  type?: OrderType;
  city?: string;
  state?: string;
  branchId?: number;
  userId?: number;
  q?: string;
  sortBy?: "createdAt" | "grandTotal" | "orderNo" | "status" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
  datePreset?: "last7days" | "last30days" | "last90days";
};

// =====================================================
// COMPONENT
// =====================================================
const OrderManagementPortal = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UiOrder | null>(null);

  const [allData, setAllData] = useState<UiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  // ---------- Status Modal ----------
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatusEnum>(OrderStatusEnum.PENDING);
  const [statusNotes, setStatusNotes] = useState("");
  const [statusCourier, setStatusCourier] = useState("");
  const [statusTrackingId, setStatusTrackingId] = useState("");
  const [shippingViaShiprocket, setShippingViaShiprocket] = useState(false);

  // ---------- Cancel Modal ----------
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // ---------- Return Request / Process ----------
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const [returnMode, setReturnMode] = useState<"REQUEST" | "PROCESS">("REQUEST");
  const [returnReason, setReturnReason] = useState<ReturnReasonEnum>(ReturnReasonEnum.DAMAGED);
  const [returnComment, setReturnComment] = useState("");
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [processApprove, setProcessApprove] = useState(true);
  const [processRejectionReason, setProcessRejectionReason] = useState("");

  // ---------- Payment audit & refund ----------
  const [auditReport, setAuditReport] = useState<{
    summary?: Record<string, { count: number; totalAmount: number }>;
    byOrderType?: Record<string, { successAmount: number; refundAmount: number; count: number }>;
  } | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({ startDate: "", endDate: "", orderType: "" });
  const [orderPayments, setOrderPayments] = useState<any[]>([]);
  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // ---------- Order queries ----------
  const [orderQueries, setOrderQueries] = useState<any[]>([]);
  const [allQueries, setAllQueries] = useState<any[]>([]);
  const [openQueryReplyModal, setOpenQueryReplyModal] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [queryReplyText, setQueryReplyText] = useState("");
  const [queryStatus, setQueryStatus] = useState("ANSWERED");
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "audit" | "queries">("orders");

  // =====================================================
  // OPTIONS
  // =====================================================
  const statusOptions = useMemo(
    () =>
      Object.values(OrderStatusEnum).map((s) => ({
        id: s,
        label: titleCase(s),
      })),
    []
  );

  const typeOptions = useMemo(
    () =>
      Object.values(OrderType).map((t) => ({
        id: t,
        label: titleCase(t),
      })),
    []
  );

  const returnReasonOptions = useMemo(
    () =>
      Object.values(ReturnReasonEnum).map((r) => ({
        id: r,
        label: titleCase(r),
      })),
    []
  );

  const cityData = useMemo(() => {
    const cities = [
      ...new Set(
        allData
          .map((o) => o.shippingDetails?.deliveryAddress?.city || o.billingDetails?.address?.city)
          .filter(Boolean)
          .map(String)
      ),
    ];
    return cities.map((c) => ({ id: c, label: c }));
  }, [allData]);

  const stateData = useMemo(() => {
    const states = [
      ...new Set(
        allData
          .map((o) => o.shippingDetails?.deliveryAddress?.state || o.billingDetails?.address?.state)
          .filter(Boolean)
          .map(String)
      ),
    ];
    return states.map((s) => ({ id: s, label: s }));
  }, [allData]);

  const sortByOptions = useMemo(
    () => [
      { id: "createdAt", label: "Date (Newest)", sortOrder: "DESC" as const },
      { id: "createdAt", label: "Date (Oldest)", sortOrder: "ASC" as const },
      { id: "grandTotal", label: "Amount (High → Low)", sortOrder: "DESC" as const },
      { id: "grandTotal", label: "Amount (Low → High)", sortOrder: "ASC" as const },
      { id: "orderNo", label: "Order # (A-Z)", sortOrder: "ASC" as const },
      { id: "orderNo", label: "Order # (Z-A)", sortOrder: "DESC" as const },
      { id: "status", label: "Status (A-Z)", sortOrder: "ASC" as const },
      { id: "updatedAt", label: "Last Updated (Newest)", sortOrder: "DESC" as const },
    ],
    []
  );

  const datePresetOptions = useMemo(
    () => [
      { id: "", label: "All time" },
      { id: "last7days", label: "Last 7 days" },
      { id: "last30days", label: "Last 30 days" },
      { id: "last90days", label: "Last 90 days" },
    ],
    []
  );

  // =====================================================
  // STATS
  // =====================================================
  const statistics = useMemo(() => {
    const totalOrders = allData.length;
    const pendingOrders = allData.filter(
      (o) => o.status === OrderStatusEnum.PENDING || o.status === OrderStatusEnum.CREATED
    ).length;
    const confirmedOrders = allData.filter((o) => o.status === OrderStatusEnum.CONFIRMED).length;
    const shippedOrders = allData.filter((o) => o.status === OrderStatusEnum.SHIPPED).length;
    const deliveredOrders = allData.filter((o) => o.status === OrderStatusEnum.DELIVERED).length;
    const cancelledOrders = allData.filter((o) => o.status === OrderStatusEnum.CANCELLED).length;

    const totalRevenue = allData
      .filter((o) => o.paymentStatus === UiPaymentStatus.PAID)
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue,
    };
  }, [allData]);

  // =====================================================
  // API CALLS
  // =====================================================
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, any> = {
        page: filters.page,
        limit: filters.limit,
      };

      if (searchQuery) params.search = searchQuery;

      // From UI filters (ReusableSearchFilter stores labels)
      if (selectedFilters.statusData?.length) params.status = selectedFilters.statusData[0];
      if (selectedFilters.typeData?.length) params.type = selectedFilters.typeData[0];
      if (selectedFilters.cityData?.length) params.city = selectedFilters.cityData[0];
      if (selectedFilters.stateData?.length) params.state = selectedFilters.stateData[0];
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.datePreset) params.datePreset = filters.datePreset;

      // NOTE: backend FilterOrdersDto supports: status, type, userId, branchId, page, limit, search, sortBy, sortOrder, datePreset
      // city/state filters can be added server-side by reading shippingDetails.deliveryAddress.city/state via querybuilder
      // If you haven't added them yet, keep them as "search" or ignore on backend.
      // params.city / params.state will safely be ignored if not implemented.

      const res = await apiClient.get(apiClient.URLS.orders, params, true);

      const body = res.body || res.data || {};
      const raw = (body.data ?? body) as ApiOrder[];

      const mapped = Array.isArray(raw) ? raw.map(mapApiOrderToUiOrder) : [];
      setAllData(mapped);

      // your API returns {data,total,page,limit}
      setTotalCount(body.total ?? res.total ?? mapped.length);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.datePreset, searchQuery, selectedFilters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const refreshOneOrder = async (orderId: number) => {
    try {
      const res = await apiClient.get(`${apiClient.URLS.orders}/${orderId}`, {}, true);
      const updated = mapApiOrderToUiOrder(res.body as ApiOrder);
      setAllData((prev) => prev.map((x) => (x.id === orderId ? updated : x)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
    } catch (e) {
      console.error("Failed to refresh order:", e);
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    status: OrderStatusEnum,
    note?: string,
    courierName?: string,
    trackingId?: string
  ) => {
    try {
      setLoading(true);
      const body: Record<string, unknown> = { status, note };
      if (courierName) body.courierName = courierName;
      if (trackingId) body.trackingId = trackingId;
      const res = await apiClient.patch(
        `${apiClient.URLS.orders}/${orderId}/status`,
        body,
        true
      );
      const updated = mapApiOrderToUiOrder(res.body as ApiOrder);
      setAllData((prev) => prev.map((x) => (x.id === orderId ? updated : x)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);

      setOpenStatusModal(false);
      setStatusNotes("");
      setStatusCourier("");
      setStatusTrackingId("");
    } catch (e) {
      console.error("Failed to update order status:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShipViaShiprocket = async (orderId: number) => {
    setShippingViaShiprocket(true);
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.shiprocket}/create-shipment`,
        { orderId: String(orderId) },
        true
      );
      if (res.body?.success) {
        toast.success(`Shipment created! AWB: ${res.body.awbCode || "N/A"}, Courier: ${res.body.courierName || "Auto"}`);
        refreshOneOrder(orderId);
      } else {
        toast.error("Shipment creation returned unexpected response");
      }
    } catch (e: any) {
      toast.error(e?.body?.message || "Failed to create Shiprocket shipment");
    } finally {
      setShippingViaShiprocket(false);
    }
  };

  const handlePrintLabel = async (shipmentId: number) => {
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.shiprocket}/generate-label`,
        { shipmentIds: [shipmentId] },
        true
      );
      if (res.body?.label_url) {
        window.open(res.body.label_url, "_blank");
      } else {
        toast.success("Label generated");
      }
    } catch {
      toast.error("Failed to generate label");
    }
  };

  const handlePrintManifest = async (shipmentId: number) => {
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.shiprocket}/generate-manifest`,
        { shipmentIds: [shipmentId] },
        true
      );
      if (res.body?.manifest_url) {
        window.open(res.body.manifest_url, "_blank");
      } else {
        toast.success("Manifest generated");
      }
    } catch {
      toast.error("Failed to generate manifest");
    }
  };

  const cancelOrder = async (orderId: number, reason: string) => {
    try {
      setLoading(true);
      // backend: DELETE /orders/:id/cancel  (body: {reason})
      const res = await apiClient.delete(`${apiClient.URLS.orders}/${orderId}/cancel`, { reason }, true);

      const updated = mapApiOrderToUiOrder(res.body as ApiOrder);
      setAllData((prev) => prev.map((x) => (x.id === orderId ? updated : x)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);

      setOpenCancelModal(false);
      setCancelReason("");
    } catch (e) {
      console.error("Failed to cancel order:", e);
    } finally {
      setLoading(false);
    }
  };

  // Return Request (user-like flow) / Process Return (admin)
  const submitReturn = async () => {
    if (!selectedOrderId) return;

    try {
      setLoading(true);

      if (returnMode === "REQUEST") {
        const res = await apiClient.post(
          `${apiClient.URLS.orders}/${selectedOrderId}/return`,
          {
            reason: returnReason,
            comment: returnComment || undefined,
            images: returnImages.filter(Boolean),
          },
          true
        );

        const updated = mapApiOrderToUiOrder(res.body as ApiOrder);
        setAllData((prev) => prev.map((x) => (x.id === selectedOrderId ? updated : x)));
        if (selectedOrder?.id === selectedOrderId) setSelectedOrder(updated);
      } else {
        const res = await apiClient.patch(
          `${apiClient.URLS.orders}/${selectedOrderId}/return/process`,
          {
            approve: processApprove,
            rejectionReason: processApprove ? undefined : processRejectionReason || "Not eligible",
          },
          true
        );

        const updated = mapApiOrderToUiOrder(res.body as ApiOrder);
        setAllData((prev) => prev.map((x) => (x.id === selectedOrderId ? updated : x)));
        if (selectedOrder?.id === selectedOrderId) setSelectedOrder(updated);
      }

      setOpenReturnModal(false);
      setReturnComment("");
      setReturnImages([]);
      setProcessRejectionReason("");
    } catch (e) {
      console.error("Return flow failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Payment audit report ----------
  const fetchAuditReport = useCallback(async () => {
    setAuditLoading(true);
    try {
      const params: Record<string, string> = {};
      if (auditFilters.startDate) params.startDate = auditFilters.startDate;
      if (auditFilters.endDate) params.endDate = auditFilters.endDate;
      if (auditFilters.orderType) params.orderType = auditFilters.orderType;
      const qs = new URLSearchParams(params).toString();
      const res = await apiClient.get(
        `${apiClient.URLS.payments}/admin/audit-report${qs ? `?${qs}` : ""}`,
        {},
        true
      );
      setAuditReport(res.body || null);
    } catch (e) {
      console.error("Failed to fetch payment audit:", e);
    } finally {
      setAuditLoading(false);
    }
  }, [auditFilters.startDate, auditFilters.endDate, auditFilters.orderType]);

  // ---------- Payments for order (drawer) ----------
  const fetchOrderPayments = useCallback(async (orderId: string | number) => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.payments}/by-order/${orderId}`,
        {},
        true
      );
      setOrderPayments(Array.isArray(res.body) ? res.body : []);
    } catch (e) {
      setOrderPayments([]);
    }
  }, []);

  const submitRefund = async () => {
    if (!refundPaymentId) return;
    try {
      setLoading(true);
      const body: Record<string, string> = {};
      if (refundAmount.trim()) body.amount = refundAmount.trim();
      if (refundReason.trim()) body.reason = refundReason.trim();
      await apiClient.post(
        `${apiClient.URLS.payments}/${refundPaymentId}/refund`,
        body,
        true
      );
      setOpenRefundModal(false);
      setRefundPaymentId(null);
      setRefundAmount("");
      setRefundReason("");
      if (selectedOrder) fetchOrderPayments(selectedOrder.id);
      if (selectedOrder) refreshOneOrder(selectedOrder.id);
      setActionFeedback({ message: "Refund submitted successfully.", type: "success" });
    } catch (e) {
      console.error("Refund failed:", e);
      setActionFeedback({ message: "Refund failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ---------- Order queries ----------
  const fetchOrderQueries = useCallback(async (orderId: string | number) => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.orders}/${orderId}/queries`,
        {},
        true
      );
      setOrderQueries(Array.isArray(res.body) ? res.body : []);
    } catch (e) {
      setOrderQueries([]);
    }
  }, []);

  const fetchAllQueries = useCallback(async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.orders}/queries/all`,
        {},
        true
      );
      setAllQueries(Array.isArray(res.body) ? res.body : []);
    } catch (e) {
      setAllQueries([]);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "audit" && !auditReport) fetchAuditReport();
  }, [activeTab, auditReport, fetchAuditReport]);

  useEffect(() => {
    if (activeTab === "queries") fetchAllQueries();
  }, [activeTab, fetchAllQueries]);

  useEffect(() => {
    if (openDrawer && selectedOrder) {
      fetchOrderPayments(selectedOrder.id);
      fetchOrderQueries(selectedOrder.id);
    }
  }, [openDrawer, selectedOrder?.id, fetchOrderPayments, fetchOrderQueries]);

  useEffect(() => {
    if (!actionFeedback) return;
    const t = setTimeout(() => setActionFeedback(null), 3000);
    return () => clearTimeout(t);
  }, [actionFeedback]);

  const submitQueryReply = async () => {
    if (!selectedQueryId) return;
    try {
      setLoading(true);
      await apiClient.patch(
        `${apiClient.URLS.orders}/queries/${selectedQueryId}`,
        { reply: queryReplyText, status: queryStatus },
        true
      );
      setOpenQueryReplyModal(false);
      setSelectedQueryId(null);
      setQueryReplyText("");
      if (selectedOrder) fetchOrderQueries(selectedOrder.id);
      fetchAllQueries();
      setActionFeedback({ message: "Reply sent successfully.", type: "success" });
    } catch (e) {
      console.error("Query reply failed:", e);
      setActionFeedback({ message: "Failed to send reply. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI HELPERS
  // =====================================================
  const renderStatusBadge = (status: OrderStatusEnum) => {
    const map: Record<OrderStatusEnum, { bg: string; text: string; icon: JSX.Element }> = {
      [OrderStatusEnum.CREATED]: { bg: "bg-gray-100", text: "text-gray-800", icon: <FaClock /> },
      [OrderStatusEnum.PENDING]: { bg: "bg-yellow-100", text: "text-yellow-800", icon: <MdPending /> },
      [OrderStatusEnum.CONFIRMED]: { bg: "bg-blue-100", text: "text-blue-800", icon: <FaCheckCircle /> },
      [OrderStatusEnum.CANCELLED]: { bg: "bg-red-100", text: "text-red-800", icon: <MdCancel /> },

      [OrderStatusEnum.SHIPPED]: { bg: "bg-indigo-100", text: "text-indigo-800", icon: <MdLocalShipping /> },
      [OrderStatusEnum.OUT_FOR_DELIVERY]: { bg: "bg-teal-100", text: "text-teal-800", icon: <FaTruck /> },
      [OrderStatusEnum.DELIVERED]: { bg: "bg-green-100", text: "text-green-800", icon: <MdDone /> },
      [OrderStatusEnum.RETURN_REQUESTED]: { bg: "bg-orange-100", text: "text-orange-800", icon: <FaRedoAlt /> },
      [OrderStatusEnum.RETURNED]: { bg: "bg-orange-100", text: "text-orange-800", icon: <MdRefresh /> },

      [OrderStatusEnum.ASSIGNED]: { bg: "bg-purple-100", text: "text-purple-800", icon: <MdAssignment /> },
      [OrderStatusEnum.IN_PROGRESS]: { bg: "bg-purple-100", text: "text-purple-800", icon: <MdAssignment /> },
      [OrderStatusEnum.COMPLETED]: { bg: "bg-green-100", text: "text-green-800", icon: <MdDone /> },
    };

    const c = map[status] ?? map[OrderStatusEnum.CREATED];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 ${c.bg} ${c.text} text-xs rounded-full font-medium`}
      >
        {c.icon}
        {titleCase(status)}
      </span>
    );
  };

  const renderPaymentBadge = (status: UiPaymentStatus) => {
    const cfg: Record<UiPaymentStatus, { bg: string; text: string }> = {
      [UiPaymentStatus.PENDING]: { bg: "bg-yellow-100", text: "text-yellow-800" },
      [UiPaymentStatus.PAID]: { bg: "bg-green-100", text: "text-green-800" },
      [UiPaymentStatus.FAILED]: { bg: "bg-red-100", text: "text-red-800" },
      [UiPaymentStatus.REFUNDED]: { bg: "bg-gray-100", text: "text-gray-800" },
    };

    const c = cfg[status];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 ${c.bg} ${c.text} text-xs rounded-full font-medium`}
      >
        {titleCase(status)}
      </span>
    );
  };

  const totalPages = Math.ceil((totalCount || 0) / (filters.limit || 20));

  const openViewDrawer = (order: UiOrder) => {
    setSelectedOrder(order);
    setOpenDrawer(true);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canCancel = (o: UiOrder) =>
    o.status === OrderStatusEnum.CREATED || o.status === OrderStatusEnum.PENDING;

  const canUpdateStatus = (o: UiOrder) =>
    ![OrderStatusEnum.CANCELLED, OrderStatusEnum.RETURNED].includes(o.status);

  const canRequestReturn = (o: UiOrder) =>
    o.status === OrderStatusEnum.DELIVERED &&
    o.paymentStatus === UiPaymentStatus.PAID &&
    !o.returnRequestedAt &&
    !o.returnApprovedAt;

  const canProcessReturn = (o: UiOrder) =>
    o.status === OrderStatusEnum.RETURN_REQUESTED || !!o.returnRequestedAt;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="min-h-screen w-full bg-gray-50 md:p-6 p-3">
      {loading && (
        <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-white/50 flex justify-center items-center">
          <Image src="/icons/loader.svg" alt="Loading" width={80} height={80} />
        </div>
      )}

      {/* Header + Stats */}
      <div className="bg-white min-w-full rounded-lg shadow-sm md:p-6 p-4 mb-6">
        <div className="flex md:flex-row flex-col justify-between md:items-center items-start mb-6 gap-4">
          <div>
            <h1 className="md:text-3xl text-xl font-bold text-gray-800 flex items-center gap-3">
              <FaShippingFast className="text-blue-[#5297ff]" />
              Order Management
            </h1>
            <p className="md:label-text text-xs text-gray-500 mt-1">
              Unified orders: Furniture, Electronics, Services, Legal, Property Premium & more.
            </p>
          </div>

          <div className="flex gap-2 md:gap-3 flex-wrap">
            <Button
              className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 md:label-text text-xs font-medium"
              onClick={() => {
                // TODO: export
              }}
            >
              <FaDownload className="text-xs" />
              <span className="hidden md:inline">Export</span>
            </Button>

            <Button
              className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 md:label-text text-xs font-medium text-blue-700"
              onClick={() => fetchOrders()}
            >
              <MdRefresh className="text-xs" />
              <span className="hidden md:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Tabs: Orders | Payment audit | Queries */}
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === "orders"
              ? "border-[#5297ff] text-[#5297ff] bg-blue-50/50"
              : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === "audit"
              ? "border-[#5297ff] text-[#5297ff] bg-blue-50/50"
              : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            Payment audit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("queries")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === "queries"
              ? "border-[#5297ff] text-[#5297ff] bg-blue-50/50"
              : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            Order queries
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm ${actionFeedback.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {actionFeedback.message}
        </div>
      )}

      {/* Stats - only on Orders tab */}
      {activeTab === "orders" && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 md:p-2 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <FaBox className="text-blue-[#5297ff] md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.totalOrders}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Total Orders
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 md:p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <MdPending className="text-yellow-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.pendingOrders}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Pending
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <FaCheckCircle className="text-blue-[#5297ff] md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.confirmedOrders}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Confirmed
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 md:p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <FaTruck className="text-indigo-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.shippedOrders}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Shipped
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 md:p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <MdDone className="text-green-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.deliveredOrders}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Delivered
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 md:p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <MdCancel className="text-red-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.cancelledOrders}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Cancelled
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-purple-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              ₹{Math.round(statistics.totalRevenue).toLocaleString()}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Revenue
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-3 md:p-4 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between mb-2">
              <FaMoneyBillWave className="text-teal-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              ₹{Math.round(statistics.avgOrderValue).toLocaleString()}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Avg Order
            </p>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <CustomDate
                type="date"
                className="px-3  border label-text rounded text-sm"
                value={auditFilters.startDate}
                onChange={(e) => setAuditFilters((p) => ({ ...p, startDate: e.target.value }))}
                placeholder="Start"
              />
            </div>
            <div>
              <CustomDate
                type="date"
                className="px-3  border label-text rounded text-sm"
                value={auditFilters.endDate}
                onChange={(e) => setAuditFilters((p) => ({ ...p, endDate: e.target.value }))}
                placeholder="End"
              />
            </div>
            <select
              className="px-3 py-1.5 border label-text rounded text-sm"
              value={auditFilters.orderType}
              onChange={(e) => setAuditFilters((p) => ({ ...p, orderType: e.target.value }))}
            >
              <option value="">All types</option>
              {typeOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <Button
              className="px-4 py-1.5 label-text rounded bg-[#5297ff] text-white text-sm"
              onClick={fetchAuditReport}
              disabled={auditLoading}
            >
              {auditLoading ? "Loading..." : "Fetch report"}
            </Button>
          </div>
          {auditReport && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium text-gray-800 mb-2 label-text">By event</h3>
                <ul className="text-sm space-y-1">
                  {auditReport?.summary && Object.entries(auditReport?.summary).map(([ev, v]) => (
                    <li key={ev} className="flex justify-between">
                      <span>{ev.replace(/_/g, " ")}</span>
                      <span>{v.count} · ₹{v.totalAmount.toLocaleString("en-IN")}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium text-gray-800 mb-2">By order type (source)</h3>
                <ul className="text-sm space-y-1">
                  {auditReport?.byOrderType && Object.entries(auditReport?.byOrderType).map(([typ, v]) => (
                    <li key={typ} className="flex justify-between flex-wrap gap-x-2">
                      <span>{typ}</span>
                      <span>₹{v.successAmount.toLocaleString("en-IN")} success · ₹{v.refundAmount.toLocaleString("en-IN")} refund · {v.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "queries" && (
        <div className="mb-6">
          <Button
            className="mb-3 px-3 py-1.5 rounded bg-gray-100 text-sm"
            onClick={fetchAllQueries}
          >
            Refresh queries
          </Button>
          <div className="bg-white rounded border divide-y max-h-[60vh] overflow-y-auto">
            {allQueries.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No order queries yet.</p>
            ) : (
              allQueries.map((q: any) => (
                <div key={q.id} className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{q.subject}</p>
                      <p className="text-xs text-gray-500">Order: {q.order?.orderNo || q.orderId} · {q.status}</p>
                      <p className="text-sm text-gray-700 mt-1">{q.message}</p>
                      {q.adminReplies?.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1">
                          {q.adminReplies.map((r: any, i: number) => (
                            <p key={i} className="text-xs text-gray-600"><strong>Reply:</strong> {r.message}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    {q.status !== "CLOSED" && (
                      <Button
                        className="shrink-0 px-2 py-1 text-xs rounded bg-[#5297ff] text-white"
                        onClick={() => {
                          setSelectedQueryId(q.id);
                          setQueryReplyText("");
                          setQueryStatus(q.status === "OPEN" ? "ANSWERED" : q.status);
                          setOpenQueryReplyModal(true);
                        }}
                      >
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex md:flex-row flex-col gap-3">
            <div className="flex-1">
              <ReusableSearchFilter
                searchText={searchQuery}
                placeholder="Search: Order No, customer name, phone..."
                className="label-text"
                onSearchChange={(t: string) => {
                  setSearchQuery(t);
                  setFilters((p) => ({ ...p, page: 1 }));
                }}
                filters={[
                  {
                    groupLabel: "Order Status",
                    key: "statusData",
                    options: statusOptions.map((x) => ({ id: x.id, label: x.label })),
                  },
                  {
                    groupLabel: "Order Type",
                    key: "typeData",
                    options: typeOptions.map((x) => ({ id: x.id, label: x.label })),
                  },
                  {
                    groupLabel: "City",
                    key: "cityData",
                    options: cityData.map((x) => ({ id: x.id, label: x.label })),
                  },
                  {
                    groupLabel: "State",
                    key: "stateData",
                    options: stateData.map((x) => ({ id: x.id, label: x.label })),
                  },
                ]}
                selectedFilters={selectedFilters}
                onFilterChange={(f: any) => {
                  setSelectedFilters(f);
                  setFilters((p) => ({ ...p, page: 1 }));
                }}
                rootCls="md:mb-0"
              />

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Sort:</span>
                  <SingleSelect
                    type="single-select"
                    name="sortBy"
                    optionsInterface={{ isObj: false }}
                    options={sortByOptions.map((x) => x.label)}
                    selectedOption={
                      sortByOptions.find(
                        (x) => x.id === filters.sortBy && x.sortOrder === filters.sortOrder
                      )?.label || sortByOptions[0]?.label
                    }
                    handleChange={(_n, value) => {
                      const opt = sortByOptions.find((x) => x.label === value);
                      if (opt) setFilters((p) => ({ ...p, sortBy: opt.id as FilterState["sortBy"], sortOrder: opt.sortOrder, page: 1 }));
                    }}
                    placeholder="Sort by"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Date:</span>
                  <SingleSelect
                    type="single-select"
                    name="datePreset"
                    optionsInterface={{ isObj: false }}
                    options={datePresetOptions.map((x) => x.label)}
                    selectedOption={
                      datePresetOptions.find((x) => x.id === (filters.datePreset || ""))?.label || "All time"
                    }
                    handleChange={(_n, value) => {
                      const opt = datePresetOptions.find((x) => x.label === value);
                      setFilters((p) => ({ ...p, datePreset: (opt?.id || undefined) as FilterState["datePreset"], page: 1 }));
                    }}
                    placeholder="Date range"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {allData.length === 0 ? (
              <div className="md:p-12 p-8 text-center text-gray-500">
                <FaBox className="mx-auto md:text-6xl text-4xl text-gray-300 mb-4" />
                <p className="md:sub-heading text-base font-medium">No orders found</p>
                <p className="md:label-text text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 bg-gray-50 hidden md:block">
                  <div className="grid grid-cols-12 gap-4 p-4 label-text font-medium text-gray-600">
                    <div className="col-span-2">Order</div>
                    <div className="col-span-2">Customer</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-1">Payment</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {allData.map((order) => {
                    const addr = order.shippingDetails?.deliveryAddress || order.billingDetails?.address;
                    const city = addr?.city || "—";
                    const state = addr?.state || "—";
                    const pincode = addr?.pincode || "";
                    const locality = addr?.locality || addr?.line1 || "";
                    const fullAddressStr = addr
                      ? [addr.line1, addr.line2, addr.locality, [addr.city, addr.state, addr.pincode].filter(Boolean).join(" ")].filter(Boolean).join(", ")
                      : "";
                    const customerName = order.shippingDetails?.recipientName || order.userName || order.billingDetails?.name || "Customer";
                    const customerPhone = order.shippingDetails?.recipientPhone || order.userPhone || order.billingDetails?.phone || "—";
                    const firstItemImage = order.items?.[0]?.image;

                    return (
                      <div
                        key={order.id}
                        className="grid md:grid-cols-12 grid-cols-1 gap-4 md:p-4 p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="md:hidden space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            {firstItemImage ? (
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <Image src={firstItemImage} alt="" fill className="object-cover" sizes="56px" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-400">
                                <FaBox className="text-xl" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-blue-[#5297ff]">#{order.orderNo}</p>
                              <p className="text-xs text-gray-500">
                                {order.createdAt ? order.createdAt.toLocaleDateString() : "--"}
                              </p>
                              <p className="text-xs text-gray-500">{titleCase(String(order.type))}</p>
                            </div>
                            <div className="text-right shrink-0">{renderStatusBadge(order.status)}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400 text-xs shrink-0" />
                            <div className="min-w-0">
                              <p className="label-text font-medium">{customerName}</p>
                              <p className="text-xs text-gray-500">{customerPhone}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2" title={fullAddressStr || undefined}>
                            <FaMapMarkerAlt className="text-gray-400 text-xs shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600">
                              {fullAddressStr || "Address not provided"}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t">
                            <div>
                              <p className="text-xs text-gray-500">Grand Total</p>
                              <p className="font-bold text-gray-900">
                                ₹{order.grandTotal.toLocaleString()}
                              </p>
                            </div>
                            <div>{renderPaymentBadge(order.paymentStatus)}</div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1 py-1.5 rounded-lg bg-blue-[#5297ff] hover:bg-blue-[#5297ff] text-white text-xs font-medium"
                              onClick={() => openViewDrawer(order)}
                            >
                              View Details
                            </Button>

                            {canUpdateStatus(order) && (
                              <Button
                                className="px-3 py-1.5 rounded-lg border border-blue-[#5297ff] text-blue-[#5297ff] hover:bg-blue-50 text-xs font-medium"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setNewStatus(order.status);
                                  setStatusCourier(order.shippingDetails?.courierName || "");
                                  setStatusTrackingId(order.shippingDetails?.trackingId || "");
                                  setOpenStatusModal(true);
                                }}
                              >
                                Update
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {canCancel(order) && (
                              <Button
                                className="flex-1 py-1.5 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 text-xs font-medium"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setOpenCancelModal(true);
                                }}
                              >
                                Cancel
                              </Button>
                            )}

                            {canRequestReturn(order) && (
                              <Button
                                className="flex-1 py-1.5 rounded-lg border border-orange-400 text-orange-700 hover:bg-orange-50 text-xs font-medium"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setReturnMode("REQUEST");
                                  setOpenReturnModal(true);
                                }}
                              >
                                Request Return
                              </Button>
                            )}

                            {canProcessReturn(order) && (
                              <Button
                                className="flex-1 py-1.5 rounded-lg border border-purple-400 text-purple-700 hover:bg-purple-50 text-xs font-medium"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setReturnMode("PROCESS");
                                  setProcessApprove(true);
                                  setOpenReturnModal(true);
                                }}
                              >
                                Process Return
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="hidden md:flex md:col-span-2 gap-3 items-start">
                          {order.items?.[0]?.image ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <Image
                                src={order.items[0].image}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-400">
                              <FaBox className="text-lg" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-blue-[#5297ff]">#{order.orderNo}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {order.createdAt ? order.createdAt.toLocaleString() : "--"}
                            </p>
                            {order.shippingDetails?.trackingId && (
                              <p className="text-xs text-gray-500 mt-1">
                                {getTrackingUrl(order.shippingDetails?.courierName, order.shippingDetails.trackingId) ? (
                                  <a
                                    href={getTrackingUrl(order.shippingDetails?.courierName, order.shippingDetails.trackingId)!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                                  >
                                    Track: {order.shippingDetails.trackingId}
                                    <FaExternalLinkAlt className="text-[10px]" />
                                  </a>
                                ) : (
                                  <>Tracking: {order.shippingDetails.trackingId}</>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="hidden md:block md:col-span-2">
                          <p className="font-medium text-gray-900">{customerName}</p>
                          <p className="text-xs text-gray-500">{customerPhone}</p>
                          <div className="flex items-start gap-1 mt-1" title={fullAddressStr || undefined}>
                            <FaMapMarkerAlt className="text-gray-400 text-xs shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500 truncate">
                              {fullAddressStr || "Address not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="hidden md:block md:col-span-2">
                          <p className="font-medium text-gray-900">{titleCase(String(order.type))}</p>
                          <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                        </div>

                        <div className="hidden md:block md:col-span-2">
                          <p className="font-bold text-gray-900">
                            ₹{order.grandTotal.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Due: ₹{order.amountDue.toLocaleString()}
                          </p>
                        </div>

                        <div className="hidden md:block md:col-span-1">
                          {renderPaymentBadge(order.paymentStatus)}
                        </div>

                        <div className="hidden md:block md:col-span-2">
                          {renderStatusBadge(order.status)}
                          {order.returnRequestedAt && (
                            <p className="text-xs text-orange-700 mt-1">
                              Return requested
                            </p>
                          )}
                        </div>

                        <div className="hidden md:flex md:col-span-1 justify-end gap-2">
                          <CustomTooltip label="View Details" position="top">
                            <Button
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-[#5297ff] transition-colors"
                              onClick={() => openViewDrawer(order)}
                            >
                              <FaEye className="sub-heading" />
                            </Button>
                          </CustomTooltip>

                          {canUpdateStatus(order) && (
                            <CustomTooltip label="Update Status" position="top">
                              <Button
                                className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setNewStatus(order.status);
                                  setStatusCourier(order.shippingDetails?.courierName || "");
                                  setStatusTrackingId(order.shippingDetails?.trackingId || "");
                                  setOpenStatusModal(true);
                                }}
                              >
                                <FaEdit className="sub-heading" />
                              </Button>
                            </CustomTooltip>
                          )}

                          {canCancel(order) && (
                            <CustomTooltip label="Cancel Order" position="top">
                              <Button
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setOpenCancelModal(true);
                                }}
                              >
                                <MdCancel className="sub-heading" />
                              </Button>
                            </CustomTooltip>
                          )}

                          {canRequestReturn(order) && (
                            <CustomTooltip label="Request Return" position="top">
                              <Button
                                className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setReturnMode("REQUEST");
                                  setOpenReturnModal(true);
                                }}
                              >
                                <FaRedoAlt className="sub-heading" />
                              </Button>
                            </CustomTooltip>
                          )}

                          {canProcessReturn(order) && (
                            <CustomTooltip label="Process Return" position="top">
                              <Button
                                className="p-2 rounded-lg hover:bg-purple-50 text-purple-700 transition-colors"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setReturnMode("PROCESS");
                                  setProcessApprove(true);
                                  setOpenReturnModal(true);
                                }}
                              >
                                <MdAssignment className="sub-heading" />
                              </Button>
                            </CustomTooltip>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex md:flex-row flex-col md:items-center items-stretch justify-between gap-3">
                <div className="md:label-text text-xs text-gray-500 text-center md:text-left">
                  Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                  {Math.min(filters.page * filters.limit, totalCount)} of {totalCount} orders
                </div>

                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    className="md:px-3 px-2 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 md:label-text text-xs"
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= filters.page - 1 && page <= filters.page + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          className={`md:px-3 px-2 py-1 rounded-lg border md:label-text text-xs ${page === filters.page
                            ? "bg-[#5297ff] text-white border-[#5297ff]"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === filters.page - 2 || page === filters.page + 2) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <Button
                    className="md:px-3 px-2 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 md:label-text text-xs"
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          ORDER DETAILS DRAWER
      ===================================================== */}
      {openDrawer && selectedOrder && (
        <Drawer
          open={openDrawer}
          handleDrawerToggle={() => {
            setOpenDrawer(false);
            setSelectedOrder(null);
          }}
          closeIconCls="text-gray-700 hover:text-gray-900"
          openVariant="right"
          panelCls="w-full md:w-[900px] shadow-2xl"
          overLayCls="bg-black/30 backdrop-blur-sm"
        >
          <div className="h-full flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <FaShippingFast className="text-blue-[#5297ff]" />
                  Order #{selectedOrder.orderNo}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedOrder.createdAt ? selectedOrder.createdAt.toLocaleString() : "--"} •{" "}
                  {titleCase(String(selectedOrder.type))}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium"
                  onClick={() => refreshOneOrder(selectedOrder.id)}
                >
                  Refresh
                </Button>
                <Button
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                  onClick={() => {
                    setOpenDrawer(false);
                    setSelectedOrder(null);
                  }}
                >
                  <MdOutlineClose />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">Status:</span>
                    {renderStatusBadge(selectedOrder.status)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canUpdateStatus(selectedOrder) && (
                      <Button
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-xs font-medium"
                        onClick={() => {
                          setSelectedOrderId(selectedOrder.id);
                          setNewStatus(selectedOrder.status);
                          setOpenStatusModal(true);
                        }}
                      >
                        Update Status
                      </Button>
                    )}

                    {canCancel(selectedOrder) && (
                      <Button
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-medium"
                        onClick={() => {
                          setSelectedOrderId(selectedOrder.id);
                          setOpenCancelModal(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}

                    {canRequestReturn(selectedOrder) && (
                      <Button
                        className="px-3 py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-xs font-medium"
                        onClick={() => {
                          setSelectedOrderId(selectedOrder.id);
                          setReturnMode("REQUEST");
                          setOpenReturnModal(true);
                        }}
                      >
                        Request Return
                      </Button>
                    )}

                    {canProcessReturn(selectedOrder) && (
                      <Button
                        className="px-3 py-1.5 rounded-lg bg-purple-700 text-white hover:bg-purple-800 text-xs font-medium"
                        onClick={() => {
                          setSelectedOrderId(selectedOrder.id);
                          setReturnMode("PROCESS");
                          setProcessApprove(true);
                          setOpenReturnModal(true);
                        }}
                      >
                        Process Return
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid md:grid-cols-3 grid-cols-1 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-gray-500">Payment</p>
                    <div className="mt-1 flex items-center justify-between">
                      {renderPaymentBadge(selectedOrder.paymentStatus)}
                      <p className="text-xs text-gray-600">
                        Paid: ₹{selectedOrder.amountPaid.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Due: ₹{selectedOrder.amountDue.toLocaleString()}
                    </p>
                  </div>

                  {/* Payments list + Refund */}
                  <div className="md:col-span-3 bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-gray-500 mb-2">Payments</p>
                    {orderPayments.length === 0 ? (
                      <p className="text-xs text-gray-500">No payment records</p>
                    ) : (
                      <ul className="space-y-2">
                        {orderPayments.map((p: any) => (
                          <li key={p.id} className="flex justify-between items-center text-xs">
                            <span>₹{Number(p.amount || 0).toLocaleString("en-IN")} · {p.status}</span>
                            {p.status === "SUCCESS" && Number(p.refundedAmount || 0) < Number(p.amount) && (
                              <Button
                                className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-200"
                                onClick={() => {
                                  setRefundPaymentId(p.id);
                                  setRefundAmount("");
                                  setRefundReason("");
                                  setOpenRefundModal(true);
                                }}
                              >
                                Refund
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {selectedOrder.shippingDetails?.trackingId && (
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-gray-500">Shipping</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedOrder.shippingDetails.courierName || "Courier"}
                      </p>
                      {getTrackingUrl(selectedOrder.shippingDetails?.courierName, selectedOrder.shippingDetails.trackingId) ? (
                        <a
                          href={getTrackingUrl(selectedOrder.shippingDetails?.courierName, selectedOrder.shippingDetails.trackingId)!}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Track: {selectedOrder.shippingDetails.trackingId}
                          <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                      ) : (
                        <p className="text-xs text-gray-600 mt-1">
                          Tracking: {selectedOrder.shippingDetails.trackingId}
                        </p>
                      )}
                      {(selectedOrder.shippingDetails as any)?.shiprocketShipmentId && (
                        <div className="flex gap-2 mt-2">
                          <button
                            className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                            onClick={() => handlePrintLabel((selectedOrder.shippingDetails as any).shiprocketShipmentId)}
                          >
                            Print Label
                          </button>
                          <button
                            className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                            onClick={() => handlePrintManifest((selectedOrder.shippingDetails as any).shiprocketShipmentId)}
                          >
                            Print Manifest
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ship via Shiprocket */}
                  {isProductOrder(selectedOrder) && selectedOrder.status === OrderStatusEnum.CONFIRMED && !selectedOrder.shippingDetails?.trackingId && (
                    <div className="md:col-span-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-xs text-yellow-800 font-medium mb-2">Ready to Ship</p>
                      <Button
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium"
                        onClick={() => handleShipViaShiprocket(selectedOrder.id)}
                        disabled={shippingViaShiprocket}
                      >
                        {shippingViaShiprocket ? "Creating Shipment..." : "Ship via Shiprocket"}
                      </Button>
                    </div>
                  )}

                  {selectedOrder.serviceDetails?.scheduleDate && (
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-gray-500">Service Schedule</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedOrder.serviceDetails.scheduleDate}
                      </p>
                      <p className="text-xs text-gray-600">
                        Slot: {selectedOrder.serviceDetails.timeSlot || "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shiprocket Tracker */}
              {selectedOrder.shippingDetails?.trackingId && (
                <ShipmentTracker
                  awbCode={selectedOrder.shippingDetails.trackingId}
                  courierName={selectedOrder.shippingDetails.courierName}
                  orderStatus={selectedOrder.status}
                />
              )}

              {/* Customer */}
              <div>
                <h3 className="sub-heading font-medium mb-3 text-blue-[#5297ff]">
                  Customer
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="label-text">
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.shippingDetails?.recipientName || selectedOrder.userName || "—"}
                    </span>
                  </p>
                  <p className="label-text">
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.shippingDetails?.recipientPhone || selectedOrder.userPhone || "—"}
                    </span>
                  </p>
                  <p className="label-text">
                    <span className="text-gray-600">Email:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.userEmail || "—"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Address */}
              {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address) && (
                <div>
                  <h3 className="sub-heading font-medium mb-3 text-blue-[#5297ff]">
                    {selectedOrder.shippingDetails?.deliveryAddress ? "Delivery Address" : "Billing Address"}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-blue-[#5297ff] mt-1 shrink-0" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">
                          {selectedOrder.shippingDetails?.recipientName || selectedOrder.billingDetails?.name || "—"}
                        </p>
                        <p className="label-text text-gray-600 mt-1">
                          {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.line1 || "—"}
                        </p>
                        {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.line2 && (
                          <p className="label-text text-gray-600">
                            {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.line2}
                          </p>
                        )}
                        <p className="label-text text-gray-600">
                          {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.city || "—"},{" "}
                          {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.state || "—"}{" "}
                          {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.pincode
                            ? `- ${(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.pincode}`
                            : ""}
                        </p>
                        {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.landmark && (
                          <p className="text-xs text-gray-500 mt-1">
                            Landmark: {(selectedOrder.shippingDetails?.deliveryAddress || selectedOrder.billingDetails?.address)?.landmark}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="sub-heading font-medium mb-3 text-blue-[#5297ff]">
                  Items ({selectedOrder.items.length})
                </h3>

                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.image ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500">
                          <FaBox />
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.productType} • ID: {item.productId}
                        </p>
                        {item.sku && <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>}

                        <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
                          <p className="label-text text-gray-600">
                            Qty: {item.quantity} • Price: ₹{item.sellingPrice.toLocaleString()}{" "}
                            {item.unitDiscount > 0 ? (
                              <span className="text-green-700">
                                • Discount: ₹{item.unitDiscount.toLocaleString()}
                              </span>
                            ) : null}
                          </p>
                          <p className="font-bold text-gray-900">
                            ₹{item.itemTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="sub-heading font-medium mb-3 text-blue-[#5297ff]">
                  Amount Summary
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between label-text">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{selectedOrder.subTotal.toLocaleString()}</span>
                  </div>

                  {selectedOrder.discountTotal > 0 && (
                    <div className="flex justify-between label-text text-green-700">
                      <span>Item Discount:</span>
                      <span>-₹{selectedOrder.discountTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {selectedOrder.couponDiscount > 0 && (
                    <div className="flex justify-between label-text text-green-700">
                      <span>
                        Coupon {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}:
                      </span>
                      <span>-₹{selectedOrder.couponDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between label-text">
                    <span className="text-gray-600">Tax:</span>
                    <span>₹{selectedOrder.taxTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between label-text">
                    <span className="text-gray-600">Shipping:</span>
                    <span>₹{selectedOrder.shippingTotal.toLocaleString()}</span>
                  </div>

                  {selectedOrder.feeTotal > 0 && (
                    <div className="flex justify-between label-text">
                      <span className="text-gray-600">Fees:</span>
                      <span>₹{selectedOrder.feeTotal.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 flex justify-between sub-heading font-bold">
                    <span>Grand Total:</span>
                    <span>₹{Number(selectedOrder.grandTotal).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 grid md:grid-cols-2 grid-cols-1 gap-2">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="font-bold text-gray-900 mt-1">
                        ₹{selectedOrder.amountPaid.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500">Due</p>
                      <p className="font-bold text-gray-900 mt-1">
                        ₹{selectedOrder.amountDue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Info */}
              {(selectedOrder.returnRequestedAt ||
                selectedOrder.returnApprovedAt ||
                selectedOrder.returnRejectedAt) && (
                  <div>
                    <h3 className="sub-heading font-medium mb-3 text-blue-[#5297ff]">
                      Return Details
                    </h3>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-2">
                      <p className="label-text text-gray-700">
                        <span className="text-gray-600">Reason:</span>{" "}
                        <span className="font-medium">
                          {selectedOrder.returnReason ? titleCase(selectedOrder.returnReason) : "—"}
                        </span>
                      </p>

                      {selectedOrder.returnComment && (
                        <p className="label-text text-gray-700">
                          <span className="text-gray-600">Comment:</span>{" "}
                          {selectedOrder.returnComment}
                        </p>
                      )}

                      {selectedOrder.returnRequestedAt && (
                        <p className="text-xs text-gray-600">
                          Requested: {selectedOrder.returnRequestedAt.toLocaleString()}
                        </p>
                      )}

                      {selectedOrder.returnApprovedAt && (
                        <p className="text-xs text-green-700">
                          Approved: {selectedOrder.returnApprovedAt.toLocaleString()}
                        </p>
                      )}

                      {selectedOrder.returnRejectedAt && (
                        <p className="text-xs text-red-700">
                          Rejected: {selectedOrder.returnRejectedAt.toLocaleString()}
                          {selectedOrder.returnRejectedReason
                            ? ` • ${selectedOrder.returnRejectedReason}`
                            : ""}
                        </p>
                      )}

                      {selectedOrder.returnImages?.length ? (
                        <div className="pt-2">
                          <p className="text-xs text-gray-600 mb-2">Images</p>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {selectedOrder.returnImages.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-orange-200"
                              >
                                <Image src={url} alt={`return-${idx}`} fill className="object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

              {/* Cancel Reason */}
              {/* Order queries */}
              <div>
                <h3 className="sub-heading font-medium mb-2 text-[#5297ff]">Queries</h3>
                {orderQueries.length === 0 ? (
                  <p className="text-xs text-gray-500">No queries for this order</p>
                ) : (
                  <ul className="space-y-3">
                    {orderQueries.map((q: any) => (
                      <li key={q.id} className="bg-gray-50 p-3 rounded border text-sm">
                        <p className="font-medium text-gray-800">{q.subject}</p>
                        <p className="text-gray-600 mt-1">{q.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{q.status}</p>
                        {q.adminReplies?.length > 0 && (
                          <div className="mt-2 pl-2 border-l-2 border-gray-200 space-y-1">
                            {q.adminReplies.map((r: any, i: number) => (
                              <p key={i} className="text-xs text-gray-600"><strong>Reply:</strong> {r.message}</p>
                            ))}
                          </div>
                        )}
                        {q.status !== "CLOSED" && (
                          <Button
                            className="mt-2 px-2 py-1 rounded text-xs bg-[#5297ff] text-white"
                            onClick={() => {
                              setSelectedQueryId(q.id);
                              setQueryReplyText("");
                              setQueryStatus("ANSWERED");
                              setOpenQueryReplyModal(true);
                            }}
                          >
                            Reply
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedOrder.cancelReason && (
                <div>
                  <h3 className="sub-heading font-medium mb-3 text-blue-[#5297ff]">
                    Cancellation
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="label-text text-gray-700">{selectedOrder.cancelReason}</p>
                  </div>
                </div>
              )}

              {/* Status History */}
              {selectedOrder.statusHistory?.length ? (
                <div>
                  <h3 className="sub-heading font-medium mb-3 text-blue-[#5297ff]">
                    Status Timeline
                  </h3>

                  <div className="space-y-3">
                    {selectedOrder.statusHistory.map((h, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-[#5297ff]"></div>
                          {idx !== selectedOrder.statusHistory!.length - 1 && (
                            <div className="w-0.5 h-full bg-blue-200 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium label-text">{titleCase(h.status)}</p>
                          <p className="text-xs text-gray-400">{new Date(h.at).toLocaleString()}</p>
                          {h.note && <p className="text-xs text-gray-600 mt-1">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Drawer>
      )}

      {/* =====================================================
          UPDATE STATUS MODAL
      ===================================================== */}
      <Modal
        isOpen={openStatusModal}
        closeModal={() => {
          setOpenStatusModal(false);
          setStatusCourier("");
          setStatusTrackingId("");
        }}
        title="Update Order Status"
        className="md:max-w-[520px] max-w-[340px]"
        rootCls="flex items-center justify-center z-[9999]"
      >
        <div className="md:p-6 p-3">
          <div className="space-y-4">
            <SingleSelect
              name="status"
              label="New Status"
              labelCls="font-medium label-text mb-2"
              type="single-select"
              handleChange={(_name, value) => setNewStatus(value as OrderStatusEnum)}
              optionsInterface={{ isObj: false }}
              options={Object.values(OrderStatusEnum)}
              selectedOption={newStatus}
            />

            {(newStatus === OrderStatusEnum.SHIPPED || newStatus === OrderStatusEnum.OUT_FOR_DELIVERY) && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                <p className="text-xs font-medium text-blue-800 flex items-center gap-1">
                  <MdLocalShipping /> Delivery Info (Delhivery, Blue Dart, etc.)
                </p>
                <SingleSelect
                  name="courier"
                  label="Courier"
                  labelCls="font-medium label-text mb-1"
                  type="single-select"
                  handleChange={(_name, value) => setStatusCourier(value || "")}
                  optionsInterface={{ isObj: false }}
                  options={COURIER_OPTIONS.map((c) => c.label)}
                  selectedOption={statusCourier || COURIER_OPTIONS[0]?.label}
                />
                <CustomInput
                  name="trackingId"
                  label="Tracking ID / AWB"
                  labelCls="font-medium label-text mb-1"
                  placeholder="e.g. DLV1234567890"
                  type="text"
                  value={statusTrackingId}
                  onChange={(e: any) => setStatusTrackingId(e.target.value)}
                  className="px-2 py-2"
                />
              </div>
            )}

            <CustomInput
              name="note"
              id="note"
              label="Note (Optional)"
              labelCls="font-medium label-text mb-2"
              placeholder="Add a note about this status update"
              type="textarea"
              value={statusNotes}
              onChange={(e: any) => setStatusNotes(e.target.value)}
              className="px-2 py-2"
            />
          </div>

          <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
            <Button
              className="md:px-[28px] px-[14px] md:text-[16px] text-[12px] py-1 rounded-md border-2 bg-gray-100 hover:bg-gray-200 font-medium text-gray-700"
              onClick={() => setOpenStatusModal(false)}
            >
              Cancel
            </Button>

            <Button
              className="md:px-[28px] px-[14px] py-1 md:text-[16px] text-[12px] rounded-md border-2 label-text bg-blue-[#5297ff] hover:bg-blue-600 hover:text-white btn-text"
              onClick={() => {
                if (selectedOrderId) {
                  updateOrderStatus(
                    selectedOrderId,
                    newStatus,
                    statusNotes,
                    (newStatus === OrderStatusEnum.SHIPPED || newStatus === OrderStatusEnum.OUT_FOR_DELIVERY) ? statusCourier : undefined,
                    (newStatus === OrderStatusEnum.SHIPPED || newStatus === OrderStatusEnum.OUT_FOR_DELIVERY) ? statusTrackingId : undefined
                  );
                }
              }}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}
      <Modal
        isOpen={openCancelModal}
        closeModal={() => setOpenCancelModal(false)}
        title="Cancel Order"
        className="md:max-w-[520px] max-w-[340px]"
        rootCls="flex items-center justify-center z-[9999]"
      >
        <div className="md:p-6 p-3">
          <p className="md:label-text text-xs text-gray-500 mb-4">
            You can cancel only if the order is in CREATED/PENDING state.
          </p>

          <CustomInput
            name="cancelReason"
            id="cancelReason"
            label="Cancel Reason"
            labelCls="font-medium label-text mb-2"
            placeholder="Enter reason for cancellation"
            type="textarea"
            value={cancelReason}
            onChange={(e: any) => setCancelReason(e.target.value)}
            className="px-2 py-2"
            required
          />

          <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
            <Button
              className="md:px-[28px] px-[14px] md:text-[16px] text-[12px] py-1 rounded-md border-2 bg-gray-100 hover:bg-gray-200 font-medium text-gray-700"
              onClick={() => setOpenCancelModal(false)}
            >
              No, Keep
            </Button>

            <Button
              className="md:px-[28px] px-[14px] py-1 md:text-[16px] text-[12px] rounded-md border-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              onClick={() => {
                if (selectedOrderId && cancelReason.trim()) cancelOrder(selectedOrderId, cancelReason.trim());
              }}
              disabled={!cancelReason.trim()}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          RETURN MODAL (Request / Process)
      ===================================================== */}
      <Modal
        isOpen={openReturnModal}
        closeModal={() => setOpenReturnModal(false)}
        title={returnMode === "REQUEST" ? "Request Return" : "Process Return"}
        className="md:max-w-[560px] max-w-[340px]"
        rootCls="flex items-center justify-center z-[9999]"
      >
        <div className="md:p-6 p-3">
          {returnMode === "REQUEST" ? (
            <>
              <p className="text-xs text-gray-500 mb-4">
                Select a reason, add comments (optional), and attach image URLs (S3).
              </p>

              <div className="space-y-4">
                <SingleSelect
                  name="returnReason"
                  label="Return Reason"
                  labelCls="font-medium label-text mb-2"
                  type="single-select"
                  handleChange={(_name, value) => setReturnReason(value as ReturnReasonEnum)}
                  optionsInterface={{ isObj: false }}
                  options={Object.values(ReturnReasonEnum)}
                  selectedOption={returnReason}
                />

                <CustomInput
                  name="returnComment"
                  id="returnComment"
                  label="Comment (Optional)"
                  labelCls="font-medium label-text mb-2"
                  placeholder="Add details..."
                  type="textarea"
                  value={returnComment}
                  onChange={(e: any) => setReturnComment(e.target.value)}
                  className="px-2 py-2"
                />

                {/* Images (URLs) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium label-text">Images (Optional)</p>
                    <Button
                      className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-xs"
                      onClick={() => setReturnImages((p) => [...p, ""])}
                    >
                      Add Image URL
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {returnImages.length === 0 && (
                      <p className="text-xs text-gray-500">No images added.</p>
                    )}

                    {returnImages.map((url, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <CustomInput
                          name={`img-${idx}`}
                          id={`img-${idx}`}
                          label=""
                          placeholder="https://s3.../image.jpg"
                          type="text"
                          value={url}
                          onChange={(e: any) => {
                            const val = e.target.value;
                            setReturnImages((p) => p.map((x, i) => (i === idx ? val : x)));
                          }}
                          className="px-2 py-2 flex-1"
                        />
                        <Button
                          className="p-2 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                          onClick={() => setReturnImages((p) => p.filter((_, i) => i !== idx))}
                        >
                          <MdOutlineClose />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* quick preview */}
                  {returnImages.filter(Boolean).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {returnImages
                        .filter(Boolean)
                        .slice(0, 6)
                        .map((u, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                            <Image src={u} alt={`preview-${i}`} fill className="object-cover" />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-4">
                Approve or reject the return request. Rejection requires a reason.
              </p>

              <div className="space-y-4">
                <SingleSelect
                  name="approve"
                  label="Decision"
                  labelCls="font-medium label-text mb-2"
                  type="single-select"
                  handleChange={(_name, value) => setProcessApprove(value === "APPROVE")}
                  optionsInterface={{ isObj: false }}
                  options={["APPROVE", "REJECT"]}
                  selectedOption={processApprove ? "APPROVE" : "REJECT"}
                />

                {!processApprove && (
                  <CustomInput
                    name="rejectionReason"
                    id="rejectionReason"
                    label="Rejection Reason"
                    labelCls="font-medium label-text mb-2"
                    placeholder="Why is this return rejected?"
                    type="textarea"
                    value={processRejectionReason}
                    onChange={(e: any) => setProcessRejectionReason(e.target.value)}
                    className="px-2 py-2"
                    required
                  />
                )}
              </div>
            </>
          )}

          <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
            <Button
              className="md:px-[28px] px-[14px] md:text-[16px] text-[12px] py-1 rounded-md border-2 bg-gray-100 hover:bg-gray-200 font-medium text-gray-700"
              onClick={() => setOpenReturnModal(false)}
            >
              Cancel
            </Button>

            <Button
              className={`md:px-[28px] px-[14px] py-1 md:text-[16px] text-[12px] rounded-md border-2 text-white disabled:opacity-50 ${returnMode === "REQUEST" ? "bg-orange-600 hover:bg-orange-700" : "bg-purple-700 hover:bg-purple-800"
                }`}
              disabled={!selectedOrderId || (!processApprove && returnMode === "PROCESS" && !processRejectionReason.trim())}
              onClick={() => submitReturn()}
            >
              {returnMode === "REQUEST" ? "Submit Return" : "Submit Decision"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund modal */}
      <Modal
        isOpen={openRefundModal}
        closeModal={() => { setOpenRefundModal(false); setRefundPaymentId(null); setRefundAmount(""); setRefundReason(""); }}
        title="Refund payment"
        className="md:max-w-[420px] max-w-[340px]"
        rootCls="flex items-center justify-center z-[9999]"
      >
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">Optional: partial amount (leave empty for full refund). Reason is stored for audit.</p>
          <CustomInput
            name="refundAmount"
            id="refundAmount"
            label="Amount (optional)"
            placeholder="e.g. 500"
            type="text"
            value={refundAmount}
            onChange={(e: any) => setRefundAmount(e.target.value)}
            className="px-2 py-2"
          />
          <CustomInput
            name="refundReason"
            id="refundReason"
            label="Reason (optional)"
            placeholder="e.g. Customer request"
            type="textarea"
            value={refundReason}
            onChange={(e: any) => setRefundReason(e.target.value)}
            className="px-2 py-2"
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button className="px-3 py-1.5 rounded border bg-gray-100" onClick={() => setOpenRefundModal(false)}>Cancel</Button>
            <Button className="px-3 py-1.5 rounded bg-amber-600 text-white" onClick={submitRefund} disabled={loading}>Refund</Button>
          </div>
        </div>
      </Modal>

      {/* Query reply modal */}
      <Modal
        isOpen={openQueryReplyModal}
        closeModal={() => { setOpenQueryReplyModal(false); setSelectedQueryId(null); setQueryReplyText(""); }}
        title="Reply to query"
        className="md:max-w-[480px] max-w-[340px]"
        rootCls="flex items-center justify-center z-[9999]"
      >
        <div className="p-4 space-y-3">
          <CustomInput
            name="queryReply"
            id="queryReply"
            label="Your reply"
            placeholder="Type your reply to the customer..."
            type="textarea"
            value={queryReplyText}
            onChange={(e: any) => setQueryReplyText(e.target.value)}
            className="px-2 py-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Status:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={queryStatus}
              onChange={(e) => setQueryStatus(e.target.value)}
            >
              <option value="ANSWERED">Answered</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button className="px-3 py-1.5 rounded border bg-gray-100" onClick={() => setOpenQueryReplyModal(false)}>Cancel</Button>
            <Button className="px-3 py-1.5 rounded bg-[#5297ff] text-white" onClick={submitQueryReply} disabled={loading}>Send reply</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagementPortal;
