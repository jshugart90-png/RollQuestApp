import type { Technique } from "../data/techniques";
import type { UserProgress } from "../store/progress";

export type SmartReviewItem = {
  technique: Technique;
  daysSinceReview: number;
  recallStrength: number;
  urgencyScore: number;
  idealIntervalDays: number;
};

export function buildSmartReviewQueue(techniques: Technique[], progress: UserProgress): SmartReviewItem[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const items: SmartReviewItem[] = techniques.map((technique) => {
    const lastReviewed = progress.lastReviewedByTechniqueId[technique.id];
    const daysSinceReview = daysSince(lastReviewed, today);
    const recallStrength = progress.reviewStrengthByTechniqueId[technique.id] ?? 2;
    const mastery = progress.masteryByTechniqueId[technique.id] ?? "novice";

    const masteryMultiplier = mastery === "master" ? 1.6 : mastery === "proficient" ? 1.2 : 0.95;
    const idealIntervalDays = Math.max(1, Math.round((2 + recallStrength * 2) * masteryMultiplier));
    const overdue = Math.max(0, daysSinceReview - idealIntervalDays);
    const neglected = daysSinceReview >= 9999 ? 12 : Math.min(8, Math.floor(daysSinceReview / 3));
    const urgencyScore = overdue * 2.2 + (5 - recallStrength) * 3.4 + neglected;

    return {
      technique,
      daysSinceReview,
      recallStrength,
      urgencyScore,
      idealIntervalDays,
    };
  });

  return items.sort((a, b) => b.urgencyScore - a.urgencyScore);
}

function daysSince(dateString: string | undefined, floorToday: number): number {
  if (!dateString) return 9999;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 9999;
  const floorDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.max(0, Math.floor((floorToday - floorDate) / (1000 * 60 * 60 * 24)));
}
