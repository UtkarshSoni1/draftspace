import { NextRequest } from "next/server";
import { z } from "zod";
import { parseImageSize } from "@/lib/api/image-config";
import {
  AI_CORS_HEADERS,
  checkRateLimit,
  classifyGeminiFailure,
  formatZodError,
  jsonResponse,
  logAiRequest,
  parseGoogleApiError,
} from "@/lib/api/ai-shared";

export const runtime = "nodejs";

/** Nano Banana 2 — Gemini native image generation */
const NANO_BANANA_MODEL = "gemini-3.1-flash-image-preview";

const bodySchema = z.object({
  prompt: z.string().min(1, "prompt is required").max(32_000),
  size: z.string().max(64).optional(),
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

  const limited = checkRateLimit(request);
  if (!limited.ok) {
    return jsonResponse(
      {
        success: false,
        data: "",
        error: "Too many requests. Limit is 10 per minute.",
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return jsonResponse(
      {
        success: false,
        data: "",
        error: "Server misconfiguration: GEMINI_API_KEY is not set.",
      },
      { status: 500 }
    );
  }

  const { prompt, size } = parsed.data;
  const { aspectRatio, imageSize } = parseImageSize(size);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${NANO_BANANA_MODEL}:generateContent`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error calling Gemini.";
    return jsonResponse(
      { success: false, data: "", error: msg },
      { status: 502 }
    );
  }

  let body: GenerateContentResponse;
  try {
    body = (await res.json()) as GenerateContentResponse;
  } catch {
    return jsonResponse(
      { success: false, data: "", error: "Invalid response from Gemini." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const apiMsg =
      parseGoogleApiError(body) ?? body.error?.message ?? res.statusText;
    const { status, clientMessage } = classifyGeminiFailure(
      apiMsg,
      res.status
    );
    return jsonResponse(
      { success: false, data: "", error: clientMessage },
      { status }
    );
  }

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
    ? `Model returned text instead of an image: ${textFallback.slice(0, 500)}`
    : "No image data in the model response.";
  return jsonResponse({ success: false, data: "", error: detail }, { status: 422 });
}
