"use client";

import { useEffect, useRef } from "react";
import { createBundleLoader } from "@/lib/load-split-bundle";

// Ordered chunks split from ref/source_ver1.html at AST statement boundaries;
// concatenation is byte-identical to the original module script.
const SCRIPTS = [
  "/overview/01-react-vendor.js",
  "/overview/02-icons-jsx.js",
  "/overview/03-data.js",
  "/overview/04-app.js",
  "/overview/05-boot.js",
] as const;

const mountBundle = createBundleLoader(SCRIPTS);

/** Mounts the prebuilt Overview app into `<div id="root">`. */
export function OverviewMount() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/overview/overview.css";
    document.head.appendChild(link);

    if (rootRef.current) {
      void mountBundle(rootRef.current).catch((error: unknown) => {
        console.error("Failed to mount Overview bundle", error);
      });
    }

    return () => link.remove();
  }, []);

  return <div id="root" ref={rootRef} />;
}
