import { SignupForm } from "@/features/auth/components/signup-form";

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

  return <SignupForm nextPath={nextPath} />;
}