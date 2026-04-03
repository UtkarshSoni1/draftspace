import type { NextRequest } from "next/server";
import type { ZodError } from "zod";

export function formatZodError(err: ZodError): string {
  return err.issues
    .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
    .join("; ");
}

export const AI_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

/** In-memory sliding window; best-effort per server instance */
const requestTimestamps = new Map<string, number[]>();

export function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return ip;
}

export function checkRateLimit(
  request: NextRequest
): { ok: true } | { ok: false; retryAfterMs: number } {
  const key = getClientKey(request);
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const prev = requestTimestamps.get(key) ?? [];
  const times = prev.filter((t) => t > windowStart);

  if (times.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = times[0]!;
    const retryAfterMs = Math.max(0, oldest + RATE_WINDOW_MS - now);
    return { ok: false, retryAfterMs };
  }

  times.push(now);
  requestTimestamps.set(key, times);

  if (requestTimestamps.size > 50_000) {
    for (const [k, arr] of requestTimestamps) {
      requestTimestamps.set(
        k,
        arr.filter((t) => t > windowStart)
      );
    }
  }

  return { ok: true };
}

export function logAiRequest(route: string, request: NextRequest): void {
  console.log(
    `[ai:${route}] ${new Date().toISOString()} client=${getClientKey(request)}`
  );
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit & { headers?: Record<string, string> } = {}
): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...AI_CORS_HEADERS,
    ...init.headers,
  });
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function parseGoogleApiError(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const err = (body as { error?: { message?: string; status?: string } })
    .error;
  return err?.message ?? null;
}

export function classifyGeminiFailure(
  message: string,
  status?: number
): { status: number; clientMessage: string } {
  const m = message.toLowerCase();
  if (
    status === 401 ||
    status === 403 ||
    /api key|api_key|invalid.*key|permission denied|not authenticated/i.test(m)
  ) {
    return {
      status: 401,
      clientMessage: "Invalid or missing Gemini API key.",
    };
  }
  if (
    status === 429 ||
    /resource_exhausted|rate limit|quota|too many requests/i.test(m)
  ) {
    return {
      status: 429,
      clientMessage: "Gemini rate limit or quota exceeded. Try again later.",
    };
  }
  return { status: 502, clientMessage: message };
}
