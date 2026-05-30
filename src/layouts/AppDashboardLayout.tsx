import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Outlet } from "react-router-dom";

export function AppDashboardLayout({ children }: { children?: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 transition-colors">
      <Sidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      
      <main className="md:pl-64 min-h-screen pt-16 md:pt-0">
        <div className="md:hidden fixed top-0 w-full h-16 bg-background/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-white/5 flex items-center justify-between px-4 z-20 transition-colors">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-foreground hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2.5 ml-1">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg logo-box-glow">
                <Zap className="h-5 w-5 z-10 logo-icon-glow" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Spark EV</span>
            </div>
          </div>
          <div className="-mr-1 sm:-mr-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="container mx-auto p-4 md:p-8 max-w-7xl relative z-10">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
