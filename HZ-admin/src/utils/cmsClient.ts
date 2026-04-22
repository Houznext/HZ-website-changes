/**
 * CMS uses a Next.js rewrite to the Nest API so the browser only talks to the
 * admin origin (avoids CORS and wrong `NEXT_PUBLIC_*` values at build time).
 * See `next.config.js` → `rewrites` → `/api/hz-backend/*`.
 */
const CMS_PATH = "/api/hz-backend/cms";

/** `errorMessage` is set when `ok` is false (plain object shape avoids ternary narrow issues in TS). */
export type CmsActionResult = { ok: boolean; errorMessage?: string };

function errorHintForCmsRequest(status: number): string {
  if (status === 502 || status === 503 || status === 504) {
    return "Cannot reach the API (proxy got a bad gateway / timeout). Start HZ-backend: npm run start:dev in folder HZ-backend (port 4000 by default), or set BACKEND_REWRITE_URL in .env.local to your API base.";
  }
  if (status >= 500) {
    return `API error (HTTP ${status}). Start the Nest server on the port in next.config, or check BACKEND_REWRITE_URL.`;
  }
  if (status === 401) {
    return "Not authorized — sign in again.";
  }
  if (status === 403) {
    return "You don’t have permission for this action.";
  }
  return `Request failed (HTTP ${status}).`;
}

export async function getCmsData(
  key: string,
): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${CMS_PATH}/${key}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Authenticated: returns draft or published data for the CMS editor */
export async function getCmsManagement(
  key: string,
  token: string,
): Promise<{
  data: Record<string, any> | null;
  status: string | null;
  errorMessage?: string;
}> {
  try {
    const res = await fetch(`${CMS_PATH}/manage/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return {
        data: null,
        status: null,
        errorMessage: errorHintForCmsRequest(res.status),
      };
    }
    const json = await res.json();
    return { data: json.data ?? null, status: json.status ?? null };
  } catch {
    return {
      data: null,
      status: null,
      errorMessage:
        "Could not load CMS (network). Is the API running? Start HZ-backend: npm run start:dev.",
    };
  }
}

export async function saveDraft(
  key: string,
  data: Record<string, any>,
  token: string,
): Promise<CmsActionResult> {
  try {
    const res = await fetch(`${CMS_PATH}/${key}/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, errorMessage: errorHintForCmsRequest(res.status) };
  } catch {
    return {
      ok: false,
      errorMessage:
        "Network error. Start HZ-backend (npm run start:dev) so the admin can reach the API.",
    };
  }
}

export async function publishCms(
  key: string,
  data: Record<string, any>,
  token: string,
): Promise<CmsActionResult> {
  try {
    const res = await fetch(`${CMS_PATH}/${key}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, errorMessage: errorHintForCmsRequest(res.status) };
  } catch {
    return {
      ok: false,
      errorMessage:
        "Network error. Start HZ-backend (npm run start:dev) so the admin can reach the API.",
    };
  }
}
