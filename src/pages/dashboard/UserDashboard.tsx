import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BatteryCharging, Calendar, Car, Zap, ArrowRight, MapPin, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { vehicleService } from "@/services/vehicleService";
import { paymentService } from "@/services/paymentService";
import { profileService } from "@/services/profileService";
import { formatLocation } from "@/utils/location";
import { supabase } from "@/supabaseClient";

export default function UserDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCharges: 0,
    energyDelivered: 0,
    activeVehicles: 0,
    totalSpent: 0
  });
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // Check for Razorpay redirect parameters
    const searchParams = new URLSearchParams(location.search);
    const paymentId = searchParams.get('razorpay_payment_id');
    const paymentStatus = searchParams.get('razorpay_payment_link_status');
    const bookingRef = searchParams.get('razorpay_payment_link_reference_id');

    if (paymentId && paymentStatus === 'paid' && bookingRef) {
      handleSuccessfulPayment(paymentId, bookingRef);
    }

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from history state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
    loadDashboardData();
  }, [location.state]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Call getSession first to ensure session is refreshed sequentially
      // This prevents the "Lock broken by another request with the 'steal' option" error
      // which happens when multiple concurrent requests try to refresh the session.
      await supabase.auth.getSession();

      const [bookings, vehiclesData, payments, profile, active] = await Promise.all([
        bookingService.getBookings(),
        vehicleService.getVehicles(),
        paymentService.getPayments(),
        profileService.getProfile(),
        bookingService.getActiveBooking()
      ]);

      // Calculate stats
      const totalCharges = bookings.filter((b: any) => b.status === 'completed').length;
      
      // Parse energy string "30kWh" -> 30
      const energyDelivered = bookings
        .filter((b: any) => b.status === 'completed')
        .reduce((acc: number, curr: any) => {
          const energy = parseFloat(curr.energy_requested?.replace('kWh', '') || '0');
          return acc + energy;
        }, 0);

      const totalSpent = payments.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);

      setStats({
        totalCharges,
        energyDelivered,
        activeVehicles: vehiclesData.length,
        totalSpent
      });

      setVehicles(vehiclesData.slice(0, 2)); // Show only first 2
      setRecentActivity(bookings.slice(0, 3)); // Show only recent 3
      setActiveBooking(active);
      setUser(profile);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulPayment = async (paymentId: string, bookingRef: string) => {
    try {
      setProcessingPayment(true);
      
      const actualAmount = 1.00;

      await paymentService.createPayment({
        booking_id: bookingRef,
        amount: actualAmount,
        payment_method: "razorpay_link",
        transaction_id: paymentId
      });

      await bookingService.updateBookingStatus(bookingRef, "completed");
      
      // Redirect to payments page after successful payment
      navigate("/dashboard/payments");
      
    } catch (err) {
      console.error("Error updating booking after redirect:", err);
      alert("Payment successful but failed to update booking. Please contact support.");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <DashboardLayout>
      {processingPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Processing Payment</h3>
            <p className="text-slate-500 dark:text-slate-400">Please wait while we confirm your payment and update your booking...</p>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome, {user?.full_name?.split(' ')[0] || 'User'}. Here's your EV charging overview.
          </p>
        </div>
        <Link to="/dashboard/book">
          <Button className="hidden sm:flex items-center gap-2">
            <Zap className="h-4 w-4" /> Book Charge
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Charges" 
          value={stats.totalCharges.toString()} 
          description="Lifetime charges" 
          icon={<Zap className="h-4 w-4" />} 
        />
        <StatCard 
          title="Energy Delivered" 
          value={`${stats.energyDelivered} kWh`} 
          description="Total energy received" 
          icon={<BatteryCharging className="h-4 w-4" />} 
        />
        <StatCard 
          title="Active Vehicles" 
          value={stats.activeVehicles.toString()} 
          description="Registered EVs" 
          icon={<Car className="h-4 w-4" />} 
        />
        <StatCard 
          title="Total Spent" 
          value={`₹${stats.totalSpent.toFixed(2)}`} 
          description="Lifetime spend" 
          icon={<span className="font-bold text-sm">₹</span>} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Booking */}
          {activeBooking ? (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-emerald-900/50 dark:to-slate-900 text-white border-none shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-32 w-32" />
              </div>
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white dark:text-white text-2xl">Active Booking</CardTitle>
                    <CardDescription className="text-slate-300 dark:text-slate-400 mt-1">You have a charging session scheduled.</CardDescription>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 uppercase tracking-wider">
                    {activeBooking.status.replace('_', ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/10 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Location</p>
                      <p className="font-medium text-white flex items-center gap-2" title={activeBooking.location}>
                        <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" /> 
                        <span>
                          {formatLocation(activeBooking.location)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Scheduled Time</p>
                      <p className="font-medium text-white flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-400" /> 
                        {new Date(activeBooking.scheduled_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Energy Requested</p>
                      <p className="font-medium text-white flex items-center gap-2">
                        <BatteryCharging className="h-4 w-4 text-emerald-400" /> 
                        {activeBooking.energy_requested}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Estimated Price</p>
                      <p className="font-medium text-white text-lg">
                        ₹{activeBooking.estimated_price}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {(activeBooking.status === 'pending' || activeBooking.status === 'dispatched' || activeBooking.status === 'pending_payment') && (
                    <Link to="/dashboard/payment" state={{ bookingId: activeBooking.id, amount: activeBooking.estimated_price }} className="flex-1">
                      <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 border-none h-12">
                        Pay Now
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed border-2 border-slate-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-full mb-5 shadow-sm">
                  <Zap className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No active bookings</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                  Your EV is fully charged! Ready for your next trip? Book a mobile charging van to your location whenever you need it.
                </p>
                <Link to="/dashboard/book">
                  <Button size="lg" className="px-8">Book a Charge Now</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest charging sessions</CardDescription>
              </div>
              <Link to="/dashboard/history" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          activity.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          activity.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {activity.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> :
                           activity.status === 'cancelled' ? <XCircle className="h-5 w-5" /> :
                           <Clock className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {formatLocation(activity.location)}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(activity.created_at).toLocaleDateString()} • {activity.energy_requested}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">₹{activity.estimated_price}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{activity.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No recent activity found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Vehicles Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>My Vehicles</CardTitle>
              <Link to="/dashboard/vehicles" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Manage
              </Link>
            </CardHeader>
            <CardContent>
              {vehicles.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="bg-white dark:bg-slate-700 p-2 rounded-md shadow-sm">
                        <Car className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{vehicle.make} {vehicle.model}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.registration_number}</p>
                      </div>
                    </div>
                  ))}
                  {stats.activeVehicles > 2 && (
                    <p className="text-xs text-center text-slate-500 pt-2">
                      + {stats.activeVehicles - 2} more vehicles
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Car className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 mb-4">No vehicles added yet.</p>
                  <Link to="/dashboard/vehicles">
                    <Button variant="outline" size="sm" className="w-full">Add Vehicle</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Support / Info */}
          <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
            <CardContent className="p-6">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-2">Need Help?</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-600/80 mb-4">
                Our support team is available 24/7 to assist you with your charging needs.
              </p>
              <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
