import { useEffect, useRef } from "react";

/** Closes a slide-over drawer on `Escape`, moves focus into it on open, and restores the trigger on close. */
export function useDrawerA11y(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) {
      if (wasOpen.current && opener.current && document.contains(opener.current)) opener.current.focus();
      wasOpen.current = false;
      opener.current = null;
      return;
    }
    wasOpen.current = true;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return ref;
}
