import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { profileService } from "@/services/profileService";
import { AlertCircle, CheckCircle2, Camera, User, X, Check, AlertTriangle } from "lucide-react";
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
    gender: "",
    aadhaar_number: ""
  });
  
  const [initialData, setInitialData] = useState<typeof formData | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Call getSession first to ensure session is refreshed sequentially
      // This prevents the "Lock broken by another request with the 'steal' option" error
      await supabase.auth.getSession();
      const profile = await profileService.getProfile();
      if (profile) {
        const data = {
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          avatar_url: profile.avatar_url || "",
          gender: profile.gender || "",
          aadhaar_number: profile.aadhaar_number || ""
        };
        setFormData(data);
        setInitialData(data);
        // If data exists, assume it was verified before (or doesn't need re-verification until changed)
        setIsVerified(true);
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
      // Reset file input so same file can be selected again if needed
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

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
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
    
    // Validate Aadhaar
    if (formData.aadhaar_number && !/^\d{12}$/.test(formData.aadhaar_number)) {
      setMessage({ type: 'error', text: 'Aadhaar number must be exactly 12 digits.' });
      return;
    }

    setSaving(true);

    try {
      await profileService.updateProfile({
        full_name: formData.full_name,
        gender: formData.gender,
        aadhaar_number: formData.aadhaar_number
      });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
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
      // Verify password by attempting to sign in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: deleteConfirmation.email,
        password: deleteConfirmation.password,
      });

      if (authError) {
        setDeleteError("Incorrect password. Please try again.");
        setDeleting(false);
        return;
      }

      // Proceed with deletion
      await profileService.deleteAccount();
      navigate("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setDeleteError(error.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences.</p>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-md overflow-hidden shadow-2xl border border-red-200 dark:border-red-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Delete Account</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmDelete} className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                This action is <strong>irreversible</strong>. All your data including profile, bookings, and history will be permanently deleted.
                <br /><br />
                Please enter your email and password to confirm.
              </p>

              {deleteError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {deleteError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Input 
                    type="email" 
                    value={deleteConfirmation.email}
                    onChange={(e) => setDeleteConfirmation({...deleteConfirmation, email: e.target.value})}
                    placeholder={formData.email}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <Input 
                    type="password" 
                    value={deleteConfirmation.password}
                    onChange={(e) => setDeleteConfirmation({...deleteConfirmation, password: e.target.value})}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" isLoading={deleting}>
                  Permanently Delete
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg dark:text-white">Crop Profile Photo</h3>
              <button onClick={handleCropCancel} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800">
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
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-emerald-600"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCropCancel} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleCropSave} isLoading={uploading} className="gap-2">
                  <Check className="h-4 w-4" /> Save Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-200">Profile Photo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Upload a new photo to update your profile.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input 
                  label="Full Name" 
                  name="full_name" 
                  value={formData.full_name} 
                  disabled
                  className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <Input 
                  label="Email" 
                  name="email" 
                  value={formData.email} 
                  disabled 
                  className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <Input 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone || "Not provided"} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, phone: val }));
                  }}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <Input 
                  label="Aadhaar Number" 
                  name="aadhaar_number" 
                  value={formData.aadhaar_number} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, aadhaar_number: val }));
                  }}
                  placeholder="12-digit Aadhaar Number"
                  maxLength={12}
                />
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={handleDeleteClick}
                  isLoading={deleting}
                >
                  Delete Account
                </Button>
                <Button 
                  type="submit" 
                  isLoading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
