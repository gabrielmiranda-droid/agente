import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-[1.05rem] border border-border/80 bg-background/88 px-4 py-2.5 text-sm leading-5 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition duration-200 ring-offset-background placeholder:text-muted-foreground/80 hover:border-border focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60 aria-[invalid=true]:border-rose-500/50 aria-[invalid=true]:focus-visible:ring-rose-500/10 file:border-0 file:bg-transparent file:text-sm file:font-medium [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
