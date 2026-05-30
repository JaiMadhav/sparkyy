import { Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`relative inline-block transition-all duration-300 ${
        isActive
          ? "text-emerald-400 font-semibold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] translate-x-1"
          : "text-slate-400 hover:text-emerald-400 hover:translate-x-1"
      }`}
    >
      {isActive && (
        <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
      )}
      {children}
    </Link>
  );
}

function FooterLightning() {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const smoothX = useSpring(x, { damping: 20, stiffness: 300, mass: 0.5 });
  const smoothY = useSpring(y, { damping: 20, stiffness: 300, mass: 0.5 });

  const [isHovered, setIsHovered] = useState(false);
  const [clicks, setClicks] = useState<number[]>([]);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * 0.25);
    y.set(distanceY * 0.25);
  };

  const handleMouseEnter = () => {
    if (isTouch) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const id = Date.now();
    setClicks(prev => [...prev, id]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c !== id));
    }, 1000);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ x: smoothX, y: smoothY }}
      whileTap={{ scale: 0.85, transition: { type: "spring", stiffness: 400, damping: 17 } }}
      className="relative flex items-center justify-center w-12 h-12 cursor-pointer group rounded-full"
    >
      {/* Idle background breathing */}
      <motion.div
        className="absolute inset-0 bg-emerald-500/10 rounded-full blur-md pointer-events-none"
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Desktop hover glow */}
      {!isTouch && (
        <div 
          className={`absolute inset-0 bg-emerald-500/10 rounded-full blur-md pointer-events-none transition-all duration-500 scale-75 ${
            isHovered ? "opacity-100 scale-150" : "opacity-0"
          }`}
        />
      )}
      
      <div className="relative z-10 flex items-center justify-center">
        <Zap 
          className={`h-5 w-5 transition-all duration-300 relative z-10 ${
            (!isTouch && isHovered) ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "text-emerald-500/60"
          }`} 
        />
        
        <AnimatePresence>
          {(!isTouch && isHovered) && (
            <motion.div
               className="absolute inset-0 z-20 mix-blend-screen pointer-events-none flex items-center justify-center"
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 0.7, 0] }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="h-5 w-5 text-white/50 fill-white/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap Pulse */}
      <AnimatePresence>
        {clicks.map(id => (
          <motion.div
            key={id}
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full bg-emerald-500/30 blur-sm w-8 h-8 pointer-events-none"
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export function Footer() {
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          <div className="space-y-6 lg:max-w-xs">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg logo-box-glow">
                <Zap className="h-5 w-5 z-10 logo-icon-glow" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Spark EV</span>
            </Link>
            <p className="text-base text-slate-400/90 leading-relaxed font-normal">
              On-demand EV charging delivered directly to your location. Powering the future of mobility with premium service.
            </p>
          </div>

          <div className="flex items-center justify-start lg:justify-center flex-1 py-2 lg:py-0">
            <div className="inline-flex items-center flex-nowrap gap-1.5 px-5 py-2.5 rounded-full bg-slate-900/40 border border-white/5 backdrop-blur-md transition-all hover:bg-slate-800/50 whitespace-nowrap shrink-0 min-w-max">
              <span className="text-base font-medium tracking-wide text-slate-400 whitespace-nowrap">Made with</span>
              <span className="animate-heartbeat text-base origin-center shrink-0">❤️</span>
              <span className="text-base font-medium tracking-wide text-slate-400 whitespace-nowrap">in India</span>
            </div>
          </div>
          
          <div className="flex flex-row flex-wrap sm:flex-nowrap gap-12 lg:gap-16 xl:gap-24 w-full lg:w-auto items-start">
            <div className="flex-1 w-[calc(50%-1.5rem)] sm:w-auto min-w-[140px] flex flex-col items-start">
              <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm leading-none m-0 pt-1">Platform</h4>
              <ul className="space-y-4 text-base font-medium mt-6">
                <li><FooterLink to="/how-it-works">How It Works</FooterLink></li>
                <li><FooterLink to="/pricing">Pricing</FooterLink></li>
                <li><FooterLink to="/coverage">Coverage Area</FooterLink></li>
              </ul>
            </div>

            <div className="flex-1 w-[calc(50%-1.5rem)] sm:w-auto min-w-[140px] flex flex-col items-start">
              <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm leading-none m-0 pt-1">Company</h4>
              <ul className="space-y-4 text-base font-medium mt-6">
                <li><FooterLink to="/about">About Us</FooterLink></li>
                <li><FooterLink to="/contact">Contact</FooterLink></li>
              </ul>
            </div>

            <div className="flex-1 w-full sm:w-auto min-w-[140px] flex flex-col items-start">
              <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm leading-none m-0 pt-1">Legal</h4>
              <ul className="space-y-4 text-base font-medium mt-6">
                <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
                <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-base font-medium text-slate-500">
            © {new Date().getFullYear()} SPARK EV Charging. All rights reserved.
          </div>
          <FooterLightning />
        </div>
      </div>
    </footer>
  );
}
