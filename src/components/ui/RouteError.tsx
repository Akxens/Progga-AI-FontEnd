"use client";

import Link from "next/link";
import { ProggaBot } from "@/components/brand/ProggaBot";
import { useT } from "@/i18n";

/** Shared friendly recovery boundary rendered by Next.js `error.tsx` segments. */
export function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { ui } = useT();
  const bn = ui === "bn";
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center">
          <ProggaBot size={140} mood="oops" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">
          {bn ? "কিছু একটা সমস্যা হয়েছে" : "Oops — something bumped into a wire"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {bn ? "চিন্তা নেই, তোমার কাজ নিরাপদ আছে। আবার চেষ্টা করো বা হোমে ফিরে যাও।" : "No worries — your progress is safe. Try reloading this view or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            {bn ? "আবার চেষ্টা করো" : "Try again"}
          </button>
          <Link href="/home" className="btn-ghost">
            {bn ? "হোমে যাও" : "Go home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
