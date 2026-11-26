import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireServerSession } from "@/lib/auth-session";

export const instant = false;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireServerSession();
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAF8F2]" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
