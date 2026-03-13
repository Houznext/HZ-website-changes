// /app/api/chat/route.ts
import apiClient from "@/utils/apiClient";
import { insertContext, productToParagraph } from "@/utils/chat/chatbot-helper";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import {
  buildPropertyLink,
  buildFurnitureLink,
  buildElectronicsLink,
  getBaseUrl,
  parsePropertySearchIntent,
  parseFurnitureIntent,
  parseElectronicsIntent,
} from "./helper";

export const maxDuration = 30;
export const runtime = "edge";

interface PropertyQueryFilters {
  city?: string;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  lookingType?: string;
  purpose?: string;
  propertyType?: string;
  bhkType?: string;
}

const GENERAL_KNOWLEDGE = `
### General Guidance (Use when relevant)
- **Property measurements (India):** 1 sq yd = 9 sq ft; 1 sq m ≈ 10.764 sq ft. Built-up > Carpet. Super area includes common areas.
- **Vastu (high-level only):** Entry NE/North preferred; Master BR SW; Kitchen SE/NW; avoid toilets over kitchen. Always add: "Consult a certified Vastu expert for site-specific advice."
- **Interiors quick tips:** Modular kitchen triangle (hob–sink–fridge) 4–7m. Wardrobe depth 22–24". TV viewing distance ≈ screen diagonal × 1.5–2. Sofa seat height 16–18".
- **Painting:** Economy (2–3 yrs), Premium (4–6 yrs), Luxury (washable, low VOC). Estimate = area × base rate × finish multiplier.
- **Construction:** Always do soil test, structural design, BOQ, and permits. Track progress (labor count, material GRNs, photos) daily.
(Only use these when user asks general questions. For company specifics, prefer the Houznext context.)
`;

const getFurnitureContext = async () => {
  const response = await apiClient.get(`${apiClient.URLS.furniture}`);
  const body: any = response?.body ?? response;
  const data: any = body?.data ?? body;
  if (!Array.isArray(data) || data.length === 0) {
    return {
      body: [],
      message: "Note: No furniture items are available at the moment.",
    };
  }
  return { ...response, body: data };
};

const getPropertyContext = async (
  filters?: PropertyQueryFilters,
  baseUrl?: string
) => {
  const params: any = {};
  if (filters?.city) params.city = [filters.city];
  if (filters?.locality) params.locality = [filters.locality];
  if (filters?.minPrice && filters?.maxPrice)
    params.priceRange = [`${filters.minPrice}-${filters.maxPrice}`];

  const response = await apiClient.get(apiClient.URLS.unified_listing, {
    params,
  });

  const link = buildPropertyLink(
    {
      lookingType: (filters?.lookingType as "buy" | "rent") || "buy",
      city: filters?.city || "Hyderabad",
      purpose: filters?.purpose || "Residential",
      propertyType: filters?.propertyType,
      bhkType: filters?.bhkType,
      locality: filters?.locality,
      page: 1,
    },
    baseUrl
  );

  return {
    ...response,
    link,
    message:
      !response?.body || response.body.length === 0
        ? `Note: No properties found${
            filters?.city ? ` in ${filters.city}` : ""
          }.`
        : undefined,
  };
};

const furnitureKeywords = [
  "furniture",
  "sofa",
  "chair",
  "table",
  "bed",
  "cabinet",
  "desk",
  "couch",
  "Study & Office",
  "Custom Furniture",
];
const propertyKeywords = [
  "property",
  "buy",
  "rent",
  "flat",
  "villa",
  "plot",
  "commercial",
];

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Google Generative AI API key is missing. Set GOOGLE_GENERATIVE_AI_API_KEY in your .env (get a key at https://aistudio.google.com/app/apikey).",
        },
        { status: 500 }
      );
    }
    const { messages } = await req.json();
    const lastMessageRaw = messages?.[messages.length - 1]?.content || "";
    const lastMessage = lastMessageRaw.toLowerCase();

    const baseUrl =
      (typeof process !== "undefined" && process.env?.NEXTAUTH_URL)
        ? getBaseUrl()
        : req.headers.get("origin") ||
          (req.headers.get("x-forwarded-host")
            ? `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("x-forwarded-host")}`
            : getBaseUrl());

    const context: any = { baseUrl };

    // Property search intent: call API for count + preview, build URL, inject once
    const propertyIntent = parsePropertySearchIntent(lastMessageRaw);
    if (propertyIntent) {
      context.property_search_url = buildPropertyLink(propertyIntent, baseUrl);
      try {
        const listingPayload: Record<string, string | string[] | number> = {
          city: [(propertyIntent.city || "Hyderabad").toLowerCase()],
          lookingtype: [propertyIntent.lookingType === "rent" ? "Rent" : "Sell"],
          purpose: ["Residential"],
          page: 1,
          limit: 6,
        };
        if (propertyIntent.locality)
          listingPayload.locality = [propertyIntent.locality];
        if (propertyIntent.bhkType)
          listingPayload.bhkType = [propertyIntent.bhkType.replace(/\s+/g, "")];
        if (propertyIntent.propertyType)
          listingPayload.propertytype = [propertyIntent.propertyType];

        const listRes = await apiClient.get(
          apiClient.URLS.unified_listing,
          listingPayload,
          false
        );
        const body = listRes?.body as any;
        const company = body?.companyProjects ?? [];
        const individual = body?.individualProperties ?? [];
        const pagination = body?.pagination ?? {};
        const companyTotal = pagination?.company?.total ?? 0;
        const individualTotal = pagination?.individual?.total ?? 0;
        const totalCount = companyTotal + individualTotal;
        const previewList = [...company, ...individual].slice(0, 4);
        context.property_search_count = totalCount;
        context.property_search_summary =
          previewList.length > 0
            ? previewList
                .map((p: any) => {
                  const name =
                    p.propertyName ?? p.Name ?? p.propertyDetails?.propertyName ?? "Property";
                  const city =
                    p.location?.city ?? p.locationDetails?.city ?? "";
                  const price =
                    p.pricing?.minPrice ?? p.minPrice ?? p.pricing?.expectedPrice;
                  return `${name}${city ? `, ${city}` : ""}${price ? ` (₹${Number(price).toLocaleString()})` : ""}`;
                })
                .join("; ")
            : null;
      } catch {
        context.property_search_count = null;
        context.property_search_summary = null;
      }
    }

    // Furniture intent: "show sofas" / "furniture for living room" -> dynamic URL
    const furnitureIntent = parseFurnitureIntent(lastMessageRaw);
    if (furnitureIntent) {
      context.furniture_search_url = buildFurnitureLink(
        baseUrl,
        furnitureIntent.category
      );
    }

    // Electronics intent: "electronics" / "kitchen appliances" -> dynamic URL
    const electronicsIntent = parseElectronicsIntent(lastMessageRaw);
    if (electronicsIntent) {
      context.electronics_search_url = buildElectronicsLink(
        baseUrl,
        electronicsIntent.category
      );
    }

    if (furnitureKeywords.some((k) => lastMessage.includes(k))) {
      const data = await getFurnitureContext();
      context.furniture_data = data?.body
        ?.map((item: any) => productToParagraph(item))
        .join(", ");
    }

    // Only fetch listing data when no property-search URL was generated (generic property chat)
    if (
      !context.property_search_url &&
      propertyKeywords.some((k) => lastMessage.includes(k))
    ) {
      const data = await getPropertyContext(
        {
          city: "Hyderabad",
          lookingType: lastMessage.includes("rent") ? "rent" : "buy",
          purpose: "Residential",
        },
        baseUrl
      );

      if (data.body?.length > 0) {
        context.property_data = `
${data.body
  .map(
    (p: any) =>
      `Property: ${p.propertyName}, Location: ${p.location?.city}, Price Range: ${p.pricing?.minPrice} - ${p.pricing?.maxPrice}`,
  )
  .join(", ")}
You can explore more here: ${data.link}
`;
      } else {
        context.property_data = data.message;
      }
    }

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: insertContext(context) + "\n" + GENERAL_KNOWLEDGE,
      messages,
    });
    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error("ERROR /api/chat:", err);
    const message = err?.message ?? "";
    const isRateLimit =
      err?.status === 429 ||
      err?.code === "rate_limit_exceeded" ||
      /resource exhausted|quota|rate limit|429/i.test(String(message));
    if (isRateLimit) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many requests. Please wait a minute and try again.",
        },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }
    return NextResponse.json(
      { success: false, message: message || "Chat failed" },
      { status: 500 }
    );
  }
}
