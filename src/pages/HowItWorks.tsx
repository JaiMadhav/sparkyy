import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Search, 
  Zap, 
  CreditCard,
  Navigation,
  ShieldCheck,
  Clock,
  Car,
  ChevronDown,
  Map,
  Activity,
  CheckCircle2
} from "lucide-react";

import requestImg from "@/assets/step1.png";
import matchImg from "@/assets/step2.png";
import arriveImg from "@/assets/step3.png";
import chargingImg from "@/assets/step4.png";
import paymentImg from "@/assets/step5.png";
import doneImg from "@/assets/step6.png";

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <MainLayout>
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 overflow-hidden bg-white dark:bg-[#000]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1772895343662-d597635b8168?q=80&w=2000&auto=format&fit=crop"
            alt="EV charging"
            className="w-full h-full object-cover scale-100"
          />

          {/* Premium cinematic overlay */}
          <div className="absolute inset-0 bg-white/70 dark:bg-[#000]/50"></div>
          
          {/* Subtle bottom vignette to ensure smooth blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 dark:from-[#000] dark:via-[#000]/20 to-transparent opacity-90"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-bold text-black dark:text-[#fff] mb-6 tracking-tight leading-[1.1] drop-shadow-2xl">
              How Spark EV Operates
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-800 dark:text-[#cbd5e1] font-medium leading-relaxed mb-12 drop-shadow-lg max-w-4xl mx-auto">
              We bring mobile fast charging directly to your vehicle with live tracking, transparent pricing and real-time dispatch visibility.
            </p>

            {/* Infographic Banner in Hero */}
            <div className="hidden md:flex items-center justify-center gap-6 mb-16">
               <div className="flex flex-col items-center gap-3"><div className="p-4 rounded-2xl bg-[#ffffff]/5 backdrop-blur-md border border-[#ffffff]/10 shadow-2xl transition hover:bg-[#ffffff]/10"><MapPin className="h-6 w-6 text-[#34d399]" /></div><span className="text-xs text-slate-800 dark:text-[#cbd5e1] font-bold tracking-[0.2em] uppercase">Request</span></div>
               <div className="w-16 h-[1px] bg-[#ffffff]/20"></div>
               <div className="flex flex-col items-center gap-3"><div className="p-4 rounded-2xl bg-[#ffffff]/5 backdrop-blur-md border border-[#ffffff]/10 shadow-2xl transition hover:bg-[#ffffff]/10"><Search className="h-6 w-6 text-[#34d399]" /></div><span className="text-xs text-slate-800 dark:text-[#cbd5e1] font-bold tracking-[0.2em] uppercase">Assign</span></div>
               <div className="w-16 h-[1px] bg-[#ffffff]/20"></div>
               <div className="flex flex-col items-center gap-3"><div className="p-4 rounded-2xl bg-[#ffffff]/5 backdrop-blur-md border border-[#ffffff]/10 shadow-2xl transition hover:bg-[#ffffff]/10"><Navigation className="h-6 w-6 text-[#34d399]" /></div><span className="text-xs text-slate-800 dark:text-[#cbd5e1] font-bold tracking-[0.2em] uppercase">Arrive</span></div>
               <div className="w-16 h-[1px] bg-[#ffffff]/20"></div>
               <div className="flex flex-col items-center gap-3"><div className="p-4 rounded-2xl bg-[#ffffff]/5 backdrop-blur-md border border-[#ffffff]/10 shadow-2xl transition hover:bg-[#ffffff]/10"><Zap className="h-6 w-6 text-[#34d399]" /></div><span className="text-xs text-slate-800 dark:text-[#cbd5e1] font-bold tracking-[0.2em] uppercase">Charge</span></div>
               <div className="w-16 h-[1px] bg-[#ffffff]/20"></div>
               <div className="flex flex-col items-center gap-3"><div className="p-4 rounded-2xl bg-[#ffffff]/5 backdrop-blur-md border border-[#ffffff]/10 shadow-2xl transition hover:bg-[#ffffff]/10"><CreditCard className="h-6 w-6 text-[#34d399]" /></div><span className="text-xs text-slate-800 dark:text-[#cbd5e1] font-bold tracking-[0.2em] uppercase">Pay</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full bg-slate-900 dark:bg-[#fff] text-white dark:text-[#000] hover:bg-slate-800 dark:hover:bg-[#e2e8f0] transition-all hover:scale-105 active:scale-95 shadow-xl dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]">
                  Request a Charge
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-semibold rounded-full border-slate-300 dark:border-[#ffffff]/20 bg-white/50 dark:bg-[#ffffff]/5 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-[#ffffff]/10 text-slate-900 dark:text-[#fff] transition-all hover:scale-105 active:scale-95">
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step-by-Step Journey Roadmap */}
      <section className="py-24 md:py-32 bg-slate-950 relative border-t border-slate-800/50 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

        <div className="container mx-auto px-4 sm:px-6 max-w-[95rem] relative z-10">
          <div className="text-center mb-20 md:mb-28">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">Your Journey to Full Charge</h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">A simple, real-time mobile charging experience — from request to completed charge.</p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-12 md:gap-y-16 relative z-10">
              <StepCard 
                num="01" 
                title="Request a Charge" 
                desc="Enter your vehicle location and required charge level." 
                icon={<MapPin className="h-5 w-5 text-emerald-400" />} 
                delay={0.1}
                imgSrc={requestImg}
              />
              <StepCard 
                num="02" 
                title="Match Nearest Van" 
                desc="Spark EV assigns the most suitable nearby charging van based on ETA and availability." 
                icon={<Search className="h-5 w-5 text-emerald-400" />} 
                delay={0.2}
                imgSrc={matchImg}
              />
              <StepCard 
                num="03" 
                title="Van Arrives" 
                desc="Track your assigned van live as it navigates to your location." 
                icon={<Navigation className="h-5 w-5 text-emerald-400" />} 
                delay={0.3}
                imgSrc={arriveImg}
              />
              <StepCard 
                num="04" 
                title="Charging Begins" 
                desc="The technician connects the charger and begins fast charging your EV." 
                icon={<Zap className="h-5 w-5 text-emerald-400" />} 
                delay={0.4}
                imgSrc={chargingImg}
              />
              <StepCard 
                num="05" 
                title="Secure Payment" 
                desc="Review your charging summary and complete payment after the session ends." 
                icon={<CreditCard className="h-5 w-5 text-emerald-400" />} 
                delay={0.5}
                imgSrc={paymentImg}
              />
              <StepCard 
                num="06" 
                title="Back on the Road" 
                desc="Your EV is charged and ready for the next journey." 
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} 
                delay={0.6}
                imgSrc={doneImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Spark EV Works Better */}
      <section className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-6xl">
           <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">Why Spark EV Works Better</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-normal">Built for fast, reliable and on demand EV charging across the city.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard 
              icon={<Car />} 
              title="Doorstep Charging" 
              desc="Fast charging delivered directly to your home, office, parking spot or roadside location." 
              imgSrc="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <BenefitCard 
              icon={<Activity />} 
              title="Live Van Tracking" 
              desc="Track your assigned charging van in real time with live ETAs and location updates." 
              imgSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <BenefitCard 
              icon={<Map />} 
              title="Smart Fleet Deployment" 
              desc="Charging vans are dynamically positioned across high demand city zones for faster response times." 
              imgSrc="https://images.unsplash.com/photo-1632040804304-4094a1a63be7?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <BenefitCard 
              icon={<ShieldCheck />} 
              title="Secure Payment Flow" 
              desc="Pay only after charging is completed with transparent pricing and verified billing." 
              imgSrc="https://plus.unsplash.com/premium_photo-1739995619666-7b47645fb2e2?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <BenefitCard 
              icon={<CreditCard />} 
              title="Flexible Charging Plans" 
              desc="Choose one time charging or recurring plans designed for regular EV users." 
              imgSrc="https://images.unsplash.com/photo-1594535182308-8ffefbb661e1?q=80&w=1365&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <BenefitCard 
              icon={<Clock />} 
              title="Rapid Response Times" 
              desc="The nearest available charging van is dispatched quickly based on live availability and ETA." 
              imgSrc="https://images.unsplash.com/photo-1607913894042-2c770aa8a0e4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
          </div>
        </div>
      </section>

      {/* Behind the Scenes */}
      <section className="py-24 bg-slate-900/50 border-t border-slate-900 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 relative">
               <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"></div>
               <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <img
  src="https://thumbs.dreamstime.com/b/india-map-network-connections-glowing-points-digital-design-representation-interconnected-lines-bright-374236729.jpg"
  alt="Routing map"
  className="w-full h-80 md:h-96 object-cover object-[76%_center] opacity-90"
/>
               </div>
            </div>

            <div className="order-1 lg:order-2">
               <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Behind the Scenes: Dispatch Engine</h2>
                <p className="text-xl text-slate-300 max-w-xl font-normal leading-relaxed">Smart fleet coordination designed to deliver fast and reliable mobile EV charging across the city.</p>
              </div>

              <div className="space-y-10">
                <LogicCard 
                  num="1" 
                  title="Smart Vehicle Matching" 
                  desc="When a charging request is placed, Spark EV evaluates nearby vans based on ETA, connector compatibility, battery availability, and live operational status."
                />
                <LogicCard 
                  num="2" 
                  title="Real-Time Routing" 
                  desc="Dispatch ETAs are calculated using live traffic conditions and route availability to assign the most suitable charging van quickly."
                />
                <LogicCard 
                  num="3" 
                  title="Secure Charging Workflow" 
                  desc="Once charging begins, the session is locked to prevent misuse. Billing is completed after charging based on the actual energy delivered."
                />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-slate-950 border-t border-slate-900 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            <div className="lg:col-span-5">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Got Questions?</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-md font-normal leading-relaxed">Everything you need to know about Spark EV's charging process, coverage, pricing and live dispatch system.</p>
              
              <div className="rounded-3xl overflow-hidden border border-slate-800 relative hidden lg:block h-72 shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                 <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800" alt="EV charging cable" className="w-full h-full object-cover transition-all duration-700 hover:scale-105" />
                 <div className="absolute bottom-6 left-6 text-sm text-slate-200 font-semibold bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 shadow-lg">
                   <Zap className="h-4 w-4 text-emerald-400" /> High-speed DC
                 </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <FaqItem 
                open={openFaq === 0}
                onClick={() => toggleFaq(0)}
                question="How quickly can a van arrive?" 
                answer="Most charging requests receive an estimated arrival time between 20–40 minutes depending on traffic conditions, fleet availability and your location." 
              />
              <FaqItem 
                open={openFaq === 1}
                onClick={() => toggleFaq(1)}
                question="How does Spark EV choose a van?" 
                answer="The system evaluates nearby vans based on ETA, connector compatibility, available battery capacity and live operational status." 
              />
              <FaqItem 
                open={openFaq === 2}
                onClick={() => toggleFaq(2)}
                question="What areas are currently supported?" 
                answer="Spark EV currently operates across selected urban coverage zones within Delhi NCR as part of the active deployment network." 
              />
              <FaqItem 
                open={openFaq === 3}
                onClick={() => toggleFaq(3)}
                question="When is payment collected?" 
                answer="Payment is completed only after the charging session finishes and the delivered energy is verified." 
              />
              <FaqItem 
                open={openFaq === 4}
                onClick={() => toggleFaq(4)}
                question="Can I cancel after charging starts?" 
                answer="No. Once the charging session begins, cancellation is locked to prevent operational misuse and resource loss." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=2000" alt="EV at night" className="w-full h-full object-cover opacity-40 scale-105" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
           <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Ready when your EV needs power.</h2>
           <p className="text-2xl text-slate-300 mb-10 font-normal drop-shadow-md">
             Spark EV delivers fast mobile charging directly to your location — reducing wait times, range anxiety and dependency on crowded charging stations.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1">
                  Book a Charge
                </Button>
             </Link>
             <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-xl border-slate-600 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 text-white transition-all hover:-translate-y-1">
                  <span className="hidden sm:inline">View Subscription Plans</span>
                  <span className="sm:hidden">View Plans</span>
                </Button>
             </Link>
           </div>
        </div>
      </section>
    </MainLayout>
  );
}

function StepCard({ num, title, desc, icon, delay, imgSrc }: { num: string, title: string, desc: string, icon: React.ReactNode, delay: number, imgSrc?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex flex-col relative group"
    >
      <div className="w-full aspect-[4/3] sm:aspect-auto sm:h-52 xl:h-44 bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-[2rem] overflow-hidden relative group-hover:border-emerald-500/40 group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.25)] transition-all duration-500 z-10 mb-6 shadow-2xl">
         {imgSrc && (
           <img src={imgSrc} alt={title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out" />
         )}
         {/* Futuristic overlay elements */}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none mix-blend-multiply"></div>
         <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-500 pointer-events-none mix-blend-overlay"></div>
         
         <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-xl border border-slate-700/60 text-emerald-400 p-3 rounded-2xl flex items-center justify-center shadow-xl group-hover:border-emerald-500/50 group-hover:text-emerald-300 transition-all duration-500">
            {icon}
         </div>
         <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-xl border border-slate-700/60 text-slate-200 font-mono text-xs px-4 py-2 rounded-full shadow-xl group-hover:border-emerald-500/50 group-hover:text-emerald-300 transition-all duration-500 tracking-wider">
           {num}
         </div>
      </div>
      <div className="text-left px-2 group-hover:translate-x-1 transition-transform duration-500 will-change-transform">
        <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-2 leading-snug tracking-tight group-hover:text-emerald-400 transition-colors duration-500">{title}</h3>
        <p className="text-sm md:text-base text-slate-400 leading-relaxed font-normal">{desc}</p>
      </div>
    </motion.div>
  );
}

function BenefitCard({ icon, title, desc, imgSrc }: { icon: React.ReactNode, title: string, desc: string, imgSrc?: string }) {
  return (
    <div className="bg-slate-950 border border-slate-800/60 rounded-3xl hover:border-emerald-500/40 transition-all duration-500 relative overflow-hidden group flex flex-col h-full min-h-[420px] shadow-lg hover:shadow-2xl">
      {imgSrc && (
        <div className="w-full h-48 overflow-hidden relative shrink-0">
           <img src={imgSrc} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-col flex-1 px-6 lg:px-8 pb-8 pt-0">
        {/* Glassmorphism Icon Container overlapping the image */}
        <div className="-mt-7 mb-4 relative z-10 origin-left">
          <div className="w-14 h-14 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl transition-all duration-500 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:scale-110">
            {icon}
          </div>
        </div>
        
        {/* Content Structure text block */}
        <div className="flex flex-col flex-1 justify-end">
          <div className="h-full flex flex-col justify-start">
            <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-tight mb-3 mt-1">{title}</h3>
            <p className="text-slate-400 text-sm lg:text-base font-normal leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogicCard({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="relative pl-12">
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm border border-slate-700 shadow-lg">
        {num}
      </div>
      <h3 className="text-2xl font-bold text-slate-200 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-300 leading-relaxed text-base font-normal">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer, open, onClick }: { question: string, answer: string, open: boolean, onClick: () => void }) {
  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden hover:border-slate-700 transition-colors">
      <button 
        className="w-full text-left p-6 flex justify-between items-center bg-transparent hover:bg-slate-900/80 transition-colors"
        onClick={onClick}
      >
        <span className="font-bold text-xl text-slate-200">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-slate-300 leading-relaxed text-lg font-normal">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
