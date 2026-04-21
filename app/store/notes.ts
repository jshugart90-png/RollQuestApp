import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTechniqueById, type Technique } from "../data/techniques";

const NOTES_KEY = "rollquest.notes.v2";
const NOTES_KEY_LEGACY = "rollquest.notes.v1";

export type SessionNote = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  /** Full technique snapshots saved with the note */
  techniques: Technique[];
};

type LegacyNote = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  techniqueIds?: string[];
  techniques?: Technique[];
};

function migrateNote(note: LegacyNote): SessionNote {
  const techniques: Technique[] = [];
  if (Array.isArray(note.techniques) && note.techniques.length > 0) {
    for (const t of note.techniques) {
      if (t && typeof t.id === "string") techniques.push(t);
    }
  } else if (Array.isArray(note.techniqueIds)) {
    for (const id of note.techniqueIds) {
      const found = getTechniqueById(id);
      if (found) techniques.push({ ...found });
    }
  }
  return {
    id: note.id,
    text: note.text ?? "",
    createdAt: note.createdAt,
    updatedAt: note.updatedAt ?? note.createdAt,
    techniques,
  };
}

export async function loadNotes(): Promise<SessionNote[]> {
  try {
    const v2 = await AsyncStorage.getItem(NOTES_KEY);
    if (v2) {
      const parsed = JSON.parse(v2) as LegacyNote[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(migrateNote);
    }
    const v1 = await AsyncStorage.getItem(NOTES_KEY_LEGACY);
    if (v1) {
      const parsed = JSON.parse(v1) as LegacyNote[];
      if (Array.isArray(parsed)) {
        const migrated = parsed.map(migrateNote);
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveNotes(notes: SessionNote[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function addNote(text: string, techniques: Technique[]): Promise<SessionNote[]> {
  const current = await loadNotes();
  const now = new Date().toISOString();
  const next: SessionNote[] = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text: text.trim(),
      createdAt: now,
      updatedAt: now,
      techniques: techniques.map((t) => ({ ...t })),
    },
    ...current,
  ];
  await saveNotes(next);
  return next;
}

export async function updateNote(
  id: string,
  text: string,
  techniques: Technique[]
): Promise<SessionNote[]> {
  const current = await loadNotes();
  const now = new Date().toISOString();
  const next = current.map((note) =>
    note.id === id
      ? {
          ...note,
          text: text.trim(),
          techniques: techniques.map((t) => ({ ...t })),
          updatedAt: now,
        }
      : note
  );
  await saveNotes(next);
  return next;
}

export async function deleteNote(id: string): Promise<SessionNote[]> {
  const current = await loadNotes();
  const next = current.filter((n) => n.id !== id);
  await saveNotes(next);
  return next;
}
