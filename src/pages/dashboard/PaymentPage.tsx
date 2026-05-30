import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Lock, CheckCircle, ShieldCheck } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { bookingService } from "@/services/bookingService";
import { profileService } from "@/services/profileService";
import { supabase } from "@/supabaseClient";

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
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [amount, setAmount] = useState(location.state?.amount || 1.00);
  const [vehicleTypeState, setVehicleTypeState] = useState<string>(location.state?.vehicleType || "4W");
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
    if (location.state?.vehicleType) {
      setVehicleTypeState(location.state.vehicleType);
    }
    loadProfile();
  }, [location.state]);

  const loadBookingDetails = async (id: string) => {
    try {
      const details = await bookingService.getBookingById(id);
      setBookingDetails(details);
      
      // Check if payment already exists in database
      const { data: existingPayments } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', id);

      // Prevent duplicate payment
      if (details.status === 'completed' || (existingPayments && existingPayments.length > 0)) {
        setSuccess(true);
        if (details.status !== 'completed') {
          await bookingService.updateBookingStatus(id, "completed");
        }
        return;
      } else if (details.status !== 'pending_payment') {
        // Enforce pending_payment status just by being on this page
        await bookingService.updateBookingStatus(id, "pending_payment").catch(console.error);
      }
      
      if (details.estimated_price) {
        setAmount(Number(details.estimated_price));
      }
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
    setError(null);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // Create Order
      const apiUrl = '/api/create-order';
      
      const orderResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          receipt: bookingId || `receipt_${Date.now()}`,
        }),
      });

      if (!orderResponse.ok) {
        let errorMessage = `Server responded with ${orderResponse.status}`;
        try {
          const errorData = await orderResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const orderData = await orderResponse.json();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SPARK EV",
        description: "EV Charging Service",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyUrl = '/api/verify-payment';
              
            const verifyResponse = await fetch(verifyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            let verifyData;
            const contentType = verifyResponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              verifyData = await verifyResponse.json();
            } else {
              const text = await verifyResponse.text();
              console.error("Non-JSON response from verify-payment:", text);
              throw new Error(`Server returned non-JSON response: ${verifyResponse.status}`);
            }

            if (verifyData.success) {
              try {
                if (bookingId) {
                  await bookingService.updateBookingStatus(bookingId, "completed");
                }
                await paymentService.createPayment({
                  amount: amount,
                  booking_id: bookingId,
                  transaction_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  status: "completed",
                  payment_method: verifyData.payment_method || "razorpay"
                });
              } catch (dbError) {
                console.error("Database update failed after successful payment:", dbError);
              }

              setSuccess(true);
            } else {
              alert(`Payment verification failed: ${verifyData.error || 'Unknown error'}`);
            }
          } catch (error: any) {
            console.error("Verification error", error);
            alert(`Payment verification error: ${error.message || 'Please contact support.'}`);
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: userProfile?.full_name || "Guest User",
          email: userProfile?.email || "guest@example.com",
          contact: userProfile?.phone || "+919999999999"
        },
        theme: {
          color: "#059669"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            setError("Payment pending. Please try again.");
            if (bookingId) {
              bookingService.updateBookingStatus(bookingId, "pending_payment").catch(console.error);
            }
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any){
        alert(response.error.description);
        setProcessing(false);
        if (bookingId) {
          bookingService.updateBookingStatus(bookingId, "pending_payment").catch(console.error);
        }
      });

      rzp.open();
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
          <div className="bg-emerald-900/20 p-4 rounded-full mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-400 mb-8">Thank you for using SPARK. Your receipt has been generated.</p>
          <Button onClick={() => navigate("/dashboard/history")}>View History</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Invoice calculations
  const finalAmount = amount;
  const GST_RATE = 0.18; // 18% GST
  const preTaxAmount = finalAmount / (1 + GST_RATE);
  const gstAmount = finalAmount - preTaxAmount;
  
  const vType = (bookingDetails?.vehicle?.vehicle_type || vehicleTypeState || "4W") as "2W" | "3W" | "4W";
  const PRICING_RANGES = {
    "2W": { minTotal: 57, maxTotal: 98, minCost: 25, maxCost: 43 },
    "3W": { minTotal: 75, maxTotal: 153, minCost: 38, maxCost: 64 },
    "4W": { minTotal: 225, maxTotal: 535, minCost: 124, maxCost: 258 }
  };
  const range = PRICING_RANGES[vType] || PRICING_RANGES["4W"];
  
  let scalingRatio = (finalAmount - range.minTotal) / ((range.maxTotal - range.minTotal) || 1);
  scalingRatio = Math.min(1, Math.max(0, scalingRatio));
  
  const opsCost = range.minCost + (range.maxCost - range.minCost) * scalingRatio;
  const baseServicePrice = Math.max(0, preTaxAmount - opsCost);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Payment</h1>
        <p className="text-slate-400 mt-1">Complete your payment securely.</p>
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
                <div className="bg-slate-800/50 p-6 rounded-lg flex flex-col items-center justify-center text-center border border-slate-800 border-slate-700">
                  <ShieldCheck className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Secure Payment Gateway</h3>
                  <p className="text-slate-400 text-sm max-w-md mb-6">
                    You will be redirected to Razorpay's secure checkout to complete your payment. All major credit cards, debit cards, UPI, and netbanking are supported.
                  </p>
                  
                  {error && (
                    <div className="w-full max-w-md mb-6 p-4 bg-red-950/20 border border-red-900/40 rounded-lg text-red-400 text-sm font-semibold text-center">
                      {error}
                    </div>
                  )}

                  <Button onClick={handlePayment} className="w-full max-w-xs h-12 text-lg" isLoading={processing}>
                    Pay ₹{amount.toFixed(2)}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  Your payment is secured with 256-bit SSL encryption.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Date & Time</span>
                    <span className="font-medium text-white">
                      {bookingDetails?.scheduled_time ? new Date(bookingDetails.scheduled_time).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Location</span>
                    <span className="font-medium text-white text-right max-w-[250px] break-words whitespace-normal" title={bookingDetails?.location || ""}>
                      {bookingDetails?.location || "Custom Location"}
                    </span>
                  </div>
                  {bookingDetails?.vehicle && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Vehicle</span>
                      <span className="font-medium text-white text-right">
                        {bookingDetails.vehicle.make} {bookingDetails.vehicle.model}
                        {bookingDetails.vehicle.year && <span className="text-slate-500 font-normal ml-1">({bookingDetails.vehicle.year})</span>}
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{bookingDetails.vehicle.registration_number}</div>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Energy Charge</span>
                    <span className="font-medium font-mono text-white">₹{baseServicePrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Service & Dispatch</span>
                      <span className="font-medium font-mono text-white">₹{opsCost.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5 leading-tight pr-6">Covers vehicle dispatch, routing, and on-site EV charging support.</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">GST / Taxes <span className="text-[14px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">18%</span></span>
                    <span className="font-medium text-white">₹{gstAmount.toFixed(2)}</span>
                  </div>
                </>
              <div className="pt-4 border-t border-slate-800 flex justify-between font-bold text-lg text-white">
                <span>Final Payable Amount</span>
                <span className="text-emerald-400">₹{finalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
