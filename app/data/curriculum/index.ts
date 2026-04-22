import { Core_WHITE_TECHNIQUES } from "./core.white";
import { Core_BLUE_TECHNIQUES } from "./core.blue";
import { Core_PURPLE_TECHNIQUES } from "./core.purple";
import { Core_BROWN_TECHNIQUES } from "./core.brown";

export type PositionTab =
  | "Takedowns & Standing"
  | "Guard Work"
  | "Guard Passing"
  | "Side Control"
  | "Mount"
  | "Back / Rear Mount"
  | "Turtle & Leg Entanglements"
  | "Submissions"
  | "Self Defense"
  | "Escapes";

export type Technique = {
  id: string;
  name: string;
  belt: "white" | "blue" | "purple" | "brown";
  position: PositionTab;
  category: string;
  shortDescription: string;
  fullStepByStep: string[];
  tips: string[];
  commonMistakes: string[];
  youtubeUrl: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  curriculum: {
    sourceGym: string;
    track: string;
    isMasterLibrary: boolean;
    tags: string[];
  };
};

export type TechniqueOverride = Partial<Omit<Technique, "id">>;
export type GymTechniqueOverrides = Record<string, TechniqueOverride>;

export const POSITION_TABS: PositionTab[] = [
  "Takedowns & Standing",
  "Guard Work",
  "Guard Passing",
  "Side Control",
  "Mount",
  "Back / Rear Mount",
  "Turtle & Leg Entanglements",
  "Submissions",
  "Self Defense",
  "Escapes",
];

/**
 * Apply gym-specific customizations while preserving master IDs.
 */
export function applyGymOverrides(
  techniques: Technique[],
  overrides?: GymTechniqueOverrides
): Technique[] {
  if (!overrides) return techniques;
  return techniques.map((tech) => ({ ...tech, ...(overrides[tech.id] ?? {}) }));
}

/**
 * Canonical combined master list used across the app.
 */
export const ALL_TECHNIQUES: Technique[] = [
  ...Core_WHITE_TECHNIQUES,
  ...Core_BLUE_TECHNIQUES,
  ...Core_PURPLE_TECHNIQUES,
  ...Core_BROWN_TECHNIQUES,
];

/**
 * Backward-compatible alias used by existing screens and stores.
 */
export const TECHNIQUES: Technique[] = ALL_TECHNIQUES;

export function getTechniquesByBelt(belt: string): Technique[] {
  return ALL_TECHNIQUES.filter((technique) => technique.belt === belt);
}

export function getTechniqueById(id: string): Technique | undefined {
  return ALL_TECHNIQUES.find((technique) => technique.id === id);
}

export {
  Core_WHITE_TECHNIQUES,
  Core_BLUE_TECHNIQUES,
  Core_PURPLE_TECHNIQUES,
  Core_BROWN_TECHNIQUES,
};
