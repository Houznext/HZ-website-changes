"use client";

import type { Dispatch, SetStateAction } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Lead } from "../NewCrmView/types";
import type { CRMTabId } from "./constants";
import { useCRMLeads } from "./hooks/useCRMLeads";

export type InteriorsCRMContextValue = ReturnType<typeof useCRMLeads> & {
  activeTab: CRMTabId;
  setActiveTab: (t: CRMTabId) => void;
  selectedLead: Lead | null;
  setSelectedLead: (l: Lead | null) => void;
  leadFormOpen: boolean;
  setLeadFormOpen: (v: boolean) => void;
  leadFormInitialStatus: string | undefined;
  setLeadFormInitialStatus: (s: string | undefined) => void;
  formData: Record<string, unknown>;
  setFormData: Dispatch<SetStateAction<Record<string, unknown>>>;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  detailView: boolean;
  closeLeadDetail: () => void;
  openLeadDetail: (lead: Lead) => void;
  resetLeadForm: (leadstatus?: string) => void;
};

const InteriorsCRMContext = createContext<InteriorsCRMContextValue | null>(null);

export const defaultLeadFormData = {
  Fullname: "",
  Phonenumber: "",
  email: "",
  propertytype: "Flat",
  bhk: "",
  city: "",
  state: "",
  serviceType: "RealEstate",
  platform: "Walkin",
  leadstatus: "New",
  review: "",
  houseNo: "",
  apartmentName: "",
  areaName: "",
  pincode: "",
  branchId: "",
  isFuturePotential: false,
  followUpDate: "",
};

export function InteriorsCRMProvider({ children }: { children: React.ReactNode }) {
  const crm = useCRMLeads();
  const [activeTab, setActiveTab] = useState<CRMTabId>("dashboard");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [leadFormInitialStatus, setLeadFormInitialStatus] = useState<
    string | undefined
  >();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>(defaultLeadFormData);
  const [detailView, setDetailView] = useState(false);

  const closeLeadDetail = useCallback(() => {
    setDetailView(false);
    setSelectedLead(null);
  }, []);

  const openLeadDetail = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setDetailView(true);
  }, []);

  const resetLeadForm = useCallback((leadstatus?: string) => {
    setFormData({
      ...defaultLeadFormData,
      ...(leadstatus ? { leadstatus } : {}),
    });
  }, []);

  const value = useMemo(
    () => ({
      ...crm,
      activeTab,
      setActiveTab,
      selectedLead,
      setSelectedLead,
      leadFormOpen,
      setLeadFormOpen,
      leadFormInitialStatus,
      setLeadFormInitialStatus,
      formData,
      setFormData,
      selectedLeadId,
      setSelectedLeadId,
      detailView,
      closeLeadDetail,
      openLeadDetail,
      resetLeadForm,
    }),
    [
      crm,
      activeTab,
      selectedLead,
      leadFormOpen,
      leadFormInitialStatus,
      formData,
      selectedLeadId,
      detailView,
      closeLeadDetail,
      openLeadDetail,
      resetLeadForm,
    ],
  );

  return (
    <InteriorsCRMContext.Provider value={value}>{children}</InteriorsCRMContext.Provider>
  );
}

export function useInteriorsCRM() {
  const ctx = useContext(InteriorsCRMContext);
  if (!ctx) {
    throw new Error("useInteriorsCRM must be used within InteriorsCRMProvider");
  }
  return ctx;
}
