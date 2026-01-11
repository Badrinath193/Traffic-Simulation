import React, { useState } from 'react';
import { Timer, CheckCircle2, TrendingUp, Wifi, MapPin, Globe, Loader2, HardDrive, Terminal, GitBranch, Share2, Layers, Sliders, Zap, MousePointer2, Settings2, Trash2, ArrowRight } from 'lucide-react';
import { SimConfig } from '../App';

interface DashboardProps {
  config: SimConfig;
  setConfig: (config: SimConfig) => void;
}

const CITY_COORDS: Record<string, { lat: number, lon: number, bbox: string }> = {
  'Bangalore': { lat: 12.9716, lon: 77.5946, bbox: '77.5930,12.9700,77.5962,12.9732' },
  'New York': { lat: 40.7128, lon: -74.0060, bbox: '-74.0075,40.7115,-74.0045,40.7141' },
  'London': { lat: 51.5074, lon: -0.1278, bbox: '-0.1290,51.5060,-0.1260,51.5090' }
};

export const Dashboard: React.FC<DashboardProps> = ({ config, setConfig }) => {
  const [localCityName, setLocalCityName] = useState('');
  const [importing, setImporting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  
  const [learningRate, setLearningRate] = useState(0.0001);
  const [gamma, setGamma] = useState(0.99);

  const workflowSteps = [
    { title: "WebWizard Import", icon: Globe, desc: "Extract OSM topology via Browser Wizard." },
    { title: "Project Migration", icon: HardDrive, desc: "Relocate files and rebuild routes." },
    { title: "NetEdit Refinement", icon: Settings2, desc: "Join junctions and verify connections." },
    { title: "Simulation Validation", icon: Zap, desc: "Check for gridlocks and flow consistency." }
  ];

  const handleImport = () => {
    if (!localCityName) return;
    setImporting(true); setImportLogs([]);
    const steps = [
      `Initializing osmWebWizard process...`,
      `Parsing OSM Waypoints for ${localCityName}`,
      `Building directed graph structure...`,
      `Validating edge connectivity...`,
      `Scenario generated at tools/scenario_${Date.now()}`
    ];
    let i = 0;
    const interval = setInterval(() => {
      setImportLogs(prev => [...prev, steps[i]]);
      i++;
      if (i >= steps.length) {
        clearInterval(interval); setImporting(false);
        const coords = CITY_COORDS[localCityName] || { lat: 12.97, lon: 77.59, bbox: '77.59,12.97,77.60,12.98' };
        setConfig({ cityName: localCityName, coordinates: { lat: coords.lat, lon: coords.lon }, bbox: coords.bbox, isConfigured: true });
        setCurrentStep(1); // Move to Migration phase
      }
    }, 600);
  };

  return (
    <div className="p-8 ml-64 bg-slate-50 min-h-screen">
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Scenario Management</h2>
            <p className="text-slate-600 mt-2">OSM WebWizard Workflow & Network Refinement Orchestration.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-xs font-bold text-slate-700">{config.cityName}</span>
        </div>
      </div>

      {/* Workflow Progress Bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {workflowSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === idx;
          const isCompleted = currentStep > idx;
          return (
            <div key={idx} className={`p-4 rounded-3xl border transition-all duration-500 flex items-center gap-3 ${isActive ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 border-emerald-500 scale-105' : isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-200 text-slate-400'}`}>
              <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-500' : isCompleted ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Phase {idx + 1}</p>
                <p className="text-xs font-bold truncate">{step.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Globe size={18} className="text-emerald-500"/> Current Scenario: {localCityName || 'Undefined'}</h3>
                    {currentStep > 0 && (
                      <button onClick={() => setCurrentStep(prev => Math.min(prev + 1, 3))} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                        Next Phase <ArrowRight size={12} />
                      </button>
                    )}
                </div>
                <div className="p-6 flex gap-8">
                    <div className="flex-1 bg-slate-100 rounded-3xl h-80 overflow-hidden border border-slate-200 relative">
                        {config.isConfigured ? (
                             <div className="w-full h-full relative">
                                <iframe className="w-full h-full grayscale opacity-60" src={`https://www.openstreetmap.org/export/embed.html?bbox=${config.bbox}&layer=mapnik`}></iframe>
                                {currentStep === 2 && (
                                  <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-emerald-500 animate-pulse flex items-center gap-3">
                                      <MousePointer2 className="text-emerald-500" />
                                      <span className="text-xs font-bold text-emerald-600 uppercase">NetEdit Mode: Join Junctions Enabled</span>
                                    </div>
                                  </div>
                                )}
                             </div>
                        ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 italic text-center p-12">
                                <Layers size={40} className="mb-3 opacity-20" />
                                <p className="text-sm">Awaiting geographic initialization via WebWizard.</p>
                             </div>
                        )}
                    </div>
                    <div className="w-72 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Location</label>
                            <input 
                                type="text" 
                                value={localCityName} 
                                onChange={e => setLocalCityName(e.target.value)}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="e.g. Times Square"
                            />
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-4 h-32 font-mono text-[9px] text-emerald-500 overflow-y-auto border border-slate-700">
                            {importLogs.map((l, i) => <div key={i} className="mb-1 leading-tight">$ {l}</div>)}
                            {importLogs.length === 0 && <div className="text-slate-600 italic">Experience is training. Data is observing.</div>}
                        </div>
                        <button 
                            onClick={handleImport} 
                            disabled={importing || !localCityName}
                            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                        >
                            {importing ? <Loader2 className="animate-spin" size={14} /> : <><Zap size={14} /> Launch WebWizard</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl text-white">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-emerald-400"><Terminal size={18} /> Network Topology Analysis (Post-Refinement)</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Junction Complexity</p>
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs">Joined Nodes</span>
                            <span className="text-xs font-mono text-emerald-400">14 Refined</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Lane Consistency</p>
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs">Verified Count</span>
                            <span className="text-xs font-mono text-emerald-400">98.2% Accuracy</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Connection Integrity</p>
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs">Illegal Turns</span>
                            <span className="text-xs font-mono text-red-400">0 Corrected</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Gridlock Detection</p>
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5">
                            <span className="text-xs">Status</span>
                            <span className="text-xs font-mono text-emerald-400">STABLE_FLOW</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 border border-purple-100">
                    <Settings2 className="text-purple-500" size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">NetEdit Refinement</h4>
                <p className="text-slate-500 text-xs mt-2 mb-6 leading-relaxed">Manual structural cleanup is critical. OSM imports often create redundant nodes that cause unrealistic braking.</p>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      Join close nodes (F5)
                   </div>
                   <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      Adjust turning radii
                   </div>
                   <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      Verify U-turn restrictions
                   </div>
                </div>
            </div>
            
            <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform"></div>
                <Zap size={40} className="mb-4 opacity-50" />
                <h4 className="text-xl font-bold mb-2">Simulation Ready?</h4>
                <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                    Once Phase 3 is complete, verify your <code>.sumocfg</code> points to the refined <code>.net.xml</code>.
                </p>
                <button className="w-full bg-white text-emerald-600 py-3 rounded-2xl font-bold text-xs uppercase shadow-lg">Check Configuration</button>
            </div>
        </div>
      </div>
    </div>
  );
};