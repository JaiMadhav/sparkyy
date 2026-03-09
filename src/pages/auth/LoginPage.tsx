import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.session) {
        // Generate a new session token to prevent multiple logins
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('app_session_token', token);
        
        // Update user metadata with the new token
        await supabase.auth.updateUser({
          data: { current_session_token: token }
        });
        
        // Log the activity
        try {
          await supabase.from('activity_logs').insert([{
            user_id: data.session.user.id,
            action: 'login',
            details: { device: navigator.userAgent },
            created_at: new Date().toISOString()
          }]);
        } catch (e) {
          // Ignore if table doesn't exist yet
        }
        
        navigate("/dashboard");
      } else {
        // This case is rare for signInWithPassword but good to handle
        setError("Login successful but no session created. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message.includes("Email not confirmed")) {
        setError("Please verify your email address before logging in. Check your inbox.");
      } else if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.message || "An error occurred during sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome" 
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-md text-sm flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <Input
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>

        <div className="text-center text-sm text-slate-600 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
