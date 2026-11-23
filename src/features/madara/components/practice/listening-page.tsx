"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";

function speak(text: string, sound: boolean, toast: (m: string) => void) {
  if (!sound) {
    toast("Sound mati — aktifkan di Profil.");
    return;
  }
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.82;
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(u);
  } catch {
    toast(`Audio: ${text}`);
  }
}

export function ListeningContent() {
  const sound = useMadaraStore((s) => s.sound);
  const showToast = useMadaraStore((s) => s.showToast);
  const [ans, setAns] = useState<string | null>(null);
  return (
    <Card className="p-5">
      <span className="text-xs font-black tracking-widest text-[var(--primary)]">
        LISTENING
      </span>
      <h3 className="font-bold text-lg mt-2">Dengarkan dan pilih arti</h3>
      <p className="text-sm text-[var(--muted)]">"你好吗？" — apa artinya?</p>
      <button
        type="button"
        onClick={() => speak("你好吗", sound, showToast)}
        className="mt-3 min-h-[44px] px-4 rounded-full border border-[var(--line)] font-bold flex items-center gap-2"
      >
        <Volume2 size={18} /> Putar audio
      </button>
      <div className="grid gap-2 mt-4">
        {["Apa kabar?", "Terima kasih", "Sampai jumpa"].map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => {
              setAns(o);
              showToast(
                o === "Apa kabar?" ? "✓ Benar!" : "Coba dengarkan lagi.",
              );
            }}
            className={`min-h-[48px] rounded-2xl border-2 px-4 text-left font-semibold ${ans === o ? (o === "Apa kabar?" ? "border-[#22A06B] bg-[#EAF6F0]" : "border-[#B42318] bg-[#FFF1F0]") : "border-[var(--line)]"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </Card>
  );
}

export function ListeningPage() {
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Listening</h1>
        <p className="text-[var(--muted)]">
          Latih pendengaran Mandarin dengan audio singkat.
        </p>
      </div>
      <PageSubnav />
      <ListeningContent />
    </section>
  );
}
