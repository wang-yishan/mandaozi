"use client";

import { Bell, Globe, Palette, Target, Volume2 } from "lucide-react";
import { type Level, useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";
import { SaveIndicator } from "../ui/save-indicator";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="w-[52px] h-[30px] rounded-full p-1 transition-colors shrink-0"
      style={{ background: checked ? "var(--primary)" : "var(--line)" }}
    >
      <span
        className="block w-[22px] h-[22px] bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(0)" }}
      />
    </button>
  );
}

const LEVELS: Level[] = [
  "Beginner · HSK 1–2",
  "Elementary · HSK 3",
  "Intermediate",
];

export function ProfilePreferencesPage() {
  const s = useMadaraStore();
  return (
    <section className="max-w-[760px] mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-black">Learning Preferences</h1>
          <p className="text-sm text-[var(--muted)]">
            Atur preferensi belajarmu. Perubahan disimpan otomatis.
          </p>
        </div>
        <SaveIndicator />
      </div>
      <PageSubnav />

      <Card className="p-5">
        <h2 className="text-lg font-black flex items-center gap-2">
          <Target size={18} /> Preferensi Belajar
        </h2>
        <div className="mt-4 divide-y divide-[var(--line)]">
          <div className="py-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold">Daily goal</div>
              <div className="text-sm text-[var(--muted)]">
                {s.dailyGoal} menit per hari
              </div>
            </div>
            <div className="flex gap-1">
              {[5, 10, 15].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    s.setDailyGoal(m as 5 | 10 | 15);
                    s.showToast(`Target harian: ${m} menit`);
                  }}
                  className={`min-h-[40px] px-3 rounded-full text-sm font-bold border ${s.dailyGoal === m ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--line)]"}`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="py-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold">HSK target / Level</div>
              <div className="text-sm text-[var(--muted)]">{s.level}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const idx = LEVELS.indexOf(s.level);
                s.setLevel(LEVELS[(idx + 1) % LEVELS.length]);
                s.showToast("Level diperbarui");
              }}
              className="min-h-[40px] px-4 rounded-full border border-[var(--line)] font-bold text-sm"
            >
              Ubah
            </button>
          </div>

          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell size={18} />
              <div>
                <div className="font-bold">Reminders</div>
                <div className="text-sm text-[var(--muted)]">
                  Pengingat belajar harian
                </div>
              </div>
            </div>
            <Toggle
              checked={s.reminders}
              label="Reminders"
              onChange={(v) => {
                s.setReminders(v);
                s.showToast(`Reminders ${v ? "aktif" : "nonaktif"}`);
              }}
            />
          </div>

          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Volume2 size={18} />
              <div>
                <div className="font-bold">Sound</div>
                <div className="text-sm text-[var(--muted)]">
                  Audio pelafalan & efek
                </div>
              </div>
            </div>
            <Toggle
              checked={s.sound}
              label="Sound"
              onChange={(v) => {
                s.setSound(v);
                s.showToast(`Sound ${v ? "aktif" : "nonaktif"}`);
              }}
            />
          </div>

          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe size={18} />
              <div>
                <div className="font-bold">Language</div>
                <div className="text-sm text-[var(--muted)]">{s.language}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                s.toggleLanguage();
                s.showToast("Bahasa diperbarui");
              }}
              className="min-h-[40px] px-4 rounded-full border border-[var(--line)] font-bold text-sm"
            >
              Ganti
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-black flex items-center gap-2">
          <Palette size={18} /> Appearance
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Pilih tampilan yang nyaman.
        </p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {(["light", "dark", "system"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                s.setThemeMode(m);
                s.showToast(`Theme: ${m}`);
              }}
              className={`min-h-[52px] rounded-2xl border font-bold text-sm ${s.themeMode === m ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--line)]"}`}
            >
              {m === "light" ? "Light" : m === "dark" ? "Dark" : "System"}
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
}
