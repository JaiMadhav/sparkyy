import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { 
  LayoutDashboard, 
  Car, 
  Zap, 
  History, 
  Settings, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Car, label: "My Vehicles", href: "/dashboard/vehicles" },
  { icon: Zap, label: "Book Charging", href: "/dashboard/book" },
  { icon: History, label: "History", href: "/dashboard/history" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({ isMobileOpen, setIsMobileOpen }: { isMobileOpen?: boolean; setIsMobileOpen?: (val: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(profileService.getCachedProfile());
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Call getSession first to ensure session is refreshed sequentially
      // This prevents the "Lock broken by another request with the 'steal' option" error
      await supabase.auth.getSession();
      const profile = await profileService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const sidebarClasses = cn(
    "w-64 bg-slate-950 border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-40 transition-transform duration-300 ease-in-out",
    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  );

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}
      <aside className={sidebarClasses}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg logo-box-glow">
            <Zap className="h-5 w-5 z-10 logo-icon-glow" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden lg:block">Spark EV</span>
        </Link>
        <div className="hidden md:block -mr-3">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen?.(false)}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-3.5 px-4 py-3 mb-2 rounded-2xl bg-slate-900/5 border border-white/5 shadow-sm">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="h-[44px] w-[44px] rounded-full object-cover ring-2 ring-white/10" />
          ) : (
            <div className="h-[44px] w-[44px] rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-base uppercase ring-1 ring-emerald-500/30">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0 flex items-center">
            <p className="text-base font-bold text-slate-200 truncate tracking-tight">
              {user?.full_name || "User"}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 rounded-xl transition-all border border-transparent group"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
      </div>

    </aside>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-slate-900 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl border border-slate-800 relative z-50">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <LogOut className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Sign Out</h3>
              </div>
              <button type="button" onClick={() => setShowSignOutModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-sm">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowSignOutModal(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={handleConfirmLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
