import { supabase } from "../supabaseClient";

export const vehicleService = {
  getVehicles: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching vehicles:", error);
      return [];
    }
    return data || [];
  },

  addVehicle: async (vehicle: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Ensure year is passed as a string/number that Supabase can coerce
    const payload = { 
      ...vehicle, 
      year: vehicle.year ? vehicle.year.toString() : null,
      user_id: user.id 
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    return data;
  },

  deleteVehicle: async (id: string) => {
    // First, delete any bookings associated with this vehicle to avoid foreign key constraints
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .eq('vehicle_id', id);
      
    if (bookingsError) {
      console.error("Error deleting associated bookings:", bookingsError);
      // We don't throw here, as it might fail if there are no bookings or due to other constraints,
      // but we log it. If it fails, the vehicle deletion will likely fail next.
    }

    // Then delete the vehicle itself
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
