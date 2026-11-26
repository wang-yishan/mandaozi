export const instant = false;

import { redirect } from "next/navigation";
import { legacyPageToHref } from "@/lib/legacy-redirect";

export default async function MadaraPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? sp.page : undefined;
  redirect(legacyPageToHref(page));
}
