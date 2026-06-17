import axios from "axios";

// Using "localhost" (not "127.0.0.1") so that cookies set by the API are
// same-site with the Next.js dev server.  Both run on localhost, so
// SameSite=Lax cookies are sent on subsequent XHR requests (e.g. /auth/me).
// If 127.0.0.1 is used, the browser treats it as a different site and
// silently drops the cookie, causing /auth/me to return 401 after login.
const defaultBase =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: defaultBase,
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => config);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
