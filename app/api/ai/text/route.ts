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

export const runtime = "nodejs";

const bodySchema = z.object({
  prompt: z.string().min(1, "prompt is required").max(100_000),
  maxTokens: z.number().int().min(1).max(8192).optional(),
});

const TEXT_MODEL = "gemini-2.5-flash";

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: AI_CORS_HEADERS });
}

export async function POST(request: NextRequest): Promise<Response> {
  logAiRequest("text", request);

  const limited = checkRateLimit(request, "text");
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

  const { prompt, maxTokens } = parsed.data;
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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: TEXT_MODEL,
    generationConfig: {
      maxOutputTokens: maxTokens ?? 2048,
    },
  });

  let streamResult;
  try {
    streamResult = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[ai:text] stream init failed, falling back to non-stream:", msg);

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.response.text()?.trim();

      if (!text) {
        return jsonResponse(
          { success: false, data: "", error: "Empty response from model." },
          { status: 502 }
        );
      }

      return jsonResponse({ success: true, data: text });
    } catch (fallbackError) {
      const fallbackMsg =
        fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      const { status, clientMessage } = classifyGeminiFailure(fallbackMsg);
      return jsonResponse(
        { success: false, data: "", error: clientMessage },
        { status }
      );
    }
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) {
            full += text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ chunk: text })}\n\n`
              )
            );
          }
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ success: true, data: full })}\n\n`
          )
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const { clientMessage } = classifyGeminiFailure(msg);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              success: false,
              data: "",
              error: clientMessage,
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      ...AI_CORS_HEADERS,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
