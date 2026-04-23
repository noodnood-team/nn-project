const TRAILING_SLASHES = /\/+$/;

/**
 * `NEXT_PUBLIC_API_URL` must be a non-empty string for predict requests.
 * Trailing slashes are stripped for stable URL building.
 */
export function getApiBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw == null) return null;
  const t = String(raw).trim();
  if (t === "") return null;
  return t.replace(TRAILING_SLASHES, "");
}
