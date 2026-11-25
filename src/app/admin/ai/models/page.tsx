"use client";

import { Breadcrumbs } from "@/components/admin/shell/Breadcrumbs";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { ProviderModelPicker } from "@/components/admin/ai/ProviderModelPicker";

export default function AdminModelsPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Ask Progga", href: "/admin/ai" },
          { label: "Models & Tokens" },
        ]}
      />

      <PageHeader
        title="AI Models & Intelligence"
        subtitle="Manage LLM providers (OpenAI, DeepSeek, Claude, Ollama) and tutor reasoning parameters."
      />

      <div className="mt-4">
        <ProviderModelPicker />
      </div>
    </div>
  );
}
