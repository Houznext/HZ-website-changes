// /app/api/chat/route.ts
import apiClient from "@/utils/apiClient";
import { insertContext, productToParagraph } from "@/utils/chat/chatbot-helper";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import {
  buildFurnitureLink,
  buildElectronicsLink,
  getBaseUrl,
  parseFurnitureIntent,
  parseElectronicsIntent,
} from "./helper";

export const maxDuration = 30;
export const runtime = "edge";

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
