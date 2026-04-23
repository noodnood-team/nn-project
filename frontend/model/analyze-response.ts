export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AnalyzeResponse {
  ok: boolean;
  prediction?: Macros | null;
  message?: string;
  /** If set to `NO_FOOD`, the backend signals no meal without relying on `message` text. */
  code?: string;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function tryMacros(p: object): { success: true; macros: Macros } | { success: false } {
  const o = p as Record<string, unknown>;
  if (
    !isFiniteNumber(o.calories) ||
    !isFiniteNumber(o.protein) ||
    !isFiniteNumber(o.carbs) ||
    !isFiniteNumber(o.fat)
  ) {
    return { success: false };
  }
  return {
    success: true,
    macros: { calories: o.calories, protein: o.protein, carbs: o.carbs, fat: o.fat },
  };
}

function parseOkTrue(
  predRaw: unknown,
  message: string | undefined,
  code: string | undefined
): { success: true; data: AnalyzeResponse } | { success: false } {
  if (predRaw === null || predRaw === undefined) {
    return { success: false };
  }
  if (typeof predRaw !== "object") {
    return { success: false };
  }
  const m = tryMacros(predRaw);
  if (!m.success) {
    return { success: false };
  }
  return { success: true, data: { ok: true, prediction: m.macros, message, code } };
}

function parseOkFalse(
  predRaw: unknown,
  message: string | undefined,
  code: string | undefined
): { success: true; data: AnalyzeResponse } | { success: false } {
  if (predRaw === null || predRaw === undefined) {
    return { success: true, data: { ok: false, prediction: predRaw, message, code } };
  }
  if (typeof predRaw !== "object" || predRaw === null) {
    return { success: false };
  }
  const m = tryMacros(predRaw);
  if (!m.success) {
    return { success: false };
  }
  return { success: true, data: { ok: false, prediction: m.macros, message, code } };
}

/**
 * Runtime validation of `/api/v1/predict` JSON. Rejects wrong shapes so the UI
 * does not show NaN/undefined for macros.
 */
export function parseAnalyzeResponse(
  input: unknown
): { success: true; data: AnalyzeResponse } | { success: false } {
  if (input === null || typeof input !== "object") {
    return { success: false };
  }
  const o = input as Record<string, unknown>;
  if (typeof o.ok !== "boolean") {
    return { success: false };
  }
  if (o.message !== undefined && typeof o.message !== "string") {
    return { success: false };
  }
  if (o.code !== undefined && typeof o.code !== "string") {
    return { success: false };
  }
  const message = o.message as string | undefined;
  const code = o.code as string | undefined;
  return o.ok ? parseOkTrue(o.prediction, message, code) : parseOkFalse(o.prediction, message, code);
}

/** Backend: ok: false, prediction: null when the image is not recognized as a meal. */
export function isNoFoodResponse(data: AnalyzeResponse): boolean {
  if (data.code === "NO_FOOD") {
    return true;
  }
  if (data.ok || data.prediction != null) {
    return false;
  }
  const msg = (data.message ?? "").toLowerCase();
  return (
    msg.includes("could not detect food") ||
    msg.includes("could not detect any food") ||
    msg.includes("doesn't look like a food") ||
    msg.includes("don't look like a food")
  );
}
