"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FormErrors<T> = Partial<Record<keyof T | "_form", string>>;

export interface UseFormOptions<T extends Record<string, any>> {
  initial: T;
  validate?: (values: T) => FormErrors<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initial,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initial);
  const [initialValues, setInitialValues] = useState<T>(initial);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Check dirty state
  const dirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Guard against window unload with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty && !submitting) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Leave anyway?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, submitting]);

  const set = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      delete next._form;
      return next;
    });
  }, []);

  const reset = useCallback((newValues?: T) => {
    const target = newValues ?? initialValues;
    setValues(target);
    setInitialValues(target);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  }, [initialValues]);

  const setServerErrors = useCallback((details?: Record<string, string[] | string | undefined>) => {
    if (!details) return;
    const mapped: FormErrors<T> = {};
    for (const [key, val] of Object.entries(details)) {
      if (val) {
        const msg = Array.isArray(val) ? val[0] : val;
        (mapped as any)[key] = msg;
      }
    }
    setErrors((prev) => ({ ...prev, ...mapped }));
  }, []);

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      setSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err: any) {
        if (err.details) {
          setServerErrors(err.details);
        } else if (err.message) {
          setErrors((prev) => ({ ...prev, _form: err.message }));
        }
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, onSubmit, setServerErrors],
  );

  return {
    values,
    set,
    errors,
    touched,
    dirty,
    submitting,
    submit,
    reset,
    setServerErrors,
  };
}
