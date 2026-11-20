"use client";

import { FeatureGate } from "@/lib/features";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGate feature="lab">{children}</FeatureGate>;
}
