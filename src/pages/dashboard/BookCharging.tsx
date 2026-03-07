import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MapPin, Calendar, Clock, Zap, Car } from "lucide-react";

export default function BookCharging() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleBook = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard/payment");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Book a Charge</h1>
        <p className="text-slate-500 mt-1">Request a mobile charging van to your location.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Charging Details</CardTitle>
              <CardDescription>Select your vehicle and location.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Select Vehicle</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-emerald-600 bg-emerald-50 p-4 rounded-xl cursor-pointer flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <Car className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">Tesla Model 3</p>
                      <p className="text-xs text-emerald-700">ABC-1234</p>
                    </div>
                    <div className="ml-auto h-4 w-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-600"></div>
                  </div>
                  
                  <div className="border border-slate-200 p-4 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-slate-50 flex items-center gap-3 transition-all">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <Car className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Ola S1 Pro</p>
                      <p className="text-xs text-slate-500">XYZ-5678</p>
                    </div>
                    <div className="ml-auto h-4 w-4 rounded-full border border-slate-300"></div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input className="pl-10" placeholder="Enter your current location" defaultValue="123 Tech Park, Sector 4" />
                </div>
                <div className="mt-2 h-48 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Map Preview Placeholder</p>
                  </div>
                </div>
              </div>

              {/* Time Slot */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Preferred Time</label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="border-2 border-emerald-600 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium">
                    Now (ASAP)
                  </button>
                  <button className="border border-slate-200 hover:border-emerald-300 py-2 rounded-lg text-sm font-medium text-slate-600">
                    Today, 2:00 PM
                  </button>
                  <button className="border border-slate-200 hover:border-emerald-300 py-2 rounded-lg text-sm font-medium text-slate-600">
                    Today, 4:00 PM
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Service Fee</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Est. Energy (30kWh)</span>
                <span>$12.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Distance Charge</span>
                <span>$3.50</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between font-bold text-lg">
                <span>Total Est.</span>
                <span>$20.50</span>
              </div>
              
              <div className="bg-slate-800 p-3 rounded-lg text-xs text-slate-300 flex gap-2">
                <Clock className="h-4 w-4 shrink-0 text-emerald-400" />
                Estimated arrival time: 15-20 mins
              </div>

              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-12"
                onClick={handleBook}
                isLoading={loading}
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
