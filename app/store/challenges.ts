import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ChallengeCompletion = {
  challengeId: string;
  techniqueId: string;
  techniqueName: string;
  completedAt: string;
};

export type RollingLogEntry = {
  id: string;
  techniqueId: string;
  techniqueName: string;
  className?: string;
  notes?: string;
  loggedAt: string;
};

type ChallengesState = {
  completionsByDate: Record<string, ChallengeCompletion[]>;
  rollingLog: RollingLogEntry[];
  completeChallenge: (dateKey: string, completion: Omit<ChallengeCompletion, "completedAt">) => void;
  addRollingLog: (entry: Omit<RollingLogEntry, "id" | "loggedAt">) => void;
};

function createId(): string {
  return `roll-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set) => ({
      completionsByDate: {},
      rollingLog: [],
      completeChallenge: (dateKey, completion) =>
        set((state) => {
          const current = state.completionsByDate[dateKey] ?? [];
          if (current.some((item) => item.challengeId === completion.challengeId)) return {};
          return {
            completionsByDate: {
              ...state.completionsByDate,
              [dateKey]: [
                ...current,
                {
                  ...completion,
                  completedAt: new Date().toISOString(),
                },
              ],
            },
          };
        }),
      addRollingLog: (entry) =>
        set((state) => ({
          rollingLog: [
            {
              id: createId(),
              techniqueId: entry.techniqueId,
              techniqueName: entry.techniqueName,
              className: entry.className?.trim() || undefined,
              notes: entry.notes?.trim() || undefined,
              loggedAt: new Date().toISOString(),
            },
            ...state.rollingLog,
          ].slice(0, 120),
        })),
    }),
    {
      name: "rollquest.challenges.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        completionsByDate: state.completionsByDate,
        rollingLog: state.rollingLog,
      }),
    }
  )
);
