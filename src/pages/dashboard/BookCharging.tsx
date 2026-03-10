import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MapPin, Car, Navigation, Loader2 } from "lucide-react";
import { vehicleService } from "@/services/vehicleService";
import { bookingService } from "@/services/bookingService";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vanIconAvailable = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vanIconBusy = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeVanIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultCenter: [number, number] = [28.6139, 77.2090]; // Delhi

type VanStatus = 'available' | 'assigned' | 'charging' | 'unavailable';

interface Van {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: VanStatus;
}

// 15 fixed charging van locations in Delhi with initial status
const INITIAL_VANS: Van[] = [
  { id: 'v1', lat: 28.6129, lng: 77.2295, name: 'Van 1 - India Gate', status: 'available' },
  { id: 'v2', lat: 28.6304, lng: 77.2177, name: 'Van 2 - CP', status: 'assigned' }, // Simulate busy van
  { id: 'v3', lat: 28.5562, lng: 77.1000, name: 'Van 3 - Airport', status: 'available' },
  { id: 'v4', lat: 28.5244, lng: 77.1855, name: 'Van 4 - Qutub Minar', status: 'available' },
  { id: 'v5', lat: 28.6505, lng: 77.2303, name: 'Van 5 - Red Fort', status: 'charging' }, // Simulate busy van
  { id: 'v6', lat: 28.5921, lng: 77.3173, name: 'Van 6 - Noida Border', status: 'available' },
  { id: 'v7', lat: 28.6448, lng: 77.1295, name: 'Van 7 - Rajouri Garden', status: 'available' },
  { id: 'v8', lat: 28.7041, lng: 77.1025, name: 'Van 8 - Rohini', status: 'unavailable' }, // Simulate offline van
  { id: 'v9', lat: 28.5355, lng: 77.2410, name: 'Van 9 - GK', status: 'available' },
  { id: 'v10', lat: 28.5800, lng: 77.1550, name: 'Van 10 - Vasant Vihar', status: 'available' },
  { id: 'v11', lat: 28.6833, lng: 77.2000, name: 'Van 11 - Civil Lines', status: 'available' },
  { id: 'v12', lat: 28.6200, lng: 77.0900, name: 'Van 12 - Janakpuri', status: 'available' },
  { id: 'v13', lat: 28.5600, lng: 77.2800, name: 'Van 13 - Okhla', status: 'available' },
  { id: 'v14', lat: 28.6600, lng: 77.3000, name: 'Van 14 - Anand Vihar', status: 'available' },
  { id: 'v15', lat: 28.6000, lng: 77.0500, name: 'Van 15 - Dwarka', status: 'available' },
];

// Pricing Model Constants
const BASE_SERVICE_FEE = 200.00; // ₹200
const DISPATCH_COST_PER_KM = 12.00; // ₹12 per km
const CHARGING_COST_PER_KWH = 20.00; // ₹20 per kWh

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// Component to handle map clicks
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.5 });
    }
  }, [center, map, zoom]);
  return null;
}

export default function BookCharging() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [scheduledTime, setScheduledTime] = useState<string>("now");
  const [energyRequired, setEnergyRequired] = useState<number>(30);
  
  const [locationSearch, setLocationSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Maps state
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Van Tracking State
  const [vans, setVans] = useState<Van[]>(INITIAL_VANS);
  const [allocatedVan, setAllocatedVan] = useState<Van | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0); // in km
  const [routeDuration, setRouteDuration] = useState<string>(""); // e.g. "15 mins"
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeVanPosition, setActiveVanPosition] = useState<[number, number] | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationStatus, setSimulationStatus] = useState<string>("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
      if (data.length > 0) {
        setSelectedVehicleId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
    }
  };

  const calculateTotalCost = (distance: number, energy: number) => {
    const distanceCharge = distance * DISPATCH_COST_PER_KM;
    const energyCost = energy * CHARGING_COST_PER_KWH;
    return BASE_SERVICE_FEE + energyCost + distanceCharge;
  };

  const allocateBestVan = useCallback(async (userLat: number, userLng: number, energy: number) => {
    // 1. Filter available vans
    const availableVans = vans.filter(van => van.status === 'available');

    if (availableVans.length === 0) {
      alert("No charging vans are currently available. Please try again later.");
      setAllocatedVan(null);
      return;
    }

    let bestVan: Van | null = null;
    let lowestCost = Infinity;
    let bestDistance = 0;
    let bestRoutePath: [number, number][] = [];
    let bestRouteDuration = "";

    // 2. Find the 3 closest vans using straight-line distance to avoid OSRM rate limits
    const vansWithStraightDistance = availableVans.map(van => ({
      van,
      distance: getDistanceFromLatLonInKm(userLat, userLng, van.lat, van.lng)
    }));
    
    vansWithStraightDistance.sort((a, b) => a.distance - b.distance);
    const topVans = vansWithStraightDistance.slice(0, 3).map(v => v.van);

    // 3. Evaluate the top vans using OSRM to find the shortest actual driving distance
    const routePromises = topVans.map(async (van) => {
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${van.lng},${van.lat};${userLng},${userLat}?overview=full&geometries=geojson`);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = route.distance / 1000;
          return { van, distanceKm, route };
        }
      } catch (e) {
        console.error("Error fetching route for van", van.id, e);
      }
      // Fallback to straight line if OSRM fails for this van
      const straightLineDistance = getDistanceFromLatLonInKm(userLat, userLng, van.lat, van.lng);
      return { van, distanceKm: straightLineDistance, route: null };
    });

    const results = await Promise.all(routePromises);

    results.forEach(result => {
      const estimatedCost = calculateTotalCost(result.distanceKm, energy);
      if (estimatedCost < lowestCost) {
        lowestCost = estimatedCost;
        bestVan = result.van;
        bestDistance = result.distanceKm;
        if (result.route) {
          const path: [number, number][] = result.route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          bestRoutePath = path;
          const durationMinutes = Math.round(result.route.duration / 60);
          bestRouteDuration = `${durationMinutes} mins`;
        } else {
          bestRoutePath = [[result.van.lat, result.van.lng], [userLat, userLng]];
          bestRouteDuration = "Unknown";
        }
      }
    });

    if (bestVan) {
      setAllocatedVan(bestVan);
      setActiveVanPosition([bestVan!.lat, bestVan!.lng]);
      setRoutePath(bestRoutePath);
      setRouteDistance(bestDistance);
      setRouteDuration(bestRouteDuration);
    }
  }, [vans]);

  // Re-calculate allocation if energy required changes
  useEffect(() => {
    if (userPosition && !isSimulating) {
      allocateBestVan(userPosition[0], userPosition[1], energyRequired);
    }
  }, [energyRequired, userPosition, allocateBestVan, isSimulating]);


  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const pos: [number, number] = [lat, lon];
        setMapCenter(pos);
        setUserPosition(pos);
        setLocation(data[0].display_name);
        allocateBestVan(lat, lon, energyRequired);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      alert("Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationPermission = () => {
    setShowLocationModal(true);
  };

  const confirmLocationTracking = () => {
    setShowLocationModal(false);
    getCurrentLocation(false);
  };

  const fallbackToIPLocation = async () => {
    try {
      const pos = defaultCenter;
      setMapCenter(pos);
      setUserPosition(pos);
      setLocation(`${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}`);
      allocateBestVan(pos[0], pos[1], energyRequired);
    } catch (e) {
      console.error("Fallback location failed:", e);
    } finally {
      setIsLocating(false);
    }
  };

  const getCurrentLocation = (silent = false) => {
    if (!navigator.geolocation) {
      fallbackToIPLocation();
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
        setMapCenter(pos);
        setUserPosition(pos);
        
        // Reverse geocode to get alphabet location
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`);
          const data = await response.json();
          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation("Current Location");
          }
        } catch (e) {
          setLocation("Current Location");
        }
        
        allocateBestVan(pos[0], pos[1], energyRequired);
        setIsLocating(false);
      },
      (error) => {
        fallbackToIPLocation();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  const onMapClick = useCallback(async (lat: number, lng: number) => {
    if (!isSimulating) {
      const newPos: [number, number] = [lat, lng];
      setUserPosition(newPos);
      
      // Reverse geocode to get alphabet location
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          setLocation(data.display_name);
        } else {
          setLocation("Selected on Map");
        }
      } catch (e) {
        setLocation("Selected on Map");
      }
      
      allocateBestVan(lat, lng, energyRequired);
    }
  }, [allocateBestVan, isSimulating, energyRequired]);

  const updateVanStatus = (vanId: string, newStatus: VanStatus) => {
    setVans(prevVans => 
      prevVans.map(van => 
        van.id === vanId ? { ...van, status: newStatus } : van
      )
    );
  };

  const startSimulation = (bookingId: string) => {
    if (routePath.length === 0 || !allocatedVan) return;
    
    setIsSimulating(true);
    setSimulationStatus("Van is on the way...");
    
    // 6. Update status to assigned
    updateVanStatus(allocatedVan.id, 'assigned');
    
    let step = 0;
    const totalSteps = routePath.length;
    
    const interval = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(interval);
        
        // Arrived, start charging
        setSimulationStatus("Charging in progress...");
        updateVanStatus(allocatedVan.id, 'charging');
        setSimulationProgress(0);
        
        let chargeProgress = 0;
        const chargeInterval = setInterval(async () => {
          chargeProgress += 2;
          setSimulationProgress(chargeProgress);
          
          if (chargeProgress >= 100) {
            clearInterval(chargeInterval);
            
            // 7. After charging is completed, update status back to available
            setSimulationStatus("Charging completed!");
            updateVanStatus(allocatedVan.id, 'available');
            
            // Update booking status to pending_payment
            try {
              await bookingService.updateBookingStatus(bookingId, 'pending_payment');
            } catch (e) {
              console.error("Failed to update booking status to pending_payment:", e);
            }
            
            setTimeout(() => {
              setIsSimulating(false);
              setSimulationStatus("");
              setSimulationProgress(0);
              setCurrentStep(0);
              setAllocatedVan(null);
              setRoutePath([]);
              setActiveVanPosition(null);
              // Redirect to payment
              navigate('/dashboard/payment', { state: { bookingId: bookingId, amount: totalCost } });
            }, 2000);
          }
        }, 100); // 50 steps of 100ms = 5000ms
        
        return;
      }
      
      const point = routePath[step];
      setActiveVanPosition(point);
      setSimulationProgress(Math.round((step / totalSteps) * 100));
      setCurrentStep(step);
      step++;
    }, 200); // Move every 200ms
  };

  const handleBook = async () => {
    if (!selectedVehicleId) {
      alert("Please select a vehicle");
      return;
    }

    if (!userPosition) {
      alert("Please set your location on the map");
      return;
    }

    if (!allocatedVan) {
      alert("No vans available to allocate.");
      return;
    }

    setLoading(true);
    try {
      const booking = await bookingService.createBooking({
        vehicle_id: selectedVehicleId,
        location,
        scheduled_time: scheduledTime === "now" ? new Date().toISOString() : new Date(Date.now() + 3600000).toISOString(),
        estimated_price: totalCost,
        energy_requested: `${energyRequired}kWh`
      });
      
      startSimulation(booking.id);
      
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to create booking. Please try again.");
      setIsSimulating(false);
      updateVanStatus(allocatedVan.id, 'available'); // Revert status on failure
    } finally {
      setLoading(false);
    }
  };

  const distanceCharge = routeDistance * DISPATCH_COST_PER_KM;
  const energyCost = energyRequired * CHARGING_COST_PER_KWH;
  const totalCost = BASE_SERVICE_FEE + energyCost + distanceCharge;

  const getVanIcon = (van: Van) => {
    if (isSimulating && allocatedVan?.id === van.id) return activeVanIcon;
    if (van.status === 'available') return vanIconAvailable;
    return vanIconBusy;
  };

  return (
    <DashboardLayout>
      {/* Location Permission Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Navigation className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-lg">Location Permission</h3>
              </div>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                SPARK EV needs your permission to access your current location to find nearby charging vans. Do you want to allow this?
              </p>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowLocationModal(false)}>
                  Deny
                </Button>
                <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={confirmLocationTracking}>
                  Allow
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Book a Charge</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Request a mobile charging van to your location.</p>
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
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Select Vehicle</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((vehicle) => (
                    <div 
                      key={vehicle.id}
                      onClick={() => !isSimulating && setSelectedVehicleId(vehicle.id)}
                      className={`border p-4 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                        selectedVehicleId === vehicle.id 
                          ? "border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500" 
                          : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`p-2 rounded-full shadow-sm ${selectedVehicleId === vehicle.id ? "bg-white dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-800"}`}>
                        <Car className={`h-5 w-5 ${selectedVehicleId === vehicle.id ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${selectedVehicleId === vehicle.id ? "text-emerald-900 dark:text-emerald-300" : "text-slate-700 dark:text-slate-200"}`}>
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className={`text-xs ${selectedVehicleId === vehicle.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                          {vehicle.registration_number}
                        </p>
                      </div>
                      {selectedVehicleId === vehicle.id && (
                        <div className="ml-auto h-4 w-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-600 dark:border-slate-900"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Location</label>
                <div className="mb-3 space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search for a location..." 
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                      disabled={isSimulating}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleLocationSearch}
                      disabled={isSearching || isSimulating || !locationSearch.trim()}
                      className="bg-slate-800 hover:bg-slate-700 text-white"
                    >
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Button 
                      onClick={handleLocationPermission}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isLocating || isSimulating}
                    >
                      {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                      Track Current Location
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400 z-10" />
                    <Input 
                      className="pl-10 w-full bg-slate-50 dark:bg-slate-800 text-slate-500" 
                      value={location || "Click on the map or track location"}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative mt-4 h-[400px] z-0">
                  <MapContainer 
                    center={mapCenter} 
                    zoom={11} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    zoomControl={false}
                  >
                    <ZoomControl position="bottomright" />
                    <MapUpdater center={mapCenter} zoom={13} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEvents onMapClick={onMapClick} />

                    {/* User Location Marker */}
                    {userPosition && (
                      <Marker position={userPosition} icon={userIcon}>
                        <Popup>Your Location</Popup>
                      </Marker>
                    )}

                    {/* All Vans */}
                    {!isSimulating && vans.map(van => (
                      <Marker 
                        key={van.id}
                        position={[van.lat, van.lng]}
                        icon={getVanIcon(van)}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>{van.name}</strong><br/>
                            Status: <span className={`capitalize ${van.status === 'available' ? 'text-emerald-600' : 'text-slate-500'}`}>{van.status}</span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Active Van (Moving) */}
                    {isSimulating && activeVanPosition && (
                      <Marker position={activeVanPosition} icon={activeVanIcon}>
                        <Popup>Dispatched Van ({allocatedVan?.name})</Popup>
                      </Marker>
                    )}

                    {/* Route */}
                    {routePath.length > 0 && (
                      <Polyline 
                        positions={routePath.slice(currentStep)} 
                        pathOptions={{ color: '#059669', weight: 5, opacity: 0.8 }} 
                      />
                    )}
                  </MapContainer>
                </div>
                
                {/* Map Legend */}
                <div className="flex gap-4 mt-3 text-xs text-slate-500 justify-center">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> You</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Available Van</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Busy/Offline</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Dispatched Van</div>
                </div>
              </div>

              {/* Energy Required */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Energy Required</label>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{energyRequired} kWh</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">10</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={energyRequired}
                    onChange={(e) => setEnergyRequired(Number(e.target.value))}
                    disabled={isSimulating}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-emerald-600"
                  />
                  <span className="text-xs text-slate-500">100</span>
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
              
              {allocatedVan ? (
                <div className="bg-slate-800 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-emerald-400 mb-2">Best Van Allocated</h4>
                  <p className="text-sm text-slate-300">{allocatedVan.name}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-slate-400">Distance:</span>
                    <span>{routeDistance.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-slate-400">ETA:</span>
                    <span>{routeDuration}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 p-4 rounded-lg mb-4 text-sm text-slate-400 text-center">
                  {userPosition ? "No available vans found." : "Set your location to find the best charging van."}
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Base Service Fee</span>
                <span>₹{BASE_SERVICE_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Dispatch (₹{DISPATCH_COST_PER_KM}/km)</span>
                <span>₹{distanceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Energy (₹{CHARGING_COST_PER_KWH}/kWh)</span>
                <span>₹{energyCost.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between font-bold text-lg">
                <span>Total Est.</span>
                <span>₹{totalCost.toFixed(2)}</span>
              </div>
              
              {isSimulating && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-emerald-400 mb-1">
                    <span>{simulationStatus}</span>
                    {simulationStatus === "Charging completed!" ? (
                      <span>100%</span>
                    ) : (
                      simulationProgress < 100 && <span>{simulationProgress}%</span>
                    )}
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${simulationStatus === "Charging completed!" ? 'bg-emerald-500 w-full' : simulationProgress === 100 ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} style={{ width: simulationStatus === "Charging completed!" ? '100%' : `${simulationProgress}%` }}></div>
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-12 mt-4"
                onClick={handleBook}
                isLoading={loading}
                disabled={!userPosition || !allocatedVan || isSimulating}
              >
                {isSimulating ? "Service in Progress" : "Book Charging"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

