import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <Link to="/" className="flex items-center gap-3 mb-10 relative z-10">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/50">
          <Zap className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] fill-emerald-400/20 z-10" />
        </div>
        <span className="font-extrabold text-2xl tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Spark EV</span>
      </Link>
      
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-15px_rgba(0,0,0,0.5)] border border-white/10 p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{title}</h1>
          <p className="text-slate-400 text-sm font-medium">{subtitle}</p>
        </div>
        {children}
      </div>
      
      <div className="mt-12 text-center text-sm text-slate-500 relative z-10 font-medium tracking-wide">
        &copy; {new Date().getFullYear()} SPARK EV Charging.
      </div>
    </div>
  );
}
