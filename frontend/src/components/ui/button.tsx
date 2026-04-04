import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[1.05rem] border border-transparent text-sm font-semibold leading-none tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-55 aria-[busy=true]:cursor-wait [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_16px_32px_rgba(249,115,22,0.22)] hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/82",
        outline: "border-white/10 bg-white/[0.03] text-foreground shadow-none hover:border-white/16 hover:bg-white/[0.06]",
        ghost: "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_16px_32px_rgba(220,38,38,0.18)] hover:brightness-105"
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-5",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
