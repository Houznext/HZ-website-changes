'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'infra_listing_draft';

export type ListingDraft = Record<string, unknown>;

const defaultDraft: ListingDraft = {
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
  photoUrls: [] as string[],
  coverImageUrl: '',
  highlights: [] as string[],
  approvalStatus: 'pending',
  isFeatured: false,
  isZeroBrokerage: false,
  enableWhatsappEnquiry: true,
};

type Ctx = {
  form: ListingDraft;
  setField: (key: string, value: unknown) => void;
  setFields: (partial: ListingDraft) => void;
  resetForm: () => void;
};

const ListingFormContext = createContext<Ctx | null>(null);

function loadDraft(): ListingDraft {
  if (typeof window === 'undefined') return { ...defaultDraft };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultDraft };
    return { ...defaultDraft, ...JSON.parse(raw) };
  } catch {
    return { ...defaultDraft };
  }
}

export function ListingFormProvider({ children }: { children: React.ReactNode }) {
  const [form, setForm] = useState<ListingDraft>(defaultDraft);

  useEffect(() => {
    setForm(loadDraft());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const setField = useCallback((key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const setFields = useCallback((partial: ListingDraft) => {
    setForm((f) => ({ ...f, ...partial }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...defaultDraft });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ form, setField, setFields, resetForm }), [form, setField, setFields, resetForm]);

  return <ListingFormContext.Provider value={value}>{children}</ListingFormContext.Provider>;
}

export function useListingForm() {
  const ctx = useContext(ListingFormContext);
  if (!ctx) throw new Error('useListingForm must be used inside ListingFormProvider');
  return ctx;
}
