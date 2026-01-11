import React from 'react';
import { Terminal, Download, Settings, Play, AlertCircle, Copy, Check, FileCode, Globe, Map, Edit3, Save } from 'lucide-react';

export const SetupGuide: React.FC = () => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code }: { code: string }) => (
    <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-sm text-emerald-400 my-3 group">
      <button 
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
        title="Copy command"
      >
        {copied === code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </button>
      <div className="overflow-x-auto whitespace-pre">{code}</div>
    </div>
  );

  return (
    <div className="p-8 ml-64 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Advanced Workflow Guide</h2>
        <p className="text-slate-600 mt-2">Real-world map importation using OSM WebWizard and manual refinement in NetEdit.</p>
      </div>

      <div className="max-w-4xl space-y-12">
        
        {/* Phase 1: Environment Setup */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 p-3 rounded-2xl"><Globe className="text-emerald-600" size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Phase 1: Scenario Generation (OSM WebWizard)</h3>
              <p className="text-sm text-slate-500">Extracting real-world topology for simulation.</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Open your terminal in the SUMO tools directory and launch the wizard:</p>
            <CodeBlock code="cd %SUMO_HOME%\tools&#10;python osmWebWizard.py" />
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
              <ul className="list-disc list-inside space-y-2">
                <li>Locate your study area in the browser.</li>
                <li>Enable <strong>"Car Only"</strong> and <strong>"Add Polygons"</strong> for building footprints.</li>
                <li>Click <strong>Generate Scenario</strong> to build the initial configuration files.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Phase 2: Project Migration */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-2xl"><Save className="text-blue-600" size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Phase 2: Project Migration & localized Routes</h3>
              <p className="text-sm text-slate-500">Securing your scenario files in a dedicated project directory.</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Identify the timestamped folder in <code>SUMO_HOME/tools</code> and move it to your repository:</p>
            <CodeBlock code="move C:\SUMO\tools\2023-10-12-14-30-00 C:\YourProject\Scenarios\RealWorld_Map" />
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <p className="text-xs text-amber-800 font-bold mb-1">PRO-TIP: REBUILDING ROUTES</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                To avoid path errors, run <code>build.bat</code> or re-execute <code>randomTrips.py</code> within the new directory to localize all <code>.rou.xml</code> pointers.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 3: Network Refinement */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-50 p-3 rounded-2xl"><Edit3 className="text-purple-600" size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Phase 3: Structural Refinement (NetEdit)</h3>
              <p className="text-sm text-slate-500">Correcting topology to match ground truth imagery.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Junction Cleanup</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identify redundant nodes placed too close. Select both nodes → Right-click → <strong>Join Junctions (F5)</strong>. Adjust "Custom Shape" to prevent texture overlapping.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Lane & Logic</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify lane counts. Use <strong>Duplicate Lane</strong> if OSM missed a lane. Verify <strong>Connection Mode</strong> to ensure legal left/U-turns.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 4: Execution */}
        <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-800 p-3 rounded-2xl"><Play className="text-emerald-400" size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-white">Phase 4: Simulation Execution</h3>
              <p className="text-sm text-slate-400">Final validation and gridlock checking.</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Run the simulation with localized settings:</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <p className="text-[10px] text-slate-500 font-bold mb-1">DELAY</p>
                <p className="text-sm font-mono text-emerald-400">50ms</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <p className="text-[10px] text-slate-500 font-bold mb-1">VIEW</p>
                <p className="text-sm font-mono text-emerald-400">Real World</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <p className="text-[10px] text-slate-500 font-bold mb-1">MODE</p>
                <p className="text-sm font-mono text-emerald-400">GUI-Mode</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};