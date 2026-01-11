import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wifi, MapPin, Search, Lock, Unlock, Eye, EyeOff, Video, Camera, Zap, MousePointer2, Brain, Activity, AlertTriangle, ShieldAlert, Timer, TrendingUp, BarChart3, Settings2, SlidersHorizontal, MonitorDot, Cpu, Gauge, GitBranch, Layers, HandMetal, Radio } from 'lucide-react';
import { SimConfig } from '../App';

interface PresentationProps {
  config: SimConfig;
}

interface Car {
  id: number;
  pathId: string;
  targetPathId: string | null;
  laneChangeProgress: number;
  dist: number;
  currentSpeed: number;
  maxSpeed: number;
  color: string;
  x: number;
  y: number;
  angle: number;
  isCollided?: boolean;
  isSignaling?: 'left' | 'right' | null;
}

interface TrafficLightState {
  phase: 'NS_GREEN' | 'EW_GREEN' | 'NS_YELLOW' | 'EW_YELLOW' | 'ALL_RED';
  phaseTime: number;
}

export const Presentation: React.FC<PresentationProps> = ({ config }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isRefinementMode, setIsRefinementMode] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isMapLocked, setIsMapLocked] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(2.0); 
  const [aiActivity, setAiActivity] = useState<number[]>([]); 
  const [qValues, setQValues] = useState<number[]>([0.1, 0.4, 0.8, 0.2]);
  const [collisionDetected, setCollisionDetected] = useState<boolean>(false);
  
  const [minGreen, setMinGreen] = useState(10);
  const [maxGreen, setMaxGreen] = useState(45);
  const [showSettings, setShowSettings] = useState(false);

  const [tlState, setTlState] = useState<TrafficLightState>({ phase: 'NS_GREEN', phaseTime: 0 });
  const [queues, setQueues] = useState({ ns: 0, ew: 0 });
  
  const carIdCounter = useRef(0);
  const pathRefs = useRef<{ [key: string]: SVGPathElement | null }>({});
  const lastTickRef = useRef<number>(0);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'critical' = 'info') => {
    const prefix = type === 'critical' ? '[CRITICAL] ' : '';
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${prefix}${msg}`, ...prev].slice(0, 15));
  };

  const handleConnect = () => {
    setIsConnected(true);
    addLog("MADQN-Core Linked: Awaiting Experience Replay batch...", 'info');
    if(config.isConfigured) addLog(`Optimizing network for ${config.cityName} topology`, 'info');
  };

  const handleStart = () => {
    if (!config.isConfigured || !isMapLocked || collisionDetected) return;
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setCars([]); setCollisionDetected(false); setIsRunning(false);
    setTlState({ phase: 'NS_GREEN', phaseTime: 0 });
  };

  const forcePhase = (newPhase: TrafficLightState['phase']) => {
    setTlState({ phase: newPhase, phaseTime: 0 });
    addLog(`Manual Override: Signal forced to ${newPhase}`, 'warn');
  };

  const roadPaths = [
      { id: 'ns_1', group: 'ns', d: "M 51.5,0 L 51.5,100" }, 
      { id: 'ns_2', group: 'ns', d: "M 54.5,0 L 54.5,100" }, 
      { id: 'sn_1', group: 'sn', d: "M 48.5,100 L 48.5,0" }, 
      { id: 'sn_2', group: 'sn', d: "M 45.5,100 L 45.5,0" }, 
      { id: 'ew_1', group: 'ew', d: "M 0,48.5 L 100,48.5" }, 
      { id: 'ew_2', group: 'ew', d: "M 0,45.5 L 100,45.5" }, 
      { id: 'we_1', group: 'we', d: "M 100,51.5 L 0,51.5" }, 
      { id: 'we_2', group: 'we', d: "M 100,54.5 L 0,54.5" }, 
  ];

  useEffect(() => {
    let interval: any;
    if (isConnected && isRunning && isMapLocked && config.isConfigured && !collisionDetected) {
      interval = setInterval(() => {
        const now = Date.now();
        
        if (now - lastTickRef.current > 1000) {
            const nsCount = cars.filter(c => (c.pathId.startsWith('ns') || c.pathId.startsWith('sn')) && c.dist < 0.45).length;
            const ewCount = cars.filter(c => (c.pathId.startsWith('ew') || c.pathId.startsWith('we')) && c.dist < 0.45).length;
            setQueues({ ns: nsCount, ew: ewCount });

            const newQ = [0.2 + (nsCount * 0.05), 0.1 + (ewCount * 0.05), 0.05, 0.05];
            setQValues(newQ);

            if (!isManualMode) {
              setTlState(prev => {
                  let nextPhase = prev.phase;
                  let nextPhaseTime = prev.phaseTime + 1;
                  const pressureDiff = Math.abs(nsCount - ewCount);

                  if (prev.phase === 'NS_GREEN') {
                      if (nextPhaseTime >= minGreen && (ewCount > nsCount + 3 || nextPhaseTime >= maxGreen)) {
                          nextPhase = 'NS_YELLOW'; nextPhaseTime = 0;
                          addLog(`Switching to EW. Pressure Diff: ${pressureDiff}`, 'info');
                      }
                  } else if (prev.phase === 'NS_YELLOW') {
                      if (nextPhaseTime >= 3) { nextPhase = 'EW_GREEN'; nextPhaseTime = 0; }
                  } else if (prev.phase === 'EW_GREEN') {
                      if (nextPhaseTime >= minGreen && (nsCount > ewCount + 3 || nextPhaseTime >= maxGreen)) {
                          nextPhase = 'EW_YELLOW'; nextPhaseTime = 0;
                          addLog(`Switching to NS. Pressure Diff: ${pressureDiff}`, 'info');
                      }
                  } else if (prev.phase === 'EW_YELLOW') {
                      if (nextPhaseTime >= 3) { nextPhase = 'NS_GREEN'; nextPhaseTime = 0; }
                  }
                  return { ...prev, phase: nextPhase, phaseTime: nextPhaseTime };
              });
            } else {
              setTlState(prev => ({ ...prev, phaseTime: prev.phaseTime + 1 }));
            }
            lastTickRef.current = now;
        }

        setAiActivity(Array.from({length: 8}, () => Math.random()));

        if (Math.random() > 0.94 && cars.length < 35) {
            const pathIdx = Math.floor(Math.random() * roadPaths.length);
            const sel = roadPaths[pathIdx];
            if (!cars.some(c => c.pathId === sel.id && c.dist < 0.1)) {
                setCars(prev => [...prev, {
                    id: carIdCounter.current++, pathId: sel.id, targetPathId: null, laneChangeProgress: 0,
                    dist: 0, currentSpeed: 0, maxSpeed: 0.004 + Math.random()*0.003, color: 'bg-emerald-500',
                    x: 0, y: 0, angle: 0, isSignaling: null
                }]);
            }
        }

        setCars(prev => prev.map(car => {
            const pathEl = pathRefs.current[car.pathId];
            if (!pathEl) return car;
            const pathLen = pathEl.getTotalLength();
            let ts = car.maxSpeed;
            if (car.dist > 0.40 && car.dist < 0.48) {
                if ((car.pathId.startsWith('ns') || car.pathId.startsWith('sn')) && (tlState.phase.includes('EW') || tlState.phase === 'NS_YELLOW' || tlState.phase === 'ALL_RED')) ts = 0;
                if ((car.pathId.startsWith('ew') || car.pathId.startsWith('we')) && (tlState.phase.includes('NS') || tlState.phase === 'EW_YELLOW' || tlState.phase === 'ALL_RED')) ts = 0;
            }
            const ahead = prev.find(c => c.pathId === car.pathId && c.dist > car.dist && c.dist - car.dist < 0.08);
            if (ahead) ts = Math.min(ts, ahead.currentSpeed * 0.8);
            let ns = car.currentSpeed;
            if (ns < ts) ns = Math.min(ns + 0.0002, ts); else if (ns > ts) ns = Math.max(ns - 0.0005, ts);
            const d = car.dist + ns;
            const p = pathEl.getPointAtLength(d * pathLen);
            const np = pathEl.getPointAtLength((d + 0.01) * pathLen);
            return { ...car, dist: d, currentSpeed: ns, x: p.x, y: p.y, angle: Math.atan2(np.y - p.y, np.x - p.x) * 180 / Math.PI };
        }).filter(c => c.dist < 1));

      }, 30);
    }
    return () => clearInterval(interval);
  }, [isConnected, isRunning, isMapLocked, cars, config.isConfigured, collisionDetected, tlState, minGreen, maxGreen, isManualMode]);

  const getTLColor = (side: 'NS' | 'EW') => {
      const p = tlState.phase;
      if (side === 'NS') return p === 'NS_GREEN' ? 'bg-emerald-500' : p === 'NS_YELLOW' ? 'bg-amber-500' : 'bg-red-500';
      return p === 'EW_GREEN' ? 'bg-emerald-500' : p === 'EW_YELLOW' ? 'bg-amber-500' : 'bg-red-500';
  };

  return (
    <div className="p-8 ml-64 h-screen flex flex-col bg-slate-900 overflow-hidden text-white font-sans">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-2 rounded-2xl shadow-lg shadow-emerald-900/40">
            <Cpu className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase">Decision Core v4.0</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Real-Time OSM Scenario Validation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsManualMode(!isManualMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${isManualMode ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
            >
              <HandMetal size={14} /> {isManualMode ? 'MANUAL OVERRIDE' : 'AI AUTONOMOUS'}
            </button>
            <button 
              onClick={() => setIsRefinementMode(!isRefinementMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${isRefinementMode ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
            >
              <GitBranch size={14} /> {isRefinementMode ? 'NETEDIT: ON' : 'NETEDIT: OFF'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-mono">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`}></div>
                {isConnected ? 'STREAMING' : 'OFFLINE'}
            </div>
            {!isConnected && (
                <button onClick={handleConnect} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xl">SYNC BRIDGE</button>
            )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-6 h-full relative">
            <div className="flex-1 bg-black rounded-[2.5rem] relative overflow-hidden border border-slate-800 shadow-2xl">
                {config.isConfigured ? (
                    <div className="w-full h-full transform-style-3d perspective-1000">
                        <div className="absolute inset-0 transition-transform duration-300 origin-center" style={{ transform: `rotateX(60deg) scale(${zoomLevel})` }}>
                            <div className="absolute inset-[-100%] w-[300%] h-[300%] grayscale invert brightness-50 opacity-20">
                                <iframe width="100%" height="100%" src={`https://www.openstreetmap.org/export/embed.html?bbox=${config.bbox}&layer=mapnik`} className="pointer-events-none"></iframe>
                            </div>
                            
                            <svg className="absolute inset-0 w-full h-full">
                               {roadPaths.map(p => (
                                 <path 
                                   key={p.id} 
                                   id={p.id} 
                                   d={p.d} 
                                   className={`${isRefinementMode ? 'stroke-purple-500/50 stroke-[0.5]' : 'opacity-0'} fill-none transition-all duration-500`}
                                   ref={el => { pathRefs.current[p.id] = el; }}
                                 />
                               ))}
                               {isRefinementMode && (
                                 <g>
                                    <circle cx="50" cy="50" r="1.5" className="fill-purple-500 animate-pulse" />
                                    <text x="52" y="48" className="fill-purple-400 text-[1.5px] font-mono">Node#124 (Joined)</text>
                                    <line x1="51.5" y1="40" x2="48.5" y2="40" className="stroke-white/20 stroke-[0.2] stroke-dasharray-[1,1]" />
                                 </g>
                               )}
                            </svg>
                            
                            <div className="absolute inset-0">
                                <div className={`absolute left-[52%] top-[40%] w-1.5 h-6 ${getTLColor('NS')} rounded-full shadow-[0_0_15px_currentColor]`} style={{transform: 'translateZ(10px)'}}></div>
                                <div className={`absolute left-[40%] top-[52%] w-6 h-1.5 ${getTLColor('EW')} rounded-full shadow-[0_0_15px_currentColor]`} style={{transform: 'translateZ(10px)'}}></div>
                                
                                {cars.map(c => (
                                    <div key={c.id} className={`absolute w-[2%] h-[2%] ${c.color} rounded-sm shadow-lg border border-white/20`} style={{ left: `${c.x}%`, top: `${c.y}%`, transform: `translate(-50%, -50%) rotate(${c.angle+90}deg) translateZ(2px)` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-mono text-xs animate-pulse uppercase tracking-[0.2em]">Awaiting OSM WebWizard Stream...</div>
                )}
                
                {isRefinementMode && (
                  <div className="absolute bottom-8 left-8 right-8 p-4 bg-purple-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/30 flex justify-between items-center animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-600 p-2 rounded-xl shadow-lg"><Layers size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">Topology Refinement Active</p>
                        <p className="text-xs text-white font-medium">Junction shape smoothing & lane connectivity verification.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold border border-white/10">F5: JOIN NODES</button>
                       <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold shadow-lg">SAVE NETWORK</button>
                    </div>
                  </div>
                )}

                {isManualMode && (
                  <div className="absolute bottom-8 left-8 right-8 p-4 bg-amber-900/60 backdrop-blur-xl rounded-3xl border border-amber-500/30 flex flex-col gap-4 animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-600 p-2 rounded-xl shadow-lg"><Radio size={20} /></div>
                        <div>
                          <p className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">Manual Signal Control Unit</p>
                          <p className="text-xs text-white font-medium">Forced phase activation bypasses MARL policy convergence.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[8px] text-amber-300 uppercase font-bold">Hold Duration</p>
                          <p className="text-sm font-mono text-white">{tlState.phaseTime}s</p>
                        </div>
                        <button onClick={() => setIsManualMode(false)} className="text-xs text-amber-200 hover:text-white underline">Release to AI</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 px-2 pb-2">
                       <button onClick={() => forcePhase('NS_GREEN')} className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${tlState.phase === 'NS_GREEN' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700'}`}>NS GREEN</button>
                       <button onClick={() => forcePhase('NS_YELLOW')} className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${tlState.phase === 'NS_YELLOW' ? 'bg-amber-500 border-amber-300 text-white shadow-lg' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700'}`}>NS YELLOW</button>
                       <button onClick={() => forcePhase('ALL_RED')} className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${tlState.phase === 'ALL_RED' ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700'}`}>ALL STOP</button>
                       <button onClick={() => forcePhase('EW_GREEN')} className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${tlState.phase === 'EW_GREEN' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700'}`}>EW GREEN</button>
                       <button onClick={() => forcePhase('EW_YELLOW')} className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${tlState.phase === 'EW_YELLOW' ? 'bg-amber-500 border-amber-300 text-white shadow-lg' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700'}`}>EW YELLOW</button>
                    </div>
                  </div>
                )}
            </div>

            <div className="bg-slate-900/50 p-4 rounded-[2rem] border border-slate-800 flex justify-between items-center h-24">
                <div className="flex gap-4">
                    <button onClick={handleStart} className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase transition-all shadow-xl flex items-center gap-2 ${isRunning ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                        {isRunning ? <Pause size={14} /> : <Play size={14} />} {isRunning ? 'Pause' : 'Optimize'}
                    </button>
                    <button onClick={handleReset} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-colors"><RotateCcw size={16} /></button>
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                       onClick={() => setShowSettings(!showSettings)}
                       className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-white text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                       <Settings2 size={16} />
                    </button>
                    <div className="flex gap-8 px-6 border-l border-slate-800">
                        <div className="text-center">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Reward</p>
                            <p className="text-xl font-mono text-emerald-400 font-bold tracking-tighter">{(Math.random() * -10 - 20).toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Delay (ms)</p>
                            <p className="text-xl font-mono text-blue-400 font-bold tracking-tighter">50</p>
                        </div>
                    </div>
                </div>
            </div>

            {showSettings && (
              <div className="absolute bottom-32 right-0 w-80 p-6 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-3">
                  <SlidersHorizontal size={14} className="text-emerald-400" /> Signal Config
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mb-2">
                      <span>Min Green Time</span>
                      <span className="text-emerald-400">{minGreen}s</span>
                    </div>
                    <input type="range" min="5" max="20" value={minGreen} onChange={(e) => setMinGreen(parseInt(e.target.value))} className="w-full accent-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mb-2">
                      <span>Max Green Time</span>
                      <span className="text-emerald-400">{maxGreen}s</span>
                    </div>
                    <input type="range" min="30" max="90" value={maxGreen} onChange={(e) => setMaxGreen(parseInt(e.target.value))} className="w-full accent-emerald-500" />
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl h-64">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Gauge size={14} className="text-blue-400" /> Action Q-Values</h4>
                <div className="flex justify-around items-end h-32 gap-3 px-2">
                    {qValues.map((v, i) => (
                        <div key={i} className="flex-1 group relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-blue-400">{v.toFixed(2)}</div>
                            <div className="bg-blue-500/20 rounded-t-lg border-t border-blue-500/40 transition-all duration-500 hover:bg-blue-500/40" style={{ height: `${v * 100}%` }}></div>
                            <div className="text-[8px] text-center mt-2 text-slate-500 font-mono uppercase">Phase_{i}</div>
                        </div>
                    ))}
                </div>
                <p className="text-[9px] text-slate-500 mt-4 text-center">Highest Q-Value triggers phase switch.</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex-1 flex flex-col">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><MonitorDot size={14} className="text-amber-400" /> Simulation Health</h4>
                <div className="flex-1 font-mono text-[9px] text-slate-400 space-y-2 overflow-y-auto scrollbar-hide">
                    {logs.map((l, i) => <div key={i} className={`border-b border-slate-800 pb-1 last:border-0 ${l.includes('Override') ? 'text-amber-400' : ''}`}>{l}</div>)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};