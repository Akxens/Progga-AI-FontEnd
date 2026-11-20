"use client";

import { FeatureGate } from "@/lib/features";

export default function BattleLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGate feature="battle">{children}</FeatureGate>;
}
