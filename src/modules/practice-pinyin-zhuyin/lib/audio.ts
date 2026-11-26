import type { AudioVariant, PlaybackRate } from "../types";

export interface PhonicsAudioRequest {
  text: string;
  variant: AudioVariant;
  rate: PlaybackRate;
  audioSrc?: string;
}

let activeAudio: HTMLAudioElement | null = null;

function stopActive() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakWithSpeechSynthesis({
  text,
  variant,
  rate,
}: PhonicsAudioRequest): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    // Putonghua defaults to zh-CN; Guoyu defaults to zh-TW. Browser voice availability varies.
    u.lang = variant === "guoyu" ? "zh-TW" : "zh-CN";
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  });
}

async function playAudioSrc(src: string, rate: PlaybackRate): Promise<boolean> {
  if (typeof window === "undefined") return false;
  return new Promise((resolve) => {
    const audio = new Audio(src);
    activeAudio = audio;
    audio.playbackRate = rate;
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
      resolve(true);
    };
    audio.onerror = () => {
      if (activeAudio === audio) activeAudio = null;
      resolve(false);
    };
    audio.play().catch(() => {
      if (activeAudio === audio) activeAudio = null;
      resolve(false);
    });
  });
}

export async function playPhonicsAudio(
  req: PhonicsAudioRequest,
): Promise<"asset" | "tts" | "none"> {
  stopActive();
  if (req.audioSrc) {
    const ok = await playAudioSrc(req.audioSrc, req.rate);
    if (ok) return "asset";
  }
  if (req.text) {
    await speakWithSpeechSynthesis(req);
    return "tts";
  }
  return "none";
}

export function stopPhonicsAudio() {
  stopActive();
}

export function getAccentLabel(variant: AudioVariant) {
  return variant === "putonghua" ? "Putonghua (Mainland)" : "Guoyu (Taiwan)";
}
