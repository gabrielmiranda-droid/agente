import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ResponsibilityItem = {
  title: string;
  description: string;
  bullets: string[];
  href?: string;
  actionLabel?: string;
  icon?: ReactNode;
  tone?: "neutral" | "dev" | "client";
};

const toneClasses: Record<NonNullable<ResponsibilityItem["tone"]>, string> = {
  neutral: "border-white/8 bg-white/[0.03]",
  dev: "border-sky-500/15 bg-sky-500/[0.06]",
  client: "border-emerald-500/15 bg-emerald-500/[0.06]"
};

export function ResponsibilityGrid({
  title,
  description,
  items,
  columns = 2
}: {
  title: string;
  description?: string;
  items: ResponsibilityItem[];
  columns?: 1 | 2 | 3;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h2>
        {description ? <p className="max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>

      <div
        className={cn(
          "grid gap-4",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-1 xl:grid-cols-2",
          columns === 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        )}
      >
        {items.map((item) => {
          const content = (
            <div
              className={cn(
                "flex h-full flex-col rounded-[1.4rem] border p-5 transition hover:border-white/12 hover:bg-white/[0.05]",
                toneClasses[item.tone ?? "neutral"]
              )}
            >
              <div className="flex items-start gap-3">
                {item.icon ? <div className="mt-0.5 text-slate-300">{item.icon}</div> : null}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {item.href && item.actionLabel ? (
                <span className="mt-5 inline-flex text-sm font-medium text-white">{item.actionLabel}</span>
              ) : null}
            </div>
          );

          return item.href ? (
            <a key={item.title} href={item.href} className="block">
              {content}
            </a>
          ) : (
            <div key={item.title}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
