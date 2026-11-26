"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Eye, EyeOff, Loader2, MessageCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { completePhoneSignupAction } from "@/features/auth/server/actions";
import {
  otpSchema,
  signupSchema,
  type SignupInput,
} from "@/features/auth/schemas";

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

type Step = "details" | "otp";

export function SignupForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema) as Resolver<SignupInput>,
    defaultValues: {
      name: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const values = form.getValues();

  async function sendOtp(data: SignupInput) {
    setServerError(null);
    setInfo(null);
    setOtpError(null);
    const phoneNumber = normalizePhone(data.phoneNumber);
    const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber });
    if (error) {
      setServerError(error.message || "Gagal mengirim OTP SMS. Coba lagi.");
      return;
    }
    setStep("otp");
    setInfo(`Kode OTP dikirim via SMS ke ${phoneNumber}.`);
  }

  async function onSubmit(data: SignupInput) {
    await sendOtp(data);
  }

  async function onVerifyOtp() {
    setOtpError(null);
    setServerError(null);
    const phoneNumber = normalizePhone(form.getValues("phoneNumber"));
    const parsed = otpSchema.safeParse({ phoneNumber, code: otpCode });
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? "Kode OTP tidak valid");
      return;
    }

    setPending(true);
    try {
      const verify = await authClient.phoneNumber.verify({
        phoneNumber,
        code: parsed.data.code,
      });

      if (verify.error) {
        setOtpError(
          verify.error.message || "Kode OTP salah atau sudah kedaluwarsa.",
        );
        return;
      }

      const complete = await completePhoneSignupAction({
        newPassword: form.getValues("password"),
        name: form.getValues("name"),
      });

      if (!complete.ok) {
        if (complete.error === "PASSWORD_ALREADY_SET") {
          setServerError(
            "Akun dengan nomor ini sudah memiliki password. Silakan masuk.",
          );
          return;
        }
        setServerError(
          complete.error === "UNAUTHORIZED"
            ? "Sesi verifikasi tidak ditemukan. Coba kirim ulang OTP."
            : "Gagal menyimpan password. Coba lagi.",
        );
        return;
      }

      const target =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/home";
      router.push(target);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function resendOtp() {
    const valid = await form.trigger();
    if (!valid) return;
    setPending(true);
    try {
      await sendOtp(form.getValues());
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Daftar</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Buat akun dengan nomor HP dan password.
        </p>
      </div>

      {step === "details" ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Nama</span>
            <input
              {...form.register("name")}
              type="text"
              autoComplete="name"
              placeholder="Nama kamu"
              className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
            />
            {form.formState.errors.name && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {form.formState.errors.name.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
              <MessageCircle size={16} className="text-[var(--primary)]" />
              Nomor HP
            </span>
            <input
              {...form.register("phoneNumber")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+6281234567890"
              className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
            />
            {form.formState.errors.phoneNumber && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {form.formState.errors.phoneNumber.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Password</span>
            <div className="relative">
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 pr-12 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--bg)]"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {form.formState.errors.password.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">
              Konfirmasi password
            </span>
            <input
              {...form.register("confirmPassword")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi password"
              className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </label>

          {serverError && (
            <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
          >
            {form.formState.isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            Kirim Kode SMS
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--muted)]">
            Kami mengirim kode 6 digit via SMS ke{" "}
            <span className="font-bold text-[var(--ink)]">
              {normalizePhone(form.getValues("phoneNumber"))}
            </span>
            .
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Kode OTP</span>
            <input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 text-center text-lg font-bold tracking-[0.3em] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
            />
            {otpError && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {otpError}
              </p>
            )}
          </label>

          {info && (
            <p className="text-xs text-[var(--muted)]">{info}</p>
          )}
          {serverError && (
            <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
              {serverError}
            </div>
          )}

          <button
            type="button"
            onClick={onVerifyOtp}
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
          >
            {pending ? <Loader2 size={18} className="animate-spin" /> : null}
            Verifikasi & Buat Akun
          </button>

          <div className="flex items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setOtpCode("");
                setOtpError(null);
                setServerError(null);
              }}
              className="font-bold text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Ubah nomor
            </button>
            <button
              type="button"
              onClick={resendOtp}
              disabled={pending}
              className="font-bold text-[var(--primary)] hover:underline disabled:opacity-60"
            >
              Kirim ulang OTP
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Sudah punya akun?{" "}
        <Link
          href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
          className="font-bold text-[var(--primary)] hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}