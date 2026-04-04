"use client";

import type { ReactNode } from "react";

import { Mascot } from "@/components/Mascot";
import { MascotProvider } from "@/contexts/MascotContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MascotProvider>
      {children}
      <Mascot />
    </MascotProvider>
  );
}
