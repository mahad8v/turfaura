import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/25 disabled:bg-emerald-300 disabled:shadow-none",
  secondary:
    "bg-white text-zinc-700 border border-zinc-300 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 disabled:text-zinc-400 disabled:hover:bg-white",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-600/25 hover:bg-red-700 hover:shadow-md hover:shadow-red-600/25 disabled:bg-red-300 disabled:shadow-none",
  ghost: "text-zinc-600 hover:bg-zinc-100 disabled:text-zinc-300 disabled:hover:bg-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  pending?: boolean;
  pendingText?: string;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  pending,
  pendingText,
  icon,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || pending}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
          {pendingText ?? "Working…"}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
