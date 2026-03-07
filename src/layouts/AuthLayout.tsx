import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="bg-emerald-600 p-2 rounded-xl">
          <Zap className="h-6 w-6 text-white fill-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-900">SPARK</span>
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-2 text-sm">{subtitle}</p>
        </div>
        {children}
      </div>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} SPARK EV Charging.
      </div>
    </div>
  );
}
