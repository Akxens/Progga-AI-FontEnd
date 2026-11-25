"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { Tabs } from "@/components/admin/display/Tabs";
import { FeatureSettings } from "@/components/admin/FeatureSettings";
import { VoiceSettings } from "@/components/admin/VoiceSettings";
import { ProviderModelPicker } from "@/components/admin/ai/ProviderModelPicker";

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState("ai");

  const tabs = [
    { id: "ai", label: "AI Models & Brain" },
    { id: "features", label: "Feature Flags" },
    { id: "voice", label: "Speech & Voice" },
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "System", href: "/admin/system/config" },
          { label: "Configuration" },
        ]}
      />

      <PageHeader
        title="System Configuration"
        subtitle="Manage global runtime settings, AI intelligence models, audio voices, and feature switches."
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "ai" && <ProviderModelPicker />}
        {activeTab === "features" && <FeatureSettings />}
        {activeTab === "voice" && <VoiceSettings />}
      </div>
    </div>
  );
}
