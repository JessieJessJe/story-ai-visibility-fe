import * as React from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline";

const styles: Record<BadgeVariant, string> = {
  default: "bg-slate-200 text-slate-900",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-danger/10 text-danger",
  outline: "border border-slate-200 text-slate-700"
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      styles[variant],
      className
    )}
    {...props}
  />
);
