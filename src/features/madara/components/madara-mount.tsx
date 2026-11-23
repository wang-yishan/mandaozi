"use client";

import { useEffect } from "react";

// Ordered chunks of the Mandaozi bundle (split from the original single-file
// artifact at AST statement boundaries; concatenation is byte-identical).
const SCRIPTS = [
  "/madara/01-react-vendor.js",
  "/madara/02-icons-jsx.js",
  "/madara/03-data.js",
  "/madara/04-app.js",
  "/madara/05-boot.js",
] as const;

const BOOT = SCRIPTS[SCRIPTS.length - 1];

let scriptsStarted = false;

function loadSequentially(urls: readonly string[], index = 0): void {
  if (index >= urls.length) return;
  const script = document.createElement("script");
  script.src = urls[index];
  script.onload = () => loadSequentially(urls, index + 1);
  // Skip failed chunks rather than stalling the chain.
  script.onerror = () => loadSequentially(urls, index + 1);
  document.body.appendChild(script);
}

/** Mounts the prebuilt Mandaozi app into `<div id="root">`. */
export function MadaraMount() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/madara/madara.css";
    document.head.appendChild(link);

    if (scriptsStarted) {
      // Remount after client-side navigation: re-run only the boot chunk
      // against the fresh #root element.
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
