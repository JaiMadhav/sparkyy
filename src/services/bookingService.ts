import { supabase } from "../supabaseClient";

export const bookingService = {
  createBooking: async (booking: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ 
        ...booking, 
        user_id: user.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getBookings: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles(make, model, registration_number, vehicle_type),
        payments(receipt_no, payment_method)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getActiveBooking: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .in('status', ['pending', 'assigned', 'enroute', 'arrived', 'charging', 'pending_payment'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  },

  getBookingById: async (id: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles(make, model, registration_number, vehicle_type)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  updateBookingStatus: async (id: string, status: string) => {
    // Backend Enforcement Logic roughly implemented here
    if (status === 'cancelled') {
        const { data: currentBooking, error: fetchError } = await supabase
          .from('bookings')
          .select('status, charging_started_at')
          .eq('id', id)
          .single();
          
        if (!fetchError && currentBooking) {
            const uncancelableStatuses = ['assigned', 'enroute', 'arrived', 'charging', 'pending_payment', 'paid', 'completed'];
            if (uncancelableStatuses.includes(currentBooking.status) || currentBooking.charging_started_at) {
                throw new Error("Cancellation is no longer available as operational work has already started.");
            }
        }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
