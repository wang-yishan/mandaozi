"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { completeMasteryCardAction } from "@/app/actions/mastery";
import { useMadaraStore } from "@/store/madara-store";

interface Props {
  learningItemId: string;
  roadmapId?: string | null;
  nodeId?: string | null;
  disabled?: boolean;
  completed?: boolean;
  returnTo?: string;
}

export function MasteryCompleteButton({
  learningItemId,
  roadmapId,
  nodeId,
  disabled,
  completed,
  returnTo,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const completeRoadmapNode = useMadaraStore((s) => s.completeRoadmapNode);

  const onComplete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await completeMasteryCardAction({
          learningItemId,
          roadmapId: roadmapId ?? null,
          nodeId: nodeId ?? null,
        });
        if (!res.ok && res.locked) {
          setError("Node masih terkunci. Selesaikan prerequisite terlebih dahulu.");
          return;
        }
        if (res.missingAssessmentIds.length > 0) {
          setError(
            "Assessment wajib belum lulus. Selesaikan assessment terlebih dahulu.",
          );
        }
        if (roadmapId && nodeId && res.nodeCompleted) {
          completeRoadmapNode(roadmapId, nodeId);
        }
        router.refresh();
        if (res.nextMasteryHref && returnTo) {
          // Stay on page; user can navigate via next action. No auto-redirect.
        }
      } catch (e) {
        console.error(e);
        setError("Gagal menyimpan progress. Coba lagi.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={onComplete}
        disabled={disabled || pending || completed}
        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 font-bold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        {completed ? "Completed" : pending ? "Saving..." : "Mark Done"}
      </button>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
