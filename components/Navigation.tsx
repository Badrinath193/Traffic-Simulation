import React, { useMemo } from 'react';
import { LayoutDashboard, ListTodo, Library, Activity, BookOpen, Code2, MonitorPlay } from 'lucide-react';
import { projectTasks } from '../data/tasks';
import { Status } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'presentation', label: 'Live Demo Mode', icon: MonitorPlay },
    { id: 'setup', label: 'Setup Guide', icon: BookOpen },
    { id: 'code', label: 'Source Code', icon: Code2 },
    { id: 'roadmap', label: 'Roadmap', icon: ListTodo },
    { id: 'metrics', label: 'Sim Metrics', icon: Activity },
    { id: 'resources', label: 'Resources', icon: Library },
  ];

  const progress = useMemo(() => {
    const completed = projectTasks.filter(t => t.status === Status.COMPLETED).length;
    const total = projectTasks.length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, []);

  return (
    <nav className="bg-slate-900 text-white w-64 min-h-screen flex-shrink-0 fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-wider text-emerald-400">TRAFFIC<span className="text-white">FLOW</span></h1>
        <p className="text-xs text-slate-400 mt-1">Capstone Manager</p>
      </div>
      <div className="mt-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="absolute bottom-8 left-0 w-full px-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Project Status</p>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-xs text-emerald-400 mt-1">{progress}% Complete</p>
        </div>
      </div>
    </nav>
  );
};