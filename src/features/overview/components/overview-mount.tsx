"use client";

import { useEffect } from "react";

// Ordered chunks split from ref/source_ver1.html at AST statement boundaries;
// concatenation is byte-identical to the original module script.
const SCRIPTS = [
  "/overview/01-react-vendor.js",
  "/overview/02-icons-jsx.js",
  "/overview/03-data.js",
  "/overview/04-app.js",
  "/overview/05-boot.js",
] as const;

const BOOT = SCRIPTS[SCRIPTS.length - 1];

let scriptsStarted = false;

function loadSequentially(urls: readonly string[], index = 0): void {
  if (index >= urls.length) return;
  const script = document.createElement("script");
  script.src = urls[index];
  script.onload = () => loadSequentially(urls, index + 1);
  script.onerror = () => loadSequentially(urls, index + 1);
  document.body.appendChild(script);
}

/** Mounts the prebuilt Overview app into `<div id="root">`. */
export function OverviewMount() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/overview/overview.css";
    document.head.appendChild(link);

    if (scriptsStarted) {
      const boot = document.createElement("script");
      boot.src = `${BOOT}?remount=${Date.now()}`;
      document.body.appendChild(boot);
    } else {
      scriptsStarted = true;
      loadSequentially(SCRIPTS);
    }

    return () => link.remove();
  }, []);

  return <div id="root" />;
}
