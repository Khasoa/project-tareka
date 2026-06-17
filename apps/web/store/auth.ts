"use client";

import { create } from "zustand";

import { authService, type LoginPayload } from "@/services/auth.service";
import type { User } from "@/types";

/** Skip redundant /auth/me when layout + settings mount together. */
const SESSION_FETCH_COOLDOWN_MS = 8000;
let lastSessionFetchedAt = 0;
let sessionFetchInFlight: Promise<void> | null = null;

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  login: async (payload) => {
    set({ loading: true });
    try {
      const user = await authService.login(payload);
      lastSessionFetchedAt = Date.now();
      set({ user });
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      lastSessionFetchedAt = 0;
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  fetchCurrentUser: async () => {
    if (sessionFetchInFlight) {
      await sessionFetchInFlight;
      return;
    }

    const now = Date.now();
    const { user } = get();
    if (user != null && now - lastSessionFetchedAt < SESSION_FETCH_COOLDOWN_MS) {
      return;
    }

    sessionFetchInFlight = (async () => {
      set({ loading: true });
      try {
        const nextUser = await authService.currentUser();
        lastSessionFetchedAt = Date.now();
        set({ user: nextUser });
      } catch {
        lastSessionFetchedAt = 0;
        set({ user: null });
      } finally {
        set({ loading: false });
      }
    })();

    try {
      await sessionFetchInFlight;
    } finally {
      sessionFetchInFlight = null;
    }
  },
}));
