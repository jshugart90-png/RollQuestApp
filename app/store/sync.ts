import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createDefaultSyncClient } from "../services/sync/client";
import { loadProgress } from "./progress";
import { useSessionStore } from "./session";

export type PendingSyncEvent = {
  id: string;
  gymId: string;
  type: string;
  payload: unknown;
  createdAt: string;
  retries: number;
};

type SyncState = {
  pending: PendingSyncEvent[];
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  isSyncing: boolean;
  queueEvent: (event: Omit<PendingSyncEvent, "id" | "createdAt" | "retries">) => void;
  flush: () => Promise<void>;
  clear: () => void;
};

function makeId(): string {
  return `sync-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      pending: [],
      lastSyncedAt: null,
      lastSyncError: null,
      isSyncing: false,
      queueEvent: (event) =>
        set((state) => ({
          pending: [
            ...state.pending,
            {
              id: makeId(),
              gymId: event.gymId,
              type: event.type,
              payload: event.payload,
              createdAt: new Date().toISOString(),
              retries: 0,
            },
          ],
        })),
      flush: async () => {
        const state = get();
        if (state.isSyncing || state.pending.length === 0) return;
        const client = createDefaultSyncClient();
        if (!client) {
          set({ lastSyncError: "No sync backend URL configured." });
          return;
        }
        set({ isSyncing: true, lastSyncError: null });
        try {
          const progress = await loadProgress();
          const profileId = progress.profileName || "Student";
          const nextPending: PendingSyncEvent[] = [];
          for (const event of get().pending) {
            const userId = useSessionStore.getState().userId ?? undefined;
            const result = await client.pushEvent(`/events/${event.type}`, {
              gymId: event.gymId,
              profileId,
              userId,
              ts: new Date().toISOString(),
              data: event.payload,
            });
            if (!result.ok) {
              nextPending.push({ ...event, retries: event.retries + 1 });
            }
          }
          set({
            pending: nextPending,
            lastSyncedAt: new Date().toISOString(),
            lastSyncError: nextPending.length > 0 ? "Some events are still queued." : null,
            isSyncing: false,
          });
        } catch {
          set({ isSyncing: false, lastSyncError: "Sync flush failed unexpectedly." });
        }
      },
      clear: () => set({ pending: [], lastSyncError: null }),
    }),
    {
      name: "rollquest.sync.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pending: state.pending,
        lastSyncedAt: state.lastSyncedAt,
        lastSyncError: state.lastSyncError,
      }),
    }
  )
);
