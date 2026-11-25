"use client";

import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { VoiceSettings } from "@/components/admin/VoiceSettings";

export default function AdminVoicePage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Ask Progga", href: "/admin/ai" },
          { label: "Voice" },
        ]}
      />

      <PageHeader
        title="Speech & Voice Settings"
        subtitle="Configure the text-to-speech engine and voices Progga uses to speak with students in Bangla and English."
      />

      <div className="mt-4">
        <VoiceSettings />
      </div>
    </div>
  );
}
