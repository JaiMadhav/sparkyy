import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, User } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { profileService } from "@/services/profileService";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const [session, setSession] = useState<any>(undefined); // undefined means loading
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null); // null means logged out
      if (data?.session) {
        profileService.getProfile().then(p => setProfile(p));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      if (newSession) {
        profileService.getProfile().then(p => setProfile(p));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed w-full border-b border-sidebar-border bg-background/50 backdrop-blur-xl top-0 z-50 transition-colors supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg logo-box-glow">
            <Zap className="h-5 w-5 z-10 logo-icon-glow" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Spark EV</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session === undefined ? (
            <div className="h-11 w-11 sm:h-12 sm:w-12 bg-slate-800 rounded-full animate-pulse border border-slate-700"></div>
          ) : session ? (
            <Link to="/dashboard" className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-slate-900 border border-slate-700/80 shadow-sm hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] flex items-center justify-center text-slate-300 hover:text-slate-100 hover:border-emerald-500/50 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 overflow-hidden ring-2 ring-transparent hover:ring-emerald-500/20" title="Dashboard">
               {profile?.avatar_url || session.user?.user_metadata?.avatar_url ? (
                 <img src={profile?.avatar_url || session.user?.user_metadata?.avatar_url} alt="Profile" className="h-full w-full object-cover" />
               ) : (
                 <User className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-slate-300" strokeWidth={1.5} />
               )}
            </Link>
          ) : (
            <Link to="/login" className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-slate-900 border border-slate-700/80 shadow-sm hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] flex items-center justify-center text-slate-300 hover:text-slate-100 hover:border-emerald-500/50 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-emerald-500/20" title="Account">
              <User className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-slate-300" strokeWidth={1.5} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
