"use client";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "soft" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold select-none transition-colors " +
  "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-placeholder disabled:border-transparent";

const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-green-500 active:bg-press",
  soft:    "bg-soft text-primary hover:bg-green-200 active:bg-green-200",
  outline: "bg-card text-strong border border-line hover:bg-green-50 active:bg-soft",
  ghost:   "bg-transparent text-primary hover:bg-green-50 active:bg-soft",
  danger:  "bg-danger-bg text-danger hover:bg-danger/15 active:bg-danger/20",
};

const SIZE: Record<Size, string> = {
  sm: "t-caption h-9 px-3",
  md: "t-body-m h-12 px-5",
  lg: "t-body-l h-14 rounded-lg px-6",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", full, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANT[variant], SIZE[size], full && "w-full", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
