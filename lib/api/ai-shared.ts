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
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Gemini-Api-Key",
  "Access-Control-Max-Age": "86400",
};

// ── Rate limit config ─────────────────────────────────────────────────────────

const WINDOWS = [
  { ms: 10 * 60_000, maxText: 20, maxImage: 10 },
  { ms: 60 * 60_000, maxText: 50, maxImage: 25 },
] as const;

const MAX_LONGEST_WINDOW_MS = WINDOWS[WINDOWS.length - 1].ms;

type RequestType = "text" | "image";

interface TimestampBucket {
  text: number[];
  image: number[];
}

const store = new Map<string, TimestampBucket>();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Local / unknown IPs that should never hit the shared rate-limit bucket. */
const LOCAL_IPS = new Set(["unknown", "::1", "127.0.0.1", "localhost", ""]);

export function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  return !ip || LOCAL_IPS.has(ip) ? "localhost" : ip;
}

// ── Rate limiter ──────────────────────────────────────────────────────────────

export function checkRateLimit(
  request: NextRequest,
  type: RequestType
): { ok: true } | { ok: false; retryAfterMs: number } {
  // Skip rate limiting entirely in development to avoid false 429s from
  // hot-reload stale state and missing IP headers on localhost.
  if (process.env.NODE_ENV === "development") {
    return { ok: true };
  }

  const key = getClientKey(request);
  console.log("[ratelimit] key:", key, "type:", type, "store size:", store.size);
  const now = Date.now();
  const longestStart = now - MAX_LONGEST_WINDOW_MS;
  
  const raw = store.get(key);
  console.log("[ratelimit] bucket:", raw);
  const bucket: TimestampBucket = {
    text: Array.isArray(raw?.text) ? raw.text.filter((t) => t > longestStart) : [],
    image: Array.isArray(raw?.image) ? raw.image.filter((t) => t > longestStart) : [],
  };

  // Check every window — reject if any limit hit
  for (const { ms, maxText, maxImage } of WINDOWS) {
    const windowStart = now - ms;
    const limit = type === "image" ? maxImage : maxText;
    const arr = (type === "image" ? bucket.image : bucket.text).filter(
      (t) => t > windowStart
    );

    if (arr.length >= limit) {
      const oldest = arr[0]!;
      const retryAfterMs = Math.max(0, oldest + ms - now);
      return { ok: false, retryAfterMs };
    }
  }

  // All windows OK — record request
  bucket[type].push(now);
  store.set(key, bucket);

  // Periodic cleanup when store grows large
  if (store.size > 50_000) {
    const cutoff = now - MAX_LONGEST_WINDOW_MS;
    for (const [k, b] of store) {
      const textClean = Array.isArray(b?.text) ? b.text.filter((t) => t > cutoff) : [];
      const imageClean = Array.isArray(b?.image) ? b.image.filter((t) => t > cutoff) : [];
      if (textClean.length === 0 && imageClean.length === 0) {
        store.delete(k);
      } else {
        store.set(k, { text: textClean, image: imageClean });
      }
    }
  }

  return { ok: true };
}

// ── Misc utils ────────────────────────────────────────────────────────────────

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
  const err = (body as { error?: { message?: string; status?: string } }).error;
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
    return { status: 401, clientMessage: "Invalid or missing Gemini API key." };
  }
  if (
    status === 429 ||
    /resource_exhausted|rate limit|quota|too many requests/i.test(m)
  ) {
    // Include the raw reason so callers can distinguish RPM limits (temporary,
    // retry in seconds) from billing/quota issues (need to upgrade plan).
    const detail = message.trim() ? ` — ${message.slice(0, 200)}` : "";
    return {
      status: 429,
      clientMessage: `Gemini quota exceeded. Try again in a moment.${detail}`,
    };
  }
  return { status: 502, clientMessage: message };
}