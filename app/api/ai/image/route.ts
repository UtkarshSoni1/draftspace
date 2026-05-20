import { NextRequest } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { parseImageSize } from "@/lib/api/image-config";
import {
  AI_CORS_HEADERS,
  checkRateLimit,
  classifyGeminiFailure,
  formatZodError,
  jsonResponse,
  logAiRequest,
} from "@/lib/api/ai-shared";

export const runtime = "nodejs";

/**
 * Gemini native image generation model.
 * gemini-2.5-flash-image  = stable "Nano Banana" – best free-tier quota.
 * gemini-3.1-flash-image-preview = "Nano Banana 2" – preview, lower RPM limits.
 */
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";


const bodySchema = z.object({
  prompt: z.string().min(1, "prompt is required").max(32_000),
  size: z.string().max(64).optional(),
  /** Optional user Gemini key (same-origin apps may also send `X-Gemini-Api-Key`). */
  geminiApiKey: z.string().max(512).optional(),
});

type Part = {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; mimeType?: string; data?: string };
};

type GenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Part[];
    };
  }>;
  error?: { message?: string; code?: number; status?: string };
};

function getInlineImage(part: Part): { mime: string; data: string } | null {
  const inline = part.inlineData ?? part.inline_data;
  const data = inline?.data;
  if (!data) return null;
  const mime =
    part.inlineData?.mimeType ??
    part.inline_data?.mime_type ??
    part.inline_data?.mimeType ??
    "image/png";
  return { mime, data };
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: AI_CORS_HEADERS });
}

export async function POST(request: NextRequest): Promise<Response> {
  logAiRequest("image", request);

  const limited = checkRateLimit(request, "image");
  if (!limited.ok) {
    return jsonResponse(
      {
        success: false,
        data: "",
        error: "Too many requests. Please try again in a moment.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)),
        },
      }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonResponse(
      { success: false, data: "", error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse(
      {
        success: false,
        data: "",
        error: formatZodError(parsed.error),
      },
      { status: 400 }
    );
  }

  const headerKey = request.headers.get("x-gemini-api-key")?.trim();
  const bodyKey = parsed.data.geminiApiKey?.trim();
  const userApiKey = headerKey || bodyKey || "";
  const serverApiKey =
    process.env.GEMINI_API_KEY_IMAGE ?? process.env.GEMINI_API_KEY ?? "";
  const apiKey = userApiKey || serverApiKey;
  if (!apiKey) {
    return jsonResponse(
      {
        success: false,
        data: "",
        error:
          "No Gemini API key: set GEMINI_API_KEY_IMAGE or GEMINI_API_KEY on the server, or add your key under the command bar (Gemini image key) or send header X-Gemini-Api-Key / body field geminiApiKey.",
      },
      { status: 400 }
    );
  }

  const { prompt, size } = parsed.data;
  const { aspectRatio } = parseImageSize(size);
  const ai = new GoogleGenAI({ apiKey });

  const promptWithRatio =
    aspectRatio && aspectRatio !== "1:1"
      ? `${prompt}\n\nAspect ratio: ${aspectRatio}`
      : prompt;

  let body: GenerateContentResponse;
  try {
    body = (await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: promptWithRatio,
    })) as GenerateContentResponse;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error calling Gemini.";
    console.error("[image] SDK error:", msg);
    const { status, clientMessage } = classifyGeminiFailure(msg, 502);
    return jsonResponse(
      { success: false, data: "", error: clientMessage },
      { status }
    );
  }

  console.log("[image] Gemini raw parts count:", body.candidates?.[0]?.content?.parts?.length ?? 0);

  const parts = body.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = getInlineImage(part);
    if (inline) {
      const imageUrl = `data:${inline.mime};base64,${inline.data}`;
      return jsonResponse({ success: true, data: imageUrl });
    }
  }

  const textFallback = parts.map((p) => p.text).filter(Boolean).join("\n");
  const detail = textFallback?.trim()
    ? `Model returned text instead of image: ${textFallback.slice(0, 500)}`
    : "No image data returned. Check server logs for details.";
  console.warn("[image] No image in response. Parts:", JSON.stringify(parts).slice(0, 300));
  return jsonResponse({ success: false, data: "", error: detail }, { status: 422 });
}
