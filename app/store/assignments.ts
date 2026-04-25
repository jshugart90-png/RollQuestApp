import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  linkedTechniqueIds?: string[];
  completedBy?: string[];
};

export type GymAnnouncement = {
  id: string;
  message: string;
  createdAt: string;
};

const DEFAULT_ROSTER = ["Student", "Alex", "Jordan", "Sam", "Casey"];

type AssignmentsState = {
  roster: string[];
  assignments: Assignment[];
  announcements: GymAnnouncement[];
  setRoster: (roster: string[]) => void;
  createAssignment: (payload: Omit<Assignment, "id" | "completedBy">) => Assignment;
  updateAssignment: (id: string, patch: Omit<Assignment, "id" | "completedBy">) => void;
  reorderAssignments: (orderedIds: string[]) => void;
  removeAssignment: (id: string) => void;
  toggleAssignmentCompletion: (assignmentId: string, profileName: string) => void;
  addAnnouncement: (message: string) => GymAnnouncement | null;
  removeAnnouncement: (id: string) => void;
  resetAssignments: () => void;
};

function createId(): string {
  return `asg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAssignmentsStore = create<AssignmentsState>()(
  persist(
    (set) => ({
      roster: DEFAULT_ROSTER,
      assignments: [],
      announcements: [],
      setRoster: (roster) =>
        set({
          roster: roster.map((name) => name.trim()).filter((name) => name.length > 0),
        }),
      createAssignment: (payload) => {
        const item: Assignment = {
          id: createId(),
          title: payload.title.trim(),
          description: payload.description.trim(),
          dueDate: payload.dueDate?.trim() || undefined,
          linkedTechniqueIds: payload.linkedTechniqueIds?.length ? [...new Set(payload.linkedTechniqueIds)] : undefined,
          completedBy: [],
        };
        set((state) => ({ assignments: [item, ...state.assignments] }));
        return item;
      },
      updateAssignment: (id, patch) =>
        set((state) => ({
          assignments: state.assignments.map((item) =>
            item.id !== id
              ? item
              : {
                  ...item,
                  title: patch.title.trim(),
                  description: patch.description.trim(),
                  dueDate: patch.dueDate?.trim() || undefined,
                  linkedTechniqueIds: patch.linkedTechniqueIds?.length ? [...new Set(patch.linkedTechniqueIds)] : [],
                }
          ),
        })),
      reorderAssignments: (orderedIds) =>
        set((state) => {
          const byId = new Map(state.assignments.map((a) => [a.id, a]));
          const reordered = orderedIds.map((id) => byId.get(id)).filter(Boolean) as Assignment[];
          const missing = state.assignments.filter((a) => !orderedIds.includes(a.id));
          return { assignments: [...reordered, ...missing] };
        }),
      removeAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((assignment) => assignment.id !== id),
        })),
      toggleAssignmentCompletion: (assignmentId, profileName) =>
        set((state) => ({
          assignments: state.assignments.map((assignment) => {
            if (assignment.id !== assignmentId) return assignment;
            const safeName = profileName.trim() || "Student";
            const current = assignment.completedBy ?? [];
            const completedBy = current.includes(safeName)
              ? current.filter((name) => name !== safeName)
              : [...current, safeName];
            return { ...assignment, completedBy };
          }),
        })),
      addAnnouncement: (message) => {
        const trimmed = message.trim();
        if (!trimmed) return null;
        const item: GymAnnouncement = {
          id: `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          message: trimmed,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ announcements: [item, ...state.announcements] }));
        return item;
      },
      removeAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((item) => item.id !== id),
        })),
      resetAssignments: () => set({ roster: DEFAULT_ROSTER, assignments: [], announcements: [] }),
    }),
    {
      name: "rollquest.assignments.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        roster: state.roster,
        assignments: state.assignments,
        announcements: state.announcements,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<AssignmentsState>;
        return {
          ...current,
          roster: Array.isArray(p.roster) ? p.roster.filter((name): name is string => typeof name === "string") : DEFAULT_ROSTER,
          assignments: Array.isArray(p.assignments)
            ? p.assignments
                .filter((item): item is Assignment => Boolean(item && typeof item.id === "string" && typeof item.title === "string"))
                .map((item) => ({
                  ...item,
                  completedBy: Array.isArray(item.completedBy)
                    ? item.completedBy.filter((name): name is string => typeof name === "string")
                    : [],
                  linkedTechniqueIds: Array.isArray(item.linkedTechniqueIds)
                    ? item.linkedTechniqueIds.filter((id): id is string => typeof id === "string")
                    : [],
                }))
            : [],
          announcements: Array.isArray(p.announcements)
            ? p.announcements
                .filter(
                  (item): item is GymAnnouncement =>
                    Boolean(
                      item &&
                        typeof item.id === "string" &&
                        typeof item.message === "string" &&
                        typeof item.createdAt === "string"
                    )
                )
                .map((item) => ({
                  id: item.id,
                  message: item.message.trim(),
                  createdAt: item.createdAt,
                }))
            : [],
        };
      },
    }
  )
);
