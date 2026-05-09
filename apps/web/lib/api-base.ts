/** API origin for server-side fetches (must match `lib/api.ts` client default). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
  return raw.replace(/\/$/, "");
}
