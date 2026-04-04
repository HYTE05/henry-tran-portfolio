import type { SVGProps } from "react";

/** Boeing 737 / A320–class tube-and-wing silhouette. */
export function NarrowBodyJet({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 64"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M16 36 L168 32 L188 36 L168 40 L16 36 Z M76 20 L124 28 L76 28 Z M76 40 L124 44 L76 44 Z M4 34 L20 36 L16 38 Z" />
    </svg>
  );
}
