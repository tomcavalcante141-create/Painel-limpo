import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-inset text-fg",
        outline: "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_16%,transparent)] text-muted",
        primary: "bg-primary text-primary-fg",
        warn: "bg-warn/15 text-warn",
        ok: "bg-ok/15 text-ok",
        danger: "bg-danger/12 text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
