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
