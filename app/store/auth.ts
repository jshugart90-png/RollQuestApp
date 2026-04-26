import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppRole = "student" | "coach" | "owner";

type AuthState = {
  userId: string;
  role: AppRole;
  setRole: (role: AppRole) => void;
};

function createUserId(): string {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: createUserId(),
      role: "student",
      setRole: (role) => set({ role }),
    }),
    {
      name: "rollquest.auth.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ userId: state.userId, role: state.role }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<AuthState>;
        return {
          ...current,
          userId: typeof p.userId === "string" && p.userId.trim() ? p.userId.trim() : current.userId,
          role: p.role === "coach" || p.role === "owner" || p.role === "student" ? p.role : "student",
        };
      },
    }
  )
);

export function canManageGym(role: AppRole): boolean {
  return role === "coach" || role === "owner";
}
