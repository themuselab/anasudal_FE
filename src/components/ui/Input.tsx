"use client";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const FIELD =
  "t-body-m w-full rounded-md border border-line bg-card px-4 text-strong placeholder:text-placeholder " +
  "transition-colors hover:border-green-300 focus:border-primary focus:outline-none " +
  "disabled:bg-disabled disabled:text-placeholder";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, className, ...rest }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(FIELD, "h-12", invalid && "border-danger", className)} {...rest} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(FIELD, "min-h-24 resize-none py-3", invalid && "border-danger", className)}
      {...rest}
    />
  );
});

/** 필드 라벨 + 도움말 묶음 */
export function Field({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      {label && <span className="t-caption mb-1.5 block text-body">{label}</span>}
      {children}
      {error ? <span className="t-caption mt-1.5 block text-danger">{error}</span>
             : hint ? <span className="t-caption mt-1.5 block">{hint}</span> : null}
    </label>
  );
}
