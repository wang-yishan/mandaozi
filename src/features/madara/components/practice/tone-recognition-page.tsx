"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";

export function ToneQuizContent() {
  const questions = useMemo(
    () => [
      {
        q: "Nada apa untuk “mǎ” (kuda)?",
        options: ["Tone 1", "Tone 2", "Tone 3", "Tone 4"],
        answer: "Tone 3",
      },
      {
        q: "Kata mana yang berarti “terima kasih”?",
        options: ["你好", "谢谢", "再见", "请"],
        answer: "谢谢",
      },
      {
        q: "Nada apa untuk “mā” (ibu)?",
        options: ["Tone 1", "Tone 2", "Tone 3", "Tone 4"],
        answer: "Tone 1",
      },
    ],
    [],
  );
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const addXp = useMadaraStore((s) => s.addXp);
  const showToast = useMadaraStore((s) => s.showToast);
  const q = questions[idx];
  const choose = (o: string) => {
    if (pick) return;
    setPick(o);
    if (o === q.answer) {
      setScore((s) => s + 1);
      addXp(10);
    }
    setTimeout(() => {
      if (idx < questions.length - 1) {
        setIdx(idx + 1);
        setPick(null);
      } else {
        setDone(true);
        showToast("Quiz selesai!");
      }
    }, 650);
  };
  if (done)
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl">🎯</div>
        <h3 className="font-black text-xl mt-2">
          Skor: {score}/{questions.length}
        </h3>
        <button
          type="button"
          onClick={() => {
            setIdx(0);
            setPick(null);
            setScore(0);
            setDone(false);
          }}
          className="mt-4 min-h-[44px] px-4 rounded-full border border-[var(--line)] font-bold"
        >
          <RotateCcw size={16} className="inline mr-1" />
          Coba lagi
        </button>
      </Card>
    );
  return (
    <Card className="p-5">
      <span className="text-xs font-black tracking-widest text-[var(--primary)]">
        TONE RECOGNITION
      </span>
      <h3 className="font-bold text-lg mt-2">
        {idx + 1}. {q.q}
      </h3>
      <div className="grid gap-2 mt-4">
        {q.options.map((o) => {
          const state = !pick
            ? ""
            : o === q.answer
              ? "border-[#22A06B] bg-[#EAF6F0]"
              : o === pick
                ? "border-[#B42318] bg-[#FFF1F0]"
                : "opacity-60";
          return (
            <button
              key={o}
              type="button"
              onClick={() => choose(o)}
              className={`min-h-[52px] rounded-2xl border-2 border-[var(--line)] px-4 text-left font-semibold ${state}`}
            >
              {o}{" "}
              {pick && o === q.answer && <Check size={16} className="inline" />}{" "}
              {pick && o === pick && o !== q.answer && (
                <X size={16} className="inline" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function ToneRecognitionPage() {
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Tone Recognition</h1>
        <p className="text-[var(--muted)]">
          Kenali nada Mandarin lewat kuis singkat.
        </p>
      </div>
      <PageSubnav />
      <ToneQuizContent />
    </section>
  );
}
