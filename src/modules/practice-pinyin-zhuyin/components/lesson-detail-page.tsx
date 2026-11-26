"use client";

import { ArrowLeft, BookOpen, Headphones, PlayCircle } from "lucide-react";
import Link from "next/link";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import type {
  PhonicsLesson,
  PhonicsRule,
  PhonicsScope,
  PhonicsSymbol,
} from "../types";
import { AudioControls } from "./audio-controls";
import { DisplayToggle, usePhonicsLabel } from "./display-toggle";

export function LessonDetailPage({
  scope,
  lesson,
  symbols,
  rules,
}: {
  scope: PhonicsScope;
  lesson: PhonicsLesson;
  symbols: PhonicsSymbol[];
  rules: PhonicsRule[];
}) {
  const label = usePhonicsLabel();

  return (
    <section className="max-w-[1100px] mx-auto space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            href={`/practice/pinyin-zhuyin/${scope}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={16} /> Back to {scope}
          </Link>
          <h1 className="text-[30px] font-black mt-1">{lesson.title}</h1>
          <p className="text-[var(--muted)]">{lesson.summary}</p>
          <p className="text-sm text-[var(--muted)] mt-1">{lesson.summaryId}</p>
        </div>
        <DisplayToggle />
      </div>
      <PageSubnav />

      <div className="grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
        <Card className="p-5">
          <div className="text-xs font-black tracking-widest text-[var(--primary)] uppercase">
            Objectives
          </div>
          <ul className="mt-3 space-y-2">
            {lesson.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm">
                <span className="mt-1 w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />{" "}
                {o}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href={`/practice/pinyin-zhuyin/${scope}/${lesson.id}/practice`}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
            >
              <PlayCircle size={16} /> Start Practice
            </Link>
            <Link
              href={`/practice/pinyin-zhuyin/${scope}/${lesson.id}/quiz`}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold"
            >
              <BookOpen size={16} /> Take Quiz
            </Link>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-black tracking-widest text-[var(--muted)] uppercase">
            Lesson Info
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Estimated</span>
              <span className="font-bold">{lesson.estimatedMin} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Reward</span>
              <span className="font-bold">+{lesson.xpReward} XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Exercises</span>
              <span className="font-bold">{lesson.exerciseIds.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Quiz items</span>
              <span className="font-bold">{lesson.quizExerciseIds.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Headphones size={18} className="text-[var(--primary)]" />
          <h2 className="text-lg font-black">Audio Guide</h2>
        </div>
        <p className="text-sm text-[var(--muted)] mb-3">
          Play, replay, slow down, or compare Putonghua and Guoyu. Switch
          display mode anytime.
        </p>
        <AudioControls
          text={symbols[0]?.examples[0]?.hanzi ?? lesson.title}
          audio={symbols[0]?.examples[0]?.audio}
        />
      </Card>

      <div>
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl font-black">
              {scope === "zhuyin"
                ? "Kartu Bopomofo per Karakter"
                : "Symbol Chart"}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {scope === "zhuyin"
                ? "Satu kartu per karakter Zhuyin untuk membantu mengenali bentuk, bunyi, dan padanan Pinyin."
                : "Satu kartu per simbol untuk mengenali bentuk, bunyi, dan contoh pemakaian."}
            </p>
          </div>
          <div className="text-xs font-bold text-[var(--muted)]">
            {symbols.length} karakter
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {symbols.map((s) => {
            const hero =
              scope === "zhuyin"
                ? (s.zhuyin ?? s.label)
                : (s.pinyin ?? s.label);
            const secondary = scope === "zhuyin" ? s.pinyin : s.zhuyin;
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">
                      {s.group}
                    </div>
                    <div className="mt-2 flex items-end gap-2">
                      <div className="hanzi text-5xl leading-none font-black text-[var(--ink)]">
                        {hero}
                      </div>
                      {secondary && (
                        <div className="mb-1 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-black text-[var(--primary)]">
                          {secondary}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wide">
                      {s.kind}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[var(--muted)]">
                    {s.pinyin && (
                      <div>
                        Pinyin:{" "}
                        <span className="font-bold text-[var(--ink)]">
                          {s.pinyin}
                        </span>
                      </div>
                    )}
                    {s.zhuyin && (
                      <div>
                        Zhuyin:{" "}
                        <span className="font-bold text-[var(--ink)]">
                          {s.zhuyin}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm mt-3">{s.description}</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {s.descriptionId}
                </p>

                <div className="mt-3 space-y-2">
                  {s.examples.slice(0, 2).map((ex) => (
                    <div
                      key={ex.hanzi + ex.pinyin}
                      className="rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="hanzi text-xl font-black">
                            {ex.hanzi}
                          </div>
                          <div className="text-sm font-bold text-[var(--muted)]">
                            {label(ex.pinyin, ex.zhuyin)}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            {ex.glossEn} · {ex.glossId}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div id={`audio-${s.id}`} className="mt-3">
                  <AudioControls
                    text={s.examples[0]?.hanzi ?? s.label}
                    audio={s.examples[0]?.audio}
                    compact
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {rules.length > 0 && (
        <div>
          <h2 className="text-xl font-black mb-3">Rules & Tips</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {rules.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="font-black">{r.title}</div>
                <div className="text-sm text-[var(--muted)]">{r.titleId}</div>
                <p className="text-sm mt-2">{r.explanation}</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {r.explanationId}
                </p>
                <div className="mt-3 space-y-1">
                  {r.examples.map((ex) => (
                    <div key={ex.hanzi + ex.pinyin} className="text-sm">
                      <span className="hanzi font-bold">{ex.hanzi}</span>{" "}
                      <span className="text-[var(--muted)]">
                        {label(ex.pinyin, ex.zhuyin)} — {ex.glossEn}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
