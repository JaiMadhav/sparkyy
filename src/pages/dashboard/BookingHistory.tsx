import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { bookingService } from "@/services/bookingService";
import { CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
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
                    <td className="px-6 py-4">₹{booking.estimated_price}</td>
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
                        <button className="text-emerald-600 dark:text-emerald-400 hover:underline">View Receipt</button>
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
