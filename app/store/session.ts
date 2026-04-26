import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getSupabaseClient, isSupabaseConfigured } from "../services/supabase/client";

type SessionState = {
  email: string | null;
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  signOut: () => Promise<void>;
  hydrateSupabaseSession: () => Promise<void>;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      email: null,
      accessToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
      signInWithPassword: async (email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !password.trim()) {
          return { ok: false, message: "Email and password are required." };
        }
        set({ isLoading: true, authError: null });
        try {
          const client = getSupabaseClient();
          if (!client || !isSupabaseConfigured()) {
            const fallbackToken = `local-${Date.now().toString(36)}`;
            set({
              email: trimmedEmail,
              accessToken: fallbackToken,
              userId: `local-${trimmedEmail}`,
              isAuthenticated: true,
              isLoading: false,
              authError: null,
            });
            return { ok: true };
          }
          const result = await client.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          if (result.error || !result.data.session || !result.data.user) {
            const message = result.error?.message ?? "Unable to sign in.";
            set({ isLoading: false, isAuthenticated: false, authError: message });
            return { ok: false, message };
          }
          set({
            email: trimmedEmail,
            accessToken: result.data.session.access_token,
            userId: result.data.user.id,
            isAuthenticated: true,
            isLoading: false,
            authError: null,
          });
          return { ok: true };
        } catch {
          const message = "Sign-in failed unexpectedly.";
          set({ isLoading: false, isAuthenticated: false, authError: message });
          return { ok: false, message };
        }
      },
      signOut: async () => {
        const client = getSupabaseClient();
        if (client && isSupabaseConfigured()) {
          await client.auth.signOut();
        }
        set({
          email: null,
          accessToken: null,
          userId: null,
          isAuthenticated: false,
          authError: null,
          isLoading: false,
        });
      },
      hydrateSupabaseSession: async () => {
        const client = getSupabaseClient();
        if (!client || !isSupabaseConfigured()) return;
        const current = get();
        if (current.isAuthenticated && current.accessToken) return;
        set({ isLoading: true, authError: null });
        const sessionResponse = await client.auth.getSession();
        const session = sessionResponse.data.session;
        if (!session || !session.user) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
        set({
          email: session.user.email ?? null,
          accessToken: session.access_token,
          userId: session.user.id,
          isAuthenticated: true,
          isLoading: false,
          authError: null,
        });
      },
    }),
    {
      name: "rollquest.session.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        email: state.email,
        accessToken: state.accessToken,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
