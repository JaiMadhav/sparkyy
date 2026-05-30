import { supabase } from "../supabaseClient";

const handleAuthError = (err: any) => {
  console.error("Auth error:", err);
  if (err.message === 'Failed to fetch') {
    throw new Error("Unable to connect to authentication server. Please check your internet connection or if the Supabase project is active.");
  }
  throw err;
};

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      handleAuthError(err);
    }
  },
  signup: async (formData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.name,
            phone: formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`,
            referral_code_used: formData.referralCode || null,
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      handleAuthError(err);
    }
  },
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      handleAuthError(err);
    }
  },
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (err) {
      console.error("Error getting user:", err);
      return null;
    }
  }
};
