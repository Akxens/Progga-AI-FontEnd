"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Tabs } from "@/components/admin/display/Tabs";
import { ProviderModelPicker } from "@/components/admin/ai/ProviderModelPicker";
import { VoiceSettings } from "@/components/admin/VoiceSettings";

export default function AdminAiOverviewPage() {
  const [activeTab, setActiveTab] = useState("models");

  const tabs = [
    { id: "models", label: "Models & Tokens" },
    { id: "voice", label: "Speech & Voice" },
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Ask Progga", href: "/admin/ai" },
          { label: "Overview" },
        ]}
      />

      <PageHeader
        title="Ask Progga — AI Intelligence & Voice"
        subtitle="Monitor and control Progga's AI model providers, reasoning engines, and speech synthesis."
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "models" && <ProviderModelPicker />}
        {activeTab === "voice" && <VoiceSettings />}
      </div>
    </div>
  );
}
