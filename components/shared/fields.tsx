import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

const inputBaseClass =
  "w-full min-w-0 rounded-full border border-zinc-200 bg-white text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const inputSizeClass = {
  md: "px-4 py-3 text-sm",
  sm: "px-3.5 py-2 text-xs",
} as const;

type InputSize = keyof typeof inputSizeClass;

const textareaClass =
  "w-full rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

interface FieldWrapperProps {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
  inputSize?: InputSize;
}

export function TextField({
  label,
  name,
  hint,
  required,
  icon,
  inputSize = "md",
  className,
  ...props
}: FieldWrapperProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={name}>
      <span className="text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-emerald-600"> *</span>}
      </span>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>}
        <input
          id={name}
          name={name}
          required={required}
          className={`${inputBaseClass} ${inputSizeClass[inputSize]} ${icon ? "pl-11" : ""} ${className ?? ""}`}
          {...props}
        />
      </div>
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  hint,
  required,
  className,
  ...props
}: FieldWrapperProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={name}>
      <span className="text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-emerald-600"> *</span>}
      </span>
      <textarea id={name} name={name} required={required} className={`${textareaClass} resize-none ${className ?? ""}`} {...props} />
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label,
  name,
  hint,
  required,
  className,
  children,
  ...props
}: FieldWrapperProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={name}>
      <span className="text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-emerald-600"> *</span>}
      </span>
      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          className={`${inputBaseClass} ${inputSizeClass.md} appearance-none pr-10 ${className ?? ""}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      </div>
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}
