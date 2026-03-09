import { supabase } from "../supabaseClient";

export const paymentService = {
  createPayment: async (payment: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('payments')
      .insert([{ 
        ...payment, 
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getPayments: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
