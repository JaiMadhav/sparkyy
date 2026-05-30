import React from "react";
import { Car, Bike, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type VehicleType = "2W" | "3W" | "4W" | string;

interface VehicleTypeIconProps {
  type: VehicleType;
  className?: string;
  size?: number;
}

const ERickshawIcon = ({ className, size }: { className?: string; size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M 5 8 h 9 l 4 5 v 4" />
    <path d="M 5 8 v 9 h 1" />
    <path d="M 10 17 h 4" />
    <path d="M 14 8 v 9" />
    <circle cx="8" cy="17" r="2" />
    <circle cx="16" cy="17" r="2" />
  </svg>
);

export const VehicleTypeIcon: React.FC<VehicleTypeIconProps> = ({ type, className, size = 20 }) => {
  switch (type) {
    case "2W":
      return <Bike size={size} className={cn("text-emerald-700 text-emerald-400", className)} />;
    case "3W":
      return <ERickshawIcon size={size} className={cn("text-amber-700 text-amber-400", className)} />;
    case "4W":
      return <Car size={size} className={cn("text-blue-700 text-blue-400", className)} />;
    default:
      return <Zap size={size} className={cn("text-slate-300 text-slate-400", className)} />;
  }
};
