'use client';

// Lazy load Excalidraw to prevent server-side evaluation
let convertToExcalidrawElements: any = null;

async function ensureExcalidraw() {
  if (!convertToExcalidrawElements) {
    const { convertToExcalidrawElements: converter } = await import('@excalidraw/excalidraw');
    convertToExcalidrawElements = converter;
  }
  return convertToExcalidrawElements;
}

// Use any for ExcalidrawImperativeAPI type since it's not exported
type ExcalidrawImperativeAPI = any;

// Simplified types for Excalidraw elements
type DataURL = string & { readonly __brand: "DataURL" };
type FileId = string;
type OrderedExcalidrawElement = any;
type BinaryFileData = any;

// Constants - simplified values
const FONT_FAMILY = 1; // Virgil
const CaptureUpdateAction = { IMMEDIATELY: 1 };
const IMAGE_MIME_TYPES = { png: "image/png", jpg: "image/jpeg" } as const;
const ROUNDNESS = { round: "round" } as const;

/**
 * Helpers to insert AI-generated content into an Excalidraw scene via the imperative API.
 *
 * @module canvasManager
 */

/** Max width for pasted AI images (scene units). */
const MAX_IMAGE_WIDTH = 720;

/** Code block padding and default dimensions (scene units). */
const CODE_PAD = 16;
const CODE_DEFAULT_W = 480;
const CODE_MIN_H = 120;

/**
 * Resolves a scene position: explicit coordinates or viewport center.
 */
function resolvePosition(
  api: ExcalidrawImperativeAPI,
  x?: number,
  y?: number
): { x: number; y: number } {
  if (typeof x === "number" && typeof y === "number" && !Number.isNaN(x) && !Number.isNaN(y)) {
    return { x, y };
  }
  return getCanvasCenter(api);
}

/**
 * Merges new elements into the scene and optionally records undo.
 */
function mergeIntoScene(
  api: ExcalidrawImperativeAPI,
  newElements: readonly OrderedExcalidrawElement[]
): void {
  const existing = api.getSceneElements();
  api.updateScene({
    elements: [...existing, ...newElements],
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
}

/**
 * Returns the center of the currently visible canvas area in scene coordinates.
 *
 * @param api - Excalidraw imperative API from `excalidrawAPI` ref
 * @returns Center `{ x, y }` of the visible viewport in scene space
 */
export function getCanvasCenter(api: ExcalidrawImperativeAPI): { x: number; y: number } {
  try {
    const appState = api.getAppState();
    // Estimate viewport center based on app state
    const { scrollX = 0, scrollY = 0, viewBackgroundColor } = appState;
    // Use document viewport dimensions as proxy (simplified approach)
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      x: -scrollX + width / 2,
      y: -scrollY + height / 2,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

/**
 * Helper to convert data URL to string for image storage
 */
function dataURLToString(url: string): DataURL {
  return url as DataURL;
}

/**
 * Selects a single element by id (clears other selection).
 *
 * @param api - Excalidraw imperative API
 * @param elementId - Element `id` to select
 */
export function selectElement(api: ExcalidrawImperativeAPI, elementId: string): void {
  try {
    api.updateScene({
      appState: {
        selectedElementIds: { [elementId]: true },
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  } catch (e) {
    console.error("[canvasManager] selectElement failed:", e);
  }
}

/**
 * Loads image bytes from a URL or data URL and returns a data URL for Excalidraw.
 */
async function loadImageAsDataURL(url: string): Promise<{
  dataURL: string;
  mimeType: string;
}> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }
    const blob = await res.blob();
    const mimeType = blob.type || "image/png";
    const dataURL = URL.createObjectURL(blob);
    return { dataURL, mimeType };
  } catch (e) {
    throw e instanceof Error ? e : new Error(`Failed to load image: ${String(e)}`);
  }
}

/**
 * Reads intrinsic image size from a data URL for layout.
 */
function measureImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () =>
      resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => reject(new Error("Could not decode image for dimensions."));
    img.src = dataUrl;
  });
}

/**
 * Adds a text element to the canvas.
 *
 * @param api - Excalidraw imperative API
 * @param text - Text content
 * @param x - Optional scene X (defaults to viewport center)
 * @param y - Optional scene Y (defaults to viewport center)
 * @returns New text element id
 * @throws If element creation or scene update fails
 */
export async function addAITextToCanvas(
  api: ExcalidrawImperativeAPI,
  text: string,
  x?: number,
  y?: number
): Promise<string> {
  try {
    const converter = await ensureExcalidraw();
    const pos = resolvePosition(api, x, y);
    const [textEl] = converter(
      [
        {
          type: "text",
          x: pos.x,
          y: pos.y,
          text,
          fontSize: 20,
          fontFamily: FONT_FAMILY,
          width: Math.min(640, Math.max(120, Math.ceil(text.length * 0.5))),
        } as any,
      ],
      { regenerateIds: true }
    );
    mergeIntoScene(api, [textEl]);
    return textEl.id || "text-element";
  } catch (e) {
    console.error("[canvasManager] addAITextToCanvas failed:", e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * Adds an image element to the canvas via data URL.
 *
 * @param api - Excalidraw imperative API
 * @param imageUrl - HTTP(S) URL or `data:image/...;base64,...` data URL
 * @param x - Optional scene X (defaults to viewport center)
 * @param y - Optional scene Y (defaults to viewport center)
 * @returns New image element id
 * @throws On network/CORS failure or decode errors
 */
export async function addAIImageToCanvas(
  api: ExcalidrawImperativeAPI,
  imageUrl: string,
  x?: number,
  y?: number
): Promise<string> {
  try {
    const converter = await ensureExcalidraw();
    const { dataURL, mimeType } = await loadImageAsDataURL(imageUrl);
    
    const { width: iw, height: ih } = await measureImageSize(dataURL);
    let w = iw;
    let h = ih;
    if (w > MAX_IMAGE_WIDTH) {
      const scale = MAX_IMAGE_WIDTH / w;
      w = MAX_IMAGE_WIDTH;
      h = Math.max(1, Math.round(ih * scale));
    }

    const pos = resolvePosition(api, x, y);
    const offsetX = -w / 2;
    const offsetY = -h / 2;

    // Generate a unique file ID
    const fileId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add file to Excalidraw
    try {
      api.addFiles?.(
        [
          {
            id: fileId,
            dataURL: dataURLToString(dataURL),
            mimeType,
            created: Date.now(),
          },
        ] as any
      );
    } catch (e) {
      console.warn("[canvasManager] Failed to register file, continuing with element:", e);
    }

    const [imageEl] = converter(
      [
        {
          type: "image",
          x: pos.x + offsetX,
          y: pos.y + offsetY,
          width: w,
          height: h,
          fileId,
        } as any,
      ],
      { regenerateIds: true }
    );

    mergeIntoScene(api, [imageEl]);
    return imageEl.id || "image-element";
  } catch (e) {
    console.error("[canvasManager] addAIImageToCanvas failed:", e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/** Map common language names to a label tint (syntax-highlighting simulation). */
function languageToTint(language: string): string {
  const key = language.trim().toLowerCase();
  const map: Record<string, string> = {
    typescript: "#1e3a5f",
    javascript: "#3d2f1e",
    python: "#1e3f2f",
    rust: "#3d1e1e",
    go: "#1e3d3d",
    java: "#2f1e3d",
    css: "#2f2f1e",
    html: "#1e2f3d",
    json: "#2d2d2d",
  };
  return map[key] ?? "#1e1e1e";
}

/**
 * Adds a dark rectangle and monospace code text (simulated “code block” styling).
 *
 * @param api - Excalidraw imperative API
 * @param code - Source code string
 * @param language - Language label (used for header tint)
 * @param x - Optional scene X (defaults to viewport center)
 * @param y - Optional scene Y (defaults to viewport center)
 * @returns Id of the **text** element containing the code (primary editable part)
 * @throws If element creation or scene update fails
 */
export async function addAICodeToCanvas(
  api: ExcalidrawImperativeAPI,
  code: string,
  language: string,
  x?: number,
  y?: number
): Promise<string> {
  try {
    const converter = await ensureExcalidraw();
    const pos = resolvePosition(api, x, y);
    const lines = code.split("\n");
    const fontSize = 14;
    const lineHeight = fontSize * 1.35;
    const innerW = CODE_DEFAULT_W - CODE_PAD * 2;
    const textHeight = Math.max(CODE_MIN_H - CODE_PAD * 2, lines.length * lineHeight + 28);
    const boxW = CODE_DEFAULT_W;
    const boxH = textHeight + CODE_PAD * 2 + 28;
    const bgTint = languageToTint(language);

    const boxX = pos.x - boxW / 2;
    const boxY = pos.y - boxH / 2;

    const [rectEl, textEl] = converter(
      [
        {
          type: "rectangle",
          x: boxX,
          y: boxY,
          width: boxW,
          height: boxH,
          strokeColor: "#3f3f3f",
          backgroundColor: bgTint,
          fillStyle: "solid",
          strokeWidth: 1,
          roughness: 0,
        } as any,
        {
          type: "text",
          x: boxX + CODE_PAD,
          y: boxY + CODE_PAD + 4,
          text: `${language}\n\n${code}`,
          fontSize,
          fontFamily: FONT_FAMILY,
          width: innerW,
          strokeColor: "#d4d4d4",
          textAlign: "left",
        } as any,
      ],
      { regenerateIds: true }
    );

    mergeIntoScene(api, [rectEl, textEl]);
    return textEl.id || "code-element";
  } catch (e) {
    console.error("[canvasManager] addAICodeToCanvas failed:", e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}
