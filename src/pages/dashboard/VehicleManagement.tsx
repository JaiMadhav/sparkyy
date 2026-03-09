import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Car, Plus, Trash2, AlertCircle, X } from "lucide-react";
import { vehicleService } from "@/services/vehicleService";
import { VEHICLE_DATA, YEARS } from "@/data/vehicleData";

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState({ 
    make: "", 
    model: "", 
    year: "", 
    registration_number: "" 
  });

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
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const vehiclePayload = {
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year, // Let the service handle type coercion
        registration_number: newVehicle.registration_number,
      };

      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      setVehicles(prev => [{ ...vehiclePayload, id: tempId }, ...prev]);
      setIsAdding(false);
      setNewVehicle({ make: "", model: "", year: "", registration_number: "" });

      await vehicleService.addVehicle(vehiclePayload);
      loadVehicles(); // Refresh to get the real ID from DB
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      setErrorMsg(error.message || "Failed to add vehicle. Please try again.");
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
      // Re-fetch to ensure sync with server
      loadVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      // Re-fetch to restore state if deletion failed
      loadVehicles();
    }
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewVehicle({ 
      ...newVehicle, 
      make: e.target.value, 
      model: "" // Reset model when make changes
    });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Vehicles</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your electric vehicles for charging.</p>
        </div>
        {/* Top Add Vehicle button removed as requested */}
      </div>

      {isAdding && (
        <Card className="mb-8 border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Add New Vehicle</CardTitle>
              <CardDescription>Enter your vehicle details below.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Make</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50"
                  value={newVehicle.make}
                  onChange={handleMakeChange}
                  required
                >
                  <option value="">Select Make</option>
                  {Object.keys(VEHICLE_DATA).map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50"
                  value={newVehicle.model}
                  onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                  required
                  disabled={!newVehicle.make}
                >
                  <option value="">Select Model</option>
                  {newVehicle.make && VEHICLE_DATA[newVehicle.make]?.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50"
                  value={newVehicle.year}
                  onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
                  required
                >
                  <option value="">Select Year</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <Input 
                label="Registration Number" 
                placeholder="e.g. KA 01 AB 1234" 
                value={newVehicle.registration_number}
                onChange={e => setNewVehicle({...newVehicle, registration_number: e.target.value.toUpperCase()})}
                required
              />

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Save Vehicle</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Vehicle Card (Always visible at the end or beginning? Let's put it at the end or as a floating button? 
            The user said "only one add vehicle button". 
            If I put it as a card, it acts as a button.
        */}
        
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <CardHeader className="flex flex-row items-start justify-between pb-2 pl-6">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                <Car className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(vehicle.id);
                }}
              >
                <Trash2 className="h-4 w-4 pointer-events-none" />
              </Button>
            </CardHeader>
            <CardContent className="pl-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{vehicle.make} {vehicle.model}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">{vehicle.registration_number}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">Year: {vehicle.year}</div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Vehicle Card Button */}
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all group"
          >
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-4">
              <Plus className="h-8 w-8 text-emerald-600" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white">Add New Vehicle</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Vehicle</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to remove this vehicle? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setVehicleToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
