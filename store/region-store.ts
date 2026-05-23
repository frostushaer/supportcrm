import { create } from 'zustand';

interface RegionStore {
  selectedRegionId: string | null;
  setSelectedRegionId: (regionId: string | null) => void;
}

export const useRegionStore = create<RegionStore>((set) => ({
  selectedRegionId: null,
  setSelectedRegionId: (regionId) => set({ selectedRegionId: regionId }),
}));
