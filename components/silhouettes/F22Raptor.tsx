import type { SVGProps } from "react";

export function F22Raptor({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 180 56"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M4 32 L90 26 L172 20 L178 28 L172 36 L90 32 L4 36 Z M40 18 L100 24 L72 14 Z M100 34 L150 30 L120 40 Z" />
    </svg>
  );
}
