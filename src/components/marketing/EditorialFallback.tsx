import { cn } from "@/lib/utils";

type Variant = "light" | "dark" | "warm";

type Props = {
  variant?: Variant;
  className?: string;
};

/** Branded visual panel when a marketing photo is not yet uploaded. No placeholder copy. */
export function EditorialFallback({ variant = "light", className }: Props) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        variant === "dark" && "editorial-fallback-dark",
        variant === "warm" && "editorial-fallback-warm",
        variant === "light" && "editorial-fallback-light",
        className,
      )}
      aria-hidden
    >
      <div className="editorial-fallback-grain absolute inset-0 opacity-[0.35]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-playfair italic text-[clamp(3rem,12vw,7rem)] leading-none select-none pointer-events-none",
            variant === "dark" ? "text-background/[0.07]" : "text-foreground/[0.06]",
          )}
        >
          e
        </span>
      </div>
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[3px]",
          variant === "dark" ? "bg-accent/50" : "bg-accent/70",
        )}
      />
    </div>
  );
}
