import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "rollquest.progress.v1";
const LEGACY_MY_TECHNIQUES_KEY = "rollquest.myTechniques.v1";

export type BeltLevel = "white" | "blue" | "purple" | "brown" | "black";

export type UserProgress = {
  currentBelt: BeltLevel;
  streakDays: number;
  dailyGoal: number;
  learnedTechniqueIds: string[];
  myTechniques: string[];
};

export const defaultProgress: UserProgress = {
  currentBelt: "white",
  streakDays: 3,
  dailyGoal: 3,
  learnedTechniqueIds: [],
  myTechniques: [],
};

/** Belts that currently have technique curriculum in-app */
export const CURRICULUM_BELTS = ["white", "blue", "purple", "brown"] as const satisfies readonly BeltLevel[];

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    const legacyMyTechniquesRaw = await AsyncStorage.getItem(LEGACY_MY_TECHNIQUES_KEY);
    const legacyMyTechniqueIds: string[] = [];
    if (legacyMyTechniquesRaw) {
      try {
        const parsedLegacy = JSON.parse(legacyMyTechniquesRaw) as Array<{ id?: unknown }>;
        if (Array.isArray(parsedLegacy)) {
          for (const item of parsedLegacy) {
            if (item && typeof item.id === "string") legacyMyTechniqueIds.push(item.id);
          }
        }
      } catch {
        // ignore malformed legacy payload
      }
    }

    if (!raw) {
      if (legacyMyTechniqueIds.length === 0) return defaultProgress;
      return {
        ...defaultProgress,
        myTechniques: [...new Set(legacyMyTechniqueIds)],
      };
    }
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
      myTechniques: [
        ...new Set([
          ...(Array.isArray(parsed.myTechniques)
            ? parsed.myTechniques.filter((id): id is string => typeof id === "string")
            : []),
          ...legacyMyTechniqueIds,
        ]),
      ],
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

export async function addToMyLibrary(id: string): Promise<UserProgress> {
  const progress = await loadProgress();
  if (progress.myTechniques.includes(id)) return progress;
  const updated = { ...progress, myTechniques: [...progress.myTechniques, id] };
  await saveProgress(updated);
  return updated;
}

export async function addMultipleToMyLibrary(ids: string[]): Promise<UserProgress> {
  const progress = await loadProgress();
  const incoming = ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
  if (incoming.length === 0) return progress;
  const merged = [...new Set([...progress.myTechniques, ...incoming])];
  const updated = { ...progress, myTechniques: merged };
  await saveProgress(updated);
  return updated;
}

export async function removeFromMyLibrary(id: string): Promise<UserProgress> {
  const progress = await loadProgress();
  if (!progress.myTechniques.includes(id)) return progress;
  const updated = { ...progress, myTechniques: progress.myTechniques.filter((techId) => techId !== id) };
  await saveProgress(updated);
  return updated;
}
