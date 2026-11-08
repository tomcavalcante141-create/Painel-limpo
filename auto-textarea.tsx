import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AutoTextarea({
  value,
  onChange,
  className,
  ...props
}: Omit<ComponentProps<typeof Textarea>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(el.scrollHeight, 44)}px`;
  }, [value]);

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}
