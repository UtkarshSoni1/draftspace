import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  AI_CORS_HEADERS,
  checkRateLimit,
  classifyGeminiFailure,
  formatZodError,
  jsonResponse,
  logAiRequest,
} from "@/lib/api/ai-shared";
import {
  detectLanguageFromPrompt,
  normalizeLanguageId,
} from "@/lib/api/language-detect";

export const runtime = "nodejs";

const bodySchema = z.object({
  prompt: z.string().min(1, "prompt is required").max(100_000),
  language: z.string().max(64).optional(),
});

const CODE_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT =
  "You are a code generator. Return ONLY code with no explanations. Add comments inline.";

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: AI_CORS_HEADERS });
}

export async function POST(request: NextRequest): Promise<Response> {
  logAiRequest("code", request);

  const limited = checkRateLimit(request, "text");
  if (!limited.ok) {
    return jsonResponse(
      {
        success: false,
        data: "",
        language: "",
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
      { success: false, data: "", language: "", error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse(
      {
        success: false,
        data: "",
        language: "",
        error: formatZodError(parsed.error),
      },
      { status: 400 }
    );
  }

  const { prompt, language: languageRaw } = parsed.data;
  const language = languageRaw?.trim()
    ? normalizeLanguageId(languageRaw)
    : detectLanguageFromPrompt(prompt);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return jsonResponse(
      {
        success: false,
        data: "",
        language,
        error: "Server misconfiguration: GEMINI_API_KEY is not set.",
      },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: CODE_MODEL,
    systemInstruction: `${SYSTEM_PROMPT} Target language: ${language}.`,
  });

  let result;
  try {
    result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const { status, clientMessage } = classifyGeminiFailure(msg);
    return jsonResponse(
      { success: false, data: "", language, error: clientMessage },
      { status }
    );
  }

  const text = result.response.text();
  if (!text?.trim()) {
    return jsonResponse(
      {
        success: false,
        data: "",
        language,
        error: "Empty response from model.",
      },
      { status: 502 }
    );
  }

  return jsonResponse({
    success: true,
    data: text.trim(),
    language,
  });
}
