import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, MessageSquare, BatteryCharging, CheckCircle2 } from "lucide-react";

export default function LiveTracking() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Live Tracking</h1>
        <p className="text-slate-500 mt-1">Track your charging van in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col overflow-hidden">
            <div className="flex-1 bg-slate-100 relative">
              {/* Map Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4241,37.78,14.25,0,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsN3F3Mm0wMDFrMnBwYW5ybmh4b214In0.Example')] bg-cover bg-center opacity-50">
                <div className="bg-white/90 p-4 rounded-xl shadow-lg backdrop-blur-sm text-center">
                  <MapPin className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-900">Van is on the way</p>
                  <p className="text-sm text-slate-500">2.5 km away</p>
                </div>
              </div>
              
              {/* Route Line Placeholder */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 200 200 Q 400 300 600 400" stroke="#10b981" strokeWidth="4" fill="none" strokeDasharray="8 4" className="animate-pulse" />
              </svg>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 py-2">
                <div className="relative">
                  <div className="absolute -left-[21px] bg-emerald-500 h-4 w-4 rounded-full border-2 border-white ring-2 ring-emerald-100"></div>
                  <p className="font-bold text-sm text-slate-900">Van Dispatched</p>
                  <p className="text-xs text-slate-500">2:05 PM</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] bg-emerald-500 h-4 w-4 rounded-full border-2 border-white ring-2 ring-emerald-100"></div>
                  <p className="font-bold text-sm text-slate-900">En Route</p>
                  <p className="text-xs text-slate-500">2:10 PM • Current Status</p>
                </div>
                <div className="relative opacity-50">
                  <div className="absolute -left-[21px] bg-slate-300 h-4 w-4 rounded-full border-2 border-white"></div>
                  <p className="font-bold text-sm text-slate-900">Arrived</p>
                  <p className="text-xs text-slate-500">Est. 2:20 PM</p>
                </div>
                <div className="relative opacity-50">
                  <div className="absolute -left-[21px] bg-slate-300 h-4 w-4 rounded-full border-2 border-white"></div>
                  <p className="font-bold text-sm text-slate-900">Charging Started</p>
                  <p className="text-xs text-slate-500">--:--</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-slate-200 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=driver" alt="Driver" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Michael R.</p>
                  <p className="text-xs text-slate-500">4.9 ★ • 150+ Charges</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="h-4 w-4" /> Call
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
