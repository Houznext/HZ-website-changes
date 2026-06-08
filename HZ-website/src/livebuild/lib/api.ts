import type {
  LbAccountStats,
  LbDayProgress,
  LbDocumentsResponse,
  LbMaterialsResponse,
  LbPayments,
  LbProjectHome,
  LbProjectSummary,
  LbPropertyInfo,
  LbQuery,
  LbRoomDetail,
  LbViz,
} from './types';

let customerBearer: string | null = null;

/** Use HZ website customer JWT (from profile login). */
export function configureLivebuildAuth(token: string | null): void {
  customerBearer = token;
}

function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
    'http://localhost:3001';
  return raw.replace(/\/?$/, '');
}

export class LbApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'LbApiError';
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

async function lbFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (customerBearer) {
    headers.set('Authorization', `Bearer ${customerBearer}`);
  }
  const res = await fetch(`${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  });
  const data = await parseJson<{ message?: string | string[] } & T>(res);
  if (!res.ok) {
    const raw = data?.message;
    const msg =
      (Array.isArray(raw) ? raw[0] : raw) ||
      res.statusText ||
      'Request failed';
    throw new LbApiError(res.status, String(msg));
  }
  return data as T;
}

export const livebuildApi = {
  myStats: () => lbFetch<LbAccountStats>('/livebuild/my/stats'),

  myProjects: () => lbFetch<LbProjectSummary[]>('/livebuild/my/projects'),

  projectHome: (projectId: string) =>
    lbFetch<LbProjectHome>(`/livebuild/my/projects/${projectId}`),

  dayProgress: (
    projectId: string,
    params?: { roomId?: string; range?: string; date?: string },
  ) => {
    const q = new URLSearchParams();
    if (params?.roomId) q.set('roomId', params.roomId);
    if (params?.range) q.set('range', params.range);
    if (params?.date) q.set('date', params.date);
    const qs = q.toString();
    return lbFetch<LbDayProgress>(
      `/livebuild/my/projects/${projectId}/day-progress${qs ? `?${qs}` : ''}`,
    );
  },

  room: (projectId: string, roomId: string) =>
    lbFetch<LbRoomDetail>(`/livebuild/my/projects/${projectId}/rooms/${roomId}`),

  payments: (projectId: string) =>
    lbFetch<LbPayments>(`/livebuild/my/projects/${projectId}/payments`),

  queries: (projectId: string) =>
    lbFetch<LbQuery[]>(`/livebuild/my/projects/${projectId}/queries`),

  raiseQuery: (
    projectId: string,
    body: { subject: string; message: string; roomId?: string },
  ) =>
    lbFetch<LbQuery>(`/livebuild/my/projects/${projectId}/queries`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  propertyInfo: (projectId: string) =>
    lbFetch<LbPropertyInfo>(`/livebuild/my/projects/${projectId}/property-info`),

  materials: (projectId: string, params?: { status?: string; room?: string }) => {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.room && params.room !== 'all') q.set('room', params.room);
    const qs = q.toString();
    return lbFetch<LbMaterialsResponse>(
      `/livebuild/my/projects/${projectId}/materials${qs ? `?${qs}` : ''}`,
    );
  },

  documents: (projectId: string) =>
    lbFetch<LbDocumentsResponse>(`/livebuild/my/projects/${projectId}/documents`),

  viz: (projectId: string) =>
    lbFetch<LbViz>(`/livebuild/my/projects/${projectId}/viz`),
};
