import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UiPreferencesState = {
  reducedMotion: boolean;
  highContrast: boolean;
  textScale: number;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setTextScale: (value: number) => void;
};

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      highContrast: false,
      textScale: 1,
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setHighContrast: (value) => set({ highContrast: value }),
      setTextScale: (value) => set({ textScale: Math.max(0.9, Math.min(1.25, Number(value) || 1)) }),
    }),
    {
      name: "rollquest.ui.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        textScale: state.textScale,
      }),
    }
  )
);
