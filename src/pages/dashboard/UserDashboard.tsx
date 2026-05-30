import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BatteryCharging, Car, Zap, ArrowRight, MapPin, CheckCircle2, Clock, XCircle, AlertCircle, CreditCard, Gift, Star } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [subscription, setSubscription] = useState<any>(null);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportIssue, setSupportIssue] = useState("billing");

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

    // Subscribe to booking changes
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      return session.user.id;
    };

    let subscription: any;
    let isActive = true;
    fetchSession().then(userId => {
      if (!userId || !isActive) return;
      subscription = supabase
        .channel(`user-dashboard-bookings-${userId}-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${userId}` },
          () => {
            // Refresh dashboard data when bookings change
            loadDashboardData();
          }
        )
        .subscribe();
    });

    return () => {
      isActive = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [location.state]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      // Call getSession first to ensure session is refreshed sequentially
      // This prevents the "Lock broken by another request with the 'steal' option" error
      // which happens when multiple concurrent requests try to refresh the session.
      await supabase.auth.getSession();

      const [bookings, vehiclesData, profile, active] = await Promise.all([
        bookingService.getBookings(),
        vehicleService.getVehicles(),
        profileService.getProfile(),
        bookingService.getActiveBooking()
      ]);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch active subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (subData) setSubscription(subData);

        // Fetch referral count (e.g. how many times a user successfully referred someone)
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact' })
          .eq('referrer_user_id', session.user.id);
        setReferralCount(count || 0);
      }

      // Calculate stats
      const totalCharges = bookings.filter((b: any) => b.status === 'completed').length;
      
      // Parse energy string "30kWh" -> 30
      const energyDelivered = bookings
        .filter((b: any) => b.status === 'completed')
        .reduce((acc: number, curr: any) => {
          const energy = parseFloat(curr.energy_requested?.replace('kWh', '') || '0');
          return acc + energy;
        }, 0);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const totalSpent = bookings
        .filter((b: any) => {
          if (b.status !== 'completed') return false;
          const date = new Date(b.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((acc: number, curr: any) => acc + parseFloat(curr.estimated_price || '0'), 0);

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

    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      if (error.message?.includes('Refresh Token') || error.message?.includes('session') || error.status === 401 || error.code === 'not_authenticated') {
        supabase.auth.signOut().then(() => navigate('/'));
        return;
      }
      if (error.message === 'Failed to fetch') {
        setError("Unable to connect to the database. Please check your internet connection and ensure Supabase is configured correctly.");
      } else {
        setError(error.message || "Failed to load dashboard data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulPayment = async (paymentId: string, bookingRef: string) => {
    try {
      setProcessingPayment(true);
      
      const actualAmount = 1.00;
      let paymentMethod = "razorpay_link";

      try {
        const response = await fetch(`/api/payment-details/${paymentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.payment_method) {
            paymentMethod = data.payment_method;
          }
        }
      } catch (e) {
        console.error("Failed to fetch payment details:", e);
      }

      await paymentService.createPayment({
        booking_id: bookingRef,
        amount: actualAmount,
        payment_method: paymentMethod,
        transaction_id: paymentId,
        status: "completed"
      });

      await bookingService.updateBookingStatus(bookingRef, "completed");
      
      // Redirect to history page after successful payment
      navigate("/dashboard/history");
      
    } catch (err) {
      console.error("Error updating booking after redirect:", err);
      alert("Payment successful but failed to update booking. Please contact support.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("Support request submitted successfully. Our team will get back to you shortly.");
    setShowSupportModal(false);
    setSupportMessage("");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-10 animate-pulse">
          <div className="h-9 w-48 bg-slate-800 rounded-lg mb-2"></div>
          <div className="h-5 w-64 bg-slate-800 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-slate-900 border border-white/5 rounded-2xl h-[120px]"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="animate-pulse bg-slate-900 border border-white/5 rounded-2xl h-[300px]"></div>
            <div className="animate-pulse bg-slate-900 border border-white/5 rounded-2xl h-[400px]"></div>
          </div>
          <div className="space-y-8">
            <div className="animate-pulse bg-slate-900 border border-white/5 rounded-2xl h-[250px]"></div>
            <div className="animate-pulse bg-slate-900 border border-white/5 rounded-2xl h-[200px]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {processingPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Processing Payment</h3>
            <p className="text-slate-400">Please wait while we confirm your payment and update your booking...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={loadDashboardData} className="ml-auto border-red-500/30 text-red-400 hover:bg-red-500/20">Retry</Button>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Welcome back, <span className="text-white font-medium">{user?.full_name?.split(' ')[0] || 'User'}</span>. Here's your EV charging overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
          description="This month" 
          icon={<span className="font-bold text-sm">₹</span>} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Booking */}
          {activeBooking ? (
            <Card className="bg-slate-900 border border-white/5 shadow-2xl overflow-hidden relative rounded-2xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 rounded-2xl p-6 h-full border border-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Zap className="h-40 w-40 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-white text-2xl font-bold tracking-tight">Active Booking</h3>
                      <p className="text-slate-400 mt-1">Your mobile charging request is in progress.</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)] ${
                      activeBooking.status === 'completed' || activeBooking.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      activeBooking.status === 'pending' || activeBooking.status === 'evaluating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      ['assigned', 'enroute', 'arrived', 'charging'].includes(activeBooking.status) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      activeBooking.status === 'pending_payment' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {activeBooking.status === 'pending' ? 'Searching' : 
                       activeBooking.status === 'pending_payment' ? 'Awaiting Payment' :
                       activeBooking.status === 'enroute' ? 'En Route' :
                       activeBooking.status === 'assigned' ? 'Van Assigned' :
                       activeBooking.status === 'charging' ? 'Charging' :
                       activeBooking.status === 'arrived' ? 'Arrived' :
                       activeBooking.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="bg-slate-950/50 p-6 rounded-xl border border-white/5 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Location</p>
                        <p className="font-medium text-slate-200 flex items-start gap-2 line-clamp-2" title={activeBooking.location}>
                          <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> 
                          <span>
                            {formatLocation(activeBooking.location)}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Requested At</p>
                        <p className="font-medium text-slate-200 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-500" /> 
                          {new Date(activeBooking.created_at || activeBooking.scheduled_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Energy Requested</p>
                        <p className="font-medium text-slate-200 flex items-center gap-2">
                          <BatteryCharging className="h-4 w-4 text-emerald-500" /> 
                          {activeBooking.energy_requested}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Estimated Price</p>
                        <p className="font-bold text-white text-xl">
                          ₹{Number(activeBooking.estimated_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {['assigned', 'enroute', 'arrived', 'charging', 'evaluating', 'searching', 'preview'].includes(activeBooking.status) && (
                      <Link to="/dashboard/book" state={{ bookingId: activeBooking.id }} className="flex-1">
                        <Button className="w-full bg-slate-800 text-white hover:bg-slate-700 border border-white/10 h-12 rounded-xl text-base font-semibold transition-all">
                          Track Booking
                        </Button>
                      </Link>
                    )}
                    {(activeBooking.status === 'pending_payment') && (
                      <Link to="/dashboard/payment" state={{ bookingId: activeBooking.id, amount: activeBooking.estimated_price }} className="flex-1">
                        <Button className="w-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-50 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-500 h-12 rounded-xl text-base font-semibold transition-all">
                          Pay Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-900/50 flex flex-col items-center justify-center py-16 text-center border border-white/5 rounded-2xl shadow-xl">
              <div className="bg-slate-800 p-5 rounded-2xl mb-6 shadow-inner ring-1 ring-white/10">
                <Zap className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No active bookings</h3>
              <p className="text-slate-400 mb-8 max-w-md">
                Your EV is fully charged! Ready for your next trip? Book a mobile charging van to your location whenever you need it.
              </p>
              <Link to="/dashboard/book">
                <Button size="lg" className="px-8 rounded-xl bg-slate-900/5 hover:bg-white/10 text-white border border-white/10">Book a Charge Now</Button>
              </Link>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="bg-slate-900 border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 bg-slate-950/30">
              <div className="space-y-1">
                <CardTitle className="text-white tracking-tight">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">Your latest charging sessions</CardDescription>
              </div>
              <Link to="/dashboard/history" className="text-sm text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-white/5">
                                                        {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors gap-3 sm:gap-4 border-b border-white/5 last:border-0 relative">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0 flex-1">
                        <div className={'p-3 flex-shrink-0 rounded-xl ' + (
                          activity.status === 'completed' || activity.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          activity.status === 'cancelled' || activity.status === 'rejected' || activity.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        )}>
                          {activity.status === 'completed' || activity.status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> :
                           activity.status === 'cancelled' || activity.status === 'rejected' || activity.status === 'failed' ? <XCircle className="h-5 w-5" /> :
                           <Clock className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 pr-2 sm:pr-4 flex-1 w-full mt-1 sm:mt-0">
                          <p className="font-semibold text-slate-200 line-clamp-2 md:line-clamp-1 leading-snug w-full">
                            {formatLocation(activity.location)}
                          </p>
                          <p className="text-[13px] sm:text-sm text-slate-500 mt-1 sm:mt-0.5">
                            {new Date(activity.created_at).toLocaleDateString()} <span className="opacity-50 mx-1">•</span> {activity.energy_requested}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto flex-shrink-0 pl-[52px] sm:pl-0 sm:mt-0 pt-2 sm:pt-0">
                        <span className={'text-[11px] sm:text-xs capitalize px-2.5 py-0.5 rounded-full inline-flex items-center justify-center whitespace-nowrap mt-0 sm:mt-1 font-medium tracking-wide order-last sm:order-first ' + (
                          activity.status === 'completed' || activity.status === 'paid' ? 'bg-emerald-900/30 text-emerald-400' :
                          activity.status === 'pending' || activity.status === 'evaluating' ? 'bg-amber-900/30 text-amber-400' :
                          ['assigned', 'enroute', 'arrived', 'charging'].includes(activity.status) ? 'bg-blue-900/30 text-blue-400' :
                          activity.status === 'pending_payment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-900/30 text-red-400'
                        )}>
                          <span className="capitalize">
                           {activity.status === 'pending' ? 'Searching' : 
                            activity.status === 'pending_payment' ? 'Awaiting Payment' :
                            activity.status === 'enroute' ? 'En Route' :
                            activity.status === 'assigned' ? 'Van Assigned' :
                            activity.status === 'charging' ? 'Charging in Progress' :
                            activity.status === 'rejected' ? 'Failed' :
                            activity.status.replace('_', ' ')}
                          </span>
                        </span>
                        <p className="font-bold text-white text-lg leading-none mt-0 sm:mt-1.5 order-first sm:order-last">₹{(Number(activity.estimated_price) || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No recent activity found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Vehicles Summary */}
          <Card className="bg-slate-900 border border-white/5 rounded-2xl shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 bg-slate-950/30">
              <CardTitle className="text-white tracking-tight">My Vehicles</CardTitle>
              <Link to="/dashboard/vehicles" className="text-sm text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {vehicles.length > 0 ? (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/50 border border-white/5">
                      <div className="bg-slate-800 p-2.5 rounded-lg border border-white/5">
                        <Car className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">
                          {vehicle.make} {vehicle.model}
                          {vehicle.year && <span className="text-slate-500 font-normal ml-1">({vehicle.year})</span>}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{vehicle.registration_number}</p>
                      </div>
                    </div>
                  ))}
                  {stats.activeVehicles > 2 && (
                    <p className="text-xs text-center text-slate-500 pt-2 font-medium">
                      + {stats.activeVehicles - 2} more vehicles
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="bg-slate-800/50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Car className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-400 mb-4">No vehicles added yet.</p>
                  <Link to="/dashboard/vehicles">
                    <Button variant="outline" size="sm" className="w-full border-white/10 text-slate-300 hover:bg-white/5 rounded-lg">Add Vehicle</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription & Referrals */}
          <Card className="bg-slate-900 border border-white/5 rounded-2xl shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 bg-slate-950/30">
              <CardTitle className="text-white tracking-tight">Active Plan</CardTitle>
              <Link to="/pricing" className="text-sm text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                {subscription ? "Manage" : "View Plans"}
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {subscription ? (
                <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-emerald-400 fill-emerald-400/20" />
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
                      {subscription.plan_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">Renews on {new Date(subscription.expires_at).toLocaleDateString()}</p>
                  {subscription.plan_type === 'lite_plan' && (
                    <div className="mt-3 text-xs text-slate-400">Remaining sessions limit applies. See details.</div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 mb-4">
                  <div className="bg-slate-800/50 h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-400">No active subscription.</p>
                </div>
              )}

              <div className="border-t border-white/5 pt-5 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Gift className="h-4 w-4 text-indigo-400" /> Refer & Earn
                  </span>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    {referralCount}/3 Friends
                  </span>
                </div>
                
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                  <div 
                    className="bg-indigo-500 h-full transition-all" 
                    style={{ width: `${Math.min((referralCount / 3) * 100, 100)}%` }}
                  />
                </div>
                
                {referralCount >= 3 ? (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Reward unlocked: Free Charge!</p>
                ) : (
                  <p className="text-xs text-slate-500">Invite {3 - referralCount} more to earn a free charge!</p>
                )}
                <div className="mt-4">
                  <p className="text-xs text-slate-400 mb-1">Your Referral Code:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-950 p-2 rounded border border-white/10 text-center font-mono text-sm tracking-widest text-slate-200 uppercase">
                      {user?.referral_code || 'LOADING...'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={`border-white/10 shrink-0 transition-colors ${copied ? 'bg-emerald-500/20 hover:bg-emerald-500/20 border-emerald-500/30' : 'hover:bg-white/10'}`}
                      onClick={() => {
                        navigator.clipboard.writeText(user?.referral_code || '');
                        setCopied(true);
                        setSuccessMessage("Referral code copied to clipboard!");
                        setTimeout(() => setCopied(false), 2000);
                        setTimeout(() => setSuccessMessage(null), 3000);
                      }}
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Gift className="h-4 w-4 text-slate-400" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Support / Info */}
          <Card className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <AlertCircle className="h-32 w-32 outline-none" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="font-bold text-emerald-400 mb-2 tracking-tight text-lg">Need Help?</h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Our support team is available 24/7 to assist you with your charging needs and emergencies.
              </p>
              <Button onClick={() => setShowSupportModal(true)} variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all font-semibold">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {showSupportModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md relative">
            <button 
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Contact Support</h3>
            <p className="text-slate-400 text-sm mb-6">Create a support ticket and our team will get back to you shortly.</p>
            
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Issue Type</label>
                <select 
                  value={supportIssue}
                  onChange={(e) => setSupportIssue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                >
                  <option value="billing">Billing & Subscriptions</option>
                  <option value="charging">Charging Station Issue</option>
                  <option value="account">Account Management</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                ></textarea>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 mt-2">
                Submit Ticket
              </Button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </DashboardLayout>
  );
}
