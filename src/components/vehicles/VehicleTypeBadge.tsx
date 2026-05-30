import React from "react";
import { VehicleType, VehicleTypeIcon } from "./VehicleTypeIcon";
import { cn } from "@/lib/utils";

interface VehicleTypeBadgeProps {
  type: VehicleType;
  className?: string;
  showLabel?: boolean;
}

export const VehicleTypeBadge: React.FC<VehicleTypeBadgeProps> = ({ type, className, showLabel = true }) => {
  let label = "Unknown";
  let bgClass = "bg-slate-900/30 border-slate-500/30 text-slate-400";

  switch (type) {
    case "2W":
      label = "2-Wheeler";
      bgClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold";
      break;
    case "3W":
      label = "3-Wheeler";
      bgClass = "bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold";
      break;
    case "4W":
      label = "4-Wheeler";
      bgClass = "bg-blue-500/10 border-blue-500/20 text-blue-400 font-semibold";
      break;
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", bgClass, className)}>
      <VehicleTypeIcon type={type} size={14} className="opacity-80" />
      {showLabel && <span>{label}</span>}
    </div>
  );
};
