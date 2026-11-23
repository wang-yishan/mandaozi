"use client";

import { getSidebarParent } from "../../data/sidebar-nav";
import { useMadaraStore } from "../../store/madara-store";
import { Chip } from "../ui/chip";

export function PageSubnav() {
  const page = useMadaraStore((s) => s.page);
  const setPage = useMadaraStore((s) => s.setPage);
  const parent = getSidebarParent(page);
  if (!parent) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {parent.children.map((child) => (
        <Chip
          key={child.id}
          active={page === child.id}
          onClick={() => setPage(child.id)}
        >
          {child.label}
        </Chip>
      ))}
    </div>
  );
}
