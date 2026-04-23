/**
 * Read body as text and parse JSON. Returns `null` for empty or invalid JSON
 * (e.g. HTML error pages) instead of throwing.
 */
export async function parseResponseJson(response: Response): Promise<unknown | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
