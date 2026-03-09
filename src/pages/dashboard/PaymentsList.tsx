import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { paymentService } from "@/services/paymentService";
import { bookingService } from "@/services/bookingService";
import { CheckCircle2, Clock, XCircle, AlertTriangle, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { formatLocation } from "@/utils/location";

export default function PaymentsList() {
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, bookingsData] = await Promise.all([
        paymentService.getPayments(),
        bookingService.getBookings()
      ]);
      
      setPayments(paymentsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error loading payments data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Combine bookings and payments to show all payment statuses
  const allPaymentRecords = bookings.map(booking => {
    const relatedPayment = payments.find(p => p.booking_id === booking.id);
    
    return {
      id: booking.id,
      date: booking.created_at,
      location: booking.location,
      amount: booking.estimated_price,
      status: relatedPayment ? relatedPayment.status : (booking.status === 'pending_payment' ? 'pending' : (booking.status === 'cancelled' ? 'cancelled' : 'unpaid')),
      paymentId: relatedPayment?.id || null,
      method: relatedPayment?.payment_method || 'N/A'
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View your payment history and pending bills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Paid</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{payments.filter(p => p.status === 'completed' || p.status === 'successful').reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2)}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Payments</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{allPaymentRecords.filter(p => p.status === 'pending' || p.status === 'unpaid').reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">Loading payments...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allPaymentRecords.map((record) => (
                    <tr key={record.id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {new Date(record.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {formatLocation(record.location)}
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{record.amount}</td>
                      <td className="px-6 py-4 capitalize">{record.method}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'completed' || record.status === 'successful' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          record.status === 'pending' || record.status === 'unpaid' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {(record.status === 'completed' || record.status === 'successful') && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {(record.status === 'pending' || record.status === 'unpaid') && <Clock className="w-3 h-3 mr-1" />}
                          {record.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                          {record.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(record.status === 'pending' || record.status === 'unpaid') ? (
                          <Link 
                            to="/dashboard/payment" 
                            state={{ bookingId: record.id, amount: record.amount }}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-8 px-3 py-1"
                          >
                            <CreditCard className="w-3 h-3 mr-1.5" />
                            Pay Now
                          </Link>
                        ) : (record.status === 'completed' || record.status === 'successful') ? (
                          <button className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-sm">
                            Receipt
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allPaymentRecords.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
