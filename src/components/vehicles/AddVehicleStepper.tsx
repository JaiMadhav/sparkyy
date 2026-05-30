import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { VehicleTypeIcon, VehicleType } from "./VehicleTypeIcon";
import { VEHICLE_CONFIG } from "@/data/vehicleConfig";

interface AddVehicleStepperProps {
  onCancel: () => void;
  onSave: (vehicle: any) => Promise<void>;
}

export function AddVehicleStepper({ onCancel, onSave }: AddVehicleStepperProps) {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState<{
    vehicle_type: VehicleType | "";
    make: string;
    model: string;
    year: string;
    registration_number: string;
  }>({
    vehicle_type: "",
    make: "",
    model: "",
    year: "",
    registration_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const isStepValid = () => {
    switch (step) {
      case 1: return !!vehicle.vehicle_type;
      case 2: return !!vehicle.make;
      case 3: return !!vehicle.model;
      case 4: return !!vehicle.year;
      case 5: {
        const clean = vehicle.registration_number.replace(/[-\s]/g, '');
        const regRegex = /^(?:[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$/;
        return !!clean && regRegex.test(clean);
      }
      default: return true;
    }
  };

  const formatRegNumber = (reg: string) => {
    const clean = reg.replace(/[-\s]/g, '').toUpperCase();
    if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(clean)) {
        const match = clean.match(/^([A-Z]{2})([0-9]{1,2})([A-Z]{1,3})([0-9]{4})$/);
        if (match) return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
    }
    if (/^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/.test(clean)) {
        const match = clean.match(/^([0-9]{2})(BH)([0-9]{4})([A-Z]{1,2})$/);
        if (match) return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
    }
    return reg.toUpperCase();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...vehicle,
        registration_number: formatRegNumber(vehicle.registration_number)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const POPULAR_MAKES: Record<string, string[]> = {
    "2W": ["Ola", "Ather", "TVS", "Bajaj", "Hero", "Revolt"],
    "3W": ["Mahindra", "Piaggio", "Euler", "Altigreen", "Bajaj"],
    "4W": ["Tata", "Mahindra", "MG", "Hyundai", "Kia", "BYD"]
  };

  const makes = vehicle.vehicle_type 
      ? Object.keys(VEHICLE_CONFIG[vehicle.vehicle_type as keyof typeof VEHICLE_CONFIG] || {}).filter(m => POPULAR_MAKES[vehicle.vehicle_type as string]?.includes(m))
      : [];
  const models = (vehicle.vehicle_type && vehicle.make && vehicle.make !== "Other") 
      ? Object.keys((VEHICLE_CONFIG[vehicle.vehicle_type as keyof typeof VEHICLE_CONFIG] as any)[vehicle.make] || {}) 
      : [];
  const years = (vehicle.vehicle_type && vehicle.make && vehicle.model && vehicle.make !== "Other" && vehicle.model !== "Other") 
      ? (VEHICLE_CONFIG[vehicle.vehicle_type as keyof typeof VEHICLE_CONFIG] as any)[vehicle.make]?.[vehicle.model] || ["2026", "2025", "2024", "2023", "2022", "2021", "2020"]
      : ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-bold text-white mb-6">Select Vehicle Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["2W", "3W", "4W"] as const).map((type) => (
                <div 
                  key={type}
                  onClick={() => { setVehicle({ ...vehicle, vehicle_type: type, make: "", model: "", year: "" }); nextStep(); }}
                  className={`p-6 rounded-2xl border cursor-pointer border-slate-700 bg-slate-900 border-slate-800 transition-all text-center flex flex-col items-center gap-4 ${vehicle.vehicle_type === type ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950" : "hover:border-emerald-500 hover:bg-emerald-500/5"}`}
                >
                  <VehicleTypeIcon type={type} size={48} />
                  <span className="font-semibold text-white tracking-wide">{type} EV</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-bold text-white mb-6">Select Make</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {makes.map((make) => (
                <div 
                  key={make}
                  onClick={() => { setVehicle({ ...vehicle, make, model: "", year: "" }); nextStep(); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all text-center ${vehicle.make === make ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/5"}`}
                >
                  <span className="font-medium text-slate-200">{make}</span>
                </div>
              ))}
              <div 
                onClick={() => { setVehicle({ ...vehicle, make: "Other", model: "", year: "" }); nextStep(); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all text-center ${vehicle.make === "Other" ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/5"}`}
              >
                  <span className="font-medium text-slate-400">Other</span>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-bold text-white mb-6">Select Model</h3>
            {models.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {models.map((model: string) => (
                  <div 
                    key={model}
                    onClick={() => { setVehicle({ ...vehicle, model, year: "" }); nextStep(); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-center ${vehicle.model === model ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/5"}`}
                  >
                    <span className="font-medium text-slate-200">{model}</span>
                  </div>
                ))}
                <div 
                  onClick={() => { setVehicle({ ...vehicle, model: "Other", year: "" }); nextStep(); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all text-center ${vehicle.model === "Other" ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/5"}`}
                >
                  <span className="font-medium text-slate-400">Other</span>
                </div>
            </div>
            ) : (
                <div className="space-y-4 max-w-md">
                    <Input 
                        placeholder="Enter model manually" 
                        value={vehicle.model}
                        onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                        autoFocus
                    />
                    <Button onClick={nextStep} disabled={!vehicle.model} className="w-full">Continue</Button>
                </div>
            )}
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-bold text-white mb-6">Select Year</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {years.map((year: string) => (
                <div 
                  key={year}
                  onClick={() => { setVehicle({ ...vehicle, year }); nextStep(); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all text-center ${vehicle.year === year ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/5"}`}
                >
                  <span className="font-medium text-slate-200">{year}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Final Details</h3>
            <div className="space-y-1">
              <Input 
                  label="Registration Number" 
                  placeholder="e.g. MH 01 AB 1234" 
                  value={vehicle.registration_number}
                  onChange={(e) => setVehicle({ ...vehicle, registration_number: e.target.value.toUpperCase() })}
                  required
              />
              {vehicle.registration_number && !/^(?:[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$/.test(vehicle.registration_number.replace(/[-\s]/g, '')) && (
                <p className="text-xs font-medium text-amber-400 text-amber-600 pl-1 mt-1">Please enter a valid format (e.g. MH 01 AB 1234 or 21 BH 1234 AA)</p>
              )}
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">Review Details</h3>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 max-w-md mx-auto space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">Type</span>
                <span className="text-white font-medium flex items-center gap-2"><VehicleTypeIcon type={vehicle.vehicle_type} size={16} /> {vehicle.vehicle_type}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">Make</span>
                <span className="text-white font-medium">{vehicle.make}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">Model</span>
                <span className="text-white font-medium">{vehicle.model}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">Year</span>
                <span className="text-white font-medium">{vehicle.year}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-slate-400">Reg No</span>
                <span className="text-white font-mono font-medium tracking-wide bg-slate-800 px-3 py-1 rounded-md border border-slate-700">{formatRegNumber(vehicle.registration_number)}</span>
              </div>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-slate-950 min-h-[400px] border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-800"}`} />
        ))}
      </div>
      
      <div className="min-h-[250px]">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-between pt-6 border-t border-slate-800">
        <Button variant="ghost" onClick={step === 1 ? onCancel : prevStep} className="text-slate-400">
          {step === 1 ? "Cancel" : <><ChevronLeft className="mr-2 h-4 w-4" /> Back</>}
        </Button>
        {step < 6 ? (
          <Button onClick={nextStep} disabled={!isStepValid()} className={step === 5 ? "w-32" : ""}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} isLoading={isSubmitting} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8">
            Confirm & Add Vehicle
          </Button>
        )}
      </div>
    </div>
  );
}
