import { MainLayout } from "@/layouts/MainLayout";
import { MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";

export default function CoverageArea() {
  const regions = [
    {
      name: "Delhi NCR",
      status: "Available",
      zones: [
        "Central Delhi",
        "South Delhi",
        "West Delhi",
        "Dwarka",
        "Noida",
        "Greater Noida",
        "Gurugram",
        "Cyber City",
        "Sohna Road",
      ],
    },
    {
      name: "Bengaluru",
      status: "Available",
      zones: [
        "Indiranagar",
        "Koramangala",
        "Whitefield",
        "HSR Layout",
        "Electronic City",
      ],
    },
  ];

  // BUG FIX #3: Compute total zones dynamically instead of hardcoding "14 Zones"
  const totalZones = regions.reduce((sum, r) => sum + r.zones.length, 0);

  return (
    <MainLayout>
      <section className="pt-32 pb-24 px-4 bg-slate-950 min-h-screen relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
              Operational{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                Coverage
              </span>
            </h1>
            <p className="text-2xl text-slate-300 max-w-3xl mx-auto font-normal drop-shadow-md">
              Spark EV currently operates in key Indian mobility hubs. Our
              dynamic network is optimized for metropolitan density.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-start">
            {/* Left: Cards Section */}
            <div className="space-y-6 lg:space-y-8">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                </div>
                Active Regions
              </motion.h2>

              <div className="space-y-6">
                {regions.map((region, idx) => (
                  <motion.div
                    key={region.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                    className="border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/60 backdrop-blur-md shadow-xl hover:border-emerald-500/30 transition-all duration-300 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                          {region.name}
                        </h3>

                        {/*
                         * BUG FIX #1 & #2: Removed all duplicate/conflicting Tailwind classes.
                         * Kept one background, one border, one shadow, one font-weight.
                         * Fixed duplicate bg classes on the ping dot spans.
                         */}
                        <span className="flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] backdrop-blur-sm">
                          <span className="relative flex h-[9px] w-[9px]">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-[9px] w-[9px] bg-emerald-500 shadow-sm"></span>
                          </span>
                          {region.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {region.zones.map((zone) => (
                          <span
                            key={zone}
                            className="text-base font-semibold text-slate-300 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/50 shadow-sm transition-colors group-hover:border-slate-600"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Map Visualization
             *
             * BUG FIX #4 (Map invisible in light mode):
             * - Changed container to always use bg-slate-900 (removed bg-white / dark:bg-slate-900)
             *   so the dark background is consistent in both light and dark themes.
             * - Removed `mix-blend-multiply` (was washing out the map on light backgrounds).
             * - Applied the green filter (invert + sepia + saturate + hue-rotate) always,
             *   not just in dark: variant, so the map is always green-tinted and visible.
             * - Adjusted vignette overlays to use slate colors in both modes.
             * - Added an <img> onError fallback (BUG FIX #6).
             */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative w-full rounded-[3rem] bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl group flex flex-col md:block"
            >
              {/* Map Container */}
              <div className="relative w-full h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] shrink-0">
                {/*
                 * BUG FIX #4 (map invisible in light mode) continued:
                 * - Always apply: invert sepia saturate-[3] hue-rotate-[130deg]
                 *   (previously only applied as dark: variants → invisible in light mode)
                 * - Removed mix-blend-multiply (was crushing image on white bg)
                 * - Increased base opacity to 60 so it's clearly visible
                 * BUG FIX #6: Added onError fallback
                 */}
                {/*
                 * KEY FIX: `invert` alone turned the black SVG outline WHITE — invisible on
                 * any light background. Instead we use brightness(0) first to force ALL pixels
                 * to pure black (preserving transparency), then shift the color to emerald.
                 * This works on both light AND dark backgrounds regardless of theme.
                 *
                 * Filter breakdown:
                 *  brightness(0)       → collapses image to pure black lines on transparent
                 *  invert(58%)         → shifts toward mid-range lightness
                 *  sepia(1)            → adds warm tone needed for hue shifting
                 *  saturate(6)         → boosts saturation so green is vivid
                 *  hue-rotate(105deg)  → rotates to emerald-green hue
                 *  brightness(0.9)     → slight pull-back so it's not neon
                 */}
                {/* 
                 * LIGHT MODE MAP OUTLINE 
                 * Clean mint/emerald contour with very soft shadow/glow.
                 */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b4/India_outline.svg"
                  alt="India Map"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  className="absolute inset-0 w-full h-[90%] md:h-[90%] m-auto object-contain transition-all duration-700 block dark:hidden opacity-85 group-hover:opacity-100 scale-[0.99] group-hover:scale-100"
                  style={{
                    filter:
                      "brightness(0) invert(42%) sepia(1) saturate(3) hue-rotate(115deg) drop-shadow(0 0 6px rgba(16, 185, 129, 0.25))",
                  }}
                />

                {/* 
                 * DARK MODE MAP OUTLINE
                 * Refined emerald/cyan neon contour with subtle bloom.
                 */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b4/India_outline.svg"
                  alt="India Map"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  className="absolute inset-0 w-full h-[90%] md:h-[90%] m-auto object-contain transition-all duration-700 hidden dark:block opacity-90 group-hover:opacity-100 scale-[0.99] group-hover:scale-100"
                  style={{
                    filter:
                      "brightness(0) invert(55%) sepia(1) saturate(5) hue-rotate(135deg) drop-shadow(0 0 12px rgba(20, 184, 166, 0.45)) drop-shadow(0 0 4px rgba(20, 184, 166, 0.6))",
                  }}
                />

                {/* Vignette / Overlays removed to prevent map corners from fading out */}



                {/* Connected Route Line Overlay (SVG)
                 * BUG FIX #5: Replaced filter="blur(0.5px)" on <circle> with an SVG <filter>
                 * for consistent cross-browser support (especially Safari).
                 */}
                <svg
                  className="absolute inset-0 w-full h-[90%] md:h-[90%] m-auto pointer-events-none z-10"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="route-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="dot-blur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="0.6" />
                    </filter>
                  </defs>

                  <motion.path
                    d="M 33 32 Q 55 55 35 73"
                    fill="none"
                    stroke="url(#route-gradient)"
                    strokeWidth="0.35"
                    strokeDasharray="1 1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                  />

                  {/* Traveling dot — using SVG filter for blur (cross-browser safe) */}
                  <motion.circle r="0.6" fill="#f97316" filter="url(#dot-blur)">
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      path="M 33 32 Q 55 55 35 73"
                    />
                  </motion.circle>
                </svg>

                {/* Center Route Point: Ashoka Chakra */}
                <div className="absolute top-[53.75%] left-[44.5%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="relative flex items-center justify-center">
                    {/* Soft back glow to help it stand out */}
                    <div className="absolute w-8 h-8 bg-white/70 rounded-full blur-md"></div>
                    {/* The Chakra disc */}
                    <div className="relative w-6 h-6 md:w-7 md:h-7 bg-[#ffffff] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.9)] border-[1.5px] border-[#000080]/80">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-4 h-4 md:w-[18px] md:h-[18px] text-[#000080] animate-[spin_12s_linear_infinite]"
                      >
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
                        <g stroke="currentColor" strokeWidth="2.5">
                          {[...Array(12)].map((_, i) => (
                            <line key={i} x1="50" y1="4" x2="50" y2="96" transform={`rotate(${i * 15} 50 50)`} />
                          ))}
                        </g>
                        <circle cx="50" cy="50" r="8" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Marker: Delhi NCR */}
                <div className="absolute top-[34%] md:top-[34%] left-[33%] -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative flex items-center justify-center group/marker cursor-pointer">
                    <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 border border-orange-500/30 dark:border-orange-500/40 rounded-full animate-ping"></div>
                    <div className="absolute w-6 h-6 md:w-7 md:h-7 bg-emerald-500/40 rounded-full blur-sm"></div>
                    <div className="relative w-3 h-3 md:w-4 md:h-4 bg-emerald-400 rounded-full border-[1.5px] border-white shadow-[0_0_15px_rgba(16,185,129,0.8)] group-hover/marker:bg-orange-400 group-hover/marker:shadow-[0_0_20px_rgba(249,115,22,0.8)] transition-all duration-500"></div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 md:mr-5 bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 group-hover/marker:border-orange-500/40 px-3 md:px-4 py-2 rounded-xl shadow-xl shrink-0 transition-transform duration-300 group-hover/marker:scale-[1.02] group-hover/marker:-translate-y-1/2 group-hover/marker:-translate-x-1">
                      <span className="text-white font-bold text-[13px] md:text-[15px] whitespace-nowrap block drop-shadow-md tracking-tight group-hover/marker:text-orange-500 transition-colors duration-300">
                        Delhi NCR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Marker: Bengaluru */}
                <div className="absolute top-[71%] md:top-[71%] left-[35%] -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative flex items-center justify-center group/marker cursor-pointer">
                    <div
                      className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 border border-orange-500/30 dark:border-orange-500/40 rounded-full animate-ping"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <div className="absolute w-6 h-6 md:w-7 md:h-7 bg-emerald-500/40 rounded-full blur-sm"></div>
                    <div className="relative w-3 h-3 md:w-4 md:h-4 bg-emerald-400 rounded-full border-[1.5px] border-white shadow-[0_0_15px_rgba(16,185,129,0.8)] group-hover/marker:bg-orange-400 group-hover/marker:shadow-[0_0_20px_rgba(249,115,22,0.8)] transition-all duration-500"></div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 md:mr-5 bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 group-hover/marker:border-orange-500/40 px-3 md:px-4 py-2 rounded-xl shadow-xl shrink-0 transition-transform duration-300 group-hover/marker:scale-[1.02] group-hover/marker:-translate-y-1/2 group-hover/marker:-translate-x-1">
                      <span className="text-white font-bold text-[13px] md:text-[15px] whitespace-nowrap block drop-shadow-md tracking-tight group-hover/marker:text-orange-500 transition-colors duration-300">
                        Bengaluru
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Status Box */}
              <div className="px-5 pb-5 pt-2 md:p-0 md:absolute md:bottom-6 md:right-6 md:w-64 z-20 w-full shrink-0">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-2xl w-full">
                  <div className="flex items-center gap-3 w-full mb-3">
                    <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 shrink-0">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">
                        Network Status
                      </div>
                      <div className="text-emerald-400 text-[13px] sm:text-xs font-semibold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                        All Systems Active
                      </div>
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-slate-700/50 mb-3"></div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Dispatch Speed</span>
                    <span className="text-white font-mono shrink-0">
                      {"< 30 mins"}
                    </span>
                  </div>
                  {/* BUG FIX #3: Dynamic zone count instead of hardcoded "14 Zones" */}
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-slate-400">Service Area</span>
                    <span className="text-white font-mono shrink-0">
                      {totalZones} Zones
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}