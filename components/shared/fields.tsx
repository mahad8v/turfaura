import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

interface FieldWrapperProps {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
}

export function TextField({
  label,
  name,
  hint,
  required,
  icon,
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
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>}
        <input
          id={name}
          name={name}
          required={required}
          className={`${inputClass} ${icon ? "pl-10" : ""} ${className ?? ""}`}
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
      <textarea id={name} name={name} required={required} className={`${inputClass} resize-none ${className ?? ""}`} {...props} />
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
          className={`${inputClass} appearance-none pr-9 ${className ?? ""}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      </div>
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}
