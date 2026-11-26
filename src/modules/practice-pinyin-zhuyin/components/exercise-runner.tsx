"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { isExerciseCorrect } from "../lib/phonics-engine";
import type { Exercise, MatchPair } from "../types";
import { AudioControls } from "./audio-controls";
import { DisplayToggle, usePhonicsLabel } from "./display-toggle";

interface Props {
  exercises: Exercise[];
  mode: "practice" | "quiz";
  onComplete: (result: {
    answers: Record<string, unknown>;
    answerText: Record<string, string>;
    correctIds: string[];
    incorrectIds: string[];
  }) => void;
}

function pairKey(p: MatchPair) {
  return `${p.left}=>${p.right}`;
}

export function ExerciseRunner({ exercises, mode, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<MatchPair[]>([]);
  const [build, setBuild] = useState<{
    initial?: string;
    final?: string;
    tone?: string;
  }>({});
  const label = usePhonicsLabel();

  const ex = exercises[index];
  const total = exercises.length;
  const progress = ((index + (feedback ? 1 : 0)) / total) * 100;

  const resetLocal = () => {
    setFeedback(null);
    setSelectedChoice(null);
    setLeftPick(null);
    setMatched([]);
    setBuild({});
  };

  const submit = (payload: unknown, text: string) => {
    if (!ex || feedback) return;
    const ok = isExerciseCorrect(ex, payload);
    setAnswers((prev) => ({ ...prev, [ex.id]: payload }));
    setAnswerText((prev) => ({ ...prev, [ex.id]: text }));
    setFeedback(ok ? "correct" : "wrong");
  };

  const next = () => {
    if (!ex) return;
    const nextIndex = index + 1;
    if (nextIndex >= total) {
      const finalAnswers = answers;
      const correctIds: string[] = [];
      const incorrectIds: string[] = [];
      for (const e of exercises) {
        const ok = isExerciseCorrect(e, finalAnswers[e.id]);
        if (ok) correctIds.push(e.id);
        else incorrectIds.push(e.id);
      }
      onComplete({
        answers: finalAnswers,
        answerText,
        correctIds,
        incorrectIds,
      });
      return;
    }
    setIndex(nextIndex);
    resetLocal();
  };

  const canSubmitBuild =
    !!build.initial &&
    !!build.final &&
    (!!build.tone || !ex?.build?.toneOptions?.length);

  if (!ex) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-black tracking-widest text-[var(--primary)] uppercase">
            {mode} · {ex.type.replace("-", " ")}
          </div>
          <div className="text-sm text-[var(--muted)]">
            Question {index + 1} of {total}
          </div>
        </div>
        <DisplayToggle />
      </div>
      <div className="h-2.5 bg-[var(--line)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-black">{ex.prompt}</h2>
        <p className="text-sm text-[var(--muted)] mt-1">{ex.promptId}</p>

        {(ex.promptAudioText || ex.promptAudio) && (
          <div className="mt-4">
            <AudioControls
              text={
                ex.promptAudioText ??
                ex.compare?.pinyin ??
                ex.compare?.text ??
                ""
              }
              audio={ex.promptAudio}
              compact
            />
          </div>
        )}

        {ex.type === "sound-compare" && ex.compare && (
          <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="hanzi text-3xl font-black">{ex.compare.text}</div>
            <div className="text-sm font-bold text-[var(--muted)] mt-1">
              {label(ex.compare.pinyin, ex.compare.zhuyin)}
            </div>
            <p className="text-sm mt-2">{ex.compare.focus}</p>
            <p className="text-xs text-[var(--muted)] mt-2">
              Tap Putonghua and Guoyu above, then mark as compared.
            </p>
            {!feedback && (
              <button
                type="button"
                onClick={() =>
                  submit("compared", "Compared Putonghua and Guoyu")
                }
                className="mt-3 min-h-[44px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
              >
                I compared both accents
              </button>
            )}
          </div>
        )}

        {(ex.type === "recognition" || ex.type === "audio-identification") &&
          ex.choices && (
            <div className="grid sm:grid-cols-2 gap-2 mt-4">
              {ex.choices.map((choice) => {
                const active = selectedChoice === choice;
                const correct = ex.correctChoice === choice;
                const show = !!feedback;
                const cls = show
                  ? correct
                    ? "border-[var(--success)] bg-[var(--success-bg)]"
                    : active
                      ? "border-[#B42318] bg-[#FFF1F0]"
                      : "border-[var(--line)] opacity-70"
                  : "border-[var(--line)] hover:border-[var(--primary)]";
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={!!feedback}
                    onClick={() => {
                      setSelectedChoice(choice);
                      submit(choice, choice);
                    }}
                    className={`min-h-[52px] rounded-2xl border-2 px-4 text-left font-semibold bg-[var(--surface)] ${cls}`}
                  >
                    {ex.choiceLabels?.[choice] ?? choice}
                  </button>
                );
              })}
            </div>
          )}

        {ex.type === "matching" && ex.pairs && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--muted)]">Left</div>
              {ex.pairs.map((p) => {
                const used = matched.some((m) => m.left === p.left);
                const active = leftPick === p.left;
                return (
                  <button
                    key={p.left}
                    type="button"
                    disabled={!!feedback || used}
                    onClick={() => setLeftPick(p.left)}
                    className={`w-full min-h-[46px] rounded-xl border px-3 text-left font-semibold ${used ? "bg-[var(--success-bg)] border-[var(--success)]" : active ? "bg-[var(--primary-soft)] border-[var(--primary)]" : "bg-[var(--surface)] border-[var(--line)]"}`}
                  >
                    {p.left}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--muted)]">Right</div>
              {ex.pairs
                .map((p) => p.right)
                .map((right) => {
                  const used = matched.some((m) => m.right === right);
                  return (
                    <button
                      key={right}
                      type="button"
                      disabled={!!feedback || used || !leftPick}
                      onClick={() => {
                        if (!leftPick) return;
                        const nextPairs = [
                          ...matched,
                          { left: leftPick, right },
                        ];
                        setMatched(nextPairs);
                        setLeftPick(null);
                        if (nextPairs.length === (ex.pairs?.length ?? 0)) {
                          const text = nextPairs.map(pairKey).join(", ");
                          submit(nextPairs, text);
                        }
                      }}
                      className={`w-full min-h-[46px] rounded-xl border px-3 text-left font-semibold ${used ? "bg-[var(--success-bg)] border-[var(--success)]" : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--primary)]"}`}
                    >
                      {right}
                    </button>
                  );
                })}
            </div>
            <div className="sm:col-span-2 text-xs text-[var(--muted)]">
              Matched {matched.length}/{ex.pairs.length}
            </div>
          </div>
        )}

        {ex.type === "syllable-build" && ex.build && (
          <div className="mt-4 space-y-3">
            {[
              {
                key: "initial",
                label: "Initial",
                options: ex.build.initialOptions,
              },
              { key: "final", label: "Final", options: ex.build.finalOptions },
              ...(ex.build.toneOptions?.length
                ? [
                    {
                      key: "tone",
                      label: "Tone",
                      options: ex.build.toneOptions,
                    },
                  ]
                : []),
            ].map((group) => (
              <div key={group.key}>
                <div className="text-xs font-bold text-[var(--muted)] mb-1">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => {
                    const active =
                      build[group.key as keyof typeof build] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={!!feedback}
                        onClick={() =>
                          setBuild((b) => ({ ...b, [group.key]: opt }))
                        }
                        className={`min-h-[40px] px-3 rounded-full border font-bold text-sm ${active ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]" : "bg-[var(--surface)] border-[var(--line)]"}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!feedback && (
              <button
                type="button"
                disabled={!canSubmitBuild}
                onClick={() =>
                  submit(
                    build,
                    `${build.initial ?? ""} + ${build.final ?? ""} + ${build.tone ?? ""}`,
                  )
                }
                className="btn-primary !w-auto px-5 disabled:opacity-50"
              >
                Check syllable
              </button>
            )}
            {feedback && (
              <div className="rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3 text-sm">
                <div className="font-bold">
                  Answer: {ex.build.answer.resultPinyin} /{" "}
                  {ex.build.answer.resultZhuyin}{" "}
                  {ex.build.answer.hanzi ? `· ${ex.build.answer.hanzi}` : ""}
                </div>
              </div>
            )}
          </div>
        )}

        {feedback && (
          <div
            className={`mt-4 rounded-2xl border p-4 ${feedback === "correct" ? "bg-[var(--success-bg)] border-[var(--success)]" : "bg-[#FFF1F0] border-[#B42318]"}`}
          >
            <div className="font-black flex items-center gap-2">
              {feedback === "correct" ? (
                <CheckCircle2 size={18} className="text-[var(--success)]" />
              ) : (
                <XCircle size={18} className="text-[#B42318]" />
              )}
              {feedback === "correct" ? "Correct" : "Not quite"}
            </div>
            <p className="text-sm mt-1">{ex.explanation}</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {ex.explanationId}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={next}
          disabled={!feedback}
          className="btn-primary !w-auto px-6 disabled:opacity-50"
        >
          {index + 1 >= total ? "See results" : "Continue"}
        </button>
      </div>
    </div>
  );
}
