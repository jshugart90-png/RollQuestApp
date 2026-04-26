import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKUP_KEYS = [
  "rollquest.progress.v1",
  "rollquest.gym.v1",
  "rollquest.assignments.v1",
  "rollquest.techniqueRequests.v1",
  "rollquest.sync.v1",
  "rollquest.challenges.v1",
  "rollquest.auth.v1",
  "rollquest.ui.v1",
  "rollquest.notes.v2",
] as const;

export type RollQuestBackup = {
  version: 1;
  createdAt: string;
  values: Record<string, string | null>;
};

export async function exportBackup(): Promise<string> {
  const values: Record<string, string | null> = {};
  for (const key of BACKUP_KEYS) {
    values[key] = await AsyncStorage.getItem(key);
  }
  const payload: RollQuestBackup = {
    version: 1,
    createdAt: new Date().toISOString(),
    values,
  };
  return JSON.stringify(payload);
}

export async function importBackup(raw: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const parsed = JSON.parse(raw) as Partial<RollQuestBackup>;
    if (!parsed || parsed.version !== 1 || !parsed.values || typeof parsed.values !== "object") {
      return { ok: false, message: "Invalid backup payload." };
    }
    for (const key of BACKUP_KEYS) {
      const value = (parsed.values as Record<string, unknown>)[key];
      if (typeof value === "string") {
        await AsyncStorage.setItem(key, value);
      } else {
        await AsyncStorage.removeItem(key);
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Failed to parse backup JSON." };
  }
}
