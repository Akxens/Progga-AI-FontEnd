"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 35; // per character while typing
const ERASE_MS = 18; // per character while erasing
const CYCLE_MS = 5000; // a new example roughly every 5 seconds

/**
 * Placeholder text that "types" an example question, holds it, erases it fast and
 * types the next one, about one example every 5 seconds. Pauses while `paused`
 * (e.g. the student is typing). With reduced motion it simply swaps every 5s.
 */
export function useTypingPlaceholder(examples: string[], paused = false): string {
  const [text, setText] = useState(examples[0] ?? "");

  useEffect(() => {
    if (paused || examples.length === 0) return;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((res) => timers.push(setTimeout(res, ms)));

    async function run() {
      let i = 0;
      while (!cancelled) {
        const ex = examples[i % examples.length];
        const start = Date.now();
        if (reduced) {
          setText(ex);
        } else {
          for (let n = 1; n <= ex.length && !cancelled; n++) {
            setText(ex.slice(0, n));
            await wait(TYPE_MS);
          }
        }
        const eraseTime = reduced ? 0 : ex.length * ERASE_MS;
        await wait(Math.max(800, CYCLE_MS - (Date.now() - start) - eraseTime));
        if (!reduced) {
          for (let n = ex.length - 1; n >= 0 && !cancelled; n--) {
            setText(ex.slice(0, n));
            await wait(ERASE_MS);
          }
          await wait(150);
        }
        i++;
      }
    }
    void run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [examples, paused]);

  return text;
}
