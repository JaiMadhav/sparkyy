const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query || !text) return <>{text}</>;
  const parts = text.split(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
  );
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={i}
            className="text-emerald-600 dark:text-emerald-400 font-bold"
          >
            {part}
          </span>
        ) : (
          <span key={i} className="text-slate-100 dark:text-slate-100">
            {part}
          </span>
        ),
      )}
    </>
  );
};

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Navigation,
  Loader2,
  Battery,
  Car,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Clock,
  Zap,
  X,
  Plane,
  Info,
} from "lucide-react";
import { vehicleService } from "@/services/vehicleService";
import { bookingService } from "@/services/bookingService";
import { supabase } from "@/supabaseClient";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  ZoomControl,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "motion/react";
import { VehicleTypeIcon } from "@/components/vehicles/VehicleTypeIcon";

// Leaflet Icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const startPositionIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const createVanIcon = (rotation: number = 0) =>
  new L.DivIcon({
    html: `<div class="van-rotator" style="transform: rotate(${rotation}deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transform-origin: center center;">
    <div style="width: 26px; height: 56px; position: relative; filter: drop-shadow(0px 8px 12px rgba(0,0,0,0.5)); transform: scale(1.1);">
      <div style="position: absolute; inset: 0; background: linear-gradient(90deg, #E2E8F0 0%, #FFFFFF 25%, #FFFFFF 75%, #F1F5F9 100%); border-radius: 8px 8px 6px 6px; box-shadow: inset 0 0 2px rgba(255,255,255,1), inset 0 2px 4px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.3);"></div>
      <div style="position: absolute; top: 8px; left: 2px; right: 2px; height: 2px; background: rgba(0,0,0,0.05); border-radius: 100%;"></div>
      <div style="position: absolute; top: 2px; left: 4px; right: 4px; height: 6px; background: linear-gradient(90deg, #CBD5E1 0%, #F8FAFC 25%, #F8FAFC 75%, #E2E8F0 100%); border-radius: 4px 4px 2px 2px;"></div>
      <div style="position: absolute; top: 12px; left: 3px; right: 3px; height: 10px; background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%); border-radius: 3px 3px 0 0; border-top: 1px solid rgba(255,255,255,0.3);">
        <div style="position: absolute; top: 2px; left: 2px; width: 6px; height: 6px; background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%); border-radius: 2px;"></div>
      </div>
      <div style="position: absolute; top: 22px; left: 3px; right: 3px; height: 24px; background: linear-gradient(90deg, #F8FAFC 0%, #FFFFFF 25%, #FFFFFF 75%, #F8FAFC 100%); border-radius: 3px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8), 0 -1px 3px rgba(0,0,0,0.1);"></div>
      <div style="position: absolute; bottom: 8px; left: 4px; right: 4px; height: 6px; background: #0F172A; border-radius: 0 0 2px 2px;"></div>
      <div style="position: absolute; bottom: 1px; left: 2px; width: 6px; height: 3px; background: radial-gradient(circle, #EF4444 40%, #B91C1C 100%); border-radius: 2px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.6);"></div>
      <div style="position: absolute; bottom: 1px; right: 2px; width: 6px; height: 3px; background: radial-gradient(circle, #EF4444 40%, #B91C1C 100%); border-radius: 2px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.6);"></div>
      <div style="position: absolute; top: 1px; left: 1px; width: 6px; height: 3px; background: radial-gradient(circle, #FEF08A 40%, #FBBF24 100%); border-radius: 2px 2px 1px 1px; box-shadow: 0 -2px 6px rgba(254, 240, 138, 0.8);"></div>
      <div style="position: absolute; top: 1px; right: 1px; width: 6px; height: 3px; background: radial-gradient(circle, #FEF08A 40%, #FBBF24 100%); border-radius: 2px 2px 1px 1px; box-shadow: 0 -2px 6px rgba(254, 240, 138, 0.8);"></div>
    </div>
  </div>`,
    className: "",
    iconSize: [40, 70],
    iconAnchor: [20, 35],
    popupAnchor: [0, -35],
  });

const idleVanIcon = new L.DivIcon({
  html: `<div style="opacity: 0.5; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; filter: grayscale(100%); transform: scale(0.9);">
    <div style="width: 26px; height: 56px; position: relative; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
      <div style="position: absolute; inset: 0; background: linear-gradient(90deg, #E2E8F0 0%, #FFFFFF 25%, #FFFFFF 75%, #F1F5F9 100%); border-radius: 8px 8px 6px 6px;"></div>
      <div style="position: absolute; top: 12px; left: 3px; right: 3px; height: 10px; background: #475569; border-radius: 3px 3px 0 0;"></div>
      <div style="position: absolute; top: 22px; left: 3px; right: 3px; height: 24px; background: linear-gradient(90deg, #F8FAFC 0%, #FFFFFF 25%, #FFFFFF 75%, #F8FAFC 100%); border-radius: 3px;"></div>
      <div style="position: absolute; bottom: 8px; left: 4px; right: 4px; height: 6px; background: #475569; border-radius: 0 0 2px 2px;"></div>
    </div>
  </div>`,
  className: "idle-van",
  iconSize: [36, 60],
  iconAnchor: [18, 30],
  popupAnchor: [0, -30],
});

const defaultCenter: [number, number] = [28.6139, 77.209]; // Delhi NCR Base
const PRIMARY_VAN_NAME = "Spark-MVP-01";

const MAX_CAPACITY: Record<string, number> = { "2W": 3, "3W": 8, "4W": 30 };

const formatVanStatus = (status: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "available") return "Available";
  if (normalized === "enroute" || normalized === "en route") return "En Route";
  if (normalized === "charging") return "Charging";
  if (normalized === "assigned") return "Assigned";
  return status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Available";
};

const VEHICLE_LOGISTICS_CONFIG: Record<
  string,
  { capacity: number; efficiency: number }
> = {
  // 4W
  "Tiago EV": { capacity: 24, efficiency: 1.05 },
  "Nexon EV": { capacity: 30, efficiency: 1.05 },
  "Nexon EV Max": { capacity: 40.5, efficiency: 1.05 },
  "MG ZS EV": { capacity: 50.3, efficiency: 1.05 },
  XUV400: { capacity: 39.4, efficiency: 1.05 },
  "Comet EV": { capacity: 17.3, efficiency: 1.05 },
  "Ioniq 5": { capacity: 72.6, efficiency: 1.05 },
  "BYD Atto 3": { capacity: 60.48, efficiency: 1.05 },
  // 3W
  "Mahindra Treo": { capacity: 7.37, efficiency: 1.1 },
  "Piaggio Ape Electrik": { capacity: 8, efficiency: 1.1 },
  // 2W
  "Ola S1 Pro": { capacity: 3.98, efficiency: 1.15 },
  "Ola S1 Air": { capacity: 2.98, efficiency: 1.15 },
  "Ather 450X": { capacity: 3.7, efficiency: 1.15 },
  "TVS iQube": { capacity: 3.04, efficiency: 1.15 },
  "Bajaj Chetak": { capacity: 2.88, efficiency: 1.15 },
  "Vida V1 Pro": { capacity: 3.94, efficiency: 1.15 },
};

const PRICING_CONFIG: Record<
  string,
  {
    baseDispatchFee: number;
    distanceRateKm: number;
    timeRateMin: number;
    energyRateKWh: number;
    minOps: number;
    maxOps: number;
  }
> = {
  "2W": {
    baseDispatchFee: 15,
    distanceRateKm: 4,
    timeRateMin: 1.2,
    energyRateKWh: 10,
    minOps: 25,
    maxOps: 120,
  },
  "3W": {
    baseDispatchFee: 22,
    distanceRateKm: 6,
    timeRateMin: 1.5,
    energyRateKWh: 11,
    minOps: 38,
    maxOps: 160,
  },
  "4W": {
    baseDispatchFee: 84,
    distanceRateKm: 14,
    timeRateMin: 1.5,
    energyRateKWh: 12.5,
    minOps: 124,
    maxOps: 350,
  },
};

const GST_RATE = 0.18; // 18% GST

function MapEvents({
  onMapClick,
  disabled,
}: {
  onMapClick: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function MapUpdater({
  routeCoords,
  userLoc,
  allVans,
  allDepots,
  dispatchStatus,
}: {
  routeCoords: [number, number][];
  userLoc: [number, number] | null;
  allVans: any[];
  allDepots: any[];
  dispatchStatus: string;
}) {
  const map = useMap();
  const lastBounds = React.useRef<string | null>(null);

  useEffect(() => {
    let bounds = L.latLngBounds([]);
    if (dispatchStatus === "pending" || dispatchStatus === "failed") {
      if (userLoc) {
        bounds.extend(userLoc);
        if (allVans && allVans.length > 0) {
          allVans.forEach((v) => {
            if (v.current_latitude)
              bounds.extend([v.current_latitude, v.current_longitude]);
          });
        }
        if (allDepots && allDepots.length > 0) {
          allDepots.forEach((d) => {
            if (d.latitude) bounds.extend([d.latitude, d.longitude]);
          });
        }
      } else {
        // No location selected, focus strictly on depots and their service radius
        if (allDepots && allDepots.length > 0) {
          allDepots.forEach((d) => {
            if (d.latitude && d.longitude) {
              bounds.extend([d.latitude, d.longitude]);
              const strictRadius = 8;
              const radiusInDegreesLat = strictRadius / 111;
              const radiusInDegreesLng =
                strictRadius / (111 * Math.cos(d.latitude * (Math.PI / 180)));
              bounds.extend([
                d.latitude + radiusInDegreesLat,
                d.longitude + radiusInDegreesLng,
              ]);
              bounds.extend([
                d.latitude - radiusInDegreesLat,
                d.longitude - radiusInDegreesLng,
              ]);
            }
          });
        }
      }
    } else {
      if (userLoc) bounds.extend(userLoc);
      if (routeCoords && routeCoords.length > 0) {
        routeCoords.forEach((c) => bounds.extend(c));
      }
    }
    if (bounds.isValid()) {
      const padding =
        !userLoc &&
        (dispatchStatus === "pending" || dispatchStatus === "failed")
          ? [40, 40]
          : [80, 80];
      const r = (n: number) => Math.round(n * 100) / 100; // ~1.11km resolution for zoom snapping
      const roundedBboxStr = `${r(bounds.getSouth())},${r(bounds.getWest())},${r(bounds.getNorth())},${r(bounds.getEast())}`;
      const boundsStr = roundedBboxStr + padding.toString();

      if (lastBounds.current !== boundsStr) {
        lastBounds.current = boundsStr;
        map.flyToBounds(bounds, {
          padding: padding as [number, number],
          duration: 2.0,
          easeLinearity: 0.25,
          maxZoom: 16,
        });
      }
    }
  }, [routeCoords, userLoc, allVans, allDepots, map, dispatchStatus]);
  return null;
}

const customDepotIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function getDistance(p1: [number, number], p2: [number, number]) {
  const R = 6371e3;
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function AnimatedVanMarker({
  van,
  routeCoords,
  dispatchStatus,
  onArrived,
  isAssigned,
}: {
  van: any;
  routeCoords: [number, number][];
  dispatchStatus: string;
  onArrived: () => void;
  isAssigned: boolean;
}) {
  const markerRef = React.useRef<any>(null);
  const reqRef = React.useRef<number>(0);
  const angleRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (
      !markerRef.current ||
      !isAssigned ||
      dispatchStatus !== "enroute" ||
      routeCoords.length < 2
    )
      return;

    let totalDist = 0;
    const segmentDistances: number[] = [];
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const d = getDistance(routeCoords[i], routeCoords[i + 1]);
      totalDist += d;
      segmentDistances.push(d);
    }

    const DURATION_MS = 22000;
    const speed = totalDist / DURATION_MS;
    let startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed >= DURATION_MS) {
        onArrived();
        return;
      }

      const distanceCovered = elapsed * speed;
      let accumulated = 0;
      let currentSegmentIdx = 0;

      for (let i = 0; i < segmentDistances.length; i++) {
        if (accumulated + segmentDistances[i] >= distanceCovered) {
          currentSegmentIdx = i;
          break;
        }
        accumulated += segmentDistances[i];
      }

      const p1 = routeCoords[currentSegmentIdx];
      const p2 =
        routeCoords[Math.min(currentSegmentIdx + 1, routeCoords.length - 1)];
      const segmentLength = segmentDistances[currentSegmentIdx];

      let progress = 0;
      if (segmentLength > 0) {
        progress = (distanceCovered - accumulated) / segmentLength;
      }

      const lat = p1[0] + (p2[0] - p1[0]) * progress;
      const lng = p1[1] + (p2[1] - p1[1]) * progress;

      const marker = markerRef.current;
      if (marker) {
        marker.setLatLng([lat, lng]);
        if (p1[0] !== p2[0] || p1[1] !== p2[1]) {
          const dy = p2[0] - p1[0];
          const dx = p2[1] - p1[1];
          const theta = Math.atan2(dx, dy);
          let targetAngle = (theta * 180) / Math.PI;

          if (angleRef.current === null) {
            angleRef.current = targetAngle;
          } else {
            let currentAngle = angleRef.current;
            // Handle negative modulo correctly in JS
            let normalizedCurrent = ((currentAngle % 360) + 360) % 360;
            let diff = targetAngle - normalizedCurrent;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            // Smooth turning (Uber-like weight, glides towards target instead of snapping)
            // Only rotate if the difference is larger than a tiny threshold to prevent micro-jitter
            if (Math.abs(diff) > 1) {
              angleRef.current = currentAngle + diff * 0.08; // 8% per frame lag
            }
          }

          const iconEl = marker.getElement();
          if (iconEl) {
            const innerDiv = iconEl.querySelector(
              ".van-rotator",
            ) as HTMLElement;
            if (innerDiv) {
              innerDiv.style.transform = `rotate(${angleRef.current}deg)`;
            }
          }
        }
      }
      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    // Sync live location to database every 2 seconds
    const updateInterval = setInterval(async () => {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        try {
          await supabase
            .from("charging_vans")
            .update({
              current_latitude: lat,
              current_longitude: lng,
              current_status: "enroute",
            })
            .eq("id", van.id);
        } catch (e) {
          console.error("Live sync failed", e);
        }
      }
    }, 2000);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      clearInterval(updateInterval);
    };
  }, [routeCoords, dispatchStatus, isAssigned, onArrived, van.id]);

  const initPos =
    isAssigned && routeCoords.length > 0
      ? routeCoords[0]
      : [van.current_latitude, van.current_longitude];

  return (
    <Marker
      ref={markerRef}
      position={initPos as [number, number]}
      icon={isAssigned ? createVanIcon(0) : idleVanIcon}
    >
      <Popup className="bg-slate-900 border border-slate-800 text-white shadow-xl rounded-lg overflow-hidden">
        <div className="font-bold whitespace-nowrap">
          {van.van_name}
        </div>
        <div
          className={
            van.current_status === "available" || van.current_status === "assigned"
              ? "text-emerald-600 dark:text-emerald-400"
              : van.current_status === "enroute"
              ? "text-amber-400"
              : van.current_status === "charging"
              ? "text-sky-400"
              : "text-slate-400"
          }
        >
          {formatVanStatus(van.current_status)}
        </div>
      </Popup>
    </Marker>
  );
}

export default function BookCharging() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Step 1 State
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [currentBattery, setCurrentBattery] = useState<number>(20);
  const [targetBattery, setTargetBattery] = useState<number>(80);

  const maxTargetCharge = selectedVehicle?.vehicle_type === "4W" ? 80 : 90;

  // Step 2 State
  const [location, setLocation] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [dispatchEvaluation, setDispatchEvaluation] = useState<any>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string>("pending");
  const [fleetData, setFleetData] = useState<{
    allVans: any[];
    allDepots: any[];
  } | null>(null);
  const visibleVans = (fleetData?.allVans || []).filter(
    (van) => van.van_name === PRIMARY_VAN_NAME,
  );
  const [chargeProgress, setChargeProgress] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [resumedBooking, setResumedBooking] = useState<any>(null);
  const [showMapLegend, setShowMapLegend] = useState(false);
  const dispatchIdRef = React.useRef<number>(0);

  const handleVanArrived = useCallback(() => {
    setDispatchStatus("arrived");
    setTimeout(() => setDispatchStatus("charging"), 1500);
  }, []);

  useEffect(() => {
    const resumeBooking = async () => {
      const stateBookingId = locationState.state?.bookingId;
      if (stateBookingId && !bookingId) {
        try {
          const booking = await bookingService.getBookingById(stateBookingId);
          if (booking && ["assigned", "enroute", "arrived", "charging", "pending", "evaluating", "searching", "preview"].includes(booking.status)) {
            setBookingId(booking.id);
            setDispatchStatus(["pending", "evaluating", "searching", "preview"].includes(booking.status) ? "assigned" : booking.status);
            
            if (booking.latitude && booking.longitude) {
               setUserPosition([booking.latitude, booking.longitude]);
               setLocation(booking.location || "");
            }
            if (booking.vehicle) {
               setSelectedVehicle(booking.vehicle);
            }
            setResumedBooking(booking);
            setStep(3); // Jump straight to tracking map
            
            // Re-bind to van (only the single MVP van)
            const { data: vans } = await supabase
              .from('charging_vans')
              .select('*')
              .eq('active_booking_id', booking.id)
              .eq('van_name', PRIMARY_VAN_NAME);
            if (vans && vans.length > 0) {
                const van = vans[0];
                setDispatchEvaluation({
                    feasible: true,
                    van: van
                });
                if (booking.latitude && booking.longitude && van.current_latitude && van.current_longitude) {
                   try {
                     const response = await fetch(
                        `/api/proxy/osrm/route?coordinates=${van.current_longitude},${van.current_latitude};${booking.longitude},${booking.latitude}`
                      );
                      const routeData = await response.json();
                      if (routeData.routes && routeData.routes.length > 0) {
                        const coords = routeData.routes[0].geometry.coordinates.map((c: any) => [
                          c[1],
                          c[0],
                        ]);
                        setRouteCoords(coords);
                      }
                   } catch(e) {}
                }
            }
          }
        } catch(e) {
          console.error("Failed to resume booking:", e);
        }
      }
    };
    resumeBooking();
  }, [locationState.state]);

  useEffect(() => {
    if (bookingId && ["assigned", "enroute", "arrived", "charging"].includes(dispatchStatus)) {
      bookingService.updateBookingStatus(bookingId, dispatchStatus).catch(e => console.error("Failed to sync status", e));
    }
  }, [dispatchStatus, bookingId]);

  useEffect(() => {
    if (dispatchStatus === "assigned") {
      setTimeout(() => setDispatchStatus("enroute"), 1000);
    }
  }, [dispatchStatus]);

  useEffect(() => {
    if (dispatchStatus === "charging") {
      if (dispatchEvaluation?.van?.id) {
        supabase
          .from("charging_vans")
          .update({ current_status: "charging" })
          .eq("id", dispatchEvaluation.van.id)
          .then();
      }
      setChargeProgress(0);
      let p = 0;
      const interval = setInterval(() => {
        p += 1; // 1% per interval
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setTimeout(async () => {
            setDispatchStatus("pending_payment");
            if (dispatchEvaluation?.van?.id) {
              const vanId = dispatchEvaluation.van.id;
              const depotId = dispatchEvaluation.van.depot_id;

              // Fetch latest session count to decide if returning to depot
              supabase
                .from("charging_vans")
                .select("sessions_completed_today, max_sessions_per_day")
                .eq("id", vanId)
                .single()
                .then(({ data }) => {
                  if (data) {
                    if (
                      data.sessions_completed_today >= data.max_sessions_per_day
                    ) {
                      // Return to depot
                      supabase
                        .from("depots")
                        .select("latitude, longitude")
                        .eq("id", depotId)
                        .single()
                        .then(({ data: depotData }) => {
                          if (depotData) {
                            supabase
                              .from("charging_vans")
                              .update({
                                current_status: "returning",
                                current_latitude: depotData.latitude,
                                current_longitude: depotData.longitude,
                              })
                              .eq("id", vanId)
                              .then();
                          }
                        });
                    } else {
                      supabase
                        .from("charging_vans")
                        .update({ current_status: "available" })
                        .eq("id", vanId)
                        .then();
                    }
                  }
                });
            }
            if (bookingId) {
              try {
                await bookingService.updateBookingStatus(
                  bookingId,
                  "pending_payment",
                );
              } catch (e) {
                console.error("Failed to update status", e);
              }
            }
          }, 1500);
        }
        setChargeProgress(p);
      }, 250); // complete in 25 seconds
      return () => clearInterval(interval);
    }
  }, [dispatchStatus, bookingId, dispatchEvaluation]);

  useEffect(() => {
    const initFleet = async () => {
      try {
        const ds = await dispatchServiceRef();
        const fd = await ds.getInitialFleet();
        setFleetData(fd);
      } catch (e) {
        console.error("Failed to load generic fleet");
      }
    };
    initFleet();

    // Realtime subscription for live van locations across clients
    const subscription = supabase
      .channel("vans-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "charging_vans" },
        (payload) => {
          const payloadVan = payload.new as any;
          if (!payloadVan || payloadVan.van_name !== PRIMARY_VAN_NAME) {
            return;
          }
          setFleetData((prev) => {
            if (!prev) return prev;
            const now = new Date();
            const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
            const hours = istTime.getUTCHours();
            const isOutsideHours = hours < 9 || hours >= 21;

            const newVans = prev.allVans.map((v) => {
              if (v.id === payloadVan.id) {
                const updatedVan = { ...v, ...payloadVan };
                if (isOutsideHours && v.depots) {
                  updatedVan.current_latitude = v.depots.latitude;
                  updatedVan.current_longitude = v.depots.longitude;
                  updatedVan.current_status = "offline";
                }
                return updatedVan;
              }
              return v;
            });
            return { ...prev, allVans: newVans };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Google Maps Places Autocomplete Integration

  // Mappls / Photon Locality Search with Caching
  const searchCache = React.useRef<Record<string, any[]>>({});

  useEffect(() => {
    const query = locationSearch.trim().toLowerCase();

    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    if (!showSuggestions || query.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);

      // Delhi Specific Aliases for Mobility
      const aliases: Record<string, string> = {
        cp: "Connaught Place",
        rajiv: "Rajiv Chowk",
        ndls: "New Delhi Railway Station",
        t3: "Terminal 3 IGI Airport",
        "ig airport": "Indira Gandhi International Airport",
        "anand v": "Anand Vihar",
        "karol b": "Karol Bagh",
        "dwarka sec": "Dwarka Sector",
        "janakpuri west": "Janakpuri West",
      };

      let normalizedQuery = query;
      for (const [key, val] of Object.entries(aliases)) {
        if (query.includes(key)) {
          normalizedQuery = query.replace(key, val);
          break;
        }
      }

      const cacheKey = normalizedQuery.toLowerCase();
      if (searchCache.current[cacheKey]) {
        setSearchResults(searchCache.current[cacheKey]);
        setIsSearching(false);
        return;
      }

      try {
        // Configure Mappls / Photon search with STRICT India & Delhi NCR restrictions
        // India BBOX approx: 68.0,6.0,98.0,36.0
        // Delhi Center: 28.6139, 77.2090
        // We strongly bias to Delhi NCR using proximity and bbox
        const INDIA_BBOX = "68.0,6.0,98.0,36.0";
        const DELHI_LAT = "28.6139";
        const DELHI_LON = "77.2090";

        let fetchUrl = `/api/proxy/komoot/search?q=${encodeURIComponent(normalizedQuery)}&bbox=${INDIA_BBOX}&lat=${DELHI_LAT}&lon=${DELHI_LON}&limit=12`;

        // If query is small or generic, bias it with "Delhi" string implicitly
        if (
          normalizedQuery.split(" ").length < 3 &&
          !normalizedQuery.toLowerCase().includes("delhi") &&
          !normalizedQuery.toLowerCase().includes("noida") &&
          !normalizedQuery.toLowerCase().includes("gurugram")
        ) {
          fetchUrl = `/api/proxy/komoot/search?q=${encodeURIComponent(normalizedQuery + " Delhi")}&bbox=${INDIA_BBOX}&lat=${DELHI_LAT}&lon=${DELHI_LON}&limit=12`;
        }

        const response = await fetch(fetchUrl);
        const data = await response.json();

        let results = data.features || [];

        // Strictly filter to ensure only Indian locations are shown
        results = results.filter(
          (f: any) =>
            f.properties?.countrycode === "IN" ||
            f.properties?.country === "India",
        );

        if (results.length === 0) {
          // General India search if Delhi bias fails
          const fallbackResponse = await fetch(
            `/api/proxy/komoot/search?q=${encodeURIComponent(normalizedQuery)}&bbox=${INDIA_BBOX}&limit=10`,
          );
          const fallbackData = await fallbackResponse.json();
          results = (fallbackData.features || []).filter(
            (f: any) =>
              f.properties?.countrycode === "IN" ||
              f.properties?.country === "India",
          );
        }

        // Format to standard suggestion object
        let formattedResults = results
          .map((f: any) => ({
            place_id: f.properties.osm_id,
            display_name: `${f.properties.name || ""}${f.properties.street && f.properties.street !== f.properties.name ? ", " + f.properties.street : ""}${f.properties.district ? ", " + f.properties.district : ""}${f.properties.state ? ", " + f.properties.state : ""}`,
            structured_formatting: {
              main_text:
                f.properties.name || f.properties.street || normalizedQuery,
              secondary_text: `${f.properties.district ? f.properties.district + ", " : ""}${f.properties.state || ""}`,
            },
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            distance_meters: Math.random() * 15000, // Mock distance for demo
          }))
          .filter((item: any) => item.display_name.trim().length > 0);

        // Deduplicate logic
        const seenMainText = new Set();
        const seenLatLng = new Set();

        formattedResults = formattedResults.filter((item: any) => {
          const mainText = item.structured_formatting.main_text
            .toLowerCase()
            .trim();
          // Round to roughly 500m precision to collapse nearby POIs
          const latlngKey = `${Math.round(item.lat * 200)}|${Math.round(item.lon * 200)}`;

          // If we've seen this exact place name before, skip it
          if (seenMainText.has(mainText)) return false;

          // If we've seen a place within ~500m, skip it to avoid cluster duplicates
          if (seenLatLng.has(latlngKey)) return false;

          seenMainText.add(mainText);
          seenLatLng.add(latlngKey);
          return true;
        });

        // Limit to 5 high-quality results
        formattedResults = formattedResults.slice(0, 5);

        searchCache.current[cacheKey] = formattedResults;
        setSearchResults(formattedResults);
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [locationSearch, showSuggestions]);

  const dispatchServiceRef = () => {
    return import("@/services/dispatchService").then((m) => m.dispatchService);
  };

  const fetchRoute = async (
    userPos: [number, number],
    vanPos: [number, number],
    currentId?: number,
  ) => {
    try {
      const response = await fetch(
        `/api/proxy/osrm/route?coordinates=${vanPos[1]},${vanPos[0]};${userPos[1]},${userPos[0]}`
      );
      const data = await response.json();
      if (currentId !== undefined && dispatchIdRef.current !== currentId)
        return null;
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: any) => [
          c[1],
          c[0],
        ]);
        setRouteCoords(coords);
        return {
          coords,
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
        };
      }
    } catch (e) {
      console.error("Routing error", e);
      if (currentId !== undefined && dispatchIdRef.current !== currentId)
        return null;
    }
    if (currentId !== undefined && dispatchIdRef.current !== currentId)
      return null;
    setRouteCoords([[vanPos[0], vanPos[1]], userPos]);
  };

  const evaluateAndDispatch = async (pos: [number, number]) => {
    dispatchIdRef.current += 1;
    const currentId = dispatchIdRef.current;

    setDispatchStatus("searching");
    setDispatchEvaluation(null);
    setRouteCoords([]);

    const currentHour = new Date().getHours();
    const offline = currentHour < 9 || currentHour >= 21;
    if (offline) {
      // Add a subtle delay to make it feel like a real search before failing
      await new Promise((r) => setTimeout(r, 600));
      if (dispatchIdRef.current !== currentId) return;
      setDispatchStatus("failed");
      setDispatchEvaluation({ feasible: false, reason: "offline" });
      return;
    }

    const vType = selectedVehicle?.vehicle_type || "4W";
    const vModel = selectedVehicle?.model || "";
    const batCap =
      VEHICLE_LOGISTICS_CONFIG[vModel]?.capacity || MAX_CAPACITY[vType] || 30;
    const percentRequired =
      targetBattery > currentBattery ? targetBattery - currentBattery : 0;
    const energyKWh = (percentRequired / 100) * batCap;

    // Simulate checking...
    await new Promise((r) => setTimeout(r, 1500));
    if (dispatchIdRef.current !== currentId) return;

    try {
      const ds = await dispatchServiceRef();
      const result = await ds.evaluateLocationForVans(
        pos[0],
        pos[1],
        vType,
        energyKWh,
      );

      if (result.feasible) {
        setDispatchStatus("evaluating");
        await new Promise((r) => setTimeout(r, 1500));
        if (dispatchIdRef.current !== currentId) return;

        setDispatchEvaluation(result);

        if (result.van && result.van.current_latitude) {
          const vanPos: [number, number] = [
            result.van.current_latitude,
            result.van.current_longitude,
          ];
          const routeData = await fetchRoute(pos, vanPos, currentId);
          if (dispatchIdRef.current !== currentId) {
            setRouteCoords([]);
            return;
          }
          if (routeData) {
            const calculatedDurationMins = routeData.duration / 60;
            if (calculatedDurationMins > 60) {
              setDispatchEvaluation({
                feasible: false,
                reason: "eta_too_high",
              });
              setDispatchStatus("failed");
              return; // Reject dispatch preview
            }
            setDispatchEvaluation((prev: any) => ({
              ...prev,
              distanceKm: routeData.distance / 1000,
              durationMins: calculatedDurationMins,
              eta: calculatedDurationMins,
            }));
          }
        }

        setDispatchStatus("preview");
      } else {
        setDispatchStatus("failed");
        setDispatchEvaluation(result);
      }
    } catch (e) {
      console.error("Dispatch evaluation error", e);
      if (dispatchIdRef.current !== currentId) return;
      setDispatchStatus("failed");
    }
  };

  const selectLocation = async (item: any) => {
    let pos: [number, number];
    let mainText =
      item.structured_formatting?.main_text || item.display_name.split(",")[0];
    let displayName = item.display_name;

    if (item.lat && item.lon) {
      pos = [parseFloat(item.lat), parseFloat(item.lon)];
    } else {
      // Fallbacks
      return;
    }

    setUserPosition(pos);
    setLocation(displayName);
    setLocationSearch(mainText);
    setShowSuggestions(false);
    evaluateAndDispatch(pos);
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserPosition(pos);
        try {
          const response = await fetch(
            `/api/proxy/komoot/reverse?lon=${pos[1]}&lat=${pos[0]}`
          );
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            const displayName =
              `${props.name || props.street || ""}, ${props.district || props.city || ""}`
                .replace(/^, /, "")
                .trim();
            setLocation(displayName);
            setLocationSearch(props.name || props.street || "Current Location");
          } else {
            setLocation("Current Location");
            setLocationSearch("Current Location");
          }
        } catch (e) {
          setLocation("Current Location");
          setLocationSearch("Current Location");
        }
        setIsLocating(false);
        evaluateAndDispatch(pos);
      },
      () => {
        alert(
          "Location tracking denied or unavailable. Please search manually.",
        );
        setIsLocating(false);
      },
    );
  };

  const onMapClick = useCallback(
    async (lat: number, lng: number) => {
      const newPos: [number, number] = [lat, lng];
      setUserPosition(newPos);
      setShowSuggestions(false);
      try {
        const response = await fetch(
          `/api/proxy/komoot/reverse?lon=${lng}&lat=${lat}`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          const displayName =
            `${props.name || props.street || ""}, ${props.district || props.city || ""}`
              .replace(/^, /, "")
              .trim();
          setLocation(displayName);
          setLocationSearch(props.name || props.street || displayName);
        } else {
          setLocation("Selected Location");
          setLocationSearch("Selected Location");
        }
      } catch (e) {
        setLocation("Selected Location");
        setLocationSearch("Selected Location");
      }
      evaluateAndDispatch(newPos);
    },
    [selectedVehicle, currentBattery, targetBattery],
  );

  // Loading/Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
      // Do not auto-select vehicle to require explicit user choice
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  // NEW INDUSTRY-GRADE PRICING ENGINE
  const vType = (selectedVehicle?.vehicle_type || "4W") as "2W" | "3W" | "4W";
  const vModel = selectedVehicle?.model || "";
  const logisticsConfig = VEHICLE_LOGISTICS_CONFIG[vModel];
  const batCap = logisticsConfig?.capacity || MAX_CAPACITY[vType] || 30;
  let percentRequired = Math.max(0, targetBattery - currentBattery);
  let energyKWh = batCap * (percentRequired / 100);

  if (resumedBooking && resumedBooking.energy_requested) {
      const parsed = parseFloat(resumedBooking.energy_requested);
      if (!isNaN(parsed)) energyKWh = parsed;
      if (batCap > 0) percentRequired = Math.round((energyKWh / batCap) * 100);
  }

  // 1. Vehicle-Type Pricing Rules & Constants
  const config = PRICING_CONFIG[vType] || PRICING_CONFIG["4W"];

  // 2. Energy Cost (with efficiency adjustment for transmission loss)
  const efficiencyAdjustment =
    logisticsConfig?.efficiency ||
    (vType === "2W" ? 1.15 : vType === "3W" ? 1.1 : 1.05);
  const rawEnergyCost = energyKWh * config.energyRateKWh * efficiencyAdjustment;
  
  let opsCostPreTax = 0;
  let preTaxAmount = 0;
  let gstAmount = 0;
  let finalAmount = 0;

  if (resumedBooking && resumedBooking.estimated_price) {
     finalAmount = parseFloat(resumedBooking.estimated_price);
     preTaxAmount = finalAmount / (1 + GST_RATE);
     gstAmount = finalAmount - preTaxAmount;
     opsCostPreTax = preTaxAmount - rawEnergyCost;
  } else {
    // 3. Operational & Delivery Cost (Logistics scale with actual dispatch burden)
    // Distance from assigned van to user vehicle
    const routeDistanceKm =
      dispatchEvaluation?.distanceKm || (vType === "4W" ? 8 : 4);

    // Apply traffic bands to base timing
    const currentHour = new Date().getHours();
    // Normal multiplier
    let trafficMultiplier = 3.5;
    if (
      (currentHour >= 8 && currentHour <= 11) ||
      (currentHour >= 17 && currentHour <= 21)
    ) {
      trafficMultiplier = 5.0; // peak
    } else if (currentHour >= 23 || currentHour <= 5) {
      trafficMultiplier = 2.5; // night
    }
    const timeTravelMins =
      dispatchEvaluation?.durationMins || routeDistanceKm * trafficMultiplier;

    const distanceCost = routeDistanceKm * config.distanceRateKm;
    const timeCost = timeTravelMins * config.timeRateMin;
    const calculatedOpsCost = config.baseDispatchFee + distanceCost + timeCost;

    // Profitability protection (hard operational floors & ceilings)
    opsCostPreTax = Math.min(
      config.maxOps,
      Math.max(config.minOps, calculatedOpsCost),
    );

    // 4. Final Aggregation
    preTaxAmount = rawEnergyCost + opsCostPreTax;
    gstAmount = preTaxAmount * GST_RATE;
    finalAmount = preTaxAmount + gstAmount;
  }

  // Visual mappings for Invoice/UI logic
  const opsCost = opsCostPreTax;
  const baseServicePrice = rawEnergyCost;

  // charging time roughly 1 min per % for fast charging 4W, faster for 2W
  const estTimeMins = Math.max(
    15,
    Math.round(percentRequired * (vType === "4W" ? 0.8 : 0.4)),
  );

  const isStep1Valid = !!selectedVehicle && targetBattery > currentBattery;
  const isStep2Valid = !!userPosition;

  const nextStep = () => {
    if (step === 1 && isStep1Valid) setStep(2);
    if (step === 2 && isStep2Valid) setStep(3);
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const confirmVanDispatch = async () => {
    setIsSubmitting(true);
    try {
      const booking = await bookingService.createBooking({
        vehicle_id: selectedVehicle.id,
        location: location || "GPS Location",
        latitude: userPosition ? userPosition[0] : null,
        longitude: userPosition ? userPosition[1] : null,
        scheduled_time: new Date().toISOString(),
        estimated_price: finalAmount,
        energy_requested: `${Math.round(energyKWh)}kWh`,
      });
      setBookingId(booking.id);

      try {
        const ds = await dispatchServiceRef();
        await ds.assignVan(booking.id);
        setDispatchStatus("assigned");
      } catch (e: any) {
        console.log("Dispatch assignment failed:", e);
        alert(
          e.message ||
            "Failed to assign van due to high demand. Please try again.",
        );
        setDispatchStatus("failed");
        setDispatchEvaluation({
          feasible: false,
          reason: "session_limit_reached",
        }); // Re-use an existing error state for UI gracefully
      }
    } catch (error) {
      alert("Failed to create booking.");
    }
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-8 pl-2 border-l-4 border-emerald-500">
          <h1 className="text-3xl font-[700] text-white tracking-tight">
            Book a Charge
          </h1>
          <p className="text-slate-400 mt-1 font-light">
            Fast, transparent mobile charging delivery.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2 mb-10 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-sm relative z-20">
          {[
            { num: 1, label: "Vehicle & Power" },
            { num: 2, label: "Location" },
            { num: 3, label: "Review & Pay" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all duration-300 relative ${step === s.num ? "bg-slate-800 border border-slate-700 shadow-sm" : step > s.num ? "text-emerald-500" : "text-slate-400"}`}
            >
              <div
                className={`text-[11px] font-semibold uppercase tracking-widest mb-1 flex items-center justify-center gap-2 w-full text-center`}
              >
                {step > s.num ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <span className="text-center w-full">Step 0{s.num}</span>
                )}
              </div>
              <div
                className={`text-[13px] font-medium w-full text-center whitespace-nowrap ${step === s.num ? "text-white" : ""}`}
              >
                {s.label}
              </div>
              {step === s.num && (
                <motion.div
                  layoutId="active-step"
                  className="absolute -bottom-0.5 inset-x-8 h-0.5 bg-emerald-500 rounded-full"
                ></motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Step Views */}
        <div
          className={`bg-slate-900 border border-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl relative overflow-hidden flex flex-col ${step === 2 ? "" : "p-6 md:p-10 min-h-[500px]"}`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10 relative z-10 w-full"
              >
                {/* Vehicle Selection */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
                    <Car className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />{" "}
                    Select Vehicle
                  </h3>
                  {isPageLoading ? (
                    <div className="animate-pulse h-24 bg-slate-800 rounded-2xl"></div>
                  ) : vehicles.length === 0 ? (
                    <div className="p-8 border border-slate-700 border-dashed rounded-2xl text-center">
                      <p className="text-slate-400 mb-4">
                        No vehicles found. Add one to continue.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard/vehicles")}
                      >
                        Manage Vehicles
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicles.map((v) => {
                        const getVehicleIconBg = (
                          type: string,
                          isSelected: boolean,
                        ) => {
                          if (isSelected)
                            return "bg-violet-100 dark:bg-violet-900/40 border-violet-300 dark:border-violet-700 dark:text-violet-100";
                          switch (type) {
                            case "2W":
                              return "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/30";
                            case "3W":
                              return "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-500/30";
                            case "4W":
                              return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30";
                            default:
                              return "bg-slate-800 border-slate-700";
                          }
                        };
                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              if (selectedVehicle?.id === v.id) {
                                setSelectedVehicle(null);
                              } else {
                                const newMax = v.vehicle_type === "4W" ? 80 : 90;
                                if (!selectedVehicle) {
                                  setCurrentBattery(0);
                                  setTargetBattery(newMax);
                                } else {
                                  setCurrentBattery(0);
                                  setTargetBattery((prev) => Math.min(prev, newMax));
                                }
                                setSelectedVehicle(v);
                              }
                            }}
                            className={`p-5 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all duration-300 ${selectedVehicle?.id === v.id ? "bg-violet-50 dark:bg-violet-950/40 border-violet-400 dark:border-violet-500 shadow-sm" : "bg-slate-900 border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 "}`}
                          >
                            <div
                              className={`p-3 rounded-xl border transition-colors ${getVehicleIconBg(v.vehicle_type, selectedVehicle?.id === v.id)}`}
                            >
                              <VehicleTypeIcon
                                type={v.vehicle_type}
                                size={24}
                                className={
                                  selectedVehicle?.id === v.id
                                    ? "text-violet-600 dark:text-violet-400"
                                    : ""
                                }
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white tracking-tight">
                                {v.make} {v.model}
                                {v.year && (
                                  <span className="text-slate-500 font-normal text-sm ml-1">
                                    ({v.year})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-mono text-slate-400 mt-1">
                                {v.registration_number}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Battery Requirements */}
                <div
                  className={`${!selectedVehicle ? "opacity-50 pointer-events-none" : ""} transition-opacity`}
                >
                  <h3 className="text-[17px] font-semibold text-white mb-5 tracking-tight flex items-center gap-2">
                    <Battery className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />{" "}
                    Charge Target
                  </h3>
                  <div className="bg-slate-800/50 p-6 lg:p-8 rounded-[1.5rem] border border-slate-800 select-none transition-all shadow-none">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                      {/* Current Battery */}
                      <div className="flex-1 space-y-5">
                        <div className="flex justify-between items-baseline mb-2">
                          <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">
                            Current Charge
                          </label>
                          <div className="flex items-baseline border-b border-transparent hover:border-slate-300 hover:border-slate-600 focus-within:border-emerald-500/50 transition-colors">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              defaultValue={currentBattery}
                              key={`curr-${currentBattery}`}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10);
                                if (isNaN(val)) val = currentBattery;
                                val = Math.max(0, Math.min(maxTargetCharge - 5, val));
                                setCurrentBattery(val);
                                if (val >= targetBattery)
                                  setTargetBattery(Math.min(maxTargetCharge, val + 10));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                              className="text-2xl font-bold text-white tracking-tight bg-transparent w-[44px] text-right p-0 border-none focus:ring-0 focus:outline-none m-0 rounded-none"
                            />
                            <span className="text-lg font-semibold text-slate-400 ml-0.5">
                              %
                            </span>
                          </div>
                        </div>

                        <div className="relative h-6 flex items-center">
                          <div className="absolute inset-x-0 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-slate-400 dark:bg-slate-500 rounded-full"
                              style={{ width: `${currentBattery}%` }}
                            ></div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="95"
                            step="1"
                            value={currentBattery}
                            onChange={(e) => {
                              const v = Math.min(maxTargetCharge - 5, Number(e.target.value));
                              setCurrentBattery(v);
                              if (v >= targetBattery)
                                setTargetBattery(
                                  Math.min(maxTargetCharge, v + 10),
                                );
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
                            onDragStart={(e) => e.preventDefault()}
                          />
                          {/* Custom Thumb */}
                          <div
                            className="absolute h-5 w-5 bg-slate-900 border-2 border-slate-700 rounded-full shadow-md pointer-events-none flex items-center justify-center transform -translate-x-1/2 transition-transform"
                            style={{ left: `${currentBattery}%` }}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                          </div>
                        </div>

                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Required Battery */}
                      <div className="flex-1 space-y-5">
                        <div className="flex justify-between items-baseline mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                              Target Charge
                            </label>
                            {targetBattery === maxTargetCharge && currentBattery <= 20 && (
                              <span className="text-[10px] bg-emerald-100 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-sm font-semibold tracking-wide border border-emerald-200 border-emerald-500/20">
                                {selectedVehicle?.vehicle_type === '4W' ? 'Recommended Fast Charge: 80%' : 'Recommended Daily Charge: 90%'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline border-b border-transparent hover:border-emerald-200 hover:border-emerald-900 focus-within:border-emerald-500/50 transition-colors">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              defaultValue={targetBattery}
                              key={`tgt-${targetBattery}`}
                              onBlur={(e) => {
                                let val = parseInt(e.target.value, 10);
                                if (isNaN(val)) val = targetBattery;
                                val = Math.max(
                                  currentBattery + 5,
                                  Math.min(maxTargetCharge, val),
                                );
                                setTargetBattery(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                              className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight bg-transparent w-[44px] text-right p-0 border-none focus:ring-0 focus:outline-none m-0 rounded-none"
                            />
                            <span className="text-lg text-emerald-500/60 text-emerald-500/50 ml-0.5 -mb-[1px]">
                              %
                            </span>
                          </div>
                        </div>

                        <div className="relative h-6 flex items-center">
                          <div className="absolute inset-x-0 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="absolute h-1.5 top-0 bg-emerald-500 bg-emerald-400 rounded-r-full"
                              style={{ left: "0%", width: `${targetBattery}%` }}
                            ></div>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="1"
                            value={targetBattery}
                            onChange={(e) => {
                              setTargetBattery(
                                Math.max(
                                  currentBattery + 5,
                                  Math.min(maxTargetCharge, Number(e.target.value))
                                ),
                              );
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none z-[5]"
                            onDragStart={(e) => e.preventDefault()}
                          />
                          {/* Custom Thumb */}
                          <div
                            className="absolute h-[22px] w-[22px] bg-slate-900 border-2 border-emerald-500 rounded-full shadow-lg pointer-events-none flex items-center justify-center transform -translate-x-1/2 transition-transform z-10"
                            style={{ left: `${targetBattery}%` }}
                          >
                            <div className="h-2 w-2 rounded-full bg-emerald-500 bg-emerald-400"></div>
                          </div>
                        </div>

                        <div className="flex relative text-[11px] font-semibold text-slate-400 w-full h-[16px]">
                          <span
                            className="absolute transform -translate-x-1/2"
                            style={{ left: `max(5%, ${currentBattery}%)` }}
                          >
                            {currentBattery}%
                          </span>
                          <span className="absolute right-0">100%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Estimate preview */}
                  {selectedVehicle && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-800/50 border border-slate-800 rounded-2xl p-4 pl-6 shadow-none">
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <div className="h-10 w-10 bg-emerald-100 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                          <Zap className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-1">
                            Estimated Energy Required
                          </div>
                          <div className="text-slate-200 text-white font-semibold flex items-baseline gap-1">
                            <span className="text-[22px] tracking-tight leading-none">
                              {energyKWh.toFixed(1)}
                            </span>
                            <span className="text-[13px] text-slate-400 font-medium">
                              kWh
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={nextStep}
                        disabled={!isStep1Valid}
                        className="w-full sm:w-auto h-[46px] px-8 bg-emerald-500 hover:bg-emerald-600 text-[#ffffff] font-bold rounded-xl text-[14px] transition-all shadow-[0_4px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-100 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-900/60 dark:disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed border-none"
                      >
                        <span>Set Location</span>
                        <ChevronRight className="h-[18px] w-[18px]" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full relative z-10 flex flex-col lg:flex-row h-[85vh] min-h-[600px] lg:h-[700px] overflow-hidden bg-slate-950 lg:rounded-[2rem]"
              >
                {/* 
                  ===============================
                  MAP AREA (RIGHT ON DESKTOP, BACKDROP ON MOBILE)
                  ===============================
                */}
                <div className="absolute inset-0 lg:relative lg:flex-[1_1_60%] h-full w-full z-0 lg:order-2 order-1 group">
                  <MapContainer
                    center={defaultCenter}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                  >
                    <ZoomControl position="topright" />
                    <MapUpdater
                      routeCoords={routeCoords}
                      userLoc={userPosition}
                      allVans={visibleVans}
                      allDepots={
                        dispatchEvaluation?.allDepots ||
                        fleetData?.allDepots ||
                        []
                      }
                      dispatchStatus={dispatchStatus}
                    />
                    <TileLayer
                      attribution="&copy; Google Maps"
                      url="https://mt1.google.com/vt/lyrs=m&hl=en-IN&gl=IN&x={x}&y={y}&z={z}"
                      className="map-tiles-standard map-tiles-dark"
                      keepBuffer={12}
                    />
                    <MapEvents
                      onMapClick={onMapClick}
                      disabled={[
                        "assigned",
                        "enroute",
                        "arrived",
                        "charging",
                        "pending_payment",
                      ].includes(dispatchStatus)}
                    />

                    {(
                      dispatchEvaluation?.allDepots || fleetData?.allDepots
                    )?.map((depot: any) => (
                      <React.Fragment key={depot.id}>
                        <Marker
                          position={[depot.latitude, depot.longitude]}
                          icon={customDepotIcon}
                        >
                          <Popup className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-xl">
                            <div className="font-semibold text-amber-600 px-1 pt-1">
                              {depot.name}
                            </div>
                            <div className="text-[11px] text-slate-400 px-1 pb-1">
                              Fleet Deployment Hub
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    ))}

                    {visibleVans.map((van: any) => {
                      const isAssigned = dispatchEvaluation?.van?.id === van.id;
                      if (!van.current_latitude || !van.current_longitude)
                        return null;

                      return (
                        <React.Fragment key={`van-group-${van.id}`}>
                          <AnimatedVanMarker
                            van={van}
                            routeCoords={routeCoords}
                            dispatchStatus={dispatchStatus}
                            onArrived={handleVanArrived}
                            isAssigned={isAssigned}
                          />
                        </React.Fragment>
                      );
                    })}

                    {routeCoords.length > 0 && (
                      <Polyline
                        positions={routeCoords}
                        dashArray={
                          dispatchStatus === "arrived" ||
                          dispatchStatus === "charging" ||
                          dispatchStatus === "pending_payment" ||
                          dispatchStatus === "completed"
                            ? undefined
                            : "10, 10"
                        }
                        className={
                          dispatchStatus === "enroute" ||
                          dispatchStatus === "preview" ||
                          dispatchStatus === "assigned"
                            ? "spark-route-line animate-route-blink"
                            : "spark-route-line"
                        }
                      />
                    )}

                    {userPosition && (
                      <Marker position={userPosition} icon={userIcon} />
                    )}

                    {dispatchEvaluation?.van &&
                      dispatchStatus !== "pending" &&
                      dispatchStatus !== "evaluating" &&
                      dispatchStatus !== "failed" && (
                        <Marker
                          position={[
                            dispatchEvaluation.van.current_latitude,
                            dispatchEvaluation.van.current_longitude,
                          ]}
                          icon={startPositionIcon}
                        >
                          <Popup className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-xl">
                            <div className="font-semibold text-violet-400 px-1 pt-1">
                              Van Start Position
                            </div>
                            <div className="text-[11px] text-slate-400 px-1 pb-1">
                              Origination Hub / Depot
                            </div>
                          </Popup>
                        </Marker>
                      )}
                  </MapContainer>

                  {/* Floating Info Button & Simple Legend Popup */}
                  <button
                    onClick={() => setShowMapLegend(!showMapLegend)}
                    className="absolute bottom-6 right-6 z-[400] w-10 h-10 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-white transition-all pointer-events-auto"
                  >
                    <Info className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {showMapLegend && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-6 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl w-64 origin-bottom-right pointer-events-auto"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                            Map Legend
                          </span>
                          <button
                            onClick={() => setShowMapLegend(false)}
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" alt="Green Marker" className="h-6 w-auto object-contain drop-shadow-md" />
                            <div className="pt-0.5">
                              <div className="text-[13px] font-medium text-slate-100">
                                Your Location
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Charging destination
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" alt="Violet Marker" className="h-6 w-auto object-contain drop-shadow-md" />
                            <div className="pt-0.5">
                              <div className="text-[13px] font-medium text-slate-100">
                                Van Coordinates
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Origination point
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" alt="Yellow Marker" className="h-6 w-auto object-contain drop-shadow-md" />
                            <div className="pt-0.5">
                              <div className="text-[13px] font-medium text-slate-100">
                                Hub
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Van deployment & recharge
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* FLOATING STATUS HUD ON MAP */}
                  {userPosition && dispatchStatus !== "pending" && (
                    <div className="absolute top-4 left-4 right-4 lg:right-auto lg:top-6 lg:left-6 flex flex-col gap-2 z-[500] pointer-events-none">
                      <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-xl shadow-lg pointer-events-auto self-start w-auto">
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-1.5">
                          Live Dispatch
                        </div>
                        <div className="font-semibold text-white flex items-center gap-2 lg:text-[15px] tracking-tight">
                          {dispatchStatus === "searching" && (
                            <span className="text-amber-500 animate-pulse">
                              Searching Nearby Fleets
                            </span>
                          )}
                          {dispatchStatus === "evaluating" && (
                            <span className="text-amber-500 animate-pulse">
                              Evaluating Route Logistics
                            </span>
                          )}
                          {dispatchStatus === "preview" && (
                            <span className="text-amber-500">
                              Awaiting Dispatch Confirmation
                            </span>
                          )}
                          {dispatchStatus === "assigned" && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Van Dispatched
                            </span>
                          )}
                          {dispatchStatus === "enroute" && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Van En Route
                            </span>
                          )}
                          {dispatchStatus === "arrived" && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Van Arrived at Location
                            </span>
                          )}
                          {dispatchStatus === "charging" && (
                            <span className="text-emerald-600 dark:text-emerald-400 animate-pulse">
                              Active Charging Session
                            </span>
                          )}
                          {dispatchStatus === "pending_payment" && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Charging Completed
                            </span>
                          )}
                          {dispatchStatus === "failed" && (
                            <span
                              className={
                                dispatchEvaluation?.reason === "offline"
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }
                            >
                              {dispatchEvaluation?.reason === "offline"
                                ? "Service Closed (Resumes 9 AM)"
                                : dispatchEvaluation?.reason === "eta_too_high"
                                  ? "High Dispatch Delay (Too far in current traffic)"
                                  : (dispatchEvaluation?.reason === "session_limit_reached" || dispatchEvaluation?.reason === "no_available_van" || dispatchEvaluation?.reason === "van_busy")
                                    ? "All Units Busy"
                                    : dispatchEvaluation?.reason === "insufficient_energy"
                                      ? "No van with enough charge available"
                                      : dispatchEvaluation?.reason === "incompatible_connector"
                                        ? "No van available for this vehicle type"
                                        : dispatchEvaluation?.reason === "operational_drift_exceeded"
                                          ? "Outside of Operational Hub Range"
                                          : dispatchEvaluation?.reason === "outside_operational_feasibility"
                                            ? "Outside Operational Feasibility Area"
                                            : "Outside Coverage Area"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Charging UI overlay positioned in center of map */}
                  {dispatchStatus === "charging" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none w-full px-6 flex justify-center">
                      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center min-w-[280px]">
                        <Zap className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-4 animate-pulse" />
                        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-2">
                          Charging Session Active
                        </div>
                        <div className="text-5xl font-bold text-white mb-2 tracking-tighter">
                          {chargeProgress}%
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-6 bg-emerald-500/10 px-3 py-1.5 rounded-md">
                          ~{Math.ceil((100 - chargeProgress) * 0.25)} secs
                          remaining
                        </div>
                        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden mb-4 relative">
                          <div className="absolute inset-0 bg-slate-800"></div>
                          <div
                            className="relative h-full bg-emerald-500 transition-all duration-[250ms] ease-linear"
                            style={{ width: `${chargeProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-[13px] text-emerald-500/80 animate-pulse font-medium">
                          Power Delivery Active...
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 
                  ===============================
                  CONTROL PANEL (LEFT ON DESKTOP, BOTTOM SHEET ON MOBILE)
                  ===============================
                */}
                <div className="absolute bottom-0 left-0 right-0 lg:relative lg:flex-[1_1_40%] z-[1000] flex flex-col justify-end lg:justify-start lg:order-1 order-2 pointer-events-none lg:pointer-events-auto h-full max-h-full">
                  {/* The Panel Surface */}
                  <div className="bg-[#f8f9fa] dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 lg:border-t-0 lg:border-r rounded-t-3xl lg:rounded-none lg:rounded-l-[2rem] w-full max-h-[80vh] flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] lg:shadow-[2px_0_15px_rgba(0,0,0,0.03)] lg:dark:shadow-none pointer-events-auto shrink flex-nowrap lg:h-full lg:max-h-full transition-transform pb-safe">
                    {/* Mobile drag handle */}
                    <div className="w-full flex justify-center pt-4 pb-2 lg:hidden shrink-0">
                      <div className="w-10 h-1 bg-slate-300 dark:bg-slate-800 rounded-full"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 lg:px-10 pb-6 lg:pt-10 flex flex-col gap-6 lg:gap-8 custom-scrollbar">
                      {/* Search Bar / Location Controls */}
                      {!userPosition ? (
                        <div className="space-y-4 pt-2 lg:pt-0">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest hidden lg:block">
                            Enter Location
                          </label>
                          <div className="relative bg-slate-900 border border-slate-800 rounded-[1.25rem] transition-all duration-300 focus-within:border-emerald-500/50 hover:border-slate-300 dark:hover:border-slate-700 overflow-visible shadow-sm">
                            <div className="flex items-center">
                              <div className="pl-5 shrink-0 flex items-center justify-center">
                                {isSearching ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                                ) : (
                                  <MapPin className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
                                )}
                              </div>
                              <input
                                type="text"
                                disabled={[
                                  "assigned",
                                  "enroute",
                                  "arrived",
                                  "charging",
                                  "pending_payment",
                                ].includes(dispatchStatus)}
                                className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 px-4 py-4 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-semibold text-[16px] w-full disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
                                placeholder="Enter charging location"
                                value={locationSearch}
                                onChange={(e) => {
                                  setLocationSearch(e.target.value);
                                  setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() =>
                                  setTimeout(
                                    () => setShowSuggestions(false),
                                    200,
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    searchResults.length > 0
                                  ) {
                                    selectLocation(searchResults[0]);
                                  }
                                }}
                              />
                              {locationSearch && (
                                <button
                                  className="pr-5 shrink-0 text-slate-500 hover:text-white transition-colors"
                                  onClick={() => {
                                    setLocationSearch("");
                                    setSearchResults([]);
                                    setIsSearching(false);
                                  }}
                                >
                                  <X className="h-[18px] w-[18px]" />
                                </button>
                              )}
                            </div>

                            {/* Suggestions Dropdown */}
                            <AnimatePresence>
                              {showSuggestions &&
                                (locationSearch.length > 0 ||
                                  searchResults.length > 0) && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                    transition={{
                                      duration: 0.2,
                                      ease: "easeOut",
                                    }}
                                    className="absolute top-[calc(100%+8px)] left-0 right-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.45)] z-[1001]"
                                  >
                                    {isSearching ? (
                                      <div className="px-4 py-4 divide-y divide-slate-100 divide-white/5 space-y-3">
                                        {[1, 2, 3].map((i) => (
                                          <div
                                            key={i}
                                            className={`flex items-center gap-4 ${i > 1 ? "pt-3" : ""}`}
                                          >
                                            <div className="h-[38px] w-[38px] bg-slate-800 rounded-full animate-pulse shrink-0 border border-slate-800"></div>
                                            <div className="flex-1 space-y-2.5">
                                              <div className="h-[14px] bg-slate-800 rounded-md w-2/3 animate-pulse border border-slate-800"></div>
                                              <div className="h-[10px] bg-slate-800 rounded-md w-1/2 animate-pulse border border-slate-800"></div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : searchResults.length > 0 ? (
                                      <div className="px-1.5 py-1.5 flex flex-col gap-0.5">
                                        {searchResults.map((item, idx) => {
                                          const primary =
                                            item.structured_formatting
                                              ? item.structured_formatting
                                                  .main_text
                                              : item.display_name
                                                ? item.display_name
                                                    .split(",")[0]
                                                    .trim()
                                                : item.description;
                                          const secondary =
                                            item.structured_formatting
                                              ? item.structured_formatting
                                                  .secondary_text
                                              : item.display_name
                                                ? item.display_name
                                                    .split(",")
                                                    .slice(1)
                                                    .join(",")
                                                    .trim()
                                                : "";
                                          let distanceText = "";
                                          const currentHour =
                                            new Date().getHours();
                                          const offline =
                                            currentHour < 9 ||
                                            currentHour >= 21;

                                          if (offline) {
                                            distanceText =
                                              "Currently unavailable";
                                          } else if (item.lat && item.lon) {
                                            // Note: realistically only idle/available vans are dispatchable, but we can approximation nearest van overall
                                            const dispatchableVans =
                                              fleetData?.allVans?.filter(
                                                (v: any) =>
                                                  v.current_status === "idle" ||
                                                  v.current_status ===
                                                    "available",
                                              );

                                            if (
                                              !dispatchableVans ||
                                              dispatchableVans.length === 0
                                            ) {
                                              distanceText =
                                                "Currently unavailable";
                                            } else {
                                              let minDistance = -1;
                                              dispatchableVans.forEach(
                                                (v: any) => {
                                                  if (
                                                    v.current_latitude &&
                                                    v.current_longitude
                                                  ) {
                                                    const d = getDistance(
                                                      [
                                                        v.current_latitude,
                                                        v.current_longitude,
                                                      ],
                                                      [
                                                        parseFloat(item.lat),
                                                        parseFloat(item.lon),
                                                      ],
                                                    );
                                                    if (
                                                      minDistance === -1 ||
                                                      d < minDistance
                                                    )
                                                      minDistance = d;
                                                  }
                                                },
                                              );

                                              if (minDistance !== -1) {
                                                const approxRouteDistanceKm =
                                                  (minDistance * 1.3) / 1000;
                                                distanceText =
                                                  approxRouteDistanceKm.toFixed(
                                                    1,
                                                  ) + " km away";
                                              }
                                            }
                                          }
                                          return (
                                            <button
                                              key={idx}
                                              className="w-full text-left px-4 py-3 hover:bg-slate-800/60 focus:bg-slate-800/60 transition-all flex items-center gap-4 group cursor-pointer outline-none rounded-xl"
                                              onClick={() => {
                                                selectLocation(item);
                                                setShowSuggestions(false);
                                              }}
                                            >
                                              <div className="h-[38px] w-[38px] bg-slate-900 group-hover:bg-emerald-500/10 border border-white/5 group-hover:border-emerald-500/20 rounded-full shrink-0 flex items-center justify-center transition-colors shadow-sm mt-1 self-start">
                                                <MapPin className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 dark:text-emerald-400 transition-colors" />
                                              </div>
                                              <div className="py-0.5 min-w-0 pr-2 flex-1">
                                                <div className="font-semibold text-[15px] whitespace-normal break-words tracking-tight mb-0.5">
                                                  <HighlightText
                                                    text={primary}
                                                    query={locationSearch}
                                                  />
                                                </div>
                                                <div className="text-[13px] text-slate-500 whitespace-normal break-words mt-0 tracking-wide font-medium">
                                                  {secondary}
                                                </div>
                                              </div>
                                              {distanceText && (
                                                <div className="text-[11px] text-slate-500 font-medium shrink-0 group-hover:text-emerald-500/80 transition-colors mt-1 self-start">
                                                  {distanceText}
                                                </div>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : locationSearch.length > 0 ? (
                                      <div className="px-5 py-8 text-center text-slate-500 text-[14px] font-medium">
                                        No locations found for "
                                        <span className="text-slate-700 dark:text-slate-300">
                                          {locationSearch}
                                        </span>
                                        "
                                      </div>
                                    ) : (
                                      <div className="px-1.5 py-1.5 flex flex-col gap-0.5">
                                        <div className="px-4 py-2.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                                          <Clock className="h-3 w-3" /> Recent &
                                          Popular
                                        </div>
                                        <button
                                          onClick={() => {
                                            selectLocation({
                                              place_id: null,
                                              lat: 28.6304,
                                              lon: 77.2177,
                                              display_name:
                                                "Connaught Place, New Delhi",
                                            });
                                          }}
                                          className="w-full text-left px-4 py-3 hover:bg-slate-800/60 focus:bg-slate-800/60 transition-all flex items-center gap-4 group rounded-xl cursor-pointer outline-none"
                                        >
                                          <div className="h-[38px] w-[38px] bg-slate-900 group-hover:bg-emerald-500/10 border border-white/5 group-hover:border-emerald-500/20 rounded-full shrink-0 flex items-center justify-center transition-colors shadow-sm">
                                            <MapPin className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:text-emerald-400 transition-colors" />
                                          </div>
                                          <div>
                                            <div className="text-[15px] text-slate-100 dark:text-slate-100 font-semibold tracking-tight">
                                              Connaught Place (CP)
                                            </div>
                                            <div className="text-[13px] text-slate-500 font-medium">
                                              New Delhi
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={() => {
                                            selectLocation({
                                              place_id: null,
                                              lat: 28.5562,
                                              lon: 77.1,
                                              display_name:
                                                "Terminal 3, Indira Gandhi Int'l Airport, New Delhi",
                                            });
                                          }}
                                          className="w-full text-left px-4 py-3 hover:bg-slate-800/60 focus:bg-slate-800/60 transition-all flex items-center gap-4 group rounded-xl cursor-pointer outline-none"
                                        >
                                          <div className="h-[38px] w-[38px] bg-slate-900 group-hover:bg-emerald-500/10 border border-white/5 group-hover:border-emerald-500/20 rounded-full shrink-0 flex items-center justify-center transition-colors shadow-sm">
                                            <Plane className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:text-emerald-400 transition-colors" />
                                          </div>
                                          <div>
                                            <div className="text-[15px] text-slate-100 dark:text-slate-100 font-semibold tracking-tight">
                                              Indira Gandhi Int'l Airport
                                            </div>
                                            <div className="text-[13px] text-slate-500 font-medium">
                                              Terminal 3, New Delhi
                                            </div>
                                          </div>
                                        </button>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => {
                                if (searchResults.length > 0) {
                                  selectLocation(searchResults[0]);
                                }
                              }}
                              disabled={isSearching || !locationSearch}
                              className="flex-[2] h-12 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-100 dark:text-slate-100 font-bold transition-all rounded-xl shadow-sm hover:shadow-md disabled:opacity-100 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-900/50 dark:disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none"
                            >
                              {isSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                "Search"
                              )}
                            </Button>
                            <Button
                              onClick={getCurrentLocation}
                              disabled={
                                isLocating ||
                                [
                                  "assigned",
                                  "enroute",
                                  "arrived",
                                  "charging",
                                  "pending_payment",
                                ].includes(dispatchStatus)
                              }
                              className="flex-1 max-w-[60px] h-12 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-100 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-900/50 dark:disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center p-0 border border-slate-800 dark:border-slate-700"
                              title="Track my location"
                            >
                              {isLocating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Navigation className="h-5 w-5" />
                              )}
                            </Button>
                          </div>

                          <div className="py-3 flex items-center gap-4">
                            <div className="h-px bg-slate-200 dark:bg-slate-900/5 flex-1"></div>
                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">
                              Or select on map
                            </span>
                            <div className="h-px bg-slate-200 dark:bg-slate-900/5 flex-1"></div>
                          </div>
                        </div>
                      ) : (
                        // Selected Location View (Uber style ride details)
                        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.03)] shadow-none p-4 pt-4 lg:pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1 min-w-0 overflow-hidden">
                              <div className="mt-1 relative flex flex-col justify-center items-center">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 bg-emerald-500/10 flex items-center justify-center shrink-0">
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 pr-4">
                                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1.5 shadow-none">
                                  Selected Location
                                </div>
                                <h4 className="text-[17px] font-medium text-white whitespace-normal break-words mb-0.5 tracking-tight">
                                  {location.split(",")[0]}
                                </h4>
                                <p className="text-[14px] text-slate-500 whitespace-normal break-words">
                                  {location.split(",").slice(1).join(", ")}
                                </p>
                              </div>
                            </div>
                            <button
                              disabled={[
                                "assigned",
                                "enroute",
                                "arrived",
                                "charging",
                                "pending_payment",
                              ].includes(dispatchStatus)}
                              onClick={() => {
                                dispatchIdRef.current += 1;
                                setUserPosition(null);
                                setLocation("");
                                setLocationSearch("");
                                setDispatchStatus("pending");
                                setDispatchEvaluation(null);
                                setRouteCoords([]);
                              }}
                              className="p-2.5 bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Van Details & ETA (Uber style vehicle selection card) */}
                      {userPosition && dispatchEvaluation && (
                        <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-[0_2px_10px_rgb(0,0,0,0.03)] shadow-none p-4.5 transition-all">
                          <div className="flex justify-between items-center mb-1.5">
                            <h3 className="text-white font-semibold text-[17px] flex items-center gap-2 tracking-tight">
                              <Car className="h-[18px] w-[18px] text-emerald-500 text-emerald-600 dark:text-emerald-400" />{" "}
                              Spark EV Service Van
                            </h3>
                          </div>
                          <div className="text-[13px] text-slate-500 flex justify-between items-center font-medium mt-0.5">
                            <span>
                              Distance:{" "}
                              {dispatchEvaluation.distanceKm?.toFixed(1) ||
                                "0.0"}{" "}
                              km
                            </span>
                            {dispatchEvaluation.eta && (
                              <span className="text-emerald-600 dark:text-emerald-400/90 font-semibold tracking-wide flex items-center gap-1.5">
                                ETA: ~{Math.ceil(dispatchEvaluation.eta)} mins
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pre-Dispatch Payment Breakup Display (Invoice logic unchanged, UI updated) */}
                      {userPosition &&
                        dispatchEvaluation &&
                        [
                          "preview",
                          "assigned",
                          "enroute",
                          "arrived",
                          "charging",
                          "pending_payment",
                        ].includes(dispatchStatus) && (
                          <div className="bg-slate-900 border border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.03)] shadow-none rounded-xl p-5 text-left">
                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
                              {dispatchStatus === "pending_payment"
                                ? "Final Invoice Breakdown"
                                : "Estimated Invoice Breakdown"}
                            </div>

                            <div className="space-y-3.5">
                              <div className="flex justify-between items-center text-[14px]">
                                <span className="text-slate-400 font-medium">
                                  Energy Charge
                                </span>
                                <span className="text-slate-200 dark:text-slate-300 font-mono tracking-tight text-[15px]">
                                  ₹{baseServicePrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="group relative">
                                <div className="flex justify-between items-center text-[14px]">
                                  <span className="text-slate-400 font-medium border-b border-dashed border-slate-700 cursor-help">
                                    Service & Dispatch
                                  </span>
                                  <span className="text-slate-200 dark:text-slate-300 font-mono tracking-tight text-[15px]">
                                    ₹{opsCost.toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-[12px] text-slate-400 mt-1.5 leading-relaxed hidden lg:block group-hover:block transition-all">
                                  Includes live dispatch, doorstep service, and
                                  real-time fleet operations.
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[14px]">
                                <span className="text-slate-400 font-medium flex items-center gap-2">
                                  GST / Taxes{" "}
                                  <span className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                    18%
                                  </span>
                                </span>
                                <span className="text-slate-200 dark:text-slate-300 font-mono tracking-tight text-[15px]">
                                  ₹{gstAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-slate-800 pt-4 mt-5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[15px] font-semibold text-white">
                                  Total Payable Amount
                                </span>
                                <span className="text-2xl font-bold text-white tracking-tight">
                                  ₹{finalAmount.toFixed(2)}
                                </span>
                              </div>
                              <div className="text-[12px] text-emerald-600 dark:text-emerald-500 font-medium text-right sm:text-left">
                                (Pay after charge)
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* ACTION BUTTONS BOTTOM DOCKED */}
                    <div className="p-5 lg:p-10 lg:pt-0 pt-0 shrink-0 bg-transparent pointer-events-auto">
                      <div className="flex gap-3 w-full">
                        <Button
                          variant="outline"
                          onClick={prevStep}
                          disabled={[
                            "assigned",
                            "enroute",
                            "arrived",
                            "charging",
                            "pending_payment",
                          ].includes(dispatchStatus)}
                          className="h-[52px] w-[52px] shrink-0 rounded-xl bg-slate-800 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700 transition-colors p-0 flex items-center justify-center shadow-sm text-center disabled:opacity-50"
                          title="Back"
                        >
                          <ChevronRight className="rotate-180 h-[22px] w-[22px]" />
                        </Button>

                        {dispatchStatus === "preview" ? (
                          <Button
                            onClick={confirmVanDispatch}
                            disabled={isSubmitting}
                            className="flex-1 w-full sm:w-auto h-[52px] px-8 bg-emerald-500 hover:bg-emerald-600 text-[#ffffff] font-bold rounded-xl text-[15px] transition-all shadow-[0_4px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-100 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-900/60 dark:disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed border-none"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Car className="h-[22px] w-[22px]" />
                            )}
                            <span>
                              <span className="hidden sm:inline">
                                Confirm Booking & Dispatch
                              </span>
                              <span className="inline sm:hidden">
                                Confirm Booking
                              </span>
                            </span>
                          </Button>
                        ) : dispatchStatus === "failed" ? (
                          <Button
                            disabled={true}
                            className={`flex-1 h-[52px] bg-slate-800/50 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 shadow-sm ${dispatchEvaluation?.reason === "offline" ? "text-amber-500 border border-amber-500/20" : "text-red-500 border border-red-500/20"}`}
                          >
                            <span>
                              {dispatchEvaluation?.reason === "offline"
                                ? "Unavailable Right Now"
                                : "Cannot Dispatch"}
                            </span>
                          </Button>
                        ) : (
                          <Button
                            onClick={nextStep}
                            disabled={
                              !isStep2Valid ||
                              dispatchStatus !== "pending_payment"
                            }
                            className="flex-1 w-full sm:w-auto h-[52px] px-8 bg-emerald-500 hover:bg-emerald-600 text-[#ffffff] font-bold rounded-xl text-[15px] transition-all shadow-[0_4px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-100 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-900/60 dark:disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed border-none"
                          >
                            <span>
                              <span className="hidden sm:inline">
                                Continue to Payment
                              </span>
                              <span className="inline sm:hidden">
                                To Payment
                              </span>
                            </span>
                            <ChevronRight className="h-[18px] w-[18px]" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10 w-full max-w-2xl mx-auto"
              >
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 mb-6 shadow-xl">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-6 mb-6">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Target Vehicle
                      </div>
                      <div className="text-xl font-bold text-white">
                        {selectedVehicle?.make} {selectedVehicle?.model}
                        {selectedVehicle?.year && (
                          <span className="text-slate-500 font-normal text-lg ml-1">
                            ({selectedVehicle?.year})
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {selectedVehicle?.registration_number}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Location
                      </div>
                      <div className="text-sm text-slate-300 text-slate-200 max-w-[250px] break-words whitespace-normal">
                        {location}
                      </div>
                      <div
                        className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 flex items-center gap-1 justify-end"
                        title="Within 8km eligibility zone"
                      >
                        <MapPin className="h-3 w-3" /> Zone Eligible
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 shadow-none">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-slate-400">
                          Power Delivery
                        </div>
                        <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold text-white mb-1">
                        {currentBattery}%{" "}
                        <ChevronRight className="inline h-4 w-4 text-slate-400" />{" "}
                        {targetBattery}%
                      </div>
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        {energyKWh.toFixed(1)} kWh Est.
                      </div>
                    </div>
                    <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 shadow-none">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-slate-400">
                          Timing Estimates
                        </div>
                        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>

                      <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-400">Van Arrival</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                            ~
                            {dispatchEvaluation?.eta
                              ? Math.ceil(dispatchEvaluation.eta)
                              : 25}{" "}
                            mins
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-400">
                            Charging Duration
                          </span>
                          <span className="text-slate-300 font-mono">
                            ~{estTimeMins} mins
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold border-t border-slate-700/50 pt-2 mt-1">
                          <span className="text-slate-700 dark:text-slate-300">
                            Total Completion
                          </span>
                          <span className="text-white font-mono">
                            ~
                            {(dispatchEvaluation?.eta
                              ? Math.ceil(dispatchEvaluation.eta)
                              : 25) + estTimeMins}{" "}
                            mins
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-3 leading-tight border-t border-slate-800 pt-2">
                        <span className="text-slate-400 font-medium">
                          {dispatchEvaluation?.van?.van_name || "Van"}
                        </span>{" "}
                        assigned •{" "}
                        <span className="text-slate-400 font-medium">
                          {dispatchEvaluation?.distanceKm?.toFixed(1) || "0.0"}{" "}
                          km
                        </span>{" "}
                        routed distance.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-bold text-white uppercase tracking-wider">
                      Invoice Breakdown
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Energy Charge</span>
                        <span className="text-slate-300 font-mono">
                          ₹{baseServicePrice.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">
                            Service & Dispatch
                          </span>
                          <span className="text-slate-300 font-mono">
                            ₹{opsCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[14px] text-slate-500 mt-1 leading-tight pr-8">
                          Includes vehicle dispatch, routing, and on-site EV
                          charging support.
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2">
                          GST / Taxes{" "}
                          <span className="text-[14px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                            18%
                          </span>
                        </span>
                        <span className="text-slate-300 tracking-tight font-mono">
                          ₹{gstAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-700/50 pt-4 mt-6 flex items-center justify-between">
                      <span className="text-lg font-bold text-white">
                        Final Payable Amount
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust / Guarantee block strictly from slide data */}
                <div className="bg-emerald-950/60 dark:bg-emerald-950/15 border border-emerald-900/40 rounded-2xl p-5 flex items-start gap-4 mb-8">
                  <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-emerald-300 mb-1">
                      Spark EV Service Guarantee
                    </div>
                    <ul className="text-[13px] text-slate-400 space-y-2.5 list-disc list-inside pt-1 leading-relaxed">
                      <li>
                        <strong className="text-emerald-400 font-bold">
                          50% refund
                        </strong>{" "}
                        if the van arrives over 30 minutes late from the
                        confirmed ETA
                      </li>
                      <li>
                        <strong className="text-emerald-400 font-bold">
                          50% refund
                        </strong>{" "}
                        if Spark EV is unable to deliver the promised charge
                        level
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between flex-wrap gap-4 items-center flex-col-reverse sm:flex-row">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="w-full sm:w-auto hover:text-slate-900 text-slate-400 hover:text-white"
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        if (bookingId) {
                          await bookingService.updateBookingStatus(bookingId, "pending_payment");
                        }
                      } catch (e) {
                        console.error(e);
                      }
                      navigate("/dashboard/payment", {
                        state: {
                          bookingId,
                          amount: finalAmount,
                          vehicleType: selectedVehicle.vehicle_type,
                        },
                      });
                    }}
                    className="w-full sm:w-auto h-[46px] px-8 bg-emerald-500 hover:bg-emerald-600 text-[#ffffff] font-bold rounded-xl text-[15px] transition-all shadow-[0_4px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 border-none"
                  >
                    Proceed to Final Payment
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}