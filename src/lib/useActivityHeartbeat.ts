"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "./api";

function extractModule(pathname: string): string {
  if (pathname.startsWith("/tutor")) return "tutor";
  if (pathname.startsWith("/lessons")) return "lesson";
  if (pathname.startsWith("/quiz")) return "quiz";
  if (pathname.startsWith("/battle") || pathname.startsWith("/arena")) return "battle";
  if (pathname.startsWith("/lab")) return "lab";
  return "browse";
}

function extractLessonId(pathname: string): string | undefined {
  const match = pathname.match(/\/lessons\/([^/?#]+)/);
  return match ? match[1] : undefined;
}

function getDeviceCategory(): string {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function useActivityHeartbeat(enabled = true) {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Track user activity
  useEffect(() => {
    if (!enabled) return;

    const onActivity = () => {
      lastInteractionRef.current = Date.now();
    };

    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("scroll", onActivity, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("scroll", onActivity);
    };
  }, [enabled]);

  // Session initiation & recurring heartbeat interval
  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    async function initSession() {
      try {
        const mod = extractModule(pathnameRef.current);
        const lessonId = extractLessonId(pathnameRef.current);
        const res = await api<{ data: { sessionId: string; code: string } }>("/events/session", {
          method: "POST",
          body: {
            deviceCategory: getDeviceCategory(),
            platform: "web",
            module: mod,
            lessonId,
          },
        });
        if (isMounted && res?.data?.sessionId) {
          sessionIdRef.current = res.data.sessionId;
        }
      } catch {
        // Silently retry on next heartbeat or user action
      }
    }

    initSession();

    // Heartbeat every 30 seconds
    const interval = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      // Must have interacted in the last 60 seconds
      if (Date.now() - lastInteractionRef.current > 60_000) return;

      if (!sessionIdRef.current) {
        await initSession();
        return;
      }

      const mod = extractModule(pathnameRef.current);
      const lessonId = extractLessonId(pathnameRef.current);
      const eventId = crypto.randomUUID();

      try {
        await api("/events", {
          method: "POST",
          body: {
            events: [
              {
                eventId,
                eventType: "session_heartbeat",
                occurredAt: new Date().toISOString(),
                sessionId: sessionIdRef.current,
                properties: {
                  module: mod,
                  ...(lessonId && { lessonId }),
                },
              },
            ],
          },
        });
      } catch {
        // Ignore network flakiness
      }
    }, 30_000);

    // Send session_ended via sendBeacon on pagehide
    const onPageHide = () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId || !navigator.sendBeacon) return;

      const eventId = crypto.randomUUID();
      const payload = JSON.stringify({
        events: [
          {
            eventId,
            eventType: "session_ended",
            occurredAt: new Date().toISOString(),
            sessionId,
          },
        ],
      });

      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
    };

    window.addEventListener("pagehide", onPageHide);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [enabled]);
}
