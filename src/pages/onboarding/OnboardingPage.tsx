import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Zap, Car, CheckCircle2, ArrowRight } from "lucide-react";
import { vehicleService } from "@/services/vehicleService";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicleData, setVehicleData] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    type: "4-wheeler"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await vehicleService.addVehicle(vehicleData);
      handleNext();
    } catch (error) {
      console.error("Failed to add vehicle", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-300"}`}>
              1
            </div>
            <span className="ml-2 font-medium">Welcome</span>
          </div>
          <div className={`w-12 h-0.5 mx-4 ${step >= 2 ? "bg-emerald-600" : "bg-slate-300"}`}></div>
          <div className={`flex items-center ${step >= 2 ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-300"}`}>
              2
            </div>
            <span className="ml-2 font-medium">Add Vehicle</span>
          </div>
          <div className={`w-12 h-0.5 mx-4 ${step >= 3 ? "bg-emerald-600" : "bg-slate-300"}`}></div>
          <div className={`flex items-center ${step >= 3 ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-300"}`}>
              3
            </div>
            <span className="ml-2 font-medium">Ready</span>
          </div>
        </div>

        <Card className="border-none shadow-lg dark:bg-slate-950">
          {step === 1 && (
            <div className="text-center p-8">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full inline-block mb-6">
                <Zap className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Welcome to SPARK!</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
                We're excited to help you charge your EV anywhere, anytime. Let's get your profile set up in just a few seconds.
              </p>
              <Button size="lg" onClick={handleNext} className="w-full md:w-auto px-8">
                Let's Go <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Add your first vehicle</CardTitle>
                <CardDescription>To book a charge, we need to know what you drive.</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <form id="vehicle-form" onSubmit={handleAddVehicle} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Make" 
                      placeholder="e.g. Tesla" 
                      value={vehicleData.make}
                      onChange={e => setVehicleData({...vehicleData, make: e.target.value})}
                      required
                    />
                    <Input 
                      label="Model" 
                      placeholder="e.g. Model 3" 
                      value={vehicleData.model}
                      onChange={e => setVehicleData({...vehicleData, model: e.target.value})}
                      required
                    />
                    <Input 
                      label="Year" 
                      placeholder="e.g. 2023" 
                      type="number"
                      value={vehicleData.year}
                      onChange={e => setVehicleData({...vehicleData, year: e.target.value})}
                      required
                    />
                    <Input 
                      label="License Plate" 
                      placeholder="e.g. ABC-1234" 
                      value={vehicleData.licensePlate}
                      onChange={e => setVehicleData({...vehicleData, licensePlate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["2-wheeler", "3-wheeler", "4-wheeler"].map((type) => (
                        <div 
                          key={type}
                          onClick={() => setVehicleData({...vehicleData, type})}
                          className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
                            vehicleData.type === type 
                              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600" 
                              : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                          }`}
                        >
                          <Car className={`h-6 w-6 mx-auto mb-2 ${vehicleData.type === type ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                          <span className="text-sm font-medium capitalize">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="px-0 pb-0 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" form="vehicle-form" isLoading={isLoading}>
                  Save & Continue
                </Button>
              </CardFooter>
            </div>
          )}

          {step === 3 && (
            <div className="text-center p-8">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full inline-block mb-6 animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">You're All Set!</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
                Your vehicle has been added. You can now request a mobile charging van to your location instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleFinish} className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/dashboard/book")} className="w-full sm:w-auto">
                  Book First Charge
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
