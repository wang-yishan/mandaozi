"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import {
  otpSchema,
  type SignupCompleteInput,
  type SignupPhoneInput,
  signupCompleteSchema,
  signupPhoneSchema,
} from "@/features/auth/schemas";
import { completePhoneSignupAction } from "@/features/auth/server/actions";
import { authClient } from "@/lib/auth-client";

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

type Step = "phone" | "otp" | "complete";

type SignupFormProps = {
  nextPath?: string;
  initialStep?: Step;
  initialPhoneNumber?: string;
  initialName?: string;
};

function getSafeNext(nextPath?: string) {
  return nextPath?.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/home";
}

function getOtpErrorMessage(message?: string | null) {
  if (!message) return "Kode OTP salah atau sudah kedaluwarsa.";
  const upper = message.toUpperCase();
  if (upper.includes("TOO_MANY_ATTEMPTS")) {
    return "Terlalu banyak percobaan OTP. Tunggu sebentar lalu kirim ulang.";
  }
  if (upper.includes("OTP_EXPIRED")) {
    return "Kode OTP sudah kedaluwarsa. Kirim ulang kode baru.";
  }
  if (upper.includes("INVALID_OTP") || upper.includes("OTP_NOT_FOUND")) {
    return "Kode OTP salah. Periksa kembali kode yang kamu terima.";
  }
  return message;
}

export function SignupForm({
  nextPath,
  initialStep = "phone",
  initialPhoneNumber = "",
  initialName = "",
}: SignupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [phoneNumber, setPhoneNumber] = useState(
    normalizePhone(initialPhoneNumber),
  );
  const [otpCode, setOtpCode] = useState("");
  const [info, setInfo] = useState<string | null>(
    initialStep === "complete"
      ? "Nomor HP sudah terverifikasi. Lengkapi nama dan password untuk menyelesaikan pendaftaran."
      : null,
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const phoneForm = useForm<SignupPhoneInput>({
    resolver: zodResolver(signupPhoneSchema) as Resolver<SignupPhoneInput>,
    defaultValues: {
      phoneNumber: initialPhoneNumber,
    },
  });

  const completeForm = useForm<SignupCompleteInput>({
    resolver: zodResolver(
      signupCompleteSchema,
    ) as Resolver<SignupCompleteInput>,
    defaultValues: {
      name: initialName,
      password: "",
      confirmPassword: "",
    },
  });

  async function sendOtp(rawPhone: string) {
    setServerError(null);
    setOtpError(null);
    setInfo(null);

    const normalizedPhone = normalizePhone(rawPhone);
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: normalizedPhone,
    });

    if (error) {
      setServerError(
        error.message || "Gagal mengirim OTP. Coba lagi beberapa saat.",
      );
      return false;
    }

    setPhoneNumber(normalizedPhone);
    setStep("otp");
    setOtpCode("");
    setInfo(`Kode OTP dikirim ke ${normalizedPhone}.`);
    return true;
  }

  async function onPhoneSubmit(data: SignupPhoneInput) {
    await sendOtp(data.phoneNumber);
  }

  async function onVerifyOtp() {
    setOtpError(null);
    setServerError(null);

    const parsed = otpSchema.safeParse({ phoneNumber, code: otpCode });
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? "Kode OTP tidak valid");
      return;
    }

    setPending(true);
    try {
      const verify = await authClient.phoneNumber.verify({
        phoneNumber: parsed.data.phoneNumber,
        code: parsed.data.code,
      });

      if (verify.error) {
        setOtpError(getOtpErrorMessage(verify.error.message));
        return;
      }

      setStep("complete");
      setInfo(
        "Nomor HP terverifikasi. Lengkapi nama dan password untuk menyelesaikan pendaftaran.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onResendOtp() {
    setPending(true);
    try {
      await sendOtp(phoneNumber);
    } finally {
      setPending(false);
    }
  }

  async function onCompleteSubmit(data: SignupCompleteInput) {
    setServerError(null);
    setPending(true);
    try {
      const complete = await completePhoneSignupAction({
        name: data.name,
        newPassword: data.password,
      });

      if (!complete.ok) {
        if (complete.error === "UNAUTHORIZED") {
          setServerError(
            "Sesi verifikasi habis. Silakan verifikasi ulang nomor HP.",
          );
          setStep("phone");
          return;
        }
        if (complete.error === "PASSWORD_ALREADY_SET") {
          setAlreadyRegistered(true);
          setServerError(
            "Akun dengan nomor ini sudah terdaftar. Silakan masuk.",
          );
          return;
        }
        if (complete.error === "INVALID_PASSWORD") {
          setServerError("Password tidak valid. Gunakan 8-128 karakter.");
          return;
        }
        if (complete.error === "INVALID_NAME") {
          setServerError("Nama tidak valid. Gunakan 2-80 karakter.");
          return;
        }
        setServerError("Gagal menyelesaikan pendaftaran. Coba lagi.");
        return;
      }

      if (complete.alreadyRegistered) {
        setAlreadyRegistered(true);
        setInfo("Akun sudah terdaftar. Silakan masuk dengan nomor HP ini.");
        return;
      }

      router.push(getSafeNext(nextPath));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Daftar</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {step === "phone" && "Masukkan nomor HP untuk mulai mendaftar."}
          {step === "otp" && "Masukkan kode OTP yang dikirim ke nomor HP kamu."}
          {step === "complete" &&
            "Lengkapi data akun untuk menyelesaikan pendaftaran."}
        </p>
      </div>

      <div className="mb-6 flex items-center gap-2 text-xs font-bold">
        {(["phone", "otp", "complete"] as const).map((s, i) => {
          const active = step === s;
          const done =
            (s === "phone" && step !== "phone") ||
            (s === "otp" && step === "complete");
          return (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] ${
                  done
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : active
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </span>
              <span
                className={active ? "text-[var(--ink)]" : "text-[var(--muted)]"}
              >
                {s === "phone" ? "Nomor HP" : s === "otp" ? "OTP" : "Data akun"}
              </span>
              {i < 2 ? <span className="text-[var(--line)]">/</span> : null}
            </div>
          );
        })}
      </div>

      {step === "phone" && (
        <form
          onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
              <MessageCircle size={16} className="text-[var(--primary)]" />
              Nomor HP
            </span>
            <input
              {...phoneForm.register("phoneNumber")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+6281234567890"
              className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
            />
            {phoneForm.formState.errors.phoneNumber && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {phoneForm.formState.errors.phoneNumber.message}
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
            disabled={phoneForm.formState.isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
          >
            {phoneForm.formState.isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            Kirim Kode OTP
          </button>
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--muted)]">
            Kode 6 digit dikirim ke{" "}
            <span className="font-bold text-[var(--ink)]">{phoneNumber}</span>.
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Kode OTP</span>
            <input
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
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

          {info && <p className="text-xs text-[var(--muted)]">{info}</p>}
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
            Verifikasi OTP
          </button>

          <div className="flex items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtpCode("");
                setOtpError(null);
                setServerError(null);
                setInfo(null);
              }}
              className="inline-flex items-center gap-1 font-bold text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <ArrowLeft size={14} /> Ubah nomor
            </button>
            <button
              type="button"
              onClick={onResendOtp}
              disabled={pending}
              className="font-bold text-[var(--primary)] hover:underline disabled:opacity-60"
            >
              Kirim ulang OTP
            </button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <form
          onSubmit={completeForm.handleSubmit(onCompleteSubmit)}
          className="space-y-4"
        >
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--muted)]">
            Nomor HP terverifikasi:{" "}
            <span className="font-bold text-[var(--ink)]">{phoneNumber}</span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Nama</span>
            <input
              {...completeForm.register("name")}
              type="text"
              autoComplete="name"
              placeholder="Nama kamu"
              className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
            />
            {completeForm.formState.errors.name && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {completeForm.formState.errors.name.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Password</span>
            <div className="relative">
              <input
                {...completeForm.register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 pr-12 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--bg)]"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {completeForm.formState.errors.password && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {completeForm.formState.errors.password.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">
              Konfirmasi password
            </span>
            <input
              {...completeForm.register("confirmPassword")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi password"
              className="h-12 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input)] px-4 text-[15px] outline-none focus:border-[var(--primary)] focus:[box-shadow:var(--focus-ring)]"
            />
            {completeForm.formState.errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                {completeForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </label>

          {info && <p className="text-xs text-[var(--muted)]">{info}</p>}
          {serverError && (
            <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
              {serverError}
              {alreadyRegistered ? (
                <>
                  {" "}
                  <Link href={loginHref} className="font-bold underline">
                    Masuk
                  </Link>
                </>
              ) : null}
            </div>
          )}

          <button
            type="submit"
            disabled={
              pending ||
              completeForm.formState.isSubmitting ||
              alreadyRegistered
            }
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
          >
            {pending || completeForm.formState.isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            {alreadyRegistered
              ? "Akun sudah terdaftar"
              : "Selesaikan Pendaftaran"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Sudah punya akun?{" "}
        <Link
          href={loginHref}
          className="font-bold text-[var(--primary)] hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
