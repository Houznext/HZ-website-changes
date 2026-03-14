import fetch from "isomorphic-unfetch";
// @ts-ignore
import merge from "lodash/merge";
import { getSession } from "next-auth/react";

function getTokenFromStore() {
  if (typeof window === "undefined") return null;
  try {
    const { useSessionStore } = require("@/src/stores/useSessionStore");
    return useSessionStore.getState().token;
  } catch {
    return null;
  }
}

// Dedupe session fetches: avoid multiple /api/auth/session calls when store is not yet populated
const SESSION_CACHE_MS = 5000; // 5 seconds
let cachedSessionToken = null;
let cachedSessionAt = 0;

async function getSessionTokenOnce() {
  const now = Date.now();
  if (cachedSessionToken && now - cachedSessionAt < SESSION_CACHE_MS) {
    return cachedSessionToken;
  }
  const session = await getSession();
  const token = session?.token ?? session?.user?.token ?? session?.accessToken ?? "";
  cachedSessionToken = token || null;
  cachedSessionAt = now;
  return cachedSessionToken;
}

export function encodeQueryData(data = {}) {
  if (!data || Object.keys(data).length === 0) {
    return "";
  }
  const params = new URLSearchParams();
  for (const key in data) {
    const value = data[key];
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v)); // Handle arrays
    } else if (value !== undefined && value !== null) {
      params.append(key, value); // Handle other key-value pairs
    }
  }
  return "?" + params.toString();
}

export function tryParseJSON(json) {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error(`Failed to parse unexpected JSON response: ${json}`);
  }
}
const base_url =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;

const URLS = {
  blogs: `${base_url}blog`,
  blogSeed: `${base_url}blog/seed`,
  otp: `${base_url}otp`,
  user: `${base_url}users`,
  testimonials: `${base_url}testimonials`,
  post_property: `${base_url}property`,
  builder_leads: `${base_url}builder-leads`,
  address: `${base_url}addresses`,
  roles: `${base_url}roles`,
  property: `${base_url}property`,
  homeDecor: `${base_url}homeDecor`,
  homeDecorSeed: `${base_url}homeDecor/seed`,
  careers: `${base_url}admin/careers`,
  cost_estimator: `${base_url}cost-estimator`,
  cb_customer: `${base_url}customer`,
  custom_builder: `${base_url}custom-builder`,
  cb_location: `${base_url}locations`,
  custom_property: `${base_url}custom-property`,
  borewell: `${base_url}borewells`,
  cb_services: `${base_url}cb-service`,
  document_drafting: `${base_url}document-drafting`,
  centring: `${base_url}centring`,
  brick_masonry: `${base_url}brick-masonry`,
  fall_ceiling: `${base_url}fall-ceiling`,
  flooring: `${base_url}flooring`,
  plumbing: `${base_url}plumbing`,
  painting: `${base_url}painting`,
  electricity: `${base_url}electricity`,
  floor_details: `${base_url}floors`,
  crmlead: `${base_url}crmlead`,
  daily_progress: `${base_url}daily-progress`,
  notifications: `${base_url}notifications`,

  company_Onboarding: `${base_url}companyOnboarding`,
  company_address: `${base_url}company-address`,
  company_awards: `${base_url}company-awards`,
  interiorService: `${base_url}interior-services`,
  payment_tracking: `${base_url}payment-tracking`,
  electronics: `${base_url}electronics`,
  electronicsSeed: `${base_url}electronics/seed`,
  furniture: `${base_url}furniture`,
  furnitureSeed: `${base_url}furniture/seed`,
  invoice_estimator: `${base_url}invoice-estimator`,
  whatsappSend: `${base_url}send-whatsapp`,
  queries: `${base_url}queries`,
  servicecustomlead: `${base_url}Servicecustomlead`,

  s3bucket: `${base_url}s3bucket`,
  property_leads: `${base_url}property-leads`,
  packages: `${base_url}packages`,
  towns: `${base_url}towns`,
  states: `${base_url}states`,
  referrals: `${base_url}referrals`,
  staffattendance: `${base_url}staff-attendance`,
  contact_us: `${base_url}contact-us`,
  phases: `${base_url}phases`,
  documents: `${base_url}documents`,
  branches: `${base_url}branches`,
  branchroles: `${base_url}branch-roles`,
  hrBaseUrl: `${base_url}hr`,
  orders: `${base_url}orders`,
  solarOrders: `${base_url}solar-orders`,
  shiprocket: `${base_url}shiprocket`,
  payments: `${base_url}payments`,
  propertyReferral: `${base_url}refer-and-earn/admin`,
  referandearn: `${base_url}refer-and-earn`,

  chat: `${base_url}chat`,
  chatDm: `${base_url}chat/dm`,
  chatChannels: `${base_url}chat/channels`,
  chatHistory: `${base_url}chat/admin/chat-history`,
  chatHistoryDelete: `${base_url}chat/admin/chat-history/delete`,
  resourcesadmin: `${base_url}chat/admin/resources`,
  deleteChatMessage: `${base_url}chat/messages`,
  chatThreads: `${base_url}chat/threads`,
  clearChat: `${base_url}chat/threads`,

  // Interiors (BuildLive) base
  interiors: `${base_url}interiors`,
};

const getResponseBody = (response) => {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.indexOf("json") >= 0
    ? response.clone().text().then(tryParseJSON)
    : response.clone().text();
};

function ResponseError(status, response, body) {
  this.name = "ResponseError";
  this.status = status;
  this.response = response;
  this.body = body;
}
ResponseError.prototype = Error.prototype;

export const retrieveToken = async (ctx = undefined) => {
  if (ctx?.req) {
    const session = await getSession(ctx);
    // @ts-ignore
    return session?.accessToken || "";
  } else {
    const session = await getSession();
    // @ts-ignore
    return session?.accessToken || "";
  }
};

const makeHeadersAndParams = async (params, auth, type, ctx = undefined) => {
  const { headers = {}, ...restParams } = params;
  const baseHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let headerConfig = new Headers();
  if (type !== "file") {
    headerConfig = new Headers(merge(baseHeaders, headers));
  }
  if (auth && !headerConfig.get("Authorization")) {
    let bearer = getTokenFromStore();
    if (!bearer && typeof window !== "undefined") {
      bearer = await getSessionTokenOnce();
    }
    if (!bearer && ctx) {
      const session = await getSession(ctx);
      bearer = session?.token || session?.user?.token || session?.accessToken || "";
    }
    if (bearer) {
      headerConfig.set("Authorization", `Bearer ${bearer}`);
    } else {
      console.warn("apiClient: missing auth token for request");
    }
  }
  return {
    headers: headerConfig,
    params: restParams || {},
  };
};

const request = async ({
  url = "",
  method = "GET",
  params = {},
  auth = false,
  type,
  ctx = undefined,
}) => {
  const { headers, params: apiParams } = await makeHeadersAndParams(
    params,
    auth,
    type,
    ctx,
  );
  const options = {
    method,
    headers,
  };
  if (method === "GET") {
    url += encodeQueryData(apiParams);
  } else {
    options["body"] = type === "file" ? params : JSON.stringify(apiParams);
  }

  return fetch(url, options).then((response) => {
    return getResponseBody(response).then((body = {}) => {
      if (response.ok) {
        return { body, status: response.status };
      } else if (response.status === 401 || response.status === 403) {
        throw new ResponseError(response.status, response, body);
      } else {
        throw new ResponseError(response.status, response, body);
      }
    });
  });
};

const _request = request;

const get = (url, params, auth = false) => {
  // @ts-ignore
  return _request({
    method: "GET",
    url,
    params,
    auth,
  });
};

const post = (url, params, auth = false, type) => {
  return _request({
    method: "POST",
    url,
    params,
    auth,
    type,
  });
};

const put = (url, params, auth = false) => {
  // @ts-ignore
  return _request({
    method: "PUT",
    url,
    params,
    auth,
  });
};

const patch = (url, params, auth = false) => {
  // @ts-ignore
  return _request({
    method: "PATCH",
    url,
    params,
    auth,
  });
};

const _delete = (url, params, auth = false) => {
  // @ts-ignore
  return _request({
    method: "DELETE",
    url,
    params,
    auth,
  });
};

const apiClient = {
  URLS,
  get,
  post,
  put,
  patch,
  delete: _delete,
  raw: _request,
};

export default apiClient;
