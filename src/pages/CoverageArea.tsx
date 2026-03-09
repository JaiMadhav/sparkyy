import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { MapPin, CheckCircle2 } from "lucide-react";

export default function CoverageArea() {
  const cities = [
    { name: "New Delhi", status: "Available", zones: ["Central Delhi", "South Delhi", "West Delhi", "Dwarka"] },
    { name: "Noida", status: "Available", zones: ["Sector 18", "Sector 62", "Greater Noida"] },
    { name: "Gurugram", status: "Available", zones: ["DLF Phase 1-5", "Cyber City", "Sohna Road"] },
    { name: "Mumbai", status: "Coming Soon", zones: ["Bandra", "Andheri", "Colaba"] },
    { name: "Bengaluru", status: "Coming Soon", zones: ["Indiranagar", "Koramangala", "Whitefield"] },
  ];

  return (
    <MainLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Where we Operate
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We are rapidly expanding our network of mobile charging vans across major Indian cities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-6 w-6 text-emerald-600" />
                Active Cities
              </h2>
              <div className="space-y-6">
                {cities.map((city) => (
                  <div key={city.name} className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{city.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        city.status === "Available" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {city.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {city.zones.map(zone => (
                        <span key={zone} className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white h-full flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">Can't find your city?</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                We're adding new vans and cities every month. Sign up to be notified when we launch in your area and get 50% off your first charge.
              </p>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all">
                  Notify Me
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-6 text-center">
                By signing up, you agree to our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
