import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { profileService } from "@/services/profileService";
import { AlertCircle, CheckCircle2, User, X, AlertTriangle, ShieldCheck } from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import { supabase } from "@/supabaseClient";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Cropper states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

  // Delete Confirmation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ email: '', password: '' });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
    gender: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      await supabase.auth.getSession();
      const profile = await profileService.getProfile();
      if (profile) {
        const data = {
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone ? profile.phone.replace(/^\+91/, '') : "",
          avatar_url: profile.avatar_url || "",
          gender: profile.gender || ""
        };
        setFormData(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setShowCropper(true);
      e.target.value = '';
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setUploading(true);
    setMessage(null);

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
      
      const publicUrl = await profileService.uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setMessage({ type: 'success', text: 'Profile photo updated successfully.' });
      setShowCropper(false);
      setImageSrc(null);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setMessage({ type: 'error', text: 'Failed to upload photo. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.full_name || !formData.phone) {
      setMessage({ type: 'error', text: 'Full Name and Phone Number are required.' });
      return;
    }

    setSaving(true);

    try {
      await profileService.updateProfile({
        full_name: formData.full_name,
        gender: formData.gender,
        phone: formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`
      });
      setMessage({ type: 'success', text: 'Account information updated.' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: error.message === 'Failed to fetch' ? 'Unable to connect to the server. Please check your internet connection.' : (error.message || 'Failed to update profile.') });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteError(null);
    setDeleteConfirmation({ email: '', password: '' });
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleting(true);

    if (deleteConfirmation.email !== formData.email) {
      setDeleteError("Email does not match your account email.");
      setDeleting(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: deleteConfirmation.email,
        password: deleteConfirmation.password,
      });

      if (authError) {
        setDeleteError("Incorrect password. Please try again.");
        setDeleting(false);
        return;
      }

      await profileService.deleteAccount();
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setDeleteError(error.message === 'Failed to fetch' ? 'Unable to connect to the server. Please check your internet connection.' : (error.message || 'Failed to delete account. Please try again.'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 border-slate-700 border-t-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Account</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Manage your personal profile, contact information, and operational settings to keep your account secure.
          </p>
        </div>

        {message && (
          <div className={"mb-8 p-4 rounded-xl flex items-center justify-between shadow-sm border " + (
            message.type === 'success' 
              ? 'bg-emerald-900/10 text-emerald-400 border-emerald-900/50' 
              : 'bg-red-900/10 text-red-400 border-red-900/50'
          )}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
            <button type="button" onClick={() => setMessage(null)} className="p-1 opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Main Account Settings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold tracking-tight text-white mb-6">Profile Information</h2>
              
              {/* Profile Photo Upload */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-800/80 pb-8 mb-8">
                <div className="relative group shrink-0">
                  <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm transition-all group-hover:border-slate-300 group-hover:border-slate-600">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-medium text-white">Profile Photo <span className="text-slate-400 font-normal text-sm ml-1">Optional</span></h3>
                  <p className="text-sm text-slate-400 mt-1 mb-4 max-w-sm">
                    Add a recognizable photo to help operations identify you easily. Must be under 5MB.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="h-9 px-4 text-xs font-medium rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <Input 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange}
                    className="h-12 bg-slate-900 border-slate-700 focus:border-slate-400 focus:border-slate-500 rounded-xl px-4"
                    placeholder="E.g. Rahul Sharma"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm select-none">
                      +91
                    </div>
                    <Input 
                      name="phone" 
                      value={formData.phone} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, phone: val }));
                      }}
                      className="h-12 pl-12 bg-slate-900 border-slate-700 focus:border-slate-400 focus:border-slate-500 rounded-xl"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <div className="relative">
                    <Input 
                      name="email" 
                      value={formData.email} 
                      disabled 
                      className="h-12 pr-28 bg-slate-800/30 text-slate-400 border-slate-800/80 rounded-xl cursor-not-allowed select-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </div>
                  </div>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300 block mb-1">
                    Gender <span className="text-slate-400 font-normal ml-1">Optional</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-700 transition-colors"
                    >
                      <option value="">Unspecified</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Form Actions Footer */}
            <div className="bg-slate-900/50 px-6 sm:px-8 py-5 border-t border-slate-800 flex justify-end">
              <Button 
                type="submit" 
                isLoading={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-11 font-medium shadow-sm transition-all"
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="mt-12 pt-8">
             <div className="border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-900 shadow-sm transition-all">
               <div className="max-w-xl">
                 <h3 className="text-[15px] font-medium tracking-tight text-white">Delete Account</h3>
                 <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                   Permanently remove your personal data, saved vehicles, and charging history. This action is irrevocable.
                 </p>
               </div>
               <div className="shrink-0 w-full sm:w-auto">
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDeleteClick}
                    disabled={deleting}
                    className="w-full sm:w-auto h-[42px] px-6 text-[13px] font-medium text-red-400 border-slate-800 hover:border-red-900/50 hover:bg-red-500/10 rounded-xl transition-all shadow-none shrink-0"
                  >
                    Delete Account
                 </Button>
               </div>
             </div>
          </div>
        </form>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-[24px] w-full max-w-[400px] overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 relative z-50">
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
               <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                  <AlertTriangle className="h-[22px] w-[22px] text-red-500" strokeWidth={1.5} />
               </div>
               <h3 className="font-medium text-[17px] text-white tracking-tight mb-2">Delete Account</h3>
               <p className="text-[14px] leading-relaxed text-slate-400">
                 All your data including bookings, operational history, and preferences will be permanently wiped. This action cannot be undone.
               </p>
            </div>
            
            <form onSubmit={handleConfirmDelete} className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-5">
              {deleteError && (
                <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-2 text-left mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {deleteError}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Type Email to Confirm</label>
                  <Input 
                    type="email" 
                    value={deleteConfirmation.email}
                    onChange={(e) => setDeleteConfirmation({...deleteConfirmation, email: e.target.value})}
                    placeholder={formData.email}
                    className="h-[46px] rounded-xl bg-[#161616] border-slate-800 border-white/5 focus:border-red-400 focus:border-red-500 text-[14px] shadow-none w-full px-4"
                    required
                  />
                </div>
                <div className="space-y-1.5 text-left mb-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
                  <Input 
                    type="password" 
                    value={deleteConfirmation.password}
                    onChange={(e) => setDeleteConfirmation({...deleteConfirmation, password: e.target.value})}
                    placeholder="••••••••"
                    className="h-[46px] rounded-xl bg-[#161616] border-slate-800 border-white/5 focus:border-red-400 focus:border-red-500 text-[14px] shadow-none w-full px-4"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowDeleteModal(false)} 
                  disabled={deleting}
                  className="w-full sm:w-auto h-[46px] rounded-xl font-medium px-6 border-slate-800 border-white/10 text-slate-300 hover:bg-white/5 bg-transparent shadow-none transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={deleting}
                  className="w-full sm:flex-1 h-[46px] rounded-xl font-medium px-5 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border-none shadow-none flex items-center justify-center"
                >
                  Confirm Deletion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative z-50">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-white">Position Photo</h3>
              <button type="button" onClick={handleCropCancel} className="text-slate-400 hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative h-72 w-full bg-slate-950">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCropCancel} 
                  disabled={uploading}
                  className="rounded-xl border-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleCropSave} 
                  isLoading={uploading} 
                  className="gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 font-semibold"
                >
                  Save Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
