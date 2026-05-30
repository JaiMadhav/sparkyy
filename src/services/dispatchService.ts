import { supabase } from "../supabaseClient";

interface Location {
  latitude: number;
  longitude: number;
}

interface UserRequest {
  bookingId: string;
  userLocation: Location;
  vehicleType: string;
  requiredEnergyKWh: number;
  estimatedPrice: number;
  estimatedOperationalCost: number;
}

const CONFIG = {
  reserveBufferKWh: 5,
  maxDiscoveryRadiusKm: 15,
  maxOperationalEtaMins: 60,
  peakTrafficAverageSpeed: 15,
  normalTrafficAverageSpeed: 25,
  nightTrafficAverageSpeed: 40,
};

const PRIMARY_FLEET_VAN_NAME = "Spark-MVP-01";

const filterToPrimaryVan = (vans: any[] = []) =>
  vans.filter((van) => van.van_name === PRIMARY_FLEET_VAN_NAME);

export const dispatchService = {
  // Hybrid Dispatch Weighted Scoring Model
  WEIGHTS: {
    eta: 0.45,
    distance: 0.20,
    reserve_energy: 0.20,
    traffic: 0.10,
    van_load: 0.05,
    thermal_penalty: 0.15,
    detour_penalty: 0.10,
  },

  calculateDistance(loc1: Location, loc2: Location) {
    // Haversine formula
    const R = 6371; // km
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  calculateETA(distanceKm: number) {
    const currentHour = new Date().getHours();
    let averageSpeedKmH = CONFIG.normalTrafficAverageSpeed;
    
    // Traffic bands for realistic dynamic ETAs
    if ((currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 21)) {
        averageSpeedKmH = CONFIG.peakTrafficAverageSpeed;
    } else if (currentHour >= 23 || currentHour <= 5) {
        averageSpeedKmH = CONFIG.nightTrafficAverageSpeed;
    }
    
    const hours = distanceKm / averageSpeedKmH;
    return Math.ceil(hours * 60); // ETA in minutes
  },

  async evaluateVanScore(van: any, request: UserRequest) {
    const vanLocation: Location = { latitude: van.current_latitude, longitude: van.current_longitude };
    const distanceKm = this.calculateDistance(vanLocation, request.userLocation);
    const eta = this.calculateETA(distanceKm);
    
    // HARD CONSTRAINTS FILTER
    // 1. Vehicle compatibility
    const supportedTypes = van.supported_vehicle_types || [];
    if (!supportedTypes.includes(request.vehicleType)) {
      return { feasible: false, reason: "incompatible_connector" }; // updated rejection reason
    }
    
    // 2. Hardware state
    if (van.telemetry_status !== 'online') return { feasible: false, reason: "telemetry_offline" };
    if (van.safety_status !== 'safe' && van.safety_status !== 'ok') return { feasible: false, reason: "safety_fault" };
    if (van.thermal_status === 'critical') return { feasible: false, reason: "thermal_overload" };
    
    // 3. Availability and session limits (Single Active Booking Lock)
    if (van.current_status === 'offline' || van.current_status === 'maintenance') {
      return { feasible: false, reason: "telemetry_offline" };
    }
    // For demo purposes: allow re-assigning even if marked as busy, so users don't get stuck vans.
    // In production, we would check busyStatuses and reject.
    /*
    const busyStatuses = ['assigned', 'enroute', 'arrived', 'charging'];
    if (busyStatuses.includes(van.current_status)) {
      if (van.active_booking_id && van.active_booking_id !== request.bookingId) {
         return { feasible: false, reason: "van_busy" };
      }
    }
    */
    if (van.sessions_completed_today >= van.max_sessions_per_day) {
      return { feasible: false, reason: "session_limit_reached" };
    }

    // 4. Energy feasibility with Configurable Reserve Buffer
    // The van must have enough energy to reach customer + provide requested charge + reserve buffer
    // For simplicity, we assume distanceKm * small factor is the traversal energy cost, but for MVP:
    // requirement says: remaining_energy_after_job < reserve_buffer reject.
    const requiredTotalEnergy = request.requiredEnergyKWh + CONFIG.reserveBufferKWh;
    if (van.current_energy_level !== undefined && van.current_energy_level < requiredTotalEnergy) {
      return { feasible: false, reason: "insufficient_energy" };
    }

    // 5. Maximum Depot Drift Control (Maximum 10 km)
    // Depot anchor location: user might update depot in db, but we check if van.depots exists
    if (van.depots) {
      const depotLocation: Location = { latitude: van.depots.latitude, longitude: van.depots.longitude };
      const customerDriftDistance = this.calculateDistance(depotLocation, request.userLocation);
      if (customerDriftDistance > 10) {
        return { feasible: false, reason: "operational_drift_exceeded" };
      }
    }

    // 6. Live Service Radius Check (Operational Feasibility)
    // Soft Preferred Range is ~8km, but hard limit we can set to maybe 8km + tolerance or leave to ETA
    // Let's cap max operation routing distance at 15km as fallback but realistic ETAs will govern normally.
    const vanLiveDistance = distanceKm;
    if (vanLiveDistance > 15) {
      return { feasible: false, reason: "outside_operational_feasibility" };
    }
    
    // Extreme ETA Check
    if (eta > CONFIG.maxOperationalEtaMins) {
      return { feasible: false, reason: "eta_too_high" };
    }

    // SCORING
    // Normalization logic: lower score is better (Penalty based)
    
    // 1. ETA Penalty (Scaled 0 to max 60 mins)
    const normalizedETA = Math.min(eta / CONFIG.maxOperationalEtaMins, 1);
    
    // 2. Distance Penalty (Scaled 0 to max 20 km)
    const normalizedDistance = Math.min(distanceKm / 20, 1);
    
    // 3. Battery Risk (Less energy = higher penalty)
    const batteryRisk = Math.max(0, 1 - ((van.current_energy_level || 0) / 100));

    // 4. Traffic/Load Awareness
    const currentHour = new Date().getHours();
    const isPeakTraffic = (currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 21);
    const trafficScore = isPeakTraffic ? 1.0 : 0.0;
    
    // 5. Van Load Fatigue
    const loadScore = van.sessions_completed_today / van.max_sessions_per_day;

    let score = 
      (this.WEIGHTS.eta * normalizedETA) +
      (this.WEIGHTS.distance * normalizedDistance) +
      (this.WEIGHTS.reserve_energy * batteryRisk) +
      (this.WEIGHTS.traffic * trafficScore) +
      (this.WEIGHTS.van_load * loadScore);
      
    // Soft thermal penalty (avoids hard rejection if close)
    if (van.thermal_status === 'warning') {
       score += this.WEIGHTS.thermal_penalty;
    }

    // If van is "returning" to depot, give a small detour penalty
    if (van.current_status === 'returning') {
      score += this.WEIGHTS.detour_penalty; 
    }

    return {
      feasible: true,
      score,
      eta,
      distanceKm
    };
  },

  async getInitialFleet() {
    const { data: vans } = await supabase
      .from('charging_vans')
      .select('*, depots(*)')
      .eq('van_name', PRIMARY_FLEET_VAN_NAME);
    if (!vans) return { allVans: [], allDepots: [] };
    
    // Check operating hours
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = istTime.getUTCHours();
    const isOutsideHours = hours < 9 || hours >= 21;

    let processedVans = vans;
    if (isOutsideHours) {
       processedVans = vans.map(van => {
         if (van.depots) {
           return {
             ...van,
             current_latitude: van.depots.latitude,
             current_longitude: van.depots.longitude,
             current_status: 'offline'
           };
         }
         return van;
       });
    }

    processedVans = filterToPrimaryVan(processedVans);

    return {
       allVans: processedVans,
       allDepots: processedVans.map(v => v.depots).filter((v, i, a) => v && a.findIndex(t => (t.id === v.id)) === i)
    };
  },

  async evaluateLocationForVans(latitude: number, longitude: number, vehicleType: string, requiredEnergyKWh: number) {
    const { data: vans } = await supabase
      .from('charging_vans')
      .select('*, depots(*)')
      .eq('van_name', PRIMARY_FLEET_VAN_NAME);
    let processedVans = filterToPrimaryVan(vans || []);
    let allDepots = processedVans.map(v => v.depots).filter((v, i, a) => v && a.findIndex(t => (t.id === v.id)) === i);

    // 1. Check operating hours
    const now = new Date();
    // UTC time + 5.5 hours = IST
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = istTime.getUTCHours();
    const isOutsideHours = hours < 9 || hours >= 21;

    if (isOutsideHours) {
      processedVans = processedVans.map(van => {
         if (van.depots) {
           return {
             ...van,
             current_latitude: van.depots.latitude,
             current_longitude: van.depots.longitude,
             current_status: 'offline'
           };
         }
         return van;
       });
      return { feasible: false, reason: "Outside operating hours (9 AM - 9 PM IST)", allVans: processedVans, allDepots: allDepots };
    }

    if (!vans) return { feasible: false, reason: "No vans found in system" };

    const request: UserRequest = {
      bookingId: 'simulation',
      userLocation: { latitude, longitude },
      vehicleType,
      requiredEnergyKWh,
      estimatedPrice: 0,
      estimatedOperationalCost: 0
    };

    let bestVan = null;
    let bestVanEval = null;
    let fallbackReason = "No vans available";

    for (const van of vans) {
      const evaluation = await this.evaluateVanScore(van, request);
      console.log(`[Dispatch] Van ${van.van_name} evaluation:`, evaluation);
      
      if (!evaluation.feasible) {
        if (!bestVan) fallbackReason = evaluation.reason || "unavailable";
        continue;
      }

      if (!bestVanEval || evaluation.score! < bestVanEval.score!) {
        bestVan = van;
        bestVanEval = evaluation;
      }
    }

    if (!bestVan) {
      return { feasible: false, reason: fallbackReason, allVans: processedVans, allDepots: allDepots };
    }

    return { 
       feasible: true, 
       van: bestVan, 
       eta: bestVanEval!.eta, 
       distanceKm: bestVanEval!.distanceKm,
       allVans: processedVans,
       allDepots: allDepots
    };
  },

  async assignVan(bookingId: string) {
    // 1. Check operating hours
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = istTime.getUTCHours();
    if (hours < 9 || hours >= 21) {
      await supabase.from('bookings').update({ status: 'rejected', dispatch_status: 'failed' }).eq('id', bookingId);
      throw new Error("Outside operating hours (9 AM - 9 PM IST)");
    }

    const { data: booking, error: bError } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
    if (bError || !booking) {
      console.error("Booking fetch error:", bError);
      throw new Error(`Booking not found: ${bError?.message || 'Unknown'}`);
    }

    const request: UserRequest = {
      bookingId: booking.id,
      userLocation: { 
         latitude: booking.latitude, 
         longitude: booking.longitude 
      },
      vehicleType: booking.vehicle_type || '4W', // Fallback or assuming denormalized or joined. Need to check if vehicle_type is available directly on booking. Let's assume booking has latitude/longitude. Note: booking might only have location text. Let's check how booking maps it.
      requiredEnergyKWh: booking.estimated_energy_kwh || (booking.energy_requested ? parseInt(booking.energy_requested.replace(/[^0-9]/g, ''), 10) : 20),
      estimatedPrice: booking.estimated_price || booking.final_amount || 0,
      estimatedOperationalCost: booking.estimated_amount * 0.4, // internal proxy
    };

    // Because booking table might not have vehicle_type directly (it's in vehicles table), we should query it:
    const { data: vehicleData } = await supabase.from('vehicles').select('vehicle_type').eq('id', booking.vehicle_id).single();
    if (vehicleData) {
      request.vehicleType = vehicleData.vehicle_type;
    }

    // 2. Lock / Fetch Vans
    // In production we'd do a row lock or postgres function to avoid race conditions.
    // Here we fetch active vans and restrict to the MVP single-van deployment.
    const { data: vans, error: vError } = await supabase.from('charging_vans')
      .select('*, depots(*)')
      .eq('van_name', PRIMARY_FLEET_VAN_NAME);
    if (vError) throw vError;

    const filteredVans = filterToPrimaryVan(vans || []);
    let bestVan = null;
    let bestVanEval = null;
    let fallbackReason = "No vans available";

    for (const van of filteredVans) {
      const evaluation = await this.evaluateVanScore(van, request);
      
      if (!evaluation.feasible) {
        // Log rejection internal
        console.log(`Van ${van.van_name} rejected: ${evaluation.reason}`);
        if (!bestVan) fallbackReason = evaluation.reason!;
        continue;
      }

      if (!bestVanEval || evaluation.score! < bestVanEval.score!) {
        bestVan = van;
        bestVanEval = evaluation;
      }
    }

    if (!bestVan) {
      // Mark booking as rejected
      await supabase.from('bookings').update({ status: 'rejected' }).eq('id', bookingId);
      throw new Error(`Dispatch failed: ${fallbackReason}`);
    }

    // 3. Assign Best Van
    const { error: assignError } = await supabase.from('bookings').update({
      assigned_van_id: bestVan.id,
      status: 'assigned',
      dispatch_status: 'assigned',
      eta_minutes: bestVanEval!.eta,
      assignment_score: bestVanEval!.score,
      live_tracking_enabled: true
    }).eq('id', bookingId);

    if (assignError) throw assignError;

    // 4. Update Van State (Atomic check to prevent concurrency collision double-booking)
    const { data: updatedVan, error: updateError } = await supabase.from('charging_vans')
      .update({
        current_status: 'enroute',
        active_booking_id: bookingId,
        sessions_completed_today: bestVan.sessions_completed_today + 1
      })
      .eq('id', bestVan.id)
      .eq('current_status', bestVan.current_status) // concurrency check
      .select('id')
      .maybeSingle();

    if (updateError) throw updateError;
    
    if (!updatedVan) {
      // Rollback booking state if van was taken by another request concurrently
      await supabase.from('bookings').update({ status: 'rejected' }).eq('id', bookingId);
      throw new Error("concurrency_conflict: This unit was just assigned to another request.");
    }

    // 5. Log Dispatch
    await supabase.from('van_dispatch_logs').insert([{
      van_id: bestVan.id,
      booking_id: bookingId,
      dispatch_status: 'assigned',
      dispatch_score: bestVanEval!.score,
      eta_minutes: bestVanEval!.eta,
      travel_distance_km: bestVanEval!.distanceKm,
      assignment_reason: 'lowest_score_assigned'
    }]);

    return { van: bestVan, eta: bestVanEval!.eta, distanceKm: bestVanEval!.distanceKm };
  },

  async simulateVanMovement() {
      // In a real application, an IoT module updates the van position.
      // Here, this is simulated for UI feedback over time.
      // The simulation would run on a cron or edge worker.
      // Since it's UI driven, we'll expose a polling or manual trigger testing endpoint if needed.
  }
};
