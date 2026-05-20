/** Shared key for canvas/settings persistence (see app/HomeContent.tsx). */
export const DRAFTSPACE_SETTINGS_KEY = "draftspace-settings";

/** Read optional user Gemini API key for image generation from localStorage. */
export function getPersistedGeminiImageApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(DRAFTSPACE_SETTINGS_KEY);
    if (!raw) return "";
    const s = JSON.parse(raw) as { geminiImageApiKey?: string };
    return typeof s.geminiImageApiKey === "string" ? s.geminiImageApiKey.trim() : "";
  } catch {
    return "";
  }
}
