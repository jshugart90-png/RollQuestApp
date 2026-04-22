import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "rollquest.progress.v1";

export type BeltLevel = "white" | "blue" | "purple" | "brown" | "black";

export type UserProgress = {
  currentBelt: BeltLevel;
  streakDays: number;
  dailyGoal: number;
  learnedTechniqueIds: string[];
};

export const defaultProgress: UserProgress = {
  currentBelt: "white",
  streakDays: 3,
  dailyGoal: 3,
  learnedTechniqueIds: [],
};

/** Belts that currently have technique curriculum in-app */
export const CURRICULUM_BELTS = ["white", "blue", "purple", "brown"] as const satisfies readonly BeltLevel[];

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    const normalizedBelt =
      typeof parsed.currentBelt === "string" ? (parsed.currentBelt.toLowerCase() as BeltLevel) : defaultProgress.currentBelt;
    const curriculumBelt = (CURRICULUM_BELTS as readonly string[]).includes(normalizedBelt)
      ? normalizedBelt
      : defaultProgress.currentBelt;
    return {
      ...defaultProgress,
      ...parsed,
      currentBelt: curriculumBelt,
      learnedTechniqueIds: Array.isArray(parsed.learnedTechniqueIds) ? parsed.learnedTechniqueIds : [],
    };
  } catch {
    return defaultProgress;
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export async function updateCurrentBelt(currentBelt: BeltLevel): Promise<UserProgress> {
  const progress = await loadProgress();
  const belt = (CURRICULUM_BELTS as readonly string[]).includes(currentBelt) ? currentBelt : defaultProgress.currentBelt;
  const updated = { ...progress, currentBelt: belt };
  await saveProgress(updated);
  return updated;
}

export async function toggleLearnedTechnique(techniqueId: string): Promise<UserProgress> {
  const progress = await loadProgress();
  const nextIds = progress.learnedTechniqueIds.includes(techniqueId)
    ? progress.learnedTechniqueIds.filter((id) => id !== techniqueId)
    : [...progress.learnedTechniqueIds, techniqueId];
  const updated = { ...progress, learnedTechniqueIds: nextIds };
  await saveProgress(updated);
  return updated;
}
