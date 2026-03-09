import { supabase } from "../supabaseClient";

let cachedProfile: any = null;

export const profileService = {
  getCachedProfile: () => cachedProfile,
  
  clearCache: () => {
    cachedProfile = null;
  },

  getProfile: async (forceRefresh = false) => {
    if (cachedProfile && !forceRefresh) return cachedProfile;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Try to get profile from 'profiles' table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // If error is NOT "no rows returned", throw it
      console.error("Error fetching profile:", error);
    }

    // If profile exists, return it
    if (profile) {
      cachedProfile = { ...profile, email: user.email };
      
      // If phone is missing in profile but exists in user_metadata (from signup), sync it
      if (!profile.phone && user.user_metadata?.phone) {
        cachedProfile.phone = user.user_metadata.phone;
        // Silently update the database so it's persisted
        supabase.from('profiles').update({ phone: user.user_metadata.phone }).eq('id', user.id).then();
      }
      
      return cachedProfile;
    }

    // If no profile exists (e.g. no trigger), return user metadata
    // and try to create the profile record for future use
    const newProfile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      phone: user.user_metadata?.phone || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      gender: user.user_metadata?.gender || '',
      aadhaar_number: user.user_metadata?.aadhaar_number || '',
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Attempt to create the profile record silently
    // We don't await this or block on error because the user just wants to see their data
    supabase.from('profiles').insert([{
      id: user.id,
      full_name: newProfile.full_name,
      phone: newProfile.phone,
      avatar_url: newProfile.avatar_url,
      gender: newProfile.gender,
      aadhaar_number: newProfile.aadhaar_number,
      email: newProfile.email,
    }]).then(({ error }) => {
      if (error) console.error("Error creating profile:", error);
    });

    cachedProfile = newProfile;
    return newProfile;
  },

  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Add updated_at timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updatesWithTimestamp })
      .select()
      .single();

    if (error) throw error;
    
    if (cachedProfile) {
      cachedProfile = { ...cachedProfile, ...data };
    }
    return data;
  },

  uploadAvatar: async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Use a timestamp to ensure uniqueness and avoid caching issues
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Attempt upload with upsert: true to overwrite if somehow exists
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    // Update profile with new avatar URL
    await profileService.updateProfile({ avatar_url: data.publicUrl });
    
    return data.publicUrl;
  },

  deleteAccount: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Attempt to call a Postgres function to delete the user from auth.users
    // This function must be created in the database with SECURITY DEFINER
    const { error } = await supabase.rpc('delete_user');

    if (error) {
      console.error("RPC delete_user failed:", error);
      
      // Fallback: Delete profile data manually if RPC fails or doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      // Sign out as a fallback
      await supabase.auth.signOut();
      profileService.clearCache();
      return true;
    }

    // If RPC succeeds, the user is deleted and session is invalid.
    // We should clear local session just in case.
    await supabase.auth.signOut();
    profileService.clearCache();
    return true;
  }
};
