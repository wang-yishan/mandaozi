"use client";

import dynamic from "next/dynamic";

const MadaraApp = dynamic(
  () => import("./madara-app").then((m) => m.MadaraApp),
  {
    ssr: false,
    loading: () => <div className="min-h-[100dvh] bg-[#FAF8F2]" />,
  },
);

export function MadaraClient() {
  return <MadaraApp />;
}
