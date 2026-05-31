'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { ProjectTypeKey } from '@/lib/projects/constants';
import type { InfraStatusDraft, PlotSizeDraft, ProjectConfigDraft, ProjectMilestoneDraft } from '@/lib/projects/types';

const STORAGE_KEY = 'infra_project_draft';
const PROJECT_ID_KEY = 'infra_project_draft_id';

export type ProjectFormDraft = {
  projectType: ProjectTypeKey;
  name: string;
  developerName: string;
  developerWebsite: string;
  developerFounded: string;
  developerProjectsDelivered: string;
  developerHomesDelivered: string;
  city: string;
  locality: string;
  address: string;
  mapsUrl: string;
  status: string;
  description: string;
  refCode: string;
  reraNumber: string;
  reraExpiry: string;
  reraAuthority: string;
  totalUnits: string;
  availableUnits: string;
  towers: string;
  maxFloors: string;
  projectAreaAcres: string;
  openAreaPercent: string;
  possessionDate: string;
  launchDate: string;
  bhkTypes: string[];
  configurations: ProjectConfigDraft[];
  milestones: ProjectMilestoneDraft[];
  amenities: string[];
  specifications: Record<string, string>;
  landArea: string;
  landUnit: string;
  totalPlots: string;
  phases: string;
  plotSizes: PlotSizeDraft[];
  mainRoadFt: string;
  internalRoadFt: string;
  laneRoadFt: string;
  infrastructure: InfraStatusDraft[];
  minPrice: string;
  maxPrice: string;
  pricePerUnitLabel: string;
  unitsLabel: string;
  configLabel: string;
  gstPercent: string;
  registrationPercent: string;
  maintenanceDeposit: string;
  paymentPlan: string;
  legal: Record<string, string>;
  approvedBanks: string[];
  heroImageUrl: string;
  videoUrl: string;
  droneVideoUrl: string;
  virtualTourUrl: string;
  brochureUrl: string;
  masterPlanUrl: string;
  photoUrls: string[];
  showInSearch: boolean;
  isFeatured: boolean;
  reraVerified: boolean;
  visibility: string;
  constructionProgress: string;
  gradientBg: string;
  accentColor: string;
  developerHighlights: string[];
};

export const PROJECT_FORM_DEFAULTS: ProjectFormDraft = {
  projectType: 'apartment',
  name: '',
  developerName: '',
  developerWebsite: '',
  developerFounded: '',
  developerProjectsDelivered: '',
  developerHomesDelivered: '',
  city: '',
  locality: '',
  address: '',
  mapsUrl: '',
  status: 'New Launch',
  description: '',
  refCode: '',
  reraNumber: '',
  reraExpiry: '',
  reraAuthority: 'TSRERA (Telangana)',
  totalUnits: '',
  availableUnits: '',
  towers: '',
  maxFloors: '',
  projectAreaAcres: '',
  openAreaPercent: '',
  possessionDate: '',
  launchDate: '',
  bhkTypes: [],
  configurations: [],
  milestones: [],
  amenities: [],
  specifications: {},
  landArea: '',
  landUnit: 'Acres',
  totalPlots: '',
  phases: '',
  plotSizes: [],
  mainRoadFt: '',
  internalRoadFt: '',
  laneRoadFt: '',
  infrastructure: [],
  minPrice: '',
  maxPrice: '',
  pricePerUnitLabel: '',
  unitsLabel: '',
  configLabel: '',
  gstPercent: '5',
  registrationPercent: '1',
  maintenanceDeposit: '',
  paymentPlan: 'Construction linked plan',
  legal: {},
  approvedBanks: [],
  heroImageUrl: '',
  videoUrl: '',
  droneVideoUrl: '',
  virtualTourUrl: '',
  brochureUrl: '',
  masterPlanUrl: '',
  photoUrls: [],
  showInSearch: true,
  isFeatured: false,
  reraVerified: false,
  visibility: 'draft',
  constructionProgress: '',
  gradientBg: '',
  accentColor: '',
  developerHighlights: [],
};

type Ctx = {
  form: ProjectFormDraft;
  projectId: string | null;
  setField: <K extends keyof ProjectFormDraft>(key: K, value: ProjectFormDraft[K]) => void;
  setForm: (patch: Partial<ProjectFormDraft>) => void;
  resetForm: () => void;
  saveDraft: (published?: boolean) => Promise<string | null>;
};

const ProjectFormContext = createContext<Ctx | null>(null);

export function ProjectFormProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [form, setFormState] = useState<ProjectFormDraft>(PROJECT_FORM_DEFAULTS);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const id = sessionStorage.getItem(PROJECT_ID_KEY);
      if (raw) setFormState({ ...PROJECT_FORM_DEFAULTS, ...JSON.parse(raw) });
      if (id) setProjectId(id);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form, hydrated]);

  const setField = useCallback(<K extends keyof ProjectFormDraft>(key: K, value: ProjectFormDraft[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setForm = useCallback((patch: Partial<ProjectFormDraft>) => {
    setFormState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(PROJECT_FORM_DEFAULTS);
    setProjectId(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(PROJECT_ID_KEY);
    }
  }, []);

  const saveDraft = useCallback(
    async (published = false): Promise<string | null> => {
      const adminApi = (await import('@/lib/axios')).default;
      const { buildProjectPayload } = await import('@/lib/projects/payload');
      const payload = buildProjectPayload(form, published);

      if (!payload.name) {
        throw new Error('Project name is required');
      }

      let id = projectId;
      const isNew = !id;
      if (id) {
        await adminApi.patch(`/admin/projects/${id}`, payload);
      } else {
        const res = await adminApi.post('/admin/projects', payload);
        id = res.data?.projectId ?? res.data?.id ?? null;
        if (id) {
          setProjectId(id);
          sessionStorage.setItem(PROJECT_ID_KEY, id);
        }
      }

      if (isNew && id && form.milestones.length > 0) {
        await adminApi.post(`/admin/projects/${id}/milestones`, {
          milestones: form.milestones.map((m, i) => ({
            label: m.label,
            date: m.date,
            isCompleted: m.isCompleted ?? false,
            isCurrent: m.isCurrent ?? false,
            sortOrder: i,
          })),
        });
      }

      if (published && id) {
        resetForm();
        void router.push(`/projects/${id}`);
      }

      return id;
    },
    [form, projectId, resetForm, router],
  );

  const value = useMemo(
    () => ({ form, projectId, setField, setForm, resetForm, saveDraft }),
    [form, projectId, setField, setForm, resetForm, saveDraft],
  );

  return <ProjectFormContext.Provider value={value}>{children}</ProjectFormContext.Provider>;
}

export function useProjectForm() {
  const ctx = useContext(ProjectFormContext);
  if (!ctx) throw new Error('useProjectForm must be used within ProjectFormProvider');
  return ctx;
}
