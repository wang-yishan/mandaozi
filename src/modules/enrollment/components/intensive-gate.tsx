"use client";

import { X } from "lucide-react";
import { useMadaraStore } from "@/store/madara-store";

export function EnrollmentModal() {
  const open = useMadaraStore((s) => s.enrollmentModalOpen);
  const detail = useMadaraStore((s) => s.enrollmentDetailOpen);
  const setOpen = useMadaraStore((s) => s.setEnrollmentModalOpen);
  const setDetail = useMadaraStore((s) => s.setEnrollmentDetailOpen);
  if (!open && !detail) return null;

  const close = () => {
    setOpen(false);
    setDetail(false);
  };

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: backdrop overlay */}
      <div
        className="fixed inset-0 z-[80] bg-black/45 grid items-end sm:items-center justify-items-center p-0 sm:p-4"
        role="button"
        tabIndex={0}
        aria-label="Tutup modal"
        onClick={close}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") close();
        }}
      >
        <div
          className="bg-[var(--surface)] w-full max-w-[640px] max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] p-6"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start gap-3">
            <h2 className="text-[22px] font-black">
              {detail ? "Detail Program" : "Enroll / Contact Support"}
            </h2>
            <button
              type="button"
              onClick={close}
              className="w-10 h-10 rounded-full bg-[var(--bg)] grid place-items-center"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
          </div>

          {detail ? (
            <div className="mt-3 space-y-3 text-sm text-[var(--muted)]">
              <p>
                The 3-Month Intensive Mandarin Class is a paid program with live
                sessions, assignments, and assessments.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <b className="text-[var(--ink)]">Program duration:</b> 3
                  months
                </li>
                <li>
                  <b className="text-[var(--ink)]">Status:</b> Inactive — you
                  are not currently enrolled
                </li>
                <li>
                  <b className="text-[var(--ink)]">
                    Program start / end / batch:
                  </b>{" "}
                  — (not assigned)
                </li>
              </ul>
              <p>
                Enrollment is not completed inside this app. Contact MADARA
                support through your usual enrollment channel for pricing,
                batches, and availability.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3 text-sm text-[var(--muted)]">
              <p>You are not currently enrolled in the Intensive Program.</p>
              <p>
                To enroll or ask about availability, contact MADARA support
                through your usual enrollment channel. No checkout, payment, or
                enrollment is created by this demo.
              </p>
              <div className="rounded-2xl bg-[var(--bg)] p-4">
                <p className="font-bold text-[var(--ink)]">
                  What to ask support
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Available batches and start date</li>
                  <li>Pricing and payment options</li>
                  <li>Placement level and schedule</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function IntensiveGateCard() {
  const setModal = useMadaraStore((s) => s.setEnrollmentModalOpen);
  const setDetail = useMadaraStore((s) => s.setEnrollmentDetailOpen);
  return (
    <div className="rounded-[20px] border border-[#F3C2C2] bg-[#FDECEC] p-5 mt-4">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-xs font-black tracking-widest text-[var(--primary)]">
            ENROLLMENT GATE
          </p>
          <h2 className="text-[20px] font-black mt-1">No Active Enrollment</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            The 3-Month Intensive Mandarin Class is a paid program. You are not
            currently enrolled.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#E8E3D9] px-3 py-1 text-xs font-bold">
          Status: Inactive
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        {[
          ["Program Start", "—"],
          ["Program End", "—"],
          ["Batch", "—"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl p-3">
            <div className="font-black text-sm">{k}</div>
            <div className="text-sm text-[var(--muted)] mt-0.5">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          onClick={() => setDetail(true)}
          className="min-h-[48px] rounded-full bg-[var(--primary)] text-white font-bold text-sm"
        >
          View Program Details
        </button>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="min-h-[48px] rounded-full border border-[var(--line)] bg-white font-bold text-sm"
        >
          Enroll / Contact Support
        </button>
      </div>
    </div>
  );
}
