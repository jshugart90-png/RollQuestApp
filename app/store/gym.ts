import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GymTechniqueOverrides, Technique } from "../data/techniques";

const DEFAULT_GYM_NAME = "My Gym";
const DEFAULT_ACCENT_COLOR = "#C8102E";

export type GymMode = "gym" | "personal";
export type GymDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const WEEK_DAYS: GymDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type GymScheduleClass = {
  id: string;
  day: GymDay;
  time: string;
  className: string;
  instructor?: string;
  description?: string;
  /** Technique ids covered as class focus. */
  focusTechniqueIds?: string[];
  /** Sort order within the same weekday (lower = earlier in list). */
  displayOrder?: number;
};

export type GymSyncPayload = {
  version: 1;
  gymId: string;
  gymName: string;
  accentColor: string;
  logoUrl?: string;
  schedule: GymScheduleClass[];
  techniqueOverrides: GymTechniqueOverrides;
  videoOverrides: Record<string, string>;
  customTechniques: Technique[];
  updatedAt: string;
};

const DEFAULT_SCHEDULE: GymScheduleClass[] = [
  {
    id: "monday-fundamentals",
    day: "Monday",
    time: "6:00 PM",
    className: "Fundamentals Gi",
    instructor: "Coach Alex",
    description: "Core positional movement, escapes, and white belt essentials.",
    displayOrder: 10,
  },
  {
    id: "tuesday-advanced",
    day: "Tuesday",
    time: "7:00 PM",
    className: "Advanced No-Gi",
    instructor: "Coach Jordan",
    description: "Chain passing, back attacks, and live scenario rounds.",
    displayOrder: 10,
  },
  {
    id: "wednesday-all-levels",
    day: "Wednesday",
    time: "6:30 PM",
    className: "All Levels Open Mat",
    instructor: "Staff",
    description: "Focused drilling + guided rounds.",
    displayOrder: 10,
  },
  {
    id: "thursday-competition",
    day: "Thursday",
    time: "7:30 PM",
    className: "Competition Class",
    instructor: "Coach Sam",
    description: "High pace positional sparring and strategy.",
    displayOrder: 10,
  },
  {
    id: "friday-fundamentals",
    day: "Friday",
    time: "6:00 PM",
    className: "Fundamentals No-Gi",
    instructor: "Coach Alex",
    description: "Repetition-focused class for skill retention.",
    displayOrder: 10,
  },
  {
    id: "saturday-openmat",
    day: "Saturday",
    time: "11:00 AM",
    className: "Weekend Open Mat",
    instructor: "Staff",
    description: "Bring questions, drill, then flow roll.",
    displayOrder: 10,
  },
];

function maxDisplayOrderForDay(schedule: GymScheduleClass[], day: GymDay): number {
  let max = 0;
  for (const c of schedule) {
    if (c.day !== day) continue;
    const o = c.displayOrder ?? 0;
    if (o > max) max = o;
  }
  return max;
}

type GymState = {
  gymId: string;
  gymName: string;
  accentColor: string;
  logoUrl?: string;
  isGymMode: boolean;
  schedule: GymScheduleClass[];
  techniqueOverrides: GymTechniqueOverrides;
  videoOverrides: Record<string, string>;
  customTechniques: Technique[];
  linkedGym?: GymSyncPayload;
  myGymTileOrder: string[];
  setGymId: (gymId: string) => void;
  setGymName: (gymName: string) => void;
  setAccentColor: (accentColor: string) => void;
  setLogoUrl: (logoUrl?: string) => void;
  setIsGymMode: (isGymMode: boolean) => void;
  upsertScheduleClass: (item: GymScheduleClass) => void;
  removeScheduleClass: (id: string) => void;
  reorderScheduleForDay: (day: GymDay, orderedIds: string[]) => void;
  duplicateScheduleClassToDays: (id: string, targetDays: GymDay[]) => void;
  setTechniqueOverride: (techniqueId: string, patch: GymTechniqueOverrides[string]) => void;
  setVideoOverride: (techniqueId: string, url: string) => void;
  clearVideoOverride: (techniqueId: string) => void;
  clearTechniqueOverride: (techniqueId: string) => void;
  clearAllTechniqueOverrides: () => void;
  upsertCustomTechnique: (item: Technique) => void;
  removeCustomTechnique: (id: string) => void;
  buildGymShareCode: () => string;
  joinGymFromShareCode: (shareCode: string) => { ok: true } | { ok: false; message: string };
  leaveLinkedGym: () => void;
  setMyGymTileOrder: (order: string[]) => void;
  resetGymSettings: () => void;
};

function createGymId(): string {
  return `gym-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseShareCode(raw: string): GymSyncPayload | null {
  const trimmed = raw.trim();
  const payload = trimmed.startsWith("RQSYNC:")
    ? trimmed.slice("RQSYNC:".length).trim()
    : trimmed;
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as Partial<GymSyncPayload>;
    if (!parsed || parsed.version !== 1) return null;
    if (
      typeof parsed.gymId !== "string" ||
      typeof parsed.gymName !== "string" ||
      typeof parsed.accentColor !== "string" ||
      !Array.isArray(parsed.schedule) ||
      !parsed.techniqueOverrides ||
      typeof parsed.techniqueOverrides !== "object" ||
      !parsed.videoOverrides ||
      typeof parsed.videoOverrides !== "object" ||
      !Array.isArray(parsed.customTechniques) ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }
    return {
      version: 1,
      gymId: parsed.gymId,
      gymName: parsed.gymName,
      accentColor: normalizeHexColor(parsed.accentColor),
      logoUrl: typeof parsed.logoUrl === "string" && parsed.logoUrl.trim() ? parsed.logoUrl.trim() : undefined,
      schedule: parsed.schedule as GymScheduleClass[],
      techniqueOverrides: parsed.techniqueOverrides,
      videoOverrides: Object.fromEntries(
        Object.entries(parsed.videoOverrides).filter(
          (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"
        )
      ),
      customTechniques: parsed.customTechniques as Technique[],
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

function normalizeHexColor(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_ACCENT_COLOR;
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const upper = prefixed.toUpperCase();
  const valid = /^#[0-9A-F]{6}$/.test(upper);
  return valid ? upper : DEFAULT_ACCENT_COLOR;
}

const emptyOverrides: GymTechniqueOverrides = {};

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      gymId: createGymId(),
      gymName: DEFAULT_GYM_NAME,
      accentColor: DEFAULT_ACCENT_COLOR,
      logoUrl: undefined,
      isGymMode: false,
      schedule: DEFAULT_SCHEDULE,
      techniqueOverrides: emptyOverrides,
      videoOverrides: {},
      customTechniques: [],
      linkedGym: undefined,
      myGymTileOrder: [
        "overview",
        "announcements",
        "assignments",
        "completion",
        "roster",
        "videos",
        "schedule",
        "customMoves",
        "logo",
        "qr",
        "curriculum",
      ],
      setGymId: (gymId) =>
        set({
          gymId: gymId.trim().length > 0 ? gymId.trim() : createGymId(),
        }),
      setGymName: (gymName) =>
        set({
          gymName: gymName.trim().length > 0 ? gymName.trim() : DEFAULT_GYM_NAME,
        }),
      setAccentColor: (accentColor) =>
        set({
          accentColor: normalizeHexColor(accentColor),
        }),
      setLogoUrl: (logoUrl) =>
        set({
          logoUrl: logoUrl && logoUrl.trim().length > 0 ? logoUrl.trim() : undefined,
        }),
      setIsGymMode: (isGymMode) => set({ isGymMode }),
      upsertScheduleClass: (item) =>
        set((state) => {
          const exists = state.schedule.some((cls) => cls.id === item.id);
          const nextOrder =
            item.displayOrder ??
            (exists
              ? (state.schedule.find((c) => c.id === item.id)?.displayOrder ??
                maxDisplayOrderForDay(state.schedule, item.day) + 10)
              : maxDisplayOrderForDay(state.schedule, item.day) + 10);
          const merged: GymScheduleClass = { ...item, displayOrder: nextOrder };
          if (exists) {
            return {
              schedule: state.schedule.map((cls) => (cls.id === item.id ? merged : cls)),
            };
          }
          return { schedule: [...state.schedule, merged] };
        }),
      removeScheduleClass: (id) =>
        set((state) => ({
          schedule: state.schedule.filter((cls) => cls.id !== id),
        })),
      reorderScheduleForDay: (day, orderedIds) =>
        set((state) => {
          const others = state.schedule.filter((c) => c.day !== day);
          const byId = new Map(state.schedule.map((c) => [c.id, c]));
          const reordered: GymScheduleClass[] = orderedIds.map((id, idx) => {
            const base = byId.get(id);
            if (!base || base.day !== day) {
              return null;
            }
            return { ...base, day, displayOrder: idx * 10 };
          }).filter(Boolean) as GymScheduleClass[];
          return { schedule: [...others, ...reordered] };
        }),
      duplicateScheduleClassToDays: (id, targetDays) =>
        set((state) => {
          const src = state.schedule.find((c) => c.id === id);
          if (!src || targetDays.length === 0) return {};
          let nextSchedule = [...state.schedule];
          for (const day of targetDays) {
            const newId = `class-${Date.now()}-${day}-${Math.random().toString(36).slice(2, 8)}`;
            const order = maxDisplayOrderForDay(nextSchedule, day) + 10;
            const copy: GymScheduleClass = {
              ...src,
              id: newId,
              day,
              displayOrder: order,
            };
            nextSchedule.push(copy);
          }
          return { schedule: nextSchedule };
        }),
      setTechniqueOverride: (techniqueId, patch) =>
        set((state) => ({
          techniqueOverrides: {
            ...state.techniqueOverrides,
            [techniqueId]: { ...(state.techniqueOverrides[techniqueId] ?? {}), ...patch },
          },
        })),
      setVideoOverride: (techniqueId, url) =>
        set((state) => ({
          videoOverrides: {
            ...state.videoOverrides,
            [techniqueId]: url.trim(),
          },
        })),
      clearVideoOverride: (techniqueId) =>
        set((state) => {
          const next = { ...state.videoOverrides };
          delete next[techniqueId];
          return { videoOverrides: next };
        }),
      clearTechniqueOverride: (techniqueId) =>
        set((state) => {
          const next = { ...state.techniqueOverrides };
          delete next[techniqueId];
          return { techniqueOverrides: next };
        }),
      clearAllTechniqueOverrides: () => set({ techniqueOverrides: {} }),
      upsertCustomTechnique: (item) =>
        set((state) => {
          const exists = state.customTechniques.some((t) => t.id === item.id);
          if (exists) {
            return {
              customTechniques: state.customTechniques.map((t) => (t.id === item.id ? item : t)),
            };
          }
          return {
            customTechniques: [...state.customTechniques, item],
          };
        }),
      removeCustomTechnique: (id) =>
        set((state) => {
          const removedIds = new Set([id]);
          return {
            customTechniques: state.customTechniques.filter((t) => !removedIds.has(t.id)),
            schedule: state.schedule.map((cls) => ({
              ...cls,
              focusTechniqueIds: (cls.focusTechniqueIds ?? []).filter((techId) => !removedIds.has(techId)),
            })),
          };
        }),
      buildGymShareCode: () => {
        const state = useGymStore.getState();
        const payload: GymSyncPayload = {
          version: 1,
          gymId: state.gymId,
          gymName: state.gymName,
          accentColor: state.accentColor,
          logoUrl: state.logoUrl,
          schedule: state.schedule,
          techniqueOverrides: state.techniqueOverrides,
          videoOverrides: state.videoOverrides,
          customTechniques: state.customTechniques,
          updatedAt: new Date().toISOString(),
        };
        return `RQSYNC:${JSON.stringify(payload)}`;
      },
      joinGymFromShareCode: (shareCode) => {
        const parsed = parseShareCode(shareCode);
        if (!parsed) {
          return { ok: false as const, message: "That gym sync code is invalid." };
        }
        set({
          linkedGym: parsed,
        });
        return { ok: true as const };
      },
      leaveLinkedGym: () => set({ linkedGym: undefined }),
      setMyGymTileOrder: (order) => set({ myGymTileOrder: order }),
      resetGymSettings: () =>
        set({
          gymId: createGymId(),
          gymName: DEFAULT_GYM_NAME,
          accentColor: DEFAULT_ACCENT_COLOR,
          logoUrl: undefined,
          isGymMode: false,
          schedule: DEFAULT_SCHEDULE,
          techniqueOverrides: {},
          videoOverrides: {},
          customTechniques: [],
          linkedGym: undefined,
          myGymTileOrder: [
            "overview",
            "announcements",
            "assignments",
            "completion",
            "roster",
            "videos",
            "schedule",
            "customMoves",
            "logo",
            "qr",
            "curriculum",
          ],
        }),
    }),
    {
      name: "rollquest.gym.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gymId: state.gymId,
        gymName: state.gymName,
        accentColor: state.accentColor,
        logoUrl: state.logoUrl,
        isGymMode: state.isGymMode,
        schedule: state.schedule,
        techniqueOverrides: state.techniqueOverrides,
        videoOverrides: state.videoOverrides,
        customTechniques: state.customTechniques,
        linkedGym: state.linkedGym,
        myGymTileOrder: state.myGymTileOrder,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<GymState>;
        return {
          ...current,
          gymId: typeof p.gymId === "string" && p.gymId.trim() ? p.gymId.trim() : current.gymId,
          gymName: typeof p.gymName === "string" && p.gymName.trim() ? p.gymName : current.gymName,
          accentColor: typeof p.accentColor === "string" ? normalizeHexColor(p.accentColor) : current.accentColor,
          logoUrl: typeof p.logoUrl === "string" && p.logoUrl.trim() ? p.logoUrl.trim() : undefined,
          isGymMode: typeof p.isGymMode === "boolean" ? p.isGymMode : current.isGymMode,
          schedule: Array.isArray(p.schedule) ? p.schedule : current.schedule,
          techniqueOverrides:
            p.techniqueOverrides && typeof p.techniqueOverrides === "object" ? p.techniqueOverrides : {},
          videoOverrides:
            p.videoOverrides && typeof p.videoOverrides === "object"
              ? Object.fromEntries(
                  Object.entries(p.videoOverrides).filter(
                    (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"
                  )
                )
              : {},
          customTechniques: Array.isArray(p.customTechniques) ? p.customTechniques : [],
          linkedGym:
            p.linkedGym && typeof p.linkedGym === "object" && (p.linkedGym as GymSyncPayload).version === 1
              ? (p.linkedGym as GymSyncPayload)
              : undefined,
          myGymTileOrder: Array.isArray(p.myGymTileOrder)
            ? p.myGymTileOrder.filter((id): id is string => typeof id === "string")
            : current.myGymTileOrder,
        };
      },
    }
  )
);

export function withAlpha(hexColor: string, alpha: number): string {
  const clean = normalizeHexColor(hexColor).replace("#", "");
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(safeAlpha * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return `#${clean}${alphaHex}`;
}
