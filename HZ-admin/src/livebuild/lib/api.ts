import apiClient from '@/src/utils/apiClient';
import type {
  CreateProjectPayload,
  LbCustomer,
  LbDashboard,
  LbDprContext,
  LbDprSubmitPayload,
  LbDocument,
  LbMaterial,
  LbPayment,
  LbProjectDetail,
  LbProjectSummary,
  LbQuery,
  LbRoom,
  LbTeamMember,
  LbWorkType,
} from './types';

const rawApiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
  '';
const base = rawApiBase
  ? rawApiBase.endsWith('/')
    ? rawApiBase
    : `${rawApiBase}/`
  : '';

const LB = `${base}livebuild`;

async function unwrap<T>(promise: Promise<{ body: T; status: number }>): Promise<T> {
  const res = await promise;
  return res.body;
}

export const livebuildApi = {
  base: LB,

  getDashboard: () =>
    unwrap<LbDashboard>(apiClient.get(`${LB}/dashboard`, {}, true)),

  listProjects: (params?: { q?: string }) =>
    unwrap<LbProjectSummary[]>(apiClient.get(`${LB}/projects`, params ?? {}, true)),

  getNextProjectCode: () =>
    unwrap<{ code: string; nextCode?: string }>(
      apiClient.get(`${LB}/projects/next-code`, {}, true),
    ).then((r) => ({ code: r.code ?? r.nextCode ?? 'HZLB-0001' })),

  createProject: (payload: CreateProjectPayload) =>
    unwrap<LbProjectDetail>(
      apiClient.post(`${LB}/projects`, payload as unknown as Record<string, unknown>, true),
    ),

  getProject: (id: string) =>
    unwrap<LbProjectDetail>(apiClient.get(`${LB}/projects/${id}`, {}, true)),

  updateProject: (
    id: string,
    payload: Partial<LbProjectDetail> & { siteManager?: string },
  ) =>
    unwrap<LbProjectDetail>(
      apiClient.patch(`${LB}/projects/${id}`, payload as Record<string, unknown>, true),
    ),

  updateProjectCustomerMobile: (
    id: string,
    payload: { phone: string; otpVerifiedToken: string },
  ) =>
    unwrap<LbProjectDetail>(
      apiClient.patch(
        `${LB}/projects/${id}/customer-mobile`,
        {
          phone: payload.phone,
          customerMobile: `+91${payload.phone.replace(/\D/g, '').slice(-10)}`,
          otpVerifiedToken: payload.otpVerifiedToken,
        },
        true,
      ),
    ),

  deleteProject: (id: string) =>
    apiClient.delete(`${LB}/projects/${id}`, {}, true),

  sendCustomerOtp: (phone: string) =>
    unwrap<{ message?: string }>(
      apiClient.post(`${LB}/customers/send-otp`, { phone }, true),
    ),

  verifyCustomerOtp: (phone: string, otp: string) =>
    unwrap<{ verified: boolean; otpToken?: string }>(
      apiClient.post(`${LB}/customers/verify-otp`, { phone, otp }, true),
    ),

  listCustomers: () =>
    unwrap<LbCustomer[]>(apiClient.get(`${LB}/customers`, {}, true)),

  createCustomer: (payload: {
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    otpToken?: string;
  }) =>
    unwrap<LbCustomer>(apiClient.post(`${LB}/customers`, payload, true)),

  listWorkTypes: () =>
    unwrap<LbWorkType[]>(apiClient.get(`${LB}/work-types`, {}, true)),

  createWorkType: (payload: Partial<LbWorkType>) =>
    unwrap<LbWorkType>(apiClient.post(`${LB}/work-types`, payload, true)),

  updateWorkType: (id: string, payload: Partial<LbWorkType>) =>
    unwrap<LbWorkType>(apiClient.patch(`${LB}/work-types/${id}`, payload, true)),

  deleteWorkType: (id: string) =>
    apiClient.delete(`${LB}/work-types/${id}`, {}, true),

  listTeam: () =>
    unwrap<LbTeamMember[]>(apiClient.get(`${LB}/settings/team`, {}, true)),

  listRooms: (projectId: string) =>
    unwrap<LbRoom[]>(apiClient.get(`${LB}/projects/${projectId}/rooms`, {}, true)),

  createRoom: (
    projectId: string,
    payload: {
      name: string;
      roomType?: string;
      lengthFt?: number;
      widthFt?: number;
      workTypeIds?: number[];
    },
  ) =>
    unwrap<LbRoom>(apiClient.post(`${LB}/projects/${projectId}/rooms`, payload, true)),

  updateRoom: (
    roomId: string,
    payload: Partial<{
      name: string;
      progressPct: number;
      pct: number;
      status: string;
      holdReason: string | null;
      lengthFt: number;
      widthFt: number;
    }>,
  ) => unwrap<LbRoom>(apiClient.patch(`${LB}/rooms/${roomId}`, payload, true)),

  deleteRoom: (roomId: string) =>
    apiClient.delete(`${LB}/rooms/${roomId}`, {}, true),

  addRoomWorkType: (roomId: string, workTypeId: string) =>
    apiClient.post(`${LB}/rooms/${roomId}/work-types`, { workTypeId: Number(workTypeId) }, true),

  deleteRoomWorkType: (roomWorkTypeId: string) =>
    apiClient.delete(`${LB}/room-wt/${roomWorkTypeId}`, {}, true),

  getDprContext: (projectId: string, params: { date: string; roomId: string }) =>
    unwrap<LbDprContext>(
      apiClient.get(`${LB}/projects/${projectId}/dpr`, params, true),
    ),

  deleteDprPhoto: (photoId: string) =>
    unwrap<{ deleted: boolean }>(
      apiClient.delete(`${LB}/dpr/photos/${photoId}`, {}, true),
    ),

  submitDpr: async (
    projectId: string,
    payload: LbDprSubmitPayload,
    photosByWorkType: Record<string, File[]>,
  ) => {
    const form = new FormData();
    form.append('date', payload.date);
    form.append('roomId', payload.roomId);
    form.append('entries', JSON.stringify(payload.entries));
    Object.entries(photosByWorkType).forEach(([roomWorkTypeId, files]) => {
      files.forEach((file, i) => {
        form.append(`photos_${roomWorkTypeId}`, file, file.name || `photo-${i}.jpg`);
      });
    });
    return unwrap<{ ok: boolean; message?: string }>(
      apiClient.raw({
        url: `${LB}/projects/${projectId}/dpr/submit`,
        method: 'POST',
        params: form,
        auth: true,
        type: 'file',
      }),
    );
  },

  listPayments: (projectId: string) =>
    unwrap<LbPayment[]>(
      apiClient.get(`${LB}/projects/${projectId}/payments`, {}, true),
    ),

  createPayment: (
    projectId: string,
    payload: {
      label: string;
      pct: number;
      dueDate: string;
      status?: string;
    },
  ) =>
    unwrap<LbPayment>(
      apiClient.post(`${LB}/projects/${projectId}/payments`, payload, true),
    ),

  updatePayment: (
    paymentId: string,
    payload: Partial<{
      label: string;
      pct: number;
      pctOfTotal: number;
      dueDate: string;
      status: string;
      paidDate: string | null;
    }>,
  ) =>
    unwrap<LbPayment>(apiClient.patch(`${LB}/payments/${paymentId}`, payload, true)),

  deletePayment: (paymentId: string) =>
    apiClient.delete(`${LB}/payments/${paymentId}`, {}, true),

  markPaymentPaid: (paymentId: string, paidDate?: string) =>
    livebuildApi.updatePayment(paymentId, {
      status: 'paid',
      paidDate: paidDate ?? new Date().toISOString().slice(0, 10),
    }),

  listQueries: (projectId: string, status?: string) =>
    unwrap<LbQuery[]>(
      apiClient.get(
        `${LB}/projects/${projectId}/queries`,
        status ? { status } : {},
        true,
      ),
    ),

  replyQuery: (projectId: string, queryId: string, reply: string) =>
    unwrap<LbQuery>(
      apiClient.patch(
        `${LB}/queries/${queryId}/reply`,
        { reply, repliedBy: 'Admin' },
        true,
      ),
    ),

  listDocuments: (projectId: string, category?: string) =>
    unwrap<LbDocument[]>(
      apiClient.get(
        `${LB}/projects/${projectId}/documents`,
        category ? { category } : {},
        true,
      ),
    ),

  uploadDocument: async (
    projectId: string,
    file: File,
    meta: { name: string; category: string; roomId?: string },
  ) => {
    const form = new FormData();
    form.append('file', file);
    form.append('name', meta.name);
    form.append('category', meta.category);
    if (meta.roomId) form.append('roomId', meta.roomId);
    return unwrap<LbDocument>(
      apiClient.raw({
        url: `${LB}/projects/${projectId}/documents`,
        method: 'POST',
        params: form,
        auth: true,
        type: 'file',
      }),
    );
  },

  deleteDocument: (docId: string) =>
    apiClient.delete(`${LB}/documents/${docId}`, {}, true),

  listMaterials: (projectId: string, params?: { room?: string; status?: string }) =>
    unwrap<LbMaterial[]>(
      apiClient.get(`${LB}/projects/${projectId}/materials`, params ?? {}, true),
    ),

  createMaterial: (
    projectId: string,
    payload: {
      name: string;
      roomId?: number;
      workTypeId?: number;
      category?: string;
      specification?: string;
      brand?: string;
      quantity?: number;
      unit?: string;
      status?: string;
    },
  ) =>
    unwrap<LbMaterial>(
      apiClient.post(`${LB}/projects/${projectId}/materials`, payload, true),
    ),

  updateMaterial: (
    materialId: string,
    payload: Partial<{ name: string; qty: string; status: string; notes: string }>,
  ) =>
    unwrap<LbMaterial>(apiClient.patch(`${LB}/materials/${materialId}`, payload, true)),

  deleteMaterial: (materialId: string) =>
    apiClient.delete(`${LB}/materials/${materialId}`, {}, true),
};

export default livebuildApi;
