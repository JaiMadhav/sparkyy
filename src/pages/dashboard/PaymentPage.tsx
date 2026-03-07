import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CreditCard, Lock, CheckCircle } from "lucide-react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/tracking"), 2000);
    }, 2000);
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="bg-emerald-100 p-4 rounded-full mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-8">Your charging van is being dispatched.</p>
          <Button onClick={() => navigate("/dashboard/tracking")}>Track Order</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Payment</h1>
        <p className="text-slate-500 mt-1">Complete your booking securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Enter your card details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-4">
                  <Input label="Cardholder Name" placeholder="John Doe" required />
                  <Input label="Card Number" placeholder="0000 0000 0000 0000" icon={<CreditCard className="h-4 w-4 text-slate-400" />} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry Date" placeholder="MM/YY" required />
                    <Input label="CVC" placeholder="123" required />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-3 text-sm text-slate-600">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Your payment is secured with 256-bit SSL encryption.
                </div>

                <Button type="submit" className="w-full h-12 text-lg" isLoading={processing}>
                  Pay $20.50
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Service Fee</span>
                <span className="font-medium">$5.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Est. Energy (30kWh)</span>
                <span className="font-medium">$12.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Distance Charge</span>
                <span className="font-medium">$3.50</span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between font-bold text-lg text-slate-900">
                <span>Total</span>
                <span>$20.50</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
