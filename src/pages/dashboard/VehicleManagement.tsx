import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Car, Plus, Trash2, AlertCircle } from "lucide-react";
import { vehicleService } from "@/services/vehicleService";

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make: "", model: "", year: "", licensePlate: "", type: "4-wheeler" });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const data = await vehicleService.getVehicles();
    setVehicles(data);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    await vehicleService.addVehicle(newVehicle);
    setIsAdding(false);
    setNewVehicle({ make: "", model: "", year: "", licensePlate: "", type: "4-wheeler" });
    loadVehicles();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this vehicle?")) {
      await vehicleService.deleteVehicle(id);
      loadVehicles();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Vehicles</h1>
          <p className="text-slate-500 mt-1">Manage your electric vehicles for charging.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-8 border-emerald-100 bg-emerald-50/50">
          <CardHeader>
            <CardTitle>Add New Vehicle</CardTitle>
            <CardDescription>Enter your vehicle details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Make" 
                placeholder="e.g. Tesla" 
                value={newVehicle.make}
                onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
                required
              />
              <Input 
                label="Model" 
                placeholder="e.g. Model 3" 
                value={newVehicle.model}
                onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                required
              />
              <Input 
                label="Year" 
                placeholder="e.g. 2023" 
                type="number"
                value={newVehicle.year}
                onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
                required
              />
              <Input 
                label="License Plate" 
                placeholder="e.g. ABC-1234" 
                value={newVehicle.licensePlate}
                onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                required
              />
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Vehicle Type</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  value={newVehicle.type}
                  onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                >
                  <option value="2-wheeler">2-Wheeler (Scooter/Bike)</option>
                  <option value="3-wheeler">3-Wheeler (Auto)</option>
                  <option value="4-wheeler">4-Wheeler (Car)</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Save Vehicle</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Car className="h-6 w-6 text-slate-600" />
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wide">
                {vehicle.type}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold text-slate-900">{vehicle.make} {vehicle.model}</h3>
              <p className="text-sm text-slate-500">{vehicle.year} • {vehicle.licensePlate}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400">Added on Oct 12, 2023</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  onClick={() => handleDelete(vehicle.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {vehicles.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
              <Car className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No vehicles added yet</h3>
            <p className="text-slate-500 mb-6">Add your first EV to start booking charges.</p>
            <Button onClick={() => setIsAdding(true)}>Add Vehicle</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
