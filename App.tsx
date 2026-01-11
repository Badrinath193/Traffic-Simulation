import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Roadmap } from './components/Roadmap';
import { Metrics } from './components/Metrics';
import { Resources } from './components/Resources';
import { Dashboard } from './components/Dashboard';
import { SetupGuide } from './components/SetupGuide';
import { CodeRepository } from './components/CodeRepository';
import { Presentation } from './components/Presentation';

export interface SimConfig {
  cityName: string;
  coordinates: { lat: number; lon: number };
  bbox: string;
  isConfigured: boolean; // New flag to track if import happened
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Shared state for the Digital Twin
  // Initial state is blank/unconfigured as requested
  const [simConfig, setSimConfig] = useState<SimConfig>({
    cityName: '-------',
    coordinates: { lat: 0, lon: 0 },
    bbox: '',
    isConfigured: false
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard config={simConfig} setConfig={setSimConfig} />;
      case 'presentation':
        return <Presentation config={simConfig} />;
      case 'setup':
        return <SetupGuide />;
      case 'code':
        return <CodeRepository />;
      case 'roadmap':
        return <Roadmap />;
      case 'metrics':
        return <Metrics />;
      case 'resources':
        return <Resources />;
      default:
        return <Dashboard config={simConfig} setConfig={setSimConfig} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;