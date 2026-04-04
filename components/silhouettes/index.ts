import type { ComponentType, SVGProps } from "react";

import { Concorde } from "./Concorde";
import { F22Raptor } from "./F22Raptor";
import { NarrowBodyJet } from "./NarrowBodyJet";
import { SaturnV } from "./SaturnV";
import { SR71Blackbird } from "./SR71Blackbird";
import { SLS } from "./SLS";
import { SpaceShuttle } from "./SpaceShuttle";
import { X15 } from "./X15";

export { Concorde } from "./Concorde";
export { F22Raptor } from "./F22Raptor";
export { NarrowBodyJet } from "./NarrowBodyJet";
export { SaturnV } from "./SaturnV";
export { SR71Blackbird } from "./SR71Blackbird";
export { SLS } from "./SLS";
export { SpaceShuttle } from "./SpaceShuttle";
export { X15 } from "./X15";

export type SilhouetteItem = {
  id: string;
  label: string;
  Component: ComponentType<SVGProps<SVGSVGElement>>;
};

export const EXPLORE_SILHOUETTES: SilhouetteItem[] = [
  { id: "sr71", label: "SR-71 Blackbird", Component: SR71Blackbird },
  { id: "saturnv", label: "Saturn V", Component: SaturnV },
  { id: "shuttle", label: "Space Shuttle", Component: SpaceShuttle },
  { id: "f22", label: "F-22 Raptor", Component: F22Raptor },
  { id: "concorde", label: "Concorde", Component: Concorde },
  { id: "sls", label: "SLS", Component: SLS },
  { id: "x15", label: "X-15", Component: X15 },
  { id: "a320", label: "A320 / 737", Component: NarrowBodyJet },
];
