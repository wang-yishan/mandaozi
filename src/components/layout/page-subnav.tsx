"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSidebarParent } from "@/components/layout/sidebar-nav";

export function PageSubnav() {
  const pathname = usePathname();
  const parent = getSidebarParent(pathname);
  if (!parent) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {parent.children.map((child) => {
        const active = pathname === child.href;
        return (
          <Link
            key={child.id}
            href={child.href}
            className={`inline-flex items-center min-h-[36px] px-4 rounded-full text-sm font-bold whitespace-nowrap border transition ${
              active
                ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[color:color-mix(in_srgb,var(--primary)_25%,var(--line))]"
                : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
            }`}
          >
            {child.label}
          </Link>
        );
      })}
    </div>
  );
}
