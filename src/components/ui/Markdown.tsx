"use client";

import clsx from "clsx";
import { Code2, Eye } from "lucide-react";
import { isValidElement, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { useT } from "@/i18n";

/** Renders tutor text and lesson notes: Markdown + LaTeX maths ($…$ / $$…$$). No raw HTML. */
export function Markdown({ children, className = "prose-chat" }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

const COMPONENTS: Components = {
  // ```html blocks (Innovation Lab web projects) get a live preview next to the code
  pre({ children, node: _node, ...rest }) {
    const code = isValidElement<{ className?: string; children?: ReactNode }>(children) ? children.props : null;
    if (code && /\blanguage-html\b/.test(code.className ?? "") && typeof code.children === "string") {
      return <HtmlPreview source={code.children} />;
    }
    return <pre {...rest}>{children}</pre>;
  },
};

/**
 * Shows a student's HTML as a real page. The frame is fully sandboxed (no
 * scripts, no forms, no same-origin access), so it can only display markup.
 */
function HtmlPreview({ source }: { source: string }) {
  const { t } = useT();
  const [tab, setTab] = useState<"preview" | "code">("preview");
  return (
    <div className="not-prose my-3 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-1 border-b border-line bg-cream px-2 py-1.5">
        <span className="mr-1 flex gap-1 px-1" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-coral-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-banana-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-mint-500" />
        </span>
        {(["preview", "code"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            aria-pressed={tab === k}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold transition-colors",
              tab === k ? "bg-white text-brand-600 shadow-soft" : "text-ink-muted hover:text-ink",
            )}
          >
            {k === "preview" ? <Eye size={13} /> : <Code2 size={13} />} {t(k === "preview" ? "lab.preview" : "lab.code")}
          </button>
        ))}
      </div>
      {tab === "preview" ? (
        <iframe title={t("lab.preview")} sandbox="" srcDoc={source} className="block h-72 w-full bg-white" loading="lazy" />
      ) : (
        <pre className="m-0 max-h-72 overflow-auto rounded-none p-3 text-xs">
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}
