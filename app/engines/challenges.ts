import type { Technique } from "../data/techniques";
import type { UserProgress } from "../store/progress";

export type RollingChallenge = {
  id: string;
  techniqueId: string;
  techniqueName: string;
  source: "mastered" | "recent" | "improve";
  status: "active" | "completed";
  completedAt?: string;
};

export function buildRollingChallenges(techniques: Technique[], progress: UserProgress, dateKey: string): RollingChallenge[] {
  const byId = new Map(techniques.map((t) => [t.id, t]));

  const masteredCandidates = progress.learnedTechniqueIds
    .filter((id) => (progress.masteryByTechniqueId[id] ?? "novice") === "master")
    .slice(0, 2);

  const recentCandidates = Object.entries(progress.lastReviewedByTechniqueId)
    .sort((a, b) => (b[1] ?? "").localeCompare(a[1] ?? ""))
    .map(([id]) => id)
    .filter((id) => !masteredCandidates.includes(id))
    .slice(0, 2);

  const improveCandidates = progress.myTechniques
    .filter((id) => !masteredCandidates.includes(id) && !recentCandidates.includes(id))
    .slice(0, 2);

  const selected = [
    ...masteredCandidates.map((id) => ({ id, source: "mastered" as const })),
    ...recentCandidates.map((id) => ({ id, source: "recent" as const })),
    ...improveCandidates.map((id) => ({ id, source: "improve" as const })),
  ].slice(0, 3);

  return selected
    .map(({ id, source }) => {
      const technique = byId.get(id);
      if (!technique) return null;
      const challenge: RollingChallenge = {
        id: `challenge-${dateKey}-${technique.id}`,
        techniqueId: technique.id,
        techniqueName: technique.name,
        source,
        status: "active",
      };
      return challenge;
    })
    .filter((item): item is RollingChallenge => item !== null);
}
