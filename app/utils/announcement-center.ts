import { create } from "zustand";
import { markAnnouncementsRead, loadProgress } from "../store/progress";
import { useGymStore, type GymAnnouncement } from "../store/gym";

type AnnouncementCenterState = {
  announcements: GymAnnouncement[];
  unreadCount: number;
  readIds: string[];
  refresh: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
};

function isAnnouncementActive(item: GymAnnouncement, now = new Date()): boolean {
  if (!item.expiresOn) return true;
  const expiry = new Date(`${item.expiresOn}T23:59:59`);
  if (Number.isNaN(expiry.getTime())) return true;
  return expiry.getTime() >= now.getTime();
}

export function getActiveAnnouncements(): GymAnnouncement[] {
  const state = useGymStore.getState();
  const source = state.isGymMode ? state.announcements : state.linkedGym?.announcements ?? state.announcements;
  return source
    .filter((item) => isAnnouncementActive(item))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const useAnnouncementCenter = create<AnnouncementCenterState>((set) => ({
  announcements: [],
  unreadCount: 0,
  readIds: [],
  refresh: async () => {
    const progress = await loadProgress();
    const announcements = getActiveAnnouncements();
    const unread = announcements.filter((item) => !progress.readAnnouncementIds.includes(item.id)).length;
    set({
      announcements,
      unreadCount: unread,
      readIds: progress.readAnnouncementIds,
    });
  },
  markRead: async (ids) => {
    const updated = await markAnnouncementsRead(ids);
    const announcements = getActiveAnnouncements();
    const unread = announcements.filter((item) => !updated.readAnnouncementIds.includes(item.id)).length;
    set({
      announcements,
      unreadCount: unread,
      readIds: updated.readAnnouncementIds,
    });
  },
}));
