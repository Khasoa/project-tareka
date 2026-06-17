import { isAxiosError } from "axios";

export function isApiUnreachable(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (!error.response) return true;
  return error.message === "Network Error";
}

export function logApiFallback(context: string): void {
  if (process.env.NODE_ENV === "production") {
    console.warn(`[tareka] API unavailable for ${context}; serving curated fallback data.`);
  }
}

/**
 * Fetch from API with curated fallback when the service is down or returns empty in dev/staging.
 * In production, HTTP error responses (4xx/5xx) still propagate — only network failures use fallback.
 */
export async function withApiFallback<T>(
  context: string,
  fetcher: () => Promise<T>,
  fallback: () => T,
  isEmpty?: (value: T) => boolean,
): Promise<T> {
  try {
    const result = await fetcher();
    if (isEmpty?.(result)) {
      logApiFallback(context);
      return fallback();
    }
    return result;
  } catch (error) {
    const useFallback =
      process.env.NODE_ENV !== "production" || isApiUnreachable(error);
    if (useFallback) {
      logApiFallback(context);
      return fallback();
    }
    throw error;
  }
}
