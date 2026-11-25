"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/primitives";

export default function MfaPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/workspace");
  }, [router]);

  return <PageLoader label="Redirecting to Control Centre..." />;
}
