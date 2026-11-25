import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center text-xs font-semibold text-ink-muted">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-ink transition-colors"
        title="Control Centre Home"
      >
        <Home size={13} />
        <span>Admin</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center">
            <ChevronRight size={13} className="mx-1.5 text-line" />
            {isLast || !item.href ? (
              <span className="text-ink font-bold" aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-ink transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
