import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TechniqueRequestStatus = "pending" | "dismissed" | "addressed";

export type TechniqueRequest = {
  id: string;
  /** Gym the request is addressed to (owner dashboard filters on this). */
  gymId: string;
  techniqueId: string;
  techniqueName: string;
  studentName: string;
  note?: string;
  createdAt: string;
  status: TechniqueRequestStatus;
};

type TechniqueRequestsState = {
  requests: TechniqueRequest[];
  submitRequest: (payload: {
    gymId: string;
    techniqueId: string;
    techniqueName: string;
    studentName: string;
    note?: string;
  }) => TechniqueRequest | null;
  dismissRequest: (id: string) => void;
  markAddressed: (id: string) => void;
  removeRequest: (id: string) => void;
};

function createId(): string {
  return `tr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useTechniqueRequestStore = create<TechniqueRequestsState>()(
  persist(
    (set, get) => ({
      requests: [],
      submitRequest: (payload) => {
        const gymId = payload.gymId.trim();
        const studentName = payload.studentName.trim();
        const techniqueName = payload.techniqueName.trim();
        if (!gymId || !studentName || !payload.techniqueId.trim() || !techniqueName) return null;
        const existing = get().requests.find(
          (r) =>
            r.status === "pending" &&
            r.gymId === gymId &&
            r.techniqueId === payload.techniqueId.trim() &&
            r.studentName.toLowerCase() === studentName.toLowerCase()
        );
        if (existing) return null;
        const item: TechniqueRequest = {
          id: createId(),
          gymId,
          techniqueId: payload.techniqueId.trim(),
          techniqueName,
          studentName,
          note: payload.note?.trim() || undefined,
          createdAt: new Date().toISOString(),
          status: "pending",
        };
        set((s) => ({ requests: [item, ...s.requests] }));
        return item;
      },
      dismissRequest: (id) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, status: "dismissed" as const } : r)),
        })),
      markAddressed: (id) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, status: "addressed" as const } : r)),
        })),
      removeRequest: (id) => set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
    }),
    {
      name: "rollquest.techniqueRequests.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ requests: state.requests }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<TechniqueRequestsState>;
        return {
          ...current,
          requests: Array.isArray(p.requests)
            ? p.requests
                .filter(
                  (r): r is TechniqueRequest =>
                    Boolean(
                      r &&
                        typeof (r as TechniqueRequest).id === "string" &&
                        typeof (r as TechniqueRequest).gymId === "string" &&
                        typeof (r as TechniqueRequest).techniqueId === "string" &&
                        typeof (r as TechniqueRequest).techniqueName === "string" &&
                        typeof (r as TechniqueRequest).studentName === "string" &&
                        typeof (r as TechniqueRequest).createdAt === "string"
                    )
                )
                .map((r) => ({
                  ...r,
                  status:
                    r.status === "dismissed" || r.status === "addressed" ? r.status : ("pending" as const),
                }))
            : [],
        };
      },
    }
  )
);

export function pendingRequestsForGym(gymId: string, requests: TechniqueRequest[]): TechniqueRequest[] {
  return requests.filter((r) => r.gymId === gymId && r.status === "pending");
}
