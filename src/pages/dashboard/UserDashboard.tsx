import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BatteryCharging, Calendar, Car, Zap, ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, John. Here's your EV charging overview.</p>
        </div>
        <Link to="/dashboard/book">
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Book a Charge
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Charges" 
          value="24" 
          description="Lifetime charges" 
          icon={<Zap className="h-4 w-4" />} 
        />
        <StatCard 
          title="Energy Delivered" 
          value="850 kWh" 
          description="+12% from last month" 
          trend="up"
          trendValue="+12%"
          icon={<BatteryCharging className="h-4 w-4" />} 
        />
        <StatCard 
          title="Active Vehicles" 
          value="2" 
          description="Registered EVs" 
          icon={<Car className="h-4 w-4" />} 
        />
        <StatCard 
          title="Total Spent" 
          value="$420.50" 
          description="This year" 
          icon={<span className="font-bold text-sm">$</span>} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Booking / Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-emerald-900/50 dark:to-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white dark:text-white">Active Booking</CardTitle>
              <CardDescription className="text-slate-300 dark:text-slate-400">You have a charging session scheduled.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/20 p-3 rounded-full">
                    <BatteryCharging className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Tesla Model 3</p>
                    <p className="text-sm text-slate-300 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> 123 Tech Park, Sector 4
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">Today, 2:00 PM</p>
                  <p className="text-xs text-slate-300">ETA: 15 mins</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link to="/dashboard/tracking" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-none">
                    Track Van
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent dark:hover:bg-white/5">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-200">Standard Charge</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Oct 24, 2023 • 10:30 AM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-slate-200">$15.00</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                View All History <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Vehicles</CardTitle>
              <CardDescription>Manage your registered EVs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                  <Car className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-200">Tesla Model 3</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ABC-1234 • 4-Wheeler</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              </div>
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                  <Car className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-200">Ola S1 Pro</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">XYZ-5678 • 2-Wheeler</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              </div>
              <Link to="/dashboard/vehicles">
                <Button variant="outline" className="w-full mt-2">
                  Manage Vehicles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-300">Did you know?</h4>
                  <p className="text-sm text-emerald-800 dark:text-emerald-400/80 mt-1">
                    Charging your EV during off-peak hours (10 PM - 6 AM) can save you up to 20% on energy costs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
