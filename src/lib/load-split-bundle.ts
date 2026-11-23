/**
 * Loads the ordered chunks of a prebuilt bundle into the page, then runs its
 * boot chunk. Shared by the mounts that host the original single-file apps.
 */
export function createBundleLoader(chunks: readonly string[]) {
  const boot = chunks[chunks.length - 1];
  if (!boot) throw new Error("Bundle needs at least a boot chunk");

  let chunksPromise: Promise<void> | null = null;
  let bootedRoot: Element | null = null;

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.body.appendChild(script);
    });
  }

  function ensureChunks(): Promise<void> {
    if (!chunksPromise) {
      chunksPromise = chunks
        .slice(0, -1)
        .reduce(
          (chain, src) => chain.then(() => loadScript(src)),
          Promise.resolve(),
        )
        .catch((error: unknown) => {
          // Allow a later mount to retry after a failed chunk load.
          chunksPromise = null;
          throw error;
        });
    }
    return chunksPromise;
  }

  return async function mount(root: Element): Promise<void> {
    // React StrictMode invokes effects twice on the same element; booting
    // twice would race the chunk loads and create two React roots.
    if (bootedRoot === root) return;
    bootedRoot = root;

    try {
      await ensureChunks();
      await loadScript(`${boot}?t=${Date.now()}`);
    } catch (error) {
      bootedRoot = null;
      throw error;
    }
  };
}
