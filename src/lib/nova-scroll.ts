import { create } from "zustand";

export const novaScrollValues = { progress: 0, section: 0, sectionProgress: 0 };

export type NovaScrollState = {
  progress: number;
  section: number;
  sectionProgress: number;
  setScroll: (progress: number, section: number, sectionProgress: number) => void;
};

export const useNovaScroll = create<NovaScrollState>((set) => ({
  progress: 0,
  section: 0,
  sectionProgress: 0,
  setScroll: (progress, section, sectionProgress) =>
    set({ progress, section, sectionProgress }),
}));