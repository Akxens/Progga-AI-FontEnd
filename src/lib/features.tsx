"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { PageLoader } from "@/components/ui/primitives";

/** Optional student features an admin can show or hide (Admin → Features). */
export interface Features {
  battle: boolean;
  lab: boolean;
}
export type FeatureId = keyof Features;

/** Hidden until the server says otherwise, so they never flash on screen. */
const HIDDEN: Features = { battle: false, lab: false };

export function useFeatures() {
  const { data } = useSWR<{ features: Features }>("/features", { revalidateOnFocus: false, dedupingInterval: 30_000 });
  return { features: data?.features ?? HIDDEN, loaded: !!data };
}

/** Wraps a feature's pages: sends students home while the feature is hidden. */
export function FeatureGate({ feature, children }: { feature: FeatureId; children: React.ReactNode }) {
  const { features, loaded } = useFeatures();
  const router = useRouter();
  const on = features[feature];

  useEffect(() => {
    if (loaded && !on) router.replace("/home");
  }, [loaded, on, router]);

  if (!on) return <PageLoader />;
  return <>{children}</>;
}
