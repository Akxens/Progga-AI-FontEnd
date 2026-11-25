"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown, Search, Upload, X } from "lucide-react";
import clsx from "clsx";
import { adminApi } from "@/lib/admin/api";
import { Spinner } from "@/components/ui/primitives";
import type { LookupItem } from "@/lib/admin/types";

// ── 1. TextField ──────────────────────────────────────────
export interface TextFieldProps {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  type?: "text" | "email" | "tel" | "url" | "password";
  error?: boolean;
}

export function TextField({
  name,
  value,
  onChange,
  onBlur,
  maxLength,
  placeholder,
  disabled,
  readOnly,
  type = "text",
  error,
}: TextFieldProps) {
  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={clsx(
          "w-full rounded-xl border bg-white px-3 py-2 text-xs font-medium text-ink focus:outline-hidden disabled:bg-slate-50 disabled:opacity-60",
          error
            ? "border-coral-400 focus:border-coral-500"
            : "border-line focus:border-brand-500",
        )}
      />
      {maxLength && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-muted">
          {(value ?? "").length}/{maxLength}
        </span>
      )}
    </div>
  );
}

// ── 2. TextareaField ──────────────────────────────────────
export interface TextareaFieldProps {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function TextareaField({
  name,
  value,
  onChange,
  onBlur,
  maxLength,
  rows = 3,
  placeholder,
  disabled,
  readOnly,
  error,
}: TextareaFieldProps) {
  return (
    <div className="relative">
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={clsx(
          "w-full rounded-xl border bg-white p-3 text-xs font-medium text-ink focus:outline-hidden disabled:bg-slate-50 disabled:opacity-60 resize-y",
          error
            ? "border-coral-400 focus:border-coral-500"
            : "border-line focus:border-brand-500",
        )}
      />
      {maxLength && (
        <div className="text-right text-[10px] text-ink-muted mt-0.5">
          {(value ?? "").length}/{maxLength}
        </div>
      )}
    </div>
  );
}

// ── 3. NumberField ────────────────────────────────────────
export interface NumberFieldProps {
  name: string;
  value: number | string;
  onChange: (val: number | string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function NumberField({
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  disabled,
}: NumberFieldProps) {
  return (
    <input
      id={name}
      name={name}
      type="number"
      min={min}
      max={max}
      step={step}
      value={value ?? ""}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden disabled:bg-slate-50 disabled:opacity-60"
    />
  );
}

// ── 4. MoneyField ─────────────────────────────────────────
export interface MoneyFieldProps {
  name: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MoneyField({ name, value, onChange, placeholder = "0.00", disabled }: MoneyFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    onChange(raw);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">৳</span>
      <input
        id={name}
        name={name}
        type="text"
        inputMode="decimal"
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        className="w-full rounded-xl border border-line bg-white pl-7 pr-3 py-2 text-xs font-mono font-bold text-ink focus:border-brand-500 focus:outline-hidden disabled:bg-slate-50 disabled:opacity-60"
      />
    </div>
  );
}

// ── 5. SelectField ────────────────────────────────────────
export interface SelectFieldProps {
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled,
}: SelectFieldProps) {
  return (
    <select
      id={name}
      name={name}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden disabled:bg-slate-50 disabled:opacity-60 cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── 6. SwitchField ────────────────────────────────────────
export interface SwitchFieldProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function SwitchField({ name, checked, onChange, label, disabled }: SwitchFieldProps) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
          checked ? "bg-brand-600" : "bg-slate-300",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span
          className={clsx(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
      {label && <span className="text-xs font-semibold text-ink">{label}</span>}
    </label>
  );
}

// ── 7. DateField ──────────────────────────────────────────
export interface DateFieldProps {
  name: string;
  value: string;
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export function DateField({ name, value, onChange, min, max, disabled }: DateFieldProps) {
  return (
    <input
      id={name}
      name={name}
      type="date"
      min={min}
      max={max}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden disabled:bg-slate-50 disabled:opacity-60"
    />
  );
}

// ── 8. AsyncSelect ────────────────────────────────────────
export interface AsyncSelectProps {
  lookup: string;
  params?: Record<string, string>;
  value: string;
  valueLabel?: string;
  onChange: (val: string, option?: LookupItem) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AsyncSelect({
  lookup,
  params,
  value,
  valueLabel,
  onChange,
  placeholder = "Search and select...",
  disabled,
}: AsyncSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchItems = (searchQ: string) => {
    setLoading(true);
    const qp = new URLSearchParams(params);
    if (searchQ) qp.set("q", searchQ);
    const qs = qp.toString();
    const endpoint = `/admin/lookups/${lookup}${qs ? `?${qs}` : ""}`;

    adminApi<{ data: LookupItem[] }>(endpoint)
      .then((res) => {
        setItems(res.data || []);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      fetchItems("");
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSearchChange = (q: string) => {
    setQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchItems(q);
    }, 250);
  };

  const selectedItem = items.find((i) => i.value === value);
  const displayLabel = selectedItem?.label || valueLabel || (value ? `Selected (${value})` : placeholder);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          "flex w-full items-center justify-between rounded-xl border border-line bg-white px-3 py-2 text-left text-xs font-medium text-ink focus:border-brand-500 focus:outline-hidden shadow-2xs",
          !value && "text-ink-muted",
          disabled && "bg-slate-50 opacity-60 cursor-not-allowed",
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown size={14} className={clsx("text-ink-muted transition-transform shrink-0 ml-2", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-full rounded-2xl border border-line bg-white p-2 shadow-xl">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-line bg-slate-50 py-1 pl-8 pr-2 text-xs focus:outline-hidden"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {loading ? (
              <div className="py-4 text-center">
                <Spinner size={16} />
              </div>
            ) : items.length === 0 ? (
              <div className="py-3 text-center text-xs text-ink-muted">No items found</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value, item);
                    setOpen(false);
                  }}
                  className={clsx(
                    "w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors truncate",
                    item.value === value
                      ? "bg-brand-50 text-brand-700 font-bold"
                      : "text-ink hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 9. FileField ──────────────────────────────────────────
export interface FileFieldProps {
  accept?: string;
  maxBytes?: number;
  multiple?: boolean;
  purpose?: "evidence" | "material" | "import" | "consent";
  onUploaded: (fileIds: string[]) => void;
  disabled?: boolean;
}

export function FileField({
  accept = ".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.docx",
  maxBytes = 20 * 1024 * 1024,
  multiple = false,
  purpose = "evidence",
  onUploaded,
  disabled,
}: FileFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxBytes) {
        setError(`File ${files[i].name} exceeds maximum size of ${(maxBytes / (1024 * 1024)).toFixed(0)} MB`);
        return;
      }
    }

    setUploading(true);
    const uploadedIds: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("purpose", purpose);

        const res = await adminApi<{ data: { id: string } }>("/admin/files", {
          method: "POST",
          form: formData,
        });
        uploadedIds.push(res.data.id);
      }
      onUploaded(uploadedIds);
    } catch (err: any) {
      setError(err.message || "Failed to upload file(s)");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={clsx(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-slate-50/60 p-6 text-center transition-colors cursor-pointer hover:bg-slate-50 hover:border-brand-300",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || uploading}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {uploading ? <Spinner size={18} /> : <Upload size={18} />}
        </div>

        <p className="text-xs font-bold text-ink">
          {uploading ? "Uploading files..." : "Click to select and upload file"}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-muted">
          Max {(maxBytes / (1024 * 1024)).toFixed(0)} MB · Whitelisted formats
        </p>
      </div>

      {error && <p className="text-xs font-semibold text-coral-600">{error}</p>}
    </div>
  );
}
