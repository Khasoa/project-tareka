import { isAxiosError } from "axios";

/** True when axios failed before receiving an HTTP response (API down, CORS, timeout). */
export function isApiUnreachable(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (!error.response) return true;
  return error.message === "Network Error";
}

export function friendlyApiMessage(error: unknown, fallback: string): string {
  if (isApiUnreachable(error)) return fallback;
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string })?.detail;
    if (detail) return String(detail);
    return error.message || fallback;
  }
  return fallback;
}
