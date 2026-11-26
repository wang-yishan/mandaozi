import {
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";

const ITEMS = [
  { label: "Completed", icon: CheckCircle2, color: "var(--success)" },
  { label: "In Progress", icon: PlayCircle, color: "var(--primary)" },
  { label: "Available", icon: BookOpen, color: "var(--muted)" },
  { label: "Locked", icon: Lock, color: "var(--muted)" },
  { label: "Recommended", icon: Sparkles, color: "var(--primary)" },
] as const;

export function RoadmapLegend() {
  return (
    <section className="flex flex-wrap gap-2" aria-label="Roadmap legend">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--muted)]"
          >
            <Icon size={14} style={{ color: item.color }} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </section>
  );
}
