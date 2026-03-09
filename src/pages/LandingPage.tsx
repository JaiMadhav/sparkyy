import React from "react";
import { Button } from "@/components/ui/Button";
import { MainLayout } from "@/layouts/MainLayout";
import { ArrowRight, BatteryCharging, Clock, MapPin, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-4xl">
            Charge your EV <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Anywhere, Anytime.</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl">
            Don't waste time at charging stations. We bring the charger to you. 
            Book a mobile charging van in seconds and get back on the road.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg h-14 px-8 bg-emerald-600 hover:bg-emerald-500">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Choose SPARK?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We're revolutionizing EV ownership by removing range anxiety and charging hassles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Save Time"
              description="No more waiting in queues at charging stations. We come to your home, office, or anywhere you are."
            />
            <FeatureCard 
              icon={<MapPin className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Anywhere Service"
              description="Stranded with low battery? Our emergency response vans can reach you within 30 minutes."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Safe & Reliable"
              description="Certified technicians and state-of-the-art equipment ensure a safe charging experience for your vehicle."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Getting a charge is as easy as ordering a pizza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard number="1" title="Request" description="Open the app and request a charge at your location." />
            <StepCard number="2" title="Match" description="We dispatch the nearest available charging van." />
            <StepCard number="3" title="Charge" description="Our technician connects and charges your vehicle." />
            <StepCard number="4" title="Go" description="Pay seamlessly through the app and drive away." />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to spark your journey?</h2>
          <p className="text-emerald-100 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of EV owners who trust SPARK for their daily charging needs.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl inline-block shadow-sm mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="relative p-6 text-center">
      <div className="w-12 h-12 bg-emerald-600 text-white text-xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/20">
        {number}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
    </div>
  );
}
