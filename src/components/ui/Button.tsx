import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
    const variants = {
      default: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)] font-semibold transition-all duration-300",
      outline: "border border-white/10 bg-slate-900/5 hover:bg-white/10 text-white backdrop-blur-sm",
      ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
      destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_-3px_rgba(239,68,68,0.4)]",
      link: "text-emerald-400 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-lg px-4",
      lg: "h-14 rounded-xl px-8 text-lg",
      icon: "h-11 w-11",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 tracking-wide",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
