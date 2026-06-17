"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";

/** Loads `/auth/me` once so marketing/public routes reflect cookie sessions after navigation from login. */
export function AuthHydration() {
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

  useEffect(() => {
    fetchCurrentUser().catch(() => {});
  }, [fetchCurrentUser]);

  return null;
}
