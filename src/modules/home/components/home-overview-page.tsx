"use client";

import { PageSubnav } from "@/components/layout/page-subnav";
import { HomeDashboard } from "./dashboard/home-dashboard";

export function HomeOverviewPage() {
  return (
    <section className="space-y-4">
      <PageSubnav />
      <HomeDashboard />
    </section>
  );
}
