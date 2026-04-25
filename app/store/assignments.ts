import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useGymStore } from "./gym";

export type Assignment = {
  id: string;
  /** Owning gym id for future multi-gym assignment boards. */
  gymId?: string;
  title: string;
  description: string;
  dueDate?: string;
  linkedTechniqueIds?: string[];
  /** Empty/undefined means assigned to entire roster. */
  targetStudents?: string[];
  completedBy?: string[];
};

export type GymAnnouncement = {
  id: string;
  message: string;
  createdAt: string;
};

export type RosterStudent = {
  name: string;
  belt: "white" | "blue" | "purple" | "brown" | "black";
};

const DEFAULT_ROSTER: RosterStudent[] = [
  { name: "Student", belt: "white" },
  { name: "Alex", belt: "blue" },
  { name: "Jordan", belt: "purple" },
  { name: "Sam", belt: "brown" },
  { name: "Casey", belt: "white" },
];

type AssignmentsState = {
  /** Board scope; mirrors owning gym for multi-gym readiness. */
  rosterGymId: string;
  roster: RosterStudent[];
  assignments: Assignment[];
  announcements: GymAnnouncement[];
  setRoster: (roster: RosterStudent[]) => void;
  createAssignment: (payload: Omit<Assignment, "id" | "completedBy">) => Assignment;
  updateAssignment: (id: string, patch: Omit<Assignment, "id" | "completedBy">) => void;
  reorderAssignments: (orderedIds: string[]) => void;
  removeAssignment: (id: string) => void;
  toggleAssignmentCompletion: (assignmentId: string, profileName: string) => void;
  addAnnouncement: (message: string) => GymAnnouncement | null;
  removeAnnouncement: (id: string) => void;
  resetAssignments: () => void;
  setRosterGymId: (gymId: string) => void;
};

function createId(): string {
  return `asg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAssignmentsStore = create<AssignmentsState>()(
  persist(
    (set) => ({
      rosterGymId: useGymStore.getState().gymId,
      roster: DEFAULT_ROSTER,
      assignments: [],
      announcements: [],
      setRosterGymId: (gymId) =>
        set({
          rosterGymId: gymId.trim().length > 0 ? gymId.trim() : useGymStore.getState().gymId,
        }),
      setRoster: (roster) =>
        set({
          roster: roster
            .map((item) => ({
              name: item.name.trim(),
              belt: item.belt,
            }))
            .filter((item) => item.name.length > 0),
        }),
      createAssignment: (payload) => {
        const gymId = useGymStore.getState().gymId;
        const item: Assignment = {
          id: createId(),
          gymId,
          title: payload.title.trim(),
          description: payload.description.trim(),
          dueDate: payload.dueDate?.trim() || undefined,
          linkedTechniqueIds: payload.linkedTechniqueIds?.length ? [...new Set(payload.linkedTechniqueIds)] : undefined,
          targetStudents: payload.targetStudents?.length ? [...new Set(payload.targetStudents)] : undefined,
          completedBy: [],
        };
        set((state) => ({ assignments: [item, ...state.assignments], rosterGymId: gymId }));
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
                  targetStudents: patch.targetStudents?.length ? [...new Set(patch.targetStudents)] : undefined,
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
      resetAssignments: () =>
        set({
          rosterGymId: useGymStore.getState().gymId,
          roster: DEFAULT_ROSTER,
          assignments: [],
          announcements: [],
        }),
    }),
    {
      name: "rollquest.assignments.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        rosterGymId: state.rosterGymId,
        roster: state.roster,
        assignments: state.assignments,
        announcements: state.announcements,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<AssignmentsState>;
        return {
          ...current,
          rosterGymId:
            typeof p.rosterGymId === "string" && p.rosterGymId.trim()
              ? p.rosterGymId.trim()
              : useGymStore.getState().gymId,
          roster: Array.isArray(p.roster)
            ? p.roster
                .map((item) => {
                  if (typeof item === "string") {
                    return { name: item, belt: "white" as const };
                  }
                  if (!item || typeof item !== "object") return null;
                  const maybe = item as Partial<RosterStudent>;
                  if (typeof maybe.name !== "string") return null;
                  const belt =
                    maybe.belt === "white" ||
                    maybe.belt === "blue" ||
                    maybe.belt === "purple" ||
                    maybe.belt === "brown" ||
                    maybe.belt === "black"
                      ? maybe.belt
                      : "white";
                  return { name: maybe.name, belt };
                })
                .filter((item): item is RosterStudent => Boolean(item))
            : DEFAULT_ROSTER,
          assignments: Array.isArray(p.assignments)
            ? p.assignments
                .filter((item): item is Assignment => Boolean(item && typeof item.id === "string" && typeof item.title === "string"))
                .map((item) => ({
                  ...item,
                  gymId: typeof item.gymId === "string" && item.gymId.trim() ? item.gymId : undefined,
                  completedBy: Array.isArray(item.completedBy)
                    ? item.completedBy.filter((name): name is string => typeof name === "string")
                    : [],
                  linkedTechniqueIds: Array.isArray(item.linkedTechniqueIds)
                    ? item.linkedTechniqueIds.filter((id): id is string => typeof id === "string")
                    : [],
                  targetStudents: Array.isArray(item.targetStudents)
                    ? item.targetStudents.filter((name): name is string => typeof name === "string")
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
