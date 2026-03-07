import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Car, 
  Zap, 
  MapPin, 
  History, 
  Settings, 
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Car, label: "My Vehicles", href: "/dashboard/vehicles" },
  { icon: Zap, label: "Book Charging", href: "/dashboard/book" },
  { icon: MapPin, label: "Live Tracking", href: "/dashboard/tracking" },
  { icon: History, label: "History", href: "/dashboard/history" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-40 transition-colors">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">SPARK</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">John Doe</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">john@example.com</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
