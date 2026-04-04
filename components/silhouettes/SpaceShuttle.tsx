import type { SVGProps } from "react";

export function SpaceShuttle({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="currentColor"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M28 52 L58 8 L66 8 L70 52 L68 70 L32 70 Z M70 28 L102 32 L108 48 L72 50 Z M22 48 L8 58 L12 68 L26 58 Z M58 52 L62 52 L62 68 L58 68 Z" />
    </svg>
  );
}
