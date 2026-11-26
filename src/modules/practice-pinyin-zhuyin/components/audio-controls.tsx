"use client";

import { Pause, Play, RotateCcw, Turtle, Volume2 } from "lucide-react";
import { useState } from "react";
import {
  getAccentLabel,
  playPhonicsAudio,
  stopPhonicsAudio,
} from "../lib/audio";
import { usePhonicsStore } from "../store";
import type { AudioVariant } from "../types";

interface Props {
  text: string;
  audio?: Partial<Record<AudioVariant, string>>;
  compact?: boolean;
}

export function AudioControls({ text, audio, compact = false }: Props) {
  const accent = usePhonicsStore((s) => s.selectedAccent);
  const rate = usePhonicsStore((s) => s.playbackRate);
  const setAccent = usePhonicsStore((s) => s.setAccent);
  const setRate = usePhonicsStore((s) => s.setPlaybackRate);
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState<"asset" | "tts" | "none" | null>(null);

  const play = async (variant: AudioVariant, playRate = rate) => {
    setPlaying(true);
    const result = await playPhonicsAudio({
      text,
      variant,
      rate: playRate,
      audioSrc: audio?.[variant],
    });
    setSource(result);
    setPlaying(false);
  };

  return (
    <div
      className={`rounded-2xl border border-[var(--line)] bg-[var(--bg)] ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => play(accent, rate)}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />} Play
        </button>
        <button
          type="button"
          onClick={() => play(accent, rate)}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold text-sm"
        >
          <RotateCcw size={16} /> Replay
        </button>
        <button
          type="button"
          onClick={() => {
            const next = rate === 1 ? 0.75 : 1;
            setRate(next);
            play(accent, next);
          }}
          className={`inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full border font-bold text-sm ${
            rate === 0.75
              ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]"
              : "border-[var(--line)] bg-[var(--surface)]"
          }`}
        >
          <Turtle size={16} /> Slow {rate === 0.75 ? "On" : "Off"}
        </button>
        <button
          type="button"
          onClick={() => {
            stopPhonicsAudio();
            setPlaying(false);
          }}
          className="inline-flex items-center gap-2 min-h-[40px] px-3 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold text-sm"
        >
          Stop
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs font-bold text-[var(--muted)] inline-flex items-center gap-1">
          <Volume2 size={14} /> Compare:
        </span>
        {(["putonghua", "guoyu"] as AudioVariant[]).map((v) => {
          const active = accent === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => {
                setAccent(v);
                play(v, rate);
              }}
              className={`min-h-[36px] px-3 rounded-full text-xs font-bold border transition ${
                active
                  ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]"
                  : "bg-[var(--surface)] border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {getAccentLabel(v)}
            </button>
          );
        })}
      </div>
      {source === "tts" && (
        <p className="text-[11px] text-[var(--muted)] mt-2">
          Using device TTS fallback. For true accent comparison, add curated
          audio assets.
        </p>
      )}
    </div>
  );
}
