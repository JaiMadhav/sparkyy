import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MainLayout } from "@/layouts/MainLayout";
import { ArrowRight, Clock, MapPin, ShieldCheck, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { motion } from "motion/react";

export default function LandingPage() {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-slate-950 overflow-hidden min-h-[90vh] flex items-center pt-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')] bg-cover bg-center mix-blend-multiply dark:mix-blend-screen opacity-[0.32] dark:opacity-15 transition-all duration-500"></div>
        {/* Fine, warm photographic tint for premium atmosphere in light mode */}
        <div className="absolute inset-0 bg-amber-500/[0.02] dark:bg-transparent pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 via-slate-950/35 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-base font-semibold shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Spark EV Now Live in Delhi NCR
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tight leading-tight mb-8 max-w-5xl">
            Mobile EV charging, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-gradient-x">delivered where your vehicle stops.</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-slate-300 mb-12 max-w-4xl leading-relaxed font-normal">
            Skip station queues. Spark EV dispatches fast charging vans directly to homes, offices, parking lots and roadside emergencies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center max-w-lg mx-auto min-h-[64px]">
            {session === undefined ? (
              <div className="w-full sm:w-[200px] h-16 rounded-2xl bg-emerald-500/20 animate-pulse"></div>
            ) : session ? (
               <Link to="/dashboard" className="w-full sm:w-auto">
                 <Button size="lg" className="w-full text-lg h-16 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.7)] hover:-translate-y-1 transition-all duration-300">
                   Go to Dashboard
                 </Button>
               </Link>
            ) : (
               <Link to="/login" className="w-full sm:w-auto">
                 <Button size="lg" className="w-full text-lg h-16 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.7)] hover:-translate-y-1 transition-all duration-300">
                   Get Started
                   <ArrowRight className="ml-2 h-6 w-6" />
                 </Button>
               </Link>
            )}
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg h-16 px-10 rounded-2xl bg-slate-900/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm transition-all duration-300">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-background relative border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">Why Spark EV?</h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed">
              Fast mobile EV charging, delivered directly to your vehicle with live tracking and transparent pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />}
              title="Live Dispatch Tracking"
              description="Track your assigned charging van in real time with accurate ETAs and live location updates."
            />
            <FeatureCard 
              icon={<MapPin className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />}
              title="Rapid Urban Coverage"
              description="Distributed fleet deployment helps Spark EV respond quickly across high demand city zones."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />}
              title="Secure Charging Operations"
              description="Transparent pricing, verified technicians and monitored charging sessions designed for safe EV support."
            />
          </div>
        </div>
      </section>

      {/* Industry Analysis & Competitive Moat */}
      <section id="industry-analysis" className="py-32 bg-background border-y border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          
          {/* SECTION 1 — PREMIUM HEADING */}
          <div className="text-center mb-24 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] bg-emerald-400/20 blur-[100px] rounded-full pointer-events-none dark:opacity-50"></div>
             
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="text-6xl md:text-8xl font-black text-foreground mb-8 tracking-tight"
             >
               Industry Analysis<br/> & Competitive Moat
             </motion.h2>
             
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.1 }}
               className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed"
             >
               Spark EV brings fast mobile EV charging directly to the customer — eliminating station dependency and reducing operational friction.
             </motion.p>
          </div>

          {/* SECTION 2 — INTERACTIVE VISUAL COMPARISON */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-32 max-w-5xl mx-auto relative rounded-3xl overflow-hidden shadow-sm border border-border bg-card"
          >
             <div className="grid grid-cols-1 md:grid-cols-2">
                {/* LEFT — Traditional */}
                <div className="p-12 relative overflow-hidden group bg-red-500/[0.02] dark:bg-red-950/[0.05]">
                   <div className="relative z-10">
                      <div className="bg-red-50 dark:bg-red-950/50 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-sm font-bold px-4 py-1.5 rounded-full w-fit mb-6 uppercase tracking-wider shadow-sm">
                        Station Dependent
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">Traditional Charging</h3>
                      <ul className="space-y-5">
                        {[
                          'Expected waiting queues',
                          'Fixed infrastructure',
                          'Time wasted traveling to charger',
                          'Dependency on crowded stations',
                        ].map((item, i) => (
                           <li key={i} className="flex items-center text-lg md:text-xl font-medium text-muted-foreground">
                             <div className="mr-3 flex-shrink-0 h-2 w-2 rounded-full bg-red-400 dark:bg-red-500"></div>
                             {item}
                           </li>
                        ))}
                      </ul>
                   </div>
                </div>
                
                {/* RIGHT — Spark EV */}
                <div className="p-12 relative overflow-hidden group border-t md:border-t-0 md:border-l border-border bg-emerald-500/[0.02] dark:bg-emerald-950/[0.05]">
                   <div className="relative z-10">
                      <div className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/35 text-sm font-bold px-4 py-1.5 rounded-full w-fit mb-6 uppercase tracking-wider shadow-sm">
                        On-Demand Mobile Charging
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">Spark EV Experience</h3>
                      <ul className="space-y-5">
                        {[
                          'Premium charging van',
                          'Doorstep fast charging',
                          'Live van tracking & ETAs',
                          'Eliminate queuing completely',
                        ].map((item, i) => (
                           <li key={i} className="flex items-center text-lg md:text-xl font-medium text-muted-foreground">
                             <div className="mr-3 flex-shrink-0 h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                             {item}
                           </li>
                        ))}
                      </ul>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* SECTION 4 — MINIMAL COMPARISON STRIP */}
          <div className="mb-32 max-w-5xl mx-auto">
             <div className="overflow-x-auto pb-8">
                <div className="min-w-[700px]">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-4 mb-6 px-6">
                     <div className="col-span-1"></div>
                     <div className="col-span-1 text-center font-black text-xl md:text-2xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 py-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/25 shadow-sm">Spark EV</div>
                     <div className="col-span-1 text-center text-lg md:text-xl font-bold text-foreground py-4 flex items-center justify-center">Public Charging</div>
                     <div className="col-span-1 text-center text-lg md:text-xl font-bold text-foreground py-4 flex items-center justify-center">Battery Swapping</div>
                  </div>

                  {/* Rows */}
                  {[
                    { label: 'Comes directly to user', spark: true, public: false, swap: false },
                    { label: 'Live dispatch tracking', spark: true, public: false, swap: false },
                    { label: 'Retains original battery', spark: true, public: true, swap: false },
                    { label: 'Queue-free experience', spark: true, public: false, swap: true },
                    { label: 'Roadside emergency support', spark: true, public: false, swap: false },
                  ].map((row, i) => (
                     <div key={i} className="grid grid-cols-4 gap-4 px-6 py-6 border-b border-border hover:bg-muted/30 transition-colors">
                        <div className="col-span-1 text-lg md:text-xl font-bold text-foreground flex items-center">{row.label}</div>
                        <div className="col-span-1 flex justify-center items-center">
                           {row.spark ? (
                             <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
                               <Check className="w-5 h-5 text-emerald-700 dark:text-emerald-400 stroke-[3]" />
                             </div>
                           ) : (
                             <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-650 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/35 shadow-sm">
                               <X className="w-5 h-5 stroke-[3]" />
                             </div>
                           )}
                        </div>
                        <div className="col-span-1 flex justify-center items-center">
                           {row.public ? (
                             <Check className="w-7 h-7 text-emerald-650 dark:text-emerald-400 stroke-[2.5]" />
                           ) : (
                             <X className="w-7 h-7 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
                           )}
                        </div>
                        <div className="col-span-1 flex justify-center items-center">
                           {row.swap ? (
                             <Check className="w-7 h-7 text-emerald-650 dark:text-emerald-400 stroke-[2.5]" />
                           ) : (
                             <X className="w-7 h-7 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
                           )}
                        </div>
                     </div>
                  ))}
                </div>
             </div>
          </div>

          {/* SECTION 5 — FINAL STATEMENT */}
          <div className="text-center max-w-4xl mx-auto pt-16 border-t border-border">
             <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">Charging, on your terms.</h2>
             <p className="text-xl text-muted-foreground mb-10">Fast dispatch. Verified technicians. Zero station dependency.</p>
             
             {session === undefined ? (
              <div className="w-[300px] h-16 rounded-2xl bg-emerald-100/50 dark:bg-emerald-900/20 animate-pulse mx-auto"></div>
            ) : session ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 h-16 px-12 text-xl font-bold rounded-2xl transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="lg" className="bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 hover:shadow-xl hover:shadow-slate-900/20 h-16 px-12 text-xl font-bold rounded-2xl transition-all">
                  Request Charging
                </Button>
              </Link>
            )}
          </div>
          
        </div>
      </section>
    </MainLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-3xl bg-card backdrop-blur-sm border border-border hover:border-emerald-500/30 hover:bg-muted/50 relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10">
        <div className="bg-muted p-4 rounded-2xl inline-flex mb-8 border border-border/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-lg leading-relaxed font-normal">{description}</p>
      </div>
    </div>
  );
}
