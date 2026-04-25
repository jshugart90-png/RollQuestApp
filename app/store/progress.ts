import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "rollquest.progress.v1";
const LEGACY_MY_TECHNIQUES_KEY = "rollquest.myTechniques.v1";

export type BeltLevel = "white" | "blue" | "purple" | "brown" | "black";
export type TechniqueMasteryLevel = "novice" | "proficient" | "master";

export type UserProgress = {
  profileName: string;
  currentBelt: BeltLevel;
  /** @deprecated Use streakCount instead. */
  streakDays: number;
  streakCount: number;
  lastActivityDate: string | null;
  longestStreak: number;
  totalSessionsLogged: number;
  dailyGoal: number;
  learnedTechniqueIds: string[];
  myTechniques: string[];
  /** ISO date (YYYY-MM-DD) by technique id for spaced review. */
  lastReviewedByTechniqueId: Record<string, string>;
  /** Spaced repetition memory strength by technique id (0-5). */
  reviewStrengthByTechniqueId: Record<string, number>;
  /** Student-declared mastery level by technique id. */
  masteryByTechniqueId: Record<string, TechniqueMasteryLevel>;
  /** Attendance markers keyed by classId|YYYY-MM-DD. */
  attendedClassKeys: string[];
  /** Completed daily task ids bucketed by YYYY-MM-DD. */
  completedDailyTaskIdsByDate: Record<string, string[]>;
};

export const defaultProgress: UserProgress = {
  profileName: "Student",
  currentBelt: "white",
  streakDays: 3,
  streakCount: 3,
  lastActivityDate: null,
  longestStreak: 3,
  totalSessionsLogged: 0,
  dailyGoal: 3,
  learnedTechniqueIds: [],
  myTechniques: [],
  lastReviewedByTechniqueId: {},
  reviewStrengthByTechniqueId: {},
  masteryByTechniqueId: {},
  attendedClassKeys: [],
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
    const parsedLongestStreak = typeof parsed.longestStreak === "number" ? parsed.longestStreak : normalizedStreak;
    const normalizedLongestStreak = Number.isFinite(parsedLongestStreak)
      ? Math.max(normalizedStreak, Math.floor(parsedLongestStreak ?? 0))
      : normalizedStreak;
    const parsedTotalSessions = typeof parsed.totalSessionsLogged === "number" ? parsed.totalSessionsLogged : 0;
    const normalizedTotalSessions = Number.isFinite(parsedTotalSessions) ? Math.max(0, Math.floor(parsedTotalSessions)) : 0;
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
      longestStreak: normalizedLongestStreak,
      totalSessionsLogged: normalizedTotalSessions,
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
      reviewStrengthByTechniqueId:
        parsed.reviewStrengthByTechniqueId && typeof parsed.reviewStrengthByTechniqueId === "object"
          ? Object.fromEntries(
              Object.entries(parsed.reviewStrengthByTechniqueId).map(([id, value]) => [
                id,
                Number.isFinite(value) ? Math.max(0, Math.min(5, Math.floor(value as number))) : 2,
              ])
            )
          : {},
      masteryByTechniqueId:
        parsed.masteryByTechniqueId && typeof parsed.masteryByTechniqueId === "object"
          ? Object.fromEntries(
              Object.entries(parsed.masteryByTechniqueId).filter(
                (entry): entry is [string, TechniqueMasteryLevel] =>
                  typeof entry[0] === "string" &&
                  (entry[1] === "novice" || entry[1] === "proficient" || entry[1] === "master")
              )
            )
          : {},
      attendedClassKeys: Array.isArray(parsed.attendedClassKeys)
        ? parsed.attendedClassKeys.filter((item): item is string => typeof item === "string")
        : [],
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
  const nextLongestStreak = Math.max(progress.longestStreak, nextStreak);
  const updated: UserProgress = {
    ...progress,
    streakCount: nextStreak,
    streakDays: nextStreak,
    lastActivityDate: activityDate,
    longestStreak: nextLongestStreak,
    totalSessionsLogged: progress.totalSessionsLogged + 1,
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
    reviewStrengthByTechniqueId: {
      ...progress.reviewStrengthByTechniqueId,
      [id]: progress.reviewStrengthByTechniqueId[id] ?? 2,
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
  const nextStrength = { ...progress.reviewStrengthByTechniqueId };
  for (const id of incoming) {
    if (!nextReviewed[id]) nextReviewed[id] = today;
    if (nextStrength[id] === undefined) nextStrength[id] = 2;
  }
  const updated = { ...progress, myTechniques: merged, lastReviewedByTechniqueId: nextReviewed, reviewStrengthByTechniqueId: nextStrength };
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
    reviewStrengthByTechniqueId: {
      ...progress.reviewStrengthByTechniqueId,
      [techniqueId]: progress.reviewStrengthByTechniqueId[techniqueId] ?? 2,
    },
  };
  await saveProgress(updated);
  return registerActivity(reviewedDate);
}

export async function rateTechniqueRecall(techniqueId: string, remembered: boolean): Promise<UserProgress> {
  const progress = await loadProgress();
  const today = startOfTodayDateString();
  const currentStrength = progress.reviewStrengthByTechniqueId[techniqueId] ?? 2;
  const nextStrength = remembered ? Math.min(5, currentStrength + 1) : Math.max(0, currentStrength - 1);
  const updated = {
    ...progress,
    lastReviewedByTechniqueId: {
      ...progress.lastReviewedByTechniqueId,
      [techniqueId]: today,
    },
    reviewStrengthByTechniqueId: {
      ...progress.reviewStrengthByTechniqueId,
      [techniqueId]: nextStrength,
    },
  };
  await saveProgress(updated);
  return registerActivity(today);
}

export async function setTechniqueMasteryLevel(
  techniqueId: string,
  level: TechniqueMasteryLevel
): Promise<UserProgress> {
  const progress = await loadProgress();
  const today = startOfTodayDateString();
  const updated = {
    ...progress,
    masteryByTechniqueId: {
      ...progress.masteryByTechniqueId,
      [techniqueId]: level,
    },
    lastReviewedByTechniqueId: {
      ...progress.lastReviewedByTechniqueId,
      [techniqueId]: progress.lastReviewedByTechniqueId[techniqueId] ?? today,
    },
  };
  await saveProgress(updated);
  return registerActivity(today);
}

export async function toggleClassAttendance(
  classId: string,
  date = startOfTodayDateString()
): Promise<UserProgress> {
  const progress = await loadProgress();
  const key = `${classId}|${date}`;
  const already = progress.attendedClassKeys.includes(key);
  const next = already
    ? progress.attendedClassKeys.filter((item) => item !== key)
    : [...progress.attendedClassKeys, key];
  const updated = { ...progress, attendedClassKeys: next };
  await saveProgress(updated);
  return already ? updated : registerActivity(date);
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
