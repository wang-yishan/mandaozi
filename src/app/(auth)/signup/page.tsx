import { redirect } from "next/navigation";
import { SignupForm } from "@/features/auth/components/signup-form";
import { getAuthRegistrationState } from "@/features/auth/server/actions";

export const instant = false;

export default async function SignupPage({
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
    return (
      <SignupForm
        nextPath={nextPath}
        initialStep="complete"
        initialPhoneNumber={state.user.phoneNumber ?? ""}
        initialName={
          state.user.name && !state.user.name.startsWith("+")
            ? state.user.name
            : ""
        }
      />
    );
  }

  return <SignupForm nextPath={nextPath} />;
}
