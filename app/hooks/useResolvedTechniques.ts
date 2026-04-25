import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { ALL_TECHNIQUES, applyGymOverrides, type Technique } from "../data/techniques";
import { useGymStore } from "../store/gym";

export function useResolvedTechniques(): Technique[] {
  const isGymMode = useGymStore((s) => s.isGymMode);
  const localTechniqueOverrides = useGymStore(useShallow((s) => s.techniqueOverrides));
  const localVideoOverrides = useGymStore(useShallow((s) => s.videoOverrides));
  const localCustomTechniques = useGymStore(useShallow((s) => s.customTechniques));
  const linkedGym = useGymStore((s) => s.linkedGym);
  return useMemo(() => {
    const techniqueOverrides = isGymMode ? localTechniqueOverrides : linkedGym?.techniqueOverrides ?? {};
    const videoOverrides = isGymMode ? localVideoOverrides : linkedGym?.videoOverrides ?? {};
    const customTechniques = isGymMode ? localCustomTechniques : linkedGym?.customTechniques ?? [];
    const base = applyGymOverrides(ALL_TECHNIQUES, techniqueOverrides).map((technique) => ({
      ...technique,
      youtubeUrl: videoOverrides[technique.id] ?? technique.youtubeUrl,
    }));
    if (!customTechniques.length) return base;
    const deduped = new Map<string, Technique>();
    for (const item of [...base, ...customTechniques]) {
      deduped.set(item.id, item);
    }
    return Array.from(deduped.values());
  }, [isGymMode, linkedGym, localCustomTechniques, localTechniqueOverrides, localVideoOverrides]);
}

export function useResolvedTechniqueById(id: string | undefined): Technique | undefined {
  const list = useResolvedTechniques();
  return useMemo(() => (id ? list.find((t) => t.id === id) : undefined), [id, list]);
}
