import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2 text-fg", className)}>
      <span className="grid size-7 grid-cols-2 grid-rows-2 gap-px rounded-sm bg-primary p-1" aria-hidden>
        <span className="bg-primary-fg/90" />
        <span className="bg-primary-fg/55" />
        <span className="bg-primary-fg/70" />
        <span className="bg-primary-fg/40" />
      </span>
      {compact ? null : (
        <span className="font-display text-xl font-medium tracking-tight">Painel</span>
      )}
    </span>
  );
}
