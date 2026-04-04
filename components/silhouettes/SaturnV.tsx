import type { SVGProps } from "react";

export function SaturnV({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 200"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M22 2 L26 2 L32 160 L36 172 L34 198 L14 198 L12 172 L16 160 Z M8 178 L40 178 L38 198 L10 198 Z M10 150 L38 150 L36 160 L12 160 Z" />
    </svg>
  );
}
