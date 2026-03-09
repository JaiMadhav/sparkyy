import { supabase } from "../supabaseClient";

export const authService = {
  login: async (email: string, password: string) => {
    // Placeholder login
    return { user: { id: 1, name: "John Doe", email } };
  },
  signup: async (data: any) => {
    // Placeholder signup
    return { user: { id: 1, ...data } };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  getCurrentUser: () => {
    return { id: 1, name: "John Doe", email: "john@example.com" };
  }
};
