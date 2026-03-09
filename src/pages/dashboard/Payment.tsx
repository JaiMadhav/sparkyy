import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { bookingService } from "@/services/bookingService";

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const amount = searchParams.get("amount");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId || !amount) {
      navigate("/dashboard");
    }
  }, [bookingId, amount, navigate]);

  const handlePayment = async () => {
    if (!bookingId) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Update booking status to completed
        await bookingService.updateBookingStatus(bookingId, 'completed');
        setIsSuccess(true);
        
        // Redirect to history after a short delay
        setTimeout(() => {
          navigate("/dashboard/history");
        }, 2000);
      } catch (error) {
        console.error("Failed to update booking status:", error);
        alert("Payment successful, but failed to update booking status.");
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (isSuccess) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center py-8">
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h2>
              <p className="text-slate-500 dark:text-slate-400">
                Your charging session is complete. Redirecting to your history...
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <CardDescription>Pay for your completed charging session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Amount Due</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">₹{amount}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs font-bold">UPI</div>
                  <span className="font-medium">Pay via UPI</span>
                </div>
                <div className="h-4 w-4 rounded-full border-2 border-emerald-500 bg-emerald-500 ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-slate-900"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors opacity-50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-500" />
                  <span className="font-medium">Credit / Debit Card</span>
                </div>
                <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
