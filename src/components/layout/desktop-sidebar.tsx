"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSidebarParent, SIDEBAR_NAV } from "@/components/layout/sidebar-nav";
import { P3_PLACEHOLDERS } from "@/modules/catalog";
import { useMadaraStore } from "@/store/madara-store";

export function DesktopSidebar() {
  const pathname = usePathname();
  const collapsed = useMadaraStore((s) => s.sidebarCollapsed);
  const sidebarExpanded = useMadaraStore((s) => s.sidebarExpanded);
  const toggle = useMadaraStore((s) => s.toggleSidebar);
  const toggleGroup = useMadaraStore((s) => s.toggleSidebarGroup);
  const setGroupExpanded = useMadaraStore((s) => s.setSidebarGroupExpanded);
  const activeParent = getSidebarParent(pathname);

  return (
    <aside
      aria-label="Desktop sidebar"
      className="hidden lg:flex flex-col sticky top-0 h-dvh border-r border-[var(--line)] bg-[var(--sidebar)] shrink-0 transition-[width] duration-200"
      style={{
        width: collapsed ? 72 : 260,
        paddingTop: "var(--safe-area-inset-top)",
      }}
    >
      <div className="h-[64px] px-3 flex items-center border-b border-[var(--line)] shrink-0">
        <Link
          href="/home"
          onClick={() => setGroupExpanded("home", true)}
          className="flex items-center gap-2 min-h-[44px] w-full overflow-hidden"
          title="Mandaozi"
        >
          <span className="hanzi text-[28px] font-black leading-none shrink-0 w-[40px] text-center">
            你
          </span>
          {!collapsed && (
            <span className="font-extrabold tracking-[0.22em] text-[14px] whitespace-nowrap">
              Mandaozi
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <nav
          aria-label="Sidebar navigation"
          className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 border-r border-[var(--line)]"
        >
          <div className="space-y-1">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon;
              const isActiveParent = activeParent?.id === item.id;
              const isExpanded = sidebarExpanded[item.id] ?? true;
              const showChildren = !collapsed && isExpanded;

              return (
                <div key={item.id}>
                  <div
                    className={`flex items-center rounded-xl min-h-[44px] transition ${
                      isActiveParent
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "text-[var(--ink)] hover:bg-[var(--bg)]"
                    }`}
                  >
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-current={isActiveParent ? "page" : undefined}
                      onClick={() => {
                        if (!collapsed) setGroupExpanded(item.id, true);
                      }}
                      className="flex-1 flex items-center gap-3 px-3 min-h-[44px] text-left min-w-0"
                    >
                      <Icon size={20} className="shrink-0" />
                      {!collapsed && (
                        <span className="font-semibold text-sm truncate">
                          {item.label}
                        </span>
                      )}
                    </Link>
                    {!collapsed && (
                      <button
                        type="button"
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.label}`}
                        aria-expanded={isExpanded}
                        onClick={() => toggleGroup(item.id)}
                        className="w-9 h-9 mr-1 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <ChevronDown
                          size={16}
                          className="transition-transform"
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "none",
                          }}
                        />
                      </button>
                    )}
                  </div>

                  {showChildren && (
                    <div className="mt-1 ml-4 pl-3 border-l border-[var(--line)] space-y-1">
                      {item.children.map((child) => {
                        const active = pathname === child.href;
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            aria-current={active ? "page" : undefined}
                            className={`w-full flex items-center min-h-[40px] px-3 rounded-lg text-left text-sm transition ${
                              active
                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-semibold"
                                : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                            }`}
                          >
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <div className="space-y-4">
            <div>
              {!collapsed ? (
                <p className="px-3 mb-2 text-[11px] font-black tracking-widest text-[var(--muted)] uppercase">
                  P3 • Coming Soon
                </p>
              ) : (
                <div className="h-px bg-transparent mb-2" />
              )}
              <div className="space-y-1">
                {P3_PLACEHOLDERS.map((p) => {
                  const Icon = p.icon;
                  const isWorldJourney = p.id === "p3-world-journey";
                  const href = isWorldJourney ? "/world" : `/features/${p.id}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={p.id}
                      href={href}
                      title={`${p.source} ${p.label}`}
                      aria-current={active ? "page" : undefined}
                      className={`w-full flex items-center gap-3 rounded-xl min-h-[44px] px-3 text-left transition ${
                        active
                          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Icon size={20} className="shrink-0" />
                      {!collapsed && (
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold truncate">
                            {p.label}
                          </span>
                          <span className="block text-[11px] text-[var(--muted)] truncate">
                            {isWorldJourney
                              ? "Buka World Journey"
                              : `${p.source} Placeholder`}
                          </span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <Link
                href="/features"
                title="All Features"
                aria-current={pathname === "/features" ? "page" : undefined}
                className={`w-full flex items-center gap-3 rounded-xl min-h-[44px] px-3 text-left transition ${
                  pathname === "/features"
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--ink)] hover:bg-[var(--bg)]"
                }`}
              >
                <LayoutGrid size={20} className="shrink-0" />
                {!collapsed && (
                  <span className="font-semibold text-sm">All Features</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-[var(--line)] shrink-0">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl hover:bg-[var(--bg)] text-[var(--muted)]"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && (
            <span className="text-sm font-semibold">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
