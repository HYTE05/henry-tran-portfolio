import type { SVGProps } from "react";

export function SLS({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 72 200"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M32 4 L40 4 L44 168 L48 188 L46 196 L26 196 L24 188 L28 168 Z M12 120 L18 172 L22 196 L10 196 L8 172 Z M54 120 L60 172 L64 196 L52 196 L50 172 Z M26 176 L46 176 L44 196 L28 196 Z" />
    </svg>
  );
}
