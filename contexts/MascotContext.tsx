"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type MascotContextValue = {
  exploreHovered: boolean;
  setExploreHovered: (v: boolean) => void;
  celebrating: boolean;
  setCelebrating: (v: boolean) => void;
};

const MascotContext = createContext<MascotContextValue | null>(null);

export function MascotProvider({ children }: { children: ReactNode }) {
  const [exploreHovered, setExploreHovered] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const value = useMemo(
    () => ({ exploreHovered, setExploreHovered, celebrating, setCelebrating }),
    [exploreHovered, celebrating],
  );
  return (
    <MascotContext.Provider value={value}>{children}</MascotContext.Provider>
  );
}

export function useMascotContext() {
  const ctx = useContext(MascotContext);
  if (!ctx) {
    throw new Error("useMascotContext must be used within MascotProvider");
  }
  return ctx;
}
