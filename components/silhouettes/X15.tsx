import type { SVGProps } from "react";

export function X15({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 140 48"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M8 32 L120 14 L132 18 L128 26 L20 36 Z M32 22 L96 18 L72 20 Z" />
    </svg>
  );
}
