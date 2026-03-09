import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";

export default function ProtectedRoute() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check for single device login
        const localToken = localStorage.getItem('app_session_token');
        const userToken = session.user?.user_metadata?.current_session_token;
        
        if (userToken && localToken && userToken !== localToken) {
          // Logged in elsewhere
          await supabase.auth.signOut();
          localStorage.removeItem('app_session_token');
          navigate('/login', { state: { message: 'You have been logged out because your account was accessed from another device.' } });
          return;
        }
      }
      
      setSession(session);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const localToken = localStorage.getItem('app_session_token');
        const userToken = session.user?.user_metadata?.current_session_token;
        
        if (userToken && localToken && userToken !== localToken) {
          await supabase.auth.signOut();
          localStorage.removeItem('app_session_token');
          navigate('/login', { state: { message: 'You have been logged out because your account was accessed from another device.' } });
          return;
        }
      }
      
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
