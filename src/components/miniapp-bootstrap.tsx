"use client";

import { useEffect, useState } from "react";

export function MiniAppBootstrap() {
  const [status, setStatus] = useState<"booting" | "miniapp" | "web">("booting");

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        await sdk.actions.ready();

        if (!cancelled) {
          setStatus("miniapp");
        }
      } catch {
        if (!cancelled) {
          setStatus("web");
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/60 uppercase">
      <span
        className={
          status === "miniapp"
            ? "h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
            : status === "web"
              ? "h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]"
              : "h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]"
        }
      />
      {status === "miniapp"
        ? "Mini App Session"
        : status === "web"
          ? "Web Preview"
          : "Booting Host"}
    </div>
  );
}
