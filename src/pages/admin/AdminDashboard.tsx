import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Zap, Truck, Activity } from "lucide-react";
import { supabase } from "@/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    chargingVans: 15,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 1. Get total users (from auth users or profiles if available)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Get all bookings for admin
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      const allBookings = bookings || [];
      const activeCount = allBookings.filter(b => ['pending', 'dispatched', 'charging'].includes(b.status)).length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysRevenue = allBookings
        .filter(b => b.status === 'completed' && new Date(b.created_at) >= today)
        .reduce((sum, b) => sum + parseFloat(b.estimated_price || '0'), 0);

      setStats({
        totalUsers: usersCount || 0,
        activeBookings: activeCount,
        chargingVans: 15, // Currently static based on Map Vans
        revenue: todaysRevenue,
      });

      setRecentBookings(allBookings.slice(0, 10)); // Top 10

    } catch (error) {
      console.error("Error loading admin dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 mt-1">Platform statistics and management.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers.toString()} 
              description="Registered users" 
              icon={<Users className="h-4 w-4" />} 
            />
            <StatCard 
              title="Active Bookings" 
              value={stats.activeBookings.toString()} 
              description="Currently in progress" 
              icon={<Activity className="h-4 w-4" />} 
            />
            <StatCard 
              title="Charging Vans" 
              value={stats.chargingVans.toString()} 
              description="Total Fleet" 
              icon={<Truck className="h-4 w-4" />} 
            />
            <StatCard 
              title="Revenue (Today)" 
              value={`₹${stats.revenue.toFixed(2)}`} 
              description="Today's Earnings" 
              icon={<Zap className="h-4 w-4" />} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center">No bookings found.</td>
                        </tr>
                      ) : (
                        recentBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-medium text-white">{booking.profile?.full_name || 'Unknown'}</td>
                            <td className="px-4 py-3 truncate max-w-[150px]" title={booking.location}>{booking.location}</td>
                            <td className="px-4 py-3">₹{Number(booking.estimated_price).toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-0.5 rounded text-xs font-medium capitalize ${
                                booking.status === 'completed' ? 'bg-emerald-900/30 text-emerald-400 bg-emerald-100 text-emerald-700' :
                                booking.status === 'cancelled' ? 'bg-red-900/30 text-red-400 bg-red-100 text-red-700' :
                                'bg-blue-900/30 text-blue-400 bg-blue-100 text-blue-700'
                              }`}>
                                {booking.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Van Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock static data for vans for now as it's purely frontend simulated in BookCharging */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-full">
                          <Truck className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Van #{i}</p>
                          <p className="text-xs text-slate-400">Battery: {100 - i * 5}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-500">Available</p>
                        <p className="text-xs text-slate-400">Zone {i}</p>
                      </div>
                    </div>
                  ))}
                   <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-full">
                          <Truck className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Van #5</p>
                          <p className="text-xs text-slate-400">Battery: 45%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-400">Charging</p>
                        <p className="text-xs text-slate-400">Red Fort</p>
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
