import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Technique } from "../data/techniques";

const MY_TECHNIQUES_KEY = "rollquest.myTechniques.v1";

export async function loadMyTechniques(): Promise<Technique[]> {
  try {
    const raw = await AsyncStorage.getItem(MY_TECHNIQUES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Technique[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMyTechniques(techniques: Technique[]): Promise<void> {
  await AsyncStorage.setItem(MY_TECHNIQUES_KEY, JSON.stringify(techniques));
}

/** Merge by technique id so updates to curriculum fields refresh saved copies */
export async function addMyTechnique(technique: Technique): Promise<Technique[]> {
  const current = await loadMyTechniques();
  const byId = new Map(current.map((t) => [t.id, t]));
  byId.set(technique.id, technique);
  const next = [...byId.values()];
  await saveMyTechniques(next);
  return next;
}
