import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Zap, Shield, Users, Globe } from "lucide-react";

export default function AboutUs() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Powering the <span className="text-emerald-600">Future</span> of Mobility
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            SPARK was founded with a simple mission: to eliminate range anxiety and make EV ownership seamless by bringing the power to you.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                In 2023, we noticed a major bottleneck in the adoption of electric vehicles: the lack of convenient charging infrastructure. While public stations were growing, they often required long detours and wait times.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We imagined a world where your car charges while you sleep, work, or shop—without you ever having to visit a station. That's how SPARK was born.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800" 
                  alt="EV Charging" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white p-8 rounded-2xl shadow-xl hidden md:block">
                <p className="text-4xl font-bold mb-1">50k+</p>
                <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Charges Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">The principles that guide every charge we deliver.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Zap className="h-8 w-8 text-emerald-500" />, title: "Innovation", desc: "Pushing the boundaries of mobile energy storage." },
              { icon: <Shield className="h-8 w-8 text-emerald-500" />, title: "Reliability", desc: "Power when you need it, guaranteed." },
              { icon: <Users className="h-8 w-8 text-emerald-500" />, title: "Community", desc: "Building a cleaner future together." },
              { icon: <Globe className="h-8 w-8 text-emerald-500" />, title: "Sustainability", desc: "100% renewable energy sourcing." },
            ].map((value, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-all group">
                <div className="mb-6 group-hover:scale-110 transition-transform">{value.icon}</div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
