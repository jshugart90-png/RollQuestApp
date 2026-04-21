import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "rollquest.progress.v1";

export type BeltLevel = "White" | "Blue" | "Purple" | "Brown" | "Black";

export type UserProgress = {
  currentBelt: BeltLevel;
  streakDays: number;
  dailyGoal: number;
  learnedTechniqueIds: string[];
};

export const defaultProgress: UserProgress = {
  currentBelt: "White",
  streakDays: 3,
  dailyGoal: 3,
  learnedTechniqueIds: [],
};

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...defaultProgress,
      ...parsed,
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
  const updated = { ...progress, currentBelt };
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
