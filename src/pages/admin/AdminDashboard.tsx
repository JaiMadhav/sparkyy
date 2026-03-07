import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Zap, Truck, Activity } from "lucide-react";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 mt-1">Platform statistics and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value="1,240" 
          trend="up" 
          trendValue="+15%" 
          icon={<Users className="h-4 w-4" />} 
        />
        <StatCard 
          title="Active Bookings" 
          value="45" 
          description="Currently in progress" 
          icon={<Activity className="h-4 w-4" />} 
        />
        <StatCard 
          title="Charging Vans" 
          value="12" 
          description="8 Active, 4 Idle" 
          icon={<Truck className="h-4 w-4" />} 
        />
        <StatCard 
          title="Revenue (Today)" 
          value="$3,450" 
          trend="up" 
          trendValue="+8%" 
          icon={<Zap className="h-4 w-4" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">User #{i}</td>
                    <td className="px-4 py-3">Sector {i + 2}, City</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Van Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <Truck className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Van #{i + 100}</p>
                      <p className="text-xs text-slate-500">Battery: {80 - i * 5}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-600">On Job</p>
                    <p className="text-xs text-slate-400">ETA: 10m</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
