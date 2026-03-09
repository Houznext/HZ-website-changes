import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const insightCache = new Map<
  string,
  { insight: string; locality: string; cachedAt: number }
>();

function cacheKey(
  locality: string,
  city: string,
  subLocality?: string,
  lookingType?: string,
  purpose?: string,
  propertyType?: string
): string {
  return [locality, city, subLocality ?? "", lookingType ?? "", purpose ?? "", propertyType ?? ""]
    .join("|")
    .toLowerCase();
}

function getContextLabel(lookingType?: string, purpose?: string, propertyType?: string): string {
  const isRent = /rent|flatshare/i.test(lookingType ?? "");
  const isCommercial = /commercial/i.test(purpose ?? "");
  const isPlotOrLand = /plot|agricultural|land/i.test(propertyType ?? "");
  if (isPlotOrLand) return "land rate per sqft";
  if (isRent && isCommercial) return "commercial rental";
  if (isRent) return "residential rental";
  if (isCommercial) return "commercial sale price";
  return "sale price";
}

function getFallbackInsight(
  locationLabel: string,
  lookingType?: string,
  purpose?: string,
  propertyType?: string
): string {
  const ctx = getContextLabel(lookingType, purpose, propertyType);
  const isPerSqft = /land rate|per sqft/i.test(ctx);
  const suffix = isPerSqft
    ? " Land rates per sqft have shown an upward trend. Check current listings for exact rates."
    : " Property values have shown steady growth over the past 10 years. Consider checking recent listings for current market rates.";
  return `${locationLabel} is a well-connected locality. ${ctx.charAt(0).toUpperCase() + ctx.slice(1)} trends over the past decade have been positive.${suffix}`;
}

/**
 * GET /api/locality-trends?locality=...&city=...&subLocality=...&lookingType=...&purpose=...&propertyType=...
 * Returns synthetic 10-year trend data + AI-generated locality insight. Context-aware by lookingType (Rent/Sell), purpose (Residential/Commercial), propertyType (Plot/Agricultural Land → per sqft).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locality = searchParams.get("locality")?.trim();
  const city = searchParams.get("city")?.trim();
  const subLocality = searchParams.get("subLocality")?.trim();
  const lookingType = searchParams.get("lookingType")?.trim();
  const purpose = searchParams.get("purpose")?.trim();
  const propertyType = searchParams.get("propertyType")?.trim();

  if (!locality || !city) {
    return NextResponse.json(
      { error: "locality and city are required" },
      { status: 400 }
    );
  }

  const locationLabel = [locality, subLocality, city].filter(Boolean).join(", ");
  const key = cacheKey(locality, city, subLocality, lookingType, purpose, propertyType);
  const contextLabel = getContextLabel(lookingType, purpose, propertyType);
  const isPerSqft = /land rate|per sqft/i.test(contextLabel);

  // Deterministic synthetic 10-year trend (no API call); seed varies by context so different combos get slightly different curves
  const seed =
    (locationLabel + city + (lookingType ?? "") + (purpose ?? "") + (propertyType ?? ""))
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10;
  const trendData: { year: string; value: number }[] = [];
  let value = 80 + (seed % 20);
  for (let y = startYear; y <= currentYear; y++) {
    const step = 0.04 + (seed % 5) / 100;
    value = value * (1 + step);
    trendData.push({ year: String(y), value: Math.round(value) });
  }

  let insight = "";

  const cached = insightCache.get(key);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    insight = cached.insight;
  } else if (
    !process.env.DISABLE_LOCALITY_AI_INSIGHT &&
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  ) {
    try {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      const contextPrompt = isPerSqft
        ? `Focus on land/plot rates per sqft in "${locationLabel}" (India).`
        : lookingType?.toLowerCase().includes("rent")
          ? `Focus on rental market (${purpose || "residential"}): rents and rental demand in "${locationLabel}" (India).`
          : `Focus on sale prices (${purpose || "residential"}): property sale prices and capital appreciation in "${locationLabel}" (India).`;
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system:
          "You are a concise real estate analyst. Write 2-3 short sentences only. No bullet points or headers. Be specific to the type of property and transaction (rent vs buy, residential vs commercial, land per sqft when relevant).",
        prompt: `In 2-3 sentences, describe the real estate trend for: ${contextPrompt} Mention connectivity, livability, or investment outlook where relevant. Keep it factual and neutral.`,
      });
      insight = text?.trim() || getFallbackInsight(locationLabel, lookingType, purpose, propertyType);
      insightCache.set(key, { insight, locality: locationLabel, cachedAt: Date.now() });
    } catch (err) {
      console.error("Locality-trends AI insight error:", err);
      insight = getFallbackInsight(locationLabel, lookingType, purpose, propertyType);
      insightCache.set(key, { insight, locality: locationLabel, cachedAt: Date.now() });
    }
  } else {
    insight = getFallbackInsight(locationLabel, lookingType, purpose, propertyType);
  }

  return NextResponse.json({
    trendData,
    insight,
    locality: locationLabel,
    contextLabel,
    isPerSqft,
  });
}
