import fetch from "isomorphic-unfetch";
// @ts-ignore
import merge from "lodash/merge";
import { getSession } from "next-auth/react";
import { getTokenFromStore } from "@/store/useSessionStore";

export function encodeQueryData(data = {}) {
  const params = new URLSearchParams();
  for (const key in data) {
    const value = data[key];
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined && value !== null) {
      params.append(key, value);
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

const strapi_url = process.env.NEXT_PUBLIC_STRAPI_API;

const URLS = {
  blogs: `${base_url}blog`,
  otp: `${base_url}otp`,
  user: `${base_url}users`,
  testimonials: `${base_url}testimonials`,
  post_property: `${base_url}property`,
  builder_leads: `${base_url}builder-leads`,
  address: `${base_url}addresses`,
  furniture: `${base_url}furniture`,
  cart: `${base_url}cart`,
  furniture_leads: `${base_url}furniture-leads`,
  notifications: `${base_url}notifications`,
  servicecustomlead: `${base_url}Servicecustomlead`,
  property: `${base_url}property`,
  propertyPremiumPlans: `${base_url}property-premium-plans`,
  payment: `${base_url}payments`,
  payments: `${base_url}payments`,
  orders: `${base_url}orders`,
  homeDecor: `${base_url}homeDecor`,
  careers: `${base_url}admin/careers`,
  apply: `${base_url}careers`,
  crmlead: `${base_url}crmlead`,
  Requestcall: `${base_url}Requestcall`,
  wishlist: `${base_url}wishlist`,
  reviews: `${base_url}reviews`,
  customBuilder: `${base_url}custom-builder`,
  paymentTracking: `${base_url}payment-tracking`,
  customer: `${base_url}customer`,
  company: `${base_url}custom-property`,
  companyonboarding: `${base_url}companyOnboarding`,
  strapiInteriors: `${strapi_url}`,
  electronics: `${base_url}electronics`,
  company_address: `${base_url}company-address`,
  company_awards: `${base_url}company-awards`,
  delete_account: `${base_url}delete-account`,
  property_leads: `${base_url}property-leads`,
  queries: `${base_url}queries`,
  unified_listing: `${base_url}unified-listings`,
  s3bucket: `${base_url}s3bucket`,
  referrals: `${base_url}referrals`,
  contact_us: `${base_url}contact-us`,
  payments: `${base_url}payments`,
  referandearn: `${base_url}refer-and-earn`,
  referAndEarnProperties: `${base_url}refer-and-earn/properties`,
  chat: `${base_url}chat`,
  chatDm: `${base_url}chat/dm`,
  chatThreads: `${base_url}chat/threads`,
  chatbotConversations: `${base_url}chatbot/conversations`,
  branches: `${base_url}branches`,
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
    return session?.accessToken || session?.token || "";
  }
  return getTokenFromStore() || "";
};

/** Server (ctx): getSession. Client: token from Zustand store (no /api/auth/session call). */
const getTokenForRequest = async (ctx) => {
  if (ctx) {
    const session = await getSession(ctx);
    return session?.accessToken || session?.token || "";
  }
  return getTokenFromStore() || "";
};

const makeHeadersAndParams = async (params, auth, type, ctx = undefined) => {
  const { headers = {}, ...restParams } = params;
  const baseHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let headerConfig = new Headers(merge(baseHeaders, headers));

  if (auth && !headerConfig.get("Authorization")) {
    const token = await getTokenForRequest(ctx);
    if (token) {
      headerConfig.set("Authorization", `Bearer ${token}`);
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
    ctx
  );
  const options = {
    method,
    headers,
  };
  if (method === "GET") {
    if (Object.keys(apiParams).length > 0) url += encodeQueryData(apiParams);
  } else {
    options["body"] = type === "file" ? params : JSON.stringify(apiParams);
  }

  return fetch(url, options).then((response) => {
    if (response.status === 401) {
      console.warn("401 Unauthorized:", method, url);
    }
    return getResponseBody(response).then((body = {}) => {
      if (response.ok) {
        return { body, status: response.status };
      } else {
        throw new ResponseError(response.status, response, body);
      }
    });
  });
};

const _request = request;

const get = (url, params, auth = false, ctx = undefined) => {
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
