export const instant = false;

import { notFound } from "next/navigation";
import {
  CATALOG,
  FeatureDetailView,
  getP3Placeholder,
} from "@/modules/catalog";

export default async function Page({
  params,
}: {
  params: Promise<{ featureId: string }>;
}) {
  const { featureId } = await params;
  const inCatalog = CATALOG.some((c) => c.id === featureId);
  const isP3 = !!getP3Placeholder(featureId);
  if (!inCatalog && !isP3) notFound();
  return <FeatureDetailView featureId={featureId} />;
}
