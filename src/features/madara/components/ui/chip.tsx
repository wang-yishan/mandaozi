import type { ButtonHTMLAttributes } from "react";

export function Chip({
  active,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={`min-h-[40px] rounded-full border px-4 text-[13px] font-bold whitespace-nowrap transition ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
          : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--bg)]"
      } ${className}`}
      {...props}
    />
  );
}
