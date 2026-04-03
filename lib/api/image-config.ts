const ASPECT_RATIOS = [
  "1:1",
  "1:4",
  "1:8",
  "2:3",
  "3:2",
  "3:4",
  "4:1",
  "4:3",
  "4:5",
  "5:4",
  "8:1",
  "9:16",
  "16:9",
  "21:9",
] as const;

function parseRatio(r: string): number {
  const [a, b] = r.split(":").map(Number);
  if (!a || !b) return 1;
  return a / b;
}

function closestAspectRatio(w: number, h: number): string {
  const target = w / h;
  let best: (typeof ASPECT_RATIOS)[number] = ASPECT_RATIOS[0]!;
  let bestDiff = Math.abs(parseRatio(best) - target);
  for (const ar of ASPECT_RATIOS) {
    const d = Math.abs(parseRatio(ar) - target);
    if (d < bestDiff) {
      best = ar;
      bestDiff = d;
    }
  }
  return best;
}

function imageSizeFromMaxSide(max: number): "512" | "1K" | "2K" | "4K" {
  if (max <= 512) return "512";
  if (max <= 1024) return "1K";
  if (max <= 2048) return "2K";
  return "4K";
}

export type ImageGenConfig = {
  aspectRatio: string;
  imageSize: "512" | "1K" | "2K" | "4K";
};

/**
 * Map optional `size` (e.g. "1024x1024", "16:9", "2K") to Gemini image config.
 */
export function parseImageSize(size?: string): ImageGenConfig {
  if (!size?.trim()) {
    return { aspectRatio: "1:1", imageSize: "1K" };
  }

  const s = size.trim();
  const upper = s.toUpperCase();

  if (upper === "512" || upper === "1K" || upper === "2K" || upper === "4K") {
    const size =
      upper === "512"
        ? "512"
        : upper === "1K"
          ? "1K"
          : upper === "2K"
            ? "2K"
            : "4K";
    return { aspectRatio: "1:1", imageSize: size };
  }

  const wxh = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(s);
  if (wxh) {
    const w = Number(wxh[1]);
    const h = Number(wxh[2]);
    return {
      aspectRatio: closestAspectRatio(w, h),
      imageSize: imageSizeFromMaxSide(Math.max(w, h)),
    };
  }

  if (/^\d+:\d+$/.test(s) && (ASPECT_RATIOS as readonly string[]).includes(s)) {
    return { aspectRatio: s, imageSize: "1K" };
  }

  if (/^\d+:\d+$/.test(s)) {
    const [a, b] = s.split(":").map(Number);
    if (a && b) {
      return {
        aspectRatio: closestAspectRatio(a, b),
        imageSize: "1K",
      };
    }
  }

  return { aspectRatio: "1:1", imageSize: "1K" };
}
