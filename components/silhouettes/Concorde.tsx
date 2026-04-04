import type { SVGProps } from "react";

export function Concorde({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 220 56"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M8 40 L24 22 L40 18 L200 26 L216 34 L200 40 L40 34 L24 38 Z M8 32 L20 28 L8 30 Z" />
    </svg>
  );
}
