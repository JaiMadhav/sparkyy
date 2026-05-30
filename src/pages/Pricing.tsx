import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/Button";
import { Check, CreditCard, Gift, Users, Zap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";

export default function Pricing() {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: string, amount: number) => {
    try {
      setLoadingPlan(plan);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { state: { returnTo: '/pricing' } });
        return;
      }

      // Check if user already has an active subscription
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingSub) {
        alert("You already have an active subscription!");
        navigate('/dashboard');
        return;
      }

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, receipt: `sub_${new Date().getTime()}` }),
      });
      
      if (!orderRes.ok) throw new Error("Failed to create order");
      
      const order = await orderRes.json();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: order.amount,
        currency: order.currency,
        name: "Spark EV",
        description: `Subscription to ${plan.replace('_', ' ')}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Add subscription to database
              const expiry = new Date();
              expiry.setMonth(expiry.getMonth() + 1);
              
              const { error } = await supabase.from('subscriptions').insert({
                user_id: session.user.id,
                plan_type: plan,
                status: 'active',
                amount: amount,
                expires_at: expiry.toISOString(),
              });
              
              if (error) {
                console.error("Failed to save subscription:", error);
                alert("Payment successful but failed to setup subscription. Please contact support.");
              } else {
                alert(`Successfully subscribed to ${plan.replace('_', ' ')}!`);
                navigate('/dashboard');
              }
            } else {
              alert("Payment verification failed");
            }
          } catch (e) {
            console.error(e);
            alert("Error verifying payment");
          }
        },
        prefill: {
          name: session.user.user_metadata?.full_name || "",
          email: session.user.email || "",
          contact: session.user.phone || "",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(response.error.description);
      });
      rzp.open();
      
    } catch (error) {
      console.error(error);
      alert("Failed to initialize payment");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <MainLayout>
      <section className="py-24 px-4 relative overflow-hidden bg-slate-950 min-h-screen">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-[120px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 tracking-tight">
              Power Up Your Journey
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-normal">
              Choose a subscription that matches your charging needs, or refer friends to earn free sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Subscription Plans Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-7 w-7 text-emerald-400" />
                <h2 className="text-3xl font-bold text-white tracking-tight">Subscription Plan</h2>
              </div>

              {/* Add-on Membership */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/60 shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white">Add on Membership</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-400">₹149</span>
                      <span className="text-slate-400 text-base">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3 text-base text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>10% discount on every charge.</span>
                    </li>
                    <li className="flex items-start gap-3 text-base text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Priority queue during peak hours.</span>
                    </li>
                  </ul>
                </div>
                <Button 
                  onClick={() => handleSubscribe('addon_membership', 149)}
                  disabled={loadingPlan === 'addon_membership'}
                  variant="outline" 
                  className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                >
                  {loadingPlan === 'addon_membership' ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </motion.div>

              {/* Lite (Daily Users) */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl p-6 border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white">Lite (Daily Users)</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">₹999</span>
                      <span className="text-slate-400 text-base">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3 text-base text-slate-300">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span>Upto 12 sessions <strong className="text-white">(2W & 3W)</strong></span>
                    </li>
                    <li className="flex items-start gap-3 text-base text-slate-300">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span>Saves ₹100–150 vs pay-per-charge.</span>
                    </li>
                    <li className="flex items-start gap-3 text-base text-slate-300">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span>Free cancellation</span>
                    </li>
                    <li className="flex items-start gap-3 text-base text-slate-300">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span>Priority booking & clear monthly savings summary.</span>
                    </li>
                  </ul>
                </div>
                <Button 
                  onClick={() => handleSubscribe('lite_plan', 999)}
                  disabled={loadingPlan === 'lite_plan'}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  {loadingPlan === 'lite_plan' ? 'Processing...' : 'Choose Lite'}
                </Button>
              </motion.div>

            </div>

            {/* Refer & Earn Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="h-7 w-7 text-indigo-400" />
                <h2 className="text-3xl font-bold text-white tracking-tight">Refer & Earn</h2>
              </div>

              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl p-6 border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
              >
                <p className="text-slate-300 text-base font-normal mb-6 leading-relaxed">
                  Encourage high quality users that lead to real usage, not just sign-ups.
                </p>

                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-5 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-200">Refer 3 Friends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">Free Charge</span>
                  </div>
                </div>

                <p className="text-emerald-400 text-base font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Get 1 free charge worth ₹100
                </p>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl"
                  >
                    Go to Dashboard to get link
                  </Button>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
