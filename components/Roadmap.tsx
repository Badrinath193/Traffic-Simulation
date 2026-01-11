import React from 'react';
import { Status } from '../types';
import { projectTasks } from '../data/tasks';
import { CheckCircle2, Circle, Clock, AlertCircle, GitMerge, Search, Network, ShieldCheck } from 'lucide-react';

const phases = [
  "Phase 1: Foundation",
  "Phase 2: Simulation Setup",
  "Phase 3: Single Agent Baseline",
  "Phase 4: Multi-Agent System",
  "Phase 5: Visualization (Unity)",
  "Phase 6: Final Analysis"
];

const getStatusIcon = (status: Status) => {
  switch (status) {
    case Status.COMPLETED: return <CheckCircle2 className="text-emerald-500" size={20} />;
    case Status.IN_PROGRESS: return <Clock className="text-blue-500" size={20} />;
    case Status.BLOCKED: return <AlertCircle className="text-red-500" size={20} />;
    default: return <Circle className="text-slate-400" size={20} />;
  }
};

const getStatusStyle = (status: Status) => {
  switch (status) {
    case Status.COMPLETED: return 'bg-emerald-50 border-emerald-200';
    case Status.IN_PROGRESS: return 'bg-blue-50 border-blue-200';
    case Status.BLOCKED: return 'bg-red-50 border-red-200';
    default: return 'bg-white border-slate-200';
  }
};

export const Roadmap: React.FC = () => {
  return (
    <div className="p-8 ml-64">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Development Roadmap</h2>
        <p className="text-slate-600 mt-2">Track progress from initial research to final deployment.</p>
      </div>

      {/* Strategic Execution Plan - SUMO & Unity Integration */}
      <div className="mb-10 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
             <GitMerge size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Strategic Plan: Map Adherence & Integration</h3>
            <p className="text-sm text-slate-600">Methodology to ensure strict entity alignment with OpenStreetMap data.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                 <Search className="text-indigo-500" size={18}/>
                 <h4 className="font-bold text-slate-700">1. Root Cause Analysis</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                 <li><strong>Coordinate Mismatch:</strong> Discrepancy between Unity's Cartesian space (meters) and OSM's Geodetic system (Lat/Lon).</li>
                 <li><strong>Drift:</strong> Floating-point errors accumulating over long simulation steps.</li>
                 <li><strong>Solution:</strong> Implement a "Snap-to-Graph" projection layer that forces agent positions onto the nearest valid OSM Edge vector.</li>
              </ul>
           </div>

           <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                 <GitMerge className="text-indigo-500" size={18}/>
                 <h4 className="font-bold text-slate-700">2. SUMO & Unity Integration Strategy</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                 <li><strong>SUMO (Backend):</strong> Acts as the "Physics & Logic Engine". It handles collision, lane-changing, and traffic rules.</li>
                 <li><strong>Unity (Frontend):</strong> Purely a "Visualizer". It should not calculate movement, only interpolate positions received from SUMO.</li>
                 <li><strong>Map Sync:</strong> Export the OSM map as <code>.fbx</code> for Unity terrain to ensure visual alignment 1:1 with SUMO's <code>.net.xml</code>.</li>
              </ul>
           </div>

           <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                 <Network className="text-indigo-500" size={18}/>
                 <h4 className="font-bold text-slate-700">3. Data Exchange Protocol</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                 <li><strong>Transport:</strong> TCP Socket (Low overhead vs HTTP).</li>
                 <li><strong>Payload:</strong> JSON containing <code>{'{ id, x, y, angle, type }'}</code>.</li>
                 <li><strong>Frequency:</strong> 10Hz (Sim) interpolated to 60fps (Unity).</li>
                 <li><strong>Coordinate Transform:</strong> Use TraCI's <code>traci.simulation.convertGeo()</code> to normalize coords before sending.</li>
              </ul>
           </div>

           <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                 <ShieldCheck className="text-indigo-500" size={18}/>
                 <h4 className="font-bold text-slate-700">4. Validation Framework</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                 <li><strong>Visual Debugging:</strong> Overlay SUMO's "Road Graph" (NavMesh) in Unity to check for visual drift.</li>
                 <li><strong>Metric Logging:</strong> Track "Off-Road Events" where agent coordinates deviate > 0.5m from lane center.</li>
                 <li><strong>Loop Testing:</strong> Run agents in a closed loop for 1000 cycles to check for position accumulation errors.</li>
              </ul>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {phases.map((phase) => (
          <div key={phase} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">{phase}</h3>
            </div>
            <div className="p-6 space-y-3">
              {projectTasks.filter(t => t.phase === phase).length === 0 ? (
                <p className="text-sm text-slate-400 italic">No tasks planned yet.</p>
              ) : (
                projectTasks.filter(t => t.phase === phase).map(task => (
                  <div key={task.id} className={`p-4 rounded-lg border ${getStatusStyle(task.status)} flex items-start justify-between transition-all hover:shadow-md`}>
                    <div className="flex gap-4">
                      <div className="mt-1">{getStatusIcon(task.status)}</div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{task.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                      {task.dueDate}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};