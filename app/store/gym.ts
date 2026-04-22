import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const DEFAULT_GYM_NAME = "My Gym";
const DEFAULT_ACCENT_COLOR = "#C8102E";

export type GymMode = "gym" | "personal";

type GymState = {
  gymName: string;
  accentColor: string;
  isGymMode: boolean;
  setGymName: (gymName: string) => void;
  setAccentColor: (accentColor: string) => void;
  setIsGymMode: (isGymMode: boolean) => void;
  resetGymSettings: () => void;
};

function normalizeHexColor(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_ACCENT_COLOR;
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const upper = prefixed.toUpperCase();
  const valid = /^#[0-9A-F]{6}$/.test(upper);
  return valid ? upper : DEFAULT_ACCENT_COLOR;
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      gymName: DEFAULT_GYM_NAME,
      accentColor: DEFAULT_ACCENT_COLOR,
      isGymMode: false,
      setGymName: (gymName) =>
        set({
          gymName: gymName.trim().length > 0 ? gymName.trim() : DEFAULT_GYM_NAME,
        }),
      setAccentColor: (accentColor) =>
        set({
          accentColor: normalizeHexColor(accentColor),
        }),
      setIsGymMode: (isGymMode) => set({ isGymMode }),
      resetGymSettings: () =>
        set({
          gymName: DEFAULT_GYM_NAME,
          accentColor: DEFAULT_ACCENT_COLOR,
          isGymMode: false,
        }),
    }),
    {
      name: "rollquest.gym.v1",
      storage: createJSONStorage(() => AsyncStorage),
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

