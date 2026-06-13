import { useQuery } from "@tanstack/react-query";
import { useRegionStore } from "@/store/region-store";

export function useWorkers() {
  const { selectedRegionId } = useRegionStore();
  const regionId = selectedRegionId;

  return useQuery({
    queryKey: ["workers", regionId],
    queryFn: async () => {
      if (!regionId) return [];
      const res = await fetch(`/api/workers?regionId=${regionId}`);
      if (!res.ok) throw new Error("Failed to fetch workers");
      return res.json();
    },
    enabled: !!regionId,
  });
}
