import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "rollquest.progress.v1";
const LEGACY_MY_TECHNIQUES_KEY = "rollquest.myTechniques.v1";

export type BeltLevel = "white" | "blue" | "purple" | "brown" | "black";

export type UserProgress = {
  profileName: string;
  currentBelt: BeltLevel;
  /** @deprecated Use streakCount instead. */
  streakDays: number;
  streakCount: number;
  lastActivityDate: string | null;
  dailyGoal: number;
  learnedTechniqueIds: string[];
  myTechniques: string[];
  /** ISO date (YYYY-MM-DD) by technique id for spaced review. */
  lastReviewedByTechniqueId: Record<string, string>;
  /** Completed daily task ids bucketed by YYYY-MM-DD. */
  completedDailyTaskIdsByDate: Record<string, string[]>;
};

export const defaultProgress: UserProgress = {
  profileName: "Student",
  currentBelt: "white",
  streakDays: 3,
  streakCount: 3,
  lastActivityDate: null,
  dailyGoal: 3,
  learnedTechniqueIds: [],
  myTechniques: [],
  lastReviewedByTechniqueId: {},
  completedDailyTaskIdsByDate: {},
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
        const parsedLegacy = JSON.parse(legacyMyTechniquesRaw) as { id?: unknown }[];
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
    const parsedStreak = typeof parsed.streakCount === "number" ? parsed.streakCount : parsed.streakDays;
    const normalizedStreak = Number.isFinite(parsedStreak) ? Math.max(0, Math.floor(parsedStreak ?? 0)) : 0;
    const normalizedLastActivityDate =
      typeof parsed.lastActivityDate === "string" && parsed.lastActivityDate.trim().length > 0
        ? parsed.lastActivityDate
        : null;
    return {
      ...defaultProgress,
      ...parsed,
      profileName: typeof parsed.profileName === "string" && parsed.profileName.trim().length > 0 ? parsed.profileName : "Student",
      currentBelt: curriculumBelt,
      streakCount: normalizedStreak,
      streakDays: normalizedStreak,
      lastActivityDate: normalizedLastActivityDate,
      learnedTechniqueIds: Array.isArray(parsed.learnedTechniqueIds) ? parsed.learnedTechniqueIds : [],
      myTechniques: [
        ...new Set([
          ...(Array.isArray(parsed.myTechniques)
            ? parsed.myTechniques.filter((id): id is string => typeof id === "string")
            : []),
          ...legacyMyTechniqueIds,
        ]),
      ],
      lastReviewedByTechniqueId:
        parsed.lastReviewedByTechniqueId && typeof parsed.lastReviewedByTechniqueId === "object"
          ? Object.fromEntries(
              Object.entries(parsed.lastReviewedByTechniqueId).filter(
                (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"
              )
            )
          : {},
      completedDailyTaskIdsByDate:
        parsed.completedDailyTaskIdsByDate && typeof parsed.completedDailyTaskIdsByDate === "object"
          ? Object.fromEntries(
              Object.entries(parsed.completedDailyTaskIdsByDate).map(([dateKey, taskIds]) => [
                dateKey,
                Array.isArray(taskIds) ? taskIds.filter((id): id is string => typeof id === "string") : [],
              ])
            )
          : {},
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

export async function updateProfileName(profileName: string): Promise<UserProgress> {
  const progress = await loadProgress();
  const trimmed = profileName.trim();
  const updated = { ...progress, profileName: trimmed.length > 0 ? trimmed : "Student" };
  await saveProgress(updated);
  return updated;
}

function startOfTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function previousDateString(dateString: string): string {
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setDate(date.getDate() - 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function registerActivity(activityDate = startOfTodayDateString()): Promise<UserProgress> {
  const progress = await loadProgress();
  if (progress.lastActivityDate === activityDate) {
    return progress;
  }
  const nextStreak = progress.lastActivityDate === previousDateString(activityDate) ? progress.streakCount + 1 : 1;
  const updated: UserProgress = {
    ...progress,
    streakCount: nextStreak,
    streakDays: nextStreak,
    lastActivityDate: activityDate,
  };
  await saveProgress(updated);
  return updated;
}

export async function toggleLearnedTechnique(techniqueId: string): Promise<UserProgress> {
  const progress = await loadProgress();
  const nextIds = progress.learnedTechniqueIds.includes(techniqueId)
    ? progress.learnedTechniqueIds.filter((id) => id !== techniqueId)
    : [...progress.learnedTechniqueIds, techniqueId];
  const today = startOfTodayDateString();
  const updated = {
    ...progress,
    learnedTechniqueIds: nextIds,
    lastReviewedByTechniqueId: {
      ...progress.lastReviewedByTechniqueId,
      [techniqueId]: today,
    },
  };
  await saveProgress(updated);
  return registerActivity(today);
}

export async function addToMyLibrary(id: string): Promise<UserProgress> {
  const progress = await loadProgress();
  if (progress.myTechniques.includes(id)) return progress;
  const today = startOfTodayDateString();
  const updated = {
    ...progress,
    myTechniques: [...progress.myTechniques, id],
    lastReviewedByTechniqueId: {
      ...progress.lastReviewedByTechniqueId,
      [id]: progress.lastReviewedByTechniqueId[id] ?? today,
    },
  };
  await saveProgress(updated);
  return registerActivity(today);
}

export async function addMultipleToMyLibrary(ids: string[]): Promise<UserProgress> {
  const progress = await loadProgress();
  const incoming = ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
  if (incoming.length === 0) return progress;
  const merged = [...new Set([...progress.myTechniques, ...incoming])];
  const today = startOfTodayDateString();
  const nextReviewed = { ...progress.lastReviewedByTechniqueId };
  for (const id of incoming) {
    if (!nextReviewed[id]) nextReviewed[id] = today;
  }
  const updated = { ...progress, myTechniques: merged, lastReviewedByTechniqueId: nextReviewed };
  await saveProgress(updated);
  return registerActivity(today);
}

export async function removeFromMyLibrary(id: string): Promise<UserProgress> {
  const progress = await loadProgress();
  if (!progress.myTechniques.includes(id)) return progress;
  const updated = { ...progress, myTechniques: progress.myTechniques.filter((techId) => techId !== id) };
  await saveProgress(updated);
  return updated;
}

export async function markTechniqueReviewed(techniqueId: string, reviewedDate = startOfTodayDateString()): Promise<UserProgress> {
  const progress = await loadProgress();
  const updated = {
    ...progress,
    lastReviewedByTechniqueId: {
      ...progress.lastReviewedByTechniqueId,
      [techniqueId]: reviewedDate,
    },
  };
  await saveProgress(updated);
  return registerActivity(reviewedDate);
}

export async function markDailyTaskCompleted(taskId: string, date = startOfTodayDateString()): Promise<UserProgress> {
  const progress = await loadProgress();
  const current = progress.completedDailyTaskIdsByDate[date] ?? [];
  if (current.includes(taskId)) {
    return progress;
  }
  const updated = {
    ...progress,
    completedDailyTaskIdsByDate: {
      ...progress.completedDailyTaskIdsByDate,
      [date]: [...current, taskId],
    },
  };
  await saveProgress(updated);
  return registerActivity(date);
}

export async function toggleDailyTaskCompleted(taskId: string, date = startOfTodayDateString()): Promise<UserProgress> {
  const progress = await loadProgress();
  const current = progress.completedDailyTaskIdsByDate[date] ?? [];
  const alreadyDone = current.includes(taskId);
  const nextForDate = alreadyDone ? current.filter((id) => id !== taskId) : [...current, taskId];
  const updated = {
    ...progress,
    completedDailyTaskIdsByDate: {
      ...progress.completedDailyTaskIdsByDate,
      [date]: nextForDate,
    },
  };
  await saveProgress(updated);
  return alreadyDone ? updated : registerActivity(date);
}
