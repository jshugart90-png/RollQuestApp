import { getSupabaseClient } from "./client";

export type SyncEventInsert = {
  gym_id: string;
  user_id: string;
  profile_id: string;
  event_type: string;
  event_payload: Record<string, unknown>;
  event_ts?: string;
};

export async function insertSyncEvent(event: SyncEventInsert): Promise<{ ok: true } | { ok: false; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, message: "Supabase not configured." };
  const { error } = await client.from("sync_events").insert({
    ...event,
    event_ts: event.event_ts ?? new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function insertRollingLog(payload: {
  gym_id?: string;
  user_id?: string;
  technique_id: string;
  technique_name: string;
  class_name?: string;
  notes?: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, message: "Supabase not configured." };
  const { error } = await client.from("rolling_logs").insert(payload);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function insertChallengeCompletion(payload: {
  gym_id?: string;
  user_id?: string;
  date_key: string;
  challenge_id: string;
  technique_id: string;
  technique_name: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, message: "Supabase not configured." };
  const { error } = await client.from("challenge_completions").insert(payload);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
