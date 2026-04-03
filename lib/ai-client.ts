export type AiTextResult = { success: boolean; data: string; error?: string };

export type AiImageResult = {
  success: boolean;
  data: string;
  error?: string;
};

export type AiCodeResult = {
  success: boolean;
  data: string;
  language: string;
  error?: string;
};

/** Parses SSE from POST /api/ai/text — chunks then final { success, data } */
export async function streamTextAi(
  prompt: string,
  maxTokens?: number,
  onChunk?: (chunk: string) => void
): Promise<AiTextResult> {
  const res = await fetch("/api/ai/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });

  if (!res.ok) {
    let err = res.statusText;
    try {
      const j = (await res.json()) as AiTextResult;
      err = j.error ?? err;
    } catch {
      /* ignore */
    }
    return { success: false, data: "", error: err };
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/event-stream") || !res.body) {
    try {
      const j = (await res.json()) as AiTextResult;
      return j;
    } catch {
      return { success: false, data: "", error: "Unexpected response from text API." };
    }
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: AiTextResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr) continue;
      try {
        const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
        if (typeof parsed.chunk === "string") {
          onChunk?.(parsed.chunk);
        }
        if (parsed.success === true && typeof parsed.data === "string") {
          finalResult = {
            success: true,
            data: parsed.data,
          };
        }
        if (parsed.success === false && typeof parsed.error === "string") {
          finalResult = {
            success: false,
            data: "",
            error: parsed.error,
          };
        }
      } catch {
        /* incomplete json */
      }
    }
  }

  if (finalResult) return finalResult;
  return { success: false, data: "", error: "Empty stream from text API." };
}

export async function callImageAi(
  prompt: string,
  size?: string
): Promise<AiImageResult> {
  const res = await fetch("/api/ai/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, size }),
  });
  const j = (await res.json()) as AiImageResult;
  if (!res.ok) {
    return {
      success: false,
      data: "",
      error: j.error ?? res.statusText,
    };
  }
  return j;
}

export async function callCodeAi(
  prompt: string,
  language?: string
): Promise<AiCodeResult> {
  const res = await fetch("/api/ai/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, language }),
  });
  const j = (await res.json()) as AiCodeResult;
  if (!res.ok) {
    return {
      success: false,
      data: "",
      language: language ?? "",
      error: j.error ?? res.statusText,
    };
  }
  return j;
}
