import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.name,
            phone: formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`,
          },
        },
      });

      if (error) throw error;

      // Check if session is null, which means email confirmation is required
      if (data.user && !data.session) {
        navigate("/login", { 
          state: { 
            email: formData.email,
            message: "Registration successful! Please check your email to verify your account before logging in."
          } 
        });
      } else {
        // Fallback for cases where auto-confirm might be on
        navigate("/login", { 
          state: { 
            email: formData.email,
            message: "Account created successfully. Please sign in."
          } 
        });
      }
      
    } catch (err: any) {
      if (err.message.includes("User already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.message.includes("rate limit") || err.status === 429) {
        setError("Too many signup attempts. Please wait a few minutes before trying again, or try a different email address.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Join SPARK to charge your EV anywhere"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <Input
          label="Full Name"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Phone Number (without country code)"
          name="phone"
          type="tel"
          placeholder="9876543210"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <div className="text-sm text-slate-500">
          By signing up, you agree to our <Link to="/terms" className="text-emerald-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 whitespace-pre-wrap mt-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
