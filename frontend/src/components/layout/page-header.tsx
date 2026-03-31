import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/6 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </div>
        ) : null}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-[2.15rem]">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
