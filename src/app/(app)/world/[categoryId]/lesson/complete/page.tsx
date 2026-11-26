export const instant = false;

import { CompletePage } from "@/modules/world";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  return <CompletePage categoryId={categoryId} />;
}
