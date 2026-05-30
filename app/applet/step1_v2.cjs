const fs = require('fs');

const file = 'src/pages/dashboard/BookCharging.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStart = '{/* Battery Requirements */}';
const targetEnd = '{step === 2 && (';

const startIndex = content.indexOf(targetStart);
let endIndex = content.indexOf(targetEnd);

// find the exact line ending of the div
const oldBlock = content.substring(startIndex, endIndex);

const newBlock = `{/* Battery Requirements */}
                <div className={\`\${!selectedVehicle ? 'opacity-50 pointer-events-none' : ''} transition-opacity\`}>
                   <h3 className="text-[15px] font-semibold text-slate-300 mb-5 tracking-tight flex items-center gap-2"><Battery className="h-5 w-5 text-emerald-500" /> Charge Target</h3>
                   
                   <div className="bg-[#0A0A0A] p-6 lg:p-8 rounded-[2rem] border border-white/5 select-none transition-all relative overflow-hidden">
                      {/* Ambient background effect */}
                      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>

                      <div className="flex flex-col gap-10 relative z-10">
                        {/* Current & Target sliders stacked for maximum precision */}
                        
                        {/* CURRENT BATTERY */}
                        <div className="relative space-y-4">
                          <div className="flex justify-between items-baseline px-1">
                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Current Charge</label>
                            <span className="text-2xl font-bold text-slate-200 tracking-tight">{currentBattery}<span className="text-[15px] text-slate-500 font-medium ml-1">%</span></span>
                          </div>
                          
                          <div className="relative h-14 flex items-center group">
                            <div className="absolute inset-x-0 h-10 bg-[#161616] border border-white/5 rounded-xl overflow-hidden shadow-inner transition-colors group-hover:border-white/10">
                               <div className="absolute inset-y-0 left-0 bg-slate-600/80 rounded-r-xl border-r border-slate-500 transition-all duration-75" style={{ width: \`\${currentBattery}%\` }}></div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="95"
                              step="1"
                              value={currentBattery}
                              onChange={(e) => {
                                  setCurrentBattery(Number(e.target.value));
                                  if (Number(e.target.value) >= targetBattery) setTargetBattery(Math.min(100, Number(e.target.value) + 10));
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10 touch-none"
                            />
                            {/* Interaction Thumb */}
                            <div className="absolute h-[52px] w-[32px] bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl pointer-events-none flex items-center justify-center transform -translate-x-1/2 transition-transform z-20" style={{ left: \`\${currentBattery}%\` }}>
                               <div className="flex gap-0.5">
                                 <div className="w-0.5 h-4 bg-white/30 rounded-full"></div>
                                 <div className="w-0.5 h-4 bg-white/30 rounded-full"></div>
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-[-10px]"></div>

                        {/* TARGET BATTERY */}
                        <div className="relative space-y-4">
                          <div className="flex justify-between items-end px-1">
                            <div className="flex flex-col gap-2">
                              <label className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest">Target Charge</label>
                              {targetBattery === 80 && currentBattery <= 20 && (
                                <span className="text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
                                   <Zap className="h-3 w-3" /> Recommended Fast-Charge
                                </span>
                              )}
                            </div>
                            <span className="text-[32px] font-bold text-emerald-400 tracking-tight leading-none">{targetBattery}<span className="text-xl text-emerald-500/50 font-medium ml-1">%</span></span>
                          </div>
                          
                          <div className="relative h-14 flex items-center group">
                            <div className="absolute inset-x-0 h-10 bg-[#161616] border border-emerald-950/50 rounded-xl overflow-hidden shadow-inner transition-colors group-hover:border-emerald-900/50">
                               <div className="absolute inset-y-0 bg-emerald-500/10 transition-all duration-75" style={{ left: \`\${currentBattery}%\`, width: \`\${targetBattery - currentBattery}%\` }}></div>
                               <div className="absolute h-full top-0 bg-emerald-500 rounded-r-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-75 border-r border-emerald-400" style={{ left: '0%', width: \`\${targetBattery}%\` }}></div>
                            </div>
                            
                            {/* Dotted indicator for current battery on the target track */}
                            <div className="absolute bottom-0 top-0 h-full w-px bg-[#161616] transform -translate-x-1/2 z-[5]" style={{ left: \`\${currentBattery}%\` }}></div>

                            <input
                              type="range"
                              min="5"
                              max="100"
                              step="1"
                              value={targetBattery}
                              onChange={(e) => {
                                  setTargetBattery(Math.max(currentBattery + 5, Number(e.target.value)));
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10 touch-none"
                            />
                            {/* Interaction Thumb */}
                            <div className="absolute h-[52px] w-[32px] bg-[#0A0A0A] border-[1.5px] border-emerald-400 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.4)] pointer-events-none flex items-center justify-center transform -translate-x-1/2 transition-transform z-20" style={{ left: \`\${targetBattery}%\` }}>
                               <div className="flex gap-0.5">
                                 <div className="w-0.5 h-4 bg-emerald-500/50 rounded-full"></div>
                                 <div className="w-0.5 h-4 bg-emerald-500/50 rounded-full"></div>
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex relative text-[10px] uppercase tracking-widest font-bold text-slate-600 w-full h-4 mt-2 px-1">
                             <span className="absolute transform -translate-x-1/2 transition-all duration-75" style={{ left: \`max(6%, \${currentBattery}%)\` }}>{currentBattery}% Current</span>
                             <span className="absolute right-1">100% Target</span>
                          </div>
                        </div>

                      </div>
                   </div>

                   {/* Energy Estimate & Next Step Combined Action Bar */}
                   {selectedVehicle && (
                     <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#0A0A0A] border border-white/5 rounded-[1.5rem] p-3 pl-5 pr-3 shadow-sm hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4 w-full sm:w-auto py-2">
                           <div className="h-10 w-10 bg-slate-900 border border-white/5 rounded-[10px] flex items-center justify-center shrink-0">
                               <Zap className="h-[18px] w-[18px] text-emerald-500" />
                           </div>
                           <div className="flex flex-col justify-center">
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Estimated Energy</span>
                              <div className="text-white font-bold flex items-baseline gap-1">
                                 <span className="text-[20px] tracking-tight leading-none">{energyKWh.toFixed(1)}</span>
                                 <span className="text-[12px] text-slate-500 font-semibold tracking-wide">kWh</span>
                              </div>
                           </div>
                        </div>
                        <Button 
                          onClick={nextStep} 
                          disabled={!isStep1Valid} 
                          className="w-full sm:w-auto h-[52px] px-8 bg-white hover:bg-slate-200 text-black font-semibold rounded-[12px] text-[15px] transition-colors flex items-center justify-center gap-3 shadow-none border-none disabled:bg-slate-900 disabled:text-slate-600 disabled:border-white/5 disabled:border"
                        >
                            <span>Set Location</span>
                            <ChevronRight className="h-[18px] w-[18px]" />
                        </Button>
                     </div>
                   )}
                </div>

              </motion.div>
            )}

            `;

const pre = content.substring(0, startIndex);
const post = content.substring(endIndex + 17); // skip '{step === 2 && (' 

fs.writeFileSync(file, pre + newBlock + '{step === 2 && (' + post);
