import { Card } from "@/components/ui/card";
import type { RoadmapNodeDef } from "../types/roadmap";

interface Props {
  completion: {
    completed: number;
    total: number;
    percentage: number;
    isCompleted: boolean;
  };
  currentStage: string;
  nextNode: RoadmapNodeDef | null;
}

export function RoadmapProgressOverview({
  completion,
  currentStage,
  nextNode,
}: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-4 sm:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>Overall Progress</span>
          <span className="text-[var(--primary)]">
            {completion.percentage}%
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-[width]"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {completion.completed} of {completion.total} topics completed
        </p>
      </Card>

      <Card className="p-4">
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Completed Topics
        </div>
        <div className="mt-2 text-2xl font-black">{completion.completed}</div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          out of {completion.total} roadmap nodes
        </p>
      </Card>

      <Card className="p-4">
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Current Stage
        </div>
        <div className="mt-2 text-lg font-black leading-snug">
          {currentStage}
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {completion.isCompleted
            ? "Perjalanan dao selesai — roadmap ini telah dikuasai."
            : "Based on your roadmap progress"}
        </p>
      </Card>

      <Card className="p-4">
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {completion.isCompleted ? "Status" : "Next Recommended"}
        </div>
        <div className="mt-2 text-lg font-black leading-snug">
          {completion.isCompleted
            ? "Completed"
            : (nextNode?.title ?? "All done")}
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {completion.isCompleted
            ? "Roadmap selesai. Kamu tetap bisa membukanya kembali."
            : nextNode
              ? nextNode.estimatedDuration
              : "You’ve completed this roadmap"}
        </p>
      </Card>
    </div>
  );
}
