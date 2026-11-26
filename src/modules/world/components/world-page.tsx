"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Lock,
  Volume2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import type { WorldCategory } from "@/modules/world/constants/world";
import { useMadaraStore } from "@/store/madara-store";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function WorldPage({ categories }: { categories: WorldCategory[] }) {
  const selectCategory = useMadaraStore((s) => s.selectWorldCategory);
  const router = useRouter();

  return (
    <section className="max-w-[980px] mx-auto">
      <h1 className="text-[28px] font-black">Your journey</h1>
      <p className="text-[var(--muted)]">
        World 1 · Beginner — one category at a time.
      </p>
      <div className="mt-3">
        <PageSubnav />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
        {[
          "World 1 · Beginner",
          "World 2 · Elementary 🔒",
          "World 3 · Intermediate 🔒",
        ].map((w, i) => (
          <button
            key={w}
            type="button"
            className={`chip whitespace-nowrap ${i === 0 ? "active" : ""}`}
          >
            {w}
          </button>
        ))}
      </div>

      <Card className="p-4 mt-3">
        <div className="flex justify-between font-bold text-sm">
          <span>HSK 1</span>
          <span>4 / 6 lessons</span>
        </div>
        <div className="h-2.5 bg-[var(--line)] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-[var(--primary)]"
            style={{ width: "66%" }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--muted)] mt-2">
          <span>HSK 1 · In progress</span>
          <span>HSK 2 · Locked</span>
        </div>
      </Card>

      <div className="mt-6 relative space-y-3">
        {categories.map((cat, idx) => {
          const status = idx === 0 ? "CURRENT" : idx === 1 ? "NEXT" : "LOCKED";
          return (
            <div
              key={cat.id}
              className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <button
                type="button"
                onClick={() => {
                  selectCategory(cat.id);
                  router.push(`/world/${cat.id}`);
                }}
                className="card w-[78%] sm:w-[62%] p-4 text-left pop"
              >
                <div className="flex justify-between">
                  <span className="hanzi text-2xl">{cat.hanzi}</span>
                  <span className="text-xs font-black bg-[var(--primary-soft)] text-[var(--primary)] px-2 py-1 rounded-full h-fit">
                    {status}
                  </span>
                </div>
                <b className="block mt-1">
                  {idx + 1}. {cat.name}
                </b>
                <p className="text-sm text-[var(--muted)]">{cat.desc}</p>
                <p className="text-xs font-bold mt-2">
                  4 lessons · +{cat.xp} XP
                </p>
              </button>
            </div>
          );
        })}
      </div>

      <Card className="p-4 flex gap-3 items-center mt-4">
        <span className="text-2xl">🗺️</span>
        <div>
          <b>Next milestone: HSK 1 Assessment</b>
          <p className="text-sm text-[var(--muted)]">
            Finish Greetings to unlock it.
          </p>
        </div>
      </Card>
    </section>
  );
}

export function CategoryPage({
  categoryId,
  categories,
}: {
  categoryId?: string;
  categories: WorldCategory[];
}) {
  const storeSelected = useMadaraStore((s) => s.selectedWorldCategoryId);
  const completedLessons = useMadaraStore((s) => s.completedLessons);
  const selectCategory = useMadaraStore((s) => s.selectWorldCategory);
  const startLessonStore = useMadaraStore((s) => s.startWorldLesson);
  const router = useRouter();
  const selectedId = categoryId ?? storeSelected;
  const cat =
    categories.find((c) => c.id === selectedId) ?? categories[0];

  useEffect(() => {
    if (categoryId && categoryId !== storeSelected) selectCategory(categoryId);
  }, [categoryId, selectCategory, storeSelected]);

  if (!cat) return null;

  const startLesson = () => {
    startLessonStore();
    router.push(`/world/${cat.id}/lesson`);
  };

  return (
    <section className="max-w-[900px] mx-auto">
      <button
        type="button"
        onClick={() => router.push("/world")}
        className="flex items-center gap-1 font-bold min-h-[44px]"
      >
        <ArrowLeft size={18} /> Back to World
      </button>
      <div className="mt-1 mb-3">
        <PageSubnav />
      </div>

      <div className="flex gap-4 items-start mt-2">
        <div className="w-[68px] h-[68px] rounded-2xl bg-[var(--primary-soft)] grid place-items-center hanzi text-3xl shrink-0 text-[var(--primary)]">
          {cat.hanzi}
        </div>
        <div>
          <h1 className="text-[28px] font-black leading-tight">{cat.name}</h1>
          <p className="text-[var(--muted)]">{cat.desc}</p>
        </div>
      </div>

      <div className="grid gap-2 mt-5">
        {cat.lessons.map((lesson, idx) => {
          const done = completedLessons.includes(lesson);
          const current = idx === 2;
          const locked = idx === 3;
          return (
            <div key={lesson} className="card p-4 flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-full grid place-items-center shrink-0 font-black"
                style={{
                  background: done
                    ? "var(--primary)"
                    : current
                      ? "var(--vermillion)"
                      : locked
                        ? "var(--line)"
                        : "var(--bar)",
                  color: done || locked ? "white" : "var(--ink)",
                }}
              >
                {done ? (
                  <Check size={18} />
                ) : locked ? (
                  <Lock size={18} />
                ) : current ? (
                  <span
                    className="w-3 h-3 rounded-full bg-white"
                    style={{ animation: "pulseDot 1.4s infinite" }}
                  />
                ) : (
                  idx + 1
                )}
              </span>
              <div className="flex-1 min-w-0">
                <b>{lesson}</b>
                <div className="text-sm text-[var(--muted)]">
                  {done
                    ? "Completed"
                    : current
                      ? "Current · 8 min"
                      : locked
                        ? "Locked — finish Lesson 3 first"
                        : "8 min"}
                </div>
              </div>
              <span className="text-xs font-black">
                +{idx === 3 ? 180 : 120} XP
              </span>
              {!locked && (
                <button
                  type="button"
                  onClick={startLesson}
                  className="btn-ghost !min-h-[40px] px-3 text-sm"
                >
                  {done ? "Review" : "Start"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" onClick={startLesson} className="btn-primary mt-4">
        Start Lesson 3: How are you? →
      </button>
    </section>
  );
}

export function LessonPage({
  categoryId,
  toneOptions,
}: {
  categoryId?: string;
  toneOptions: string[];
}) {
  const router = useRouter();
  const storeSelected = useMadaraStore((s) => s.selectedWorldCategoryId);
  const selectCategory = useMadaraStore((s) => s.selectWorldCategory);
  const step = useMadaraStore((s) => s.lessonStep);
  const pick = useMadaraStore((s) => s.lessonPick);
  const result = useMadaraStore((s) => s.lessonResult);
  const lessonXp = useMadaraStore((s) => s.lessonXp);
  const matched = useMadaraStore((s) => s.lessonMatched);
  const matchPick = useMadaraStore((s) => s.lessonMatchPick);
  const answer = useMadaraStore((s) => s.answerWorldLesson);
  const pickMatch = useMadaraStore((s) => s.pickWorldMatch);
  const nextStore = useMadaraStore((s) => s.nextWorldLessonStep);
  const catId = categoryId ?? storeSelected;

  useEffect(() => {
    if (categoryId && categoryId !== storeSelected) selectCategory(categoryId);
  }, [categoryId, selectCategory, storeSelected]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const canContinue = step === 0 || step === 3 || !!result;
  const next = () => {
    if (step === 4) {
      nextStore();
      router.push(`/world/${catId}/lesson/complete`);
      return;
    }
    nextStore();
  };

  return (
    <section className="max-w-[720px] mx-auto">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(`/world/${catId}`)}
          aria-label="Close lesson"
          className="w-11 h-11 grid place-items-center rounded-full bg-[var(--surface)] border border-[var(--line)] shrink-0"
        >
          <X size={20} />
        </button>
        <div className="flex-1 h-2.5 bg-[var(--line)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
        <span className="font-black text-sm whitespace-nowrap">
          Step {step + 1}/5
        </span>
        <span className="chip !py-1 flex items-center gap-1 !min-h-0">
          <Flame size={14} color="#E45E4F" /> +{lessonXp} XP
        </span>
      </div>

      <p className="text-sm font-bold text-[var(--muted)] mt-3">
        Greetings · Lesson 3 · How are you?
      </p>

      {step === 0 && (
        <div className="card p-6 text-center mt-3">
          <p className="text-xs font-black tracking-widest text-[var(--primary)]">
            NEW CHARACTER
          </p>
          <div className="hanzi text-[96px] leading-none mt-3">大</div>
          <div className="text-2xl font-black mt-2">
            dà <span className="pinyin text-lg">· Tone 4 · falling</span>
          </div>
          <p className="text-[20px] font-bold mt-2">“big”</p>
          <button
            type="button"
            onClick={() => speak("大 dà")}
            className="btn-ghost mx-auto flex items-center gap-2 mt-4 px-5"
          >
            <Volume2 size={18} /> 🔊 Play pronunciation
          </button>
          <div className="text-left bg-[var(--bg)] rounded-2xl p-4 mt-5">
            <b>Example</b>
            <p className="hanzi text-xl mt-1">这是一个大城市。</p>
            <p className="pinyin">Zhè shì yí gè dà chéngshì.</p>
            <p className="text-sm text-[var(--muted)]">This is a big city.</p>
          </div>
          <p className="text-sm text-[var(--muted)] mt-3">
            Tone tip: start high, then drop sharply — like saying “No!”
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="card p-5 mt-3">
          <p className="text-xs font-black tracking-widest text-[var(--primary)]">
            MULTIPLE CHOICE
          </p>
          <h2 className="text-[22px] font-black mt-2">
            What does <span className="hanzi">谢谢</span> mean?
          </h2>
          <div className="grid gap-2 mt-4">
            {["Thank you", "Goodbye", "Hello", "Please"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => answer(opt, "Thank you")}
                className="btn-ghost text-left p-4 text-[16px]"
                style={{
                  borderColor:
                    pick === opt
                      ? result === "correct"
                        ? "var(--primary)"
                        : "var(--vermillion)"
                      : "var(--line)",
                  borderWidth: 2,
                  background:
                    pick === opt && result === "correct"
                      ? "#FDECEC"
                      : pick === opt && result === "wrong"
                        ? "#FFF1F0"
                        : "var(--surface)",
                }}
              >
                {opt} {pick === opt && result === "correct" && "✓"}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-5 mt-3">
          <p className="text-xs font-black tracking-widest text-[var(--primary)]">
            TONE IDENTIFICATION
          </p>
          <h2 className="text-[22px] font-black mt-2">
            Listen and choose the tone.
          </h2>
          <button
            type="button"
            onClick={() => speak("mǎ")}
            className="btn-ghost w-full flex items-center justify-center gap-2 mt-4 py-4"
          >
            <Volume2 size={18} /> Hear “mǎ”
          </button>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {toneOptions.map((opt, idx) => {
              const label = [
                "Tone 1 · high",
                "Tone 2 · rising",
                "Tone 3 · dipping",
                "Tone 4 · falling",
              ][idx];
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => answer(label, "Tone 3 · dipping")}
                  className="card p-4 text-left"
                >
                  <b>{label}</b>
                  <div className="text-sm text-[var(--muted)]">{opt}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-5 mt-3">
          <p className="text-xs font-black tracking-widest text-[var(--primary)]">
            MATCH HANZI TO MEANING
          </p>
          <h2 className="text-[22px] font-black mt-2">
            Tap a Hanzi, then its meaning.
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Matched: {matched.length / 2} / 3
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {["谢谢", "Hello", "你好", "Thank you", "水", "Water"].map(
              (item) => {
                const isMatched = matched.includes(item);
                const isPicked = matchPick === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => pickMatch(item)}
                    className="btn-ghost p-4"
                    style={{
                      background: isMatched
                        ? "#FDECEC"
                        : isPicked
                          ? "var(--primary-soft)"
                          : "var(--surface)",
                      borderColor: isMatched ? "var(--primary)" : "var(--line)",
                      borderWidth: 2,
                    }}
                  >
                    <span
                      className={/[一-鿿]/.test(item) ? "hanzi text-xl" : ""}
                    >
                      {item}
                    </span>{" "}
                    {isMatched && "✓"}
                  </button>
                );
              },
            )}
          </div>
          <p className="text-sm text-[var(--muted)] mt-3">
            Tip: 谢谢 is the polite word you use after someone helps you.
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="card p-5 mt-3">
          <p className="text-xs font-black tracking-widest text-[var(--primary)]">
            LISTENING
          </p>
          <h2 className="text-[22px] font-black mt-2">
            Which Hanzi did you hear?
          </h2>
          <button
            type="button"
            onClick={() => speak("你好")}
            className="btn-primary flex items-center justify-center gap-2 mt-4"
          >
            <Volume2 size={18} /> ▶ Play audio: Nǐ hǎo
          </button>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {["你好", "谢谢", "再见", "水"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => answer(opt, "你好")}
                className="card p-5 hanzi text-3xl text-center"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div
          className="card p-4 mt-3 pop"
          style={{
            background: result === "correct" ? "#FDECEC" : "#FFF1F0",
            borderColor:
              result === "correct" ? "var(--primary)" : "var(--vermillion)",
          }}
        >
          <b className="text-lg text-[var(--ink)]">
            {result === "correct"
              ? "✓ Correct! +20 XP 🎉"
              : "✕ Not quite — let’s look again"}
          </b>
          <p className="text-sm mt-1 text-[var(--ink)]">
            {result === "correct"
              ? "Your ear is getting sharper. Keep going."
              : step === 1
                ? "Correct answer: Thank you — 谢谢 is what you say when someone helps you."
                : step === 2
                  ? "Correct: Tone 3 dips down, then rises — mǎ."
                  : step === 4
                    ? "Correct: 你好 — Nǐ hǎo, hello."
                    : "Correct pairing is in the list above."}
          </p>
          {result === "correct" && (
            <div
              className="text-2xl mt-1"
              style={{ animation: "confetti 1s ease" }}
            >
              ✨ 🎉 ✨
            </div>
          )}
        </div>
      )}

      <div
        className="sticky mt-4"
        style={{ bottom: "calc(88px + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={next}
          disabled={!canContinue}
          className="btn-primary shadow-xl flex items-center justify-center gap-2"
        >
          {step === 0
            ? "I’ve got it — Next"
            : step === 4
              ? "Finish lesson"
              : "Next"}{" "}
          <ArrowRight size={18} />
        </button>
        <p className="text-center text-xs text-[var(--muted)] mt-2">
          {step === 0
            ? "Step 1 is for learning — no answer needed."
            : step === 3
              ? "Finish all 3 pairs to continue."
              : "Choose an answer to continue."}
        </p>
      </div>
    </section>
  );
}

export function CompletePage({ categoryId }: { categoryId?: string }) {
  const router = useRouter();
  const storeSelected = useMadaraStore((s) => s.selectedWorldCategoryId);
  const lessonXp = useMadaraStore((s) => s.lessonXp);
  const lessonCorrect = useMadaraStore((s) => s.lessonCorrect);
  const xp = useMadaraStore((s) => s.xp);
  const earned = lessonXp + 40;
  const catId = categoryId ?? storeSelected;

  return (
    <section className="max-w-[560px] mx-auto text-center pt-4">
      <div className="text-6xl floaty">🎉</div>
      <h1 className="text-[28px] font-black mt-3">Lesson Complete!</h1>
      <p className="text-[var(--muted)]">Greetings · Lesson 3 · How are you?</p>

      <div className="card p-5 mt-5 grid grid-cols-3 gap-2">
        <div>
          <div className="text-2xl font-black text-[var(--primary)]">
            +{earned} XP
          </div>
          <div className="text-xs font-bold text-[var(--muted)]">EARNED</div>
        </div>
        <div>
          <div className="text-2xl font-black">{lessonCorrect}/4</div>
          <div className="text-xs font-bold text-[var(--muted)]">ACCURACY</div>
        </div>
        <div>
          <div className="text-2xl font-black">5</div>
          <div className="text-xs font-bold text-[var(--muted)]">NEW WORDS</div>
        </div>
      </div>

      <div className="card p-4 mt-3 flex items-center gap-3 text-left bg-[var(--primary-soft)]">
        <div className="w-11 h-11 rounded-full bg-[var(--primary)] text-white grid place-items-center hanzi text-xl font-black shrink-0">
          你
        </div>
        <div>
          <b>Level-up check</b>
          <p className="text-sm text-[var(--muted)]">
            You now have {xp.toLocaleString()} XP.{" "}
            {xp >= 1500
              ? "You reached Foundation Stage!"
              : "Keep going to Foundation Stage."}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={() => router.push("/world")}
          className="btn-primary"
        >
          Continue journey →
        </button>
        <button
          type="button"
          onClick={() => router.push(`/world/${catId}`)}
          className="btn-ghost w-full"
        >
          Back to category
        </button>
      </div>
    </section>
  );
}
