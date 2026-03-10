import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { bookingService } from "@/services/bookingService";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Download } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { formatLocation } from "@/utils/location";

export default function BookingHistory() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleCancelBooking = async (id: string) => {
    setCancellingId(id);
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    setIsCancelling(true);
    try {
      await bookingService.updateBookingStatus(cancellingId, 'cancelled');
      // Also try to update payment status if it exists
      try {
        const { error } = await supabase
          .from('payments')
          .update({ status: 'cancelled' })
          .eq('booking_id', cancellingId);
        if (error) console.error("Error cancelling payment:", error);
      } catch (e) {
        console.error("Error updating payment status", e);
      }
      loadBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please check your database permissions (RLS).");
    } finally {
      setCancellingId(null);
      setIsCancelling(false);
    }
  };

  const generateReceipt = (booking: any) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      alert("Please allow popups to view the receipt.");
      return;
    }

    const date = new Date(booking.created_at).toLocaleString();
    const price = Number(booking.estimated_price).toFixed(2);
    const vehicle = booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.registration_number})` : 'Unknown Vehicle';
    const location = formatLocation(booking.location);
    const energy = booking.energy_requested || 'N/A';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - SPARK EV</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; background: #f9f9f9; }
          .receipt-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #059669; margin: 0; }
          .logo span { color: #333; }
          .receipt-title { font-size: 24px; color: #333; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .info-block { flex: 1; }
          .info-block h3 { font-size: 14px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
          .info-block p { margin: 0 0 5px 0; font-size: 16px; font-weight: 500; }
          table { border-collapse: collapse; margin-bottom: 30px; width: 100%; }
          th { text-align: left; padding: 12px; background: #f5f5f5; color: #333; font-weight: 600; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #ddd; }
          td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 16px; }
          .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #333; border-bottom: none; }
          .total-amount { color: #059669; font-size: 24px !important; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          @media print {
            body { background: #fff; padding: 0; }
            .receipt-container { box-shadow: none; border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div>
              <h1 class="logo">SPARK <span>EV</span></h1>
              <p style="margin: 5px 0 0 0; color: #666;">Mobile EV Charging Service</p>
            </div>
            <div style="text-align: right;">
              <h2 class="receipt-title">Tax Invoice / Receipt</h2>
              <p style="margin: 5px 0 0 0; color: #666;">Receipt #: REC-${booking.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-block">
              <h3>Billed To</h3>
              <p>Customer</p>
              <p style="font-weight: normal; color: #555;">${vehicle}</p>
            </div>
            <div class="info-block" style="text-align: right;">
              <h3>Date of Service</h3>
              <p>${date}</p>
              <h3>Service Status</h3>
              <p style="color: #059669;">COMPLETED & PAID</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Location</th>
                <th>Energy</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mobile EV Charging Service<br><span style="font-size: 13px; color: #666;">Includes dispatch and charging</span></td>
                <td>${location}</td>
                <td>${energy}</td>
                <td style="text-align: right;">₹${price}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total Amount Paid</td>
                <td class="total-amount" style="text-align: right;">₹${price}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Thank you for choosing SPARK EV. For support, contact support@sparkev.com</p>
            <p>This is a computer generated receipt and does not require a physical signature.</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    receiptWindow.document.open();
    receiptWindow.document.write(html);
    receiptWindow.document.close();
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Booking History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View your past charging sessions.</p>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {new Date(booking.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {formatLocation(booking.location)}
                    </td>
                    <td className="px-6 py-4">
                      {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'Unknown Vehicle'}
                    </td>
                    <td className="px-6 py-4">₹{Number(booking.estimated_price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        booking.status === 'dispatched' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        booking.status === 'pending_payment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {booking.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {booking.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {booking.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                        {booking.status.replace('_', ' ').charAt(0).toUpperCase() + booking.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(booking.status === 'pending' || booking.status === 'dispatched' || booking.status === 'pending_payment') ? (
                        <div className="flex gap-3">
                          <Link 
                            to="/dashboard/payment" 
                            state={{ bookingId: booking.id, amount: booking.estimated_price }}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                          >
                            Pay Now
                          </Link>
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 dark:text-red-400 font-medium hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : booking.status === 'cancelled' ? (
                        <span className="text-slate-400 dark:text-slate-500 italic">Cancelled</span>
                      ) : (
                        <button 
                          onClick={() => generateReceipt(booking)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" /> View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Booking</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCancellingId(null)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white" 
                onClick={confirmCancel}
                isLoading={isCancelling}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
