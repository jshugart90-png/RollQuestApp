import { insertSyncEvent } from "../supabase/repositories";
import { isSupabaseConfigured } from "../supabase/client";

export type SyncEnvelope<T = unknown> = {
  gymId: string;
  profileId: string;
  userId?: string;
  ts: string;
  data: T;
};

export type SyncClientConfig = {
  baseUrl: string;
  apiKey?: string;
};

export class SyncClient {
  constructor(private readonly config: SyncClientConfig) {}

  async pushEvent<T>(route: string, payload: SyncEnvelope<T>): Promise<{ ok: true } | { ok: false; message: string }> {
    if (isSupabaseConfigured() && payload.userId) {
      return insertSyncEvent({
        gym_id: payload.gymId,
        user_id: payload.userId,
        profile_id: payload.profileId,
        event_type: route.replace(/^\//, ""),
        event_payload: (payload.data ?? {}) as Record<string, unknown>,
        event_ts: payload.ts,
      });
    }
    try {
      const response = await fetch(`${this.config.baseUrl}${route}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.config.apiKey ? { "x-api-key": this.config.apiKey } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return { ok: false, message: `sync failed (${response.status})` };
      }
      return { ok: true };
    } catch {
      return { ok: false, message: "sync network error" };
    }
  }
}

export function createDefaultSyncClient(): SyncClient | null {
  const baseUrl = process.env.EXPO_PUBLIC_ROLLQUEST_SYNC_URL;
  const apiKey = process.env.EXPO_PUBLIC_ROLLQUEST_SYNC_KEY;
  if (!baseUrl) return null;
  return new SyncClient({ baseUrl, apiKey });
}
