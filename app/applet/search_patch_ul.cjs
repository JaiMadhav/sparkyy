const fs = require('fs');

const file = 'src/pages/dashboard/BookCharging.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStart = `<div className="relative bg-[#111] border border-white/10 rounded-xl transition-all duration-200 focus-within:border-slate-500 hover:border-slate-600 overflow-visible">`;
const targetEnd = `{/* Suggestions Dropdown */}`;

const replaceBlockStart = content.indexOf(targetStart);
const replaceBlockEnd = content.indexOf(targetEnd);

const oldSearchBlock = content.substring(replaceBlockStart, replaceBlockEnd);

const newSearchBlock = `<div className="relative bg-[#0A0A0A] border border-white/5 rounded-2xl transition-all duration-300 focus-within:border-emerald-500/50 hover:border-white/10 overflow-visible shadow-sm">
                            <div className="flex items-center">
                              <div className="pl-5 shrink-0 flex items-center justify-center">
                                 {isSearching ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />}
                              </div>
                              <input 
                                type="text"
                                disabled={['assigned', 'enroute', 'arrived', 'charging', 'payment_pending'].includes(dispatchStatus)}
                                className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 px-4 py-4.5 placeholder:text-slate-500 font-medium text-[16px] w-full disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
                                placeholder="Search destination or locality..."
                                value={locationSearch}
                                onChange={(e) => {
                                    setLocationSearch(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchResults.length > 0) {
                                        selectLocation(searchResults[0]);
                                    }
                                }}
                              />
                              {locationSearch && (
                                <button className="pr-4 shrink-0 text-slate-500 hover:text-white transition-colors" onClick={() => { setLocationSearch(''); setSearchResults([]); setIsSearching(false); }}>
                                    <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            `;

content = content.replace(oldSearchBlock, newSearchBlock);

const targetDropdownStart = `{/* Suggestions Dropdown */}`;
const targetDropdownEnd = `</AnimatePresence>`;

const ddStart = content.indexOf(targetDropdownStart);
const ddEnd = content.indexOf(targetDropdownEnd, ddStart) + `</AnimatePresence>`.length;

const oldDropdownBlock = content.substring(ddStart, ddEnd);

const newDropdownBlock = `{/* Suggestions Dropdown */}
                            <AnimatePresence>
                              {showSuggestions && (locationSearch.length > 0 || searchResults.length > 0) && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[1001]"
                                >
                                   {isSearching ? (
                                      <div className="px-4 py-4 divide-y divide-white/5 space-y-3">
                                         {[1,2,3].map(i => (
                                            <div key={i} className={\`flex items-center gap-4 \${i > 1 ? 'pt-3' : ''}\`}>
                                               <div className="h-9 w-9 bg-white/5 rounded-full animate-pulse shrink-0"></div>
                                               <div className="flex-1 space-y-2">
                                                  <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse"></div>
                                                  <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse"></div>
                                               </div>
                                            </div>
                                         ))}
                                      </div>
                                   ) : searchResults.length > 0 ? (
                                      <div className="py-2">
                                         {searchResults.map((item, idx) => {
                                            const parts = item.display_name.split(',');
                                            const primary = parts[0].trim();
                                            const secondary = parts.slice(1).join(',').trim();
                                            return (
                                              <button 
                                                key={idx}
                                                className="w-full text-left px-4 py-3 hover:bg-white/5 focus:bg-white/5 transition-colors flex items-center gap-4 group cursor-pointer outline-none"
                                                onClick={() => {
                                                    selectLocation(item);
                                                    setShowSuggestions(false);
                                                }}
                                              >
                                                <div className="h-10 w-10 bg-[#161616] group-hover:bg-emerald-500/10 border border-white/5 rounded-full shrink-0 flex items-center justify-center transition-colors">
                                                   <MapPin className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                                </div>
                                                <div className="py-0.5 min-w-0 pr-2">
                                                   <div className="font-semibold text-[15px] text-slate-200 truncate tracking-tight">{primary}</div>
                                                   <div className="text-[13px] text-slate-500 truncate mt-0.5 tracking-wide">{secondary}</div>
                                                </div>
                                              </button>
                                            );
                                         })}
                                      </div>
                                   ) : locationSearch.length > 0 ? (
                                      <div className="px-5 py-6 text-center text-slate-500 text-[14px]">
                                         No locations found for "<span className="text-slate-300">{locationSearch}</span>"
                                      </div>
                                   ) : (
                                      <div className="py-2">
                                         <div className="px-5 py-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Popular Delhi Hubs</div>
                                         <button onClick={() => { setLocationSearch('Connaught Place'); setShowSuggestions(true); }} className="w-full text-left px-5 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-3 group">
                                             <div className="h-8 w-8 bg-[#161616] rounded-full flex items-center justify-center"><Clock className="h-3.5 w-3.5 text-slate-400" /></div>
                                             <span className="text-[15px] text-slate-300 group-hover:text-white font-medium transition-colors">Connaught Place (CP)</span>
                                         </button>
                                         <button onClick={() => { setLocationSearch('Terminal 3, IGI Airport'); setShowSuggestions(true); }} className="w-full text-left px-5 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-3 group">
                                             <div className="h-8 w-8 bg-[#161616] rounded-full flex items-center justify-center"><Plane className="h-3.5 w-3.5 text-slate-400" /></div>
                                             <span className="text-[15px] text-slate-300 group-hover:text-white font-medium transition-colors">Indira Gandhi Int'l Airport (DEL)</span>
                                         </button>
                                      </div>
                                   )}
                                </motion.div>
                              )}
                            </AnimatePresence>`;

content = content.replace(oldDropdownBlock, newDropdownBlock);

// include X and Plane icons
content = content.replace('import { MapPin, Search, Menu, Battery, Car, Bolt, CloudLightning, Home, User, CreditCard, ChevronRight, CheckCircle2, History, Settings, LogOut, Zap, ShieldCheck, Map, Smartphone, Eye, EyeOff, Loader2, Navigation, Clock, MessageSquare, Phone, XCircle } from "lucide-react";', 
                          'import { MapPin, Search, Menu, Battery, Car, Bolt, CloudLightning, Home, User, CreditCard, ChevronRight, CheckCircle2, History, Settings, LogOut, Zap, ShieldCheck, Map, Smartphone, Eye, EyeOff, Loader2, Navigation, Clock, MessageSquare, Phone, XCircle, X, Plane } from "lucide-react";');

fs.writeFileSync(file, content);
console.log("Replaced UI dropdown and input");
