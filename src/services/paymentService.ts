import { supabase } from "../supabaseClient";

export const paymentService = {
  createPayment: async (payment: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Generate a receipt number for successful payments
    const receipt_no = payment.status === 'completed' 
      ? `RCPT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
      : null;

    const { data, error } = await supabase
      .from('payments')
      .insert([{ 
        ...payment, 
        user_id: user.id,
        ...(receipt_no ? { receipt_no } : {})
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
