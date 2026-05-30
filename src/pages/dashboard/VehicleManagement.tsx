import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { vehicleService } from "@/services/vehicleService";
import { AddVehicleStepper } from "@/components/vehicles/AddVehicleStepper";
import { VehicleTypeBadge } from "@/components/vehicles/VehicleTypeBadge";

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (vehiclePayload: any) => {
    setErrorMsg(null);
    try {
      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      setVehicles(prev => [{ ...vehiclePayload, id: tempId }, ...prev]);
      setIsAdding(false);

      await vehicleService.addVehicle(vehiclePayload);
      loadVehicles(); // Refresh to get the real ID from DB
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      setErrorMsg(error.message === 'Failed to fetch' ? 'Unable to connect to the server. Please check your internet connection and API keys.' : (error.message || "Failed to add vehicle. Please try again."));
      loadVehicles(); // Revert optimistic update on failure
    }
  };

  const handleDeleteClick = (id: string) => {
    setVehicleToDelete(id);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    const id = vehicleToDelete;
    setVehicleToDelete(null); // Close modal immediately
    
    try {
      // Optimistic update
      setVehicles(prev => prev.filter(v => v.id !== id));
      
      await vehicleService.deleteVehicle(id);
      loadVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      loadVehicles();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
          <p className="text-slate-400 mt-1">Manage your electric vehicles for charging.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-900 border border-slate-800 rounded-xl h-[180px]"></div>
          ))}
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {isAdding ? (
            <div className="mb-10 max-w-2xl mx-auto">
              <AddVehicleStepper onCancel={() => setIsAdding(false)} onSave={handleAddVehicle} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-md transition-shadow group relative overflow-hidden bg-slate-900 border-slate-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <CardHeader className="flex flex-row items-start justify-between pb-2 pl-6">
                    <VehicleTypeBadge type={vehicle.vehicle_type || "4W"} />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(vehicle.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 pointer-events-none" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pl-6">
                    <h3 className="text-lg font-bold text-white leading-tight">{vehicle.make} {vehicle.model}</h3>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-1">
                      <p className="text-sm text-slate-400 font-mono tracking-wider">{vehicle.registration_number}</p>
                      <div className="text-xs text-slate-500">Year: {vehicle.year}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <button 
                onClick={() => setIsAdding(true)}
                className="flex flex-col items-center justify-center h-full min-h-[220px] border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all group p-6"
              >
                <div className="bg-slate-800 p-4 rounded-full shadow-lg border border-white/5 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all mb-4">
                  <Plus className="h-8 w-8 text-emerald-500" />
                </div>
                <span className="font-semibold text-white tracking-wide">Add New Vehicle</span>
                <span className="text-sm text-slate-500 mt-1">Register a 2W, 3W, or 4W EV</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">Delete Vehicle</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to remove this vehicle? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setVehicleToDelete(null)} className="border-slate-700 hover:bg-slate-800">
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
