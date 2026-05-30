import React from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, trendValue, className }: StatCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden bg-slate-900 border-white/5 relative group hover:border-emerald-500/30 transition-all rounded-2xl shadow-xl flex flex-col justify-between p-6 h-full min-h-[150px]", 
      className
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none transition-colors"></div>
      
      <div className="flex flex-row items-center justify-between relative z-10 w-full mb-6">
        <h3 className="text-sm font-medium text-slate-400">
          {title}
        </h3>
        {icon && (
          <div className="flex items-center justify-center min-h-[40px] min-w-[40px] w-10 h-10 text-emerald-500 bg-emerald-500/10 rounded-xl shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col justify-end w-full">
        <div className="text-3xl font-extrabold text-white tracking-tight leading-none">{value}</div>
        {(description || trend) && (
          <p className="text-sm text-slate-500 mt-3 flex items-center gap-1.5 font-medium">
            {trend && (
              <span className={cn(
                "font-semibold",
                trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400"
              )}>
                {trendValue}
              </span>
            )}
            <span className="opacity-80">{description}</span>
          </p>
        )}
      </div>
    </Card>
  );
}
