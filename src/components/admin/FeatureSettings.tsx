"use client";

import clsx from "clsx";
import { Eye, EyeOff, FlaskConical, Swords } from "lucide-react";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { ErrorNote, Spinner } from "@/components/ui/primitives";
import { api, errorMessage } from "@/lib/api";
import type { FeatureId, Features } from "@/lib/features";

const FEATURES: { id: FeatureId; name: string; about: string; icon: typeof Swords }[] = [
  { id: "battle", name: "Progga Battle", about: "Live 1v1 matches, leagues and trophies. Also hides the battle tiles on the profile card.", icon: Swords },
  { id: "lab", name: "AI Innovation Lab", about: "Build-a-project lab where students make things with AI.", icon: FlaskConical },
];

/** Admin: show or hide optional student features for everyone. */
export function FeatureSettings() {
  const { data, mutate } = useSWR<{ features: Features }>("/admin/features");
  const { mutate: globalMutate } = useSWRConfig();
  const { toast } = useCelebrate();
  const [busy, setBusy] = useState<FeatureId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(id: FeatureId) {
    if (!data) return;
    const next = { ...data.features, [id]: !data.features[id] };
    setBusy(id);
    setError(null);
    try {
      await api("/admin/features", { method: "PUT", body: next });
      await mutate({ features: next }, { revalidate: false });
      void globalMutate("/features");
      const name = FEATURES.find((f) => f.id === id)!.name;
      toast(next[id] ? `${name} is now visible to students` : `${name} is now hidden`, next[id] ? "👀" : "🙈", "brand");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card p-6">
      <p className="eyebrow">Admin · Features</p>
      <h2 className="mt-1 text-xl font-extrabold">Show or hide features</h2>
      <p className="mt-1 text-sm text-ink-soft">Hidden features disappear from every student&apos;s menu and their pages can&apos;t be opened. Changes apply within a few seconds.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FEATURES.map(({ id, name, about, icon: Icon }) => {
          const on = !!data?.features[id];
          return (
            <div key={id} className={clsx("flex items-start gap-3 rounded-3xl border-2 p-4", on ? "border-mint-300 bg-mint-50" : "border-line bg-cream")}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-brand-600">
                <Icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-extrabold leading-tight">{name}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{about}</p>
                <p className={clsx("mt-2 flex items-center gap-1 text-xs font-extrabold", on ? "text-mint-700" : "text-ink-muted")}>
                  {on ? <Eye size={13} /> : <EyeOff size={13} />} {data ? (on ? "Visible to students" : "Hidden from students") : "Loading…"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Show ${name}`}
                onClick={() => toggle(id)}
                disabled={!data || busy !== null}
                className={clsx(
                  "relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60",
                  on ? "bg-mint-500" : "bg-ink-muted/40",
                )}
              >
                {busy === id ? (
                  <span className="absolute inset-0 grid place-items-center"><Spinner /></span>
                ) : (
                  <span className={clsx("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-6" : "left-1")} />
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-3">
        <ErrorNote message={error} />
      </div>
    </section>
  );
}
