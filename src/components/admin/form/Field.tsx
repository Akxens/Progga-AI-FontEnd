import type { ReactNode } from "react";

export interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, name, required, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-xs font-bold text-ink">
          {label}
          {required && <span className="ml-1 text-coral-600">*</span>}
        </label>
      </div>

      {children}

      {hint && !error && <p className="text-[11px] text-ink-muted">{hint}</p>}

      {error && (
        <p id={`${name}-error`} className="text-xs font-semibold text-coral-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
