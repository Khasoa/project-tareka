"use client";

import { create } from "zustand";

import { authService, type LoginPayload } from "@/services/auth.service";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  login: async (payload) => {
    set({ loading: true });
    try {
      const user = await authService.login(payload);
      set({ user });
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const user = await authService.currentUser();
      set({ user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
}));
