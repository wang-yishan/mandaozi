"use client";

import { useEffect, useRef } from "react";
import { createBundleLoader } from "@/lib/load-split-bundle";

// Ordered chunks of the Mandaozi bundle (split from the original single-file
// artifact at AST statement boundaries; concatenation is byte-identical).
const SCRIPTS = [
  "/madara/01-react-vendor.js",
  "/madara/02-icons-jsx.js",
  "/madara/03-data.js",
  "/madara/04-app.js",
  "/madara/05-boot.js",
] as const;

const mountBundle = createBundleLoader(SCRIPTS);

/** Mounts the prebuilt Mandaozi app into `<div id="root">`. */
export function MadaraMount() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/madara/madara.css";
    document.head.appendChild(link);

    if (rootRef.current) {
      void mountBundle(rootRef.current).catch((error: unknown) => {
        console.error("Failed to mount Madara bundle", error);
      });
    }

    return () => link.remove();
  }, []);

  return <div id="root" ref={rootRef} />;
}
