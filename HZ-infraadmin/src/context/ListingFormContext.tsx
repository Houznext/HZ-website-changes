'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { createDefaultInsights, type PropertyInsightsForm } from '@/lib/insightsHelpers';

const STORAGE_KEY = 'infra_listing_draft';
const EDIT_ID_KEY = 'infra_listing_edit_id';

export const LISTING_FORM_DEFAULTS: ListingDraft = {
  title: '',
  propertyType: 'Apartment',
  listingFor: 'Buy',
  constructionStatus: 'Ready to Move',
  city: '',
  locality: '',
  address: '',
  pincode: '',
  description: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  ownerAlternatePhone: '',
  listedBy: 'Houznext',
  leadSource: 'Website',
  branch: '',
  internalNotes: '',
  bhkType: '',
  carpetArea: undefined,
  builtUpArea: undefined,
  superBuiltUpArea: undefined,
  floorNumber: undefined,
  totalFloors: undefined,
  towerName: '',
  facing: '',
  parkingType: '',
  furnishingStatus: '',
  possessionDate: '',
  linkedProjectId: '',
  amenities: [] as string[],
  isReraVerified: false,
  isTitleClear: false,
  isHouznextVerified: true,
  plotArea: undefined,
  landArea: undefined,
  areaUnit: 'Sqyds',
  numberOfFloors: '',
  landUseType: '',
  approvalAuthority: '',
  surveyNumber: '',
  layoutName: '',
  roadWidth: '',
  zoneType: '',
  waterSource: '',
  electricity: '',
  plotNumber: '',
  approvalType: '',
  approvalNumber: '',
  basePrice: undefined,
  gstPercent: 5,
  registrationPercent: 1,
  maintenanceDeposit: 0,
  otherCharges: 0,
  reraNumber: '',
  reraExpiry: '',
  promoterName: '',
  reraCertUrl: '',
  ecCertUrl: '',
  floorPlanUrl: '',
  brochureUrl: '',
  youtubeVideoUrl: '',
  photoUrls: [] as string[],
  coverImageUrl: '',
  highlights: [] as string[],
  approvalStatus: 'pending',
  isFeatured: false,
  isZeroBrokerage: false,
  enableWhatsappEnquiry: true,
  insights: null,
};

export type ListingDraft = Record<string, unknown>;

type Ctx = {
  form: ListingDraft;
  setField: (key: string, value: unknown) => void;
  setFields: (partial: ListingDraft) => void;
  resetForm: () => void;
  editingPropertyId: string | null;
  setEditingPropertyId: (id: string | null) => void;
  insights: PropertyInsightsForm | null;
  updateInsights: (partial: Partial<PropertyInsightsForm>) => void;
  resetInsights: () => void;
};

const ListingFormContext = createContext<Ctx | null>(null);

function loadDraft(): ListingDraft {
  if (typeof window === 'undefined') return { ...LISTING_FORM_DEFAULTS };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...LISTING_FORM_DEFAULTS };
    return { ...LISTING_FORM_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...LISTING_FORM_DEFAULTS };
  }
}

function loadEditId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(EDIT_ID_KEY);
}

export function ListingFormProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [form, setForm] = useState<ListingDraft>(() => ({ ...LISTING_FORM_DEFAULTS }));
  const [editingPropertyId, setEditingPropertyIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (/^\/listings\/[^/]+\/edit$/.test(router.pathname)) {
      setEditingPropertyIdState(loadEditId());
      return;
    }
    setForm(loadDraft());
    setEditingPropertyIdState(loadEditId());
  }, [router.isReady, router.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (editingPropertyId) sessionStorage.setItem(EDIT_ID_KEY, editingPropertyId);
    else sessionStorage.removeItem(EDIT_ID_KEY);
  }, [editingPropertyId]);

  const setField = useCallback((key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const setFields = useCallback((partial: ListingDraft) => {
    setForm((f) => ({ ...f, ...partial }));
  }, []);

  const setEditingPropertyId = useCallback((id: string | null) => {
    setEditingPropertyIdState(id);
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...LISTING_FORM_DEFAULTS });
    setEditingPropertyIdState(null);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(EDIT_ID_KEY);
    sessionStorage.removeItem('infra_insights_prefill_done');
  }, []);

  const insights = (form.insights as PropertyInsightsForm | null) ?? null;

  const updateInsights = useCallback((partial: Partial<PropertyInsightsForm>) => {
    setForm((f) => {
      const current = (f.insights as PropertyInsightsForm | null) ?? null;
      const base = current ?? createDefaultInsights(f.propertyType);
      return { ...f, insights: { ...base, ...partial } };
    });
  }, []);

  const resetInsights = useCallback(() => {
    setForm((f) => ({ ...f, insights: null }));
  }, []);

  const value = useMemo(
    () => ({
      form,
      setField,
      setFields,
      resetForm,
      editingPropertyId,
      setEditingPropertyId,
      insights,
      updateInsights,
      resetInsights,
    }),
    [form, setField, setFields, resetForm, editingPropertyId, setEditingPropertyId, insights, updateInsights, resetInsights],
  );

  return <ListingFormContext.Provider value={value}>{children}</ListingFormContext.Provider>;
}

export function useListingForm() {
  const ctx = useContext(ListingFormContext);
  if (!ctx) throw new Error('useListingForm must be used inside ListingFormProvider');
  return ctx;
}
