import { useEffect, useState } from "react";

export function probeMarketingImage(src: string): Promise<boolean> {
  return fetch(src, { method: "HEAD" })
    .then((r) => {
      if (!r.ok) return false;
      const type = r.headers.get("content-type") ?? "";
      return type.startsWith("image/") || type.startsWith("video/");
    })
    .catch(() => false);
}

/** null = checking, true = file exists in /public, false = missing (do not render image UI). */
export function useMarketingImageAvailable(src: string | undefined): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!src) {
      setAvailable(false);
      return;
    }
    let cancelled = false;
    setAvailable(null);
    probeMarketingImage(src).then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return available;
}

export function useAnyMarketingImageAvailable(srcs: string[]): boolean | null {
  const [any, setAny] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAny(null);
    Promise.all(srcs.map((s) => probeMarketingImage(s))).then((results) => {
      if (!cancelled) setAny(results.some(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, [srcs.join("|")]);

  return any;
}

/** Probe a set of paths once; avoids mounting empty layout shells while per-image hooks catch up. */
export function useMarketingImagesBatch(srcs: string[]): {
  ready: boolean;
  available: ReadonlySet<string>;
} {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    Promise.all(
      srcs.map(async (src) => [src, await probeMarketingImage(src)] as const),
    ).then((results) => {
      if (cancelled) return;
      setAvailable(new Set(results.filter(([, ok]) => ok).map(([src]) => src)));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [srcs.join("|")]);

  return { ready, available };
}
