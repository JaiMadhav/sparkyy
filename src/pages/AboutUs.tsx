import { MainLayout } from "@/layouts/MainLayout";
import { Zap, Shield, Users, Globe } from "lucide-react";
import infraProb from "@/assets/van.png";

export default function AboutUs() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Logistics driven <span className="text-emerald-600 dark:text-emerald-400">EV charging</span>
          </h1>
          <p className="text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Spark EV dispatches mobile fast charging vans directly to parked EVs — reducing station dependency, wait times and urban charging friction.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">The Infrastructure Problem</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Urban EV adoption is growing faster than public charging infrastructure. In dense city environments, long station queues, limited charger availability and travel detours create major charging friction for EV owners.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Spark EV solves this through a mobile dispatch model. Instead of forcing vehicles to travel to fixed charging stations, we deploy fast charging vans directly to parked EVs across active city zones.
              </p>
            </div>
            <div className="relative p-2 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
              <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img 
                  src={infraProb} 
                  alt="EV Charging in India" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Operating Principles</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">The core systems behind Spark EV’s dispatch and delivery network.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Zap className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />, title: "Density Based Deployment", desc: "Charging vans are positioned across active urban zones to reduce response times and improve dispatch efficiency." },
              { icon: <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />, title: "Transparent Billing", desc: "Users are billed only after charging is completed based on the actual energy delivered." },
              { icon: <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />, title: "Logistics First Operations", desc: "Spark EV prioritizes routing efficiency, live ETA tracking and fleet coordination to maintain reliable service." },
              { icon: <Globe className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />, title: "Standardized Charging Hardware", desc: "Our mobile vans use professional DC fast-charging systems compatible with supported EV categories." },
            ].map((value, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group shadow-sm hover:shadow-md dark:shadow-none">
                <div className="mb-6 group-hover:scale-110 transition-transform">{value.icon}</div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight text-slate-900 dark:text-white">{value.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
