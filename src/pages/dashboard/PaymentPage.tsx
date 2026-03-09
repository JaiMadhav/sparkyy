import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Lock, CheckCircle, ShieldCheck } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { bookingService } from "@/services/bookingService";
import { profileService } from "@/services/profileService";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [amount, setAmount] = useState(1.00); // Mock amount: ₹1 for testing
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    if (location.state?.bookingId) {
      setBookingId(location.state.bookingId);
      loadBookingDetails(location.state.bookingId);
    }
    if (location.state?.amount) {
      setAmount(location.state.amount);
    }
    loadProfile();
  }, [location.state]);

  const loadBookingDetails = async (id: string) => {
    try {
      const details = await bookingService.getBookingById(id);
      setBookingDetails(details);
      // For mock purposes, we keep amount at ₹1
      setAmount(1.00);
    } catch (error) {
      console.error("Failed to load booking details", error);
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const callbackUrl = `${window.location.origin}/dashboard`;
      
      const linkResponse = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1.00, // Force ₹1 for mock testing
          receipt: bookingId || `receipt_${Date.now()}`,
          customer: {
            name: userProfile?.full_name || "Guest User",
            email: userProfile?.email || "guest@example.com",
            phone: userProfile?.phone || "+919999999999"
          },
          callback_url: callbackUrl
        }),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create payment link");
      }

      const linkData = await linkResponse.json();
      
      if (linkData.short_url) {
        // Redirect to Razorpay hosted checkout
        window.location.href = linkData.short_url;
      } else {
        throw new Error("No payment URL received from Razorpay");
      }
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      alert(`Failed to initialize payment: ${error.message || 'Please check your Razorpay API keys.'}`);
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="bg-emerald-100 p-4 rounded-full mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Thank you for using SPARK. Your receipt has been generated.</p>
          <Button onClick={() => navigate("/dashboard/history")}>View History</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete your booking securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Pay securely via Razorpay (UPI, Cards, Netbanking).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="h-12 w-12 text-emerald-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Secure Payment Gateway</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
                    You will be redirected to Razorpay's secure checkout to complete your payment. All major credit cards, debit cards, UPI, and netbanking are supported.
                  </p>
                  <Button onClick={handlePayment} className="w-full max-w-xs h-12 text-lg" isLoading={processing}>
                    Pay ₹{amount.toFixed(2)}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Your payment is secured with 256-bit SSL encryption.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingDetails ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Date & Time</span>
                    <span className="font-medium dark:text-white">
                      {new Date(bookingDetails.scheduled_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Location</span>
                    <span className="font-medium dark:text-white truncate max-w-[200px]" title={bookingDetails.location}>
                      {bookingDetails.location || "Custom Location"}
                    </span>
                  </div>
                  {bookingDetails.vehicle && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Vehicle</span>
                      <span className="font-medium dark:text-white">
                        {bookingDetails.vehicle.make} {bookingDetails.vehicle.model}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Service Fee</span>
                    <span className="font-medium dark:text-white">₹50.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Est. Energy</span>
                    <span className="font-medium dark:text-white">₹{(amount - 85).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Distance Charge</span>
                    <span className="font-medium dark:text-white">₹35.00</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Service Fee</span>
                    <span className="font-medium dark:text-white">₹50.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Est. Energy</span>
                    <span className="font-medium dark:text-white">₹{(amount - 85).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Distance Charge</span>
                    <span className="font-medium dark:text-white">₹35.00</span>
                  </div>
                </>
              )}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                <span>Total</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
