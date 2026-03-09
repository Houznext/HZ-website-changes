import { create } from "zustand";
import apiClient from "@/utils/apiClient";

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum CurrentStep {
  customerOnboarding = "customer-onboarding",
  documentUpload = "document-upload",
  dayProgress = "day-progress",
}

export enum PaymentStatus {
  Pending = "Pending",
  Partial = "Partial",
  Completed = "Completed",
  Overdue = "Overdue",
  Refunded = "Refunded",
}

export enum PaymentMethod {
  Cash = "Cash",
  BankTransfer = "Bank Transfer",
  UPI = "UPI",
  Cheque = "Cheque",
  CreditCard = "Credit Card",
  DebitCard = "Debit Card",
  Other = "Other",
}

export enum PaymentType {
  Advance = "Advance",
  Milestone = "Milestone",
  MaterialPurchase = "Material Purchase",
  LabourPayment = "Labour Payment",
  FinalSettlement = "Final Settlement",
  Other = "Other",
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface SizeWithUnit {
  size: number;
  unit: string;
}

export interface HouseConstructionInfo {
  total_area: SizeWithUnit;
  length: SizeWithUnit;
  width: SizeWithUnit;
  total_floors: number;
  land_facing: string;
  gate_side: string;
  staircase_gate: string;
  adjacent_roads: number;
  propertyImages?: string[];
  additionOptions?: string[];
  additional_details?: string;
  floors?: any[];
}

export interface InteriorInfo {
  project_scope?: string;
  total_area: SizeWithUnit;
  style_preference?: string;
  color_scheme?: { label: string; color: string }[];
  totalFloors?: number;
  budget?: number;
  special_requirements?: string;
  reference_images?: string[];
  additionOptions?: string[];
  additional_details?: string;
  floors?: any[];
}

export interface CommercialConstructionInfo {
  commercial_type: string;
  total_area: SizeWithUnit;
  total_floors: number;
  basement_floors?: number;
  parking_floors?: number;
  land_facing: string;
  gate_side?: string;
  length?: SizeWithUnit;
  width?: SizeWithUnit;
  height?: SizeWithUnit;
  adjacent_roads: number;
  elevator_required: boolean;
  number_of_elevators?: number;
  central_ac_required: boolean;
  fire_safety_required: boolean;
  parking_required: boolean;
  parking_capacity?: number;
  generator_backup_required: boolean;
  generator_capacity_kva?: number;
  water_treatment_required: boolean;
  sewage_treatment_required: boolean;
  propertyImages?: string[];
  additionOptions?: string[];
  additional_details?: string;
  zoning_info?: {
    zone_type?: string;
    fsi_allowed?: number;
    setback_front?: number;
    setback_side?: number;
    setback_rear?: number;
  };
}

export interface CBPropertyInfo {
  id: string;
  propertyName: string;
  construction_type: string; // "Residential" | "Commercial"
  property_type?: string;
  commercial_property_type?: string;
  construction_scope: string; // "house" | "interior"
  house_construction_info?: HouseConstructionInfo;
  interior_info?: InteriorInfo;
  commercial_construction_info?: CommercialConstructionInfo;
}

export interface Phase {
  id: number;
  order: number;
  name: string;
  plannedDays: number;
  plannedCost: number | null;
  plannedStart?: string | null;
  plannedEnd?: string | null;
  actualDays: number;
  actualCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgressLog {
  id: string;
  day: number;
  date: string;
  floor?: string[];
  description?: string;
  imageOrVideo?: string[];
  status: string;
  workType?: string[];
  placeType?: string[];
  issues?: string;
  materials?: { material: string; quantity: number; desc: string }[];
  laborCount?: number;
  expensesIncurred?: number;
  customerNotes?: string;
  phaseId?: number | null;
  uploadedByName?: string | null;
  uploadedByProfile?: string | null;
  uploadLocation?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CBDocument {
  id: string;
  type: string;
  fileUrl: string;
  title?: string;
  notes?: string;
  documentDate?: string;
  meta?: {
    category?: string;
    amount?: number;
    vendor?: string;
    referenceNo?: string;
    paidVia?: string;
    gstNo?: string;
  };
  createdAt: string;
}

export interface PaymentTracking {
  id: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentType: PaymentType;
  paymentDate?: string;
  dueDate?: string;
  description?: string;
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  phaseName?: string;
  receivedBy?: string;
  customBuilderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueCount: number;
  totalPayments: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  notes?: string;
  quantity?: number;
  images: string[];
  checkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CBQuery {
  id: string;
  title: string;
  message: string;
  status: string;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomBuilderData {
  id: string;
  currentDay: number;
  currentStep: CurrentStep;
  onboardingSteps: number;
  estimatedCost: number | null;
  estimatedDays: number | null;
  propertyInformation: CBPropertyInfo;
  servicesRequired: any;
  logs: DailyProgressLog[];
  phases: Phase[];
  documents: CBDocument[];
  queries: CBQuery[];
  location?: any;
  customer?: any;
  branch?: any;
  createdByUser?: any;
  currentStage?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface CustomBuilderState {
  data: CustomBuilderData | null;
  isLoading: boolean;
  error: string | null;

  payments: PaymentTracking[];
  paymentSummary: PaymentSummary | null;
  paymentsLoading: boolean;

  materials: MaterialItem[];
  materialsLoading: boolean;

  // Tracks which IDs are cached so we never double-fetch
  _cachedCbId: string | null;
  _cachedPaymentsCbId: string | null;
  _cachedMaterialsCbId: string | null;

  fetchData: (customBuilderId: string, force?: boolean) => Promise<void>;
  fetchPayments: (customBuilderId: string, force?: boolean) => Promise<void>;
  fetchMaterials: (customBuilderId: string, force?: boolean) => Promise<void>;
  setData: (data: CustomBuilderData) => void;
  clearData: () => void;
}

export const useCustomBuilderStore = create<CustomBuilderState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,

  payments: [],
  paymentSummary: null,
  paymentsLoading: false,

  materials: [],
  materialsLoading: false,

  _cachedCbId: null,
  _cachedPaymentsCbId: null,
  _cachedMaterialsCbId: null,

  fetchData: async (customBuilderId, force = false) => {
    if (!customBuilderId) return;
    const state = get();
    // Skip if already cached for the same ID (unless forced)
    if (!force && state._cachedCbId === customBuilderId && state.data) return;

    // If switching to a different project, clear stale sub-resource caches
    if (state._cachedCbId && state._cachedCbId !== customBuilderId) {
      set({
        payments: [],
        paymentSummary: null,
        _cachedPaymentsCbId: null,
        materials: [],
        _cachedMaterialsCbId: null,
      });
    }

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.customBuilder}/${customBuilderId}`,
        {},
        true
      );
      if (response.status === 200) {
        set({ data: response.body, isLoading: false, _cachedCbId: customBuilderId });
      }
    } catch (error) {
      console.error("Error fetching custom builder data:", error);
      set({ error: "Error occurred while fetching details", isLoading: false });
    }
  },

  fetchPayments: async (customBuilderId, force = false) => {
    if (!customBuilderId) return;
    const state = get();
    if (!force && state._cachedPaymentsCbId === customBuilderId && state.payments.length > 0) return;

    set({ paymentsLoading: true });
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.paymentTracking}/custom-builder/${customBuilderId}`,
        {},
        true
      );
      if (response.status === 200) {
        set({
          payments: response.body.payments || [],
          paymentSummary: response.body.summary || null,
          paymentsLoading: false,
          _cachedPaymentsCbId: customBuilderId,
        });
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      set({ paymentsLoading: false });
    }
  },

  fetchMaterials: async (customBuilderId, force = false) => {
    if (!customBuilderId) return;
    const state = get();
    if (!force && state._cachedMaterialsCbId === customBuilderId && state.materials.length > 0) return;

    set({ materialsLoading: true });
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.customBuilder}/${customBuilderId}/materials`,
        {},
        true
      );
      if (response.status === 200) {
        set({ materials: response.body || [], materialsLoading: false, _cachedMaterialsCbId: customBuilderId });
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      set({ materialsLoading: false });
    }
  },

  setData: (data) => set({ data, _cachedCbId: data?.id || null }),

  clearData: () =>
    set({
      data: null,
      _cachedCbId: null,
      payments: [],
      paymentSummary: null,
      _cachedPaymentsCbId: null,
      materials: [],
      _cachedMaterialsCbId: null,
    }),
}));
