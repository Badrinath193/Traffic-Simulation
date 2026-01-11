import { Task, Status } from '../types';

export const projectTasks: Task[] = [
  // Phase 1
  { id: 'p1-1', title: 'Initialize WebWizard', description: 'Run osmWebWizard.py and extract target geography.', phase: 'Phase 1: Foundation', status: Status.COMPLETED, dueDate: 'Week 2' },
  { id: 'p1-2', title: 'Scenario Configuration', description: 'Set simulation modes (Car only) and build polygons.', phase: 'Phase 1: Foundation', status: Status.COMPLETED, dueDate: 'Week 2' },
  
  // Phase 2
  { id: 'p2-1', title: 'Project Migration', description: 'Relocate scenario folder to /Scenarios/RealWorld_Map/.', phase: 'Phase 2: Simulation Setup', status: Status.COMPLETED, dueDate: 'Week 4' },
  { id: 'p2-2', title: 'Route Re-building', description: 'Run randomTrips.py to localize pointers in .rou.xml.', phase: 'Phase 2: Simulation Setup', status: Status.COMPLETED, dueDate: 'Week 5' },

  // Phase 3
  { id: 'p3-1', title: 'Junction Cleanup (NetEdit)', description: 'Join redundant nodes and adjust junction custom shapes.', phase: 'Phase 3: Single Agent Baseline', status: Status.COMPLETED, dueDate: 'Week 8' },
  { id: 'p3-2', title: 'Logic Mappings', description: 'Verify lane connections and illegal turn restrictions.', phase: 'Phase 3: Single Agent Baseline', status: Status.COMPLETED, dueDate: 'Week 8' },

  // Phase 4: Execution
  { id: 'p4-1', title: 'Validation Run', description: 'Set delay to 50ms and check for topological gridlock.', phase: 'Phase 4: Multi-Agent System', status: Status.COMPLETED, dueDate: 'Week 10' },

  // Finalization
  { id: 'p5-1', title: 'Unity Asset Integration', description: 'Import refined .net.xml nodes as Unity terrain meshes.', phase: 'Phase 5: Visualization (Unity)', status: Status.COMPLETED, dueDate: 'Week 12' },
  { id: 'p6-1', title: 'Export Final Logs', description: 'Run test.py and compare throughput vs fixed-time baseline.', phase: 'Phase 6: Final Analysis', status: Status.COMPLETED, dueDate: 'Week 13' },
];