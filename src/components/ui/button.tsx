import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-jost font-medium uppercase tracking-[0.08em] ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-dark rounded-none",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none",
        outline: "border border-primary/30 bg-background text-foreground hover:bg-primary/5 hover:border-primary rounded-none",
        secondary: "bg-accent text-accent-foreground hover:brightness-95 rounded-none",
        ghost: "bg-transparent text-foreground hover:text-accent normal-case tracking-normal rounded-full",
        link: "text-primary underline-offset-4 hover:underline normal-case tracking-normal",
        hero: "bg-primary text-primary-foreground hover:bg-primary-dark rounded-none",
        cta: "bg-primary text-primary-foreground hover:bg-primary-dark rounded-none",
      },
      size: {
        default: "h-11 px-7 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-10 text-sm",
        xl: "h-14 px-12 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
