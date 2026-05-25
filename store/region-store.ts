import { create } from 'zustand';

interface RegionStore {
  selectedRegionId: string;
  setSelectedRegionId: (regionId: string) => void;
}

export const useRegionStore = create<RegionStore>((set) => ({
  selectedRegionId: '',
  setSelectedRegionId: (regionId) => set({ selectedRegionId: regionId }),
}));
