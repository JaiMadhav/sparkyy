import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import UserDashboard from "@/pages/dashboard/UserDashboard";
import VehicleManagement from "@/pages/dashboard/VehicleManagement";
import BookCharging from "@/pages/dashboard/BookCharging";
import LiveTracking from "@/pages/dashboard/LiveTracking";
import BookingHistory from "@/pages/dashboard/BookingHistory";
import ProfileSettings from "@/pages/dashboard/ProfileSettings";
import PaymentPage from "@/pages/dashboard/PaymentPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import OnboardingPage from "@/pages/onboarding/OnboardingPage";
import ProtectedRoute from "@/components/ProtectedRoute";

import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="spark-ui-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/dashboard/vehicles" element={<VehicleManagement />} />
            <Route path="/dashboard/book" element={<BookCharging />} />
            <Route path="/dashboard/tracking" element={<LiveTracking />} />
            <Route path="/dashboard/history" element={<BookingHistory />} />
            <Route path="/dashboard/settings" element={<ProfileSettings />} />
            <Route path="/dashboard/payment" element={<PaymentPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
