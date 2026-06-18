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
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-none",
        secondary:
          "bg-secondary text-secondary-foreground border border-primary/15 hover:bg-secondary-light rounded-none",
        ghost: "bg-transparent text-foreground hover:text-primary normal-case tracking-normal rounded-full",
        link: "text-primary underline-offset-4 hover:underline normal-case tracking-normal",
        hero: "bg-primary text-primary-foreground hover:bg-primary-dark rounded-none shadow-[var(--shadow-md)]",
        cta: "bg-primary text-primary-foreground hover:bg-primary-dark rounded-none shadow-[var(--shadow-md)]",
        heroLight:
          "bg-background text-primary border border-background hover:bg-background/90 rounded-none shadow-[var(--shadow-glow)]",
        heroOutline:
          "border-2 border-background/50 bg-transparent text-background hover:bg-background/10 rounded-none",
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
