import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { AlertCircle, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Placeholder admin check
      if (email.includes("admin")) {
        await authService.login(email, password);
        navigate("/admin/dashboard");
      } else {
        throw new Error("Unauthorized access");
      }
    } catch (err) {
      setError("Invalid admin credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Admin Portal" 
      subtitle="Restricted access for SPARK administrators"
    >
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Authorized Personnel Only</p>
          <p>Access to this portal is monitored and logged.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <Input
          label="Admin Email"
          type="email"
          placeholder="admin@spark.com"
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

        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" isLoading={isLoading}>
          Access Dashboard
        </Button>

        <div className="text-center text-sm text-slate-600 mt-4">
          <Link to="/login" className="font-medium text-slate-600 hover:text-slate-900">
            Return to User Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
