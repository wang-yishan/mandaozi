"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Eye, EyeOff, Loader2, MessageCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as Resolver<LoginInput>,
    defaultValues: {
      phoneNumber: "",
      password: "",
      rememberMe: true,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const phoneNumber = normalizePhone(values.phoneNumber);

    const { error } = await authClient.signIn.phoneNumber({
      phoneNumber,
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (error) {
      const message =
        error.message ||
        (error.status === 401
          ? "Nomor HP atau password salah, atau nomor belum terverifikasi."
          : "Gagal masuk. Coba lagi.");
      setServerError(message);
      return;
    }

    const target =
      nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : "/home";
    router.push(target);
    router.refresh();
  }

  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Masuk</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Masuk dengan nomor HP dan password.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              autoComplete="current-password"
              placeholder="Masukkan password"
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

        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            {...form.register("rememberMe")}
            className="h-4 w-4 rounded border-[var(--line)]"
          />
          Ingat saya
        </label>

        {serverError && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
          Masuk
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Belum punya akun?{" "}
        <Link
          href={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}
          className="font-bold text-[var(--primary)] hover:underline"
        >
          Daftar dengan nomor HP
        </Link>
      </p>
    </div>
  );
}