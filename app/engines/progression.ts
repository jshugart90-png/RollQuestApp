import type { Technique } from "../data/techniques";
import type { BeltLevel, UserProgress } from "../store/progress";

export type ProgressionSummary = {
  belt: BeltLevel;
  masteredInBelt: number;
  totalInBelt: number;
  readinessScore: number;
  nextMilestone: string;
};

export function summarizeProgression(techniques: Technique[], progress: UserProgress): ProgressionSummary {
  const belt = progress.currentBelt;
  const beltTechniques = techniques.filter((t) => t.belt === belt);
  const masteredInBelt = beltTechniques.filter((t) => progress.learnedTechniqueIds.includes(t.id)).length;
  const totalInBelt = beltTechniques.length;
  const completion = totalInBelt > 0 ? masteredInBelt / totalInBelt : 0;

  const avgRecall = average(beltTechniques.map((t) => progress.reviewStrengthByTechniqueId[t.id] ?? 2));
  const streakBoost = Math.min(20, progress.streakCount);
  const readinessScore = Math.min(100, Math.round(completion * 65 + avgRecall * 5 + streakBoost));

  const nextMilestone =
    readinessScore >= 90
      ? "Promotion check prep"
      : readinessScore >= 70
        ? "Refine timing and pressure"
        : readinessScore >= 50
          ? "Close fundamentals gaps"
          : "Build base reps";

  return { belt, masteredInBelt, totalInBelt, readinessScore, nextMilestone };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}
