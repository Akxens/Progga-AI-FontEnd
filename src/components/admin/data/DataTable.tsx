"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/primitives";

export interface Column<T> {
  key: string;
  header: string;
  sortField?: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  hideable?: boolean;
  defaultHidden?: boolean;
}

export interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  permission?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  disabledReason?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  sort?: string;
  onSort?: (field: string) => void;
  onRowClick?: (r: T) => void;
  rowActions?: (r: T) => Action[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  isLoading?: boolean;
  emptyState: {
    title: string;
    text: string;
    action?: ReactNode;
  };
  stickyFirstColumn?: boolean;
  hiddenColumns?: string[];
}

function ActionMenu({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (actions.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent hover:border-line hover:bg-slate-100 text-ink-soft hover:text-ink transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-2xl border border-line bg-white p-1 shadow-xl">
          {actions.map((act, i) => {
            const Icon = act.icon;
            const isDanger = act.tone === "danger";
            return (
              <button
                key={i}
                type="button"
                disabled={act.disabled}
                title={act.disabled ? act.disabledReason : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  act.onClick();
                }}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none",
                  isDanger
                    ? "text-coral-600 hover:bg-coral-50"
                    : "text-ink hover:bg-slate-100",
                )}
              >
                {Icon && <Icon size={14} className={isDanger ? "text-coral-600" : "text-ink-soft"} />}
                <span className="truncate">{act.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sort,
  onSort,
  onRowClick,
  rowActions,
  selectable,
  selectedIds = [],
  onSelect,
  isLoading,
  emptyState,
  stickyFirstColumn = true,
  hiddenColumns = [],
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.key));

  const allSelected =
    rows.length > 0 && rows.every((r) => selectedIds.includes(rowKey(r)));

  const handleSelectAll = () => {
    if (!onSelect) return;
    if (allSelected) {
      onSelect([]);
    } else {
      onSelect(rows.map(rowKey));
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelect) return;
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((item) => item !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-ink">
          {/* Table Header */}
          <thead className="border-b border-line bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
            <tr>
              {selectable && (
                <th scope="col" className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </th>
              )}

              {visibleColumns.map((col, idx) => {
                const isSticky = stickyFirstColumn && idx === 0 && !selectable;
                const canSort = Boolean(col.sortField && onSort);
                const isSortedAsc = sort === col.sortField;
                const isSortedDesc = sort === `-${col.sortField}`;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={clsx(
                      "px-4 py-3 whitespace-nowrap",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      isSticky && "sticky left-0 z-10 bg-slate-50",
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => onSort!(col.sortField!)}
                        className="group inline-flex items-center gap-1 hover:text-ink focus:outline-hidden"
                      >
                        <span>{col.header}</span>
                        <span className="text-ink-muted group-hover:text-ink">
                          {isSortedAsc ? (
                            <ArrowUp size={13} className="text-brand-600" />
                          ) : isSortedDesc ? (
                            <ArrowDown size={13} className="text-brand-600" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}

              {rowActions && (
                <th scope="col" className="w-12 px-3 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-line/70">
            {isLoading && rows.length === 0 ? (
              // Loading Skeleton Rows
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {selectable && (
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-4 rounded bg-slate-200" />
                    </td>
                  )}
                  {visibleColumns.map((c, cIdx) => (
                    <td key={`skel-c-${cIdx}`} className="px-4 py-3.5">
                      <div className="h-4 rounded bg-slate-200 max-w-[120px]" />
                    </td>
                  ))}
                  {rowActions && <td className="px-3 py-3.5" />}
                </tr>
              ))
            ) : rows.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="px-6 py-14 text-center"
                >
                  <div className="mx-auto max-w-sm">
                    <h3 className="text-sm font-extrabold text-ink">{emptyState.title}</h3>
                    <p className="mt-1 text-xs text-ink-soft">{emptyState.text}</p>
                    {emptyState.action && <div className="mt-4">{emptyState.action}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              rows.map((row) => {
                const id = rowKey(row);
                const isSelected = selectedIds.includes(id);
                const actions = rowActions ? rowActions(row) : [];

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-slate-50/80",
                      isSelected && "bg-brand-50/40",
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(id, e as any)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select row ${id}`}
                          className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {visibleColumns.map((col, idx) => {
                      const isSticky = stickyFirstColumn && idx === 0 && !selectable;
                      return (
                        <td
                          key={col.key}
                          className={clsx(
                            "px-4 py-3 align-middle font-medium",
                            col.align === "right" && "text-right",
                            col.align === "center" && "text-center",
                            isSticky && "sticky left-0 z-10 bg-white font-semibold shadow-xs",
                          )}
                        >
                          {col.render(row)}
                        </td>
                      );
                    })}

                    {rowActions && (
                      <td className="px-3 py-2 text-right align-middle">
                        <ActionMenu actions={actions} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isLoading && rows.length > 0 && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-2xs flex items-center justify-center">
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
}
