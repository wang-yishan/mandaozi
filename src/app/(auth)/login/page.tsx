import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getAuthRegistrationState } from "@/features/auth/server/actions";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : undefined;

  const state = await getAuthRegistrationState();
  if (state.authenticated && state.registrationComplete) {
    redirect(nextPath ?? "/home");
  }
  if (state.authenticated && !state.registrationComplete) {
    const signupPath = nextPath
      ? `/signup?next=${encodeURIComponent(nextPath)}`
      : "/signup";
    redirect(signupPath);
  }

  return <LoginForm nextPath={nextPath} />;
}
