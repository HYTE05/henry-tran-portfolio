import type { SVGProps } from "react";

export function SR71Blackbird({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 48"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M4 28 L140 24 L198 26 L200 28 L140 30 L4 32 Z M50 20 L120 22 L160 24 L50 26 Z" />
    </svg>
  );
}
